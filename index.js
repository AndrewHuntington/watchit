#!/usr/bin/env node
// NP = Node Package

// Lodash.debouce: NP that provides a debounce function to use
const debounce = require("lodash.debounce");
// Chokidar: NP that watches a dir for file changes
const chokidar = require("chokidar");
// Caporal: NP that provides help generation
const program = require("caporal");
const fs = require("fs");
// Grab the spawn method from the Child Process module
// Use it to execute a JS program from within this one
const { spawn } = require("child_process");
const chalk = require("chalk");

program
  .version("0.0.1")
  .argument("[filename]", "Name of a file to execute")
  .action(async ({ filename }) => {
    const name = filename || "index.js";

    try {
      await fs.promises.access(name); // Checks if file exists
    } catch (err) {
      throw new Error(`Could not find the file ${name}`);
    }

    let proc;
    const start = debounce(() => {
      if (proc) {
        proc.kill(); // kill() is included in ChildProcess
      }

      console.log(chalk.blue(">>>> Starting process..."));
      // stdio: "inherit": Child Procress inherits the stdio from the parent
      // spawn() returns a ChildProcess object
      proc = spawn("node", [name], { stdio: "inherit" });
    }, 100);

    chokidar
      .watch(".")
      .on("add", start)
      .on("change", start)
      .on("unlink", start);
  });

program.parse(process.argv);
