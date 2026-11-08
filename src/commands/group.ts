import {
	ChannelType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type Guild,
	type SlashCommandStringOption,
	type TextChannel,
} from "discord.js";
import { envIds, InclusivePermissions } from "@/permissions";

const EPHEMERAL = MessageFlags.Ephemeral;

// /group create works only in the global channel, the rest only inside the group category
const createPerms = new InclusivePermissions(envIds("GLOBAL_CHANNEL_ID"));
const groupPerms = new InclusivePermissions(envIds("GROUP_CATEGORY_ID"));

const confirmationOption = (o: SlashCommandStringOption) =>
	o.setName("confirmation").setDescription("The group's name, to confirm").setRequired(true);

export const data = new SlashCommandBuilder()
.setName("group")
.setDescription("Group actions")
.addSubcommand((s) =>
	s
	.setName("create")
	.setDescription("Creates a group with the specified name")
	.addStringOption((o) =>
		o
		.setName("name")
		.setDescription("What do you want to call your group")
		.setRequired(true)
		.setMaxLength(100),
	),
)
.addSubcommand((s) =>
	s
	.setName("add")
	.setDescription("Adds a member to this group")
	.addUserOption((o) =>
		o.setName("member").setDescription("Who do you want to add?").setRequired(true),
	),
)
.addSubcommand((s) =>
	s
	.setName("kick")
	.setDescription("Kicks a member from this group")
	.addUserOption((o) =>
		o.setName("member").setDescription("Who do you want to kick?").setRequired(true),
	),
)
.addSubcommand((s) =>
	s.setName("delete").setDescription("Deletes this group").addStringOption(confirmationOption),
)
.addSubcommand((s) =>
	s.setName("leave").setDescription("Leave this group").addStringOption(confirmationOption),
);

// Discord lowercases text channel names and swaps spaces for hyphens
const normalize = (name: string) => name.trim().toLowerCase().replace(/\s+/g, "-");

// The current channel, but only if it's a text channel inside the group category
function groupChannel(interaction: ChatInputCommandInteraction): TextChannel | null {
	const channel = interaction.channel;
	if (!channel || channel.type !== ChannelType.GuildText) return null;
	return channel.parentId === process.env.GROUP_CATEGORY_ID ? channel : null;
}

export async function execute(interaction: ChatInputCommandInteraction) {
	const sub = interaction.options.getSubcommand();
	const perms = sub === "create" ? createPerms : groupPerms;
	const guild = interaction.guild;

	if (!guild || !perms.checkChannel(interaction)) {
		await interaction.reply({
			content: "Can't use this command in this channel.",
			flags: EPHEMERAL,
		});
		return;
	}

	if (sub === "create") {
		await create(interaction, guild);
		return;
	}

	const channel = groupChannel(interaction);
	if (!channel) {
		await interaction.reply({ content: "This isn't a group channel.", flags: EPHEMERAL });
		return;
	}

	switch (sub) {
		case "add":
			await add(interaction, channel);
			break;
		case "kick":
			await kick(interaction, channel);
			break;
		case "delete":
			await remove(interaction, channel);
			break;
		case "leave":
			await leave(interaction, channel);
			break;
	}
}

async function create(interaction: ChatInputCommandInteraction, guild: Guild) {
	const name = normalize(interaction.options.getString("name", true));
	if (!name) {
		await interaction.reply({ content: "Please give the group a name.", flags: EPHEMERAL });
		return;
	}

	const taken = guild.channels.cache.some(
		(c) => c.type === ChannelType.GuildText && c.name === name,
	);
	if (taken) {
		await interaction.reply({ content: "A channel with that name already exists.", flags: EPHEMERAL });
		return;
	}

	const channel = await guild.channels.create({
		name,
		type: ChannelType.GuildText,
		parent: process.env.GROUP_CATEGORY_ID,
		permissionOverwrites: [
			{ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
			{ id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] },
		],
	});
	await interaction.reply(`Created ${channel}`);
}

async function add(interaction: ChatInputCommandInteraction, channel: TextChannel) {
	const user = interaction.options.getUser("member", true);
	await channel.permissionOverwrites.edit(user, { ViewChannel: true });
	await interaction.reply(`Added ${user} to ${channel}`);
}

async function kick(interaction: ChatInputCommandInteraction, channel: TextChannel) {
	const user = interaction.options.getUser("member", true);
	if (!channel.permissionOverwrites.cache.has(user.id)) {
		await interaction.reply({ content: `${user} isn't in this group.`, flags: EPHEMERAL });
		return;
	}
	await channel.permissionOverwrites.delete(user);
	await interaction.reply(`Removed ${user} from ${channel}`);
}

async function remove(interaction: ChatInputCommandInteraction, channel: TextChannel) {
	if (interaction.options.getString("confirmation", true) !== channel.name) {
		await interaction.reply({ content: "Confirmation failed.", flags: EPHEMERAL });
		return;
	}
	// Reply first: once the channel is gone there's nowhere to respond
	await interaction.reply({ content: "Deleting this group...", flags: EPHEMERAL });
	await channel.delete();
}

async function leave(interaction: ChatInputCommandInteraction, channel: TextChannel) {
	if (interaction.options.getString("confirmation", true) !== channel.name) {
		await interaction.reply({ content: "Confirmation failed.", flags: EPHEMERAL });
		return;
	}
	if (!channel.permissionOverwrites.cache.has(interaction.user.id)) {
		await interaction.reply({ content: "You're not a member of this group.", flags: EPHEMERAL });
		return;
	}
	// Reply first: after the overwrite is removed the user can no longer see the channel
	await interaction.reply({ content: `You left ${channel.name}.`, flags: EPHEMERAL });
	await channel.permissionOverwrites.delete(interaction.user);
}
