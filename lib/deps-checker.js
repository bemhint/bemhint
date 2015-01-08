var _ = require('lodash');

var DepsChecker = function (fileList) {
    this._files = _getFiles(fileList);
};

DepsChecker.prototype.check = function () {
    var files = this._files,
        res = [];

    files.forEach(function (groupOfFiles) {
        var error = _checkDeps(groupOfFiles);

        _.keys(error).length && res.push(error);
    });

    return res;
};

function _getFiles(fileList) {
    var res = [],
        files = [];

    fileList.forEach(function (file) {
        if (!file.children) {
            if (['.deps.js', '.js', '.bemhtml'].indexOf(file.suffix) > -1) {
                files.push(file);
            }
        } else {
            res = res.concat(_getFiles(file.children));
        }
    });

    var grouped = _.groupBy(files, function (elem) {
        return elem.name.substring(0, elem.name.lastIndexOf(elem.suffix));
    });

    _.keys(grouped).forEach(function (item) {
        res.push(grouped[item]);
    });

    return res;
}

function _checkDeps(files) {
    var _files = {};

    files.forEach(function (file) {
        _files.fullpath = file.fullpath.substring(0, file.fullpath.lastIndexOf('/'));
        _files.depsPath = file.name.substring(0, file.name.lastIndexOf(file.suffix)) + '.deps.js';

        if (file.suffix === '.deps.js') _files.deps = file;
        if (file.suffix === '.js') _files.js = file;
        if (file.suffix === '.bemhtml') _files.bemhtml = file;
    });

    /*jshint -W061 */
    var depsContent = _files.deps ? eval(_files.deps.content) : '',
        jsContent = _files.js ? _files.js.content : '',
        bemhtmlContent = _files.bemhtml ? _files.bemhtml.content : '';

    var actualDeps = _getActualDeps(depsContent),
        expectedDeps = _getExpectedDeps(jsContent, bemhtmlContent);

    var isEqual = _isEqual(actualDeps, expectedDeps);

    return !isEqual ? {
        fullpath: _files.deps ? _files.deps.fullpath : _files.fullpath,
        actualDeps: _files.deps ? actualDeps : 'No deps file ' + _files.depsPath,
        expectedDeps: expectedDeps
    } : {};
}

function _getActualDeps(deps) {
    deps = _.isArray(deps) ? deps : [deps];

    var actualDeps = {};

    deps.forEach(function (blockOfDeps) {
        if (blockOfDeps.hasOwnProperty('tech') || !blockOfDeps.hasOwnProperty('mustDeps')) return;

        var mustDeps = blockOfDeps.mustDeps;

        mustDeps = _.isArray(mustDeps) ? mustDeps : [mustDeps];

        mustDeps.forEach(function (mustDep) {
            if (mustDep === 'i-bem') {
                actualDeps.block = 'i-bem';
                return;
            }

            if (mustDep.block === 'i-bem') {
                actualDeps.block = 'i-bem';
                actualDeps.elems = [];

                if (mustDep.hasOwnProperty('elem')) {
                    if (typeof mustDep.elem === 'string') {
                        actualDeps.elems.push(mustDep.elem);
                    } else if (_.isPlainObject(mustDep.elem)) {
                        if (mustDep.elem.hasOwnProperty('name')) {
                            actualDeps.elems.push(mustDep.elem.name);
                        }
                    }
                } else if (mustDep.hasOwnProperty('elems')) {
                    var _elems = _.isArray(mustDep.elems) ? mustDep.elems : [mustDep.elems];

                    actualDeps.elems = _elems;
                }

                !actualDeps.elems.length && delete actualDeps.elems;
            }
        });
    });

    return actualDeps;
}

function _getExpectedDeps(jsContent, bemhtmlContent) {
    var expectedDeps = {};

    var isDecl = /BEM\.decl\(/.test(jsContent),
        isDom = /DOM\.decl\(/.test(jsContent),
        isHTML = /BEM\.HTML/.test(jsContent),
        isInternal = /BEM\.INTERNAL/.test(jsContent);

    if (isDecl || isDom || isInternal || bemhtmlContent) {
        expectedDeps.block = 'i-bem';
        expectedDeps.elems = [];

        isDom && expectedDeps.elems.push('dom');
        (isHTML || bemhtmlContent) && expectedDeps.elems.push('html');
        isInternal && expectedDeps.elems.push('internal');

        var i18n = new RegExp('BEM\\.I18N\\('),
            _i18n = new RegExp('block\\s*:\\s*\'i-bem\'\\s*,\\s*elem\\s*:\\s*\'i18n\''),
            is18n = i18n.test(jsContent) || i18n.test(bemhtmlContent) || _i18n.test(bemhtmlContent);

        is18n && expectedDeps.elems.push('i18n');

        !expectedDeps.elems.length && delete expectedDeps.elems;
    }

    return expectedDeps;
}

function _isEqual(actualDeps, expectedDeps) {
    if (actualDeps.block === expectedDeps.block) {
        return !_.xor(actualDeps.elems, expectedDeps.elems).length;
    }

    return false;
}

module.exports = DepsChecker;
