class Building
  attr_accessor :name, :levels

  def initialize(name, levels)
    @name = name
    @levels = levels
  end

  def get_prices_in_level_range(start_level, end_level)
    totals = Hash.new { |hash, key| hash[key] = { 'common' => 0, 'uncommon' => 0 } }
    totals['stone'] = { 'total' => 0 }

    (start_level + 1..end_level - 1).each do |keep_level|
      @levels.filter { |level| level.keep_level == keep_level }.each do |level|
        metal_type = level.metal_type
        if metal_type
          totals[metal_type]['common'] += level.common.to_i * level.count
          totals[metal_type]['uncommon'] += level.uncommon.to_i * level.count
        end
        totals['stone']['total'] += level.stone.to_i * level.count
      end
    end
    totals
  end

  def self.get_all_building_prices_together(start_level, end_level)
    totals = Hash.new { |hash, key| hash[key] = { 'common' => 0, 'uncommon' => 0 } }
    totals['stone'] = { 'total' => 0 }

    building_names = Defaults.instance.buildings.keys
    building_names.each do |building_name|
      building = Defaults.instance.buildings[building_name]
      building.get_prices_in_level_range(start_level, end_level).each do |key, value|
        totals[key]['common'] += value['common'] if value['common']
        totals[key]['uncommon'] += value['uncommon'] if value['uncommon']
        totals['stone']['total'] += value['total'] if value['total']
      end
    end
    totals
  end
end
