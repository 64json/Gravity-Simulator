/**
 * Gravity Simulator - Universal Gravity and Elastic Collision Simulator
 * @version v0.0.1
 * @author Jason Park
 * @link https://github.com/parkjs814/Gravity-Simulator
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var presets = require('./preset');
var Simulator = require('./simulator');

var simulator = new Simulator();
var selected = 1;
simulator.init(presets[selected]);

var $select = $('select');
for (var i = 0; i < presets.length; i++) {
    var preset = presets[i];
    $select.append('<option value="' + i + '"' + (i == selected ? ' selected' : '') + '>' + preset.prototype.title + '</option>');
}
$select.change(function () {
    selected = parseInt($select.find(':selected').val());
    simulator.init(presets[selected]);
});
$select.focus(function () {
    $select.blur();
});
$('#reset').click(function () {
    simulator.init(presets[selected]);
});

var $moving = null;
var px = void 0,
    py = void 0;

$('body').on('mousedown', '.control-box .title-bar', function (e) {
    px = e.pageX;
    py = e.pageY;
    $moving = $(this).parent('.control-box');
    $moving.nextUntil('.control-box.template').insertBefore($moving);
    return false;
});

$('body').mousemove(function (e) {
    if (!$moving) return;
    var x = e.pageX;
    var y = e.pageY;
    $moving.css('left', parseInt($moving.css('left')) + (x - px) + 'px');
    $moving.css('top', parseInt($moving.css('top')) + (y - py) + 'px');
    px = e.pageX;
    py = e.pageY;
});

$('body').mouseup(function (e) {
    $moving = null;
});

},{"./preset":2,"./simulator":10}],2:[function(require,module,exports){
'use strict';

var _$ = $,
    extend = _$.extend;


function EMPTY_2D(c) {
    return extend(true, c, {
        BACKGROUND: 'white',
        DIMENSION: 2,
        MAX_PATHS: 1000,
        CAMERA_COORD_STEP: 5,
        CAMERA_ANGLE_STEP: 1,
        CAMERA_ACCELERATION: 1.1,
        G: 0.1,
        MASS_MIN: 1,
        MASS_MAX: 4e4,
        VELOCITY_MAX: 10,
        DIRECTION_LENGTH: 50,
        CAMERA_DISTANCE: 100
    });
}
EMPTY_2D.prototype.title = '2D Gravity Simulator';

function EMPTY_3D(c) {
    return extend(true, EMPTY_2D(c), {
        DIMENSION: 3,
        G: 0.001,
        MASS_MIN: 1,
        MASS_MAX: 8e6,
        VELOCITY_MAX: 10
    });
}
EMPTY_3D.prototype.title = '3D Gravity Simulator';

function DEBUG(c) {
    return extend(true, EMPTY_3D(c), {
        init: function init(engine) {
            engine.createObject('ball1', [-150, 0, 0], 1000000, [0, 0, 0], 'green');
            engine.createObject('ball2', [50, 0, 0], 10000, [0, 0, 0], 'blue');
            engine.toggleAnimating();
        }
    });
}
DEBUG.prototype.title = 'DEBUG';

module.exports = [EMPTY_2D, EMPTY_3D, DEBUG];

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InvisibleError = require('../error/invisible');

var _require = require('../util'),
    deg2rad = _require.deg2rad,
    rotate = _require.rotate,
    now = _require.now,
    getRotationMatrix = _require.getRotationMatrix;

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub,
    mul = _require2.mul,
    div = _require2.div,
    dot = _require2.dot;

var pow = Math.pow;

var Camera2D = function () {
    function Camera2D(config, engine) {
        _classCallCheck(this, Camera2D);

        this.config = config;
        this.x = 0;
        this.y = 0;
        this.z = config.CAMERA_DISTANCE;
        this.phi = 0;
        this.engine = engine;
        this.lastTime = 0;
        this.lastKey = null;
        this.combo = 0;
        this.resize();
    }

    _createClass(Camera2D, [{
        key: 'resize',
        value: function resize() {
            this.center = [this.config.W / 2, this.config.H / 2];
        }
    }, {
        key: 'getCoordStep',
        value: function getCoordStep(key) {
            var currentTime = now();
            if (key == this.lastKey && currentTime - this.lastTime < 1) {
                this.combo += 1;
            } else {
                this.combo = 0;
            }
            this.lastTime = currentTime;
            this.lastKey = key;
            return this.config.CAMERA_COORD_STEP * pow(this.config.CAMERA_ACCELERATION, this.combo);
        }
    }, {
        key: 'up',
        value: function up(key) {
            this.y -= this.getCoordStep(key);
            this.refresh();
        }
    }, {
        key: 'down',
        value: function down(key) {
            this.y += this.getCoordStep(key);
            this.refresh();
        }
    }, {
        key: 'left',
        value: function left(key) {
            this.x -= this.getCoordStep(key);
            this.refresh();
        }
    }, {
        key: 'right',
        value: function right(key) {
            this.x += this.getCoordStep(key);
            this.refresh();
        }
    }, {
        key: 'zoomIn',
        value: function zoomIn(key) {
            this.z -= this.getCoordStep(key);
            this.refresh();
        }
    }, {
        key: 'zoomOut',
        value: function zoomOut(key) {
            this.z += this.getCoordStep(key);
            this.refresh();
        }
    }, {
        key: 'rotateLeft',
        value: function rotateLeft(key) {
            this.phi -= this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'rotateRight',
        value: function rotateRight(key) {
            this.phi += this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'refresh',
        value: function refresh() {}
    }, {
        key: 'getZoom',
        value: function getZoom() {
            var z = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            var distance = this.z - z;
            if (distance <= 0) {
                throw new InvisibleError();
            }
            return this.config.CAMERA_DISTANCE / distance;
        }
    }, {
        key: 'adjustCoords',
        value: function adjustCoords(c) {
            var R = getRotationMatrix(deg2rad(this.phi));
            c = rotate(c, R);
            var zoom = this.getZoom();
            var coords = add(this.center, mul(sub(c, [this.x, this.y]), zoom));
            return { coords: coords };
        }
    }, {
        key: 'adjustRadius',
        value: function adjustRadius(coords, radius) {
            var zoom = this.getZoom();
            return radius * zoom;
        }
    }, {
        key: 'actualPoint',
        value: function actualPoint(x, y) {
            var R_ = getRotationMatrix(deg2rad(this.phi), -1);
            var zoom = this.getZoom();
            return rotate(add(div(sub([x, y], this.center), zoom), [this.x, this.y]), R_);
        }
    }]);

    return Camera2D;
}();

module.exports = Camera2D;

},{"../error/invisible":9,"../matrix":11,"../util":14}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Camera2D = require('./2d');

var _require = require('../util'),
    deg2rad = _require.deg2rad,
    rotate = _require.rotate,
    getXRotationMatrix = _require.getXRotationMatrix,
    getYRotationMatrix = _require.getYRotationMatrix;

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub,
    mul = _require2.mul,
    div = _require2.div,
    dot = _require2.dot;

var Camera3D = function (_Camera2D) {
    _inherits(Camera3D, _Camera2D);

    function Camera3D(config, engine) {
        _classCallCheck(this, Camera3D);

        var _this = _possibleConstructorReturn(this, (Camera3D.__proto__ || Object.getPrototypeOf(Camera3D)).call(this, config, engine));

        _this.theta = 0;
        return _this;
    }

    _createClass(Camera3D, [{
        key: 'rotateUp',
        value: function rotateUp(key) {
            this.theta -= this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'rotateDown',
        value: function rotateDown(key) {
            this.theta += this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'rotatedCoords',
        value: function rotatedCoords(c) {
            var Rx = getXRotationMatrix(deg2rad(this.theta));
            var Ry = getYRotationMatrix(deg2rad(this.phi));
            return rotate(rotate(c, Rx), Ry);
        }
    }, {
        key: 'adjustCoords',
        value: function adjustCoords(c) {
            c = this.rotatedCoords(c);
            var z = c.pop();
            var zoom = this.getZoom(z);
            var coords = add(this.center, mul(sub(c, [this.x, this.y]), zoom));
            return { coords: coords, z: z };
        }
    }, {
        key: 'adjustRadius',
        value: function adjustRadius(c, radius) {
            c = this.rotatedCoords(c);
            var z = c.pop();
            var zoom = this.getZoom(z);
            return radius * zoom;
        }
    }, {
        key: 'actualPoint',
        value: function actualPoint(x, y) {
            var Rx_ = getXRotationMatrix(deg2rad(this.theta), -1);
            var Ry_ = getYRotationMatrix(deg2rad(this.phi), -1);
            var c = add(sub([x, y], this.center), [this.x, this.y]).concat(this.z - this.config.CAMERA_DISTANCE);
            return rotate(rotate(c, Ry_), Rx_);
        }
    }]);

    return Camera3D;
}(Camera2D);

module.exports = Camera3D;

},{"../matrix":11,"../util":14,"./2d":3}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBox = function () {
    function ControlBox(title, controllers, x, y) {
        _classCallCheck(this, ControlBox);

        var $templateControlBox = $('.control-box.template');
        var $controlBox = $templateControlBox.clone();
        $controlBox.removeClass('template');
        $controlBox.find('.title').text(title);
        var $inputContainer = $controlBox.find('.input-container');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = controllers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var controller = _step.value;

                $inputContainer.append(controller.$inputWrapper);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        $controlBox.find('.close').click(function () {
            $controlBox.remove();
        });
        $controlBox.insertBefore($templateControlBox);
        $controlBox.css('left', x + 'px');
        $controlBox.css('top', y + 'px');

        this.$controlBox = $controlBox;
    }

    _createClass(ControlBox, [{
        key: 'close',
        value: function close() {
            this.$controlBox.remove();
        }
    }, {
        key: 'isOpen',
        value: function isOpen() {
            return this.$controlBox[0].parentNode;
        }
    }]);

    return ControlBox;
}();

module.exports = ControlBox;

},{}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controller = function () {
    function Controller(object, name, min, max, value, func) {
        var _this = this;

        _classCallCheck(this, Controller);

        var $inputWrapper = this.$inputWrapper = $('.control-box.template .input-wrapper.template').clone();
        $inputWrapper.removeClass('template');
        $inputWrapper.find('.name').text(name);
        var $input = this.$input = $inputWrapper.find('input');
        $input.attr('min', min);
        $input.attr('max', max);
        $input.attr('value', value);
        $input.attr('step', 0.01);
        var $value = $inputWrapper.find('.value');
        $value.text(this.get());
        $input.on('input', function (e) {
            $value.text(_this.get());
            func.call(object, e);
        });
    }

    _createClass(Controller, [{
        key: 'get',
        value: function get() {
            return parseFloat(this.$input.val());
        }
    }]);

    return Controller;
}();

module.exports = Controller;

},{}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Circle = require('../object/circle');
var Camera2D = require('../camera/2d');

var _require = require('../util'),
    rotate = _require.rotate,
    now = _require.now,
    random = _require.random,
    polar2cartesian = _require.polar2cartesian,
    randColor = _require.randColor,
    _getRotationMatrix = _require.getRotationMatrix,
    cartesian2auto = _require.cartesian2auto,
    skipInvisibleError = _require.skipInvisibleError;

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub,
    mul = _require2.mul;

var min = Math.min,
    max = Math.max;

var Path = function Path(obj) {
    _classCallCheck(this, Path);

    this.prevPos = obj.prevPos.slice();
    this.pos = obj.pos.slice();
};

var Engine2D = function () {
    function Engine2D(config, ctx) {
        _classCallCheck(this, Engine2D);

        this.config = config;
        this.ctx = ctx;
        this.objs = [];
        this.animating = false;
        this.controlBoxes = [];
        this.paths = [];
        this.camera = new Camera2D(config, this);
        this.fpsLastTime = now();
        this.fpsCount = 0;
    }

    _createClass(Engine2D, [{
        key: 'toggleAnimating',
        value: function toggleAnimating() {
            this.animating = !this.animating;
            document.title = this.config.TITLE + ' (' + (this.animating ? "Simulating" : "Paused") + ')';
        }
    }, {
        key: 'destroyControlBoxes',
        value: function destroyControlBoxes() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.controlBoxes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var controlBox = _step.value;

                    controlBox.close();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.controlBoxes = [];
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.ctx = null;
            this.destroyControlBoxes();
        }
    }, {
        key: 'animate',
        value: function animate() {
            var _this = this;

            if (!this.ctx) return;
            this.printFps();
            if (this.animating) {
                this.calculateAll();
            }
            this.redrawAll();
            setTimeout(function () {
                _this.animate();
            }, 10);
        }
    }, {
        key: 'objectCoords',
        value: function objectCoords(obj) {
            var r = this.camera.adjustRadius(obj.pos, obj.getRadius());

            var _camera$adjustCoords = this.camera.adjustCoords(obj.pos),
                coords = _camera$adjustCoords.coords,
                z = _camera$adjustCoords.z;

            return coords.concat(r).concat(z);
        }
    }, {
        key: 'directionCoords',
        value: function directionCoords(obj) {
            var factor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.config.DIRECTION_LENGTH;

            var _camera$adjustCoords2 = this.camera.adjustCoords(obj.pos),
                c1 = _camera$adjustCoords2.coords;

            var _camera$adjustCoords3 = this.camera.adjustCoords(add(obj.pos, mul(obj.v, factor))),
                c2 = _camera$adjustCoords3.coords,
                z = _camera$adjustCoords3.z;

            return c1.concat(c2).concat(z);
        }
    }, {
        key: 'pathCoords',
        value: function pathCoords(obj) {
            var _camera$adjustCoords4 = this.camera.adjustCoords(obj.prevPos),
                c1 = _camera$adjustCoords4.coords;

            var _camera$adjustCoords5 = this.camera.adjustCoords(obj.pos),
                c2 = _camera$adjustCoords5.coords,
                z = _camera$adjustCoords5.z;

            return c1.concat(c2).concat(z);
        }
    }, {
        key: 'drawObject',
        value: function drawObject(c) {
            var _this2 = this;

            var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            skipInvisibleError(function () {
                color = color || c.color;
                if (c instanceof Circle) {
                    c = _this2.objectCoords(c);
                }
                _this2.ctx.beginPath();
                _this2.ctx.arc(c[0], c[1], c[2], 0, 2 * Math.PI, false);
                _this2.ctx.fillStyle = color;
                _this2.ctx.fill();
            });
        }
    }, {
        key: 'drawDirection',
        value: function drawDirection(c) {
            var _this3 = this;

            skipInvisibleError(function () {
                if (c instanceof Circle) {
                    c = _this3.directionCoords(c);
                }
                _this3.ctx.beginPath();
                _this3.ctx.moveTo(c[0], c[1]);
                _this3.ctx.lineTo(c[2], c[3]);
                _this3.ctx.strokeStyle = '#000000';
                _this3.ctx.stroke();
            });
        }
    }, {
        key: 'drawPath',
        value: function drawPath(c) {
            var _this4 = this;

            skipInvisibleError(function () {
                if (c instanceof Path) {
                    c = _this4.pathCoords(c);
                }
                _this4.ctx.beginPath();
                _this4.ctx.moveTo(c[0], c[1]);
                _this4.ctx.lineTo(c[2], c[3]);
                _this4.ctx.strokeStyle = '#dddddd';
                _this4.ctx.stroke();
            });
        }
    }, {
        key: 'createPath',
        value: function createPath(obj) {
            if (mag(sub(obj.pos, obj.prevPos)) > 5) {
                this.paths.push(new Path(obj));
                obj.prevPos = obj.pos.slice();
                if (this.paths.length > this.config.MAX_PATHS) {
                    this.paths = this.paths.slice(1);
                }
            }
        }
    }, {
        key: 'userCreateObject',
        value: function userCreateObject(x, y) {
            var pos = this.camera.actualPoint(x, y);
            var maxR = Circle.getRadiusFromMass(this.config.MASS_MAX);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _obj = _step2.value;

                    maxR = min(maxR, (mag(sub(_obj.pos, pos)) - _obj.getRadius()) / 1.5);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var m = Circle.getMassFromRadius(random(Circle.getRadiusFromMass(this.config.MASS_MIN), maxR));
            var v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
            var color = randColor();
            var tag = 'circle' + this.objs.length;
            var obj = new Circle(this.config, m, pos, v, color, tag, this);
            obj.showControlBox(x, y);
            this.objs.push(obj);
        }
    }, {
        key: 'createObject',
        value: function createObject(tag, pos, m, v, color) {
            var obj = new Circle(this.config, m, pos, v, color, tag, this);
            this.objs.push(obj);
        }
    }, {
        key: 'getRotationMatrix',
        value: function getRotationMatrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return _getRotationMatrix(angles[0], dir);
        }
    }, {
        key: 'getPivotAxis',
        value: function getPivotAxis() {
            return 0;
        }
    }, {
        key: 'collideElastically',
        value: function collideElastically() {
            var dimension = this.config.DIMENSION;
            for (var i = 0; i < this.objs.length; i++) {
                var o1 = this.objs[i];
                for (var j = i + 1; j < this.objs.length; j++) {
                    var o2 = this.objs[j];
                    var collision = sub(o2.pos, o1.pos);
                    var angles = cartesian2auto(collision);
                    var d = angles.shift();

                    if (d < o1.getRadius() + o2.getRadius()) {
                        var R = this.getRotationMatrix(angles);
                        var R_ = this.getRotationMatrix(angles, -1);
                        var _i = this.getPivotAxis();

                        var vTemp = [rotate(o1.v, R), rotate(o2.v, R)];
                        var vFinal = [vTemp[0].slice(), vTemp[1].slice()];
                        vFinal[0][_i] = ((o1.m - o2.m) * vTemp[0][_i] + 2 * o2.m * vTemp[1][_i]) / (o1.m + o2.m);
                        vFinal[1][_i] = ((o2.m - o1.m) * vTemp[1][_i] + 2 * o1.m * vTemp[0][_i]) / (o1.m + o2.m);
                        o1.v = rotate(vFinal[0], R_);
                        o2.v = rotate(vFinal[1], R_);

                        var posTemp = [zeros(dimension), rotate(collision, R)];
                        posTemp[0][_i] += vFinal[0][_i];
                        posTemp[1][_i] += vFinal[1][_i];
                        o1.pos = add(o1.pos, rotate(posTemp[0], R_));
                        o2.pos = add(o1.pos, rotate(posTemp[1], R_));
                    }
                }
            }
        }
    }, {
        key: 'calculateAll',
        value: function calculateAll() {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var obj = _step3.value;

                    obj.calculateVelocity();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            this.collideElastically();
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.objs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _obj2 = _step4.value;

                    _obj2.calculatePosition();
                    this.createPath(_obj2);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: 'redrawAll',
        value: function redrawAll() {
            this.ctx.clearRect(0, 0, this.config.W, this.config.H);
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.objs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var obj = _step5.value;

                    this.drawObject(obj);
                    this.drawDirection(obj);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.paths[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var path = _step6.value;

                    this.drawPath(path);
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }
    }, {
        key: 'printFps',
        value: function printFps() {
            this.fpsCount += 1;
            var currentTime = now();
            var timeDiff = currentTime - this.fpsLastTime;
            if (timeDiff > 1) {
                console.log((this.fpsCount / timeDiff | 0) + ' fps');
                this.fpsLastTime = currentTime;
                this.fpsCount = 0;
            }
        }
    }]);

    return Engine2D;
}();

module.exports = Engine2D;

},{"../camera/2d":3,"../matrix":11,"../object/circle":12,"../util":14}],8:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Engine2D = require('./2d');
var Camera3D = require('../camera/3d');
var Sphere = require('../object/sphere');

var _require = require('../util'),
    random = _require.random,
    getYRotationMatrix = _require.getYRotationMatrix,
    getZRotationMatrix = _require.getZRotationMatrix,
    randColor = _require.randColor,
    spherical2cartesian = _require.spherical2cartesian,
    skipInvisibleError = _require.skipInvisibleError;

var _require2 = require('../matrix'),
    mag = _require2.mag,
    sub = _require2.sub,
    dot = _require2.dot;

var min = Math.min;

var Engine3D = function (_Engine2D) {
    _inherits(Engine3D, _Engine2D);

    function Engine3D(config, ctx) {
        _classCallCheck(this, Engine3D);

        var _this = _possibleConstructorReturn(this, (Engine3D.__proto__ || Object.getPrototypeOf(Engine3D)).call(this, config, ctx));

        _this.camera = new Camera3D(config, _this);
        return _this;
    }

    _createClass(Engine3D, [{
        key: 'directionCoords',
        value: function directionCoords(obj) {
            var c = this.camera.rotatedCoords(obj.pos);
            var adjustedFactor = (this.camera.z - c[2] - 1) / obj.v[2];
            var factor = this.config.DIRECTION_LENGTH;
            if (adjustedFactor > 0) factor = min(factor, adjustedFactor);
            return _get(Engine3D.prototype.__proto__ || Object.getPrototypeOf(Engine3D.prototype), 'directionCoords', this).call(this, obj, factor);
        }
    }, {
        key: 'userCreateObject',
        value: function userCreateObject(x, y) {
            var pos = this.camera.actualPoint(x, y);
            var maxR = Sphere.getRadiusFromMass(this.config.MASS_MAX);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _obj = _step.value;

                    maxR = min(maxR, (mag(sub(_obj.pos, pos)) - _obj.getRadius()) / 1.5);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var m = Sphere.getMassFromRadius(random(Sphere.getRadiusFromMass(this.config.MASS_MIN), maxR));
            var v = spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180));
            var color = randColor();
            var tag = 'sphere' + this.objs.length;
            var obj = new Sphere(this.config, m, pos, v, color, tag, this);
            obj.showControlBox(x, y);
            this.objs.push(obj);
        }
    }, {
        key: 'createObject',
        value: function createObject(tag, pos, m, v, color) {
            var obj = new Sphere(this.config, m, pos, v, color, tag, this);
            this.objs.push(obj);
        }
    }, {
        key: 'getRotationMatrix',
        value: function getRotationMatrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return dot(getZRotationMatrix(angles[0], dir), getYRotationMatrix(angles[1], dir), dir);
        }
    }, {
        key: 'getPivotAxis',
        value: function getPivotAxis() {
            return 2;
        }
    }, {
        key: 'redrawAll',
        value: function redrawAll() {
            var _this2 = this;

            this.ctx.clearRect(0, 0, this.config.W, this.config.H);
            var orders = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                var _loop = function _loop() {
                    var obj = _step2.value;

                    skipInvisibleError(function () {
                        var coords = _this2.objectCoords(obj);
                        var z = coords.pop();
                        orders.push(['object', coords, z, obj.color]);
                    });
                };

                for (var _iterator2 = this.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    _loop();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                var _loop2 = function _loop2() {
                    var obj = _step3.value;

                    skipInvisibleError(function () {
                        var coords = _this2.directionCoords(obj);
                        var z = coords.pop();
                        orders.push(['direction', coords, z]);
                    });
                };

                for (var _iterator3 = this.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    _loop2();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                var _loop3 = function _loop3() {
                    var path = _step4.value;

                    skipInvisibleError(function () {
                        var coords = _this2.pathCoords(path);
                        var z = coords.pop();
                        orders.push(['path', coords, z]);
                    });
                };

                for (var _iterator4 = this.paths[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    _loop3();
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            orders.sort(function (a, b) {
                return a[2] - b[2];
            });
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = orders[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _step5$value = _slicedToArray(_step5.value, 4),
                        type = _step5$value[0],
                        coords = _step5$value[1],
                        z = _step5$value[2],
                        color = _step5$value[3];

                    switch (type) {
                        case 'object':
                            this.drawObject(coords, color);
                            break;
                        case 'direction':
                            this.drawDirection(coords);
                            break;
                        case 'path':
                            this.drawPath(coords);
                            break;
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
    }]);

    return Engine3D;
}(Engine2D);

module.exports = Engine3D;

},{"../camera/3d":4,"../matrix":11,"../object/sphere":13,"../util":14,"./2d":7}],9:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        cls.apply(this, arguments);
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

var InvisibleError = function (_extendableBuiltin2) {
    _inherits(InvisibleError, _extendableBuiltin2);

    function InvisibleError(message) {
        _classCallCheck(this, InvisibleError);

        return _possibleConstructorReturn(this, (InvisibleError.__proto__ || Object.getPrototypeOf(InvisibleError)).call(this, message));
    }

    return InvisibleError;
}(_extendableBuiltin(Error));

module.exports = InvisibleError;

},{}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Engine2D = require('./engine/2d');
var Engine3D = require('./engine/3d');

var _require = require('./util'),
    getDistance = _require.getDistance,
    skipInvisibleError = _require.skipInvisibleError;

var config = null;
var keymap = {
    38: 'up',
    40: 'down',
    37: 'left',
    39: 'right',
    90: 'zoomIn', // z
    88: 'zoomOut', // x
    87: 'rotateUp', // w
    83: 'rotateDown', // s
    65: 'rotateLeft', // a
    68: 'rotateRight' // d
};

function onResize(engine, $canvas) {
    config.W = $canvas[0].width = $canvas.width();
    config.H = $canvas[0].height = $canvas.height();
    if (engine) engine.camera.resize();
}

function onClick(event, engine) {
    var x = event.pageX;
    var y = event.pageY;
    if (!engine.animating) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            var _loop = function _loop() {
                var obj = _step.value;

                if (skipInvisibleError(function () {
                    var _engine$objectCoords = engine.objectCoords(obj),
                        _engine$objectCoords2 = _slicedToArray(_engine$objectCoords, 3),
                        cx = _engine$objectCoords2[0],
                        cy = _engine$objectCoords2[1],
                        r = _engine$objectCoords2[2];

                    if (getDistance(cx, cy, x, y) < r) {
                        obj.showControlBox(x, y);
                        return true;
                    }
                })) return {
                        v: void 0
                    };
            };

            for (var _iterator = engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _ret = _loop();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        engine.userCreateObject(x, y);
    }
}

function onKeyDown(event, engine) {
    var keyCode = event.keyCode;

    if (keyCode == 32) {
        // space bar
        engine.destroyControlBoxes();
        console.log('a');
        engine.toggleAnimating();
    } else if (keyCode in keymap && keymap[keyCode] in engine.camera) {
        engine.camera[keymap[keyCode]](keyCode);
    }
}

var Simulator = function () {
    function Simulator() {
        var _this = this;

        _classCallCheck(this, Simulator);

        this.$canvas = $('canvas');
        this.ctx = this.$canvas[0].getContext('2d');
        $(window).resize(function (e) {
            onResize(_this.engine, _this.$canvas);
        });
        this.$canvas.click(function (e) {
            onClick(e, _this.engine);
        });
        $('body').keydown(function (e) {
            onKeyDown(e, _this.engine);
        });
    }

    _createClass(Simulator, [{
        key: 'init',
        value: function init(preset) {
            if (this.engine) this.engine.destroy();
            config = preset({});
            document.title = config.TITLE = preset.prototype.title;
            onResize(this.engine, this.$canvas);
            this.engine = new (config.DIMENSION == 2 ? Engine2D : Engine3D)(config, this.ctx);
            if ('init' in config) config.init(this.engine);
            this.engine.animate();
        }
    }]);

    return Simulator;
}();

module.exports = Simulator;

},{"./engine/2d":7,"./engine/3d":8,"./util":14}],11:[function(require,module,exports){
"use strict";

function iter(a, func) {
    var a_r = a.length;
    var m = new Array(a_r);
    for (var i = 0; i < a_r; i++) {
        m[i] = func(i);
    }
    return m;
}

module.exports = {
    zeros: function zeros(N) {
        return new Array(N).fill(0);
    },

    mag: function mag(a) {
        var a_r = a.length;
        var sum = 0;
        for (var i = 0; i < a_r; i++) {
            sum += a[i] * a[i];
        }
        return Math.sqrt(sum);
    },

    add: function add(a, b) {
        return iter(a, function (i) {
            return a[i] + b[i];
        });
    },

    sub: function sub(a, b) {
        return iter(a, function (i) {
            return a[i] - b[i];
        });
    },

    mul: function mul(a, b) {
        return iter(a, function (i) {
            return a[i] * b;
        });
    },

    div: function div(a, b) {
        return iter(a, function (i) {
            return a[i] / b;
        });
    },

    dot: function dot(a, b) {
        var dir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

        if (dir == -1) {
            var _ref = [b, a];
            a = _ref[0];
            b = _ref[1];
        }
        var a_r = a.length;
        var a_c = a[0].length;
        var b_c = b[0].length;
        var m = new Array(a_r);
        for (var r = 0; r < a_r; r++) {
            m[r] = new Array(b_c);
            for (var c = 0; c < b_c; c++) {
                m[r][c] = 0;
                for (var i = 0; i < a_c; i++) {
                    m[r][c] += a[r][i] * b[i][c];
                }
            }
        }
        return m;
    }
};

},{}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBox = require('../control/control_box');
var Controller = require('../control/controller');

var _require = require('../util'),
    rad2deg = _require.rad2deg,
    deg2rad = _require.deg2rad,
    polar2cartesian = _require.polar2cartesian,
    cartesian2auto = _require.cartesian2auto,
    square = _require.square;

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub,
    mul = _require2.mul,
    div = _require2.div;

var max = Math.max,
    pow = Math.pow;

var Circle = function () {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    function Circle(config, m, pos, v, color, tag, engine) {
        _classCallCheck(this, Circle);

        this.config = config;
        this.m = m;
        this.pos = pos;
        this.prevPos = pos.slice();
        this.v = v;
        this.color = color;
        this.tag = tag;
        this.engine = engine;

        this.controlBox = null;
    }

    _createClass(Circle, [{
        key: 'getRadius',
        value: function getRadius() {
            return Circle.getRadiusFromMass(this.m);
        }
    }, {
        key: 'calculateVelocity',
        value: function calculateVelocity() {
            var F = zeros(this.config.DIMENSION);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var obj = _step.value;

                    if (obj == this) continue;
                    var vector = sub(this.pos, obj.pos);
                    var magnitude = mag(vector);
                    var unitVector = div(vector, magnitude);
                    F = add(F, mul(unitVector, obj.m / square(magnitude)));
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            F = mul(F, -this.config.G * this.m);
            var a = div(F, this.m);
            this.v = add(this.v, a);
        }
    }, {
        key: 'calculatePosition',
        value: function calculatePosition() {
            this.pos = add(this.pos, this.v);
        }
    }, {
        key: 'controlM',
        value: function controlM(e) {
            var m = this.mController.get();
            this.m = m;
        }
    }, {
        key: 'controlPos',
        value: function controlPos(e) {
            var x = this.posXController.get();
            var y = this.posYController.get();
            this.pos = [x, y];
        }
    }, {
        key: 'controlV',
        value: function controlV(e) {
            var rho = this.vRhoController.get();
            var phi = deg2rad(this.vPhiController.get());
            this.v = polar2cartesian(rho, phi);
        }
    }, {
        key: 'showControlBox',
        value: function showControlBox(x, y) {
            if (this.controlBox && this.controlBox.isOpen()) {
                var $controlBox = this.controlBox.$controlBox;
                $controlBox.css('left', x + 'px');
                $controlBox.css('top', y + 'px');
                $controlBox.nextUntil('.control-box.template').insertBefore($controlBox);
            } else {
                var margin = 1.5;

                var posRange = max(max(this.config.W, this.config.H) / 2, max.apply(null, this.pos.map(Math.abs)) * margin);
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.engine.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var obj = _step2.value;

                        posRange = max(posRange, max.apply(null, obj.pos.map(Math.abs)) * margin);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                var m = this.m;

                var v = cartesian2auto(this.v);
                var vRange = max(this.config.VELOCITY_MAX, mag(this.v) * margin);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.engine.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _obj = _step3.value;

                        vRange = max(vRange, mag(_obj.v) * margin);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                this.setup_controllers(posRange, m, v, vRange);
                this.controlBox = new ControlBox(this.tag, this.getControllers(), x, y);
                this.engine.controlBoxes.push(this.controlBox);
            }
        }
    }, {
        key: 'setup_controllers',
        value: function setup_controllers(posRange, m, v, vRange) {
            this.mController = new Controller(this, "Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.controlM);
            this.posXController = new Controller(this, "Position x", -posRange, posRange, this.pos[0], this.controlPos);
            this.posYController = new Controller(this, "Position y", -posRange, posRange, this.pos[1], this.controlPos);
            this.vRhoController = new Controller(this, "Velocity ρ", 0, vRange, v[0], this.controlV);
            this.vPhiController = new Controller(this, "Velocity φ", -180, 180, rad2deg(v[1]), this.controlV);
        }
    }, {
        key: 'getControllers',
        value: function getControllers() {
            return [this.mController, this.posXController, this.posYController, this.vRhoController, this.vPhiController];
        }
    }, {
        key: 'toString',
        value: function toString() {
            return JSON.stringify({ 'tag': this.tag, 'v': this.v, 'pos': this.pos });
        }
    }], [{
        key: 'getRadiusFromMass',
        value: function getRadiusFromMass(m) {
            return pow(m, 1 / 2);
        }
    }, {
        key: 'getMassFromRadius',
        value: function getMassFromRadius(r) {
            return square(r);
        }
    }]);

    return Circle;
}();

module.exports = Circle;

},{"../control/control_box":5,"../control/controller":6,"../matrix":11,"../util":14}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Circle = require('./circle');
var Controller = require('../control/controller');

var _require = require('../util'),
    rad2deg = _require.rad2deg,
    deg2rad = _require.deg2rad,
    spherical2cartesian = _require.spherical2cartesian;

var _require2 = require('../util'),
    cube = _require2.cube;

var pow = Math.pow;

var Sphere = function (_Circle) {
    _inherits(Sphere, _Circle);

    function Sphere() {
        _classCallCheck(this, Sphere);

        return _possibleConstructorReturn(this, (Sphere.__proto__ || Object.getPrototypeOf(Sphere)).apply(this, arguments));
    }

    _createClass(Sphere, [{
        key: 'getRadius',

        /**
         * Spherical coordinate system
         * https://en.wikipedia.org/wiki/Spherical_coordinate_system
         */

        value: function getRadius() {
            return Sphere.getRadiusFromMass(this.m);
        }
    }, {
        key: 'controlPos',
        value: function controlPos(e) {
            var x = this.posXController.get();
            var y = this.posYController.get();
            var z = this.posZController.get();
            this.pos = [x, y, z];
        }
    }, {
        key: 'controlV',
        value: function controlV(e) {
            var phi = deg2rad(this.vPhiController.get());
            var theta = deg2rad(this.vThetaController.get());
            var rho = this.vRhoController.get();
            this.v = spherical2cartesian(rho, phi, theta);
        }
    }, {
        key: 'setup_controllers',
        value: function setup_controllers(pos_range, m, v, v_range) {
            _get(Sphere.prototype.__proto__ || Object.getPrototypeOf(Sphere.prototype), 'setup_controllers', this).call(this, pos_range, m, v, v_range);
            this.posZController = new Controller(this, "Position z", -pos_range, pos_range, this.pos[2], this.controlPos);
            this.vThetaController = new Controller(this, "Velocity θ", -180, 180, rad2deg(v[2]), this.controlV);
        }
    }, {
        key: 'getControllers',
        value: function getControllers() {
            return [this.mController, this.posXController, this.posYController, this.posZController, this.vRhoController, this.vPhiController, this.vThetaController];
        }
    }], [{
        key: 'getRadiusFromMass',
        value: function getRadiusFromMass(m) {
            return pow(m, 1 / 3);
        }
    }, {
        key: 'getMassFromRadius',
        value: function getMassFromRadius(r) {
            return cube(r);
        }
    }]);

    return Sphere;
}(Circle);

