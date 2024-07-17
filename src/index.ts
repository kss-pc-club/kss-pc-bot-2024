import { Hono } from 'hono'
import { InteractionResponseType, InteractionType } from 'discord-interactions'
import { verifyDiscordInteraction } from './verifyDiscordInteraction'
import { logger } from 'hono/logger'
import { REGISTER_COMMAND } from './commands'

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

  console.log(message)
  if (message.type === InteractionType.APPLICATION_COMMAND) {
    switch (message.data.name.toLowerCase()) {
      case REGISTER_COMMAND.name.toLowerCase(): {
        console.log(message.data.options)
        const input = message.data.options.find((o: any) => o.name === 'year').value as number;
        if (!input || input < 2013) {
          return c.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {
              content: '入学年度は2013年以降を指定してください',
            }
          });
        }
        const term = input - 2013 + 1;
        // todo: ロールを付与する
        return c.json({ type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: `${term}期生として登録しました。` } });
      }
      default:
        return c.json({ error: 'Unknown Command' }, 400);
    }
  }
  return c.json({ error: 'Unknown Type' }, 400);
})

app.fire()

export default app
