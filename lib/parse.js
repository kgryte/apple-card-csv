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
var round = require( '@stdlib/math/base/special/round' );
var isnan = require( '@stdlib/math/base/assert/is-nan' );
var hasOwnProp = require( '@stdlib/assert/has-own-property' );
var trim = require( '@stdlib/string/trim' );
var lowercase = require( '@stdlib/string/lowercase' );
var objectKeys = require( '@stdlib/utils/keys' );
var objectValues = require( '@stdlib/utils/values' );
var reverse = require( './reverse.js' );


// VARIABLES //

var debug = logger( 'apple-card-csv' );


// MAIN //

/**
* Parses a loaded Apple Card statement.
*
* @private
* @param {Object} doc - document
* @param {Callback} clbk - callback to invoke upon completion
*/
function parse( doc, clbk ) {
	var results;
	var i;

	debug( 'Parsing document...' );
	i = 1; // NOTE: transactions start on the second page
	results = [];

	next();

	/**
	* Processes the next page.
	*
	* @private
	*/
	function next() {
		var p;

		i += 1;
		if ( i === doc.numPages ) {
			debug( 'Finished processing document pages.' );
			return done();
		}
		debug( 'Loading page %d...', i );
		p = doc.getPage( i );
		p.then( onPageResolve ).catch( onError );
	}

	/**
	* Callback invoked upon resolving a document page.
	*
	* @private
	* @param {Object} page - page
	*/
	function onPageResolve( page ) {
		var p;

		debug( 'Resolved page %d.', i );
		p = page.getTextContent();
		p.then( onTextResolve ).catch( onError );
	}

	/**
	* Callback invoked upon resolving page text content.
	*
	* @private
	* @param {Object} content - page content
	* @returns {void}
	*/
	function onTextResolve( content ) {
		var items;
		var item;
		var keys;
		var type;
		var str;
		var row;
		var o;
		var h;
		var v;
		var c;
		var x;
		var y;
		var j;

		debug( 'Resolved content of page %d.', i );
		items = content.items;

		debug( 'Extracting %d page items...', items.length );
		o = {};
		for ( j = 0; j < items.length; j++ ) {
			item = items[ j ];
			str = trim( item.str );
			if ( str === '' ) {
				continue;
			}
			debug( 'Item %d: %s', j, str );

			// The "x-position" for each transaction column can vary, so we scale the value within an acceptable range:
			x = round( item.transform[ 4 ] / 5 );

			// The "y-position" allows us to group transaction columns, as text items which have the same `y` position belong to the same row:
			y = round( item.transform[ 5 ] );
			if ( !hasOwnProp( o, y ) ) {
				o[ y ] = {};
			}
			o[ y ][ x ] = str;
		}
		o = reverse( objectValues( o ) );
		if ( o.length < 3 ) {
			debug( 'Page %d contains insufficient data to be a statement. Skipping...', i );
			return next();
		}
		// Remove the footer:
		o.length -= 2;

		// Extract customer information:
		h = o.splice( 0, 3 );

		// Verify that we have a statement page...
		v = objectValues( h[ 0 ] )[ 0 ];
		if ( !v || lowercase( v ) !== 'statement' ) {
			debug( 'Unable to confirm that page %d is a statement. Missing "Statement" identifier. Skipping...', i );
			return next();
		}
		v = objectValues( h[ 1 ] )[ 0 ];
		if ( !v || lowercase( v ) !== 'apple card customer' ) {
			debug( 'Unable to confirm that page %d is a statement. Missing "Apple Card Customer" identifier. Skipping...', i );
			return next();
		}
		debug( 'Processing page rows...' );
		debug( 'Number of rows: %d', o.length );
		for ( j = 0; j < o.length; j++ ) {
			debug( 'Processing row %d...', j );
			v = o[ j ];

			keys = objectKeys( v );
			debug( 'Number of columns: %d.', keys.length );

			// Check whether the row denotes a transaction type...
			c = Date.parse( v[ 7 ] );
			if ( isnan( c ) && keys.length === 1 ) {
				if ( row ) {
					debug( 'Transaction: %s', JSON.stringify( row ) );
					results.push( row );
					row = null;
				}
				type = v[ 7 ];
				debug( 'Unable to parse first column as a date. As the row only contains one column, assuming that this row denotes a transaction type. Row: %s. Type: %s.', JSON.stringify( v ), type );
				continue;
			}
			// Check for a transaction description...
			c = v[ 21 ];
			if ( !c ) {
				debug( 'Row is missing a transaction description. Row: %s. Skipping...', JSON.stringify( v ) );
				continue;
			}
			if ( keys.length === 1 ) {
				debug( 'Row appears to be a continuation of the previous transaction description. Appending to previous description...' );
				row.description += '\n' + c;
				continue;
			}
			// Check for a transaction date...
			c = v[ 9 ] || v[ 7 ];
			if ( isnan( Date.parse( c ) ) ) {
				debug( 'Unable to parse first column as a date. Value: `%s`. Row: %s. Skipping...', c, JSON.stringify( v ) );
				continue;
			}
			// Check if we need to push a transaction row...
			if ( row ) {
				debug( 'Transaction: %s', JSON.stringify( row ) );
				results.push( row );
			}
			row = {
				'Date': c,
				'Type': type,
				'Description': v[ 21 ],
				'Daily Cash (%)': v[ 85 ] || v[ 83 ],
				'Daily Cash ($)': v[ 89 ],
				'Amount': v[ 111 ] || v[ 110 ] || v[ 109 ] || v[ 108 ] || v[ 107 ] // the amount column can vary in its `x` position
			};
		}
		// Check for a transaction row...
		if ( row ) {
			debug( 'Transaction: %s', JSON.stringify( row ) );
			results.push( row );
		}
		// Move on to the next page:
		debug( 'Finished processing page.' );
		next();
	}

	/**
	* Callback invoked upon encountering an error.
	*
	* @private
	* @param {Error} error - error object
	*/
	function onError( error ) {
		debug( 'Encountered an error when attempting to parse document %d. Error: %s', i, error.message );
		done( error );
	}

	/**
	* Callback invoked upon completion.
	*
	* @private
	* @param {Error} [error] - error object
	*/
	function done( error ) {
		if ( error ) {
			return clbk( error );
		}
		debug( 'Transactions: %s', JSON.stringify( results ) );
		clbk( null, results );
	}
}


// EXPORTS //

module.exports = parse;
