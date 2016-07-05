'use strict';
const Pom = require('./Pom');
const EventEmitter = require('events');

class Pomlet extends EventEmitter {
  constructor () {
    super();
  }
  get pomCount () {
    return this.poms.filter(pom => pom.type === 'work').length;
  }
  get remaining () {
    const remainingMS = this.pom.remaining;
    const remainingSecs = remainingMS / 1000;
    return {
      ms: remainingMS,
      minutes: Math.floor(remainingSecs / 60),
      seconds: Math.floor(remainingSecs % 60)
    };
  }
  get totalTime () {
    return 0;
  }
  initialize () {
    this.poms = new Array();
    this.playing = false;
    this.queuePom();
  }
  queuePom () {
    const pomOpts = {};
    pomOpts.type = (this.pom && this.pom.type === 'work') ? 'break' : 'work';
    const nextPom = new Pom(pomOpts);
    this.pom = nextPom;
    this.poms.push(this.pom);
    this.emit('newpom');
  }
  addTime (ms) {
    this.pom.duration += ms;
    this.pom.remaining += ms;
  }
  removeTime (ms) {
    if (this.pom.remaining < ms) return false;
    this.pom.remaining -= ms;
    this.pom.duration -= ms;
  }
  cancel () {
    this.stop();
    this.pom.cancel();
    this.emit('cancel');
    this.queuePom();
  }
  complete () {
    this.stop();
    this.emit('complete');
    this.queuePom();
  }
  play () {
    if (this.isPlaying) return;
    this.start();
    this.emit('play');
  }
  pause () {
    this.stop();
    this.emit('pause');
  }
  reset () {
    this.initialize();
  }
  start () {
    if (this.isPlaying) return;
    this._timestamp = Date.now();
    const tickFn = this.tick.bind(this);
    this.playInterval = setInterval(tickFn, 250);
    this.isPlaying = true;
  }
  stop () {
    if (!this.isPlaying) return;
    clearInterval(this.playInterval);
    this.isPlaying = false;
  }
  tick () {
    const now = Date.now();
    const changed = now - this._timestamp;
    this.pom.remaining -= changed;
    this.pom.elapsed += changed;
    this._timestamp = Date.now();
    if (this.pom.remaining <= 0) {
      this.complete();
    }
    this.emit('tick');
  }
  toggle (toggleTo) {
    // play or pause
  }
}


module.exports = Pomlet;
