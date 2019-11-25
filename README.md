# sessionhero-api

An Express server app with CRUD endpoints that retrieves data from a PostgreSQL datasource.

Works with [https://github.com/asktami/sessionhero-app](https://github.com/asktami/sessionhero-app).

- a schedule is linked to both a _user_ record and a _session_ record

- a comment is linked to both a _user_ record and a _session_ record

- SQL migration scripts to create the sessionhero database with tables for sessions, schedule, comments, and users including relationships and CASCADES

- service objects for all tables

- routers to perform CRUD operations

- an Express server for the API with various endpoints

## Setup

1. Clone this repo
2. In Terminal, change to the directory on your computer that contains this repo
3. Install dependencies: `npm install`

4. Create the database user (as a superuser): `createuser -s sessionhero`

5. Create the `sessionhero` PostgreSQL databases:

   - `createdb -U sessionhero sessionhero`
   - `createdb -U sessionhero sessionhero-test`

6. Environment:

   - Prepare environment file: `cp example.env .env`
   - Replace values in `.env` with your custom values.

7. Create development and test database tables:

   - `npm run migrate`
   - `npm run migrate:test`

8. To delete the tables in the databases:
   - `npm run migrate -- 0`
   - `npm migrate:test -- 0`

### Configure Postgres

For tests involving time to run properly, your Postgres database must be configured to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   - OS X, Homebrew: `/usr/local/var/postgres/postgresql.conf`
2. Uncomment the `timezone` line and set it to `UTC` as follows:

```
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Sample Data

- To seed the development database:

```
psql -U sessionhero -d sessionhero -f ./seeds/seed.sessionhero_tables.sql
```

- To seed the test database:

```
psql -U sessionhero -d sessionhero-test -f ./seeds/seed.sessionhero_tables.sql
```

- To clear seed data:

```
psql -U sessionhero -d sessionhero -a -f seeds/trunc.sessionhero_tables.sql
psql -U sessionhero -d sessionhero-test -a -f seeds/trunc.sessionhero_tables.sql
```

## Endpoints

| Endpoint              | HTTP Method | CRUD Method | Result                                     |
| --------------------- | ----------- | ----------- | ------------------------------------------ |
| sessions              | GET         | READ        | get all sessions                           |
| sessions/:id          | GET         | READ        | get single session                         |
| sessions/:id/comments | GET         | READ        | get all comments for a session             |
| sessions/:id/comments | POST        | CREATE      | add new comment for a session              |
| comments/:id          | GET         | READ        | get single comment                         |
| comments/:id          | PATCH       | UPDATE      | update single comment                      |
| comments/:id          | DELETE      | DELETE      | delete single comment                      |
| schedule/users/:id    | GET         | READ        | get all scehdule records for a single user |
| schedule              | POST        | CREATE      | add new session to schedule                |
| schedule/:id          | DELETE      | DELETE      | delete session from schedule               |
| users                 | POST        | CREATE      | add new user                               |

## Scripts

- Start application for development: `npm run dev`
- Run tests: `npm test`

---

## Boilerplate Info

This project was bootstrapped with [Express Boilerplate with Routes, Winston and UUID](https://github.com/asktami/express-boilerplate-routes).

See [https://github.com/asktami/bookmarks-server](https://github.com/asktami/bookmarks-server) for info on how I created my Express APIs.
