import { Hono } from 'hono'
import { InteractionResponseType, InteractionType } from 'discord-interactions'
import { verifyDiscordInteraction } from './verifyDiscordInteraction'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { REGISTER_COMMAND, ROLE_COMMAND } from './commands'
import { addRole, getGuildRoles, createRole, removeRole } from './role'

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
        // todo: エラーハンドリング
        const roles = await getGuildRoles(c, message.guild_id);
        let termRole = roles.find((role: any) => role.name === `${term}期生`);
        if (!termRole) {
          const role = await createRole(c, message.guild_id, `${term}期生`);
          if (!role) {
            return c.json({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {
                content: 'ロールの作成に失敗しました',
              }
            });
          }
          termRole = role;
        }
        // todo: ユーザが既でに持っている期生ロールを削除
        // todo: エラーハンドリング
        await addRole(c, message.guild_id, message.member.user.id, termRole.id);
        return c.json({ type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: `${term}期生として登録しました。` } });
      }
      case ROLE_COMMAND.name.toLowerCase(): {
        const { DISCORD_TOKEN } = env<{ DISCORD_TOKEN: string }>(c)
        const guildId = message.guild_id;
        const endpoint = `https://discord.com/api/v10/guilds/${guildId}/roles`;
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`,
          },
        });
        if (!response.ok) {
          return c.json({ error: 'Failed to fetch roles' }, 500);
        }
        const roles: any = await response.json();
        const roleNames = roles.map((role: any) => role.name);
        return c.json({ type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: `サーバに存在するロールは${roleNames.join(', ')}です` } });
      }
      default:
        return c.json({ error: 'Unknown Command' }, 400);
    }
  }
  return c.json({ error: 'Unknown Type' }, 400);
})

app.fire()

export default app
