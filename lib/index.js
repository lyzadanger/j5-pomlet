'use strict';
const five = require('johnny-five');

module.exports = function (config) {
  const board = config.board || new five.Board();
  board.on('ready', () => {
    const pombit = new config.interface({
      pins: config.pins
    });
    pombit.go();
  });
};
