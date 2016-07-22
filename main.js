'use strict';
const config = require('./config');
const five = require('johnny-five');

const board = config.board || new five.Board();

board.on('ready', () => {
  const pombit = new config.interface({
    pins: config.pins
  });
  pombit.go();
});
