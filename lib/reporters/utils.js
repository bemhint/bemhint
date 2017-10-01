var _ = require('lodash');

function formatFooter(defects) {
    var problemsCount = defects.length,
        problemsStr = format_(problemsCount, 'problem'),
        errorsCount = _.sum(defects, (defect) => defect.type === 'error'),
        errorsStr = format_(errorsCount, 'error'),
        warningsStr = format_(problemsCount - errorsCount, 'warning');

    return `${problemsStr} (${errorsStr}, ${warningsStr})`;

    function format_(defectsCount, word) {
        return defectsCount + ' ' + (defectsCount === 1 ? word : word + 's');
    }
}

module.exports = {
    formatFooter: formatFooter
};
