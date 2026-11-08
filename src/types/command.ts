import type {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	StringSelectMenuInteraction,
} from "discord.js";

export interface Command {
	data: { name: string; toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };
	execute(interaction: ChatInputCommandInteraction): Promise<void>;
	autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
	button?(interaction: ButtonInteraction): Promise<void>;
	select?(interaction: StringSelectMenuInteraction): Promise<void>;
}
