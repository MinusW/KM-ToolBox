# frozen_string_literal: true

require 'discordrb'
require 'dotenv/load'

bot = Discordrb::Bot.new(token: ENV['DISCORD_TOKEN'])

bot.get_application_commands.each do |command|
  bot.delete_application_command(command.id, server_id: command.server_id)
end

bot.register_application_command(:group, 'group actions') do |cmd|
  cmd.subcommand('create', 'Creates a group with specified name') do |option|
    option.string('name', 'What do you want to call your group', required: true)
  end
  cmd.subcommand('add', 'Adds a member to this group') do |option|
    option.user('member', 'Who do you want to add to this group?', required: true)
  end
  cmd.subcommand('kick', 'kicks a member from this group') do |option|
    option.user('member', 'Who do you want to add to this group?', required: true)
  end
  cmd.subcommand('delete', 'Deletes a group') do |option|
    option.string('confirmation', 'Group\'s name to confirm the deletion of the group', required: true)
  end
  cmd.subcommand('leave', 'Leave from this group') do |option|
    option.string('confirmation', 'Group\'s name to confirm the deletion of the group', required: true)
  end
end
sleep(1)
bot.register_application_command(:noble, 'Manage noble actions') do |cmd|
  cmd.subcommand('talent', 'Evaluate noble talent and potential') do |option|
    option.string('role', 'Specify the noble\'s role', choices: { captain: 'Captain', knight: 'Knight', subjugator: 'Subjugator', explorer: 'Explorer', merchant: 'Merchant', collier: 'Collier'}, required: true)
    option.integer('level', 'Specify the level (defaults to 1 if not provided)', required: false)
  end

  cmd.subcommand('cost', 'Calculate cost to upgrade noble') do |option|
    option.string('role', 'Specify the noble\'s role', choices: { captain: 'Captain', knight: 'Knight', subjugator: 'Subjugator', explorer: 'Explorer', merchant: 'Merchant', collier: 'Collier'}, required: true)
    option.integer('start_level', 'Specify the starting level (defaults to 1)', required: false)
    option.integer('end_level', 'Specify the ending level (defaults to 120/80)', required: false)
  end
end
sleep(1)
bot.register_application_command(:serverrefresh, 'Report the refinery refresh')
sleep(1)
bot.register_application_command(:clear, "delete last N lines") do |cmd|
  cmd.string('amount', 'How many messages do you want to clear? (defaults to all)', required: false)
end
sleep(1)
bot.register_application_command(:temple, "Calculate temple cost") do |option|
  option.integer('start_level', 'Specify the starting level (defaults to 0)', required: false)
  option.integer('end_level', 'Specify the starting level (defaults to 50)', required: false)
end
sleep(1)
bot.register_application_command(:trait, "Trait stats") do |option|
  option.string('trait', 'Specify the trait you want to check', required: true)
end
sleep(1)
bot.register_application_command(:buildcost, 'Calculate the cost to upgrade a building') do |cmd|
  cmd.string('building', 'Specify the building you want to upgrade', choices: {
    academy: "academy",
    archery: "archery",
    barracks: "barracks",
    blacksmith: "blacksmith",
    dragon_lair: "dragon lair",
    farm: "farm",
    hall_of_titans: "hall of titans",
    housing: "housing",
    keep: "keep",
    platform: "platform",
    sawmill: "sawmill",
    siege_factory: "siege factory",
    stables: "stables",
    stonemason: "stonemason",
    watchtower: "watchtower",
    all: "all"
  }, required: true)
  cmd.integer('start_level', 'Specify the starting level (defaults to 1)', required: false)
  cmd.integer('end_level', 'Specify the ending level (defaults to 40)', required: false)
end
sleep(1)
bot.register_application_command(:contribute, "Contribute to the bot's development")



bot.run