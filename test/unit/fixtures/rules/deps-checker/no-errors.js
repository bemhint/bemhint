module.exports = {
    'blocks/block1': [
        {
            name: 'block1.bemhtml',
            tech: 'bemhtml',
            path: 'blocks/block1/block1.bemhtml',
            content: 'bemhtml'
        },
        {
            name: 'block1.deps.js',
            tech: 'deps.js',
            path: 'blocks/block1/block1.deps.js',
            content: '({ mustDeps: [{ block: \'i-bem\', elems: [\'html\'] }] })'
        }
    ],
    'blocks/block2': [
        {
            name: 'block2.js',
            tech: 'js',
            path: 'blocks/block2/block2.js',
            content: 'BEM.decl()'
        },
        {
            name: 'block2.deps.js',
            tech: 'deps.js',
            path: 'blocks/block2/block2.deps.js',
            content: '({ mustDeps: \'i-bem\' })'
        }
    ]
};
