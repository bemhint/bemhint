# BEM hint [![Build Status](https://travis-ci.org/bem/bemhint.svg)](https://travis-ci.org/bem/bemhint) [![Coverage Status](https://img.shields.io/coveralls/bem/bemhint.svg)](https://coveralls.io/r/bem/bemhint?branch=master) [![Dependency Status](https://david-dm.org/bem/bemhint.svg)](https://david-dm.org/bem/bemhint) [![devDependency Status](https://david-dm.org/bem/bemhint/dev-status.svg)](https://david-dm.org/bem/bemhint#info=devDependencies)

**Can be used in projects based on [bem-bl](https://github.com/bem/bem-bl).**

<!-- TOC -->
- [Status](#status)
- [Install](#install)
- [Usage](#usage)
  - [Configuration](#configuration)
    - [levels](#levels-array)
    - [excludeFiles](#excludefiles-array)
  - [Rules](#rules)
    - [deps-checker](#deps-checker)
  - [CLI](#cli)
    - [Example](#example)
  - [API](#api)
    - [bemhint](#bemhint)
    - [reporters](#reporters)
    - [Example](#example-1)

<!-- TOC END -->

## Status

The initial stage of development. Code is unstable. Your [suggestions and comments](https://github.com/bem/bemhint/issues/new) are wellcome.

## Install

```bash
$ npm install bemhint
```

## Usage

### Configuration

<!-- TOC:display:levels -->
#### levels: [Array]

Sets _masks_ for redefinition levels to check.

<!-- TOC:display:excludeFiles -->
#### excludeFiles: [Array]

Sets _masks_ for files/dirs to ignore during a check.

### Rules

#### deps-checker

Checks the given BEM entities on the correctness of the written dependencies from block `i-bem`.

### CLI

```bash
$ bemhint --help
BEM hint

Usage:
  bemhint [OPTIONS] [ARGS]

Options:
  -h, --help : Help
  -v, --version : Shows the version number
  -c CONFIG, --config=CONFIG : Path to the configuration file
  -r REPORTERS, --reporter=REPORTERS : flat or/and html (default: flat)

Arguments:
  TARGETS : Paths to BEM entities for check (required)
```

#### Example

Configuration file is **required**. If the path to it was not specified, it will be loaded from the current directory from file `.bemhint.js`.

Study the following configuration file:

```js
module.exports = {
    levels: ['*blocks'],
    excludeFiles: [
        '*.blocks/block/**',
        '*.blocks/*/*.ext'
    ]
};
```

Run:

```bash
$ bemhint --config=path/to/config/file path/to/entities --reporter flat --reporter html

$ bemhint -c .bemhint.js common.blocks -r html

$ bemhint .
```

### API

```js
var bemhint = require('bemhint'),
    reporters = require('bemhint/lib/reporters');
```

#### bemhint

**@param** _{String[]}_ - paths to BEM entities for check<br>
**@param** _{Object}_ - [configuration](#configuration)<br>
**@returns** _{Promise * Object[]}_ - BEM errors:

```js
[{ path: 'path/to/bem/entity', actual: 'actual data', expected: 'expected data' }]
```

#### reporters

**reporters.mk**<br>
**@param** _{String}_ - type of a report:

 * **flat** - reports a result to a console

 * **html** - reports a result to file `bemhint-report.html`

**@returns** _{Reporter}_ - an instance of a reporter

**Reporter.write**<br>
**@param** _{Object[]}_ - BEM errors<br>
**@returns** _{undefined}_ - reports a result

#### Example

```js
var bemhint = require('bemhint'),
    reporters = require('bemhint/lib/reporters'),
    config = {
        levels: ['*blocks'],
        excludeFiles: []
    };

bemhint(['.'], config)
    .then(function (bemErrors) {
        ['flat', 'html'].forEach(function (reporter) {
            reporters.mk(reporter).write(bemErrors);
        });
    })
    .done();
```
