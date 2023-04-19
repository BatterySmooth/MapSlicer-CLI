#!/usr/bin/env node

// Width: 102
// Height: 32

// Imports
import { homedir } from 'os'
import * as fs from 'fs';
import fsPromises from 'fs/promises';
import * as path from 'path';

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import { createSpinner } from 'nanospinner';
import AdmZip from 'adm-zip';
import * as shortcuts from 'windows-shortcuts';

// Local imports
import globals from './src/variables/globals.js';
import config from './src/config/config.js';
import funcs from './src/functions/general.js';
import ui from './src/functions/ui.js';
import splash from './src/pages/splash.js';
import slice from './src/pages/slice.js';
import unslice from './src/pages/unslice.js';
import configuration from './src/pages/configuration.js';
import test from './src/pages/test.js';

// Generate file ID
/*
Used to generate the prefix for the file ID when slicing
*/
function generateFileID() {
  let date = new Date().toISOString();
  date = date.replaceAll("T", " ").replaceAll(":", "-").replace(/\.[^/.]+$/, "");
  return date;
}

// View config
/*
Used to view the config details and then ask if the user to change the config
*/



// ============= COMMANDS ========================================================================
// Main operation input
/*
  Function to get the command input from a list. This is then used to decide which function to show
  Uses sliceOperation global variable
*/
async function commandAskOperation() {
  const answer = await inquirer.prompt({
    name: 'sliceOperation',
    type: 'list',
    message: 'Please select a command using the arrow keys and enter\n',
    choices: [
      'Slice',
      'Un-Slice',
      'Help',
      'Configuration',
      'Test',
      'Quit'
    ]
  });
  return answer.sliceOperation;
}

let unsliceSelectedMap;
let unsliceEntityStore;
let unsliceEntityStorePath;
let unsliceWorldJSON;
let unsliceNewWorldJSON;

