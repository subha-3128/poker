const crypto = require('crypto');

class PokerGame {
  constructor(roomId, hostId, config = {}, hostToken = null) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.hostToken = hostToken;
    this.lastActivityAt = Date.now();
    this.config = {
      startingChips: Number(config.startingChips) || 1000,
      smallBlind: Number(config.smallBlind) || 10,
      bigBlind: Number(config.bigBlind) || 20,
      turnTimeLimit: 0
    };

    this.stage = 'lobby'; // 'lobby' | 'playing' | 'ended'
    this.handNumber = 0;
    this.street = 'none'; // 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'hand_ended'
    this.players = []; // Array of Player objects

    this.dealerIndex = -1;
    this.currentTurnPlayerId = null;
    this.turnExpiresAt = null;
    this.turnTimer = null;

    this.highestBet = 0;
    this.minRaise = this.config.bigBlind;
    this.pot = 0;
    this.pots = []; // [{ id, name, amount, eligiblePlayerIds }]

    this.lastHandResult = null;
    this.actionLog = [];
    this.onStateChange = null; // Callback for state updates
  }

  touch() {
    this.lastActivityAt = Date.now();
  }

  destroy() {
    this.clearTurnTimer();
    this.onStateChange = null;
  }

  // --- LOGGING ---
  log(text, type = 'info') {
    this.touch();
    const entry = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      text,
      type, // 'action' | 'blind' | 'win' | 'system' | 'rebuy' | 'turn'
      timestamp: Date.now()
    };
    this.actionLog.push(entry);
    if (this.actionLog.length > 100) {
      this.actionLog.shift();
    }
    return entry;
  }

  // --- PLAYER MANAGEMENT ---
  addPlayer(id, name, socketId, playerToken = null) {
    let existing = this.players.find(p => p.id === id);
    if (existing) {
      existing.socketId = socketId;
      existing.connected = true;
      existing.name = name || existing.name;
      if (playerToken) existing.playerToken = playerToken;
      this.log(`${existing.name} reconnected.`, 'system');
      return existing;
    }

    if (this.players.length >= 10) {
      throw new Error('Table is full (maximum 10 players).');
    }

    const newPlayer = {
      id,
      socketId,
      playerToken: playerToken || crypto.randomBytes(16).toString('hex'),
      name: name || `Player ${this.players.length + 1}`,
      chips: this.config.startingChips,
      currentBet: 0,
      totalContributed: 0,
      startingChips: this.config.startingChips,
      totalRebuys: 0,
      isFolded: false,
      isAllIn: false,
      isSittingOut: this.stage === 'playing', // Sit out till next hand if joined mid-game
      hasActed: false,
      lastAction: null,
      role: null, // 'dealer', 'sb', 'bb'
      connected: true
    };

    this.players.push(newPlayer);
    this.log(`${newPlayer.name} joined the game.`, 'system');
    return newPlayer;
  }

  removePlayer(playerId) {
    const p = this.players.find(pl => pl.id === playerId);
    if (!p) return;
    p.connected = false;

    // If still in lobby, remove from list
    if (this.stage === 'lobby') {
      this.players = this.players.filter(pl => pl.id !== playerId);
      if (this.players.length === 0) {
        this.dealerIndex = -1;
      } else if (this.dealerIndex >= this.players.length) {
        this.dealerIndex = this.players.length - 1;
      }
      if (this.hostId === playerId && this.players.length > 0) {
        this.hostId = this.players[0].id;
        this.log(`${this.players[0].name} is now the host.`, 'system');
      }
      this.log(`${p.name} left.`, 'system');
    } else {
      this.log(`${p.name} disconnected.`, 'system');
      // If it is their turn in active betting, auto check/fold
      if (this.currentTurnPlayerId === playerId && this.stage === 'playing' && this.street !== 'hand_ended' && this.street !== 'showdown') {
        this.handleTimeout();
      }
    }
  }

  kickPlayer(playerId) {
    const p = this.players.find(pl => pl.id === playerId);
    if (!p) return;
    const name = p.name;

    if (this.stage === 'playing') {
      if (this.currentTurnPlayerId === playerId) {
        this.handleAction(playerId, 'fold');
      } else {
        p.isFolded = true;
      }
      p.isSittingOut = true;
    }

    this.players = this.players.filter(pl => pl.id !== playerId);
    if (this.players.length === 0) {
      this.dealerIndex = -1;
    } else if (this.dealerIndex >= this.players.length) {
      this.dealerIndex = this.players.length - 1;
    }
    this.log(`${name} was kicked by host.`, 'system');

    // If only 1 player remains in current hand, finish hand
    if (this.stage === 'playing' && this.street !== 'hand_ended') {
      const active = this.getActivePlayersInHand();
      if (active.length <= 1) {
        this.checkOnlyOnePlayerRemains();
      }
    }
  }

  leaveGame(playerId) {
    const p = this.players.find(pl => pl.id === playerId);
    if (!p) return;
    const name = p.name;

    if (this.stage === 'playing') {
      if (this.currentTurnPlayerId === playerId) {
        try {
          this.handleAction(playerId, 'fold');
        } catch (e) {
          p.isFolded = true;
        }
      } else {
        p.isFolded = true;
      }
      p.isSittingOut = true;
    }

    this.players = this.players.filter(pl => pl.id !== playerId);

    if (this.players.length === 0) {
      this.dealerIndex = -1;
      this.currentTurnPlayerId = null;
    } else {
      if (this.dealerIndex >= this.players.length) {
        this.dealerIndex = Math.max(0, this.players.length - 1);
      }
      if (this.hostId === playerId) {
        this.hostId = this.players[0].id;
        this.log(`👑 ${this.players[0].name} is now the table host.`, 'system');
      }
    }

    this.log(`🚪 ${name} left the table.`, 'system');

    // If only 1 player remains in current hand, finish hand
    if (this.stage === 'playing' && this.street !== 'hand_ended') {
      const active = this.getActivePlayersInHand();
      if (active.length <= 1) {
        this.checkOnlyOnePlayerRemains();
      }
    }
  }

  updateConfig(newConfig) {
    if (newConfig.startingChips !== undefined) {
      this.config.startingChips = Number(newConfig.startingChips);
      if (this.stage === 'lobby') {
        for (const p of this.players) {
          p.chips = this.config.startingChips;
          p.startingChips = this.config.startingChips;
        }
      }
    }
    if (newConfig.smallBlind !== undefined) {
      this.config.smallBlind = Number(newConfig.smallBlind);
    }
    if (newConfig.bigBlind !== undefined) {
      this.config.bigBlind = Number(newConfig.bigBlind);
    }
    this.config.turnTimeLimit = 0;
    this.log(`Game settings updated: Blinds ${this.config.smallBlind}/${this.config.bigBlind}, Starting chips ${this.config.startingChips}`, 'system');
  }

  rebuy(playerId, amount) {
    const p = this.players.find(pl => pl.id === playerId);
    if (!p) return false;
    const amt = Number(amount) || this.config.startingChips;
    p.chips += amt;
    p.totalRebuys += amt;
    if (p.isSittingOut && p.chips > 0 && this.street === 'hand_ended') {
      p.isSittingOut = false;
    }
    this.log(`Host added +${amt} chips to ${p.name} (Total chips: ${p.chips})`, 'rebuy');
    return true;
  }

  // --- HAND & STREET FLOW ---
  startGame() {
    if (this.players.length < 2) {
      throw new Error('At least 2 players required to start.');
    }
    this.stage = 'playing';
    this.handNumber = 0;
    this.startHand();
  }

  getEligiblePlayersForNewHand() {
    // Players who have chips and are connected/not sitting out permanently
    return this.players.filter(p => p.chips > 0);
  }

  getActivePlayersInHand() {
    // Players still in current hand (not folded)
    return this.players.filter(p => !p.isSittingOut && !p.isFolded);
  }

  getNonAllInActivePlayers() {
    // Players who can still bet
    return this.players.filter(p => !p.isSittingOut && !p.isFolded && !p.isAllIn);
  }

  startHand() {
    this.clearTurnTimer();
    const eligible = this.getEligiblePlayersForNewHand();
    if (eligible.length < 2) {
      this.log('Not enough players with chips to start a hand. Players can rebuy!', 'system');
      this.street = 'hand_ended';
      return;
    }

    this.handNumber += 1;
    this.pot = 0;
    this.pots = [];
    this.highestBet = 0;
    this.minRaise = this.config.bigBlind;
    this.lastHandResult = null;

    // Reset player hand states
    for (const p of this.players) {
      if (p.chips <= 0) {
        p.isSittingOut = true;
      } else {
        p.isSittingOut = false;
      }
      p.isFolded = p.isSittingOut;
      p.isAllIn = false;
      p.currentBet = 0;
      p.totalContributed = 0;
      p.hasActed = false;
      p.lastAction = null;
      p.role = null;
    }

    // Rotate Dealer button
    const activeList = this.players.filter(p => !p.isSittingOut);
    if (this.dealerIndex === -1 || this.dealerIndex >= this.players.length) {
      this.dealerIndex = 0;
    } else {
      // Find next eligible player with loop guard
      let nextIdx = (this.dealerIndex + 1) % this.players.length;
      let attempts = 0;
      while (this.players[nextIdx] && this.players[nextIdx].isSittingOut && attempts < this.players.length) {
        nextIdx = (nextIdx + 1) % this.players.length;
        attempts++;
      }
      this.dealerIndex = nextIdx;
    }

    // Assign roles & Blinds
    const numActive = activeList.length;
    let dealerPlayer = this.players[this.dealerIndex];
    let sbPlayer, bbPlayer;

    if (numActive === 2) {
      // Heads-Up: Dealer is SB, other player is BB
      dealerPlayer.role = 'dealer';
      sbPlayer = dealerPlayer;
      const otherIdx = this.players.findIndex((p, idx) => idx !== this.dealerIndex && !p.isSittingOut);
      bbPlayer = this.players[otherIdx];
      bbPlayer.role = 'bb';
    } else {
      dealerPlayer.role = 'dealer';
      // Next active after dealer = SB
      let sbIdx = this.getNextActiveIndex(this.dealerIndex);
      sbPlayer = this.players[sbIdx];
      sbPlayer.role = 'sb';
      // Next active after SB = BB
      let bbIdx = this.getNextActiveIndex(sbIdx);
      bbPlayer = this.players[bbIdx];
      bbPlayer.role = 'bb';
    }

    // Post Blinds
    const sbPost = Math.min(this.config.smallBlind, sbPlayer.chips);
    sbPlayer.chips -= sbPost;
    sbPlayer.currentBet = sbPost;
    sbPlayer.totalContributed = sbPost;
    if (sbPlayer.chips === 0) sbPlayer.isAllIn = true;

    const bbPost = Math.min(this.config.bigBlind, bbPlayer.chips);
    bbPlayer.chips -= bbPost;
    bbPlayer.currentBet = bbPost;
    bbPlayer.totalContributed = bbPost;
    if (bbPlayer.chips === 0) bbPlayer.isAllIn = true;

    this.pot = sbPost + bbPost;
    this.highestBet = Math.max(sbPost, bbPost);
    this.minRaise = this.config.bigBlind;

    this.street = 'preflop';
    this.log(`--- Hand #${this.handNumber} Started ---`, 'system');
    this.log(`Dealer: ${dealerPlayer.name} (D). Blinds: ${sbPlayer.name} (SB ${sbPost}), ${bbPlayer.name} (BB ${bbPost})`, 'blind');

    // First to act preflop:
    // Heads-up: Dealer (SB) acts first preflop
    // 3+ players: Player to left of BB acts first (UTG)
    let firstActorIdx;
    if (numActive === 2) {
      firstActorIdx = this.players.indexOf(dealerPlayer);
    } else {
      firstActorIdx = this.getNextActiveIndex(this.players.indexOf(bbPlayer));
    }

    // If first actor is all-in from blind, find next
    if (this.players[firstActorIdx].isAllIn) {
      firstActorIdx = this.getNextActorIndex(firstActorIdx);
    }

    if (firstActorIdx === -1) {
      // Everyone is all-in!
      this.advanceToAllInShowdown();
    } else {
      this.setTurnPlayer(this.players[firstActorIdx].id);
    }

    this.calculatePots();
    this.notifyState();
  }

  getNextActiveIndex(fromIndex) {
    let idx = (fromIndex + 1) % this.players.length;
    while (this.players[idx].isSittingOut || this.players[idx].isFolded) {
      idx = (idx + 1) % this.players.length;
    }
    return idx;
  }

  getNextActorIndex(fromIndex) {
    let count = 0;
    let idx = (fromIndex + 1) % this.players.length;
    while (count < this.players.length) {
      const p = this.players[idx];
      if (!p.isSittingOut && !p.isFolded && !p.isAllIn) {
        return idx;
      }
      idx = (idx + 1) % this.players.length;
      count++;
    }
    return -1;
  }

  setTurnPlayer(playerId) {
    this.clearTurnTimer();
    this.currentTurnPlayerId = playerId;
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    this.turnExpiresAt = null;
    this.notifyState();
  }

  clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    this.turnExpiresAt = null;
  }

  handleTimeout() {
    if (!this.currentTurnPlayerId) return;
    if (this.stage !== 'playing' || this.street === 'hand_ended' || this.street === 'showdown' || this.street === 'none') {
      this.clearTurnTimer();
      this.currentTurnPlayerId = null;
      return;
    }
    const player = this.players.find(p => p.id === this.currentTurnPlayerId);
    if (!player) return;

    try {
      const callAmount = this.highestBet - player.currentBet;
      if (callAmount === 0) {
        // Free to check
        this.log(`${player.name} timed out and checked automatically.`, 'turn');
        this.handleAction(player.id, 'check');
      } else {
        this.log(`${player.name} timed out and folded automatically.`, 'turn');
        this.handleAction(player.id, 'fold');
      }
    } catch (err) {
      console.warn('handleTimeout suppressed error:', err.message);
    }
  }

  // --- PLAYER ACTIONS ---
  handleAction(playerId, action, amount = 0) {
    if (this.currentTurnPlayerId !== playerId) {
      throw new Error("It's not your turn!");
    }
    if (this.street === 'hand_ended' || this.street === 'showdown') {
      throw new Error('Hand is not in a betting phase.');
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player || player.isFolded || player.isAllIn) {
      throw new Error('Invalid player state.');
    }

    const callAmount = this.highestBet - player.currentBet;

    switch (action.toLowerCase()) {
      case 'fold': {
        player.isFolded = true;
        player.hasActed = true;
        player.lastAction = 'Folded';
        this.log(`${player.name} folded.`, 'action');
        break;
      }

      case 'check': {
        if (callAmount > 0) {
          throw new Error(`Cannot check: must call ${callAmount} or fold.`);
        }
        player.hasActed = true;
        player.lastAction = 'Checked';
        this.log(`${player.name} checked.`, 'action');
        break;
      }

      case 'call': {
        if (callAmount <= 0) {
          // If call amount is 0, treating as check
          player.hasActed = true;
          player.lastAction = 'Checked';
          this.log(`${player.name} checked.`, 'action');
          break;
        }

        const chipsToPay = Math.min(callAmount, player.chips);
        player.chips -= chipsToPay;
        player.currentBet += chipsToPay;
        player.totalContributed += chipsToPay;
        this.pot += chipsToPay;
        player.hasActed = true;

        if (player.chips === 0) {
          player.isAllIn = true;
          player.lastAction = `Called All-In (${player.currentBet})`;
          this.log(`${player.name} called All-In with ${chipsToPay} chips.`, 'action');
        } else {
          player.lastAction = `Called ${chipsToPay}`;
          this.log(`${player.name} called ${chipsToPay}.`, 'action');
        }
        break;
      }

      case 'raise': {
        // targetTotalBet is the total bet for this street
        const targetTotalBet = Number(amount);
        const chipsNeeded = targetTotalBet - player.currentBet;

        if (chipsNeeded <= 0) {
          throw new Error('Raise amount must be greater than current bet.');
        }

        if (chipsNeeded > player.chips) {
          throw new Error(`Not enough chips: you have ${player.chips}, need ${chipsNeeded}.`);
        }

        const raiseIncrement = targetTotalBet - this.highestBet;
        // If not all-in, must satisfy minimum raise increment
        if (chipsNeeded < player.chips && raiseIncrement < this.minRaise) {
          throw new Error(`Minimum raise is to ${this.highestBet + this.minRaise} (raise increment of ${this.minRaise}).`);
        }

        player.chips -= chipsNeeded;
        player.currentBet += chipsNeeded;
        player.totalContributed += chipsNeeded;
        this.pot += chipsNeeded;
        player.hasActed = true;

        if (raiseIncrement >= this.minRaise) {
          this.minRaise = raiseIncrement;
        }
        this.highestBet = player.currentBet;

        // Reset hasActed for other active, non-all-in players since bet was raised
        for (const other of this.players) {
          if (other.id !== player.id && !other.isFolded && !other.isAllIn && !other.isSittingOut) {
            other.hasActed = false;
          }
        }

        if (player.chips === 0) {
          player.isAllIn = true;
          player.lastAction = `All-In (${player.currentBet})`;
          this.log(`${player.name} went All-In to ${targetTotalBet}!`, 'action');
        } else {
          player.lastAction = `Raised to ${targetTotalBet}`;
          this.log(`${player.name} raised to ${targetTotalBet}.`, 'action');
        }
        break;
      }

      case 'allin': {
        const allInBet = player.currentBet + player.chips;
        const chipsNeeded = player.chips;

        player.chips = 0;
        player.currentBet = allInBet;
        player.totalContributed += chipsNeeded;
        this.pot += chipsNeeded;
        player.isAllIn = true;
        player.hasActed = true;

        if (allInBet > this.highestBet) {
          const raiseIncrement = allInBet - this.highestBet;
          if (raiseIncrement >= this.minRaise) {
            this.minRaise = raiseIncrement;
            // Only re-open action for others if raise met the minimum raise increment
            for (const other of this.players) {
              if (other.id !== player.id && !other.isFolded && !other.isAllIn && !other.isSittingOut) {
                other.hasActed = false;
              }
            }
          }
          this.highestBet = allInBet;
        }

        player.lastAction = `All-In (${allInBet})`;
        this.log(`${player.name} went All-In (${allInBet})!`, 'action');
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    this.calculatePots();

    // Check if only 1 player remains unfolded
    if (this.checkOnlyOnePlayerRemains()) {
      return;
    }

    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.advanceStreet();
    } else {
      // Move to next player
      const nextIdx = this.getNextActorIndex(this.players.indexOf(player));
      if (nextIdx === -1) {
        // No more players can act (all remaining are all-in or matched)
        this.advanceToAllInShowdown();
      } else {
        this.setTurnPlayer(this.players[nextIdx].id);
      }
    }

    this.notifyState();
  }

  isBettingRoundComplete() {
    const active = this.getActivePlayersInHand();
    if (active.length <= 1) return true;

    // A betting round is complete when every active non-all-in player has acted
    // AND has matched the highest bet
    for (const p of active) {
      if (!p.isAllIn) {
        if (!p.hasActed) return false;
        if (p.currentBet !== this.highestBet) return false;
      }
    }
    return true;
  }

  checkOnlyOnePlayerRemains() {
    const active = this.getActivePlayersInHand();
    if (active.length === 1) {
      const winner = active[0];
      this.endHandByFold(winner.id);
      return true;
    }
    return false;
  }

  endHandByFold(winnerId) {
    this.clearTurnTimer();
    this.currentTurnPlayerId = null;
    const winner = this.players.find(p => p.id === winnerId);
    if (!winner) return;

    // Refund uncalled bet if any
    this.refundUncalledBets();

    const wonAmount = this.pot;
    winner.chips += wonAmount;
    this.pot = 0;
    this.street = 'hand_ended';

    this.lastHandResult = {
      type: 'fold_win',
      winners: [{ id: winner.id, name: winner.name, amount: wonAmount }],
      message: `${winner.name} won ${wonAmount} chips (all other players folded).`
    };

    this.log(`🏆 ${winner.name} won ${wonAmount} chips!`, 'win');
    this.notifyState();
  }

  advanceStreet() {
    this.clearTurnTimer();
    this.refundUncalledBets();

    // Reset street bets
    for (const p of this.players) {
      p.currentBet = 0;
      p.hasActed = false;
      p.lastAction = null;
    }
    this.highestBet = 0;
    this.minRaise = this.config.bigBlind;

    this.calculatePots();

    // Advance street
    if (this.street === 'preflop') {
      this.street = 'flop';
    } else if (this.street === 'flop') {
      this.street = 'turn';
    } else if (this.street === 'turn') {
      this.street = 'river';
    } else if (this.street === 'river') {
      this.street = 'showdown';
      this.currentTurnPlayerId = null;
      this.log('🃏 Showdown reached! Host can select the winner(s).', 'system');
      this.notifyState();
      return;
    }

    this.log(`--- Dealing ${this.street.toUpperCase()} (Pot: ${this.pot}) ---`, 'system');

    // Check how many players can still bet
    const nonAllIn = this.getNonAllInActivePlayers();
    if (nonAllIn.length <= 1) {
      // 0 or 1 player with chips remaining (the rest are all-in)
      // Automatically advance through remaining streets to showdown!
      this.advanceToAllInShowdown();
      return;
    }

    // First to act post-flop: First active player to the left of the Dealer button
    let nextIdx = this.getNextActiveIndex(this.dealerIndex);
    if (this.players[nextIdx].isAllIn) {
      nextIdx = this.getNextActorIndex(nextIdx);
    }

    if (nextIdx === -1) {
      this.advanceToAllInShowdown();
    } else {
      this.setTurnPlayer(this.players[nextIdx].id);
    }

    this.notifyState();
  }

  advanceToAllInShowdown() {
    this.clearTurnTimer();
    this.refundUncalledBets();
    this.street = 'showdown';
    this.currentTurnPlayerId = null;
    this.calculatePots();
    this.log('⚡ All players are All-In! Showdown reached. Host can select the winner(s).', 'system');
    this.notifyState();
  }

  refundUncalledBets() {
    // If one player contributed more than anyone else could call, refund the excess
    const nonFolded = this.players.filter(p => !p.isSittingOut && !p.isFolded);
    if (nonFolded.length === 0) return;

    // Find highest and second highest total contribution
    const sorted = [...nonFolded].sort((a, b) => b.totalContributed - a.totalContributed);
    if (sorted.length >= 2 && sorted[0].totalContributed > sorted[1].totalContributed) {
      const excess = sorted[0].totalContributed - sorted[1].totalContributed;
      sorted[0].totalContributed -= excess;
      sorted[0].currentBet = Math.max(0, sorted[0].currentBet - excess);
      sorted[0].chips += excess;
      this.pot -= excess;
      this.log(`Uncalled bet of ${excess} chips returned to ${sorted[0].name}.`, 'system');
    }
  }

  // --- SIDE POT CALCULATION ---
  calculatePots() {
    // Calculate pots based on totalContributed of non-folded and all-in players
    const contributors = this.players.filter(p => p.totalContributed > 0);
    const activeInHand = this.getActivePlayersInHand();
    if (contributors.length === 0 || activeInHand.length === 0) {
      this.pots = [{ id: 'main', name: 'Main Pot', amount: this.pot, eligiblePlayerIds: activeInHand.map(p => p.id) }];
      return this.pots;
    }

    // Distinct non-zero contribution amounts among ALL-IN players
    const allInTiers = this.players
      .filter(p => p.isAllIn && p.totalContributed > 0)
      .map(p => p.totalContributed);

    const maxContrib = Math.max(...contributors.map(p => p.totalContributed));
    const tiers = Array.from(new Set([...allInTiers, maxContrib])).sort((a, b) => a - b);

    const rawPots = [];
    let prevTier = 0;

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const slice = tier - prevTier;
      if (slice <= 0) continue;

      let potAmount = 0;
      for (const p of contributors) {
        if (p.totalContributed > prevTier) {
          potAmount += Math.min(p.totalContributed - prevTier, slice);
        }
      }

      // Eligible players are non-folded players whose totalContributed is at least this tier
      const eligible = this.players
        .filter(p => !p.isFolded && !p.isSittingOut && p.totalContributed >= tier)
        .map(p => p.id);

      if (potAmount > 0) {
        rawPots.push({
          amount: potAmount,
          eligiblePlayerIds: eligible
        });
      }

      prevTier = tier;
    }

    // Roll-down step: if any upper pot slice has eligible.length === 0
    // (e.g. the highest contributor folded), roll its chips down to the nearest lower eligible pot!
    const validPots = [];
    let rolledOverChips = 0;

    for (let i = rawPots.length - 1; i >= 0; i--) {
      const p = rawPots[i];
      if (p.eligiblePlayerIds.length === 0) {
        rolledOverChips += p.amount;
      } else {
        p.amount += rolledOverChips;
        rolledOverChips = 0;
        validPots.unshift(p);
      }
    }

    if (rolledOverChips > 0) {
      if (validPots.length > 0) {
        validPots[0].amount += rolledOverChips;
      } else {
        validPots.push({
          amount: rolledOverChips,
          eligiblePlayerIds: activeInHand.map(p => p.id)
        });
      }
    }

    if (validPots.length === 0) {
      this.pots = [{ id: 'main', name: 'Main Pot', amount: this.pot, eligiblePlayerIds: activeInHand.map(p => p.id) }];
    } else {
      this.pots = validPots.map((p, idx) => ({
        id: idx === 0 ? 'main' : `side_${idx}`,
        name: idx === 0 ? 'Main Pot' : `Side Pot ${idx}`,
        amount: p.amount,
        eligiblePlayerIds: p.eligiblePlayerIds
      }));
    }

    return this.pots;
  }

  // --- SHOWDOWN WINNER SELECTION ---
  awardPots(allocations) {
    // allocations can be:
    // 1) Single overall winner: { overallWinnerId: 'xyz' }
    // 2) Per-pot allocation: [{ potId: 'main', winnerIds: ['id1', 'id2'] }, ...]
    this.clearTurnTimer();
    this.street = 'hand_ended';

    const winnersSummary = [];
    const potList = this.calculatePots();

    if (allocations.overallWinnerId) {
      // Award all pots where this player is eligible to them;
      // for any side pots where they are NOT eligible, split fairly among eligible players
      const overallWinner = this.players.find(p => p.id === allocations.overallWinnerId);
      if (!overallWinner) throw new Error('Selected winner not found');

      for (const pot of potList) {
        if (pot.eligiblePlayerIds.includes(overallWinner.id)) {
          overallWinner.chips += pot.amount;
          winnersSummary.push({
            potName: pot.name,
            winnerNames: [overallWinner.name],
            amount: pot.amount
          });
          this.log(`🏆 ${overallWinner.name} won ${pot.name} (${pot.amount} chips)!`, 'win');
        } else {
          // If overall winner is not eligible for this side pot, split equally among eligible players
          const eligiblePlayers = this.players.filter(p => pot.eligiblePlayerIds.includes(p.id));
          const splitCount = eligiblePlayers.length > 0 ? eligiblePlayers.length : 1;
          const baseShare = Math.floor(pot.amount / splitCount);
          let remainder = pot.amount % splitCount;

          const winningNames = [];
          for (const ep of eligiblePlayers) {
            let share = baseShare;
            if (remainder > 0) {
              share += 1;
              remainder--;
            }
            ep.chips += share;
            winningNames.push(ep.name);
          }

          winnersSummary.push({
            potName: pot.name,
            winnerNames: winningNames.length > 0 ? winningNames : ['Table'],
            amount: pot.amount
          });
          this.log(`🏆 ${winningNames.join(' & ')} won ${pot.name} (${pot.amount} chips)!`, 'win');
        }
      }
    } else if (Array.isArray(allocations.pots)) {
      // Detailed per-pot assignment
      for (const alloc of allocations.pots) {
        const pot = potList.find(pt => pt.id === alloc.potId) || potList[0];
        const winnerIds = alloc.winnerIds && alloc.winnerIds.length > 0 ? alloc.winnerIds : pot.eligiblePlayerIds.slice(0, 1);
        const splitCount = winnerIds.length;
        const baseShare = Math.floor(pot.amount / splitCount);
        let remainder = pot.amount % splitCount;

        const winningPlayers = [];
        for (const wId of winnerIds) {
          const wPlayer = this.players.find(p => p.id === wId);
          if (wPlayer) {
            let share = baseShare;
            if (remainder > 0) {
              share += 1;
              remainder--;
            }
            wPlayer.chips += share;
            winningPlayers.push(wPlayer.name);
          }
        }

        winnersSummary.push({
          potName: pot.name,
          winnerNames: winningPlayers,
          amount: pot.amount
        });
        this.log(`🏆 ${winningPlayers.join(' & ')} won ${pot.name} (${pot.amount} chips)!`, 'win');
      }
    }

    this.pot = 0;
    this.lastHandResult = {
      type: 'showdown_win',
      pots: winnersSummary,
      message: winnersSummary.map(w => `${w.winnerNames.join(' & ')} won ${w.potName} (${w.amount} chips)`).join('. ')
    };

    this.notifyState();
  }

  // --- END OF NIGHT SUMMARY ---
  endGame() {
    this.clearTurnTimer();
    this.stage = 'ended';
    this.street = 'ended';

    const leaderboard = this.players.map(p => {
      const totalBuyIn = p.startingChips + p.totalRebuys;
      const profitLoss = p.chips - totalBuyIn;
      return {
        id: p.id,
        name: p.name,
        chips: p.chips,
        startingChips: p.startingChips,
        totalRebuys: p.totalRebuys,
        totalBuyIn,
        profitLoss,
        profitFormatted: profitLoss >= 0 ? `+${profitLoss}` : `${profitLoss}`
      };
    }).sort((a, b) => b.profitLoss - a.profitLoss);

    this.log('🌙 Host ended the game. Final summary generated!', 'system');
    this.notifyState();
    return leaderboard;
  }

  // --- CLIENT STATE SERIALIZATION ---
  getPublicState(forPlayerId) {
    const isHost = this.hostId === forPlayerId;
    const activeNonFolded = this.getActivePlayersInHand();

    return {
      roomId: this.roomId,
      hostId: this.hostId,
      isHost,
      stage: this.stage,
      handNumber: this.handNumber,
      street: this.street,
      pot: this.pot,
      pots: this.pots,
      highestBet: this.highestBet,
      minRaise: this.minRaise,
      dealerIndex: this.dealerIndex,
      currentTurnPlayerId: this.currentTurnPlayerId,
      turnExpiresAt: null,
      turnTimeLimit: 0,
      config: this.config,
      players: this.players.map((p, idx) => ({
        id: p.id,
        name: p.name,
        chips: p.chips,
        currentBet: p.currentBet,
        totalContributed: p.totalContributed,
        startingChips: p.startingChips,
        totalRebuys: p.totalRebuys,
        isFolded: p.isFolded,
        isAllIn: p.isAllIn,
        isSittingOut: p.isSittingOut,
        hasActed: p.hasActed,
        lastAction: p.lastAction,
        role: p.role,
        connected: p.connected,
        isDealer: idx === this.dealerIndex,
        isTurn: p.id === this.currentTurnPlayerId,
        isYou: p.id === forPlayerId
      })),
      actionLog: this.actionLog.slice(-40),
      lastHandResult: this.lastHandResult,
      // Helper for active player UI
      playerTurnOptions: forPlayerId === this.currentTurnPlayerId ? this.getTurnOptions(forPlayerId) : null
    };
  }

  getTurnOptions(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.isFolded || player.isAllIn) return null;

    const callAmount = this.highestBet - player.currentBet;
    const canCheck = callAmount === 0;
    const canCall = callAmount > 0 && player.chips > 0;
    const callCost = Math.min(callAmount, player.chips);
    const isCallAllIn = callCost === player.chips;

    // Minimum raise to total
    const minRaiseTo = this.highestBet + this.minRaise;
    const maxRaiseTo = player.currentBet + player.chips;
    const canRaise = maxRaiseTo > this.highestBet && maxRaiseTo >= minRaiseTo;

    return {
      canCheck,
      canCall,
      callAmount: callCost,
      isCallAllIn,
      canRaise,
      minRaiseTo: Math.min(minRaiseTo, maxRaiseTo),
      maxRaiseTo,
      currentBet: player.currentBet,
      highestBet: this.highestBet,
      chips: player.chips
    };
  }

  notifyState() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange();
    }
  }
}

module.exports = PokerGame;
