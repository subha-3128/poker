const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const PokerGame = require('./lib/pokerGame');
const { getLocalIpAddress, generateQrDataUrl } = require('./lib/networkUtils');

const app = express();

// Trust proxy for reverse proxies (Render, Railway, Cloudflare, etc.)
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const localIp = getLocalIpAddress();
const networkUrl = localIp ? `http://${localIp}:${PORT}` : `http://localhost:${PORT}`;
const localUrl = `http://localhost:${PORT}`;

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Health check endpoint for Railway, Render, and cloud monitors
app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

// In-memory game storage
// Map<roomId, PokerGame>
const games = new Map();

// Helper to generate unique 4-digit room code
function generateRoomCode() {
  let code;
  let attempts = 0;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    attempts++;
  } while (games.has(code) && attempts < 1000);
  return code;
}

// API endpoint for network and QR info
app.get('/api/network-info', async (req, res) => {
  const room = req.query.room || '';
  // Determine the public URL dynamically based on reverse proxy headers or request host
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
  const host = req.get('host') || `localhost:${PORT}`;
  const reqOrigin = `${protocol}://${host}`;

  // If accessed through a cloud domain or reverse proxy, use the request origin;
  // if accessed locally via localhost, prioritize the LAN Wi-Fi URL so friends on Wi-Fi can scan.
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const baseUrl = process.env.PUBLIC_URL || (!isLocalhost ? reqOrigin : (localIp ? `http://${localIp}:${PORT}` : reqOrigin));
  const targetUrl = room ? `${baseUrl}?room=${room}` : baseUrl;
  const qrDataUrl = await generateQrDataUrl(targetUrl);
  res.json({
    ip: localIp,
    port: PORT,
    localUrl: reqOrigin,
    networkUrl: baseUrl,
    targetUrl,
    qrDataUrl
  });
});

// Broadcast personalized room state to every connected client in the room
function broadcastRoomState(game) {
  for (const player of game.players) {
    if (player.connected && player.socketId) {
      const publicState = game.getPublicState(player.id);
      io.to(player.socketId).emit('game-state', publicState);
    }
  }
}

// Verify host authorization using private hostToken
function verifyHostAuth(game, hostToken, socketPlayerId) {
  if (!game) return false;
  if (game.hostToken) {
    return game.hostToken === hostToken;
  }
  return game.hostId === socketPlayerId;
}

