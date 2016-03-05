var defaults = require('../lib/defaults');

describe('defaults', function() {
    it('should format the default object with options', function() {
        defaults().should.be.eql({
            basedir: process.cwd(),
            reporters: ['flat'],
            levels: [],
            excludePaths: [],
            plugins: {}
        });
    });

    it('should format a custom object with options', function() {
        var opts = {
            basedir: 'some/config/path',
            reporters: ['flat', 'html'],
            levels: ['*blocks'],
            excludePaths: ['some-libs/**'],
            plugins: {'some-plugin': true}
        };

        defaults(opts).should.be.eql(opts);
    });
});
