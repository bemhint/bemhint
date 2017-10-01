var util = require('util'),
    chalk = require('chalk'),
    _ = require('lodash'),
    std = require('../std'),
    formatFooter = require('./utils').formatFooter,
    hasErrors = require('../utils').hasErrors;

/**
 * @typedef {Object} Error
 * @property {String} path
 * @property {String} msg
 * @property {String} type - error|warning
 * @property {Object|String} [value]
 * @property {Object} [location]
 */

/**
 * @param {Defect[]} defects
 */
exports.write = function(defects) {
    if(defects.length) {
        std.out(stringifyErrors(defects));
    }
};

/**
 * @param {Defect[]} defects
 * @returns {String}
 */
function stringifyErrors(defects) {
    return '\n' + _(defects)
        .map(stringifyDefects_)
        .join('\n\n')
        .concat(formatFooter_());

    ///
    function stringifyDefects_(defect) {
        var msgColor = defect.type === 'error' ? chalk.red : chalk.yellow,
            defectMsg = util.format('%s at %s', msgColor(defect.msg), chalk.underline(defect.path)),
            defectValue = typeof defect.value === 'object' ? util.inspect(defect.value, {depth: null}) : defect.value,
            defectLocation = stringifyDefectLocation_(defect);

        return defectValue ? util.format('%s:%s\n%s', defectMsg, defectLocation, defectValue) : defectMsg;
    }

    function formatFooter_() {
        var footerColor = hasErrors(defects) ? chalk.bold.red : chalk.bold.yellow;

        return footerColor(`\n\n${formatFooter(defects)}\n`);
    }

    /**
     * Returns formatted error location:
     * @example
     * /home/foo/bar.js: 5
     *     if (Array.isArray(x) res.push('baz');
     * -----------------------^
     *
     * @param {Defect} defect
     *
     * @returns {String}
     */
    function stringifyDefectLocation_(defect) {
        var location = defect.location;

        if(location) {
            return util.format('%d:%d\n%s\n%s', location.line, location.column, location.sourceLine,
                new Array(location.column).join('-') + '^'
            );
        }

        return '';
    }
}
