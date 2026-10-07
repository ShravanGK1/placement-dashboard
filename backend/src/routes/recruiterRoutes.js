import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Recruiter Dashboard
router.get('/dashboard', requireAuth(['recruiter', 'admin']), (req, res) => {
  return res.json({
    metrics: {
      activeListings: 3,
      totalApplicants: 142,
      shortlistedCount: 28,
      interviewsScheduled: 8,
    },
    activeJobs: [
      { id: 'job_101', title: 'Senior Backend Engineer', department: 'Cloud Infra', applicantsCount: 64, status: 'Active' },
      { id: 'job_102', title: 'Fullstack Systems Engineer', department: 'Core Products', applicantsCount: 48, status: 'Active' },
      { id: 'job_103', title: 'DevOps & SRE Specialist', department: 'Platform', applicantsCount: 30, status: 'Active' },
    ]
  })
})

// Recruiter Applicants
router.get('/applicants', requireAuth(['recruiter', 'admin']), (req, res) => {
  return res.json({
    applicants: [
      { id: 'app_1', name: 'Rahul Sharma', email: 'student@example.com', cgpa: 8.92, department: 'CSE', role: 'Senior Backend Engineer', status: 'Shortlisted', roomId: 'meet-p2p-892' },
      { id: 'app_2', name: 'Ananya Verma', email: 'ananya.v@example.com', cgpa: 9.15, department: 'IT', role: 'Senior Backend Engineer', status: 'Applied' },
      { id: 'app_3', name: 'Siddharth Rao', email: 'sid.rao@example.com', cgpa: 8.45, department: 'ECE', role: 'Fullstack Systems Engineer', status: 'Interview Scheduled', roomId: 'meet-p2p-451' },
      { id: 'app_4', name: 'Neha Gupta', email: 'neha.g@example.com', cgpa: 8.78, department: 'CSE', role: 'DevOps & SRE Specialist', status: 'Shortlisted' },
    ]
  })
})

// Schedule Meet Action
router.post('/interviews/schedule', requireAuth(['recruiter', 'admin']), (req, res) => {
  const { applicantId, date } = req.body
  const roomId = `room-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`

  return res.json({
    message: 'Interview successfully scheduled',
    interview: {
      applicantId,
      date,
      roomId,
      link: `/interview/${roomId}`
    }
  })
})

export default router
