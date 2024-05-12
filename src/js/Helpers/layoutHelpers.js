/**
 * Requires
 */
import { bindNodeList, debounce, Scroller } from '@squirrel-forge/ui-util';
import { setScrollBarWidth } from './setScrollBarWidth';

/**
 * Initialize layout helpers and bind events
 * @param {null|Console} debug - Debugger instance
 * @return {Scroller} - Scroll helper
 */
export function initLayoutHelpers( debug ) {

    // IOS/SAFARI is too stupid to focus a button on click
    bindNodeList( document.querySelectorAll( '[data-nav="show"], [data-nav="hide"]' ), [
        [ 'click', function( event ) {
            event.preventDefault();
            this.focus();
        } ]
    ] );

    // Setup scroll helper
    const scr = new Scroller( null, debug );
    scr.config.offset = () => {
        return document.getElementById( 'header' )?.getBoundingClientRect().height ?? 0;
    };

    // Resize helpers for global css variables
    window.addEventListener( 'resize', debounce( () => {
        setScrollBarWidth();
    } ) );
    return scr;
}

/**
 * Run layout helpers update
 * @return {void}
 */
export function readyLayoutHelpers() {
    setScrollBarWidth();
}
