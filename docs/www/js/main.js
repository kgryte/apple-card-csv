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
var Uint8Array = require( '@stdlib/array/uint8' );
var array2csv = require( './../../../lib/array2csv.js' );
var parse = require( './../../../lib' );
var dateRange = require( './date_range.js' );
var createFilename = require( './create_filename.js' );


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
	var $drag;
	var $csv;
	var $err;

	$drag = document.querySelector( '#drap-and-drop-area' );
	$input = document.querySelector( '#file-input' );

	$err = document.querySelector( '#file-input-error-text' );
	ERROR_TEXT = $err.innerHTML;

	$label = $input.nextElementSibling;
	LABEL_TEXT = $label.innerHTML;

	$csv = document.querySelector( '#csv-list' );

	$input.addEventListener( 'change', onChange, false );

	$drag.addEventListener( 'dragstart', onDragStart, false );
	$drag.addEventListener( 'dragenter', onDragEnter, false );
	$drag.addEventListener( 'dragover', onDragOver, false );
	$drag.addEventListener( 'dragleave', onDragLeave, false );
	$drag.addEventListener( 'dragend', onDragEnd, false );
	$drag.addEventListener( 'drop', onDrop, false );

	/**
	* Callback invoked upon a 'dragstart' event.
	*
	* @private
	* @param {Object} event - event object
	*/
	function onDragStart( event ) {
		debug( 'Detected a "dragstart" event...' );
		resetError();

		event.preventDefault(); // prevent file(s) from being opened
		event.stopPropagation();
	}

	/**
	* Callback invoked upon a 'dragend' event.
	*
	* @private
	* @param {Object} event - event object
	*/
	function onDragEnd( event ) {
		debug( 'Detected a "dragend" event...' );
		event.preventDefault(); // prevent file(s) from being opened
		event.stopPropagation();

		$drag.classList.remove( 'drag-and-drop-area-highlight' );
	}

	/**
	* Callback invoked upon a 'dragenter' event.
	*
	* @private
	* @param {Object} event - event object
	*/
	function onDragEnter( event ) {
		debug( 'Detected a "dragenter" event...' );
		event.preventDefault(); // prevent file(s) from being opened
		event.stopPropagation();

		$drag.classList.add( 'drag-and-drop-area-highlight' );
	}

	/**
	* Callback invoked upon a 'dragover' event.
	*
	* @private
	* @param {Object} event - event object
	*/
	function onDragOver( event ) {
		debug( 'Detected a "dragover" event...' );
		event.preventDefault(); // prevent file(s) from being opened
		event.stopPropagation();

		$drag.classList.add( 'drag-and-drop-area-highlight' );
	}

	/**
	* Callback invoked upon a 'dragleave' event.
	*
	* @private
	* @param {Object} event - event object
	*/
	function onDragLeave( event ) {
		debug( 'Detected a "dragleave" event...' );
		event.preventDefault(); // prevent file(s) from being opened
		event.stopPropagation();

		$drag.classList.remove( 'drag-and-drop-area-highlight' );
	}

	/**
	* Callback invoked upon a 'drop' event.
	*
	* @private
	* @param {Object} event - event object
	* @returns {void}
	*/
	function onDrop( event ) {
		var files;
		var dt;
		var f;
		var i;

		debug( 'Detected a "drop" event...' );

		event.preventDefault(); // prevent file(s) from being opened
		event.stopPropagation();

		$drag.classList.remove( 'drag-and-drop-area-highlight' );

		dt = event.dataTransfer;
		files = [];
		if ( dt.items ) {
			debug( 'Number of items: %d', dt.items.length );

			// Use `DataTransferItemList` interface to access file(s)...
			for ( i = 0; i < dt.items.length; i++ ) {
				f = dt.items[ i ];

				// Only accept files...
				if ( f.kind !== 'file' ) {
					debug( 'Unrecognized data transfer type: %s.', f.kind );
					$err.innerHTML = 'Invalid operation. Please provide an exported statement PDF and try again.';
					return;
				}
				f = f.getAsFile();

				// Only accept PDF files...
				if ( f.type !== 'application/pdf' ) {
					debug( 'Unable to load file: %s. File does not have supported MIME type: %s.', f.name, f.type );
					$err.innerHTML = 'Unable to load file: ' + f.name + '. Invalid file type. Please ensure you have provided an exported statement PDF and try again.';
					return;
				}
				files.push( f );
			}
		} else {
			debug( 'Number of items: %d', dt.files.length );

			// Use `DataTransfer` interface to access file(s)...
			for ( i = 0; i < dt.files.length; i++ ) {
				f = dt.files[ i ];

				// Only accept PDF files...
				if ( f.type !== 'application/pdf' ) {
					debug( 'Unable to load file: %s. File does not have supported MIME type: %s.', f.name, f.type );
					$err.innerHTML = 'Unable to load file: ' + f.name + '. Invalid file type. Please ensure you have provided an exported statement PDF and try again.';
					return;
				}
				files.push( f );
			}
		}
		if ( files.length === 0 ) {
			debug( 'No files selected. Aborting...' );
			resetLabel();
			return;
		}
		process( files );
	}

	/**
	* Callback invoked upon a 'change' event.
	*
	* @private
	* @param {Object} event - event object
	* @returns {void}
	*/
	function onChange( event ) {
		debug( 'Detected a change to the file input element...' );
		resetError();
		if ( !$input.files || $input.files.length === 0 ) {
			debug( 'No files selected. Aborting...' );
			resetLabel();
			return;
		}
		process( $input.files );
	}

	/**
	* Processes a list of files.
	*
	* @private
	* @param {ArrayLike} list - list of files
	*/
	function process( list ) {
		var reader;
		var count;
		var files;
		var file;
		var N;
		var f;
		var i;

		N = list.length;
		debug( 'Processing %d files...', N );

		// Update the label text:
		$label.innerHTML = 'Converting...';

		// Initialize a counter:
		count = 0;

		// Process files...
		files = [];
		for ( i = 0; i < N; i++ ) {
			file = list[ i ];

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
	* Callback invoked upon completion.
	*
	* @private
	*/
	function done() {
		reset();
	}
}

main();
