// Web Audio API Synthesizer for Poker Sound Effects
// 100% offline, zero external dependencies, works across all browsers & devices

class PokerAudio {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('poker_sound_enabled') !== 'false';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('poker_sound_enabled', this.enabled ? 'true' : 'false');
    if (this.enabled) {
      this.init();
      this.playChipSound();
    }
    return this.enabled;
  }

  // Knock / Check Sound (Two quick muted knocks)
  playCheck() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const playKnock = (delay) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + delay + 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.7, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + 0.08);
    };

    playKnock(0);
    playKnock(0.12);
  }

  // Chip Clink / Bet / Call Sound (Crisp ceramic chip resonance)
  playChipSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const frequencies = [2400, 3100, 4200];
    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 80 - 40), this.ctx.currentTime + idx * 0.02);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.02 + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.02);
      osc.stop(this.ctx.currentTime + idx * 0.02 + 0.1);
    });
  }

  // Card Fold / Slide Sound (Soft swoosh)
  playFold() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.12);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(this.ctx.currentTime);
  }

  // All-In Dramatic Sound
  playAllIn() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Power bass swell + chip shuffle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.2);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);

    setTimeout(() => this.playChipSound(), 100);
    setTimeout(() => this.playChipSound(), 200);
  }

  // Win Fanfare (Pleasant celebratory casino arpeggio)
  playWinFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.1);
      osc.stop(this.ctx.currentTime + idx * 0.1 + 0.4);
    });
  }

  // Timer Tick (soft warning click)
  playTimerTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

window.pokerAudio = new PokerAudio();

// Unlock Web Audio API on first user interaction on mobile browsers
document.addEventListener('pointerdown', () => {
  window.pokerAudio.init();
}, { once: true });
document.addEventListener('keydown', () => {
  window.pokerAudio.init();
}, { once: true });
