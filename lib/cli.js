var fs = require('fs'),
    path = require('path'),
    format = require('util').format,
    _ = require('lodash'),
    defaults = require('./defaults')(),
    bemhint = require('./'),
    defaultConfigPath = defaults.configPath,
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
    .act(function(opts, args) {
        var config = path.extname(opts.configPath)
            ? require(opts.configPath)
            : JSON.parse(fs.readFileSync(opts.configPath));

        return bemhint(args.targets, _.extend(opts, {config: config}))
            .then(function(errors) {
                if(errors.length) {
                    process.exit(1);
                }
            });
    })
    .run();
