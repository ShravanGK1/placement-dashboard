import crypto from 'crypto'

export function requestTraceMiddleware(req, res, next) {
  const start = Date.now()
  const requestId = req.headers['x-request-id'] || `req_${crypto.randomUUID()}`

  res.setHeader('x-request-id', requestId)
  res.setHeader('x-server-node', 'placement-node-primary-01')

  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[Trace: ${requestId}] ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} (${duration}ms)`)
  })

  next()
}
