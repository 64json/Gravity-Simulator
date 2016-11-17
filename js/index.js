const app = require('./app');
const App = require('./app/constructor');
const {extend} = $;

// set global promise error handler
RSVP.on('error', function (reason) {
  console.assert(false, reason);
});

extend(true, app, new App());

extend(true, window, {});