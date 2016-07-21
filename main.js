'use strict';
const config = require('./config-tessel');
const five = require('johnny-five');

const board = config.board || new five.Board();

board.on('ready', () => {
  const pombit = new config.interface({
    pins: config.pins
  });
  board.repl.inject({
    lcd: pombit.lcd
  });
  pombit.go();
});
