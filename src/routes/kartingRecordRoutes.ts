import type { FastifyPluginAsync } from 'fastify'
import { KartingRecordDAO } from '../dao/KartingRecordDAO.js'

interface RecordParams {
  id: string
}

interface DriverParams {
  driverId: string
}

interface CreateRecordBody {
  driverId: number
  year: number
  championship: string
  category?: string
  team?: string
  chassis?: string
  engine?: string
  result?: string
}

export const kartingRecordRoutes: FastifyPluginAsync = async (app) => {
  const recordDAO = new KartingRecordDAO()

  app.get('/karting-records', {
    schema: {
      tags: ['Karting Records'],
      summary: 'Lista os históricos de kart',
    },
  }, async () => recordDAO.findAll())

  app.get<{ Params: RecordParams }>('/karting-records/:id', {
    schema: {
      tags: ['Karting Records'],
      summary: 'Busca um histórico de kart pelo ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer', minimum: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const record = await recordDAO.findById(Number(request.params.id))

    if (!record) {
      return reply.status(404).send({ message: 'Karting record not found' })
    }

    return record
  })

  app.get<{ Params: DriverParams }>('/drivers/:driverId/karting-records', {
    schema: {
      tags: ['Karting Records'],
      summary: 'Lista os históricos de kart de um piloto',
      params: {
        type: 'object',
        required: ['driverId'],
        properties: {
          driverId: { type: 'integer', minimum: 1 },
        },
      },
    },
  }, async (request) => {
    return recordDAO.findByDriverId(Number(request.params.driverId))
  })

  app.post<{ Body: CreateRecordBody }>('/karting-records', {
    schema: {
      tags: ['Karting Records'],
      summary: 'Cadastra um histórico de kart',
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['driverId', 'year', 'championship'],
        properties: {
          driverId: { type: 'integer', minimum: 1 },
          year: { type: 'integer', minimum: 1900 },
          championship: { type: 'string', minLength: 1 },
          category: { type: 'string' },
          team: { type: 'string' },
          chassis: { type: 'string' },
          engine: { type: 'string' },
          result: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const record = await recordDAO.create({
      driverId: request.body.driverId,
      year: request.body.year,
      championship: request.body.championship,
      category: request.body.category ?? null,
      team: request.body.team ?? null,
      chassis: request.body.chassis ?? null,
      engine: request.body.engine ?? null,
      result: request.body.result ?? null,
    })

    return reply.status(201).send(record)
  })
}
