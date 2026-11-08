import {
	EmbedBuilder,
	MessageFlags,
	SlashCommandBuilder,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
} from "discord.js";
import { defaults } from "@/defaults";
import { capitalize, color } from "@/utils/format";

export const data = new SlashCommandBuilder()
.setName("trait")
.setDescription("Trait stats")
.addStringOption((o) =>
	o.setName("trait").setDescription("The trait you want to check").setRequired(true).setAutocomplete(true),
);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const typed = interaction.options.getFocused().toLowerCase();
	const names = [...new Set(defaults.traits.map((t) => t.name))];
	await interaction.respond(
		names
			.filter((n) => n.toLowerCase().includes(typed))
			.slice(0, 25)
			.map((n) => ({ name: n, value: n })),
	);
}

export async function execute(interaction: ChatInputCommandInteraction) {
	const name = interaction.options.getString("trait", true);
	const traits = defaults.traits.filter((t) => t.name.toLowerCase() === name.toLowerCase());

	if (traits.length === 0) {
		await interaction.reply({ content: `Trait ${name} not found`, flags: MessageFlags.Ephemeral });
		return;
	}

	const embed = new EmbedBuilder()
	.setTitle(capitalize(name))
	.setDescription("Trait breakdown:")
	.setColor(color.primary)
	.addFields(
		traits.map((t) => ({
			name: `${t.name} ${t.level}`,
			value: t.buffs.map((b) => `${b.name}: ${b.value}`).join(", ") || "No buffs",
		})),
	);

	await interaction.reply({ embeds: [embed] });
}
