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
      description:
        'Retorna campeonatos de kart disputados pelos dois pilotos no mesmo ano e categoria.',
      querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['driver1', 'driver2'],
        properties: {
          driver1: {
            type: 'integer',
            minimum: 1,
            description: 'ID do primeiro piloto',
          },
          driver2: {
            type: 'integer',
            minimum: 1,
            description: 'ID do segundo piloto',
          },
        },
      },
      response: {
        200: {
          description: 'Campeonatos em que os dois pilotos se enfrentaram',
          type: 'array',
          items: {
            type: 'object',
            required: [
              'year',
              'championship',
              'category',
              'driver1',
              'driver2',
            ],
            properties: {
              year: { type: 'integer', description: 'Ano do campeonato' },
              championship: {
                type: 'string',
                description: 'Nome do campeonato',
              },
              category: {
                type: ['string', 'null'],
                description: 'Categoria disputada',
              },
              driver1: {
                type: 'object',
                required: ['driverId', 'chassis', 'engine', 'result'],
                properties: {
                  driverId: { type: 'integer' },
                  chassis: { type: ['string', 'null'] },
                  engine: { type: ['string', 'null'] },
                  result: { type: ['string', 'null'] },
                },
              },
              driver2: {
                type: 'object',
                required: ['driverId', 'chassis', 'engine', 'result'],
                properties: {
                  driverId: { type: 'integer' },
                  chassis: { type: ['string', 'null'] },
                  engine: { type: ['string', 'null'] },
                  result: { type: ['string', 'null'] },
                },
              },
            },
          },
        },
        400: {
          description: 'Os IDs informados pertencem ao mesmo piloto',
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string' },
          },
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
