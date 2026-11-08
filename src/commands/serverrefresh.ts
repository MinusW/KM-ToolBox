import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { refreshLogs } from "@/models/refresh";

export const data = new SlashCommandBuilder()
.setName("serverrefresh")
.setDescription("Report the refinery refresh");

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	refreshLogs.addLog(interaction.user.id, interaction.channelId);

	if (refreshLogs.shouldRefresh()) {
		refreshLogs.clearLogs();
		const channel = await interaction.client.channels.fetch(process.env.ANNOUNCEMENT_CHANNEL_ID!);
		if (channel?.isSendable()) await channel.send("Refinery has been refreshed!");
		await interaction.editReply("Everyone has been notified.");
	} else {
		await interaction.editReply(
			`There have been ${refreshLogs.inTimeset().length} reports of refresh. Need ${refreshLogs.userLimit} people to report to refresh.`,
		);
	}
}
