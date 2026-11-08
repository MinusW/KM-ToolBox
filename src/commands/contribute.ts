import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
.setName("contribute")
.setDescription("Contribute to the bot's development");

export async function execute(interaction: ChatInputCommandInteraction) {
	const url = process.env.REPOSITORY_URL;
	await interaction.reply(
		url ? `Contribute to the bot's development at ${url}` : "No repository link has been set up yet.",
	);
}
