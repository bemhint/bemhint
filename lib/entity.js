var inherit = require('inherit'),
    _ = require('lodash'),
    utils = require('./utils');

/**
 * @class
 * @name Entity
 */
var Entity = inherit({
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
     * @typedef {Object} Error
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

        if(typeof error.msg !== 'string') {
            throw new Error('The error msg must be a string!');
        }

        if(error.value && typeof error.value !== 'object' && typeof error.value !== 'string') {
            throw new Error('The error value must be an object or a string!');
        }

        this._errors.push(error);
    },

    /**
     * @returns {Object[]}
     * @public
     */
    getErrors: function() {
        return _.map(this._errors, function(error) {
            var tech = this.getTechByName(error.tech);

            return {
                msg: error.msg,
                path: error.path || (tech ? tech.path : this._formatTechPath(error.tech) + ' (doesn\'t exist)'),
                value: error.value
            };
        }, this);
    },

    /**
     * @param {String} techName
     * @returns {String}
     * @private
     */
    _formatTechPath: function(techName) {
        return utils.replaceTech(this._techs[0].path, techName);
    }
});

module.exports = Entity;
