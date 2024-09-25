require_relative './bot'

bot_instance = Bot.new

bot_instance.load_components

bot_instance.run
