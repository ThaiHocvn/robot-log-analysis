import cors, { CorsOptions } from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { createServer } from 'http'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import searchRouter from '~/routes/search.routes'
import logsRouter from '~/routes/logs.routes'
import databaseService from '~/services/database.services'
// import initSocket from '~/utils/socket'
// import fs from 'fs'
// import path from 'path'
// import swaggerJsdoc from 'swagger-jsdoc'
// import swaggerUi from 'swagger-ui-express'
import { envConfig, isProduction } from '~/constants/config'
import logService from './services/logs.services'
// const file = fs.readFileSync(path.resolve('robot-log-analysis-swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

// const options: swaggerJsdoc.Options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Robot Log Analysis System',
//       version: '1.0.0'
//     },
//     components: {
//       securitySchemes: {
//         BearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT'
//         }
//       }
//     },
//     security: [
//       {
//         BearerAuth: []
//       }
//     ],
//     persistAuthorization: true
//   },
//   apis: ['./openapi/*.yaml'] // files containing annotations as above
// }
// const openapiSpecification = swaggerJsdoc(options)

databaseService.connect().then(() => {
  logService.indexLogs()
})
const app = express()
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
})
app.use(limiter)

const httpServer = createServer(app)
app.use(helmet())
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}
app.use(cors(corsOptions))
const port = envConfig.port

app.use(express.json())
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/logs', logsRouter)
app.use('/search', searchRouter)
app.use(defaultErrorHandler)

// initSocket(httpServer)

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
