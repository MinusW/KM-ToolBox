import { REST, Routes } from "discord.js";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { commands } from "@/commands";

const HASH_FILE = join(import.meta.dir, "..", ".commands-hash");

export async function registerCommands({ force = false } = {}) {
	const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
	if (!DISCORD_TOKEN || !CLIENT_ID) {
		throw new Error("Missing DISCORD_TOKEN or CLIENT_ID in .env");
	}

	const body = commands.map((c) => c.data.toJSON());
	// Include the target, so switching app or guild triggers a fresh registration
	const hash = createHash("sha256")
		.update(JSON.stringify({ CLIENT_ID, GUILD_ID, body }))
		.digest("hex");

	const saved = Bun.file(HASH_FILE);
	if (!force && (await saved.exists()) && (await saved.text()) === hash) {
		console.log("Commands unchanged, skipping registration");
		return;
	}

	const rest = new REST().setToken(DISCORD_TOKEN);

	// With GUILD_ID set, commands go to that server only (handy for testing).
	// Without it they're global, like your Ruby script.
	const route = GUILD_ID
		? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
		: Routes.applicationCommands(CLIENT_ID);

	await rest.put(route, { body });
	await Bun.write(HASH_FILE, hash);
	console.log(`Registered ${body.length} command(s) ${GUILD_ID ? "to guild" : "globally"}`);
}

// `bun run src/register.ts` (your "register" script) still forces a registration
if (import.meta.main) {
	await registerCommands({ force: true }).catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
