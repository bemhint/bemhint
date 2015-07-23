var util = require('util');

require('colors');

/**
 * @typedef {Object} Error
 * @property {String} path
 * @property {String} msg
 * @property {Object[]} value
 */

module.exports = {
    /**
     * @param {Error[]} errors
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

/**
 * @param {Error[]} errors
 * @returns {undefined}
 */
function getContent(errors) {
    return errors.map(function(error) {
        return [
            error.msg.bold + ' at ' + error.path.green + ' :',
            (util.inspect(error.value.length === 1 ? error.value[0] : error.value, {depth: null})) + '\n'
        ].join('\n');
    }).join('\n') + util.format('\n%s error%s.', errors.length, errors.length > 1 ? 's' : '');
}
