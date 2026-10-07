import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Student Dashboard Metrics
router.get('/dashboard', requireAuth(['student', 'admin']), (req, res) => {
  return res.json({
    metrics: {
      eligibleJobsCount: 14,
      appliedCount: 5,
      shortlistedCount: 2,
      scheduledInterviewsCount: 1,
    },
    upcomingDrives: [
      { id: 'job_1', company: 'Google Cloud', role: 'Software Engineer', ctc: '32 LPA', date: '2026-10-15', status: 'Eligible' },
      { id: 'job_2', company: 'Microsoft', role: 'Systems Engineer', ctc: '28 LPA', date: '2026-10-18', status: 'Shortlisted' },
      { id: 'job_3', company: 'Amazon AWS', role: 'DevOps Engineer', ctc: '24 LPA', date: '2026-10-22', status: 'Applied' },
    ],
    scheduledInterviews: [
      { id: 'int_1', company: 'Microsoft', role: 'Systems Engineer', date: '2026-10-18 10:00 AM', roomId: 'meet-ms-8921', status: 'Ready' }
    ]
  })
})

// Student Applications
router.get('/applications', requireAuth(['student', 'admin']), (req, res) => {
  return res.json({
    applications: [
      { id: 'app_1', company: 'Google Cloud', role: 'Software Engineer', appliedDate: '2026-10-01', status: 'Under Review' },
      { id: 'app_2', company: 'Microsoft', role: 'Systems Engineer', appliedDate: '2026-09-28', status: 'Interview Scheduled', roomId: 'meet-ms-8921' },
      { id: 'app_3', company: 'Amazon AWS', role: 'DevOps Engineer', appliedDate: '2026-09-25', status: 'Applied' },
      { id: 'app_4', company: 'Goldman Sachs', role: 'Analyst', appliedDate: '2026-09-20', status: 'Shortlisted' },
    ]
  })
})

// Student Profile
router.get('/profile', requireAuth(['student', 'admin']), (req, res) => {
  return res.json({
    profile: {
      name: 'Rahul Sharma',
      email: 'student@example.com',
      rollNo: '2023CS1082',
      department: 'Computer Science & Engineering',
      cgpa: 8.92,
      graduationYear: 2026,
      skills: ['Distributed Systems', 'TypeScript', 'Node.js', 'React', 'MongoDB', 'Docker', 'WebRTC'],
      resumeUrl: 'https://example.com/resumes/rahul-sharma.pdf',
    }
  })
})

export default router
