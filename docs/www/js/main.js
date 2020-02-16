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

// MODULES //

var logger = require( 'debug' );
var replace = require( '@stdlib/string/replace' );
var lowercase = require( '@stdlib/string/lowercase' );
var Uint8Array = require( '@stdlib/array/uint8' );
var array2csv = require( './../../../lib/array2csv.js' );
var parse = require( './../../../lib' );


// VARIABLES //

var debug = logger( 'apple-card-csv:app' );


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	var LABEL_TEXT;
	var ERROR_TEXT;
	var $input;
	var $label;
	var $csv;
	var $err;

	$input = document.querySelector( '#file-input' );

	$err = document.querySelector( '#file-input-error-text' );
	ERROR_TEXT = $err.innerHTML;

	$label = $input.nextElementSibling;
	LABEL_TEXT = $label.innerHTML;

	$csv = document.querySelector( '#csv-list' );

	$input.addEventListener( 'change', onChange, false );

	/**
	* Callback invoked upon a 'change' event.
	*
	* @private
	* @param {Object} event - event object
	* @returns {void}
	*/
	function onChange( event ) {
		var reader;
		var count;
		var files;
		var file;
		var N;
		var f;
		var i;

		// Reset the error text:
		resetError();

		debug( 'Detected a change to the file input element...' );
		if ( !$input.files || $input.files.length === 0 ) {
			debug( 'No files selected. Aborting...' );
			resetLabel();
			return;
		}
		N = $input.files.length;
		debug( '%d files selected.', N );

		// Update the label text:
		$label.innerHTML = 'Converting...';

		// Initialize a counter:
		count = 0;

		// Process files...
		files = [];
		for ( i = 0; i < N; i++ ) {
			file = $input.files[ i ];

			debug( 'Loading file %d of %d: %s...', i+1, N, file.name );
			reader = new FileReader();
			files.push({
				'file': file,
				'reader': reader,
				'data': null
			});
			reader.onload = createOnLoad( i );
			reader.onerror = createOnError( i );
			reader.readAsArrayBuffer( file );
		}

		/**
		* Returns a callback to be invoked upon loading a file.
		*
		* @private
		* @param {number} idx - index
		* @returns {Callback} callback to be invoked upon loading a file
		*/
		function createOnLoad( idx ) {
			return onLoad;

			/**
			* Callback invoked upon loading a file.
			*
			* @private
			* @param {Object} event - event object
			* @returns {void}
			*/
			function onLoad( event ) {
				count += 1;

				debug( 'Successfully loaded file: %s.', files[ idx ].file.name );
				files[ idx ].data = event.target.result;

				if ( count === N ) {
					debug( 'Successfully loaded all files.' );
					return convert();
				}
			}
		}

		/**
		* Returns a callback to be invoked upon encountering an error when loading a file.
		*
		* @private
		* @param {number} idx - index
		* @returns {Callback} callback to be invoked upon loading a file
		*/
		function createOnError( idx ) {
			return onError;

			/**
			* Callback invoked upon encountering an error.
			*
			* @private
			* @param {Error} error - error object
			*/
			function onError( error ) {
				var file = files[ idx ].file.name;

				debug( 'Encountered an error when attempting to load file: %s. Error: %s', file, error.message );
				$err.innerHTML = 'Unable to load file: ' + file + '. Please ensure you have provided an exported statement PDF and try again.';
				abort();
			}
		}

		/**
		* Aborts pending file operations.
		*
		* @private
		*/
		function abort() {
			var i;
			for ( i = 0; i < N; i++ ) {
				if ( files[ i ].reader.readyState !== 2 ) {
					debug( 'Aborting %s...', files[ i ].file.name );
					files[ i ].reader.abort();
				}
			}
			resetLabel();
		}

		/**
		* Resets the file input label.
		*
		* @private
		*/
		function resetLabel() {
			$label.innerHTML = LABEL_TEXT;
		}

		/**
		* Resets the file input error text.
		*
		* @private
		*/
		function resetError() {
			$err.innerHTML = ERROR_TEXT;
		}

		/**
		* Resets file input elements.
		*
		* @private
		*/
		function reset() {
			resetLabel();
			resetError();
		}

		/**
		* Converts statement data to CSV.
		*
		* @private
		*/
		function convert() {
			var src;
			var i;

			src = [];
			for ( i = 0; i < N; i++ ) {
				src.push( new Uint8Array( files[ i ].data ) );
			}
			debug( 'Parsing statement data...' );
			parse( src, onParse );
		}

		/**
		* Callback invoked upon parsing statement data.
		*
		* @private
		* @param {(Error|null)} error - error object
		* @param {Array<object>} results - results
		* @returns {void}
		*/
		function onParse( error, results ) {
			var fname;
			var blob;
			var csv;
			var $li;
			var $a;
			var N;
			var d;
			if ( error ) {
				$err.innerHTML = 'Unable generate CSV. Please ensure you have provided an exported statement PDF and try again.';
				resetLabel();
				return;
			}
			debug( 'Successfully parsed statement data.' );
			N = results.length;
			debug( 'Number of transactions: %d', N );

			debug( 'Generating CSV...' );
			csv = array2csv( results );

			// Generate a human readable date range covering the transaction period:
			d = dateRange( results[ 0 ].Date, results[ N-1 ].Date );
			debug( 'Date range: %s', d );

			// Create an output filename:
			fname = createFilename( d );
			debug( 'Output filename: %s', fname );

			// Create a new link for downloading the results...
			$li = $csv.querySelector( 'li:first-child' ).cloneNode( true );
			$a = $li.querySelector( 'a' );
			$a.textContent = d + ': ' + N + ' transactions';
			$a.download = fname;
			blob = new Blob( [ csv ], {
				'type': 'text/csv'
			});
			$a.href = URL.createObjectURL( blob );

			// Append node to list of CSVs available for download:
			debug( 'Displaying download link...' );
			$csv.appendChild( $li );

			debug( 'Finished.' );
			done();
		}

		/**
		* Returns a human readable date range.
		*
		* @private
		* @param {string} start - starting date
		* @param {string} stop - ending date
		* @returns {string} human readable date range
		*/
		function dateRange( start, stop ) {
			var dopts;
			var d1;
			var d2;
			var d;

			dopts = {
				'year': 'numeric',
				'month': 'long'
			};
			d1 = new Date( start );
			d1 = d1.toLocaleString( 'default', dopts );

			d2 = new Date( stop );
			d2 = d2.toLocaleString( 'default', dopts );

			if ( d1 === d2 ) {
				d = d1;
			} else {
				d = d1 + ' to ' + d2;
			}
			return d;
		}

		/**
		* Generates an output filename.
		*
		* @private
		* @param {string} drange - human readable date range
		* @returns {string} output filename
		*/
		function createFilename( drange ) {
			return 'apple_card_statement_' + lowercase( replace( drange, ' ', '_' ) ) + '.csv';
		}

		/**
		* Callback invoked upon completion.
		*
		* @private
		*/
		function done() {
			reset();
		}
	}
}

main();
