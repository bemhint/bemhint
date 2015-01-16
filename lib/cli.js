/**
 * The CLI of BEM hint
 * ===================
 */
var path = require('path'),
    logger = require('./logger'),
    bemhint = require('./bemhint');

/**
 * @example
 * Run the command `npm run example`
 */
module.exports = require('coa').Cmd()
    .name(process.argv[1])
    .helpful()
    .title('BEM hint')
    .opt()
        .name('version')
        .title('Shows the version number')
        /*jshint -W024 */
        .short('v').long('version')
        .flag()
        .only()
        .act(function () {
            var p = require('../package.json');
            return p.name + ' ' + p.version;
        })
        .end()
    .opt()
        .name('config')
        .title('Path to the configuration file')
        .long('config').short('c')
        .end()
    .arg()
        .name('targets')
        .title('Path to the directory for check')
        .arr()
        .end()
    .act(function (opts, args) {
        var loadedConfig = require(path.resolve(opts.config || '.bemhint.js')),
            targets = args.targets;

        loadedConfig.configPath = opts.config;

        return bemhint(loadedConfig, targets)
            .then(function (bemErrors) {
                logger.showErrors(bemErrors);
            })
            .fail(function (err) {
                throw err;
            });
    })
    .run(process.argv.slice(2));
