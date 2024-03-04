#! /usr/bin/env node

import chalk from 'chalk'
import chalkAnimation from 'chalk-animation'
import inquirer from 'inquirer'
import figlet from 'figlet'
import gradient from 'gradient-string'
import { home } from './components/screens.js'


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

export const username = await welcome()
await home(username.username)



process.on('SIGINT', async () => {
  console.clear()
  process.exit(0)
})
