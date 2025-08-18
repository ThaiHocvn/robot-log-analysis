import NodeCache from 'node-cache'
import logModel from '~/models/log.model'

const logCache = new NodeCache({ stdTTL: 300 }) // 300 seconds
class LogService {
  /**
   * Check and create necessary indexes for collection logs.
   * This is a setup method.
   */
  async indexLogs() {
    const summaryIndexName = 'abnormal_org_created_idx'
    const summaryIndexExists = await logModel.indexExists(summaryIndexName)
    if (!summaryIndexExists) {
      await logModel.createIndex({ abnormalType: 1, organizationId: 1, createdAt: 1 }, { name: summaryIndexName })
      console.log(`Successfully created index: ${summaryIndexName}`)
    }

    // Index for getSessionLogs, which matches on sessionId and sorts by timestamp.
    const sessionIndexName = 'session_timestamp_idx'
    const sessionIndexExists = await logModel.indexExists(sessionIndexName)
    if (!sessionIndexExists) {
      await logModel.createIndex({ sessionId: 1, timestamp: -1 }, { name: sessionIndexName })
      console.log(`Successfully created index: ${sessionIndexName}`)
    }
  }

  async getLogSummaryData(
    startDate: string | undefined,
    endDate: string | undefined,
    organizationId: string | undefined,
    limit: number,
    page: number
  ) {
    const cacheKey = `summary-${startDate}-${endDate}-${organizationId}-${limit}-${page}`
    const cachedResult = logCache.get(cacheKey)
    if (cachedResult) return cachedResult

    const pipeline: any[] = []
    const skip = (page - 1) * limit

    // Set default interval if no parameter is provided
    let eDate = endDate
    let sDate = startDate
    if (!sDate || !eDate) {
      eDate = new Date().toISOString()
      sDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const matchStage: any = { abnormalType: { $ne: null } }
    if (sDate && eDate) {
      matchStage.createdAt = {
        $gte: new Date(sDate),
        $lte: new Date(eDate)
      }
    }
    if (organizationId && organizationId !== 'All') {
      matchStage.organizationId = organizationId as string
    }
    pipeline.push({ $match: matchStage })

    // Phase 1 of $group: Group by organization, robot, session, and abnormal type to count of abnormal
    pipeline.push({
      $group: {
        _id: {
          organizationId: '$organizationId',
          organizationName: '$organizationName',
          robotId: '$robotId',
          robotName: '$robotName',
          sessionId: '$sessionId',
          abnormalType: '$abnormalType'
        },
        count: { $sum: 1 }
      }
    })

    // Phase 2 of $group: Group by session to collect abnormal type into an array
    pipeline.push({
      $group: {
        _id: {
          organizationId: '$_id.organizationId',
          organizationName: '$_id.organizationName',
          robotId: '$_id.robotId',
          robotName: '$_id.robotName',
          sessionId: '$_id.sessionId'
        },
        abnormalCounts: {
          $push: {
            abnormalType: '$_id.abnormalType',
            count: '$count'
          }
        }
      }
    })

    // Phase 3 of $group: Group by robot to collect sessions into an array
    pipeline.push({
      $sort: { '_id.sessionId': 1 }
    })
    pipeline.push({
      $group: {
        _id: {
          organizationId: '$_id.organizationId',
          organizationName: '$_id.organizationName',
          robotId: '$_id.robotId',
          robotName: '$_id.robotName'
        },
        sessions: {
          $push: {
            sessionId: '$_id.sessionId',
            abnormalCounts: '$abnormalCounts'
          }
        }
      }
    })

    // Phase 4 of $group: Group by organization to collect robots into an array
    pipeline.push({
      $group: {
        _id: {
          organizationId: '$_id.organizationId',
          organizationName: '$_id.organizationName'
        },
        robots: {
          $push: {
            robotId: '$_id.robotId',
            robotName: '$_id.robotName',
            sessions: '$sessions'
          }
        }
      }
    })

    // $project stage: Reshape the structure of the final result to remove unnecessary '_id' field
    pipeline.push({
      $sort: { '_id.organizationName': 1 }
    })

    pipeline.push({
      $project: {
        _id: 0,
        organizationId: '$_id.organizationId',
        organizationName: '$_id.organizationName',
        robots: '$robots'
      }
    })

    const finalPipeline = [
      ...pipeline,
      {
        $facet: {
          paginatedResults: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ]

    const [facetResult] = await logModel.aggregateLogs(finalPipeline)
    const result = facetResult.paginatedResults
    const total = facetResult.totalCount.length > 0 ? facetResult.totalCount[0].count : 0

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const responseData = {
      metadata: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      result
    }

    logCache.set(cacheKey, responseData)
    return responseData
  }

  async getOrganizations(startDate: string | undefined, endDate: string | undefined) {
    const cacheKey = `organizations-${startDate}-${endDate}`
    const cachedResult = logCache.get(cacheKey)
    if (cachedResult) return cachedResult

    // Set default interval if no parameter is provided
    let eDate = endDate
    let sDate = startDate
    if (!sDate || !eDate) {
      eDate = new Date().toISOString()
      sDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const pipeline: any[] = [
      {
        $match: {
          abnormalType: { $ne: null },
          createdAt: {
            $gte: new Date(sDate),
            $lte: new Date(eDate)
          }
        }
      },
      {
        $group: {
          _id: '$organizationId',
          organizationName: { $first: '$organizationName' }
        }
      },
      { $sort: { organizationName: 1 } },
      {
        $project: {
          _id: 0,
          organizationId: '$_id',
          organizationName: 1
        }
      }
    ]
    const organizations = await logModel.aggregateLogs(pipeline)
    logCache.set(cacheKey, organizations)
    return organizations
  }

  async getSessionLogs(sessionId: string, filterAbnormal: boolean, limit: number, page: number) {
    const pipeline: any[] = [
      {
        $match: {
          sessionId
        }
      },
      ...(filterAbnormal ? [{ $match: { abnormalType: { $ne: null } } }] : []),
      {
        $sort: { timestamp: -1 }
      },
      {
        $project: {
          _id: 0,
          timestamp: '$timestamp',
          message: '$message',
          abnormalType: '$abnormalType'
        }
      }
    ]

    const finalPipeline = [
      ...pipeline,
      {
        $facet: {
          paginatedResults: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ]
    const [facetResult] = await logModel.aggregateLogs(finalPipeline)
    const result = facetResult.paginatedResults
    const total = facetResult.totalCount.length > 0 ? facetResult.totalCount[0].count : 0
    const totalPages = Math.ceil(total / limit)

    return {
      result,
      metadata: {
        total,
        page,
        limit,
        totalPages
      }
    }
  }
}

const logService = new LogService()
export default logService
