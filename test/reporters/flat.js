var util = require('util'),
    chalk = require('chalk'),
    sinon = require('sinon'),
    flatReporter = require('../../lib/reporters/flat'),
    std = require('../../lib/std');

describe('flat reporter', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function() {
        sandbox.stub(std);
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should report when there are no errors', function() {
        flatReporter.write([]);

        std.out.should.be.calledWith('No BEM errors.');
    });

    it('should report one error', function() {
        flatReporter.write([{msg: 'some-msg', path: 'some-path', value: 'some-value'}]);

        std.out.should.be.calledWith([
            chalk.bold('some-msg') + ' at ' + chalk.green('some-path') + ' :',
            'some-value\n',
            '1 error.'
        ].join('\n'));
    });

    it('should report several errors', function() {
        flatReporter.write([
            {msg: 'first-msg', path: 'first-path', value: 'first-value'},
            {msg: 'second-msg', path: 'second-path', value: 'second-value'}
        ]);

        std.out.should.be.calledWith([
            chalk.bold('first-msg') + ' at ' + chalk.green('first-path') + ' :',
            'first-value\n',
            chalk.bold('second-msg') + ' at ' + chalk.green('second-path') + ' :',
            'second-value\n',
            '2 errors.'
        ].join('\n'));
    });

    it('should report an error without a value', function() {
        flatReporter.write([{msg: 'some-msg', path: 'some-path'}]);

        std.out.should.be.calledWithMatch(chalk.bold('some-msg') + ' at ' + chalk.green('some-path') + '\n');
    });

    it('should handle an error which value is an object', function() {
        sandbox.stub(util, 'inspect');

        flatReporter.write([{value: {}}]);

        util.inspect.should.be.calledWith({});
    });
});
