const five = require('johnny-five');
const Galileo = require('galileo-io');

// Pin usage is identical to Arduino
module.exports = {
  interface: require('./interfaces/LCDButtons'),
  board: new five.Board({
    io: new Galileo()
  }),
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
