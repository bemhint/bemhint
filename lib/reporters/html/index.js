var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    Handlebars = require('handlebars');

/**
 * @typedef {Object} Error
 * @property {String} path
 * @property {String} msg
 * @property {Object|String} [value]
 */

/**
 * @param {Error[]} errors
 */
exports.write = function(errors) {
    Handlebars.registerHelper('split', function(str, column, selector) {
        var index = column - 1,
            left = Handlebars.Utils.escapeExpression(str.substr(0, index)),
            right = Handlebars.Utils.escapeExpression(str.substr(index));

        return new Handlebars.SafeString('<span class="' + selector + '-left">' + left + '</span>' +
            '<span class="' + selector + '-right">' + right + '</span>');
    });

    var source = fs.readFileSync(path.join(__dirname, 'suite.hbs'), 'utf-8'),
        stylesheet = fs.readFileSync(path.join(__dirname, 'index.css'), 'utf-8'),
        template = Handlebars.compile(source),
        data = {
            stylesheet: stylesheet,
            title: errors.length ? 'BEM errors:' : 'No BEM errors.',
            errors: inspectErrors(errors)
        };

    fs.writeFileSync(path.resolve('bemhint-report.html'), template(data));
};

///
function inspectErrors(errors) {
    return errors.map(function(error) {
        return {
            path: error.path,
            msg: error.msg,
            value: error.value ? util.inspect(error.value, {depth: null}) : '',
            location: error.location
        };
    });
}
