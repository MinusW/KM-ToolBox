class Refresh
  @@timeset = 3600
  @@user_limit = 5
  class RefreshLog
    attr_reader :user, :channel, :timestamp

    def initialize(user, channel)
      @user = user
      @channel = channel
      @timestamp = Time.now
    end
  end

  def initialize
    @logs = []
  end

  def add_log(user, channel)
    existing_log = @logs.last(5).find { |log| log.user == user }
    @logs.delete(existing_log) if existing_log
    @logs << RefreshLog.new(user, channel)
  end

  def clear_logs
    @logs.clear
  end

  def refresh?
    return false if @logs.size < @@user_limit

    @logs.last(@@user_limit).all? { |log| log.timestamp > Time.now - @@timeset }
  end

  def in_timeset
    @logs.filter { |log| log.timestamp > Time.now - @@timeset }
  end

  def count
    in_timeset.size
  end
  attr_accessor :logs, :user_limit, :timeset
end
