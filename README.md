Scratching a little itch I have about simple Pomodoro timers. This code will run on:

* Arduino Uno R3 and similar Arduino boards
* Intel Edison + Arduino Breakout
* Tessel 2
* Raspberry Pi 3 (coming soon)

## Install and Use

1. Clone/fork/download/whatever repo
1. `npm install`
1. Continue with board-specific instructions below

### Board-Specific Instructions

#### Arduino-Compatible (Uno-ish) Boards

You shouldn't have to make any adjustments to code unless you use different pins than are declared in `config.js` for your components.

`node main.js`

1. `npm install`
1. Plug components in (TODO: fritzing)
1. `node main.js`

#### Tessel 2

1. You'll need the `tessel-io` I/O plugin for Johnny-Five: `npm install tessel-io`
1. Edit `main.js` to use `config-tessel.js`
1. Make sure your components are plugged into the pins declared in `config-tessel.js`
1. `t2 run main.js`

#### Edison + Arduino

_Note_: To run this on an Edison, I recommend that you clone this repo _to the Edison itself_ (fortunately the default Yocto Linux on Edison comes with the `git` and the `npm` that you need).

1. You'll need the `galileo-io` I/O plugin for Johnny-Five: `npm install galileo-io`
1. Edit `main.js` to use `config-edison.js`
1. Make sure your components are plugged into the pins declared in `config-edison.js`
1. `node main.js` (on the Edison)

### Wiring

You'll need:

* 5V basic LCD display
* 5 pushbuttons
* 5 10kΩ resistors
* 1 LED
* 1 220Ω resistor
* 1 10kΩ potentiometer
* A breadboard or two
* A whole grip of jumper wires