// Clean up abandoned games (inactive for > 2 hours or empty for > 1 hour)
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
const EMPTY_ROOM_TTL_MS = 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [roomId, game] of games.entries()) {
    const allDisconnected = game.players.length > 0 && game.players.every(p => !p.connected);
    const noPlayers = game.players.length === 0;
    const inactiveDuration = now - (game.lastActivityAt || now);

    if ((allDisconnected || noPlayers) && inactiveDuration > EMPTY_ROOM_TTL_MS) {
      console.log(`[Cleanup] Removing abandoned room: ${roomId}`);
      game.destroy();
      games.delete(roomId);
    } else if (inactiveDuration > ROOM_TTL_MS) {
      console.log(`[Cleanup] Removing expired room after 2h inactivity: ${roomId}`);
      game.destroy();
      games.delete(roomId);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Socket.IO real-time event handlers
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentPlayerId = null;

  // 1. Create Game
  socket.on('create-game', async ({ playerName, config }, callback) => {
    try {
      const roomId = generateRoomCode();
      const playerId = 'p_' + Math.random().toString(36).substr(2, 9);
      const hostToken = crypto.randomBytes(16).toString('hex');

      const game = new PokerGame(roomId, playerId, config, hostToken);
      game.addPlayer(playerId, playerName || 'Host', socket.id);

      game.onStateChange = () => {
        broadcastRoomState(game);
      };

      games.set(roomId, game);
      currentRoomId = roomId;
      currentPlayerId = playerId;

      socket.join(roomId);

      const qrUrl = `${networkUrl}?room=${roomId}`;
      const qrDataUrl = await generateQrDataUrl(qrUrl);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId,
          playerId,
          hostToken,
          networkUrl,
          qrUrl,
          qrDataUrl,
          state: game.getPublicState(playerId)
        });
      }

      broadcastRoomState(game);
    } catch (err) {
      console.error('Error creating game:', err);
      if (typeof callback === 'function') {
        callback({ success: false, message: err.message });
      }
    }
  });

  // 2. Join Game
  socket.on('join-game', ({ roomId, playerName, playerId: requestedPlayerId }, callback) => {
    try {
      const cleanRoomId = (roomId || '').toString().trim();
      const game = games.get(cleanRoomId);

      if (!game) {
        if (typeof callback === 'function') {
          return callback({ success: false, message: `Room ${cleanRoomId} not found.` });
        }
        return;
      }

      // Check if player is rejoining or new
      const playerId = requestedPlayerId || ('p_' + Math.random().toString(36).substr(2, 9));
      const player = game.addPlayer(playerId, playerName, socket.id);

      currentRoomId = cleanRoomId;
      currentPlayerId = playerId;

      socket.join(cleanRoomId);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId: cleanRoomId,
          playerId,
          state: game.getPublicState(playerId)
        });
      }

      broadcastRoomState(game);
    } catch (err) {
      console.error('Error joining game:', err);
      if (typeof callback === 'function') {
        callback({ success: false, message: err.message });
      }
    }
  });

  // 3. Reconnect Existing Player
  socket.on('reconnect-player', ({ roomId, playerId, playerName, hostToken }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) {
        if (typeof callback === 'function') {
          return callback({ success: false, message: 'Game session expired.' });
        }
        return;
      }

      let player = game.players.find(p => p.id === playerId);
      if (player) {
        player.socketId = socket.id;
        player.connected = true;
        if (playerName) player.name = playerName;
        game.log(`${player.name} reconnected.`, 'system');
      } else {
        player = game.addPlayer(playerId, playerName, socket.id);
      }

      // If valid hostToken provided, restore hostId for this reconnected player
      if (hostToken && game.hostToken === hostToken) {
        game.hostId = player.id;
      }

      currentRoomId = roomId;
      currentPlayerId = playerId;
      socket.join(roomId);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId,
          playerId,
          state: game.getPublicState(playerId)
        });
      }

      broadcastRoomState(game);
    } catch (err) {
      if (typeof callback === 'function') {
        callback({ success: false, message: err.message });
      }
    }
  });

  // 4. Update Game Config (Host only)
  socket.on('update-config', ({ roomId, hostToken, config }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) throw new Error('Game not found.');
      if (!verifyHostAuth(game, hostToken, currentPlayerId)) throw new Error('Only the host can update settings.');

      game.updateConfig(config);
      broadcastRoomState(game);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 5. Start Game (Host only)
  socket.on('start-game', ({ roomId, hostToken }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) throw new Error('Game not found.');
      if (!verifyHostAuth(game, hostToken, currentPlayerId)) throw new Error('Only the host can start the game.');

      game.startGame();
      broadcastRoomState(game);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 6. Player Action (Check, Call, Raise, Fold, All-In)
  socket.on('player-action', ({ roomId, action, amount }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) throw new Error('Game not found.');

      game.handleAction(currentPlayerId, action, amount);
      broadcastRoomState(game);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 7. Start Next Hand (Host or Auto)
  socket.on('start-next-hand', ({ roomId, hostToken }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) throw new Error('Game not found.');
      if (!verifyHostAuth(game, hostToken, currentPlayerId) && game.street !== 'hand_ended') {
        throw new Error('Only host can deal next hand.');
      }

      game.startHand();
      broadcastRoomState(game);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 8. Award Showdown Pots (Host only)
  socket.on('award-pots', ({ roomId, hostToken, allocations }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) throw new Error('Game not found.');
      if (!verifyHostAuth(game, hostToken, currentPlayerId)) throw new Error('Only the host can award pots.');

      game.awardPots(allocations);
      broadcastRoomState(game);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 9. Rebuy Chips (Host only)
  socket.on('rebuy', ({ roomId, hostToken, targetPlayerId, amount }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) throw new Error('Game not found.');
      if (!verifyHostAuth(game, hostToken, currentPlayerId)) throw new Error('Only the host can add chips.');

      const success = game.rebuy(targetPlayerId, amount);
      broadcastRoomState(game);
      if (typeof callback === 'function') callback({ success });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 10. Kick Player (Host only)
  socket.on('kick-player', ({ roomId, hostToken, targetPlayerId }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) throw new Error('Game not found.');
      if (!verifyHostAuth(game, hostToken, currentPlayerId)) throw new Error('Only the host can kick players.');

      const target = game.players.find(p => p.id === targetPlayerId);
      if (target && target.socketId) {
        io.to(target.socketId).emit('kicked', { message: 'You were kicked by the host.' });
      }

      game.kickPlayer(targetPlayerId);
      broadcastRoomState(game);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 10b. Leave Table (Any player)
  socket.on('leave-table', ({ roomId }, callback) => {
    try {
      const targetRoomId = roomId || currentRoomId;
      const game = games.get(targetRoomId);
      if (!game) throw new Error('Game not found.');
      if (!currentPlayerId) throw new Error('Player not identified.');

      const leavingPlayerId = currentPlayerId;
      const wasHost = game.hostId === leavingPlayerId;

      game.leaveGame(leavingPlayerId);

      // If the leaving player was host and there are still players, assign new hostToken to new host
      if (wasHost && game.players.length > 0) {
        const newHost = game.players.find(p => p.id === game.hostId);
        if (newHost) {
          const newHostToken = crypto.randomBytes(16).toString('hex');
          game.hostToken = newHostToken;
          if (newHost.socketId) {
            io.to(newHost.socketId).emit('host-assigned', { hostToken: newHostToken });
          }
        }
      }

      socket.leave(targetRoomId);
      currentRoomId = null;
      currentPlayerId = null;

      if (game.players.length === 0) {
        games.delete(targetRoomId);
      } else {
        broadcastRoomState(game);
      }

      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 11. End Game Summary (Host only)
  socket.on('end-game', ({ roomId, hostToken }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) throw new Error('Game not found.');
      if (!verifyHostAuth(game, hostToken, currentPlayerId)) throw new Error('Only the host can end the game.');

      const leaderboard = game.endGame();
      broadcastRoomState(game);
      io.to(roomId).emit('game-ended-summary', { leaderboard });
      if (typeof callback === 'function') callback({ success: true, leaderboard });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 12. Resume Game after Summary (Host only)
  socket.on('resume-game', ({ roomId, hostToken }, callback) => {
    try {
      const game = games.get(roomId);
      if (!game) throw new Error('Game not found.');
      if (!verifyHostAuth(game, hostToken, currentPlayerId)) throw new Error('Only the host can resume the game.');

      game.stage = 'playing';
      game.street = 'hand_ended';
      game.startHand();
      broadcastRoomState(game);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, message: err.message });
    }
  });

  // 13. Table Banter / Chat
  socket.on('send-chat', ({ roomId, message }) => {
    const game = games.get(roomId);
    if (!game || !message) return;
    const player = game.players.find(p => p.id === currentPlayerId);
    const author = player ? player.name : 'Spectator';
    game.log(`${author}: ${message.trim().slice(0, 100)}`, 'chat');
    broadcastRoomState(game);
  });

  // 14. Disconnect
  socket.on('disconnect', () => {
    if (currentRoomId && currentPlayerId) {
      const game = games.get(currentRoomId);
      if (game) {
        game.removePlayer(currentPlayerId);
        broadcastRoomState(game);
      }
    }
  });
});

// Start Server on PORT and HOST (Supports cloud environments: Render, Railway, etc.)
server.listen(PORT, HOST, () => {
  console.log('\n========================================================');
  console.log('   ♠ ♥ ♦ ♣  POKER NIGHT - PRODUCTION SERVER  ♣ ♦ ♥ ♠   ');
  console.log('========================================================');
  console.log(`🚀 Host / Binding:     ${HOST}:${PORT}`);
  console.log(`📡 Local Access:       ${localUrl}`);
  if (localIp) {
    console.log(`📶 WiFi Network URL:   ${networkUrl}`);
  }
  console.log(`💚 Health Check:       http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/health`);
  console.log('--------------------------------------------------------');

  const displayUrl = process.env.PUBLIC_URL || (localIp ? networkUrl : localUrl);
  QRCode.toString(displayUrl, { type: 'terminal', small: true }, (err, qr) => {
    if (!err && qr) {
      console.log('Scan QR Code to join table:\n');
      console.log(qr);
    }
    console.log('========================================================\n');
  });
});
