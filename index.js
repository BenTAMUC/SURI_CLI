#! /usr/bin/env node

// On first launch of app, enter node index.js in command line to start new DB/SC
// Whenever launching app after first launch, append your display name to the command line input:
// example: node index.js Rekkla

import { createHelia } from 'helia'
import { createOrbitDB, Identities, useIdentityProvider, Documents, KeyStore } from '@orbitdb/core'
import OrbitDBIdentityProviderDID from '@orbitdb/identity-provider-did'
import KeyDiDResolver from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { createLibp2p } from 'libp2p'
import { LevelBlockstore } from 'blockstore-level'
import { home, welcome, sleep } from './components/screens.js'
import { libp2pOptions } from './components/libp2p.js'

let db 
let orbitdb
let ipfs 
let identity
let id
let keystore

/*
The following if else blocks are for the initial launch of the app.
The if block will set up an orbitdb database and identity for the user, as well as the first sigchain link for the eldest key.
Every subsequent launch of the app requires the user to append there display name so that a new eldest key sigchain link is not 
created and submitted to the database.
*/
if (process.argv.length > 2) {
  id = process.argv.pop()

  keystore = await KeyStore()

  const seed = new Uint8Array(32)
  const blockstore = new LevelBlockstore(`./ipfs/${id}`)

  const libp2p = await createLibp2p(libp2pOptions)
  
  ipfs = await createHelia({ libp2p, blockstore })
  OrbitDBIdentityProviderDID.setDIDResolver(KeyDiDResolver.getResolver())
  useIdentityProvider(OrbitDBIdentityProviderDID)

  const didProvider = new Ed25519Provider(seed)

  const identities = await Identities({ ipfs, keystore })
  identity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider })})

  orbitdb = await createOrbitDB({ ipfs, identities, identity, directory: `./orbitdb/${id}` })

  db = await orbitdb.open('test1', { Database: Documents({ indexBy: 'seqno'})})

  await home(id, (await db.all()).map(e => e.value),  await db.address.toString())

} else {
  id = await welcome()

  keystore = await KeyStore()

  const seed = new Uint8Array(32)
  const blockstore = new LevelBlockstore(`./ipfs/${id.display_name}`)

  const libp2p = await createLibp2p(libp2pOptions)
  
  ipfs = await createHelia({ libp2p, blockstore })
  OrbitDBIdentityProviderDID.setDIDResolver(KeyDiDResolver.getResolver())
  useIdentityProvider(OrbitDBIdentityProviderDID)

  const didProvider = new Ed25519Provider(seed)

  const identities = await Identities({ ipfs, keystore })
  identity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider })})

  orbitdb = await createOrbitDB({ ipfs, identities, identity, directory: `./orbitdb/${id.display_name}` })
  db = await orbitdb.open('test1', { Database: Documents({ indexBy: 'seqno'})})

  await db.put({ 
        "key": {
            "eldest_kid": identity.id,
            "kid": identity.id,
            "uid": await db.address.toString(),
            "display_name": id.display_name
        },
        "type": "eldest",
        "validFrom": new Date().toISOString(),
        "seqno": 1,
        "prev": "null"
})

  await home(id.username, (await db.all()).map(e => e.value), await db.address.toString())
}

// This block is for handling the SIGINT signal, which is sent to the process when the user presses ctrl+c, ending the process.

process.on('SIGINT', async () => {
  console.log('exiting...')
  await db.close()
  await orbitdb.stop()
  await ipfs.stop()
  process.exit(0)
})

export { db, orbitdb, ipfs, identity, id, keystore}