var Reporters = {
    html: require('./html-reporter'),
    flat: require('./flat-reporter')
};

/**
 * Initializes the reporter
 * @param {String} name
 * @returns {Reporter}
 */
exports.mk = function(name) {
    return Reporters[name];
};
