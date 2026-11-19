// Poker Chip Tracker - Main Frontend Controller

document.addEventListener('DOMContentLoaded', () => {
  const client = window.pokerClient;
  const audio = window.pokerAudio;

  // Cache DOM elements
  const elHeaderRoomCode = document.getElementById('header-room-code');
  const elRoomCodeBadge = document.getElementById('room-code-badge');
  const elBtnQrModal = document.getElementById('btn-qr-modal');
  const elBtnSoundToggle = document.getElementById('btn-sound-toggle');
  const elSoundIcon = document.getElementById('sound-icon');
  const elBtnLogToggle = document.getElementById('btn-log-toggle');
  const elUnreadLogBadge = document.getElementById('unread-log-badge');
  const elDrawerLog = document.getElementById('drawer-log');
  const elBtnCloseLog = document.getElementById('btn-close-log');
  const elChatForm = document.getElementById('chat-form');
  const elChatInput = document.getElementById('chat-input');
  const elGameLogMessages = document.getElementById('game-log-messages');

  // Views
  const views = {
    home: document.getElementById('view-home'),
    lobby: document.getElementById('view-lobby'),
    table: document.getElementById('view-table'),
    summary: document.getElementById('view-summary')
  };

  // Home Screen Elements
  const elInputPlayerName = document.getElementById('input-player-name');
  const elBtnCreateGame = document.getElementById('btn-create-game');
  const elInputRoomCode = document.getElementById('input-room-code');
  const elBtnJoinGame = document.getElementById('btn-join-game');
  const elWifiAddressText = document.getElementById('wifi-address-text');

  // Lobby Screen Elements
  const elLobbyRoomCode = document.getElementById('lobby-room-code');
  const elBtnCopyLink = document.getElementById('btn-copy-link');
  const elLobbyQrImg = document.getElementById('lobby-qr-img');
  const elLobbyQrClick = document.getElementById('lobby-qr-click');
  const elCfgStartingChips = document.getElementById('cfg-starting-chips');
  const elCfgSmallBlind = document.getElementById('cfg-small-blind');
  const elCfgBigBlind = document.getElementById('cfg-big-blind');
  const elCfgTurnTimer = document.getElementById('cfg-turn-timer');
  const elLobbyGuestSettings = document.getElementById('lobby-guest-settings');
  const elGuestRuleChips = document.getElementById('guest-rule-chips');
  const elGuestRuleBlinds = document.getElementById('guest-rule-blinds');
  const elGuestRuleTimer = document.getElementById('guest-rule-timer');
  const elPlayerCount = document.getElementById('player-count');
  const elLobbyPlayersList = document.getElementById('lobby-players-list');
  const elBtnStartGame = document.getElementById('btn-start-game');

  // Table Screen Elements
  const elStatusHandNum = document.getElementById('status-hand-num');
  const elStatusStreetBadge = document.getElementById('status-street-badge');
  const elTotalPotAmount = document.getElementById('total-pot-amount');
  const elSidePotsContainer = document.getElementById('side-pots-container');
  const elCenterPotChips = document.getElementById('center-pot-chips');
  const elCenterPotVal = document.getElementById('center-pot-val');
  const elTableActionBanner = document.getElementById('table-action-banner');
  const elBannerText = document.getElementById('banner-text');
  const elCenterHostActions = document.getElementById('center-host-actions');
  const elBtnShowdownAward = document.getElementById('btn-showdown-award');
  const elBtnNextHand = document.getElementById('btn-next-hand');
  const elPokerPlayersLayer = document.getElementById('poker-players-layer');

  // Turn Controls Dock
  const elTurnTimerBar = document.getElementById('turn-timer-bar');
  const elTimerPlayerName = document.getElementById('timer-player-name');
  const elTimerSecondsLeft = document.getElementById('timer-seconds-left');
  const elTurnControls = document.getElementById('turn-controls');
  const elWaitingDock = document.getElementById('waiting-dock');
  const elWaitingStatusText = document.getElementById('waiting-status-text');

  // Action Buttons
  const elBtnActionFold = document.getElementById('btn-action-fold');
  const elBtnActionCheckCall = document.getElementById('btn-action-check-call');
  const elBtnCheckCallText = document.getElementById('btn-check-call-text');
  const elBtnCheckCallSub = document.getElementById('btn-check-call-sub');
  const elBtnToggleRaise = document.getElementById('btn-toggle-raise');
  const elBtnActionAllIn = document.getElementById('btn-action-allin');

  // Raise Drawer
  const elRaiseDrawer = document.getElementById('raise-drawer');
  const elRaiseInputNumber = document.getElementById('raise-input-number');
  const elRaiseRangeSlider = document.getElementById('raise-range-slider');
  const elBtnRaiseMinus = document.getElementById('btn-raise-minus');
  const elBtnRaisePlus = document.getElementById('btn-raise-plus');
  const elBtnCancelRaise = document.getElementById('btn-cancel-raise');
  const elBtnConfirmRaise = document.getElementById('btn-confirm-raise');
  const elConfirmRaiseVal = document.getElementById('confirm-raise-val');

  // Host Floating Controls
  const elFabRebuy = document.getElementById('fab-rebuy');
  const elFabAward = document.getElementById('fab-award');
  const elFabNext = document.getElementById('fab-next');
  const elFabEndGame = document.getElementById('fab-end-game');

  // Summary View
  const elLeaderboardTbody = document.getElementById('leaderboard-tbody');
  const elBtnResumeGame = document.getElementById('btn-resume-game');
  const elBtnSummaryHome = document.getElementById('btn-summary-home');

  // Modals
  const elModalQr = document.getElementById('modal-qr');
  const elModalQrImage = document.getElementById('modal-qr-image');
  const elModalShareUrl = document.getElementById('modal-share-url');
  const elBtnModalCopyUrl = document.getElementById('btn-modal-copy-url');
  const elModalRoomCodeText = document.getElementById('modal-room-code-text');

  const elModalRebuy = document.getElementById('modal-rebuy');
  const elRebuyPlayerSelect = document.getElementById('rebuy-player-select');
  const elRebuyCustomAmt = document.getElementById('rebuy-custom-amt');
  const elBtnConfirmRebuy = document.getElementById('btn-confirm-rebuy');

  const elModalShowdown = document.getElementById('modal-showdown');
  const elShowdownPotsList = document.getElementById('showdown-pots-list');
  const elBtnConfirmAward = document.getElementById('btn-confirm-award');

  const elToastContainer = document.getElementById('toast-container');
  const elCelebrationOverlay = document.getElementById('celebration-overlay');
  const elWinnerCelebrationDesc = document.getElementById('winner-celebration-desc');
  const elCelebrationChipsStack = document.getElementById('celebration-chips-stack');
  const elBtnCloseCelebration = document.getElementById('btn-close-celebration');

  // Local state variables
  let timerInterval = null;
  let lastLoggedId = null;
  let previousPot = 0;
  let isRaiseDrawerOpen = false;

  // Prepopulate saved player name
  const savedName = localStorage.getItem('poker_player_name');
  if (savedName) {
    elInputPlayerName.value = savedName;
  }

  // Prepopulate room code if URL has ?room=1234
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam) {
    elInputRoomCode.value = roomParam;
    if (!savedName) {
      elInputPlayerName.focus();
    }
  }

  // Sound icon init
  updateSoundIcon();

  function updateSoundIcon() {
    elSoundIcon.textContent = audio.enabled ? '🔊' : '🔇';
  }

  elBtnSoundToggle.addEventListener('click', () => {
    const isNowOn = audio.toggle();
    updateSoundIcon();
    showToast(isNowOn ? 'Sound effects enabled' : 'Sound muted');
  });

  // Switch Active View
  function switchView(viewName) {
    Object.keys(views).forEach(key => {
      if (key === viewName) {
        views[key].classList.add('active');
        views[key].classList.remove('hidden');
      } else {
        views[key].classList.remove('active');
        views[key].classList.add('hidden');
      }
    });

    if (viewName === 'home') {
      elRoomCodeBadge.classList.add('hidden');
    } else {
      elRoomCodeBadge.classList.remove('hidden');
    }
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    elToastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Copy Link Helper
  function copyTextToClipboard(text, successMsg = 'Link copied!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg, 'success');
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast(successMsg, 'success');
  }

  // Fetch WiFi info on home view
  async function loadNetworkInfo(code = '') {
    const info = await client.fetchNetworkInfo(code);
    if (info) {
      elWifiAddressText.textContent = `WiFi URL: ${info.targetUrl || info.networkUrl}`;
      if (info.qrDataUrl) {
        elLobbyQrImg.src = info.qrDataUrl;
        elModalQrImage.src = info.qrDataUrl;
        elModalShareUrl.textContent = info.targetUrl || info.networkUrl;
      }
    }
  }
  loadNetworkInfo(roomParam);

  // --- HOME VIEW HANDLERS ---
  elBtnCreateGame.addEventListener('click', async () => {
    const name = elInputPlayerName.value.trim() || 'Player 1';
    localStorage.setItem('poker_player_name', name);

    const config = {
      startingChips: 1000,
      smallBlind: 10,
      bigBlind: 20,
      turnTimeLimit: 30
    };

    try {
      elBtnCreateGame.disabled = true;
      const res = await client.createGame(name, config);
      elBtnCreateGame.disabled = false;
      showToast(`Game created! Room: ${res.roomId}`, 'success');
      loadNetworkInfo(res.roomId);
    } catch (err) {
      elBtnCreateGame.disabled = false;
      showToast(err.message, 'error');
    }
  });

  elBtnJoinGame.addEventListener('click', async () => {
    const name = elInputPlayerName.value.trim() || 'Player';
    const room = elInputRoomCode.value.trim();

    if (!room) {
      showToast('Please enter a 4-digit room code', 'error');
      return;
    }

    localStorage.setItem('poker_player_name', name);

    try {
      elBtnJoinGame.disabled = true;
      await client.joinGame(room, name);
      elBtnJoinGame.disabled = false;
      loadNetworkInfo(room);
    } catch (err) {
      elBtnJoinGame.disabled = false;
      showToast(err.message, 'error');
    }
  });

  // --- LOBBY VIEW HANDLERS ---
  function updateHostSettings() {
    if (!client.currentState?.isHost) return;
    const config = {
      startingChips: Number(elCfgStartingChips.value),
      smallBlind: Number(elCfgSmallBlind.value),
      bigBlind: Number(elCfgBigBlind.value),
      turnTimeLimit: Number(elCfgTurnTimer.value)
    };
    client.updateConfig(config).catch(err => showToast(err.message, 'error'));
  }

  [elCfgStartingChips, elCfgSmallBlind, elCfgBigBlind, elCfgTurnTimer].forEach(el => {
    el.addEventListener('change', updateHostSettings);
  });

  elBtnStartGame.addEventListener('click', async () => {
    try {
      elBtnStartGame.disabled = true;
      await client.startGame();
    } catch (err) {
      elBtnStartGame.disabled = false;
      showToast(err.message, 'error');
    }
  });

  elBtnCopyLink.addEventListener('click', () => {
    const url = `${window.location.origin}?room=${client.roomId}`;
    copyTextToClipboard(url, 'Invite link copied to clipboard!');
  });

  elRoomCodeBadge.addEventListener('click', () => {
    if (client.roomId) {
      const url = `${window.location.origin}?room=${client.roomId}`;
      copyTextToClipboard(url, `Copied Room ${client.roomId} link!`);
    }
  });

  elLobbyQrClick.addEventListener('click', () => {
    openQrModal();
  });

  elBtnQrModal.addEventListener('click', () => {
    openQrModal();
  });

  function openQrModal() {
    elModalRoomCodeText.textContent = client.roomId || '----';
    elModalQr.classList.remove('hidden');
    loadNetworkInfo(client.roomId);
  }

  elBtnModalCopyUrl.addEventListener('click', () => {
    copyTextToClipboard(elModalShareUrl.textContent, 'WiFi URL copied!');
  });

  // --- ACTION BUTTONS & DOCK ---
  elBtnActionFold.addEventListener('click', async () => {
    try {
      audio.playFold();
      await client.sendAction('fold');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  elBtnActionCheckCall.addEventListener('click', async () => {
    try {
      const opts = client.currentState?.playerTurnOptions;
      if (!opts) return;

      if (opts.canCheck) {
        audio.playCheck();
        await client.sendAction('check');
      } else {
        audio.playChipSound();
        await client.sendAction('call');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  elBtnActionAllIn.addEventListener('click', async () => {
    try {
      audio.playAllIn();
      await client.sendAction('allin');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Raise Drawer Interactions
  elBtnToggleRaise.addEventListener('click', () => {
    isRaiseDrawerOpen = !isRaiseDrawerOpen;
    elRaiseDrawer.classList.toggle('hidden', !isRaiseDrawerOpen);
    if (isRaiseDrawerOpen) {
      syncRaiseInputs();
    }
  });

  elBtnCancelRaise.addEventListener('click', () => {
    isRaiseDrawerOpen = false;
    elRaiseDrawer.classList.add('hidden');
  });

  function syncRaiseInputs(newVal) {
    const opts = client.currentState?.playerTurnOptions;
    if (!opts) return;

    let val = newVal !== undefined ? newVal : Number(elRaiseInputNumber.value || opts.minRaiseTo);
    val = Math.max(opts.minRaiseTo, Math.min(opts.maxRaiseTo, val));

    elRaiseInputNumber.min = opts.minRaiseTo;
    elRaiseInputNumber.max = opts.maxRaiseTo;
    elRaiseRangeSlider.min = opts.minRaiseTo;
    elRaiseRangeSlider.max = opts.maxRaiseTo;

    elRaiseInputNumber.value = val;
    elRaiseRangeSlider.value = val;
    elConfirmRaiseVal.textContent = val;
  }

  elRaiseRangeSlider.addEventListener('input', (e) => {
    syncRaiseInputs(Number(e.target.value));
  });

  elRaiseInputNumber.addEventListener('input', (e) => {
    syncRaiseInputs(Number(e.target.value));
  });

  elBtnRaiseMinus.addEventListener('click', () => {
    const step = client.currentState?.config?.bigBlind || 10;
    syncRaiseInputs(Number(elRaiseInputNumber.value) - step);
  });

  elBtnRaisePlus.addEventListener('click', () => {
    const step = client.currentState?.config?.bigBlind || 10;
    syncRaiseInputs(Number(elRaiseInputNumber.value) + step);
  });

  // Preset Raise Buttons
  document.querySelectorAll('.preset-btn[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      const opts = client.currentState?.playerTurnOptions;
      const pot = client.currentState?.pot || 0;
      const bb = client.currentState?.config?.bigBlind || 20;
      if (!opts) return;

      let target = opts.minRaiseTo;
      if (preset === 'min') target = opts.minRaiseTo;
      else if (preset === '2x') target = opts.highestBet * 2;
      else if (preset === '3x') target = opts.highestBet * 3;
      else if (preset === 'half-pot') target = opts.highestBet + Math.floor(pot / 2);
      else if (preset === 'pot') target = opts.highestBet + pot;
      else if (preset === 'max') target = opts.maxRaiseTo;

      syncRaiseInputs(target);
    });
  });

  elBtnConfirmRaise.addEventListener('click', async () => {
    const amount = Number(elRaiseInputNumber.value);
    try {
      audio.playChipSound();
      await client.sendAction('raise', amount);
      isRaiseDrawerOpen = false;
      elRaiseDrawer.classList.add('hidden');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // --- HOST ACTION CONTROLS ---
  elBtnNextHand.addEventListener('click', () => dealNextHand());
  elFabNext.addEventListener('click', () => dealNextHand());

  function dealNextHand() {
    client.startNextHand().catch(err => showToast(err.message, 'error'));
  }

  elBtnShowdownAward.addEventListener('click', () => openShowdownModal());
  elFabAward.addEventListener('click', () => openShowdownModal());

  function openShowdownModal() {
    renderShowdownModal();
    elModalShowdown.classList.remove('hidden');
  }

  elFabRebuy.addEventListener('click', () => openRebuyModal());

  function openRebuyModal() {
    const state = client.currentState;
    if (!state) return;

    elRebuyPlayerSelect.innerHTML = '';
    state.players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.chips} chips)`;
      elRebuyPlayerSelect.appendChild(opt);
    });

    elModalRebuy.classList.remove('hidden');
  }

  document.querySelectorAll('.rebuy-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rebuy-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      elRebuyCustomAmt.value = btn.dataset.amt;
    });
  });

  elBtnConfirmRebuy.addEventListener('click', async () => {
    const targetPlayerId = elRebuyPlayerSelect.value;
    const amount = Number(elRebuyCustomAmt.value);
    try {
      await client.rebuy(targetPlayerId, amount);
      elModalRebuy.classList.add('hidden');
      showToast('Chips added successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  elFabEndGame.addEventListener('click', () => {
    if (confirm('Are you sure you want to end the game and view the final summary?')) {
      client.endGame().catch(err => showToast(err.message, 'error'));
    }
  });

  elBtnResumeGame.addEventListener('click', () => {
    client.resumeGame().catch(err => showToast(err.message, 'error'));
  });

  elBtnSummaryHome.addEventListener('click', () => {
    client.clearSession();
    switchView('home');
  });

  // Modal Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.close;
      document.getElementById(targetId)?.classList.add('hidden');
    });
  });

  elBtnCloseCelebration.addEventListener('click', () => {
    elCelebrationOverlay.classList.add('hidden');
  });

  // Game Log & Chat Drawer
  elBtnLogToggle.addEventListener('click', () => {
    elDrawerLog.classList.toggle('closed');
    elUnreadLogBadge.classList.add('hidden');
  });

  elBtnCloseLog.addEventListener('click', () => {
    elDrawerLog.classList.add('closed');
  });

  elChatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = elChatInput.value.trim();
    if (msg) {
      client.sendChat(msg);
      elChatInput.value = '';
    }
  });

  // --- STATE UPDATE LISTENER (HEART OF THE APP) ---
  client.onStateUpdate = (state) => {
    renderGameState(state);
  };

  client.onSummary = ({ leaderboard }) => {
    renderLeaderboard(leaderboard);
    switchView('summary');
  };

  client.onKicked = ({ message }) => {
    alert(message || 'You were kicked by the host.');
    switchView('home');
  };

  function renderGameState(state) {
    if (!state) return;

    // Header info
    elHeaderRoomCode.textContent = state.roomId;
    elLobbyRoomCode.textContent = state.roomId;

    // Show/hide host-only elements
    document.querySelectorAll('.host-only').forEach(el => {
      el.classList.toggle('hidden', !state.isHost);
    });
    document.querySelectorAll('.guest-only').forEach(el => {
      el.classList.toggle('hidden', state.isHost);
    });

    // Handle Stage routing
    if (state.stage === 'lobby') {
      switchView('lobby');
      renderLobby(state);
    } else if (state.stage === 'playing') {
      switchView('table');
      renderTable(state);
    } else if (state.stage === 'ended') {
      switchView('summary');
    }

    // Render Action Log
    renderActionLogs(state.actionLog);
  }

  // --- RENDER LOBBY ---
  function renderLobby(state) {
    elPlayerCount.textContent = state.players.length;

    // Lobby settings for guests
    elGuestRuleChips.textContent = state.config.startingChips;
    elGuestRuleBlinds.textContent = `${state.config.smallBlind} / ${state.config.bigBlind}`;
    elGuestRuleTimer.textContent = state.config.turnTimeLimit > 0 ? `${state.config.turnTimeLimit}s` : 'No limit';

    // Host inputs sync (if not actively focused)
    if (state.isHost && document.activeElement !== elCfgStartingChips) {
      elCfgStartingChips.value = state.config.startingChips;
      elCfgSmallBlind.value = state.config.smallBlind;
      elCfgBigBlind.value = state.config.bigBlind;
      elCfgTurnTimer.value = state.config.turnTimeLimit;
    }

    // Start button state
    elBtnStartGame.disabled = state.players.length < 2;

    // Render Player roster
    elLobbyPlayersList.innerHTML = '';
    state.players.forEach(p => {
      const item = document.createElement('div');
      item.className = 'player-roster-item';

      const initial = p.name ? p.name.charAt(0).toUpperCase() : '?';
      const isHost = p.id === state.hostId;

      item.innerHTML = `
        <div class="roster-player-info">
          <div class="roster-avatar">${initial}</div>
          <span class="roster-name">${escapeHtml(p.name)}</span>
          <div class="roster-badges">
            ${isHost ? '<span class="tag-host">👑 Host</span>' : ''}
            ${p.isYou ? '<span class="tag-you">You</span>' : ''}
          </div>
        </div>
        <div class="roster-actions">
          ${state.isHost && !isHost ? `<button class="btn-kick" data-kick="${p.id}">Kick</button>` : ''}
        </div>
      `;

      elLobbyPlayersList.appendChild(item);
    });

    // Attach kick handlers
    elLobbyPlayersList.querySelectorAll('[data-kick]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.kick;
        if (confirm('Kick this player from game?')) {
          client.kickPlayer(id).catch(err => showToast(err.message, 'error'));
        }
      });
    });
  }

  // --- RENDER BETTING TABLE ---
  function renderTable(state) {
    elStatusHandNum.textContent = `Hand #${state.handNumber}`;
    elStatusStreetBadge.textContent = state.street.replace('_', ' ').toUpperCase();

    // Pot display
    const currentPot = state.pot || 0;
    elTotalPotAmount.textContent = currentPot.toLocaleString();
    elCenterPotVal.textContent = currentPot.toLocaleString();

    // Chip stack animation & pot update
    if (currentPot !== previousPot) {
      elCenterPotChips.innerHTML = window.renderChipStack(currentPot);
      previousPot = currentPot;
    }

    // Side Pots Breakdown
    if (state.pots && state.pots.length > 1) {
      elSidePotsContainer.classList.remove('hidden');
      elSidePotsContainer.innerHTML = state.pots.map(pt => `
        <div class="side-pot-pill">
          ${pt.name}: <strong>🪙 ${pt.amount}</strong>
        </div>
      `).join('');
    } else {
      elSidePotsContainer.classList.add('hidden');
    }

    // Center Controls (Showdown / Next Hand)
    if (state.street === 'showdown') {
      elCenterHostActions.classList.remove('hidden');
      elBtnShowdownAward.classList.remove('hidden');
      elBtnNextHand.classList.add('hidden');
    } else if (state.street === 'hand_ended') {
      elCenterHostActions.classList.remove('hidden');
      elBtnShowdownAward.classList.add('hidden');
      elBtnNextHand.classList.remove('hidden');
    } else {
      elCenterHostActions.classList.add('hidden');
    }

    // Render Players around felt
    renderTablePlayers(state);

    // Turn Dock Controls
    renderTurnDock(state);

    // Winner celebration check
    if (state.lastHandResult && state.street === 'hand_ended') {
      checkWinnerCelebration(state.lastHandResult);
    }
  }

  // Render Seated Players along elliptical felt
  function renderTablePlayers(state) {
    elPokerPlayersLayer.innerHTML = '';
    const players = state.players || [];
    const count = players.length;
    if (count === 0) return;

    // Center "YOU" at bottom (angle = PI/2)
    let youIndex = players.findIndex(p => p.isYou);
    if (youIndex === -1) youIndex = 0;

    // Table ellipse parameters (relative percentage: 50% = center)
    // Horizontal radius = 38%, Vertical radius = 35%
    const rx = 38;
    const ry = 35;
    const cx = 50;
    const cy = 50;

    players.forEach((player, idx) => {
      // Re-order so "YOU" is at position 0 (bottom)
      const seatOffset = (idx - youIndex + count) % count;
      // Angle: 0 is bottom (PI/2), moving clockwise around the oval
      const angle = (Math.PI / 2) + (seatOffset * (2 * Math.PI / count));

      const posX = cx + rx * Math.cos(angle);
      const posY = cy + ry * Math.sin(angle);

      // Current bet chip position (nudged inward toward table center)
      const betRx = rx * 0.62;
      const betRy = ry * 0.62;
      const betX = cx + betRx * Math.cos(angle);
      const betY = cy + betRy * Math.sin(angle);

      // Create Player Card
      const card = document.createElement('div');
      card.id = `player-seat-${player.id}`;
      card.className = `seated-player ${player.isTurn ? 'is-turn' : ''} ${player.isFolded ? 'is-folded' : ''} ${player.isAllIn ? 'is-allin' : ''}`;
      card.style.left = `${posX}%`;
      card.style.top = `${posY}%`;

      const initial = player.name ? player.name.charAt(0).toUpperCase() : '?';

      // Role badge (D, SB, BB)
      let roleHtml = '';
      if (player.role === 'dealer' || player.isDealer) {
        roleHtml = `<div class="player-role-badge role-dealer" title="Dealer">D</div>`;
      } else if (player.role === 'sb') {
        roleHtml = `<div class="player-role-badge role-sb" title="Small Blind">SB</div>`;
      } else if (player.role === 'bb') {
        roleHtml = `<div class="player-role-badge role-bb" title="Big Blind">BB</div>`;
      }

      // Action pill
      let actionClass = 'act-check';
      if (player.lastAction) {
        const la = player.lastAction.toLowerCase();
        if (la.includes('fold')) actionClass = 'act-fold';
        else if (la.includes('call')) actionClass = 'act-call';
        else if (la.includes('raise')) actionClass = 'act-raise';
        else if (la.includes('all-in')) actionClass = 'act-allin';
      }

      card.innerHTML = `
        ${roleHtml}
        <div class="player-card-inner">
          <div class="player-name-row">
            <span class="player-name-text">${escapeHtml(player.name)}</span>
            ${player.isYou ? '<span class="tag-you-mini">YOU</span>' : ''}
          </div>
          <div class="player-chips-badge">
            <span>🪙</span>
            <span>${player.chips.toLocaleString()}</span>
          </div>
          ${player.lastAction ? `<div class="player-action-pill ${actionClass}">${player.lastAction}</div>` : ''}
        </div>
      `;

      elPokerPlayersLayer.appendChild(card);

      // If player has an active bet this street, render bet stack on felt
      if (player.currentBet > 0) {
        const betEl = document.createElement('div');
        betEl.className = 'player-bet-stack';
        betEl.style.left = `${betX}%`;
        betEl.style.top = `${betY}%`;
        betEl.style.transform = 'translate(-50%, -50%)';

        betEl.innerHTML = `
          ${window.renderChipStack(player.currentBet)}
          <div class="bet-badge">${player.currentBet}</div>
        `;
        elPokerPlayersLayer.appendChild(betEl);
      }
    });
  }

  // --- RENDER TURN CONTROLS & TIMER ---
  function renderTurnDock(state) {
    const isYourTurn = state.currentTurnPlayerId && state.players.some(p => p.id === state.currentTurnPlayerId && p.isYou);
    const turnPlayer = state.players.find(p => p.id === state.currentTurnPlayerId);

    // Manage 30-Second Turn Timer
    clearInterval(timerInterval);

    if (state.turnExpiresAt && state.currentTurnPlayerId) {
      elTurnTimerBar.parentElement.classList.remove('hidden');

      const updateTimer = () => {
        const remainingMs = Math.max(0, state.turnExpiresAt - Date.now());
        const seconds = Math.ceil(remainingMs / 1000);
        const totalDuration = (state.turnTimeLimit || 30) * 1000;
        const pct = Math.max(0, Math.min(100, (remainingMs / totalDuration) * 100));

        elTurnTimerBar.style.width = `${pct}%`;
        elTimerSecondsLeft.textContent = `${seconds}s`;
        elTimerPlayerName.textContent = isYourTurn ? 'Your Turn to Act!' : `${turnPlayer?.name || 'Player'}'s turn`;

        if (seconds <= 5 && seconds > 0) {
          audio.playTimerTick();
        }
      };

      updateTimer();
      timerInterval = setInterval(updateTimer, 200);
    } else {
      elTurnTimerBar.parentElement.classList.add('hidden');
    }

    // Toggle Action Controls vs Waiting Message
    if (isYourTurn && state.playerTurnOptions) {
      elTurnControls.classList.remove('hidden');
      elWaitingDock.classList.add('hidden');

      const opts = state.playerTurnOptions;

      // Check / Call button config
      if (opts.canCheck) {
        elBtnCheckCallText.textContent = 'CHECK';
        elBtnCheckCallSub.textContent = 'FREE';
      } else {
        elBtnCheckCallText.textContent = opts.isCallAllIn ? `CALL ALL-IN (${opts.callAmount})` : `CALL ${opts.callAmount}`;
        elBtnCheckCallSub.textContent = opts.isCallAllIn ? 'ALL CHIPS' : 'MATCH BET';
      }

      // Raise button config
      elBtnToggleRaise.disabled = !opts.canRaise;
      elBtnToggleRaise.style.opacity = opts.canRaise ? '1' : '0.5';

      syncRaiseInputs();
    } else {
      elTurnControls.classList.add('hidden');
      elWaitingDock.classList.remove('hidden');
      if (turnPlayer) {
        elWaitingStatusText.textContent = `Waiting for ${turnPlayer.name} to act...`;
      } else if (state.street === 'showdown') {
        elWaitingStatusText.textContent = 'Showdown! Host will award the pot(s).';
      } else if (state.street === 'hand_ended') {
        elWaitingStatusText.textContent = 'Hand complete. Ready for next hand.';
      } else {
        elWaitingStatusText.textContent = 'Waiting for hand to start...';
      }
    }
  }

  // --- RENDER SHOWDOWN WINNER SELECTION MODAL ---
  function renderShowdownModal() {
    const state = client.currentState;
    if (!state) return;

    elShowdownPotsList.innerHTML = '';
    const pots = state.pots && state.pots.length > 0 ? state.pots : [{ id: 'main', name: 'Main Pot', amount: state.pot, eligiblePlayerIds: state.players.filter(p => !p.isFolded).map(p => p.id) }];

    pots.forEach((pot, pIdx) => {
      const potCard = document.createElement('div');
      potCard.className = 'pot-award-card';

      const eligiblePlayers = state.players.filter(p => pot.eligiblePlayerIds.includes(p.id));

      potCard.innerHTML = `
        <div class="pot-award-header">
          <span>${pot.name}</span>
          <span>🪙 ${pot.amount} chips</span>
        </div>
        <div class="pot-eligible-players">
          ${eligiblePlayers.map(p => `
            <label class="award-player-option">
              <span><strong>${escapeHtml(p.name)}</strong></span>
              <input type="checkbox" name="pot-winner-${pot.id}" value="${p.id}" ${eligiblePlayers.length === 1 ? 'checked' : ''}>
            </label>
          `).join('')}
        </div>
      `;

      elShowdownPotsList.appendChild(potCard);
    });
  }

  elBtnConfirmAward.addEventListener('click', async () => {
    const state = client.currentState;
    if (!state) return;

    const allocations = [];
    const pots = state.pots && state.pots.length > 0 ? state.pots : [{ id: 'main', name: 'Main Pot', amount: state.pot }];

    for (const pot of pots) {
      const checked = Array.from(document.querySelectorAll(`input[name="pot-winner-${pot.id}"]:checked`)).map(cb => cb.value);
      if (checked.length === 0) {
        showToast(`Please select at least one winner for ${pot.name}`, 'error');
        return;
      }
      allocations.push({
        potId: pot.id,
        winnerIds: checked
      });
    }

    try {
      audio.playWinFanfare();
      await client.awardPots({ pots: allocations });
      elModalShowdown.classList.add('hidden');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // --- WINNER CELEBRATION MODAL ---
  let lastCelebratedHand = -1;
  function checkWinnerCelebration(result) {
    const handNum = client.currentState?.handNumber;
    if (handNum === lastCelebratedHand) return;
    lastCelebratedHand = handNum;

    audio.playWinFanfare();
    elWinnerCelebrationDesc.textContent = result.message || 'Pot awarded!';

    const totalChips = result.winners?.reduce((sum, w) => sum + w.amount, 0) || 500;
    elCelebrationChipsStack.innerHTML = window.renderChipStack(totalChips);

    elCelebrationOverlay.classList.remove('hidden');
  }

  // --- END OF NIGHT SUMMARY LEADERBOARD ---
  function renderLeaderboard(leaderboard) {
    elLeaderboardTbody.innerHTML = '';
    if (!Array.isArray(leaderboard)) return;

    const medals = ['🥇', '🥈', '🥉'];

    leaderboard.forEach((row, idx) => {
      const tr = document.createElement('tr');
      const rankBadge = medals[idx] || `#${idx + 1}`;
      const isPositive = row.profitLoss >= 0;
      const profitClass = isPositive ? 'profit-pos' : 'profit-neg';

      tr.innerHTML = `
        <td><strong>${rankBadge}</strong></td>
        <td><strong>${escapeHtml(row.name)}</strong></td>
        <td>🪙 ${row.chips.toLocaleString()}</td>
        <td>${row.totalBuyIn.toLocaleString()} ${row.totalRebuys > 0 ? `(+${row.totalRebuys})` : ''}</td>
        <td class="${profitClass}">${row.profitFormatted}</td>
      `;

      elLeaderboardTbody.appendChild(tr);
    });
  }

  // --- ACTION LOG RENDERING ---
  function renderActionLogs(logs) {
    if (!Array.isArray(logs) || logs.length === 0) return;

    const latest = logs[logs.length - 1];
    if (latest && latest.id !== lastLoggedId) {
      lastLoggedId = latest.id;
      // Show unread indicator if drawer is closed
      if (elDrawerLog.classList.contains('closed')) {
        elUnreadLogBadge.classList.remove('hidden');
      }

      // Show table action banner for significant actions
      if (['action', 'win'].includes(latest.type)) {
        elBannerText.textContent = latest.text;
        elTableActionBanner.classList.remove('hidden');
        setTimeout(() => {
          elTableActionBanner.classList.add('hidden');
        }, 4000);
      }
    }

    elGameLogMessages.innerHTML = '';
    logs.forEach(item => {
      const div = document.createElement('div');
      div.className = `log-entry log-${item.type}`;
      div.textContent = item.text;
      elGameLogMessages.appendChild(div);
    });

    elGameLogMessages.scrollTop = elGameLogMessages.scrollHeight;
  }

  // Helper: Escape HTML to avoid XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  // Initialize socket client
  client.init();
});
