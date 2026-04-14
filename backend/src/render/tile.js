/**
 * tile.js — render ChunkColumn ke PNG tile
 *
 * Versi ini menggunakan heightmap yang sudah diparse oleh mcbe-leveldb
 * via readData3dValue(), jadi tidak perlu parse SubChunk manual lagi.
 *
 * Heightmap-based rendering: warna berdasarkan tinggi blok (Y value),
 * dengan shading gelap-terang untuk efek topografi seperti Chunkbase.
 */

import sharp from 'sharp'
import { blockColor, biomeColor } from './colors.js'
import { getHeight, getBiome } from '../chunk/scanner.js'


export const PIXELS_PER_BLOCK = 4
export const CHUNK_PIXELS     = 16 * PIXELS_PER_BLOCK  // 64px per chunk

// ─── Heightmap color mapping ──────────────────────────────────────────────────

/**
 * Konversi ketinggian Y ke warna RGBA.
 * Menggunakan gradient topografi seperti peta kontur:
 *   - Bawah laut (< 63): biru
 *   - Pantai (63–68): pasir/kuning
 *   - Dataran (69–80): hijau
 *   - Bukit (81–120): hijau tua
 *   - Pegunungan (121–180): abu-abu
 *   - Puncak (> 180): putih/salju
 */
function heightToColor(y) {
  if (y < 0)   return [20, 20, 60, 255]    // void / bedrock
  if (y < 50)  return [30, 60, 120, 255]   // dalam laut
  if (y < 63)  return [50, 100, 180, 255]  // laut dangkal
  if (y < 65)  return [200, 185, 130, 255] // pantai / pasir
  if (y < 70)  return [140, 170, 80, 255]  // dataran rendah
  if (y < 85)  return [100, 145, 60, 255]  // padang
  if (y < 110) return [80, 120, 45, 255]   // bukit
  if (y < 140) return [110, 100, 80, 255]  // lereng
  if (y < 170) return [140, 130, 120, 255] // batu gunung
  if (y < 200) return [185, 185, 190, 255] // puncak batu
  return [230, 235, 245, 255]              // salju / puncak tertinggi
}

/**
 * Shading berdasarkan perbedaan ketinggian antar blok tetangga
 * (simulasi arah cahaya dari atas-kiri), memberi efek relief topografi.
 *
 * @param {number[][]} heightmap  [x][z] dari ChunkColumn
 * @param {number} bx
 * @param {number} bz
 * @returns {number} faktor brightness 0.7–1.15
 */
function getSlopeBrightness(heightmap, bx, bz) {
  if (!heightmap) return 1.0
  const h     = heightmap[bx]?.[bz]     ?? 64
  const hLeft = heightmap[bx - 1]?.[bz] ?? h
  const hUp   = heightmap[bx]?.[bz - 1] ?? h
  const slope = (h - hLeft) + (h - hUp)
  // clamp ke -4..+4, map ke brightness 0.75..1.15
  const clamped = Math.max(-4, Math.min(4, slope))
  return 1.0 + clamped * 0.05
}

// ─── Raw RGBA buffer writer ───────────────────────────────────────────────────

function writeBlockPixels(buf, imgWidth, px, pz, rgba) {
  const [r, g, b, a] = rgba
  for (let dx = 0; dx < PIXELS_PER_BLOCK; dx++) {
    for (let dz = 0; dz < PIXELS_PER_BLOCK; dz++) {
      const off = ((pz + dz) * imgWidth + (px + dx)) * 4
      buf[off]     = r
      buf[off + 1] = g
      buf[off + 2] = b
      buf[off + 3] = a
    }
  }
}

function applyBrightness(rgba, factor) {
  return [
    Math.min(255, Math.round(rgba[0] * factor)),
    Math.min(255, Math.round(rgba[1] * factor)),
    Math.min(255, Math.round(rgba[2] * factor)),
    rgba[3],
  ]
}

// ─── Single chunk tile ────────────────────────────────────────────────────────

/**
 * Render satu ChunkColumn ke PNG (64×64 px default).
 *
 * @param {import('../chunk/scanner.js').ChunkColumn} col
 * @returns {Promise<Buffer>}
 */
export async function renderChunkTile(col) {
  const size = CHUNK_PIXELS
  const buf  = Buffer.alloc(size * size * 4, 0)

  for (let bx = 0; bx < 16; bx++) {
    for (let bz = 0; bz < 16; bz++) {
      const biomeId    = getBiome(col, bx, bz)
      const baseColor  = biomeColor(biomeId)
      const brightness = getSlopeBrightness(col.heightmap, bx, bz)
      const color      = applyBrightness(baseColor, brightness)

      writeBlockPixels(buf, size, bx * PIXELS_PER_BLOCK, bz * PIXELS_PER_BLOCK, color)
    }
  }

  return sharp(buf, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer()
}

// ─── Region tile ─────────────────────────────────────────────────────────────

/**
 * Render region (regionSize × regionSize chunk) ke satu PNG tile.
 *
 * @param {Map<string, import('../chunk/scanner.js').ChunkColumn>} cols  key="x,z"
 * @param {number} regionX
 * @param {number} regionZ
 * @param {number} regionSize  default 32
 * @returns {Promise<Buffer>}
 */
export async function renderRegionTile(cols, regionX, regionZ, regionSize = 32) {
  const imgSize   = regionSize * CHUNK_PIXELS
  const buf       = Buffer.alloc(imgSize * imgSize * 4, 0)  // transparan
  const baseChunkX = regionX * regionSize
  const baseChunkZ = regionZ * regionSize

  for (let cz = 0; cz < regionSize; cz++) {
    for (let cx = 0; cx < regionSize; cx++) {
      const col = cols.get(`${baseChunkX + cx},${baseChunkZ + cz}`)
      if (!col) continue

      const imgOffX = cx * CHUNK_PIXELS
      const imgOffZ = cz * CHUNK_PIXELS

      for (let bx = 0; bx < 16; bx++) {
        for (let bz = 0; bz < 16; bz++) {
          const biomeId    = getBiome(col, bx, bz)
          const baseColor  = biomeColor(biomeId)
          const brightness = getSlopeBrightness(col.heightmap, bx, bz)
          const color      = applyBrightness(baseColor, brightness)

          writeBlockPixels(
            buf, imgSize,
            imgOffX + bx * PIXELS_PER_BLOCK,
            imgOffZ + bz * PIXELS_PER_BLOCK,
            color,
          )
        }
      }
    }
  }

  return sharp(buf, { raw: { width: imgSize, height: imgSize, channels: 4 } })
    .png()
    .toBuffer()
}
