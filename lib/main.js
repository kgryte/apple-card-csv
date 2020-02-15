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
var isFunction = require( '@stdlib/assert/is-function' );
var parse = require( './parse.js' );
var array2csv = require( './array2csv.js' );


// VARIABLES //

var debug = logger( 'apple-card-csv' );


// MAIN //

/**
* Converts an Apple Card statement to CSV.
*
* @param {Uint8Array} src - statement
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
	var p;
	if ( !isUint8Array( src ) ) {
		throw new TypeError( 'invalid argument. First argument must be a Uint8Array. Value: `' + src + '`.' );
	}
	if ( !isFunction( clbk ) ) {
		throw new TypeError( 'invalid argument. Last argument must be a function. Value: `' + clbk + '`.' );
	}
	p = pdf.getDocument( src ).promise;
	p.then( onResolve ).catch( onError );

	/**
	* Callback invoked upon loading a document.
	*
	* @private
	* @param {Object} doc - loaded document
	*/
	function onResolve( doc ) {
		parse( doc, done );
	}

	/**
	* Callback invoked upon encountering an error.
	*
	* @private
	* @param {Error} error - error object
	*/
	function onError( error ) {
		done( error );
	}

	/**
	* Callback invoked upon completion.
	*
	* @private
	* @param {(Error|null)} error - error object
	* @param {string} [results] - results
	* @returns {void}
	*/
	function done( error, results ) {
		if ( error ) {
			return clbk( error );
		}
		debug( 'Converting to CSV...' );
		results = array2csv( results );

		debug( 'Results: %s', results );
		clbk( null, results );
	}
}


// EXPORTS //

module.exports = convert;
