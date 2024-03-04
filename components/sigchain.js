const { program } = require('commander')

program
    .command('Home')
    .description('Home page')
    .action(home)

program
    .command('sigchain')
    .description('Display Sigchain and its functions')
    .action(sigscreen)

program
    .command('reset')
    .description('Reset the database')
    .action(resetdb)
