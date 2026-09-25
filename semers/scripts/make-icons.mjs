// Generates favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512.png and logo.png from the apple mark.
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';

const mark = (bg, pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  ${bg ? `<rect width="32" height="32" rx="7" fill="${bg}"/>` : ''}
  <g transform="translate(${pad} ${pad}) scale(${(32 - 2 * pad) / 32})">
    <path d="M16 6.5c3.2-3.4 8.6-2.6 10.3 1.3.8 2 .6 4.5-.5 7.5-1.6 4.6-4.6 8.9-8.1 10.7-1.1.6-2.3.6-3.4 0C10.8 24.2 7.8 19.9 6.2 15.3c-1.1-3-1.3-5.5-.5-7.5C7.4 3.9 12.8 3.1 16 6.5Z" fill="#d62839"/>
    <path d="M16.4 7.2c.3-2.9 2.1-4.7 4.9-5.2-.2 2.8-1.9 4.7-4.9 5.2Z" fill="#4c8c3b"/>
    <path d="M12.6 10.2c.9-1.8 2.7-2.4 4.1-1.6" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;

mkdirSync('public', { recursive: true });
writeFileSync('public/favicon.svg', mark(null));
const png = (svg, size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();

const p32 = await png(mark(null), 32);
// ICO container wrapping a single PNG entry (supported by all modern browsers).
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16); entry[0] = 32; entry[1] = 32; entry[2] = 0; entry[3] = 0; entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6); entry.writeUInt32LE(p32.length, 8); entry.writeUInt32LE(22, 12);
writeFileSync('public/favicon.ico', Buffer.concat([header, entry, p32]));

writeFileSync('public/apple-touch-icon.png', await png(mark('#faf3e4', 3), 180));
writeFileSync('public/icon-192.png', await png(mark('#faf3e4', 4), 192));
writeFileSync('public/icon-512.png', await png(mark('#faf3e4', 4), 512));

// Square logo for schema.org (wordmark on cream).
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#faf3e4"/>
  <g transform="translate(96 60) scale(10)">
    <path d="M16 6.5c3.2-3.4 8.6-2.6 10.3 1.3.8 2 .6 4.5-.5 7.5-1.6 4.6-4.6 8.9-8.1 10.7-1.1.6-2.3.6-3.4 0C10.8 24.2 7.8 19.9 6.2 15.3c-1.1-3-1.3-5.5-.5-7.5C7.4 3.9 12.8 3.1 16 6.5Z" fill="#d62839"/>
    <path d="M16.4 7.2c.3-2.9 2.1-4.7 4.9-5.2-.2 2.8-1.9 4.7-4.9 5.2Z" fill="#4c8c3b"/>
    <path d="M12.6 10.2c.9-1.8 2.7-2.4 4.1-1.6" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  </g>
  <text x="256" y="430" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="112" fill="#1b1612" letter-spacing="-4">Semers</text>
</svg>`;
writeFileSync('public/logo.png', await png(logo, 512));
console.log('icons written');
