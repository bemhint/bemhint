'use strict';

var mockFs = require('mock-fs'),
    utils = require('../lib/utils');

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

    describe('.replaceTech', function() {
        it('should replace tech in a given path', function() {
            utils.replaceTech('/some/path/file.some.tech', 'another.tech')
                .should.be.equal('/some/path/file.another.tech');
        });
    });

    describe('.listTree', function() {
        beforeEach(() => {
            mockFs({
                foo: {
                    bar: {
                        abc: 'abc-content'
                    },
                    baz: 'baz-content'
                }
            });
        });

        afterEach(() => {
            mockFs.restore();
        });

        it('should guard with true/false', () =>
            utils
                .listTree('foo', (filePath) => {
                    switch(filePath) {
                        case 'foo':
                        case 'foo/baz':
                        case 'foo/bar/abc':
                            return true;

                        case 'foo/bar':
                            return false;
                    }
                })
                .should.become(['foo', 'foo/bar/abc', 'foo/baz'])
        );

        it('should guard with null', () =>
            utils
                .listTree('foo', (filePath) => {
                    switch(filePath) {
                        case 'foo':
                        case 'foo/baz':
                        case 'foo/bar/abc':
                            return true;

                        case 'foo/bar':
                            return null;
                    }
                })
                .should.become(['foo', 'foo/baz'])
        );

        it('should guard files', () =>
            utils
                .listTree('foo', (filePath, stat) => !stat.isDirectory())
                .should.become(['foo/bar/abc', 'foo/baz'])
        );

        it('should guard directories', () =>
            utils
                .listTree('foo', (filePath, stat) => stat.isDirectory())
                .should.become(['foo', 'foo/bar'])
        );

        it('should fail on missing file', () =>
            utils
                .listTree('xyz', () => false)
                .should.be.rejected
        );
    });

    describe('.readIfFile', function() {
        beforeEach(() => {
            mockFs({
                foo: [],
                bar: 'abc'
            });
        });

        afterEach(() => {
            mockFs.restore();
        });

        it('should return undefined for directory', () =>
            utils
                .readIfFile('foo')
                .should.eventually.be.undefined
        );

        it('should fail for missing file', () =>
            utils
                .readIfFile('xyz')
                .should.be.rejected
        );

        it('should read normal file content', () =>
            utils
                .readIfFile('bar')
                .should.eventually.be.equal('abc')
        );
    });
});
