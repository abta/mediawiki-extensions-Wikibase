/**
 * JavaScript for managing editable representation of item aliases. This is for editing a whole set of aliases, not just
 * a single one.
 * @see https://www.mediawiki.org/wiki/Extension:Wikibase
 *
 * @file
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Daniel Werner
 */
( function( mw, wb, $, undefined ) {
'use strict';
var PARENT = wb.ui.PropertyEditTool.EditableValue;

/**
 * Serves the input interface for an items aliases, extends EditableValue.
 * @constructor
 * @extends wb.ui.PropertyEditTool.EditableValue
 * @since 0.1
 */
var SELF = wb.ui.PropertyEditTool.EditableAliases = wb.utilities.inherit( PARENT, {

	API_VALUE_KEY: 'aliases',

	/**
	 * @see wikibase.ui.PropertyEditTool.EditableValue._init
	 *
	 * @param {jQuery} subject
	 * @param {Object} options
	 * @param {wikibase.ui.Toolbar} toolbar
	 */
	_init: function( subject, options, toolbar ) {
		var newSubject = $( '<span>' );
		$( this._subject ).replaceWith( newSubject ).appendTo( newSubject );

		// overwrite subject // TODO: really not that nice, is it?
		this._subject = newSubject;

		PARENT.prototype._init.call( this, newSubject, options, toolbar );
	},

	/**
	 * @see wikibase.ui.PropertyEditTool.EditableValue._interfaceHandler_onInputRegistered
	 *
	 * @param relatedInterface wikibase.ui.PropertyEditTool.EditableValue.Interface
	 */
	_interfaceHandler_onInputRegistered: function( relatedInterface ) {
		if( relatedInterface.isInEditMode() ) {
			PARENT.prototype._interfaceHandler_onInputRegistered.call( this, relatedInterface );
			// always enable cancel button since it is alright to have an empty value
			this._toolbar.editGroup.btnCancel.enable();
		}
	},

	/**
	 * @see wikibase.ui.PropertyEditTool.EditableValue.getInputHelpMessage
	 *
	 * @return string tooltip help message
	 */
	getInputHelpMessage: function() {
		return window.mw.msg( 'wikibase-aliases-input-help-message', mw.config.get('wbDataLangName') );
	},

	/**
	 * @see wikibase.ui.PropertyEditTool.EditableValue._getValueFromApiResponse
	 */
	_getValueFromApiResponse: function( response ) {
		if ( !$.isArray( response[ this.API_VALUE_KEY ][ window.mw.config.get( 'wgUserLanguage' ) ] ) ) {
			return null;
		} else {
			var values = [];
			$.each( response[ this.API_VALUE_KEY ][ window.mw.config.get( 'wgUserLanguage' ) ], function( i, item ) {
				values.push( item.value );
			} );
			return values;
		}
	},

	/**
	 * Removes injected nodes in addition to parent's destroy routine.
	 *
	 * @see wikibase.ui.PropertyEditTool.EditableValue._destroy
	 */
	_destroy: function() {
		var originalSubject = this._subject.find( 'ul:first' );

		// div injected in this._buildInterfaces()
		this._subject.find( 'ul:first' ).parent().replaceWith( this._subject.find( 'ul:first' ) );

		// span injected in this._init()
		this._subject.replaceWith( this._subject.children() );

		this._subject = originalSubject;

		PARENT.prototype._destroy.call( this );
	},

	/**
	 * Sets a value
	 * @see wikibase.ui.PropertyEditTool.EditableValue
	 *
	 * @param Array value to set
	 * @return Array set value
	 */
	setValue: function( value ) {
		if( $.isArray( value ) ) {
			this._interfaces[0].setValue( value );
		}
		return this.getValue();
	},

	/**
	 * @see wikibase.ui.PropertyEditTool.EditableValue.showError
	 */
	showError: function( error, apiAction ) {
		/*
		 * EditableAliases has no option to manually trigger a complete removal of the input component
		 * (but when saving with an empty value, a remove action is implied without having a remove button to which an
		 * error tooltip may be attached to; subsequently, the remove action has to be internally converted to an action
		 * triggered by the save button internally)
		 */
		if ( apiAction === this.API_ACTION.REMOVE ) {
			apiAction = this.API_ACTION.SAVE_TO_REMOVE;
		}
		PARENT.prototype.showError.call( this, error, apiAction );
	},

	/**
	 * @see wikibase.ui.PropertyEditTool.EditableValue.getApiCallParams
	 *
	 * @param number apiAction see this.API_ACTION enum for all available actions
	 * @return Object containing the API call specific parameters
	 */
	getApiCallParams: function( apiAction ) {
		var params = PARENT.prototype.getApiCallParams.call( this, apiAction );
		params.action = 'wbsetaliases';
		params.baserevid = mw.config.get( 'wgCurRevisionId' );
		// We don't use the 'set' param here to allow having more than 50 aliases (500 for bots).
		// This is because those API parameters are restricted to take 50 items, then ignoring the rest.
		// This way we can add/remove 50 aliases at the same time before running into this issue.
		params.add = this._interfaces[0].getNewItems().join( '|' );
		params.remove = this._interfaces[0].getRemovedItems().join( '|' );
		return params;
	},

	/**
	 * @see wikibase.ui.PropertyEditTool.EditableValue.preserveEmptyForm
	 * @var bool
	 */
	preserveEmptyForm: false
} );

/**
 * @see wb.ui.PropertyEditTool.EditableValue.newFromDom
 */
SELF.newFromDom = function( subject, options, toolbar ) {
	var $subject = $( subject ),
		$interfaceParent = $( '<div/>' );

	// we have to wrap the list in another node for the ListInterface, since the <ul/> is the actual value
	$subject.filter( 'ul:first' ).replaceWith( $interfaceParent ).appendTo( $interfaceParent );

	var aliasesInterface = new wb.ui.PropertyEditTool.EditableValue.AliasesInterface( $interfaceParent );

	return new SELF( $interfaceParent, options, aliasesInterface );
};

}( mediaWiki, wikibase, jQuery ) );
