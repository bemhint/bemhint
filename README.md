# BEM hint [![Build Status](https://travis-ci.org/eGavr/bemhint.svg)](https://travis-ci.org/eGavr/bemhint) [![Coverage Status](https://img.shields.io/coveralls/eGavr/bemhint.svg)](https://coveralls.io/r/eGavr/bemhint?branch=master) [![Dependency Status](https://david-dm.org/eGavr/bemhint.svg)](https://david-dm.org/eGavr/bemhint) [![devDependency Status](https://david-dm.org/eGavr/bemhint/dev-status.svg)](https://david-dm.org/eGavr/bemhint#info=devDependencies)

## Install

```
$ npm install bemhint
```

### Usage

```
$ bemhint --help
BEM hint

Usage:
  bemhint [OPTIONS] [ARGS]

Options:
  -h, --help : Help
  -v, --version : Shows the version number
  -c CONFIG, --config=CONFIG : Path to the configuration file (required)
```

### Configuration file

```js
module.exports = {
    levels: [
        'common.blocks',
        'desktop.blocks'
    ]
};
```
