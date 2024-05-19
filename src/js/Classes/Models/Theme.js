/**
 * Requires
 */
import { Model } from '../Model';
import { copyToClipboard, hex2rgb, round, strCamel2dash } from '@squirrel-forge/ui-util';
import * as themeClassic from '../../Themes/classic.json';

/**
 * Prebuilt themes
 */
const AVAILABLE_THEMES = {
    classic : themeClassic,
};

/**
 * Bind model
 * @param {Object} params - Bind params
 * @return {void}
 */
function _bind_theme_dom( params ) {

    // Reapply current theme when closed with cancel
    params.dom.addEventListener( 'modal.hidden', ( event ) => {
        if ( !event.detail.target.confirmed ) {
            params.model.constructor.app.theme.applyTheme();
        }
    } );

    // Bind color selection
    const colors = params.dom.querySelectorAll( [
        '[type="color"]',
        '[type="range"]',
    ].join( ', ' ) );
    const opacity = 'Opacity';
    for ( let i = 0; i < colors.length; i++ ) {
        const input = colors[ i ];
        input.addEventListener( 'change', () => {
            let prop = input.getAttribute( 'name' );
            if ( prop.substring( prop.length - opacity.length ) === opacity ) prop = prop.substring( 0, prop.length - opacity.length );
            const color_input = params.dom.querySelector( `[name="${prop}"]` );
            const opacity_input = params.dom.querySelector( `[name="${prop}${opacity}"]` );
            const color = hex2rgb( color_input.value, round( opacity_input.value / 100 ) );
            document.documentElement.style.setProperty( `--${strCamel2dash( prop )}`, color );
        } );
    }

    // Bind theme select
    const select_theme = params.dom.querySelector( '[name="theme"]' );

    /**
     * Update theme form
     * @param {string} theme - Theme name
     * @param {boolean} init - Init call
     * @return {void}
     */
    const update_theme_form = ( theme, init = false ) => {
        const is_custom = theme === 'custom';
        const inputs = params.dom.querySelectorAll( '.ui-input--color, .ui-input--range' );
        for ( let i = 0; i < inputs.length; i++ ) {
            inputs[ i ].style.display = is_custom ? '' : 'none';
            if ( !init && !is_custom ) {
                const field = inputs[ i ].querySelector( 'input' );
                if ( AVAILABLE_THEMES[ theme ] && typeof AVAILABLE_THEMES[ theme ][ field.name ] !== 'undefined' ) {
                    field.value = AVAILABLE_THEMES[ theme ][ field.name ];
                    field.dispatchEvent( new CustomEvent( 'change' ) );
                }
            }
        }
    };
    select_theme.addEventListener( 'change', () => {
        update_theme_form( select_theme.value );
    } );
    update_theme_form( select_theme.value, true );
}

const _MODEL_ACTIONS = {
    'theme.reset' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.resetTheme();
        } ]
    ],
    'theme.apply' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.importTheme();
        } ]
    ],
    'theme.copy' : [
        [ 'click', async( event, params ) => {
            event.preventDefault();
            const data = params.model.data;
            delete data.id;
            const success = await copyToClipboard( JSON.stringify( data ) );
            const title = 'Copied to clipboard';
            const content = '<div class="ui-text"><p>The theme JSON was copied to your clipboard,<br />' +
                'Press <q>ctrl/cmd + v</q> to paste into any text input or editor.</p></div>';
            if ( success ) params.model.constructor.app.showAlertModal( title, content );
        } ]
    ],
};

/**
 * Theme
 * @class
 * @extends Model
 */
export class Theme extends Model {

    static modelType = 'theme';

