![](https://github.com/datawheel/codelife/raw/master/static/logo/logo-dark.png)

[![Build Status](https://travis-ci.org/Datawheel/codelife.svg?branch=master)](https://travis-ci.org/Datawheel/codelife) [![Dependency Status](https://david-dm.org/datawheel/codelife.svg)](https://david-dm.org/datawheel/codelife)

A React application based on `canon` that provides a framework for teaching high school students how to code.

## Getting Started

### Required Software
* PostgreSQL (database)
* Node (serverside runtime env)
* NPM (node package manager, comes with most node installations)
* xvfb (for screenshots)

## Installation

### Step 1 - Database Initialization 

Codelife runs on a Postgres Database, already set up and running at codelife.com. Connecting to the database for development is accomplished by setting `canon` environment variables (below). This should be all you need to do to connect to the database.

Should it be necessary to recreate the database from scratch, its configuration is represented via the Sequelize models contained in the [db](/db) folder. A schema dump is also made available here.

### Step 2 - Local Development Setup

1. Clone the repo
```bash
git clone https://github.com/Datawheel/codelife.git
```

2. Install dependencies
```bash
cd codelife
npm i
```

3. Set environment variables
```
export CANON_LANGUAGES=en,pt
export CANON_LANGUAGE_DEFAULT=pt
export CANON_LOGINS=true
export CANON_DB_USER=dbUser
export CANON_DB_NAME=codelife
export CANON_DB_PW=MyPassWerd
export CANON_DB_HOST=1.2.3.4
export CANON_LOGREDUX=false
export CANON_LOGLOCALE=false
export CANON_API=http://localhost:3300
export FLAG_COUNT_HIDE=3
export FLAG_COUNT_BAN=5
```

4. Edit local hosts (`/etc/hosts` on a mac) file to add the following language subdomains
```
127.0.0.1 en.localhost
127.0.0.1 pt.localhost
```

4. Run dev version of site
```
npm run dev
```

5. Visit the Page
```
http://localhost:3300/
```

## Additional Technical Information

### Explanation of Env Vars

All environment variables prepended with `CANON_` are documented in the `canon` repo [here](https://github.com/Datawheel/canon).

Codelife has two additional admin-specific env vars, `FLAG_COUNT_HIDE` and `FLAG_COUNT_BAN`, which set the number of user reports on a piece of content required to hide the content (remove from listings/profiles) and ban it automatically, respectively.  

### Remote Rendering 

Codelife contains a CodeEditor that students may use to make websites in the browser. The code that students write is executed on another domain (codelife.tech) to improve security. The student code is passed to a landing page on codelife.tech via [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) and injected into an iframe on that page. 

The landing pages (contained in `/sandbox`, but hosted on codelife.tech) are named such that the origin of the `postMessage` can be automatically routed to an appropriately named page (e.g. en.codelife.com -> en-codelife-com.html). This is to ensure that ONLY codelife.com and its language subdomains can send code to be executed.  

The landing page makes use of [loop-protect](https://github.com/jsbin/loop-protect) to prevent students from crashing their page session with infinite loops.

### XVFB

Codelife makes use of the `electron-screenshot-service` module, which requires that `xvfb` be installed on the ubuntu server. 

### Search Trigrams

Codelife search makes use of trigrams.  More information is available here:

https://www.postgresql.org/docs/9.1/static/pgtrgm.html

This enables search operations with the SQL command `LIKE` to be more performant.

First, enable the trigram extension:

```
CREATE EXTENSION pg_trgm;
```

Then, create an index on the column.  Here are the two columns that Codelife currently searches:

```
CREATE INDEX users_on_username_idx ON users USING GIN(username gin_trgm_ops);
```

```
CREATE INDEX projects_on_name_idx ON projects USING GIN(name gin_trgm_ops);
```

## Authors

* **Datawheel** - [datawheel.us](https://www.datawheel.us/)
* **FAPEMIG** - [fapemig.br](http://www.fapemig.br/)
* **Governo de Minas Gerais** - [mg.gov.br](http://mg.gov.br/)

See also the list of [contributors](https://github.com/datawheel/codelife/graphs/contributors) who participated in this project.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details
