require 'discordrb'

module Messages
  class Embed
    def self.build(title, description, color = '#3498db')
      Discordrb::Webhooks::Embed.new(
        title: title,
        description: description,
        color: color.to_i(16), # Convert hex color to integer
        footer: { text: "Powered by discordrb" },
        timestamp: Time.now
      )
    end
  end
end