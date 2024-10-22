require 'csv'
require_relative 'building_level'
require_relative 'building'
require_relative 'buff'
require_relative 'trait'
require 'singleton'

class Defaults
  include Singleton

  def initialize
    @multipliers = {}
    @traits = []
    @stages = {}
    @traits_on_tier = {}
    @levels_per_stage = 40
    @buildings = {}
    @noble_types = {}
    @interactions = {}
    @emojis = {}

    initialize_defaults
  end

  def initialize_defaults
    @multipliers = set_multipliers('data/buffMultiplier.csv')
    @traits = set_traits('data/traits.csv')
    @stages = set_stages('data/stages.csv')
    @traits_on_tier = set_traits_on_tier('data/traitsOnTier.csv')
    @buildings = set_buildings('data/buildings/')
    @noble_types = set_noble_types()
    @emojis = set_emojis()
    @refresh_logs = Refresh.new
    @noble_interactions = NobleInteractions.new
  end

  def set_multipliers(csv_file)
    buff_multipliers = {}

    CSV.foreach(csv_file, headers: true, col_sep: ';') do |row|
      role = row['role']
      buff_multipliers[role] ||= {}
      row.headers[1..-1].each do |buff_name|
        buff_multipliers[role][buff_name] = row[buff_name].to_f
      end
    end
    buff_multipliers
  end

  def set_traits(csv_file)
    traits = []
  
    CSV.foreach(csv_file, headers: true, col_sep: ';') do |row|
      trait = Trait.new(row["trait"], row["level"].to_i, row["type"])
      if row.headers && row.headers.size >= 5
        row.headers[4..-1].each do |buff_name|
          next if row[buff_name] == '0'
          trait.buffs << Buff.new(buff_name, row[buff_name].to_i)
        end
      end
      traits << trait
    end
    
    traits
  end

  def set_stages(csv_file)
    stages = {}

    CSV.foreach(csv_file, headers: true, col_sep: ';') do |row|
      stages[row["role"]] = row["stages"].to_i
    end
    stages
  end

  def set_traits_on_tier(csv_file)
    traits_on_tier = {}

    CSV.foreach(csv_file, headers: true, col_sep: ';') do |row|
      traits_on_tier[row["tier"]] = row["traitcount"].to_i
    end
    traits_on_tier
  end

  def set_building(csv_file)
    levels = {}
    building_name = File.basename(csv_file, ".csv")

    CSV.foreach(csv_file, headers: true, col_sep: ';').with_index(1) do |row, index|
      levels[index] = BuildingLevel.new(row["keepLevel"], row["common"], row["uncommon"], row["metalType"], row["stone"], row["count"])
    end

    Building.new(building_name, levels)
  end

  def set_buildings(directory)
    buildings = {}
    Dir.foreach(directory) do |file|
      next if file == '.' or file == '..' or File.extname(file) != '.csv'
      buildings[File.basename(file, ".csv")] = set_building(directory + file)
    end
    buildings
  end

  def set_noble_types
    return {
      "captain" => 'combat',
      "knight" => 'combat',
      "subjugator" => 'combat',
      "explorer" => 'exploration',
      "merchant" => 'trading',
      "collier" => 'mining'
    }
  end

  def set_emojis
    return {
      "1" => "1️⃣",
      "2" => "2️⃣",
      "3" => "3️⃣",
      "4" => "4️⃣",
    }
  end

  attr_reader :multipliers, :traits, :stages, :traits_on_tier, :levels_per_stage, :buildings, :noble_types, :interactions, :emojis, :refresh_logs, :noble_interactions
end