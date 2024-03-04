#! /usr/bin/env node

import chalk from 'chalk'
import chalkAnimation from 'chalk-animation'
import inquirer from 'inquirer'
import figlet from 'figlet'
import gradient from 'gradient-string'
import { home, sigscreen, resetdb } from './components/screens.js'


async function welcome() {
  console.clear()
  console.log('Welcome to SURI')
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

export const username = await welcome()
await home(username.username)



process.on('SIGINT', async () => {
  console.log("exiting...")
  process.exit(0)
})
