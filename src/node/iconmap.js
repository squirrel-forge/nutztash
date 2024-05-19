/**
 * Requires
 */
const { cfx } = require( '@squirrel-forge/node-cfx' );
const { FsInterface } = require( '@squirrel-forge/node-util' );

/**
 * Options
 * @type {Object}
 */
const options = {
    unicodeLocal : './src/generated/UnicodeData.txt',
    unicodeRemote : 'https://unicode.org/Public/UNIDATA/UnicodeData.txt',
    iconsIndex : './src/generated/icons.js',
};

/**
 * Unicode ranges
 * @type {string[][]}
 */
const ranges = [

    // Miscellaneous Symbols and Pictographs [ '1f300', '1f5ff' ]
    // @url https://symbl.cc/en/unicode/blocks/miscellaneous-symbols-and-pictographs/
    [ '1f300', '1f321' ],
    [ '1f324', '1f393' ],
    [ '1f3a0', '1f3f0' ],
    [ '1f3f4', '1f3f5' ],
    [ '1f3f7', '1f3fa' ],
    [ '1f400', '1f53d' ],
    [ '1f54b', '1f54e' ],
    [ '1f550', '1f567' ],
    [ '1f574', '1f57a' ],
    [ '1f590' ],
    [ '1f595', '1f596' ],
    [ '1f5a4', '1f5a5' ],
    [ '1f5a8' ],
    [ '1f5b2' ],
    [ '1f5bc' ],
    [ '1f5c2', '1f5c4' ],
    [ '1f5d1', '1f5d3' ],
    [ '1f5dc', '1f5de' ],
    [ '1f5e1' ],
    [ '1f5e3' ],
    [ '1f5e8' ],
    [ '1f5f3' ],
    [ '1f5fa', '1f5ff' ],
];

/**
 * Find unicode name
 * @param {string} hex - Unicode
 * @param {Array} info - Unicode data array
 * @return {string} - Hex or name
 */
function findName( hex, info ) {
    for ( let i = 0; i < info.length; i++ ) {
        const [ check, name ] = info[ i ] instanceof Array ? info[ i ] : info[ i ].split( ';' );
        info[ i ] = [ check, name ];
        if ( check.toLowerCase() === hex ) return name;
    }
    return hex;
}

/**
 * Generate entries for each unicode in range
 * @param {Array} result - Result array
 * @param {Array} info - Unicode data array
 * @param {string|number} start - Unicode start range
 * @param {null|string|number} end - Unicode end range
 * @return {void}
 */
function processRange( result, info, start, end = null ) {
    if ( end === null || typeof end === 'undefined' ) end = start;
    if ( typeof start === 'string' ) start = parseInt( start, 16 );
    if ( typeof end === 'string' ) end = parseInt( end, 16 );
    for ( let i = start; i <= end; i++ ) {
        result.push( [ findName( i.toString( 16 ), info ), `&#${i};` ] );
    }
}

/**
 * Generate unicode description array export file
 * @return {Promise<void>} - Returns nothing
 */
async function generate() {
    let info;
    const result = [];

    // Download/read and prepare unicode data source
    const exists = await FsInterface.exists( options.unicodeLocal );
    if ( !exists ) {
        info = await FsInterface.remoteText( options.unicodeRemote );
        await FsInterface.write( options.unicodeLocal, info );
        cfx.success( `Downloaded ${options.unicodeRemote}` );
    } else {
        info = await FsInterface.readText( options.unicodeLocal );
    }
    info = info.split( '\n' );
    cfx.success( `Loaded ${options.unicodeLocal}` );

    // Process each defined range
    cfx.info( ` - Processing ${ranges.length} range${ranges.length === 1 ? '' : 's'}` );
    for ( let i = 0; i < ranges.length; i++ ) {
        processRange( result, info, ...ranges[ i ] );
    }
    cfx.info( ` - Processed ${result.length} icon${result.length === 1 ? '' : 's'}` );

    // Define icons file export and write file
    const content = 'export const iconsOptions = ' + JSON.stringify( result ) + ';\n';
    await FsInterface.write( options.iconsIndex, content );
}

/**
 * Generate icons export file
 */
generate().then( () => {
    cfx.success( `Updated ${options.iconsIndex}` );
} );
