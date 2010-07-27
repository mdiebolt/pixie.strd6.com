class Collection < ActiveRecord::Base
  include Commentable

  belongs_to :user
  has_many :collection_items

  def items
    collection_items.map(&:item)
  end

  def include?(item)
    items.include?(item)
  end
end