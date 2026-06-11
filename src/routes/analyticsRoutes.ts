import type { FastifyPluginAsync } from 'fastify'
import { KartingRecordDAO } from '../dao/KartingRecordDAO.js'

interface RivalriesQuery {
  driver1: string
  driver2: string
}

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  const kartingRecordDAO = new KartingRecordDAO()

  app.get<{ Querystring: RivalriesQuery }>('/analytics/rivalries', {
    schema: {
      tags: ['Analytics'],
      summary: 'Busca rivalidades entre dois pilotos',
      querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['driver1', 'driver2'],
        properties: {
          driver1: { type: 'integer', minimum: 1 },
          driver2: { type: 'integer', minimum: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const driver1Id = Number(request.query.driver1)
    const driver2Id = Number(request.query.driver2)

    if (driver1Id === driver2Id) {
      return reply.status(400).send({
        message: 'Drivers must be different',
      })
    }

    return kartingRecordDAO.findSharedChampionships(driver1Id, driver2Id)
  })
}
