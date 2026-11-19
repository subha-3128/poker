# ♠️ POKER NIGHT — Luxury Multiplayer Poker Chip Tracker (PWA) ♣️

[![Live on Render](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://poker-flgj.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://poker-flgj.onrender.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F5A623?style=for-the-badge)](LICENSE)

> **Live Application**: 🔗 [https://poker-flgj.onrender.com/](https://poker-flgj.onrender.com/)

An ultra-luxurious, real-time multiplayer poker chip tracker designed for friends playing physical poker games together. Turn your smartphones into digital chip stacks, pot calculators, automated blind managers, side-pot arbiters, and turn timers — without needing physical chips!

Crafted with an exclusive **Monte Carlo / Bellagio High-Roller Private Salon** aesthetic, full **Progressive Web App (PWA)** mobile installation, and zero-configuration cloud deployment.

---

## 🌐 Play Instantly (Live Demo)

Open **[https://poker-flgj.onrender.com/](https://poker-flgj.onrender.com/)** on your phone or desktop:
1. Enter your name and tap **Create Table** (or enter a 4-digit room code to join).
2. Share the 4-digit code or let your friends scan the in-app **QR Code**.
3. Install to your home screen as a standalone app for an immersive, full-screen native experience!

---

## 🎨 High-Roller Design & Mobile UI/UX

Engineered mobile-first for **iPhone (390px base)** and Android devices:

- **Bespoke Table Architecture**:
  - Realistic padded espresso leather armrest with depth shading.
  - 1.5px polished brass inlay bead separating the rail and felt.
  - Deep British emerald baize felt with a hairline gold betting ring.
  - Parabolic 3D chip animations flying into the pot on every call and raise.
- **Handcrafted Vector Metalware (No System Emojis)**:
  - 100% custom 24k gold, brass, and platinum SVGs for crowns, chips, laurels, sound controls, and chat icons.
  - High-roller typography featuring **Cinzel** (Roman serif capitals) paired with **Playfair Display** and **Inter**.
- **Gemstone Velvet Player Avatars**:
  - Deep velvet gemstone gradients: *Imperial Obsidian, Royal Sapphire, British Racing Emerald, Bordeaux Velvet, Monaco Amethyst, and Cognac Amber*.
  - Brushed 24k gold bezels and Roman initials monograms.
- **Tactile Jeweled Action Dock**:
  - **Fold**: Deep black cherry garnet enamel.
  - **Check / Call**: Brushed royal 24k champagne gold bullion.
  - **Raise**: British racing imperial emerald with inline gold slider and quick-pot presets (½ Pot, ¾ Pot, Pot).
  - **All-In**: Diamond platinum with gold trim and shimmer.
  - Thumb-friendly 52px targets with `touch-action: manipulation` for instant response.
- **SVG Circular Turn Timer**:
  - Clockwise draining countdown ring (30s) shifting from Champagne Gold $\rightarrow$ Amber (15s) $\rightarrow$ Urgent Crimson Pulse (5s).
  - Mobile haptic vibration alerts (`navigator.vibrate`) on your turn, 5s warning, and pot victory.

---

## 🃏 Core Poker Engine Features

- **Automated Blind Rotation**:
  - Auto-rotates Dealer **(D)**, Small Blind **(SB)**, and Big Blind **(BB)** chip badges each hand.
  - Auto-posts blinds at hand start, with full Heads-Up (2-player) poker rules compliance.
- **Mathematically Accurate Multi-Way Side Pots**:
  - Automatically handles complex all-in scenarios with different stack sizes, calculating exact main and side pot entitlements.
  - Under-raise all-in protection prevents reopening betting action to callers.
- **Host Security & Controls**:
  - Cryptographically secure host tokens (`hostToken`) ensure only the legitimate table host can start games, kick players, rebuy chips, or award pots.
  - Mid-game rebuys tracked seamlessly for net accounting.
- **Showdown & Celebrations**:
  - Multi-pot selection interface for the host at round completion.
  - Fullscreen winner celebration with champagne gold, platinum leaf, and emerald metallic foil confetti.
- **Zero-Sum End of Night Ledger**:
  - Transparent leaderboard with Roman numeral medallions ($I$, $II$, $III$) displaying final chip count, total rebuys, and net profit/loss ($+\text{chips} / -\text{chips}$).

---

## 📱 Mobile PWA Installation Guide

- **iOS / Safari**:
  1. Open [https://poker-flgj.onrender.com/](https://poker-flgj.onrender.com/) in Safari.
  2. Tap the **Share** button (square with arrow up).
  3. Scroll down and tap **"Add to Home Screen"**.
- **Android / Chrome**:
  1. Open [https://poker-flgj.onrender.com/](https://poker-flgj.onrender.com/) in Chrome.
  2. Tap the bottom banner **"Install Poker Night"** or tap the menu (⋮) $\rightarrow$ **"Install app"**.
- **Native Experience**: Runs standalone in `100dvh` with safe-area notch and home-bar insets (`env(safe-area-inset-bottom)`), disabled pull-to-refresh, and zero browser chrome.

---

## ☁️ Deployment & Hosting

### Deploy on Render (Zero Configuration)
The project includes a ready-to-use [`render.yaml`](file:///Users/subhajitbepari/Desktop/poker/render.yaml) blueprint:
1. Push this repo to your GitHub account.
2. Sign in to [render.com](https://render.com) and click **New > Blueprint** (or **Web Service**).
3. Connect your repository.
4. Render automatically configures:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
5. Click **Apply / Deploy** — your cloud poker table is live in seconds!

### Deploy on Railway
1. Go to [railway.app](https://railway.app) $\rightarrow$ **Deploy from GitHub repo**.
2. Select your repository.
3. Automatically binds to `process.env.PORT` and runs health checks at `/health`.

---

## 🏠 Running Locally (Same Wi-Fi Network)

Play locally with zero internet connection required:

```bash
# 1. Clone the repository
git clone https://github.com/subha-3128/poker.git
cd poker

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

The terminal will print:
```text
╔════════════════════════════════════════════════════════╗
║             ♠ POKER NIGHT SERVER RUNNING ♠             ║
╠════════════════════════════════════════════════════════╣
║  Local:       http://localhost:3000                    ║
║  Network:     http://192.168.1.100:3000                ║
║  Health:      http://localhost:3000/health             ║
╚════════════════════════════════════════════════════════╝
```
Friends on the same Wi-Fi can scan the terminal QR code or in-browser QR code to join immediately.

---

## 🧪 Automated Testing

Run the comprehensive unit test suite and real-time multiplayer simulation:

```bash
npm test
```

### What the test suite verifies:
- ✅ **Unit Tests** (`test-game.js`):
  - Heads-up blind posting, dealer rotation, and street progression.
  - Multi-way side-pot calculations with disparate stack sizes.
  - Rebuy ledger calculation and zero-sum verification.
  - Dealer rotation safety clamping and under-raise action freeze.
- ✅ **Integration Simulation** (`test-integration.js`):
  - End-to-end Socket.IO handshake across 3 simultaneous virtual client sockets.
  - Host token authorization and malicious command rejection.
  - Real-time preflop $\rightarrow$ flop street progression, blind betting, fold action, rebuy event, and pot payout.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+), Canvas API, Web Audio API
- **Fonts**: [Cinzel](https://fonts.google.com/specimen/Cinzel), [Playfair Display](https://fonts.google.com/specimen/Playfair+Display), [Inter](https://fonts.google.com/specimen/Inter)
- **Deployment**: Render, Railway, Docker / Linux compatible
- **Storage**: In-memory state machine (zero database overhead, instant speed)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
