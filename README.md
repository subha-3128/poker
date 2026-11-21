# ♠️ Poker Night — Real-Time Chip Tracker

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://poker-flgj.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://poker-flgj.onrender.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F5A623?style=for-the-badge)](LICENSE)

> **Play Live Now**: [https://poker-flgj.onrender.com/](https://poker-flgj.onrender.com/)

A real-time multiplayer poker chip tracker designed for home games with physical cards. Turn your phones into synchronized digital chip stacks, pot calculators, and bet trackers — no physical chips, accounts, or database required.

---

## ⚡ Highlights

- **Zero-Friction Multiplayer** — Join instantly via 4-digit room code or in-browser QR code. No sign-ups.
- **Accurate Pot Engine** — Automatic multi-way side pots, under-raise all-in protection, and blind rotations (Dealer, SB, BB).
- **Mobile-First PWA** — Installable to home screen on iOS and Android with standalone fullscreen display and offline shell caching.
- **Action Controls** — 2×2 thumb-friendly dock (Fold, Check/Call, Raise with custom slider/presets, and All-In).
- **Untimed, Relaxed Play** — No countdown stress or auto-folds; players act comfortably on their own turn.
- **Host Tools** — Mid-game chip rebuys, kick player controls, and pot winner designation.
- **End-of-Night Ledger** — Final zero-sum summary tracking exact profit and loss ($+\text{chips} / -\text{chips}$) for every player.

---

## 🚀 How It Works

1. **Host** opens [https://poker-flgj.onrender.com/](https://poker-flgj.onrender.com/), enters a name, and taps **Create Table**.
2. **Players** scan the table's QR code or enter the 4-digit room code to join.
3. Deal real physical cards, and let the app manage bets, pots, and payouts!

---

## 💻 Local Development (Same Wi-Fi)

Runs completely offline on your local network:

```bash
# Clone repository
git clone https://github.com/subha-3128/poker.git
cd poker

# Install dependencies & start
npm install
npm start
```

The console will display your local IP and print a terminal QR code. Friends connected to the same Wi-Fi can scan and join immediately.

---

## ☁️ Deployment

### Render (Zero Configuration)
Connected via [`render.yaml`](render.yaml):
1. Connect your repository on [render.com](https://render.com).
2. Render automatically detects the Node environment, runs `npm install`, and starts the service.
3. Health check path: `/health`.

### Railway / Other Cloud Hosts
- Listens on `process.env.PORT` (defaults to `3000`) and binds to `0.0.0.0`.
- Express trust-proxy enabled for SSL termination and reverse proxies.
- Includes `GET /health` endpoint returning `{"status":"ok"}`.

---

## 🧪 Testing

```bash
# Run unit tests and real-time multiplayer integration tests
npm test
```

Verifies side-pot math, blind rotation, host authentication, and Socket.IO real-time synchronization.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Server** | Node.js, Express, Socket.IO |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Audio & Graphics** | Web Audio API, Canvas API, Vector SVGs |
| **State** | In-memory game state machine (zero database overhead) |
| **Typography** | Cinzel, Playfair Display, Inter |

---

## 📄 License

[MIT](LICENSE)
