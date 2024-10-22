bot.application_command(:hug) do |event|
  event.defer(ephemeral: true)
  event.edit_response(content: "We're going to send a followup message!")
  event.send_message(content: "This is a followup message to a deferred interaction.", ephemeral: true) do |_, view|
    view.row do |row|
      row.select_menu(custom_id: 'string_select', placeholder: 'Test of StringSelect', max_values: 3) do |option|
        option.option(label: 'Value 1', value: '1', description: 'First value', emoji: { name: '1️⃣' })
        option.option(label: 'Value 2', value: '2', description: 'Second value', emoji: { name:'2️⃣' })
        option.option(label: 'Value 3', value: '3', description: 'Third value', emoji: { name: '3️⃣' })
      end
    end
  end   
end