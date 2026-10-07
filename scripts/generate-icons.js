import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, body, crcBuf]);
}

function generatePng(size) {
  const width = size;
  const height = size;

  // IHDR: 13 bytes
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const scanlines = [];

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(width * 4 + 1);
    row[0] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      
      const nx = x / (width - 1);
      const ny = y / (height - 1);
      
      const cx = (nx - 0.5) * 2;
      const cy = (ny - 0.5) * 2;
      const dist = Math.sqrt(cx * cx + cy * cy);

      // Deep Indigo background
      const r = 79;
      const g = 70;
      const b = 229;

      // Verification checkmark
      // Vector 1: (0.30, 0.52) to (0.46, 0.68)
      // Vector 2: (0.46, 0.68) to (0.74, 0.36)
      const d1 = Math.abs((ny - 0.52) - (nx - 0.30));
      const inLine1 = d1 < 0.09 && nx >= 0.28 && nx <= 0.48 && ny >= 0.48 && ny <= 0.70;

      const d2 = Math.abs((ny - 0.68) + (nx - 0.46) * 1.14);
      const inLine2 = d2 < 0.09 && nx >= 0.44 && nx <= 0.76 && ny >= 0.34 && ny <= 0.70;

      if (dist > 1.32) {
        // Transparent outside rounded squircle
        row[idx] = 0;
        row[idx + 1] = 0;
        row[idx + 2] = 0;
        row[idx + 3] = 0;
      } else if (inLine1 || inLine2) {
        // Bright white checkmark
        row[idx] = 255;
        row[idx + 1] = 255;
        row[idx + 2] = 255;
        row[idx + 3] = 255;
      } else {
        // Crisp indigo squircle background
        row[idx] = r;
        row[idx + 1] = g;
        row[idx + 2] = b;
        row[idx + 3] = 255;
      }
    }
    scanlines.push(row);
  }

  const rawData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(rawData);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

[16, 32, 48, 128].forEach((size) => {
  const buf = generatePng(size);
  const filePath = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`Generated ${filePath} (${buf.length} bytes)`);
});
