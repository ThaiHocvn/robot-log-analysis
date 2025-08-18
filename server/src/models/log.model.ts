import { Db, IndexSpecification, ObjectId } from 'mongodb'
import { LogDocument } from './schemas/Log.schema'
import { envConfig } from '~/constants/config'
import databaseService from '~/services/database.services'

export class LogModel {
  private collection

  constructor(db: Db) {
    this.collection = db.collection<LogDocument>(envConfig.dbLogsCollection)
  }

  public get getCollection() {
    return this.collection
  }

  /**
   * Checks if an index exists by its name.
   * @param indexName The name of the index to check.
   * @returns Returns true if the index exists, false otherwise.
   */
  async indexExists(indexName: string): Promise<boolean> {
    try {
      const indexes = await this.collection.listIndexes().toArray()
      return indexes.some((index) => index.name === indexName)
    } catch (error) {
      console.error(`Error checking for index ${indexName}:`, error)
      return false
    }
  }

  /**
   * Creates an index on the collection.
   * @param key The fields and order (1 for ascending, -1 for descending) of the index.
   * @param options Additional options for the index, including the name.
   */
  async createIndex(key: IndexSpecification, options?: object) {
    try {
      await this.collection.createIndex(key, options)
    } catch (error) {
      console.error('Error creating index:', error)
      throw error
    }
  }
  async aggregateLogs(pipeline: Document[]) {
    return this.collection.aggregate(pipeline).toArray()
  }
}

const logModel = new LogModel(databaseService.getDb())
export default logModel
