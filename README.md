# ♠️ Multiplayer Poker Chip Tracker (Local WiFi) ♣️

A real-time multiplayer poker chip tracker designed for friends playing physical poker games together on the same WiFi network. Use your phones as digital chip stacks, bet counters, side-pot calculators, and turn timers — without needing physical chips!

No database, no internet connection, and no logins required. Everything runs 100% locally on the host machine.

---

## 🚀 Quick Start

### 1. Install Dependencies & Start Server
```bash
npm install
npm start
```

### 2. Connect Over Same WiFi
When the server starts, it automatically detects your local network IP and displays:
- **Local machine URL**: `http://localhost:3000`
- **WiFi Network URL**: `http://192.168.x.x:3000`
- **Terminal QR Code**: Scan directly from terminal with phone camera!
- **In-Browser QR Code**: Displayed on the web app for easy 1-tap scanning.

Friends connect their phones to the **same WiFi network** and scan the QR code (or type the URL) to join instantly.

---

## 🌟 Core Features

- **Home Screen & 4-Digit Room Codes**:
  - Enter player name and click **Create Game** or **Join Game** with a 4-digit code.
  - URL link support: `http://192.168.x.x:3000?room=1234` auto-fills room code.
  - Seamless auto-reconnect: if a player refreshes their mobile browser, their seat, chip count, and role are instantly restored.

- **Game Setup (Host Only)**:
  - Customizable starting chips (default 1000).
  - Customizable small blind and big blind amounts (default 10 / 20).
  - Configurable 30-second turn timer (with options for 15s, 30s, 45s, 60s, or untimed).
  - Kick player option.
  - Starts once at least 2 players have joined.

- **Betting Table (Deep Green Felt)**:
  - Dark poker table theme with deep green felt, leather rail, and brass rivets.
  - Dynamic seat arrangement positioning each player at the bottom ("YOU") with opponents seated around the felt.
  - Colorful 3D poker chip stacks with realistic denominations:
    - 🪙 **1000**: Gold / Amber
    - 🟣 **500**: Purple
    - ⚫ **100**: Black
    - 🟢 **25**: Green
    - 🔴 **5**: Red
    - ⚪ **1**: White
  - Clear player cards showing chip count, active bet on felt, and last action.
  - **Glowing neon border** around the active player whose turn it is.
  - Action buttons: **Fold**, **Check**, **Call**, **Raise**, **All-In**.
  - Interactive Raise drawer with presets (`Min`, `2x`, `3x`, `½ Pot`, `Pot`, `Max`), slider, and `+` / `-` steppers for touch screens.

- **30-Second Turn Timer**:
  - Synchronized countdown progress bar.
  - Soft warning tick when timer falls under 5 seconds.
  - Auto-action on timeout: free check if no call is required; auto-folds if facing a bet.

- **Automated Blind System**:
  - Automatic rotation of Dealer **(D)**, Small Blind **(SB)**, and Big Blind **(BB)** badges.
  - Automatic deduction and posting of blinds at the start of each hand.
  - Correct Heads-Up (2-player) rules support (Dealer posts SB and acts first pre-flop).

- **Multi-Way Side Pot Support**:
  - Mathematically accurate side-pot calculation when players go All-In with different chip stacks.
  - Displays side pots breakdown (e.g., `Main Pot: 300`, `Side Pot 1: 400`).
  - Host winner selection modal displays eligible players per pot for precise chip distribution.

- **Winner Award & Celebrations**:
  - If all other players fold, the remaining player automatically wins the pot with celebratory fanfare.
  - At Showdown, host selects the winner(s) per pot or selects an overall winner.
  - Full-screen confetti celebration overlay with chip stack graphics and victory fanfare.

- **Mid-Game Player Rebuy**:
  - Host can add chips (+500, +1000, +2000, custom) to any player at any time.
  - Tracks total rebuys per player for accurate end-of-night accounting.

- **End of Night Summary & Zero-Sum Leaderboard**:
  - When the host ends the night, a final leaderboard ranks players by Net Profit / Loss:
    $$\text{Net Profit/Loss} = \text{Final Chips} - (\text{Starting Chips} + \text{Rebuys})$$
  - Color-coded: green (`+450`) for winners, red (`-200`) for losses.
  - The sum of all players' profit/loss always equals 0.

- **Real-Time Game Log & Table Chat**:
  - Scrollable chat-style event drawer showing all bets, raises, folds, and wins.
  - Table chat input for banter between friends.

- **Web Audio API Sound Effects (100% Offline)**:
  - Double wood knock for **Check**
  - Crisp ceramic chip clatter for **Bet / Raise / Call**
  - Smooth swoosh for **Fold**
  - Bass swell & chip push for **All-In**
  - Casino chime arpeggio for **Win**
  - Mute / Unmute toggle button in header.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.io, `qrcode`
- **Frontend**: Plain HTML5, CSS3 (Mobile-first, Flexbox/Grid/Elliptical transforms), Vanilla ES6 JavaScript
- **Audio**: Web Audio API (100% synthesized client-side, zero external sound files)
- **State**: In-memory server state
