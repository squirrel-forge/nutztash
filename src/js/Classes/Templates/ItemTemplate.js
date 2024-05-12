/**
 * Requires
 */
import { UiTemplate } from '@squirrel-forge/ui-core';
import { escapeHTML, Exception } from '@squirrel-forge/ui-util';

/**
 * Item template exception
 * @class
 * @extends Exception
 */
class ItemTemplateException extends Exception {}

/**
 * Item template data
 * @typedef {Object} ItemTemplateData
 * @property {string} id - Object unique dom id
 * @property {string} rel - Object parent id
 * @property {string} label - Object display label
 * @property {boolean} marked - Object marked status
 * @property {string} variant - Object variant
 * @property {number} amount - Object count
 * @property {null|string} note - Variant "note" content
 * @property {null|string} youtube - Variant "youtube" content
 */

/**
 * Item template
 * @class
 * @extends UiTemplate
 */
export class ItemTemplate extends UiTemplate {

    /**
     * Default template data
     * @protected
     * @property
     * @type {ItemTemplateData}
     */
    _defaults = {
        id : null,
        rel : null,
        label : null,
        marked : false,
        variant : null,
        amount : 0,
        note : null,
        youtube : null,
    };

    /**
     * Template validate method
     * @protected
     * @param {ItemTemplateData} data - Template data
     * @throws ItemTemplateException
     * @return {void}
     */
    _validate( data ) {
        if ( typeof data.id !== 'string' || !data.id.length ) {
            throw new ItemTemplateException( 'Requires a valid id' );
        }
        if ( typeof data.rel !== 'string' || !data.rel.length ) {
            throw new ItemTemplateException( 'Requires a valid relation' );
        }
        if ( typeof data.label !== 'string' || !data.label.length ) {
            throw new ItemTemplateException( 'Requires a valid label' );
        }
        if ( typeof data.variant !== 'string' || !data.variant.length ) {
            throw new ItemTemplateException( 'Requires a valid variant' );
        }
    }

    /**
     * Render template
     * @protected
     * @param {ItemTemplateData} data - Object template data
     * @return {string} - Rendered template string
     */
    _render( data ) {

        const classes = [ 'item', `item--${data.variant}` ];
        if ( data.marked ) classes.push( 'item--marked' );

        // Component markup
        return `<article id="${data.id}" data-type="item" class="${classes.join( ' ' )}">` +
            '<nav class="item__nav ui-wrap ui-wrap--object-nav">' +
                '<div data-nav="options">' +
                    '<div data-nav="nav">' +
                        '<button class="ui-button ui-button--icon ui-tooltip" data-tip="r" data-nav="show" type="button">' +
                            '<span class="ui-icon" data-icon="menu"><span></span></span>' +
                            '<span class="ui-button__label ui-tooltip__tip">Show options</span>' +
                        '</button>' +
                        '<div data-nav="drop" tabindex="0">' +
                            '<div class="ui-wrap ui-wrap--options-drop">' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="r" data-action="item.up" data-keep type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">Move up</span>' +
                                    '<span class="ui-icon ui-icon--rotate-270" data-icon="arrow-simple"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="r" data-action="item.down" data-keep type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">Move down</span>' +
                                    '<span class="ui-icon ui-icon--rotate-90" data-icon="arrow-simple"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="r" data-action="item.more" type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">More</span>' +
                                    '<span class="ui-icon" data-icon="add"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="r" data-action="item.less" type="button">' +
                                    '<span class="ui-button__label ui-tooltip__tip">Less</span>' +
                                    '<span class="ui-icon" data-icon="remove"><span></span></span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="r" data-action="item.edit" type="button">' +
                                    '<span class="ui-icon" data-icon="action-edit"><span></span></span>' +
                                    '<span class="ui-button__label ui-tooltip__tip">Edit</span>' +
                                '</button>' +
                                '<button class="ui-button ui-button--icon ui-tooltip"' +
                                    ' data-tip="r" data-action="item.delete" type="button">' +
                                    '<span class="ui-icon" data-icon="action-delete"><span></span></span>' +
                                    '<span class="ui-button__label ui-tooltip__tip">Delete</span>' +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="r" data-nav="hide" type="button">' +
                        '<span class="ui-icon" data-icon="close"><span></span></span>' +
                        '<span class="ui-button__label ui-tooltip__tip">Hide options</span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="r" data-action="item.up" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Move up</span>' +
                        '<span class="ui-icon ui-icon--rotate-270" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="r" data-action="item.down" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Move down</span>' +
                        '<span class="ui-icon ui-icon--rotate-90" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                '</div>' +
                `<div class="item__amount" data-model-update="attr:amount:data-item-amount" data-item-amount="${data.amount}">` +
                    '<div data-nav="options">' +
                        '<div data-nav="nav">' +
                            '<button class="ui-button" data-nav="show" type="button">' +
                                `<span class="ui-button__label" data-model-update="text:amount">${data.amount}</span>` +
                            '</button>' +
                            '<div data-nav="drop" tabindex="0">' +
                                '<div class="ui-wrap ui-wrap--options-drop">' +
                                    '<button class="ui-button ui-button--icon ui-tooltip"' +
                                        ' data-tip="r" data-action="item.more" type="button">' +
                                        '<span class="ui-button__label ui-tooltip__tip">More</span>' +
                                        '<span class="ui-icon" data-icon="add"><span></span></span>' +
                                    '</button>' +
                                    '<button class="ui-button ui-button--icon ui-tooltip"' +
                                        ' data-tip="r" data-action="item.less" type="button">' +
                                        '<span class="ui-button__label ui-tooltip__tip">Less</span>' +
                                        '<span class="ui-icon" data-icon="remove"><span></span></span>' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<button class="ui-button" data-nav="hide" type="button">' +
                            `<span class="ui-button__label" data-model-update="text:amount">${data.amount}</span>` +
                        '</button>' +
                    '</div>' +
                '</div>' +
                `<label class="item__label" title="${data.id}"><strong data-model-update="text:label">${escapeHTML( data.label )}</strong></label>` +
                '<div data-nav="interactive">' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="l" data-action="item.open" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Open</span>' +
                        '<span class="ui-icon ui-icon--rotate-90" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="l" data-action="item.close" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Close</span>' +
                        '<span class="ui-icon" data-icon="close-small"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="l" data-action="item.modal" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Show in popup</span>' +
                        '<span class="ui-icon" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="l" data-action="item.link" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Show in new window</span>' +
                        '<span class="ui-icon ui-icon--rotate-315" data-icon="arrow-simple"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="l" data-action="item.unmark" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Unmark</span>' +
                        '<span class="ui-icon" data-icon="check"><span></span></span>' +
                    '</button>' +
                    '<button class="ui-button ui-button--icon ui-tooltip" data-tip="l" data-action="item.mark" type="button">' +
                        '<span class="ui-button__label ui-tooltip__tip">Mark</span>' +
                        '<span class="ui-icon" data-icon="close-small"><span></span></span>' +
                    '</button>' +
                '</div>' +
            '</nav>' +
            '<div class="item__content">' +
                '<div class="item__scroll" data-scroller>' +
                    '<div class="item__children" data-children></div>' +
                '</div>' +
            '</div>' +
        '</article>';
    }
}
