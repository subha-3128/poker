// ==========================================================================
// POKER NIGHT - HIGH-STAKES CASINO FRONTEND CONTROLLER
// UI/UX Pro Max Engine
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const client = window.pokerClient;
  const audio = window.pokerAudio;

  // DOM Elements - Header
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
  const elScreenFlashOverlay = document.getElementById('screen-flash-overlay');

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

  // Host Floating Actions
  const elFabRebuy = document.getElementById('fab-rebuy');
  const elFabAward = document.getElementById('fab-award');
  const elFabNext = document.getElementById('fab-next');
  const elFabEndGame = document.getElementById('fab-end-game');

  // Summary Elements
  const elSummaryCardsList = document.getElementById('summary-cards-list');
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
  const elConfettiContainer = document.getElementById('confetti-container');
  const elWinnerCelebrationDesc = document.getElementById('winner-celebration-desc');
  const elCelebrationChipsStack = document.getElementById('celebration-chips-stack');
  const elBtnCloseCelebration = document.getElementById('btn-close-celebration');

  // Local State
  let timerInterval = null;
  let lastLoggedId = null;
  let previousPot = 0;
  let isRaiseDrawerOpen = false;
  let lastWinnerResult = null;
  let wakeLockSentinel = null;

  // Vibrant Casino Avatar Gradients
  const AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #3B82F6, #1D4ED8)', // Sapphire
    'linear-gradient(135deg, #10B981, #047857)', // Emerald
    'linear-gradient(135deg, #F59E0B, #B45309)', // Amber
    'linear-gradient(135deg, #EC4899, #BE185D)', // Ruby
    'linear-gradient(135deg, #8B5CF6, #6D28D9)', // Amethyst
    'linear-gradient(135deg, #06B6D4, #0E7490)', // Diamond
    'linear-gradient(135deg, #F97316, #C2410C)', // Topaz
    'linear-gradient(135deg, #64748B, #334155)'  // Onyx
  ];

  function getAvatarGradient(id) {
    if (!id) return AVATAR_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[idx];
  }

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
    if (!savedName) elInputPlayerName.focus();
  }

  // Sound Icon Init
  updateSoundIcon();
  function updateSoundIcon() {
    elSoundIcon.textContent = audio.enabled ? '🔊' : '🔇';
  }

  elBtnSoundToggle.addEventListener('click', () => {
    const isNowOn = audio.toggle();
    updateSoundIcon();
    showToast(isNowOn ? 'Sound enabled' : 'Sound muted');
  });

  // Screen Wake Lock API
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator && !wakeLockSentinel) {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinel.addEventListener('release', () => {
          wakeLockSentinel = null;
        });
      }
    } catch (e) {}
  }

  function releaseWakeLock() {
    if (wakeLockSentinel) {
      wakeLockSentinel.release().catch(() => {});
      wakeLockSentinel = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && client.currentState && ['lobby', 'playing'].includes(client.currentState.stage)) {
      requestWakeLock();
    }
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
      releaseWakeLock();
    } else {
      elRoomCodeBadge.classList.remove('hidden');
      if (['lobby', 'table'].includes(viewName)) {
        requestWakeLock();
      }
    }
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-pill toast-${type}`;
    toast.textContent = message;
    elToastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  // Copy Link Helper
  function copyTextToClipboard(text, successMsg = 'Link copied to clipboard!') {
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
      elWifiAddressText.textContent = `WiFi: ${info.targetUrl || info.networkUrl}`;
      if (info.qrDataUrl) {
        elLobbyQrImg.src = info.qrDataUrl;
        elModalQrImage.src = info.qrDataUrl;
        elModalShareUrl.textContent = info.targetUrl || info.networkUrl;
      }
    }
  }
  loadNetworkInfo(roomParam);

  // All-In Screen Flash Micro-Interaction
  function triggerScreenFlash() {
    elScreenFlashOverlay.classList.remove('flash-active');
    void elScreenFlashOverlay.offsetWidth; // Force reflow
    elScreenFlashOverlay.classList.add('flash-active');
  }

  // Animated Number Roll Counter
  function animateNumber(element, start, end, duration = 400) {
    if (!element || start === end) return;
    const startTime = performance.now();
    const diff = end - start;

    function step(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + diff * ease);
      element.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = end.toLocaleString();
      }
    }
    requestAnimationFrame(step);
  }

  // --- HOME VIEW HANDLERS ---
  elBtnCreateGame.addEventListener('click', async () => {
    const name = elInputPlayerName.value.trim() || 'Host';
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
      showToast(`Table created! Room: ${res.roomId}`, 'success');
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
      showToast('Enter 4-digit table code', 'error');
      elInputRoomCode.focus();
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
    copyTextToClipboard(url, 'Table invite link copied!');
  });

  elRoomCodeBadge.addEventListener('click', () => {
    if (client.roomId) {
      const url = `${window.location.origin}?room=${client.roomId}`;
      copyTextToClipboard(url, `Copied Table ${client.roomId} link!`);
    }
  });

  elLobbyQrClick.addEventListener('click', () => openQrModal());
  elBtnQrModal.addEventListener('click', () => openQrModal());

  function openQrModal() {
    elModalRoomCodeText.textContent = client.roomId || '----';
    elModalQr.classList.remove('hidden');
    loadNetworkInfo(client.roomId);
  }

  elBtnModalCopyUrl.addEventListener('click', () => {
    copyTextToClipboard(elModalShareUrl.textContent, 'WiFi URL copied!');
  });

  // --- ACTION CONTROLS ---
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
      triggerScreenFlash();
      audio.playAllIn();
      await client.sendAction('allin');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Raise Drawer Toggle & Slider
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
    elConfirmRaiseVal.textContent = val.toLocaleString();
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
  document.querySelectorAll('.preset-pill[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      const opts = client.currentState?.playerTurnOptions;
      const pot = client.currentState?.pot || 0;
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

  // --- HOST CONTROLS ---
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
      opt.textContent = `${p.name} (${p.chips.toLocaleString()} chips)`;
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
    if (confirm('Conclude the game and generate final night ledger?')) {
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

  // Modal Closures
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.close;
      document.getElementById(targetId)?.classList.add('hidden');
    });
  });

  elBtnCloseCelebration.addEventListener('click', () => {
    elCelebrationOverlay.classList.add('hidden');
  });

  // Game Log Drawer
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

  // --- STATE LISTENER ---
  client.onStateUpdate = (state) => {
    renderGameState(state);
  };

  client.onSummary = ({ leaderboard }) => {
    renderLeaderboard(leaderboard);
    switchView('summary');
  };

  client.onKicked = ({ message }) => {
    alert(message || 'You were kicked from the table.');
    switchView('home');
  };

  function renderGameState(state) {
    if (!state) return;

    elHeaderRoomCode.textContent = state.roomId;
    elLobbyRoomCode.textContent = state.roomId;

    // Show/hide host-only items
    document.querySelectorAll('.host-only').forEach(el => {
      el.classList.toggle('hidden', !state.isHost);
    });
    document.querySelectorAll('.guest-only').forEach(el => {
      el.classList.toggle('hidden', state.isHost);
    });

    if (state.stage === 'lobby') {
      switchView('lobby');
      renderLobby(state);
    } else if (state.stage === 'playing') {
      switchView('table');
      renderTable(state);
    } else if (state.stage === 'ended') {
      switchView('summary');
    }

    renderActionLogs(state.actionLog);
  }

  // --- RENDER LOBBY ---
  function renderLobby(state) {
    elPlayerCount.textContent = state.players.length;

    elGuestRuleChips.textContent = state.config.startingChips.toLocaleString();
    elGuestRuleBlinds.textContent = `${state.config.smallBlind} / ${state.config.bigBlind}`;
    elGuestRuleTimer.textContent = state.config.turnTimeLimit > 0 ? `${state.config.turnTimeLimit}s` : 'Untimed';

    if (state.isHost && document.activeElement !== elCfgStartingChips) {
      elCfgStartingChips.value = state.config.startingChips;
      elCfgSmallBlind.value = state.config.smallBlind;
      elCfgBigBlind.value = state.config.bigBlind;
      elCfgTurnTimer.value = state.config.turnTimeLimit;
    }

    elBtnStartGame.disabled = state.players.length < 2;

    elLobbyPlayersList.innerHTML = '';
    state.players.forEach(p => {
      const item = document.createElement('div');
      item.className = 'player-roster-item';

      const initial = p.name ? p.name.charAt(0).toUpperCase() : '?';
      const isHost = p.id === state.hostId;
      const grad = getAvatarGradient(p.id);

      item.innerHTML = `
        <div class="roster-left">
          <div class="user-avatar-circle" style="background: ${grad}">${initial}</div>
          <div>
            <span class="roster-name">${escapeHtml(p.name)}</span>
            ${isHost ? '<span class="tag-host">👑 Host</span>' : ''}
            ${p.isYou ? '<span class="tag-you">(You)</span>' : ''}
          </div>
        </div>
        <div class="roster-right">
          ${state.isHost && !isHost ? `<button class="btn-kick" data-kick="${p.id}">Kick</button>` : ''}
        </div>
      `;

      elLobbyPlayersList.appendChild(item);
    });

    elLobbyPlayersList.querySelectorAll('[data-kick]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.kick;
        if (confirm('Kick player from table?')) {
          client.kickPlayer(id).catch(err => showToast(err.message, 'error'));
        }
      });
    });
  }

  // --- RENDER POKER TABLE ---
  function renderTable(state) {
    elStatusHandNum.textContent = `Hand #${state.handNumber}`;
    elStatusStreetBadge.textContent = state.street.replace('_', ' ').toUpperCase();

    // Pot Counter Animation
    const currentPot = state.pot || 0;
    if (currentPot !== previousPot) {
      animateNumber(elTotalPotAmount, previousPot, currentPot);
      animateNumber(elCenterPotVal, previousPot, currentPot);
      elCenterPotChips.innerHTML = window.renderChipStack(currentPot);
      previousPot = currentPot;
    }

    // Side Pots
    if (state.pots && state.pots.length > 1) {
      elSidePotsContainer.classList.remove('hidden');
      elSidePotsContainer.innerHTML = state.pots.map(pt => `
        <div class="side-pot-badge">
          ${pt.name}: <strong>🪙 ${pt.amount.toLocaleString()}</strong>
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

    renderTablePlayers(state);
    renderTurnDock(state);

    if (state.lastHandResult && state.street === 'hand_ended') {
      checkWinnerCelebration(state.lastHandResult);
    }
  }

  // Render Seated Players Around the Oval Table with SVG Circular Timer Ring
  function renderTablePlayers(state) {
    elPokerPlayersLayer.innerHTML = '';
    const players = state.players || [];
    const count = players.length;
    if (count === 0) return;

    let youIndex = players.findIndex(p => p.isYou);
    if (youIndex === -1) youIndex = 0;

    const rx = 38;
    const ry = 35;
    const cx = 50;
    const cy = 50;

    // SVG Timer Circumference for r=26: 2 * PI * 26 ≈ 163.36
    const CIRCUMFERENCE = 163.36;

    players.forEach((player, idx) => {
      const seatOffset = (idx - youIndex + count) % count;
      const angle = (Math.PI / 2) + (seatOffset * (2 * Math.PI / count));

      const posX = cx + rx * Math.cos(angle);
      const posY = cy + ry * Math.sin(angle);

      const betRx = rx * 0.62;
      const betRy = ry * 0.62;
      const betX = cx + betRx * Math.cos(angle);
      const betY = cy + betRy * Math.sin(angle);

      const card = document.createElement('div');
      card.id = `player-seat-${player.id}`;
      card.className = `seated-player ${player.isTurn ? 'is-turn' : ''} ${player.isFolded ? 'is-folded' : ''}`;
      card.style.left = `${posX}%`;
      card.style.top = `${posY}%`;

      const initial = player.name ? player.name.charAt(0).toUpperCase() : '?';
      const grad = getAvatarGradient(player.id);

      // Role Chip Badge (D, SB, BB)
      let roleHtml = '';
      if (player.role === 'dealer' || player.isDealer) {
        roleHtml = `<div class="role-chip-badge badge-dealer" title="Dealer">D</div>`;
      } else if (player.role === 'sb') {
        roleHtml = `<div class="role-chip-badge badge-sb" title="Small Blind">SB</div>`;
      } else if (player.role === 'bb') {
        roleHtml = `<div class="role-chip-badge badge-bb" title="Big Blind">BB</div>`;
      }

      // Action pill styling
      let actionClass = 'action-check';
      if (player.lastAction) {
        const la = player.lastAction.toLowerCase();
        if (la.includes('fold')) actionClass = 'action-fold';
        else if (la.includes('call')) actionClass = 'action-call';
        else if (la.includes('raise')) actionClass = 'action-raise';
        else if (la.includes('all-in')) actionClass = 'action-allin';
      }

      card.innerHTML = `
        <div class="avatar-wrapper">
          <!-- Circular SVG Countdown Ring -->
          <svg class="timer-ring-svg" viewBox="0 0 60 60">
            <circle class="timer-ring-bg" cx="30" cy="30" r="26" fill="transparent" stroke-width="3" />
            <circle id="timer-ring-progress-${player.id}" class="timer-ring-progress" cx="30" cy="30" r="26" fill="transparent" stroke-width="3"
              stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${player.isTurn ? 0 : CIRCUMFERENCE}" />
          </svg>

          <div class="player-avatar-circle" style="background: ${grad}">${initial}</div>
          ${roleHtml}
        </div>

        <div class="player-meta-box">
          <div class="player-name-line">
            <span>${escapeHtml(player.name)}</span>
            ${player.isYou ? '<span class="you-tag">(YOU)</span>' : ''}
          </div>
          <div class="player-chip-counter">
            <span>🪙</span>
            <span>${player.chips.toLocaleString()}</span>
          </div>
          ${player.lastAction ? `<div class="player-last-action ${actionClass}">${player.lastAction}</div>` : ''}
        </div>
      `;

      elPokerPlayersLayer.appendChild(card);

      // Render Active Bet on Table Felt
      if (player.currentBet > 0) {
        const betEl = document.createElement('div');
        betEl.className = 'player-bet-stack';
        betEl.style.left = `${betX}%`;
        betEl.style.top = `${betY}%`;
        betEl.style.transform = 'translate(-50%, -50%)';

        betEl.innerHTML = `
          ${window.renderChipStack(player.currentBet)}
          <div class="bet-badge-pill">${player.currentBet.toLocaleString()}</div>
        `;
        elPokerPlayersLayer.appendChild(betEl);
      }
    });
  }

  // --- RENDER TURN CONTROLS & SVG CIRCULAR TIMER RING ---
  function renderTurnDock(state) {
    const isYourTurn = state.currentTurnPlayerId && state.players.some(p => p.id === state.currentTurnPlayerId && p.isYou);
    const turnPlayer = state.players.find(p => p.id === state.currentTurnPlayerId);

    clearInterval(timerInterval);

    const CIRCUMFERENCE = 163.36;

    if (state.turnExpiresAt && state.currentTurnPlayerId) {
      elTurnTimerBar.parentElement.classList.remove('hidden');

      const updateTimer = () => {
        const remainingMs = Math.max(0, state.turnExpiresAt - Date.now());
        const seconds = Math.ceil(remainingMs / 1000);
        const totalDuration = (state.turnTimeLimit || 30) * 1000;
        const pct = Math.max(0, Math.min(100, (remainingMs / totalDuration) * 100));

        // Update bottom timer bar
        elTurnTimerBar.style.width = `${pct}%`;
        elTimerSecondsLeft.textContent = `${seconds}s`;
        elTimerPlayerName.textContent = isYourTurn ? 'Your Turn to Act!' : `${turnPlayer?.name || 'Player'}'s turn`;

        // Update active player's circular SVG timer ring
        const ringCircle = document.getElementById(`timer-ring-progress-${state.currentTurnPlayerId}`);
        const seatCard = document.getElementById(`player-seat-${state.currentTurnPlayerId}`);

        if (ringCircle) {
          const offset = CIRCUMFERENCE * (1 - pct / 100);
          ringCircle.style.strokeDashoffset = offset;

          // Color Transition: Gold -> Orange -> Crimson
          if (seconds > 15) {
            ringCircle.style.stroke = '#FFD700';
            seatCard?.classList.remove('urgent-turn-pulse');
          } else if (seconds > 5) {
            ringCircle.style.stroke = '#FF8800';
            seatCard?.classList.remove('urgent-turn-pulse');
          } else {
            ringCircle.style.stroke = '#FF4444';
            seatCard?.classList.add('urgent-turn-pulse');
            audio.playTimerTick();
          }
        }
      };

      updateTimer();
      timerInterval = setInterval(updateTimer, 150);
    } else {
      elTurnTimerBar.parentElement.classList.add('hidden');
    }

    // Toggle Action Dock
    if (isYourTurn && state.playerTurnOptions) {
      elTurnControls.classList.remove('hidden');
      elWaitingDock.classList.add('hidden');

      const opts = state.playerTurnOptions;

      if (opts.canCheck) {
        elBtnCheckCallText.textContent = 'CHECK';
        elBtnCheckCallSub.textContent = 'FREE';
      } else {
        elBtnCheckCallText.textContent = opts.isCallAllIn ? `ALL-IN (${opts.callAmount.toLocaleString()})` : `CALL ${opts.callAmount.toLocaleString()}`;
        elBtnCheckCallSub.textContent = opts.isCallAllIn ? 'ALL CHIPS' : 'MATCH BET';
      }

      elBtnToggleRaise.disabled = !opts.canRaise;
      elBtnToggleRaise.style.opacity = opts.canRaise ? '1' : '0.4';

      syncRaiseInputs();
    } else {
      elTurnControls.classList.add('hidden');
      elWaitingDock.classList.remove('hidden');
      if (turnPlayer) {
        elWaitingStatusText.textContent = `Waiting for ${turnPlayer.name} to act...`;
      } else if (state.street === 'showdown') {
        elWaitingStatusText.textContent = 'Showdown! Host is awarding the pot...';
      } else if (state.street === 'hand_ended') {
        elWaitingStatusText.textContent = 'Hand complete. Dealing next hand...';
      } else {
        elWaitingStatusText.textContent = 'Waiting for hand to start...';
      }
    }
  }

  // --- RENDER SHOWDOWN MODAL ---
  function renderShowdownModal() {
    const state = client.currentState;
    if (!state) return;

    elShowdownPotsList.innerHTML = '';
    const pots = state.pots && state.pots.length > 0 ? state.pots : [{ id: 'main', name: 'Main Pot', amount: state.pot, eligiblePlayerIds: state.players.filter(p => !p.isFolded).map(p => p.id) }];

    pots.forEach((pot) => {
      const card = document.createElement('div');
      card.className = 'pot-select-card';

      const eligiblePlayers = state.players.filter(p => pot.eligiblePlayerIds.includes(p.id));

      card.innerHTML = `
        <div class="pot-select-header">
          <span>${pot.name}</span>
          <span>🪙 ${pot.amount.toLocaleString()}</span>
        </div>
        <div class="pot-player-options">
          ${eligiblePlayers.map(p => `
            <label class="pot-player-label">
              <span><strong>${escapeHtml(p.name)}</strong></span>
              <input type="checkbox" name="pot-winner-${pot.id}" value="${p.id}" ${eligiblePlayers.length === 1 ? 'checked' : ''}>
            </label>
          `).join('')}
        </div>
      `;

      elShowdownPotsList.appendChild(card);
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
        showToast(`Select at least one winner for ${pot.name}`, 'error');
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

  // --- FULLSCREEN WINNER ANNOUNCEMENT & CONFETTI ---
  function spawnConfetti() {
    elConfettiContainer.innerHTML = '';
    const colors = ['#FFD700', '#00C851', '#FF4444', '#FFFFFF', '#FFE55C'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 160}px`);
      piece.style.setProperty('--rot', `${Math.random() * 720}deg`);
      piece.style.animationDelay = `${Math.random() * 1.5}s`;
      piece.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
      elConfettiContainer.appendChild(piece);
    }
  }

  function checkWinnerCelebration(result) {
    const handNum = client.currentState?.handNumber;
    if (handNum === lastWinnerResult) return;
    lastWinnerResult = handNum;

    audio.playWinFanfare();
    elWinnerCelebrationDesc.textContent = result.message || 'Pot awarded to winner!';

    const totalChips = result.winners?.reduce((sum, w) => sum + w.amount, 0) || 500;
    elCelebrationChipsStack.innerHTML = window.renderChipStack(totalChips);

    spawnConfetti();
    elCelebrationOverlay.classList.remove('hidden');
  }

  // --- END OF NIGHT SUMMARY LEDGER ---
  function renderLeaderboard(leaderboard) {
    elSummaryCardsList.innerHTML = '';
    if (!Array.isArray(leaderboard)) return;

    const medals = ['🥇', '🥈', '🥉'];

    leaderboard.forEach((row, idx) => {
      const card = document.createElement('div');
      card.className = `summary-row-card ${idx === 0 ? 'rank-1' : ''}`;

      const medal = medals[idx] || `#${idx + 1}`;
      const isPos = row.profitLoss >= 0;
      const profitClass = isPos ? 'profit-green' : 'loss-red';

      card.innerHTML = `
        <div class="summary-left">
          <span class="rank-badge-icon">${medal}</span>
          <div>
            <div class="player-final-name">${escapeHtml(row.name)}</div>
            <div class="player-buyin-sub">Buy-in: 🪙 ${row.totalBuyIn.toLocaleString()} ${row.totalRebuys > 0 ? `(+${row.totalRebuys.toLocaleString()})` : ''}</div>
          </div>
        </div>
        <div class="summary-right">
          <div class="final-chips-val">🪙 ${row.chips.toLocaleString()}</div>
          <div class="${profitClass}">${row.profitFormatted}</div>
        </div>
      `;

      elSummaryCardsList.appendChild(card);
    });
  }

  // --- ACTION LOG DRAWER ---
  function renderActionLogs(logs) {
    if (!Array.isArray(logs) || logs.length === 0) return;

    const latest = logs[logs.length - 1];
    if (latest && latest.id !== lastLoggedId) {
      lastLoggedId = latest.id;

      if (elDrawerLog.classList.contains('closed')) {
        elUnreadLogBadge.classList.remove('hidden');
      }

      if (['action', 'win'].includes(latest.type)) {
        elBannerText.textContent = latest.text;
        elTableActionBanner.classList.remove('hidden');
        setTimeout(() => {
          elTableActionBanner.classList.add('hidden');
        }, 3500);
      }
    }

    elGameLogMessages.innerHTML = '';
    logs.forEach(item => {
      const div = document.createElement('div');
      let typeClass = 'log-system';
      const text = item.text.toLowerCase();

      if (text.includes('raised') || text.includes('all-in')) typeClass = 'log-action-raise';
      else if (text.includes('folded')) typeClass = 'log-action-fold';
      else if (text.includes('called') || text.includes('checked')) typeClass = 'log-action-call';
      else if (text.includes('won') || item.type === 'win') typeClass = 'log-action-win';
      else if (item.type === 'chat') typeClass = 'log-chat';

      div.className = `log-entry ${typeClass}`;
      div.textContent = item.text;
      elGameLogMessages.appendChild(div);
    });

    elGameLogMessages.scrollTop = elGameLogMessages.scrollHeight;
  }

  // HTML XSS Escaper
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
