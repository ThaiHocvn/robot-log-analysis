// controllers/log.controller.ts
import { Request, Response, NextFunction } from 'express'
import { LogService } from '~/services/logs.services'

class LogController {
  private logService: LogService

  constructor() {
    this.logService = new LogService()
  }

  async createLog(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await this.logService.createLog(req.body)
      res.status(201).json(log)
    } catch (error) {
      next(error)
    }
  }

  async getAllLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query
      const logs = await this.logService.getAllLogs(Number(page), Number(limit))
      res.json(logs)
    } catch (error) {
      next(error)
    }
  }

  async getLogById(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await this.logService.getLogById(req.params.id)
      if (!log) {
        return res.status(404).json({ message: 'Log not found' })
      }
      res.json(log)
    } catch (error) {
      next(error)
    }
  }

  async updateLog(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await this.logService.updateLog(req.params.id, req.body)
      if (!log) {
        return res.status(404).json({ message: 'Log not found' })
      }
      res.json(log)
    } catch (error) {
      next(error)
    }
  }

  async deleteLog(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.logService.deleteLog(req.params.id)
      if (!result) {
        return res.status(404).json({ message: 'Log not found' })
      }
      res.json({ message: 'Log deleted successfully' })
    } catch (error) {
      next(error)
    }
  }
}

export default new LogController()
