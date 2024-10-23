class Trait
  attr_accessor :name, :level, :buffs, :type

  def initialize(name, level, type)
    @name = name
    @level = level
    @type = type
    @buffs = []
  end

  def score(noble)
    @buffs.sum { |buff| buff.score(noble) }
  end
end
