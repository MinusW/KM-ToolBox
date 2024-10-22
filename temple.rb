class Temple 
  def self.cost(start_level=0, end_level=50)
    if start_level < 0 then start_level = 0 end
    if end_level > 50 then end_level = 50 end
    if start_level >= end_level then start_level = end_level-1 end

    total = [0, 0, 0]

    (start_level+1..end_level).each do |x|
      
      total[0] += (x * 2) + 10
      total[1] += ((x - 14) * 2) + 10 if x > 14
      total[2] += (x - 29) * 2 if x > 29
    end

    total
  end
end