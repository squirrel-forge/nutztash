/**
 * Requires
 */
import {
    afterPaint,
    cloneObject,
    EventDispatcher,
    Exception,
    isEmpty,
    isPojo,
    mergeObject,
    strAccess,
    strCamel2dash, ucfirst
} from '@squirrel-forge/ui-util';
import { UiTemplateRenderer } from '@squirrel-forge/ui-core';
import { FormValues } from '@squirrel-forge/ui-form';

/**
 * Model exception
 * @class
 * @extends Exception
 */
class ModelException extends Exception {}

/**
 * Model
 * @abstract
 * @class
 * @extends EventDispatcher
 */
export class Model extends EventDispatcher {

    /**
     * App instance
     * @public
     * @static
     * @type {null|Application}
     */
    static app = null;

    /**
     * Storage driver
     * @public
     * @static
     * @type {null|Storage}
     */
    static storage = null;

    /**
     * Model type name
     * @public
     * @abstract
     * @static
     * @type {string}
     */
    static modelType = 'default';

    /**
     * Model parent type name
     * @public
     * @abstract
     * @static
     * @type {string}
     */
    static modelParentType = 'default';

    /**
     * Model fields
     * @public
     * @abstract
     * @static
     * @type {Object}
     */
    static modelFields = {};

    /**
     * Model binds
     * @public
     * @abstract
     * @static
     * @type {Array}
     */
    static modelBinds = [];

    /**
     * Model actions
     * @public
     * @abstract
     * @static
     * @type {Object}
     */
    static modelActions = {};

    /**
     * Model children host selector
     * @public
     * @abstract
     * @static
     * @type {null|string}
     */
    static childrenHost = null;

    /**
     * Model children type
     * @public
     * @abstract
     * @static
     * @type {null|string}
     */
    static childrenType = null;

    /**
     * Generate field label from name
     * @public
     * @static
     * @param {string} str - Field name
     * @return {string} - Label optimized
     */
    static labelGenerator( str ) {
        const stripped = str.replace( /^[A-Z]/g, ( s ) => { return ' ' + s.toLowerCase(); } )
            .replace( /[A-Z]/g, ( s ) => { return ' ' + s.toLowerCase(); } );
        return ucfirst( stripped.replace( 'modal', 'popup' ).replace( 'nav', 'navigation' ) );
    }

    /**
     * Render form fields
     * @public
     * @static
     * @param {Object} data - Field data
     * @return {{template: string, as: {content: *[]}, data: {}}[]} - Render object
     */
    static form( data = null ) {
        const fieldset = {
            template : 'fieldset',
            data : {},
            as : {
                content : [],
            },
        };
        const entries = Object.entries( this.modelFields );
        for ( let i = 0; i < entries.length; i++ ) {
            const [ field, config ] = entries[ i ];
            const input = {
                template : 'input',
                data : cloneObject( config, true ),
            };
            input.data.name = field;
            input.data.classes = [
                `ui-input--${strCamel2dash( field )}`,
                'ui-input--grow',
                'ui-input--grow-label',
                'ui-input--label-multiline',
            ];
            if ( config.type === 'textarea' ) {
                input.data.classes.push( 'ui-input--wide' );
            } else {
                input.data.classes.push( 'ui-input--horizontal', 'ui-input--spaced' );
            }
            if ( !input.data.label ) input.data.label = { text : this.labelGenerator( field ) };
            if ( config.type === 'number' ) input.data.classes.push( 'ui-input--input-align-right' );

            // if ( config.type !== 'checkbox' && !input.data.width ) input.data.width = 100;
            if ( config.type === 'select' && config.options ) {
                input.data.options = [];
                for ( let j = 0; j < config.options.length; j++ ) {
                    const option = config.options[ j ];
                    input.data.options.push( {
                        label : this.labelGenerator( option ),
                        value : option,
                    } );
                }
            }
            if ( data !== null && typeof data[ field ] !== 'undefined' ) {
                input.data.value = data[ field ];
            } else if ( !data && typeof config.value !== 'undefined' ) {
                input.data.value = config.value;
            }
            switch ( config.type ) {
            case 'text' : input.data.maxlen = config.max; break;
            case 'checkbox' : input.data.checked = input.data.value; break;
            }
            fieldset.as.content.push( input );
        }
        return [ fieldset ];
    }

    /**
     * Get data from form
     * @public
     * @static
     * @param {HTMLElement} dom - Form context
     * @return {Object} - Fields data
     */
    static getFormData( dom ) {
        const fv = new FormValues( dom, false, this.app.debug );
        const data = fv.get();
        const entries = Object.entries( this.modelFields );
        for ( let i = 0; i < entries.length; i++ ) {
            const [ field, config ] = entries[ i ];
            if ( typeof data[ field ] === 'undefined' && config.type === 'checkbox' ) {
                data[ field ] = false;
            }
        }
        return data;
    }

