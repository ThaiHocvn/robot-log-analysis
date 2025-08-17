// logs.services.ts
import { ObjectId, Collection } from 'mongodb'
import { envConfig } from '~/constants/config'
import Log from '~/models/schemas/Log.schema'
import databaseService from './database.services'

class LogService {
  private get logs(): Collection<Log> {
    return databaseService.getDb().collection<Log>(envConfig.dbLogsCollection)
  }

  async indexLogs() {
    const compoundIndexName = 'robot_abnormal__id_idx'
    const compoundExists = await this.logs.indexExists([compoundIndexName])
    if (!compoundExists) {
      await this.logs.createIndex({ robotId: 1, abnormalType: 1, _id: 1 }, { name: compoundIndexName })
    }
  }

  async createLog(log: Log) {
    return await this.logs.insertOne(log)
  }

  async getLogs(filter = {}, options = {}) {
    return await this.logs.find(filter, options).toArray()
  }

  async getLogById(id: string) {
    return await this.logs.findOne({ _id: new ObjectId(id) })
  }
}

const logService = new LogService()
export default logService
