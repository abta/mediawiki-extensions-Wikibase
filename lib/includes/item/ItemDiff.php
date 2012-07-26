<?php

namespace Wikibase;
use Diff\MapDiff as MapDiff;

/**
 * Represents a diff between two WikibaseItem instances.
 * Acts as a container for diffs between the various fields
 * of the items. Also contains methods to obtain these
 * diffs as Wikibase\Change objects.
 *
 * Immutable.
 *
 * @since 0.1
 *
 * @file
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */
class ItemDiff extends EntityDiffObject {

	protected static function siteLinksToArray( $links ) {
		$links = array();

		/* @var SiteLink $link */
		foreach ( $links as $link ) {
			$links[ $link->getSiteID() ] = $link->getPage();
		}

		return $links;
	}

	public static function newFromItems( Item $oldItem, Item $newItem ) {
		return static::newFromEntities( $oldItem, $newItem, array(
			'links' => MapDiff::newFromArrays(
				self::siteLinksToArray( $oldItem->getSiteLinks() ),
				self::siteLinksToArray( $newItem->getSiteLinks() )
			)
		) );
	}

	/**
	 * Returns a MapDiff object with the sitelink differences.
	 *
	 * @since 0.1
	 *
	 * @return MapDiff
	 */
	public function getSiteLinkDiff() {
		return $this->operations['links'];
	}

	/**
	 * @see EntityDiff::isEmpty
	 *
	 * @since 0.1
	 *
	 * @return boolean
	 */
	public function isEmpty() {
		return parent::isEmpty() && $this->getSiteLinkDiff()->isEmpty();
	}

	/**
	 * @see EntityDiff::getView
	 *
	 * @since 0.1
	 *
	 * @return ItemDiffView
	 */
	public function getView() {
		return new ItemDiffView( array(), $this );
	}

}