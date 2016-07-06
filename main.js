'use strict';
const five = require('johnny-five');
const Pombit = require('./controllers/LCDButtons');

const board = new five.Board();

board.on('ready', () => {
  const pombit = new Pombit({
    pins: {
      goBtn: 3,
      otherBtn: 2,
      downBtn: 6,
      upBtn: 4,
      alerter: 5,
      metaBtn: 13,
      lcd: [7, 8, 9, 10, 11, 12]
    }
  });
  pombit.go();
});
