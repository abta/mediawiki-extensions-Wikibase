/**
 * JavaScript for managing editable representation of property values.
 * @see https://www.mediawiki.org/wiki/Extension:Wikibase
 *
 * @file
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Daniel Werner
 * @author H. Snater <mediawiki@snater.com>
 */
( function( mw, wb, $, undefined ) {
'use strict';
var PARENT = wb.ui.Base;

/**
 * Manages several editable value pieces which act as converters between the pure html input and the
 * input interface. Also does the API call to store new and modify existing values as well as the
 * removal of stored values.
 * @constructor
 * @extends wb.ui.Base
 * @since 0.2 (available in 0.1 but different constructor)
 *
 * TODO: afterStopEditing should also be triggered when left edit mode via cancel!
 * @event afterStopEditing: Triggered after having left edit mode without cancelling.
 *        (1) jQuery.Event
 *        (2) bool - save - whether save action was triggered
 *        (3) bool - wasPending - whether value is a completely new value
 *
 * @event showError: Triggered when error is displayed.
 *        (1) jQuery.Event
 *        (2) Object error containing details about the error, usually API related.
 *        (3) Number|null apiAction on of the API_ACTION enum if the error is related to the api
 *
 * @event hideError: Triggered when displayed error is removed again.
 *        (1) jQuery.Event
 */
var SELF = wb.ui.PropertyEditTool.EditableValue = wb.utilities.inherit( PARENT,
	// Overwritten constructor:
	function( subject, options, interfaces, toolbar ) {
		// allow toolbar not to be set, even though it is still required inside in many places
		if( $.inArray( undefined, [ subject, interfaces ] ) === -1 ) {
			this.init( subject, options, interfaces, toolbar );
		}
	}, {
	/**
	 * @const
	 * @see wb.ui.Base.UI_CLASS
	 * Class which marks the element within the site html.
	 */
	UI_CLASS: 'wb-ui-propertyedittool-editablevalue',

	/**
	 * @const
	 * Actions for doApiAction()
	 * @enum number
	 */
	API_ACTION: {
		SAVE: 1,
		REMOVE: 2,
		/**
		 * A save action which will trigger a remove, the actual difference to a real remove is how this action is
		 * handled in the interface
		 */
		SAVE_TO_REMOVE: 3,
		/**
		 * Action for information purpose only. Is only used by the jQuery.Promise returned by stopEditing().
		 * This has not to be used as an actual API action.
		 */
		NONE: false
	},

	/**
	 * @const
	 * Mapping of API error codes to messages. If the API returns an error code which is not defined here,
	 * wikibase-error-remove-generic or wikibase-error-save-generic message will be shown. ( see _apiCallErr() )
	 */
	API_ERROR_MESSAGE_MAP: {
		'client-error': 'wikibase-error-ui-client-error',
		'no-external-page': 'wikibase-error-ui-no-external-page',
		'cant-edit': 'wikibase-error-ui-cant-edit',
		'no-permissions': 'wikibase-error-ui-no-permissions',
		'link-exists': 'wikibase-error-ui-link-exists',
		'session-failure': 'wikibase-error-ui-session-failure',
		'edit-conflict': 'wikibase-error-ui-edit-conflict',
		'patch-incomplete': 'wikibase-error-ui-edit-conflict'
	},

	/**
	 * specific property key within the API JSON structure.
	 * @const string
	 */
	API_VALUE_KEY: null,

	/**
	 * Element representing the editable value. This element will either hold the value or the input
	 * box in case it is activated for edit.
	 * @var jQuery
	 */
	_subject: null,

	/**
	 * This is true if the input interface is initialized at the time.
	 * @var bool
	 */
	_isInEditMode: false,

	/**
	 * Holds the input element in case this is in edit mode
	 * @var null|jQuery
	 */
	_inputElem: null,

	/**
	 * The toolbar controling the editable value
	 * @var wikibase.ui.Toolbar
	 */
	_toolbar: null,

	/**
	 * If this is true, it means that the value has not been stored to the database at all. So if
	 * in edit mode and pressing cancel, the element will be removed
	 * @var bool
	 */
	_pending: false,

	/**
	 * Array holding all the interfaces which are part of the editable value.
	 * @var wikibase.ui.PropertyEditTool.EditableValue.Interface[]
	 */
	_interfaces: null,

	/**
	 * @see wb.ui.Base._init()
	 *
	 * @param {jQuery} subject
	 * @param {Object} options
	 * @param {wb.ui.PropertyEditTool.EditableValue.Interface[]} interfaces
	 * @param {wb.ui.Toolbar} [toolbar] Shouldn't be initialized yet
	 *
	 * Note: TODO: the toolbar is optional here. BUT, currently the EditableValue still has a
	 *       twisted relation with its toolbar. If it is not set either here or in setToolbar(),
	 *       it is very likely to break.
	 */
	_init: function( subject, options, interfaces, toolbar ) {
		// TODO: this has always been a sucker:
		this._pending = subject.hasClass( 'wb-pending-value' );

		if( !$.isArray( interfaces ) ) {
			interfaces = [ interfaces ];
		}
		this._bindInterfaces( interfaces );
		this._interfaces = interfaces;

		if( toolbar !== undefined ) {
			this.setToolbar( toolbar );
		}
	},

	/**
	 * Binds the interfaces handled by this editable value via some events.
	 *
	 * @param {wb.ui.PropertyEditTool.EditableValue.Interface[]} interfaces
	 */
	_bindInterfaces: function( interfaces ) {
		var self = this;
		$.each( interfaces, function( index, elem ) {
			self._bindSingleInterface( elem );
		} );
	},

	/**
	 * Does the initialization for a single editable value interface. Basically this will bind the
	 * used events and set needed options.
	 *
	 * @param {wikibase.ui.PropertyEditTool.EditableValue.Interface} singleInterface
	 */
	_bindSingleInterface: function( singleInterface ) {
		var self = this;
		singleInterface.onFocus = function( event ){ self._interfaceHandler_onFocus( singleInterface, event ); };
		singleInterface.onBlur = function( event ){ self._interfaceHandler_onBlur( singleInterface, event ); };
		singleInterface.onKeyUp = // ESC key does not react onKeyPressed but on onKeyUp
			function( event ) { self._interfaceHandler_onKeyUp( singleInterface, event ); };
		singleInterface.onKeyPressed =
			function( event ) { self._interfaceHandler_onKeyPressed( singleInterface, event ); };
		singleInterface.onInputRegistered =
			function(){ self._interfaceHandler_onInputRegistered( singleInterface ); };
	},

	/**
	 * Allows to set the toolbar of this EditableValue.
	 *
	 * @param {wb.ui.Toolbar} toolbar
	 */
	setToolbar: function( toolbar ) {
		var self = this,
			tbParent = this._getToolbarParent();

		// TODO: remove existing toolbar
		this._toolbar = toolbar;

		tbParent.addClass( this.UI_CLASS + '-toolbarparent editsection' );
		toolbar.appendTo( tbParent );

		// react on clicks on the toolbar buttons
		$( this._toolbar.editGroup )
		.on( 'edit', function( event ) { self.startEditing(); } )
		.on( 'remove', function( event ) { self.remove(); } )
		.on( 'save', function( event ) { self.stopEditing( true ); } )
		.on( 'cancel', function( event ) { self.stopEditing( false ); } );

		// set the tooltip message
		this._toolbar.editGroup.setTooltip( this.getInputHelpMessage() );

		// TODO: this should really be in the constructor, move it after having the toolbar
		//       separated from the EditableValue via event bindings.
		if( this.isEmpty() || this.isPending() ) {
			// enable editing from the beginning if there is no value yet or pending value...
			this._toolbar.editGroup.btnEdit.doAction();
			this.removeFocus(); // ...but don't set focus there for now
		}
	},

	/**
	 * Returns the toolbar of this EditableValue.
	 *
	 * @return wikibase.ui.Toolbar
	 */
	getToolbar: function() {
		return this._toolbar;
	},

	/**
	 * Returns whether there is a toolbar which allows the user interaction with this EditableValue.
	 *
	 * @return Boolean
	 */
	hasToolbar: function() {
		return !!this._toolbar;
	},

	/**
	 * Returns the node the toolbar should be appended to
	 *
	 * @return jQuery
	 */
	_getToolbarParent: function() {
		// create new div within the structure where we can append the toolbar later:
		this.__toolbarParent = this.__toolbarParent || $( '<span/>' ).appendTo( this._subject );
		return this.__toolbarParent;
	},

	/**
	 * Removes the value from the data store via the API. Also removes the values representation from the dom stated
	 * differently.
	 *
	 * @return jQuery.Promise in case the remove function has been called before and is still running, the promise from
	 *         the ongoing remove will be returned again; the promise will hold additional information
	 * @see $.PersistentPromisor()
	 */
	remove: $.PersistentPromisor( function() {
		$( wb ).triggerHandler( 'startItemPageEditMode', this );

		var promise, action;
		var degrade = $.proxy( function() {
			if( !this.preserveEmptyForm ) {
				$( wb ).triggerHandler( 'stopItemPageEditMode', [ this, this.isPending() ] );
				// remove value totally
				this.destroy();
				this._subject.empty().remove();
				if( this.onAfterRemove !== null ) {
					this.onAfterRemove(); // callback
				}
			} else {
				// delete value but keep empty input form
				this._reTransform( true );
				this.startEditing();
				this.removeFocus(); // don't want the focus immediately after removing the value
			}
		}, this );

		if( this.isPending() || ( this.isEmpty() && this.isNew() ) ) {
			// no API call necessary since value hasn't been stored yet...
			degrade();
			promise = $.Deferred().resolve().promise(); // ...return new promise nonetheless
			action = this.API_ACTION.NONE;
		} else {
			action = this.preserveEmptyForm ? this.API_ACTION.SAVE_TO_REMOVE : this.API_ACTION.REMOVE;

			// store deferred so we can return it when this is called again while still running
			promise = this.performApiAction( action )
				.done( degrade )
				.promise();
		}
		promise.promisor = {
			apiAction: action
		};
		return promise;
	} ),

	/**
	 * Saves the current value by sending it to the server. In case the current value is invalid, this will trigger a
	 * remove instead but will preserve the form to insert a new value.
	 *
	 * @return jQuery.Promise
	 * @see $.PersistentPromisor()
	 */
	save: $.PersistentPromisor( function() {
		var promise = null;

		if( ! this.isValid() ) { // remove instead! Save equals remove in this case!
			promise = this.remove().promise();
			promise.promisor = promise.promisor || {};
			promise.promisor.apiAction = this.API_ACTION.SAVE_TO_REMOVE;
		} else {
			var wasPending = this.isPending();
			var deferred = this.performApiAction( this.API_ACTION.SAVE ) // returns deferred
			.done( $.proxy( function( response ) {
				this._reTransform( true );
				this._pending = false; // not pending anymore after saved once
				this._subject.removeClass( 'wb-pending-value' );
			}, this ) );
			promise = deferred.promise();
			promise.promisor = {
				apiAction: this.API_ACTION.SAVE,
				wasPending: wasPending
			};
		}
		return promise;
	} ),

	/**
	 * By calling this, the editable value will be made editable for the user.
	 * Call stopEditing() to save or cancel the editing process.
	 * Basically this initializes the input box as sub element of the subject and uses the
	 * elements content as initial text.
	 *
	 * @return bool will return false if edit mode is active already.
	 */
	startEditing: function() {
		if( this.isInEditMode() ) {
			return false;
		}
		this._isInEditMode = true;
		this._subject.addClass( this.UI_CLASS + '-ineditmode' );

		$.each( this._interfaces, function( index, elem ) {
			elem.startEditing();
		} );

		/**
		 * only propagate start of edit mode (disabling other actions) when editable value is not
		 * disabled itself; this refers to initially having multiple empty values whose edit modes
		 * are started instantly when loading the page
		 */
		if ( !this._toolbar.isDisabled() ) {
			$( wb ).triggerHandler( 'startItemPageEditMode', this );
		}

		return true;
	},

	/**
	 * Destroys the edit box and displays the original text or the inputs new value.
	 *
	 * @param bool save whether to save the new user given value
	 * @return jQuery.Promise
	 */
	stopEditing: $.PersistentPromisor( function( save ) {
		// create promise which will ONLY be returned in case nothing is saved AND not pending
		var promise = $.Deferred().resolve().promise();
		promise.promisor = {};
		promise.promisor.apiAction = this.API_ACTION.NONE;

		if( !this.isInEditMode() ) {
			return promise;
		}

		if ( !save ) {
			this._reTransform( false );
			if( this.isPending() || ( this.preserveEmptyForm && this.isEmpty() && this.isNew() ) ) { // cancel pending edit...
				promise = this.remove(); // not yet existing value, no state to go back to -> do not trigger 'afterStopEditing' here!
			} else { // cancel...
				$( this._toolbar.editGroup ).triggerHandler(
					'render',
					[promise.promisor.apiAction, this.isEmpty(), this.preserveEmptyForm]
				);
				$( wb ).triggerHandler( 'stopItemPageEditMode', [ this, this.isPending() ] );
				return promise;
			}
		} else {
			promise = this.save(); // save... (will call all the API stuff)
		}

		var wasPending = ( promise.promisor.wasPending !== undefined )
				? promise.promisor.wasPending
				: this.isPending();
		// store deferred so we can return it when this is called again while still running
		return promise
		.done(
			$.proxy( function() {
				this.triggerHandler( 'afterStopEditing', [ save, wasPending ] );

				// toolbar might have been destroyed already by removing the last value or
				// aborting (cancelling) the process of adding a pending value
				if ( this._toolbar !== null ) {
					$( this._toolbar.editGroup ).triggerHandler(
						'render',
						[promise.promisor.apiAction, this.isEmpty(), this.preserveEmptyForm]
					);
				}

				$( wb ).triggerHandler( 'stopItemPageEditMode', [ this, wasPending ] );
			}, this )
		);

	} ),

	/**
	 * remove input elements from DOM
	 *
	 * @param bool save whether the current value should be kept. If false, the initial value will be restored.
	 */
	_reTransform: function( save ) {
		if( ! this.isInEditMode() ) {
			return false;
		}
		$.each( this._interfaces, function( index, elem ) {
			elem.stopEditing( save );
		} );

		this._toolbar.editGroup.btnSave.removeTooltip();
		this._toolbar.editGroup.tooltipAnchor.getTooltip().hide();

		this._isInEditMode = false; // out of edit mode after interfaces are converted back to HTML
		this._subject.removeClass( this.UI_CLASS + '-ineditmode' );

		return true;
	},

	/**
	 * Sets the focus to the input interface
	 */
	setFocus: function() {
		if( this.isInEditMode() ) {
			this._interfaces[0].setFocus();
		}
	},

	/**
	 * Removes the focus from the input interface
	 */
	removeFocus: function() {
		if( this.isInEditMode() ) {
			this._interfaces[0].removeFocus();
		}
	},

	/**
	 * Performs one of the actions available in the this.API_ACTION enum and handles all API related
	 * stuff.
	 *
	 * @param {Number} apiAction see this.API_ACTION enum for all available actions
	 * @return {jQuery.Promise}
	 */
	performApiAction: function( apiAction ) {
		// we have to build our own deferred since the jqXHR object returned by api.proxy() is just
		// referring to the success of the ajax call, not to the actual success of the API request
		// (which could have failed depending on the return value).
		var deferred = $.Deferred(),
			self = this,
			waitMessage = mw.msg(
				'wikibase-'
					+ ( apiAction === this.API_ACTION.REMOVE ? 'remove' : 'save' )
					+ '-inprogress'
			);

		var waitMsg = $( '<span/>' )
		.addClass( this.UI_CLASS + '-waitmsg' )
		.append( // inner span to adjust font-size/line-height when appended to heading
			$( '<span/>' ).text( waitMessage )
		)
		.appendTo( this._getToolbarParent() ).hide();

		deferred
		.done( function( response ) {
			var didSaveAction = apiAction === self.API_ACTION.SAVE
				|| apiAction === self.API_ACTION.SAVE_TO_REMOVE;

			if( didSaveAction ) {
				var responseVal = self._getValueFromApiResponse( response.entity );

				// set normalized value from response if supported by API module
				if( responseVal !== null ) {
					// When saving, this is the 2nd time we set the value but this time right
					// (normalized)! The first time happens in _reTransform where we make sure all
					// interfaces stop editing.
					self.setValue( responseVal );
				}

				if( mw.config.get( 'wbEntityId' ) === null ) {
					// if the 'save' process will create a new item, trigger the event!
					$( window.wikibase ).triggerHandler( 'newItemCreated', response.entity );
				}
			}

			// fade out wait text
			waitMsg.fadeOut( 400, function() {
				self._subject.removeClass( self.UI_CLASS + '-waiting' );

				if( didSaveAction ) {
					waitMsg.remove();
					// only re-display toolbar if value wasn't removed
					self._toolbar._elem.fadeIn( 300 );
				}
			} );
		} )
		.fail( function( textStatus, response ) {
			// remove and show immediately since we need nodes for the tooltip!
			self._subject.removeClass( self.UI_CLASS + '-waiting' );
			waitMsg.remove();
			self.enable(); // re-enabling actions and input box when saving has failed
			self._toolbar._elem.show();
			if ( apiAction === self.API_ACTION.REMOVE ) {
				/**
				 * re-enable all actions when removing fails since it is just using edit mode for
				 * disabling all actions while the remove action is being processed
				 */
				$( wb ).triggerHandler( 'stopItemPageEditMode', [ self, self.isPending() ] );
			}
			self._apiCallErr( textStatus, response, apiAction );
		} );

		// disabling input box during saving (success will stop edit mode, so no re-enabling is
		// necessary in that case)
		this.disable();

		// "force" disabling the toolbar; required due to the special treatment of empty labels /
		// descriptions (see this._setState()) which prevents the toolbar from being enabled when
		// saving an empty value
		this._toolbar.disable();

		this._toolbar._elem.fadeOut( 200, $.proxy( function() {
			waitMsg.fadeIn( 200 );
			// do the actual API request and trigger jQuery.Deferred stuff:
			this.queryApi( deferred, apiAction );
		}, this ) );
		this._subject.addClass( this.UI_CLASS + '-waiting' );

		// add additional info to promise:
		var promise = deferred.promise();
		promise.promisor = {};
		promise.promisor.apiAction = apiAction;

		return promise;
	},

	/**
	 * Extracts a value usable for this from an API response returned after saving the current state.
	 * Returns null in case the API module doesn't return any normalized value. This will fai an error if the given
	 * response is not compatible.
	 *
	 * @param array response
	 * @return array|null // TODO should be a DataValue object
	 */
	_getValueFromApiResponse: function( response ) {
		return ( this.API_VALUE_KEY !== null )
			? [ response[ this.API_VALUE_KEY ][ mw.config.get( 'wgUserLanguage' ) ].value ]
			: null;
	},

	/**
	 * submitting the AJAX request to query the API
	 *
	 * @param jQuery.deferred deferred handling the returning AJAX request
	 * @param number apiAction see this.API_ACTION enum for all available actions
	 */
	queryApi: function( deferred, apiAction ) {
		var api = new mw.Api();
		var apiCall = this.getApiCallParams( apiAction );
		api.post( apiCall, {
			ok: function( response ) {
				deferred.resolve( response );
			},
			err: function( textStatus, response ) {
				deferred.reject( textStatus, response );
			}
		} );
	},

	/**
	 * Returns the neccessary parameters for an api call to store the value.
	 *
	 * @param number apiAction see this.API_ACTION enum for all available actions
	 * @return Object containing the API call specific parameters
	 */
	getApiCallParams: function( apiAction ) {
		var entityId = mw.config.get( 'wbEntityId' );
		var params = {
			language: mw.config.get( 'wgUserLanguage' ),
			token: mw.user.tokens.get( 'editToken' )
		};

		if( entityId !== null ) {
			// API param can only be used if item exists
			params.type = mw.config.get( 'wbEntityType' );
			params.id = entityId;
			params.item = 'set';
		} else {
			// add a new item, ID will be received in APIs return value
			params.item = 'add';
		}

		return params;
	},

	/**
	 * handle error of unsuccessful API call
	 *
	 * @param string textStatus
	 * @param object JSON response
	 * @param number apiAction see this.API_ACTION enum
	 */
	_apiCallErr: function( textStatus, response, apiAction ) {
		var error = {};
		if ( textStatus != 'abort' ) {
			error = {
				code: textStatus,
				shortMessage: ( apiAction === this.API_ACTION.REMOVE )
					? mw.msg( 'wikibase-error-remove-connection' )
					: mw.msg( 'wikibase-error-save-connection' ),
				message: ''
			};
			if ( textStatus == 'timeout' ) {
				error.shortMessage = ( apiAction === this.API_ACTION.REMOVE )
					? mw.msg( 'wikibase-error-remove-timeout' )
					: mw.msg( 'wikibase-error-save-timeout' );
			} else {
				if ( response.error !== undefined ) {
					error.code = response.error.code;
					error.message = response.error.info;
					error.shortMessage = ( this.API_ERROR_MESSAGE_MAP[ response.error.code ] !== undefined )
						? mw.msg( this.API_ERROR_MESSAGE_MAP[ response.error.code ] )
						: ( apiAction === this.API_ACTION.REMOVE )
							? mw.msg( 'wikibase-error-remove-generic' )
							: mw.msg( 'wikibase-error-save-generic' );
				}
			}
		}
		this.showError( error, apiAction );
	},

	/**
	 * custom method to handle UI presentation of API errors
	 * @see jQuery.NativeEventHandler
	 * @triggers showError
	 *
	 * @param Object error
	 * @param Number apiAction one of the this.API_ACTION enum
	 */
	showError: $.NativeEventHandler( 'showError', function( event, error, apiAction ) {
		// attach error tooltip to save button
		var btn = ( apiAction === this.API_ACTION.REMOVE )
			? this._toolbar.editGroup.btnRemove
			: this._toolbar.editGroup.btnSave;

		this._subject.addClass( 'wb-error' );

		btn.setTooltip( new wb.ui.Tooltip( btn._elem, {}, error, { gravity: 'nw' } ) );
		btn.getTooltip().show( true );
		btn.getTooltip().on( 'hide', $.proxy( function() {
			this._subject.removeClass( 'wb-error' );
			// TODO: consider jQuery.Event.preventDefault()
			this.triggerHandler( 'hideError', [ error ] );
		}, this ) );

		this.setFocus(); // re-focus input
	} ),

	/**
	 * Returns whether the input interface is loaded currently
	 *
	 * @return bool
	 */
	isInEditMode: function() {
		return this._isInEditMode;
	},

	/**
	 * Returns true if the value is in edit mode and not stored in the database yet.
	 * TODO: this method only works for site links and therefore should be replaced by this.isNew()
	 * @deprecated
	 *
	 * @return bool
	 */
	isPending: function() {
		return this._pending;
	},

	/**
	 * Returns the current value
	 * // TODO: should return an object representing a data value
	 *
	 * @return Array
	 */
	getValue: function() {
		var result = [];
		$.each( this._interfaces, function( index, elem ) {
			result.push( elem.getValue() );
		} );
		return result;
	},

	/**
	 * Sets a value
	 * // TODO: should take an object representing a data value
	 *
	 * @param Array|string value
	 * @return Array value but normalized
	 */
	setValue: function( value ) {
		if( ! $.isArray( value ) ) {
			value = [ value ];
		}
		$.each( value, $.proxy( function( index, val ) {
			this._interfaces[ index ].setValue( val );
		}, this ) );
		return this.getValue(); // will return value but normalized
	},

	/**
	 * If the input is in edit mode, this will return the value active before the edit mode was entered.
	 * If its not in edit mode, the current value will be returned.
	 *
	 * @return Array
	 */
	getInitialValue: function() {
		if( ! this.isInEditMode() ) {
			return this.getValue();
		}
		var result = [];
		$.each( this._interfaces, function( index, elem ) {
			result.push( elem.getInitialValue() );
		} );
		return result;
	},

	/**
	 * Returns a short information about how the input should be inserted by the user.
	 *
	 * @return string
	 */
	getInputHelpMessage: function() {
		return '';
	},

	/**
	 * Returns true if there is currently no value assigned
	 *
	 * @return bool
	 */
	isEmpty: function() {
		return this.valueCompare( this.getValue() );
	},

	/**
	 * Determines if this value is a new value that is not yet stored
	 * TODO: this method should completely replace this.isPending() which only works for site links
	 * TODO: re-evaluate if above does actually make sense. We have two cases:
	 *       - 1: entirely new value, no value set before (new, e.g. newly added site-link)
	 *       - 2: changed value but save() not yet called (pending?)
	 *
	 * @return bool true if this is a new value, not stored in the database so far
	 */
	isNew: function() {
		return this.valueCompare( this.getInitialValue(), null );
	},

	/**
	 * Returns whether the current value is valid
	 *
	 * @return bool
	 */
	isValid: function() {
		return this.validate( this.getValue() );
	},

	/**
	 * Checks whether a certain value would be valid for this editable value.
	 *
	 * @todo: we might want to move this into a data value/type representing prototype later.
	 *
	 * @param Array value
	 * @return bool
	 */
	validate: function( value ) {
		for( var i in value ) {
			var iInterface = this._interfaces[ i ];
			// don't validate if it isn't active since it should be valid anyhow
			// TODO re-evaluate better implementation
			if( iInterface.isActive() && ! iInterface.validate( value[ i ] ) ) {
				return false;
			}
		}
		return true;
	},

	/**
	 * Helper function comparing two values returned by getValue() or getInitialValue() as long as
	 * we work with arrays instead of proper objects here.
	 * When comparing the values, this will also do an normalization on the values before comparing
	 * them, so even though they are not exactly the same perhaps, they still have the same meaning
	 * and true will be returned.
	 * FIXME/TODO: arrays basically empty but with missing elements (so they are considered invalid)
	 *             are not considered empty right now.
	 *
	 * @todo: mark this deprecated as soon as we use objects representing property values...
	 *
	 * @param Array value1
	 * @param Array value2 [optional] if not given, this will check whether value1 is empty
	 * @return bool true for equal/empty, false if not
	 */
	valueCompare: function( value1, value2 ) {
		var emptyCheck = !$.isArray( value2 );

		if( this._interfaces.length !== value1.length
			|| !emptyCheck && value1.length !== value2.length
		) {
			return false;
		}

		for( var i in value1 ) {
			// check for equal arrays with same entries in same order
			var val2 = emptyCheck ? null : value2[ i ];
			if ( ! this._interfaces[ i ].valueCompare( value1[ i ], val2 ) ) {
				return false
			}
		}
		return true;
	},

	/**
	 * reacting on interface input
	 *
	 * @param relatedInterface wikibase.ui.PropertyEditTool.EditableValue.Interface
	 */
	_interfaceHandler_onInputRegistered: function( relatedInterface ) {
		if( ! relatedInterface.isInEditMode() ) {
			return;
		}

		var value = this.getValue();
		var isInvalid = !this.validate( value );

		// can't save if invalid input (except it is empty, in that case save == remove) OR same as before
		var disableSave = ( isInvalid && !this.isEmpty() ) || this.valueCompare( this.getInitialValue(), value );

		/*
		when having an empty input box, edit mode is automatically started when entering the first
		character; therefore, edit mode has to be stopped automatically (disabling cancel, save is
		disabled anyway when the input box is empty) when emptying the box again while the box was
		empty initially; apart from that, pending values may always be cancelled removing
		corresponding form input from the DOM etc.
		*/
		var disableCancel = !this.isInEditMode() && !this.isEmpty() ||
			!this.isPending() && this.isEmpty() && this.isNew();

		this._toolbar.editGroup.btnSave[ disableSave ? 'disable' : 'enable' ]();
		this._toolbar.editGroup.btnCancel[ disableCancel ? 'disable' : 'enable' ]();

		/**
		 * propagade stopping of edit mode (enabling other actions) when all editable value actions
		 * are disabled; this happens for empty values whose edit modes are triggered directly
		 * during page loading
		 */
		if ( disableSave && disableCancel && this.preserveEmptyForm ) {
			$( wb ).triggerHandler( 'stopItemPageEditMode', [ this, false ] );
		} else if ( this.isNew() ) {
			$( wb ).triggerHandler( 'startItemPageEditMode', this );
		}

	},

	/**
	 * interface's onKeyUp event handler
	 * (ESC key does not react on onKeyPressed)
	 *
	 * @param wikibase.ui.PropertyEditTool.EditableValue.Interface interface
	 * @param jQuery.Event event
	 */
	_interfaceHandler_onKeyUp: function( relatedInterface, event ) {
		if( event.which === $.ui.keyCode.ESCAPE ) {
			this._toolbar.editGroup.btnCancel.doAction();
		}
	},

	/**
	 * interface's onKeyPressed event handler (more user friendly regarding keyboard input handling)
	 *
	 * @param wikibase.ui.PropertyEditTool.EditableValue.Interface interface
	 * @param jQuery.Event event
	 */
	_interfaceHandler_onKeyPressed: function( relatedInterface, event ) {
		if( event.which === $.ui.keyCode.ENTER ) {
			if(
				// value same as before...
				this.valueCompare( this.getInitialValue(), this.getValue() )
			) {
				if( this.isNew() && !this.isValid() ) {
					// if invalid, the user probably changed the value but valueCompare says the value is equal
					// because both values are invalid in case initial value was empty
					return;
				}
				// value not modified yet, cancel button not available but enter should also stop editing
				this._toolbar.editGroup.btnCancel.doAction();
			} else {
				// try to save value
				this._toolbar.editGroup.btnSave.doAction();
			}
		}
	},

	/**
	 * interface's onFocus event handler
	 *
	 * @param wikibase.ui.PropertyEditTool.EditableValue.Interface interface
	 * @param jQuery.Event event
	 */
	_interfaceHandler_onFocus: function( relatedInterface, event ) { },

	/**
	 * interface's onBlur event handler
	 *
	 * @param wikibase.ui.PropertyEditTool.EditableValue.Interface interface
	 * @param jQuery.Event event
	 */
	_interfaceHandler_onBlur: function( relatedInterface, event ) { },

	/**
	 * Removes all traces of this ui element from the DOM, so the represented value is still visible but not
	 * interactive anymore.
	 *
	 * @see wb.ui._destroy()
	 */
	_destroy: function() {
		this._reTransform( false );
		if ( this.isPending() ) {
			this._subject.empty().remove();
		}
		if( this._toolbar !== null) {
			this._toolbar = null;
		}
		this._getToolbarParent().remove();
		for ( var i in this._interfaces ) { // remove span added in _buildInterfaces()
			this._interfaces[i].destroy();
		}
		this._interfaces = null;
		var span = this._subject.children( 'span' ); // span that was inserted in _buildInterfaces()
		span.contents().detach().appendTo( this._subject );
		span.remove();
	},

	/////////////////
	// CONFIGURABLE:
	/////////////////

	/**
	 * determines whether to keep an empty form when leaving edit mode
	 * @var bool
	 */
	preserveEmptyForm: true,

	///////////
	// EVENTS:
	///////////

	/**
	 * Callback called after the element was removed
	 */
	onAfterRemove: null
} );

// add disable/enable functionality overwriting required functions
wb.utilities.ui.StatableObject.useWith( SELF, {
	/**
	 * Determines the state (disabled, enabled or mixed) of all EditableValue elements (interfaces and toolbar).
	 * @see wb.utilities.ui.StatableObject.getState
	 */
	getState: function() {
		// consider toolbars state if toolbar is set
		var state = this.hasToolbar() ? this._toolbar.getState() : undefined;

		// check interfaces
		$.each( this._interfaces, function( i, interf ) {
			var currentState = interf.getState();

			if( state !== currentState) {
				if( state === undefined ) {
					state = currentState;
				} else {
					// state of this element different from others -> mixed state
					state = this.STATE.MIXED;
					return false; // no point in checking other states, we are mixed!
				}
			}
		} );

		return state;
	},

	/**
	 * Dis- or enables the EditableValue (its toolbar and interfaces).
	 * @see wb.utilities.ui.StatableObject._setState
	 *
	 * @todo there is still the bug that calling disable() and then enable() will not re-initiate the disabled state
	 *       of certain toolbar buttons. E.g. if 'save' was disabled for some reason (e.g. initial value didn't change).
	 *       One solution could be to change the state system so all elements always keep their state but if the parent
	 *       is disabled
	 */
	_setState: function( state ) {
		var success = true;

		// propagate state to all interfaces:
		$.each( this._interfaces, function( i, interf ) {
			success = interf.setState( state ) && success;
		} );

		// propagate state to toolbar if toolbar is set
		if( this.hasToolbar() ) {
			var lockedToolbarState = this.hasLockedToolbarState();

			// do only propagate state to toolbar if the state of the toolbar is not locked by some special rule
			if( lockedToolbarState === false || lockedToolbarState === state ) {
				this._toolbar.setState( state );
			}
			success = success && ( this._toolbar.getState() === state ); // consider toolbar state in both cases
		}
		return success;
	},

	/**
	 * Returns whether and which of the toolbar states can currently not be changed by using EditableValue.setState().
	 * If this returns anything but false, EditableValue.setState() might return EditableValue.STATE_MIXED because the
	 * toolbar can't change its state at this point.
	 * It should still be possible to do EditableValue.getToolbar().setState( state ) if the state should be enforced.
	 *
	 * @since 0.2
	 *
	 * @return false|Number false if not locked or one of EditableValue.STATE's enums if a particular state is enforced.
	 */
	hasLockedToolbarState: function() {
		if( this.isInEditMode() && this.preserveEmptyForm && this.isEmpty() ) {
			// toolbar always disabled if in edit mode but empty if empty form should be preserved.
			// this is for label/description which display an empty form ready for input when empty. The toolbar though
			// should be disabled until something is entered there even though the EditableValue itself is enabled.
			return this.STATE.DISABLED;
		}
		return false;
	}

} );

/**
 * Initializes a new EditableValue from a given DOM structure by analysing the DOM and
 * initializing all the input interfaces needed by the EditableValue.
 * @static
 * @since 0.2 (this basically matches the EditableValue constructor from 0.1)
 *
 * @throws Error If the given DOM structure is not compatible, e.g. if it is missing some parts.
 *
 * @param {Element} subject
 * @param {Object} options
 * @param {wb.ui.Toolbar} [toolbar] Shouldn't be initialized yet
 * @param {Function} [constructor] Force the factory to create an instance of the given constructor.
 * @return wikibase.ui.PropertyEditTool.EditableValue
 */
SELF.newFromDom = function( subject, options, toolbar, /** internal */ constructor ) {
	var $subject = $( subject ),
		interfaceParent = $subject.children( '.wb-value' ).first(),
		simpleInterface = new wb.ui.PropertyEditTool.EditableValue.Interface( interfaceParent, this );

	return new ( constructor || SELF )( $subject, options, simpleInterface, toolbar );
}

} )( mediaWiki, wikibase, jQuery );
