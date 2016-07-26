var util = require('util');
var tsm = require('teamcity-service-messages');

var REPORTER = 'bemhint';

function getErrorValue(error) {
    var errorValue = error.value;

    return typeof errorValue  === 'object' ? util.inspect(errorValue, {depth: null}) : errorValue;
}

/**
 * @param {Error[]} errors
 */
exports.write = function(errors) {
    tsm.testSuiteStarted({name: REPORTER});

    errors.forEach(function(error) {
        var testName = error.path;

        tsm.testStarted({name: testName});
        tsm.testFailed({
            name: testName,
            message: error.msg,
            detailed: getErrorValue(error)
        });
        tsm.testFinished({name: testName});
    });

    // If there were no errors, tell TeamCity that tests ran successfully
    if(errors.length === 0) {
        tsm.testStarted({name: REPORTER});
        tsm.testFinished({name: REPORTER});
    }

    tsm.testSuiteFinished({name: REPORTER});
};
