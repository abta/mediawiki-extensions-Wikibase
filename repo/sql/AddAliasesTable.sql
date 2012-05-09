-- MySQL patch for the Wikibase extension.
-- Licence: GNU GPL v2+
-- Author: Jeroen De Dauw < jeroendedauw@gmail.com >

-- Derived storage.
-- Holds the aliases for the items.
CREATE TABLE IF NOT EXISTS /*_*/wb_aliases (
  alias_item_id              INT unsigned        NOT NULL, -- Id of the item
  alias_language             VARBINARY(32)       NOT NULL, -- Language code
  alias_text                 VARCHAR(255)        NOT NULL -- The alias text
) /*$wgDBTableOptions*/;

CREATE UNIQUE INDEX /*i*/wb_aliases ON /*_*/wb_aliases (alias_item_id, alias_language, alias_text);
CREATE INDEX /*i*/wb_alias_item_id ON /*_*/wb_aliases (alias_item_id);
CREATE INDEX /*i*/wb_alias_language ON /*_*/wb_aliases (alias_language);
CREATE INDEX /*i*/wb_alias_text ON /*_*/wb_aliases (alias_text);