import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svg = readFileSync(join(root, 'public/icon.svg'))

// PWA manifest PNGs
for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(join(root, `public/icon-${size}.png`))
  console.log(`✓ icon-${size}.png`)
}

// favicon.ico — 32x32 PNG wrapped in ICO container
const png32 = await sharp(svg).resize(32, 32).png().toBuffer()

function makeSingleIco(pngBuf) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)  // reserved
  header.writeUInt16LE(1, 2)  // type: icon
  header.writeUInt16LE(1, 4)  // image count

  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0)               // width
  entry.writeUInt8(32, 1)               // height
  entry.writeUInt8(0, 2)                // color count
  entry.writeUInt8(0, 3)                // reserved
  entry.writeUInt16LE(1, 4)             // planes
  entry.writeUInt16LE(32, 6)            // bit depth
  entry.writeUInt32LE(pngBuf.length, 8) // image data size
  entry.writeUInt32LE(22, 12)           // offset: 6 + 16

  return Buffer.concat([header, entry, pngBuf])
}

writeFileSync(join(root, 'src/app/favicon.ico'), makeSingleIco(png32))
console.log('✓ favicon.ico (32x32 PNG-in-ICO)')
