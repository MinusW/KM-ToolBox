module Middleware
  class PermissionChecker
    def initialize(bot)
      @bot = bot
    end
  
    def register
      @bot.command(:admin_command, help_available: false) do |event|
        break unless event.user.role?('Admin')
        event.respond 'You are authorized!'
      end
    end
  end
end