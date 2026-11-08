import Papa from "papaparse";
import { basename } from "node:path";
import type { BuildingLevel } from "@/types/buildingLevel";

export type MetalTotals = { common: number; uncommon: number };
export type Prices = {
	stone: number;
	metals: Record<string, MetalTotals>;
};
export type CountRange = { min: number; max: number };

// Mirrors Ruby's to_i: blank or invalid becomes 0
const toInt = (value: string | undefined): number =>
	Number.parseInt(value ?? "", 10) || 0;

const emptyPrices = (): Prices => ({ stone: 0, metals: {} });

const addMetal = (
	prices: Prices,
	metal: string,
	common: number,
	uncommon: number,
) => {
	const entry = (prices.metals[metal] ??= { common: 0, uncommon: 0 });
	entry.common += common;
	entry.uncommon += uncommon;
};

export class Building {
	constructor(
		public readonly name: string,
		public readonly levels: BuildingLevel[],
	) {}

	static async fromCsv(path: string): Promise<Building> {
		const text = await Bun.file(path).text();
		const { data } = Papa.parse<Record<string, string>>(text, {
			header: true,
			delimiter: ";",
			skipEmptyLines: true,
		});

		const levels: BuildingLevel[] = data.map((row) => ({
			keepLevel: toInt(row.keepLevel),
			common: toInt(row.common),
			uncommon: toInt(row.uncommon),
			metalType: row.metalType?.trim() || null,
			stone: toInt(row.stone),
			count: toInt(row.count) || 1,
		}));

		return new Building(basename(path, ".csv"), levels);
	}

	levelsInRange(startLevel: number, endLevel: number): BuildingLevel[] {
		return this.levels.filter((l) => l.keepLevel > startLevel && l.keepLevel <= endLevel);
	}

	// Smallest and largest count among the levels in range, or null when no level falls in it
	countRange(startLevel: number, endLevel: number): CountRange | null {
		const counts = this.levelsInRange(startLevel, endLevel).map((l) => l.count);
		if (counts.length === 0) return null;
		return { min: Math.min(...counts), max: Math.max(...counts) };
	}

	getPricesInLevelRange(startLevel: number, endLevel: number): Prices {
		const totals = emptyPrices();

		for (const level of this.levels) {
			if (level.keepLevel <= startLevel || level.keepLevel > endLevel) continue;

			if (level.metalType) {
				addMetal(
					totals,
					level.metalType,
					level.common * level.count,
					level.uncommon * level.count,
				);
			}
			totals.stone += level.stone * level.count;
		}

		return totals;
	}

	static getAllPricesTogether(
		buildings: Iterable<Building>,
		startLevel: number,
		endLevel: number,
	): Prices {
		const totals = emptyPrices();

		for (const building of buildings) {
			const prices = building.getPricesInLevelRange(startLevel, endLevel);
			totals.stone += prices.stone;
			for (const [metal, { common, uncommon }] of Object.entries(prices.metals)) {
				addMetal(totals, metal, common, uncommon);
			}
		}

		return totals;
	}
}
