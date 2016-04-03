var should = require('chai').should(),
    Entity = require('../lib/entity');

describe('Entity.prototype', function() {
    var entity;

    describe('.getTechs', function() {
        it('should get all techs', function() {
            entity = new Entity([{tech: 'first.tech'}, {tech: 'second.tech'}]);

            entity.getTechs().should.be.eql([{tech: 'first.tech'}, {tech: 'second.tech'}]);
        });
    });

    describe('.getDirname', function() {
        it('should get a dirname of an entity', function() {
            entity = new Entity([{path: 'entity/dir/some.tech'}]);

            entity.getDirName().should.be.eql('entity/dir');
        });
    });

    describe('.getNotation', function() {
        it('should get a notation of an entity', function() {
            entity = new Entity([{entity: {block: 'some-block'}}]);

            entity.getNotation().should.be.eql({block: 'some-block'});
        });
    });

    describe('.getLevel', function() {
        it('should get a level of an entity', function() {
            entity = new Entity([{level: 'some.level'}]);

            entity.getLevel().should.be.eql('some.level');
        });
    });

    describe('.getTechByName', function() {
        it('should get a tech by name', function() {
            entity = new Entity([{name: 'first.tech'}, {name: 'second.tech'}]);

            entity.getTechByName('first.tech').should.be.eql({name: 'first.tech'});
        });

        it('should not find a tech by name', function() {
            entity = new Entity([{name: 'some.tech'}]);

            should.not.exist(entity.getTechByName('another.tech'));
        });
    });

    describe('.addError', function() {
        it('should throw without an error msg', function() {
            entity = new Entity([{name: 'some.tech'}]);

            (function() {
                entity.addError({tech: 'some.tech'});
            }).should.throw();
        });

        it('should throw without both a tech name and a path', function() {
            entity = new Entity();

            (function() {
                entity.addError({msg: 'some-msg'});
            }).should.throw();
        });

        it('should not throw without a tech name and with a path', function() {
            entity = new Entity();

            (function() {
                entity.addError({msg: 'some-msg', path: 'some/path'});
            }).should.not.throw();
        });

        it('should not throw with a tech name and withouth a path', function() {
            entity = new Entity();

            (function() {
                entity.addError({msg: 'some-msg', tech: 'js'});
            }).should.not.throw();
        });

        it('should throw with both a tech name and a path', function() {
            entity = new Entity();

            (function() {
                entity.addError({msg: 'some-msg', tech: 'js', path: 'some/path'});
            }).should.throw();
        });

        it('should throw if an error msg is not a string', function() {
            entity = new Entity();

            (function() {
                entity.addError({msg: 12345, tech: 'some.tech'});
            }).should.throw();
        });

        it('should throw if an error value is not an object or a string', function() {
            entity = new Entity([{name: 'some.tech'}]);

            (function() {
                entity.addError({msg: 'some-msg', tech: 'some.tech', value: 12345});
            }).should.throw();
        });

        it('should not throw if an error value is a plain object', function() {
            entity = new Entity([{name: 'some.tech'}]);

            (function() {
                entity.addError({msg: 'some-msg', tech: 'some.tech', value: {}});
            }).should.not.throw();
        });

        it('should not throw if an error value is an array', function() {
            entity = new Entity([{name: 'some.tech'}]);

            (function() {
                entity.addError({msg: 'some-msg', tech: 'some.tech', value: []});
            }).should.not.throw();
        });

        it('should not throw if an error value is a string', function() {
            entity = new Entity([{name: 'some.tech'}]);

            (function() {
                entity.addError({msg: 'some-msg', tech: 'some.tech', value: 'some-value'});
            }).should.not.throw();
        });

        it('should not throw without an error value', function() {
            entity = new Entity([{name: 'some.tech'}]);

            (function() {
                entity.addError({msg: 'some-msg', tech: 'some.tech'});
            }).should.not.throw();
        });
    });

    describe('.getErrors', function() {
        it('should get errors', function() {
            entity = new Entity([{path: 'some/path', name: 'some.tech'}]);

            entity.addError({msg: 'some-msg', tech: 'some.tech', value: 'some-value'});

            entity.getErrors().should.be.eql([{msg: 'some-msg', path: 'some/path', value: 'some-value'}]);
        });

        it('should return path from error if it specified', function() {
            entity = new Entity([{path: 'some/path', name: 'some.tech'}]);

            entity.addError({msg: 'some-msg', value: 'some-value', path: 'other/path'});

            entity.getErrors().should.be.eql([{msg: 'some-msg', path: 'other/path', value: 'some-value'}]);
        });
    });
});
