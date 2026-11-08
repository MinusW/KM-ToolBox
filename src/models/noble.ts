import { defaults } from "@/defaults";
import { Buff } from "./buff";
import { Trait } from "./trait";

const IMPOSSIBLE_TRAITS = new Set(["Inbred", "Bastard"]);
const byName = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export class Noble {
	traits: Trait[] = [];
	readonly type: string | undefined;

	constructor(
		public readonly role: string,
		public readonly level = 1,
		public readonly tier = "legendary",
	) {
		this.type = defaults.nobleTypes[role];
	}

	get multipliers() {
		return defaults.multipliers[this.role] ?? {};
	}

	get score(): number {
		return this.traits.reduce((sum, t) => sum + t.score(this.multipliers), 0);
	}

	addTrait(name: string, level: number): void {
		const trait = defaults.traits.find((t) => t.name === name && t.level === level);
		if (trait) this.traits.push(trait);
	}

	deleteTraitsWithName(name: string): void {
		this.traits = this.traits.filter((t) => t.name !== name);
	}

	innatesTraitCount(): number {
		const base = defaults.traitsOnTier[this.tier] ?? 0;
		// Math.floor matches Ruby's integer division (the original .ceil was a no-op)
		return base + Math.floor((this.level - 1) / defaults.levelsPerStage) - 1;
	}

	maxInnateCount(): number | null {
		if (this.tier !== "legendary") return null;
		// The original formula's legendary-tier terms cancel out
		return (defaults.stages[this.role] ?? 0) - 1 + (defaults.traitsOnTier.mythical ?? 0);
	}

	potentialTraits(): Trait[] {
		const max = this.maxInnateCount();
		if (max === null) return [];
		const slots = Math.max(0, max - this.innatesTraitCount());
		const m = this.multipliers;

		return defaults.traits
			.filter(
				(t) =>
					t.type === this.type &&
						t.score(m) > 0 &&
						!IMPOSSIBLE_TRAITS.has(t.name) &&
						!this.traits.includes(t),
			)
			.sort((a, b) => b.score(m) - a.score(m) || byName(a.name, b.name))
			.slice(0, slots);
	}

	potentialScore(): number {
		const m = this.multipliers;
		return this.score + this.potentialTraits().reduce((sum, t) => sum + t.score(m), 0);
	}

	totalBuffsAsTrait(): Trait {
		const m = this.multipliers;
		const names = [
			...new Set(
				this.traits.flatMap((t) => t.buffs.map((b) => b.name)).filter((n) => m[n] !== 0),
			),
		];

		const total = new Trait("Total Buffs", 1, this.type ?? "");
		for (const name of names) {
			const sum = this.traits.reduce(
				(acc, t) => acc + t.buffs.filter((b) => b.name === name).reduce((s, b) => s + b.value, 0),
				0,
			);
			total.buffs.push(new Buff(name, sum));
		}
		return total;
	}
}
