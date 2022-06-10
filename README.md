# Raptoreum 2.0 REST API

## System Requirements
- [Node.js 12.22.0](https://nodejs.org/) or later
- MacOS, Windows (including WSL), or Linux OS
- Have [`yarn`]() installed
  - [version < 2.0](https://classic.yarnpkg.com/lang/en/docs/install)
  - [version >= 2.0](https://yarnpkg.com/getting-started/install)
  - For all intents and purposes, both will work. [See note](https://yarnpkg.com/getting-started/migration#why-should-you-migrate).

## Installation
1. Clone this repo: `git clone https://github.com/Raptor3um/raptoreum-2.0-rAPI.git`
1. `cd` into the repo directory
1. run `yarn` to install all dependencies
1. run `yarn dev` to run a local version of the API
1. The API should now be open on `http://localhost:3000`
1. Follow the usage guide on the index page

## Planning to Deploy?
1. run `yarn build` to create an optimized version of the API
1. run `yarn start` *after* building to run the optimized version of the API
1. As usual, the API should be open on `http://localhost:3000`

## Don't Want Port 3000?
1. Specify the `PORT` variable like so: `PORT=80 <COMMAND>`. For example:
```
PORT=80 yarn dev
```