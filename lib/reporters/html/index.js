var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    Handlebars = require('handlebars'),
    _ = require('lodash'),
    formatFooter = require('../utils').formatFooter,
    hasErrors = require('../../utils').hasErrors;

/**
 * @typedef {Object} Error
 * @property {String} path
 * @property {String} msg
 * @property {String} type - error|warning
 * @property {Object|String} [value]
 * @property {Object} [location]
 */

/**
 * @param {Defect[]} defects
 */
exports.write = function(defects) {
    Handlebars.registerHelper('split', function(str, column, selector) {
        var index = column - 1,
            left = Handlebars.Utils.escapeExpression(str.substr(0, index)),
            right = Handlebars.Utils.escapeExpression(str.substr(index));

        return new Handlebars.SafeString('<span class="' + selector + '-left">' + left + '</span>' +
            '<span class="' + selector + '-right">' + right + '</span>');
    });

    var source = fs.readFileSync(path.join(__dirname, 'defects.hbs'), 'utf-8'),
        stylesheet = fs.readFileSync(path.join(__dirname, 'index.css'), 'utf-8'),
        template = Handlebars.compile(source),
        data = {
            stylesheet: stylesheet,
            footer: defects.length ? formatFooter(defects) : '0 problems (0 errors, 0 warnings)',
            defects: inspectDefects(defects),
            hasErrors: hasErrors(defects)
        };

    fs.writeFileSync(path.resolve('bemhint-report.html'), template(data));
};

///
function inspectDefects(defects) {
    return defects.map(function(defect) {
        var value = '';

        if(defect.value) {
            value = _.isObject(defect.value) ? util.inspect(defect.value, {depth: null}) : defect.value;
        }

        return {
            path: defect.path,
            msg: defect.msg,
            value: value,
            location: defect.location,
            isError: defect.type === 'error'
        };
    });
}
