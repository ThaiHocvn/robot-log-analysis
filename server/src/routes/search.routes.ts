import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { searchValidator } from '~/middlewares/search.middleares'
import { paginationValidator } from '~/middlewares/logs.middlewares'
const searchRouter = Router()

searchRouter.get('/', searchValidator, paginationValidator, searchController)

export default searchRouter
