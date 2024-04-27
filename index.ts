// index.ts
import { Client } from "discord.js-selfbot-v13";
import * as readline from "readline";

const client = new Client(); // creates an instance for interacting with Discord
const rl = readline.createInterface({
  // sets up cli for interaction
  input: process.stdin,
  output: process.stdout,
});
const token = Bun.env.USER_TOKEN;
const jsonUrl = "https://kickthespy.pet/ids"; // endpoint returning all IDs of known spy.pet bots

// function to fetch self-bot IDs from the endpoint
async function fetchUserIds() {
  try {
    // attempt to fetch data from the URL
    const response = await fetch(jsonUrl);
    // check if it was successful
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json(); // parses and return the response (json)
  } catch (error) {
    console.error("Error fetching user IDs:", error); // log errors if the fetch fails
    return []; // returns an empty array on error
  }
}

// function to fetch current bans from a server
async function fetchBansOnce(guildId: string) {
  const guild = client.guilds.cache.get(guildId); // access the server by ID
  if (!guild) throw new Error("Server not found."); // throws an error if server not found
  const bans = await guild.bans.fetch(); // fetch list of bans
  return new Set(bans.map((ban) => ban.user.id)); // return a set of banned user IDs
}

// function to ban a user from the server
async function banUser(
  guildId: string,
  userId: string,
  reason: string = "spy.pet self-bot" // ban reason
) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    console.error("Guild not found.");
    return;
  }
  try {
    // attempt to ban the self-bot
    await guild.members.ban(userId, { reason });
    console.log(`Banned ${userId} for reason: '${reason}'`); // log success
  } catch (error) {
    // error handling during ban attempt
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

// bot is ready
client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}!`); // log when bot is ready
  rl.question("Please enter the guild ID: ", async (guildId) => {
    const userIds = await fetchUserIds(); // fetch bot IDs to ban
    const bannedUserIds = await fetchBansOnce(guildId); // fetch current bans
    let processedCount = 0;

    // loops through IDs and ban if not already banned
    for (const userId of userIds) {
      if (!bannedUserIds.has(userId)) {
        await banUser(guildId, userId); // bans ID
        bannedUserIds.add(userId); // adds to set of banned IDs
        processedCount++; // increment count
      }
    }

    console.log(`Complete. Bans: ${processedCount}`); // log completion
    rl.close(); // closes readline interface (cli)
    process.exit(0);
  });
});

// logs in to Discord with your token
client.login(token).catch(console.error);

// type guard to check if error is an instance of Error
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
