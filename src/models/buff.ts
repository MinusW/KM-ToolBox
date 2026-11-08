export type Multipliers = Record<string, number>; // buff name -> multiplier for one role

export class Buff {
	constructor(
		public name: string,
		public value: number,
	) {}

	score(multipliers: Multipliers): number {
		return this.value * (multipliers[this.name] ?? 0);
	}
}
