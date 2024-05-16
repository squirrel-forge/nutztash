/**
 * Requires
 */
import { docReady } from '@squirrel-forge/ui-util';
import { Application } from './Classes/Application';
import { initLayoutHelpers, readyLayoutHelpers } from './Helpers/layoutHelpers';

/**
 * DEBUG MODE
 * @private
 * @type {null|Console}
 */
const DEBUG_MODE = location.hash === '#debug' ? console : null;

/**
 * Allow display of custom install-button
 * @url https://web.dev/articles/customize-install
 */
window.addEventListener( 'beforeinstallprompt', ( event ) => {
    event.preventDefault();
    window._deferredInstallPrompt = event;
    const install_button = document.querySelector( '#header [data-action="app.install"]' );
    if ( install_button ) install_button.style.display = '';
} );

/**
 * Initialize helpers
 * @type {Scroller}
 */
const scr = initLayoutHelpers( DEBUG_MODE );

/**
 * Initialize application
 * @private
 * @type {Application}
 */
const app = new Application( '1.0.1', 'https://squirrel-forge.github.io/nutztash/', scr, DEBUG_MODE );

docReady( () => {
    readyLayoutHelpers();
    app.boot()?.catch( ( e ) => {
        window.console.error( 'Please report the following bug to: https://github.com/squirrel-forge/nutztash/issues' );
        window.console.error( e );
        alert( `You have encountered a bug "${e.toString()}"` );
    } );
} );
