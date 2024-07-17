import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { InteractionResponseType, InteractionType } from 'discord-interactions'
import { verifyKey } from 'discord-interactions'

const app = new Hono()

app.post('/', async (c) => {
  const { DISCORD_PUBLIC_KEY } = env<{ DISCORD_PUBLIC_KEY: string }>(c)
  const signature = c.req.header('X-Signature-Ed25519');
  const timestamp = c.req.header('X-Signature-Timestamp');
  const body = await c.req.text();
  const isValidRequest =
    signature && timestamp && verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY);
  if (!isValidRequest) {
    return c.text('Bad request signature.', 401);
  }

  const interaction = JSON.parse(body);
  if (!interaction) {
    return c.text('Bad request signature.', 401);
  }

  if (interaction.type === InteractionType.PING) {
    return c.json({
      type: InteractionResponseType.PONG,
    });
  }
})

export default app
