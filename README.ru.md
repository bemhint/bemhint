# bemhint [![Build Status](https://travis-ci.org/bemhint/bemhint.svg)](https://travis-ci.org/bemhint/bemhint) [![Dependency Status](https://david-dm.org/bemhint/bemhint.svg)](https://david-dm.org/bemhint/bemhint) [![devDependency Status](https://david-dm.org/bemhint/bemhint/dev-status.svg)](https://david-dm.org/bemhint/bemhint#info=devDependencies)

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
    -r REPORTERS, --reporter=REPORTERS : Вид отчета с ошибками – flat, html и/или teamcity (по умолчанию: flat)

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

    // список подключаемых плагинов, плагины подключаются
    // относительно расположения конфигурационного файла
    plugins: {
        // плагин не будет подключен
        '<имя_плагина>': false,

        // обычное подключение плагина
        '<имя_плагина>': true,

        // подключение плагина с конфигом
        '<имя_плагина>': {
            // конфиг

            // список путей, которые будут проигнорированы плагином при проверке
            excludePaths: [
                'some.blocks/some-block/**',
                'some.blocks/another-block/_some-mod/*',
                'some.blocks/yet-another-block/yet-another-block.deps.js'
            ],

            // набор технологий, которые необходимо проверять плагином
            techs: {
                '*': false,
                'js|deps.js': true,

                // отдельный конфиг для технологии `bemhtml.js`
                'bemhtml.js': {
                    // конфиг
                }
            }

            // конфиг
        },
        // плагин подключен и будет запущен столько раз, сколько конфигураций для него указано;
        // использование плагина подобным образом может вызвать различные побочные эффекты
        // в зависимости от реализации плагина
        '<имя_пдагина>': [
            {
                // конфиг
                tech: {
                    'deps.js': true
                }
            },
            {
                // другой конфиг
                tech: {
                    'bemdecl.js': true
                }
            }
        ]
    }
};
```

**Замечание!** Конфиг для плагина может содержать не только зарезервированные поля `excludePaths` и `techs`, их наличие определяется реализацией плагина.

## Написание плагинов

JS-файл следующего формата:

```js
module.exports = {
    /**
     * Предопределенный конфиг для плагина,
     * данный конфиг будет объединен с пользовательским конфигом
     * @returns {Object}
     */
    configure: function() {
        return {
            // конфиг
        }
    },

    /**
     * @param {Entity[]} entities
     * @param {Config} config
     */
    forEntities: function(entities, config) {
        // Использование этой функции будет полезно,
        // если для реализации проверки необходимо знание
        // о всех БЭМ-сущностях проекта
    },

    /**
     * @param {Entity} entity
     * @param {Config} config
     */
    forEachEntity: function(entity, config) {
        // Использование этой функции будет полезно,
        // если для реализации проверки достаточно знание
        // о каждой из БЭМ-сущностей в отдельности
    },

    /**
     * @param {Object} tech
     * @param {Entity} entity
     * @param {Config} config
     */
    forEachTech: function(tech, entity, config) {
        // Использование этой функции будет полезно,
        // если для реализации проверки достаточно знание
        // о каждой из технологий БЭМ-сущностей в отдельности
    }
};
```

**Замечание!** Реализуемый плагин может содержать как одну из функций `forEntities`, `forEachEntity`, `forEachTech`, так и все три, при этом функция `configure` не является обязательной.

#### Entity

БЭМ-сущность проверяемого проекта (блок, элемент, модификатор).

**Entity.prototype.getTechs**<br>
**@returns** *{Tech[]}* - список технологий, в которых реализована данная БЭМ-сущность

**Entity.prototype.getTechByName**<br>
**@param** *{String}* – имя технологии (css, js и т.д.)<br>
**@returns** *{Tech}* – технология БЭМ-сущности

**Entity.prototype.addError**<br>
**@param** *{Object}* - объект, описывающий ошибку:
 * **location** *{Object}* - `{line, column}` позиция ошибки в файле; работает только с аргументом `tech`
 * **msg** *{String}* – сообщение об ошибке
 * **tech** *{String}* – имя технологии, в которой найдена ошибка
 * **[value]** *{String|Object}* – значение ошибки

**Entity.prototype.addWarning**<br>

У этого метода такое же API как у `addError`.

#### Config

Конфиг плагина.

**Config.prototype.getConfig**<br>
**@returns** *{Object}* – полный конфиг для плагина

**Config.prototype.getTechConfig**<br>
**@param** *{String}* – имя технологии (css, js и т.д.)<br>
**@returns** *{Object}* – конфиг для технологии

**Config.prototype.isExcludedPath**<br>
**@param** *{String}* – путь до технологии БЭМ-сущности<br>
**@returns** *{Boolean}*

**Config.prototype.resolvePath**<br>
**@param** *{String}* – дополняемый путь<br>
**@returns** *{String}* – абсолютный путь дополненный относительно расположения конфига

## Примеры плагинов

* [bemhint-deps-schema](https://github.com/bemhint/bemhint-deps-schema)
* [bemhint-css-naming](https://github.com/bemhint/bemhint-css-naming)
* [bemhint-fs-naming](https://github.com/bemhint/bemhint-fs-naming) (экспериментальный)
* [bemhint-bem-xjst](https://github.com/bemhint/bemhint-bem-xjst)
* [bemhint-estree](https://github.com/bemhint/bemhint-estree)
