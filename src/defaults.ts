import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { Building } from "@/models/building";
import { Buff, type Multipliers } from "@/models/buff";
import { Trait } from "@/models/trait";
import { type CsvRow, col, readCsv, toFloat, toInt } from "@/utils/csv";

const DATA_DIR = join(import.meta.dir, "..", "data");
const dataPath = (...parts: string[]) => join(DATA_DIR, ...parts);

export const defaults = {
	buildings: new Map<string, Building>(),
	multipliers: {} as Record<string, Multipliers>, // role -> buff multipliers
	traits: [] as Trait[],
	stages: {} as Record<string, number>,
	traitsOnTier: {} as Record<string, number>,
	emojis: {} as Record<string, string>,
	nobleTypes: {
		captain: "combat",
		knight: "combat",
		subjugator: "combat",
		explorer: "exploration",
		merchant: "trading",
		collier: "mining",
	} as Record<string, string>,
	levelsPerStage: 40,
};

async function loadBuildings(): Promise<Map<string, Building>> {
	const dir = dataPath("buildings");
	const files = (await readdir(dir)).filter((f) => f.endsWith(".csv"));
	const entries = await Promise.all(
		files.map(async (f) => [basename(f, ".csv"), await Building.fromCsv(join(dir, f))] as const),
	);
	return new Map(entries);
}

async function loadMultipliers(): Promise<Record<string, Multipliers>> {
	const result: Record<string, Multipliers> = {};
	for (const row of await readCsv(dataPath("buffMultiplier.csv"))) {
		const role = col(row, "role");
		result[role] = Object.fromEntries(
			Object.entries(row)
				.filter(([name]) => name !== "role")
				.map(([name, value]) => [name, toFloat(value)]),
		);
	}
	return result;
}

async function loadTraits(): Promise<Trait[]> {
	const rows = await readCsv(dataPath("traits.csv"));
	const buffColumns = Object.keys(rows[0] ?? {}).slice(3); // columns after trait, level, type

	return rows.map((row) => {
		const trait = new Trait(col(row, "trait"), toInt(row.level), col(row, "type"));
		for (const name of buffColumns) {
			const raw = row[name];
			if (!raw?.trim()) continue; // a blank cell is nil in Ruby, so it's skipped
			trait.buffs.push(new Buff(name, toInt(raw)));
		}
		return trait;
	});
}

async function loadKeyed<T>(file: string, key: string, value: (row: CsvRow) => T) {
	const result: Record<string, T> = {};
	for (const row of await readCsv(dataPath(file))) result[col(row, key)] = value(row);
	return result;
}

// Builds everything first, then swaps, so a bad CSV can't leave data half-loaded.
export async function loadData(): Promise<void> {
	const [buildings, multipliers, traits, stages, traitsOnTier, emojis] = await Promise.all([
		loadBuildings(),
		loadMultipliers(),
		loadTraits(),
		loadKeyed("stages.csv", "role", (r) => toInt(r.stages)),
		loadKeyed("traitsOnTier.csv", "tier", (r) => toInt(r.traitcount)),
		loadKeyed("emojis.csv", "name", (r) => r.id),
	]);
	Object.assign(defaults, { buildings, multipliers, traits, stages, traitsOnTier, emojis });
}
