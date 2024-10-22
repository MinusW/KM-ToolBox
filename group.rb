class Group
    attr_accessor :name, :channel, members
    def initialize(name, channel)
        @name = name
        @channel = channel
        @members = []
    end

    def add_member(member)
        return if @members.include?(member)
        @channel.add_group_users(member.id)
    end

    def remove_member(member)
        return if !@members.include?(member)
        @channel.remove_group_users(member.id)
    end

    def delete(member)
        return if !@members.include?(member)
        @channel.delete
    end
end