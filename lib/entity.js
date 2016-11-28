var path = require('path'),
    inherit = require('inherit'),
    _ = require('lodash'),
    utils = require('./utils');

/**
 * @class
 * @name Entity
 */
module.exports = inherit({
    /**
     * @typedef {Object} Notation
     * @property {String} block
     * @property {String} [elem]
     * @property {String} [modName]
     * @property {String} [modVal]
     */

    /**
     * @typedef {Object} Tech
     * @property {Notation} entity
     * @property {String} level
     * @property {String} name
     * @property {String} path
     * @property {String} [content]
     */

    /**
     * @constructor
     * @param {Tech[]} techs
     */
    __constructor: function(techs) {
        techs = techs || [];

        this._techs = techs;

        this._errors = [];
    },

    /**
     * @returns {Tech[]}
     * @public
     */
    getTechs: function() {
        return this._techs;
    },

    /**
     * @param {String} techName
     * @returns {Tech}
     * @public
     */
    getTechByName: function(techName) {
        return _.find(this._techs, {name: techName});
    },

    /**
     * @returns {String}
     * @public
     */
    getDirName: function() {
        return path.dirname(this._getFromTechs('path'));
    },

    /**
     * @returns {Notation}
     * @public
     */
    getNotation: function() {
        return this._getFromTechs('entity');
    },

    /**
     * @returns {String}
     * @public
     */
    getLevel: function() {
        return this._getFromTechs('level');
    },

    /**
     * @param {String} prop
     * @returns {*}
     * @private
     */
    _getFromTechs: function(prop) {
        return _.first(this.getTechs())[prop];
    },

    /**
     * @typedef {Object} Error
     * @property {Object} [location] - works with tech property
     * @property {Number} [location.line] - 1-based line number
     * @property {Number} [location.column] - 1-based column number
     * @property {String} msg
     * @property {String} [tech]
     * @property {String} [path]
     * @property {Object|String} [value]
     */

    /**
     * @param {Error} error
     * Either tech or path should be specified.
     * If path is not specified it will be computed from tech name.
     * @public
     */
    addError: function(error) {
        if(!error.msg) {
            throw new Error('The error msg should be specified!');
        }

        if(!error.tech && !error.path) {
            throw new Error('The tech name or path should be specified!');
        }

        if(error.tech && error.path) {
            throw new Error('Either tech or path should be specified, not both!');
        }

        if(!_.isString(error.msg)) {
            throw new Error('The error msg must be a string!');
        }

        if(error.value && !(_.isObject(error.value) || _.isString(error.value))) {
            throw new Error('The error value must be an object or a string!');
        }

        if(error.location && !(_.isNumber(error.location.line) && _.isNumber(error.location.column))) {
            throw new Error('The error location must be an object with line/column number properties!');
        }

        if(error.location && !error.tech) {
            throw new Error('The error with location should have tech name!');
        }

        this._errors.push(error);
    },

    /**
     * @returns {Object[]}
     * @public
     */
    getErrors: function() {
        return _.map(this._errors, function(error) {
            var tech = error.tech && this.getTechByName(error.tech),
                location = error.location,
                cleanError = {
                    msg: error.msg,
                    path: error.path || (tech ? tech.path : this._buildTechPath(error.tech) + ' (doesn\'t exist)'),
                    value: error.value
                };

            if(location) {
                cleanError.location = _.assign({}, location, {
                    sourceLine: tech.content.split('\n')[location.line - 1]
                });
            }

            return cleanError;
        }, this);
    },

    /**
     * @param {String} techName
     * @returns {String}
     * @private
     */
    _buildTechPath: function(techName) {
        return utils.replaceTech(this._techs[0].path, techName);
    }
});
