module Event
  class Interaction
    def initialize(bot)
      @bot = bot
    end
  
    def register
      # Handle dropdown (select menu) selections
      @bot.component(custom_id: 'fruit_select') do |event|
        selected_fruit = event.values.first
        event.respond("You selected the fruit: #{selected_fruit}")
      end
  
      @bot.component(custom_id: 'color_select') do |event|
        selected_color = event.values.first
        event.respond("You selected the color: #{selected_color}")
      end
  
      # Handle form submission (button click)
      @bot.component(custom_id: 'form_submit') do |event|
        event.respond("Form submitted successfully!")
      end
    end
  end
end