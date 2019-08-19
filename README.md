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

### Database Initialization 

Codelife runs on a Postgres Database, already set up and running at codelife.com, so additional setup/configuration steps should not be required. Connecting to the database for development is accomplished by setting `canon` environment variables (below). This should be all you need to get started.

Should it be necessary to recreate the database from scratch, its configuration is represented via the Sequelize models contained in the [db](/db) folder. A [schema dump](https://storage.googleapis.com/codelife/db-schema/codelife_schema.sql) is also made available.

### Local Development Setup

1. Clone the repo
```bash
git clone https://github.com/Datawheel/codelife.git
```

2. Install dependencies
```bash
cd codelife
npm i
```

3. Set environment variables ([more info](#explanation-of-env-vars))
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

5. Run dev version of site
```
npm run dev
```

6. Visit the Page
```
http://localhost:3300/
```

### Deployment

The production build of codelife.com always points to the `master` branch. To deploy the latest version on the production server:

1) `git pull origin master` in the `codelife` directory to pull the latest updates from the repo
2) `npm run build` to create the build
3) `sudo systemctl restart codelife` to restart the codelife service

## Additional Technical Information

### About the choice of `canon` as a Framework

The `canon` project is an open-source framework developed and maintained in-house at Datawheel. It was created to assist in the rapid scaffolding of React websites. Its design is intended to handle commonly repeated configuration steps (such as ES6 Babel Transpiling) and to standardize reusable features (such as user management, social logins, and API requests).

The `canon` framework was chosen for Codelife due to its ease of setup, simple feature set, and its familiarity and expertise among the development team. As feature requests and site-specific improvements were added to Codelife during its development, this could be accomplished quickly and easily.  

Datawheel has launched almost ten sites into Production using `canon`, and its continued development, maintenance, and improvement remain a top priority for the team. As longtime supporters of open-source software (including maintaining the popular [d3plus](http://d3plus.org/) library), Datawheel remains open to collaboration and improvement of the `canon` library over time.

### More information about `canon`

A great deal of Codelife's functionality and structure, including its user management, API configuration, page routing, and social media integration are all handled through Datawheel framework known as `canon`. It is highly recommended that you familiarize yourself with the `canon` documentation, as it provides reasoning behind much of the file structure of codelife. These sections of the README are of particular importance:

* [User Management](https://github.com/datawheel/canon#user-management) Explains how users are added and authenticated, as well as the concept of "roles".
* [Custom API Routes](https://github.com/datawheel/canon#custom-api-routes) Explains the purpose of the `/api` folder, and how canon automatically scans for routes.
* [Custom Database Models](https://github.com/datawheel/canon#custom-database-models) Explains the purpose of the `/db` folder, and how canon automatically builds and associates models.

### Explanation of Env Vars

All environment variables prepended with `CANON_` are documented in the `canon` repo [here](https://github.com/Datawheel/canon).

Codelife has two additional admin-specific env vars, `FLAG_COUNT_HIDE` and `FLAG_COUNT_BAN`, which set the number of user reports on a piece of content required to hide the content (remove from listings/profiles) and ban it automatically, respectively.  

### Remote Rendering 

Codelife contains a CodeEditor that students may use to make websites in the browser. The code that students write is executed on another domain (codelife.tech) to improve security. The student code is passed to a landing page on codelife.tech via [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) and injected into an iframe on that page. A deeper documentation of how this process works is included in the [CodeEditor](/app/components/CodeEditor/CodeEditor.jsx) file itself. 

The landing pages themselves (source-controlled here in `/sandbox`, but hosted on codelife.tech) are named such that the origin of the `postMessage` can be automatically routed to an appropriately named page (e.g. en.codelife.com makes requests to codelife.tech/en-codelife-com.html). This is to ensure that ONLY codelife.com and its whitelisted language subdomains can send code to be executed.  

The landing page makes use of [loop-protect](https://github.com/jsbin/loop-protect) to prevent students from crashing their page session with infinite loops.

### XVFB

Codelife makes use of the `electron-screenshot-service` module, which requires that `xvfb` along with a few helper packages be installed system wide on the ubuntu server.

```
sudo apt-get install -y xorg libgtk2.0-0 libgconf-2-4 libasound2 libxtst6 libxss1 libnss3 xvfb
```

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

## Contributing

Thanks for being interested on making this package better. We encourage everyone to help improving this project with some new features, bug fixes and performance issues. Please take a little bit of your time to read our guides, so this process can be faster and easier.

### Contribution Guidelines

Take a moment to read about our [Contribution Guidelines](https://github.com/CodeLifeOrg/codelife/blob/master/CONTRIBUTING.md) so you can understand how to submit an issue, commit and create pull requests.

### Code of Conduct

We expect you to follow our [Code of Conduct](https://github.com/CodeLifeOrg/codelife/blob/master/CODE_OF_CONDUCT.md). You can read it to understand what kind of behaviour will and will not be tolerated.


## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details
