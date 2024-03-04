const { choice } = await inquirer.prompt([
    {
        type: 'list',
        name: 'choice',
        message: 'Select an option',
        choices: ['Home', 'Sigchain', 'Reset']
    }
])
if (choice === 'Home') {
    home()
} else if (choice === 'Sigchain') {
    sigscreen()
} else if (choice === 'Reset') {
    resetdb()
}