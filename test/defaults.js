var defaults = require('../lib/defaults');

describe('defaults', function() {
    it('should format the default object with options', function() {
        defaults().should.be.eql({
            configPath: '.bemhint.js',
            reporters: ['flat'],
            config: {
                levels: [],
                excludePaths: [],
                plugins: []
            }
        });
    });

    it('should format a custom object with options', function() {
        var opts = {
            configPath: 'some/config/path',
            reporters: ['flat', 'html'],
            config: {
                levels: ['*blocks'],
                excludePaths: ['some-libs/**'],
                plugins: ['some/plugin']
            }
        };

        defaults(opts).should.be.eql(opts);
    });
});
