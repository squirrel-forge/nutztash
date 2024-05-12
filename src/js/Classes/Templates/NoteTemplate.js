/**
 * Requires
 */
import { UiTemplate } from '@squirrel-forge/ui-core';
import { escapeHTML, Exception } from '@squirrel-forge/ui-util';

/**
 * Note template exception
 * @class
 * @extends Exception
 */
class NoteTemplateException extends Exception {}

/**
 * Note template data
 * @typedef {Object} NoteTemplateData
 * @property {string} id - Object unique dom id
 * @property {null|string} note - Object note content
 */

/**
 * Note template
 * @class
 * @extends UiTemplate
 */
export class NoteTemplate extends UiTemplate {

    /**
     * Default template data
     * @protected
     * @property
     * @type {NoteTemplateData}
     */
    _defaults = {
        id : null,
        note : null,
    };

    /**
     * Template validate method
     * @protected
     * @param {NoteTemplateData} data - Template data
     * @throws NoteTemplateException
     * @return {void}
     */
    _validate( data ) {
        if ( typeof data.id !== 'string' || !data.id.length ) {
            throw new NoteTemplateException( 'Requires a valid id' );
        }
    }

    /**
     * Render template
     * @protected
     * @param {NoteTemplateData} data - Object template data
     * @return {string} - Rendered template string
     */
    _render( data ) {

        // Component markup
        return `<div data-type="note" class="note"><div class="note__wrap" data-model-update="text:note">${escapeHTML( data.note ?? '' )}</div></div>`;
    }
}
