const os = require('os');
const QRCode = require('qrcode');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Look for IPv4, non-internal (not 127.0.0.1)
      if ((net.family === 'IPv4' || net.family === 4) && !net.internal) {
        // Prefer en0 / wlan0 / Wi-Fi interfaces or 192.168.x.x / 10.x.x.x
        candidates.push({
          name,
          address: net.address,
          isPrivate: /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(net.address)
        });
      }
    }
  }

  // Prioritize private Wi-Fi/LAN addresses
  const preferred = candidates.find(c => c.isPrivate && (c.name.startsWith('en') || c.name.startsWith('wl') || c.name.includes('wi-fi') || c.name.includes('wlan')));
  if (preferred) return preferred.address;

  const anyPrivate = candidates.find(c => c.isPrivate);
  if (anyPrivate) return anyPrivate.address;

  if (candidates.length > 0) return candidates[0].address;

  return '127.0.0.1';
}

async function generateQrDataUrl(url) {
  try {
    return await QRCode.toDataURL(url, {
      margin: 2,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
}

module.exports = {
  getLocalIpAddress,
  generateQrDataUrl
};
