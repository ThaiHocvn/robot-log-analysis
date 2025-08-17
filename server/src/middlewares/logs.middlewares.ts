import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { AbnormalType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { COMMON_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Log from '~/models/schemas/Log.schema'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const abnormalTypes = numberEnumToArray(AbnormalType)

export const getLogsValidator = validate(
  checkSchema(
    {
      abnormal_type: {
        isIn: {
          options: [abnormalTypes],
          errorMessage: COMMON_MESSAGES.VALIDATION_ERROR
        }
      }
    },
    ['query']
  )
)

export const logIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: COMMON_MESSAGES.VALIDATION_ERROR
              })
            }
            const [log] = await databaseService.logs
              .aggregate<Log>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                }
              ])
              .toArray()
            if (!log) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: COMMON_MESSAGES.LOG_NOT_FOUND
              })
            }
            ;(req as Request).log = log
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error('1 <= limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page >= 1')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
