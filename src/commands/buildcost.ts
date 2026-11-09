import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { Building, type CountRange, type Prices } from "@/models/building";
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
		o.setName("verbose").setDescription("Show exact values instead of short ones (Default True)"),
	)
	.addBooleanOption((o) => 
		o.setName("breakdown").setDescription("Show each building’s cost separately (Default True & Only works with ‘all’)"),
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

const LINE_WIDTH = 34;

// Label on the left, value on the right, the gap filled with spaces
function spread(rows: [string, string][]): string {
	// Grow past LINE_WIDTH if a row needs it, so nothing gets cut off
	const width = Math.max(LINE_WIDTH, ...rows.map(([l, v]) => l.length + v.length + 1));
	return codeBlock(
		rows.map(([l, v]) => l + " ".repeat(width - l.length - v.length) + v).join("\n"),
	);
}

// "3" when every level in range has the same count, "1-3" when it varies, null when it's just 1
function countLabel(count: CountRange): string | null {
	if (count.max <= 1) return null;
	return count.min === count.max ? String(count.max) : `${count.min}-${count.max}`;
}

type BuildingEntry = { name: string; prices: Prices; count: CountRange };

function breakdownFields(buildings: BuildingEntry[], fmt: (n: number) => string) {
	return buildings.slice(0, 25).map(({ name, prices, count }) => {
		const rows: [string, string][] = [];

		const countText = countLabel(count);
		if (prices.stone > 0) rows.push(["Stone", fmt(prices.stone)]);

		for (const [metal, { common, uncommon }] of Object.entries(prices.metals).sort(([a], [b]) =>
			a.localeCompare(b),
		)) {
			if (common === 0 && uncommon === 0) continue;
			rows.push([capitalize(metal), `${fmt(common)} / ${fmt(uncommon)}`]);
		}
		if (countText) rows.push(["Count", countText]);

		return {
			name: capitalize(name),
			value: rows.length > 0 ? spread(rows) : codeBlock("-"), // Discord rejects empty values
			inline: false,
		};
	});
}

export async function execute(interaction: Parameters<Command["execute"]>[0]) {
	const name = interaction.options.getString("building", true).toLowerCase();
	const start = interaction.options.getInteger("start_level") ?? 0;
	const end = interaction.options.getInteger("end_level") ?? 40;
	const verbose = interaction.options.getBoolean("verbose") ?? true;
	// Silently ignored for a single building
	const breakdown = name === "all" && (interaction.options.getBoolean("breakdown") ?? false);

	if (start >= end) {
		await interaction.reply({
			content: "`end_level` must be higher than `start_level`.",
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	let prices: Prices;
	let count: string | null = null; // only set when querying a single building
	if (name === "all") {
		const buildings = [...defaults.buildings.values()];
		if (!buildings.some((b) => b.countRange(start, end))) {
			await interaction.reply({
				content: `No building has upgrades from level ${start} to ${end}.`,
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		prices = Building.getAllPricesTogether(buildings, start, end);
	} else {
		const building = defaults.buildings.get(name);
		if (!building) {
			await interaction.reply({ content: "Building not found.", flags: MessageFlags.Ephemeral });
			return;
		}
		const counts = building.countRange(start, end);
		if (!counts) {
			await interaction.reply({
				content: `${capitalize(name)} has no upgrades from level ${start} to ${end}.`,
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		count = countLabel(counts);
		prices = building.getPricesInLevelRange(start, end);
	}

	// Exact numbers when verbose, short ones (2.30m) otherwise
	const fmt = (n: number) => (verbose ? thousands(n) : compact(n));
	const show = (n: number) => codeBlock(fmt(n));
	const note = "Total Stone will vary based on your current research progress.";

	const range =
		start === 0
			? `to reach level ${end}`
			: `to go from level ${start} to ${end}`;

	const lines = [
		`# ${name === "all" ? "All Buildings" : capitalize(name)}`,
		`## Resources needed ${range}`,
	];

	const totals = new EmbedBuilder().setColor(color.primary);
	totals.addFields(
		{ name: "Stone", value: show(prices.stone) },
		...Object.entries(prices.metals).flatMap(([metal, { common, uncommon }]) => [
			{ name: `Common ${capitalize(metal)}`, value: show(common) },
			{ name: `Uncommon ${capitalize(metal)}`, value: show(uncommon) },
		]),
	);
	if (count) totals.addFields({ name: "Count", value: codeBlock(count) });
	totals.setFooter({text: note});

	const embeds = [totals];
	let breakdownShown = false;

	if (breakdown) {
		const entries = [...defaults.buildings.values()]
		.sort((a, b) => a.name.localeCompare(b.name))
		.flatMap((b) => {
			const counts = b.countRange(start, end);
			// No levels in range means no upgrade, so the building is skipped
			if (!counts) return [];
			return [{ name: b.name, prices: b.getPricesInLevelRange(start, end), count: counts }];
		});

		if (entries.length > 0) {
			embeds.push(new EmbedBuilder().setColor(color.primary).addFields(breakdownFields(entries, fmt)));
			breakdownShown = true;
		}
	}

	embeds.at(-1)?.setFooter({
		text: breakdownShown ? `Metals: common / uncommon.\n${note}` : note,
	});

	await interaction.reply({ content: lines.join("\n"), embeds });
}
