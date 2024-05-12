/**
 * Requires
 */
import { getScrollbarWidth } from '@squirrel-forge/ui-util';

/**
 * Set current device scrollbar width
 * @return {void}
 */
export function setScrollBarWidth() {
    document.documentElement.style.setProperty( '--scrollbar-width', getScrollbarWidth() + 'px' );
}
