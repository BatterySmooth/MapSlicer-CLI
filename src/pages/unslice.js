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

let unsliceSelectedMap;
let unsliceEntityStore;
let unsliceEntityStorePath;
let unsliceWorldJSON;
let unsliceNewWorldJSON;

/**
 * Menu handler for the un-slice page.
 * @returns
 */
async function view() {
  // Select map to unslice
  await unsliceSelectMap();
  const storeFound = await unsliceValidateStore();
  // Check that store has been found
  if (!storeFound) {
    await ui.backToMenu();
    return;
  }
  // Perform the unslice
  const extractOK = await unsliceExtractWorld();
  if (!extractOK) {
    await ui.backToMenu();
    return;
  }
  // Extract entity store
  const UstoreOK = await unsliceStoreExtract();
  if (!UstoreOK) {
    await ui.backToMenu();
    return;
  }
  // Perform the unslice
  const unsliceOK = await unslicePerformUnslice();
  if (!unsliceOK) {
    await ui.backToMenu();
    return;
  }
  // Save the new world file
  const unsliceSaved = await unsliceSaveWorld();
  if (!unsliceSaved) {
    await ui.backToMenu();
    return;
  }
  // Un-slice complete!
  await unsliceCompleted();
  await ui.enterToContinue();
  return;
}

// Select map
/*
Select the map to unslice
*/
async function unsliceSelectMap() {
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
    const mapPath = globals.timberbornMapPath + unsliceSelectedMap;
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
    zip.writeZip(`${globals.timberbornMapPath}/U_${unsliceFileID} ${newFileName}`);

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
// Generate file ID
/*
Used to generate the prefix for the file ID when slicing
*/
function generateFileID() {
  let date = new Date().toISOString();
  date = date.replaceAll("T", " ").replaceAll(":", "-").replace(/\.[^/.]+$/, "");
  return date;
}


export default { view }