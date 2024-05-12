/**
 * Requires
 */
import {
    bindNodeList,
    copyToClipboard,
    EventDispatcher,
    Exception,
    isPojo,
    saveBlobAs,
    strand,
    ucfirst
} from '@squirrel-forge/ui-util';
import { UiTemplateRenderer } from '@squirrel-forge/ui-core';
import { UiFormTemplate, UiFieldsetTemplate, UiInputTemplate } from '@squirrel-forge/ui-form';
import { UiModalComponent, UiModalTemplate, UiModalPluginAlert, UiModalPluginConfirm } from '@squirrel-forge/ui-modal';
import { Storage } from './Storage';
import { Model } from './Model';
import { Settings } from './Models/Settings';
import { Theme } from './Models/Theme';
import { Board } from './Models/Board';
import { Group } from './Models/Group';
import { Item } from './Models/Item';
import { View } from './View';
import { BoardTemplate } from './Templates/BoardTemplate';
import { GroupTemplate } from './Templates/GroupTemplate';
import { ItemTemplate } from './Templates/ItemTemplate';
import { NoteTemplate } from './Templates/NoteTemplate';
import { YoutubeTemplate } from './Templates/YoutubeTemplate';

/**
 * Application exception
 * @class
 * @extends Exception
 */
class ApplicationException extends Exception {}

/**
 * Application wrapper
 * @class
 * @extends EventDispatcher
 */
export class Application extends EventDispatcher {

    /**
     * Booted status
     * @private
     * @type {boolean}
     */
    #booted = false;

    /**
     * Bind status
     * @private
     * @type {boolean}
     */
    #bound = false;

    /**
     * Storage
     * @private
     * @type {Storage}
     */
    #storage;

    /**
     * Settings
     * @private
     * @type {Settings}
     */
    #settings;

    /**
     * Theme
     * @private
     * @type {Theme}
     */
    #theme;

    /**
     * View
     * @private
     * @type {View}
     */
    #view;

    /**
     * First visit/has no data
     * @private
     * @type {boolean}
     */
    #isFirstVisit = false;

    /**
     * Scroller instance
     * @private
     * @type {Scroller}
     */
    #scr;

    /**
     * Version
     * @private
     * @type {string}
     */
    #version;

    /**
     * App base url
     * @private
     * @type {string}
     */
    #url;

    /**
     * Constructor
     * @constructor
     * @param {string} version - Version string
     * @param {string} url - App url
     * @param {Scroller} scroll - Scroller instance
     * @param {null|Console} debug - Debug mode
     */
    constructor( version, url, scroll, debug ) {
        super( document, null, debug );
        this.#version = version;
        this.#url = url;
        this.#scr = scroll;

        // Bind events
        try {
            this.bind();
        } catch ( e ) {
            throw new ApplicationException( 'Failed to bind application', e );
        }
    }

    /**
     * Scroll to intermediate
     * @public
     * @param {HTMLElement} element - Target
     * @param {null|Function} complete - Complete callback
     * @param {null|number|HTMLElement|Function} offset - Offset
     * @param {null|HTMLElement} context - Scroll context
     * @return {void}
     */
    scrollTo( element, complete = null, offset = null, context = null ) {
        this.#scr.scrollTo( element, complete, offset, context );
    }

