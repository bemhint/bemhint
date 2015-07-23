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
    return errors.map(function(error) {
        return [
            error.msg.bold + ' at ' + error.path.green + ' :',
            (util.inspect(error.value.length === 1 ? error.value[0] : error.value, {depth: null})) + '\n'
        ].join('\n');
    }).join('\n') + util.format('\n%s error%s.', errors.length, errors.length > 1 ? 's' : '');
}

module.exports = {
    /**
     * Logs the flat report
     * @param {Object[]} errors
     * @returns {undefined}
     */
    write: function(errors) {
        if(errors.length) {
            console.log(getContent(errors));
        } else {
            console.log('No BEM errors.');
        }
    }
};