module.exports = Sphere;

},{"../control/controller":6,"../util":14,"./circle":12}],14:[function(require,module,exports){
'use strict';

var InvisibleError = require('./error/invisible');

var _require = require('./matrix'),
    mag = _require.mag,
    dot = _require.dot;

var Util = {
    square: function square(x) {
        return x * x;
    },

    cube: function cube(x) {
        return x * x * x;
    },

    polar2cartesian: function polar2cartesian(rho, phi) {
        return [rho * Math.cos(phi), rho * Math.sin(phi)];
    },

    cartesian2polar: function cartesian2polar(x, y) {
        return [mag([x, y]), Math.atan2(y, x)];
    },

    spherical2cartesian: function spherical2cartesian(rho, phi, theta) {
        return [rho * Math.sin(theta) * Math.cos(phi), rho * Math.sin(theta) * Math.sin(phi), rho * Math.cos(theta)];
    },

    cartesian2spherical: function cartesian2spherical(x, y, z) {
        var rho = mag([x, y, z]);
        return [rho, Math.atan2(y, x), rho != 0 ? Math.acos(z / rho) : 0];
    },

    cartesian2auto: function cartesian2auto(vector) {
        return vector.length == 2 ? Util.cartesian2polar(vector[0], vector[1]) : Util.cartesian2spherical(vector[0], vector[1], vector[2]);
    },

    rad2deg: function rad2deg(rad) {
        return rad / Math.PI * 180;
    },

    deg2rad: function deg2rad(deg) {
        return deg / 180 * Math.PI;
    },

    getDistance: function getDistance(x0, y0, x1, y1) {
        return mag([x1 - x0, y1 - y0]);
    },

    rotate: function rotate(vector, matrix) {
        return dot([vector], matrix)[0];
    },

    now: function now() {
        return new Date().getTime() / 1000;
    },

    random: function random(min) {
        var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        if (max == null) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    },

    randColor: function randColor() {
        return '#' + Math.floor(0x1000000 + Math.random() * 0x1000000).toString(16).substring(1);
    },

    getRotationMatrix: function getRotationMatrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[cos, -sin], [sin, cos]];
    },

    getXRotationMatrix: function getXRotationMatrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[1, 0, 0], [0, cos, -sin], [0, sin, cos]];
    },

    getYRotationMatrix: function getYRotationMatrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[cos, 0, sin], [0, 1, 0], [-sin, 0, cos]];
    },

    getZRotationMatrix: function getZRotationMatrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]];
    },

    skipInvisibleError: function skipInvisibleError(func) {
        try {
            return func();
        } catch (e) {
            if (!(e instanceof InvisibleError)) {
                console.error(e);
                throw new Error();
            }
        }
        return null;
    }
};

