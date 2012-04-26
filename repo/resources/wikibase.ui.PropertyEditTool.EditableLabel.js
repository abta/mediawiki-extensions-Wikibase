/**
 * JavasSript for managing editable representation of item labels.
 * @see https://www.mediawiki.org/wiki/Extension:Wikibase
 * 
 * @since 0.1
 * @file wikibase.ui.PropertyEditTool.EditableLabel.js
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Daniel Werner
 * @author Tobias Gritschacher
 */
"use strict";

/**
 * Serves the input interface for an item label, extends EditableValue.
 * 
 * @param jQuery subject
 */
window.wikibase.ui.PropertyEditTool.EditableLabel = function( subject ) {
	window.wikibase.ui.PropertyEditTool.EditableValue.call( this, subject );
};
window.wikibase.ui.PropertyEditTool.EditableLabel.prototype = new window.wikibase.ui.PropertyEditTool.EditableValue();
$.extend( window.wikibase.ui.PropertyEditTool.EditableLabel.prototype, {
	
	_buildInterfaces: function( subject ) {
		var interfaces = window.wikibase.ui.PropertyEditTool.EditableValue.prototype._buildInterfaces.call( this, subject );
		interfaces[0].inputPlaceholder = mw.msg( 'wikibase-label-edit-placeholder' );
		
		return interfaces;
	},
	
	getInputHelpMessage: function() {
		return window.mw.msg( 'wikibase-label-input-help-message', mw.config.get('wbDataLangName') );
	},

	getApiCallParams: function() {
		return {
			action: "wbsetlanguageattribute",
			language: window.wgUserLanguage,
			label: this.getValue().toString(),
			id: window.mw.config.get( 'wbItemId' ),
			item: 'set'
		};
	}
} );