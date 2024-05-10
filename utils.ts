// utils.ts
import type { Client } from "discord.js-selfbot-v13";
const JSON_URL =
	"https://gist.githubusercontent.com/Dziurwa14/05db50c66e4dcc67d129838e1b9d739a/raw/f6232d1c0d399f87fedc5ab3c8709cd614f7d186/spy.pet%2520accounts";

export async function fetchUserIds(): Promise<string[]> {
	try {
		const response = await fetch(JSON_URL);
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
		return (await response.json()) as string[];
	} catch (error) {
		console.error("Error fetching user IDs:", error);
		return [];
	}
}

export async function fetchBansOnce(
	client: Client,
	guildId: string,
): Promise<Set<string>> {
	const guild = client.guilds.cache.get(guildId);
	if (!guild) throw new Error("Server not found.");

	const bans = await guild.bans.fetch();
	return new Set(bans.map((ban) => ban.user.id));
}

export async function banUser(
	client: Client,
	guildId: string,
	userId: string,
	reason = "spy.pet self-bot",
): Promise<void> {
	const guild = client.guilds.cache.get(guildId);
	if (!guild) {
		console.error("Guild not found.");
		return;
	}

	try {
		await guild.members.ban(userId, { reason });
		console.log(`Banned ${userId} for reason: '${reason}'`);
	} catch (error) {
		if (isError(error)) {
			if (error.message.includes("Missing Permissions")) {
				console.error(`Failed to ban ${userId}: Missing permissions.`);
			} else {
				console.error(`Failed to ban ${userId}:`, error.message);
			}
		} else {
			console.error(`Failed to ban ${userId} due to an unexpected error.`);
		}
	}
}

export function isError(error: unknown): error is Error {
	return error instanceof Error;
}
