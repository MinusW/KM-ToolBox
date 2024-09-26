require_relative '../messages/embed'

module Commands
  class Ping
    include Discordrb::Commands::CommandContainer

    def initialize
      command(:ping, description: 'Responds with a Pong embed!') do |event|
        embed = EmbedTemplate.build_embed('Ping Command', 'Pong! 🏓', '#00ff00')
        event.channel.send_embed('', embed)
      end
    end
  end
end