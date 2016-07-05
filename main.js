'use strict';
const five = require('johnny-five');
const Tessel = require('tessel-io');
const Pomlet = require('./Pomlet');

const board = new five.Board({
  io: new Tessel()
});

const INTERFACES = {
  WELCOME: 0,
  HOME: 1,
  PLAYING: 2,
  PAUSED: 3,
  CANCEL_CONFIRM: 4
};

board.on('ready', () => {
  const pomlet = new Pomlet();
  var currentInterface = INTERFACES.WELCOME;
  var goBtn = new five.Button('b6');
  var otherBtn = new five.Button('b7');

  var lcd = new five.LCD({
    pins: ['a2', 'a3', 'a4', 'a5', 'a6', 'a7']
  });
  lcd.useChar('heart');
  lcd.useChar('pointerright');
  lcd.useChar('pointerleft');

  // Show welcome interface
  welcome();

  pomlet.on('newpom', home); // Show the home interface when new poms init'ed
  pomlet.on('play', playing);
  pomlet.on('pause', paused);
  pomlet.on('tick', updateTimerFn());

  goBtn.on('press', () => {
    switch (currentInterface) {
      case INTERFACES.WELCOME:
        pomlet.initialize(); // will trigger newpom event and go home
        break;
      case INTERFACES.HOME:
        pomlet.play();
        break;
      case INTERFACES.PLAYING:
        pomlet.pause();
        break;
      case INTERFACES.PAUSED:
        pomlet.play();
        break;
      case INTERFACES.CANCEL_CONFIRM:
        pomlet.cancel(); // will cause a new pom to queue, triggering newpom
        break;
    }
  });

  otherBtn.on('press', () => {
    switch (currentInterface) {
      case INTERFACES.WELCOME:
        break;
      case INTERFACES.HOME:
        break;
      case INTERFACES.PLAY:
        break;
      case INTERFACES.PAUSED:
        cancelConfirm();
        break;
    }
  });

  function clearScreen (cb) {
    lcd.clear();
    if (cb && typeof cb === 'function') {
      setTimeout(cb, 500);
    }
  }

  function home () {
    currentInterface = INTERFACES.HOME;
    const pomDuration = pomlet.pom.duration / (1000 * 60);
    clearScreen(() => {
      lcd.cursor(0, 0).print(pomlet.pom.type);
      lcd.cursor(0, 12).print(`${pomDuration}m`);
      lcd.cursor(1, 0).print(':pointerleft:MORE        GO:pointerright:');
    });
  }

  function welcome () {
    currentInterface = INTERFACES.WELCOME;
    clearScreen(() => {
      lcd.cursor(0, 2).print(':heart: Pomlet :heart:');
      lcd.cursor(1, 1).print('press go btn :pointerright:');
    });
  }

  function playing () {
    currentInterface = INTERFACES.PLAYING;
    lcd.cursor(0, 0).print('PLAYING');
    lcd.cursor(1, 0).print('          PAUSE:pointerright:');
  }

  function paused () {
    currentInterface = INTERFACES.PAUSED;
    lcd.cursor(0, 0).print('PAUSING');
    lcd.cursor(1, 0).print(':pointerleft:CANCEL      GO:pointerright:');
  }

  function cancelConfirm () {
    currentInterface = INTERFACES.CANCEL_CONFIRM;
    lcd.cursor(0, 0).print('Cancel this pom?');
    lcd.cursor(1, 0).print(':pointerleft:NOPE       YEP:pointerright:');
  }

  function updateTimerFn () {
    var lastTimeString;
    return () => {
      const remaining = pomlet.remaining;
      const pad = (remaining.seconds < 10) ? '0' : '';
      const timeString = `${remaining.minutes}:${pad}${remaining.seconds}`;
      if (timeString != lastTimeString) {
        if (currentInterface == INTERFACES.PLAYING) {
          lcd.cursor(0, 10).print(timeString);
          lastTimeString = timeString;
        }
      }
    };
  }

  board.repl.inject({
    lcd: lcd
  });
});
