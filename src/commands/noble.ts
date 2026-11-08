import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageFlags,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	type ButtonInteraction,
	type ChatInputCommandInteraction,
	type StringSelectMenuInteraction,
} from "discord.js";
import { defaults } from "@/defaults";
import { Noble } from "@/models/noble";
import { NobleInteraction, nobleInteractions } from "@/models/nobleInteractions";
import { envIds, InclusivePermissions } from "@/permissions";
import { capitalize, color, trimNumber } from "@/utils/format";

const BUTTON_EMOJI_ID = "577663465322315786";
const SELECT_PREFIX = "noble/select/";
const ZWSP = "\u200b"; // Discord rejects empty field names

export const data = new SlashCommandBuilder()
.setName("noble")
.setDescription("Manage noble actions")
.addSubcommand((sub) =>
	sub
	.setName("talent")
	.setDescription("Evaluate noble talent and potential")
	.addStringOption((o) =>
		o
		.setName("role")
		.setDescription("The noble's role")
		.setRequired(true)
		.addChoices(...Object.keys(defaults.nobleTypes).map((r) => ({ name: capitalize(r), value: r }))),
	)
	.addIntegerOption((o) =>
		o.setName("level").setDescription("The level (defaults to 1)").setMinValue(1),
	),
);

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	const role = interaction.options.getString("role", true);
	const level = interaction.options.getInteger("level") ?? 1;

	const multipliers = new Noble(role, level).multipliers;
	const traitsOfType = defaults.traits.filter((t) => t.type === defaults.nobleTypes[role]);
	const names = [...new Set(traitsOfType.map((t) => t.name))];

	if (names.length === 0) {
		await interaction.editReply(`No traits found for ${role}.`);
		return;
	}

	// Register before sending anything, so an early click can't miss it
	nobleInteractions.add(new NobleInteraction(interaction.user.id, interaction.channelId, role, level));

	const rows = names.map((name) => {
		const leveled = traitsOfType.filter((t) => t.name === name);
		const menu = new StringSelectMenuBuilder()
		.setCustomId(SELECT_PREFIX + name)
		.setPlaceholder(name)
		.setMinValues(0)
		.setMaxValues(leveled.length)
		.addOptions(
			leveled.map((t) => {
				const option = new StringSelectMenuOptionBuilder()
				.setLabel(`${t.name} ${t.level}`)
				.setValue(String(t.level))
				.setDescription(`Score: ${trimNumber(t.score(multipliers))}`);
				const emojiId = defaults.emojis[t.emojiKey];
				if (emojiId) option.setEmoji({ id: emojiId });
				return option;
			}),
		);
		return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
	});

	// A message holds at most 5 rows, so send the menus in groups of 5
	for (let i = 0; i < rows.length; i += 5) {
		const components = rows.slice(i, i + 5);
		if (i === 0) {
			await interaction.editReply({
				content: `Evaluating talents for role: ${role}, Level: ${level}.`,
				components,
			});
		} else {
			await interaction.followUp({ components, flags: MessageFlags.Ephemeral });
		}
	}

	const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("noble/submit")
			.setLabel("Submit")
			.setStyle(ButtonStyle.Primary)
			.setEmoji({ id: BUTTON_EMOJI_ID }),
		new ButtonBuilder()
			.setCustomId("noble/cancel")
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Danger)
			.setEmoji({ id: BUTTON_EMOJI_ID }),
	);
	await interaction.followUp({
		content: "Pick your traits above, then submit.",
		components: [buttons],
		flags: MessageFlags.Ephemeral,
	});
}

export async function select(interaction: StringSelectMenuInteraction) {
	const state = nobleInteractions.get(interaction.user.id, interaction.channelId);
	if (!state) {
		await interaction.reply({
			content: "Something went wrong, please try again",
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const traitName = interaction.customId.slice(SELECT_PREFIX.length);
	state.traitChoice(traitName, interaction.values.map(Number));
	await interaction.deferUpdate();
}

export async function button(interaction: ButtonInteraction) {
	if (interaction.customId === "noble/submit") await submit(interaction);
		else if (interaction.customId === "noble/cancel") await cancel(interaction);
}

async function cancel(interaction: ButtonInteraction) {
	nobleInteractions.remove(interaction.user.id, interaction.channelId);
	await interaction.reply({ content: "Choices cancelled!", flags: MessageFlags.Ephemeral });
}

async function submit(interaction: ButtonInteraction) {
	await interaction.deferUpdate();
	const state = nobleInteractions.get(interaction.user.id, interaction.channelId);
	if (!state) {
		await interaction.followUp({
			content: "Something went wrong, please try again",
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	if (interaction.channel?.isSendable()) {
		await interaction.channel.send({ embeds: [buildEmbed(state.noble)] });
	}
}

function buildEmbed(noble: Noble): EmbedBuilder {
	const m = noble.multipliers;
	const buffs = noble
	.totalBuffsAsTrait()
	.buffs.filter((b) => b.value !== 0)
	.map((b) => `${b.name}: ${b.value} / ${trimNumber(b.score(m))}`);

	// Emoji if one exists, plain text otherwise
	const icons = noble.traits.map((t) => {
		const id = defaults.emojis[t.emojiKey];
		return id ? `<:${t.emojiKey}:${id}>` : `${t.name} ${t.level} `;
	});

	const potential = noble.potentialTraits();

	const embed = new EmbedBuilder()
	.setTitle(`${capitalize(noble.role)} at level ${noble.level}`)
	.setDescription("Noble breakdown:")
	.setColor(color.primary);

	for (let i = 0; i < icons.length; i += 20) {
		embed.addFields({ name: i === 0 ? "Traits" : ZWSP, value: icons.slice(i, i + 20).join("") });
	}

	embed.addFields(
		{ name: "Buffs", value: buffs.join(", ") || "None" },
		{ name: "Total Score:", value: trimNumber(noble.score), inline: true },
		{
			name: "Potential Traits:",
			value: potential.map((t) => `${t.name} ${t.level}`).join(", ") || "None",
			inline: true,
		},
		{ name: "Potential Score:", value: trimNumber(noble.potentialScore()), inline: true },
	);
	return embed;
}
