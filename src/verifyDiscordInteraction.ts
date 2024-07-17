
import { verifyKey } from "discord-interactions";
import { env } from "hono/adapter";
import { createMiddleware } from "hono/factory";

export const verifyDiscordInteraction = createMiddleware(async (c, next) => {
    const { DISCORD_PUBLIC_KEY } = env<{ DISCORD_PUBLIC_KEY: string }>(c)
    const signature = c.req.header('X-Signature-Ed25519');
    const timestamp = c.req.header('X-Signature-Timestamp');
    const body = await c.req.raw.clone().text();
    if (signature == null || timestamp == null || !await verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY)) {
        return c.text('Bad request signature.', 401);
    }

    await next();
});
