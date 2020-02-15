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

/**
* Convert Apple Card statements to CSV.
*
* @module apple-card-csv
*
* @example
* var readFileSync = require( '@stdlib/fs/read-file' ).sync;
* var convert = require( 'apple-card-csv' );
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

// MODULES //

var convert = require( './main.js' );


// EXPORTS //

module.exports = convert;
