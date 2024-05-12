/**
 * Requires
 */
import {
    afterPaint,
    cloneObject,
    escapeHTML,
    EventDispatcher,
    Exception, isEmpty, isPojo,
    mergeObject,
    ucfirst
} from '@squirrel-forge/ui-util';
import { Model } from './Model';
import { Board } from './Models/Board';

/**
 * View exception
 * @class
 * @extends Exception
 */
class ViewException extends Exception {}

/**
 * View
 * @class
 * @extends EventDispatcher
 */
export class View extends EventDispatcher {

    /**
     * Child model type
     * @public
     * @static
     * @type {string}
     */
    static childrenType = 'board';

    /**
     * Loaded models status
     * @private
     * @type {Object}
     */
    #loaded = {};

    /**
     * Loaded models
     * @private
     * @type {Object}
     */
    #data = {};

    /**
     * Stats data
     * @private
     * @type {Object}
     */
    #stats = {};

    /**
     * Bind status
     * @private
     * @type {boolean}
     */
    #bound = false;

    /**
     * Constructor
     * @constructor
     * @param {null|Application|EventDispatcher} app - Parent instance
     * @param {null|Console} debug - Debug mode
     */
    constructor( app, debug ) {
        super( null, app, debug );

        // Bind events
        try {
            this.bind();
        } catch ( e ) {
            throw new ViewException( 'Failed to bind view', e );
        }
    }

