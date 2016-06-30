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
      type: 'work',
      state: Pom.STATES.NEW
    }, options);
    this.type = opts.type;
    this.duration = opts.duration || DURATION_DEFAULTS[opts.type];
    this.remaining = this.duration;
    this.elapsed = 0;
    this.cycles = 0;
  }
  cancel () {
    this.pause();
    this.toState(Pom.STATE.CANCELED);
  }
  done () {
    this.toState(Pom.STATES.DONE);
  }
  pause () {
    if (!this.toState(Pom.STATES.PAUSE)) return false;
    this.cycles++;
    clearInterval(this.timer);
  }
  play () {
    if (!this.toState(Pom.STATES.PLAY)) return false;
    this._timestamp = Date.now();
    this.timer = setInterval(this.tick.bind(this), 250);
  }
  toState (state) {
    const valid = {};
    valid[Pom.STATES.NEW] = [];
    valid[Pom.STATES.PLAY] = [Pom.STATES.NEW, Pom.STATES.PAUSE];
    valid[Pom.STATES.PAUSE] = [Pom.STATES.PLAY];
    valid[Pom.STATES.CANCELED] = [Pom.STATES.NEW,
      Pom.STATES.PLAY, Pom.STATES.PAUSE];
    valid[Pom.STATES.DONE] = [Pom.STATES.PLAY];
    if (typeof valid[state] === 'undefined' ||
        !valid[state].includes(this.state)) {
      return false;
    }
    this.state = state;
    for (var key in Pom.STATES) {
      if (Pom.STATES[key] === this.state) {
        this.emit(key.toLowerCase());
        return true;
      }
    }
  }
  tick () {
    const now = Date.now();
    const change = now - this._timestamp;
    this.elapsed += change;
    this.remaining -= change;
    this._timestamp = Date.now();
    if (this.remaining <= 0) {
      this.done();
    } else {
      this.emit('tick');
    }
  }
}

Pom.STATES = {
  NEW: 0,
  PLAY: 1,
  PAUSE: 2,
  CANCELED: 3,
  DONE: 4
};

module.exports = Pom;
