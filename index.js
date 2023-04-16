#!/usr/bin/env node

// Width: 102
// Height: 32

// Imports
import { homedir } from 'os'
import * as fs from 'fs';
// import fsPromises from 'fs/promises'
import * as path from 'path';

// Node packages
import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import { createSpinner } from 'nanospinner';
import AdmZip from 'adm-zip';
import * as shortcuts from 'windows-shortcuts';

// Globals
const version = "1.2.13";
const userHomeDir = homedir();
let configJSON;
let timberbornPath;
let timberbornMapPath;

// ============= FUNCTIONS =======================================================================
// Sleep function
const sleep = (ms) => new Promise ((r) => setTimeout(r, ms));
// Print header
/*
  Function to show the welcome/home screen
*/
async function printHeader() {
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
// Generate file ID
/*
Used to generate the prefix for the file ID when slicing
*/
function generateFileID() {
  let date = new Date().toISOString();
  date = date.replaceAll("T", " ").replaceAll(":", "-").replace(/\.[^/.]+$/, "");
  return date;
}
// Entity sorting filter
/*
Function used when filtering entities by Z axis after un-slice
*/
function entityCompare(a, b) {
  if ( a.Components.BlockObject.Coordinates.Z < b.Components.BlockObject.Coordinates.Z ){
    return -1;
  }
  if ( a.Components.BlockObject.Coordinates.Z > b.Components.BlockObject.Coordinates.Z ){
    return 1;
  }
  return 0;
}
// Test function
async function test() {
  console.log(`
  Full Colours:
    ${chalk.bgBlack("bgBlack")} \t \t ${chalk.black("black")} \t \t ${chalk.bgBlackBright("bgBlackBright")} \t \t ${chalk.blackBright("blackBright")}
    ${chalk.bgBlue("bgBlue")} \t \t ${chalk.blue("blue")} \t \t ${chalk.bgBlueBright("bgBlueBright")} \t \t ${chalk.blueBright("blueBright")}
    ${chalk.bgCyan("bgCyan")} \t \t ${chalk.cyan("cyan")} \t \t ${chalk.bgCyanBright("bgCyanBright")} \t \t ${chalk.cyanBright("cyanBright")}
    ${chalk.bgGreen("bgGreen")} \t \t ${chalk.green("green")} \t \t ${chalk.bgGreenBright("bgGreenBright")} \t \t ${chalk.greenBright("greenBright")}
    ${chalk.bgMagenta("bgMagenta")} \t \t ${chalk.magenta("magenta")} \t ${chalk.bgMagentaBright("bgMagentaBright")} \t ${chalk.magentaBright("magentaBright")}
    ${chalk.bgRed("bgRed")} \t \t ${chalk.red("red")} \t \t ${chalk.bgRedBright("bgRedBright")} \t \t ${chalk.redBright("redBright")}
    ${chalk.bgWhite("bgWhite")} \t \t ${chalk.white("white")} \t \t ${chalk.bgWhiteBright("bgWhiteBright")} \t \t ${chalk.whiteBright("whiteBright")}
    ${chalk.bgYellow("bgYellow")} \t \t ${chalk.yellow("yellow")} \t ${chalk.bgYellowBright("bgYellowBright")} \t ${chalk.yellowBright("yellowBright")}
  Limited Colours:
    ${chalk.bgGray("bgGray")} \t \t ${chalk.gray("gray")}
    ${chalk.bgGrey("bgGrey")} \t \t ${chalk.grey("grey")}
  Gradient:
    ${gradient.pastel("██████████████████████████████████████████████████████████████████████████████████████████████")}
  `);
}

// ============= WELCOME & CONFIG ================================================================
// Splash screen
/*
Splash screen for the application. It will also validate the environment
*/
async function splashScreen() {
  const rainbowTitle = chalkAnimation.rainbow("Launching MapSlicer-CLI");
  await validateEnvironment();
  rainbowTitle.stop();
}
// Validation function
/*
Validates the environment and performs checks prior to starting
*/
async function validateEnvironment() {
  // Check config
  const spinnerConfig = createSpinner('Pulling Config...').start();
  try {
    if(!fs.existsSync('./config.json')) {
      spinnerConfig.stop();
      console.log(`${chalk.bgRed('Config Missing - Set-up Required')}`);
      await setupConfig();
      spinnerConfig.start();
    }
    const configData = fs.readFileSync("./config.json", {encoding: 'utf8'}, (err, data) => {
      if (err) {
        spinnerConfig.error({ text: `Configuration file reading failed\n${e}` });
        return false;
      }
      return data;
    });
    configJSON = JSON.parse(configData);
    timberbornPath = userHomeDir + configJSON.CONF_TIMBERBORN_DIR;
    timberbornMapPath = timberbornPath + configJSON.CONF_TIMBERBORN_MAP_DIR;
    spinnerConfig.success({ text: `Configuration data loaded` });

  } catch (e) {
    spinnerConfig.error({ text: `Config issue` });
    console.log(`${chalk.bgRed('ERROR:')}`);
    console.log(e);
    await enterToContinue();
    console.clear();
    process.exit(0);
  }
  // Check required paths are valid
  const spinnerValidate = createSpinner('Validating environemnt...').start();
  try {
    if(!fs.existsSync(timberbornPath)) { throw `The Timberborn folder is not accessible. The application will now close.` }
    if(!fs.existsSync('./entityStore')) { fs.mkdirSync('./entityStore'); }
    if(!fs.existsSync('./MapSlicer-CLI.lnk')) {  }
    if(!fs.existsSync('./Update MapSlicer-CLI.lnk')) {  }
    spinnerValidate.success({ text: `Environment validated` });
  } catch (err) {
    spinnerValidate.error({ text: `Validation failed` });
    console.log(`${chalk.bgRed('ERROR:')}`);
    console.log(err);
    await enterToContinue();
    console.clear();
    process.exit(0);
  }
  // Create Shortcuts
  if (!fs.existsSync('./MapSlicer-CLI.lnk')) {
    const launchShortcut = shortcuts.create(`MapSlicer-CLI.lnk`, {
      target: `C:\\Windows\\System32\\cmd.exe`,
      args: `/K npx mapslicer-cli`,
      workingDir: `${path.resolve("./")}`,
      icon: `${path.resolve(".\\node_modules\\mapslicer-cli\\src\\MapSlicer-CLI.ico")}`
    }, function (err) {
      if (err) { throw Error(err) }
    });
  }
  if (!fs.existsSync('./Update MapSlicer-CLI.lnk')) {
    const updateShortcut = shortcuts.create(`Update MapSlicer-CLI.lnk`, {
      target: `C:\\Windows\\System32\\cmd.exe`,
      args: `/C npm i mapslicer-cli`,
      workingDir: `${path.resolve("./")}`,
      icon: `${path.resolve(".\\node_modules\\mapslicer-cli\\src\\MapSlicer-CLI.ico")}`
    }, function (err) {
      if (err) { throw Error(err) }
    });
  }
}
// Configuration Setup
/*
Used to set up the config if the file is missing
*/
async function setupConfig() {
  // Take config inputs and format start and end slashes
  let answerDirectory = await inquirer.prompt({
    name: 'timberbornDirectory',
    type: 'input',
    message: `Please enter the path for the Timberborn save folder relative to your home directory\n(This is usually stored in your documents folder)\n`,
    default: '/Documents/Timberborn/'
  });
  let timberbornDirectory = answerDirectory.timberbornDirectory;

  let answerMapDirectory = await inquirer.prompt({
    name: 'timberbornMapDirectory',
    type: 'input',
    message: `Please enter the path for the Timberborn map folder relative to the Timberborn folder\n(This is almost always the default provided)\n`,
    default: 'Maps/'
  });
  let timberbornMapDirectory = answerMapDirectory.timberbornMapDirectory;

  let configOutput = {
    "CONF_TIMBERBORN_DIR": timberbornDirectory,
    "CONF_TIMBERBORN_MAP_DIR": timberbornMapDirectory
  }
  // Validate config paths
  let validatedConfig = validateConfig(JSON.stringify(configOutput));
  // Write config file
  try {
    fs.writeFile(`./config.json`, validatedConfig, 'utf8', (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (e) {
    console.log(e);
  }
  await sleep(100);
}
// Configuration validation
/*
Used to validate the paths for the config input. This will add the leading and trailing slashes
if needed.
Takes in an JSON strigigied object and returns a JSON strigified object.
*/
function validateConfig(inputConfig) {
  let configJSON = JSON.parse(inputConfig);
  // Add slashes to front and end, and replace all slashes with single forward slash
  configJSON.CONF_TIMBERBORN_DIR = configJSON.CONF_TIMBERBORN_DIR.replace(/(^|$)/g, "/").replace(/(\\|\/)+/g,"/")
  // Remove all slashes from 'Maps' input and add a slash at the end
  configJSON.CONF_TIMBERBORN_MAP_DIR = `${configJSON.CONF_TIMBERBORN_MAP_DIR.replace(/(\\|\/)+/g, "")}/`
  return JSON.stringify(configJSON);
}
// View config
/*
Used to view the config details and then ask if the user to change the config
*/
async function viewConfig() {
  console.log(`${chalk.bgBlackBright(' Current Configuration Settings:                                                              ')}`);
  console.log(configJSON);
  let configSelected = await inquirer.prompt({
    name: 'selected',
    type: 'list',
    message: chalk.magentaBright('Please select the configuration parameter you wish to change\n'),
    choices: [...Object.keys(configJSON), new inquirer.Separator(), ...["Back to Main Menu"]]
  });
  console.log(`Selected: ${configSelected}. Editing is not yet implemented`);
}


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
      'Config',
      'Test',
      'Quit'
    ]
  });
  return answer.sliceOperation;
}

