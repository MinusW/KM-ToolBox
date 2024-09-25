require_relative './commands/ping_command'
require_relative './commands/info_command'
require_relative './commands/form_command'

class CommandsLoader
  def initialize(bot)
    @bot = bot
  end

  def register_commands
    Command::Message.new(@bot)
    Command::Info.new(@bot)
    Command::Message.new(@bot)
  end
end
