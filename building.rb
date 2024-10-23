class Building
  attr_accessor :name, :levels

  def initialize(name, levels)
    @name = name
    @levels = levels
  end

  def get_prices_in_level_range(start_level, end_level)
    totals = Hash.new { |hash, key| hash[key] = { "common" => 0, "uncommon" => 0 } }
    totals["stone"] = { "total" => 0 }

    (start_level+1..end_level).each do |level|
      next unless levels[level]
      metal_type = levels[level].metal_type
      if levels[level].count.to_i > 1
        count = levels[level].count.to_i if levels[level]
      else
        count = 1
      end
      if metal_type
        totals[metal_type]["common"] += levels[level].common.to_i*count
        totals[metal_type]["uncommon"] += levels[level].uncommon.to_i*count

      end
      totals["stone"]["total"] += levels[level].stone.to_i*count
    end
    totals
  end

  def self.get_buildings_prices_in_level_range(buildings, start_level, end_level)
    totals = Hash.new { |hash, key| hash[key] = { "common" => 0, "uncommon" => 0 } }
    totals["stone"] = { "total" => 0 }
    buildings.each do |building_name|
      building = Defaults.instance.buildings[building_name]
      if building
        building_prices = building.get_prices_in_level_range(start_level, end_level)
        building_prices.each do |key, value|
          if totals[key]
            value.each do |sub_key, sub_value|
              totals[key][sub_key] += sub_value
            end
          else
            totals[key] = value.dup 
          end
        end
      end
    end
    totals
  end
end
