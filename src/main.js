#!/usr/bin/env node

/**
 *
 */

// read arguments
import { program } from "commander";
import figlet from "figlet";
import chalk from "chalk";
import { snapshot } from "./commands/snapshots/command.js";
import { monitor } from "./commands/monitor/command.js";
import { start } from "./commands/start/command.js";

console.log(chalk.blue(figlet.textSync("Skryb")));
console.log(chalk.gray("Enterprise Cloud Native Documentation Engine. Version 1.0.0"));
console.log(chalk.gray("Licensed under MIT"));
console.log();

program.version("1.0.0").option("-v, --verbose", "provides additional output to help when debugging");

program.command("snapshot").option("-p, --project <name>", "name of the project spec to use. default to skryb").description("perform a metamodel snapshot on one or more clusters").action(snapshot);
program.command("monitor").option("-p, --project <name>", "name of the project spec to use. default to skryb").description("monitor the target project clusters for resource changes").action(monitor);
program.command("start").option("-p, --project <name>", "name of the project spec to use. default to skryb").description("monitor the target project clusters for resource changes").action(start);

program.parseAsync(process.argv);
