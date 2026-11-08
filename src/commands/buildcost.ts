import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { Building, type Prices } from "@/models/building";
import { defaults } from "@/defaults";
import type { Command } from "@/types/command";
import { capitalize, codeBlock, color, compact, thousands } from "@/utils/format";

export const data = new SlashCommandBuilder()
	.setName("buildcost")
	.setDescription("Total cost to upgrade a building from one level to another level")
	.addStringOption((o) =>
		o.setName("building").setDescription("Building name, or 'all'").setRequired(true).setAutocomplete(true),
	)
	.addIntegerOption((o) =>
		o.setName("start_level").setDescription("Starting level (Default 0)").setMinValue(0),
	)
	.addIntegerOption((o) =>
		o.setName("end_level").setDescription("Target level (Default 40)").setMinValue(1),
	)
	.addBooleanOption((o) =>
		o.setName("verbose").setDescription("Show exact values instead of short ones (Default false)"),
	);

export async function autocomplete(interaction: Parameters<NonNullable<Command["autocomplete"]>>[0]) {
	const typed = interaction.options.getFocused().toLowerCase();
	const names = ["all", ...defaults.buildings.keys()];
	await interaction.respond(
		names
			.filter((n) => n.includes(typed))
			.slice(0, 25)
			.map((n) => ({ name: n, value: n })),
	);
}

export async function execute(interaction: Parameters<Command["execute"]>[0]) {
	const name = interaction.options.getString("building", true).toLowerCase();
	const start = interaction.options.getInteger("start_level") ?? 0;
	const end = interaction.options.getInteger("end_level") ?? 40;
	const verbose = interaction.options.getBoolean("verbose") ?? false;

	if (start >= end) {
		await interaction.reply({
			content: "`end_level` must be higher than `start_level`.",
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	let prices: Prices;
	if (name === "all") {
		prices = Building.getAllPricesTogether(defaults.buildings.values(), start, end);
	} else {
		const building = defaults.buildings.get(name);
		if (!building) {
			await interaction.reply({ content: "Building not found.", flags: MessageFlags.Ephemeral });
			return;
		}
		prices = building.getPricesInLevelRange(start, end);
	}

	// Exact numbers when verbose, short ones (2.30m) otherwise
	const show = (n: number) => codeBlock(verbose ? thousands(n) : compact(n));

	const lines = [
		`# ${name === "all" ? "All Buildings" : capitalize(name)}`,
		`## Cost from level ${start} to level ${end}:`,
	];

	const embed = new EmbedBuilder()
		.setColor(color.primary)
		.addFields(
			{ name: "Stone", value: show(prices.stone) },
			...Object.entries(prices.metals).flatMap(([metal, { common, uncommon }]) => [
				{ name: `Common ${capitalize(metal)}`, value: show(common) },
				{ name: `Uncommon ${capitalize(metal)}`, value: show(uncommon) },
			]),
		)
		.setFooter({ text: "Total Stone will vary based on your current research progress." });

	await interaction.reply({ content: lines.join("\n"), embeds: [embed] });
}
