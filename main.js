'use strict';
const five = require('johnny-five');
const Tessel = require('tessel-io');
const Pomlet = require('./Pomlet');

const board = new five.Board({
  io: new Tessel()
});

const INPUT_STATES = {
  WELCOME: 0,
  STOP: 1,
  PLAY: 2,
  PAUSE: 3
};

board.on('ready', () => {
  const pomlet = new Pomlet();
  var inputState, refreshInterval;

  var goBtn = new five.Button('b6');
  goBtn.on('press', () => {
    console.log('button', inputState);
    switch (inputState) {
      case INPUT_STATES.WELCOME:
        toInputState(INPUT_STATES.STOP);
        break;
      case INPUT_STATES.STOP:
        toInputState(INPUT_STATES.PLAY);
        break;
      case INPUT_STATES.PLAY:
        toInputState(INPUT_STATES.PAUSE);
        break;
      case INPUT_STATES.PAUSE:
        toInputState(INPUT_STATES.PLAY);
        break;
      default:
        // do nothing
        break;
    }
  });
  var lcd = new five.LCD({
    pins: ['a2', 'a3', 'a4', 'a5', 'a6', 'a7']
  });
  lcd.useChar('heart');
  lcd.useChar('pointerright');
  lcd.useChar('pointerleft');

  function stopState () {
    const pomDuration = pomlet.pom.duration / (1000 * 60);
    lcd.clear();
    lcd.cursor(0, 0).print(pomlet.pom.type);
    lcd.cursor(0, 12).print(`${pomDuration}m`);
    lcd.cursor(1, 0).print(':pointerleft:MORE        GO:pointerright:');
  }
  function refreshTimer () {
    const remaining = pomlet.pom.remaining;
    const remainingMinutes = Math.floor(remaining / (1000 * 60));
    const remainingSeconds = Math.round((remaining % (1000 * 60)) / 1000);
    console.log('refresh', remainingMinutes, remainingSeconds);
    lcd.cursor(0, 10).print(`${remainingMinutes}:${remainingSeconds}`);
  }
  function playState () {
    pomlet.play();
    lcd.clear();
    lcd.cursor(0, 0).print(pomlet.pom.type);
    refreshInterval = setInterval(refreshTimer, 100);
  }
  function welcomeState () {
    lcd.clear();
    lcd.cursor(0, 2).print(':heart: Pomlet :heart:');
    lcd.cursor(1, 1).print('press go btn :pointerright:');
  }

  function toInputState (newState) {
    inputState = newState;
    switch (newState) {
      case INPUT_STATES.STOP:
        stopState();
        break;
      case INPUT_STATES.WELCOME:
      default:
        welcomeState();
        break;
      case INPUT_STATES.PLAY:
        playState();
        break;
    }
  }
  pomlet.on('ready', () => {
    toInputState(INPUT_STATES.WELCOME);
  });
  pomlet.init();

  board.repl.inject({
    lcd: lcd
  });
});
