/**
 * Requires
 */
import { Model } from '../Model';
import { afterPaint, appendAfter, debounce } from '@squirrel-forge/ui-util';

const _MODEL_ACTIONS = {
    'group.toggle' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            if ( params.model.isOpen() ) {
                params.model.actionClose();
            } else {
                params.model.actionOpen();
            }
        } ]
    ],
    'group.open' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionOpen();
        } ]
    ],
    'group.close' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionClose();
        } ]
    ],
    'group.maximize' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionMaximize();
        } ]
    ],
    'group.minimize' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionMinimize();
        } ]
    ],
    'group.marked' : [
        [ 'click', async( event, params ) => {
            event.preventDefault();
            params.model.dispatchEvent( 'group.mark' );
            params.model.marked = true;
            await params.model.save();
            params.model.dom.classList.add( 'group--marked' );
            afterPaint( () => {
                params.model.dispatchEvent( 'group.marked' );
            } );
        } ]
    ],
    'group.unmarked' : [
        [ 'click', async( event, params ) => {
            event.preventDefault();
            params.model.dispatchEvent( 'group.unmark' );
            params.model.marked = false;
            await params.model.save();
            params.model.dom.classList.remove( 'group--marked' );
            afterPaint( () => {
                params.model.dispatchEvent( 'group.unmarked' );
            } );
        } ]
    ],
    'group.edit' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.showModelModal( 'group', params.model, 'edit' );
        } ]
    ],
    'group.delete' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.view.deleteModel( params.model );
        } ]
    ],
    'item.create' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.showModelModal( 'item', null, 'create', params.model );
        } ],
    ],
    'group.up' : [
        [ 'click', debounce( ( event, params ) => {
            params.model.constructor.app.view.updateIndexOrder( params.model.parent );
        }, 750, ( event, params ) => {
            event.preventDefault();
            const dom = params.model.dom;
            if ( !dom.previousElementSibling ) return true;
            dom.parentElement.insertBefore( dom, dom.previousElementSibling );
        } ) ]
    ],
    'group.down' : [
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
 * Group
 * @class
 * @extends Model
 */
export class Group extends Model {

    static modelType = 'group';

    static modelParentType = 'board';

    static childrenType = 'item';

    static childrenHost = '.group__children';

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
            label : { text : 'Show unmarked items only' },
            type : 'checkbox',
            value : true,
        },
    };

    static modelActions = _MODEL_ACTIONS;

    /**
     * Model async update
     * @return {Promise<void>} - Returns nothing
     */
    async updateAsync() {
        const items = await this.constructor.app.view.getModels( 'item', null, {
            rel : this.id,
        } );
        if ( !items.length ) {
            this.stats = { itemUnmarked : 0, itemMarked : 0, noAsync : true };
            return;
        }
        await this.constructor.app.view.loadModelsParent( items );
        let marked = 0;
        for ( let i = 0; i < items.length; i++ ) {
            const item = items[ i ];
            if ( item.marked ) marked++;
        }
        if ( this.dom ) this.dom.classList[ items.length - marked > 0 ? 'remove' : 'add' ]( 'group--completed' );
        this.stats = { itemUnmarked : items.length - marked, itemMarked : marked, noAsync : true };
    }

    /**
     * Update marked state
     * @param {Object} stats - Stats object
     * @return {void}
     */
    update( stats = true ) {
        this.dom.classList[ this.marked ? 'add' : 'remove' ]( 'group--marked' );
        super.update( stats );
    }

    /**
     * Action maximize
     * @public
     * @return {void}
     */
    actionMaximize() {
        if ( this.constructor.app.settings.maximizeBoardWithGroup ) {
            if ( !this.parent.isMaximized() ) this.parent.actionMaximize();
        }
        super.actionMaximize();
    }
}
