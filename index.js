#! /usr/bin/env node

// On first launch of app, enter node index.js in command line to start new DB/SC
// Whenever launching app after first launch, append your display name to the command line input:
// example: node index.js Rekkla

import { createHelia } from 'helia'
import { createOrbitDB, Identities, useIdentityProvider, Documents, KeyStore, OrbitDBAccessController, KeyValue } from '@orbitdb/core'
import OrbitDBIdentityProviderDID from '@orbitdb/identity-provider-did'
import KeyDiDResolver from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { createLibp2p } from 'libp2p'
import { LevelBlockstore } from 'blockstore-level'
import { home } from './components/screens.js'
import { libp2pOptions } from './components/libp2p.js'
import inquirer from 'inquirer'

let db 
let orbitdb
let ipfs 
let identity
let id
let keystore
let identities

/*
The following if else blocks are for the initial launch of the app.
The if block will set up an orbitdb database and identity for the user, as well as the first sigchain link for the eldest key.
Every subsequent launch of the app requires the user to append there display name so that a new eldest key sigchain link is not 
created and submitted to the database.
*/
if (process.argv.length > 2) {
  const address = process.argv.pop()

  keystore = await KeyStore()
  const seed = new Uint8Array(32)
  const blockstore = new LevelBlockstore('./ipfs/blocks')

  const libp2p = await createLibp2p(libp2pOptions)
  
  ipfs = await createHelia({ libp2p, blockstore })
  OrbitDBIdentityProviderDID.setDIDResolver(KeyDiDResolver.getResolver())
  useIdentityProvider(OrbitDBIdentityProviderDID)

  const didProvider = new Ed25519Provider(seed)

  identities = await Identities({ ipfs, keystore })
  identity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider })})
  id = identity.id  

  orbitdb = await createOrbitDB({ ipfs, identities, identity, directory: './orbitdb/didorbit'})

  db = await orbitdb.open(address, { Database: Documents({ indexBy: 'id'})}, { AccessController: OrbitDBAccessController({ write: [identity.id]})})

  let context = await db.get('did:orbit:'+ db.address.toString())
  context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
  context = JSON.parse(context)

  await home(identity.id, context,  await db.address.toString())

} else {

  console.clear()
  console.log('Welcome to DID Orbit CLI')
  let knownAs = await inquirer.prompt([
      {
          type: 'input',
          name: 'knownAs',
          message: 'Please provide a Social Media Profile Link',
    }
  ])
  knownAs = knownAs.knownAs

  let serviceID = await inquirer.prompt([
    {
        type: 'input',
        name: 'serviceID',
        message: 'Please provide Service ID',
    }
  ])
  serviceID = serviceID.serviceID

  let serviceType = await inquirer.prompt([
    {
      type: 'input',
      name: 'serviceType',
      message: 'Please provide Service Type',
  }
  ])
  serviceType = serviceType.serviceType

  let serviceEndpoint = await inquirer.prompt([
    {
      type: 'input',
      name: 'serviceEndpoint',
      message: 'Please provide Service Endpoint',
  }
  ])
  serviceEndpoint = serviceEndpoint.serviceEndpoint

  keystore = await KeyStore()
  const seed = new Uint8Array(32)
  const blockstore = new LevelBlockstore('./ipfs/blocks')

  const libp2p = await createLibp2p(libp2pOptions)
  
  ipfs = await createHelia({ libp2p, blockstore })
  OrbitDBIdentityProviderDID.setDIDResolver(KeyDiDResolver.getResolver())
  useIdentityProvider(OrbitDBIdentityProviderDID)

  const didProvider = new Ed25519Provider(seed)

  identities = await Identities({ ipfs, keystore })
  identity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider })})
  id = identity.id

  orbitdb = await createOrbitDB({ ipfs, identities, identity, directory: './orbitdb/didorbit' })
  db = await orbitdb.open('papa', { Database: Documents({ indexBy: 'id'})}, { AccessController: OrbitDBAccessController({ write: [identity.id]})})

  let jsonDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/multikey/v1',
      'https://w3id.org/security/suites/ecdsa-2019/v1'
    ],
    'id': 'did:orbit:'+ db.address.toString(),
    'alsoKnownAs': [knownAs],
    'verificationMethod': [
      {
        'id': '#atproto',
        'type': 'Multikey',
        'controller': 'did:orbit:'+ db.address.toString(),
        'publicKeyMultibase': id
      }
    ],
    'service': [
      {
        'id': serviceID,
        'type': serviceType,
        'serviceEndpoint': serviceEndpoint
      }
    ]
  };

  await db.put(jsonDocument)

  let context = await db.get('did:orbit:'+ db.address.toString())
  context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
  context = JSON.parse(context)

  await home(identity.id, context, await db.address.toString())
}

// This block is for handling the SIGINT signal, which is sent to the process when the user presses ctrl+c, ending the process.

process.on('SIGINT', async () => {
  console.log('exiting...')
  await db.close()
  await orbitdb.stop()
  await ipfs.stop()
  process.exit(0)
})

export { db, orbitdb, ipfs, identity, id, keystore, identities}