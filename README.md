# KSS-PC-BOT 2024

KSS PC Club（茨城県立古河中等教育学校パソコン部）の Discord にて運用している bot です.
hono を用いて実装されており、Cloudflare Workers 上で動作します.

## サーバへの導入

```bash
$ git clone {this repository}
$ cd {this repository}
$ bun install
```

1. [Discord Developer Potal](https://discord.com/developers/applications) から新規に Discord App を登録し、`Application ID`, `Public Key`, `Token` を取得します.
2. Discord App の OAuth2 から `bot` スコープを選択し、`Manage Roles`, `Send Messages`, `Use Slash Commands` の権限を付与します.
3. 2 で生成された URL にアクセスし、bot をサーバーに追加します.
4. `bun run ./scriptd/registerSlashCommands.ts` を実行し、Slash Commands を登録します.
5. 1 で取得した情報をそれぞれ`DISCORD_APPLICATION_ID`, `DISCORD_PUBLIC_KEY`, `DISCORD_TOKEN` を環境変数として設定します.

```bash
$ bunx wrangler secret put DISCORD_APPLICATION_ID
$ bunx wrangler secret put DISCORD_PUBLIC_KEY
$ bunx wrangler secret put DISCORD_TOKEN
```

6. `bun run deploy` でデプロイします.
7. 5 で生成された URL (`https://kss-pc-bot.***.workers.dev`) を Discord Developer Potal の `Interactions Endpoint URL` に設定します.
