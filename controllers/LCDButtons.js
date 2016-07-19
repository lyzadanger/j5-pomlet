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
    this.metaBtn = new five.Button(options.pins.metaBtn);
    this.alerter = new five.Led(options.pins.led);
    this.lcd = new five.LCD({  pins: options.pins.lcd });

    this.inputPositions = options.inputPositions;

    this.pomlet = new Pomlet();

    this.lcd.useChar('heart');
    this.lcd.useChar('pointerright');
    this.lcd.useChar('pointerleft');
    this.lcd.useChar('pointerdown');
  }
  go () {
    this.setInterface(LCDButtons.INTERFACES.welcome);

    this.pomlet.on('new', () => {
      this.alerter.stop().off();
      this.setInterface(LCDButtons.INTERFACES.home);
    });
    this.pomlet.on('play', () => {
      this.setInterface(LCDButtons.INTERFACES.playing);
    });
    this.pomlet.on('pause', () => {
      this.setInterface(LCDButtons.INTERFACES.paused);
    });
    this.pomlet.on('tick', this.updateTime.bind(this));
    this.pomlet.on('timechange', this.updateTime.bind(this));
    this.pomlet.on('typechange', () => { this.displayMessages(); });
    this.pomlet.on('complete', () => {
      this.alerter.pulse(500);
      this.setInterface(LCDButtons.INTERFACES.complete);
    });

    this.goBtn.on('press', () => { this.handleInput('goBtn'); });
    this.otherBtn.on('press', () => { this.handleInput('otherBtn'); });
    this.upBtn.on('press', () => { this.handleInput('upBtn'); });
    this.downBtn.on('press', () => { this.handleInput('downBtn'); });
    this.metaBtn.on('press', () => { this.toggleMetaInterface(); });
  }

  handleInput (componentName) {
    const ci = this.currentInterface;
    if (!ci) { return false; }
    if (ci.handlers &&
        ci.handlers[componentName] &&
        typeof ci.handlers[componentName] === 'function') {
      ci.handlers[componentName].call(this);
    }
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

  displayMessages (messages) {
    if (!messages) {
      messages = this.currentInterface && this.currentInterface.messages;
    }
    messages = (typeof messages === 'function') ?
      messages.call(this) : messages;
    messages.forEach((message, index) => {
      this.lcd.cursor(index, 0).print(message);
    });
  }

  rewindInterface () {
    this.setInterface(this.previousInterface);
  }

  setInterface (nextInterface) {
    this.previousInterface = this.currentInterface;
    this.currentInterface = nextInterface;
    this.lcd.clear();
    this.currentInterface.messages &&
      this.displayMessages(this.currentInterface.messages);
    this.currentInterface.options &&
      this.displayOptions(this.currentInterface.options);
  }

  toggleMetaInterface () {
    if (this.currentInterface === LCDButtons.INTERFACES.metaInfo) {
      this.rewindInterface();
    }
    else {
      this.setInterface(LCDButtons.INTERFACES.metaInfo);
    }
  }

  centerLine (msg, total) {
    const remaining = total - msg.length;
    const pad = ' '.repeat(Math.floor(remaining / 2));
    return `${pad}${msg}${pad}`;
  }

  fillLine (msg1, msg2, total) {
    const pad = ' '.repeat(total - msg1.length - msg2.length);
    return `${msg1}${pad}${msg2}`;
  }

  get timeString () {
    return this.pomlet && this.pomlet.remaining.moment.format('mm:ss');
  }

}

LCDButtons.prototype.updateTime = (function () {
  var lastTimeString = '';
  return function (force) {
    const timeString = this.timeString;
    if ((timeString != lastTimeString) || force) {
      this.lcd.cursor(0, 16 - timeString.length).print(timeString);
    }
    lastTimeString = timeString;
  };
})();

LCDButtons.INTERFACES = {
  welcome: {
    handlers: {
      goBtn: function () {
        this.pomlet.initialize();
      },
      otherBtn: function () {
        this.pomlet.initialize();
      }
    },
    messages: [':heart: Pomlet :heart:'],
    options: {
      goBtn: 'Press Go Btn'
    }
  },

  home: {
    handlers: {
      goBtn: function () {
        this.pomlet.play();
      },
      otherBtn: function () {
        this.pomlet.toggleType();
      },
      upBtn: function () {
        this.pomlet.addTime(60 * 1000);
      },
      downBtn: function () {
        this.pomlet.removeTime(60 * 1000);
      }
    },
    messages: function () {
      return [this.fillLine(this.pomlet.pom.type, this.timeString, 16)];
    },
    options: {
      goBtn: 'GO',
      otherBtn: 'TYPE'
    }
  },

  playing: {
    handlers: {
      goBtn: function () {
        this.pomlet.pause();
      },
      upBtn: function () {
        this.pomlet.addTime(60 * 1000);
      },
      downBtn: function () {
        this.pomlet.removeTime(60 * 1000);
      }
    },
    messages: [],
    options: {
      goBtn: 'PAUSE'
    }
  },

  paused: {
    handlers: {
      goBtn: function () { this.pomlet.play(); },
      otherBtn: function () {
        this.setInterface(LCDButtons.INTERFACES.cancelConfirm);
      },
      upBtn: function () {
        this.pomlet.addTime(60 * 1000);
      },
      downBtn: function () {
        this.pomlet.removeTime(60 * 1000);
      }
    },
    messages: function () {
      return [this.fillLine('PAUSED', `[${this.timeString}]`, 16)];
    },
    options: {
      goBtn: 'GO',
      otherBtn: 'CANCEL'
    }
  },

  cancelConfirm: {
    handlers: {
      goBtn: function () { this.pomlet.cancel(); },
      otherBtn: function () { this.rewindInterface(); }
    },
    messages: ['End current pom?'],
    options: {
      goBtn: 'YEP',
      otherBtn: 'NOPE'
    }
  },

  complete: {
    handlers: {
      goBtn: function () {
        this.pomlet.next();
      }
    },
    messages: function () {
      return [this.centerLine('All done!', 16)];
    },
    options: {
      goBtn: 'ONWARD!'
    }
  },
  metaInfo: {
    options: {
      otherBtn: 'RESET',
      goBtn: 'BACK'
    },
    handlers: {
      goBtn: function () {
        this.rewindInterface();
      },
      otherBtn: function () {
        this.pomlet.reset();
      }
    },
    messages: function () {
      return [`${this.pomlet.pomCount}/${this.pomlet.totalMinutes}m`];
    }
  }
};

LCDButtons.INPUT_POSITIONS = {
  LEFT: 0,
  RIGHT: 1,
  CENTER: 2,
  UPPER: 3
};

module.exports = LCDButtons;
