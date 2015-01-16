var mockFs = require('mock-fs'),
    loadRules = require('../../lib/load-rules');

describe('load-rules', function () {
    beforeEach(function () {
        mockFs({
            lib: {
                rules: {
                    folder: {},
                    'file.js': 'module.exports = {}',
                    'blah.blah.js': 'module.exports = {}',
                    'another.ext': 'another.ext'
                }
            }
        });
    });

    afterEach(function () {
        mockFs.restore();
    });

    it('must load rules', function (done) {
        loadRules()
            .then(function (res) {
                res.must.be.eql({
                    'file.js': {},
                    'blah.blah.js': {}
                });
            })
            .then(done, done);
    });
});
