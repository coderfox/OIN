# Sandra/ backend-api

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
| DEPLOY_TOKEN         |             | 1b26f5e2fd217297a50e5a31aeedc48a    |
| SENTRY_DSN           |             |                                     |

## Start

With npm: `npm start`

With yarn: `yarn start`

With docker: See [backend](https://github.com/SANDRAProject/backend).

## License

Sandra/backend-api REST API provider for Sandra
Copyright (C) 2017 Sandra Project Team

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.