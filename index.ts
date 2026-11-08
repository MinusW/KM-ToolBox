import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { commands } from "@/commands";
import { loadData } from "@/defaults";

await loadData();

const byName = new Map(commands.map((c) => [c.data.name, c]));
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => console.log(`Logged in as ${c.user.tag}`));

client.on(Events.InteractionCreate, async (interaction) => {
	try {
		if (interaction.isAutocomplete()) {
			await byName.get(interaction.commandName)?.autocomplete?.(interaction);
		} else if (interaction.isChatInputCommand()) {
			await byName.get(interaction.commandName)?.execute(interaction);
		} else if (interaction.isButton()) {
			await byName.get(interaction.customId.split("/")[0] ?? "")?.button?.(interaction);
		} else if (interaction.isStringSelectMenu()) {
			await byName.get(interaction.customId.split("/")[0] ?? "")?.select?.(interaction);
		}
	} catch (err) {
		console.error(err);
		if (interaction.isRepliable()) {
			const msg = { content: "Something went wrong.", flags: MessageFlags.Ephemeral } as const;
			const send =
				interaction.replied || interaction.deferred
					? interaction.followUp(msg)
					: interaction.reply(msg);
			await send.catch(console.error); // the interaction may have expired
		}
	}
});

// Health check for hosts that expect an open port (replaces the WEBrick thread)
Bun.serve({
	port: Number(process.env.PORT ?? 10000),
	fetch: () => new Response("ok"),
});

await client.login(process.env.DISCORD_TOKEN);
