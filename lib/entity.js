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

        this._defects = [];
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
     * @typedef {Object} Defect
     * @property {Object} [location] - works with tech property
     * @property {Number} [location.line] - 1-based line number
     * @property {Number} [location.column] - 1-based column number
     * @property {String} msg
     * @property {String} [tech]
     * @property {String} [path]
     * @property {Object|String} [value]
     */

    /**
     * @param {Defect} defect
     * Either tech or path should be specified.
     * If path is not specified it will be computed from tech name.
     * @public
     */
    addError: function(defect) {
        defect.type = 'error';

        this._addDefect(defect);
    },

    addWarning: function(defect) {
        defect.type = 'warning';

        this._addDefect(defect);
    },

    _addDefect(defect) {
        if(!defect.msg) {
            throw new Error(`The ${defect.type} msg should be specified!`);
        }

        if(!defect.tech && !defect.path) {
            throw new Error(`The tech name or path should be specified!`);
        }

        if(defect.tech && defect.path) {
            throw new Error(`Either tech or path should be specified, not both!`);
        }

        if(!_.isString(defect.msg)) {
            throw new Error(`The ${defect.type} msg must be a string!`);
        }

        if(defect.value && !(_.isObject(defect.value) || _.isString(defect.value))) {
            throw new Error(`The ${defect.type} value must be an object or a string!`);
        }

        if(defect.location && !(_.isNumber(defect.location.line) && _.isNumber(defect.location.column))) {
            throw new Error(`The ${defect.type} location must be an object with line/column number properties!`);
        }

        if(defect.location && !defect.tech) {
            throw new Error(`The ${defect.type} with location should have tech name!`);
        }

        this._defects.push(defect);
    },

    /**
     * @returns {Object[]}
     * @public
     */
    getDefects() {
        return _.map(this._defects, function(defect) {
            var tech = defect.tech && this.getTechByName(defect.tech),
                location = defect.location,
                cleanDefect = {
                    msg: defect.msg,
                    path: defect.path || (tech ? tech.path : this._buildTechPath(defect.tech) + ' (doesn\'t exist)'),
                    value: defect.value,
                    type: defect.type
                };

            if(location) {
                cleanDefect.location = _.assign({}, location, {
                    sourceLine: tech.content.split('\n')[location.line - 1]
                });
            }

            return cleanDefect;
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
