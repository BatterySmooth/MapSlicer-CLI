export default {
  exists,
  read
  // setup,
  // validate,
  // view,
  // configJSON,
  // timberbornPath,
  // timberbornMapPath
}

// Node imports
import * as fs from 'fs';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';

// Module Constants
const configPath = './config.json';

/**
 * Synchronous.
 * Checks whether the config file exists.
 * @returns
 */
function exists() {
  return fs.existsSync(configPath);
}

/**
 *
 * Asynchronous.
 * Reads the config data and returns the JSON object.
 * Handles its own spinner.
 * @param {boolean} quiet - If true, will not generate a spinner
 * @returns {object}
 */
async function read(quiet = false) {
  if (!quiet) {const spinner = createSpinner(`Pulling config...`).start();}
  fs.readFileSync(configPath, {encoding: 'utf8'}, (err, data) => {
    if (err) {
      if (!quiet) {spinner.error({ text: `Configuration file reading failed\n${err}` });}
      // TO DO: Pass screen over to config set-up
      console.throw(err);
      return err;
    }
    if (!quiet) {spinner.success({ text: `Configuration data loaded` });}
    return JSON.parse(data);
  });
}

/**
 * Writes the modified key value pair to the config file.
 * Handles its own spinner.
 * Returns true if succeeded, false if failed.
 * @param {object} record 
 * @param {boolean} quiet - If true, will not generate a spinner
 * @returns {boolean}
 */
async function write({key, value}, quiet = false) {
  try {
    if (!quiet) {const spinner = createSpinner(`Writing config...`).start();}
    let config = read(true);
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
    await config;
    config[key] = newValue;
    fs.writeFileSync(configPath, JSON.stringify(config));
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
  // ***** Why is this needed? *****
  await funcs.sleep(100);
}
// Configuration validation
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
// View config
/**
 * Used to view the config details and then ask if the user to change the config.
 * Legacy name: viewConfig.
 */
async function view() {
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


/**
 * Config class
 * WIP, no worky
 */
class Config {
  /**
   * Initialises an instance of the Config class.
   * @param {*} defaults 
   */
  constructor() {
    // Define properties
    this.timberbornDir = config.CONF_TIMBERBORN_DIR || '/Documents/Timberborn/';
    this.timberbornMapDir = config.CONF_TIMBERBORN_MAP_DIR || "Maps/";
    this.slicedPrefix = config.CONF_SLICED_PREFIX || "S_";
    this.unslicedPrefix = config.CONF_UNSLICED_PREFIX || "U_";
  }

  /**
   * Sets the Timberborn file path, with validation
   * @param {string} path
   */
  set timberbornDir (path) {
    this.timberbornDir = path
      // Add a '/' to the start and end of the path
      .replace(/(^|$)/g, "/")
      // Replace all groups of slashes to a single '/'
      .replace(/(\\|\/)+/g,"/");      
  }

  /**
   * Sets the Timberborn Maps file path, with validation
   * @param {string} path
   */
  set timberbornMapDir (path) {
    this.timberbornMapDir = path
      // Replace all slashes with blank
      .replace(/(\\|\/)+/g, "");
  }

  /**
   * Sets the sliced prefix for files
   * @param {string} string
   */
  set slicedPrefix (string) {
    this.slicedPrefix = string;
  }

  /**
   * Sets the unsliced prefix for files
   * @param {string} string
   */
  set unslicedPrefix (string) {
    this.unslicedPrefix = string;
  }
  
  

}