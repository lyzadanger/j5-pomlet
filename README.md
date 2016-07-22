Scratching a little itch I have about simple Pomodoro timers. This code will run on:

* Arduino Uno R3 and similar Arduino boards
* Intel Edison + Arduino Breakout
* Tessel 2
* Raspberry Pi 3 (coming soon)


### Wiring

You'll need:

* 3.3V _or_ 5V basic LCD display (depending on your device's logic-level voltage)
* 5 pushbuttons
* 5 10kΩ resistors
* 1 standard LED
* 1 100Ω (3.3V devices) or 220Ω (5v devices) resistor
* 1 10kΩ potentiometer
* A breadboard or two
* A whole grip of jumper wires

## Install and Use

1. Clone/fork/download/whatever repo
1. `npm install`
1. Continue with board-specific instructions below

## Board-Specific Instructions

_Note_: The current method of swapping out `require`'d `config` modules in `main.js` is hamfisted. It got this way because of the need to run the script in contexts that might not be able to take command-line args (e.g. `t2`) but I'll make it better when I get a chance.

### Arduino-Compatible (Uno-ish) Boards

You shouldn't have to make any adjustments to code unless you use different pins than are declared in `config.js` for your components.

`node main.js`

1. `npm install`
1. Plug components in (TODO: fritzing)
1. `node main.js`

### Tessel 2

![Wiring Diagram for LCD/Buttons interface to Pomlet on Tessel 2](assets/tessel-lcd-buttons.png)

_Note_: Make sure to use a 3.3V LCD

1. You'll need the `tessel-io` I/O plugin for Johnny-Five: `npm install tessel-io`
1. Edit `main.js` to use `config-tessel.js`
1. Make sure your components are plugged into the pins declared in `config-tessel.js`
1. `t2 run main.js`

### Edison + Arduino

_Note_: To run this on an Edison, I recommend that you clone this repo _to the Edison itself_ (fortunately the default Yocto Linux on Edison comes with the `git` and the `npm` that you need).

1. You'll need the `galileo-io` I/O plugin for Johnny-Five: `npm install galileo-io`
1. Edit `main.js` to use `config-edison.js`
1. Make sure your components are plugged into the pins declared in `config-edison.js`
1. `node main.js` (run this on the Edison)
