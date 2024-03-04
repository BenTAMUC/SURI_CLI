import chalk from 'chalk'
import chalkAnimation from 'chalk-animation'
import inquirer from 'inquirer'
import figlet from 'figlet'
import gradient from 'gradient-string'
import { username } from '../index.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function home(username) {
    console.clear()
    console.log(username + 's SURI CLI Home Screen')
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Select an option',
            choices: ['Sigchain', 'Reset']
        }
    ])
    if (choice.choice === 'Sigchain') {
        await sigscreen()
    } else if (choice.choice === 'Reset') {
        await resetdb()
    }
}

async function sigscreen() {
    console.clear()
    console.log('Sigchain Screen')
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Sigchain Functions',
            choices: ['Social Proof', 'New Keys', 'Revoke', 'View SC', 'Home']
        }
    ])
    if (choice.choice === 'Home') {
        await home(username.username)
    }
    else if (choice.choice === 'Social Proof') {
        const msg = 'Social Proof Added!'
        figlet(msg, (err, data) => {
          console.log(gradient.summer.multiline(data))
        })
        await sleep(3000)
        console.clear()
        await sigscreen()
    }
    else if (choice.choice === 'New Keys') {
        const msg = 'New Keys Added!'
        figlet(msg, (err, data) => {
          console.log(gradient.summer.multiline(data))
        })
        await sleep(3000)
        console.clear()
        await sigscreen()
    }
    else if (choice.choice === 'Revoke') {
        const msg = 'Sigchain Link Revoked!'
        figlet(msg, (err, data) => {
          console.log(gradient.summer.multiline(data))
        })
        await sleep(3000)
        console.clear()
        await sigscreen()
    }
    else if (choice.choice === 'View SC') {
        const msg = 'Imagine a SigChain!'
        figlet(msg, (err, data) => {
          console.log(gradient.summer.multiline(data))
        })
        await sleep(3000)
        console.clear()
        await sigscreen()
    } 
}

async function resetdb() {
    console.clear()
    const conf = await inquirer.prompt([
        {
          type: 'input',
          name: 'confirmation',
          message: 'Are you sure you want to reset your database? (yes/no)',
      }
    ])
    if (conf.confirmation === 'yes') {
        const msg = 'Database Reset!'
        figlet(msg, (err, data) => {
          console.log(gradient.summer.multiline(data))
        })
        await sleep(3000)
        console.clear()
        await home(username.username)
    } else {
        await home(username.username)
    }
}

export { home, sigscreen, resetdb }