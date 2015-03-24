var utils = require('../../lib/utils');

describe('utils', function () {
    it('must get entity info', function () {
        var input = {
                js: {
                    name: 'block1.js',
                    tech: 'js',
                    path: 'blocks/block1/block1.js'
                },
                bemhtml: {
                    name: 'block1.bemhtml',
                    tech: 'bemhtml',
                    path: 'blocks/block1/block1.bemhtml'
                }
            },
            output = {
                path: 'blocks/block1',
                basename: 'block1.'
            };

        utils.getEntityInfo(input).must.be.eql(output);
    });

    describe('array wrapper', function () {
        it('must wrap a plain object into array', function () {
            utils.wrapIntoArray({}).must.be.eql([{}]);
        });

        it('must wrap an array into array', function () {
            utils.wrapIntoArray([]).must.be.eql([]);
        });
    });
});
