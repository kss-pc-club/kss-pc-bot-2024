import { Hono } from 'hono'
import { InteractionResponseType, InteractionType } from 'discord-interactions'
import { verifyDiscordInteraction } from './verifyDiscordInteraction'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())

app.get('/', (c) => {
  return c.text('Hello World')
})

app.post('/', verifyDiscordInteraction, async (c) => {
  const message = await c.req.json()
  if (message.type === InteractionType.PING) {
    return c.json({
      type: InteractionResponseType.PONG,
    });
  }

  if (message.type === InteractionType.APPLICATION_COMMAND) {
    switch (message.data.name.toLowerCase()) {
      case 'register':
        return c.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Hello, World!',
          },
        });
      default:
        return c.json({ error: 'Unknown Command' }, 400);
    }
  }
  return c.json({ error: 'Unknown Type' }, 400);
})

app.fire()

export default app
