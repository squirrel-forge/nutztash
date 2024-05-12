/**
 * Requires
 */
import { Exception } from '@squirrel-forge/ui-util';

/**
 * Storage index exception
 * @class
 * @extends Exception
 */
class StorageIndexException extends Exception {}

/**
 * Storage index
 * @class
 */
export class StorageIndex {

    /**
     * Model type
     * @private
     * @type {string}
     */
    #type;

    /**
     * Storage reference
     * @private
     * @type {Storage}
     */
    #storage;

    /**
     * Index array
     * @private
     * @type {string[]}
     */
    #index = [];

    /**
     * Index entry id prefix
     * @private
     * @type {string}
     */
    #prefix = 'index_';

    /**
     * Loaded state
     * @private
     * @type {boolean}
     */
    #loaded = false;

    /**
     * Constructor
     * @constructor
     * @param {Storage} storage - Storage reference
     * @param {string} type - Model type
     */
    constructor( storage, type ) {
        this.#storage = storage;
        this.#type = type;
    }

    /**
     * Getter: storage
     * @return {Storage} - Storage reference
     */
    get storage() { return this.#storage; }

    /**
     * Getter: type
     * @return {string} - Model type
     */
    get type() { return this.#type; }

    /**
     * Getter: list
     * @return {string[]} - Cuttent index list
     */
    get list() { return this.#index.slice(); }

    /**
     * Async each index
     * @public
     * @param {Function} callback - Async callback
     * @return {Promise<void>} - Returns nothing
     */
    async each( callback ) {
        for ( let i = 0; i < this.#index.length; i++ ) {
            await callback( this.#index[ i ] );
        }
    }

    /**
     * Load index
     * @public
     * @return {Promise<void>} - Returns nothing
     */
    async load() {
        if ( this.#loaded ) return;

        // Fetch index
        let data = await this.#storage.get( this.#prefix + this.#type );

        // Start with fresh blank index
        if ( !data ) {
            this.#loaded = true;
            return;
        }

        // Parse existing index
        if ( typeof data === 'string' && data.length ) {
            try {
                data = JSON.parse( data );
            } catch ( e ) {
                throw new StorageIndexException( `Data index failed to decode for "${this.type}"` );
            }
        }

        // Must be an array of ids
        if ( !( data instanceof Array ) ) {
            throw new StorageIndexException( `Data index corrupted for "${this.type}"` );
        }
        this.#index = data;
        this.#loaded = true;
    }

    /**
     * Create new index id
     * @public
     * @param {null|string} id - Optional new index
     * @return {string} - New id
     */
    create( id = null ) {

        // Create new unique
        if ( !id ) {
            do {
                id = crypto.randomUUID();
            } while ( this.#index.includes( id ) );
        } else if ( this.#index.includes( id ) ) {
            throw new StorageIndexException( `Id already exists "${id}"` );
        }

        // Add and return
        this.#index.push( id );
        return id;
    }

    /**
     * Save index state
     * @public
     * @return {Promise<void>} - Returns nothing
     */
    async save() {
        let encoded;

        // Encode index
        try {
            encoded = JSON.stringify( this.#index );
        } catch ( e ) {
            throw new StorageIndexException( `Failed to encode index for "${this.type}"`, e );
        }

        // Save to storage
        try {
            await this.#storage.set( this.#prefix + this.#type, encoded );
        } catch ( e ) {
            throw new StorageIndexException( `Failed to save index for "${this.type}"`, e );
        }
    }

    /**
     * Delete given index
     * @public
     * @param {string} index - Index to delete
     * @return {Promise<void>} - Returns nothing
     */
    async delete( index ) {
        const i = this.#index.indexOf( index );
        if ( i > -1 ) {
            this.#index.splice( i, 1 );
            await this.save();
        }
    }

    /**
     * Reorder key subset
     * @public
     * @param {string[]} subset - Reordered subset
     * @return {Promise<void>} - Returns nothing
     */
    async reorder( subset ) {
        const filtered = this.#index.filter( ( v ) => { return !subset.includes( v ); } );
        this.#index = filtered.concat( subset );
        await this.save();
    }
}
