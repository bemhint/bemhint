var util = require('util');
var tsm = require('teamcity-service-messages');
var hasErrors = require('../utils').hasErrors;

var REPORTER = 'bemhint';

function getErrorValue(error) {
    var errorValue = error.value;

    return typeof errorValue  === 'object' ? util.inspect(errorValue, {depth: null}) : errorValue;
}

/**
 * @param {Defect[]} defects
 */
exports.write = function(defects) {
    tsm.testSuiteStarted({name: REPORTER});

    defects
        .filter((defect) => defect.type === 'error')
        .forEach(function(defect) {
            var testName = defect.path;

            tsm.testStarted({name: testName});
            tsm.testFailed({
                name: testName,
                message: defect.msg,
                detailed: getErrorValue(defect)
            });
            tsm.testFinished({name: testName});
        });

    // If there were no defects, tell TeamCity that tests ran successfully
    if(!hasErrors(defects)) {
        tsm.testStarted({name: REPORTER});
        tsm.testFinished({name: REPORTER});
    }

    tsm.testSuiteFinished({name: REPORTER});
};