    static modelFields = {
        theme : {
            label : { text : 'Select theme' },
            type : 'select',
            value : 'classic',
            options : [ 'custom', 'classic' ],
        },
        modalColorHeaderText : {
            type : 'color',
            value : '#ffffff',
        },
        modalColorHeaderTextOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        modalColorHeaderBackground : {
            type : 'color',
            value : '#00008b',
        },
        modalColorHeaderBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        modalColorFooterText : {
            type : 'color',
            value : '#ffffff',
        },
        modalColorFooterTextOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        modalColorFooterBackground : {
            type : 'color',
            value : '#00008b',
        },
        modalColorFooterBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        modalColorText : {
            type : 'color',
            value : '#00008b',
        },
        modalColorTextOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        modalColorBackground : {
            type : 'color',
            value : '#ffffff',
        },
        modalColorBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        modalColorContentBackground : {
            type : 'color',
            value : '#ADD8E6',
        },
        modalColorContentBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        modalColorBackdrop : {
            type : 'color',
            value : '#00008b',
        },
        modalColorBackdropOpacity : {
            type : 'range',
            min : 0,
            value : 80,
            max : 100,
            step : 1,
        },
        modalColorShadow : {
            type : 'color',
            value : '#000000',
        },
        modalColorShadowOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        buttonColorBackgroundInteractive : {
            type : 'color',
            value : '#ffffff',
        },
        buttonColorBackgroundInteractiveOpacity : {
            type : 'range',
            min : 0,
            value : 25,
            max : 100,
            step : 1,
        },
        inputColorBackground : {
            type : 'color',
            value : '#ffffff',
        },
        inputColorBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        errorColorText : {
            type : 'color',
            value : '#ffffff',
        },
        errorColorTextOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        errorColorBackground : {
            type : 'color',
            value : '#B22222',
        },
        errorColorBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        errorColorShadow : {
            type : 'color',
            value : '#000000',
        },
        errorColorShadowOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        tooltipColorText : {
            type : 'color',
            value : '#000000',
        },
        tooltipColorTextOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        tooltipColorBackground : {
            type : 'color',
            value : '#FFD700',
        },
        tooltipColorBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        tooltipColorShadow : {
            type : 'color',
            value : '#000000',
        },
        tooltipColorShadowOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        viewColorBackground : {
            type : 'color',
            value : '#F5F5F5',
        },
        viewColorBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        contentColorSpacer : {
            type : 'color',
            value : '#FFFFFF',
        },
        contentColorSpacerOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        boardColorBackground : {
            type : 'color',
            value : '#000000',
        },
        boardColorBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 10,
            max : 100,
            step : 1,
        },
        boardColorNavText : {
            type : 'color',
            value : '#ffffff',
        },
        boardColorNavTextOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        boardColorNavBackground : {
            type : 'color',
            value : '#00008b',
        },
        boardColorNavBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        groupColorBackground : {
            type : 'color',
            value : '#ADD8E6',
        },
        groupColorBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        groupColorNavText : {
            type : 'color',
            value : '#ffffff',
        },
        groupColorNavTextOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        groupColorNavBackground : {
            type : 'color',
            value : '#0000CD',
        },
        groupColorNavBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        groupColorNavBackgroundMarked : {
            type : 'color',
            value : '#8B0000',
        },
        groupColorNavBackgroundMarkedOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        groupColorNavBackgroundCompleted : {
            type : 'color',
            value : '#006400',
        },
        groupColorNavBackgroundCompletedOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        itemColorText : {
            type : 'color',
            value : '#000000',
        },
        itemColorTextOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        itemColorBackground : {
            type : 'color',
            value : '#F5F5F5',
        },
        itemColorBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        itemColorNavText : {
            type : 'color',
            value : '#ffffff',
        },
        itemColorNavTextOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        itemColorNavBackground : {
            type : 'color',
            value : '#B22222',
        },
        itemColorNavBackgroundOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
        itemColorNavBackgroundMarked : {
            type : 'color',
            value : '#228B22',
        },
        itemColorNavBackgroundMarkedOpacity : {
            type : 'range',
            min : 0,
            value : 100,
            max : 100,
            step : 1,
        },
    };

    static modelActions = _MODEL_ACTIONS;

    static modelBinds = [ _bind_theme_dom ];

    /**
     * Model modal render additions
     * @param {Object} modal - Modal render data
     * @return {void}
     */
    static modalRender( modal ) {

        // Import/export
        modal.as[ 'header.controls.custom' ] = [
            '<button class="ui-button ui-button--icon ui-button--hide-label-m"' +
                ' data-action="theme.apply" data-modal="ctrl:close" data-focus="no-auto" type="button">' +
                '<span class="ui-icon" data-icon="action-import"><span></span></span>' +
                '<span class="ui-button__label">Import</span>' +
            '</button>',
            '<button class="ui-button ui-button--icon ui-button--hide-label-m"' +
                ' data-action="theme.copy" data-focus="no-auto" type="button">' +
                '<span class="ui-icon" data-icon="action-export"><span></span></span>' +
                '<span class="ui-button__label">Export</span>' +
            '</button>',
        ];

        // Reset button
        modal.as[ 'footer.controls.before' ] = [
            '<button class="ui-button ui-button--icon ui-button--hide-label-m"' +
                ' data-action="theme.reset" data-modal="ctrl:close" type="button">' +
                '<span class="ui-icon" data-icon="update"><span></span></span>' +
                '<span class="ui-button__label">Reset</span>' +
            '</button>',
        ];
    }

    /**
     * Apply theme vars
     * @return {void}
     */
    applyTheme() {

        const props = [
            'modalColorHeaderText',
            'modalColorHeaderBackground',
            'modalColorFooterText',
            'modalColorFooterBackground',
            'modalColorText',
            'modalColorBackground',
            'modalColorContentBackground',
            'modalColorBackdrop',
            'modalColorShadow',
            'buttonColorBackgroundInteractive',
            'inputColorBackground',
            'errorColorText',
            'errorColorBackground',
            'errorColorShadow',
            'tooltipColorText',
            'tooltipColorBackground',
            'tooltipColorShadow',
            'viewColorBackground',
            'contentColorSpacer',
            'boardColorBackground',
            'boardColorNavText',
            'boardColorNavBackground',
            'groupColorBackground',
            'groupColorNavText',
            'groupColorNavBackground',
            'groupColorNavBackgroundMarked',
            'groupColorNavBackgroundCompleted',
            'itemColorText',
            'itemColorBackground',
            'itemColorNavText',
            'itemColorNavBackground',
            'itemColorNavBackgroundMarked',
        ];
        for ( let i = 0; i < props.length; i++ ) {
            const prop = props[ i ];
            const color = hex2rgb( this._get( prop ), round( this._get( `${prop}Opacity` ) / 100 ) );
            document.documentElement.style.setProperty( `--${strCamel2dash( prop )}`, color );
        }
    }
}
