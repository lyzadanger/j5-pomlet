const five = require('johnny-five');
const Raspi = require('raspi-io');

module.exports = {
  interface: require('./interfaces/LCDButtons'),
  board: new five.Board({
    io: new Raspi()
  }),
  pins: {
    goBtn: 'P1-7',
    otherBtn: 'P1-29',
    downBtn: 'P1-31',
    upBtn: 'P1-33',
    led: 'P1-32',
    metaBtn: 'P1-36',
    lcd: ['P1-15', 'P1-16', 'P1-18', 'P1-22', 'P1-37', 'P1-13']
  }
};
