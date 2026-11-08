import { Noble } from "./noble";

const EXPIRY_MS = 15 * 60 * 1000;

export class NobleInteraction {
	readonly noble: Noble;

	constructor(
		readonly userId: string,
		readonly channelId: string,
		role: string,
		level = 1,
		tier = "legendary",
	) {
		this.noble = new Noble(role, level, tier);
	}

	traitChoice(traitName: string, levels: number[]): void {
		this.noble.deleteTraitsWithName(traitName);
		for (const level of levels) this.noble.addTrait(traitName, level);
	}
}

export class NobleInteractions {
	private items = new Map<string, NobleInteraction>();
	private timers = new Map<string, ReturnType<typeof setTimeout>>();

	private key(userId: string, channelId: string) {
		return `${userId}:${channelId}`;
	}

	add(interaction: NobleInteraction): void {
		const { userId, channelId } = interaction;
		this.remove(userId, channelId); // also cancels the old timer
		const key = this.key(userId, channelId);
		this.items.set(key, interaction);
		this.timers.set(key, setTimeout(() => this.remove(userId, channelId), EXPIRY_MS));
	}

	get(userId: string, channelId: string): NobleInteraction | undefined {
		return this.items.get(this.key(userId, channelId));
	}

	remove(userId: string, channelId: string): void {
		const key = this.key(userId, channelId);
		clearTimeout(this.timers.get(key));
		this.timers.delete(key);
		this.items.delete(key);
	}
}

export const nobleInteractions = new NobleInteractions();
