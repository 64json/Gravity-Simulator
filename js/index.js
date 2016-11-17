const app = require('./app');
const App = require('./app/constructor');
const preset = require('./preset');
const Simulator = require('./simulator');
const {extend} = $;

// set global promise error handler
RSVP.on('error', function (reason) {
    console.assert(false, reason);
});

extend(true, app, new App());

const simulator = Simulator(preset.DEFAULT);
simulator.animate();

extend(true, window, {});