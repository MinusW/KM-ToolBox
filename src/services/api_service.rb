require 'net/http'
require 'json'

module Service
  class API
    def get(endpoint)
      uri = URI(endpoint)
      response = Net::HTTP.get(uri)
      JSON.parse(response)
    end
  end
end