    /**
     * Getter: version
     * @return {string} - Version string
     */
    get version() { return this.#version; }

    /**
     * Getter: storage
     * @return {Storage} - Storage instance
     */
    get storage() { return this.#storage; }

    /**
     * Getter: view
     * @return {View} - View instance
     */
    get view() { return this.#view; }

    /**
     * Getter: settings
     * @return {Settings} - Settings instance
     */
    get settings() { return this.#settings; }

    /**
     * Getter: theme
     * @return {Theme} - Theme instance
     */
    get theme() { return this.#theme; }

    /**
     * Bind application
     * @public
     * @return {void}
     */
    bind() {
        if ( this.#bound ) return;
        const header = document.getElementById( 'header' );
        const footer = document.getElementById( 'footer' );

        // Load and ensure default data
        this.addEventListener( 'storage.ready', async() => {
            const has_settings = await this.storage.typeHasData( 'settings' );
            await this.initSettings( !has_settings );
            const has_theme = await this.storage.typeHasData( 'theme' );
            await this.initTheme( !has_theme );
            const has_board = await this.storage.typeHasData( 'board' );
            if ( !has_board ) this.#isFirstVisit = true;
            this.dispatchEvent( 'data.ready' );
        } );

        this.addEventListener( 'data.ready', async() => {

            // Set version
            header.querySelector( '[data-version]' ).innerText = this.version;

            // Show first time visit welcome
            if ( this.#isFirstVisit ) this.showWelcome();

            /**
             * Remove install button
             * @return {void}
             */
            const remove_install_button = () => {
                this.selectAction( 'app.install', header )[ 0 ].remove();
            };

            /**
             * Remove install button and thank user after install
             */
            window.addEventListener( 'appinstalled', () => {
                remove_install_button();
                delete window._deferredInstallPrompt;
                this.showInstallThanks();
            } );

            // Bind header actions and enable
            this.bindActions( {
                'app.install' : [
                    [ 'click', async( event ) => {
                        event.preventDefault();

                        // We do not have the prompt, remove the button
                        if ( !window._deferredInstallPrompt ) {
                            remove_install_button();
                            return;
                        }

                        // If we have a prompt, register a handler to remove button after interaction
                        window._deferredInstallPrompt.prompt();
                        window._deferredInstallPrompt.userChoice.then( ( choiceResult ) => {
                            delete window._deferredInstallPrompt;
                            remove_install_button();

                            // Thank user for installing :)
                            if ( choiceResult.outcome === 'accepted' ) {
                                this.showInstallThanks();
                            }
                        } );
                    } ]
                ],
                'board.create' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        this.showModelModal( 'board', null, 'create' );
                    } ]
                ],
                'settings.show' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        this.showModelModal( 'settings', this.#settings, 'edit' );
                    } ]
                ],
                'theme.show' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        this.showModelModal( 'theme', this.#theme, 'edit' );
                    } ]
                ],
                'storage.show' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        this.showStorageSetup();
                    } ]
                ],
                'about.show' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        this.showAbout();
                    } ]
                ],
                'privacy.show' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        this.showPrivacy();
                    } ]
                ],
                'app.share' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        this.shareApp();
                    } ]
                ],
            }, header, [], ( button ) => {
                button.disabled = false;
            } );

            // Bind footer actions and enable
            this.bindActions( {
                'about.show' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        this.showAbout();
                    } ]
                ],
                'privacy.show' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        this.showPrivacy();
                    } ]
                ],
            }, footer, [], ( button ) => {
                button.disabled = false;
            } );
        } );

        this.#bound = true;
    }

    /**
     * Initialize settings
     * @public
     * @param {boolean} create - Create new
     * @return {Promise<void>} - Returns nothing
     */
    async initSettings( create = true ) {
        if ( create ) {
            this.#settings = new Settings( null, this, this.debug );
        } else {
            const settings = await this.view.getModels( 'settings' );
            this.#settings = settings[ 0 ];
        }
        this.#settings.applySettings();
        this.#settings.addEventListener( 'model.saved', ( event ) => {
            event.detail.target.applySettings();
        } );
    }

    /**
     * Initialize theme
     * @public
     * @param {boolean} create - Create new
     * @return {Promise<void>} - Returns nothing
     */
    async initTheme( create = true ) {
        if ( create ) {
            this.#theme = new Theme( null, this, this.debug );
        } else {
            const theme = await this.view.getModels( 'theme' );
            this.#theme = theme[ 0 ];
        }
        this.#theme.applyTheme();
        this.#theme.addEventListener( 'model.saved', ( event ) => {
            event.detail.target.applyTheme();
        } );
    }

    /**
     * Run boot sequence
     * @public
     * @return {Promise<void>} - Returns nothing
     */
    async boot() {
        if ( this.#booted ) return;

        // Initialize services
        try {

            // Register js templates
            UiTemplateRenderer.debug = this.debug;
            const templates = {
                modal : UiModalTemplate,
                input : UiInputTemplate,
                fieldset : UiFieldsetTemplate,
                form : UiFormTemplate,
                board : BoardTemplate,
                group : GroupTemplate,
                item : ItemTemplate,
                itemNote : NoteTemplate,
                itemYoutube : YoutubeTemplate,
            };
            const entries = Object.entries( templates );
            for ( let i = 0; i < entries.length; i++ ) {
                const [ name, TemplateConstructor ] = entries[ i ];
                UiTemplateRenderer.require( name, new TemplateConstructor( null, this.debug ) );
            }

            // Initialize storage
            this.#storage = new Storage( this, this.debug );

            // Assign model references
            Model.app = this;
            Model.storage = this.storage;

            this.#view = new View( this, this.debug );

            // Load and initialize types and data
            await this.storage.load( [ Settings, Theme, Board, Group, Item ] );
        } catch ( e ) {
            throw new ApplicationException( 'Failed to boot application', e );
        }

        // Complete boot sequence
        this.#booted = true;
        this.dispatchEvent( 'app.ready' );
    }

    /**
     * Trigger app share
     * @public
     * @return {void}
     */
    shareApp() {
        if ( navigator.share ) {
            navigator.share( {
                title : 'nutZtash - The private todo and notes tool',
                text : 'The private todo and notes tool for every device',
                url : this.#url,
            } ).catch( () => {
                this.shareCopyUrl();
            } );
        } else {
            this.shareCopyUrl();
        }
    }

    /**
     * Share copy url fallback
     * @public
     * @return {Promise<void>} - Returns nothing
     */
    async shareCopyUrl() {
        const success = await copyToClipboard( this.#url, this.debug );
        const title = 'Copied to clipboard';
        const content = '<div class="ui-text"><p>The app url was copied to your clipboard.</p></div>';
        if ( success ) this.showAlertModal( title, content );
    }

    /**
     * Show welcome
     * @public
     * @return {void}
     */
    showWelcome() {
        const dom = UiTemplateRenderer.node( {
            template : 'modal',
            data : {
                id : 'modal-welcome',
                mode : 'alert',
                header : { title : document.querySelector( '#welcome .headline' ).innerHTML },
                focusable : false,
                content : document.querySelector( '#welcome .content' ).innerHTML,
            },
        } )[ 0 ];
        dom.addEventListener( 'modal.initialized', ( event ) => {
            event.detail.target.show();
        } );
        dom.addEventListener( 'modal.hidden', ( event ) => {
            event.detail.target.dom.remove();
            const buttons = this.selectAction( 'board.create', document.getElementById( 'header' ) );
            if ( buttons.length ) buttons[ 0 ].focus();
        } );
        document.body.appendChild( dom );
        UiModalComponent.make(
            dom,
            { mode : 'alert' },
            [ UiModalPluginAlert ],
            this,
            this.debug
        );
    }

    /**
     * Show thanks for install
     * @public
     * @return {void}
     */
    showInstallThanks() {
        const title = 'Application installed';
        const content = '<p>Thanks for installing the nutZtash application.</p>'
            + '<p>You may close this window now and open the app from your applications list.</p>'
            + '<p>Please report any issues or bugs to improve the expirence.</p>';
        this.showAlertModal( title, content );
    }

    /**
     * Show about app
     * @public
     * @return {void}
     */
    showAbout() {
        const title = document.querySelector( '#about .headline' ).innerHTML;
        const content = document.querySelector( '#about .content' ).innerHTML;
        this.showAlertModal( title, content );
    }

    /**
     * Show privacy notice
     * @public
     * @return {void}
     */
    showPrivacy() {
        const title = document.querySelector( '#privacy .headline' ).innerHTML;
        const content = document.querySelector( '#privacy .content' ).innerHTML;
        this.showAlertModal( title, content );
    }

    /**
     * Delete all data prompt
     * @public
     * @return {void}
     */
    deleteAllData() {
        const title = 'Delete all stored data';
        const content = 'Are you sure you wish to delete all stored data, including settings and theme?';
        this.showConfirmModal( title, content, async() => {
            await this.storage.clear();
            this.showAlertModal(
                'All data was deleted',
                'Application will reload and present itself in a blank state.', () => {
                    location.reload();
                } );
        } );
    }

    /**
     * Delete/reset settings
     * @public
     * @return {Promise<void>} - Returns nothing
     */
    async resetSettings() {
        this.#settings.label = 'current Settings';
        this.#settings.addEventListener( 'model.deleted', async() => {
            await this.initSettings();
            const title = 'Defaults restored';
            const content = '<div class="ui-text"><p>Default settings restored successfully.</p></div>';
            this.showAlertModal( title, content, () => {
                this.selectAction( 'settings.show', document.getElementById( 'header' ) )[ 0 ].click();
            } );
        } );
        await this.#view.deleteModel( this.#settings );
    }

    /**
     * Delete/reset theme
     * @public
     * @return {Promise<void>} - Returns nothing
     */
    async resetTheme() {
        this.#theme.label = 'current Theme';
        this.#theme.addEventListener( 'model.deleted', async() => {
            await this.initTheme();
            const title = 'Defaults restored';
            const content = '<div class="ui-text"><p>Default theme restored successfully.</p></div>';
            this.showAlertModal( title, content, () => {
                this.selectAction( 'theme.show', document.getElementById( 'header' ) )[ 0 ].click();
            } );
        } );
        await this.#view.deleteModel( this.#theme );
    }

    /**
     * Import theme
     * @public
     * @return {void}
     */
    importTheme() {
        const title = 'Import theme JSON';
        const content = [
            {
                template : 'input',
                data : {
                    type : 'textarea',
                    name : 'theme-import-json',
                    width : 100,
                },
            },
        ];
        this.showConfirmModal( title, content, async( event ) => {
            const input = event.detail.target.dom.querySelector( '[name="theme-import-json"]' ).value;
            let decoded;
            try {
                decoded = JSON.parse( input );
                if ( !isPojo( decoded ) ) throw new ApplicationException( 'Must be an object' );
            } catch ( e ) {
                const fail_title = 'Failed theme import';
                const fail_content = '<div class="ui-text"><p>Failed to import theme JSON.</p></div>';
                this.showAlertModal( fail_title, fail_content, () => {
                    this.importTheme();
                } );
                return;
            }
            this.#theme.assign( decoded );
            await this.#theme.save();
            this.#theme.applyTheme();
            this.selectAction( 'theme.show', document.getElementById( 'header' ) )[ 0 ].click();
        }, ( data ) => {
            data.data.icons = { confirm : 'action-import' };
            data.data.i18n = { confirm : 'Import' };
        } );
    }

    /**
     * Storage setup
     * @public
     * @return {Promise<void>} - Returns nothing
     */
    async showStorageSetup() {
        const title = 'Storage setup';
        const current_size = await this.storage.storageSize();
        const content = [
            '<div class="ui-text">' +
                `<p><strong>Local storage usage</strong> ${current_size} <strong>of</strong> ~5mib</p>` +
            '</div>',
            '<hr />',
            {
                template : 'fieldset',
                data : {},
                as : {
                    content : [
                        {
                            template : 'input',
                            data : {
                                label : { text : 'Storage driver' },
                                classes : [
                                    'ui-input--driver',
                                    'ui-input--wide',
                                    'ui-input--grow',
                                    'ui-input--grow-label',
                                    'ui-input--label-multiline',
                                    'ui-input--horizontal',
                                    'ui-input--spaced',
                                ],
                                name : 'driver',
                                type : 'select',
                                value : this.storage.local.get( 'driver' ),
                                options : [
                                    { label : 'Local storage', value : 'local' },
                                ],
                            },
                        },
                    ],
                },
            },
            '<hr />',
            '<nav class="ui-text-nav">',
            {
                template : 'input',
                data : {
                    label : { text : null },
                    classes : [
                        'ui-input--hidden',
                    ],
                    name : 'import',
                    type : 'file',
                },
            },
            '<button class="ui-button ui-button--wide ui-button--icon" data-action="storage.import" type="button">' +
                '<span class="ui-icon" data-icon="action-import"><span></span></span>' +
                '<span class="ui-button__label">Import from JSON file</span>' +
            '</button>',
            '<hr />',
            '<button class="ui-button ui-button--wide ui-button--icon" data-action="storage.export" type="button">' +
                '<span class="ui-icon" data-icon="action-export"><span></span></span>' +
                '<span class="ui-button__label">Export to JSON file</span>' +
            '</button>',
            '<hr />',
            '<button class="ui-button ui-button--wide ui-button--icon" data-action="storage.delete" type="button">' +
                '<span class="ui-icon" data-icon="action-delete"><span></span></span>' +
                '<span class="ui-button__label">Delete all data</span>' +
            '</button>',
            '</nav>',
        ];
        this.showConfirmModal( title, content, () => {
            if ( this.debug ) this.debug.warn( 'Only localStorage available currently' );
        }, ( data ) => {
            data.data.icons = { confirm : 'save' };
            data.data.i18n = { confirm : 'Save' };
        }, ( dom ) => {
            const input_import = dom.querySelector( '[name="import"]' );
            const reader = new FileReader();
            reader.addEventListener( 'load', () => {
                this.view.importJSONString( reader.result );
            } );
            input_import.addEventListener( 'change', () => {
                reader.readAsText( input_import.files[ 0 ] );
            } );
            this.bindActions( {
                'storage.import' : [
                    [ 'click', ( event ) => {
                        event.preventDefault();
                        input_import.click();
                    } ],
                ],
                'storage.export' : [
                    [ 'click', async( event ) => {
                        event.preventDefault();
                        const blob = await this.view.export( true );
                        saveBlobAs( blob, 'nutZtash.json' );
                    } ],
                ],
                'storage.delete' : [
                    [ 'click', async( event ) => {
                        event.preventDefault();
                        this.deleteAllData();
                    } ],
                ],
            }, dom );
        } );
    }

    /**
     * Show input errors in context
     * @public
     * @param {HTMLElement} dom - Context
     * @param {Object} errors - Errors object
     * @return {void}
     */
    showInputErrors( dom, errors ) {
        const entries = Object.entries( errors );
        let first = null;
        for ( let i = 0; i < entries.length; i++ ) {
            const [ field, errs ] = entries[ i ];
            const input = dom.querySelector( `[name="${field}"]` );
            if ( !input ) {
                if ( this.debug ) this.debug.warn( this.constructor.name + `.showInputErrors(${field}) Unknown field` );
                continue;
            }
            if ( !first ) first = input;
            const component = input.closest( '.ui-input' );
            const err_dom = component.querySelector( '.ui-input__error' );
            err_dom.innerHTML = errs instanceof Array ? errs.join( '<br />' ) : errs;
            component.classList.add( 'ui-input--error' );
            component.classList.add( 'ui-input--error-visible' );
        }
        if ( first ) first.focus();
    }

    /**
     * Show model create/edit modal
     * @public
     * @param {string} type - Model type
     * @param {null|Model} model - Model instance
     * @param {('create'|'edit')} mode - Mode
     * @param {null|View|Model} parent - Parent instance
     * @return {void}
     */
    showModelModal( type, model = null, mode = 'create', parent = null ) {
        const Constructor = this.storage.models[ type ];
        const id = `modal-model-${mode}`;
        if ( document.getElementById( id ) ) return;
        if ( mode === 'edit' && !( model instanceof Constructor ) ) {
            throw new ApplicationException( 'Invalid model relation' );
        }
        const modes = {
            create : 'confirm',
            edit : 'confirm',
        };
        const titles = {
            create : `<span class="ui-icon" data-icon="action-create"><span></span></span><h3 class="ui-modal__dialog-title">Create ${ucfirst( Constructor.modelType )}`,
            edit : `<span class="ui-icon" data-icon="action-edit"><span></span></span><h3 class="ui-modal__dialog-title">Edit ${ucfirst( Constructor.modelType )}`,
        };
        if ( model && model.label ) {
            titles.edit = `${titles.edit} <q>${model.label}</q>`;
            titles.view = `${titles.view} <q>${model.label}</q>`;
        }
        const title_in = parent && parent.label ? ` in ${ucfirst( parent.type )} <q>${parent.label}</q>` : '';
        const contents = {
            create : () => { return Constructor.form( parent ? { rel : parent.id } : null ); },
            edit : () => { return Constructor.form( model.data ); },
        };
        const render = {
            template : 'modal',
            data : {
                id : id,
                classes : [ `ui-modal--${type}` ],
                mode : modes[ mode ],
                focusable : false,
                header : { custom : titles[ mode ] + title_in + '</h3>', controls : null },
                icons : { confirm : 'save' },
                i18n : { confirm : 'Save' },
            },
            as : {
                content : contents[ mode ](),
            }
        };
        if ( Constructor.modalRender ) Constructor.modalRender( render );
        const dom = UiTemplateRenderer.node( render )[ 0 ];
        dom.addEventListener( 'modal.confirm.confirm', ( event ) => {
            const data = Constructor.getFormData( dom );
            const result = Constructor.validate( data );
            if ( result.valid !== true ) {
                this.showInputErrors( dom, result.errors );
                event.preventDefault();
            }
        } );
        dom.addEventListener( 'modal.initialized', ( event ) => {
            const modal = event.detail.target;
            Constructor.bindForm( dom, modal );
            Constructor.bind( dom, { type, model, mode, parent, modal } );
            event.detail.target.open = true;
        } );
        dom.addEventListener( 'modal.hidden', ( event ) => {
            const data = Constructor.getFormData( dom );
            event.detail.target.dom.remove();
            if ( event.detail.target.confirmed ) {
                if ( mode === 'create' && !model ) {
                    this.#view.createModel( Constructor, data, parent );
                } else if ( mode === 'edit' && model ) {
                    this.#view.updateModel( model, data );
                }
            }
        } );
        document.body.appendChild( dom );
        UiModalComponent.make(
            dom,
            {
                mode : modes[ mode ],
                easyHide : this.#settings.easyHideModals,
                focusResetOnHidden : false,
                focusLast : [],
            },
            [ UiModalPluginAlert, UiModalPluginConfirm ],
            this,
            this.debug
        );
    }

    /**
     * Show confirm modal
     * @public
     * @param {string} title - Title
     * @param {*} content - Content
     * @param {null|Function} confirmed - Confirmed callback
     * @param {null|Function} render - Render callback
     * @param {null|Function} bind - Bind callback
     * @return {void}
     */
    showConfirmModal( title, content, confirmed, render = null, bind = null ) {
        if ( document.getElementById( 'modal-confirm' ) ) return;
        const data = {
            template : 'modal',
            data : {
                id : `modal-confirm-${strand()}`,
                mode : 'confirm',
                focusable : false,
                header : { title },
            },
            as : { content }
        };
        if ( render ) render( data );
        const dom = UiTemplateRenderer.node( data )[ 0 ];
        if ( bind ) bind( dom );
        dom.addEventListener( 'modal.initialized', ( event ) => {
            event.detail.target.open = true;
        } );
        dom.addEventListener( 'modal.hidden', ( event ) => {
            event.detail.target.dom.remove();
            if ( event.detail.target.confirmed ) confirmed( event );
        } );
        document.body.appendChild( dom );
        return UiModalComponent.make(
            dom,
            { mode : 'confirm', easyHide : this.#settings.easyHideModals },
            [ UiModalPluginConfirm ],
            this,
            this.debug
        );
    }

    /**
     * Show alert modal
     * @public
     * @param {string} title - Title
     * @param {*} content - Content
     * @param {null|Function} closed - CLosed callback
     * @param {null|Function} render - Render callback
     * @param {null|Function} bind - Bind callback
     * @return {void}
     */
    showAlertModal( title, content, closed = null, render = null, bind = null ) {
        if ( document.getElementById( 'modal-alert' ) ) return;
        const data = {
            template : 'modal',
            data : {
                id : 'modal-alert',
                mode : 'alert',
                focusable : false,
                header : { title },
            },
            as : { content }
        };
        if ( render ) render( data );
        const dom = UiTemplateRenderer.node( data )[ 0 ];
        if ( bind ) bind( dom );
        dom.addEventListener( 'modal.initialized', ( event ) => {
            event.detail.target.open = true;
        } );
        dom.addEventListener( 'modal.hidden', ( event ) => {
            event.detail.target.dom.remove();
            if ( closed ) closed( event );
        } );
        document.body.appendChild( dom );
        UiModalComponent.make(
            dom,
            { mode : 'alert', easyHide : this.#settings.easyHideModals },
            [ UiModalPluginAlert ],
            this,
            this.debug
        );
    }

    /**
     * Select action buttons
     * @param {string} action - Action name
     * @param {HTMLElement} dom - Dom context
     * @return {NodeList} - Selected action buttons
     */
    selectAction( action, dom ) {
        return dom.querySelectorAll( `[data-action="${action}"]` );
    }

    /**
     * Bind action handlers
     * @param {Object} handlers - Actions object
     * @param {HTMLElement} dom - Dom context
     * @param {Object} params - Handler arguments
     * @param {null|Function} each - Run for each action element
     * @return {NodeList} - Selected action buttons
     */
    bindActions( handlers, dom, params = {}, each = null ) {
        if ( !isPojo( handlers ) ) throw new ApplicationException( 'Invalid action handlers definition' );
        const buttons = dom.querySelectorAll( '[data-action]' );
        for ( let i = 0; i < buttons.length; i++ ) {
            const button = buttons[ i ];
            const action = button.getAttribute( 'data-action' );
            if ( handlers[ action ] ) {
                params.button = button;
                params.action = action;
                const wrapped = this.wrapActionHandlers( handlers[ action ], params );
                bindNodeList( [ button ], wrapped );
            } else if ( this.debug ) {
                this.debug.warn( this.constructor.name + `.bindActions(${action}) action not defined` );
            }
            if ( each ) each( button, action );
        }
        return buttons;
    }

    /**
     * Wrap action handlers for params
     * @param {Function[]} handlers - Action handlers
     * @param {Object} params - Params object
     * @return {Function[]} - Wrapped handlers
     */
    wrapActionHandlers( handlers, params = {} ) {
        const wrapped = [];
        for ( let i = 0; i < handlers.length; i++ ) {
            const handler = handlers[ i ].slice();
            const original_handler = handler[ 1 ];
            handler[ 1 ] = ( event ) => {
                original_handler( event, params );
            };
            wrapped.push( handler );
        }
        return wrapped;
    }
}
