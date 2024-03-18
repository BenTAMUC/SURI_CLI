# SURI_CLI

SURI CLI is an application that allows users to generate there own sigchain so they may prove there identity on the web in a decentralized manor.

SURI CLI takes advantage of Orbitdb, a decentralized, serverless, peer-to-peer database.
https://orbitdb.org/

## Dependancies

Users will need an install of nodejs of version 20 or newer.

## Usage

To use SURI CLI, users need only clone the repo, from there users will enter 'node index.js' into the command line to run the program

This will do the following:
- Display Welcome screen
- Prompt user to input a display name

After display name is provided:
- DID:KEY identity is created for database
- Initial eldest key sigchain link is generated and inputed into the database

After this first launch of SURI CLI, users will launch the app by appending there display name onto the prior command line input
Example: 'node index.js displayname'

This will open the previously made database 

From there users will be able to make the following changes to there sigchain:
- Add social proof
- Add keys
- Revoke

Simply follow the prompts when completing these functions
