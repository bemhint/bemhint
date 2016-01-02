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
    -с CONFIGPATH, --config=CONFIGPATH : Путь до конфигурационного файла (по умолчанию: .bemhint)
    -r REPORTERS, --reporter=REPORTERS : Вид отчета с ошибками – flat и/или html (по умолчанию: flat)

Аргументы:
    TARGETS : Пути до БЭМ-сущностей для проверки (обязательный аргумент)
```

### Конфигурационный файл

JSON-файл следующего формата:

```json
{
  "levels": [],
  "exludePaths": [],
  "plugins": {
    "<имя_плагина>": true
  }
}
```

#### levels

Список имен папок, которые являются уровнями переопределения (папками с блоками). Можно указывать маски, например, `*.blocks`, `blocks-*`.

#### excludePaths

Список путей, которые будут проигнорированны при проверке. Можно указывать маски, например, `node_modules/**`, `libs/**`.

####  plugins

Cписок подключаемых плагинов. Плагины подключаются из папки `node_modules` относительно расположения конфигурационного файла.
