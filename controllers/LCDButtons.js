'use strict';
const five = require('johnny-five');
const Pomlet = require('../Pomlet.js');

class LCDButtons {
  constructor (opts) {
    const options = Object.assign({}, {
      inputPositions: {
        goBtn: LCDButtons.INPUT_POSITIONS.RIGHT,
        otherBtn: LCDButtons.INPUT_POSITIONS.LEFT,
        upBtn: LCDButtons.INPUT_POSITIONS.CENTER,
        downBtn: LCDButtons.INPUT_POSITIONS.CENTER,
        metaBtn: LCDButtons.INPUT_POSITIONS.UPPER
      }
    }, opts);

    this.goBtn = new five.Button(options.pins.goBtn);
    this.otherBtn = new five.Button(options.pins.otherBtn);
    this.downBtn = new five.Button(options.pins.downBtn);
    this.upBtn = new five.Button(options.pins.upBtn);
    this.alerter = new five.Led(options.pins.led);
    this.metaBtn = new five.Button(options.pins.metaBtn);
    this.lcd = new five.LCD({
      pins: options.pins.lcd
    });
    this.inputPositions = options.inputPositions;

    this.pomlet = new Pomlet();
    this.currentInterface = LCDButtons.INTERFACES.WELCOME;
    this.lastTimeString = null;

    this.lcd.useChar('heart');
    this.lcd.useChar('pointerright');
    this.lcd.useChar('pointerleft');
    this.lcd.useChar('pointerdown');
  }
  go () {
    this.welcome();

    this.pomlet.on('new', this.home.bind(this));
    this.pomlet.on('play', this.playing.bind(this));
    this.pomlet.on('pause', this.paused.bind(this));
    this.pomlet.on('tick', this.updateTime.bind(this));
    this.pomlet.on('timechange', this.updateTime.bind(this));
    this.pomlet.on('typechange', this.updateType.bind(this));
    this.pomlet.on('complete', this.complete.bind(this));

    this.goBtn.on('press', () => {
      switch (this.currentInterface) {
        case LCDButtons.INTERFACES.WELCOME:
          this.pomlet.initialize(); // will trigger new event and go home
          break;
        case LCDButtons.INTERFACES.HOME:
          this.pomlet.play();
          break;
        case LCDButtons.INTERFACES.PLAYING:
          this.pomlet.pause();
          break;
        case LCDButtons.INTERFACES.PAUSED:
          this.pomlet.play();
          break;
        case LCDButtons.INTERFACES.CANCEL_CONFIRM:
          this.pomlet.cancel();
          break;
        case LCDButtons.INTERFACES.COMPLETE:
          this.pomlet.next();
          break;
        case LCDButtons.INTERFACES.META_INFO:
          this.home();
          break;
        default:
          break;
      }
    });

    this.otherBtn.on('press', () => {
      switch (this.currentInterface) {
        case LCDButtons.INTERFACES.WELCOME:
          break;
        case LCDButtons.INTERFACES.HOME:
          this.pomlet.toggleType();
          break;
        case LCDButtons.INTERFACES.PLAY:
          break;
        case LCDButtons.INTERFACES.PAUSED:
          this.cancelConfirm();
          break;
        case LCDButtons.INTERFACES.META_INFO:
          this.pomlet.reset();
          break;
        default:
          break;
      }
    });

    this.downBtn.on('press', () => {
      this.pomlet.addTime(60 * 1000);
    });

    this.upBtn.on('press', () => {
      this.pomlet.removeTime(60 * 1000);
    });

    this.metaBtn.on('press', () => {
      if (this.currentInterface == LCDButtons.INTERFACES.HOME) {
        this.metaInfo();
      }
    });
  }
  welcome () {
    this.currentInterface = LCDButtons.INTERFACES.WELCOME;
    this.lcd.clear();
    this.lcd.cursor(0, 2).print(':heart: Pomlet :heart:');
    this.displayOptions({
      goBtn: 'Press Go Btn'
    });
  }
  home () {
    this.currentInterface = LCDButtons.INTERFACES.HOME;
    this.alerter.stop().off();
    this.lcd.clear();
    this.lcd.cursor(0, 0).print(this.pomlet.pom.type);
    this.displayOptions({
      goBtn: 'GO',
      otherBtn: 'TYPE'
    });
    this.updateTime(true);
  }
  playing () {
    this.currentInterface = LCDButtons.INTERFACES.PLAYING;
    this.displayOptions({
      goBtn: 'PAUSE'
    });
  }
  complete () {
    this.currentInterface = LCDButtons.INTERFACES.COMPLETE;
    this.alerter.pulse(500);
    this.lcd.clear();
    this.lcd.cursor(0, 0).print('   All done!');
    this.displayOptions({
      goBtn: 'ONWARD'
    });
  }
  paused () {
    this.currentInterface = LCDButtons.INTERFACES.PAUSED;
    this.displayOptions({
      goBtn: 'GO',
      otherBtn: 'CANCEL'
    });
  }

  cancelConfirm () {
    this.currentInterface = LCDButtons.INTERFACES.CANCEL_CONFIRM;
    this.lcd.cursor(0, 0).print('Cancel this pom?');
    this.displayOptions({
      goBtn: 'YEP',
      otherBtn: 'NOPE'
    });
  }
  metaInfo () {
    this.currentInterface = LCDButtons.INTERFACES.META_INFO;
    this.lcd.clear();
    this.lcd.cursor(0, 0).print(`POMS: ${this.pomlet.pomCount}`);
    this.lcd.cursor(0, 10).print(`(${this.pomlet.totalMinutes}m)`);
    this.displayOptions({
      goBtn: 'BACK',
      otherBtn: 'RESET'
    });
  }

  displayOption (componentName, optionText) {
    const position = this.inputPositions[componentName];
    switch (position) {
      case LCDButtons.INPUT_POSITIONS.LEFT:
        this.lcd.cursor(1, 0).print(`:pointerleft:${optionText}`);
        break;
      case LCDButtons.INPUT_POSITIONS.RIGHT:
        this.lcd.cursor(1, 15 - optionText.length)
          .print(`${optionText}:pointerright:`);
    }
  }

  displayOptions (options) {
    for (var inputName in options) {
      this.displayOption(inputName, options[inputName]);
    }
  }

  updateTime (force) {
    const timeString = this.pomlet.remaining.moment.format('mm:ss');
    if ((timeString != this.lastTimeString) || force) {
      this.lcd.cursor(0, 16 - timeString.length).print(timeString);
    }
    this.lastTimeString = timeString;
  }

  updateType (toType) {
    this.lcd.cursor(0, 0).print(toType + ' ');
  }

}

LCDButtons.INTERFACES = {
  WELCOME: 0,
  HOME: 1,
  PLAYING: 2,
  PAUSED: 3,
  CANCEL_CONFIRM: 4,
  COMPLETE: 5,
  META_INFO: 6
};

LCDButtons.INPUT_POSITIONS = {
  LEFT: 0,
  RIGHT: 1,
  CENTER: 2,
  UPPER: 3
};

module.exports = LCDButtons;
