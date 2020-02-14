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

var pdf = require( 'pdfjs-dist' );
var parse = require( './parse.js' );


// MAIN //

/**
* Converts an Apple Card statement to CSV.
*
* @param {Uint8Array} src - raw statement data
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
	if ( !(src instanceof Uint8Array) ) {
		throw new TypeError( 'invalid argument. First argument must be a Uint8Array. Value: `' + src + '`.' );
	}
	if ( typeof clbk !== 'function' ) {
		throw new TypeError( 'invalid argument. Last argument must be a function. Value: `' + clbk + '`.' );
	}
	p = pdf.getDocument( src ).promise;
	p.resolve( onResolve ).catch( onError );

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
	* @param {string} [result] - result
	* @returns {void}
	*/
	function done( error, result ) {
		if ( error ) {
			return clbk( error );
		}
		clbk( null, result );
	}
}


// EXPORTS //

module.exports = convert;
