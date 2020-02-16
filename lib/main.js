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
var parser = require( './parse.js' );
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
	a = Date.parse( a.Date );
	b = Date.parse( b.Date );
	if ( a < b ) {
		return -1;
	}
	if ( a > b ) {
		return 1;
	}
	return 0;
}


// MAIN //

/**
* Parses one or more Apple Card statements.
*
* @param {(Uint8Array|Array<Uint8Array>)} src - statement(s)
* @param {Callback} clbk - callback to invoke after conversion
*
* @example
* var readFileSync = require( '@stdlib/fs/read-file' ).sync;
*
* var src = readFileSync( '/path/to/apple-card/statement.pdf' );
*
* parse( src, done );
*
* function done( error, data ) {
*     if ( error ) {
*         return console.error( error.message );
*     }
*     console.log( data );
* }
*/
function parse( src, clbk ) {
	var results;
	var N;
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
	N = src.length;
	debug( 'Number of statements: %d.', N );

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
		var j;

		i += 1;
		if ( i === N ) {
			return done();
		}
		j = i + 1;
		debug( 'Loading statement %d of %d...', j, N );

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
		var j = i + 1;
		debug( 'Successfully loaded statement %d of %d.', j, N );
		debug( 'Processing statement %d of %d...', j, N );
		parser( doc, onParse );
	}

	/**
	* Callback invoked upon encountering an error.
	*
	* @private
	* @param {Error} error - error object
	*/
	function onError( error ) {
		var j = i + 1;
		debug( 'Encountered an error when attempting to load statement %d of %d. Error: %s', j, N, error.message );
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
		var j = i + 1;
		if ( error ) {
			debug( 'Encountered an error when attempting to process statement %d of %d. Error: %s', j, N, error.message );
			return done( error );
		}
		debug( 'Successfully processed statement %d of %d.', j, N );
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

		debug( 'Results: %s', JSON.stringify( results ) );
		clbk( null, results );
	}
}


// EXPORTS //

module.exports = parse;
