import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { envIds, InclusivePermissions } from "@/permissions";

const perms = new InclusivePermissions(envIds("GLOBAL_CHANNEL_ID", "GROUP_CATEGORY_ID"));

export const data = new SlashCommandBuilder()
.setName("clear")
.setDescription("Delete the last N messages")
.addIntegerOption((o) =>
	o
	.setName("amount")
	.setDescription("How many messages to delete (default 1, max 100)")
	.setMinValue(1)
	.setMaxValue(100),
);

export async function execute(interaction: ChatInputCommandInteraction) {
	if (!perms.checkChannel(interaction)) {
		await interaction.reply({
			content: "Can't use this command in this channel.",
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const channel = interaction.channel;
	if (!channel || !("bulkDelete" in channel)) {
		await interaction.reply({
			content: "Can't clear messages in this channel.",
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	const amount = interaction.options.getInteger("amount") ?? 1;
	// true = skip messages older than 14 days, which Discord refuses to bulk delete
	const deleted = await channel.bulkDelete(amount, true);
	await interaction.editReply(`Deleted ${deleted.size} message${deleted.size === 1 ? "" : "s"}.`);
}
