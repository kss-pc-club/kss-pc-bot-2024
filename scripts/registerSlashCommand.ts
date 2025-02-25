// ref: https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers#registering-commands

import { REGISTER_COMMAND, HELP_COMMAND, PING_COMMAND } from "../src/commands"

const commands = [
    REGISTER_COMMAND,
    HELP_COMMAND,
    PING_COMMAND
]

const register = async (command: any) => {
    const json = {
        name: command.name,
        description: command.description,
        type: command.type,
        options: command?.options,
    }
    const headers = {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json',
    }
    const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_APPLICATION_ID}/commands`;

    await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(json),
    }).then((res) => {
        console.log('Response:', res.status, res.statusText)
        console.log('Registered command:', REGISTER_COMMAND.name)
    }).catch((err) => {
        console.error('Failed to register command:', REGISTER_COMMAND.name)
        console.error(err)
    });
}

commands.forEach(register)
