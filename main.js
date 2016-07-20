'use strict';
const config = require('./config');
const five = require('johnny-five');

// Default options represent an Arduino with buttons, LED and LCD
const options = Object.assign({}, {
  board: new five.Board(),
  Controller: require('./controllers/LCDButtons'),
  pins: {
    goBtn: 3,
    otherBtn: 2,
    downBtn: 4,
    upBtn: 6,
    led: 5,
    metaBtn: 13,
    lcd: [7, 8, 9, 10, 11, 12]
  }
}, config);
const board = config.board || new five.Board();

board.on('ready', () => {
  const pombit = new options.Controller({
    pins: options.pins
  });
  pombit.go();
});
