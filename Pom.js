'use strict';
const EventEmitter = require('events');
const DURATION_DEFAULTS = {
  work: 25 * 60 * 1000,
  break: 5 * 60 * 1000,
  longBreak: 15 * 60 * 1000
};

class Pom extends EventEmitter {
  constructor (options) {
    super();
    const opts = Object.assign({}, {
      type: 'work'
    }, options);
    this.type = opts.type;
    this.state = Pom.STATES.new;
    this.duration = opts.duration || DURATION_DEFAULTS[opts.type];
    this.remaining = this.duration;
    this.elapsed = 0;
  }
  get isPlayable () {
    return (this.remaining > 0);
  }
  cancel () {
    this.state = Pom.STATES.canceled;
  }
  complete () {
    this.state = Pom.STATES.complete;
  }
}

Pom.STATES = {
  new: 0,
  active: 1,
  complete: 2,
  canceled: 3
};

module.exports = Pom;
