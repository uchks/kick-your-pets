// index.ts
import { Client } from "discord.js-selfbot-v13";
import { createInterface } from "node:readline";
import { fetchUserIds, banUser, fetchBansOnce } from "./utils";

const client = new Client();
const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});
const token = Bun.env.USER_TOKEN;

client.on("ready", async () => {
	console.log(`Logged in as ${client.user?.tag}!`);

	rl.question("Please enter the guild ID: ", async (guildId) => {
		try {
			const userIds = await fetchUserIds();
			const bannedUserIds = await fetchBansOnce(client, guildId);
			let processedCount = 0;

			for (const userId of userIds) {
				if (!bannedUserIds.has(userId)) {
					await banUser(client, guildId, userId);
					bannedUserIds.add(userId);
					processedCount++;
				}
			}

			console.log(`Complete. Bans: ${processedCount}`);
		} catch (error) {
			console.error("Error processing bans:", error);
		} finally {
			rl.close();
			process.exit(0);
		}
	});
});

client.login(token).catch(console.error);
