import { Router } from 'express'
import { getAllLogs, getLog } from '~/controllers/log.controllers'
import { getLogsValidator, paginationValidator } from '~/middlewares/logs.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const logsRouter = Router()

logsRouter.get('/', paginationValidator, wrapRequestHandler(logController.getAllLogs))
logsRouter.get('/:id', wrapRequestHandler(logController.getLogById))
logsRouter.post('/', wrapRequestHandler(logController.createLog))
logsRouter.put('/:id', wrapRequestHandler(logController.updateLog))
logsRouter.delete('/:id', wrapRequestHandler(logController.deleteLog))

export default logsRouter
