import { REST, Routes } from "discord.js";
import { commands } from "@/commands";

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
	console.error("Missing DISCORD_TOKEN or CLIENT_ID in .env");
	process.exit(1);
}

const rest = new REST().setToken(DISCORD_TOKEN);
const body = commands.map((c) => c.data.toJSON());

// With GUILD_ID set, commands go to that server only (handy for testing).
// Without it they're global, like your Ruby script.
const route = GUILD_ID
	? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
	: Routes.applicationCommands(CLIENT_ID);

await rest.put(route, { body });
console.log(`Registered ${body.length} command(s) ${GUILD_ID ? "to guild" : "globally"}`);
