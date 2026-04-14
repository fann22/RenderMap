// Bedrock chunk key tags (mirrors chunk/key.go)
export const TAG_SUB_CHUNK       = 0x2F
export const TAG_DATA_2D         = 0x2D
export const TAG_DATA_3D         = 0x2B
export const TAG_CHUNK_VERSION   = 0x2C
export const TAG_FINALIZED_STATE = 0x3A

export const DIM_OVERWORLD = 0
export const DIM_NETHER    = 1
export const DIM_END       = 2

/**
 * Build a LevelDB key for a Bedrock chunk record.
 * Overworld: [x i32 LE][z i32 LE][tag u8]          = 9 bytes
 * Other dim: [x i32 LE][z i32 LE][dim i32 LE][tag]  = 13 bytes
 */
export function chunkKey(x, z, tag, dim = DIM_OVERWORLD) {
  if (dim === DIM_OVERWORLD) {
    const buf = Buffer.allocUnsafe(9)
    buf.writeInt32LE(x, 0)
    buf.writeInt32LE(z, 4)
    buf.writeUInt8(tag, 8)
    return buf
  }
  const buf = Buffer.allocUnsafe(13)
  buf.writeInt32LE(x, 0)
  buf.writeInt32LE(z, 4)
  buf.writeInt32LE(dim, 8)
  buf.writeUInt8(tag, 12)
  return buf
}

/**
 * Build a SubChunk key — appends yIndex byte after the tag byte.
 */
export function subChunkKey(x, z, yIndex, dim = DIM_OVERWORLD) {
  const base = chunkKey(x, z, TAG_SUB_CHUNK, dim)
  const buf = Buffer.allocUnsafe(base.length + 1)
  base.copy(buf)
  buf.writeInt8(yIndex, base.length)
  return buf
}

/**
 * Try to decode X, Z from a raw key buffer (overworld layout).
 * Returns null if key is too short.
 */
export function decodeChunkXZ(key) {
  if (key.length < 9) return null
  return {
    x:   key.readInt32LE(0),
    z:   key.readInt32LE(4),
    tag: key.readUInt8(8),
  }
}

/** True if this key looks like an overworld chunk key (9 or 10 bytes). */
export function isOverworldChunkKey(key) {
  return key.length === 9 || key.length === 10
}
