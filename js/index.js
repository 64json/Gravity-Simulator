const preset = require('./preset');
const Simulator = require('./simulator');

const simulator = new Simulator(preset);
simulator.animate();