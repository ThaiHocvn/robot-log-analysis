import { ParamsDictionary, Query } from 'express-serve-static-core'
import { AbnormalType } from '~/constants/enums'

export interface LogRequestBody {
  robotId: string
  message: string
  abnormalType?: AbnormalType | null
  timestamp?: Date | null
}

export interface LogParam extends ParamsDictionary {
  log_id: string
}

export interface LogQuery extends Pagination, Query {
  log_type: string
}

export interface Pagination {
  limit: string
  page: string
}
