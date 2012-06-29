# Wikidata UI tests
#
# Author:: Tobias Gritschacher (tobias.gritschacher@wikimedia.de)
# License:: GNU GPL v2+
#
# tests for item: check edit-tab

require 'spec_helper'

describe "Check functionality of edit-tab" do
  context "Check if edit-tab is hidden when showing an item" do
    it "should check that the edit-tab is not shown on the item page" do
      visit_page(NewItemPage)
      @current_page.create_new_item(generate_random_string(10), generate_random_string(20))
      @current_page.editTab?.should be_false
    end
  end
end