// Node imports
import chalk from 'chalk';

// Local imports
import ui from './ui.js';

/**
 * Sleep function.
 * Sets timeout for the input milliseconds.
 * Ensure to call with await.
 * @param {*} ms
 * @returns 
 */
const sleep = (ms) => new Promise ((r) => setTimeout(r, ms));

/**
 * Generates a file name from a given 
 * @param {string} fileName 
 * @param {string} fileExtension 
 * @param {string} prefix 
 * @returns 
 */
function generateFileName(fileName, fileExtension, prefix) {
  let date = new Date().toISOString();                              // Create new formatted date:
  date = date
    .replaceAll("T", " ")                                           // Remove 'T' from ISO string
    .replaceAll(":", "-")                                           // Replace ':' with '-'
    .replace(/\.[^/.]+$/, "");                                      // Remove milliseconds and 'Z'
  return prefix + date + " " + fileName                             // Format the new prefix & DateTime
    .replace(/^(U_|S_)*(\d\d\d\d-\d\d-\d\d \d\d-\d\d-\d\d )*/, "")  // Remove date-time prefixes
    .replace(/\.[^\/.]+$/, fileExtension);                          // Replace file extension
}

/**
 * 
 * @param {*} error 
 * @param {Spinner} spinner 
 * @param {string} spinnerMessage 
 */
async function error(error, spinner, spinnerMessage) {
  if (spinner) {spinnerConfig.error({ text: spinnerMessage });}
  console.log(`${chalk.bgRed('ERROR:')}`);
  console.log(e);
  await ui.enterToContinue();
  console.clear();
  process.exit(0);
}

export default { generateFileName, sleep, error }