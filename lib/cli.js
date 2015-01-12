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
        .req()
        .end()
    .act(function (opts) {
        var config = require(path.resolve(opts.config));

        return bemhint(config)
            .then(function (res) {
                logger.showErrors(res);
            })
            .fail(function (err) {
                throw err;
            });
    })
    .run(process.argv.slice(2));
