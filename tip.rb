class Tip
  @@csv = 'data/tips.csv'
  attr_accessor :name, :userid, :description, :state, :id
  def initialize(name, description, userid, state = "submitted", id = latest_tip_id_plus_one)
    @id = id 
    @name = name
    @userid = userid
    @description = description
    @state = state
  end

  def log_csv
    CSV.open(@@csv, 'a', col_sep: ';', force_quotes: true) do |csv|
      csv << [@id, @userid, @name, @description, state]
    end
  end

  def latest_tip_id_plus_one
    latest_tip&.id.to_i + 1
  end

  def latest_tip
    last_line = File.readlines(@@csv).last
    return nil unless last_line 

    parsed_line = CSV.parse(last_line, col_sep: ';').first
    id, name, description, userid, state = parsed_line
    Tip.new(name, description, userid, id.to_i, state)
  end
end