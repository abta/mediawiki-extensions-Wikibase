/**
 * JavasSript for 'Wikibase' property edit tool toolbar buttons
 * @see https://www.mediawiki.org/wiki/Extension:Wikibase
 * 
 * @since 0.1
 * @file wikibase.ui.PropertyEditTool.Toolbar.js
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Daniel Werner
 */

/**
 * Represents a button within a wikibase.ui.PropertyEditTool.Toolbar toolbar
 * 
 * @param jQuery parent
 */
window.wikibase.ui.PropertyEditTool.Toolbar.Button = function( text ) {
	window.wikibase.ui.PropertyEditTool.Toolbar.Label.call( this, text );
};
window.wikibase.ui.PropertyEditTool.Toolbar.Button.prototype = new window.wikibase.ui.PropertyEditTool.Toolbar.Label();
$.extend( window.wikibase.ui.PropertyEditTool.Toolbar.Button.prototype, {
	/**
	 * @const
	 * Class which marks the toolbar button within the site html.
	 */
	UI_CLASS: 'wb-ui-propertyedittoolbar-button',

	/**
	 * @var jQuery
	 */
	_elem: null,
	
	_initElem: function( text ) {
		this._elem = $( '<a/>', {
            'class': this.UI_CLASS,
            text: text,
            href: 'javascript:;',
            click: jQuery.proxy( this.doAction, this )
        } );
	},

	destroy: function() {
		// TODO
	},
	
	/**
	 * Executes the action related to the button. Can't be done if button is disabled.
	 * @return bool false if the action was cancelled by the onAction hook.
	 */
	doAction: function() {
        if(
			this.isDisabled() // can't do action when disabled!
			|| this.onAction !== null && this.onAction() === false // callback
		) {
            // cancel action
            return false;
        }		
		return true;
	},
	
	/**
	 * sets the buttons text
	 * @param string text
	 */
	setText: function( text ) {
		this._elem.text( text );
	},
	
	/**
	 * returns the buttons text
	 * @return string
	 */
	getText: function() {
		return this._elem.text();
	},
	
	/**
	 * Disables or enables the button
	 * @param bool disabled true for disabling, false for enabling the button.
	 *        If the button is disabled, it can't be clicked.
	 */
	setDisabled: function( disable ) {
		if( this.isDisabled() == disable ) {
			return false;
		}
		var text = this.getText();
		var oldElem = this._elem;
		
		if( disable ) {
			// create a disabled label instead of a link
			window.wikibase.ui.PropertyEditTool.Toolbar.Label.prototype._initElem.call( this, text );
		}
		else {
			this._initElem( text );
		}
		
		// replace old element with new one within dom
		oldElem.replaceWith( this._elem );
		
		// call prototypes disable function:
		return window.wikibase.ui.PropertyEditTool.Toolbar.Label.prototype.setDisabled.call( this, disable );
	},
	
	///////////
	// EVENTS:
	///////////

	/**
	 * Callback called after the button was pressed (only if the button is enabled).
	 * If the callback returns false, the action will be cancelled.
	 */
	onAction: null
} );