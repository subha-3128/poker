// Client-side Socket.IO Controller & Session Management

class PokerSocketClient {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.playerId = null;
    this.playerName = null;
    this.currentState = null;
    this.networkInfo = null;

    this.onStateUpdate = null;
    this.onSummary = null;
    this.onKicked = null;
    this.onError = null;
  }

  init() {
    this.socket = io({
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to server with socket ID:', this.socket.id);
      this.attemptAutoReconnect();
    });

    this.socket.on('game-state', (state) => {
      this.currentState = state;
      if (this.onStateUpdate) {
        this.onStateUpdate(state);
      }
    });

    this.socket.on('game-ended-summary', (data) => {
      if (this.onSummary) {
        this.onSummary(data);
      }
    });

    this.socket.on('kicked', (data) => {
      this.clearSession();
      if (this.onKicked) {
        this.onKicked(data);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }

  saveSession(roomId, playerId, playerName) {
    this.roomId = roomId;
    this.playerId = playerId;
    this.playerName = playerName;
    localStorage.setItem('poker_session', JSON.stringify({
      roomId,
      playerId,
      playerName
    }));
  }

  clearSession() {
    this.roomId = null;
    this.playerId = null;
    localStorage.removeItem('poker_session');
  }

  attemptAutoReconnect() {
    const raw = localStorage.getItem('poker_session');
    if (!raw) return;
    try {
      const session = JSON.parse(raw);
      if (session.roomId && session.playerId) {
        this.roomId = session.roomId;
        this.playerId = session.playerId;
        this.playerName = session.playerName;

        this.socket.emit('reconnect-player', session, (res) => {
          if (!res || !res.success) {
            console.log('Session expired or could not reconnect:', res?.message);
            this.clearSession();
          } else {
            console.log('Reconnected to room', session.roomId);
          }
        });
      }
    } catch (e) {
      this.clearSession();
    }
  }

  createGame(playerName, config) {
    return new Promise((resolve, reject) => {
      this.socket.emit('create-game', { playerName, config }, (res) => {
        if (res && res.success) {
          this.saveSession(res.roomId, res.playerId, playerName);
          resolve(res);
        } else {
          reject(new Error(res?.message || 'Failed to create game'));
        }
      });
    });
  }

  joinGame(roomId, playerName) {
    return new Promise((resolve, reject) => {
      const raw = localStorage.getItem('poker_session');
      let existingPlayerId = null;
      if (raw) {
        try {
          const s = JSON.parse(raw);
          if (s.roomId === roomId) existingPlayerId = s.playerId;
        } catch (e) {}
      }

      this.socket.emit('join-game', { roomId, playerName, playerId: existingPlayerId }, (res) => {
        if (res && res.success) {
          this.saveSession(res.roomId, res.playerId, playerName);
          resolve(res);
        } else {
          reject(new Error(res?.message || 'Failed to join game'));
        }
      });
    });
  }

  updateConfig(config) {
    return new Promise((resolve, reject) => {
      this.socket.emit('update-config', { roomId: this.roomId, config }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Failed to update config'));
      });
    });
  }

  startGame() {
    return new Promise((resolve, reject) => {
      this.socket.emit('start-game', { roomId: this.roomId }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Failed to start game'));
      });
    });
  }

  sendAction(action, amount = 0) {
    return new Promise((resolve, reject) => {
      this.socket.emit('player-action', { roomId: this.roomId, action, amount }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Action failed'));
      });
    });
  }

  startNextHand() {
    return new Promise((resolve, reject) => {
      this.socket.emit('start-next-hand', { roomId: this.roomId }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Failed to deal next hand'));
      });
    });
  }

  awardPots(allocations) {
    return new Promise((resolve, reject) => {
      this.socket.emit('award-pots', { roomId: this.roomId, allocations }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Failed to award pots'));
      });
    });
  }

  rebuy(targetPlayerId, amount) {
    return new Promise((resolve, reject) => {
      this.socket.emit('rebuy', { roomId: this.roomId, targetPlayerId, amount }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Rebuy failed'));
      });
    });
  }

  kickPlayer(targetPlayerId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('kick-player', { roomId: this.roomId, targetPlayerId }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Failed to kick player'));
      });
    });
  }

  endGame() {
    return new Promise((resolve, reject) => {
      this.socket.emit('end-game', { roomId: this.roomId }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Failed to end game'));
      });
    });
  }

  resumeGame() {
    return new Promise((resolve, reject) => {
      this.socket.emit('resume-game', { roomId: this.roomId }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Failed to resume game'));
      });
    });
  }

  sendChat(message) {
    if (!message || !this.roomId) return;
    this.socket.emit('send-chat', { roomId: this.roomId, message });
  }

  async fetchNetworkInfo(roomCode) {
    try {
      const res = await fetch(`/api/network-info?room=${roomCode || this.roomId || ''}`);
      this.networkInfo = await res.json();
      return this.networkInfo;
    } catch (e) {
      console.error('Failed to fetch network info:', e);
      return null;
    }
  }
}

window.pokerClient = new PokerSocketClient();
