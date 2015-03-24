require('colors');

module.exports = [
    [
        'example/blocks/block1/__elem1:'.bold,
        'actual:   '.bold.red   + '\'No deps file block1__elem1_mod1.deps.js\'',
        'expected: '.bold.green + '{ block: \'i-bem\', elems: [ \'dom\', \'html\', \'i18n\' ] }'
    ].join('\n'),
    [
        'example/blocks/block1/__elem1/block1__elem1_mod2.deps.js:'.bold,
        'actual:   '.bold.red   + '{}',
        'expected: '.bold.green + '{ block: \'i-bem\' }'
    ].join('\n'),
    [
        'example/blocks/block1/_mod1/block1_mod1.deps.js:'.bold,
        'actual:   '.bold.red   + '{ block: \'i-bem\', elems: [ \'html\' ] }',
        'expected: '.bold.green + '{ block: \'i-bem\', elems: [ \'html\', \'i18n\' ] }'
    ].join('\n')
].join('\n\n') + '\n\n3 errors.\n';
