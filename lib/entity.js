var path = require('path'),
    vm = require('vm'),
    inherit = require('inherit'),
    deps = require('./deps-utils'),
    naming = require('bem-naming'),
    _ = require('lodash');

/**
 *
 */
module.exports = inherit({
    /**
     *
     */
    __constructor: function(level, name, techs) {
        this.name = name;
        this.level = level;

        this._techs = techs;
    },

    /**
     *
     */
    getTechByName: function(name) {
        return _.find(this._techs, {name: name});
    },

    /**
     *
     */
    formatTechPath: function(techName) {
        return path.join(path.dirname(_.first(this._techs).path), this.name + '.' + techName);
    },

    /**
     *
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
     *
     */
    getMissingDeps: function(ruleDeps) {
        var actualDeps = this.getNormalizedDeps(),
            expectedDeps = deps.normalize(ruleDeps),
            depsDiff = deps.difference(expectedDeps, actualDeps);

        return removeSelfDependency(depsDiff, naming.parse(this.name));
    },

    /**
     *
     */
    getNormalizedDeps: function() {
        var depsJS = this.getTechByName('deps.js'),
            parsedDeps = depsJS && vm.runInThisContext(depsJS.content);

        return deps.normalize(parsedDeps);
    }
});

/**
 *
 */
function removeComments(techContent, techName) {
    var commentsRegExp = techName === 'css'
        ? /(?:\/\*[\s\S]+?\*\/)/
        : /(?:\/\*[\s\S]+?\*\/)|(?:\/\/.+?(?:\n|$))/;

    return techContent
        .split(commentsRegExp)
        .join('');
}

/**
 *
 */
function removeSelfDependency(depsEntities, entityInfo) {
    return _(depsEntities)
        .map(removeSelfDep_)
        .filter(function(depsEntity) {
            return !_.isEmpty(depsEntity.mustDeps) || !_.isEmpty(depsEntity.shoulDeps);
        })
        .value();

    /**
     *
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
