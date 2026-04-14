/**
 * ws.js — port of api/ws.go
 *
 * WebSocket hub: manages connected clients and broadcasts update messages.
 */

import { WebSocketServer, WebSocket } from 'ws'

const PING_INTERVAL_MS = 54_000  // ~90% of 60s pong timeout

export class WSHub {
  constructor() {
    /** @type {Set<WebSocket>} */
    this.clients = new Set()
  }

  /**
   * Attach to an existing http.Server.
   * @param {import('http').Server} server
   */
  attach(server) {
    this.wss = new WebSocketServer({ server })
    this.wss.on('connection', (ws) => this._onConnect(ws))
  }

  _onConnect(ws) {
    this.clients.add(ws)
    console.log(`[ws] client connected (${this.clients.size} total)`)

    // Keepalive ping
    const timer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping()
    }, PING_INTERVAL_MS)

    ws.on('pong', () => { /* keepalive ack */ })

    ws.on('close', () => {
      clearInterval(timer)
      this.clients.delete(ws)
      console.log(`[ws] client disconnected (${this.clients.size} remaining)`)
    })

    ws.on('error', () => {
      clearInterval(timer)
      this.clients.delete(ws)
    })
  }

  /**
   * Broadcast a JSON-serialisable message to all connected clients.
   * @param {object} msg
   */
  broadcast(msg) {
    const data = JSON.stringify(msg)
    for (const ws of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    }
  }
}
