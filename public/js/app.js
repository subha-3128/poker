// ==========================================================================
// POKER NIGHT - HIGH-STAKES LUXURY CASINO PWA CONTROLLER
// UI/UX Pro Max Engine
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const client = window.pokerClient;
  const audio = window.pokerAudio;

  // --- PWA SERVICE WORKER & SPLASH SCREEN ---
  const elPwaSplash = document.getElementById('pwa-splash');
  const elPwaInstallBanner = document.getElementById('pwa-install-banner');
  const elBtnPwaInstall = document.getElementById('btn-pwa-install');
  const elBtnPwaDismiss = document.getElementById('btn-pwa-dismiss');
  let deferredInstallPrompt = null;

  // Dismiss splash after brief luxury intro
  setTimeout(() => {
    elPwaSplash?.classList.add('splash-faded');
  }, 450);

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then((reg) => {
        console.log('[PWA] ServiceWorker registered:', reg.scope);
      }).catch((err) => {
        console.warn('[PWA] ServiceWorker registration failed:', err);
      });
    });
  }

  // Handle PWA Install Prompt
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (!isStandalone && !sessionStorage.getItem('pwa_dismissed')) {
      elPwaInstallBanner?.classList.remove('hidden');
    }
  });

  elBtnPwaInstall?.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log('[PWA] Install prompt outcome:', outcome);
      deferredInstallPrompt = null;
      elPwaInstallBanner?.classList.add('hidden');
    }
  });

  elBtnPwaDismiss?.addEventListener('click', () => {
    elPwaInstallBanner?.classList.add('hidden');
    sessionStorage.setItem('pwa_dismissed', 'true');
  });

  // DOM Elements - Header
  const elHeaderRoomCode = document.getElementById('header-room-code');
  const elRoomCodeBadge = document.getElementById('room-code-badge');
  const elBtnLeaveTable = document.getElementById('btn-leave-table');
  const elBtnQrModal = document.getElementById('btn-qr-modal');
  const elBtnSoundToggle = document.getElementById('btn-sound-toggle');
  const elSoundIconSvg = document.getElementById('sound-icon-svg');
  const elBtnLogToggle = document.getElementById('btn-log-toggle');
  const elUnreadLogBadge = document.getElementById('unread-log-badge');
  const elDrawerLog = document.getElementById('drawer-log');
  const elBottomSheetBackdrop = document.getElementById('bottom-sheet-backdrop');
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
  const elLobbyGuestSettings = document.getElementById('lobby-guest-settings');
  const elGuestRuleChips = document.getElementById('guest-rule-chips');
  const elGuestRuleBlinds = document.getElementById('guest-rule-blinds');
  const elPlayerCount = document.getElementById('player-count');
  const elLobbyPlayersList = document.getElementById('lobby-players-list');
  const elBtnStartGame = document.getElementById('btn-start-game');
  const elBtnLobbyLeave = document.getElementById('btn-lobby-leave');

  // Table Screen Elements
  const elStatusHandNum = document.getElementById('status-hand-num');
  const elStatusStreetBadge = document.getElementById('status-street-badge');
  const elBtnHeaderDeclareWinner = document.getElementById('btn-header-declare-winner');
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

  // Turn Controls Dock (Fixed 180px Mobile Panel)
  const elTurnControls = document.getElementById('turn-controls');
  const elDockHostPanel = document.getElementById('dock-host-panel');
  const elBtnDockDeclareWinner = document.getElementById('btn-dock-declare-winner');
  const elBtnDockNextHand = document.getElementById('btn-dock-next-hand');
  const elWaitingDock = document.getElementById('waiting-dock');
  const elWaitingStatusText = document.getElementById('waiting-status-text');

  // Action Buttons (2x2 Grid)
  const elActionGrid2x2 = document.getElementById('action-grid-2x2');
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
  let lastLoggedId = null;
  let previousPot = 0;
  let isRaiseDrawerOpen = false;
  let lastWinnerResult = null;
  let wakeLockSentinel = null;
  let winnerDismissTimer = null;
  let wasMyTurn = false;

  // Opulent Monte Carlo Gemstone & Velvet Avatar Palettes (Deep & Classy)
  const LUXURY_AVATAR_THEMES = [
    { bg: 'radial-gradient(circle at 35% 35%, #2a2a34 0%, #101014 100%)', border: '#C59B27', color: '#FFF3B0' }, // Imperial Obsidian
    { bg: 'radial-gradient(circle at 35% 35%, #1e3a8a 0%, #0a193d 100%)', border: '#D4AF37', color: '#E0E7FF' }, // Royal Sapphire
    { bg: 'radial-gradient(circle at 35% 35%, #064e3b 0%, #02231a 100%)', border: '#D4AF37', color: '#D1FAE5' }, // British Racing Emerald
    { bg: 'radial-gradient(circle at 35% 35%, #701a30 0%, #360814 100%)', border: '#ECC863', color: '#FFE4E6' }, // Bordeaux Velvet
    { bg: 'radial-gradient(circle at 35% 35%, #4c1d95 0%, #200742 100%)', border: '#D4AF37', color: '#EDE9FE' }, // Monaco Amethyst
    { bg: 'radial-gradient(circle at 35% 35%, #78350f 0%, #361502 100%)', border: '#C59B27', color: '#FEF3C7' }, // Cognac Amber
    { bg: 'radial-gradient(circle at 35% 35%, #1e293b 0%, #090e18 100%)', border: '#94A3B8', color: '#F8FAFC' }, // Slate Titanium
    { bg: 'radial-gradient(circle at 35% 35%, #0e7490 0%, #042f3d 100%)', border: '#D4AF37', color: '#CFFAFE' }  // Blue Diamond
  ];

  function getAvatarTheme(id) {
    if (!id) return LUXURY_AVATAR_THEMES[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % LUXURY_AVATAR_THEMES.length;
    return LUXURY_AVATAR_THEMES[idx];
  }

  // Truncate player name at 8 characters with ellipsis
  function truncateName(name, maxChars = 8) {
    if (!name) return 'Player';
    if (name.length > maxChars) {
      return name.slice(0, maxChars) + '...';
    }
    return name;
  }

  // Mobile Vibration API Helper
  function vibrateDevice(pattern) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
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

  // Sound Icon Init with SVG
  updateSoundIcon();
  function updateSoundIcon() {
    if (elSoundIconSvg) {
      if (audio.enabled) {
        elSoundIconSvg.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        `;
      } else {
        elSoundIconSvg.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
      }
    }
  }

  elBtnSoundToggle.addEventListener('click', () => {
    const isNowOn = audio.toggle();
    updateSoundIcon();
    showToast(isNowOn ? 'Sound enabled' : 'Sound muted', 'white');
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
      if (elBtnLeaveTable) elBtnLeaveTable.classList.add('hidden');
      releaseWakeLock();
    } else {
      elRoomCodeBadge.classList.remove('hidden');
      if (elBtnLeaveTable) elBtnLeaveTable.classList.remove('hidden');
      if (['lobby', 'table'].includes(viewName)) {
        requestWakeLock();
      }
    }
  }

  // Visual Toast Notifications
  function showToast(message, type = 'gold') {
    const toast = document.createElement('div');
    toast.className = `toast-pill toast-${type}`;
    toast.textContent = message;
    elToastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Copy Link Helper
  function copyTextToClipboard(text, successMsg = 'Table link copied!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg, 'gold');
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
    showToast(successMsg, 'gold');
  }

  // Fetch WiFi info on home view
  async function loadNetworkInfo(code = '') {
    const info = await client.fetchNetworkInfo(code);
    if (info) {
      elWifiAddressText.textContent = `Salon URL: ${info.targetUrl || info.networkUrl}`;
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
    void elScreenFlashOverlay.offsetWidth;
    elScreenFlashOverlay.classList.add('flash-active');
  }

  // Animated Number Roll Counter
  function animateNumber(element, start, end, duration = 350) {
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
      bigBlind: 20
    };

    try {
      elBtnCreateGame.disabled = true;
      const res = await client.createGame(name, config);
      elBtnCreateGame.disabled = false;
      showToast(`Table created: Room ${res.roomId}`, 'gold');
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

  elInputRoomCode.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      elBtnJoinGame.click();
    }
  });

  elInputPlayerName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (elInputRoomCode.value.trim().length === 4) {
        elBtnJoinGame.click();
      } else {
        elBtnCreateGame.click();
      }
    }
  });

  // --- LOBBY VIEW HANDLERS ---
  function updateHostSettings() {
    if (!client.currentState?.isHost) return;
    const config = {
      startingChips: Number(elCfgStartingChips.value),
      smallBlind: Number(elCfgSmallBlind.value),
      bigBlind: Number(elCfgBigBlind.value)
    };
    client.updateConfig(config).catch(err => showToast(err.message, 'error'));
  }

  [elCfgStartingChips, elCfgSmallBlind, elCfgBigBlind].forEach(el => {
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
    copyTextToClipboard(elModalShareUrl.textContent, 'Salon URL copied!');
  });

  // --- 2x2 ACTION CONTROLS ---
  // Row 1 Left: Fold
  elBtnActionFold.addEventListener('click', async () => {
    try {
      audio.playFold();
      await client.sendAction('fold');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Row 1 Right: Check / Call
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

  // Row 2: Raise Toggle & Drawer
  elBtnToggleRaise.addEventListener('click', () => {
    isRaiseDrawerOpen = !isRaiseDrawerOpen;
    elRaiseDrawer.classList.toggle('hidden', !isRaiseDrawerOpen);
    if (elActionGrid2x2) elActionGrid2x2.classList.toggle('hidden', isRaiseDrawerOpen);
    if (isRaiseDrawerOpen) {
      syncRaiseInputs();
    }
  });

  // Row 3: All-In
  elBtnActionAllIn.addEventListener('click', async () => {
    try {
      triggerScreenFlash();
      audio.playAllIn();
      await client.sendAction('allin');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  elBtnCancelRaise.addEventListener('click', () => {
    isRaiseDrawerOpen = false;
    elRaiseDrawer.classList.add('hidden');
    if (elActionGrid2x2) elActionGrid2x2.classList.remove('hidden');
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
      if (elActionGrid2x2) elActionGrid2x2.classList.remove('hidden');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // --- HOST CONTROLS ---
  elBtnNextHand.addEventListener('click', () => dealNextHand());
  elFabNext.addEventListener('click', () => dealNextHand());
  if (elBtnDockNextHand) elBtnDockNextHand.addEventListener('click', () => dealNextHand());

  function dealNextHand() {
    client.startNextHand().catch(err => showToast(err.message, 'error'));
  }

  elBtnShowdownAward.addEventListener('click', () => openShowdownModal());
  elFabAward.addEventListener('click', () => openShowdownModal());
  if (elBtnHeaderDeclareWinner) elBtnHeaderDeclareWinner.addEventListener('click', () => openShowdownModal());
  if (elBtnDockDeclareWinner) elBtnDockDeclareWinner.addEventListener('click', () => openShowdownModal());

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
      showToast('Chips transferred successfully', 'gold');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  elFabEndGame.addEventListener('click', () => {
    if (confirm('Conclude the session and generate the final salon ledger?')) {
      client.endGame().catch(err => showToast(err.message, 'error'));
    }
  });

  elBtnResumeGame.addEventListener('click', () => {
    client.resumeGame().catch(err => showToast(err.message, 'error'));
  });

  elBtnSummaryHome.addEventListener('click', () => {
    handleLeaveTable();
  });

  // --- LEAVE TABLE HANDLER ---
  async function handleLeaveTable() {
    const isPlaying = client.currentState && client.currentState.stage === 'playing';
    const msg = isPlaying
      ? 'Leave the poker table? If a hand is in progress, your hand will be folded and your seat freed.'
      : 'Are you sure you want to leave this table?';
    if (!confirm(msg)) return;

    try {
      await client.leaveTable();
      showToast('You left the table', 'neutral');
      switchView('home');
    } catch (err) {
      showToast(err.message || 'Error leaving table', 'error');
      switchView('home');
    }
  }

  if (elBtnLeaveTable) elBtnLeaveTable.addEventListener('click', handleLeaveTable);
  if (elBtnLobbyLeave) elBtnLobbyLeave.addEventListener('click', handleLeaveTable);

  // Modal Closures
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.close;
      document.getElementById(targetId)?.classList.add('hidden');
    });
  });

  // --- MOBILE BOTTOM SHEET GAME LOG & CHAT ---
  function openLogDrawer() {
    elDrawerLog.classList.remove('closed');
    elBottomSheetBackdrop.classList.remove('hidden');
    elUnreadLogBadge.classList.add('hidden');
  }

  function closeLogDrawer() {
    elDrawerLog.classList.add('closed');
    elBottomSheetBackdrop.classList.add('hidden');
  }

  elBtnLogToggle.addEventListener('click', () => {
    if (elDrawerLog.classList.contains('closed')) {
      openLogDrawer();
    } else {
      closeLogDrawer();
    }
  });

  elBtnCloseLog.addEventListener('click', closeLogDrawer);
  elBottomSheetBackdrop.addEventListener('click', closeLogDrawer);
  document.querySelector('.sheet-drag-handle-bar')?.addEventListener('click', closeLogDrawer);

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
    alert(message || 'You were excused from the table.');
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

    if (state.isHost && document.activeElement !== elCfgStartingChips) {
      elCfgStartingChips.value = state.config.startingChips;
      elCfgSmallBlind.value = state.config.smallBlind;
      elCfgBigBlind.value = state.config.bigBlind;
    }

    elBtnStartGame.disabled = state.players.length < 2;

    elLobbyPlayersList.innerHTML = '';
    state.players.forEach(p => {
      const item = document.createElement('div');
      item.className = 'player-roster-item';

      const initial = p.name ? p.name.charAt(0).toUpperCase() : '?';
      const isHost = p.id === state.hostId;
      const theme = getAvatarTheme(p.id);

      item.innerHTML = `
        <div class="roster-left">
          <div class="user-avatar-circle" style="background: ${theme.bg}; border-color: ${theme.border}; color: ${theme.color};">${initial}</div>
          <div>
            <span class="roster-name">${escapeHtml(p.name)}</span>
            ${isHost ? '<span class="tag-host">VIP HOST</span>' : ''}
            ${p.isYou ? '<span class="tag-you">(YOU)</span>' : ''}
          </div>
        </div>
        <div class="roster-right">
          ${state.isHost && !isHost ? `<button class="btn-kick" data-kick="${p.id}">Remove</button>` : ''}
        </div>
      `;

      elLobbyPlayersList.appendChild(item);
    });

    elLobbyPlayersList.querySelectorAll('[data-kick]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.kick;
        if (confirm('Excuse player from the table?')) {
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

    // Center Controls & Floating Host Bar (Showdown / Next Hand / Live Declare)
    const isPlayingHand = state.stage === 'playing' && state.street !== 'hand_ended';
    const isHandEnded = state.street === 'hand_ended';

    if (state.isHost) {
      if (isPlayingHand) {
        // Host can declare winner at any point during betting or at showdown
        elCenterHostActions.classList.remove('hidden');
        elBtnShowdownAward.classList.remove('hidden');
        elBtnNextHand.classList.add('hidden');
        if (elFabAward) {
          elFabAward.classList.remove('hidden');
          elFabAward.classList.add('fab-gold');
        }
        if (elFabNext) elFabNext.classList.add('hidden');
        if (elBtnHeaderDeclareWinner) elBtnHeaderDeclareWinner.classList.remove('hidden');
      } else if (isHandEnded) {
        elCenterHostActions.classList.remove('hidden');
        elBtnShowdownAward.classList.add('hidden');
        elBtnNextHand.classList.remove('hidden');
        if (elFabAward) elFabAward.classList.add('hidden');
        if (elFabNext) {
          elFabNext.classList.remove('hidden');
          elFabNext.classList.add('fab-emerald');
        }
        if (elBtnHeaderDeclareWinner) elBtnHeaderDeclareWinner.classList.add('hidden');
      } else {
        elCenterHostActions.classList.add('hidden');
        if (elFabAward) elFabAward.classList.add('hidden');
        if (elFabNext) elFabNext.classList.add('hidden');
        if (elBtnHeaderDeclareWinner) elBtnHeaderDeclareWinner.classList.add('hidden');
      }
    } else {
      elCenterHostActions.classList.add('hidden');
      if (elFabAward) elFabAward.classList.add('hidden');
      if (elFabNext) elFabNext.classList.add('hidden');
      if (elBtnHeaderDeclareWinner) elBtnHeaderDeclareWinner.classList.add('hidden');
    }

    renderTablePlayers(state);
    renderTurnDock(state);

    if (state.lastHandResult && state.street === 'hand_ended') {
      checkWinnerCelebration(state.lastHandResult);
    }
  }

  // Render Seated Players Around the Oval Table with Luxury Gemstone Themes
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
      const theme = getAvatarTheme(player.id);
      const displayName = truncateName(player.name, 8);

      // Role Chip Badge (D, SB, BB)
      let roleHtml = '';
      if (player.role === 'dealer' || player.isDealer) {
        roleHtml = `<div class="role-chip-badge badge-dealer" title="Dealer">D</div>`;
      } else if (player.role === 'sb') {
        roleHtml = `<div class="role-chip-badge badge-sb" title="Small Blind">SB</div>`;
      } else if (player.role === 'bb') {
        roleHtml = `<div class="role-chip-badge badge-bb" title="Big Blind">BB</div>`;
      }

      // All-In Badge (Enamel pill on avatar)
      const isAllIn = player.isAllIn || (player.chips === 0 && player.currentBet > 0 && !player.isFolded);
      const allInHtml = isAllIn ? `<div class="badge-allin-pill">ALL IN</div>` : '';

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
          <!-- Gemstone/Velvet Avatar with Gold Bezel -->
          <div class="player-avatar-circle" style="background: ${theme.bg}; border-color: ${theme.border}; color: ${theme.color};">${initial}</div>
          ${roleHtml}
          ${allInHtml}
        </div>

        <div class="player-meta-box">
          <div class="player-name-line">
            <span>${escapeHtml(displayName)}</span>
            ${player.isYou ? '<span class="you-tag">(YOU)</span>' : ''}
          </div>
          <div class="player-chip-counter">
            <svg class="gold-chip-glyph" width="13" height="13" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="url(#chipGoldGrad)" stroke="#B8860B" stroke-width="1.5"/>
              <text x="12" y="15" text-anchor="middle" font-size="8" font-family="'Cinzel', serif" font-weight="900" fill="#1C1405">P</text>
            </svg>
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

  // --- RENDER TURN CONTROLS & HAPTIC VIBRATIONS ---
  function renderTurnDock(state) {
    const isYourTurn = state.currentTurnPlayerId && state.players.some(p => p.id === state.currentTurnPlayerId && p.isYou);
    const turnPlayer = state.players.find(p => p.id === state.currentTurnPlayerId);

    // Turn transition vibration: Your turn starts -> vibrate [100, 50, 100]
    if (isYourTurn && !wasMyTurn) {
      vibrateDevice([100, 50, 100]);
      showToast('Your turn to act!', 'gold');
    }
    wasMyTurn = isYourTurn;

    // Showdown or Hand-Ended in the Bottom Action Dock
    if (state.street === 'showdown') {
      isRaiseDrawerOpen = false;
      elRaiseDrawer.classList.add('hidden');
      if (elActionGrid2x2) elActionGrid2x2.classList.remove('hidden');
      elTurnControls.classList.add('hidden');

      if (state.isHost) {
        // HOST gets a prominent, full-width "Declare Winner" action right in the dock!
        if (elDockHostPanel) {
          elDockHostPanel.classList.remove('hidden');
          if (elBtnDockDeclareWinner) elBtnDockDeclareWinner.classList.remove('hidden');
          if (elBtnDockNextHand) elBtnDockNextHand.classList.add('hidden');
        }
        elWaitingDock.classList.add('hidden');
      } else {
        // GUEST sees clear waiting status
        if (elDockHostPanel) elDockHostPanel.classList.add('hidden');
        elWaitingDock.classList.remove('hidden');
        const hostPlayer = state.players.find(p => p.id === state.hostId);
        const hostName = hostPlayer ? truncateName(hostPlayer.name, 10) : 'Host';
        elWaitingStatusText.textContent = `Showdown! Waiting for ${hostName} to declare winner...`;
      }
      return;
    }

    if (state.street === 'hand_ended') {
      isRaiseDrawerOpen = false;
      elRaiseDrawer.classList.add('hidden');
      if (elActionGrid2x2) elActionGrid2x2.classList.remove('hidden');
      elTurnControls.classList.add('hidden');

      if (state.isHost) {
        // HOST gets a prominent, full-width "Deal Next Hand ▶" action right in the dock!
        if (elDockHostPanel) {
          elDockHostPanel.classList.remove('hidden');
          if (elBtnDockDeclareWinner) elBtnDockDeclareWinner.classList.add('hidden');
          if (elBtnDockNextHand) elBtnDockNextHand.classList.remove('hidden');
        }
        elWaitingDock.classList.add('hidden');
      } else {
        if (elDockHostPanel) elDockHostPanel.classList.add('hidden');
        elWaitingDock.classList.remove('hidden');
        elWaitingStatusText.textContent = 'Hand complete. Waiting for Host to deal next hand...';
      }
      return;
    }

    // Normal betting phase (Preflop, Flop, Turn, River)
    if (elDockHostPanel) elDockHostPanel.classList.add('hidden');

    // Toggle 2x2 Action Dock
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
      isRaiseDrawerOpen = false;
      elRaiseDrawer.classList.add('hidden');
      if (elActionGrid2x2) elActionGrid2x2.classList.remove('hidden');
      elTurnControls.classList.add('hidden');
      elWaitingDock.classList.remove('hidden');
      if (turnPlayer) {
        elWaitingStatusText.textContent = `Awaiting action from ${truncateName(turnPlayer.name, 10)}...`;
      } else {
        elWaitingStatusText.textContent = 'Waiting for hand to begin...';
      }
    }
  }

  // --- RENDER SHOWDOWN MODAL ---
  function renderShowdownModal() {
    const state = client.currentState;
    if (!state) return;

    elShowdownPotsList.innerHTML = '';
    const pots = state.pots && state.pots.length > 0
      ? state.pots
      : [{ id: 'main', name: 'Main Pot', amount: state.pot || 0, eligiblePlayerIds: state.players.filter(p => !p.isFolded).map(p => p.id) }];

    pots.forEach((pot) => {
      const card = document.createElement('div');
      card.className = 'pot-select-card';

      // Eligible players: prioritize pot.eligiblePlayerIds, but fallback gracefully
      let eligiblePlayers = state.players.filter(p => !p.isSittingOut && !p.isFolded);
      if (pot.eligiblePlayerIds && Array.isArray(pot.eligiblePlayerIds) && pot.eligiblePlayerIds.length > 0) {
        const filtered = state.players.filter(p => pot.eligiblePlayerIds.includes(p.id));
        if (filtered.length > 0) eligiblePlayers = filtered;
      }
      if (eligiblePlayers.length === 0) {
        eligiblePlayers = state.players.filter(p => !p.isSittingOut);
      }

      card.innerHTML = `
        <div class="pot-select-header">
          <span>${escapeHtml(pot.name)}</span>
          <span>🪙 ${pot.amount.toLocaleString()}</span>
        </div>
        <div class="pot-player-options">
          ${eligiblePlayers.map(p => `
            <label class="pot-player-label">
              <span><strong>${escapeHtml(p.name)}</strong> <small style="color:var(--text-muted);margin-left:4px;">(${p.chips.toLocaleString()} chips)</small></span>
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
        showToast(`Select winner(s) for ${pot.name}`, 'error');
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

  // --- FULLSCREEN WINNER ANNOUNCEMENT & CHAMPAGNE FOIL CONFETTI ---
  function spawnConfetti() {
    elConfettiContainer.innerHTML = '';
    const luxuryFoilColors = [
      'linear-gradient(135deg, #FFF3B0, #D4AF37)',
      'linear-gradient(135deg, #ECC863, #AA820A)',
      'linear-gradient(135deg, #FFFFFF, #CBD5E1)',
      'linear-gradient(135deg, #34D399, #059669)',
      'linear-gradient(135deg, #FDE68A, #D97706)'
    ];
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = luxuryFoilColors[Math.floor(Math.random() * luxuryFoilColors.length)];
      piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 160}px`);
      piece.style.setProperty('--rot', `${Math.random() * 720}deg`);
      piece.style.animationDelay = `${Math.random() * 1.5}s`;
      piece.style.animationDuration = `${2.4 + Math.random() * 1.6}s`;
      elConfettiContainer.appendChild(piece);
    }
  }

  function checkWinnerCelebration(result) {
    const handNum = client.currentState?.handNumber;
    if (handNum === lastWinnerResult) return;
    lastWinnerResult = handNum;

    audio.playWinFanfare();

    const youWon = result.winners?.some(w => w.id === client.playerId);
    if (youWon) {
      vibrateDevice([200, 100, 200, 100, 400]);
      showToast(`You won 🪙 ${result.winners.find(w => w.id === client.playerId)?.amount || ''}!`, 'gold-glow');
    }

    elWinnerCelebrationDesc.textContent = result.message || 'Pot awarded to winning hand!';

    const totalChips = result.winners?.reduce((sum, w) => sum + w.amount, 0) || 500;
    elCelebrationChipsStack.innerHTML = window.renderChipStack(totalChips);

    spawnConfetti();
    elCelebrationOverlay.classList.remove('hidden');

    clearTimeout(winnerDismissTimer);
    winnerDismissTimer = setTimeout(() => {
      elCelebrationOverlay.classList.add('hidden');
    }, 4000);
  }

  // Tap anywhere on celebration overlay to continue
  elCelebrationOverlay.addEventListener('click', () => {
    clearTimeout(winnerDismissTimer);
    elCelebrationOverlay.classList.add('hidden');
  });

  elBtnCloseCelebration.addEventListener('click', (e) => {
    e.stopPropagation();
    clearTimeout(winnerDismissTimer);
    elCelebrationOverlay.classList.add('hidden');
  });

  // --- END OF NIGHT SUMMARY LEDGER (ROMAN VIP BADGES) ---
  function renderLeaderboard(leaderboard) {
    elSummaryCardsList.innerHTML = '';
    if (!Array.isArray(leaderboard)) return;

    const rankBadges = ['I', 'II', 'III'];

    leaderboard.forEach((row, idx) => {
      const card = document.createElement('div');
      card.className = `summary-row-card ${idx === 0 ? 'rank-1' : ''}`;

      const rankBadge = rankBadges[idx] || `#${idx + 1}`;
      const isPos = row.profitLoss >= 0;
      const profitClass = isPos ? 'profit-green' : 'loss-red';

      card.innerHTML = `
        <div class="summary-left">
          <span class="rank-badge-icon">${rankBadge}</span>
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

  // --- ACTION LOG DRAWER & MOBILE VISUAL TOASTS ---
  function renderActionLogs(logs) {
    if (!Array.isArray(logs) || logs.length === 0) return;

    const latest = logs[logs.length - 1];
    if (latest && latest.id !== lastLoggedId) {
      lastLoggedId = latest.id;

      if (elDrawerLog.classList.contains('closed')) {
        elUnreadLogBadge.classList.remove('hidden');
      }

      const text = latest.text.toLowerCase();

      if (text.includes('raised to') || text.includes('all-in')) {
        showToast(latest.text, 'white');
      } else if (text.includes('folded')) {
        showToast(latest.text, 'grey');
      } else if (text.includes('won') || latest.type === 'win') {
        showToast(latest.text, 'gold-glow');
      }

      if (['action', 'win'].includes(latest.type)) {
        elBannerText.textContent = latest.text;
        elTableActionBanner.classList.remove('hidden');
        setTimeout(() => {
          elTableActionBanner.classList.add('hidden');
        }, 3200);
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
