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
     * @param {Array} errors
     */
    showErrors: function (errors) {
        errors.forEach(function (error) {
            console.log((error.fullpath + ':').bold);

            console.log('actual:   '.red.bold + util.inspect(error.actualDeps, { depth: null }));
            console.log('expected: '.green.bold + util.inspect(error.expectedDeps, { depth: null }));

            console.log();
        });

        if (errors.length) {
            throw errors.length + ' error' + (errors.length > 1 ? 's' : '') + '.';
        } else {
            console.log('No BEM errors.');
        }
    }
};
