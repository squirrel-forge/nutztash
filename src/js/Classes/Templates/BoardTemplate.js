/**
 * Requires
 */
import { UiTemplate } from '@squirrel-forge/ui-core';
import { escapeHTML, Exception } from '@squirrel-forge/ui-util';

/**
 * Board template exception
 * @class
 * @extends Exception
 */
class BoardTemplateException extends Exception {}

/**
 * Board template data
 * @typedef {Object} BoardTemplateData
 * @property {string} id - Object unique dom id
 * @property {string} label - Object display label
 * @property {null|string} icon - Object display icon
 */

/**
 * Board template
 * @class
 * @extends UiTemplate
 */
export class BoardTemplate extends UiTemplate {

    /**
     * Default template data
     * @protected
     * @property
     * @type {BoardTemplateData}
     */
    _defaults = {
        id : null,
        icon : null,
        label : null,
    };

    /**
     * Template validate method
     * @protected
     * @param {BoardTemplateData} data - Template data
     * @throws BoardTemplateException
     * @return {void}
     */
    _validate( data ) {
        if ( typeof data.id !== 'string' || !data.id.length ) {
            throw new BoardTemplateException( 'Requires a valid id' );
        }
        if ( typeof data.label !== 'string' || !data.label.length ) {
            throw new BoardTemplateException( 'Requires a valid label' );
        }
    }

    /**
     * Render template
     * @protected
     * @param {BoardTemplateData} data - Object template data
     * @return {string} - Rendered template string
     */
    _render( data ) {

        // Component markup
        return `<section id="${data.id}" data-type="board" class="board">` +
            '<nav class="board__nav ui-wrap ui-wrap--object-nav">' +
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
                                    ' data-tip="br" data-action="board.up" data-keep type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">Move up</span>' +
                                    '<span class="ui-icon ui-icon--rotate-270" data-icon="arrow-simple"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="br" data-action="board.down" data-keep type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">Move down</span>' +
                                    '<span class="ui-icon ui-icon--rotate-90" data-icon="arrow-simple"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="br" data-action="board.edit" type="button">' +
                                    '<span class="ui-icon" data-icon="action-edit"><span></span></span>' +
                                    '<span class="ui-button__label ui-tooltip__tip">Edit</span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="br" data-action="board.delete" type="button">' +
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
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="br" data-action="board.up" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Move up</span>' +
                        '<span class="ui-icon ui-icon--rotate-270" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="br" data-action="board.down" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Move down</span>' +
                        '<span class="ui-icon ui-icon--rotate-90" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                '</div>' +
                `<label class="board__label" title="${data.id}" data-action="board.toggle"><strong data-model-update="text:label">${escapeHTML( data.label )}</strong></label>` +
                '<div data-nav="interactive">' +
                    '<button class="ui-button ui-button--icon ui-tooltip ui-interactive"' +
                        ' data-tip="bl" data-action="board.minimize" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Minimize</span>' +
                        '<span class="ui-icon" data-icon="minimize"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip ui-interactive"' +
                        ' data-tip="bl" data-action="board.maximize" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Maximize</span>' +
                        '<span class="ui-icon" data-icon="fullscreen"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="bl" data-action="board.open" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Open</span>' +
                        '<span class="ui-icon ui-icon--rotate-90" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="bl" data-action="board.close" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Close</span>' +
                        '<span class="ui-icon" data-icon="close-small"><span></span></span>' +
                    '</button>' +
                '</div>' +
            '</nav>' +
            '<div class="board__content">' +
                '<div class="board__scroll" data-scroller>' +
                    '<ol class="board__children" data-children></ol>' +
                '</div>' +
            '</div>' +
            '<nav class="board__nav ui-wrap ui-wrap--object-nav">' +
                '<div class="ui-button ui-button--icon ui-button--label-hidden ui-button--static">' +
                    '<span class="ui-icon" data-icon="stats"><span></span></span>' +
                    '<span class="ui-button__label">Board statistics</span>' +
                '</div>' +
                '<div class="board__stats">' +
                    '<em>' +
                        '<span data-model-update="attr:stats.group:data-stats-count" data-stats-count="0">' +
                            '<strong data-model-update="text:stats.group">0</strong>' +
                            ' group<span>s</span>' +
                        '</span>' +
                    '</em>' +
                '</div>' +
                '<div data-nav="interactive">' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="tl" data-action="group.create" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Add group</span>' +
                        '<span class="ui-icon" data-icon="action-create"><span></span></span>' +
                    '</button>' +
                '</div>' +
            '</nav>' +
        '</section>';
    }
}
