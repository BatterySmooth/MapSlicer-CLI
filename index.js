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
import help from './src/pages/help.js';
import configuration from './src/pages/configuration.js';
import test from './src/pages/test.js';

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
      await unslice.view();
      break;

    case "Help":
      await help.view();
      break;
    
    case "Configuration":
      await configuration.view();
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

// ============= WORKFLOW ========================================================================
// Application
console.clear();
await splash.start();
await mainMenu();