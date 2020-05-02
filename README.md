# optimize-yarn-lock

A CLI to optimize yarn.lock

[![Dependency Status](https://david-dm.org/plantain-00/optimize-yarn-lock.svg)](https://david-dm.org/plantain-00/optimize-yarn-lock)
[![devDependency Status](https://david-dm.org/plantain-00/optimize-yarn-lock/dev-status.svg)](https://david-dm.org/plantain-00/optimize-yarn-lock#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/optimize-yarn-lock.svg?branch=master)](https://travis-ci.org/plantain-00/optimize-yarn-lock)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/optimize-yarn-lock?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/optimize-yarn-lock/branch/master)
[![npm version](https://badge.fury.io/js/optimize-yarn-lock.svg)](https://badge.fury.io/js/optimize-yarn-lock)
[![Downloads](https://img.shields.io/npm/dm/optimize-yarn-lock.svg)](https://www.npmjs.com/package/optimize-yarn-lock)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Foptimize-yarn-lock%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/optimize-yarn-lock)

## features

```txt
"@babel/runtime@^7.0.0", "@babel/runtime@^7.3.1":
  version "7.3.1"
  resolved "https://registry.npm.taobao.org/@babel/runtime/download/@babel/runtime-7.3.1.tgz#574b03e8e8a9898eaf4a872a92ea20b7846f6f2a"
  dependencies:
    regenerator-runtime "^0.12.0"

"@babel/runtime@^7.1.2", "@babel/runtime@^7.4.0":
  version "7.4.5"
  resolved "https://registry.npm.taobao.org/@babel/runtime/download/@babel/runtime-7.4.5.tgz#582bb531f5f9dc67d2fcb682979894f75e253f12"
  dependencies:
    regenerator-runtime "^0.13.2"

"@babel/runtime@^7.4.5":
  version "7.5.5"
  resolved "https://registry.npm.taobao.org/@babel/runtime/download/@babel/runtime-7.5.5.tgz#74fba56d35efbeca444091c7850ccd494fd2f132"
  integrity sha1-dPulbTXvvspEQJHHhQzNSU/S8TI=
  dependencies:
    regenerator-runtime "^0.13.2"
```

becomes:

```txt
"@babel/runtime@^7.0.0", "@babel/runtime@^7.3.1", "@babel/runtime@^7.1.2", "@babel/runtime@^7.4.0", "@babel/runtime@^7.4.5":
  version "7.5.5"
  resolved "https://registry.npm.taobao.org/@babel/runtime/download/@babel/runtime-7.5.5.tgz#74fba56d35efbeca444091c7850ccd494fd2f132"
  integrity sha1-dPulbTXvvspEQJHHhQzNSU/S8TI=
  dependencies:
    regenerator-runtime "^0.13.2"
```

## install

`yarn global add optimize-yarn-lock`

## usage

run `optimize-yarn-lock`
