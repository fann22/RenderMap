/**
 * parser.js — port of chunk/parser.go
 *
 * Parses Bedrock Edition SubChunk records (version 8 & 9, palette-based)
 * and extracts block names from the palette NBT.
 *
 * SubChunk binary layout:
 *   [version u8]
 *   [storageCount u8]
 *   (version 9 only) [uIndex u8]  -- Y chunk index, ignored
 *   For each storage layer:
 *     [bitsPerBlockByte u8]  -- bits-per-block << 1 | isPersistent
 *     [wordCount × u32 LE]   -- packed block indices
 *     [paletteSize i32 LE]
 *     [paletteSize × NBT compound]  -- each has "name" TAG_String
 */

// ─── NBT mini-reader (little-endian, Bedrock style) ──────────────────────────

const TAG_END       = 0x00
const TAG_BYTE      = 0x01
const TAG_SHORT     = 0x02
const TAG_INT       = 0x03
const TAG_LONG      = 0x04
const TAG_FLOAT     = 0x05
const TAG_DOUBLE    = 0x06
const TAG_BYTE_ARR  = 0x07
const TAG_STRING    = 0x08
const TAG_LIST      = 0x09
const TAG_COMPOUND  = 0x0A
const TAG_INT_ARR   = 0x0B
const TAG_LONG_ARR  = 0x0C

class Reader {
  constructor(buf) {
    this.buf = buf
    this.pos = 0
  }

  readUInt8()  { return this.buf.readUInt8(this.pos++) }
  readInt8()   { return this.buf.readInt8(this.pos++) }

  readUInt16BE() {
    const v = this.buf.readUInt16BE(this.pos)
    this.pos += 2
    return v
  }

  readInt32LE() {
    const v = this.buf.readInt32LE(this.pos)
    this.pos += 4
    return v
  }

  readUInt32LE() {
    const v = this.buf.readUInt32LE(this.pos)
    this.pos += 4
    return v
  }

  skip(n) { this.pos += n }

  readBytes(n) {
    const slice = this.buf.slice(this.pos, this.pos + n)
    this.pos += n
    return slice
  }

  // NBT string: u16BE length + UTF-8 bytes
  readNBTString() {
    const len = this.readUInt16BE()
    return this.readBytes(len).toString('utf8')
  }

  // Skip NBT string without decoding
  skipNBTString() {
    const len = this.readUInt16BE()
    this.skip(len)
  }
}

/**
 * Skip an NBT value of the given tag type (without decoding).
 */
function skipNBTValue(r, tagType) {
  switch (tagType) {
    case TAG_BYTE:     r.skip(1); break
    case TAG_SHORT:    r.skip(2); break
    case TAG_INT:      r.skip(4); break
    case TAG_LONG:     r.skip(8); break
    case TAG_FLOAT:    r.skip(4); break
    case TAG_DOUBLE:   r.skip(8); break
    case TAG_BYTE_ARR: { const l = r.readInt32LE(); r.skip(l); break }
    case TAG_STRING:   r.skipNBTString(); break
    case TAG_LIST: {
      const elemType = r.readUInt8()
      const count    = r.readInt32LE()
      for (let i = 0; i < count; i++) skipNBTValue(r, elemType)
      break
    }
    case TAG_COMPOUND: {
      // Compound inside a compound: no name prefix here (already consumed by caller)
      // But nested compounds DO have a name prefix for each field:
      for (;;) {
        const ft = r.readUInt8()
        if (ft === TAG_END) break
        r.skipNBTString()  // field name
        skipNBTValue(r, ft)
      }
      break
    }
    case TAG_INT_ARR:  { const l = r.readInt32LE(); r.skip(l * 4); break }
    case TAG_LONG_ARR: { const l = r.readInt32LE(); r.skip(l * 8); break }
    default:
      throw new Error(`Unknown NBT tag type: ${tagType}`)
  }
}

/**
 * Read one NBT compound that represents a palette entry.
 * We only care about the "name" TAG_String field.
 *
 * Expected structure (root TAG_Compound):
 *   [0x0A] [u16BE nameLen][name bytes]   ← root compound tag+name
 *   Fields until TAG_END:
 *     [tagType][u16BE fieldNameLen][fieldName]...[value]
 */
