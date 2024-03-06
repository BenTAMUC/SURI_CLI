#! /usr/bin/env node

// On first launch of app, enter node index.js in command line to start new DB/SC
// Whenever launching app after first launch, append your username to the command line input:
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

if (process.argv.length > 2) {
  const id = process.argv.pop()

  const seed = new Uint8Array(32)
  const blockstore = new LevelBlockstore(`./ipfs/${id}`)

  const libp2p = await createLibp2p(libp2pOptions)
  
  const ipfs = await createHelia({ libp2p, blockstore })
  OrbitDBIdentityProviderDID.setDIDResolver(KeyDiDResolver.getResolver())
  useIdentityProvider(OrbitDBIdentityProviderDID)

  const didProvider = new Ed25519Provider(seed)

  const identities = await Identities({ ipfs })
  const identity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider })})

  const orbitdb = await createOrbitDB({ ipfs, identities, identity, directory: `./orbitdb/${id}` })

  const db = await orbitdb.open('sigchain', { Database: Documents({ indexBy: 'seqno'})})

  await home(id, await db.all(),  await db.address.toString())

} else {
  const id = await welcome()

  const seed = new Uint8Array(32)
  const blockstore = new LevelBlockstore(`./ipfs/${id.username}`)

  const libp2p = await createLibp2p(libp2pOptions)
  
  const ipfs = await createHelia({ libp2p, blockstore })
  OrbitDBIdentityProviderDID.setDIDResolver(KeyDiDResolver.getResolver())
  useIdentityProvider(OrbitDBIdentityProviderDID)

  const didProvider = new Ed25519Provider(seed)

  const identities = await Identities({ ipfs })
  const identity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider })})

  const orbitdb = await createOrbitDB({ ipfs, identities, identity, directory: `./orbitdb/${id.username}` })
  const db = await orbitdb.open('sigchain', { Database: Documents({ indexBy: 'seqno'})})

  await db.put({  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://www.w3.org/ns/credentials/examples/v2"
  ],
  "id": identity.id,
  "type": ["VerifiableCredential", "EldestKeyCredential"],
  "issuer": "https://university.example/issuers/14",
  "validFrom": "2010-01-01T19:23:24Z",
  "seqno": 1,
  "keyid": identity.publicKey,
})

  await home(id.username, await db.all(), await db.address.toString())
}


process.on('SIGINT', async () => {
  console.log('exiting...')
  await db.close()
  await orbitdb.stop()
  await ipfs.stop()
  process.exit(0)
})