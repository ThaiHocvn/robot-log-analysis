import { String } from 'lodash'
import { ObjectId } from 'mongodb'
import { AbnormalType } from '~/constants/enums'

export interface LogDocument {
  _id?: ObjectId
  robotId: string
  robotName: string
  message: String
  organizationId: string
  organizationName: string
  sessionId: string
  abnormalType: AbnormalType | null
  timestamp: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export default class Log {
  _id?: ObjectId
  robotId: string
  robotName: string
  message: String
  organizationId: string
  organizationName: string
  sessionId: string
  abnormalType: AbnormalType | null
  timestamp: Date | null
  createdAt?: Date
  updatedAt?: Date

  constructor({
    _id,
    timestamp,
    robotId,
    robotName,
    organizationId,
    organizationName,
    sessionId,
    message,
    abnormalType,
    createdAt,
    updatedAt
  }: LogDocument) {
    const now = new Date()
    this._id = _id
    this.robotId = robotId
    this.robotName = robotName
    this.organizationId = organizationId
    this.organizationName = organizationName
    this.sessionId = sessionId
    this.message = message
    this.timestamp = timestamp || null
    this.abnormalType = abnormalType || null
    this.createdAt = createdAt || now
    this.updatedAt = updatedAt || now
  }
}
