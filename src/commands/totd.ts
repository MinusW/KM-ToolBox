import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { logTip } from "@/models/tip";

export const data = new SlashCommandBuilder()
.setName("totd")
.setDescription("Submit a tip of the day")
.addStringOption((o) =>
	o.setName("tip").setDescription("A short title for the tip").setRequired(true).setMaxLength(100),
)
.addStringOption((o) =>
	o.setName("description").setDescription("The tip itself").setRequired(true).setMaxLength(1000),
);

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	await logTip(
		interaction.options.getString("tip", true),
		interaction.options.getString("description", true),
		interaction.user.id,
	);
	await interaction.editReply("Tip submitted!");
}
