<?php

namespace Wikibase;
use User, Title, WikiPage, Content, ParserOptions, ParserOutput, RequestContext;

/**
 * Content handler for Wikibase items.
 *
 * @since 0.1
 *
 * @file WikibaseItemHandler.php
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Daniel Kinzler
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */
class ItemHandler extends EntityHandler {

	/**
	 * @return Item
	 */
	public function makeEmptyContent() {
		return Item::newEmpty();
	}

	public function __construct() {
		parent::__construct( CONTENT_MODEL_WIKIBASE_ITEM );
	}

	/**
	 * @return array
	 */
	public function getActionOverrides() {
		return array(
			'view' => '\Wikibase\ViewItemAction',
			'edit' => '\Wikibase\EditItemAction',
		);
	}

	/**
	 * Returns a ParserOutput object containing the HTML.
	 *
	 * @since 0.1
	 *
	 * @param Title $title
	 * @param null $revId
	 * @param null|ParserOptions $options
	 * @param bool $generateHtml
	 *
	 * @return ParserOutput
	 */
	public function getParserOutput( Content $content, Title $title, $revId = null, ParserOptions $options = null, $generateHtml = true )  {
		$itemView = new ItemView( );
		return $itemView->getParserOutput( $content );
	}

	/**
	 * @param string $blob
	 * @param null|string $format
	 *
	 * @return Item
	 */
	public function unserializeContent( $blob, $format = null ) {
		return Item::newFromArray( $this->unserializedData( $blob, $format ) );
	}

	/**
	 * @see ContentHandler::getDeletionUpdates
	 *
	 * @param \Content           $content
	 * @param \Title             $title
	 * @param null|\ParserOutput $parserOutput
	 *
	 * @return array of \DataUpdate
	 */
	public function getDeletionUpdates( Content $content, Title $title, ParserOutput $parserOutput = null ) {
		return array_merge(
			parent::getDeletionUpdates( $content, $title, $parserOutput ),
			array( new ItemDeletionUpdate( $content ) )
		);
	}

	/**
	 * @see   ContentHandler::getSecondaryDataUpdates
	 *
	 * @since 0.1
	 *
	 * @param \Content           $content
	 * @param \Title             $title
	 * @param \Content|null      $old
	 * @param bool               $recursive
	 *
	 * @param null|\ParserOutput $parserOutput
	 *
	 * @return array of \DataUpdate
	 */
	public function getSecondaryDataUpdates( Content $content, Title $title, Content $old = null,
											$recursive = false, ParserOutput $parserOutput = null ) {

		return array_merge(
			parent::getSecondaryDataUpdates( $content, $title, $old, $recursive, $parserOutput ),
			array( new ItemStructuredSave( $content, $title ) )
		);
	}

	protected function getDiffEngineClass() {
		return '\Wikibase\DifferenceEngine';
	}
}
