import { Request, Response, NextFunction } from 'express'
import logService from '~/services/logs.services'

class LogController {
  async getLogSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, organizationId, limit, page } = req.body

      const numLimit = Number(limit) || 10
      const numPage = Number(page) || 1
      const defaultOrganizationId = 'All'

      const result = await logService.getLogSummaryData(
        startDate as string,
        endDate as string,
        (organizationId as string) || defaultOrganizationId,
        numLimit,
        numPage
      )

      res.json({
        message: 'Get log summary data successfully',
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  async getOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query
      const organizations = await logService.getOrganizations(startDate as string, endDate as string)
      res.json({
        message: 'Get successful organization list',
        data: organizations
      })
    } catch (error) {
      next(error)
    }
  }

  async getSessionLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, limit, page, filterAbnormal } = req.body

      const numLimit = Number(limit) || 10
      const numPage = Number(page) || 1
      const organizations = await logService.getSessionLogs(sessionId as string, filterAbnormal, numLimit, numPage)
      res.json({
        message: 'Get successful session logs',
        data: organizations
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new LogController()
