var utils = require('../../lib/utils');

describe('utils', function () {
    describe('array wrapper', function () {
        it('must wrap a plain object into array', function () {
            utils.wrapIntoArray({}).must.be.eql([{}]);
        });

        it('must wrap an array into array', function () {
            utils.wrapIntoArray([]).must.be.eql([]);
        });
    });
});
