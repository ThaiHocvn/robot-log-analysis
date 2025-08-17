import { Db, ObjectId } from 'mongodb'
import { LogDocument } from './schemas/Log.schema'
import { envConfig } from '~/constants/config'

export class LogModel {
  private collection

  constructor(db: Db) {
    this.collection = db.collection<LogDocument>(envConfig.dbLogsCollection)
  }

  async create(log: Omit<LogDocument, '_id'>) {
    const result = await this.collection.insertOne(log)
    return { ...log, _id: result.insertedId }
  }

  async findById(id: string) {
    return this.collection.findOne({ _id: new ObjectId(id) })
  }

  async findAll(filter: Partial<LogDocument> = {}) {
    return this.collection.find(filter).toArray()
  }

  async update(id: string, update: Partial<LogDocument>) {
    await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...update, updatedAt: new Date() } })
    return this.findById(id)
  }

  async delete(id: string) {
    return this.collection.deleteOne({ _id: new ObjectId(id) })
  }
}
