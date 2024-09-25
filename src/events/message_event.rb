module Event  
  class Message
    def initialize(bot)
      @bot = bot
    end
  
    def register
      @bot.message(with_text: 'Hello') do |event|
        event.respond 'Hi there!'
      end
    end
  end
end