import { log } from 'console'
import { Router } from 'express'
import logControllers from '~/controllers/log.controllers'
import { paginationValidator } from '~/middlewares/logs.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const logsRouter = Router()

logsRouter.post('/', paginationValidator, wrapRequestHandler(logControllers.getLogSummary))
logsRouter.get('/organizations', wrapRequestHandler(logControllers.getOrganizations))
logsRouter.post('/sessions', paginationValidator, wrapRequestHandler(logControllers.getSessionLogs))

export default logsRouter
