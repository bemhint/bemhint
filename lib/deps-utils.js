var naming = require('bem-naming'),
    _ = require('lodash'),
    normalize = require('normalize-deps');

/**
 * Normalizes deps
 * @param {Object|Object[]} depsEntities
 * @returns {Object[]}
 * @example
 *
 * 1. {mustDeps: 'some-block'} -> {mustDeps: {block: 'some-block'}}
 *
 * 2. {tech: 'js', mustDeps: {block: 'some-block', elems: 'some-elem'}}
 *          |                       |                             |
 *          v                       v                             v
 *    {tech: 'js', mustDeps: [{block: 'some-block'}, {block: 'some-block', elem: 'some-elem}]}
 */
exports.normalize = function(depsEntities) {
    depsEntities = _.isArray(depsEntities) ? depsEntities : [depsEntities];

    return _(depsEntities)
        .groupBy('tech')
        .map(function(arrayOfDeps) {
            return _(arrayOfDeps)
                .thru(mergeDeps_)
                .omit('block', 'elem', 'mod', 'val')
                .mapValues(normalizeDeps_)
                .value();
        })
        .value();

    /**
     * @param {Object[]} arrayOfDeps
     * @returns {Object}
     */
    function mergeDeps_(arrayOfDeps) {
        return _.reduce(arrayOfDeps, function(merged, deps) {
            return _.merge(merged, deps, function(a, b) {
                if(_.isArray(a)) {
                    return a.concat(b);
                }

                if(typeof a === 'string' || _.isPlainObject(a)) {
                    return [a].concat(b);
                }
            });
        }, {});
    }

    /**
     * Normalizes deps with the help of https://github.com/eGavr/normalize-deps#bemhint
     * @param {Object[]} deps
     * @param {String} depsType – tech, mustDeps, shouldDeps
     * @returns {Object[]}
     */
    function normalizeDeps_(deps, depsType) {
        if(depsType === 'tech') {
            return deps;
        }

        deps = _.isArray(deps) ? deps : [deps];

        return _(deps)
            .map(normalize)
            .flatten()
            .value();
    }
};

/**
 * Finds which deps from `expectedDeps` are not represented in `actualDeps`
 * @param {Object[]} expectedDeps
 * @param {Object[]} actualDeps
 * @returns {Object[]}
 */
exports.difference = function(expectedDeps, actualDeps) {
    return _(expectedDeps)
        .map(function(depsEntity) {
            var commonDepsEntity = findCommonDepsEntity_(depsEntity, actualDeps),
                diff = commonDepsEntity
                    ? getDepsDiff_(depsEntity, commonDepsEntity)
                    : depsEntity;

            if(!_.isEmpty(diff)) {
                return depsEntity.tech ? _.extend({tech: depsEntity.tech}, diff) : diff;
            }
        })
        .compact()
        .value();

    /**
     * @param {Object} depsEntity
     * @param {Object[]} actualDeps
     * @returns {Object[]}
     */
    function findCommonDepsEntity_(depsEntity, actualDeps) {
        return _.find(actualDeps, function(actualDep) {
            return depsEntity.tech === actualDep.tech;
        });
    }

    /**
     * @param {Object} firstEntity
     * @param {Object} secondEntity
     * @returns {Object}
     */
    function getDepsDiff_(firstEntity, secondEntity) {
        return _(firstEntity)
            .pick('mustDeps', 'shouldDeps', 'noDeps')
            .mapValues(function(deps, depsType) {
                if(!secondEntity[depsType]) {
                    return deps;
                }

                return _.filter(deps, function(dep) {
                    return !containsDeps_(secondEntity[depsType], dep);
                });
            })
            .omit(_.isEmpty)
            .value();
    }

    /**
     * @param {Object[]} deps
     * @param {Object} singleDep
     * @returns {Obejct|undefined}
     */
    function containsDeps_(deps, singleDep) {
        return _.find(deps, function(dep) {
            return _.isEqual(dep, singleDep);
        });
    }
};

/**
 * @param {Object[]} depsEntities
 * @returns {Object[]}
 * @example
 *
 * {mustDeps: [{block: 'some-block', elem: 'some-elem'}]} -> {mustDeps: ['some-block__some-elem']}
 */
exports.stringify = function(depsEntities) {
    return _.map(depsEntities, function(depsEntity) {
        return _.mapValues(depsEntity, function(deps, depsType) {
            if(depsType === 'tech') {
                return deps;
            }

            return _.map(deps, naming.stringify);
        });
    });
};