module.exports = Util;

},{"./error/invisible":9,"./matrix":11}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLElBQU0sWUFBWSxRQUFRLGFBQVIsQ0FBbEI7O0FBRUEsSUFBTSxZQUFZLElBQUksU0FBSixFQUFsQjtBQUNBLElBQUksV0FBVyxDQUFmO0FBQ0EsVUFBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLEtBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3JDLFFBQU0sU0FBUyxRQUFRLENBQVIsQ0FBZjtBQUNBLFlBQVEsTUFBUixxQkFBaUMsQ0FBakMsVUFBc0MsS0FBSyxRQUFMLEdBQWdCLFdBQWhCLEdBQThCLEVBQXBFLFVBQTBFLE9BQU8sU0FBUCxDQUFpQixLQUEzRjtBQUNIO0FBQ0QsUUFBUSxNQUFSLENBQWUsWUFBTTtBQUNqQixlQUFXLFNBQVMs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QUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IHByZXNldHMgPSByZXF1aXJlKCcuL3ByZXNldCcpO1xuY29uc3QgU2ltdWxhdG9yID0gcmVxdWlyZSgnLi9zaW11bGF0b3InKTtcblxuY29uc3Qgc2ltdWxhdG9yID0gbmV3IFNpbXVsYXRvcigpO1xubGV0IHNlbGVjdGVkID0gMTtcbnNpbXVsYXRvci5pbml0KHByZXNldHNbc2VsZWN0ZWRdKTtcblxuY29uc3QgJHNlbGVjdCA9ICQoJ3NlbGVjdCcpO1xuZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVzZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcHJlc2V0ID0gcHJlc2V0c1tpXTtcbiAgICAkc2VsZWN0LmFwcGVuZChgPG9wdGlvbiB2YWx1ZT1cIiR7aX1cIiR7aSA9PSBzZWxlY3RlZCA/ICcgc2VsZWN0ZWQnIDogJyd9PiR7cHJlc2V0LnByb3RvdHlwZS50aXRsZX08L29wdGlvbj5gKTtcbn1cbiRzZWxlY3QuY2hhbmdlKCgpID0+IHtcbiAgICBzZWxlY3RlZCA9IHBhcnNlSW50KCRzZWxlY3QuZmluZCgnOnNlbGVjdGVkJykudmFsKCkpO1xuICAgIHNpbXVsYXRvci5pbml0KHByZXNldHNbc2VsZWN0ZWRdKTtcbn0pO1xuJHNlbGVjdC5mb2N1cygoKSA9PiB7XG4gICAgJHNlbGVjdC5ibHVyKCk7XG59KTtcbiQoJyNyZXNldCcpLmNsaWNrKCgpID0+IHtcbiAgICBzaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG59KTtcblxuXG5sZXQgJG1vdmluZyA9IG51bGw7XG5sZXQgcHgsIHB5O1xuXG4kKCdib2R5Jykub24oJ21vdXNlZG93bicsICcuY29udHJvbC1ib3ggLnRpdGxlLWJhcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgcHggPSBlLnBhZ2VYO1xuICAgIHB5ID0gZS5wYWdlWTtcbiAgICAkbW92aW5nID0gJCh0aGlzKS5wYXJlbnQoJy5jb250cm9sLWJveCcpO1xuICAgICRtb3ZpbmcubmV4dFVudGlsKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5pbnNlcnRCZWZvcmUoJG1vdmluZyk7XG4gICAgcmV0dXJuIGZhbHNlO1xufSk7XG5cbiQoJ2JvZHknKS5tb3VzZW1vdmUoZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoISRtb3ZpbmcpIHJldHVybjtcbiAgICBjb25zdCB4ID0gZS5wYWdlWDtcbiAgICBjb25zdCB5ID0gZS5wYWdlWTtcbiAgICAkbW92aW5nLmNzcygnbGVmdCcsIHBhcnNlSW50KCRtb3ZpbmcuY3NzKCdsZWZ0JykpICsgKHggLSBweCkgKyAncHgnKTtcbiAgICAkbW92aW5nLmNzcygndG9wJywgcGFyc2VJbnQoJG1vdmluZy5jc3MoJ3RvcCcpKSArICh5IC0gcHkpICsgJ3B4Jyk7XG4gICAgcHggPSBlLnBhZ2VYO1xuICAgIHB5ID0gZS5wYWdlWTtcbn0pO1xuXG4kKCdib2R5JykubW91c2V1cChmdW5jdGlvbiAoZSkge1xuICAgICRtb3ZpbmcgPSBudWxsO1xufSk7IiwiY29uc3Qge2V4dGVuZH0gPSAkO1xuXG5cbmZ1bmN0aW9uIEVNUFRZXzJEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIGMsIHtcbiAgICAgICAgQkFDS0dST1VORDogJ3doaXRlJyxcbiAgICAgICAgRElNRU5TSU9OOiAyLFxuICAgICAgICBNQVhfUEFUSFM6IDEwMDAsXG4gICAgICAgIENBTUVSQV9DT09SRF9TVEVQOiA1LFxuICAgICAgICBDQU1FUkFfQU5HTEVfU1RFUDogMSxcbiAgICAgICAgQ0FNRVJBX0FDQ0VMRVJBVElPTjogMS4xLFxuICAgICAgICBHOiAwLjEsXG4gICAgICAgIE1BU1NfTUlOOiAxLFxuICAgICAgICBNQVNTX01BWDogNGU0LFxuICAgICAgICBWRUxPQ0lUWV9NQVg6IDEwLFxuICAgICAgICBESVJFQ1RJT05fTEVOR1RIOiA1MCxcbiAgICAgICAgQ0FNRVJBX0RJU1RBTkNFOiAxMDBcbiAgICB9KTtcbn1cbkVNUFRZXzJELnByb3RvdHlwZS50aXRsZSA9ICcyRCBHcmF2aXR5IFNpbXVsYXRvcic7XG5cblxuZnVuY3Rpb24gRU1QVFlfM0QoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfMkQoYyksIHtcbiAgICAgICAgRElNRU5TSU9OOiAzLFxuICAgICAgICBHOiAwLjAwMSxcbiAgICAgICAgTUFTU19NSU46IDEsXG4gICAgICAgIE1BU1NfTUFYOiA4ZTYsXG4gICAgICAgIFZFTE9DSVRZX01BWDogMTBcbiAgICB9KTtcbn1cbkVNUFRZXzNELnByb3RvdHlwZS50aXRsZSA9ICczRCBHcmF2aXR5IFNpbXVsYXRvcic7XG5cbmZ1bmN0aW9uIERFQlVHKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzNEKGMpLCB7XG4gICAgICAgIGluaXQ6IChlbmdpbmUpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ2JhbGwxJywgWy0xNTAsIDAsIDBdLCAxMDAwMDAwLCBbMCwgMCwgMF0sICdncmVlbicpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnYmFsbDInLCBbNTAsIDAsIDBdLCAxMDAwMCwgWzAsIDAsIDBdLCAnYmx1ZScpO1xuICAgICAgICAgICAgZW5naW5lLnRvZ2dsZUFuaW1hdGluZygpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5ERUJVRy5wcm90b3R5cGUudGl0bGUgPSAnREVCVUcnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtFTVBUWV8yRCwgRU1QVFlfM0QsIERFQlVHXTsiLCJjb25zdCBJbnZpc2libGVFcnJvciA9IHJlcXVpcmUoJy4uL2Vycm9yL2ludmlzaWJsZScpO1xuY29uc3Qge2RlZzJyYWQsIHJvdGF0ZSwgbm93LCBnZXRSb3RhdGlvbk1hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7cG93fSA9IE1hdGg7XG5cbmNsYXNzIENhbWVyYTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy56ID0gY29uZmlnLkNBTUVSQV9ESVNUQU5DRTtcbiAgICAgICAgdGhpcy5waGkgPSAwO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5sYXN0VGltZSA9IDA7XG4gICAgICAgIHRoaXMubGFzdEtleSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29tYm8gPSAwO1xuICAgICAgICB0aGlzLnJlc2l6ZSgpO1xuICAgIH1cblxuICAgIHJlc2l6ZSgpIHtcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBbdGhpcy5jb25maWcuVyAvIDIsIHRoaXMuY29uZmlnLkggLyAyXTtcbiAgICB9XG5cbiAgICBnZXRDb29yZFN0ZXAoa2V5KSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbm93KCk7XG4gICAgICAgIGlmIChrZXkgPT0gdGhpcy5sYXN0S2V5ICYmIGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZSA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgICAgdGhpcy5sYXN0S2V5ID0ga2V5O1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuQ0FNRVJBX0NPT1JEX1NURVAgKiBwb3codGhpcy5jb25maWcuQ0FNRVJBX0FDQ0VMRVJBVElPTiwgdGhpcy5jb21ibyk7XG4gICAgfVxuXG4gICAgdXAoa2V5KSB7XG4gICAgICAgIHRoaXMueSAtPSB0aGlzLmdldENvb3JkU3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBkb3duKGtleSkge1xuICAgICAgICB0aGlzLnkgKz0gdGhpcy5nZXRDb29yZFN0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgbGVmdChrZXkpIHtcbiAgICAgICAgdGhpcy54IC09IHRoaXMuZ2V0Q29vcmRTdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJpZ2h0KGtleSkge1xuICAgICAgICB0aGlzLnggKz0gdGhpcy5nZXRDb29yZFN0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgem9vbUluKGtleSkge1xuICAgICAgICB0aGlzLnogLT0gdGhpcy5nZXRDb29yZFN0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgem9vbU91dChrZXkpIHtcbiAgICAgICAgdGhpcy56ICs9IHRoaXMuZ2V0Q29vcmRTdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZUxlZnQoa2V5KSB7XG4gICAgICAgIHRoaXMucGhpIC09IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVSaWdodChrZXkpIHtcbiAgICAgICAgdGhpcy5waGkgKz0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJlZnJlc2goKSB7XG4gICAgfVxuXG4gICAgZ2V0Wm9vbSh6ID0gMCkge1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnogLSB6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPD0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEludmlzaWJsZUVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLkNBTUVSQV9ESVNUQU5DRSAvIGRpc3RhbmNlO1xuICAgIH1cblxuICAgIGFkanVzdENvb3JkcyhjKSB7XG4gICAgICAgIGNvbnN0IFIgPSBnZXRSb3RhdGlvbk1hdHJpeChkZWcycmFkKHRoaXMucGhpKSk7XG4gICAgICAgIGMgPSByb3RhdGUoYywgUik7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldFpvb20oKTtcbiAgICAgICAgY29uc3QgY29vcmRzID0gYWRkKHRoaXMuY2VudGVyLCBtdWwoc3ViKGMsIFt0aGlzLngsIHRoaXMueV0pLCB6b29tKSk7XG4gICAgICAgIHJldHVybiB7Y29vcmRzfTtcbiAgICB9XG5cbiAgICBhZGp1c3RSYWRpdXMoY29vcmRzLCByYWRpdXMpIHtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0Wm9vbSgpO1xuICAgICAgICByZXR1cm4gcmFkaXVzICogem9vbTtcbiAgICB9XG5cbiAgICBhY3R1YWxQb2ludCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IFJfID0gZ2V0Um90YXRpb25NYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSksIC0xKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0Wm9vbSgpO1xuICAgICAgICByZXR1cm4gcm90YXRlKGFkZChkaXYoc3ViKFt4LCB5XSwgdGhpcy5jZW50ZXIpLCB6b29tKSwgW3RoaXMueCwgdGhpcy55XSksIFJfKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhMkQ7IiwiY29uc3QgQ2FtZXJhMkQgPSByZXF1aXJlKCcuLzJkJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBnZXRYUm90YXRpb25NYXRyaXgsIGdldFlSb3RhdGlvbk1hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5cblxuY2xhc3MgQ2FtZXJhM0QgZXh0ZW5kcyBDYW1lcmEyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBlbmdpbmUpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCBlbmdpbmUpO1xuICAgICAgICB0aGlzLnRoZXRhID0gMDtcbiAgICB9XG5cbiAgICByb3RhdGVVcChrZXkpIHtcbiAgICAgICAgdGhpcy50aGV0YSAtPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlRG93bihrZXkpIHtcbiAgICAgICAgdGhpcy50aGV0YSArPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlZENvb3JkcyhjKSB7XG4gICAgICAgIGNvbnN0IFJ4ID0gZ2V0WFJvdGF0aW9uTWF0cml4KGRlZzJyYWQodGhpcy50aGV0YSkpO1xuICAgICAgICBjb25zdCBSeSA9IGdldFlSb3RhdGlvbk1hdHJpeChkZWcycmFkKHRoaXMucGhpKSk7XG4gICAgICAgIHJldHVybiByb3RhdGUocm90YXRlKGMsIFJ4KSwgUnkpO1xuICAgIH1cblxuICAgIGFkanVzdENvb3JkcyhjKSB7XG4gICAgICAgIGMgPSB0aGlzLnJvdGF0ZWRDb29yZHMoYyk7XG4gICAgICAgIGNvbnN0IHogPSBjLnBvcCgpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRab29tKHopO1xuICAgICAgICBjb25zdCBjb29yZHMgPSBhZGQodGhpcy5jZW50ZXIsIG11bChzdWIoYywgW3RoaXMueCwgdGhpcy55XSksIHpvb20pKTtcbiAgICAgICAgcmV0dXJuIHtjb29yZHMsIHp9O1xuICAgIH1cblxuICAgIGFkanVzdFJhZGl1cyhjLCByYWRpdXMpIHtcbiAgICAgICAgYyA9IHRoaXMucm90YXRlZENvb3JkcyhjKTtcbiAgICAgICAgY29uc3QgeiA9IGMucG9wKCk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldFpvb20oeik7XG4gICAgICAgIHJldHVybiByYWRpdXMgKiB6b29tO1xuICAgIH1cblxuICAgIGFjdHVhbFBvaW50KHgsIHkpIHtcbiAgICAgICAgY29uc3QgUnhfID0gZ2V0WFJvdGF0aW9uTWF0cml4KGRlZzJyYWQodGhpcy50aGV0YSksIC0xKTtcbiAgICAgICAgY29uc3QgUnlfID0gZ2V0WVJvdGF0aW9uTWF0cml4KGRlZzJyYWQodGhpcy5waGkpLCAtMSk7XG4gICAgICAgIGNvbnN0IGMgPSBhZGQoc3ViKFt4LCB5XSwgdGhpcy5jZW50ZXIpLCBbdGhpcy54LCB0aGlzLnldKS5jb25jYXQodGhpcy56IC0gdGhpcy5jb25maWcuQ0FNRVJBX0RJU1RBTkNFKTtcbiAgICAgICAgcmV0dXJuIHJvdGF0ZShyb3RhdGUoYywgUnlfKSwgUnhfKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhM0Q7IiwiY2xhc3MgQ29udHJvbEJveCB7XG4gICAgY29uc3RydWN0b3IodGl0bGUsIGNvbnRyb2xsZXJzLCB4LCB5KSB7XG4gICAgICAgIGNvbnN0ICR0ZW1wbGF0ZUNvbnRyb2xCb3ggPSAkKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKTtcbiAgICAgICAgY29uc3QgJGNvbnRyb2xCb3ggPSAkdGVtcGxhdGVDb250cm9sQm94LmNsb25lKCk7XG4gICAgICAgICRjb250cm9sQm94LnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICAkY29udHJvbEJveC5maW5kKCcudGl0bGUnKS50ZXh0KHRpdGxlKTtcbiAgICAgICAgY29uc3QgJGlucHV0Q29udGFpbmVyID0gJGNvbnRyb2xCb3guZmluZCgnLmlucHV0LWNvbnRhaW5lcicpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRyb2xsZXIgb2YgY29udHJvbGxlcnMpIHtcbiAgICAgICAgICAgICRpbnB1dENvbnRhaW5lci5hcHBlbmQoY29udHJvbGxlci4kaW5wdXRXcmFwcGVyKTtcbiAgICAgICAgfVxuICAgICAgICAkY29udHJvbEJveC5maW5kKCcuY2xvc2UnKS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAkY29udHJvbEJveC5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRjb250cm9sQm94Lmluc2VydEJlZm9yZSgkdGVtcGxhdGVDb250cm9sQm94KTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCdsZWZ0JywgeCArICdweCcpO1xuICAgICAgICAkY29udHJvbEJveC5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcblxuICAgICAgICB0aGlzLiRjb250cm9sQm94ID0gJGNvbnRyb2xCb3g7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgaXNPcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kY29udHJvbEJveFswXS5wYXJlbnROb2RlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sQm94OyIsImNsYXNzIENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgbmFtZSwgbWluLCBtYXgsIHZhbHVlLCBmdW5jKSB7XG4gICAgICAgIGNvbnN0ICRpbnB1dFdyYXBwZXIgPSB0aGlzLiRpbnB1dFdyYXBwZXIgPSAkKCcuY29udHJvbC1ib3gudGVtcGxhdGUgLmlucHV0LXdyYXBwZXIudGVtcGxhdGUnKS5jbG9uZSgpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLmZpbmQoJy5uYW1lJykudGV4dChuYW1lKTtcbiAgICAgICAgY29uc3QgJGlucHV0ID0gdGhpcy4kaW5wdXQgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtaW4nLCBtaW4pO1xuICAgICAgICAkaW5wdXQuYXR0cignbWF4JywgbWF4KTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3ZhbHVlJywgdmFsdWUpO1xuICAgICAgICAkaW5wdXQuYXR0cignc3RlcCcsIDAuMDEpO1xuICAgICAgICBjb25zdCAkdmFsdWUgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJy52YWx1ZScpO1xuICAgICAgICAkdmFsdWUudGV4dCh0aGlzLmdldCgpKTtcbiAgICAgICAgJGlucHV0Lm9uKCdpbnB1dCcsIGUgPT4ge1xuICAgICAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICAgICBmdW5jLmNhbGwob2JqZWN0LCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLiRpbnB1dC52YWwoKSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXI7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi4vb2JqZWN0L2NpcmNsZScpO1xuY29uc3QgQ2FtZXJhMkQgPSByZXF1aXJlKCcuLi9jYW1lcmEvMmQnKTtcbmNvbnN0IHtyb3RhdGUsIG5vdywgcmFuZG9tLCBwb2xhcjJjYXJ0ZXNpYW4sIHJhbmRDb2xvciwgZ2V0Um90YXRpb25NYXRyaXgsIGNhcnRlc2lhbjJhdXRvLCBza2lwSW52aXNpYmxlRXJyb3J9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWx9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWluLCBtYXh9ID0gTWF0aDtcblxuXG5jbGFzcyBQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihvYmopIHtcbiAgICAgICAgdGhpcy5wcmV2UG9zID0gb2JqLnByZXZQb3Muc2xpY2UoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBvYmoucG9zLnNsaWNlKCk7XG4gICAgfVxufVxuXG5jbGFzcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBjdHgpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgICAgICB0aGlzLm9ianMgPSBbXTtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb250cm9sQm94ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXRocyA9IFtdO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEyRChjb25maWcsIHRoaXMpO1xuICAgICAgICB0aGlzLmZwc0xhc3RUaW1lID0gbm93KCk7XG4gICAgICAgIHRoaXMuZnBzQ291bnQgPSAwO1xuICAgIH1cblxuICAgIHRvZ2dsZUFuaW1hdGluZygpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSAhdGhpcy5hbmltYXRpbmc7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gYCR7dGhpcy5jb25maWcuVElUTEV9ICgke3RoaXMuYW5pbWF0aW5nID8gXCJTaW11bGF0aW5nXCIgOiBcIlBhdXNlZFwifSlgO1xuICAgIH1cblxuICAgIGRlc3Ryb3lDb250cm9sQm94ZXMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbEJveCBvZiB0aGlzLmNvbnRyb2xCb3hlcykge1xuICAgICAgICAgICAgY29udHJvbEJveC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW11cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLmN0eCA9IG51bGw7XG4gICAgICAgIHRoaXMuZGVzdHJveUNvbnRyb2xCb3hlcygpO1xuICAgIH1cblxuICAgIGFuaW1hdGUoKSB7XG4gICAgICAgIGlmICghdGhpcy5jdHgpIHJldHVybjtcbiAgICAgICAgdGhpcy5wcmludEZwcygpO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlQWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWRyYXdBbGwoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUoKTtcbiAgICAgICAgfSwgMTApO1xuICAgIH1cblxuICAgIG9iamVjdENvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuY2FtZXJhLmFkanVzdFJhZGl1cyhvYmoucG9zLCBvYmouZ2V0UmFkaXVzKCkpO1xuICAgICAgICBjb25zdCB7Y29vcmRzLCB6fSA9IHRoaXMuY2FtZXJhLmFkanVzdENvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIGNvb3Jkcy5jb25jYXQocikuY29uY2F0KHopO1xuICAgIH1cblxuICAgIGRpcmVjdGlvbkNvb3JkcyhvYmosIGZhY3RvciA9IHRoaXMuY29uZmlnLkRJUkVDVElPTl9MRU5HVEgpIHtcbiAgICAgICAgY29uc3Qge2Nvb3JkczogYzF9ID0gdGhpcy5jYW1lcmEuYWRqdXN0Q29vcmRzKG9iai5wb3MpO1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMiwgen0gPSB0aGlzLmNhbWVyYS5hZGp1c3RDb29yZHMoYWRkKG9iai5wb3MsIG11bChvYmoudiwgZmFjdG9yKSkpO1xuICAgICAgICByZXR1cm4gYzEuY29uY2F0KGMyKS5jb25jYXQoeik7XG4gICAgfVxuXG4gICAgcGF0aENvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3Qge2Nvb3JkczogYzF9ID0gdGhpcy5jYW1lcmEuYWRqdXN0Q29vcmRzKG9iai5wcmV2UG9zKTtcbiAgICAgICAgY29uc3Qge2Nvb3JkczogYzIsIHp9ID0gdGhpcy5jYW1lcmEuYWRqdXN0Q29vcmRzKG9iai5wb3MpO1xuICAgICAgICByZXR1cm4gYzEuY29uY2F0KGMyKS5jb25jYXQoeik7XG4gICAgfVxuXG4gICAgZHJhd09iamVjdChjLCBjb2xvciA9IG51bGwpIHtcbiAgICAgICAgc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgIGNvbG9yID0gY29sb3IgfHwgYy5jb2xvcjtcbiAgICAgICAgICAgIGlmIChjIGluc3RhbmNlb2YgQ2lyY2xlKSB7XG4gICAgICAgICAgICAgICAgYyA9IHRoaXMub2JqZWN0Q29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMoY1swXSwgY1sxXSwgY1syXSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3RGlyZWN0aW9uKGMpIHtcbiAgICAgICAgc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChjIGluc3RhbmNlb2YgQ2lyY2xlKSB7XG4gICAgICAgICAgICAgICAgYyA9IHRoaXMuZGlyZWN0aW9uQ29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oY1swXSwgY1sxXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oY1syXSwgY1szXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3UGF0aChjKSB7XG4gICAgICAgIHNraXBJbnZpc2libGVFcnJvcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIFBhdGgpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5wYXRoQ29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oY1swXSwgY1sxXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oY1syXSwgY1szXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICcjZGRkZGRkJztcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjcmVhdGVQYXRoKG9iaikge1xuICAgICAgICBpZiAobWFnKHN1YihvYmoucG9zLCBvYmoucHJldlBvcykpID4gNSkge1xuICAgICAgICAgICAgdGhpcy5wYXRocy5wdXNoKG5ldyBQYXRoKG9iaikpO1xuICAgICAgICAgICAgb2JqLnByZXZQb3MgPSBvYmoucG9zLnNsaWNlKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wYXRocy5sZW5ndGggPiB0aGlzLmNvbmZpZy5NQVhfUEFUSFMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhzID0gdGhpcy5wYXRocy5zbGljZSgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVzZXJDcmVhdGVPYmplY3QoeCwgeSkge1xuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmNhbWVyYS5hY3R1YWxQb2ludCh4LCB5KTtcbiAgICAgICAgbGV0IG1heFIgPSBDaXJjbGUuZ2V0UmFkaXVzRnJvbU1hc3ModGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG1heFIgPSBtaW4obWF4UiwgKG1hZyhzdWIob2JqLnBvcywgcG9zKSkgLSBvYmouZ2V0UmFkaXVzKCkpIC8gMS41KVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG0gPSBDaXJjbGUuZ2V0TWFzc0Zyb21SYWRpdXMocmFuZG9tKENpcmNsZS5nZXRSYWRpdXNGcm9tTWFzcyh0aGlzLmNvbmZpZy5NQVNTX01JTiksIG1heFIpKTtcbiAgICAgICAgY29uc3QgdiA9IHBvbGFyMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSByYW5kQ29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYGNpcmNsZSR7dGhpcy5vYmpzLmxlbmd0aH1gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KHRhZywgcG9zLCBtLCB2LCBjb2xvcikge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzWzBdLCBkaXIpO1xuICAgIH1cblxuICAgIGdldFBpdm90QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY29sbGlkZUVsYXN0aWNhbGx5KCkge1xuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmNvbmZpZy5ESU1FTlNJT047XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vYmpzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvMSA9IHRoaXMub2Jqc1tpXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMub2Jqcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG8yID0gdGhpcy5vYmpzW2pdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHN1YihvMi5wb3MsIG8xLnBvcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGVzID0gY2FydGVzaWFuMmF1dG8oY29sbGlzaW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYW5nbGVzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZCA8IG8xLmdldFJhZGl1cygpICsgbzIuZ2V0UmFkaXVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUiA9IHRoaXMuZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUl8gPSB0aGlzLmdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgLTEpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpID0gdGhpcy5nZXRQaXZvdEF4aXMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2VGVtcCA9IFtyb3RhdGUobzEudiwgUiksIHJvdGF0ZShvMi52LCBSKV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZGaW5hbCA9IFt2VGVtcFswXS5zbGljZSgpLCB2VGVtcFsxXS5zbGljZSgpXTtcbiAgICAgICAgICAgICAgICAgICAgdkZpbmFsWzBdW2ldID0gKChvMS5tIC0gbzIubSkgKiB2VGVtcFswXVtpXSArIDIgKiBvMi5tICogdlRlbXBbMV1baV0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgdkZpbmFsWzFdW2ldID0gKChvMi5tIC0gbzEubSkgKiB2VGVtcFsxXVtpXSArIDIgKiBvMS5tICogdlRlbXBbMF1baV0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgbzEudiA9IHJvdGF0ZSh2RmluYWxbMF0sIFJfKTtcbiAgICAgICAgICAgICAgICAgICAgbzIudiA9IHJvdGF0ZSh2RmluYWxbMV0sIFJfKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NUZW1wID0gW3plcm9zKGRpbWVuc2lvbiksIHJvdGF0ZShjb2xsaXNpb24sIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zVGVtcFswXVtpXSArPSB2RmluYWxbMF1baV07XG4gICAgICAgICAgICAgICAgICAgIHBvc1RlbXBbMV1baV0gKz0gdkZpbmFsWzFdW2ldO1xuICAgICAgICAgICAgICAgICAgICBvMS5wb3MgPSBhZGQobzEucG9zLCByb3RhdGUocG9zVGVtcFswXSwgUl8pKTtcbiAgICAgICAgICAgICAgICAgICAgbzIucG9zID0gYWRkKG8xLnBvcywgcm90YXRlKHBvc1RlbXBbMV0sIFJfKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlQWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVWZWxvY2l0eSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29sbGlkZUVsYXN0aWNhbGx5KCk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZVBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVBhdGgob2JqKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZHJhd0FsbCgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd09iamVjdChvYmopO1xuICAgICAgICAgICAgdGhpcy5kcmF3RGlyZWN0aW9uKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHRoaXMucGF0aHMpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1BhdGgocGF0aCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmludEZwcygpIHtcbiAgICAgICAgdGhpcy5mcHNDb3VudCArPSAxO1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IG5vdygpO1xuICAgICAgICBjb25zdCB0aW1lRGlmZiA9IGN1cnJlbnRUaW1lIC0gdGhpcy5mcHNMYXN0VGltZTtcbiAgICAgICAgaWYgKHRpbWVEaWZmID4gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7KHRoaXMuZnBzQ291bnQgLyB0aW1lRGlmZikgfCAwfSBmcHNgKTtcbiAgICAgICAgICAgIHRoaXMuZnBzTGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgICAgICAgIHRoaXMuZnBzQ291bnQgPSAwO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTJEOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi8yZCcpO1xuY29uc3QgQ2FtZXJhM0QgPSByZXF1aXJlKCcuLi9jYW1lcmEvM2QnKTtcbmNvbnN0IFNwaGVyZSA9IHJlcXVpcmUoJy4uL29iamVjdC9zcGhlcmUnKTtcbmNvbnN0IHtyYW5kb20sIGdldFlSb3RhdGlvbk1hdHJpeCwgZ2V0WlJvdGF0aW9uTWF0cml4LCByYW5kQ29sb3IsIHNwaGVyaWNhbDJjYXJ0ZXNpYW4sIHNraXBJbnZpc2libGVFcnJvcn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7bWFnLCBzdWIsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttaW59ID0gTWF0aDtcblxuXG5jbGFzcyBFbmdpbmUzRCBleHRlbmRzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGN0eCkge1xuICAgICAgICBzdXBlcihjb25maWcsIGN0eCk7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYTNEKGNvbmZpZywgdGhpcyk7XG4gICAgfVxuXG4gICAgZGlyZWN0aW9uQ29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCBjID0gdGhpcy5jYW1lcmEucm90YXRlZENvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRGYWN0b3IgPSAodGhpcy5jYW1lcmEueiAtIGNbMl0gLSAxKSAvIG9iai52WzJdO1xuICAgICAgICBsZXQgZmFjdG9yID0gdGhpcy5jb25maWcuRElSRUNUSU9OX0xFTkdUSDtcbiAgICAgICAgaWYgKGFkanVzdGVkRmFjdG9yID4gMCkgZmFjdG9yID0gbWluKGZhY3RvciwgYWRqdXN0ZWRGYWN0b3IpO1xuICAgICAgICByZXR1cm4gc3VwZXIuZGlyZWN0aW9uQ29vcmRzKG9iaiwgZmFjdG9yKTtcbiAgICB9XG5cbiAgICB1c2VyQ3JlYXRlT2JqZWN0KHgsIHkpIHtcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5jYW1lcmEuYWN0dWFsUG9pbnQoeCwgeSk7XG4gICAgICAgIGxldCBtYXhSID0gU3BoZXJlLmdldFJhZGl1c0Zyb21NYXNzKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBtYXhSID0gbWluKG1heFIsIChtYWcoc3ViKG9iai5wb3MsIHBvcykpIC0gb2JqLmdldFJhZGl1cygpKSAvIDEuNSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbSA9IFNwaGVyZS5nZXRNYXNzRnJvbVJhZGl1cyhyYW5kb20oU3BoZXJlLmdldFJhZGl1c0Zyb21NYXNzKHRoaXMuY29uZmlnLk1BU1NfTUlOKSwgbWF4UikpO1xuICAgICAgICBjb25zdCB2ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApLCByYW5kb20oLTE4MCwgMTgwKSk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcmFuZENvbG9yKCk7XG4gICAgICAgIGNvbnN0IHRhZyA9IGBzcGhlcmUke3RoaXMub2Jqcy5sZW5ndGh9YDtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IFNwaGVyZSh0aGlzLmNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgb2JqLnNob3dDb250cm9sQm94KHgsIHkpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGNyZWF0ZU9iamVjdCh0YWcsIHBvcywgbSwgdiwgY29sb3IpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IFNwaGVyZSh0aGlzLmNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGRvdChnZXRaUm90YXRpb25NYXRyaXgoYW5nbGVzWzBdLCBkaXIpLCBnZXRZUm90YXRpb25NYXRyaXgoYW5nbGVzWzFdLCBkaXIpLCBkaXIpO1xuICAgIH1cblxuICAgIGdldFBpdm90QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgfVxuXG4gICAgcmVkcmF3QWxsKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCk7XG4gICAgICAgIGNvbnN0IG9yZGVycyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIHNraXBJbnZpc2libGVFcnJvcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0gdGhpcy5vYmplY3RDb29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsnb2JqZWN0JywgY29vcmRzLCB6LCBvYmouY29sb3JdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLmRpcmVjdGlvbkNvb3JkcyhvYmopO1xuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBjb29yZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgb3JkZXJzLnB1c2goWydkaXJlY3Rpb24nLCBjb29yZHMsIHpdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0aGlzLnBhdGhzKSB7XG4gICAgICAgICAgICBza2lwSW52aXNpYmxlRXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IHRoaXMucGF0aENvb3JkcyhwYXRoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsncGF0aCcsIGNvb3Jkcywgel0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgb3JkZXJzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhWzJdIC0gYlsyXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAoY29uc3QgW3R5cGUsIGNvb3JkcywgeiwgY29sb3JdIG9mIG9yZGVycykge1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3T2JqZWN0KGNvb3JkcywgY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkaXJlY3Rpb24nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdEaXJlY3Rpb24oY29vcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncGF0aCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BhdGgoY29vcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5naW5lM0Q7IiwiY2xhc3MgSW52aXNpYmxlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnZpc2libGVFcnJvcjsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vZW5naW5lLzJkJyk7XG5jb25zdCBFbmdpbmUzRCA9IHJlcXVpcmUoJy4vZW5naW5lLzNkJyk7XG5jb25zdCB7Z2V0RGlzdGFuY2UsIHNraXBJbnZpc2libGVFcnJvcn0gPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuXG5sZXQgY29uZmlnID0gbnVsbDtcbmNvbnN0IGtleW1hcCA9IHtcbiAgICAzODogJ3VwJyxcbiAgICA0MDogJ2Rvd24nLFxuICAgIDM3OiAnbGVmdCcsXG4gICAgMzk6ICdyaWdodCcsXG4gICAgOTA6ICd6b29tSW4nLCAvLyB6XG4gICAgODg6ICd6b29tT3V0JywgLy8geFxuICAgIDg3OiAncm90YXRlVXAnLCAvLyB3XG4gICAgODM6ICdyb3RhdGVEb3duJywgLy8gc1xuICAgIDY1OiAncm90YXRlTGVmdCcsIC8vIGFcbiAgICA2ODogJ3JvdGF0ZVJpZ2h0JyAvLyBkXG59O1xuXG5mdW5jdGlvbiBvblJlc2l6ZShlbmdpbmUsICRjYW52YXMpIHtcbiAgICBjb25maWcuVyA9ICRjYW52YXNbMF0ud2lkdGggPSAkY2FudmFzLndpZHRoKCk7XG4gICAgY29uZmlnLkggPSAkY2FudmFzWzBdLmhlaWdodCA9ICRjYW52YXMuaGVpZ2h0KCk7XG4gICAgaWYgKGVuZ2luZSkgZW5naW5lLmNhbWVyYS5yZXNpemUoKTtcbn1cblxuZnVuY3Rpb24gb25DbGljayhldmVudCwgZW5naW5lKSB7XG4gICAgY29uc3QgeCA9IGV2ZW50LnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBldmVudC5wYWdlWTtcbiAgICBpZiAoIWVuZ2luZS5hbmltYXRpbmcpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIGlmIChza2lwSW52aXNpYmxlRXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbY3gsIGN5LCByXSA9IGVuZ2luZS5vYmplY3RDb29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdldERpc3RhbmNlKGN4LCBjeSwgeCwgeSkgPCByKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKSByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZW5naW5lLnVzZXJDcmVhdGVPYmplY3QoeCwgeSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbktleURvd24oZXZlbnQsIGVuZ2luZSkge1xuICAgIGNvbnN0IHtrZXlDb2RlfSA9IGV2ZW50O1xuICAgIGlmIChrZXlDb2RlID09IDMyKSB7IC8vIHNwYWNlIGJhclxuICAgICAgICBlbmdpbmUuZGVzdHJveUNvbnRyb2xCb3hlcygpO1xuICAgICAgICBjb25zb2xlLmxvZygnYScpO1xuICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlIGluIGtleW1hcCAmJiBrZXltYXBba2V5Q29kZV0gaW4gZW5naW5lLmNhbWVyYSkge1xuICAgICAgICBlbmdpbmUuY2FtZXJhW2tleW1hcFtrZXlDb2RlXV0oa2V5Q29kZSk7XG4gICAgfVxufVxuXG5jbGFzcyBTaW11bGF0b3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLiRjYW52YXMgPSAkKCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLiRjYW52YXNbMF0uZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShlID0+IHtcbiAgICAgICAgICAgIG9uUmVzaXplKHRoaXMuZW5naW5lLCB0aGlzLiRjYW52YXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4kY2FudmFzLmNsaWNrKGUgPT4ge1xuICAgICAgICAgICAgb25DbGljayhlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCdib2R5Jykua2V5ZG93bihlID0+IHtcbiAgICAgICAgICAgIG9uS2V5RG93bihlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXQocHJlc2V0KSB7XG4gICAgICAgIGlmICh0aGlzLmVuZ2luZSkgdGhpcy5lbmdpbmUuZGVzdHJveSgpO1xuICAgICAgICBjb25maWcgPSBwcmVzZXQoe30pO1xuICAgICAgICBkb2N1bWVudC50aXRsZSA9IGNvbmZpZy5USVRMRSA9IHByZXNldC5wcm90b3R5cGUudGl0bGU7XG4gICAgICAgIG9uUmVzaXplKHRoaXMuZW5naW5lLCB0aGlzLiRjYW52YXMpO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyAoY29uZmlnLkRJTUVOU0lPTiA9PSAyID8gRW5naW5lMkQgOiBFbmdpbmUzRCkoY29uZmlnLCB0aGlzLmN0eCk7XG4gICAgICAgIGlmICgnaW5pdCcgaW4gY29uZmlnKSBjb25maWcuaW5pdCh0aGlzLmVuZ2luZSk7XG4gICAgICAgIHRoaXMuZW5naW5lLmFuaW1hdGUoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltdWxhdG9yOyIsImZ1bmN0aW9uIGl0ZXIoYSwgZnVuYykge1xuICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgIGNvbnN0IG0gPSBuZXcgQXJyYXkoYV9yKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfcjsgaSsrKSB7XG4gICAgICAgIG1baV0gPSBmdW5jKGkpO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgemVyb3M6IE4gPT4ge1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KE4pLmZpbGwoMCk7XG4gICAgfSxcblxuICAgIG1hZzogYSA9PiB7XG4gICAgICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IGFbaV0gKiBhW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoc3VtKTtcbiAgICB9LFxuXG4gICAgYWRkOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICsgYltpXTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHN1YjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAtIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtdWw6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gKiBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZGl2OiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldIC8gYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRvdDogKGEsIGIsIGRpciA9IDEpID0+IHtcbiAgICAgICAgaWYgKGRpciA9PSAtMSkge1xuICAgICAgICAgICAgW2EsIGJdID0gW2IsIGFdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgICAgICBjb25zdCBhX2MgPSBhWzBdLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYl9jID0gYlswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG0gPSBuZXcgQXJyYXkoYV9yKTtcbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCBhX3I7IHIrKykge1xuICAgICAgICAgICAgbVtyXSA9IG5ldyBBcnJheShiX2MpO1xuICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBiX2M7IGMrKykge1xuICAgICAgICAgICAgICAgIG1bcl1bY10gPSAwO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9jOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbVtyXVtjXSArPSBhW3JdW2ldICogYltpXVtjXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxufTsiLCJjb25zdCBDb250cm9sQm94ID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sX2JveCcpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHBvbGFyMmNhcnRlc2lhbiwgY2FydGVzaWFuMmF1dG8sIHNxdWFyZX0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21heCwgcG93fSA9IE1hdGg7XG5cblxuY2xhc3MgQ2lyY2xlIHtcbiAgICAvKipcbiAgICAgKiBQb2xhciBjb29yZGluYXRlIHN5c3RlbVxuICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BvbGFyX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgZW5naW5lKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICAgICAgdGhpcy5wcmV2UG9zID0gcG9zLnNsaWNlKCk7XG4gICAgICAgIHRoaXMudiA9IHY7XG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgdGhpcy50YWcgPSB0YWc7XG4gICAgICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuXG4gICAgICAgIHRoaXMuY29udHJvbEJveCA9IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0UmFkaXVzKCkge1xuICAgICAgICByZXR1cm4gQ2lyY2xlLmdldFJhZGl1c0Zyb21NYXNzKHRoaXMubSlcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVWZWxvY2l0eSgpIHtcbiAgICAgICAgbGV0IEYgPSB6ZXJvcyh0aGlzLmNvbmZpZy5ESU1FTlNJT04pO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICBpZiAob2JqID09IHRoaXMpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgdmVjdG9yID0gc3ViKHRoaXMucG9zLCBvYmoucG9zKTtcbiAgICAgICAgICAgIGNvbnN0IG1hZ25pdHVkZSA9IG1hZyh2ZWN0b3IpO1xuICAgICAgICAgICAgY29uc3QgdW5pdFZlY3RvciA9IGRpdih2ZWN0b3IsIG1hZ25pdHVkZSk7XG4gICAgICAgICAgICBGID0gYWRkKEYsIG11bCh1bml0VmVjdG9yLCBvYmoubSAvIHNxdWFyZShtYWduaXR1ZGUpKSlcbiAgICAgICAgfVxuICAgICAgICBGID0gbXVsKEYsIC10aGlzLmNvbmZpZy5HICogdGhpcy5tKTtcbiAgICAgICAgY29uc3QgYSA9IGRpdihGLCB0aGlzLm0pO1xuICAgICAgICB0aGlzLnYgPSBhZGQodGhpcy52LCBhKTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVQb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5wb3MgPSBhZGQodGhpcy5wb3MsIHRoaXMudik7XG4gICAgfVxuXG4gICAgY29udHJvbE0oZSkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICB9XG5cbiAgICBjb250cm9sUG9zKGUpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zWENvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc1lDb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5XTtcbiAgICB9XG5cbiAgICBjb250cm9sVihlKSB7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudlJob0NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52UGhpQ29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIHRoaXMudiA9IHBvbGFyMmNhcnRlc2lhbihyaG8sIHBoaSk7XG4gICAgfVxuXG4gICAgc2hvd0NvbnRyb2xCb3goeCwgeSkge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sQm94ICYmIHRoaXMuY29udHJvbEJveC5pc09wZW4oKSkge1xuICAgICAgICAgICAgY29uc3QgJGNvbnRyb2xCb3ggPSB0aGlzLmNvbnRyb2xCb3guJGNvbnRyb2xCb3g7XG4gICAgICAgICAgICAkY29udHJvbEJveC5jc3MoJ2xlZnQnLCB4ICsgJ3B4Jyk7XG4gICAgICAgICAgICAkY29udHJvbEJveC5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcbiAgICAgICAgICAgICRjb250cm9sQm94Lm5leHRVbnRpbCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuaW5zZXJ0QmVmb3JlKCRjb250cm9sQm94KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpbiA9IDEuNTtcblxuICAgICAgICAgICAgdmFyIHBvc1JhbmdlID0gbWF4KG1heCh0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKSAvIDIsIG1heC5hcHBseShudWxsLCB0aGlzLnBvcy5tYXAoTWF0aC5hYnMpKSAqIG1hcmdpbik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICAgICAgcG9zUmFuZ2UgPSBtYXgocG9zUmFuZ2UsIG1heC5hcHBseShudWxsLCBvYmoucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcblxuICAgICAgICAgICAgY29uc3QgdiA9IGNhcnRlc2lhbjJhdXRvKHRoaXMudik7XG4gICAgICAgICAgICB2YXIgdlJhbmdlID0gbWF4KHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCwgbWFnKHRoaXMudikgKiBtYXJnaW4pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgICAgIHZSYW5nZSA9IG1heCh2UmFuZ2UsIG1hZyhvYmoudikgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldHVwX2NvbnRyb2xsZXJzKHBvc1JhbmdlLCBtLCB2LCB2UmFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sQm94ID0gbmV3IENvbnRyb2xCb3godGhpcy50YWcsIHRoaXMuZ2V0Q29udHJvbGxlcnMoKSwgeCwgeSk7XG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5jb250cm9sQm94ZXMucHVzaCh0aGlzLmNvbnRyb2xCb3gpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zUmFuZ2UsIG0sIHYsIHZSYW5nZSkge1xuICAgICAgICB0aGlzLm1Db250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJNYXNzIG1cIiwgdGhpcy5jb25maWcuTUFTU19NSU4sIHRoaXMuY29uZmlnLk1BU1NfTUFYLCBtLCB0aGlzLmNvbnRyb2xNKTtcbiAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geFwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1swXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geVwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1sxXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4FcIiwgMCwgdlJhbmdlLCB2WzBdLCB0aGlzLmNvbnRyb2xWKTtcbiAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4ZcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMV0pLCB0aGlzLmNvbnRyb2xWKTtcbiAgICB9XG5cbiAgICBnZXRDb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1hDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlJob0NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZQaGlDb250cm9sbGVyXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFJhZGl1c0Zyb21NYXNzKG0pIHtcbiAgICAgICAgcmV0dXJuIHBvdyhtLCAxIC8gMilcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0TWFzc0Zyb21SYWRpdXMocikge1xuICAgICAgICByZXR1cm4gc3F1YXJlKHIpXG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7J3RhZyc6IHRoaXMudGFnLCAndic6IHRoaXMudiwgJ3Bvcyc6IHRoaXMucG9zfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuL2NpcmNsZScpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHNwaGVyaWNhbDJjYXJ0ZXNpYW59ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge2N1YmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5cbmNsYXNzIFNwaGVyZSBleHRlbmRzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogU3BoZXJpY2FsIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3BoZXJpY2FsX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBnZXRSYWRpdXMoKSB7XG4gICAgICAgIHJldHVybiBTcGhlcmUuZ2V0UmFkaXVzRnJvbU1hc3ModGhpcy5tKTtcbiAgICB9XG5cbiAgICBjb250cm9sUG9zKGUpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zWENvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc1lDb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB6ID0gdGhpcy5wb3NaQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBbeCwgeSwgel07XG4gICAgfVxuXG4gICAgY29udHJvbFYoZSkge1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudlBoaUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICBjb25zdCB0aGV0YSA9IGRlZzJyYWQodGhpcy52VGhldGFDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52UmhvQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy52ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyaG8sIHBoaSwgdGhldGEpO1xuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICBzdXBlci5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICB0aGlzLnBvc1pDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB6XCIsIC1wb3NfcmFuZ2UsIHBvc19yYW5nZSwgdGhpcy5wb3NbMl0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMudlRoZXRhQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgzrhcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMl0pLCB0aGlzLmNvbnRyb2xWKTtcbiAgICB9XG5cbiAgICBnZXRDb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1hDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWkNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlRoZXRhQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRSYWRpdXNGcm9tTWFzcyhtKSB7XG4gICAgICAgIHJldHVybiBwb3cobSwgMSAvIDMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRNYXNzRnJvbVJhZGl1cyhyKSB7XG4gICAgICAgIHJldHVybiBjdWJlKHIpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGhlcmU7IiwiY29uc3QgSW52aXNpYmxlRXJyb3IgPSByZXF1aXJlKCcuL2Vycm9yL2ludmlzaWJsZScpO1xuY29uc3Qge21hZywgZG90fSA9IHJlcXVpcmUoJy4vbWF0cml4Jyk7XG5cbmNvbnN0IFV0aWwgPSB7XG4gICAgc3F1YXJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHg7XG4gICAgfSxcblxuICAgIGN1YmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeCAqIHg7XG4gICAgfSxcblxuICAgIHBvbGFyMmNhcnRlc2lhbjogKHJobywgcGhpKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4ocGhpKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4ycG9sYXI6ICh4LCB5KSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYWcoW3gsIHldKSxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeSwgeClcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgc3BoZXJpY2FsMmNhcnRlc2lhbjogKHJobywgcGhpLCB0aGV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyh0aGV0YSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnNwaGVyaWNhbDogKHgsIHksIHopID0+IHtcbiAgICAgICAgY29uc3QgcmhvID0gbWFnKFt4LCB5LCB6XSk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8sXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpLFxuICAgICAgICAgICAgcmhvICE9IDAgPyBNYXRoLmFjb3MoeiAvIHJobykgOiAwXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJhdXRvOiAodmVjdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiB2ZWN0b3IubGVuZ3RoID09IDJcbiAgICAgICAgICAgID8gVXRpbC5jYXJ0ZXNpYW4ycG9sYXIodmVjdG9yWzBdLCB2ZWN0b3JbMV0pXG4gICAgICAgICAgICA6IFV0aWwuY2FydGVzaWFuMnNwaGVyaWNhbCh2ZWN0b3JbMF0sIHZlY3RvclsxXSwgdmVjdG9yWzJdKTtcbiAgICB9LFxuXG4gICAgcmFkMmRlZzogKHJhZCkgPT4ge1xuICAgICAgICByZXR1cm4gcmFkIC8gTWF0aC5QSSAqIDE4MDtcbiAgICB9LFxuXG4gICAgZGVnMnJhZDogKGRlZykgPT4ge1xuICAgICAgICByZXR1cm4gZGVnIC8gMTgwICogTWF0aC5QSTtcbiAgICB9LFxuXG4gICAgZ2V0RGlzdGFuY2U6ICh4MCwgeTAsIHgxLCB5MSkgPT4ge1xuICAgICAgICByZXR1cm4gbWFnKFt4MSAtIHgwLCB5MSAtIHkwXSk7XG4gICAgfSxcblxuICAgIHJvdGF0ZTogKHZlY3RvciwgbWF0cml4KSA9PiB7XG4gICAgICAgIHJldHVybiBkb3QoW3ZlY3Rvcl0sIG1hdHJpeClbMF07XG4gICAgfSxcblxuICAgIG5vdzogKCkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICAgIH0sXG5cbiAgICByYW5kb206IChtaW4sIG1heCA9IG51bGwpID0+IHtcbiAgICAgICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICAgICAgICBtYXggPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4gICAgfSxcblxuICAgIHJhbmRDb2xvcjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gJyMnICsgTWF0aC5mbG9vcigweDEwMDAwMDAgKyBNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xuICAgIH0sXG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbl0sXG4gICAgICAgICAgICBbc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFhSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIGNvcywgLXNpbl0sXG4gICAgICAgICAgICBbMCwgc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFlSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgMCwgc2luXSxcbiAgICAgICAgICAgIFswLCAxLCAwXSxcbiAgICAgICAgICAgIFstc2luLCAwLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFpSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbiwgMF0sXG4gICAgICAgICAgICBbc2luLCBjb3MsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDFdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIHNraXBJbnZpc2libGVFcnJvcjogZnVuYyA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuYygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgSW52aXNpYmxlRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWw7Il19

//# sourceMappingURL=gravity_simulator.js.map
