module.exports = {
    'blocks/block1': {
        js: {
            name: 'block1.js',
            tech: 'js',
            path: 'blocks/block1/block1.js',
            content: 'BEM.DOM.decl()'
        },
        bemhtml: {
            name: 'block1.bemhtml',
            tech: 'bemhtml',
            path: 'blocks/block1/block1.bemhtml',
            content: 'BEM.I18N()'
        },
        'deps.js': {
            name: 'block1.deps.js',
            tech: 'deps.js',
            path: 'blocks/block1/block1.deps.js',
            content: '({ mustDeps: [] })'
        },
        css: {
            name: 'block1.css',
            tech: 'css',
            path: 'blocks/block1/block1.css',
            content: 'css'
        }
    },
    'blocks/block2': {
        js: {
            name: 'block2.js',
            tech: 'js',
            path: 'blocks/block2/block2.js',
            content: 'BEM.decl()'
        }
    },
    'blocks/block3': {
        css: {
            name: 'block3.css',
            tech: 'css',
            path: 'blocks/block3/block3.css',
            content: 'css'
        }
    }
};
