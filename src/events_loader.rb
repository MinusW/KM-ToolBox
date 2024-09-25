require_relative './events/message_event'
require_relative './events/ready_event'
require_relative './events/interaction_event'

class EventsLoader
  def initialize(bot)
    @bot = bot
  end

  def register_events
    MessageEvent.new(@bot).register
    ReadyEvent.new(@bot).register
    InteractionEvent.new(@bot).register # Register the interaction events
  end
end
