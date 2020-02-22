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

'use strict';

// VARIABLES //

var DOPTS = {
	'year': 'numeric',
	'month': 'long'
};


// MAIN //

/**
* Returns a human readable date range.
*
* @private
* @param {string} start - starting date
* @param {string} stop - ending date
* @returns {string} human readable date range
*/
function dateRange( start, stop ) {
	var d1;
	var d2;
	var d;

	d1 = new Date( start );
	d1 = d1.toLocaleString( 'default', DOPTS );

	d2 = new Date( stop );
	d2 = d2.toLocaleString( 'default', DOPTS );

	if ( d1 === d2 ) {
		d = d1;
	} else {
		d = d1 + ' to ' + d2;
	}
	return d;
}


// EXPORTS //

module.exports = dateRange;
