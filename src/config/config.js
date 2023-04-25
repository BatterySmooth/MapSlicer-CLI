// Node imports
import * as fs from 'fs';
import fsPromises from 'fs/promises';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import chalk from 'chalk';

import globals from '../variables/globals.js';
import funcs from '../functions/general.js';

// Module Constants
const configPath = './src/config/config.json';
''
/**
 * Synchronous.
 * Checks whether the config file exists.
 * @returns
 */
async function exists() {
  return fs.existsSync(configPath);
}

/**
 * Reads the config data and returns the JSON object.
 * Handles its own spinner.
 * Asynchronous.
 * @param {boolean} quiet - If true, will not generate a spinner
 * @returns {object}
 */
async function read(quiet = false) {
  let spinner;
  if (!quiet) {spinner = createSpinner(`Pulling config...`).start();}
  try {
    const data = await fsPromises.readFile(configPath, 'utf8');
    if (!quiet) {spinner.success({ text: `Configuration file read` });}
    return JSON.parse(data);
  } catch (e) {
    if (!quiet) {spinner.error({ text: `Configuration file reading failed\n${err}` });}
    funcs.error(e)
  }
}

/**
 * Writes the modified key value pair to the config file.
 * Handles its own spinner.
 * Returns true if succeeded, false if failed.
 * Asynchronous.
 * @param {object} record 
 * @param {boolean} quiet - If true, will not generate a spinner
 * @returns {boolean}
 */
async function write({key, value}, quiet = false) {
  try {
    let spinner;
    if (!quiet) {spinner = createSpinner(`Writing config...`).start();}
    // let config = await read(true);
    console.log(config);
    

    let newValue;
    switch (key) {
      case 'CONF_TIMBERBORN_DIR':
        newValue = value
          // Add a '/' to the start and end of the path
          .replace(/(^|$)/g, "/")
          // Replace all groups of slashes to a single '/'
          .replace(/(\\|\/)+/g,"/"); 
        break;
      
      case 'CONF_TIMBERBORN_MAP_DIR':
        newValue = value
          // Replace all slashes with blank
          .replace(/(\\|\/)+/g, "");
          // Append slash to path
          + "/"
        break;

      default:
        newValue = value;
        break;
    }
    // await config;
    globals.config[key] = newValue;
    // fs.writeFileSync(configPath, JSON.stringify(globals.config));
    if (!quiet) {spinner.success({ text: `Configuration data saved` });}
    return true;
  } catch {
    if (!quiet) {spinner.error({ text: `Configuration failed to save` });}
    return false;
  }
}


// Configuration Setup
/**
 * Asynchronous.
 * Used to set up the config if the file is missing.
 * Legacy name: setupConfig
 */
async function setup() {
  console.log(`${chalk.bgRed('Config Missing - Set-up Required')}`);
  // Take config inputs and format start and end slashes
  let answerDirectory = await inquirer.prompt({
    name: 'answer',
    type: 'input',
    message: `Please enter the path for the Timberborn save folder relative to your home directory\n(This is usually stored in your documents folder)\n`,
    default: '/Documents/Timberborn/'
  });

  let answerMapDirectory = await inquirer.prompt({
    name: 'answer',
    type: 'input',
    message: `Please enter the path for the Timberborn map folder relative to the Timberborn folder\n(This is almost always the default provided)\n`,
    default: 'Maps/'
  });

  let configOutput = {
    "CONF_TIMBERBORN_DIR": answerDirectory.answer,
    "CONF_TIMBERBORN_MAP_DIR": answerMapDirectory.answer,
    "CONF_SLICED_PREFIX": "S_",
    "CONF_UNSLICED_PREFIX": "U_"
  }
  // Validate config paths
  let validatedConfig = validate(JSON.stringify(configOutput));
  // Write config file
  try {
    fs.writeFile(configPath, validatedConfig, 'utf8', (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (e) {
    console.log(e);
  }
  // ***** Why is this needed? *****
  // await funcs.sleep(100);
}

/**
 * Synchronous.
 * Used to validate the paths for the config input. This will add the leading
 * and trailing slashes if needed.
 * Takes in a JSON stringified object and returns a JSON strigified object.
 * Legacy name: validateConfig
 * @param {*} inputConfig 
 * @returns configJSON (Stringified)
 */
function validate(inputConfig) {
  let configJSON = JSON.parse(inputConfig);
  // Add slashes to front and end, and replace all slashes with single forward slash
  configJSON.CONF_TIMBERBORN_DIR = configJSON.CONF_TIMBERBORN_DIR.replace(/(^|$)/g, "/").replace(/(\\|\/)+/g,"/")
  // Remove all slashes from 'Maps' input and add a slash at the end
  configJSON.CONF_TIMBERBORN_MAP_DIR = `${configJSON.CONF_TIMBERBORN_MAP_DIR.replace(/(\\|\/)+/g, "")}/`;
  return JSON.stringify(configJSON);
}

export default {
  exists,
  read,
  write,
  setup
}