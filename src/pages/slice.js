// Node imports
import * as fs from 'fs';
import fsPromises from 'fs/promises';
import inquirer from 'inquirer';
import chalkAnimation from 'chalk-animation';
import { createSpinner } from 'nanospinner';
import AdmZip from 'adm-zip';

// Local imports
import globals from '../variables/globals.js';
import config from '../config/config.js';
import funcs from '../functions/general.js';
import ui from '../functions/ui.js';

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

async function view() {
  // Slice inputs
  await sliceSelectMap();
  await sliceAskHeight();
  // Perform slice set-up actions
  await sliceExtractWorldData();
  await sliceExtractEntities();
  const filterCount = await sliceFilterEntities();
  // Confirm slice
  const userInput = await ui.continueOrCancel(`${filterCount} entities will be affected.`);
  if (userInput.answer !== "Continue") {
    await ui.backToMenu();
    return;
  }
  // Store entities
  const storeOK = await sliceCreateStoreFile();
  // Cancel if error
  if (!storeOK) {
    await ui.backToMenu();
    return;
  }
  // Slice world file
  const sliceOK = await slicePerformSlice();
  // Cancel if error
  if (!sliceOK) {
    await ui.enterToContinue();
    await sliceClearEntityStore();
    await ui.backToMenu();
    return;
  }
  // Write sliced world file
  const writeOK = await sliceSaveWorld();
  // Cancel if error
  if (!writeOK) {
    await ui.enterToContinue();
    await sliceClearEntityStore();
    await ui.backToMenu();
    return;
  }
  // Slice complete!
  await sliceCompleted();
  await ui.enterToContinue();
}

// Slice select map
/*
Function to grab the world files and offer them up as options to select
*/
async function sliceSelectMap() {
  const spinner = createSpinner('Grabbing map files...').start();
  let timberbornMaps = [];
  fs.readdir(globals.timberbornMapPath, (err, files) => {
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
  const mapPath = globals.timberbornMapPath + sliceSelectedMap;
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
  await funcs.sleep(100);
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
  // fileID = generateFileID();
  const spinner = createSpinner(`Creating entity store file...`).start();
  try {
    fs.writeFile(`./entityStore/${funcs.generateFileName(sliceSelectedMap, ".json", globals.config.CONF_SLICED_PREFIX)}`, JSON.stringify(worldEntitiesToExtract), 'utf8', (err) => {
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
    zip.writeZip(`${globals.timberbornMapPath}/${fileID} ${sliceSelectedMap.replace(/^U_/,"").replace(/^(\d\d\d\d-\d\d-\d\d \d\d-\d\d-\d\d )/,"")}`);

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
  await funcs.sleep(1000);
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

export default { view }