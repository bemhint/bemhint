var utils = require('../../lib/utils');

describe('utils', function () {
    it('must sort array of objects by property \'fullpath\'', function () {
        var input = [{ fullpath: '3' }, { fullpath: '1' }, { fullpath: '2' }],
            output = [{ fullpath: '1' }, { fullpath: '2' }, { fullpath: '3' }];

        utils.sortByFullpath(input).must.be.eql(output);
    });
});
