// Node imports
import chalk from 'chalk';
import gradient from 'gradient-string';
// Local imports

/**
 * Test function.
 * Prints displays test data to the console.
 */
async function display() {
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

export default { display }