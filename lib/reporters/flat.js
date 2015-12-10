var util = require('util'),
    chalk = require('chalk'),
    _ = require('lodash'),
    std = require('../std');

/**
 * @typedef {Object} Error
 * @property {String} path
 * @property {String} msg
 * @property {Object|String} [value]
 */

/**
 * @param {Error[]} errors
 */
exports.write = function(errors) {
    if(errors.length) {
        std.out(stringifyErrors(errors));
    } else {
        std.out('No BEM errors.');
    }
};

/**
 * @param {Error[]} errors
 * @returns {String}
 */
function stringifyErrors(errors) {
    return _(errors)
        .map(stringifyError_)
        .join('\n\n')
        .concat(util.format('\n\n%s error%s.', errors.length, errors.length > 1 ? 's' : ''));

    ///
    function stringifyError_(error) {
        var errorMsg = util.format('%s at %s', chalk.bold(error.msg), chalk.green(error.path)),
            errorValue = typeof error.value === 'object' ? util.inspect(error.value, {depth: null}) : error.value;

        return errorValue ? util.format('%s :\n%s', errorMsg, errorValue) : errorMsg;
    }
}
