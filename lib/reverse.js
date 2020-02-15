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

var floor = require( '@stdlib/math/base/special/floor' );


// MAIN //

/**
* Reverses an array in-place.
*
* @private
* @param {Array} arr - input array
* @returns {Array} input array
*
* @example
* var arr = [ 1, 2, 3, 4 ];
*
* var out = reverse( arr );
* // returns [ 4, 3, 2, 1 ];
*
* @example
* var arr = [ 1, 2, 3 ];
*
* var out = reverse( arr );
* // returns [ 3, 2, 1 ]
*/
function reverse( arr ) {
	var len;
	var tmp;
	var N;
	var i;
	var j;

	len = arr.length;
	N = len - 1;
	for ( i = 0; i < floor( len/2 ); i++ ) {
		tmp = arr[ i ];
		j = N - i;
		arr[ i ] = arr[ j ];
		arr[ j ] = tmp;
	}
	return arr;
}


// EXPORTS //

module.exports = reverse;
