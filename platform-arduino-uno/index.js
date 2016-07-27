const five = require('johnny-five');
const pomPilot = require('../lib');

const config = {
  interface: require('../lib/interfaces/LCDButtons'),
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

pomPilot(config);
