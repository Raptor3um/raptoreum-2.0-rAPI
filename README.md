# Raptoreum 2.0 REST API

## Requirements
- [Node.JS](https://nodejs.org) >= 8.2.1
- NPM + NPX (Should already be installed alongside Node.JS)

## Installation/Setup
1. Open a terminal and clone this repository: `git clone https://github.com/Raptor3um/raptoreum-2.0-rAPI.git`
1. Change your working directory to that repository: `cd raptoreum-2.0-rAPI`
1. Install all dependencies using NPM: `npm i`
1. Compile the TypeScript code: `npx tsc` (of asked, allow the installation of `tsc`)
1. Create a file named `.env` in the current directory
    - See format below for file contents:
    ```
    API_PORT=<LISTENING_PORT>
    # you can also use an API address!
    PRIMARY_CONNECTION_URL=http://example.com:9998
    PRIMARY_CREDENTIALS=<PRIMARY_USERNAME>:<PRIMARY_PASSWORD>
    BACKUP_CONNECTION_URL=http://backup.example.com:9998
    BACKUP_CREDENTIALS=<BACKUP_USERNAME>:<BACKUP_PASSWORD>
    ```
1. Start the server: `node index.js`

## [API Documentation](API_DOCS.md)