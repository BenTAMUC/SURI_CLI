import {db, identity, id, keystore} from '../index.js'
import { home, welcome, sleep } from './screens.js'
import inquirer from 'inquirer'

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
    const url = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Please provide the URL for your social identity:',
      }
    ])

    const socName = await inquirer.prompt([
        {
          type: 'input',
          name: 'socName',
          message: 'Please provide the name of the social media identity:',
      }
    ])

    const sequenceNumber = await count()
    const hash = await db.get(sequenceNumber)

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

        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
    else {
        console.log('Social Proof Not Added')
        await sleep(3000)
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

    const sequenceNumber = await count()
    const hash = await db.get(sequenceNumber)

    const newKeyPair = await keystore.createKey(identity.id)

    console.log(newKeyPair.publicKey)
    console.log(identity.publicKey)

    if (choice.choice === 'yes'){
        console.log('New Keys Added!')
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
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
    else {
        console.log('Keys Not Added')
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
}  

export async function revoke(){
    console.clear()
    const num = await inquirer.prompt([
        {
          type: 'input',
          name: 'num',
          message: 'Please provide sequence number value for the link you would like revoked:',
      }
    ])

    num.num = parseInt(num.num)

    const hash1 = await db.get(num.num)
    console.log(hash1.hash)

    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Are you sure you would like to revoke this link?',
            choices: ['yes', 'no']
        }
    ])

    const sequenceNumber = await count()
    const hash2 = await db.get(sequenceNumber)

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
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
    else {
        console.log('Link Not Revoked')
        await sleep(3000)
        console.clear()
        await home(id, (await db.all()).map(e => e.value), await db.address.toString())
    }
}