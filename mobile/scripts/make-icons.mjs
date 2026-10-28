// App icons banata hai: node scripts/make-icons.mjs (mobile/ se)
// Source: assets/icon-src/machine.svg (JCB). sharp web/ ke node_modules se aata hai (Next ke saath install hota hai).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sharp = createRequire(join(root, '../web/package.json'))('sharp');
const assets = join(root, 'assets');

const machine = readFileSync(join(assets, 'icon-src/machine.svg'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
// Machine ka asli phailaav (bucket se bucket) — center aur scale isi se
const BOX = { x: 110, y: 270, w: 840, h: 530 };

function fit(width) {
  const scale = width / BOX.w;
  const tx = 512 - (BOX.x + BOX.w / 2) * scale;
  const ty = 540 - (BOX.y + BOX.h / 2) * scale;
  return `<g transform="translate(${tx} ${ty}) scale(${scale})">${machine}</g>`;
}

const background = `
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="#22327a"/>
      <stop offset="0.6" stop-color="#111c4e"/>
      <stop offset="1" stop-color="#080f30"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#f5a91b" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#f5a91b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="500" r="380" fill="url(#glow)"/>
  <g stroke="#f5a91b" stroke-opacity="0.10" stroke-width="22">
    <path d="M-40 940 L1064 760"/><path d="M-40 1010 L1064 830"/>
  </g>`;

const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${body}</svg>`);

const full = svg(`${background}${fit(860)}`);
// Android adaptive: launcher 66% safe zone ke bahar kaat deta hai — machine chhota rakho
const FG_WIDTH = 560;
const fg = svg(fit(FG_WIDTH));
const bg = svg(background);
// Themed icon (Android 13+): sirf safed silhouette, zameen ki parchhai nahi
const mono = svg(`<g style="filter:brightness(0) invert(1)">${fit(FG_WIDTH).replace(/<ellipse[^>]*\/>/, '')}</g>`);

const out = (buf, file, size) => sharp(buf).resize(size, size).png().toFile(join(assets, file));

await Promise.all([
  out(full, 'icon.png', 1024),
  out(full, 'splash-icon.png', 1024),
  out(full, 'favicon.png', 48),
  out(fg, 'android-icon-foreground.png', 512),
  out(bg, 'android-icon-background.png', 512),
  out(mono, 'android-icon-monochrome.png', 432),
]);
console.log('icons ban gaye → assets/');
