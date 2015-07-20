var naming = require('bem-naming'),
    _ = require('lodash'),
    normalize = require('normalize-deps');

/**
 *
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
     *
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
     *
     */
    function normalizeDeps_(deps, depsType, entityInfo) {
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
 *
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
     *
     */
    function findCommonDepsEntity_(depsEntity, actualDeps) {
        return _.find(actualDeps, function(actualDep) {
            return depsEntity.tech === actualDep.tech;
        });
    }

    /**
     *
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
     *
     */
    function containsDeps_(deps, singleDep) {
        return _.find(deps, function(dep) {
            return _.isEqual(dep, singleDep);
        });
    }
};

/**
 *
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
