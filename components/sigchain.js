import { Identities } from '@orbitdb/core'
import OrbitDBIdentityProviderDID from '@orbitdb/identity-provider-did'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import {db, keystore, ipfs} from '../index.js'
import { home, sleep } from './screens.js'
import inquirer from 'inquirer'

export async function socialProof(){
    // takes a social medial link and pushes it to the alsoKnownAs array
    console.clear()
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to add a new Social?',
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
        let string = db.address.toString()
        string = string.substring(9, string.length) // get the address of the db and cut off the /orbitdb/ part
        let context = await db.get('did:orbit:'+ string)
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        context.alsoKnownAs.push(url) // add new social proof to alsoKnownAs array
        await db.del('did:orbit:'+ string)
        await db.put(context)
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
    else {
        let string = db.address.toString()
        string = string.substring(9, string.length) // get the address of the db and cut off the /orbitdb/ part
        let context = await db.get('did:orbit:'+ string)
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        console.log('Social Proof Not Added')
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
}

export async function addKeys(){
    // takes a key id, type, controller and pubkeymultibase and pushes it to the verificationMethod array 
    console.clear()
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to add a new key?',
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
        // create new verification method object
        const newVM = {}
        // add keyid and type to object
        newVM.id = keyID
        newVM.type = keyType

        let string = db.address.toString()
        string = string.substring(9, string.length)
        // generate new key pair by creating a new orbit identity, keys are placed in the keystore
        const identities = await Identities({ ipfs, keystore })
        const array = Array.from({length: 32}, () => Math.floor(Math.random() * 256))
        const seed29 = new Uint8Array(array)
        const didProvider = new Ed25519Provider(seed29)
        const newIdentity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider })}) 
        // add controller and public key multibase to new verification method object
        newVM.controller = 'did:orbit:'+ string
        newVM.publicKeyMultibase = newIdentity.id
        let context = await db.get('did:orbit:'+ string)
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        context.verificationMethod.push(newVM) // push new object to did doc
        await db.del('did:orbit:'+ string)
        await db.put(context) // replace old did doc with new one
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
    else {
        let string = db.address.toString()
        string = string.substring(9, string.length) // get the address of the db and cut off the /orbitdb/ part
        console.log('Keys Not Added')
        let context = await db.get('did:orbit:'+ string)
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
}  

export async function serviceUpdate(){
    console.clear()
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to add a new service?',
            choices: ['yes', 'no']
        }
    ])

    if (choice.choice === 'yes'){
        // create new service object
        // ask for service id, type and endpoint to be added to the new service object
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
        
        // add service id, type and endpoint to new service object
        newService.id = serviceID
        newService.type = serviceType
        newService.serviceEndpoint = serviceEndpoint
        let string = db.address.toString()
        string = string.substring(9, string.length) // get the address of the db and cut off the /orbitdb/ part
        
        let context = await db.get('did:orbit:'+ string) // get did doc from db
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        context.service.push(newService)
        await db.del('did:orbit:'+ string)
        await db.put(context) // replace old did doc with new one
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
    else {
        let string = db.address.toString() // get the address of the db and cut off the /orbitdb/ part
        string = string.substring(9, string.length)
        let context = await db.get('did:orbit:'+ string) // get did doc from db
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        console.log('Social Proof Not Added')
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
}

export async function delSocialProof(){
    console.clear()
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to delete a Social?',
            choices: ['yes', 'no']
        }
    ])

    if (choice.choice === 'yes'){
        let url = await inquirer.prompt([
            {
              type: 'input',
              name: 'url',
              message: 'Please provide the URL for your Social Media Profile to be deleted:',
          }
        ])
        url = url.url

        let string = db.address.toString()
        string = string.substring(9, string.length) // get the address of the db and cut off the /orbitdb/ part
        
        let context = await db.get('did:orbit:'+ string)
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        context.alsoKnownAs = context.alsoKnownAs.filter(e => e !== url)
        await db.del('did:orbit:'+ string)
        await db.put(context) // replace old did doc with new one
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
    else {
        let string = db.address.toString()
        string = string.substring(9, string.length) // get the address of the db and cut off the /orbitdb/ part
        let context = await db.get('did:orbit:'+ string)
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context) // parse did doc json from db and make sure it is in the correct order/format
        console.log('Social Proof Not Added')
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
}

export async function delKeys(){
    // takes a key id from user and removes it from the verificationMethod array
    console.clear()
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to delete a key?',
            choices: ['yes', 'no']
        }
    ])

    if (choice.choice === 'yes'){
        let keyID = await inquirer.prompt([
            {
              type: 'input',
              name: 'keyID',
              message: 'Please provide an ID for the key to be deleted:',
          }
        ])

        keyID = keyID.keyID

        let string = db.address.toString()
        string = string.substring(9, string.length) // get the address of the db and cut off the /orbitdb/ part

        let context = await db.get('did:orbit:'+ string) // get did doc from db
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        context.verificationMethod = context.verificationMethod.filter(e => e.id !== keyID) // remove key with given id
        await db.del('did:orbit:'+ string)
        await db.put(context)
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
    else {
        // Return to home screen
        let string = db.address.toString()
        string = string.substring(9, string.length)
        console.log('Keys Not Added')
        let context = await db.get('did:orbit:'+ string)
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
}  

export async function delService(){
    // takes serviceid from user input and removes it from the service array
    console.clear()
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to delete a service?',
            choices: ['yes', 'no']
        }
    ])

    if (choice.choice === 'yes'){
        let serviceID = await inquirer.prompt([
            {
              type: 'input',
              name: 'serviceID',
              message: 'Please provide the service ID to be deleted:',
          }
        ])
        serviceID = serviceID.serviceID

        let string = db.address.toString()
        string = string.substring(9, string.length) // get the address of the db and cut off the /orbitdb/ part
        
        let context = await db.get('did:orbit:'+ string)
        // parse did doc json from db and make sure it is in the correct order/format
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context)
        context.service = context.service.filter(e => e.id !== serviceID) //remove service with given id
        await db.del('did:orbit:'+ string)
        await db.put(context)
        // Return to home screen
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
    else {
        // Return to home screen
        let string = db.address.toString()
        string = string.substring(9, string.length) // get the address of the db and cut off the /orbitdb/ part
        let context = await db.get('did:orbit:'+ string)
        context = JSON.stringify(context.value, ['@context', 'id', 'alsoKnownAs', 'verificationMethod', 'type', 'controller', 'publicKeyMultibase', 'service', 'serviceEndpoint'])
        context = JSON.parse(context) // parse did doc json from db and make sure it is in the correct order/format
        console.log('Social Proof Not Added')
        await sleep(1000)
        console.clear()
        await home(context, string)
    }
}