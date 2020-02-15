/**
* @license Apache-2.0
*
* Copyright (c) 2020 Athan Reines.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// MODULES //

var logger = require( 'debug' );
var pdf = require( 'pdfjs-dist' );
var isUint8Array = require( '@stdlib/assert/is-uint8array' );
var isArray = require( '@stdlib/assert/is-array' );
var isFunction = require( '@stdlib/assert/is-function' );
var append = require( '@stdlib/utils/append' );
var parse = require( './parse.js' );
var array2csv = require( './array2csv.js' );


// VARIABLES //

var debug = logger( 'apple-card-csv' );


// FUNCTIONS //

/**
* Comparison function for sorting transactions.
*
* @private
* @param {Object} a - first transaction
* @param {Object} b - second transaction
* @returns {number} sort order
*/
function comparator( a, b ) {
	if ( a.Date < b.Date ) {
		return -1;
	}
	if ( a.Date === b.Date ) {
		return 0;
	}
	return 1;
}


// MAIN //

/**
* Converts an Apple Card statement to CSV.
*
* @param {(Uint8Array|Array<Uint8Array>)} src - statement(s)
* @param {Callback} clbk - callback to invoke after conversion
*
* @example
* var readFileSync = require( 'fs' ).readFileSync;
*
* var src = readFileSync( '/path/to/apple-card/statement.pdf' );
*
* convert( src, done );
*
* function done( error, csv ) {
*     if ( error ) {
*         return console.error( error.message );
*     }
*     console.log( csv );
* }
*/
function convert( src, clbk ) {
	var results;
	var i;
	if ( isUint8Array( src ) ) {
		src = [ src ];
	} else if ( isArray( src ) ) {
		for ( i = 0; i < src.length; i++ ) {
			if ( !isUint8Array( src[ i ] ) ) {
				throw new TypeError( 'invalid argument. First argument must be either a Uint8Array or an array of Uint8Arrays. Value: `' + src + '`.' );
			}
		}
	} else {
		throw new TypeError( 'invalid argument. First argument must be either a Uint8Array or an array of Uint8Arrays. Value: `' + src + '`.' );
	}
	if ( !isFunction( clbk ) ) {
		throw new TypeError( 'invalid argument. Last argument must be a function. Value: `' + clbk + '`.' );
	}
	debug( 'Number of statements: %d', src.length );

	results = [];
	i = -1;

	next();

	/**
	* Processes the next statement.
	*
	* @private
	* @returns {void}
	*/
	function next() {
		var p;

		i += 1;
		if ( i === src.length ) {
			return done();
		}
		debug( 'Loading statement %d...', i );
		p = pdf.getDocument( src[ i ] ).promise;
		p.then( onResolve ).catch( onError );
	}

	/**
	* Callback invoked upon loading a statement document.
	*
	* @private
	* @param {Object} doc - loaded statement document
	*/
	function onResolve( doc ) {
		debug( 'Successfully loaded statement %d.', i );
		debug( 'Processing statement %d...', i );
		parse( doc, onParse );
	}

	/**
	* Callback invoked upon encountering an error.
	*
	* @private
	* @param {Error} error - error object
	*/
	function onError( error ) {
		debug( 'Encountered an error when attempting to load statement %d. Error: %s', i, error.message );
		done( error );
	}

	/**
	* Callback invoked upon parsing a statement.
	*
	* @private
	* @param {(Error|null)} error - error object
	* @param {Array<Object>} [data] - results
	* @returns {void}
	*/
	function onParse( error, data ) {
		if ( error ) {
			debug( 'Encountered an error when attempting to process statement %d. Error: %s', i, error.message );
			return done( error );
		}
		debug( 'Successfully processed statement %d.', i );
		append( results, data );
		next();
	}

	/**
	* Callback invoked upon completion.
	*
	* @private
	* @param {(Error|null)} error - error object
	* @returns {void}
	*/
	function done( error ) {
		if ( error ) {
			return clbk( error );
		}
		debug( 'Finished processing all statements.' );

		debug( 'Sorting transactions...' );
		results.sort( comparator );
		debug( 'Sorted transactions: %s', JSON.stringify( results ) );

		debug( 'Generating CSV...' );
		results = array2csv( results );

		debug( 'Results: %s', results );
		clbk( null, results );
	}
}


// EXPORTS //

module.exports = convert;
