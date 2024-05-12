/**
 * Requires
 */
const path = require( 'path' );

/**
 * Local dev config
 * @type {Object}
 */
module.exports = {
    resolve: {
        modules: [

            // Load from parent directories, for local dev copies
            path.resolve(__dirname, '../../'),
            path.resolve(__dirname, '../../../'),

            // Fallback to installed modules
            './node_modules',
        ],
    },
};
