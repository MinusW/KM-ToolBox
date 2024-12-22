# Frozen_string_literal: true

require 'discordrb'
require 'csv'
require 'zeitwerk'
require 'dotenv/load'
require_relative 'permissions'


DISCORD_API_URL = 'https://discord.com/api/v10/interactions'

loader = Zeitwerk::Loader.new
loader.push_dir(__dir__)
loader.setup

bot = Discordrb::Bot.new(token: ENV['DISCORD_TOKEN'])

bot.application_command(:noble).subcommand(:talent) do |event|
  allowed_channels = [ENV['PRIVATE_CATEGORY_ID'].to_i, ENV['GROUP_CATEGORY_ID'].to_i]
  allowed_roles = []
  perms = InclusivePermissions.new(channel_ids: allowed_channels, role_ids: allowed_roles)
  unless perms.check_channel_permissions(event)
    event.respond(content: "can't use this command in this channel", ephemeral: true)
    next
  end

  event.defer(ephemeral: true)
  role = event.options['role'].downcase
  level = event.options['level'] || 1
  temporary_noble = Noble.new(role, level)
  response_message = "Evaluating talents for role: #{role}, Level: #{level}.\n\n"
  uniq_traits = Defaults.instance.traits.filter do |trait|
    trait.type == Defaults.instance.noble_types[role]
  end.uniq { |trait| trait.name }
  previous_message = nil
  uniq_traits.each_slice(5) do |uniq_trait_slice|
    view = Discordrb::Components::View.new do |builder|
      uniq_trait_slice.each do |uniq_trait|
        leveled_trait = Defaults.instance.traits.filter do |trait|
          trait.name == uniq_trait.name && trait.type == Defaults.instance.noble_types[role]
        end
        builder.row do |r|
          r.string_select(custom_id: uniq_trait.name, placeholder: uniq_trait.name.to_s, min_values: 0, max_values: leveled_trait.count) do |ss|
            leveled_trait.each do |trait|
              ss.option(label: "#{trait.name} #{trait.level}", value: "#{trait.name}/#{trait.level}", description: "Score: #{trait.score(temporary_noble)}", emoji: Defaults.instance.emojis["TRAITS_#{trait.name.upcase}_#{trait.level}".gsub(/[()-]/, '').gsub(' ', '_')].to_i)
            end
          end
        end
      end
    end
    if previous_message.nil?
      previous_message = event.edit_response(content: response_message, components: view)
    else
      event.send_message(content: response_message, components: view, ephemeral: true)
    end
  end

  id = event.send_message(content: '', ephemeral: true) do |_, view|
    view.row do |row|
      row.button(style: :primary, label: :Submit, emoji: 577_663_465_322_315_786, custom_id: "noble/talent/submit/#{event.user.id}/#{event.channel.id}")
      row.button(style: :danger, label: :Cancel, emoji: 577_663_465_322_315_786, custom_id: "noble/talent/cancel/#{event.user.id}/#{event.channel.id}")
    end
  end.id
  Defaults.instance.noble_interactions.remove(event.user.id, event.channel.id)
  Defaults.instance.noble_interactions.add(NobleInteraction.new(event.user, event.channel, level: level, role: role, submit_message: id))
end


bot.button(custom_id: %r{^noble/talent/submit/\d+/\d+$}) do |event|
  event.defer_update
  interaction = Defaults.instance.noble_interactions.get(event.user.id, event.channel.id)
  unless interaction
    event.call(content: 'Something went wrong, please try again', ephemeral: true)
    next
  end

  event.channel.send_embed do |embed|
    embed.title = "#{interaction.noble.role.capitalize} at level #{interaction.noble.level}"
    embed.description = 'Noble breakdown:'
    embed.color = 0x00ff00
    buffs_message = []
    interaction.noble.total_buffs_as_trait.buffs.each do |buff|
      buffs_message << "#{buff.name}: #{buff.value} / #{buff.score(interaction.noble).to_s.gsub('.0', '')}" if buff.value != 0
    end
    traits_message = []
    first = 0
    interaction.noble.traits.each do |trait|
      id = Defaults.instance.emojis["TRAITS_#{trait.name.upcase}_#{trait.level}".gsub(/[()-]/, '').gsub(' ', '_')].to_s
      name = "TRAITS_#{trait.name.upcase}_#{trait.level}".gsub(/[()-]/, '').gsub(' ', '_')
      emoji = "<:#{name}:#{id}>"
      traits_message << emoji
      if traits_message.count == 20
        if first == 1
          embed.add_field(name: '', value: traits_message.join(''), inline: false)
        else
          embed.add_field(name: 'Traits', value: traits_message.join(''), inline: false)
        end

        first = 1
        traits_message.clear
      end
    end
    embed.add_field(name: '', value: traits_message.join(''), inline: false) unless traits_message.empty?
    embed.add_field(name: 'buffs', value: buffs_message.join(', '), inline: false)
    embed.add_field(name: 'Total Score:', value: interaction.noble.score.to_s, inline: true)
    embed.add_field(name: 'Potential Traits:', value: interaction.noble.potential_traits.map do |trait|
      "#{trait.name} #{trait.level}"
    end.join(', '), inline: true)
    embed.add_field(name: 'Potential Score:', value: interaction.noble.potential_score.to_s, inline: true)
  end