    /**
     * Getter: stats
     * @return {Object} - Stats object
     */
    get stats() { return this.#stats; }

    /**
     * Setter: stats
     * @param {Object} value - Stats obejct
     * @return {void}
     */
    set stats( value ) {
        mergeObject( this.#stats, value, true, true );
    }

    /**
     * Update placeholder for model routines
     * @return {null} - Does nothing
     */
    update() { return null; }

    /**
     * Getter: dom
     * @return {HTMLElement} - View dom
     */
    get dom() {
        return document.getElementById( 'view' );
    }

    /**
     * Getter: children
     * @return {Element} - View children container
     */
    get children() { return this.dom.querySelector( '.boards__list' ); }

    /**
     * Bind view events
     * @return {void}
     */
    bind() {
        if ( this.#bound ) return;

        // Render initial boards
        this.parent.addEventListener( 'data.ready', async() => {
            const boards = await this.getModels( 'board', this );
            this.renderModels( boards );
            this.bindModels( boards );
            if ( boards && boards.length === 1 ) {
                this.parent.selectAction( 'board.open', boards[ 0 ].dom )[ 0 ].click();
                this.parent.selectAction( 'board.maximize', boards[ 0 ].dom )[ 0 ].click();
            }
        } );

        this.addEventListener( 'board.open', async( event ) => {
            const groups = await this.getModels( 'group', null, {
                rel : event.detail.target.id,
            } );
            event.detail.target.stats = { group : groups.length };
            await this.loadModelsParent( groups );
            this.renderModels( groups );
            this.bindModels( groups );
        } );

        this.addEventListener( 'board.maximized', ( event ) => {
            const context = event.detail.target.parent.children.closest( '[data-scroller]' );
            this.parent.scrollTo( event.detail.target.dom, null, 0, context );
        } );

        this.addEventListener( 'board.close', ( event ) => {
            event.detail.target.children.innerHTML = '';
        } );

        this.addEventListener( 'group.open', async( event ) => {
            const items = await this.getModels( 'item', null, {
                rel : event.detail.target.id,
            } );
            event.detail.target.stats = { item : items.length };
            await this.loadModelsParent( items );
            this.renderModels( items );
            this.bindModels( items );
        } );

        this.addEventListener( 'group.maximized', ( event ) => {
            const context = event.detail.target.parent.children.closest( '[data-scroller]' );
            this.parent.scrollTo( event.detail.target.dom, null, 0, context );
        } );

        this.addEventListener( 'group.close', ( event ) => {
            event.detail.target.children.innerHTML = '';
        } );

        this.addEventListener( 'item.open', ( event ) => {
            const model = event.detail.target;
            model.render( {
                template : 'item' + ucfirst( model.variant ),
                append : model.children,
            } );
        } );

        this.addEventListener( 'item.close', ( event ) => {
            event.detail.target.children.innerHTML = '';
        } );

        this.addEventListener( 'item.modal', ( event ) => {
            const model = event.detail.target;
            const tmpl = 'item' + ucfirst( model.variant );
            const title = `${ucfirst( model.variant )} <strong>-</strong> ${model.parent.label} <strong>-</strong> ${model.label}`;
            const content = '<div class="ui-modal__dialog-children" data-children></div>';
            this.parent.showAlertModal( title, content, () => {
                model.clearRender( tmpl );
            }, ( render ) => {
                render.data.classes = [
                    `ui-modal--${model.type}`,
                    `ui-modal--${model.type}-${model.variant}`,
                ];
                render.data.footer = null;
            }, ( dom ) => {
                model.render( {
                    template : tmpl,
                    append : dom.querySelector( '[data-children]' ),
                } );
            } );
        } );

        this.#bound = true;
    }

    /**
     * Load model parent
     * @param {Model[]} models - List of models
     * @return {Promise<void>} - Returns nothing
     */
    async loadModelsParent( models ) {
        if ( !( models instanceof Array ) ) models = [ models ];
        for ( let i = 0; i < models.length; i++ ) {
            const model = models[ i ];
            if ( !model.parent ) {
                const parent = await this.getModels( model.constructor.modelParentType, null, {
                    id : model.rel,
                } );
                model.overrideParent( parent[ 0 ] );
            }
        }
    }

    /**
     * Get models
     * @param {string} modelType - Model type
     * @param {null|Model|View} parent - Model parent
     * @param {Object} query - Query object
     * @return {Promise<Model[]>} - Selected models
     */
    async getModels( modelType, parent = null, query = null ) {
        if ( !this.#loaded[ modelType ] ) {
            this.#data[ modelType ] = await this.parent.storage.typeList( modelType, parent );
            this.#loaded[ modelType ] = true;
        }
        let selected = null;
        if ( query ) {
            const conditions = Object.entries( query );
            const require = conditions.length;
            selected = this.#data[ modelType ].filter( ( model ) => {
                let matches = 0;
                for ( let i = 0; i < conditions.length; i++ ) {
                    const [ field, value ] = conditions[ i ];
                    if ( model[ field ] === value ) matches++;
                }
                return matches === require;
            } );
        }
        return query ? selected ?? [] : this.#data[ modelType ];
    }

    /**
     * Create model
     * @param {Function} Constructor - Model constructor
     * @param {null|Object} data - Model data
     * @param {null|Model} parentModel - Parent model
     * @param {null|string} importId - Import override id
     * @return {Promise<Model>} - Created model
     */
    async createModel( Constructor, data, parentModel = null, importId = null ) {
        const parent = {
            model : parentModel ?? this,
            dom : parentModel?.children ?? this.dom.list,
        };
        const model = new Constructor( data, parent.model, this.debug );
        if ( importId ) model.importId = importId;
        if ( !importId ) this.bindModels( model );
        if ( !this.#data[ Constructor.modelType ] ) this.#data[ Constructor.modelType ] = [];
        this.#data[ Constructor.modelType ].push( model );
        await model.save();
        return model;
    }

    /**
     * Update model
     * @param {Model} model - Model instance
     * @param {Object} data - Model data
     * @return {Promise<void>} - Returns nothing
     */
    async updateModel( model, data ) {
        model.assign( data );
        await model.save();
    }

    /**
     * Delete model
     * @param {Model} model - Model instance
     * @return {void}
     */
    deleteModel( model ) {
        const title = `Delete ${ucfirst( model.type )}`;
        const content = `<div class="ui-text"><p>Are you sure you want to delete <q>${escapeHTML( model.label )}</q>?</p></div>`;
        this.parent.showConfirmModal( title, content, () => {
            this.deleteModelStructure( model );
        } );
    }

    /**
     * Delete actual model
     * @param {Model} model - Model instance
     * @return {Promise<void>} - Returns nothing
     */
    async deleteRealModel( model ) {

        // Check if type exists
        // Type settings and theme may be undefined since they are only saved explicitly
        if ( this.#data[ model.type ] ) {
            const i = this.#data[ model.type ].indexOf( model );
            if ( i > -1 ) this.#data[ model.type ].splice( i, 1 );
        }
        await model.delete();
    }

    /**
     * Delete model structure
     * @param {Model} model - Model instance
     * @return {Promise<void>} - Returns nothing
     */
    async deleteModelStructure( model ) {
        if ( model.constructor.childrenType ) {
            await this.deleteChildrenFrom( model );
        }
        await this.deleteRealModel( model );
    }

    /**
     * Delete model children
     * @param {Model} model - Model instance
     * @return {Promise<void>} - Returns nothing
     */
    async deleteChildrenFrom( model ) {
        const items = await this.getModels( model.constructor.childrenType, null, {
            rel : model.id,
        } );
        for ( let i = 0; i < items.length; i++ ) {
            await this.deleteModelStructure( items[ i ] );
        }
    }

    /**
     * Update index order
     * @param {Model} parent - Model instance
     * @return {Promise<void>} - Returns nothing
     */
    async updateIndexOrder( parent ) {
        const nodes = parent.children.children;
        const ordered_subset = [];
        for ( let i = 0; i < nodes.length; i++ ) {
            ordered_subset.push( nodes[ i ].id );
        }
        const index = await this.parent.storage.requireIndex( parent.constructor.childrenType );
        await index.reorder( ordered_subset );
    }

    /**
     * Render models
     * @param {Model[]} models - List of model instances
     * @param {Object} params - Params object
     * @return {void}
     */
    renderModels( models, params = {} ) {
        if ( !( models instanceof Array ) ) models = [ models ];
        for ( let i = 0; i < models.length; i++ ) {
            const model = models[ i ];
            model.render( cloneObject( params ) );
        }
    }

    /**
     * Refresh model dom
     * @param {Model[]} models - List of model instances
     * @return {void}
     */
    refreshModels( models ) {
        if ( !( models instanceof Array ) ) models = [ models ];
        for ( let i = 0; i < models.length; i++ ) {
            const model = models[ i ];
            model.update();
        }
    }

    /**
     * Remove models from dom
     * @param {Model[]} models - List of model instances
     * @return {void}
     */
    removeModels( models ) {
        if ( !( models instanceof Array ) ) models = [ models ];
        for ( let i = 0; i < models.length; i++ ) {
            const model = models[ i ];
            model.dom.remove();
        }
    }

    /**
     * Bind models
     * @param {Model[]} models - List of model instances
     * @param {Object} params - Params object
     * @return {void}
     */
    bindModels( models, params = {} ) {
        if ( !( models instanceof Array ) ) models = [ models ];
        for ( let i = 0; i < models.length; i++ ) {
            const model = models[ i ];
            model.addEventListener( 'model.saved', ( event ) => {
                if ( model !== event.detail.target ) return;
                if ( event.detail.created ) {
                    this.renderModels( model, params );
                    const stats = {};
                    stats[ model.type ] = ( model.parent.stats[ model.type ] ?? 0 ) + 1;
                    model.parent.stats = stats;

                    // Board model only
                    if ( model.type === 'board' ) {
                        const openers = this.parent.selectAction( 'board.open', model.dom );
                        if ( openers.length ) openers[ 0 ].click();
                        afterPaint( () => {
                            const creators = this.parent.selectAction( 'group.create', model.dom );
                            if ( creators.length ) creators[ 0 ].focus();
                        } );
                    }

                    // Group model only
                    if ( model.type === 'group' ) {
                        const openers = this.parent.selectAction( 'group.open', model.dom );
                        if ( openers.length ) openers[ 0 ].click();
                        afterPaint( () => {
                            const creators = this.parent.selectAction( 'item.create', model.dom );
                            if ( creators.length ) creators[ 0 ].focus();
                        } );
                    }
                } else {
                    this.refreshModels( model );
                }
                model.parent.update();
            } );
            model.addEventListener( 'model.deleted', ( event ) => {
                if ( model !== event.detail.target ) return;
                const stats = {};
                stats[ model.type ] = ( model.parent.stats[ model.type ] ?? 1 ) - 1;
                model.parent.stats = stats;
                this.removeModels( model );
                model.parent.update();
            } );
        }
    }

    /**
     * Export data
     * @param {boolean} asBlob - As blob object
     * @return {Promise<Blob|Object>} - Data result
     */
    async export( asBlob = true ) {
        const board = await this.getModels( 'board' );
        const group = await this.getModels( 'group' );
        const item = await this.getModels( 'item' );
        const data = { board, group, item };
        const json = JSON.stringify( data, ( key, value ) => {
            if ( value instanceof Model ) return value.data;
            if ( isEmpty( value ) ) return;
            return value;
        } );
        if ( !asBlob ) return JSON.parse( json );
        return new Blob( [ json ], { type : 'application/json' } );
    }

    /**
     * Import data
     * @param {Object} data - Import data
     * @return {Promise<void>} - Returns nothing
     */
    async importData( data ) {
        for ( let i = 0; i < data.board.length; i++ ) {
            const board_data = data.board[ i ];
            if ( !board_data.id ) continue;
            const exists = await this.getModels( 'board', null, {
                id : board_data.id
            } );
            let model;
            if ( exists.length ) {
                model = exists.pop();
                model.assign( board_data );
                await model.save( true );
            } else {
                model = await this.createModel( Board, board_data, null, board_data.id );
            }
            await this.importNested( data, model );
        }
    }

    /**
     * Import nested models
     * @param {Object} data - Import data
     * @param {Model} parent - Parent model
     * @return {Promise<void>} - Returns nothing
     */
    async importNested( data, parent ) {
        const type = parent.constructor.childrenType;
        for ( let i = 0; i < data[ type ].length; i++ ) {
            const nested_data = data[ type ][ i ];
            if ( !nested_data.id ) continue;
            if ( nested_data.rel !== parent.id ) continue;
            const exists = await this.getModels( type, parent, {
                id : nested_data.id,
                rel : parent.id,
            } );
            let model;
            if ( exists.length ) {
                model = exists.pop();
                model.assign( nested_data );
                await model.save( true );
            } else {
                model = await this.createModel( this.parent.storage.models[ type ], nested_data, null, nested_data.id );
            }
            if ( model.constructor.childrenType ) {
                await this.importNested( data, model );
            }
        }
    }

    /**
     * Parse json data string
     * @param {string} str - JSON data string
     * @return {Promise<void>} - Returns nothing
     */
    async importJSONString( str ) {
        let decoded, error;
        try {
            decoded = JSON.parse( str );
            if ( !isPojo( decoded )
                || !decoded.board || !( decoded.board instanceof Array )
                || decoded.group && !( decoded.group instanceof Array )
                || decoded.item && !( decoded.item instanceof Array ) ) {
                throw new Error( 'Invalid json format' );
            }
        } catch ( e ) {
            error = e;
        }
        if ( !error ) {
            try {
                await this.importData( decoded );
            } catch ( e ) {
                error = e;
            }
        }
        let title, content, complete = null;
        if ( error ) {
            title = 'JSON import error';
            content = `Failed to import: ${error.toString()}`;
        } else {
            title = 'JSON import complete';
            content = 'Imported all connected data. The application will reload automatically.';
            complete = () => {
                location.reload();
            };
        }
        this.parent.showAlertModal( title, content, complete );
    }
}
