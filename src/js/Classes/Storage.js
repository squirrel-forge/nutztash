/**
 * Requires
 */
import { EventDispatcher, Exception, LStorage, convertBytes } from '@squirrel-forge/ui-util';
import { StorageIndex } from './StorageIndex';

/**
 * Local storage exception
 * @class
 * @extends Exception
 */
class StorageException extends Exception {}

/**
 * Storage
 * @class
 * @extends EventDispatcher
 */
export class Storage extends EventDispatcher {

    /**
     * Local storage
     * @private
     * @type {LStorage}
     */
    #local;

    /**
     * Model index map
     * @private
     * @type {Object<string, StorageIndex>}
     */
    #index = {};

    /**
     * Model constructor map
     * @private
     * @type {Object<string, Model>}
     */
    #models = {};

    /**
     * Current driver
     * @private
     * @type {string}
     */
    #driver = 'local';

    /**
     * Available drivers
     * @private
     * @type {string[]}
     */
    #drivers = [ 'local' ];

    /**
     * Constructor
     * @constructor
     * @param {null|Application|EventDispatcher} app - Parent instance
     * @param {null|Console} debug - Debug mode
     */
    constructor( app, debug ) {
        super( null, app, debug );
        this.#local = new LStorage( 'ntz_' );
    }

    /**
     * Getter: Local storage
     * @public
     * @return {LStorage} - Local storage instance
     */
    get local() { return this.#local; }

    /**
     * Load available driver and data
     * @public
     * @param {Model[]} types - Model constructors
     * @return {Promise<void>} - No return value
     */
    async load( types ) {
        if ( this.debug ) this.debug.log( this.constructor.name + '.load()' );
        if ( !types || !types.length ) throw new StorageException( 'Requires at least one data type' );

        // Verify driver
        let driver = this.local.get( 'driver' );
        if ( driver && !this.#drivers.includes( driver ) ) {
            throw new StorageException( `Unknown storage driver "${driver}"` );
        }
        if ( !driver ) {
            if ( this.debug ) this.debug.log( this.constructor.name + '.load() using default localStorage driver' );
            driver = this.#driver;
        }

        // Register data models
        for ( let i = 0; i < types.length; i++ ) {
            this.#register_model( types[ i ] );
        }
        if ( this.debug ) this.debug.log( this.constructor.name + `.load() registered ${types.length} data types` );

        // Boot driver
        try {

            // Driver specifics
            if ( driver === 'local' ) {
                if ( this.debug ) {
                    const size = await LStorage.getCurrentSize();
                    this.debug.log( this.constructor.name + `.load(${driver}) ${convertBytes( size )} in use.` );
                }
            }
        } catch ( e ) {
            throw new StorageException( `Failed to initialize storage driver "${driver}"`, e );
        }
        this.dispatchEvent( 'storage.ready' );
    }

    /**
     * Register data model
     * @private
     * @param {Model|Function} Constructor - Model constructor
     * @return {void}
     */
    #register_model( Constructor ) {
        if ( this.#models[ Constructor.modelType ] ) {
            throw new StorageException( `Model "${Constructor.modelType}" already defined` );
        }
        this.#models[ Constructor.modelType ] = Constructor;
    }

    /**
     * Get current storage size
     * @public
     * @param {boolean} convert - Convert result
     * @return {Promise<string|number>} - Current size
     */
    async storageSize( convert = true ) {
        const size = await LStorage.getCurrentSize();
        if ( convert ) return convertBytes( size );
        return size;
    }

    /**
     * Getter: models
     * @return {Object<string, Model>} - Model map
     */
    get models() { return this.#models; }

    /**
     * Verify type
     * @private
     * @param {string} type - Model type
     * @return {Model} - Model constructor
     */
    #verify_type( type ) {
        if ( !this.#models[ type ] ) {
            throw new StorageException( `Unknown type "${type}"` );
        }
        return this.#models[ type ];
    }

    /**
     * Require index for type
     * @public
     * @param {string} type - Model type
     * @return {Promise<StorageIndex>} - Type storage index
     */
    async requireIndex( type ) {
        this.#verify_type( type );
        if ( !this.#index[ type ] ) {
            this.#index[ type ] = new StorageIndex( this, type );
            await this.#index[ type ].load();
        }
        return this.#index[ type ];
    }

    /**
     * Check type has data
     * @public
     * @param {string} type - Model type
     * @return {Promise<boolean>} - Data not empty state
     */
    async typeHasData( type ) {
        this.#verify_type( type );
        const index = await this.requireIndex( type );
        const data = index.list;
        if ( this.debug ) this.debug.log( `Storage.typeHasData(${type}) ${data.length} entries` );
        return !!data.length;
    }

    /**
     * Get model list of type
     * @public
     * @param {string} type - Model type
     * @param {Model|View} parent - Parent instance
     * @return {Promise<Model[]>} - Loaded models
     */
    async typeList( type, parent = null ) {
        const Constructor = this.#verify_type( type );
        const index = await this.requireIndex( type );
        const models = [];
        await index.each( async( id ) => {
            const model = new Constructor( null, parent );
            model.load( id );
            models.push( model );
        } );
        return models;
    }

    /**
     * Get item
     * @public
     * @param {string} id - Item id
     * @return {Promise<string>} - Item value
     */
    async get( id ) {
        const driver = this[ this.#driver ];
        if ( this.debug ) this.debug.warn( `Storage.get(${this.#driver}::${id})` );
        const value = await driver.get( id );
        return value;
    }

    /**
     * Set item
     * @public
     * @param {string} id - Item id
     * @param {string} value - Item value
     * @return {Promise<void>} - Returns nothing
     */
    async set( id, value ) {
        if ( this.debug ) this.debug.log( `Storage.set(${this.#driver}::${id})` );
        if ( typeof id !== 'string' || !id.length ) throw new StorageException( 'First argument id must be a non empty string' );
        if ( typeof value !== 'string' ) throw new StorageException( 'Second argument value must be a string' );
        const driver = this[ this.#driver ];
        await driver.set( id, value );
    }

    /**
     * Remove item
     * @public
     * @param {string} id - Item id
     * @return {Promise<void>} - Returns nothing
     */
    async remove( id ) {
        if ( this.debug ) this.debug.log( `Storage.remove(${this.#driver}::${id})` );
        if ( typeof id !== 'string' || !id.length ) throw new StorageException( 'First argument id must be a non empty string' );
        const driver = this[ this.#driver ];
        await driver.remove( id );
    }

    /**
     * Clear storage
     * @public
     * @return {Promise<void>} - Returns nothing
     */
    async clear() {
        const driver = this[ this.#driver ];
        await driver.clear();
    }
}
