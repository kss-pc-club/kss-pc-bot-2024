import { APIRole } from "discord-api-types/v10";
import { Context } from "hono";
import { env } from "hono/adapter";

const discordEndpoint = 'https://discord.com/api/v10';

export const getGuildRoles = async (c: Context, guildId: string) => {
    const { DISCORD_TOKEN } = env<{ DISCORD_TOKEN: string }>(c)
    const endpoint = `${discordEndpoint}/guilds/${guildId}/roles`;
    try {
        const response = await fetch(endpoint, {
            headers: {
                Authorization: `Bot ${DISCORD_TOKEN}`,
            },
        });
        if (!response.ok) {
            console.error(response);
            const text = await response.text();
            throw Error('Failed to fetch roles: ' + text + ' ' + response.statusText);
        }
        const roles: APIRole[] = await response.json() as APIRole[];
        return roles;
    } catch (e) {
        console.error(e);
        throw Error('Failed to get roles: ' + e);
    }
}

export const createGuildRole = async (c: Context, guildId: string, name: string) => {
    const { DISCORD_TOKEN } = env<{ DISCORD_TOKEN: string }>(c)
    const endpoint = `${discordEndpoint}/guilds/${guildId}/roles`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bot ${DISCORD_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, color: 0x217ff3, hoist: true, mentionable: true, permissions: 0 }),
        });
        if (!response.ok) {
            console.error(response);
            const text = await response.text();
            throw Error('Failed to create role: ' + response.statusText + ' ' + text);
        }
        const role: APIRole = await response.json() as APIRole;
        return role;
    } catch (e) {
        console.error(e);
        throw Error('Failed to create role: ' + e);
    }
}

export const assignRoleToUser = async (c: Context, guildId: string, userId: string, roleId: string) => {
    const { DISCORD_TOKEN } = env<{ DISCORD_TOKEN: string }>(c)
    const endpoint = `${discordEndpoint}/guilds/${guildId}/members/${userId}/roles/${roleId}`;
    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                Authorization: `Bot ${DISCORD_TOKEN}`,
            },
        });
        if (!response.ok) {
            console.log(response);
            const text = await response.text();
            throw Error('Failed to assign role: ' + response.statusText + ' ' + text);
        }
    } catch (e) {
        console.error(e);
        throw Error('Failed to assign role: ' + e);
    }
}

export const removeUserRole = async (c: Context, guildId: string, userId: string, roleId: string) => {
    const { DISCORD_TOKEN } = env<{ DISCORD_TOKEN: string }>(c)
    const endpoint = `${discordEndpoint}/guilds/${guildId}/members/${userId}/roles/${roleId}`;
    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                Authorization: `Bot ${DISCORD_TOKEN}`,
            },
        });
        if (!response.ok) {
            console.error(response);
            const text = await response.text();
            throw Error('Failed to remove role: ' + response.statusText + ' ' + text);
        }
    } catch (e) {
        console.error(e);
        throw Error('Failed to remove role: ' + e);
    }
}
