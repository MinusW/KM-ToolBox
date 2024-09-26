require_relative '../messages/simple'

module Commands
  class Info
    include Discordrb::Commands::CommandContainer

    def initialize
      command(:info, description: 'Provides info about the bot') do |event|
        message = SimpleMessage.build_message('This bot is powered by discordrb and Ruby!')
        event.respond message
      end
    end
  end
end