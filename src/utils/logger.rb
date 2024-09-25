require 'logger'

class LoggerUtility
  def initialize
    @logger = Logger.new('bot.log', 'daily')
  end

  def log_info(message)
    @logger.info(message)
  end

  def log_error(message)
    @logger.error(message)
  end
end
