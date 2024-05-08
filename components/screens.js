import chalk from 'chalk'
import inquirer from 'inquirer'
import { db, orbitdb, ipfs } from '../index.js'
import { socialProof, serviceUpdate, addKeys, delKeys, delService, delSocialProof } from './sigchain.js'

// Sleep timer for brief pauses for user to read console output
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Welcome screen for the user to input their display name
async function welcome() {
    console.clear()
    console.log(chalk.redBright('Welcome to DID Orbit CLI'))
    let knownAs = await inquirer.prompt([
        {
            type: 'input',
            name: 'knownAs',
            message: 'Please provide your Social Media Profile Link',
      }
    ])

    knownAs = knownAs.knownAs

}

// Home screen for the user to interact with their did Document
async function home(didDoc, address) {
    console.clear()
    console.log('DID Orbit CLI Home Screen')
    console.log('Your DID Orbit ID: ' + 'did:orbit:', address)
    console.log('Your DID Orbit Document:')
    console.log(didDoc)
    console.log('Below are options to interact with your Sigchain')
    const cheece = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: ['Add', 'Delete']
        }
    ])
    if (cheece.choice === 'Add') {
        const choice = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: ['Add Social Profile', 'Add Verification Method', 'Add Web Services']
            }
        ])
        if (choice.choice === 'Add Social Profile') {
            await socialProof()
        }
        else if (choice.choice === 'Add Verification Method') {
            await addKeys()
        }
        else if (choice.choice === 'Add Web Services') {
            await serviceUpdate()
        } 
    }
    else if (cheece.choice === 'Delete') {
        const choice = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: ['Delete Social', 'Delete Verification Method', 'Delete Web Service']
            }
        ])
        if (choice.choice === 'Delete Social') {
            await delSocialProof()
        }
        else if (choice.choice === 'Delete Verification Method') {
            await delKeys()
        }
        else if (choice.choice === 'Delete Web Service') {
            await delService()
        } 
    }
}

process.on('SIGINT', async () => {
    console.log('exiting...')
    await db.close()
    await orbitdb.stop()
    await ipfs.stop()
    process.exit(0)
  })

export { home, welcome, sleep }