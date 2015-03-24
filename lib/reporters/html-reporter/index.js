var fs = require('fs'),
    path = require('path'),
    inspect = require('util').inspect,
    Handlebars = require('handlebars');

/**
 * @param {Object[]} errors
 * @returns {Object[]}
 */
function inspectErrors(errors) {
    return errors.map(function (error) {
        return {
            path: error.path,
            actual: inspect(error.actual),
            expected: inspect(error.expected)
        };
    });
}

module.exports = {
    /**
     * Writes the html report
     * @param {Object[]} errors
     * @returns {undefined}
     */
    write: function (errors) {
        var source = fs.readFileSync(path.join(__dirname, 'suite.hbs'), 'utf-8'),
            template = Handlebars.compile(source),
            data = {
                title: errors.length ? 'BEM errors: ' : 'No BEM errors.',
                errors: inspectErrors(errors)
            };

        fs.writeFileSync(path.resolve('bemhint-report.html'), template(data));
    }
};
