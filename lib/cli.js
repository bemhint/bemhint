var path = require('path'),
    _ = require('lodash'),
    bemhint = require('./');

/**
 * CLI
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
        .act(function() {
            var p = require('../package.json');
            return p.name + ' ' + p.version;
        })
        .end()
    .opt()
        .name('configPath')
        .title('Path to the configuration file')
        .long('config').short('c')
        .end()
    .opt()
        .name('reporters')
        .title('flat or/and html (default: flat)')
        .long('reporter').short('r')
        .arr()
        .def('flat')
        .end()
    .arg()
        .name('targets')
        .title('Path to BEM entities for check')
        .arr()
        .req()
        .end()
    .act(function(opts, args) {
        var fileConfig = require(path.resolve(opts.configPath || '.bemhint.js'));

        return bemhint(_.extend(fileConfig, opts, args))
            .then(function(bemErrors) {
                if(bemErrors.length) {
                    process.exit(1);
                }
            });
    })
    .run(process.argv.slice(2));
