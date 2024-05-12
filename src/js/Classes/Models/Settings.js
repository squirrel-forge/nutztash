/**
 * Requires
 */
import { Model } from '../Model';
import { strCamel2dash } from '@squirrel-forge/ui-util';
import { Item } from './Item';

/**
 * Bind model
 * @param {Object} params - Bind params
 * @return {void}
 */
function _bind_settings_dom( params ) {

    // Reapply current settings when closed with cancel
    params.dom.addEventListener( 'modal.hidden', ( event ) => {
        if ( !event.detail.target.confirmed ) {
            params.model.constructor.app.settings.applySettings();
        }
    } );

    const interfaceSize = params.dom.querySelector( '[name="interfaceSize"]' );
    interfaceSize.addEventListener( 'change', () => {
        document.documentElement.setAttribute( 'data-interface-size', interfaceSize.value );
    } );

    const showOrderControls = params.dom.querySelector( '[name="showOrderControls"]' );
    showOrderControls.addEventListener( 'change', () => {
        params.model.constructor.app.view.dom
            .classList[ showOrderControls.checked ? 'add' : 'remove' ]( 'view--show-order-controls' );
    } );

    const exclusiveMaximize = params.dom.querySelector( '[name="exclusiveMaximize"]' );
    exclusiveMaximize.addEventListener( 'change', () => {
        params.model.constructor.app.view
            .dom[ exclusiveMaximize.checked ? 'setAttribute' : 'removeAttribute' ]( 'data-exclusive-maximize', 'true' );
    } );

    const showNoteAs = params.dom.querySelector( '[name="itemShowNote"]' );
    showNoteAs.addEventListener( 'change', () => {
        params.model.constructor.app.view.dom
            .setAttribute( 'data-note-style', showNoteAs.value );
    } );

    const showYoutubeAs = params.dom.querySelector( '[name="itemShowYoutube"]' );
    showYoutubeAs.addEventListener( 'change', () => {
        params.model.constructor.app.view.dom
            .setAttribute( 'data-youtube-style', showYoutubeAs.value );
    } );

    const columns = params.dom.querySelectorAll( [
        '[name="boardColumns"]',
        '[name="groupColumns"]',
        '[name="groupColumnsMax"]',
        '[name="itemColumns"]',
        '[name="itemColumnsMax"]',
        '[name="itemColumnsMaxMax"]',
    ].join( ', ' ) );
    for ( let i = 0; i < columns.length; i++ ) {
        const input = columns[ i ];
        input.addEventListener( 'change', () => {
            const prop = strCamel2dash( input.getAttribute( 'name' ) );
            document.documentElement.style.setProperty( `--${prop}`, parseInt( input.value ) );
        } );
    }
}

const _MODEL_ACTIONS = {
    'settings.reset' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.resetSettings();
        } ]
    ],
};

/**
 * Settings
 * @class
 * @extends Model
 */
export class Settings extends Model {

    static modelType = 'settings';

    static modelFields = {
        interfaceSize : {
            label : { text : 'Interface size' },
            type : 'select',
            value : window.innerWidth < 768 ? 'mobile' : 'default',
            options : [ 'tiny', 'small', 'default', 'mobile', 'medium', 'large' ],
        },
        showOrderControls : {
            label : { text : 'Always show controls to change the order' },
            type : 'checkbox',
            value : false,
        },
        boardColumns : {
            label : { text : 'Board columns (not maximized)' },
            type : 'number',
            min : 1,
            value : window.innerWidth < 992 ? 1 : 2,
        },
        groupColumns : {
            label : { text : 'Group columns (Board not maximized)' },
            type : 'number',
            min : 1,
            value : window.innerWidth < 992 ? 1 : 2,
        },
        groupColumnsMax : {
            label : { text : 'Group columns (Board maximized)' },
            type : 'number',
            min : 1,
            value : window.innerWidth < 992 ? 1 : 4,
        },
        itemColumns : {
            label : { text : 'Item columns (Board + Group not maximized)' },
            type : 'number',
            min : 1,
            value : 1,
        },
        itemColumnsMax : {
            label : { text : 'Item columns (Board not, Group maximized)' },
            type : 'number',
            min : 1,
            value : window.innerWidth < 992 ? 1 : 2,
        },
        itemColumnsMaxMax : {
            label : { text : 'Item columns (Board + Group maximized)' },
            type : 'number',
            min : 1,
            value : window.innerWidth < 992 ? 1 : 4,
        },
        defaultVariant : {
            label : { text : 'Default variant when creating a new item' },
            type : 'select',
            value : 'label',
            options : [ 'label', 'note', 'url', 'youtube' ],
        },
        exclusiveMaximize : {
            label : { text : 'Show only maximized board or group' },
            type : 'checkbox',
            value : true,
        },
        easyHideModals : {
            label : { text : 'Allow cancelling popups by escape key or background click' },
            type : 'checkbox',
            value : false,
        },
        itemShowNote : {
            label : { text : 'Show note content as' },
            type : 'select',
            value : 'content',
            options : [ 'content', 'modal', 'both' ],
        },
        itemShowYoutube : {
            label : { text : 'Show youtube player as' },
            type : 'select',
            value : 'modal',
            options : [ 'content', 'modal', 'both' ],
        },
        modalYoutubeWidth : {
            label : { text : 'Youtube player popup size' },
            prefix : '25%',
            suffix : '100%',
            type : 'range',
            min : 25,
            value : window.innerWidth < 992 ? 100 : 65,
            max : 100,
            step : 1,
        },
    };

    static modelActions = _MODEL_ACTIONS;

    static modelBinds = [ _bind_settings_dom ];

    /**
     * Model modal render additions
     * @param {Object} modal - Modal render data
     * @return {void}
     */
    static modalRender( modal ) {

        // Reset button
        modal.as[ 'footer.controls.before' ] = '<button class="ui-button ui-button--icon ui-button--hide-label-m"' +
            ' data-action="settings.reset" data-modal="ctrl:close" type="button">' +
            '<span class="ui-icon" data-icon="update"><span></span></span>' +
            '<span class="ui-button__label">Reset</span>' +
        '</button>';
    }

    /**
     * Apply settings
     * @return {void}
     */
    applySettings() {

        document.documentElement.setAttribute( 'data-interface-size', this.interfaceSize );

        this.constructor.app.view.dom
            .classList[ this.showOrderControls ? 'add' : 'remove' ]( 'view--show-order-controls' );

        this.constructor.app.view
            .dom[ this.exclusiveMaximize ? 'setAttribute' : 'removeAttribute' ]( 'data-exclusive-maximize', 'true' );

        this.constructor.app.view.dom
            .setAttribute( 'data-note-style', this.itemShowNote );

        this.constructor.app.view.dom
            .setAttribute( 'data-youtube-style', this.itemShowYoutube );

        document.documentElement.style.setProperty( '--modal-youtube-width', `${this.modalYoutubeWidth}%` );

        const props = [
            'boardColumns',
            'groupColumns',
            'groupColumnsMax',
            'itemColumns',
            'itemColumnsMax',
            'itemColumnsMaxMax',
        ];
        for ( let i = 0; i < props.length; i++ ) {
            const field = props[ i ];
            const prop = strCamel2dash( field );
            document.documentElement.style.setProperty( `--${prop}`, this._get( field ) );
        }
        Item.modelFields.variant.value = this.defaultVariant;
    }
}