end

bot.button(custom_id: /^noble\/talent\/cancel\/\d+\/\d+$/) do |event|
  event.defer(ephemeral: true)

  Defaults.instance.noble_interactions.remove(event.user.id, event.channel.id)
  event.send_message(content: "Choices cancelled!")
end

bot.select_menu do |event|
  interaction = Defaults.instance.noble_interactions.get(event.user.id, event.channel.id)
  unless interaction
    event.respond(content: 'Something went wrong, please try again', ephemeral: true)
    next
  end
  trait_name = event.custom_id
  trait_levels = event.values.map { |value| value.split('/')[1].to_i }
  interaction.trait_choice(trait_name, trait_levels)
  event.defer_update
end

bot.application_command(:group).subcommand(:create) do |event|
  allowed_channels = [ENV['PRIVATE_CATEGORY_ID'].to_i]
  allowed_roles = []
  perms = InclusivePermissions.new(channel_ids: allowed_channels, role_ids: allowed_roles)
  unless perms.check_channel_permissions(event)
    event.respond(content: "can't use this command in this channel", ephemeral: true)
    next
  end

  name = event.options['name']
  event.defer
  if event.server.text_channels.find { |ch| ch.name == name }
    event.send_message(content: "exists")
    next
  end

  channel = event.server.create_channel(name, 0)

  user_perm = Discordrb::Overwrite.new(event.user, type: :member, allow: 1024, deny: 0)
  everyone_perm = Discordrb::Overwrite.new(event.server.everyone_role, type: :role, allow: 0, deny: 1024)
  channel.define_overwrite(user_perm)
  channel.define_overwrite(everyone_perm)
  channel.parent = ENV['GROUP_CATEGORY_ID'].to_i

  event.send_message(content: "created #{channel.mention}")
end

bot.application_command(:group).subcommand(:delete) do |event|
  allowed_channels = [ENV['GROUP_CATEGORY_ID'].to_i]
  allowed_roles = []
  perms = InclusivePermissions.new(channel_ids: allowed_channels, role_ids: allowed_roles)
  unless perms.check_channel_permissions(event)
    event.respond(content: "can't use this command in this channel", ephemeral: true)
    next
  end

  event.defer
  channel = event.server.text_channels.find { |ch| ch.name == event.channel.name && ch.parent == ENV['GROUP_CATEGORY_ID'].to_i}
  if channel.nil?
    event.send_message(content: "does not exist")
    next
  end
  if event.options['confirmation'] != event.channel.name
    event.send_message(content: "confirmation failed")
    next
  end
  channel.delete
end

bot.application_command(:group).subcommand(:add) do |event|
  allowed_channels = [ENV['GROUP_CATEGORY_ID'].to_i]
  allowed_roles = []
  perms = InclusivePermissions.new(channel_ids: allowed_channels, role_ids: allowed_roles)
  unless perms.check_channel_permissions(event)
    event.respond(content: "can't use this command in this channel", ephemeral: true)
    next
  end

  event.defer

  channel = event.channel
  if channel.nil?
    event.send_message(content: "does not exist")
    next
  end
  user = event.server.members.find { |member| member.id == event.options['member'].to_i}
  user_perm = Discordrb::Overwrite.new(user, type: :member, allow: 1024, deny: 0)
  channel.define_overwrite(user_perm)

  event.send_message(content: "added #{user.mention} to #{channel.mention}")
end

bot.application_command(:group).subcommand(:kick) do |event|
  allowed_channels = [ENV['GROUP_CATEGORY_ID'].to_i]
  allowed_roles = []
  perms = InclusivePermissions.new(channel_ids: allowed_channels, role_ids: allowed_roles)
  unless perms.check_channel_permissions(event)
    event.respond(content: "can't use this command in this channel", ephemeral: true)
    next
  end

  event.defer

  channel = event.server.text_channels.find { |ch| ch.name == event.channel.name && ch.parent == ENV['GROUP_CATEGORY_ID'].to_i}
  if channel.nil?
    event.send_message(content: "does not exist")
    next
  end

  user = event.server.members.find { |member| member.id == event.options['member'].to_i}
  channel.delete_overwrite(user)

  event.send_message(content: "removed #{user.mention} from #{channel.mention}", ephemeral: false)
end


