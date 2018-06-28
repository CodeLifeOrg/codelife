![](https://github.com/datawheel/codelife/raw/master/static/logo/logo-dark.png)

[![Build Status](https://travis-ci.org/Datawheel/codelife.svg?branch=master)](https://travis-ci.org/Datawheel/codelife)

A React application based on `datawheel-canon` that provides a framework for teaching high school students how to code.

## Quick Dev Spin Up

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

4. Run dev version of site
```
npm run dev
```

5. Visit the Page
```
http://localhost:3300/
```

## Additional Env Vars

All environment variables prepended with `CANON_` are documented in the `datawheel-canon` repo [here](https://github.com/Datawheel/datawheel-canon).

Codelife has two additional admin-specific env vars, `FLAG_COUNT_HIDE` and `FLAG_COUNT_BAN`, which set the number of user reports on a piece of content required to hide the content (remove from listings/profiles) and ban it automatically, respectively.  

## Additional Setup Steps

### Remote Rendering 

Codelife contains a CodeEditor that students may use to make websites in the browser. The code that students write is executed on another domain (codelife.tech) to bolster security. The student code is passed to a landing page on codelife.tech via [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) and injected into an iframe on that page. 

The landing pages are named such that the origin of the `postMessage` can be automatically routed to an appropriately named page (e.g. en.codelife.com -> en-codelife-com.html).  

### XVFB

