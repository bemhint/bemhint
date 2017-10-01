# bemhint [![Build Status](https://travis-ci.org/bemhint/bemhint.svg)](https://travis-ci.org/bemhint/bemhint) [![Dependency Status](https://david-dm.org/bemhint/bemhint.svg)](https://david-dm.org/bemhint/bemhint) [![devDependency Status](https://david-dm.org/bemhint/bemhint/dev-status.svg)](https://david-dm.org/bemhint/bemhint#info=devDependencies)

**bemhint** – it is an *extendable* code quality tool for [BEM](https://en.bem.info) projects.

This module is a core of the tool. It provides the API for external plugins which perform checks of project BEM entities.

## Install

```bash
$ npm install bemhint
```

## Usage

```
$ bemhint --help

Usage:
  bemhint [OPTIONS] [ARGS]


Options:
  -h, --help : Help
  -c CONFIGPATH, --config=CONFIGPATH : Path to a configuration file (default: .bemhint.js)
  -r REPORTERS, --reporter=REPORTERS : flat, html or/and teamcity (default: flat)

Arguments:
  TARGETS : Paths to BEM entities (required)
```

## Configuration

Configuration is a JavaScript/JSON file in the following format:

```js
module.exports = {
    // list of the folder names which represent redefinition levels (folders with blocks)
    levels: [
        '*.blocks',
        'blocks-*'
    ],

    // paths which will be ignored during the validation
    excludePaths: [
        'node_modules/**',
        'libs/**'
    ],

    // list of available plugins (node module names relatively to config file path)
    plugins: {
        // plugin is disabled
        '<plugin_name>': false,

        // plugin is enabled
        '<plugin_name>': true,

        // plugin is enabled and uses following settigns
        '<plugin_name>': {
            // settings

            // paths which will be ignored during the validation by this plugin
            excludePaths: [
                'some.blocks/some-block/**',
                'some.blocks/another-block/_some-mod/*',
                'some.blocks/yet-another-block/yet-another-block.deps.js'
            ],

            // set of the BEM technologies which should be validated by this plugin
            techs: {
                '*': false,
                'js|deps.js': true,

                // separated settings for `bemhtml.js`
                'bemhtml.js': {
                    // settings
                }
            }
        },

        // plugin is enabled and will be run as many times as many configurations have been specified;
        // be aware of different side effects which may appear depending on a plugin implementation
        '<plugin_name>': [
            {
                // settings
                tech: {
                    'deps.js': true
                }
            },
            {
                // other settings
                tech: {
                    'bemdecl.js': true
                }
            }
        ]
    }
};
```

**Note!** Plugin settings can have any other fields which needs for plugin (not only special fields `excludePaths` and `techs`). Set of the fields is defined by implementation of plugin.

## How to create your own plugin

You need to create the JavaScript file in following format:

```js
module.exports = {
    /**
     * Default plugin settings (it will be merged with settings from configuration file)
     * @returns {Object}
     */
    configure: function() {
        return {
            // settings
        }
    },

    /**
     * Checks which needs the information about all BEM entities of the project
     * @param {Entity[]} entities
     * @param {Config} config
     */
    forEntities: function(entities, config) {
        ...
    },

    /**
     * Checks of the specific BEM entity
     * @param {Entity} entity
     * @param {Config} config
     */
    forEachEntity: function(entity, config) {
        ...
    },

    /**
     * Checks of the separate technology of the specific BEM entity
     * @param {Object} tech
     * @param {Entity} entity
     * @param {Config} config
     */
    forEachTech: function(tech, entity, config) {
        ...
    }
};
```

**Note!** Your plugin should contain at least one of the functions `forEntities`, `forEachEntity`, `forEachTech`, but `configure` function is not required.

#### Entity

BEM entity (block, element or modifier).

**Entity.prototype.getTechs**<br>
**@returns** *{Tech[]}* - list of technologies which implement this BEM entity

**Entity.prototype.getTechByName**<br>
**@param** *{String}* – technology name (css, js etc. - part of a file name which goes after the first dot)<br>
**@returns** *{Tech}* – technology of BEM entity

**Entity.prototype.addError**<br>
**@param** *{Object}* - object which contains the information about an error:
 * **location** *{Object}* - `{line, column}` location of error in a file; works with `tech` argument only
 * **msg** *{String}* – error message
 * **tech** *{String}* – technology name where error was found
 * **[value]** *{String|Object}* – error data

**Entity.prototype.addWarning**<br>

This method has the same API as `addError`.

#### Config

Plugin configuration.

**Config.prototype.getConfig**<br>
**@returns** *{Object}* – full configuration of a plugin

**Config.prototype.getTechConfig**<br>
**@param** *{String}* – technology name<br>
**@returns** *{Object}* – configuration of the specific technology

**Config.prototype.isExcludedPath**<br>
**@param** *{String}* – file path<br>
**@returns** *{Boolean}*

**Config.prototype.resolvePath**<br>
**@param** *{String}* – relative path<br>
**@returns** *{String}* – absolute path built relatively from config file location

## Plugin examples

* [bemhint-deps-schema](https://github.com/bemhint/bemhint-deps-schema)
* [bemhint-css-naming](https://github.com/bemhint/bemhint-css-naming)
* [bemhint-fs-naming](https://github.com/bemhint/bemhint-fs-naming) (experimental)
* [bemhint-bem-xjst](https://github.com/bemhint/bemhint-bem-xjst)
* [bemhint-estree](https://github.com/bemhint/bemhint-estree)
