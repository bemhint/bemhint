var reporters = {
    flat: require('./flat'),
    html: require('./html'),
    teamcity: require('./teamcity')
};

/**
 * @param {String} name
 * @returns {Object}
 */
exports.mk = function(name) {
    return reporters[name];
};
