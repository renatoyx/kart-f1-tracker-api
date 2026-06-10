import type { FastifyPluginAsync } from 'fastify'

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Verifica o estado da API',
    },
  }, async () => ({
    status: 'ok',
    service: 'kart-f1-tracker-api',
  }))
}
