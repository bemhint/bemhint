var reporters = {
    flat: require('./flat'),
    html: require('./html')
};

/**
 * @param {String} name
 * @returns {Object}
 */
exports.mk = function(name) {
    return reporters[name];
};
