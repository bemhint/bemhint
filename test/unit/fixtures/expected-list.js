module.exports = [
    {
        name: 'block1',
        fullpath: 'common.blocks/block1',
        children: [
            {
                name: '__elem1',
                fullpath: 'common.blocks/block1/__elem1',
                children: [
                    {
                        name: '_mod1',
                        fullpath: 'common.blocks/block1/__elem1/_mod1',
                        children: [
                            {
                                name: 'block1__elem1_mod1.css',
                                fullpath: 'common.blocks/block1/__elem1/_mod1/block1__elem1_mod1.css',
                                suffix: '.css',
                                content: 'block1__elem1_mod1.css'
                            }
                        ]
                    },
                    {
                        name: 'block1__elem1.bemhtml',
                        fullpath: 'common.blocks/block1/__elem1/block1__elem1.bemhtml',
                        suffix: '.bemhtml',
                        content: 'block1__elem1.bemhtml'
                    },
                    {
                        name: 'block1__elem1.deps.js',
                        fullpath: 'common.blocks/block1/__elem1/block1__elem1.deps.js',
                        suffix: '.deps.js',
                        content: 'block1__elem1.deps.js'
                    }
                ]
            },
            {
                name: '_mod1',
                fullpath: 'common.blocks/block1/_mod1',
                children: [
                    {
                        name: 'block1_mod1.css',
                        fullpath: 'common.blocks/block1/_mod1/block1_mod1.css',
                        suffix: '.css',
                        content: 'block1_mod1.css'
                    }
                ]
            },
            {
                name: 'block1.js',
                fullpath: 'common.blocks/block1/block1.js',
                suffix: '.js',
                content: 'block1.js'
            }
        ]
    },
    {
        name: 'block2',
        fullpath: 'common.blocks/block2',
        children: [
            {
                name: 'block2.deps.js',
                fullpath: 'common.blocks/block2/block2.deps.js',
                suffix: '.deps.js',
                content: 'block2.deps.js'
            },
            {
                name: 'block2.js',
                fullpath: 'common.blocks/block2/block2.js',
                suffix: '.js',
                content: 'block2.js'
            }
        ]
    },
    {
        name: 'block1',
        fullpath: 'desktop.blocks/block1',
        children: [
            {
                name: '__elem1',
                fullpath: 'desktop.blocks/block1/__elem1',
                children: [
                    {
                        name: 'block1__elem1_mod1.bemhtml',
                        fullpath: 'desktop.blocks/block1/__elem1/block1__elem1_mod1.bemhtml',
                        suffix: '.bemhtml',
                        content: 'block1__elem1_mod1.bemhtml'
                    },
                    {
                        name: 'block1__elem1_mod1.css',
                        fullpath: 'desktop.blocks/block1/__elem1/block1__elem1_mod1.css',
                        suffix: '.css',
                        content: 'block1__elem1_mod1.css'
                    },
                    {
                        name: 'block1__elem1_mod1.deps.js',
                        fullpath: 'desktop.blocks/block1/__elem1/block1__elem1_mod1.deps.js',
                        suffix: '.deps.js',
                        content: 'block1__elem1_mod1.deps.js'
                    },
                    {
                        name: 'block1__elem1_mod1.js',
                        fullpath: 'desktop.blocks/block1/__elem1/block1__elem1_mod1.js',
                        suffix: '.js',
                        content: 'block1__elem1_mod1.js'
                    },
                    {
                        name: 'block1__elem1_mod2.deps.js',
                        fullpath: 'desktop.blocks/block1/__elem1/block1__elem1_mod2.deps.js',
                        suffix: '.deps.js',
                        content: 'block1__elem1_mod2.deps.js'
                    },
                    {
                        name: 'block1__elem1_mod2.js',
                        fullpath: 'desktop.blocks/block1/__elem1/block1__elem1_mod2.js',
                        suffix: '.js',
                        content: 'block1__elem1_mod2.js'
                    },
                ]
            },
            {
                name: 'block1.css',
                fullpath: 'desktop.blocks/block1/block1.css',
                suffix: '.css',
                content: 'block1.css'
            }
        ]
    }
];
