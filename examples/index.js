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

var join = require( 'path' ).join;
var readFileSync = require( 'fs' ).readFileSync;
var convert = require( './../lib' );

var src = readFileSync( join( __dirname, 'fixtures', 'statement.pdf' ) );

convert( src, done );

function done( error, csv ) {
	if ( error ) {
		return console.error( error.message );
	}
	console.log( csv );
}