function readNBTBlockName(r) {
  const tagType = r.readUInt8()
  if (tagType !== TAG_COMPOUND) {
    throw new Error(`Expected TAG_Compound (10), got ${tagType} at pos ${r.pos - 1}`)
  }
  r.skipNBTString()  // root compound name (usually empty)

  let name = ''
  for (;;) {
    const fieldType = r.readUInt8()
    if (fieldType === TAG_END) break

    const fieldName = r.readNBTString()

    if (fieldName === 'name') {
      name = r.readNBTString()
    } else {
      skipNBTValue(r, fieldType)
    }
  }
  return name
}

// ─── Palette storage parser ───────────────────────────────────────────────────

/**
 * Parse one BlockStorage layer.
 * Returns { indices: Uint16Array(4096), palette: string[] }
 */
function parsePaletteStorage(r) {
  const bitsPerBlockByte = r.readUInt8()
  const bitsPerBlock     = bitsPerBlockByte >> 1
  // isPersistent = bitsPerBlockByte & 1  (not needed for reading)

  if (bitsPerBlock === 0) {
    // All blocks identical — palette has exactly 1 entry
    const paletteSize = r.readInt32LE()
    const palette = []
    for (let i = 0; i < paletteSize; i++) {
      palette.push(readNBTBlockName(r))
    }
    return { indices: new Uint16Array(4096), palette }
  }

  const blocksPerWord = Math.floor(32 / bitsPerBlock)
  const wordCount     = Math.ceil(4096 / blocksPerWord)

  const words = new Uint32Array(wordCount)
  for (let i = 0; i < wordCount; i++) {
    words[i] = r.readUInt32LE()
  }

  const paletteSize = r.readInt32LE()
  const palette = []
  for (let i = 0; i < paletteSize; i++) {
    palette.push(readNBTBlockName(r))
  }

  const mask    = (1 << bitsPerBlock) - 1
  const indices = new Uint16Array(4096)
  for (let i = 0; i < 4096; i++) {
    const wordIndex = Math.floor(i / blocksPerWord)
    const bitIndex  = (i % blocksPerWord) * bitsPerBlock
    indices[i] = (words[wordIndex] >>> bitIndex) & mask
  }

  return { indices, palette }
}

// ─── SubChunk ────────────────────────────────────────────────────────────────

/**
 * SubChunk holds 16×16×16 block names.
 * blocks[x][y][z] = string block name ('' means air/missing)
 */
export class SubChunk {
  constructor(yIndex) {
    this.yIndex = yIndex
    // Flat Uint8Array for block name indices (x*256 + y*16 + z)
    // We store a parallel palette array
    this.palette = ['']   // index 0 = air
    this.indices = new Uint16Array(4096)  // default = 0 (air)
  }

  /** Get block name at local (x, y, z) within subchunk */
  blockAt(x, y, z) {
    return this.palette[this.indices[x * 256 + y * 16 + z]] ?? ''
  }

  /**
   * Returns top-most non-air block name per (x, z) column within this subchunk.
   * '' means entire column is air.
   */
  topBlocks() {
    const top = new Array(256).fill('')
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        for (let y = 15; y >= 0; y--) {
          const name = this.blockAt(x, y, z)
          if (name && name !== 'minecraft:air') {
            top[x * 16 + z] = name
            break
          }
        }
      }
    }
    return top
  }
}

/**
 * Parse a raw SubChunk value from LevelDB.
 * Supports versions 8 and 9 (palette-based).
 *
 * @param {Buffer} data
 * @param {number} yIndex
 * @returns {SubChunk}
 */
export function parseSubChunk(data, yIndex) {
  if (!data || data.length === 0) {
    throw new Error('Empty sub-chunk data')
  }

  const r = new Reader(data)
  const version = r.readUInt8()

  const sc = new SubChunk(yIndex)

  if (version !== 8 && version !== 9) {
    throw new Error(`Unsupported sub-chunk version: ${version}`)
  }

  const storageCount = r.readUInt8()

  if (version === 9) {
    r.skip(1)  // uIndex — Y chunk index, unused
  }

  if (storageCount === 0) {
    return sc  // empty chunk, all air
  }

  // Parse layer 0 (solid blocks) only — layer 1 is waterlogged/snow
  const { indices, palette } = parsePaletteStorage(r)

  sc.palette = palette
  sc.indices = indices

  return sc
}
