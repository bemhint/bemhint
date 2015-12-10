var _ = require('lodash'),
    q = require('q'),
    qfs = require('q-io/fs'),
    sinon = require('sinon'),
    Config = require('../lib/config'),
    scanner = require('../lib/scanner'),
    bemWalk = require('../lib/scanner/bem-walk');

describe('scanner', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function() {
        sandbox.stub(qfs);
        sandbox.stub(bemWalk);
        sandbox.stub(Config.prototype);

        Config.prototype.getLevels.returns(q(['some-default-level']));
        Config.prototype.isTargetPath.returns(true);
        Config.prototype.isExcludedPath.returns(false);

        bemWalk.walk.returns(q([]));
    });

    afterEach(function() {
        sandbox.restore();
    });

    ///
    function scanLevels_() {
        return scanner.scan(new Config());
    }

    it('should scan levels', function() {
        Config.prototype.getLevels
            .returns(q(['first-level', 'second-level']));

        return scanLevels_()
            .then(function() {
                bemWalk.walk.should.be.calledWith(['first-level', 'second-level']);
            });
    });

    it('should skip a tech in a level if it is not a target', function() {
        bemWalk.walk.returns(q([{path: 'some-path'}]));

        Config.prototype.isTargetPath
            .withArgs('some-path')
            .returns(false);

        return scanLevels_()
            .should.eventually.be.eql([]);
    });

    it('should skip a tech in a level if it is excluded', function() {
        bemWalk.walk.returns(q([{path: 'some-path'}]));

        Config.prototype.isExcludedPath
            .withArgs('some-path')
            .returns(true);

        return scanLevels_()
            .should.eventually.be.eql([]);
    });

    it('should not load a tech content if it is a dir', function() {
        bemWalk.walk.returns(q([{path: 'some-path'}]));

        qfs.stat.returns(q({isDirectory: _.constant(true)}));

        return scanLevels_()
            .should.eventually.be.eql([{path: 'some-path'}]);
    });

    it('should scan a tech in a level and load its content', function() {
        bemWalk.walk.returns(q([{path: 'some-path'}]));

        qfs.stat.returns(q({isDirectory: _.constant(false)}));
        qfs.read.returns(q('some-content'));

        return scanLevels_()
            .should.eventually.be.eql([{path: 'some-path', content: 'some-content'}]);
    });
});
