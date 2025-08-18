import csv from 'csv-parser'
import fs from 'fs'
import { envConfig } from '~/constants/config'
import { abnormalPatterns, AbnormalType } from '~/constants/enums'
import { LogDocument } from '~/models/schemas/Log.schema'
import databaseService from '~/services/database.services'

const BATCH_SIZE = 5000
const MAX_CONCURRENT_BATCHES = 5

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
    console.time('Total Time')
    console.log('Connecting to DB...')
    await databaseService.connect()

    const collection = databaseService.getDb().collection(envConfig.dbLogsCollection)
    const documents: LogDocument[] = []
    let totalCount = 0

    // Array to store the promises of the batches being inserted
    const activePromises: Promise<any>[] = []

    console.log('Reading CSV file...')

    const processBatch = async (batch: LogDocument[]) => {
      if (batch.length > 0) {
        try {
          console.log(`Inserting batch of ${batch.length} documents...`)
          // Start inserting and adding promises to the array
          const promise = collection.insertMany(batch)
          activePromises.push(promise)
          // Wait for the promise to complete, then remove it from the array
          await promise
          const index = activePromises.indexOf(promise)
          if (index > -1) {
            activePromises.splice(index, 1)
          }
        } catch (error) {
          console.error('Error during batch insert:', error)
          throw error
        }
      }
    }

    await new Promise<void>((resolve, reject) => {
      const csvStream = fs.createReadStream('C:\\Users\\thaih\\OneDrive\\Desktop\\log.csv').pipe(csv())

      csvStream.on('data', (row: any) => {
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
        totalCount++

        // When the batch is full, process it asynchronously
        if (documents.length >= BATCH_SIZE) {
          // Take a copy of the array and clear the original array
          const batchToProcess = [...documents]
          documents.length = 0

          // Process the batch
          processBatch(batchToProcess)

          // If the number of active batches exceeds the limit, pause the stream
          if (activePromises.length >= MAX_CONCURRENT_BATCHES) {
            csvStream.pause()
            Promise.race(activePromises).finally(() => {
              csvStream.resume()
            })
          }
        }
      })

      csvStream.on('end', async () => {
        // Process the last remaining batch
        await processBatch(documents)
        // Wait for all active batches to complete
        await Promise.all(activePromises)
        console.log('CSV file successfully processed.')
        resolve()
      })

      csvStream.on('error', (error) => {
        reject(error)
      })
    })

    console.log(`All data successfully stored in MongoDB. Total documents processed: ${totalCount}`)
  } catch (error) {
    console.error('Error inserting robot logs:', error)
  } finally {
    await databaseService.close()
    console.timeEnd('Total Time')
    process.exit(0)
  }
}

extractAndStoreLogs()
