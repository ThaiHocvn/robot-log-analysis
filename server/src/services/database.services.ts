import { Db, MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(envConfig.mongodbUri)
    this.db = this.client.db(envConfig.dbName)
  }

  async connect() {
    try {
      await this.client.connect()
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error('MongoDB connection error:', error)
      throw error
    }
  }

  getDb() {
    return this.db
  }

  async close() {
    await this.client.close()
    console.log('MongoDB connection closed.')
  }
}

const databaseService = new DatabaseService()
export default databaseService
