# -*- encoding : utf-8 -*-
# Wikidata UI tests
#
# Author:: Tobias Gritschacher (tobias.gritschacher@wikimedia.de)
# License:: GNU GPL v2+
#
# module for sitelinks page

module SitelinkPage
  include PageObject
  # sitelinks UI elements
  table(:sitelinksTable, :class => "wb-sitelinks")
  element(:sitelinksTableColumnHeaders, :tr, :class => "wb-sitelinks-columnheaders")
  element(:sitelinksHeaderLanguage, :th, :class => "wb-sitelinks-sitename")
  element(:sitelinksHeaderCode, :th, :class => "wb-sitelinks-siteid")
  element(:sitelinksHeaderLink, :th, :class => "wb-sitelinks-link")
  element(:sitelinksTableBody, :tbody, :xpath => "//table[contains(@class, 'wb-sitelinks')]/tbody")
  element(:sitelinksTableLanguage, :td, :index => 1)
  link(:addSitelinkLink, :css => "table.wb-sitelinks > tfoot > tr > td > span.wb-ui-toolbar > span.wb-ui-toolbar-group > a.wb-ui-toolbar-button:nth-child(1)")
  span(:siteLinkCounter, :class => "wb-ui-propertyedittool-counter")
  text_field(:siteIdInputField, :xpath => "//table[contains(@class, 'wb-sitelinks')]/tfoot/tr/td[1]/input")
  text_field(:pageInputField, :xpath => "//table[contains(@class, 'wb-sitelinks')]/tfoot/tr/td[contains(@class, 'wb-sitelinks-link')]/input")
  text_field(:pageInputFieldExistingSiteLink, :xpath => "//table[contains(@class, 'wb-sitelinks')]/tbody/tr/td[contains(@class, 'wb-sitelinks-link')]/input")
  span(:saveSitelinkLinkDisabled, :class => "wb-ui-toolbar-button-disabled")
  unordered_list(:siteIdAutocompleteList, :class => "ui-autocomplete", :index => 0)
  unordered_list(:pageAutocompleteList, :class => "ui-autocomplete", :index => 1)
  unordered_list(:editSitelinkAutocompleteList, :class => "ui-autocomplete", :index => 0)
  link(:saveSitelinkLink, :text => "save")
  link(:cancelSitelinkLink, :text => "cancel")
  link(:removeSitelinkLink, :text => "remove")
  link(:editSitelinkLink, :xpath => "//td[contains(@class, 'wb-ui-propertyedittool-editablevalue-toolbarparent')]/span/span/span/a")
  link(:englishEditSitelinkLink, :xpath => "//tr[contains(@class, 'wb-sitelinks-en')]/td[4]/span/span/span/a")
  link(:pageArticleNormalized, :css => "td.wb-sitelinks-link-sr > a")
  link(:germanSitelink, :xpath => "//td[contains(@class, 'wb-sitelinks-link-de')]/a")
  link(:englishSitelink, :xpath => "//td[contains(@class, 'wb-sitelinks-link-en')]/a")
  span(:articleTitle, :xpath => "//h1[@id='firstHeading']/span")
  # sitelinks methods
  def get_number_of_sitelinks_from_counter
    wait_until do
      siteLinkCounter?
    end
    scanned = siteLinkCounter.scan(/\(([^)]+)\)/)
    integerValue = scanned[0][0].to_i()
    return integerValue
  end

  def get_nth_element_in_autocomplete_list(list, n)
    count = 0
    list.each do |listItem|
      count = count+1
      if count == n
        return listItem
      end
    end
    return false
  end

  def get_text_from_sitelist_table(x, y)
    return sitelinksTable_element[x][y].text
  end

  def count_existing_sitelinks
    if sitelinksTableColumnHeaders? == false
      return 0
    end
    count = 0
    sitelinksTable_element.each do |tableRow|
      count = count+1
    end
    return count - 2 # subtracting the table header row and the footer row
  end

  def add_sitelinks(sitelinks)
    sitelinks.each do |sitelink|
      addSitelinkLink
      self.siteIdInputField= sitelink[0]
      wait_until do
        self.pageInputField_element.enabled?
      end
      self.pageInputField= sitelink[1]
      saveSitelinkLink
      ajax_wait
      wait_for_api_callback
    end
  end

  def remove_all_sitelinks
    count = 0
    number_of_sitelinks = get_number_of_sitelinks_from_counter
    while count < (number_of_sitelinks)
      editSitelinkLink
      removeSitelinkLink
      ajax_wait
      wait_for_api_callback
      count = count + 1
    end
  end
end
