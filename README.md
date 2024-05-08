# DID Orbit CLI

DID Orbit CLI is an application that allows a user to create and manage a did:orbit identity through an orbitdb database

DID Orbit CLI takes advantage of Orbitdb, a decentralized, serverless, peer-to-peer database.
https://orbitdb.org/

## Dependancies

Users will need an install of nodejs of version 20 or newer.

## Usage

To use DID Orbit CLI, users need only:
1. clone this repo
2. 'npm install' in command line
3. 'node index.js' in command line to run program

This will do the following:
- Display Welcome screen
- Prompt user to input data to start there new did document

After the information is provided:
- DID:KEY identity is created for database
- Initial eldest key is placed into the did doc as the first verification method

From there users will be able to make the following changes to there did doc:
- add
- delete

Add will provide the following options:
- Add Social Profile
- Add Verification Method
- Add Web Services

Delete will provide the following options
- Delete Social Profile
- Delete Verification Method
- Delete Web Services

Simply follow the prompts when completing these functions
