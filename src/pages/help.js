// Node imports
import chalk from 'chalk';
import inquirer from 'inquirer';

// Local imports
import ui from '../functions/ui.js';

async function view() {
  // Default menu headers
  ui.printHeader();
  // Menu page selection handler
  const helpPage = await helpShowPage1();
  // break out if the help page is the main menu
  if(helpPage === "Back to Main Menu") { return 0 }
  switch (helpPage) {
    case "Slice Command":
      ui.printHeader();
      await helpSlice();
      await ui.backToHelp();
      break;

    case "Un-slice Command":
      ui.printHeader();
      await helpUnslice();
      await ui.backToHelp();
      break;

    case "Help Command":
      ui.printHeader();
      await helpHelp();
      await ui.backToHelp();
      break;

    case "Configuration Command":
      ui.printHeader();
      await helpConfig();
      await ui.backToHelp();
      break;
  }
  // Calls the help page again - this probably shouldn't be an await, but the initial call is
  // resolved if called sync, so needs to be await, even though it leaves a promise stack
  await view();
}

// ============= HELP ============================================================================
// Show help page 1
/*
  Shows the first page of Help.
*/
async function helpShowPage1() {
  console.log(`
    ${chalk.bgGreen(' About                                                                                        ')}
    This tool is used to slice the top off a map (entities only, not terrain) and output a new
    world file for you to edit and operate on, and then un-slice the edited level to restore the
    map to its former glory.

    Created for ${chalk.green('@SnippyHippie92')} (Thanks for the chalenge, this was a lot of fun!)
    Author: ${chalk.green('@battery_smooth')}

  `);
  const helpPage = await inquirer.prompt({
    name: 'helpPageSelected',
    type: 'list',
    message: 'To see more, please select a command from the list below',
    choices: [
      'Slice Command',
      'Un-slice Command',
      'Help Command',
      'Configuration Command',
      new inquirer.Separator(),
      'Back to Main Menu'
    ]
  });
  return helpPage.helpPageSelected;
}
// Show slice help page
/*
*/
async function helpSlice() {
  console.log(`
    ${chalk.bgBlueBright(' Slice Command                                                                                ')}
    ${chalk.blueBright('Purpose:')}
    The slice command will take a copy of your world save and slice all entities off the top
    relative to the height input after running the command.

    ${chalk.blueBright('Use:')}
    After running the command, you will be asked to provide a height to slice the map from.
    Please note, any entities which are located ${chalk.red('at or above')} the height specified
    will be removed.
  `);
}
// Show un-slice help page
/*
*/
async function helpUnslice() {
  console.log(`
    ${chalk.bgMagentaBright(' Un-slice Command                                                                             ')}
    ${chalk.magentaBright('Purpose:')}
    The un-slice command will stitch back together a map and its removed entities.
    It will then run validation while it makes the required checks to the save file.

    ${chalk.magentaBright('Use:')}
    After selecting the command, it will ask you to select which slice to re-import.
  `);
}
// Show help help page
/*
*/
async function helpHelp() {
  console.log(`
    ${chalk.bgRedBright(' Help Command                                                                                 ')}
    That's... how you got here...

    ...But it's good to double-check, I guess...
  `);
}
// Show config help page
/*
*/
async function helpConfig() {
  console.log(`
    ${chalk.bgRedBright(' Config Command                                                                               ')}
    Used to view and change the configuration for application variables.

    ${chalk.redBright('╭────────────────────────────────────────────────────────────────────────────────────────────╮')}
    ${chalk.redBright('│')} Configuration Parameter                                                                    ${chalk.redBright('│')}
    ${chalk.redBright('├────────────────────────────────────────────────────────────────────────────────────────────┤')}
    ${chalk.redBright('│ CONF_TIMBERBORN_DIR')}\t The path of your Timberborn user files                          ${chalk.redBright('│')}
    ${chalk.redBright('│ CONF_TIMBERBORN_MAP_DIR')}\t The path of your Timberborn map folder                          ${chalk.redBright('│')}
    ${chalk.redBright('│ CONF_SLICED_PREFIX')}\t The prefix used for sliced map files                            ${chalk.redBright('│')}
    ${chalk.redBright('│ CONF_UNSLICED_PREFIX')}\t The prefix used for un-sliced map files                         ${chalk.redBright('│')}
    ${chalk.redBright('╰────────────────────────────────────────────────────────────────────────────────────────────╯')}
  `);
}

export default { view }