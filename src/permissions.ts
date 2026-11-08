import type { Interaction } from "discord.js";

const isOwner = (i: Interaction) => i.user.id === process.env.OWNER_ID;

function channelMatches(i: Interaction, ids: string[]): boolean {
	const channel = i.channel;
	const parentId = channel && "parentId" in channel ? channel.parentId : null;
	return (i.channelId !== null && ids.includes(i.channelId)) || (parentId !== null && ids.includes(parentId));
}

function memberRoleIds(i: Interaction): string[] {
	const roles = i.member?.roles;
	if (!roles) return [];
	return Array.isArray(roles) ? roles : [...roles.cache.keys()];
}

// Allowed only in the listed channels/categories (the owner is always allowed)
export class InclusivePermissions {
	constructor(
		protected channelIds: string[] = [],
		protected roleIds: string[] = [],
	) {}

	checkChannel(i: Interaction): boolean {
		return isOwner(i) || channelMatches(i, this.channelIds);
	}

	checkRole(i: Interaction): boolean {
		return isOwner(i) || memberRoleIds(i).some((id) => this.roleIds.includes(id));
	}
}

// Allowed everywhere except the listed ones
export class ExclusivePermissions extends InclusivePermissions {
	override checkChannel(i: Interaction): boolean {
		return isOwner(i) || !channelMatches(i, this.channelIds);
	}

	override checkRole(i: Interaction): boolean {
		return isOwner(i) || !memberRoleIds(i).some((id) => this.roleIds.includes(id));
	}
}

// Reads ids from env vars, skipping any that aren't set
export const envIds = (...names: string[]): string[] =>
	names.map((n) => process.env[n]).filter((v): v is string => Boolean(v));
