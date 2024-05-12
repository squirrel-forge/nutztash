/**
 * Requires
 */
import { UiTemplate } from '@squirrel-forge/ui-core';
import { Exception } from '@squirrel-forge/ui-util';

/**
 * Youtube template exception
 * @class
 * @extends Exception
 */
class YoutubeTemplateException extends Exception {}

/**
 * Youtube template data
 * @typedef {Object} YoutubeTemplateData
 * @property {string} id - Object unique dom id
 * @property {string} youtube - Object youtube id
 */

/**
 * Youtube template
 * @class
 * @extends UiTemplate
 */
export class YoutubeTemplate extends UiTemplate {

    /**
     * Default template data
     * @protected
     * @property
     * @type {YoutubeTemplateData}
     */
    _defaults = {
        id : null,
        youtube : null,
    };

    /**
     * Template validate method
     * @protected
     * @param {YoutubeTemplateData} data - Template data
     * @throws YoutubeTemplateException
     * @return {void}
     */
    _validate( data ) {
        if ( typeof data.id !== 'string' || !data.id.length ) {
            throw new YoutubeTemplateException( 'Requires a valid id' );
        }
        if ( typeof data.youtube !== 'string' || !data.youtube.length ) {
            throw new YoutubeTemplateException( 'Requires a valid youtube id' );
        }
    }

    /**
     * Render template
     * @protected
     * @param {YoutubeTemplateData} data - Object template data
     * @return {string} - Rendered template string
     */
    _render( data ) {

        // Component markup
        return '<div data-type="youtube" class="youtube"><div class="youtube__wrap">' +
            `<iframe src="https://www.youtube-nocookie.com/embed/dakOQMNa_2Q?si=${data.youtube}"` +
                ' title="YouTube video player"' +
                ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"' +
                ' referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>' +
            '</iframe>' +
        '</div></div>';
    }
}
