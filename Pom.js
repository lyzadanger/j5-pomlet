'use strict';
const DURATION_DEFAULTS = {
  work: 25,
  break: 5,
  longBreak: 15
};

const DEFAULTS = {
  type: 'work'
};

class Pom {
  constructor (options) {
    const opts = Object.assign({}, DEFAULTS, options);
    this.type = opts.type;
    this.duration = opts.duration || DURATION_DEFAULTS[opts.type];
    this.active = false;
    this.remaining = this.duration;
  }
}

module.exports = Pom;
