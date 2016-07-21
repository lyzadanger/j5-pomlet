const five = require('johnny-five');
const Tessel = require('tessel-io');

module.exports = {
  interface: require('./interfaces/LCDButtons'),
  board: new five.Board({
    io: new Tessel()
  }),
  pins: {
    goBtn: 'b2',
    otherBtn: 'b5',
    downBtn: 'b6',
    upBtn: 'b7',
    led: 'a5',
    metaBtn: 'a6',
    lcd: ['a0', 'a1', 'a2', 'a3', 'a4', 'a7']
  }
};
