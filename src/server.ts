import Fastify from 'fastify'

const app = Fastify({
  logger: true,
})

app.get('/health', async () => {
  return {
    status: 'ok',
    service: 'kart-f1-tracker-api',
  }
})

async function start() {
  try {
    await app.listen({
      port: 3333,
      host: '0.0.0.0',
    })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

void start()
