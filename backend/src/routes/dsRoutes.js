import { Router } from 'express'
import crypto from 'crypto'

const router = Router()

// SSE Client Pool
let sseClients = []

// WebRTC Signaling In-memory storage
const signalingRooms = new Map()

// 1. Health & Fault Tolerance Endpoint
router.get('/health', (req, res) => {
  return res.json({
    status: 'healthy',
    nodeId: 'placement-server-primary-01',
    uptimeSeconds: Math.floor(process.uptime()),
    rateLimitRemaining: 98,
    circuitBreakerState: 'CLOSED',
    activeConnections: sseClients.length,
    timestamp: new Date().toISOString()
  })
})

// 2. JSON-RPC 2.0 Handler
router.post('/rpc', (req, res) => {
  const payload = req.body

  const handleSingleRpc = (request) => {
    const { jsonrpc, method, params, id } = request
    if (jsonrpc !== '2.0') {
      return { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' }, id: id || null }
    }

    switch (method) {
      case 'ping':
        return { jsonrpc: '2.0', result: { status: 'pong', timestamp: Date.now() }, id }
      case 'getPlacementStats':
        return {
          jsonrpc: '2.0',
          result: {
            totalDrives: 24,
            offersMade: 312,
            averagePackage: '14.2 LPA',
            highestPackage: '44 LPA',
            placedPercentage: '88.4%',
          },
          id
        }
      case 'shortlistApplicants':
        const applicantIds = params?.applicantIds || []
        return {
          jsonrpc: '2.0',
          result: {
            shortlistedCount: applicantIds.length,
            message: `Successfully shortlisted ${applicantIds.length} applicants via batch RPC.`,
            status: 'SHORTLISTED'
          },
          id
        }
      default:
        return { jsonrpc: '2.0', error: { code: -32601, message: `Method not found: ${method}` }, id }
    }
  }

  if (Array.isArray(payload)) {
    // Batched RPC execution
    const results = payload.map(handleSingleRpc)
    return res.json(results)
  } else {
    // Single RPC execution
    const result = handleSingleRpc(payload)
    return res.json(result)
  }
})

// 3. Server-Sent Events (SSE) Stream
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const clientId = crypto.randomUUID()
  sseClients.push({ id: clientId, res })

  // Send initial event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Live Placement Stream established', clientId })}\n\n`)

  // Periodic heartbeat / live ticker data
  const interval = setInterval(() => {
    const events = [
      { type: 'OFFER_MADE', student: 'Rahul S.', company: 'Google Cloud', package: '32 LPA' },
      { type: 'DRIVE_STARTED', company: 'Microsoft', role: 'Systems Engineer' },
      { type: 'SHORTLIST_UPDATE', company: 'Amazon AWS', count: 18 }
    ]
    const randomEvent = events[Math.floor(Math.random() * events.length)]
    res.write(`data: ${JSON.stringify({ ...randomEvent, timestamp: new Date().toLocaleTimeString() })}\n\n`)
  }, 3500)

  req.on('close', () => {
    clearInterval(interval)
    sseClients = sseClients.filter((c) => c.id !== clientId)
  })
})

// 4. WebRTC Signaling endpoint
router.post('/webrtc/signal', (req, res) => {
  const { roomId, peerId, type, data } = req.body

  if (!roomId || !peerId) {
    return res.status(400).json({ error: 'roomId and peerId are required' })
  }

  if (!signalingRooms.has(roomId)) {
    signalingRooms.set(roomId, new Map())
  }

  const room = signalingRooms.get(roomId)
  
  if (type === 'JOIN') {
    room.set(peerId, { lastSeen: Date.now() })
    return res.json({ peers: Array.from(room.keys()).filter((id) => id !== peerId) })
  }

  if (type === 'LEAVE') {
    room.delete(peerId)
    return res.json({ status: 'left' })
  }

  return res.json({ status: 'received', messageType: type })
})

export default router
