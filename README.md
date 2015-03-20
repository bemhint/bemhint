# BEM hint [![Build Status](https://travis-ci.org/eGavr/bemhint.svg)](https://travis-ci.org/eGavr/bemhint) [![Coverage Status](https://img.shields.io/coveralls/eGavr/bemhint.svg)](https://coveralls.io/r/eGavr/bemhint?branch=master) [![Dependency Status](https://david-dm.org/eGavr/bemhint.svg)](https://david-dm.org/eGavr/bemhint) [![devDependency Status](https://david-dm.org/eGavr/bemhint/dev-status.svg)](https://david-dm.org/eGavr/bemhint#info=devDependencies)

<!-- TOC -->
- [Status](#status)
- [Install](#install)
- [Usage](#usage)
  - [Configuration file](#configuration-file)
    - [Options](#options)
      - [levels](#levels-array)
      - [excludeFiles](#excludefiles-array)
  - [Example](#example)
    - [Configuration](#configuration)
    - [Usage](#usage-1)

<!-- TOC END -->

## Status

The initial stage of development. Code is unstable. Your [suggestions and comments](https://github.com/eGavr/bemhint/issues/new) are wellcome.

## Install

```bash
$ npm install bemhint
```

## Usage

```bash
$ bemhint --help
BEM hint

Usage:
  bemhint [OPTIONS] [ARGS]

Options:
  -h, --help : Help
  -v, --version : Shows the version number
  -c CONFIG, --config=CONFIG : Path to the configuration file

Arguments:
  TARGETS : Path to BEM entities for check (required)
```

### Configuration file

Configuration file is **required**. If the path to it was not specified, it will be loaded from the current directory from the file `.bemhint.js`.

<!-- TOC:display:Options -->
#### Options:

<!-- TOC:display:levels -->
##### levels: [Array]

Sets _masks_ for redefinition levels.

<!-- TOC:display:excludeFiles -->
##### excludeFiles: [Array]

Sets _masks_ for files/dirs to ignore during the check.

### Example

#### Configuration

```js
module.exports = {
    levels: ['*blocks'],
    excludeFiles: [
        '*.blocks/block/**',
        '*.blocks/*/*.ext'
    ]
};
```

#### Usage

```bash
$ bemhint --config=path/to/config/file path/to/entities

$ bemhint -c .bemhint.js common.blocks

$ bemhint .
```
