import { createOrbitDB, Identities, useIdentityProvider, KeyStore } from '@orbitdb/core'
import OrbitDBIdentityProviderDID from '@orbitdb/identity-provider-did'
import KeyDiDResolver from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import {db, keystore, orbitdb, ipfs, id} from '../index.js'
import { home, welcome, sleep } from './screens.js'
import inquirer from 'inquirer'

// counts the number of entries in the database so that the sequence number can be incremented
export const count = async () => {
    const values = []
    let i = 0
    for await (const e of db.iterator()) {
      values.unshift(e)
      i++
    }
    return i
  }


export async function socialProof(){
    console.clear()
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to add a new Social Proof?',
            choices: ['yes', 'no']
        }
    ])

    if (choice.choice === 'yes'){
        let url = await inquirer.prompt([
            {
              type: 'input',
              name: 'url',
              message: 'Please provide the URL for your Social Media Profile:',
          }
        ])
        url = url.url
        
        let context = await db.get('did:orbit:'+ db.address.toString())
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        context.alsoKnownAs.push(url)
        await db.del('did:orbit:'+ db.address.toString())
        await db.put(context)
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(id, context, await db.address.toString())
    }
    else {
        let context = await db.get('did:orbit:'+ db.address.toString())
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        console.log('Social Proof Not Added')
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
}

export async function addKeys(){
    console.clear()
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to add new keys?',
            choices: ['yes', 'no']
        }
    ])

    if (choice.choice === 'yes'){
        let keyID = await inquirer.prompt([
            {
              type: 'input',
              name: 'keyID',
              message: 'Please provide an ID for the new key:',
          }
        ])
        // figure out auto incrementing key labels
        // dont ask for key title
        // ask for either verification method or rotation
        keyID = keyID.keyID

        let keyType = await inquirer.prompt([
            {
                type: 'input',
                name: 'keyType',
                message: 'Please provide a type for the new key:',
            }
        ])

        keyType = keyType.keyType

        const newVM = {}
        newVM.id = keyID
        newVM.type = keyType

        const identities = await Identities({ ipfs, keystore })
        const array = Array.from({length: 32}, () => Math.floor(Math.random() * 256))
        const seed29 = new Uint8Array(array)
        const didProvider = new Ed25519Provider(seed29)
        const newIdentity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider })}) 
        newVM.controller = 'did:orbit:'+ db.address.toString()
        newVM.publicKeyMultibase = newIdentity.id
        let context = await db.get('did:orbit:'+ db.address.toString())
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        context.verificationMethod.push(newVM)
        await db.del('did:orbit:'+ db.address.toString())
        await db.put(context)
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(id, context, await db.address.toString())
    }
    else {
        console.log('Keys Not Added')
        let context = await db.get('did:orbit:'+ db.address.toString())
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(id, context, await db.address.toString())
    }
}  

export async function serviceUpdate(){
    console.clear()
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to update your services?',
            choices: ['yes', 'no']
        }
    ])

    if (choice.choice === 'yes'){
        const newService = {}
        let serviceID = await inquirer.prompt([
            {
              type: 'input',
              name: 'serviceID',
              message: 'Please provide the service ID:',
          }
        ])
        serviceID = serviceID.serviceID

        let serviceType = await inquirer.prompt([
            {
              type: 'input',
              name: 'serviceType',
              message: 'Please provide the service type:',
          }
        ])
        serviceType = serviceType.serviceType

        let serviceEndpoint = await inquirer.prompt([
            {
                type: 'input',
                name: 'serviceEndpoint',
                message: 'Please provide the service endpoint:',
            }
        ])
        serviceEndpoint = serviceEndpoint.serviceEndpoint

        newService.id = serviceID
        newService.type = serviceType
        newService.serviceEndpoint = serviceEndpoint
        
        let context = await db.get('did:orbit:'+ db.address.toString())
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        context.service.push(newService)
        await db.del('did:orbit:'+ db.address.toString())
        await db.put(context)
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(id, context, await db.address.toString())
    }
    else {
        let context = await db.get('did:orbit:'+ db.address.toString())
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        console.log('Social Proof Not Added')
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(id, context, await db.address.toString())
    }
}