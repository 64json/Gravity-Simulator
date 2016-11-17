/**
 * Quantify - Unit Simplifier
 * @version v0.0.1
 * @author Jason Park and Rounak Bastola
 * @link https://github.com/parkjs814/Quantify
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _$ = $,
    extend = _$.extend;


module.exports = function () {};

},{}],2:[function(require,module,exports){
"use strict";

module.exports = {};

},{}],3:[function(require,module,exports){
'use strict';

var app = require('./app');
var App = require('./app/constructor');
var _$ = $,
    extend = _$.extend;

// set global promise error handler

RSVP.on('error', function (reason) {
  console.assert(false, reason);
});

extend(true, app, new App());

extend(true, window, {});

},{"./app":2,"./app/constructor":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHAvY29uc3RydWN0b3IuanMiLCJqcy9hcHAvaW5kZXguanMiLCJqcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O1NDQWlCLEM7SUFBVixNLE1BQUEsTTs7O0FBRVAsT0FBTyxPQUFQLEdBQWlCLFlBQVksQ0FFNUIsQ0FGRDs7Ozs7QUNGQSxPQUFPLE9BQVAsR0FBaUIsRUFBakI7Ozs7O0FDQUEsSUFBTSxNQUFNLFFBQVEsT0FBUixDQUFaO0FBQ0EsSUFBTSxNQUFNLFFBQVEsbUJBQVIsQ0FBWjtTQUNpQixDO0lBQVYsTSxNQUFBLE07O0FBRVA7O0FBQ0EsS0FBSyxFQUFMLENBQVEsT0FBUixFQUFpQixVQUFVLE1BQVYsRUFBa0I7QUFDakMsVUFBUSxNQUFSLENBQWUsS0FBZixFQUFzQixNQUF0QjtBQUNELENBRkQ7O0FBSUEsT0FBTyxJQUFQLEVBQWEsR0FBYixFQUFrQixJQUFJLEdBQUosRUFBbEI7O0FBRUEsT0FBTyxJQUFQLEVBQWEsTUFBYixFQUFxQixFQUFyQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCB7ZXh0ZW5kfSA9ICQ7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge307IiwiY29uc3QgYXBwID0gcmVxdWlyZSgnLi9hcHAnKTtcbmNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vYXBwL2NvbnN0cnVjdG9yJyk7XG5jb25zdCB7ZXh0ZW5kfSA9ICQ7XG5cbi8vIHNldCBnbG9iYWwgcHJvbWlzZSBlcnJvciBoYW5kbGVyXG5SU1ZQLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgY29uc29sZS5hc3NlcnQoZmFsc2UsIHJlYXNvbik7XG59KTtcblxuZXh0ZW5kKHRydWUsIGFwcCwgbmV3IEFwcCgpKTtcblxuZXh0ZW5kKHRydWUsIHdpbmRvdywge30pOyJdfQ==

//# sourceMappingURL=gravity simulator.js.map