var path = require('path'),
    logger = require('./logger'),
    bemhint = require('./bemhint');

require('colors');

module.exports = require('coa').Cmd()
    .name(process.argv[1])
    .helpful()
    .title('Compares two HTML')
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
        .title('Path to a configuration file')
        .long('config').short('c')
        .req()
        .end()
    .act(function (opts) {
        var config = require(path.resolve(opts.config));

        bemhint(config)
            .then(function (res) {
                logger.showErrors(res);
            })
            .fail(function (err) {
                console.log(err);
            });
    })
    .run(process.argv.slice(2));
