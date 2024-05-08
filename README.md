# DID Orbit CLI

DID Orbit CLI is an application that allows a user to create and manage a did:orbit identity through an orbitdb database

DID Orbit CLI takes advantage of [Orbitdb](https://orbitdb.org/), a decentralized, serverless, peer-to-peer database. OrbitDB is built on top of of [IPFS](https://ipfs.tech/), which is a decentralized network which allows for the distribution and storing of data.

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

## Ensuring data integrity and non-repudiation
In order to ensure that the data recieved from OrbitDB is not tampered with and traceable back to the DB owner the OrbitDB OpLog can be used. The OpLog stores the metadata of any operation in the database including the signature of added blocks, previous hash pointers, and the key being used to create the block. Using the information in the OpLog we can validate any block contained in the database for its integrity and trace its creation back to the database owner through the usage of the owners key in the blocks creation. (Example Code Coming Soon)
