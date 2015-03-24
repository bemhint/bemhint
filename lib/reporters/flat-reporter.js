/**
 * Flat reporter of the results
 * ============================
 */
var util = require('util');

require('colors');

/**
 * @param {Object[]} errors
 * @returns {String}
 */
function getContent(errors) {
    return errors.map(function (error) {
        return [
            (error.path + ':').bold,
            'actual:   '.bold.red   + util.inspect(error.actual),
            'expected: '.bold.green + util.inspect(error.expected) + '\n'
        ].join('\n');
    }).join('\n') + util.format('\n%s error%s.', errors.length, errors.length > 1 ? 's' : '');
}

module.exports = {
    /**
     * Logs the flat report
     * @param {Object[]} errors
     * @returns {undefined}
     */
    write: function (errors) {
        if (errors.length) {
            console.log(getContent(errors));
        } else {
            console.log('No BEM errors.');
        }
    }
};
