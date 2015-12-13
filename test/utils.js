var utils = require('../lib/utils');

describe('utils', function() {
    describe('.someMinimatch', function() {
        it('should find a match for a path from a list of masks', function() {
            utils.someMinimatch(['some-dir/**', 'some-file.*'], 'some-dir/some-file').should.be.true;
        });

        it('should not find a match for a path from a list of masks', function() {
            utils.someMinimatch(['some-dir/**', 'some-file.*'], 'another-file.ext').should.be.false;
        });
    });

    describe('.hasGlobstarEnding', function() {
        it('should be a path with a globstar ending', function() {
            utils.hasGlobstarEnding('some/path/**').should.be.true;
        });

        it('should not be a path with a globstar ending', function() {
            utils.hasGlobstarEnding('some/path/*').should.be.false;
        });
    });
});
