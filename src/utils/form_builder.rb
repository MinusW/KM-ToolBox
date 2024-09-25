require 'discordrb/webhooks'

class FormBuilder
  attr_accessor :select_menus

  def initialize
    @select_menus = []
  end

  # Method to add a dropdown (select menu)
  def add_dropdown(custom_id, placeholder, options)
    menu = Discordrb::Webhooks::Components::SelectMenu.new(
      custom_id: custom_id,
      placeholder: placeholder,
      options: options.map { |option| Discordrb::Webhooks::Components::SelectOption.new(label: option[:label], value: option[:value]) }
    )
    @select_menus << menu
  end

  # Method to build the form (returns an array of components)
  def build_form
    components = @select_menus.dup # Duplicate to avoid mutation

    # Add a submit button if more than one dropdown is present
    if @select_menus.size > 1
      submit_button = Discordrb::Webhooks::Components::Button.new(style: :primary, label: 'Submit', custom_id: 'form_submit')
      components << submit_button
    end

    # Return the action row with the dropdowns and button
    [Discordrb::Webhooks::Components::ActionRow.new(components)]
  end
end
