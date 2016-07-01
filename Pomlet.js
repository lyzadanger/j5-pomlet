'use strict';
const Pom = require('./Pom');
const EventEmitter = require('events');

class Pomlet extends EventEmitter {
  constructor () {
    super();
    this.poms = new Set();
    this.state = Pomlet.STATES.NEW;
  }
  cancel () {
    // Cancel the current pom
    this.pom.cancel();
    this.queuePom();
  }
  init () {
    this.queuePom();
    if(this.toState(Pomlet.STATES.STOP)) {
      this.emit('ready');
    }
  }
  queuePom () {
    const pomOpts = {};
    pomOpts.type = (this.pom && this.pom.type === 'work') ? 'break' : 'work';
    const nextPom = new Pom(pomOpts);
    this.pom = nextPom;
    this.poms.add(this.pom);
    this.pom.once('done', this.queuePom.bind(this));
    this.emit('pom', this.pom);
  }
  play () {
    if (!this.toState(Pomlet.STATES.PLAY)) return false;
    return this.pom.play();
  }
  pause () {
    if (!this.toState(Pomlet.STATES.PAUSE)) return false;
    return this.pom.pause();
  }
  reset () {
    // reset all POMs
    // Put in STOP state
    this.emit('reset');
  }
  toggle (toggleTo) {
    if (this.state !== Pomlet.STATES.PLAY) {
      this.play();
    } else {
      this.pause();
    }
  }
  toState (state) {
    console.log('to state', state);
    const valid = {};
    valid[Pomlet.STATES.STOP] = [Pomlet.STATES.PLAY, Pomlet.STATES.PAUSE,
      Pomlet.STATES.NEW];
    valid[Pomlet.STATES.PLAY] = [Pomlet.STATES.STOP, Pomlet.STATES.PAUSE,
      Pomlet.STATES.NEW];
    valid[Pomlet.STATES.PAUSE] = [Pomlet.STATES.PLAY];
    if (typeof valid[state] === 'undefined' ||
        !valid[state].includes(this.state)) {
      return false;
    }
    this.state = state;
    for (var key in Pomlet.STATES) {
      if (Pomlet.STATES[key] === this.state) {
        this.emit(key.toLowerCase());
        return true;
      }
    }
  }
}

Pomlet.STATES = {
  NEW: 0,
  STOP: 1,
  PLAY: 2,
  PAUSE: 3
};

module.exports = Pomlet;
