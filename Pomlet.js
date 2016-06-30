'use strict';
const Pom = require('./Pom');
class Pomlet {
  constructor (display, inputs) {
    this.display = display;
    this.inputs = inputs;
    this.poms = new Set();
    this.poms.add(new Pom());
  }
}

module.exports = Pomlet;
