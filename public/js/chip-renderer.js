// Poker Chip Renderer & Animation Engine

const CHIP_DENOMINATIONS = [
  { value: 1000, color: 'chip-gold', label: '1K', bg: '#f59e0b', border: '#b45309', stripe: '#fef3c7' },
  { value: 500,  color: 'chip-purple', label: '500', bg: '#8b5cf6', border: '#6d28d9', stripe: '#ede9fe' },
  { value: 100,  color: 'chip-black', label: '100', bg: '#1f2937', border: '#111827', stripe: '#f3f4f6' },
  { value: 25,   color: 'chip-green', label: '25',  bg: '#10b981', border: '#047857', stripe: '#d1fae5' },
  { value: 5,    color: 'chip-red',   label: '5',   bg: '#ef4444', border: '#b91c1c', stripe: '#fee2e2' },
  { value: 1,    color: 'chip-white', label: '1',   bg: '#f8fafc', border: '#cbd5e1', stripe: '#64748b' }
];

function breakdownChips(amount) {
  let remaining = Math.max(0, Math.floor(amount));
  const counts = {};

  for (const denom of CHIP_DENOMINATIONS) {
    if (remaining >= denom.value) {
      const count = Math.floor(remaining / denom.value);
      // Cap individual visual stack height to 6 per denom to prevent overflow
      counts[denom.value] = Math.min(count, 5);
      remaining %= denom.value;
    }
  }

  // If amount > 0 but couldn't fit or remainder left
  if (Object.keys(counts).length === 0 && amount > 0) {
    counts[5] = 1;
  }
  return counts;
}

function renderChipHtml(denom, offset = 0) {
  return `
    <div class="poker-chip ${denom.color}" style="--offset: ${offset}px;">
      <div class="chip-inner">
        <span class="chip-val">${denom.label}</span>
      </div>
    </div>
  `;
}

function renderChipStack(amount) {
  if (!amount || amount <= 0) return '';
  const breakdown = breakdownChips(amount);
  let html = '<div class="chip-stacks-container">';

  for (const denom of CHIP_DENOMINATIONS) {
    const count = breakdown[denom.value];
    if (count > 0) {
      html += '<div class="chip-column">';
      for (let i = 0; i < count; i++) {
        html += renderChipHtml(denom, i * 4);
      }
      html += '</div>';
    }
  }

  html += '</div>';
  return html;
}

// Animate chips flying from one DOM element to another
function animateChipsFlight(sourceEl, targetEl, callback) {
  if (!sourceEl || !targetEl) {
    if (callback) callback();
    return;
  }

  const srcRect = sourceEl.getBoundingClientRect();
  const tgtRect = targetEl.getBoundingClientRect();

  const flyer = document.createElement('div');
  flyer.className = 'chip-flyer';
  flyer.innerHTML = `
    <div class="poker-chip chip-gold">
      <div class="chip-inner"></div>
    </div>
  `;

  document.body.appendChild(flyer);

  const startX = srcRect.left + srcRect.width / 2 - 16;
  const startY = srcRect.top + srcRect.height / 2 - 16;
  const endX = tgtRect.left + tgtRect.width / 2 - 16;
  const endY = tgtRect.top + tgtRect.height / 2 - 16;

  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.opacity = '1';

  // Force reflow
  flyer.getBoundingClientRect();

  flyer.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease';
  flyer.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.9)`;

  if (window.pokerAudio) {
    window.pokerAudio.playChipSound();
  }

  setTimeout(() => {
    flyer.remove();
    if (callback) callback();
  }, 500);
}

window.breakdownChips = breakdownChips;
window.renderChipStack = renderChipStack;
window.animateChipsFlight = animateChipsFlight;
