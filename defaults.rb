require 'csv'
require_relative 'building_level'
require_relative 'building'
require_relative 'buff'
require_relative 'trait'
require 'singleton'

class Defaults
  include Singleton

  def initialize
    initialize_defaults
  end

  def initialize_defaults
    @multipliers = set_multipliers('data/buffMultiplier.csv')
    @traits = set_traits('data/traits.csv')
    @stages = set_stages('data/stages.csv')
    @traits_on_tier = set_traits_on_tier('data/traitsOnTier.csv')
    @buildings = set_buildings('data/buildings/')
    @noble_types = set_noble_types
    @emojis = set_emojis
    @refresh_logs = Refresh.new
    @noble_interactions = NobleInteractions.new
    @levels_per_stage = 40
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
      trait = Trait.new(row['trait'], row['level'].to_i, row['type'])
      if row.headers && row.headers.size >= 5
        row.headers[3..-1].each do |buff_name|
          next unless row[buff_name]

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
      stages[row['role']] = row['stages'].to_i
    end
    stages
  end

  def set_traits_on_tier(csv_file)
    traits_on_tier = {}

    CSV.foreach(csv_file, headers: true, col_sep: ';') do |row|
      traits_on_tier[row['tier']] = row['traitcount'].to_i
    end
    traits_on_tier
  end

  def set_building(csv_file)
    levels = []
    building_name = File.basename(csv_file, '.csv')

    CSV.foreach(csv_file, headers: true, col_sep: ';').with_index(1) do |row, index|
      levels << BuildingLevel.new(row['keepLevel'].to_i, row['common'].to_i, row['uncommon'].to_i, row['metalType'], row['stone'].to_i, row['count'])
    end

    Building.new(building_name, levels)
  end

  def set_buildings(directory)
    buildings = {}
    Dir.foreach(directory) do |file|
      next if file == '.' or file == '..' or File.extname(file) != '.csv'

      buildings[File.basename(file, '.csv')] = set_building(directory + file)
    end
    buildings
  end

  def set_noble_types
    {
      'captain' => 'combat',
      'knight' => 'combat',
      'subjugator' => 'combat',
      'explorer' => 'exploration',
      'merchant' => 'trading',
      'collier' => 'mining'
    }
  end

  def set_emojis
    emojis = {}
    CSV.foreach('data/emojis.csv', headers: true, col_sep: ';') do |row|
      emojis[row['name']] = row['id']
    end
    emojis
  end

  attr_reader :multipliers, :traits, :stages, :traits_on_tier, :levels_per_stage, :buildings, :noble_types, :interactions, :emojis, :refresh_logs, :noble_interactions
end
