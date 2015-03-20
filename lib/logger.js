/**
 * Logger
 * ======
 */
var util = require('util');

require('colors');

/**
 * Errors' logger
 * --------------
 */
module.exports = {
    /**
     * Shows the given errors
     * @param {Object[]} errors
     */
    showErrors: function (errors) {
        errors.forEach(function (error) {
            console.log((error.path + ':').bold);

            console.log('actual:   '.red.bold + util.inspect(error.actual, { depth: null }));
            console.log('expected: '.green.bold + util.inspect(error.expected, { depth: null }));

            console.log();
        });

        if (errors.length) {
            throw errors.length + ' error' + (errors.length > 1 ? 's' : '') + '.';
        } else {
            console.log('No BEM errors.');
        }
    }
};
