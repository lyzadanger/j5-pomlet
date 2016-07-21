const five = require('johnny-five');

// Default configuration assumes Arduino with 5 buttons, LCD, LED
module.exports = {
  interface: require('./interfaces/LCDButtons'),
  board: new five.Board(),
  pins: {
    goBtn: 2,
    otherBtn: 3,
    downBtn: 4,
    upBtn: 6,
    led: 5,
    metaBtn: 13,
    lcd: [7, 8, 9, 10, 11, 12]
  }
};
