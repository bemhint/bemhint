var bemNaming = require('bem-naming'),
    inherit = require('inherit'),
    _ = require('lodash');

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
     * @property {String} tech
     * @property {Object|String} [value]
     */

    /**
     * @param {Object} error
     * @public
     */
    addError: function(error) {
        if(!error.tech || !error.msg) {
            throw new Error('The error msg and tech name should be specified!');
        }

        if(typeof error.msg !== 'string') {
            throw new Error('The error msg must be a string!');
        }

        if(!this.getTechByName(error.tech)) {
            throw new Error(
                'Entity \'' + bemNaming.stringify(this._getNotation()) + '\'' +
                ' on level \'' + this._getLevel() + '\'' +
                ' is not implemented in tech \'' + error.tech + '\'!'
            );
        }

        if(error.value && typeof error.value !== 'object' && typeof error.value !== 'string') {
            throw new Error('The error value must be an object or a string!');
        }

        this._errors.push(error);
    },

    /**
     * @returns {Notation}
     * @private
     */
    _getNotation: function() {
        return _.first(this._techs).entity;
    },

    /**
     * @returns {String} level
     * @private
     */
    _getLevel: function() {
        return _.first(this._techs).level;
    },

    /**
     * @returns {Object[]}
     * @public
     */
    getErrors: function() {
        return _.map(this._errors, function(error) {
            return {
                msg: error.msg,
                path: this.getTechByName(error.tech).path,
                value: error.value
            };
        }, this);
    }
});

module.exports = Entity;
