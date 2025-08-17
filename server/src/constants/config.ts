import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

const env = process.env.NODE_ENV || 'development'
const envFilename = `.env.${env}`

// Check if NODE_ENV is provided
if (!env) {
  console.log('You have not provided the NODE_ENV environment variable (e.g., development, production).')
  console.log(`Detected NODE_ENV = ${env}`)
  process.exit(1)
}

// Log the detected environment and the corresponding .env file
console.log(`Detected NODE_ENV = ${env}, so the app will use the environment file ${envFilename}`)

// Check if the environment file exists
if (!fs.existsSync(path.resolve(envFilename))) {
  console.log(`Could not find the environment file ${envFilename}`)
  console.log(
    'Note: The app does not use the .env file. For example, if the environment is development, the app will use the .env.development file.'
  )
  console.log(`Please create the file ${envFilename} and refer to the content in the .env.example file.`)
  process.exit(1)
}

// Load the environment variables from the specific file
config({
  path: envFilename
})

export const isProduction = env === 'production'

export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  clientUrl: process.env.CLIENT_URL as string,
  dbName: process.env.DB_NAME as string,
  dbUsername: process.env.DB_USERNAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbLogsCollection: process.env.DB_LOGS_COLLECTION as string,
  mongodbUri: process.env.MONGODB_URI as string
}
