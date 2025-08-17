import { Request } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import Log from '~/models/schemas/Log.schema'
import User from '~/models/schemas/User.schema'
declare module 'express' {
  interface Request {
    log?: Log
  }
}
