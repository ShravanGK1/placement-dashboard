import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import recruiterRoutes from './routes/recruiterRoutes.js'
import dsRoutes from './routes/dsRoutes.js'
import { requestTraceMiddleware } from './middleware/requestTrace.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware stack
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use(requestTraceMiddleware)

// API Route Mounts
app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/recruiter', recruiterRoutes)
app.use('/api/ds', dsRoutes)

// Base Root & Health Route
app.get('/', (req, res) => {
  res.json({
    name: 'Placement Cell Backend API & Distributed Systems Engine',
    version: '1.0.0',
    status: 'ONLINE',
    endpoints: {
      auth: '/api/auth',
      student: '/api/student',
      recruiter: '/api/recruiter',
      distributedSystems: '/api/ds',
      health: '/api/ds/health',
    },
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Placement Cell Backend Server listening on port ${PORT}`)
  console.log(`📡 Distributed Systems Engine active at http://localhost:${PORT}/api/ds`)
})
