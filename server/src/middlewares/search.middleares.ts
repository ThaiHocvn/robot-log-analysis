import { checkSchema } from 'express-validator'
import { AbnormalType } from '~/constants/enums'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: 'Content must be string'
        }
      },
      abnormal_type: {
        optional: true,
        isIn: {
          options: [Object.values(AbnormalType)]
        },
        errorMessage: `Abnormal type must be one of ${Object.values(AbnormalType).join(', ')}`
      }
    },
    ['query']
  )
)
