import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { templeCost } from "@/models/temple";
import { color, thousands } from "@/utils/format";

export const data = new SlashCommandBuilder()
.setName("temple")
.setDescription("Calculate temple cost")
.addIntegerOption((o) => o.setName("start_level").setDescription("Starting level (default 0)").setMinValue(0))
.addIntegerOption((o) => o.setName("end_level").setDescription("Ending level (default 50)").setMinValue(1));

export async function execute(interaction: ChatInputCommandInteraction) {
	const start = interaction.options.getInteger("start_level") ?? 0;
	const end = interaction.options.getInteger("end_level") ?? 50;
	const cost = templeCost(start, end);

	const embed = new EmbedBuilder()
	.setTitle("Temple")
	.setDescription(`Cost from level ${start} to level ${end} is:`)
	.setColor(color.primary)
	.addFields(
		{ name: "Bricks", value: thousands(cost.bricks) },
		{ name: "Blocks", value: thousands(cost.blocks) },
		{ name: "Slabs", value: thousands(cost.slabs) },
	);

	await interaction.reply({ embeds: [embed] });
}
