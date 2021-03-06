/**
 * JavaScript for 'wikibase' extension
 * @see https://www.mediawiki.org/wiki/Extension:Wikibase
 *
 * @file
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Daniel Werner < daniel.werner at wikimedia.de >
 */

/**
 * Global 'Wikibase' extension singleton.
 * @since 0.1
 *
 *
 * @event startItemPageEditMode: Triggered when any edit mode on the item page is started
 *        (1) {jQuery.Event}
 *        (2) {wb.ui.PropertyEditTool.EditableValue} origin Object which triggered the event
 *
 * @event newItemCreated: Triggered after an item has been created and the necessary API request has
 *        returned.
 *        (1) {jQuery.Event}
 *        (2) {Object} item The new item returned by the API request. | FIXME: this should be an
 *            'Item' object!
 *
 * @event stopItemPageEditMode: Triggered when any edit mode on the item page is stopped.
 *        (1) {jQuery.Event}
 *        (2) {wb.ui.PropertyEditTool.EditableValue} origin Object which triggered the event
 *        (3) {Boolean} wasPending Whether value was a previously not existent/new value that has
 *            just been added
 *
 * @event restrictEntityPageActions: Triggered when editing is not allowed for the user.
 *        (see TODO/FIXME in wikibase.ui.entityViewInit - handle edit restrictions)
 *        (1) {jQuery.Event}
 *
 * @event blockEntityPageActions: Triggered when editing is not allowed for the user because he is
 *        blocked from the page.
 *        (see TODO/FIXME in wikibase.ui.entityViewInit - handle edit restrictions)
 *        (1) {jQuery.Event}
 */
var wikibase = new ( function( mw, $, undefined ) {
	'use strict';

	/**
	 * same as mediaWiki.log() but prefixes the log entry with 'wb:'
	 */
	this.log = function() {
		var args = $.makeArray( arguments );
		args.unshift( 'wb:' );
		mw.log.apply( mw.log, args );
	};

	/**
	 * Will hold a list of all the sites after getSites() was called. This will cache the result.
	 * @var wikibase.Site[]
	 */
	this._siteList = null;

	/**
	 * Returns an array with all the known sites.
	 *
	 * @return wikibase.Site[]
	 */
	this.getSites = function() {
		if( this._siteList !== null ) {
			// get cached list since this can be an expensive job to do
			return this._siteList;
		}

		// get all the details about all the sites:
		var sitesDetails = mw.config.get( 'wbSiteDetails' );
		this._siteList = {};

		for( var siteId in sitesDetails ) {
			if( sitesDetails.hasOwnProperty( siteId ) ) {
				var site = sitesDetails[ siteId ];
				site.id = siteId;
				this._siteList[ siteId ] =  new this.Site( site );
			}
		}

		return this._siteList;
	};

	/**
	 * Returns whether the Wikibase installation knows a site with a certain ID.
	 *
	 * @return bool
	 */
	this.hasSite = function ( siteId ) {
		return this.getSite( siteId ) !== null;
	};

	/**
	 * Returns a wikibase.Site object with details about a site by the sites site ID. If there is no
	 * site related to the given ID, null will be returned.
	 *
	 * @param int siteId
	 * @return wikibase.Site|null
	 */
	this.getSite = function( siteId ) {
		var sites = this.getSites();
		var site = sites[ siteId ];

		if( site === undefined ) {
			return null;
		}
		return site;
	};

} )( mediaWiki, jQuery );

window.wikibase = window.wb = wikibase; // global aliases