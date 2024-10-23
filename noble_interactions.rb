class NobleInteractions
  attr_reader :interactions

  def initialize
    @interactions = []
  end

  def add(interaction)
    @interactions << interaction
  end

  def remove(user_id, channel_id)
    interaction = @interactions.find do |interaction|
      interaction.user.id == user_id.to_i && interaction.channel.id == channel_id.to_i
    end
    @interactions.delete(interaction)
  end

  def get(user_id, channel_id)
    @interactions.find do |interaction|
      interaction.user.id == user_id.to_i && interaction.channel.id == channel_id.to_i
    end
  end
end

class NobleInteraction
  def initialize(user, channel, level: 1, role: 'captain', tier: 'legendary', submit_message: nil)
    @user = user
    @channel = channel
    @noble = Noble.new(role, level, tier)
    @submit_message = submit_message
    schedule_destruction
  end

  def trait_choice(trait_name, trait_levels)
    @noble.delete_traits_with_name(trait_name)
    trait_levels.each do |level|
      @noble.add_trait(trait_name, level)
    end
  end

  def schedule_destruction
    Thread.new do
      sleep(900)
      submit
    end
  end

  def submit
    Defaults.instance.noble_interactions.remove(@user.id, @channel.id)
  end

  attr_accessor :submit_message, :user, :channel, :choices, :noble
end
