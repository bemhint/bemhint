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
                entity.addError({name: 'some.tech'});
            }).should.throw();
        });

        it('should throw without a tech name', function() {
            entity = new Entity();

            (function() {
                entity.addError({msg: 'some-msg'});
            }).should.throw();
        });

        it('should throw if an error msg is not a string', function() {
            entity = new Entity();

            (function() {
                entity.addError({msg: 12345, name: 'some.tech'});
            }).should.throw();
        });

        it('should throw if an entity is not implemented in a given tech', function() {
            entity = new Entity([{name: 'some.tech'}]);

            (function() {
                entity.addError({msg: 'some-msg', name: 'another.tech'});
            }).should.throw();
        });

        it('should throw if an error value is not an object or a string', function() {
            entity = new Entity([{name: 'some.tech'}]);

            (function() {
                entity.addError({msg: 'some-msg', name: 'some.tech', value: 12345});
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
    });
});
