import {db, identity, id, keystore} from '../index.js'
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

    // Prompt the user for the URL, this will be used to identify the social media provider the user is trying to prove they own
    // Currently a work in progress as we are only supporting Github currently for testing
    const url = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Please provide the URL for your social identity:',
      }
    ])

    // Prompt the user for the username of the social media identity
    const socName = await inquirer.prompt([
        {
          type: 'input',
          name: 'socName',
          message: 'Please provide the name of the social media identity:',
      }
    ])

    const sequenceNumber = await count() // Get the current sequence number
    const hash = await db.get(sequenceNumber) // Get the hash of the previous entry in the database

    console.log('Please paste the following to a new Github Gist post:')

    console.log(`### Suri Proof
    I claim:
    - I am ${socName.socName} on github
    - This is my SURI database: ${await db.address.toString()}
    - This is my SURI identity: ${identity.id}
    - This is my public key: ${identity.publicKey}
    
    To make this claim I have signed the following object:

    { 
        "key": {
            "eldest_kid": "${identity.id}",
            "kid": "${identity.id}",
            "uid": "${await db.address.toString()}",
            "display_name": "${id || id.display_name}"
        },
        "service": {
            "name": "Github",
            "username": "${socName.socName}"
        },
        "type": "web_service_binding",
        "validFrom": "${new Date().toISOString()}",
        "seqno": "${sequenceNumber + 1}",
        "prev": "${hash.hash}",  
    }`)

    // User verification of the posting the above to a Github Gist
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Have you posted the above to a Github Gist?',
            choices: ['yes', 'no']
        }
    ])

    if (choice.choice === 'yes'){
        console.log('Social Proof Added!')

        // Adds the sigchain link to database
        await db.put({
            "key": {
                "eldest_kid": identity.id,
                "kid": identity.id,
                "uid": await db.address.toString(),
                "display_name": id
            },
            "service": {
                "name": "Github",
                "username": socName.socName
            },
            "type": "web_service_binding",
            "validFrom": new Date().toISOString(),
            "seqno": sequenceNumber + 1,
            "prev": hash.hash,  
        })

        // Return to home screen
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
    else {
        console.log('Social Proof Not Added')
        // Return to home screen
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }


}

export async function addKeys(){
    console.clear()
    console.log(identity)
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to add new keys?',
            choices: ['yes', 'no']
        }
    ])

    const sequenceNumber = await count() // Get the current sequence number
    const hash = await db.get(sequenceNumber) // Get the hash of the previous entry in the database

    const newKeyPair = await keystore.createKey(identity.id) // Create a new keypair

    if (choice.choice === 'yes'){
        console.log('New Keys Added!')
        // Adds the sigchain link to database
        await db.put({
            "key": {
                "eldest_kid": identity.id,
                "kid": identity.id,
                "uid": await db.address.toString(),
                "display_name": id
            },
            "sibkey": {
                "kid": identity.id,
            },
            "type": "sibkey",
            "validFrom": new Date().toISOString(),
            "seqno": sequenceNumber + 1,
            "prev": hash.hash,  
        })
        // Return to home screen
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
    else {
        console.log('Keys Not Added')
        // Return to home screen
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
}  

export async function revoke(){
    console.clear()
    // Prompt the user for the sequence number of the link they would like to revoke
    // The only ways to get a specific database entry is by the sequence number or hash of the entry
    const num = await inquirer.prompt([
        {
          type: 'input',
          name: 'num',
          message: 'Please provide sequence number value for the link you would like revoked:',
      }
    ])

    num.num = parseInt(num.num) // Convert the input to an integer

    const hash1 = await db.get(num.num) // Get the hash of the link to be revoked

    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to revoke this link?',
            choices: ['yes', 'no']
        }
    ])

    const sequenceNumber = await count() // Get the current sequence number
    const hash2 = await db.get(sequenceNumber) // Get the hash of the previous entry in the database

    // Revokation link submitted to database
    if (choice.choice === 'yes'){
        console.log('Link Revoked!')
        await db.put({
            "key": {
                "eldest_kid": identity.id,
                "kid": identity.id,
                "uid": await db.address.toString(),
                "display_name": id
            },
            "revoke": {
                "sig_id": hash1.hash,
            },
            "type": "revoke",
            "validFrom": new Date().toISOString(),
            "seqno": sequenceNumber + 1,
            "prev": hash2.hash,  
    })
        // Return to home screen
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
    else {
        console.log('Link Not Revoked')
        // Return to home screen
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
}