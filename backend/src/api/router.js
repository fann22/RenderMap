/**
 * router.js — port of api/router.go
 */

import express from 'express'
import { Handler } from './handler.js'

/**
 * @param {import('classic-level').ClassicLevel} db
 * @param {import('./ws.js').WSHub} wsHub
 * @returns {express.Router}
 */
export function createRouter(db, wsHub) {
  const router  = express.Router()
  const handler = new Handler(db, wsHub)

  // CORS middleware
  router.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin',  '*')
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  // REST
  router.get('/api/chunks',          (req, res) => handler.listChunks(req, res))
  router.get('/api/stats',           (req, res) => handler.serveStats(req, res))
  router.get('/api/tile/:x/:z',      (req, res) => handler.serveTile(req, res))
  router.get('/api/region/:rx/:rz',  (req, res) => handler.serveRegionTile(req, res))

  // Health
  router.get('/health', (_, res) => res.send('ok'))

  return router
}
