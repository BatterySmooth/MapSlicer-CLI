// Node imports
import chalk from 'chalk';
import inquirer from 'inquirer';

// Local imports
import globals from '../variables/globals.js';
import config from '../config/config.js';
import funcs from '../functions/general.js';

/**
 * Shows the configuration page and returns the selected config item.
 * @returns {string}
 */
async function view() {
  console.log(`    ${chalk.bgBlackBright(' Current Configuration Settings:                                                            ')}`);
  console.log(globals.config);
  let configSelected = await inquirer.prompt({
    name: 'selected',
    type: 'list',
    message: chalk.magentaBright('Please select the configuration parameter you wish to change\n'),
    choices: [...Object.keys(globals.config), new inquirer.Separator(), ...["Back to Main Menu"]]
  });
  return configSelected.selected;
}

async function edit() {
  console.log(`
  ${chalk.bgMagentaBright(' Edit Configuration                                                                           ')}
  `)
}

export default { view }