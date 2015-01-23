var utils = require('../../lib/utils');

describe('utils', function () {
    it('must sort array of objects by property \'fullpath\'', function () {
        var input = [{ fullpath: '3' }, { fullpath: '1' }, { fullpath: '2' }],
            output = [{ fullpath: '1' }, { fullpath: '2' }, { fullpath: '3' }];

        utils.sortByFullpath(input).must.be.eql(output);
    });

    it('must get files from entity by techs', function () {
        var input = [{ tech: 'tech1' }, { tech: 'tech2' }, { tech: 'tech0' }],
            output = { tech1: { tech: 'tech1' }, tech2: { tech: 'tech2' } };

        utils.getFilesByTechs(input, ['tech1', 'tech2']).must.be.eql(output);
    });
});
