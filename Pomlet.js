'use strict';
const Pom = require('./Pom');
const EventEmitter = require('events');

class Pomlet extends EventEmitter {
  constructor () {
    super();
    this.poms = new Set();
  }
  cancel () {
    // Cancel the current pom
    this.pom.cancel();
    this.queuePom();
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
    this.pom.play();
    this.emit('play');
  }
  pause () {
    this.pom.pause();
    this.emit('pause');
  }
  reset () {
    // reset all POMs
    this.emit('reset');
  }
  start () {
    this.queuePom();
  }
  toggle (toggleTo) {
    if (this.pom.state !== Pom.STATES.PLAY) {
      this.play();
    } else {
      this.pause();
    }
  }
}

module.exports = Pomlet;
