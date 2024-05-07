import chalk from 'chalk'
import chalkAnimation from 'chalk-animation'
import inquirer from 'inquirer'
import figlet from 'figlet'
import gradient from 'gradient-string'
import { db, orbitdb, ipfs, identity, id } from '../index.js'
import { socialProof, serviceUpdate, addKeys } from './sigchain.js'

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

// Home screen for the user to interact with their Sigchain
async function home(username, sigchain, address) {
    console.clear()
    console.log('DID Orbit CLI Home Screen')
    console.log('Retain this ID ' + username)
    console.log('Your OrbitDB Address: ' + address)
    console.log('Your Sigchain:')
    console.log(sigchain)
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
                choices: ['Add Social Proof', 'Add Verification Method', 'Add Web Services']
            }
        ])
        if (choice.choice === 'Add Social Proof') {
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
        await del()
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