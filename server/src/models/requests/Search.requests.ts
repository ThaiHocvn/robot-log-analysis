import { Query } from 'express-serve-static-core'
import { Pagination } from '~/models/requests/Log.requests'

export interface SearchQuery extends Pagination, Query {
  param: string
}
