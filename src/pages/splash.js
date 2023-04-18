// Node imports
import * as fs from 'fs';
import fsPromises from 'fs/promises';
import * as path from 'path';
import chalkAnimation from 'chalk-animation';

// Local imports
import globals from '../variables/globals.js';
import config from '../config/config.js';
import funcs from '../functions/general.js';

/**
 * Display slash screen while calling the environment validation.
 */
async function start() {
  const rainbowTitle = chalkAnimation.rainbow("Launching MapSlicer-CLI");
  await validateDirectories();
  await getVersion();
  rainbowTitle.stop();
}

/**
 * Validates the application environment.
 * Checks that required files exist, config is pulled, and validated
 */
async function validateDirectories() {
  // Check config
  try {
    if(!config.exists()) {
      await config.setup();
    }
    globals.config = await config.read();
  } catch (e) {
    await funcs.error(e);
  }
  // Check required paths are valid
  try {
    // if(!fs.existsSync(timberbornPath)) { throw `The Timberborn folder is not accessible. The application will now close.` }
    if(!fs.existsSync('./entityStore')) { fs.mkdirSync('./entityStore'); }
  } catch (e) {
    funcs.error(e)
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

async function getVersion() {
  let packageJSON = await fsPromises.readFile('./package.json', 'utf8');
  globals.version = JSON.parse(packageJSON).version;
  return;
}

export default { start }