class Permissions
  attr_reader :channels, :roles

  def initialize(channel_ids: [], role_ids: [])
    @channel_ids = channel_ids
    @role_ids = role_ids
  end

  def owner_permissions(event)
    event.user.id == ENV['OWNER_ID'].to_i
  end
end

class InclusivePermissions < Permissions
  def check_channel_permissions(event)
    return true if owner_permissions(event)

    if @channel_ids.include?(event.channel.parent.id) || @channel_ids.include?(event.channel.id)
      true
    else
      false
    end
  end

  def check_role_permissions(event)
    return true if owner_permissions(event)

    @role_ids.any? { |role| event.user.id == role } || @role_ids.any? { |role| event.user.roles.include?(role) }
  end
end

class ExclusivePermissions < Permissions
  def check_channel_permissions(event)
    return true if owner_permissions(event)

    !@channel_ids.include?(event.channel.parent.id) && !@channel_ids.include?(event.channel.id)
  end

  def check_role_permissions(event)
    return true if owner_permissions(event)

    @role_ids.none? { |role| event.user.id == role } && @role_ids.none? { |role| event.user.roles.include?(role) }
  end
end
