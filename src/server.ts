import 'dotenv/config'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import Fastify from 'fastify'
import { initDb } from './database/db.js'
import { analyticsRoutes } from './routes/analyticsRoutes.js'
import { driverRoutes } from './routes/driverRoutes.js'
import { healthRoutes } from './routes/healthRoutes.js'
import { kartingRecordRoutes } from './routes/kartingRecordRoutes.js'

const app = Fastify({
  logger: true,
})

const swaggerTheme = `
  body {
    background: #f4f8ff;
  }

  .swagger-ui .topbar {
    background: #081f3d;
    border-bottom: 3px solid #1976d2;
  }

  .swagger-ui .topbar-wrapper img {
    display: none;
  }

  .swagger-ui .topbar-wrapper .link::after {
    content: "KART F1 TRACKER API";
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .swagger-ui .info .title {
    color: #081f3d;
  }

  .swagger-ui .scheme-container {
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(8, 31, 61, 0.12);
  }

  .swagger-ui .opblock.opblock-get {
    background: rgba(25, 118, 210, 0.08);
    border-color: #1976d2;
  }

  .swagger-ui .btn.authorize {
    color: #1976d2;
    border-color: #1976d2;
  }
`

async function start() {
  await initDb()

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
        {
          name: 'Drivers',
          description: 'Pilotos de Fórmula 1',
        },
        {
          name: 'Karting Records',
          description: 'Histórico dos pilotos no kart',
        },
        {
          name: 'Analytics',
          description: 'Análises e cruzamentos dos históricos de kart',
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
    theme: {
      title: 'Kart F1 Tracker API Docs',
      css: [
        {
          filename: 'kart-theme.css',
          content: swaggerTheme,
        },
      ],
    },
  })

  await app.register(healthRoutes)
  await app.register(driverRoutes)
  await app.register(kartingRecordRoutes)
  await app.register(analyticsRoutes)

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
