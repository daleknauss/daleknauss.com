require 'liquid'
require 'uri'

# Capitalize all words of the input
module FormatCategory
  def format_category(words)
    return words.split('-').map(&:capitalize).join(' ')
  end
end

Liquid::Template.register_filter(FormatCategory)