// Select map
/*
Select the map to unslice
*/
async function unsliceSelectMap() {
  const spinner = createSpinner('Grabbing map files...').start();
  let timberbornMaps = [];
  fs.readdir(timberbornMapPath, (err, files) => {
    files.forEach(file => {
    if (file.endsWith(".timber")) {
      timberbornMaps.push(file);
    }
    });
  });
  await funcs.sleep(500);
  spinner.success({ text: `Maps found` });

  const answer = await inquirer.prompt({
    name: 'mapSelected',
    type: 'list',
    message: 'Please select which map to unslice.',
    choices: timberbornMaps
  });
  unsliceSelectedMap = answer.mapSelected;
}
// Validate companion entity store file
/*
Attempts to find the corresponding entity store and throws an error if it doesn't find it
*/
async function unsliceValidateStore() {
  const spinner = createSpinner(`Searchiung for store file...`).start();
  try {
    unsliceEntityStorePath = `./entityStore/${unsliceSelectedMap.replace(/\.[^/.]+$/, ".json")}`
    if(fs.existsSync(unsliceEntityStorePath)) {
      spinner.success({ text: `Entity store file found` });
      return true;
    } else {
      spinner.error({ text: `Failed to find entity store file` });
    return false;
    }
  } catch (e) {
    spinner.error({ text: `Failed to validate entity store file\n${e}` });
    return false;
  }
}
// Perform the unslice
/*
Performs the unslice on
*/
async function unsliceExtractWorld() {
  const spinnerWorldExtract = createSpinner('Extracting world data...').start();
  try {
    const mapPath = timberbornMapPath + unsliceSelectedMap;
    // Get data from zip archive
    const zip = new AdmZip(mapPath);
    const zipEntries = zip.getEntries();
    zipEntries.forEach(function (zipEntry) {
      if (zipEntry.entryName == "world.json") {
        unsliceWorldJSON = JSON.parse(zipEntry.getData().toString("utf8"));
      }
    });
    if (!unsliceWorldJSON) {
      spinnerWorldExtract.error({ text: `World data extraction failed\nWorld JSON file is empty` });
      await funcs.sleep(100);
      return false;
    }
    spinnerWorldExtract.success({ text: `World data extracted` });
    await funcs.sleep(100);
    return true;
  } catch (e) {
    spinnerWorldExtract.error({ text: `World data extraction failed\n${e}` });
    await funcs.sleep(100);
    return false;
  }
}
// Extract entity store
/*
*/
async function unsliceStoreExtract() {
  // Parse Entity Store
  const spinner = createSpinner('Extracting entity store data...').start();
  try {
    const entityStore = fs.readFileSync(unsliceEntityStorePath, {encoding: 'utf8'}, (err, data) => {
      if (err) {
        spinner.error({ text: `Entity store data file reading failed\n${e}` });
        return false;
      }
      return data;
    });
    unsliceEntityStore = JSON.parse(entityStore);
    spinner.success({ text: `Entity store data extracted` });
    return true;
  } catch (e) {
    spinner.error({ text: `Entity store data extraction failed\n${e}` });
    return false;
  }
}
// Perform unslice
/*
*/
async function unslicePerformUnslice() {
  const spinner = createSpinner('Un-slicing...').start();
  try {
    const newEntityJSON = [...unsliceWorldJSON.Entities, ...unsliceEntityStore];
    newEntityJSON.sort(entityCompare);
    unsliceNewWorldJSON = JSON.parse(JSON.stringify(unsliceWorldJSON));
    unsliceNewWorldJSON.Entities = newEntityJSON;    
    spinner.success({ text: `Un-sliced` });
    return true;
  } catch (e) {
    spinner.error({ text: `Un-slice failed\n${e}` });
    return false;
  }

}
// Save new world
/*
*/
async function unsliceSaveWorld() {
  const spinner = createSpinner(`Saving new world file...`).start();
  const unsliceFileID = generateFileID();
  try {
    const zip = new AdmZip();
    // Add world.json file
    zip.addFile("world.json", Buffer.from(JSON.stringify(unsliceNewWorldJSON), "utf-8"));
    // Write .timber file
    let newFileName = unsliceSelectedMap.replace(/^U_/,"").replace(/^(\d\d\d\d-\d\d-\d\d \d\d-\d\d-\d\d )/,"");
    zip.writeZip(`${timberbornMapPath}/U_${unsliceFileID} ${newFileName}`);

    spinner.success({ text: `New world file saved` });
    return true;
  } catch (e) {
    spinner.error({ text: `Failed to save new world file\n${e}` });
    return false;
  }
}
// Notify Un-slice complete
/*
Advise the user that the un-slice is complete!
*/
async function unsliceCompleted() {
  const rainbowTitle = chalkAnimation.rainbow("Un-slicing complete!");
  await funcs.sleep(1000);
  rainbowTitle.stop();
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

    ${chalk.redBright('CONF_TIMBERBORN_PATH:')}\t The path of your Timberborn user files
    ${chalk.redBright('CONF_TIMBERBORN_MAP_PATH:')}\t The path of your Timberborn map folder
  `);
}


// ============= NAVIGATION ======================================================================

async function mainMenu() {
  // Default menu headers
  ui.printHeader();
  const op = await commandAskOperation();
  // Command input handler
  switch(op) {
    case "Slice":
      await slice.view();
      break;

    case "Un-Slice":
      // Select map to unslice
      await unsliceSelectMap();
      const storeFound = await unsliceValidateStore();
      // Check that store has been found
      if (!storeFound) {
        await ui.backToMenu();
        break;
      }
      // Perform the unslice
      const extractOK = await unsliceExtractWorld();
      if (!extractOK) {
        await ui.backToMenu();
        break;
      }
      // Extract entity store
      const UstoreOK = await unsliceStoreExtract();
      if (!UstoreOK) {
        await ui.backToMenu();
        break;
      }
      // Perform the unslice
      const unsliceOK = await unslicePerformUnslice();
      if (!unsliceOK) {
        await ui.backToMenu();
        break;
      }
      // Save the new world file
      const unsliceSaved = await unsliceSaveWorld();
      if (!unsliceSaved) {
        await ui.backToMenu();
        break;
      }
      // Un-slice complete!
      await unsliceCompleted();
      await ui.enterToContinue();
      break;

    case "Help":
      await helpMenu();
      break;
    
    case "Configuration":
      let opConfig = await configuration.view();
      if (opConfig == "Back to Main Menu") {
        break
      }
      console.log(`Selected: ${opConfig}. Editing is not yet implemented`);
      await ui.backToMenu();
      break;

    case "Test":
      await test.display();
      await ui.backToMenu();
      break;
    
    case "Quit":
      console.clear();
      process.exit(0);
  }
  mainMenu();
}

async function helpMenu() {
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
  await helpMenu();
}

// ============= WORKFLOW ========================================================================
// Application
console.clear();
await splash.start();
await mainMenu();