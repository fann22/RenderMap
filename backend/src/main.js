/**
 * main.js
 *
 * Entry point — buka LevelDB pakai @8crafter/leveldb-zlib (via mcbe-leveldb),
 * start Express + WebSocket.
 *
 * Environment variables:
 *   LDB_PATH  — path ke folder db/ di dalam world Bedrock (default: ./test/)
 *   PORT      — HTTP port (default: 8080)
 */

import http from 'http'
import express from 'express'

// mcbe-leveldb re-export LevelDB dari @8crafter/leveldb-zlib
// @8crafter/leveldb-zlib adalah fork leveldb-mcpe yang support Zlib (kompresi Bedrock)
import { LevelDB } from '@8crafter/leveldb-zlib'

import { createRouter } from './api/router.js'
import { WSHub } from './api/ws.js'

const dbPath = process.env.LDB_PATH ?? '../db/'
const port   = parseInt(process.env.PORT ?? '8080', 10)

console.log(`[main] opening LevelDB at: ${dbPath}`)

const db = new LevelDB(dbPath)

try {
  await db.open()
} catch (err) {
  console.error('[main] gagal buka LevelDB:', err)
  console.error('[main] pastikan path benar dan Minecraft tidak sedang berjalan')
  process.exit(1)
}

console.log('[main] LevelDB terbuka')

const app    = express()
const wsHub  = new WSHub()
const server = http.createServer(app)

app.use(createRouter(db, wsHub))
wsHub.attach(server)

server.listen(port, () => {
  console.log(`[main] server berjalan di :${port}`)
})

process.on('SIGINT',  shutdown)
process.on('SIGTERM', shutdown)

async function shutdown() {
  console.log('[main] shutting down...')
  await db.close()
  server.close(() => process.exit(0))
}
