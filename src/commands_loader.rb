require_relative './commands/ping'
require_relative './commands/info'
require_relative './commands/form'

class CommandsLoader
  def initialize(bot)
    @bot = bot
  end

  def register_commands
    Commands::Message.new(@bot)
    Commands::Info.new(@bot)
    Commands::Message.new(@bot)
  end
end
