var fs = require('fs'),
    path = require('path'),
    format = require('util').format,
    defaults = require('./defaults')(),
    bemhint = require('./'),
    hasErrors = require('./utils').hasErrors,
    defaultConfigPath = '.bemhint.js',
    defaultReporter = defaults.reporters[0];

///
module.exports = require('coa').Cmd()
    .name(process.argv[1])
    .helpful()
    .title('BEM hint')
    .opt()
        .name('configPath')
        .title(format('Path to a configuration file (default: %s)', defaultConfigPath))
        .short('c').long('config')
        .def(defaultConfigPath)
        .val(path.resolve)
        .end()
    .opt()
        .name('reporters')
        .title(format('flat or/and html (default: %s)', defaultReporter))
        .long('reporter').short('r')
        .def(defaultReporter)
        .arr()
        .end()
    .arg()
        .name('targets')
        .title('Paths to BEM entities')
        .arr()
        .req()
        .end()
    .act(runBemhint)
    .run();

/**
 * @param {Object} opts
 * @param {String} opts.configPath
 * @param {String[]} opts.reporters
 * @param {Object} args
 * @param {String} args.targets
 * @returns {Promise<undefined>}
 */
function runBemhint(opts, args) {
    var configPath = opts.configPath,
        config = path.extname(configPath) ? require(configPath) : JSON.parse(fs.readFileSync(configPath));

    return bemhint(args.targets, {
        basedir: path.dirname(configPath),
        reporters: opts.reporters,
        levels: config.levels,
        excludePaths: config.excludePaths,
        plugins: config.plugins
    })
    .then(function(defects) {
        if(hasErrors(defects)) {
            process.exit(1);
        }
    });
}
