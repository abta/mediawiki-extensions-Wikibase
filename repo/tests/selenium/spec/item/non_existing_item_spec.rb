# Wikidata UI tests
#
# Author:: Tobias Gritschacher (tobias.gritschacher@wikimedia.de)
# License:: GNU GPL v2+
#
# tests for the non existing item page

require 'spec_helper'

describe "Check functionality of non existing item page" do
  context "Check functionality of non existing item page" do
    it "should check for link to Special:CreateItem and firstHeading" do
      visit_page(NonExistingItemPage)
      @current_page.firstHeading.should be_true
      @current_page.firstHeading_element.text.should == "Data:Qxy"
      @current_page.specialCreateNewItemLink?.should be_true
      @current_page.specialCreateNewItemLink
      @current_page.labelInputField.should be_true
      @current_page.descriptionInputField.should be_true
    end
  end
end