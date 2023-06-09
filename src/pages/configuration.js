// Node imports
import chalk from 'chalk';
import inquirer from 'inquirer';

// Local imports
import globals from '../variables/globals.js';
import config from '../config/config.js';
import funcs from '../functions/general.js';
import ui from '../functions/ui.js';

/**
 * Shows the configuration page and returns the selected config item.
 * @returns {string}
 */
async function view() {
  console.clear();
  ui.printHeader();
  console.log(`    ${chalk.bgRedBright(' Current Configuration Settings:                                                              ')}

    ${chalk.redBright('CONF_TIMBERBORN_PATH')}\t ${globals.config.CONF_TIMBERBORN_DIR}
    ${chalk.redBright('CONF_TIMBERBORN_MAP_PATH')}\t ${globals.config.CONF_TIMBERBORN_MAP_DIR}
    ${chalk.redBright('CONF_SLICED_PREFIX')}\t\t ${globals.config.CONF_SLICED_PREFIX}
    ${chalk.redBright('CONF_UNSLICED_PREFIX')}\t ${globals.config.CONF_UNSLICED_PREFIX}
  `);

  let configSelected = await inquirer.prompt({
    name: 'selected',
    type: 'list',
    message: chalk.magentaBright('Please select the configuration parameter you wish to change\n'),
    choices: [...Object.keys(globals.config), new inquirer.Separator(), ...["Back to Main Menu"]]
  });

  if (configSelected.selected == "Back to Main Menu") {
    return;
  }
  // WIP:
  let configDefault = globals.config[configSelected.selected];
  await edit(configSelected.selected, configDefault);
  return;
}

async function edit(configKey, configValue) {
  let newConfig = await inquirer.prompt({
    name: 'answer',
    type: 'input',
    message: `Please enter the new value to use for the selected config setting\n`,
    default: configValue
  });
  if (newConfig.answer != configValue) {
    let newConfigValue = newConfig.answer;
    config.write(configKey, newConfigValue, true);
  }
}

export default { view }