/**
 * Reporters core
 * ==============
 */
var Reporters = {
    html: require('./html-reporter'),
    flat: require('./flat-reporter')
};

/**
 * Initialize the reporter
 * @param {String} name
 * @returns {Reporter}
 */
exports.mk = function(name) {
    return Reporters[name];
};
