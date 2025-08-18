import cors, { CorsOptions } from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { createServer } from 'http'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import logsRouter from '~/routes/logs.routes'
import databaseService from '~/services/database.services'

import { envConfig, isProduction } from '~/constants/config'
import logService from './services/logs.services'

const app = express()
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, // Limit each IP to 500 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
})
const httpServer = createServer(app)
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())
app.use(limiter)

const startServer = async () => {
  try {
    await databaseService.connect()
    await logService.indexLogs()

    app.use('/logs', logsRouter)
    app.use(defaultErrorHandler)

    httpServer.listen(envConfig.port, () => {
      console.log(`Example app listening on port ${envConfig.port}`)
    })
  } catch (error) {
    console.error('Failed to connect to database or start server:', error)
  }
}

startServer()
