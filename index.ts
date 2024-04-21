// index.ts
// Created on 21/04/2024
import { Client } from "discord.js-selfbot-v13";
import * as readline from "readline";

const client = new Client();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const token = Bun.env.USER_TOKEN;
const jsonUrl = "https://kickthespy.pet/ids"; // kickthespy.pet endpoint returning all IDs of known spy.pet bots

async function fetchUserIds() {
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user IDs:", error);
    return [];
  }
}

async function fetchBansOnce(guildId: string) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    console.error(
      "Guild not found."
    );
    throw new Error("Guild not found.");
  }
  const bans = await guild.bans.fetch();
  return new Set(bans.map((ban) => ban.user.id));
}

async function banUser(
  guildId: string,
  userId: string,
  reason: string = "spy.pet self-bot"
) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    console.error(
      "Guild not found."
    );
    return;
  }
  try {
    await guild.members.ban(userId, { reason });
    console.log(`Banned user ${userId} for reason: '${reason}'`);
  } catch (error) {
    const e = error as Error;
    if (e.message.includes("Missing Permissions")) {
      console.error(`Failed to ban user ${userId}: Missing permissions.`);
    } else {
      console.error(`Failed to ban user ${userId}:`, e.message);
    }
  }
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  rl.question('Please enter the guild ID: ', async (guildId) => {
    try {
      const userIds = await fetchUserIds();
      const bannedUserIds = await fetchBansOnce(guildId);
      let processedCount = 0;

      for (const userId of userIds) {
        if (!bannedUserIds.has(userId)) {
          await banUser(guildId, userId);
          bannedUserIds.add(userId);
          processedCount++;
        }
      }

      console.log(`Complete. Bans: ${processedCount}`);
    } catch (error) {
      const e = error as Error;
      console.error("An error occurred:", e.message);
    }
    rl.close();
    process.exit(0);
  });
});


client.login(token);
