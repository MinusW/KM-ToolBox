module Events
  class Ready
    def initialize(bot)
      @bot = bot
    end
  
    def register
      @bot.ready do
        puts 'Bot is ready!'
      end
    end
  end
end