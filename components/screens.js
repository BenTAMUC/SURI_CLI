import chalk from 'chalk'
import chalkAnimation from 'chalk-animation'
import inquirer from 'inquirer'
import figlet from 'figlet'
import gradient from 'gradient-string'
//import { username } from '../index.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function welcome() {
    console.clear()
    console.log(chalk.redBright('Welcome to SURI CLI'))
    console.log(chalk.green('Please provide a username for your Identity:'))
    const username = await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: 'What is your Username?',
      }
    ])
    return username
}

async function home(username, sigchain, address) {
    console.clear()
    console.log(username + 's SURI CLI Home Screen')
    console.log('Your OrbitDB Address: ' + address)
    console.log('Your Sigchain:')
    console.log(sigchain)
    console.log('Below are options to interact with your Sigchain')
    const choice = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: ['Add Social Identity', 'Add Keys', 'Revoke', 'Reset']
        }
    ])
    if (choice.choice === 'Add Social Identity') {
        const msg = 'Social Proof Added!'
        figlet(msg, (err, data) => {
          console.log(gradient.summer.multiline(data))
        })
        await sleep(3000)
        console.clear()
        await home()
    }
    else if (choice.choice === 'Add Keys') {
        const msg = 'New Keys Added!'
        figlet(msg, (err, data) => {
          console.log(gradient.summer.multiline(data))
        })
        await sleep(3000)
        console.clear()
        await home()
    }
    else if (choice.choice === 'Revoke') {
        const msg = 'Sigchain Link Revoked!'
        figlet(msg, (err, data) => {
          console.log(gradient.summer.multiline(data))
        })
        await sleep(3000)
        console.clear()
        await home()
    } 
    else if (choice.choice === 'Reset') {
        await resetdb()
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
        await home()
    } else {
        await home()
    }
}

export { home, resetdb, welcome, sleep }