var path = require('path'),
    vm = require('vm'),
    naming = require('bem-naming'),
    inherit = require('inherit'),
    _ = require('lodash'),
    deps = require('./deps-utils');

/**
 * @class
 * @name Entity
 */
module.exports = inherit({
    /**
     * @typedef {Object} Tech
     * @property {String} name
     * @property {String} path
     * @property {String} content
     */

    /**
     * @constructor
     * @param {String} level
     * @param {String} name
     * @param {Tech[]} techs
     */
    __constructor: function(level, name, techs) {
        this.name = name;
        this.level = level;

        this._techs = techs;
    },

    /**
     * @param {String} name
     * @returns {Tech}
     * @public
     */
    getTechByName: function(name) {
        return _.find(this._techs, {name: name});
    },

    /**
     * @param {String} techName
     * @returns {String}
     * @public
     */
    formatTechPath: function(techName) {
        return path.join(path.dirname(_.first(this._techs).path), this.name + '.' + techName);
    },

    /**
     * @param {String|String[]} regExps
     * @param {String|String[]} techsNames
     * @returns {Boolean}
     * @public
     */
    matchesConditions: function(regExps, techsNames) {
        regExps = _.isArray(regExps) ? regExps : [regExps];
        techsNames = _.isArray(techsNames) ? techsNames : [techsNames];

        return _(techsNames)
            .map(function(techName) {
                var tech = this.getTechByName(techName);

                return tech && removeComments(tech.content, tech.name);
            }, this)
            .compact()
            .thru(function(contents) {
                var content = contents.join('\n');

                return !!_.find(regExps, function(regExp) {
                    return regExp.test(content);
                });
            })
            .value();
    },

    /**
     * Returns those deps from `ruleDeps` which are NOT found in the deps of the entity
     * @param {Object|Object[]} ruleDeps
     * @returns {Object[]}
     * @public
     */
    getMissingDeps: function(ruleDeps) {
        var actualDeps = this.getNormalizedDeps(),
            expectedDeps = deps.normalize(ruleDeps),
            depsDiff = deps.difference(expectedDeps, actualDeps);

        return removeSelfDependency(depsDiff, naming.parse(this.name));
    },

    /**
     * Returns those deps from `ruleDeps` which are found in the deps of the entity
     * @param {Object|Object[]} ruleDeps
     * @returns {Object[]}
     * @public
     */
    getRedundantDeps: function(ruleDeps) {
        var actualDeps = this.getNormalizedDeps(),
            redundantDeps = deps.normalize(ruleDeps),
            depsDiff = deps.difference(redundantDeps, actualDeps);

        return deps.difference(redundantDeps, depsDiff);
    },

    /**
     * Normalizes the deps of the entity
     * @returns {Object[]}
     * @public
     */
    getNormalizedDeps: function() {
        var depsJS = this.getTechByName('deps.js'),
            parsedDeps = depsJS && vm.runInThisContext(depsJS.content);

        return deps.normalize(parsedDeps);
    }
});

/**
 * @param {String} techContent
 * @param {String} techName
 * @returns {String}
 */
function removeComments(techContent, techName) {
    var commentsRegExp = _.contains(techName, 'css')
        ? /(?:\/\*[\s\S]*?\*\/)/
        : /(?:\/\*[\s\S]*?\*\/)|(?:\/\/.*?(?:\n|$))/;

    return techContent
        .split(commentsRegExp)
        .join('');
}

/**
 * @property {Object} EntityInfo
 * @property {String} block
 * @property {String} elem
 * @property {String} modName
 * @property {String} modval
 */

/**
 * From given `depsEntities` removes those deps which represent dependencies from blocks and elems of `entityInfo`
 * @param {Object[]} depsEntities
 * @param {EntityInfo} entityInfo
 * @returns {Object[]}
 */
function removeSelfDependency(depsEntities, entityInfo) {
    return _(depsEntities)
        .map(removeSelfDep_)
        .filter(function(depsEntity) {
            return !_.isEmpty(depsEntity.mustDeps) || !_.isEmpty(depsEntity.shoulDeps);
        })
        .value();

    /**
     * @param {Object} depsEntity
     * @returns {Object}
     */
    function removeSelfDep_(depsEntity) {
        return _(depsEntity)
            .mapValues(function(deps, depsType) {
                if(depsType === 'tech') {
                    return deps;
                }

                return _.filter(deps, function(dep) {
                    return !_.isEqual(dep, _.omit(entityInfo, 'modName', 'modVal'));
                });
            })
            .omit(_.isEmpty)
            .value();
    }
}