// ============= SLICE ===========================================================================
// Variables
let sliceSelectedMap;
let sliceHeight;
let sliceWorldJSON;
let worldEntities;
let worldEntitiesToExtract;
let newWorldJSON;
let fileID;
let entityBlacklist = [
  "StartingLocation",
  "WaterSource",
  "Barrier",
  "HalfBarrier",
  "Pine",
  "Birch",
  "ChestnutTree",
  "Dandelion",
  "BlueberryBush",
  "UndergroundRuins"
];

// Slice select map
/*
Function to grab the world files and offer them up as options to select
*/
async function sliceSelectMap() {
  const spinner = createSpinner('Grabbing map files...').start();
  let timberbornMaps = [];
  fs.readdir(timberbornMapPath, (err, files) => {
    files.forEach(file => {
    if (file.endsWith(".timber")) {
      timberbornMaps.push(file);
    }
    });
  });
  await sleep(500);
  spinner.success({ text: `Maps found` });

  const answer = await inquirer.prompt({
    name: 'mapSelected',
    type: 'list',
    message: 'Please select which map to slice.',
    choices: timberbornMaps
  });
  sliceSelectedMap = answer.mapSelected;
}
// Slice height input
/*
  Function to get the required slice height. This is then used later to slice the map
  Uses sliceOperation global variable
*/
async function sliceAskHeight() {
  const answer = await inquirer.prompt({
    name: 'inputHeight',
    type: 'input',
    message: 'Please enter the cut-off height for the slice: ',
    default() {
      return '12';
    }
  });
  sliceHeight = answer.inputHeight;
}
// Slice extract world data from .timber file
/*
This is the function that  takesn in the parameters we've assigned and performs the slice
*/
async function sliceExtractWorldData() {
  const spinnerFileExtract = createSpinner('Extracting world data...').start();
  const mapPath = timberbornMapPath + sliceSelectedMap;
  // Get data from zip archive
  const zip = new AdmZip(mapPath);
  const zipEntries = zip.getEntries();
  zipEntries.forEach(function (zipEntry) {
    if (zipEntry.entryName == "world.json") {
      sliceWorldJSON = JSON.parse(zipEntry.getData().toString("utf8"));
    }
  });
  if (sliceWorldJSON) {
    spinnerFileExtract.success({ text: `World data extracted` });
  } else {
    spinnerFileExtract.error({ text: `World data extraction failed` });
  }
}
// Extract the world entities from the world JSON
/*
Extract the entities array from the world JSON
*/
async function sliceExtractEntities() {
  const spinnerExtractEntities = createSpinner('Extracting entities...').start();
  worldEntities = sliceWorldJSON.Entities;
  await sleep(100);
  spinnerExtractEntities.success({ text: `Entities extracted` });
}
// Filter entities
/*
Filter the entities array based off the entity blacklist. It does not affect worldEntities as this is needed in tact later
(these can't be built over anyway)
*/
async function sliceFilterEntities() {
  const spinner = createSpinner('Filtering entities...').start();
  worldEntitiesToExtract = worldEntities.filter( (entity) => {
    return (
      !entityBlacklist.includes(entity.Template) && 
      entity.Components.BlockObject.Coordinates.Z >= sliceHeight
    );
  });
  spinner.success({ text: `Entities filtered` });
  return worldEntitiesToExtract.length;
}
// Store the entity store file to later use when un-slicing
/*
Creates the entity store file for unslicing later
This one is a good template to follow for the other functions in here (for when refactoring)
*/
async function sliceCreateStoreFile() {
  fileID = generateFileID();
  const spinner = createSpinner(`Creating entity store file...`).start();
  try {
    fs.writeFile(`./entityStore/${fileID} ${sliceSelectedMap.replace(/^U_/,"").replace(/^(\d\d\d\d-\d\d-\d\d \d\d-\d\d-\d\d )/,"").replace(/\.[^/.]+$/, ".json")}`, JSON.stringify(worldEntitiesToExtract), 'utf8', (err) => {
      if (err) {
        spinner.error({ text: `Failed to create entity store file\n${err}` });
        return false;
      }
    });
    spinner.success({ text: `Entity store file created` });
    return true;
  } catch (e) {
    spinner.error({ text: `Failed to create entity store file\n${e}` });
    return false;
  }
}
// Slice world entities
/*
Finally, we slice the world's entities!
*/
async function slicePerformSlice() {
  const spinner = createSpinner('Slicing world file...').start();
  try {
    newWorldJSON = JSON.parse(JSON.stringify(sliceWorldJSON));
    newWorldJSON.Entities = newWorldJSON.Entities.filter( (entity) => {
      return (
        entityBlacklist.includes(entity.Template) || 
        entity.Components.BlockObject.Coordinates.Z < sliceHeight
      );
    });
    spinner.success({ text: `World file sliced` });
    return true
  } catch (e) {
    spinner.error({ text: `Failed to slice world file\n${e}` });
    return false;
  }
}
// Saved sliced world file
/*
Saves the sliced world JSON to a new .timber file
*/
async function sliceSaveWorld() {
  const spinner = createSpinner(`Saving new world file...`).start();
  try {
    const zip = new AdmZip();
    // Add world.json file
    zip.addFile("world.json", Buffer.from(JSON.stringify(newWorldJSON), "utf-8"));
    // Write .timber file
    zip.writeZip(`${timberbornMapPath}/${fileID} ${sliceSelectedMap.replace(/^U_/,"").replace(/^(\d\d\d\d-\d\d-\d\d \d\d-\d\d-\d\d )/,"")}`);

    spinner.success({ text: `New world file saved` });
    return true;
  } catch (e) {
    spinner.error({ text: `Failed to save new world file\n${e}` });
    return false;
  }
}
// Notify Slice complete
/*
Advise the user that the slice is complete!
*/
async function sliceCompleted() {
  const rainbowTitle = chalkAnimation.rainbow("Slicing complete!");
  await sleep(1000);
  rainbowTitle.stop();
}
// Clear entity store
/*
This is used to clear the entity store in the event of an error.
It will only clear the entity store file that has just been created
*/
async function sliceClearEntityStore() {
  const spinner = createSpinner(`Cleaning up entity store file...`).start();
  try {
    fs.unlinkSync(`./entityStore/${fileID}-${sliceSelectedMap}`);
    spinner.success({ text: `Entity store file deleted` });
    return true;
  } catch (e) {
    spinner.error({ text: `Failed to delete entity store file\n${e}` });
    return false;
  }
}

