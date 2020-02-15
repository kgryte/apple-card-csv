<!--

@license Apache-2.0

Copyright (c) 2020 Athan Reines.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-->

# Apple Card Statement CSV

> Converts an Apple Card statement to CSV.

<!-- Section to include introductory text. Make sure to keep an empty line after the intro `section` element and another before the `/section` close. -->

<section class="intro">

For older Apple devices supporting Apple Wallet (e.g., iPhone 6, iPhone 5, etc), but no longer supporting OS updates (iOS < 13), users are unable to export their Apple Card statements as CSV.

To support these older devices, this package generates CSV by reading and parsing exported statement PDFs. 

</section>

<!-- /.intro -->

<!-- Package usage documentation. -->

<section class="usage">

## Usage

```javascript
var convert = require( 'apple-card-csv' );
```

#### convert( src, clbk )

Converts one or more statements to CSV.

```javascript
var resolve = require( 'path' ).resolve;
var cwd = require( '@stdlib/process/cwd' );
var readFileSync = require( '@stdlib/fs/read-file' ).sync;

var fpath = resolve( cwd(), 'path', 'to', 'statement.pdf' );
var src = readFileSync( fpath );

convert( src, done );

function done( error, results ) {
    if ( error ) {
        return console.error( error.message );
    }
    console.log( results );
}
```

To convert more than one statement, provide an `Array` of statements, where each element is a `Uint8Array` containing statement binary data.

</section>

<!-- /.usage -->

<!-- Package usage notes. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="notes">

</section>

<!-- /.notes -->

<!-- Package usage examples. -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var join = require( 'path' ).join;
var readFileSync = require( '@stdlib/fs/read-file' ).sync;
var convert = require( 'apple-card-csv' );

var fpath = join( __dirname, 'examples', 'fixtures', 'statement.pdf' );
var src = readFileSync( fpath );

convert( src, done );

function done( error, csv ) {
    if ( error ) {
        return console.error( error.message );
    }
    console.log( csv );
}
```

</section>

<!-- /.examples -->

<!-- Section for describing a command-line interface. -->

* * *

<section class="cli">

## CLI

<!-- CLI usage documentation. -->

<section class="usage">

### Usage

```text
Usage: apple-card-csv [options] [<file1> <file2> ...]

Options:

  -h,    --help                Print this message.
  -V,    --version             Print the package version.
```

</section>

<!-- /.usage -->

<!-- CLI usage notes. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="notes">

### Notes

-   File paths may be either absolute or relative and are resolved relative to the current working directory.

</section>

<!-- /.notes -->

<!-- CLI usage examples. -->

<section class="examples">

### Examples

```bash
$ apple-card-csv ./path/to/statement.pdf
```

```bash
$ cat ./path/to/statement.pdf | apple-card-csv
```

</section>

<!-- /.examples -->

</section>

<!-- /.cli -->

<!-- Section to include cited references. If references are included, add a horizontal rule *before* the section. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="references">

</section>

<!-- /.references -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

</section>

<!-- /.links -->
