![](https://github.com/datawheel/codelife/raw/master/static/logo/logo-dark.png)

[![Build Status](https://travis-ci.org/Datawheel/codelife.svg?branch=master)](https://travis-ci.org/Datawheel/codelife)

A React application based on `datawheel-canon` that provides a framework for teaching high school students how to code.

## Dev Spin Up

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
```

4. Run dev version of site
```
npm run dev
```

5. Bask in glory (visit localhost:3300 in your browser)
```
http://localhost:3300/
```
