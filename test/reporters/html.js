var htmlReporter = require('../../lib/reporters/html');

describe('html reporter', function() {
    it('should throw on attempt to use html reporter', function() {
        (function() {
            htmlReporter.write();
        }).should.throw();
    });
});
