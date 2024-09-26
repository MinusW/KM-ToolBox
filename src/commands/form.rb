require_relative '../utils/form_builder'

module Commands
  class Form
    include Discordrb::Commands::CommandContainer

    def initialize
      command(:form, description: 'Generates a dropdown form with multiple selections') do |event|
        form_builder = FormBuilder.new

        # Add two dropdowns (for example: fruits and colors)
        form_builder.add_dropdown(
          'fruit_select',
          'Select your favorite fruit',
          [
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' },
            { label: 'Orange', value: 'orange' }
          ]
        )

        form_builder.add_dropdown(
          'color_select',
          'Select your favorite color',
          [
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
            { label: 'Blue', value: 'blue' }
          ]
        )

        # Build the form (components)
        components = form_builder.build_form

        # Send the form as a message with the action row components
        event.channel.send_message(content: 'Please fill out this form:', components: components)
      end
    end
  end
end