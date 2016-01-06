# bemhint [![Build Status](https://travis-ci.org/bem/bemhint.svg)](https://travis-ci.org/bem/bemhint) [![Dependency Status](https://david-dm.org/bem/bemhint.svg)](https://david-dm.org/bem/bemhint) [![devDependency Status](https://david-dm.org/bem/bemhint/dev-status.svg)](https://david-dm.org/bem/bemhint#info=devDependencies)

**bemhint** – это *плагинируемый* линтер БЭМ-проектов.

Данный модуль является ядром линтера, предоставляющим API для запуска и написания внешних плагинов, через которые реализуются проверки БЭМ-сущностей проекта.

## Установка

```bash
$ npm install bemhint
```

## Использование

```bash
$ bemhint --help

Использование:
    bemhint [ОПЦИИ] [АРГУМЕНТЫ]

Опции:
    -h, --help : Помощь
    -с CONFIGPATH, --config=CONFIGPATH : Путь до конфигурационного файла (по умолчанию: .bemhint.js)
    -r REPORTERS, --reporter=REPORTERS : Вид отчета с ошибками – flat и/или html (по умолчанию: flat)

Аргументы:
    TARGETS : Пути до БЭМ-сущностей для проверки (обязательный аргумент)
```

## Конфигурационный файл

JS/JSON-файл следующего формата:

```js
module.exports = {
    // cписок имен папок, которые являются уровнями переопределения (папками с блоками)
    levels: [
        '*.blocks',
        'blocks-*'
    ],

    // список путей, которые будут проигнорированы при проверке
    excludePaths: [
        'node_modules/**',
        'libs/**'
    ],

    // список подключаемых плагинов, плагины подключаются из папки `node_modules`
    // относительно расположения конфигурационного файла
    plugins: {
        '<имя_плагина>': false, // плагин не будет подключен

        '<имя_плагина>': true, // обычное подключение плагина

        '<имя_плагина>': { // подключение плагина с конфигом
            // конфиг

            // список путей, которые будут проигнорированы плагином при проверке
            excludePaths: [
                'some.blocks/some-block/**',
                'some.blocks/another-block/_some-mod/*',
                'some.blocks/yet-another-block/yet-another-block.deps.js'
            ],

            techs: { // набор технологий, которые необходимо проверять плагином
                '*': false,
                'js|deps.js': true,
                'priv.js': { // отдельный конфиг для технологии `priv.js`
                    // конфиг
                }
            }

            // конфиг
        }
    }
};
```

**Замечание!** Конфиг для плагина может содержать не только зарезервированные поля `excludePaths` и `techs`, их наличие определяется реализацией плагина.
