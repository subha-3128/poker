# ♠️ POKER NIGHT — Real-Time Multiplayer Chip Tracker (PWA) ♣️

A real-time, luxury casino-themed multiplayer poker chip tracker designed for friends playing physical poker games together on mobile devices. Use your phones as digital chip stacks, bet counters, side-pot calculators, and turn timers — without needing physical chips!

Installable as a **Progressive Web App (PWA)** on iOS and Android. Works seamlessly on **local Wi-Fi** or deployed in the cloud (**Render, Railway, Heroku**).

---

## ☁️ Cloud Deployment (Render, Railway, Heroku)

### Deploy on Render (Zero Extra Configuration)
1. Go to [render.com](https://render.com) and click **New > Web Service** (or **Blueprint**).
2. Connect your GitHub repository: `https://github.com/subha-3128/poker.git`.
3. Render automatically reads `render.yaml` and `package.json`:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Click **Create Web Service** — that's it!

### Deploy on Railway
1. Go to [railway.app](https://railway.app) and select **Deploy from GitHub repo**.
2. Select your repository.
3. Railway automatically binds to `PORT`, listens on `0.0.0.0`, and validates `/health`.

---

## 🏠 Running Locally (Same Wi-Fi)

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start
```

When the server starts, it prints:
- **Local machine URL**: `http://localhost:3000`
- **WiFi Network URL**: `http://192.168.x.x:3000`
- **Terminal QR Code**: Scan directly from terminal with phone camera!
- **In-Browser QR Code**: Displayed on the web app for easy 1-tap scanning.

Friends connect their phones to the **same Wi-Fi network** and scan the QR code (or type the URL) to join instantly.

---

## 📱 Mobile PWA Installation
- **iPhone / iOS (Safari)**: Open the URL in Safari, tap the **Share** button (box with upward arrow), and select **"Add to Home Screen"**.
- **Android (Chrome)**: Tap the in-app **"Install Poker Night"** banner at the bottom, or tap the three dots menu > **"Add to Home screen"** / **"Install app"**.
- Opens fullscreen without browser URL bar for a genuine native app feel.

---

## 🌟 Production & Cloud Architecture

- **Unified Port & Reverse Proxy**:
  - Express serves all static files from `/public`.
  - Socket.IO shares the exact same HTTP server and port (no second port needed).
  - Reverse proxy support enabled (`app.set('trust proxy', 1)`) for SSL termination on Render, Railway, Cloudflare, etc.
- **Dynamic Host & IP Resolution**:
  - Automatically respects `process.env.PORT` (defaults to 3000) and `process.env.HOST` (defaults to `0.0.0.0`).
  - No hardcoded IP or localhost addresses: dynamically builds room invite links and QR codes from the incoming request's host/origin.
- **Health Check Endpoint**:
  - `GET /health` returns `{ "status": "ok" }` with HTTP 200 for cloud orchestrators and uptime checks.

---

## 🃏 Game Features

- **PWA Mobile-First Interface**:
  - 390px baseline design, `100dvh` dynamic height, and safe-area inset support for notch/island screens.
  - 2×2 thumb-friendly action dock (Fold, Check/Call, Raise with slider/presets, and All-In).
  - 64×64px player avatars with unique pastel themes, name truncation (8 chars), and bold gold chip counters.
  - SVG circular countdown turn timer (30s) + top progress bar with urgent red pulse at 5s.
  - Mobile haptic vibration cues (`navigator.vibrate` on your turn, 5s warning, and winning the pot).
  - Slide-up bottom sheet table log & chat drawer.
- **Automated Blind System**:
  - Auto-rotates Dealer **(D)**, Small Blind **(SB)**, and Big Blind **(BB)** badges.
  - Automatically posts blinds at the start of each hand.
  - Supports standard Heads-Up (2-player) rules.
- **Multi-Way Side Pots**:
  - Mathematically accurate side-pot calculation when players go All-In with varying chip stacks.
- **Winner Award & Celebrations**:
  - Host winner selection per pot at Showdown.
  - Fullscreen celebration overlay with 50 CSS confetti particles and victory fanfare.
- **Mid-Game Rebuys & Final Ledger**:
  - Host can add chips to any player mid-game.
  - Final zero-sum leaderboard showing exact profit/loss ($+\text{chips} / -\text{chips}$) comparing ending chips to starting chips + rebuys.

---

## 🧪 Testing

```bash
# Run unit tests and real-time multiplayer simulation
npm test
```
All tests verify game logic, side pots, under-raise protection, host authentication, and real-time Socket.IO state synchronization.
