import type { FastifyPluginAsync } from 'fastify'
import { DriverDAO } from '../dao/DriverDAO.js'

interface DriverParams {
  id: string
}

interface CreateDriverBody {
  name: string
  nationality: string
  birthDate?: string
}

export const driverRoutes: FastifyPluginAsync = async (app) => {
  const driverDAO = new DriverDAO()

  app.get('/drivers', {
    schema: {
      tags: ['Drivers'],
      summary: 'Lista os pilotos',
    },
  }, async () => driverDAO.findAll())

  app.get<{ Params: DriverParams }>('/drivers/:id', {
    schema: {
      tags: ['Drivers'],
      summary: 'Busca um piloto pelo ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer', minimum: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const driver = await driverDAO.findById(Number(request.params.id))

    if (!driver) {
      return reply.status(404).send({ message: 'Driver not found' })
    }

    return driver
  })

  app.post<{ Body: CreateDriverBody }>('/drivers', {
    schema: {
      tags: ['Drivers'],
      summary: 'Cadastra um piloto',
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'nationality'],
        properties: {
          name: { type: 'string', minLength: 1 },
          nationality: { type: 'string', minLength: 1 },
          birthDate: { type: 'string', format: 'date' },
        },
      },
    },
  }, async (request, reply) => {
    const driver = await driverDAO.create({
      name: request.body.name,
      nationality: request.body.nationality,
      birthDate: request.body.birthDate ?? null,
    })

    return reply.status(201).send(driver)
  })
}
