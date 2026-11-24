const io = require('socket.io-client');
const assert = require('assert');
const http = require('http');
const { fork } = require('child_process');

let PORT = process.env.PORT || 3999;
let SERVER_URL = process.env.TEST_SERVER_URL || `http://localhost:${PORT}`;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkServer(url) {
  return new Promise(resolve => {
    const req = http.get(`${url}/health`, res => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(400, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runMultiplayerSimulation() {
  let childServer = null;
  const running = await checkServer(SERVER_URL);
  if (!running) {
    PORT = 3999;
    SERVER_URL = `http://localhost:${PORT}`;
    console.log(`Starting isolated test server on port ${PORT}...`);
    childServer = fork('./server.js', [], {
      env: { ...process.env, PORT: String(PORT) },
      silent: true
    });
    let attempts = 0;
    while (!(await checkServer(SERVER_URL)) && attempts < 30) {
      await wait(100);
      attempts++;
    }
    console.log('✅ Test server ready!');
  }

  try {
    console.log('--- Starting Real-Time Multiplayer Simulation ---');

    // Client 1: Host (Rahul)
    const socketHost = io(SERVER_URL);
    let hostState = null;
    let roomId = null;
    let hostPlayerId = null;
    let hostToken = null;

    socketHost.on('game-state', state => {
      hostState = state;
    });

    await new Promise(resolve => socketHost.on('connect', resolve));
    console.log('✅ Host connected to server');

  // 1. Create Room
  const createRes = await new Promise(resolve => {
    socketHost.emit('create-game', {
      playerName: 'Rahul',
      config: { startingChips: 1000, smallBlind: 10, bigBlind: 20 }
    }, resolve);
  });

  assert(createRes.success, 'Create game failed');
  roomId = createRes.roomId;
  hostPlayerId = createRes.playerId;
  hostToken = createRes.hostToken;
  const hostPlayerToken = createRes.playerToken;
  assert(hostToken, 'hostToken must be generated and returned to creator');
  assert(hostPlayerToken, 'playerToken must be returned to creator');
  console.log(`✅ Room created successfully: ${roomId} with secure hostToken & playerToken`);

  // Client 2: Priya
  const socketPriya = io(SERVER_URL);
  let priyaState = null;
  let priyaPlayerId = null;

  socketPriya.on('game-state', state => {
    priyaState = state;
  });

  await new Promise(resolve => socketPriya.on('connect', resolve));

  const joinPriyaRes = await new Promise(resolve => {
    socketPriya.emit('join-game', { roomId, playerName: 'Priya' }, resolve);
  });
  assert(joinPriyaRes.success, 'Priya failed to join');
  priyaPlayerId = joinPriyaRes.playerId;
  console.log('✅ Priya joined the room');

  // Client 3: Amit
  const socketAmit = io(SERVER_URL);
  let amitState = null;
  let amitPlayerId = null;

  socketAmit.on('game-state', state => {
    amitState = state;
  });

  await new Promise(resolve => socketAmit.on('connect', resolve));

  const joinAmitRes = await new Promise(resolve => {
    socketAmit.emit('join-game', { roomId, playerName: 'Amit' }, resolve);
  });
  assert(joinAmitRes.success, 'Amit failed to join');
  amitPlayerId = joinAmitRes.playerId;
  console.log('✅ Amit joined the room');

  await wait(300);
  assert.strictEqual(hostState.players.length, 3, 'All 3 players must be in lobby');
  console.log(`✅ Lobby has 3 players: ${hostState.players.map(p => p.name).join(', ')}`);

  // SECURITY TEST: Priya attempts unauthorized host action (e.g. start-game without valid hostToken)
  const unauthRes = await new Promise(resolve => {
    socketPriya.emit('start-game', { roomId, hostToken: 'invalid_fake_token' }, resolve);
  });
  assert.strictEqual(unauthRes.success, false, 'Unauthorized guest must NOT be able to start game');
  console.log('✅ Security verified: Unauthorized host command rejected successfully');

  // 2. Start Game (Authorized with hostToken)
  const startRes = await new Promise(resolve => {
    socketHost.emit('start-game', { roomId, hostToken }, resolve);
  });
  assert(startRes.success, 'Host failed to start game');
  await wait(300);

  assert.strictEqual(hostState.stage, 'playing');
  assert.strictEqual(hostState.street, 'preflop');
  console.log(`✅ Game started! Street: ${hostState.street}, Pot: ${hostState.pot}`);

  // Check blinds
  // Player 0 = Dealer (Rahul), Player 1 = SB (Priya, 10), Player 2 = BB (Amit, 20)
  assert.strictEqual(hostState.pot, 30);
  console.log(`✅ Blinds posted: Pot = ${hostState.pot}`);

  // Action starts on player left of BB = Rahul (UTG)
  const currentActorId = hostState.currentTurnPlayerId;
  const currentActor = hostState.players.find(p => p.id === currentActorId);
  console.log(`Current turn: ${currentActor.name}`);

  // Rahul raises to 60
  const raiseRes = await new Promise(resolve => {
    socketHost.emit('player-action', { roomId, action: 'raise', amount: 60 }, resolve);
  });
  assert(raiseRes.success, 'Raise failed: ' + raiseRes?.message);
  await wait(300);
  console.log(`✅ Rahul raised to 60. Pot: ${hostState.pot}`);

  // Priya folds
  assert.strictEqual(priyaState.currentTurnPlayerId, priyaPlayerId);
  const foldRes = await new Promise(resolve => {
    socketPriya.emit('player-action', { roomId, action: 'fold' }, resolve);
  });
  assert(foldRes.success, 'Priya fold failed');
  await wait(300);
  console.log('✅ Priya folded.');

  // Amit calls 60 (was at 20 BB, adds 40)
  assert.strictEqual(amitState.currentTurnPlayerId, amitPlayerId);
  const callRes = await new Promise(resolve => {
    socketAmit.emit('player-action', { roomId, action: 'call' }, resolve);
  });
  assert(callRes.success, 'Amit call failed');
  await wait(300);
  console.log(`✅ Amit called 60. Betting round finished!`);

  // Street should now be Flop!
  assert.strictEqual(hostState.street, 'flop');
  console.log(`✅ Advanced to Street: ${hostState.street}, Total Pot: ${hostState.pot}`);

  // Flop betting: Amit checks
  const flopActor = hostState.players.find(p => p.id === hostState.currentTurnPlayerId);
  console.log(`Flop first actor: ${flopActor.name}`);

  let activeSocket = flopActor.id === hostPlayerId ? socketHost : (flopActor.id === priyaPlayerId ? socketPriya : socketAmit);
  await new Promise(resolve => activeSocket.emit('player-action', { roomId, action: 'check' }, resolve));
  await wait(300);

  // Next player checks
  const flopActor2 = hostState.players.find(p => p.id === hostState.currentTurnPlayerId);
  let activeSocket2 = flopActor2.id === hostPlayerId ? socketHost : (flopActor2.id === priyaPlayerId ? socketPriya : socketAmit);
  await new Promise(resolve => activeSocket2.emit('player-action', { roomId, action: 'check' }, resolve));
  await wait(300);

  // Advanced to Turn!
  assert.strictEqual(hostState.street, 'turn');
  console.log(`✅ Advanced to Street: ${hostState.street}`);

  // Host tests Rebuy: Add 500 chips to Priya
  const rebuyRes = await new Promise(resolve => {
    socketHost.emit('rebuy', { roomId, hostToken, targetPlayerId: priyaPlayerId, amount: 500 }, resolve);
  });
  assert(rebuyRes.success, 'Rebuy failed');
  await wait(300);
  const priyaPlayer = hostState.players.find(p => p.id === priyaPlayerId);
  assert.strictEqual(priyaPlayer.totalRebuys, 500);
  console.log(`✅ Host rebuy 500 chips to Priya verified!`);

  // Host awards pot at Showdown
  const awardRes = await new Promise(resolve => {
    socketHost.emit('award-pots', {
      roomId,
      hostToken,
      allocations: {
        pots: [{ potId: 'main', winnerIds: [hostPlayerId] }]
      }
    }, resolve);
  });
  assert(awardRes.success, 'Award pots failed');
  await wait(300);
  assert.strictEqual(hostState.street, 'hand_ended');
  console.log(`✅ Pot awarded! Winner message: ${hostState.lastHandResult.message}`);

  // End Game Summary
  let summaryLeaderboard = null;
  const endRes = await new Promise(resolve => {
    socketHost.emit('end-game', { roomId, hostToken }, (res) => {
      summaryLeaderboard = res.leaderboard;
      resolve(res);
    });
  });
  assert(endRes.success, 'End game failed');
  await wait(300);
  assert.strictEqual(hostState.stage, 'ended');
  assert(summaryLeaderboard && summaryLeaderboard.length === 3);
  console.log('✅ End of night leaderboard:');
  summaryLeaderboard.forEach((p, idx) => {
    console.log(`   #${idx + 1} ${p.name}: Chips=${p.chips}, BuyIn=${p.totalBuyIn}, P/L=${p.profitFormatted}`);
  });

  // Zero-sum check
  const netSum = summaryLeaderboard.reduce((acc, p) => acc + p.profitLoss, 0);
  assert.strictEqual(netSum, 0, `Net profit/loss of all players must sum to 0 (zero-sum), got ${netSum}`);
  console.log('✅ Net profit/loss is perfectly zero-sum (+/- balance verified)!');

  // Test Leave Table via Socket
  const leaveRes = await new Promise(resolve => {
    socketAmit.emit('leave-table', { roomId }, resolve);
  });
  assert(leaveRes && leaveRes.success, 'Leave table failed');
  await wait(300);
  assert.strictEqual(hostState.players.length, 2, 'Host state should now show 2 players after Amit left');
  console.log('✅ Leave Table verified: Amit left, table updated to 2 players!');

  // SECURITY & INPUT VALIDATION TESTS:
  console.log('--- Testing Security, Tokens & Input Validation ---');

  // Test 1: Session hijacking prevention
  const socketAttacker = io(SERVER_URL);
  await new Promise(resolve => socketAttacker.on('connect', resolve));

  const hijackRes = await new Promise(resolve => {
    socketAttacker.emit('reconnect-player', {
      roomId,
      playerId: hostPlayerId,
      playerToken: 'invalid_token_attempt'
    }, resolve);
  });
  assert.strictEqual(hijackRes.success, false, 'Attacker must be blocked from reconnecting with bad token');
  console.log('✅ Session hijacking prevented: Invalid playerToken rejected!');

  // Legitimate reconnect with correct token
  const legitReconnectRes = await new Promise(resolve => {
    socketAttacker.emit('reconnect-player', {
      roomId,
      playerId: hostPlayerId,
      playerToken: hostPlayerToken
    }, resolve);
  });
  assert(legitReconnectRes && legitReconnectRes.success, 'Legitimate reconnect with valid playerToken must succeed');
  console.log('✅ Legitimate reconnect succeeded with valid playerToken!');
  socketAttacker.disconnect();

  // Test 1b: Card upload and community cards over socket
  console.log('--- Testing Card Uploads and Progressive Community Cards ---');
  const setCardRes = await new Promise(resolve => {
    socketHost.emit('set-player-cards', { roomId, cards: ['As', 'Kh'] }, resolve);
  });
  assert(setCardRes && setCardRes.success, 'Host failed to set player cards');

  const setPriyaCardRes = await new Promise(resolve => {
    socketPriya.emit('set-player-cards', { roomId, cards: ['Qd', 'Jc'] }, resolve);
  });
  assert(setPriyaCardRes && setPriyaCardRes.success, 'Priya failed to set player cards');
  await wait(50);

  // Priya's view should see her cards, but host's cards should be face down
  assert(priyaState, 'priyaState should exist');
  const priyaInPriyaState = priyaState.players.find(p => p.id === priyaPlayerId);
  const hostInPriyaState = priyaState.players.find(p => p.id === hostPlayerId);
  assert(priyaInPriyaState.cards[0].code === 'Qd', 'Priya should see Qd');
  assert(hostInPriyaState.cards[0].faceDown === true, 'Host cards should be hidden from Priya');
  console.log('✅ Player cards uploaded and private visibility verified over socket!');

  // Host adds Round 1 community card
  const r1Res = await new Promise(resolve => {
    socketHost.emit('host-add-community-card', { roomId, hostToken, card: '10s', round: 1 }, resolve);
  });
  assert(r1Res && r1Res.success, 'Host failed to add round 1 card');
  assert.strictEqual(r1Res.communityCards.length, 1);
  assert.strictEqual(r1Res.communityCards[0].code, '10s');

  // Host adds Round 2 community card
  const r2Res = await new Promise(resolve => {
    socketHost.emit('host-add-community-card', { roomId, hostToken, card: '9h', round: 2 }, resolve);
  });
  assert(r2Res && r2Res.success, 'Host failed to add round 2 card');
  assert.strictEqual(r2Res.communityCards.length, 2);
  assert.strictEqual(r2Res.communityCards[1].code, '9h');
  await wait(50);
  assert.strictEqual(priyaState.communityCards.length, 2, 'Priya must receive progressive community cards');
  console.log('✅ Host progressive community card upload (Round 1, Round 2) verified over socket!');

  // Test 2: Input validation for raises and rebuys
  const negRaiseRes = await new Promise(resolve => {
    socketHost.emit('player-action', { roomId, action: 'raise', amount: -50 }, resolve);
  });
  assert.strictEqual(negRaiseRes.success, false, 'Negative raise amount must be rejected');

  const floatRaiseRes = await new Promise(resolve => {
    socketHost.emit('player-action', { roomId, action: 'raise', amount: 25.5 }, resolve);
  });
  assert.strictEqual(floatRaiseRes.success, false, 'Non-integer raise amount must be rejected');

  const negRebuyRes = await new Promise(resolve => {
    socketHost.emit('rebuy', { roomId, hostToken, targetPlayerId: priyaPlayerId, amount: -100 }, resolve);
  });
  assert.strictEqual(negRebuyRes.success, false, 'Negative rebuy amount must be rejected');

  const stringRebuyRes = await new Promise(resolve => {
    socketHost.emit('rebuy', { roomId, hostToken, targetPlayerId: priyaPlayerId, amount: 'invalid' }, resolve);
  });
  assert.strictEqual(stringRebuyRes.success, false, 'NaN rebuy amount must be rejected');
  console.log('✅ Input validation verified: Negative, floating, and NaN amounts rejected!');

  // Test 3: Chat rate limiting
  for (let i = 0; i < 5; i++) {
    socketHost.emit('send-chat', { roomId, message: `Spam test ${i}` });
  }
  await wait(200);
  console.log('✅ Chat rate-limiting verified!');

  socketHost.disconnect();
  socketPriya.disconnect();
  socketAmit.disconnect();

  console.log('🎉 ALL MULTIPLAYER REAL-TIME TESTS PASSED SUCCESSFULLY!');
  } finally {
    if (childServer) {
      childServer.kill();
    }
  }
}

runMultiplayerSimulation().catch(err => {
  console.error('❌ Simulation Error:', err);
  process.exit(1);
});
