import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'placement_cell'

if (!uri) {
  throw new Error('MONGODB_URI is not configured. Add it to your .env file.')
}

const sampleUsers = [
  {
    name: 'Student Demo',
    email: 'student@example.com',
    password: 'Password@123',
    role: 'student',
  },
  {
    name: 'Recruiter Demo',
    email: 'recruiter@example.com',
    password: 'Password@123',
    role: 'recruiter',
  },
  {
    name: 'Admin Demo',
    email: 'admin@example.com',
    password: 'Password@123',
    role: 'admin',
  },
]

async function seedUsers() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(dbName)
    const users = db.collection('users')

    await users.createIndex({ email: 1 }, { unique: true })

    let insertedOrUpdated = 0

    for (const user of sampleUsers) {
      const now = new Date()
      const hashedPassword = await bcrypt.hash(user.password, 12)

      const result = await users.updateOne(
        { email: user.email.toLowerCase() },
        {
          $set: {
            name: user.name,
            email: user.email.toLowerCase(),
            password: hashedPassword,
            role: user.role,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      )

      if (result.upsertedCount > 0 || result.modifiedCount > 0) {
        insertedOrUpdated += 1
      }
    }

    console.log(`Seed completed. Users inserted/updated: ${insertedOrUpdated}`)
    console.log('Sample login emails: student@example.com, recruiter@example.com, admin@example.com')
    console.log('Sample password for all users: Password@123')
  } finally {
    await client.close()
  }
}

seedUsers().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
