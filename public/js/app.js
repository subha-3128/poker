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

  // 16:9 Aspect Ratio Toggle
  const elAppContainer = document.getElementById('app-container');
  const elBtnAspectToggle = document.getElementById('btn-aspect-toggle');

  // Community Board Elements
  const elCommunityCardsRow = document.getElementById('community-cards-row');
  const elCommunityRoundBadge = document.getElementById('community-round-badge');
  const elHostBoardFeltBar = document.getElementById('host-board-felt-bar');
  const elBtnHostAddCard = document.getElementById('btn-host-add-card');
  const elHostNextRoundLabel = document.getElementById('host-next-round-label');
  const elBtnHostOpenBoardModal = document.getElementById('btn-host-open-board-modal');

  // Player Hole Cards HUD Elements
  const elMyHoleCardsContainer = document.getElementById('my-hole-cards-container');
  const elBtnTogglePeek = document.getElementById('btn-toggle-peek');
  const elPeekBtnText = document.getElementById('peek-btn-text');
  const elEyeIconSvg = document.getElementById('eye-icon-svg');
  const elBtnOpenPlayerCardsModal = document.getElementById('btn-open-player-cards-modal');

  // Modals - Player Cards
  const elModalPlayerCards = document.getElementById('modal-player-cards');
  const elTabBtnPicker = document.getElementById('tab-btn-picker');
  const elTabBtnUpload = document.getElementById('tab-btn-upload');
  const elTabContentPicker = document.getElementById('tab-content-picker');
  const elTabContentUpload = document.getElementById('tab-content-upload');
  const elPickerCard1Preview = document.getElementById('picker-card-1-preview');
  const elPickerCard2Preview = document.getElementById('picker-card-2-preview');
  const elInputPlayerCardFile = document.getElementById('input-player-card-file');
  const elPlayerUploadPreviews = document.getElementById('player-upload-previews');
  const elImgPlayerUploadPreview = document.getElementById('img-player-upload-preview');
  const elBtnRemoveUploadedCard = document.getElementById('btn-remove-uploaded-card');
  const elBtnSavePlayerCards = document.getElementById('btn-save-player-cards');
  const elBtnClearMyCards = document.getElementById('btn-clear-my-cards');

  // Modals - Host Board
  const elModalHostBoard = document.getElementById('modal-host-board');
  const elHostModalSlotsRow = document.getElementById('host-modal-slots-row');
  const elHostSlotEditorTitle = document.getElementById('host-slot-editor-title');
  const elInputHostSlotFile = document.getElementById('input-host-slot-file');
  const elHostSlotSuits = document.getElementById('host-slot-suits');
  const elHostSlotRanks = document.getElementById('host-slot-ranks');
  const elBtnHostClearBoard = document.getElementById('btn-host-clear-board');
  const elBtnHostDealNextRound = document.getElementById('btn-host-deal-next-round');
  const elDealNextRoundText = document.getElementById('deal-next-round-text');
  const elBtnHostSaveAll5 = document.getElementById('btn-host-save-all-5');

  // Modals - Quick Add Card
  const elModalQuickAddCard = document.getElementById('modal-quick-add-card');
  const elQuickAddBadgeLabel = document.getElementById('quick-add-badge-label');
  const elQuickAddModalTitle = document.getElementById('quick-add-modal-title');
  const elQuickAddCardPreview = document.getElementById('quick-add-card-preview');
  const elQuickAddSuits = document.getElementById('quick-add-suits');
  const elQuickAddRanks = document.getElementById('quick-add-ranks');
  const elInputQuickAddFile = document.getElementById('input-quick-add-file');
  const elBtnConfirmQuickAdd = document.getElementById('btn-confirm-quick-add');

  // Modals - Card Zoom
  const elModalCardZoom = document.getElementById('modal-card-zoom');
  const elImgCardZoom = document.getElementById('img-card-zoom');
  const elCaptionCardZoom = document.getElementById('caption-card-zoom');

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

  // 16:9 & Cards Local State
  let is16x9Locked = localStorage.getItem('poker_16_9') !== 'false';
  let isPeekEnabled = localStorage.getItem('poker_peek_cards') !== 'false';
  let selectedCard1 = { rank: 'A', suit: 'spades' };
  let selectedCard2 = { rank: 'K', suit: 'hearts' };
  let uploadedCardPhoto = null;
  let playerModalActiveTab = 'picker';

  let hostSelectedSlot = 0; // 0 to 4
  let hostSlots = [
    { rank: 'A', suit: 'spades', image: null },
    { rank: 'K', suit: 'diamonds', image: null },
    { rank: 'Q', suit: 'clubs', image: null },
    { rank: 'J', suit: 'hearts', image: null },
    { rank: '10', suit: 'spades', image: null }
  ];

  let quickAddSlotRound = 1;
  let quickAddCard = { rank: 'A', suit: 'spades', image: null };

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

  // --- 16:9 PRO CINEMA VIEW TOGGLE ---
  function applyAspectMode(locked) {
    is16x9Locked = locked;
    localStorage.setItem('poker_16_9', locked ? 'true' : 'false');
    if (elAppContainer) {
      if (locked) {
        elAppContainer.classList.add('mode-widescreen-16-9');
      } else {
        elAppContainer.classList.remove('mode-widescreen-16-9');
      }
    }
    if (elBtnAspectToggle) {
      elBtnAspectToggle.classList.toggle('active', locked);
    }
    if (client.currentState) {
      renderTablePlayers(client.currentState);
    }
  }
  applyAspectMode(is16x9Locked);
  elBtnAspectToggle?.addEventListener('click', () => {
    applyAspectMode(!is16x9Locked);
    showToast(is16x9Locked ? '16:9 Pro Cinema View Enabled' : 'Adaptive View Enabled', 'gold');
  });

  // --- CARD UTILITIES & RENDERING ---
  function getSuitSymbol(suit) {
    if (!suit) return '♠';
    const s = suit.toLowerCase();
    if (s.startsWith('s') || s === '♠') return '♠';
    if (s.startsWith('h') || s === '♥') return '♥';
    if (s.startsWith('d') || s === '♦') return '♦';
    if (s.startsWith('c') || s === '♣') return '♣';
    return '♠';
  }

  function isSuitRed(suit) {
    if (!suit) return false;
    const s = suit.toLowerCase();
    return s.startsWith('h') || s.startsWith('d') || s === '♥' || s === '♦';
  }

  function renderCardHtml(card, { isMini = false, showBack = false, anim = false } = {}) {
    if (!card || showBack || card.faceDown) {
      return `
        <div class="poker-card is-back ${anim ? 'anim-card-deal' : ''}">
          <div class="card-back-pattern">
            <span class="card-back-crest">♠</span>
          </div>
        </div>
      `;
    }

    if (card.image) {
      return `
        <div class="poker-card is-photo ${anim ? 'anim-card-deal' : ''}" data-zoom-img="${escapeHtml(card.image)}" data-zoom-caption="${escapeHtml(card.label || 'Card Photo')}">
          <img src="${card.image}" alt="Card">
          <span class="card-photo-badge">📷</span>
        </div>
      `;
    }

    const rank = (card.rank || 'A').toUpperCase();
    const suit = card.suit || 'spades';
    const symbol = getSuitSymbol(suit);
    const isRed = isSuitRed(suit);
    const colorClass = isRed ? 'is-red' : 'is-black';

    return `
      <div class="poker-card ${colorClass} ${anim ? 'anim-card-deal' : ''}" data-rank="${escapeHtml(rank)}" data-suit="${escapeHtml(suit)}">
        <div class="card-corner-top">
          <span class="card-rank-text">${escapeHtml(rank)}</span>
          <span class="card-suit-icon">${symbol}</span>
        </div>
        <div class="card-center-suit">${symbol}</div>
        <div class="card-corner-bottom">
          <span class="card-rank-text">${escapeHtml(rank)}</span>
          <span class="card-suit-icon">${symbol}</span>
        </div>
      </div>
    `;
  }

  function compressImage(file, maxDimension = 800, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function openCardZoom(src, caption = '') {
    if (!elModalCardZoom || !elImgCardZoom) return;
    elImgCardZoom.src = src;
    if (elCaptionCardZoom) elCaptionCardZoom.textContent = caption;
    elModalCardZoom.classList.remove('hidden');
  }

  // --- PEEK CARDS TOGGLE ---
  function togglePeek() {
    isPeekEnabled = !isPeekEnabled;
    localStorage.setItem('poker_peek_cards', isPeekEnabled ? 'true' : 'false');
    updatePeekUi();
    if (audio) audio.playCardFlip();
    if (client.currentState) {
      renderMyHoleCards(client.currentState);
      renderTablePlayers(client.currentState);
    }
  }

  function updatePeekUi() {
    if (elPeekBtnText) elPeekBtnText.textContent = isPeekEnabled ? 'Hide' : 'Peek';
    if (elBtnTogglePeek) elBtnTogglePeek.classList.toggle('active', isPeekEnabled);
  }
  updatePeekUi();
  elBtnTogglePeek?.addEventListener('click', togglePeek);

  // --- COMMUNITY BOARD RENDERING ---
  function renderCommunityCards(state) {
    if (!elCommunityCardsRow) return;
    const cards = state.communityCards || [];
    const currentCount = cards.length;
    const nextRound = Math.min(5, currentCount + 1);

    if (elCommunityRoundBadge) {
      elCommunityRoundBadge.textContent = `ROUND ${currentCount} / 5`;
    }
    if (elHostNextRoundLabel) {
      elHostNextRoundLabel.textContent = `(Round ${nextRound})`;
    }
    if (elDealNextRoundText) {
      elDealNextRoundText.textContent = `Round ${nextRound}`;
    }

    elCommunityCardsRow.innerHTML = '';

    for (let i = 0; i < 5; i++) {
      const card = cards[i];
      const slotRoundNum = i + 1;
      if (card) {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'community-card-item';
        cardWrapper.innerHTML = renderCardHtml(card, { anim: false });
        cardWrapper.addEventListener('click', () => {
          if (card.image) openCardZoom(card.image, `Community Card #${slotRoundNum} (Round ${slotRoundNum})`);
        });
        elCommunityCardsRow.appendChild(cardWrapper);
      } else {
        const slotEl = document.createElement('div');
        slotEl.className = 'community-card-slot';
        slotEl.title = `Slot ${slotRoundNum} (Round ${slotRoundNum}) - Click to Add`;
        slotEl.innerHTML = `
          <span class="slot-round-name">R${slotRoundNum}</span>
          <span class="slot-add-icon">+</span>
        `;
        slotEl.addEventListener('click', () => {
          if (state.isHost) {
            openQuickAddModal(slotRoundNum);
          } else {
            showToast(`Waiting for host to deal Round ${slotRoundNum}`);
          }
        });
        elCommunityCardsRow.appendChild(slotEl);
      }
    }

    // Host Table Quick Controls
    if (elHostBoardFeltBar) {
      if (state.isHost && state.stage === 'playing') {
        elHostBoardFeltBar.classList.remove('hidden');
        if (currentCount >= 5) {
          if (elBtnHostAddCard) elBtnHostAddCard.classList.add('hidden');
        } else {
          if (elBtnHostAddCard) elBtnHostAddCard.classList.remove('hidden');
        }
      } else {
        elHostBoardFeltBar.classList.add('hidden');
      }
    }
  }

  // --- MY HOLE CARDS HUD RENDERING ---
  function renderMyHoleCards(state) {
    if (!elMyHoleCardsContainer) return;
    const self = state.players?.find(p => p.isYou);
    const cards = self?.cards || [];

    elMyHoleCardsContainer.innerHTML = '';

    if (cards.length === 0) {
      for (let i = 0; i < 2; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'empty-hole-slot';
        emptySlot.innerHTML = `
          <span class="slot-add-icon">+</span>
          <span>CARD ${i + 1}</span>
        `;
        emptySlot.addEventListener('click', () => openPlayerCardsModal());
        elMyHoleCardsContainer.appendChild(emptySlot);
      }
      return;
    }

    cards.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'my-card-item-wrap';
      cardEl.style.position = 'relative';
      const isPeek = isPeekEnabled;
      cardEl.innerHTML = renderCardHtml(card, { showBack: !isPeek });

      if (!isPeek) {
        const peekOverlay = document.createElement('div');
        peekOverlay.className = 'peek-overlay-msg';
        peekOverlay.textContent = 'PEEK';
        peekOverlay.title = 'Click to peek card';
        cardEl.appendChild(peekOverlay);
      }

      cardEl.addEventListener('click', () => {
        if (!isPeekEnabled) {
          togglePeek();
        } else if (card.image) {
          openCardZoom(card.image, `My Hole Card #${idx + 1}`);
        } else {
          openPlayerCardsModal();
        }
      });
      elMyHoleCardsContainer.appendChild(cardEl);
    });
  }

  // --- PLAYER CARDS MODAL CONTROLLER ---
  function openPlayerCardsModal() {
    if (!elModalPlayerCards) return;
    const self = client.currentState?.players?.find(p => p.isYou);
    if (self && self.cards && self.cards.length >= 2 && !self.cards[0].image) {
      selectedCard1 = { ...self.cards[0] };
      selectedCard2 = { ...self.cards[1] };
    }
    updateCardPickerPreview(1);
    updateCardPickerPreview(2);
    setPlayerModalTab('picker');
    elModalPlayerCards.classList.remove('hidden');
  }

  function setPlayerModalTab(tabName) {
    playerModalActiveTab = tabName;
    if (tabName === 'picker') {
      elTabBtnPicker?.classList.add('active');
      elTabBtnUpload?.classList.remove('active');
      elTabContentPicker?.classList.remove('hidden');
      elTabContentUpload?.classList.add('hidden');
    } else {
      elTabBtnPicker?.classList.remove('active');
      elTabBtnUpload?.classList.add('active');
      elTabContentPicker?.classList.add('hidden');
      elTabContentUpload?.classList.remove('hidden');
    }
  }

  function updateCardPickerPreview(cardIndex) {
    const cardData = cardIndex === 1 ? selectedCard1 : selectedCard2;
    const previewEl = cardIndex === 1 ? elPickerCard1Preview : elPickerCard2Preview;
    if (!previewEl) return;
    previewEl.innerHTML = renderCardHtml(cardData);

    // Sync button active classes for this card
    const suitBtns = elModalPlayerCards?.querySelectorAll(`.suit-pills-row[data-card="${cardIndex}"] .suit-pill`);
    suitBtns?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.suit === cardData.suit);
    });

    const rankBtns = elModalPlayerCards?.querySelectorAll(`.rank-grid[data-card="${cardIndex}"] .rank-btn`);
    rankBtns?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.rank === cardData.rank);
    });
  }

  function setupPlayerCardsModal() {
    elBtnOpenPlayerCardsModal?.addEventListener('click', openPlayerCardsModal);

    elTabBtnPicker?.addEventListener('click', () => setPlayerModalTab('picker'));
    elTabBtnUpload?.addEventListener('click', () => setPlayerModalTab('upload'));

    // Suit and Rank Picker clicks
    elModalPlayerCards?.querySelectorAll('.suit-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const cardIdx = Number(btn.closest('.suit-pills-row').dataset.card);
        const suit = btn.dataset.suit;
        if (cardIdx === 1) selectedCard1.suit = suit;
        else selectedCard2.suit = suit;
        updateCardPickerPreview(cardIdx);
      });
    });

    elModalPlayerCards?.querySelectorAll('.rank-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cardIdx = Number(btn.closest('.rank-grid').dataset.card);
        const rank = btn.dataset.rank;
        if (cardIdx === 1) selectedCard1.rank = rank;
        else selectedCard2.rank = rank;
        updateCardPickerPreview(cardIdx);
      });
    });

    // Image Upload
    elInputPlayerCardFile?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImage(file, 800, 0.82);
        uploadedCardPhoto = dataUrl;
        if (elImgPlayerUploadPreview) elImgPlayerUploadPreview.src = dataUrl;
        elPlayerUploadPreviews?.classList.remove('hidden');
      } catch (err) {
        showToast('Failed to load image', 'red');
      }
    });

    elBtnRemoveUploadedCard?.addEventListener('click', () => {
      uploadedCardPhoto = null;
      if (elImgPlayerUploadPreview) elImgPlayerUploadPreview.src = '';
      elPlayerUploadPreviews?.classList.add('hidden');
      if (elInputPlayerCardFile) elInputPlayerCardFile.value = '';
    });

    // Save cards
    elBtnSavePlayerCards?.addEventListener('click', async () => {
      try {
        let cardsToSend = [];
        if (playerModalActiveTab === 'upload' && uploadedCardPhoto) {
          cardsToSend = [{ image: uploadedCardPhoto, label: 'My Cards Photo' }];
        } else {
          cardsToSend = [selectedCard1, selectedCard2];
        }
        await client.setPlayerCards(cardsToSend);
        if (audio) audio.playCardDeal();
        showToast('Your cards were uploaded successfully!', 'gold');
        elModalPlayerCards?.classList.add('hidden');
      } catch (err) {
        showToast(err.message || 'Failed to save cards', 'red');
      }
    });

    // Clear cards
    elBtnClearMyCards?.addEventListener('click', async () => {
      try {
        await client.clearPlayerCards();
        showToast('Cards cleared', 'white');
        elModalPlayerCards?.classList.add('hidden');
      } catch (err) {
        showToast(err.message || 'Failed to clear cards', 'red');
      }
    });
  }

  // --- HOST COMMUNITY BOARD MODAL CONTROLLER ---
  function openHostBoardModal() {
    if (!elModalHostBoard) return;
    // Pre-populate hostSlots with current community cards if any
    const existing = client.currentState?.communityCards || [];
    existing.forEach((c, idx) => {
      if (idx < 5) hostSlots[idx] = { ...c };
    });
    renderHostBoardModalSlots();
    elModalHostBoard.classList.remove('hidden');
  }

  function renderHostBoardModalSlots() {
    if (!elHostModalSlotsRow) return;
    elHostModalSlotsRow.innerHTML = '';

    for (let i = 0; i < 5; i++) {
      const slotCard = hostSlots[i];
      const slotNum = i + 1;
      const isSelected = i === hostSelectedSlot;

      const slotCardEl = document.createElement('div');
      slotCardEl.className = `host-slot-card ${isSelected ? 'active-editing' : ''}`;
      slotCardEl.innerHTML = `
        <span class="host-slot-label">ROUND ${slotNum}</span>
        ${slotCard ? renderCardHtml(slotCard) : `<div class="community-card-slot"><span class="slot-round-name">R${slotNum}</span></div>`}
      `;

      slotCardEl.addEventListener('click', () => {
        hostSelectedSlot = i;
        renderHostBoardModalSlots();
        updateHostSlotEditorUi();
      });

      elHostModalSlotsRow.appendChild(slotCardEl);
    }
    updateHostSlotEditorUi();
  }

  function updateHostSlotEditorUi() {
    if (elHostSlotEditorTitle) {
      elHostSlotEditorTitle.textContent = `Editing Card ${hostSelectedSlot + 1} (Round ${hostSelectedSlot + 1})`;
    }
    const current = hostSlots[hostSelectedSlot] || { rank: 'A', suit: 'spades' };
    elHostSlotSuits?.querySelectorAll('.suit-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.suit === current.suit);
    });
    elHostSlotRanks?.querySelectorAll('.rank-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.rank === current.rank);
    });
  }

  function setupHostBoardModal() {
    elBtnHostOpenBoardModal?.addEventListener('click', openHostBoardModal);

    // Host slot editor suits and ranks
    elHostSlotSuits?.querySelectorAll('.suit-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!hostSlots[hostSelectedSlot]) hostSlots[hostSelectedSlot] = { rank: 'A', suit: 'spades', image: null };
        hostSlots[hostSelectedSlot].suit = btn.dataset.suit;
        hostSlots[hostSelectedSlot].image = null;
        renderHostBoardModalSlots();
      });
    });

    elHostSlotRanks?.querySelectorAll('.rank-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!hostSlots[hostSelectedSlot]) hostSlots[hostSelectedSlot] = { rank: 'A', suit: 'spades', image: null };
        hostSlots[hostSelectedSlot].rank = btn.dataset.rank;
        hostSlots[hostSelectedSlot].image = null;
        renderHostBoardModalSlots();
      });
    });

    // Host photo upload for slot
    elInputHostSlotFile?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImage(file, 800, 0.82);
        hostSlots[hostSelectedSlot] = {
          image: dataUrl,
          label: `Round ${hostSelectedSlot + 1} Card`
        };
        renderHostBoardModalSlots();
      } catch (err) {
        showToast('Failed to load card photo', 'red');
      }
    });

    // Host Deal Next Card
    elBtnHostDealNextRound?.addEventListener('click', async () => {
      try {
        const currentCount = client.currentState?.communityCards?.length || 0;
        if (currentCount >= 5) {
          return showToast('All 5 cards already dealt!', 'gold');
        }
        const nextRoundNum = currentCount + 1;
        const cardToDeal = hostSlots[currentCount] || { rank: 'A', suit: 'spades' };
        await client.hostAddCommunityCard(cardToDeal, nextRoundNum);
        if (audio) audio.playCardDeal();
        showToast(`Dealt Card for Round ${nextRoundNum}!`, 'gold');
        elModalHostBoard?.classList.add('hidden');
      } catch (err) {
        showToast(err.message || 'Failed to deal card', 'red');
      }
    });

    // Host Save All 5 Cards
    elBtnHostSaveAll5?.addEventListener('click', async () => {
      try {
        const valid5 = hostSlots.slice(0, 5).map((c, i) => c || { rank: 'A', suit: 'spades' });
        await client.hostSetCommunityCards(valid5);
        if (audio) audio.playCardDeal();
        showToast('All 5 community cards placed on the board!', 'gold');
        elModalHostBoard?.classList.add('hidden');
      } catch (err) {
        showToast(err.message || 'Failed to set cards', 'red');
      }
    });

    // Host Clear Board
    elBtnHostClearBoard?.addEventListener('click', async () => {
      try {
        await client.hostClearCommunityCards();
        showToast('Community cards cleared', 'white');
        elModalHostBoard?.classList.add('hidden');
      } catch (err) {
        showToast(err.message || 'Failed to clear board', 'red');
      }
    });
  }

  // --- QUICK ADD CARD MODAL CONTROLLER ---
  function openQuickAddModal(roundNum) {
    quickAddSlotRound = roundNum || ((client.currentState?.communityCards?.length || 0) + 1);
    quickAddCard = hostSlots[quickAddSlotRound - 1] || { rank: 'A', suit: 'spades', image: null };

    if (elQuickAddBadgeLabel) elQuickAddBadgeLabel.textContent = `ROUND ${quickAddSlotRound}`;
    if (elQuickAddModalTitle) elQuickAddModalTitle.textContent = `Add Card for Round ${quickAddSlotRound}`;

    updateQuickAddPreview();
    elModalQuickAddCard?.classList.remove('hidden');
  }

  function updateQuickAddPreview() {
    if (elQuickAddCardPreview) {
      elQuickAddCardPreview.innerHTML = renderCardHtml(quickAddCard);
    }
    elQuickAddSuits?.querySelectorAll('.suit-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.suit === quickAddCard.suit);
    });
    elQuickAddRanks?.querySelectorAll('.rank-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.rank === quickAddCard.rank);
    });
  }

  function setupQuickAddModal() {
    elBtnHostAddCard?.addEventListener('click', () => {
      const currentCount = client.currentState?.communityCards?.length || 0;
      openQuickAddModal(currentCount + 1);
    });

    elQuickAddSuits?.querySelectorAll('.suit-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        quickAddCard.suit = btn.dataset.suit;
        quickAddCard.image = null;
        updateQuickAddPreview();
      });
    });

    elQuickAddRanks?.querySelectorAll('.rank-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        quickAddCard.rank = btn.dataset.rank;
        quickAddCard.image = null;
        updateQuickAddPreview();
      });
    });

    elInputQuickAddFile?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImage(file, 800, 0.82);
        quickAddCard = {
          image: dataUrl,
          label: `Round ${quickAddSlotRound} Card`
        };
        updateQuickAddPreview();
      } catch (err) {
        showToast('Failed to load card photo', 'red');
      }
    });

    elBtnConfirmQuickAdd?.addEventListener('click', async () => {
      try {
        await client.hostAddCommunityCard(quickAddCard, quickAddSlotRound);
        if (audio) audio.playCardDeal();
        showToast(`Round ${quickAddSlotRound} Card added to table!`, 'gold');
        elModalQuickAddCard?.classList.add('hidden');
      } catch (err) {
        showToast(err.message || 'Failed to add card', 'red');
      }
    });
  }

  // Initialize Card Modals
  setupPlayerCardsModal();
  setupHostBoardModal();
  setupQuickAddModal();

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

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
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

    renderCommunityCards(state);
    renderMyHoleCards(state);
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

    const isWidescreen = document.getElementById('app-container')?.classList.contains('mode-widescreen-16-9') ||
      (window.innerWidth >= 640 && (window.innerWidth / window.innerHeight) >= 1.15);
    const rx = isWidescreen ? 42 : 38;
    const ry = isWidescreen ? 36 : 35;
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

      // Miniature Hole Cards next to avatar
      let cardsHtml = '';
      if (player.hasCards || (player.cards && player.cards.length > 0)) {
        const pCards = player.cards || [{ faceDown: true }, { faceDown: true }];
        const showFace = (player.isYou && isPeekEnabled) || state.street === 'showdown' || state.street === 'hand_ended' || player.cardsRevealed;
        cardsHtml = `
          <div class="player-table-cards">
            ${pCards.slice(0, 2).map(c => renderCardHtml(c, { isMini: true, showBack: !showFace })).join('')}
          </div>
        `;
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
          <!-- Gemstone/Velvet Avatar with Gold Bezel -->
          <div class="player-avatar-circle" style="background: ${theme.bg}; border-color: ${theme.border}; color: ${theme.color};">${initial}</div>
          ${roleHtml}
          ${allInHtml}
        </div>
        ${cardsHtml}

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
