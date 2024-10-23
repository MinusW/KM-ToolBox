require 'csv'

class Noble
  attr_accessor :role, :level, :tier, :type, :traits

  def initialize(role, level = 1, tier = 'legendary')
    @role = role
    @level = level
    @tier = tier
    @type = Defaults.instance.noble_types[@role]
    @traits = []
  end

  def score
    return 0 if @traits.empty?

    @traits.sum { |trait| trait.score(self) }
  end

  def add_trait(trait_name, level)
    trait_to_add = Defaults.instance.traits.find { |trait| trait.name == trait_name && trait.level == level }

    @traits << trait_to_add if trait_to_add
  end

  def potential_traits
    (Defaults.instance.traits - @traits).sort_by do |trait|
      [-trait.score(self), trait.name]
    end.first(max_innate_count - innates_trait_count)
  end

  def potential_score
    potential = potential_traits
    @traits += potential
    total_score = score
    @traits -= potential
    total_score
  end

  def innates_trait_count
    total = 0
    total = Defaults.instance.traits_on_tier[@tier]
    total += ((@level - 1) / Defaults.instance.levels_per_stage).ceil - 1
    total
  end

  def max_innate_count
    return unless @tier == 'legendary'

    Defaults.instance.stages[@role] - 1 + Defaults.instance.traits_on_tier[@tier] + Defaults.instance.traits_on_tier['mythical'] - Defaults.instance.traits_on_tier[@tier]
  end

  def delete_traits_with_name(trait_name)
    @traits.delete_if { |trait| trait.name == trait_name }
  end

  def total_buffs_as_trait
    buff_names = @traits.flat_map do |trait|
      trait.buffs.map(&:name)
    end.filter { |buff_name| Defaults.instance.multipliers[@role][buff_name] != 0 }.uniq
    total_trait = Trait.new('Total Buffs', 1, '@type')
    buff_names.each do |buff_name|
      sum = 0
      @traits.each do |trait|
        sum += trait.buffs.filter { |buff| buff.name == buff_name }.sum(&:value)
      end
      total_trait.buffs << Buff.new(buff_name, sum)
    end
    total_trait
  end
end
