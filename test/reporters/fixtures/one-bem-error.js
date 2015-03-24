require('colors');

module.exports = [
    [
        'example/blocks/block1/__elem1:'.bold,
        'actual:   '.bold.red   + '\'No deps file block1__elem1_mod1.deps.js\'',
        'expected: '.bold.green + '{ block: \'i-bem\', elems: [ \'dom\', \'html\', \'i18n\' ] }'
    ].join('\n')
].join('\n\n') + '\n\n1 error.\n';
