/**
 * Requires
 */
import { Model } from '../Model';
import { afterPaint, appendAfter, debounce, isEmpty } from '@squirrel-forge/ui-util';

/**
 * Bind model
 * @param {Object} params - Bind params
 * @return {void}
 */
function _bind_item_dom( params ) {
    if ( params.modal ) {
        const select_variant = params.modal.dom.querySelector( '[name="variant"]' );
        select_variant.addEventListener( 'change', () => {
            params.modal.dom.setAttribute( 'data-item-variant', select_variant.value );
        } );
        params.modal.dom.setAttribute( 'data-item-variant', select_variant.value );
    }
}

const _MODEL_ACTIONS = {
    'item.open' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionOpen();
        } ]
    ],
    'item.close' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionClose();
        } ]
    ],
    'item.modal' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.dispatchEvent( 'item.modal' );
        } ]
    ],
    'item.link' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            let url = null;
            switch ( params.model.variant ) {
            case 'url' : url = params.model.url; break;
            case 'youtube' : url = params.model.youtubeLink; break;
            }
            if ( url ) window.open( url, '_blank' );
        } ]
    ],
    'item.mark' : [
        [ 'click', async( event, params ) => {
            event.preventDefault();
            params.model.dispatchEvent( 'item.mark' );
            params.model.marked = true;
            await params.model.save();
            params.model.dom.classList.add( 'item--marked' );
            afterPaint( () => {
                params.model.dispatchEvent( 'item.marked' );
            } );
        } ]
    ],
    'item.unmark' : [
        [ 'click', async( event, params ) => {
            event.preventDefault();
            params.model.dispatchEvent( 'item.unmark' );
            params.model.marked = false;
            await params.model.save();
            params.model.dom.classList.remove( 'item--marked' );
            afterPaint( () => {
                params.model.dispatchEvent( 'item.unmarked' );
            } );
        } ]
    ],
    'item.edit' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.showModelModal( 'item', params.model, 'edit' );
        } ]
    ],
    'item.delete' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.view.deleteModel( params.model );
        } ]
    ],
    'item.more' : [
        [ 'click', async( event, params ) => {
            event.preventDefault();
            params.model.amount = params.model.amount + 1;
            await params.model.save();
        } ]
    ],
    'item.less' : [
        [ 'click', async( event, params ) => {
            event.preventDefault();
            params.model.amount = params.model.amount - 1;
            await params.model.save();
        } ]
    ],
    'item.up' : [
        [ 'click', debounce( ( event, params ) => {
            params.model.constructor.app.view.updateIndexOrder( params.model.parent );
        }, 750, ( event, params ) => {
            event.preventDefault();
            const dom = params.model.dom;
            if ( !dom.previousElementSibling ) return true;
            dom.parentElement.insertBefore( dom, dom.previousElementSibling );
        } ) ]
    ],
    'item.down' : [
        [ 'click', debounce( ( event, params ) => {
            params.model.constructor.app.view.updateIndexOrder( params.model.parent );
        }, 750, ( event, params ) => {
            event.preventDefault();
            const dom = params.model.dom;
            if ( !dom.nextElementSibling ) return true;
            appendAfter( dom, dom.nextElementSibling );
        } ) ]
    ],
};

/**
 * Item
 * @class
 * @extends Model
 */
export class Item extends Model {

    static modelType = 'item';

    static modelParentType = 'group';

    static childrenHost = '.item__children';

    static modelFields = {
        rel : {
            type : 'hidden',
            required : true,
        },
        label : {
            type : 'text',
            max : 60,
            required : true,
        },
        marked : {
            type : 'checkbox',
            value : false,
        },
        variant : {
            label : { text : 'Type' },
            type : 'select',
            value : 'label',
            options : [ 'label', 'url', 'note', 'youtube' ],
            required : true,
        },
        amount : {
            type : 'number',
            value : 0,
        },
        note : {
            type : 'textarea',
            value : '',
        },
        url : {
            label : { text : 'URL including protocol' },
            type : 'text',
            value : '',
        },
        youtube : {
            label : { text : 'Youtube id' },
            type : 'text',
            value : '',
        },
    };

    static modelActions = _MODEL_ACTIONS;

    static modelBinds = [ _bind_item_dom ];

    /**
     * Getter: youtube link
     * @return {string|null} - Link url
     */
    get youtubeLink() {
        if ( isEmpty( this.youtube ) ) return null;
        return `https://www.youtube.com/watch?v=${this.youtube}`;
    }

    /**
     * Update item dom
     * @param {Object} stats - Stats object
     * @param {boolean} children - Include children
     * @return {void}
     */
    update( stats = true, children = true ) {
        this.dom.classList[ this.marked ? 'add' : 'remove' ]( 'item--marked' );

        const variants = this.constructor.modelFields.variant.options;
        for ( let i = 0; i < variants.length; i++ ) {
            const variant = variants[ i ];
            this.dom.classList[ variant === this.variant ? 'add' : 'remove' ]( `item--${variant}` );
        }
        super.update( stats, children );
    }
}
