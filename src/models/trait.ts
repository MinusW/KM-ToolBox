import type { Buff, Multipliers } from "./buff";

export class Trait {
	buffs: Buff[] = [];

	constructor(
		public name: string,
		public level: number,
		public type: string,
	) {}

	score(multipliers: Multipliers): number {
		return this.buffs.reduce((sum, buff) => sum + buff.score(multipliers), 0);
	}

	// Key into the emojis map, e.g. TRAITS_QUICK_LEARNER_2
	get emojiKey(): string {
		return `TRAITS_${this.name.toUpperCase()}_${this.level}`
			.replace(/[()-]/g, "")
			.replaceAll(" ", "_");
	}
}
