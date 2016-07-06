'use strict';
const five = require('johnny-five');
const Pomlet = require('./Pomlet');

const INTERFACES = {
  WELCOME: 0,
  HOME: 1,
  PLAYING: 2,
  PAUSED: 3,
  CANCEL_CONFIRM: 4,
  COMPLETE: 5,
  META_INFO: 6
};

const board = new five.Board();

board.on('ready', () => {
  const goBtn = new five.Button(3);
  const otherBtn = new five.Button(2);
  const downBtn = new five.Button(6);
  const upBtn = new five.Button(4);
  const alerter = new five.Led(5);
  const metaBtn = new five.Button(13);

  var lcd = new five.LCD({
    pins: [7, 8, 9, 10, 11, 12]
  });

  const pomlet = new Pomlet();
  var currentInterface = INTERFACES.WELCOME;

  lcd.useChar('heart');
  lcd.useChar('pointerright');
  lcd.useChar('pointerleft');
  lcd.useChar('pointerdown');

  // Show welcome interface
  welcome();

  var updateTime = (function () {
    var lastTimeString;
    return function (force) {
      const timeString = pomlet.remaining.moment.format('mm:ss');
      if ((timeString != lastTimeString) || force) {
        lcd.cursor(0, 16 - timeString.length).print(timeString);
      }
      lastTimeString = timeString;
    };
  })();

  pomlet.on('new', home);
  pomlet.on('play', playing);
  pomlet.on('pause', paused);
  pomlet.on('tick', updateTime);
  pomlet.on('timechange', updateTime);
  pomlet.on('typechange', updateType);
  pomlet.on('complete', complete);

  goBtn.on('press', () => {
    switch (currentInterface) {
      case INTERFACES.WELCOME:
        pomlet.initialize(); // will trigger new event and go home
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
        pomlet.cancel(); // will cause a new pom to queue, triggering new event
        break;
      case INTERFACES.COMPLETE:
        pomlet.next();
        break;
      case INTERFACES.META_INFO:
        home();
        break;
      default:
        break;
    }
  });

  otherBtn.on('press', () => {
    switch (currentInterface) {
      case INTERFACES.WELCOME:
        break;
      case INTERFACES.HOME:
        pomlet.toggleType();
        break;
      case INTERFACES.PLAY:
        break;
      case INTERFACES.PAUSED:
        cancelConfirm();
        break;
      case INTERFACES.META_INFO:
        pomlet.reset();
        break;
      default:
        break;
    }
  });

  downBtn.on('press', () => {
    pomlet.addTime(60 * 1000);
  });

  upBtn.on('press', () => {
    pomlet.removeTime(60 * 1000);
  });

  metaBtn.on('press', () => {
    if (currentInterface == INTERFACES.HOME) {
      metaInfo();
    }
  });

  function complete () {
    currentInterface = INTERFACES.COMPLETE;
    alerter.pulse(500);
    clearScreen(() => {
      lcd.cursor(0, 0).print('   All done!');
      lcd.cursor(1, 0).print('         ONWARD:pointerdown:');
    });
  }

  function clearScreen (cb) {
    lcd.clear();
    if (cb && typeof cb === 'function') {
      setTimeout(cb, 250);
    }
  }

  function updateType (toType) {
    lcd.cursor(0, 0).print(toType + ' ');
  }

  function welcome () {
    currentInterface = INTERFACES.WELCOME;
    clearScreen(() => {
      lcd.cursor(0, 2).print(':heart: Pomlet :heart:');
      lcd.cursor(1, 1).print('press go btn :pointerdown:');
    });
  }

  function home () {
    currentInterface = INTERFACES.HOME;
    alerter.stop().off();
    clearScreen(() => {
      lcd.cursor(0, 0).print(pomlet.pom.type);
      lcd.cursor(1, 0).print(':pointerdown:TYPE        GO:pointerdown:');
      updateTime(true);
    });
  }

  function metaInfo () {
    currentInterface = INTERFACES.META_INFO;
    clearScreen(() => {
      lcd.cursor(0, 0).print(`POMS: ${pomlet.pomCount}`);
      lcd.cursor(0, 10).print(`(${pomlet.totalMinutes}m)`);
      lcd.cursor(1, 0).print(':pointerdown:RESET     BACK:pointerdown:');
    });
  }

  function playing () {
    currentInterface = INTERFACES.PLAYING;
    lcd.cursor(1, 0).print('          PAUSE:pointerright:');
  }

  function paused () {
    currentInterface = INTERFACES.PAUSED;
    lcd.cursor(1, 0).print(':pointerleft:CANCEL      GO:pointerright:');
  }

  function cancelConfirm () {
    currentInterface = INTERFACES.CANCEL_CONFIRM;
    lcd.cursor(0, 0).print('Cancel this pom?');
    lcd.cursor(1, 0).print(':pointerleft:NOPE       YEP:pointerright:');
  }

  board.repl.inject({
    lcd: lcd,
    pomlet: pomlet
  });
});
