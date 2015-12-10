var reporters = require('../../lib/reporters'),
    flatReporter = require('../../lib/reporters/flat'),
    htmlReporter = require('../../lib/reporters/html');

describe('reporters', function() {
    it('should make a flat reporter', function() {
        reporters.mk('flat').should.be.equal(flatReporter);
    });

    it('should make an html reporter', function() {
        reporters.mk('html').should.be.equal(htmlReporter);
    });
});
