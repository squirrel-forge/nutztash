/**
 * Requires
 */
import { UiTemplate } from '@squirrel-forge/ui-core';
import { escapeHTML, Exception } from '@squirrel-forge/ui-util';

/**
 * Group template exception
 * @class
 * @extends Exception
 */
class GroupTemplateException extends Exception {}

/**
 * Group template data
 * @typedef {Object} GroupTemplateData
 * @property {string} id - Object unique dom id
 * @property {string} rel - Object parent id
 * @property {string} label - Object display label
 * @property {null|string} icon - Object display icon
 * @property {boolean} marked - Object display marked state
 */

/**
 * Group template
 * @class
 * @extends UiTemplate
 */
export class GroupTemplate extends UiTemplate {

    /**
     * Default template data
     * @protected
     * @property
     * @type {GroupTemplateData}
     */
    _defaults = {
        id : null,
        rel : null,
        icon : null,
        label : null,
        marked : true,
    };

    /**
     * Template validate method
     * @protected
     * @param {GroupTemplateData} data - Template data
     * @throws GroupTemplateException
     * @return {void}
     */
    _validate( data ) {
        if ( typeof data.id !== 'string' || !data.id.length ) {
            throw new GroupTemplateException( 'Requires a valid id' );
        }
        if ( typeof data.rel !== 'string' || !data.rel.length ) {
            throw new GroupTemplateException( 'Requires a valid relation' );
        }
        if ( typeof data.label !== 'string' || !data.label.length ) {
            throw new GroupTemplateException( 'Requires a valid label' );
        }
    }

    /**
     * Render template
     * @protected
     * @param {GroupTemplateData} data - Object template data
     * @return {string} - Rendered template string
     */
    _render( data ) {

        const classes = [ 'group' ];
        if ( data.marked ) classes.push( 'group--marked' );

        // Component markup
        return `<section id="${data.id}" data-type="group" class="${classes.join( ' ' )}">` +
            '<nav class="group__nav ui-wrap ui-wrap--object-nav">' +
                '<div data-nav="options">' +
                    '<div data-nav="nav">' +
                        '<button class="ui-button ui-button--icon ui-tooltip" data-tip="br" data-nav="show" type="button">' +
                            '<span class="ui-icon" data-model-update="attr:iconType:data-icon"' +
                                ` data-icon="${data.icon && data.icon.length ? 'font' : 'menu'}">` +
                                `<span data-model-update="text:icon">${data.icon ?? ''}</span>` +
                            '</span>' +
                            '<span class="ui-button__label ui-tooltip__tip">Show options</span>' +
                        '</button>' +
                        '<div data-nav="drop" tabindex="0">' +
                            '<div class="ui-wrap ui-wrap--options-drop">' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="br" data-action="group.unmarked" type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">Show all items</span>' +
                                    '<span class="ui-icon" data-icon="check"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="br" data-action="group.marked" type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">Show only unmarked items</span>' +
                                    '<span class="ui-icon" data-icon="close-small"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="br" data-action="group.up" data-keep type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">Move up</span>' +
                                    '<span class="ui-icon ui-icon--rotate-270" data-icon="arrow-simple"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="br" data-action="group.down" data-keep type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">Move down</span>' +
                                    '<span class="ui-icon ui-icon--rotate-90" data-icon="arrow-simple"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="br" data-action="group.edit" type="button">' +
                                    '<span class="ui-icon" data-icon="action-edit"><span></span></span>' +
                                    '<span class="ui-button__label ui-tooltip__tip">Edit</span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="br" data-action="group.delete" type="button">' +
                                    '<span class="ui-icon" data-icon="action-delete"><span></span></span>' +
                                    '<span class="ui-button__label ui-tooltip__tip">Delete</span>' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="br" data-nav="hide" type="button">' +
                        '<span class="ui-icon" data-icon="close"><span></span></span>' +
                        '<span class="ui-button__label ui-tooltip__tip">Hide options</span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="br" data-action="group.up" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Move up</span>' +
                        '<span class="ui-icon ui-icon--rotate-270" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="br" data-action="group.down" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Move down</span>' +
                        '<span class="ui-icon ui-icon--rotate-90" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                '</div>' +
                `<label class="group__label" title="${data.id}" data-action="group.toggle"><strong data-model-update="text:label">${escapeHTML( data.label )}</strong></label>` +
                '<div data-nav="interactive">' +
                    '<button class="ui-button ui-button--icon ui-tooltip ui-interactive"' +
                        ' data-tip="bl" data-action="group.minimize" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Minimize</span>' +
                        '<span class="ui-icon" data-icon="minimize"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip ui-interactive"' +
                        ' data-tip="bl" data-action="group.maximize" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Maximize</span>' +
                        '<span class="ui-icon" data-icon="fullscreen"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="bl" data-action="group.open" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Open</span>' +
                        '<span class="ui-icon  ui-icon--rotate-90" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="bl" data-action="group.close" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Close</span>' +
                        '<span class="ui-icon" data-icon="close-small"><span></span></span>' +
                    '</button>' +
                '</div>' +
            '</nav>' +
            '<div class="group__content">' +
                '<div class="group__scroll" data-scroller>' +
                    '<div class="group__children" data-children></div>' +
                '</div>' +
            '</div>' +
            '<nav class="group__nav ui-wrap ui-wrap--object-nav">' +
                '<div class="ui-button ui-button--icon ui-button--label-hidden ui-button--static ui-tooltip" data-tip="tr">' +
                    '<span class="ui-icon" data-icon="stats"><span></span></span>' +
                    '<span class="ui-button__label ui-tooltip__tip">Group statistics</span>' +
                '</div>' +
                '<div class="group__stats">' +
                    '<em>' +
                        '<span data-model-update="attr:stats.item:data-stats-count" data-stats-count="0">' +
                            '<strong data-model-update="text:stats.item">0</strong>' +
                            ' item<span>s</span>' +
                        '</span>' +
                        ' <span data-model-update="attr:stats.itemMarked:data-stats-count" data-stats-count="0">' +
                            '<strong data-model-update="text:stats.itemMarked">0</strong>' +
                            ' marked' +
                        ' </span>' +
                        '<span data-model-update="attr:stats.itemUnmarked:data-stats-count" data-stats-count="0">' +
                            '<strong data-model-update="text:stats.itemUnmarked">0</strong>' +
                            ' unmarked' +
                        '</span>' +
                    '</em>' +
                '</div>' +
                '<div data-nav="interactive">' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="tl" data-action="item.create" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Add item</span>' +
                        '<span class="ui-icon" data-icon="action-create"><span></span></span>' +
                    '</button>' +
                '</div>' +
            '</nav>' +
        '</section>';
    }
}
