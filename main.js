'use strict';
const Pomlet = require('./Pomlet');
const keypress = require('keypress');

const pomlet = new Pomlet();

pomlet.start();

// TODO break into input class or something
keypress(process.stdin);
process.stdin.on('keypress', (ch, key) => {
  console.log(key);
  if (key && key.name == 'q') {
    process.exit();
  }
  if (key && key.name == 'return') {
    pomlet.toggle();
  }
  if (key && key.name == 's') {
    console.log(pomlet.pom.remaining);
    console.log(pomlet.pom.type);
  }
  if (key && key.name == 't') {
    pomlet.pom.type = 'break';
  }
});
process.stdin.setRawMode(true);
process.stdin.resume();

// const board = new five.Board({
//   io: new Tessel()
// });
//
// board.on('ready', () => {
//   const pomlet
// });
