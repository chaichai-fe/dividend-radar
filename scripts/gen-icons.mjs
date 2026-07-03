import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svg = readFileSync(join(__dirname, 'icon.svg'))
const outDir = join(__dirname, '..', 'public')

const targets = [
  { file: 'logo192.png', size: 192 },
  { file: 'logo512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'maskable-512.png', size: 512 },
  { file: 'favicon-32.png', size: 32 },
]

for (const { file, size } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(outDir, file))
  console.log(`✓ ${file} (${size}x${size})`)
}
