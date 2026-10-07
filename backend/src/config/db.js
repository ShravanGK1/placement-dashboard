import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'placement_cell'

if (!uri) {
  console.warn('⚠️ MONGODB_URI is not set. Database operations will use in-memory demo fallbacks.')
}

let client
let clientPromise

if (uri) {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getDb() {
  if (!clientPromise) {
    throw new Error('Database client not initialized')
  }
  const connectedClient = await clientPromise
  return connectedClient.db(dbName)
}

export default clientPromise
