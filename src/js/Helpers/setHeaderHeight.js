/**
 * Set current device scrollbar width
 * @return {void}
 */
export function setHeaderHeight() {
    const height = document.getElementById( 'header' ).getBoundingClientRect().height;
    document.documentElement.style.setProperty( '--header-height', height + 'px' );
}
