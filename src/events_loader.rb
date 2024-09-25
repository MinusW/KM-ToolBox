require_relative './events/message_event'
require_relative './events/ready_event'
require_relative './events/interaction_event'

class EventsLoader
  def initialize(bot)
    @bot = bot
  end

  def register_events
    Event::Message.new(@bot).register
    Event::Ready.new(@bot).register
    Event::Interaction.new(@bot).register
  end
end
