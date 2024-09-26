require_relative './events/message'
require_relative './events/ready'
require_relative './events/interaction'

class EventsLoader
  def initialize(bot)
    @bot = bot
  end

  def register_events
    Events::Message.new(@bot).register
    Events::Ready.new(@bot).register
    Events::Interaction.new(@bot).register
  end
end
