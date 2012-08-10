<?php

namespace Wikibase;
use \Wikibase\Settings as Settings;

/**
 * Language sorting utility functions.
 *
 * @since 0.1
 *
 * @file SortUtils.php
 * @ingroup WikibaseClient
 *
 * @licence GNU GPL v2+
 * @author Nikola Smolenski <smolensk@eunet.rs>
 */
class SortUtils {
	protected static $sort_order = false;

	/**
	 * Sort an array of links in-place iff alwaysSort option is turned on.
	 */
	public static function maybeSortLinks( &$a ) {
		if( Settings::get( 'alwaysSort' ) ) {
			self::sortLinks( $a );
		}
	}

	/**
	 * Sort an array of links in-place
	 * @version	Copied from InterlanguageExtension rev 114818
	 */
	public static function sortLinks( &$a ) {
		wfProfileIn( __METHOD__ );

		// Prepare the sorting array.
		if( self::$sort_order === false ) {
			if( !self::buildSortOrder() ) {
				// If we encounter an unknown sort setting, just do nothing, for we are kind and generous.
				wfProfileOut( __METHOD__ );
				return;
			}
		}

		// Prepare the array for sorting.
		foreach( $a as $k => $langlink ) {
			$a[$k] = explode( ':', $langlink, 2 );
		}

		usort( $a, 'self::compareLinks' );

		// Restore the sorted array.
		foreach( $a as $k => $langlink ) {
			$a[$k] = implode( ':', $langlink );
		}
		wfProfileOut( __METHOD__ );
	}

	/**
	 * usort() callback function, compares the links on the basis of self::$sort_order
	 */
	protected static function compareLinks( $a, $b ) {
		$a = $a[0];
		$b = $b[0];

		if( $a == $b ) return 0;

		// If we encounter an unknown language, which may happen if the sort table is not updated, we move it to the bottom.
		$a = array_key_exists( $a, self::$sort_order )? self::$sort_order[$a]: 999999;
		$b = array_key_exists( $b, self::$sort_order )? self::$sort_order[$b]: 999999;

		return ( $a > $b )? 1: ( ( $a < $b )? -1: 0 );
	}

