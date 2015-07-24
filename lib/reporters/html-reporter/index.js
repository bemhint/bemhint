var fs = require('fs'),
    path = require('path'),
    inspect = require('util').inspect,
    Handlebars = require('handlebars');

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
        var source = fs.readFileSync(path.join(__dirname, 'suite.hbs'), 'utf-8'),
            stylesheet = fs.readFileSync(path.join(__dirname, 'index.css'), 'utf-8'),
            template = Handlebars.compile(source),
            data = {
                stylesheet: stylesheet,
                title: errors.length ? 'BEM errors:' : 'No BEM errors.',
                errors: inspectErrors(errors)
            };

        fs.writeFileSync(path.resolve('bemhint-report.html'), template(data));
    }
};

/**
 * @param {Error[]} errors
 * @returns {undefined}
 */
function inspectErrors(errors) {
    return errors.map(function(error) {
        return {
            path: error.path,
            msg: error.msg,
            value: inspect(error.value.length === 1 ? error.value[0] : error.value, {depth: null})
        };
    });
}
