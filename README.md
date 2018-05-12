# Sandra/ backend-api

[![Build Status](https://img.shields.io/travis/SANDRAProject/backend-api.svg?style=flat-square)](https://travis-ci.org/SANDRAProject/backend-api)
[![Coveralls](https://img.shields.io/coveralls/SANDRAProject/backend-api.svg?style=flat-square)](https://coveralls.io/github/SANDRAProject/backend-api)
[![license](https://img.shields.io/badge/license-AGPL%20v3-green.svg?style=flat-square)](https://github.com/SANDRAProject/backend-api/blob/master/LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-v2.8.3-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

API provider for [Sandra](https://github.com/SANDRAProject).

## Config

The server is configured via environmental variables:

| name                 | description | default                             |
| -------------------- | ----------- | ----------------------------------- |
| PASSWORD_HASH_ROUNDS |             | 12                                  |
| DB_URL               |             | pg://postgres@127.0.0.1:5432/sandra |
| PORT                 |             | 3000                                |
| TOKEN_EXPIRES        |             | 7d                                  |
| LOG_LEVEL            |             | info                                |
| CONFIRMATION_EXPIRES |             | 2h                                  |
| DEPLOY_TOKEN         |             | 1b26f5e2fd217297a50e5a31aeedc48a    |

## Start

The server requires node `^10.1.0`.

```sh
$ yarn start
```

With docker: See [backend](https://github.com/SANDRAProject/backend).

## License

Sandra/backend-api.ts
Copyright (C) 2018 Sandra Project

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.