// Node imports
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalk from 'chalk';
// Local imports
import pjson from '../../package.json' assert { type: "json" };

// Constants
const version = pjson.version;

// Print header
/**
 * synchronous function to print the header to the console.
 * This was previously async, though should not have been, leading to the use
 * of a sleep function to keep the output in the correct order.
 */
function printHeader() {
  console.clear();
  const headerText =
`   ███╗   ███╗ █████╗ ██████╗ ███████╗██╗     ██╗ ██████╗███████╗██████╗         ██████╗██╗     ██╗
   ████╗ ████║██╔══██╗██╔══██╗██╔════╝██║     ██║██╔════╝██╔════╝██╔══██╗       ██╔════╝██║     ██║
   ██╔████╔██║███████║██████╔╝███████╗██║     ██║██║     █████╗  ██████╔╝ ████╗ ██║     ██║     ██║
   ██║╚██╔╝██║██╔══██║██╔═══╝ ╚════██║██║     ██║██║     ██╔══╝  ██╔══██╗ ╚═══╝ ██║     ██║     ██║
   ██║ ╚═╝ ██║██║  ██║██║     ███████║███████╗██║╚██████╗███████╗██║  ██║       ╚██████╗███████╗██║
   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝     ╚══════╝╚══════╝╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝        ╚═════╝╚══════╝╚═╝`;
  console.log(gradient.pastel.multiline(headerText));
  console.log(`Version: ${chalk.magentaBright(version)}\n`);
}
// Enter to continue
/*
*/
async function enterToContinue() {
  const answer = await inquirer.prompt({
    name: 'continueAction',
    type: 'list',
    message: 'Press enter to continue',
    choices: [
      'Continue'
    ]
  });
}
// Continue or Cancel
/*
*/
async function continueOrCancel(detail) {
  const answer = await inquirer.prompt({
    name: 'answer',
    type: 'list',
    message: `${detail} Do you wish to continue?`,
    choices: [
      'Cancel',
      'Continue'
    ]
  });
  return answer
}
// Back to main menu
/*
*/
async function backToMenu() {
  const answer = await inquirer.prompt({
    name: 'backAction',
    type: 'list',
    message: 'Press enter to go back to the main menu',
    choices: [
      'Back'
    ]
  });
}
// Back to help menu
/*
*/
async function backToHelp() {
  const answer = await inquirer.prompt({
    name: 'backAction',
    type: 'list',
    message: 'Press enter to go back to the help menu',
    choices: [
      'Back'
    ]
  });
}

export default { printHeader, enterToContinue, continueOrCancel, backToMenu, backToHelp }