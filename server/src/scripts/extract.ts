import csv from 'csv-parser'
import fs from 'fs'
import { envConfig } from '~/constants/config'
import { abnormalPatterns, AbnormalType } from '~/constants/enums'
import { LogDocument } from '~/models/schemas/Log.schema'
import databaseService from '~/services/database.services'

const BATCH_SIZE = 5000

export const getAbnormalType = (logMessage: string): AbnormalType | null => {
  for (const abnormalType of Object.values(AbnormalType)) {
    const pattern = abnormalPatterns[abnormalType as AbnormalType]
    if (logMessage.includes(pattern)) {
      return abnormalType
    }
  }
  return null
}

async function extractAndStoreLogs() {
  try {
    console.time('extract')
    console.log('Connecting to DB...')
    await databaseService.connect()

    const collection = databaseService.getDb().collection(envConfig.dbLogsCollection)
    let bulkOps = collection.initializeOrderedBulkOp()
    const documents: LogDocument[] = []
    let count = 0

    console.log('Reading CSV file...')

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream('C:\\Users\\thaih\\OneDrive\\Desktop\\log.csv')
        .pipe(csv())
        .on('data', async (row: any) => {
          //   console.log('row', row.Bot_Name)

          const abnormal_type = getAbnormalType(row.Message)
          const document: LogDocument = {
            robotId: row.Bot_ID,
            robotName: row.Bot_Name,
            organizationId: row.Organization_ID,
            organizationName: row.Organization_Name,
            sessionId: row.Session_ID,
            message: row.Message,
            abnormalType: abnormal_type,
            createdAt: new Date(),
            updatedAt: new Date(),
            timestamp: new Date(parseInt(row.Timestamp) * 1000)
          }
          documents.push(document)
          count++

          if (documents.length === BATCH_SIZE) {
            try {
              console.log(`Inserting batch of ${BATCH_SIZE} documents...`)
              await collection.insertMany(documents)
              documents.length = 0
            } catch (error) {
              reject(error)
            }
          }
        })
        .on('end', async () => {
          if (documents.length > 0) {
            console.log(`Inserting final batch of ${documents.length} documents...`)
            await collection.insertMany(documents)
          }
          console.log('CSV file successfully processed.')
          resolve()
        })
        .on('error', (error) => {
          reject(error)
        })
    })

    console.log(`All data successfully stored in MongoDB. Total documents: ${count}`)
  } catch (error) {
    console.error('Error inserting robot logs:', error)
  } finally {
    await databaseService.close()
    console.timeEnd('extract')
    process.exit(0)
  }
}

extractAndStoreLogs()
