<?php

namespace Wikibase\Test;
use \Wikibase\ItemHandler as ItemHandler;
use \Wikibase\Item as Item;
use WikiPage, Title, WikitextContent;

/**
 * Tests prevention of moving pages in and out of the data NS.
 *
 * @file
 * @since 0.1
 *
 * @ingroup Wikibase
 * @ingroup Test
 *
 * @group Wikibase
 * @group WikibaseItem
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 * @author John Erling Blad < jeblad@gmail.com >
 */
class ItemMoveTest extends \MediaWikiTestCase {

	/**
	 * @var Item
	 */
	protected $item;

	/**
	 * @var WikiPage
	 */
	protected $page;

	/**
	 * This is to set up the environment
	 */
	public function setUp() {
		parent::setUp();

		$this->item = Item::newEmpty();
		$this->item->save();

		$title = Title::newFromText( 'wbmovetest' );
		$this->page =  new WikiPage( $title );
		$this->page->doEditContent( new WikitextContent( 'foobar' ), 'test' );
	}

	/**
	 * Tests @see WikibaseItem::getIdForSiteLink
	 */
	public function testMovePrevention() {
		// Moving a regular page into data NS onto an existing item
		$title = $this->item->getTitle();
		$this->assertFalse( $this->page->getTitle()->moveTo( $title ) === true );

		// Moving a regular page into data NS to an invalid location
		$title = Title::newFromText( $this->page->getTitle()->getText(), WB_NS_DATA );
		$this->assertFalse( $this->page->getTitle()->moveTo( $title ) === true );

		// Moving a regular page into data NS to an empty (but valid) location
		$title = Item::newFromArray( array( 'entity' => 'q42' ) )->getTitle();
		$this->assertFalse( $this->page->getTitle()->moveTo( $title ) === true );

		// Moving item page out of data NS onto an existing page
		$title = $this->page->getTitle();
		$this->assertFalse( $this->item->getTitle()->moveTo( $title ) === true );

		// Moving item page out of data NS onto a non-existing page
		$title = Title::newFromText( 'wbmovetestitem' );
		$this->assertFalse( $this->item->getTitle()->moveTo( $title ) === true );

		// Moving item to an invalid location in the data NS
		$title = Title::newFromText( $this->page->getTitle()->getText(), WB_NS_DATA );
		$this->assertFalse( $this->item->getTitle()->moveTo( $title ) === true );

		// Moving item to an valid location in the data NS
		$title = Item::newFromArray( array( 'entity' => 'q42' ) )->getTitle();
		$this->assertFalse( $this->item->getTitle()->moveTo( $title ) === true );
	}

}
	