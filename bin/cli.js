#!/usr/bin/env node

var eMobile = require('../index.js'),
  program = require('commander');

program
  .option('-w --who <who>', 'Number to text.', String)
  .option('-m --message <message>', 'Text to send in a webtext.', String)
  .parse(process.argv);


if (program.message && program.who) {
  console.log();
  eMobile.login(program.message, program.who);
} else {
  program.help();
}