// ============= UNSLICE =========================================================================
// Variables
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
  await sleep(500);
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
      await sleep(100);
      return false;
    }
    spinnerWorldExtract.success({ text: `World data extracted` });
    await sleep(100);
    return true;
  } catch (e) {
    spinnerWorldExtract.error({ text: `World data extraction failed\n${e}` });
    await sleep(100);
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
  await sleep(1000);
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
      'Config Command',
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
  await printHeader();
  const op = await commandAskOperation();
  // Command input handler
  switch(op) {
    case "Slice":
      // Slice inputs
      await sliceSelectMap();
      await sliceAskHeight();
      // Perform slice set-up actions
      await sliceExtractWorldData();
      await sliceExtractEntities();
      const filterCount = await sliceFilterEntities();
      // Confirm slice
      const userInput = await continueOrCancel(`${filterCount} entities will be affected.`);
      if (userInput.answer !== "Continue") {
        await backToMenu();
        break;
      }
      // Store entities
      const storeOK = await sliceCreateStoreFile();
      // Cancel if error
      if (!storeOK) {
        await backToMenu();
        break;
      }
      // Slice world file
      const sliceOK = await slicePerformSlice();
      // Cancel if error
      if (!sliceOK) {
        await enterToContinue();
        await sliceClearEntityStore();
        await backToMenu();
        break;
      }
      // Write sliced world file
      const writeOK = await sliceSaveWorld();
      // Cancel if error
      if (!writeOK) {
        await enterToContinue();
        await sliceClearEntityStore();
        await backToMenu();
        break;
      }
      // Slice complete!
      await sliceCompleted();
      await enterToContinue();
      break;

    case "Un-Slice":
      // Select map to unslice
      await unsliceSelectMap();
      const storeFound = await unsliceValidateStore();
      // Check that store has been found
      if (!storeFound) {
        await backToMenu();
        break;
      }
      // Perform the unslice
      const extractOK = await unsliceExtractWorld();
      if (!extractOK) {
        await backToMenu();
        break;
      }
      // Extract entity store
      const UstoreOK = await unsliceStoreExtract();
      if (!UstoreOK) {
        await backToMenu();
        break;
      }
      // Perform the unslice
      const unsliceOK = await unslicePerformUnslice();
      if (!unsliceOK) {
        await backToMenu();
        break;
      }
      // Save the new world file
      const unsliceSaved = await unsliceSaveWorld();
      if (!unsliceSaved) {
        await backToMenu();
        break;
      }
      // Un-slice complete!
      await unsliceCompleted();
      await enterToContinue();
      break;

    case "Help":
      await helpMenu();
      break;
    
    case "Config":
      await viewConfig();
      await backToMenu();
      break;

    case "Test":
      await test();
      await backToMenu();
      break;
    
    case "Quit":
      console.clear();
      process.exit(0);
  }
  mainMenu();
}

async function helpMenu() {
  // Default menu headers
  await printHeader();
  // Menu page selection handler
  const helpPage = await helpShowPage1();
  // break out if the help page is the main menu
  if(helpPage === "Back to Main Menu") { return 0 }
  switch (helpPage) {
    case "Slice Command":
      await printHeader();
      await helpSlice();
      await backToHelp();
      break;

    case "Un-slice Command":
      await printHeader();
      await helpUnslice();
      await backToHelp();
      break;

    case "Help Command":
      await printHeader();
      await helpHelp();
      await backToHelp();
      break;

    case "Config Command":
      await printHeader();
      await helpConfig();
      await backToHelp();
      break;
  }
  // Calls the help page again - this probably shouldn't be an await, but the initial call is
  // resolved if called sync, so needs to be await, even though it leaves a promise stack
  await helpMenu();
}

// ============= WORKFLOW ========================================================================
// Application
console.clear();
await splashScreen();
await printHeader();
await mainMenu();