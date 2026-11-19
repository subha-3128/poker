const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPng(width, height, drawFn) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    raw[rowOffset] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(raw);

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function drawChip(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const rOuter = width * 0.42;
  const rRim = width * 0.35;
  const rInner = width * 0.28;
  const rCore = width * 0.20;

  // Background: Deep black #0a0a0a
  if (dist > rOuter) {
    return [10, 10, 10, 255];
  }

  // Outer chip edge anti-aliasing
  if (dist > rOuter - 2) {
    const t = (rOuter - dist) / 2;
    return [Math.floor(180 * t + 10 * (1 - t)), Math.floor(140 * t + 10 * (1 - t)), 10, 255];
  }

  // Chip Rim: Gold with radial shading
  if (dist > rRim) {
    const angle = Math.atan2(dy, dx);
    const modAngle = ((angle + Math.PI * 2) % (Math.PI / 4)) - (Math.PI / 8);
    // Dashed rim stripes (white edge tabs at 8 intervals)
    if (Math.abs(modAngle) < 0.12) {
      return [255, 250, 220, 255]; // Cream-white tab
    }
    // Gold gradient
    const factor = (dist - rRim) / (rOuter - rRim);
    const r = Math.floor(255 - 40 * factor);
    const g = Math.floor(215 - 55 * factor);
    const b = Math.floor(30 * (1 - factor));
    return [r, g, b, 255];
  }

  // Intermediate ring
  if (dist > rInner) {
    return [184, 134, 11, 255]; // Dark goldenrod border
  }

  // Inner ring with dashed circle
  if (dist > rCore) {
    const angle = Math.atan2(dy, dx);
    const dashMod = Math.sin(angle * 16);
    if (dist > rInner - 4 && dashMod > 0.3) {
      return [255, 255, 255, 255];
    }
    return [255, 215, 0, 255]; // Pure Gold #FFD700
  }

  // Core center: Deep dark emerald or black with Gold Spade
  const spadeDx = dx / rCore;
  const spadeDy = (dy + rCore * 0.15) / rCore;

  // Spade shape approximation:
  // Heart upside down + stem
  const absX = Math.abs(spadeDx);
  const inStem = absX < 0.12 && spadeDy > 0.2 && spadeDy < 0.65;
  const inStemBase = absX < 0.35 && spadeDy >= 0.55 && spadeDy <= 0.7;
  
  // Heart lobes: (x^2 + y^2 - 0.4)^3 - x^2 * y^3 < 0
  const py = -spadeDy * 1.3 - 0.1;
  const px = spadeDx * 1.3;
  const inSpadeLobe = (px * px + py * py - 0.4) ** 3 - px * px * py * py * py < 0;

  if (inSpadeLobe || inStem || inStemBase) {
    return [255, 215, 0, 255]; // Gold Spade symbol
  }

  return [14, 20, 16, 255]; // Deep dark core
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons...');
const icon192 = createPng(192, 192, drawChip);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);
console.log('✅ Generated public/icons/icon-192.png');

const icon512 = createPng(512, 512, drawChip);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);
console.log('✅ Generated public/icons/icon-512.png');
