/**
 * scanner.js — menggunakan mcbe-leveldb
 *
 * mcbe-leveldb mengurus semua urusan key parsing dan Data3D/SubChunk parsing.
 * Kita tinggal pakai:
 *   - getKeysOfType(db, 'Data3D')           → semua keys yang punya heightmap
 *   - getChunkKeyIndices(key)               → decode { x, z, dimension }
 *   - generateChunkKeyFromIndices(...)       → encode key dari { x, z, dimension }
 *   - readData3dValue(rawValue)             → parse heightmap + biomes dari binary
 *   - getKeysOfType(db, 'SubChunkPrefix')   → fallback untuk world lama (pra-1.18)
 */

import {
  getKeysOfType,
  getChunkKeyIndices,
  generateChunkKeyFromIndices,
  readData3dValue,
} from 'mcbe-leveldb'

// ─── ChunkColumn ─────────────────────────────────────────────────────────────

export class ChunkColumn {
  constructor(x, z, dimension = 'overworld') {
    this.x = x
    this.z = z
    this.dimension = dimension

    /**
     * heightmap[x][z] = Y tinggi permukaan (number)
     * 16×16 tuple, diisi dari readData3dValue()
     * @type {number[][] | null}
     */
    this.heightmap = null

    /**
     * biomes = array of BiomePalette dari readData3dValue()
     * @type {import('mcbe-leveldb').BiomePalette[] | null}
     */
    this.biomes = null
  }
}

// ─── Scan semua chunk ─────────────────────────────────────────────────────────

/**
 * Scan semua chunk di world yang punya Data3D (1.18+).
 * Untuk world lama yang hanya punya SubChunkPrefix, fall back ke itu.
 *
 * @param {import('@8crafter/leveldb-zlib').LevelDB} db
 * @param {'overworld'|'nether'|'the_end'} dimension
 * @returns {Promise<Array<{x: number, z: number, dimension: string}>>}
 */
export async function scanExistingChunks(db, dimension = 'overworld') {
  // Coba Data3D dulu (world 1.18+)
  let keys = await getKeysOfType(db, 'Data3D')

  // Kalau kosong, fall back ke SubChunkPrefix (world lama)
  if (keys.length === 0) {
    keys = await getKeysOfType(db, 'SubChunkPrefix')
  }

  // Deduplicate (SubChunkPrefix bisa banyak per chunk karena ada Y index)
  const seen = new Map()
  for (const key of keys) {
    try {
      const indices = getChunkKeyIndices(key)
      if (indices.dimension !== dimension) continue
      const id = `${indices.x},${indices.z}`
      if (!seen.has(id)) {
        seen.set(id, { x: indices.x, z: indices.z, dimension: indices.dimension })
      }
    } catch {
      // Key tidak bisa di-decode — skip
    }
  }

  return Array.from(seen.values())
}

// ─── Load satu chunk ──────────────────────────────────────────────────────────

/**
 * Load heightmap + biomes untuk satu chunk dari Data3D.
 *
 * @param {import('@8crafter/leveldb-zlib').LevelDB} db
 * @param {number} x
 * @param {number} z
 * @param {'overworld'|'nether'|'the_end'} dimension
 * @returns {Promise<ChunkColumn>}
 */
export async function loadColumn(db, x, z, dimension = 'overworld') {
  const col = new ChunkColumn(x, z, dimension)

  // Build key untuk Data3D record
  const key = generateChunkKeyFromIndices({ x, z, dimension }, 'Data3D')

  const rawValue = await db.get(key)

  if (rawValue) {
    const parsed = readData3dValue(rawValue)
    if (parsed) {
      col.heightmap = parsed.heightMap   // [x][z] → number (Y tinggi)
      col.biomes    = parsed.biomes      // BiomePalette[]
    }
  }

  return col
}

// ─── Heightmap helper ─────────────────────────────────────────────────────────

/**
 * Ambil nilai height untuk posisi lokal (bx, bz) dalam satu chunk.
 * heightmap dari readData3dValue sudah dalam format [x][z].
 *
 * @param {ChunkColumn} col
 * @param {number} bx  0–15
 * @param {number} bz  0–15
 * @returns {number}
 */
export function getHeight(col, bx, bz) {
  if (!col.heightmap) return 64  // default sea level
  return col.heightmap[bx]?.[bz] ?? 64
}