	/**
	 * Build sort order to be used by compareLinks().
	 *
	 * @return bool True if the build was successful, false if not ('none' or
	 * 	unknown sort order).
	 * @version $order_alphabetic from http://meta.wikimedia.org/w/index.php?title=MediaWiki:Interwiki_config-sorting_order-native-languagename&oldid=3398113
	 * 	$order_alphabetic_revised from http://meta.wikimedia.org/w/index.php?title=MediaWiki:Interwiki_config-sorting_order-native-languagename-firstword&oldid=3395404
	 */
	public static function buildSortOrder() {
		static $order_alphabetic = array(
			'ace', 'kbd', 'af', 'ak', 'als', 'am', 'ang', 'ab', 'ar', 'an', 'arc', 'roa-rup', 'frp', 'as', 'ast', 'gn',
			'av', 'ay', 'az', 'bm', 'bn', 'bjn', 'zh-min-nan', 'nan', 'map-bms', 'ba', 'be', 'be-x-old', 'bh', 'bcl',
			'bi', 'bg', 'bar', 'bo', 'bs', 'br', 'bxr', 'ca', 'cv', 'ceb', 'cs', 'ch', 'cbk-zam', 'ny', 'sn', 'tum',
			'cho', 'co', 'cy', 'da', 'dk', 'pdc', 'de', 'dv', 'nv', 'dsb', 'dz', 'mh', 'et', 'el', 'eml', 'en', 'myv',
			'es', 'eo', 'ext', 'eu', 'ee', 'fa', 'hif', 'fo', 'fr', 'fy', 'ff', 'fur', 'ga', 'gv', 'gag', 'gd', 'gl',
			'gan', 'ki', 'glk', 'gu', 'got', 'hak', 'xal', 'ko', 'ha', 'haw', 'hy', 'hi', 'ho', 'hsb', 'hr', 'io',
			'ig', 'ilo', 'bpy', 'id', 'ia', 'ie', 'iu', 'ik', 'os', 'xh', 'zu', 'is', 'it', 'he', 'jv', 'kl', 'kn',
			'kr', 'pam', 'krc', 'ka', 'ks', 'csb', 'kk', 'kw', 'rw', 'rn', 'sw', 'kv', 'kg', 'ht', 'ku', 'kj', 'ky',
			'mrj', 'lad', 'lbe', 'lez', 'lo', 'ltg', 'la', 'lv', 'lb', 'lt', 'lij', 'li', 'ln', 'jbo', 'lg', 'lmo',
			'hu', 'mk', 'mg', 'ml', 'mt', 'mi', 'mr', 'xmf', 'arz', 'mzn', 'ms', 'cdo', 'mwl', 'mdf', 'mo', 'mn',
			'mus', 'my', 'nah', 'na', 'fj', 'nl', 'nds-nl', 'cr', 'ne', 'new', 'ja', 'nap', 'ce', 'frr', 'pih', 'no',
			'nb', 'nn', 'nrm', 'nov', 'ii', 'oc', 'mhr', 'or', 'om', 'ng', 'hz', 'uz', 'pa', 'pi', 'pfl', 'pag', 'pnb',
			'pap', 'ps', 'koi', 'km', 'pcd', 'pms', 'tpi', 'nds', 'pl', 'tokipona', 'tp', 'pnt', 'pt', 'aa', 'kaa',
			'crh', 'ty', 'ksh', 'ro', 'rmy', 'rm', 'qu', 'rue', 'ru', 'sah', 'se', 'sm', 'sa', 'sg', 'sc', 'sco',
			'stq', 'st', 'nso', 'tn', 'sq', 'scn', 'si', 'simple', 'sd', 'ss', 'sk', 'sl', 'cu', 'szl', 'so',
			'ckb', 'srn', 'sr', 'sh', 'su', 'fi', 'sv', 'tl', 'ta', 'shi', 'kab', 'roa-tara', 'tt', 'te', 'tet',
			'th', 'ti', 'tg', 'to', 'chr', 'chy', 've', 'tr', 'tk', 'tw', 'udm', 'bug', 'uk', 'ur', 'ug', 'za',
			'vec', 'vep', 'vi', 'vo', 'fiu-vro', 'wa', 'zh-classical', 'vls', 'war', 'wo', 'wuu', 'ts', 'yi',
			'yo', 'zh-yue', 'diq', 'zea', 'bat-smg', 'zh', 'zh-tw', 'zh-cn',
		);

		static $order_alphabetic_revised = array(
			'ace', 'kbd', 'af', 'ak', 'als', 'am', 'ang', 'ab', 'ar', 'an', 'arc', 'roa-rup', 'frp', 'as', 'ast',
			'gn', 'av', 'ay', 'az', 'bjn', 'id', 'ms', 'bm', 'bn', 'zh-min-nan', 'nan', 'map-bms', 'jv', 'su',
			'ba', 'be', 'be-x-old', 'bh', 'bcl', 'bi', 'bar', 'bo', 'bs', 'br', 'bug', 'bg', 'bxr', 'ca', 'ceb',
			'cv', 'cs', 'ch', 'cbk-zam', 'ny', 'sn', 'tum', 'cho', 'co', 'cy', 'da', 'dk', 'pdc', 'de', 'dv', 'nv',
			'dsb', 'na', 'dz', 'mh', 'et', 'el', 'eml', 'en', 'myv', 'es', 'eo', 'ext', 'eu', 'ee', 'fa', 'hif',
			'fo', 'fr', 'fy', 'ff', 'fur', 'ga', 'gv', 'sm', 'gag', 'gd', 'gl', 'gan', 'ki', 'glk', 'gu', 'got',
			'hak', 'xal', 'ko', 'ha', 'haw', 'hy', 'hi', 'ho', 'hsb', 'hr', 'io', 'ig', 'ilo', 'bpy', 'ia', 'ie',
			'iu', 'ik', 'os', 'xh', 'zu', 'is', 'it', 'he', 'kl', 'kn', 'kr', 'pam', 'ka', 'ks', 'csb', 'kk', 'kw',
			'rw', 'ky', 'rn', 'mrj', 'sw', 'kv', 'kg', 'ht', 'ku', 'kj', 'lad', 'lbe', 'lez', 'lo', 'la', 'ltg',
			'lv', 'to', 'lb', 'lt', 'lij', 'li', 'ln', 'jbo', 'lg', 'lmo', 'hu', 'mk', 'mg', 'ml', 'krc', 'mt',
			'mi', 'mr', 'xmf', 'arz', 'mzn', 'cdo', 'mwl', 'koi', 'mdf', 'mo', 'mn', 'mus', 'my', 'nah', 'fj',
			'nl', 'nds-nl', 'cr', 'ne', 'new', 'ja', 'nap', 'ce', 'frr', 'pih', 'no', 'nb', 'nn', 'nrm', 'nov',
			'ii', 'oc', 'mhr', 'or', 'om', 'ng', 'hz', 'uz', 'pa', 'pi', 'pfl', 'pag', 'pnb', 'pap', 'ps', 'km',
			'pcd', 'pms', 'nds', 'pl', 'pnt', 'pt', 'aa', 'kaa', 'crh', 'ty', 'ksh', 'ro', 'rmy', 'rm', 'qu', 'ru',
			'rue', 'sah', 'se', 'sa', 'sg', 'sc', 'sco', 'stq', 'st', 'nso', 'tn', 'sq', 'scn', 'si', 'simple', 'sd',
			'ss', 'sk', 'sl', 'cu', 'szl', 'so', 'ckb', 'srn', 'sr', 'sh', 'fi', 'sv', 'tl', 'ta', 'shi', 'kab',
			'roa-tara', 'tt', 'te', 'tet', 'th', 'vi', 'ti', 'tg', 'tpi', 'tokipona', 'tp', 'chr', 'chy', 've', 'tr',
			'tk', 'tw', 'udm', 'uk', 'ur', 'ug', 'za', 'vec', 'vep', 'vo', 'fiu-vro', 'wa', 'zh-classical', 'vls',
			'war', 'wo', 'wuu', 'ts', 'yi', 'yo', 'zh-yue', 'diq', 'zea', 'bat-smg', 'zh', 'zh-tw', 'zh-cn',
		);

		$sort = Settings::get( 'sort' );
		switch( $sort ) {
			case 'code':
				self::$sort_order = $order_alphabetic;
				sort( self::$sort_order );
				break;
			case 'alphabetic':
				self::$sort_order = $order_alphabetic;
				break;
			case 'alphabetic_revised':
				self::$sort_order = $order_alphabetic_revised;
				break;
			case 'none':
			default:
				self::$sort_order = false;
				return false;
		}

		$sortPrepend = Settings::get( 'sortPrepend' );
		if( is_array( $sortPrepend ) ) {
			self::$sort_order = array_unique( array_merge( $sortPrepend, self::$sort_order ) );
		}
		self::$sort_order = array_flip( self::$sort_order );

		return true;
	}

}