    /**
     * Bind dom
     * @public
     * @static
     * @param {HTMLElement} dom - Context
     * @param {Object} params - Params object
     * @return {void}
     */
    static bind( dom = null, params = {} ) {
        if ( !( dom instanceof HTMLElement ) ) throw new ModelException( 'Nothing to bind' );
        params.dom = dom;

        // Bind action handlers
        this.app.bindActions( this.modelActions, dom, params );

        // Bind custom handlers
        for ( let i = 0; i < this.modelBinds.length; i++ ) {
            const bind = this.modelBinds[ i ];
            bind( params );
        }
    }

    /**
     * Bind form
     * @public
     * @static
     * @param {HTMLElement} dom - Context
     * @param {UiModalComponent} modal - Modal instance
     * @return {void}
     */
    static bindForm( dom, modal ) {
        const inputs = dom.querySelectorAll( 'input:not([type="hidden"]), select, textarea' );
        for ( let i = 0; i < inputs.length; i++ ) {
            const input = inputs[ i ];
            const component = input.closest( '.ui-input' );
            const error = component.querySelector( '.ui-input__error' );
            input.addEventListener( 'blur', () => {
                component.classList.remove( 'ui-input--error' );
                component.classList.remove( 'ui-input--error-visible' );
                error.innerHTML = '';
            } );
            input.addEventListener( 'keyup', ( event ) => {
                if ( event.key === 'Enter' ) {
                    modal.getDomRefs( 'confirm.confirm', false ).click();
                }
            } );
        }
    }

    /**
     * Validate data
     * @public
     * @static
     * @param {Object} data - Data
     * @return {{valid: boolean, errors: {}}} - Status response
     */
    static validate( data ) {
        let valid = true, errors = {};
        const entries = Object.entries( this.modelFields );
        for ( let i = 0; i < entries.length; i++ ) {
            const [ field, config ] = entries[ i ];
            if ( config.required && isEmpty( data[ field ] ) ) {
                valid = false;
                if ( !errors[ field ] ) errors[ field ] = [];
                errors[ field ].push( `Field <q>${this.labelGenerator( field )}</q> is required.` );
            }
        }
        if ( valid ) errors = null;
        return { valid, errors };
    }

    /**
     * Model id
     * @private
     * @type {null|string}
     */
    #id = null;

    /**
     * Model id was imported
     * @private
     * @type {null|string}
     */
    #import_id = null;

    /**
     * Model data
     * @private
     * @type {Object}
     */
    #data = {};

    /**
     * Changes state
     * @private
     * @type {boolean}
     */
    #changes = false;

    /**
     * Model view dom
     * @private
     * @type {Object}
     */
    #dom = {};

    /**
     * Initialized state
     * @private
     * @type {boolean}
     */
    #initialized = false;

    /**
     * Stats data
     * @private
     * @type {Object}
     */
    #stats = {};

    /**
     * Constructor
     * @constructor
     * @param {null|Object} data - Data
     * @param {null|View|Model} parent - Parent
     * @param {null|Console} debug - Debug mode
     */
    constructor( data = null, parent = null, debug = null ) {
        super( null, parent, debug );
        this.initialize();
        if ( data ) this.assign( data );
    }

