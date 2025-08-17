import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'

class SearchService {
  async search({ limit, page, content }: { limit: number; page: number; content: string }) {
    const $match: any = {
      $text: {
        $search: content
      }
    }

    const [logs, total] = await Promise.all([
      databaseService.logs
        .aggregate([
          {
            $match
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.logs
        .aggregate([
          {
            $match
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    const log_ids = logs.map((log) => log._id as ObjectId)
    const date = new Date()
    await databaseService.logs.updateMany(
      {
        _id: {
          $in: log_ids
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    logs.forEach((log) => {
      log.updated_at = date
      // log.user_views += 1
    })
    return {
      logs,
      total: total[0]?.total || 0
    }
  }
}

const searchService = new SearchService()

export default searchService
