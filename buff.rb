class Buff
  attr_accessor :name, :value

  def initialize(name, value, multiplier = 1)
    @name = name
    @value = value
  end

  def score(noble)
    @value * Defaults.instance.multipliers[noble.role][@name]
  end
end