    /**
     * Getter: stats
     * @return {Object} - Stats object
     */
    get stats() { return this.#stats; }

    /**
     * Setter: stats
     * @param {Object} value - Stats object
     * @return {void}
     */
    set stats( value ) {
        let stats = true;
        if ( value?.noAsync ) {
            delete value[ 'noAsync' ];
            stats = false;
        }
        mergeObject( this.#stats, value, true, true );
        this.update( stats );
    }

    /**
     * Initialize model
     * @public
     * @return {void}
     */
    initialize() {
        if ( this.#initialized ) return;
        Object.defineProperty( this, 'type', {
            get : () => { return this.constructor.modelType; },
            enumerable : true,
            configurable : false,
        } );
        Object.defineProperty( this, 'id', {
            get : () => { return this._id(); },
            enumerable : true,
            configurable : false,
        } );
        const fields = Object.keys( this.constructor.modelFields );
        for ( let i = 0; i < fields.length; i++ ) {
            const field = fields[ i ];
            Object.defineProperty( this, field, {
                get : () => { return this._get( field ); },
                set : ( value ) => { this._set( field, value ); },
                enumerable : true,
                configurable : false,
            } );
        }
        this.#initialized = true;
    }

    /**
     * Get field value
     * @protected
     * @param {string} field - Field name
     * @return {*} - Field value
     */
    _get( field ) {
        return this.#data[ field ] ?? this.constructor.modelFields[ field ]?.value;
    }

    /**
     * Set field value
     * @protected
     * @param {string} field - Field name
     * @param {*} value - Field value
     * @return {void}
     */
    _set( field, value ) {
        if ( this.#data[ field ] !== value ) this.#changes = true;
        this.#data[ field ] = value;
    }

    /**
     * Get id
     * @protected
     * @return {string|null} - Model id
     */
    _id() { return this.#id; }

    /**
     * Setter: importId
     * @param {string} id - import id
     * @return {void}
     */
    set importId( id ) { this.#import_id = id; }

    /**
     * Getter: data
     * @return {Object} - Data
     */
    get data() {

        // const data = cloneObject( this.#data, true );
        const data = {};
        const keys = Object.keys( this.constructor.modelFields );
        for ( let i = 0; i < keys.length; i++ ) {
            const field = keys[ i ];
            data[ field ] = this._get( field );
        }
        data.id = this.#id;
        return data;
    }

    /**
     * Getter: dom
     * @return {null|HTMLElement} - Model dom
     */
    get dom() { return this.#dom[ this.constructor.modelType ] ?? null; }

    /**
     * View dom
     * @public
     * @param {string} name - Dom context name
     * @return {HTMLElement|null} - Model dom
     */
    view( name ) { return this.#dom[ name ] ?? null; }

    /**
     * Getter: children
     * @return {Element} - Model dom children container
     */
    get children() { return this.dom.querySelector( this.constructor.childrenHost ); }

    /**
     * Getter: iconType
     * @return {string} - Icon type
     */
    get iconType() {
        return isEmpty( this.icon ) ? 'menu' : 'font';
    }

    /**
     * Has changes
     * @public
     * @return {boolean} - Changes state
     */
    hasChanges() { return this.#changes; }

    /**
     * Assign data
     * @public
     * @param {Object} data - Data
     * @return {void}
     */
    assign( data ) {
        const result = this.constructor.validate( data );
        if ( !result.valid ) {
            if ( this.debug ) this.debug.error( data, result.errors );
            throw new ModelException( 'Failed to assign invalid data' );
        }
        const keys = Object.keys( this.constructor.modelFields );
        let changes = false;
        for ( let i = 0; i < keys.length; i++ ) {
            const field = keys[ i ];
            if ( typeof data[ field ] !== 'undefined' ) {
                if ( this.#data[ field ] !== data[ field ] ) changes = true;
                this.#data[ field ] = data[ field ];
            }
        }
        this.#changes = changes;
    }

    /**
     * Load model from id
     * @public
     * @param {string} id - Model id
     * @return {Promise<void>} - Returns nothing
     */
    async load( id ) {
        const type = this.constructor.modelType;
        const data = await this.constructor.storage.get( type + '_' + id );
        if ( !data ) throw new ModelException( `Model data not found for ${type}[${id}]` );
        let decoded;
        try {
            decoded = JSON.parse( data );
        } catch ( e ) {
            throw new ModelException( `Failed to decode model data for ${type}[${id}]`, e );
        }
        if ( !isPojo( decoded ) ) {
            throw new ModelException( `Corrupted model data for ${type}[${id}]` );
        }
        this.assign( decoded );
        this.#id = id;
        this.#changes = false;
        this.dispatchEvent( 'model.loaded' );
    }

    /**
     * Save model
     * @public
     * @param {boolean} noEvent - Do not trigger save event
     * @return {Promise<void>} - Returns nothing
     */
    async save( noEvent = false ) {
        if ( this.debug ) this.debug.log( this.constructor.name + `.save(${this.constructor.modelType}, ${this.#data.id || 'null'})` );
        if ( !this.constructor.storage ) throw new ModelException( 'Storage driver not available' );
        if ( !this.#changes ) return;

        // Encode model data
        let encoded;
        try {
            encoded = JSON.stringify( this.#data );
        } catch ( e ) {
            throw new ModelException( 'Failed to encode data' );
        }

        // Requires an index
        let needs_index_update = false, index;
        if ( !this.#id ) {
            index = await this.constructor.storage.requireIndex( this.constructor.modelType );
            this.#id = index.create( this.#import_id );
            this.#import_id = null;
            needs_index_update = true;
        }

        // Save entry
        await this.constructor.storage.set( this.constructor.modelType + '_' + this.#id, encoded );

        // Update index if entry was new
        if ( needs_index_update ) {
            await index.save();
        }
        this.#changes = false;
        if ( !noEvent ) this.dispatchEvent( 'model.saved', { created : needs_index_update } );
    }

    /**
     * Delete model
     * @public
     * @return {Promise<void>} - Returns nothing
     */
    async delete() {
        if ( this.debug ) this.debug.log( this.constructor.name + `.save(${this.constructor.modelType}, ${this.#data.id || 'null'})` );
        if ( !this.constructor.storage ) throw new ModelException( 'Storage driver not available' );

        // Require type index
        const index = await this.constructor.storage.requireIndex( this.constructor.modelType );

        // Delete entry
        await this.constructor.storage.remove( this.constructor.modelType + '_' + this.#id );

        // Clear id from index
        await index.delete( this.#id );
        this.#id = null;
        this.#changes = true;
        this.dispatchEvent( 'model.deleted' );
    }

    /**
     * Render model display
     * @public
     * @param {Object} params - Optional binder arguments
     * @return {HTMLElement} - Rendered and bound model view
     */
    render( params = {} ) {
        const tmpl = params.template ?? this.constructor.modelType;
        const target = params.append ?? this.parent.children;
        this.#dom[ tmpl ] = UiTemplateRenderer.node( {
            template : tmpl,
            data : this.data,
        } )[ 0 ];
        params.model = this;
        this.constructor.bind( this.#dom[ tmpl ], params );
        target.appendChild( this.#dom[ tmpl ] );
        return this.#dom[ tmpl ];
    }

    /**
     * Clear given dom name
     * @public
     * @param {string} tmpl - View name
     * @return {void}
     */
    clearRender( tmpl ) {
        if ( this.#dom[ tmpl ] ) delete this.#dom[ tmpl ];
    }

    /**
     * Update model dom
     * @public
     * @param {Object} stats - Stats object
     * @param {boolean} children - Include children
     * @return {void}
     */
    update( stats = true, children = false ) {
        const tmpl = this.constructor.modelType;
        if ( !this.#dom[ tmpl ] ) return;
        let nodes = [ ...this.#dom[ tmpl ].querySelectorAll( '[data-model-update]' ) ];
        if ( !children ) nodes = nodes.filter( ( node ) => { return !this.children.contains( node ); } );
        for ( let i = 0; i < nodes.length; i++ ) {
            const node = nodes[ i ];
            const updates = node.getAttribute( 'data-model-update' ).split( '|' );
            for ( let j = 0; j < updates.length; j++ ) {
                const [ dom, field, attr ] = updates[ j ].split( ':' );
                const value = strAccess( field, this, 1, this.debug );
                if ( !value && value !== 0 ) continue;
                switch ( dom ) {
                case 'text' : node.innerText = value; break;
                case 'html' : node.innerHTML = value; break;
                case 'attr' : node.setAttribute( attr, value );
                }
            }
        }
        if ( stats && this.updateAsync ) this.updateAsync();
    }

    /**
     * Is open check
     * @public
     * @return {boolean} - Open state
     */
    isOpen() { return this.dom.classList.contains( `${this.type}--open` ); }

    /**
     * Action open element
     * @public
     * @return {void}
     */
    actionOpen() {
        this.dispatchEvent( `${this.type}.open` );
        this.dom.classList.add( `${this.type}--open` );
        afterPaint( () => {
            this.dispatchEvent( `${this.type}.opened` );
        } );
    }

    /**
     * Action close element
     * @public
     * @return {void}
     */
    actionClose() {
        if ( this.isMaximized() ) this.actionMinimize();
        this.dispatchEvent( `${this.type}.close` );
        this.dom.classList.remove( `${this.type}--open` );
        afterPaint( () => {
            this.dispatchEvent( `${this.type}.closed` );
        } );
    }

    /**
     * Is maximized state
     * @public
     * @return {boolean} - Maximized state
     */
    isMaximized() { return this.dom.classList.contains( `${this.type}--maximized` ); }

    /**
     * Action maximize
     * @public
     * @return {void}
     */
    actionMaximize() {
        this.dispatchEvent( `${this.type}.maximize` );
        this.dom.classList.add( `${this.type}--maximized` );
        this.dom.setAttribute( 'data-is-maximized', 'true' );
        this.parent.children.setAttribute( 'data-has-maximized', 'true' );
        afterPaint( () => {
            this.dispatchEvent( `${this.type}.maximized` );
        } );
    }

    /**
     * Action minimize
     * @public
     * @return {void}
     */
    actionMinimize() {
        this.dispatchEvent( `${this.type}.minimize` );
        this.dom.classList.remove( `${this.type}--maximized` );
        this.dom.removeAttribute( 'data-is-maximized' );
        this.parent.children.removeAttribute( 'data-has-maximized' );
        afterPaint( () => {
            this.dispatchEvent( `${this.type}.minimized` );
        } );
    }
}
