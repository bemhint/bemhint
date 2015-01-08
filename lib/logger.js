var util = require('util');

require('colors');

module.exports = {
    showErrors: function (checked) {
        checked.forEach(function (item) {
            console.log((item.fullpath + ':').bold);

            console.log('actual:   '.red.bold + util.inspect(item.actualDeps, { depth: null }));
            console.log('expected: '.green.bold + util.inspect(item.expectedDeps, { depth: null }));

            console.log();
        });

        if (checked.length) {
            throw checked.length + ' error' + (checked.length > 1 ? 's' : '') + '.';
        } else {
            console.log('No BEM errors.');
        }
    }
};