bot.application_command(:temple) do |event|
  event.defer(ephemeral: false)
  start_level = (event.options['start_level'] || 0).to_i
  end_level = (event.options['end_level'] || 50).to_i
  cost = Temple.cost(start_level, end_level)
  event.edit_response do |builder|
    builder.add_embed do |embed|
      embed.title = 'Temple'
      embed.description = "Cost from level #{start_level} to level #{end_level} is:"
      embed.color = 0x00ff00
      embed.add_field(name: 'Bricks', value: cost[0].to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1\'').reverse, inline: false)
      embed.add_field(name: 'Blocks', value: cost[1].to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1\'').reverse, inline: false)
      embed.add_field(name: 'Slabs', value: cost[2].to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1\'').reverse, inline: false)
    end
  end
end

bot.application_command(:buildcost) do |event|
  event.defer(ephemeral: false)

  building_name = event.options['building'].downcase
  start_level = (event.options['start_level'] || 0).to_i
  end_level = (event.options['end_level'] || 40).to_i

  building = Defaults.instance.buildings[building_name]
  event.send_message(content: 'Building not found.') unless building || building_name == 'all'

  prices = building.get_prices_in_level_range(start_level.to_i, end_level.to_i) if building
  prices = Building.get_all_building_prices_together(start_level.to_i, end_level.to_i) if building_name == 'all'

  stone = 0
  rss = []
  prices.each do |material, details|
    if material == 'stone'
      stone = details['total'].to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1\'').reverse
    else
      details.each do |rarity, amount|
        rss << [material, rarity.capitalize, amount.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1\'').reverse]
      end
    end
  end

  event.edit_response do |builder|
    builder.add_embed do |embed|
      embed.title = building_name.capitalize
      embed.description = "Cost from level #{start_level} to level #{end_level} is:"
      embed.color = 0x00ff00
      embed.add_field(name: 'Stone', value: stone, inline: false)
      rss.each do |material, rarity, amount|
        embed.add_field(name: "#{rarity} #{material.capitalize}", value: amount, inline: false)
      end
    end
  end
  nil
end

bot.application_command(:serverrefresh) do |event|
  event.defer(ephemeral: true)
  Defaults.instance.refresh_logs.add_log(event.user.id, event.channel.id)
  if Defaults.instance.refresh_logs.refresh?
    Defaults.instance.refresh_logs.clear_logs
    channel = bot.channel(ENV['ANNOUNCEMENT_CHANNEL_ID'].to_i)
    bot.send_message(channel, 'Refinery has been refreshed!')
    event.send_message(content: 'Everyone has been notified.')
  else
    event.send_message(content: "There have been #{Defaults.instance.refresh_logs.in_timeset.count} reports of refresh. Need #{Defaults.instance.refresh_logs.user_limit} people to report to refresh.")
  end
end

bot.application_command(:clear) do |event|
  allowed_channels = [ENV['PRIVATE_CATEGORY_ID'].to_i, ENV['GROUP_CATEGORY_ID'].to_i]
  allowed_roles = []
  perms = InclusivePermissions.new(channel_ids: allowed_channels, role_ids: allowed_roles)
  unless perms.check_channel_permissions(event)
    event.respond(content: "can't use this command in this channel", ephemeral: true)
    next
  end

  event.defer(ephemeral: true)
  amount = event.options['amount'].to_i
  amount = 100 if amount > 100
  amount = 1 if amount <= 0
  messages = event.channel.history(amount)
  event.channel.delete_messages(messages)
  event.send_message(content: "Deleted #{amount} messages", ephemeral: true)
end


bot.application_command(:totd) do |event|
  event.defer(ephemeral: true)
  name = event.options['tip']
  description = event.options['description']
  tip = Tip.new(name, description, event.user.id)
  tip.log_csv
  event.send_message(content:"Tip submitted!")
end

bot.application_command(:contribute) do |event|
  event.respond(content: "Contribute to the bot's development at #{ENV['REPOSITORY_URL']}", ephemeral: false)
end

bot.application_command(:trait) do |event|
  event.defer(ephemeral: false)
  name = event.options['trait']
  traits = Defaults.instance.traits.filter { |trait| trait.name.downcase == name.downcase }
  if traits.empty?
    event.send_message(content: "Trait #{name} not found", ephemeral: true)
    next
  end
  event.edit_response do |builder|
    builder.add_embed do |embed|
      embed.title = "#{name.capitalize}"
      embed.description = 'Trait breakdown:'
      embed.color = 0x00ff00
      traits.each do |trait|
        buffs = []
        trait.buffs.each do |buff|
          buffs << "#{buff.name}: #{buff.value}"
        end
        embed.add_field(name: "#{trait.name} #{trait.level}", value: buffs.join(' , '), inline: false)
      end
    end
  end
end


def find_missing_emojis
  Defaults.instance.traits.each do |trait|
    name = "TRAITS_#{trait.name.upcase}_#{trait.level}"
    emoji = Defaults.instance.emojis[name.gsub(/[()-]/, '').gsub(' ', '_')]
    puts "#{trait.name} #{trait.level} TRAITS_#{trait.name.upcase}_#{trait.level}" if emoji.nil?
  end
end

find_missing_emojis

bot.run
