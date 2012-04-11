<?php

/**
 * Initialization file for the Wikibase extension.
 *
 * Documentation:	 		https://www.mediawiki.org/wiki/Extension:Wikibase
 * Support					https://www.mediawiki.org/wiki/Extension_talk:Wikibase
 * Source code:				https://gerrit.wikimedia.org/r/gitweb?p=mediawiki/extensions/WikidataRepo.git
 *
 * @file Wikibase.php
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 * @author Daniel Werner < daniel.werner at wikimedia.de >
 * @author Daniel Kinzler
 */

/**
 * This documentation group collects source code files belonging to Wikibase.
 *
 * @defgroup Wikibase Wikibase
 */

if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

if ( version_compare( $wgVersion, '1.19c', '<' ) ) { // Needs to be 1.19c because version_compare() works in confusing ways.
	die( '<b>Error:</b> Wikibase requires MediaWiki 1.19 or above.' );
}

define( 'WB_VERSION', '0.1 alpha' );

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'Wikibase',
	'version' => WB_VERSION,
	'author' => array(
		'The Wikidata team', // TODO: link?
	),
	'url' => 'https://www.mediawiki.org/wiki/Extension:Wikibase',
	'descriptionmsg' => 'wikibase-desc'
);

$dir = dirname( __FILE__ ) . '/';



// i18n
$wgExtensionMessagesFiles['Wikibase'] 				= $dir . 'Wikibase.i18n.php';



// Autoloading
$wgAutoloadClasses['WBSettings'] 					= $dir . 'Wikibase.settings.php';
$wgAutoloadClasses['WikibaseHooks'] 				= $dir . 'Wikibase.hooks.php';

// api
$wgAutoloadClasses['ApiWikibaseGetItem'] 			= $dir . 'api/ApiWikibaseGetItem.php';
$wgAutoloadClasses['ApiWikibaseGetItemId'] 			= $dir . 'api/ApiWikibaseGetItemId.php';
$wgAutoloadClasses['ApiWikibaseAssociateArticle'] 	= $dir . 'api/ApiWikibaseAssociateArticle.php';
$wgAutoloadClasses['ApiWikibaseSetLabel'] 			= $dir . 'api/ApiWikibaseSetLabel.php';
$wgAutoloadClasses['ApiWikibaseSetDescription'] 	= $dir . 'api/ApiWikibaseSetDescription.php';

// includes
$wgAutoloadClasses['WikibaseContentHandler'] 		= $dir . 'includes/WikibaseContentHandler.php';
$wgAutoloadClasses['WikibaseDifferenceEngine'] 		= $dir . 'includes/WikibaseDifferenceEngine.php';
$wgAutoloadClasses['WikibaseContent'] 				= $dir . 'includes/WikibaseContent.php';
$wgAutoloadClasses['WikibasePage'] 					= $dir . 'includes/WikibasePage.php';



// API module registration
$wgAPIModules['wbgetitem'] 							= 'ApiWikibaseGetItem';
$wgAPIModules['wbgetitemid'] 						= 'ApiWikibaseGetItemId';
$wgAPIModules['wbassociatearticle'] 				= 'ApiWikibaseSetWikipediaTitle';
$wgAPIModules['wbsetdescription'] 					= 'ApiWikibaseSetDescription';
$wgAPIModules['wbsetlabel'] 						= 'ApiWikibaseSetLabel';



// Hooks
$wgHooks['LoadExtensionSchemaUpdates'][] 			= 'WikibaseHooks::onSchemaUpdate';
$wgHooks['UnitTestsList'][] 						= 'WikibaseHooks::registerUnitTests';



// Resource loader modules
$moduleTemplate = array(
	'localBasePath' => dirname( __FILE__ ) . '/resources',
	'remoteExtPath' => 'WikidataRepo/resources',
);

$wgResourceModules['wikibase'] = $moduleTemplate + array(
	'scripts' => array(	
		'wikibase.js',
		'wikibase.ui.js',
		'wikibase.ui.PropertyEditTool.js',
		'wikibase.ui.PropertyEditTool.Toolbar.js',
		'wikibase.ui.PropertyEditTool.EditableValue.js',
		'wikibase.startup.js'
	),
	'styles' => array(
		'wikibase.ui.PropertyEditTool.css',
	),
	'dependencies' => array(
	),
	'messages' => array(
		'wikibase-cancel',
		'wikibase-edit',
		'wikibase-save'
	)
);

unset( $moduleTemplate );



// register hooks and handlers
define( 'CONTENT_MODEL_WIKIDATA', 'wikidata' );
$wgContentHandlers[CONTENT_MODEL_WIKIDATA] = 'WikibaseContentHandler';


$egWBSettings = array();