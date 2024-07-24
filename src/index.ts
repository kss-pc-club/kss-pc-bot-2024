import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { APIInteraction, InteractionType, InteractionResponseType, APIInteractionResponse, ApplicationCommandType } from 'discord-api-types/v10'
import { verifyDiscordInteraction } from './verifyDiscordInteraction'
import { REGISTER_COMMAND } from './commands'
import { assignRoleToUser, getGuildRoles, createGuildRole, removeUserRole } from './role'

const app = new Hono()

app.use('*', logger())

app.get('/', (c) => {
  console.log(c);
  return c.text('Hello World')
})

app.post('/', verifyDiscordInteraction, async (c) => {
  const message: APIInteraction = await c.req.json()

  if (message.type === InteractionType.Ping) {
    return c.json<APIInteractionResponse>({
      type: InteractionResponseType.Pong,
    });
  }

  if (message.type === InteractionType.ApplicationCommand) {
    switch (message.data.name.toLowerCase()) {
      case REGISTER_COMMAND.name.toLowerCase(): {
        // @ts-ignore
        const input = message.data.options.find((o: any) => o.name === 'year').value as number;
        const currentYear = new Date().getFullYear();
        if (!input || input < 2013 || input > currentYear) {
          return c.json({
            type: InteractionResponseType.ChannelMessageWithSource, data: {
              content: `[warn] 入学年度は、2013-${currentYear}の間の整数で指定してください。`
            }
          });
        }

        const guildId = message.guild_id;
        const userId = message.member?.user.id;
        const userRoles = message.member?.roles;
        if (!guildId || !userId || !userRoles) {
          return c.json({
            type: InteractionResponseType.ChannelMessageWithSource, data: {
              content: '[error] サーバ情報が取得できませんでした',
            }
          });
        }

        // 入学年度から期生を計算
        const term = input - 2013 + 1;

        try {
          // サーバ内に存在するすべてのロールを取得
          const roles = await getGuildRoles(c, guildId);
          // term期生ロールを取得
          let termRole = roles.find((role: any) => role.name === `${term}期生`);
          // term期生ロールが存在しない場合、作成
          if (!termRole) {
            const newRole = await createGuildRole(c, guildId, `${term}期生`);
            if (!newRole) {
              return c.json({
                type: InteractionResponseType.ChannelMessageWithSource, data: {
                  content: `[error] 新規ロール(${term}期生)の作成に失敗しました`,
                }
              });
            }
            termRole = newRole;
          }
          // すでに他の期生ロールを持っている場合、削除
          const otherTermRoles = roles.filter((role: any) => role.name.match(/\d+期生/));
          for (const role of otherTermRoles) {
            if (userRoles.includes(role.id)) {
              await removeUserRole(c, guildId, userId, role.id);
              console.info(`[info] ${role.name}ロールを削除しました`);
            }
          }
          // term期生ロールを付与
          await assignRoleToUser(c, guildId, userId, termRole.id);
          console.info(`[info] ${term}期生として登録しました`);
          return c.json({
            type: InteractionResponseType.ChannelMessageWithSource, data: {
              content: `[success] ${term}期生として登録しました`,
            }
          });
        }
        catch (e) {
          console.error(e);
          return c.json({
            type: InteractionResponseType.ChannelMessageWithSource, data: {
              content: `[error] エラーが発生しました: ${e}`,
            }
          });
        };
      }
      default:
        return c.json({ error: 'Unknown Command' }, 400);
    }
  }
  return c.json({ error: 'Unknown Type' }, 400);
})

app.fire()

export default app
