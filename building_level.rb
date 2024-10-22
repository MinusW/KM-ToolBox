class BuildingLevel
  attr_accessor :keep_level, :common, :uncommon, :metal_type, :stone, :count

  def initialize(keep_level, common, uncommon, metal_type, stone, count = 1)
    @keep_level = keep_level
    @common = common
    @uncommon = uncommon
    @metal_type = metal_type
    @stone = stone
    @count = count
  end
end