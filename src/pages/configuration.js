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
  console.log(`    ${chalk.bgRedBright(' Current Configuration Settings:                                                              ')}

    ${chalk.redBright('╭────────────────────────────────────────────────────────────────────────────────────────────╮')}
    ${chalk.redBright('│ CONF_TIMBERBORN_PATH')}\t ${globals.CONF_TIMBERBORN_PATH}                          ${chalk.redBright('│')}
    ${chalk.redBright('│ CONF_TIMBERBORN_MAP_PATH')}\t ${globals.CONF_TIMBERBORN_MAP_PATH}                          ${chalk.redBright('│')}
    ${chalk.redBright('│ CONF_SLICED_PREFIX')}\t The prefix used for sliced map files                            ${chalk.redBright('│')}
    ${chalk.redBright('│ CONF_UNSLICED_PREFIX')}\t The prefix used for un-sliced map files                         ${chalk.redBright('│')}
    ${chalk.redBright('╰────────────────────────────────────────────────────────────────────────────────────────────╯')}
  `);

  // console.log(globals.config);

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