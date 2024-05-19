/**
 * Requires
 */
import { appendAfter, debounce } from '@squirrel-forge/ui-util';
import { Model } from '../Model';
import { iconsOptions } from '../../../generated/icons.js';

const _MODEL_ACTIONS = {
    'board.toggle' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            if ( params.model.isOpen() ) {
                params.model.actionClose();
            } else {
                params.model.actionOpen();
            }
        } ]
    ],
    'board.open' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionOpen();
        } ]
    ],
    'board.close' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionClose();
        } ]
    ],
    'board.maximize' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionMaximize();
        } ]
    ],
    'board.minimize' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.actionMinimize();
        } ]
    ],
    'board.edit' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.showModelModal( 'board', params.model, 'edit' );
        } ]
    ],
    'board.delete' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.view.deleteModel( params.model );
        } ]
    ],
    'group.create' : [
        [ 'click', ( event, params ) => {
            event.preventDefault();
            params.model.constructor.app.showModelModal( 'group', null, 'create', params.model );
        } ],
    ],
    'board.up' : [
        [ 'click', debounce( ( event, params ) => {
            params.model.constructor.app.view.updateIndexOrder( params.model.parent );
        }, 750, ( event, params ) => {
            event.preventDefault();
            const dom = params.model.dom;
            if ( !dom.previousElementSibling ) return true;
            dom.parentElement.insertBefore( dom, dom.previousElementSibling );
        } ) ]
    ],
    'board.down' : [
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
 * Board
 * @class
 * @extends Model
 */
export class Board extends Model {

    static modelType = 'board';

    static childrenType = 'group';

    static childrenHost = '.board__children';

    static modelFields = {
        icon : {
            type : 'text',
            max : 32,
            autocomplete : iconsOptions,
        },
        label : {
            type : 'text',
            max : 60,
            required : true,
        }
    };

    static modelActions = _MODEL_ACTIONS;
}
