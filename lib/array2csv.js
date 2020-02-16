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

var objectKeys = require( '@stdlib/utils/keys' );
var replace = require( '@stdlib/string/replace' );


// MAIN //

/**
* Converts an object array to CSV.
*
* @private
* @param {Array<Object>} arr - input array
* @returns {string} CSV
*/
function array2csv( arr ) {
	var keys;
	var out;
	var tmp;
	var row;
	var N;
	var i;
	var j;

	out = [];

	// Generate the header...
	keys = objectKeys( arr[ 0 ] );
	out.push( keys.join( ',' ) );

	// Generate the rows...
	N = keys.length;
	tmp = new Array( N );
	for ( i = 0; i < arr.length; i++ ) {
		row = arr[ i ];
		for ( j = 0; j < N; j++ ) {
			tmp[ j ] = '"' + replace( row[ keys[j] ] || '', '"', '\\"' ) + '"';
		}
		out.push( tmp.join( ',' ) );
	}
	return out.join( '\n' );
}


// EXPORTS //

module.exports = array2csv;
