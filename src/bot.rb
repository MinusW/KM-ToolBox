require 'discordrb'
require_relative './commands_loader'
require_relative './events_loader'

class Bot
  def initialize
    @bot = Discordrb::Bot.new(token: ENV['DISCORD_BOT_TOKEN'], client_id: ENV['DISCORD_CLIENT_ID'])
  end

  def load_components
    CommandsLoader.new(@bot).register_commands
    EventsLoader.new(@bot).register_events
  end

  def run
    load_components
    @bot.run
  end
end
