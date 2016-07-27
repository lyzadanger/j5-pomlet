'use strict';
const Pom = require('./Pom');
const EventEmitter = require('events');
const moment = require('moment');

class Pomlet extends EventEmitter {
  constructor () {
    super();
    this.poms = new Array();
  }
  get pomCount () {
    return this.poms.filter(pom => pom.type === 'work').length;
  }
  get remaining () {
    const timeHolder = moment();
    const remainingMS = this.pom.remaining;
    const remainingSecs = remainingMS / 1000;
    const minutes = Math.floor(remainingSecs / 60);
    const seconds = Math.floor(remainingSecs % 60);
    timeHolder.minute(minutes);
    timeHolder.second(seconds);
    return {
      ms: remainingMS,
      minutes: minutes,
      seconds: seconds,
      moment: timeHolder
    };
  }
  get totalTime () {
    const workPoms = this.poms.filter(pom => pom.type === 'work');
    const time = workPoms.reduce((prev, curr) => {
      return prev + curr.elapsed;
    }, 0);
    return time;
  }
  get totalMinutes () {
    const totalMs = this.totalTime;
    return Math.floor(totalMs / (1000 * 60));
  }
  initialize () {
    this.pom = null;
    this.poms = new Array();
    this.playing = false;
    this.queuePom();
  }
  next () {
    this.queuePom();
  }
  queuePom () {
    const pomOpts = {};
    pomOpts.type = (this.pom && this.pom.type === 'work') ? 'break' : 'work';
    const nextPom = new Pom(pomOpts);
    this.pom = nextPom;
    this.poms.push(this.pom);
    this.emit('new');
  }
  addTime (ms) {
    this.pom.duration += ms;
    this.pom.remaining += ms;
    this.emit('timechange');
  }
  removeTime (ms) {
    if (this.pom.remaining < ms) return false;
    this.pom.remaining -= ms;
    this.pom.duration -= ms;
    this.emit('timechange');
  }
  setTime (ms) {
    const difference = ms - this.pom.remaining;
    // difference may be negative
    this.addTime(difference);
  }
  toggleType () {
    this.pom.type = (this.pom.type === 'work') ? 'break' : 'work';
    this.emit('typechange', this.pom.type);
  }
  cancel () {
    this.stop();
    this.pom.cancel();
    this.emit('cancel');
    this.queuePom();
  }
  complete () {
    this.stop();
    this.pom.complete();
    this.emit('complete');
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
    // This is the only place that should modify `elapsed`
    this.pom.elapsed += changed;
    this._timestamp = Date.now();
    if (this.pom.remaining <= 0) {
      this.complete();
      return;
    }
    this.emit('tick');
  }
  toggle (toggleTo) {
    // play or pause
  }
}


module.exports = Pomlet;
