import 'dotenv/config'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import Fastify from 'fastify'

const app = Fastify({
  logger: true,
})

async function start() {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Kart F1 Tracker API',
        description: 'API para histórico de kart dos pilotos de Fórmula 1.',
        version: '0.1.0',
      },
      tags: [
        {
          name: 'Health',
          description: 'Estado da aplicação',
        },
      ],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  })

  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Verifica o estado da API',
        response: {
          200: {
            type: 'object',
            required: ['status', 'service'],
            properties: {
              status: { type: 'string' },
              service: { type: 'string' },
            },
          },
        },
      },
    },
    async () => {
      return {
        status: 'ok',
        service: 'kart-f1-tracker-api',
      }
    },
  )

  const port = Number(process.env.PORT ?? 3333)
  const host = process.env.HOST ?? '0.0.0.0'

  try {
    await app.listen({ port, host })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

void start()
