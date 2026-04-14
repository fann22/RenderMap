/**
 * handler.js — Express route handlers
 * Diupdate untuk pakai mcbe-leveldb (LevelDB dari @8crafter/leveldb-zlib)
 */

import { scanExistingChunks, loadColumn } from '../chunk/scanner.js'
import { renderChunkTile, renderRegionTile } from '../render/tile.js'

const REGION_SIZE      = 32
const REFRESH_INTERVAL = 30_000

export class Handler {
  /**
   * @param {import('@8crafter/leveldb-zlib').LevelDB} db
   * @param {import('./ws.js').WSHub} wsHub
   */
  constructor(db, wsHub) {
    this.db    = db
    this.wsHub = wsHub

    this.chunkCache = []
    this.lastScan   = null

    this._refresh()
    setInterval(() => this._refresh(), REFRESH_INTERVAL)
  }

  async _refresh() {
    try {
      const chunks = await scanExistingChunks(this.db)
      const prev   = this.chunkCache.length
      this.chunkCache = chunks
      this.lastScan   = new Date()

      if (chunks.length !== prev) {
        this.wsHub.broadcast({ type: 'update', count: chunks.length })
        console.log(`[scan] ${chunks.length} chunks (was ${prev})`)
      }
    } catch (err) {
      console.error('[scan] error:', err)
    }
  }

  // ─── GET /api/chunks ───────────────────────────────────────────────────────

  listChunks(req, res) {
    res.json(this.chunkCache.map(({ x, z }) => ({ x, z })))
  }

  // ─── GET /api/stats ────────────────────────────────────────────────────────

  serveStats(req, res) {
    const chunks = this.chunkCache
    let minX = 0, maxX = 0, minZ = 0, maxZ = 0

    if (chunks.length > 0) {
      minX = maxX = chunks[0].x
      minZ = maxZ = chunks[0].z
      for (const { x, z } of chunks) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (z < minZ) minZ = z
        if (z > maxZ) maxZ = z
      }
    }

    res.json({
      totalChunks: chunks.length,
      bounds: { minX, maxX, minZ, maxZ },
      lastScan: this.lastScan,
    })
  }

  // ─── GET /api/tile/:x/:z ──────────────────────────────────────────────────

  async serveTile(req, res) {
    const x = parseInt(req.params.x, 10)
    const z = parseInt(req.params.z, 10)
    if (isNaN(x) || isNaN(z)) return res.status(400).send('invalid coords')

    try {
      const col = await loadColumn(this.db, x, z)
      const png = await renderChunkTile(col)
      res.set('Content-Type', 'image/png')
      res.set('Cache-Control', 'public, max-age=60')
      res.send(png)
    } catch (err) {
      console.error(`[tile] ${x},${z}:`, err)
      res.status(500).send(String(err))
    }
  }

  // ─── GET /api/region/:rx/:rz ──────────────────────────────────────────────

  async serveRegionTile(req, res) {
    const rx = parseInt(req.params.rx, 10)
    const rz = parseInt(req.params.rz, 10)
    if (isNaN(rx) || isNaN(rz)) return res.status(400).send('invalid coords')

    const baseX = rx * REGION_SIZE
    const baseZ = rz * REGION_SIZE

    const exploredSet = new Set(this.chunkCache.map(({ x, z }) => `${x},${z}`))

    const cols  = new Map()
    const loads = []
    for (let cz = 0; cz < REGION_SIZE; cz++) {
      for (let cx = 0; cx < REGION_SIZE; cx++) {
        const ax = baseX + cx
        const az = baseZ + cz
        if (!exploredSet.has(`${ax},${az}`)) continue
        loads.push(
          loadColumn(this.db, ax, az)
            .then(col => cols.set(`${ax},${az}`, col))
            .catch(() => {})
        )
      }
    }
    await Promise.all(loads)

    try {
      const png = await renderRegionTile(cols, rx, rz, REGION_SIZE)
      res.set('Content-Type', 'image/png')
      res.set('Cache-Control', 'public, max-age=30')
      res.send(png)
    } catch (err) {
      console.error(`[region] ${rx},${rz}:`, err)
      res.status(500).send(String(err))
    }
  }
}
