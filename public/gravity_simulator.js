/**
 * Gravity Simulator - Universal Gravity and Elastic Collision Simulator
 * @version v0.0.1
 * @author Jason Park
 * @link https://github.com/parkjs814/Gravity-Simulator
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var preset = require('./preset');
var Simulator = require('./simulator');

var simulator = new Simulator(preset);
simulator.animate();

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

var _require = require('./simulator/util'),
    deg2rad = _require.deg2rad,
    getXRotationMatrix = _require.getXRotationMatrix,
    getYRotationMatrix = _require.getYRotationMatrix,
    rotate = _require.rotate;

var angleX = deg2rad(30);
var angleY = deg2rad(50);
var Rx = getXRotationMatrix(angleX);
var Rx_ = getXRotationMatrix(angleX, -1);
var Ry = getYRotationMatrix(angleY);
var Ry_ = getYRotationMatrix(angleY, -1);
console.log(rotate(rotate(rotate(rotate([-5, 8, 3], Rx), Ry), Ry_), Rx_));

},{"./preset":2,"./simulator":10,"./simulator/util":14}],2:[function(require,module,exports){
'use strict';

var _$ = $,
    extend = _$.extend;


function EMPTY_2D(c) {
    return extend(true, c, {
        TITLE: 'Gravity Simulator',
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

function EMPTY_3D(c) {
    return extend(true, EMPTY_2D(c), {
        DIMENSION: 3,
        G: 0.001,
        MASS_MIN: 1,
        MASS_MAX: 8e6,
        VELOCITY_MAX: 10
    });
}

function TEST(c) {
    return extend(true, EMPTY_3D(c), {
        init: function init(engine) {
            engine.createObject('ball1', [-150, 0, 0], 1000000, [0, 0, 0], 'green');
            engine.createObject('ball2', [50, 0, 0], 10000, [0, 0, 0], 'blue');
            engine.toggleAnimating();
        }
    });
}

module.exports = EMPTY_3D;

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
        this.center = [config.W / 2, config.H / 2];
    }

    _createClass(Camera2D, [{
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
        key: 'animate',
        value: function animate() {
            var _this = this;

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
                c1 = _camera$adjustCoords4.coords,
                z1 = _camera$adjustCoords4.z1;

            var _camera$adjustCoords5 = this.camera.adjustCoords(obj.pos),
                c2 = _camera$adjustCoords5.coords,
                z2 = _camera$adjustCoords5.z2;

            return c1.concat(c2, max(z1, z2));
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

function on_resize($canvas) {
    config.W = $canvas[0].width = $canvas.width();
    config.H = $canvas[0].height = $canvas.height();
}

function on_click(event, engine) {
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

function on_key_down(event, engine) {
    var keyCode = event.keyCode;

    if (keyCode == 32) {
        // space bar
        engine.destroyControlBoxes();
        engine.toggleAnimating();
    } else if (keyCode in keymap && keymap[keyCode] in engine.camera) {
        engine.camera[keymap[keyCode]](keyCode);
    }
}

var Simulator = function () {
    function Simulator(preset) {
        var _this = this;

        _classCallCheck(this, Simulator);

        config = preset({});
        var $canvas = $('canvas');
        var ctx = $canvas[0].getContext('2d');
        on_resize($canvas);
        this.engine = new (config.DIMENSION == 2 ? Engine2D : Engine3D)(config, ctx);
        if ('init' in config) config.init(this.engine);
        $canvas.resize(function (e) {
            on_resize($canvas);
        });
        $canvas.click(function (e) {
            on_click(e, _this.engine);
        });
        $('body').keydown(function (e) {
            on_key_down(e, _this.engine);
        });
    }

    _createClass(Simulator, [{
        key: 'animate',
        value: function animate() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTSxZQUFZLFFBQVEsYUFBUixDQUFsQjs7QUFFQSxJQUFNLFlBQVksSUFBSSxTQUFKLENBQWMsTUFBZCxDQUFsQjtBQUNBLFVBQVUsT0FBVjs7QUFFQSxJQUFJLFVBQVUsSUFBZDtBQUNBLElBQUksV0FBSjtBQUFBLElBQVEsV0FBUjs7QUFFQSxFQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsV0FBYixFQUEwQix5QkFBMUIsRUFBcUQsVUFBVSxDQUFWLEVBQWE7QUFDOUQsU0FBSyxFQUFFLEtBQVA7QUFDQSxTQUFLLEVBQUUsS0FBUDtBQUNBLGNBQVUsRUFBRSxJQUFGLEVBQVEsTUFBUixDQUFlLGNBQWYsQ0FBVjtBQUNBLFlBQVEsU0FBUixDQUFrQix1QkFBbEIsRUFBMkMsWUFBM0MsQ0FBd0QsT0FBeEQ7QUFDQSxXQUFPLEtBQVA7QUFDSCxDQU5EOztBQVFBLEVBQUUsTUFBRixFQUFVLFNBQVYsQ0FBb0IsVUFBVSxDQUFWLEVBQWE7QUFDN0IsUUFBSSxDQUFDLE9BQUwsRUFBYztBQUNkLFFBQU0sSUFBSSxFQUFFLEtBQVo7QUFDQSxRQUFNLElBQUksRUFBRSxLQUFaO0FBQ0EsWUFBUSxHQUFSLENBQVksTUFBWixFQUFvQixTQUFTLFFBQVEsR0FBUixDQUFZLE1BQVosQ0FBVCxLQUFpQyxJQUFJLEVBQXJDLElBQTJDLElBQS9EO0FBQ0EsWUFBUSxHQUFSLENBQVksS0FBWixFQUFtQixTQUFTLFFBQVEsR0FBUixDQUFZLEtBQVosQ0FBVCxLQUFnQyxJQUFJLEVBQXBDLElBQTBDLElBQTdEO0FBQ0EsU0FBSyxFQUFFLEtBQVA7QUFDQSxTQUFLLEVBQUUsS0FBUDtBQUNILENBUkQ7O0FBVUEsRUFBRSxNQUFGLEVBQVUsT0FBVixDQUFrQixVQUFVLENBQVYsRUFBYTtBQUMzQixjQUFVLElBQVY7QUFDSCxDQUZEOztlQUlrRSxRQUFRLGtCQUFSLEM7SUFBM0QsTyxZQUFBLE87SUFBUyxrQixZQUFBLGtCO0lBQW9CLGtCLFlBQUEsa0I7SUFBb0IsTSxZQUFBLE07O0FBQ3hELElBQU0sU0FBUyxRQUFRLEVBQVIsQ0FBZjtBQUNBLElBQU0sU0FBUyxRQUFRLEVBQVIsQ0FBZjtBQUNBLElBQU0sS0FBSyxtQkFBbUIsTUFBbkIsQ0FBWDtBQUNBLElBQU0sTUFBTSxtQkFBbUIsTUFBbkIsRUFBMkIsQ0FBQyxDQUE1QixDQUFaO0FBQ0EsSUFBTSxLQUFLLG1CQUFtQixNQUFuQixDQUFYO0FBQ0EsSUFBTSxNQUFNLG1CQUFtQixNQUFuQixFQUEyQixDQUFDLENBQTVCLENBQVo7QUFDQSxRQUFRLEdBQVIsQ0FBWSxPQUFPLE9BQU8sT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxFQUFRLENBQVIsQ0FBUCxFQUFtQixFQUFuQixDQUFQLEVBQStCLEVBQS9CLENBQVAsRUFBMkMsR0FBM0MsQ0FBUCxFQUF3RCxHQUF4RCxDQUFaOzs7OztTQ3RDaUIsQztJQUFWLE0sTUFBQSxNOzs7QUFHUCxTQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUI7QUFDakIsV0FBTyxPQUFPLElBQVAsRUFBYSxDQUFiLEVBQWdCO0FBQ25CLGVBQU8sbUJBRFk7QUFFbkIsb0JBQVksT0FGTztBQUduQixtQkFBVyxDQUhRO0FBSW5CLG1CQUFXLElBSlE7QUFLbkIsMkJBQW1CLENBTEE7QUFNbkIsMkJBQW1CLENBTkE7QUFPbkIsNkJBQXFCLEdBUEY7QUFRbkIsV0FBRyxHQVJnQjtBQVNuQixrQkFBVSxDQVRTO0FBVW5CLGtCQUFVLEdBVlM7QUFXbkIsc0JBQWMsRUFYSztBQVluQiwwQkFBa0IsRUFaQztBQWFuQix5QkFBaUI7QUFiRSxLQUFoQixDQUFQO0FBZUg7O0FBR0QsU0FBUyxRQUFULENBQWtCLENBQWxCLEVBQXFCO0FBQ2pCLFdBQU8sT0FBTyxJQUFQLEVBQWEsU0FBUyxDQUFULENBQWIsRUFBMEI7QUFDN0IsbUJBQVcsQ0FEa0I7QUFFN0IsV0FBRyxLQUYwQjtBQUc3QixrQkFBVSxDQUhtQjtBQUk3QixrQkFBVSxHQUptQjtBQUs3QixzQkFBYztBQUxlLEtBQTFCLENBQVA7QUFPSDs7QUFFRCxTQUFTLElBQVQsQ0FBYyxDQUFkLEVBQWlCO0FBQ2IsV0FBTyxPQUFPLElBQVAsRUFBYSxTQUFTLENBQVQsQ0FBYixFQUEwQjtBQUM3QixjQUFNLGNBQUMsTUFBRCxFQUFZO0FBQ2QsbUJBQU8sWUFBUCxDQUFvQixPQUFwQixFQUE2QixDQUFDLENBQUMsR0FBRixFQUFPLENBQVAsRUFBVSxDQUFWLENBQTdCLEVBQTJDLE9BQTNDLEVBQW9ELENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQXBELEVBQStELE9BQS9EO0FBQ0EsbUJBQU8sWUFBUCxDQUFvQixPQUFwQixFQUE2QixDQUFDLEVBQUQsRUFBSyxDQUFMLEVBQVEsQ0FBUixDQUE3QixFQUF5QyxLQUF6QyxFQUFnRCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFoRCxFQUEyRCxNQUEzRDtBQUNBLG1CQUFPLGVBQVA7QUFDSDtBQUw0QixLQUExQixDQUFQO0FBT0g7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7QUMxQ0EsSUFBTSxpQkFBaUIsUUFBUSxvQkFBUixDQUF2Qjs7ZUFDa0QsUUFBUSxTQUFSLEM7SUFBM0MsTyxZQUFBLE87SUFBUyxNLFlBQUEsTTtJQUFRLEcsWUFBQSxHO0lBQUssaUIsWUFBQSxpQjs7Z0JBQ2lCLFFBQVEsV0FBUixDO0lBQXZDLEssYUFBQSxLO0lBQU8sRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHOztJQUNoQyxHLEdBQU8sSSxDQUFQLEc7O0lBRUQsUTtBQUNGLHNCQUFZLE1BQVosRUFBb0IsTUFBcEIsRUFBNEI7QUFBQTs7QUFDeEIsYUFBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLGFBQUssQ0FBTCxHQUFTLENBQVQ7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxDQUFMLEdBQVMsT0FBTyxlQUFoQjtBQUNBLGFBQUssR0FBTCxHQUFXLENBQVg7QUFDQSxhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsYUFBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0EsYUFBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLGFBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxhQUFLLE1BQUwsR0FBYyxDQUFDLE9BQU8sQ0FBUCxHQUFXLENBQVosRUFBZSxPQUFPLENBQVAsR0FBVyxDQUExQixDQUFkO0FBQ0g7Ozs7cUNBRVksRyxFQUFLO0FBQ2QsZ0JBQU0sY0FBYyxLQUFwQjtBQUNBLGdCQUFJLE9BQU8sS0FBSyxPQUFaLElBQXVCLGNBQWMsS0FBSyxRQUFuQixHQUE4QixDQUF6RCxFQUE0RDtBQUN4RCxxQkFBSyxLQUFMLElBQWMsQ0FBZDtBQUNILGFBRkQsTUFFTztBQUNILHFCQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0g7QUFDRCxpQkFBSyxRQUFMLEdBQWdCLFdBQWhCO0FBQ0EsaUJBQUssT0FBTCxHQUFlLEdBQWY7QUFDQSxtQkFBTyxLQUFLLE1BQUwsQ0FBWSxpQkFBWixHQUFnQyxJQUFJLEtBQUssTUFBTCxDQUFZLG1CQUFoQixFQUFxQyxLQUFLLEtBQTFDLENBQXZDO0FBQ0g7OzsyQkFFRSxHLEVBQUs7QUFDSixpQkFBSyxDQUFMLElBQVUsS0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7Ozs2QkFFSSxHLEVBQUs7QUFDTixpQkFBSyxDQUFMLElBQVUsS0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7Ozs2QkFFSSxHLEVBQUs7QUFDTixpQkFBSyxDQUFMLElBQVUsS0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7Ozs4QkFFSyxHLEVBQUs7QUFDUCxpQkFBSyxDQUFMLElBQVUsS0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OzsrQkFFTSxHLEVBQUs7QUFDUixpQkFBSyxDQUFMLElBQVUsS0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OztnQ0FFTyxHLEVBQUs7QUFDVCxpQkFBSyxDQUFMLElBQVUsS0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OzttQ0FFVSxHLEVBQUs7QUFDWixpQkFBSyxHQUFMLElBQVksS0FBSyxNQUFMLENBQVksaUJBQXhCO0FBQ0EsaUJBQUssT0FBTDtBQUNIOzs7b0NBRVcsRyxFQUFLO0FBQ2IsaUJBQUssR0FBTCxJQUFZLEtBQUssTUFBTCxDQUFZLGlCQUF4QjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O2tDQUVTLENBQ1Q7OztrQ0FFYztBQUFBLGdCQUFQLENBQU8sdUVBQUgsQ0FBRzs7QUFDWCxnQkFBSSxXQUFXLEtBQUssQ0FBTCxHQUFTLENBQXhCO0FBQ0EsZ0JBQUksWUFBWSxDQUFoQixFQUFtQjtBQUNmLHNCQUFNLElBQUksY0FBSixFQUFOO0FBQ0g7QUFDRCxtQkFBTyxLQUFLLE1BQUwsQ0FBWSxlQUFaLEdBQThCLFFBQXJDO0FBQ0g7OztxQ0FFWSxDLEVBQUc7QUFDWixnQkFBTSxJQUFJLGtCQUFrQixRQUFRLEtBQUssR0FBYixDQUFsQixDQUFWO0FBQ0EsZ0JBQUksT0FBTyxDQUFQLEVBQVUsQ0FBVixDQUFKO0FBQ0EsZ0JBQU0sT0FBTyxLQUFLLE9BQUwsRUFBYjtBQUNBLGdCQUFNLFNBQVMsSUFBSSxLQUFLLE1BQVQsRUFBaUIsSUFBSSxJQUFJLENBQUosRUFBTyxDQUFDLEtBQUssQ0FBTixFQUFTLEtBQUssQ0FBZCxDQUFQLENBQUosRUFBOEIsSUFBOUIsQ0FBakIsQ0FBZjtBQUNBLG1CQUFPLEVBQUMsY0FBRCxFQUFQO0FBQ0g7OztxQ0FFWSxNLEVBQVEsTSxFQUFRO0FBQ3pCLGdCQUFNLE9BQU8sS0FBSyxPQUFMLEVBQWI7QUFDQSxtQkFBTyxTQUFTLElBQWhCO0FBQ0g7OztvQ0FFVyxDLEVBQUcsQyxFQUFHO0FBQ2QsZ0JBQU0sS0FBSyxrQkFBa0IsUUFBUSxLQUFLLEdBQWIsQ0FBbEIsRUFBcUMsQ0FBQyxDQUF0QyxDQUFYO0FBQ0EsZ0JBQU0sT0FBTyxLQUFLLE9BQUwsRUFBYjtBQUNBLG1CQUFPLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFKLEVBQVksS0FBSyxNQUFqQixDQUFKLEVBQThCLElBQTlCLENBQUosRUFBeUMsQ0FBQyxLQUFLLENBQU4sRUFBUyxLQUFLLENBQWQsQ0FBekMsQ0FBUCxFQUFtRSxFQUFuRSxDQUFQO0FBQ0g7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixRQUFqQjs7Ozs7Ozs7Ozs7OztBQ3RHQSxJQUFNLFdBQVcsUUFBUSxNQUFSLENBQWpCOztlQUNrRSxRQUFRLFNBQVIsQztJQUEzRCxPLFlBQUEsTztJQUFTLE0sWUFBQSxNO0lBQVEsa0IsWUFBQSxrQjtJQUFvQixrQixZQUFBLGtCOztnQkFDRSxRQUFRLFdBQVIsQztJQUF2QyxLLGFBQUEsSztJQUFPLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRzs7SUFHakMsUTs7O0FBQ0Ysc0JBQVksTUFBWixFQUFvQixNQUFwQixFQUE0QjtBQUFBOztBQUFBLHdIQUNsQixNQURrQixFQUNWLE1BRFU7O0FBRXhCLGNBQUssS0FBTCxHQUFhLENBQWI7QUFGd0I7QUFHM0I7Ozs7aUNBRVEsRyxFQUFLO0FBQ1YsaUJBQUssS0FBTCxJQUFjLEtBQUssTUFBTCxDQUFZLGlCQUExQjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O21DQUVVLEcsRUFBSztBQUNaLGlCQUFLLEtBQUwsSUFBYyxLQUFLLE1BQUwsQ0FBWSxpQkFBMUI7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OztzQ0FFYSxDLEVBQUc7QUFDYixnQkFBTSxLQUFLLG1CQUFtQixRQUFRLEtBQUssS0FBYixDQUFuQixDQUFYO0FBQ0EsZ0JBQU0sS0FBSyxtQkFBbUIsUUFBUSxLQUFLLEdBQWIsQ0FBbkIsQ0FBWDtBQUNBLG1CQUFPLE9BQU8sT0FBTyxDQUFQLEVBQVUsRUFBVixDQUFQLEVBQXNCLEVBQXRCLENBQVA7QUFDSDs7O3FDQUVZLEMsRUFBRztBQUNaLGdCQUFJLEtBQUssYUFBTCxDQUFtQixDQUFuQixDQUFKO0FBQ0EsZ0JBQU0sSUFBSSxFQUFFLEdBQUYsRUFBVjtBQUNBLGdCQUFNLE9BQU8sS0FBSyxPQUFMLENBQWEsQ0FBYixDQUFiO0FBQ0EsZ0JBQU0sU0FBUyxJQUFJLEtBQUssTUFBVCxFQUFpQixJQUFJLElBQUksQ0FBSixFQUFPLENBQUMsS0FBSyxDQUFOLEVBQVMsS0FBSyxDQUFkLENBQVAsQ0FBSixFQUE4QixJQUE5QixDQUFqQixDQUFmO0FBQ0EsbUJBQU8sRUFBQyxjQUFELEVBQVMsSUFBVCxFQUFQO0FBQ0g7OztxQ0FFWSxDLEVBQUcsTSxFQUFRO0FBQ3BCLGdCQUFJLEtBQUssYUFBTCxDQUFtQixDQUFuQixDQUFKO0FBQ0EsZ0JBQU0sSUFBSSxFQUFFLEdBQUYsRUFBVjtBQUNBLGdCQUFNLE9BQU8sS0FBSyxPQUFMLENBQWEsQ0FBYixDQUFiO0FBQ0EsbUJBQU8sU0FBUyxJQUFoQjtBQUNIOzs7b0NBRVcsQyxFQUFHLEMsRUFBRztBQUNkLGdCQUFNLE1BQU0sbUJBQW1CLFFBQVEsS0FBSyxLQUFiLENBQW5CLEVBQXdDLENBQUMsQ0FBekMsQ0FBWjtBQUNBLGdCQUFNLE1BQU0sbUJBQW1CLFFBQVEsS0FBSyxHQUFiLENBQW5CLEVBQXNDLENBQUMsQ0FBdkMsQ0FBWjtBQUNBLGdCQUFNLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBSixFQUFZLEtBQUssTUFBakIsQ0FBSixFQUE4QixDQUFDLEtBQUssQ0FBTixFQUFTLEtBQUssQ0FBZCxDQUE5QixFQUFnRCxNQUFoRCxDQUF1RCxLQUFLLENBQUwsR0FBUyxLQUFLLE1BQUwsQ0FBWSxlQUE1RSxDQUFWO0FBQ0EsbUJBQU8sT0FBTyxPQUFPLENBQVAsRUFBVSxHQUFWLENBQVAsRUFBdUIsR0FBdkIsQ0FBUDtBQUNIOzs7O0VBMUNrQixROztBQTZDdkIsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7SUNsRE0sVTtBQUNGLHdCQUFZLEtBQVosRUFBbUIsV0FBbkIsRUFBZ0MsQ0FBaEMsRUFBbUMsQ0FBbkMsRUFBc0M7QUFBQTs7QUFDbEMsWUFBTSxzQkFBc0IsRUFBRSx1QkFBRixDQUE1QjtBQUNBLFlBQU0sY0FBYyxvQkFBb0IsS0FBcEIsRUFBcEI7QUFDQSxvQkFBWSxXQUFaLENBQXdCLFVBQXhCO0FBQ0Esb0JBQVksSUFBWixDQUFpQixRQUFqQixFQUEyQixJQUEzQixDQUFnQyxLQUFoQztBQUNBLFlBQU0sa0JBQWtCLFlBQVksSUFBWixDQUFpQixrQkFBakIsQ0FBeEI7QUFMa0M7QUFBQTtBQUFBOztBQUFBO0FBTWxDLGlDQUF5QixXQUF6Qiw4SEFBc0M7QUFBQSxvQkFBM0IsVUFBMkI7O0FBQ2xDLGdDQUFnQixNQUFoQixDQUF1QixXQUFXLGFBQWxDO0FBQ0g7QUFSaUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTbEMsb0JBQVksSUFBWixDQUFpQixRQUFqQixFQUEyQixLQUEzQixDQUFpQyxZQUFNO0FBQ25DLHdCQUFZLE1BQVo7QUFDSCxTQUZEO0FBR0Esb0JBQVksWUFBWixDQUF5QixtQkFBekI7QUFDQSxvQkFBWSxHQUFaLENBQWdCLE1BQWhCLEVBQXdCLElBQUksSUFBNUI7QUFDQSxvQkFBWSxHQUFaLENBQWdCLEtBQWhCLEVBQXVCLElBQUksSUFBM0I7O0FBRUEsYUFBSyxXQUFMLEdBQW1CLFdBQW5CO0FBQ0g7Ozs7Z0NBRU87QUFDSixpQkFBSyxXQUFMLENBQWlCLE1BQWpCO0FBQ0g7OztpQ0FFUTtBQUNMLG1CQUFPLEtBQUssV0FBTCxDQUFpQixDQUFqQixFQUFvQixVQUEzQjtBQUNIOzs7Ozs7QUFHTCxPQUFPLE9BQVAsR0FBaUIsVUFBakI7Ozs7Ozs7OztJQzdCTSxVO0FBQ0Ysd0JBQVksTUFBWixFQUFvQixJQUFwQixFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxLQUFwQyxFQUEyQyxJQUEzQyxFQUFpRDtBQUFBOztBQUFBOztBQUM3QyxZQUFNLGdCQUFnQixLQUFLLGFBQUwsR0FBcUIsRUFBRSwrQ0FBRixFQUFtRCxLQUFuRCxFQUEzQztBQUNBLHNCQUFjLFdBQWQsQ0FBMEIsVUFBMUI7QUFDQSxzQkFBYyxJQUFkLENBQW1CLE9BQW5CLEVBQTRCLElBQTVCLENBQWlDLElBQWpDO0FBQ0EsWUFBTSxTQUFTLEtBQUssTUFBTCxHQUFjLGNBQWMsSUFBZCxDQUFtQixPQUFuQixDQUE3QjtBQUNBLGVBQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsR0FBbkI7QUFDQSxlQUFPLElBQVAsQ0FBWSxLQUFaLEVBQW1CLEdBQW5CO0FBQ0EsZUFBTyxJQUFQLENBQVksT0FBWixFQUFxQixLQUFyQjtBQUNBLGVBQU8sSUFBUCxDQUFZLE1BQVosRUFBb0IsSUFBcEI7QUFDQSxZQUFNLFNBQVMsY0FBYyxJQUFkLENBQW1CLFFBQW5CLENBQWY7QUFDQSxlQUFPLElBQVAsQ0FBWSxLQUFLLEdBQUwsRUFBWjtBQUNBLGVBQU8sRUFBUCxDQUFVLE9BQVYsRUFBbUIsYUFBSztBQUNwQixtQkFBTyxJQUFQLENBQVksTUFBSyxHQUFMLEVBQVo7QUFDQSxpQkFBSyxJQUFMLENBQVUsTUFBVixFQUFrQixDQUFsQjtBQUNILFNBSEQ7QUFJSDs7Ozs4QkFFSztBQUNGLG1CQUFPLFdBQVcsS0FBSyxNQUFMLENBQVksR0FBWixFQUFYLENBQVA7QUFDSDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFVBQWpCOzs7Ozs7Ozs7QUN2QkEsSUFBTSxTQUFTLFFBQVEsa0JBQVIsQ0FBZjtBQUNBLElBQU0sV0FBVyxRQUFRLGNBQVIsQ0FBakI7O2VBQ2lILFFBQVEsU0FBUixDO0lBQTFHLE0sWUFBQSxNO0lBQVEsRyxZQUFBLEc7SUFBSyxNLFlBQUEsTTtJQUFRLGUsWUFBQSxlO0lBQWlCLFMsWUFBQSxTO0lBQVcsa0IsWUFBQSxpQjtJQUFtQixjLFlBQUEsYztJQUFnQixrQixZQUFBLGtCOztnQkFDdkQsUUFBUSxXQUFSLEM7SUFBN0IsSyxhQUFBLEs7SUFBTyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRzs7SUFDdEIsRyxHQUFZLEksQ0FBWixHO0lBQUssRyxHQUFPLEksQ0FBUCxHOztJQUdOLEksR0FDRixjQUFZLEdBQVosRUFBaUI7QUFBQTs7QUFDYixTQUFLLE9BQUwsR0FBZSxJQUFJLE9BQUosQ0FBWSxLQUFaLEVBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUSxLQUFSLEVBQVg7QUFDSCxDOztJQUdDLFE7QUFDRixzQkFBWSxNQUFaLEVBQW9CLEdBQXBCLEVBQXlCO0FBQUE7O0FBQ3JCLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxhQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsYUFBSyxJQUFMLEdBQVksRUFBWjtBQUNBLGFBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNBLGFBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLGFBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxhQUFLLE1BQUwsR0FBYyxJQUFJLFFBQUosQ0FBYSxNQUFiLEVBQXFCLElBQXJCLENBQWQ7QUFDQSxhQUFLLFdBQUwsR0FBbUIsS0FBbkI7QUFDQSxhQUFLLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDSDs7OzswQ0FFaUI7QUFDZCxpQkFBSyxTQUFMLEdBQWlCLENBQUMsS0FBSyxTQUF2QjtBQUNBLHFCQUFTLEtBQVQsR0FBb0IsS0FBSyxNQUFMLENBQVksS0FBaEMsV0FBMEMsS0FBSyxTQUFMLEdBQWlCLFlBQWpCLEdBQWdDLFFBQTFFO0FBQ0g7Ozs4Q0FFcUI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDbEIscUNBQXlCLEtBQUssWUFBOUIsOEhBQTRDO0FBQUEsd0JBQWpDLFVBQWlDOztBQUN4QywrQkFBVyxLQUFYO0FBQ0g7QUFIaUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFJbEIsaUJBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNIOzs7a0NBRVM7QUFBQTs7QUFDTixpQkFBSyxRQUFMO0FBQ0EsZ0JBQUksS0FBSyxTQUFULEVBQW9CO0FBQ2hCLHFCQUFLLFlBQUw7QUFDSDtBQUNELGlCQUFLLFNBQUw7QUFDQSx1QkFBVyxZQUFNO0FBQ2Isc0JBQUssT0FBTDtBQUNILGFBRkQsRUFFRyxFQUZIO0FBR0g7OztxQ0FFWSxHLEVBQUs7QUFDZCxnQkFBTSxJQUFJLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBSSxHQUE3QixFQUFrQyxJQUFJLFNBQUosRUFBbEMsQ0FBVjs7QUFEYyx1Q0FFTSxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLElBQUksR0FBN0IsQ0FGTjtBQUFBLGdCQUVQLE1BRk8sd0JBRVAsTUFGTztBQUFBLGdCQUVDLENBRkQsd0JBRUMsQ0FGRDs7QUFHZCxtQkFBTyxPQUFPLE1BQVAsQ0FBYyxDQUFkLEVBQWlCLE1BQWpCLENBQXdCLENBQXhCLENBQVA7QUFDSDs7O3dDQUVlLEcsRUFBNEM7QUFBQSxnQkFBdkMsTUFBdUMsdUVBQTlCLEtBQUssTUFBTCxDQUFZLGdCQUFrQjs7QUFBQSx3Q0FDbkMsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixJQUFJLEdBQTdCLENBRG1DO0FBQUEsZ0JBQ3pDLEVBRHlDLHlCQUNqRCxNQURpRDs7QUFBQSx3Q0FFaEMsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixJQUFJLElBQUksR0FBUixFQUFhLElBQUksSUFBSSxDQUFSLEVBQVcsTUFBWCxDQUFiLENBQXpCLENBRmdDO0FBQUEsZ0JBRXpDLEVBRnlDLHlCQUVqRCxNQUZpRDtBQUFBLGdCQUVyQyxDQUZxQyx5QkFFckMsQ0FGcUM7O0FBR3hELG1CQUFPLEdBQUcsTUFBSCxDQUFVLEVBQVYsRUFBYyxNQUFkLENBQXFCLENBQXJCLENBQVA7QUFDSDs7O21DQUVVLEcsRUFBSztBQUFBLHdDQUNhLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBSSxPQUE3QixDQURiO0FBQUEsZ0JBQ0csRUFESCx5QkFDTCxNQURLO0FBQUEsZ0JBQ08sRUFEUCx5QkFDTyxFQURQOztBQUFBLHdDQUVhLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBSSxHQUE3QixDQUZiO0FBQUEsZ0JBRUcsRUFGSCx5QkFFTCxNQUZLO0FBQUEsZ0JBRU8sRUFGUCx5QkFFTyxFQUZQOztBQUdaLG1CQUFPLEdBQUcsTUFBSCxDQUFVLEVBQVYsRUFBYyxJQUFJLEVBQUosRUFBUSxFQUFSLENBQWQsQ0FBUDtBQUNIOzs7bUNBRVUsQyxFQUFpQjtBQUFBOztBQUFBLGdCQUFkLEtBQWMsdUVBQU4sSUFBTTs7QUFDeEIsK0JBQW1CLFlBQU07QUFDckIsd0JBQVEsU0FBUyxFQUFFLEtBQW5CO0FBQ0Esb0JBQUksYUFBYSxNQUFqQixFQUF5QjtBQUNyQix3QkFBSSxPQUFLLFlBQUwsQ0FBa0IsQ0FBbEIsQ0FBSjtBQUNIO0FBQ0QsdUJBQUssR0FBTCxDQUFTLFNBQVQ7QUFDQSx1QkFBSyxHQUFMLENBQVMsR0FBVCxDQUFhLEVBQUUsQ0FBRixDQUFiLEVBQW1CLEVBQUUsQ0FBRixDQUFuQixFQUF5QixFQUFFLENBQUYsQ0FBekIsRUFBK0IsQ0FBL0IsRUFBa0MsSUFBSSxLQUFLLEVBQTNDLEVBQStDLEtBQS9DO0FBQ0EsdUJBQUssR0FBTCxDQUFTLFNBQVQsR0FBcUIsS0FBckI7QUFDQSx1QkFBSyxHQUFMLENBQVMsSUFBVDtBQUNILGFBVEQ7QUFVSDs7O3NDQUVhLEMsRUFBRztBQUFBOztBQUNiLCtCQUFtQixZQUFNO0FBQ3JCLG9CQUFJLGFBQWEsTUFBakIsRUFBeUI7QUFDckIsd0JBQUksT0FBSyxlQUFMLENBQXFCLENBQXJCLENBQUo7QUFDSDtBQUNELHVCQUFLLEdBQUwsQ0FBUyxTQUFUO0FBQ0EsdUJBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsRUFBRSxDQUFGLENBQWhCLEVBQXNCLEVBQUUsQ0FBRixDQUF0QjtBQUNBLHVCQUFLLEdBQUwsQ0FBUyxNQUFULENBQWdCLEVBQUUsQ0FBRixDQUFoQixFQUFzQixFQUFFLENBQUYsQ0FBdEI7QUFDQSx1QkFBSyxHQUFMLENBQVMsV0FBVCxHQUF1QixTQUF2QjtBQUNBLHVCQUFLLEdBQUwsQ0FBUyxNQUFUO0FBQ0gsYUFURDtBQVVIOzs7aUNBRVEsQyxFQUFHO0FBQUE7O0FBQ1IsK0JBQW1CLFlBQU07QUFDckIsb0JBQUksYUFBYSxJQUFqQixFQUF1QjtBQUNuQix3QkFBSSxPQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FBSjtBQUNIO0FBQ0QsdUJBQUssR0FBTCxDQUFTLFNBQVQ7QUFDQSx1QkFBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixFQUFFLENBQUYsQ0FBaEIsRUFBc0IsRUFBRSxDQUFGLENBQXRCO0FBQ0EsdUJBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsRUFBRSxDQUFGLENBQWhCLEVBQXNCLEVBQUUsQ0FBRixDQUF0QjtBQUNBLHVCQUFLLEdBQUwsQ0FBUyxXQUFULEdBQXVCLFNBQXZCO0FBQ0EsdUJBQUssR0FBTCxDQUFTLE1BQVQ7QUFDSCxhQVREO0FBVUg7OzttQ0FFVSxHLEVBQUs7QUFDWixnQkFBSSxJQUFJLElBQUksSUFBSSxHQUFSLEVBQWEsSUFBSSxPQUFqQixDQUFKLElBQWlDLENBQXJDLEVBQXdDO0FBQ3BDLHFCQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLElBQUksSUFBSixDQUFTLEdBQVQsQ0FBaEI7QUFDQSxvQkFBSSxPQUFKLEdBQWMsSUFBSSxHQUFKLENBQVEsS0FBUixFQUFkO0FBQ0Esb0JBQUksS0FBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixLQUFLLE1BQUwsQ0FBWSxTQUFwQyxFQUErQztBQUMzQyx5QkFBSyxLQUFMLEdBQWEsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixDQUFqQixDQUFiO0FBQ0g7QUFDSjtBQUNKOzs7eUNBRWdCLEMsRUFBRyxDLEVBQUc7QUFDbkIsZ0JBQU0sTUFBTSxLQUFLLE1BQUwsQ0FBWSxXQUFaLENBQXdCLENBQXhCLEVBQTJCLENBQTNCLENBQVo7QUFDQSxnQkFBSSxPQUFPLE9BQU8saUJBQVAsQ0FBeUIsS0FBSyxNQUFMLENBQVksUUFBckMsQ0FBWDtBQUZtQjtBQUFBO0FBQUE7O0FBQUE7QUFHbkIsc0NBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUEsd0JBQWxCLElBQWtCOztBQUN6QiwyQkFBTyxJQUFJLElBQUosRUFBVSxDQUFDLElBQUksSUFBSSxLQUFJLEdBQVIsRUFBYSxHQUFiLENBQUosSUFBeUIsS0FBSSxTQUFKLEVBQTFCLElBQTZDLEdBQXZELENBQVA7QUFDSDtBQUxrQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1uQixnQkFBTSxJQUFJLE9BQU8saUJBQVAsQ0FBeUIsT0FBTyxPQUFPLGlCQUFQLENBQXlCLEtBQUssTUFBTCxDQUFZLFFBQXJDLENBQVAsRUFBdUQsSUFBdkQsQ0FBekIsQ0FBVjtBQUNBLGdCQUFNLElBQUksZ0JBQWdCLE9BQU8sS0FBSyxNQUFMLENBQVksWUFBWixHQUEyQixDQUFsQyxDQUFoQixFQUFzRCxPQUFPLENBQUMsR0FBUixFQUFhLEdBQWIsQ0FBdEQsQ0FBVjtBQUNBLGdCQUFNLFFBQVEsV0FBZDtBQUNBLGdCQUFNLGlCQUFlLEtBQUssSUFBTCxDQUFVLE1BQS9CO0FBQ0EsZ0JBQU0sTUFBTSxJQUFJLE1BQUosQ0FBVyxLQUFLLE1BQWhCLEVBQXdCLENBQXhCLEVBQTJCLEdBQTNCLEVBQWdDLENBQWhDLEVBQW1DLEtBQW5DLEVBQTBDLEdBQTFDLEVBQStDLElBQS9DLENBQVo7QUFDQSxnQkFBSSxjQUFKLENBQW1CLENBQW5CLEVBQXNCLENBQXRCO0FBQ0EsaUJBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxHQUFmO0FBQ0g7OztxQ0FFWSxHLEVBQUssRyxFQUFLLEMsRUFBRyxDLEVBQUcsSyxFQUFPO0FBQ2hDLGdCQUFNLE1BQU0sSUFBSSxNQUFKLENBQVcsS0FBSyxNQUFoQixFQUF3QixDQUF4QixFQUEyQixHQUEzQixFQUFnQyxDQUFoQyxFQUFtQyxLQUFuQyxFQUEwQyxHQUExQyxFQUErQyxJQUEvQyxDQUFaO0FBQ0EsaUJBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxHQUFmO0FBQ0g7OzswQ0FFaUIsTSxFQUFpQjtBQUFBLGdCQUFULEdBQVMsdUVBQUgsQ0FBRzs7QUFDL0IsbUJBQU8sbUJBQWtCLE9BQU8sQ0FBUCxDQUFsQixFQUE2QixHQUE3QixDQUFQO0FBQ0g7Ozt1Q0FFYztBQUNYLG1CQUFPLENBQVA7QUFDSDs7OzZDQUVvQjtBQUNqQixnQkFBTSxZQUFZLEtBQUssTUFBTCxDQUFZLFNBQTlCO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLElBQUwsQ0FBVSxNQUE5QixFQUFzQyxHQUF0QyxFQUEyQztBQUN2QyxvQkFBTSxLQUFLLEtBQUssSUFBTCxDQUFVLENBQVYsQ0FBWDtBQUNBLHFCQUFLLElBQUksSUFBSSxJQUFJLENBQWpCLEVBQW9CLElBQUksS0FBSyxJQUFMLENBQVUsTUFBbEMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDM0Msd0JBQU0sS0FBSyxLQUFLLElBQUwsQ0FBVSxDQUFWLENBQVg7QUFDQSx3QkFBTSxZQUFZLElBQUksR0FBRyxHQUFQLEVBQVksR0FBRyxHQUFmLENBQWxCO0FBQ0Esd0JBQU0sU0FBUyxlQUFlLFNBQWYsQ0FBZjtBQUNBLHdCQUFNLElBQUksT0FBTyxLQUFQLEVBQVY7O0FBRUEsd0JBQUksSUFBSSxHQUFHLFNBQUgsS0FBaUIsR0FBRyxTQUFILEVBQXpCLEVBQXlDO0FBQ3JDLDRCQUFNLElBQUksS0FBSyxpQkFBTCxDQUF1QixNQUF2QixDQUFWO0FBQ0EsNEJBQU0sS0FBSyxLQUFLLGlCQUFMLENBQXVCLE1BQXZCLEVBQStCLENBQUMsQ0FBaEMsQ0FBWDtBQUNBLDRCQUFNLEtBQUksS0FBSyxZQUFMLEVBQVY7O0FBRUEsNEJBQU0sUUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFWLEVBQWEsQ0FBYixDQUFELEVBQWtCLE9BQU8sR0FBRyxDQUFWLEVBQWEsQ0FBYixDQUFsQixDQUFkO0FBQ0EsNEJBQU0sU0FBUyxDQUFDLE1BQU0sQ0FBTixFQUFTLEtBQVQsRUFBRCxFQUFtQixNQUFNLENBQU4sRUFBUyxLQUFULEVBQW5CLENBQWY7QUFDQSwrQkFBTyxDQUFQLEVBQVUsRUFBVixJQUFlLENBQUMsQ0FBQyxHQUFHLENBQUgsR0FBTyxHQUFHLENBQVgsSUFBZ0IsTUFBTSxDQUFOLEVBQVMsRUFBVCxDQUFoQixHQUE4QixJQUFJLEdBQUcsQ0FBUCxHQUFXLE1BQU0sQ0FBTixFQUFTLEVBQVQsQ0FBMUMsS0FBMEQsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFwRSxDQUFmO0FBQ0EsK0JBQU8sQ0FBUCxFQUFVLEVBQVYsSUFBZSxDQUFDLENBQUMsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFYLElBQWdCLE1BQU0sQ0FBTixFQUFTLEVBQVQsQ0FBaEIsR0FBOEIsSUFBSSxHQUFHLENBQVAsR0FBVyxNQUFNLENBQU4sRUFBUyxFQUFULENBQTFDLEtBQTBELEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBcEUsQ0FBZjtBQUNBLDJCQUFHLENBQUgsR0FBTyxPQUFPLE9BQU8sQ0FBUCxDQUFQLEVBQWtCLEVBQWxCLENBQVA7QUFDQSwyQkFBRyxDQUFILEdBQU8sT0FBTyxPQUFPLENBQVAsQ0FBUCxFQUFrQixFQUFsQixDQUFQOztBQUVBLDRCQUFNLFVBQVUsQ0FBQyxNQUFNLFNBQU4sQ0FBRCxFQUFtQixPQUFPLFNBQVAsRUFBa0IsQ0FBbEIsQ0FBbkIsQ0FBaEI7QUFDQSxnQ0FBUSxDQUFSLEVBQVcsRUFBWCxLQUFpQixPQUFPLENBQVAsRUFBVSxFQUFWLENBQWpCO0FBQ0EsZ0NBQVEsQ0FBUixFQUFXLEVBQVgsS0FBaUIsT0FBTyxDQUFQLEVBQVUsRUFBVixDQUFqQjtBQUNBLDJCQUFHLEdBQUgsR0FBUyxJQUFJLEdBQUcsR0FBUCxFQUFZLE9BQU8sUUFBUSxDQUFSLENBQVAsRUFBbUIsRUFBbkIsQ0FBWixDQUFUO0FBQ0EsMkJBQUcsR0FBSCxHQUFTLElBQUksR0FBRyxHQUFQLEVBQVksT0FBTyxRQUFRLENBQVIsQ0FBUCxFQUFtQixFQUFuQixDQUFaLENBQVQ7QUFDSDtBQUNKO0FBQ0o7QUFDSjs7O3VDQUVjO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ1gsc0NBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUEsd0JBQWxCLEdBQWtCOztBQUN6Qix3QkFBSSxpQkFBSjtBQUNIO0FBSFU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFJWCxpQkFBSyxrQkFBTDtBQUpXO0FBQUE7QUFBQTs7QUFBQTtBQUtYLHNDQUFrQixLQUFLLElBQXZCLG1JQUE2QjtBQUFBLHdCQUFsQixLQUFrQjs7QUFDekIsMEJBQUksaUJBQUo7QUFDQSx5QkFBSyxVQUFMLENBQWdCLEtBQWhCO0FBQ0g7QUFSVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU2Q7OztvQ0FFVztBQUNSLGlCQUFLLEdBQUwsQ0FBUyxTQUFULENBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLEtBQUssTUFBTCxDQUFZLENBQXJDLEVBQXdDLEtBQUssTUFBTCxDQUFZLENBQXBEO0FBRFE7QUFBQTtBQUFBOztBQUFBO0FBRVIsc0NBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUEsd0JBQWxCLEdBQWtCOztBQUN6Qix5QkFBSyxVQUFMLENBQWdCLEdBQWhCO0FBQ0EseUJBQUssYUFBTCxDQUFtQixHQUFuQjtBQUNIO0FBTE87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFNUixzQ0FBbUIsS0FBSyxLQUF4QixtSUFBK0I7QUFBQSx3QkFBcEIsSUFBb0I7O0FBQzNCLHlCQUFLLFFBQUwsQ0FBYyxJQUFkO0FBQ0g7QUFSTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU1g7OzttQ0FFVTtBQUNQLGlCQUFLLFFBQUwsSUFBaUIsQ0FBakI7QUFDQSxnQkFBTSxjQUFjLEtBQXBCO0FBQ0EsZ0JBQU0sV0FBVyxjQUFjLEtBQUssV0FBcEM7QUFDQSxnQkFBSSxXQUFXLENBQWYsRUFBa0I7QUFDZCx3QkFBUSxHQUFSLEVBQWdCLEtBQUssUUFBTCxHQUFnQixRQUFqQixHQUE2QixDQUE1QztBQUNBLHFCQUFLLFdBQUwsR0FBbUIsV0FBbkI7QUFDQSxxQkFBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0g7QUFDSjs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7Ozs7Ozs7OztBQ25OQSxJQUFNLFdBQVcsUUFBUSxNQUFSLENBQWpCO0FBQ0EsSUFBTSxXQUFXLFFBQVEsY0FBUixDQUFqQjtBQUNBLElBQU0sU0FBUyxRQUFRLGtCQUFSLENBQWY7O2VBQzZHLFFBQVEsU0FBUixDO0lBQXRHLE0sWUFBQSxNO0lBQVEsa0IsWUFBQSxrQjtJQUFvQixrQixZQUFBLGtCO0lBQW9CLFMsWUFBQSxTO0lBQVcsbUIsWUFBQSxtQjtJQUFxQixrQixZQUFBLGtCOztnQkFDL0QsUUFBUSxXQUFSLEM7SUFBakIsRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHOztJQUNWLEcsR0FBTyxJLENBQVAsRzs7SUFHRCxROzs7QUFDRixzQkFBWSxNQUFaLEVBQW9CLEdBQXBCLEVBQXlCO0FBQUE7O0FBQUEsd0hBQ2YsTUFEZSxFQUNQLEdBRE87O0FBRXJCLGNBQUssTUFBTCxHQUFjLElBQUksUUFBSixDQUFhLE1BQWIsUUFBZDtBQUZxQjtBQUd4Qjs7Ozt3Q0FFZSxHLEVBQUs7QUFDakIsZ0JBQU0sSUFBSSxLQUFLLE1BQUwsQ0FBWSxhQUFaLENBQTBCLElBQUksR0FBOUIsQ0FBVjtBQUNBLGdCQUFNLGlCQUFpQixDQUFDLEtBQUssTUFBTCxDQUFZLENBQVosR0FBZ0IsRUFBRSxDQUFGLENBQWhCLEdBQXVCLENBQXhCLElBQTZCLElBQUksQ0FBSixDQUFNLENBQU4sQ0FBcEQ7QUFDQSxnQkFBSSxTQUFTLEtBQUssTUFBTCxDQUFZLGdCQUF6QjtBQUNBLGdCQUFJLGlCQUFpQixDQUFyQixFQUF3QixTQUFTLElBQUksTUFBSixFQUFZLGNBQVosQ0FBVDtBQUN4Qix1SUFBNkIsR0FBN0IsRUFBa0MsTUFBbEM7QUFDSDs7O3lDQUVnQixDLEVBQUcsQyxFQUFHO0FBQ25CLGdCQUFNLE1BQU0sS0FBSyxNQUFMLENBQVksV0FBWixDQUF3QixDQUF4QixFQUEyQixDQUEzQixDQUFaO0FBQ0EsZ0JBQUksT0FBTyxPQUFPLGlCQUFQLENBQXlCLEtBQUssTUFBTCxDQUFZLFFBQXJDLENBQVg7QUFGbUI7QUFBQTtBQUFBOztBQUFBO0FBR25CLHFDQUFrQixLQUFLLElBQXZCLDhIQUE2QjtBQUFBLHdCQUFsQixJQUFrQjs7QUFDekIsMkJBQU8sSUFBSSxJQUFKLEVBQVUsQ0FBQyxJQUFJLElBQUksS0FBSSxHQUFSLEVBQWEsR0FBYixDQUFKLElBQXlCLEtBQUksU0FBSixFQUExQixJQUE2QyxHQUF2RCxDQUFQO0FBQ0g7QUFMa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNbkIsZ0JBQU0sSUFBSSxPQUFPLGlCQUFQLENBQXlCLE9BQU8sT0FBTyxpQkFBUCxDQUF5QixLQUFLLE1BQUwsQ0FBWSxRQUFyQyxDQUFQLEVBQXVELElBQXZELENBQXpCLENBQVY7QUFDQSxnQkFBTSxJQUFJLG9CQUFvQixPQUFPLEtBQUssTUFBTCxDQUFZLFlBQVosR0FBMkIsQ0FBbEMsQ0FBcEIsRUFBMEQsT0FBTyxDQUFDLEdBQVIsRUFBYSxHQUFiLENBQTFELEVBQTZFLE9BQU8sQ0FBQyxHQUFSLEVBQWEsR0FBYixDQUE3RSxDQUFWO0FBQ0EsZ0JBQU0sUUFBUSxXQUFkO0FBQ0EsZ0JBQU0saUJBQWUsS0FBSyxJQUFMLENBQVUsTUFBL0I7QUFDQSxnQkFBTSxNQUFNLElBQUksTUFBSixDQUFXLEtBQUssTUFBaEIsRUFBd0IsQ0FBeEIsRUFBMkIsR0FBM0IsRUFBZ0MsQ0FBaEMsRUFBbUMsS0FBbkMsRUFBMEMsR0FBMUMsRUFBK0MsSUFBL0MsQ0FBWjtBQUNBLGdCQUFJLGNBQUosQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEI7QUFDQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLEdBQWY7QUFDSDs7O3FDQUVZLEcsRUFBSyxHLEVBQUssQyxFQUFHLEMsRUFBRyxLLEVBQU87QUFDaEMsZ0JBQU0sTUFBTSxJQUFJLE1BQUosQ0FBVyxLQUFLLE1BQWhCLEVBQXdCLENBQXhCLEVBQTJCLEdBQTNCLEVBQWdDLENBQWhDLEVBQW1DLEtBQW5DLEVBQTBDLEdBQTFDLEVBQStDLElBQS9DLENBQVo7QUFDQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLEdBQWY7QUFDSDs7OzBDQUVpQixNLEVBQWlCO0FBQUEsZ0JBQVQsR0FBUyx1RUFBSCxDQUFHOztBQUMvQixtQkFBTyxJQUFJLG1CQUFtQixPQUFPLENBQVAsQ0FBbkIsRUFBOEIsR0FBOUIsQ0FBSixFQUF3QyxtQkFBbUIsT0FBTyxDQUFQLENBQW5CLEVBQThCLEdBQTlCLENBQXhDLEVBQTRFLEdBQTVFLENBQVA7QUFDSDs7O3VDQUVjO0FBQ1gsbUJBQU8sQ0FBUDtBQUNIOzs7b0NBRVc7QUFBQTs7QUFDUixpQkFBSyxHQUFMLENBQVMsU0FBVCxDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixLQUFLLE1BQUwsQ0FBWSxDQUFyQyxFQUF3QyxLQUFLLE1BQUwsQ0FBWSxDQUFwRDtBQUNBLGdCQUFNLFNBQVMsRUFBZjtBQUZRO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBR0csR0FISDs7QUFJSix1Q0FBbUIsWUFBTTtBQUNyQiw0QkFBTSxTQUFTLE9BQUssWUFBTCxDQUFrQixHQUFsQixDQUFmO0FBQ0EsNEJBQU0sSUFBSSxPQUFPLEdBQVAsRUFBVjtBQUNBLCtCQUFPLElBQVAsQ0FBWSxDQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLENBQW5CLEVBQXNCLElBQUksS0FBMUIsQ0FBWjtBQUNILHFCQUpEO0FBSkk7O0FBR1Isc0NBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUE7QUFNNUI7QUFUTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBVUcsR0FWSDs7QUFXSix1Q0FBbUIsWUFBTTtBQUNyQiw0QkFBTSxTQUFTLE9BQUssZUFBTCxDQUFxQixHQUFyQixDQUFmO0FBQ0EsNEJBQU0sSUFBSSxPQUFPLEdBQVAsRUFBVjtBQUNBLCtCQUFPLElBQVAsQ0FBWSxDQUFDLFdBQUQsRUFBYyxNQUFkLEVBQXNCLENBQXRCLENBQVo7QUFDSCxxQkFKRDtBQVhJOztBQVVSLHNDQUFrQixLQUFLLElBQXZCLG1JQUE2QjtBQUFBO0FBTTVCO0FBaEJPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx3QkFpQkcsSUFqQkg7O0FBa0JKLHVDQUFtQixZQUFNO0FBQ3JCLDRCQUFNLFNBQVMsT0FBSyxVQUFMLENBQWdCLElBQWhCLENBQWY7QUFDQSw0QkFBTSxJQUFJLE9BQU8sR0FBUCxFQUFWO0FBQ0EsK0JBQU8sSUFBUCxDQUFZLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsQ0FBakIsQ0FBWjtBQUNILHFCQUpEO0FBbEJJOztBQWlCUixzQ0FBbUIsS0FBSyxLQUF4QixtSUFBK0I7QUFBQTtBQU05QjtBQXZCTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXdCUixtQkFBTyxJQUFQLENBQVksVUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQjtBQUN4Qix1QkFBTyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBZDtBQUNILGFBRkQ7QUF4QlE7QUFBQTtBQUFBOztBQUFBO0FBMkJSLHNDQUF1QyxNQUF2QyxtSUFBK0M7QUFBQTtBQUFBLHdCQUFuQyxJQUFtQztBQUFBLHdCQUE3QixNQUE2QjtBQUFBLHdCQUFyQixDQUFxQjtBQUFBLHdCQUFsQixLQUFrQjs7QUFDM0MsNEJBQVEsSUFBUjtBQUNJLDZCQUFLLFFBQUw7QUFDSSxpQ0FBSyxVQUFMLENBQWdCLE1BQWhCLEVBQXdCLEtBQXhCO0FBQ0E7QUFDSiw2QkFBSyxXQUFMO0FBQ0ksaUNBQUssYUFBTCxDQUFtQixNQUFuQjtBQUNBO0FBQ0osNkJBQUssTUFBTDtBQUNJLGlDQUFLLFFBQUwsQ0FBYyxNQUFkO0FBQ0E7QUFUUjtBQVdIO0FBdkNPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF3Q1g7Ozs7RUFsRmtCLFE7O0FBcUZ2QixPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUM3Rk0sYzs7O0FBQ0YsNEJBQVksT0FBWixFQUFvQjtBQUFBOztBQUFBLCtIQUNWLE9BRFU7QUFFbkI7OztxQkFId0IsSzs7QUFNN0IsT0FBTyxPQUFQLEdBQWlCLGNBQWpCOzs7Ozs7Ozs7Ozs7O0FDTkEsSUFBTSxXQUFXLFFBQVEsYUFBUixDQUFqQjtBQUNBLElBQU0sV0FBVyxRQUFRLGFBQVIsQ0FBakI7O2VBQzBDLFFBQVEsUUFBUixDO0lBQW5DLFcsWUFBQSxXO0lBQWEsa0IsWUFBQSxrQjs7QUFHcEIsSUFBSSxTQUFTLElBQWI7QUFDQSxJQUFNLFNBQVM7QUFDWCxRQUFJLElBRE87QUFFWCxRQUFJLE1BRk87QUFHWCxRQUFJLE1BSE87QUFJWCxRQUFJLE9BSk87QUFLWCxRQUFJLFFBTE8sRUFLRztBQUNkLFFBQUksU0FOTyxFQU1JO0FBQ2YsUUFBSSxVQVBPLEVBT0s7QUFDaEIsUUFBSSxZQVJPLEVBUU87QUFDbEIsUUFBSSxZQVRPLEVBU087QUFDbEIsUUFBSSxhQVZPLENBVU87QUFWUCxDQUFmOztBQWFBLFNBQVMsU0FBVCxDQUFtQixPQUFuQixFQUE0QjtBQUN4QixXQUFPLENBQVAsR0FBVyxRQUFRLENBQVIsRUFBVyxLQUFYLEdBQW1CLFFBQVEsS0FBUixFQUE5QjtBQUNBLFdBQU8sQ0FBUCxHQUFXLFFBQVEsQ0FBUixFQUFXLE1BQVgsR0FBb0IsUUFBUSxNQUFSLEVBQS9CO0FBQ0g7O0FBRUQsU0FBUyxRQUFULENBQWtCLEtBQWxCLEVBQXlCLE1BQXpCLEVBQWlDO0FBQzdCLFFBQU0sSUFBSSxNQUFNLEtBQWhCO0FBQ0EsUUFBTSxJQUFJLE1BQU0sS0FBaEI7QUFDQSxRQUFJLENBQUMsT0FBTyxTQUFaLEVBQXVCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQkFDUixHQURROztBQUVmLG9CQUFJLG1CQUFtQixZQUFNO0FBQUEsK0NBQ0QsT0FBTyxZQUFQLENBQW9CLEdBQXBCLENBREM7QUFBQTtBQUFBLHdCQUNkLEVBRGM7QUFBQSx3QkFDVixFQURVO0FBQUEsd0JBQ04sQ0FETTs7QUFFckIsd0JBQUksWUFBWSxFQUFaLEVBQWdCLEVBQWhCLEVBQW9CLENBQXBCLEVBQXVCLENBQXZCLElBQTRCLENBQWhDLEVBQW1DO0FBQy9CLDRCQUFJLGNBQUosQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEI7QUFDQSwrQkFBTyxJQUFQO0FBQ0g7QUFDSixpQkFORCxDQUFKLEVBTVE7QUFBQTtBQUFBO0FBUk87O0FBQ25CLGlDQUFrQixPQUFPLElBQXpCLDhIQUErQjtBQUFBOztBQUFBO0FBUTlCO0FBVGtCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBVW5CLGVBQU8sZ0JBQVAsQ0FBd0IsQ0FBeEIsRUFBMkIsQ0FBM0I7QUFDSDtBQUNKOztBQUVELFNBQVMsV0FBVCxDQUFxQixLQUFyQixFQUE0QixNQUE1QixFQUFvQztBQUFBLFFBQ3pCLE9BRHlCLEdBQ2QsS0FEYyxDQUN6QixPQUR5Qjs7QUFFaEMsUUFBSSxXQUFXLEVBQWYsRUFBbUI7QUFBRTtBQUNqQixlQUFPLG1CQUFQO0FBQ0EsZUFBTyxlQUFQO0FBQ0gsS0FIRCxNQUdPLElBQUksV0FBVyxNQUFYLElBQXFCLE9BQU8sT0FBUCxLQUFtQixPQUFPLE1BQW5ELEVBQTJEO0FBQzlELGVBQU8sTUFBUCxDQUFjLE9BQU8sT0FBUCxDQUFkLEVBQStCLE9BQS9CO0FBQ0g7QUFDSjs7SUFFSyxTO0FBQ0YsdUJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBOztBQUNoQixpQkFBUyxPQUFPLEVBQVAsQ0FBVDtBQUNBLFlBQU0sVUFBVSxFQUFFLFFBQUYsQ0FBaEI7QUFDQSxZQUFNLE1BQU0sUUFBUSxDQUFSLEVBQVcsVUFBWCxDQUFzQixJQUF0QixDQUFaO0FBQ0Esa0JBQVUsT0FBVjtBQUNBLGFBQUssTUFBTCxHQUFjLEtBQUssT0FBTyxTQUFQLElBQW9CLENBQXBCLEdBQXdCLFFBQXhCLEdBQW1DLFFBQXhDLEVBQWtELE1BQWxELEVBQTBELEdBQTFELENBQWQ7QUFDQSxZQUFJLFVBQVUsTUFBZCxFQUFzQixPQUFPLElBQVAsQ0FBWSxLQUFLLE1BQWpCO0FBQ3RCLGdCQUFRLE1BQVIsQ0FBZSxhQUFLO0FBQ2hCLHNCQUFVLE9BQVY7QUFDSCxTQUZEO0FBR0EsZ0JBQVEsS0FBUixDQUFjLGFBQUs7QUFDZixxQkFBUyxDQUFULEVBQVksTUFBSyxNQUFqQjtBQUNILFNBRkQ7QUFHQSxVQUFFLE1BQUYsRUFBVSxPQUFWLENBQWtCLGFBQUs7QUFDbkIsd0JBQVksQ0FBWixFQUFlLE1BQUssTUFBcEI7QUFDSCxTQUZEO0FBR0g7Ozs7a0NBRVM7QUFDTixpQkFBSyxNQUFMLENBQVksT0FBWjtBQUNIOzs7Ozs7QUFHTCxPQUFPLE9BQVAsR0FBaUIsU0FBakI7Ozs7O0FDM0VBLFNBQVMsSUFBVCxDQUFjLENBQWQsRUFBaUIsSUFBakIsRUFBdUI7QUFDbkIsUUFBTSxNQUFNLEVBQUUsTUFBZDtBQUNBLFFBQU0sSUFBSSxJQUFJLEtBQUosQ0FBVSxHQUFWLENBQVY7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksR0FBcEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDMUIsVUFBRSxDQUFGLElBQU8sS0FBSyxDQUFMLENBQVA7QUFDSDtBQUNELFdBQU8sQ0FBUDtBQUNIOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNiLFdBQU8sa0JBQUs7QUFDUixlQUFPLElBQUksS0FBSixDQUFVLENBQVYsRUFBYSxJQUFiLENBQWtCLENBQWxCLENBQVA7QUFDSCxLQUhZOztBQUtiLFNBQUssZ0JBQUs7QUFDTixZQUFNLE1BQU0sRUFBRSxNQUFkO0FBQ0EsWUFBSSxNQUFNLENBQVY7QUFDQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksR0FBcEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDMUIsbUJBQU8sRUFBRSxDQUFGLElBQU8sRUFBRSxDQUFGLENBQWQ7QUFDSDtBQUNELGVBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixDQUFQO0FBQ0gsS0FaWTs7QUFjYixTQUFLLGFBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNYLGVBQU8sS0FBSyxDQUFMLEVBQVEsYUFBSztBQUNoQixtQkFBTyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBZDtBQUNILFNBRk0sQ0FBUDtBQUdILEtBbEJZOztBQW9CYixTQUFLLGFBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNYLGVBQU8sS0FBSyxDQUFMLEVBQVEsYUFBSztBQUNoQixtQkFBTyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBZDtBQUNILFNBRk0sQ0FBUDtBQUdILEtBeEJZOztBQTBCYixTQUFLLGFBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNYLGVBQU8sS0FBSyxDQUFMLEVBQVEsYUFBSztBQUNoQixtQkFBTyxFQUFFLENBQUYsSUFBTyxDQUFkO0FBQ0gsU0FGTSxDQUFQO0FBR0gsS0E5Qlk7O0FBZ0NiLFNBQUssYUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ1gsZUFBTyxLQUFLLENBQUwsRUFBUSxhQUFLO0FBQ2hCLG1CQUFPLEVBQUUsQ0FBRixJQUFPLENBQWQ7QUFDSCxTQUZNLENBQVA7QUFHSCxLQXBDWTs7QUFzQ2IsU0FBSyxhQUFDLENBQUQsRUFBSSxDQUFKLEVBQW1CO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ3BCLFlBQUksT0FBTyxDQUFDLENBQVosRUFBZTtBQUFBLHVCQUNGLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FERTtBQUNWLGFBRFU7QUFDUCxhQURPO0FBRWQ7QUFDRCxZQUFNLE1BQU0sRUFBRSxNQUFkO0FBQ0EsWUFBTSxNQUFNLEVBQUUsQ0FBRixFQUFLLE1BQWpCO0FBQ0EsWUFBTSxNQUFNLEVBQUUsQ0FBRixFQUFLLE1BQWpCO0FBQ0EsWUFBTSxJQUFJLElBQUksS0FBSixDQUFVLEdBQVYsQ0FBVjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxHQUFwQixFQUF5QixHQUF6QixFQUE4QjtBQUMxQixjQUFFLENBQUYsSUFBTyxJQUFJLEtBQUosQ0FBVSxHQUFWLENBQVA7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEdBQXBCLEVBQXlCLEdBQXpCLEVBQThCO0FBQzFCLGtCQUFFLENBQUYsRUFBSyxDQUFMLElBQVUsQ0FBVjtBQUNBLHFCQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksR0FBcEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDMUIsc0JBQUUsQ0FBRixFQUFLLENBQUwsS0FBVyxFQUFFLENBQUYsRUFBSyxDQUFMLElBQVUsRUFBRSxDQUFGLEVBQUssQ0FBTCxDQUFyQjtBQUNIO0FBQ0o7QUFDSjtBQUNELGVBQU8sQ0FBUDtBQUNIO0FBeERZLENBQWpCOzs7Ozs7Ozs7QUNUQSxJQUFNLGFBQWEsUUFBUSx3QkFBUixDQUFuQjtBQUNBLElBQU0sYUFBYSxRQUFRLHVCQUFSLENBQW5COztlQUNvRSxRQUFRLFNBQVIsQztJQUE3RCxPLFlBQUEsTztJQUFTLE8sWUFBQSxPO0lBQVMsZSxZQUFBLGU7SUFBaUIsYyxZQUFBLGM7SUFBZ0IsTSxZQUFBLE07O2dCQUNqQixRQUFRLFdBQVIsQztJQUFsQyxLLGFBQUEsSztJQUFPLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7O0lBQzNCLEcsR0FBWSxJLENBQVosRztJQUFLLEcsR0FBTyxJLENBQVAsRzs7SUFHTixNO0FBQ0Y7Ozs7O0FBS0Esb0JBQVksTUFBWixFQUFvQixDQUFwQixFQUF1QixHQUF2QixFQUE0QixDQUE1QixFQUErQixLQUEvQixFQUFzQyxHQUF0QyxFQUEyQyxNQUEzQyxFQUFtRDtBQUFBOztBQUMvQyxhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssR0FBTCxHQUFXLEdBQVg7QUFDQSxhQUFLLE9BQUwsR0FBZSxJQUFJLEtBQUosRUFBZjtBQUNBLGFBQUssQ0FBTCxHQUFTLENBQVQ7QUFDQSxhQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsYUFBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLGFBQUssTUFBTCxHQUFjLE1BQWQ7O0FBRUEsYUFBSyxVQUFMLEdBQWtCLElBQWxCO0FBQ0g7Ozs7b0NBRVc7QUFDUixtQkFBTyxPQUFPLGlCQUFQLENBQXlCLEtBQUssQ0FBOUIsQ0FBUDtBQUNIOzs7NENBRW1CO0FBQ2hCLGdCQUFJLElBQUksTUFBTSxLQUFLLE1BQUwsQ0FBWSxTQUFsQixDQUFSO0FBRGdCO0FBQUE7QUFBQTs7QUFBQTtBQUVoQixxQ0FBa0IsS0FBSyxNQUFMLENBQVksSUFBOUIsOEhBQW9DO0FBQUEsd0JBQXpCLEdBQXlCOztBQUNoQyx3QkFBSSxPQUFPLElBQVgsRUFBaUI7QUFDakIsd0JBQU0sU0FBUyxJQUFJLEtBQUssR0FBVCxFQUFjLElBQUksR0FBbEIsQ0FBZjtBQUNBLHdCQUFNLFlBQVksSUFBSSxNQUFKLENBQWxCO0FBQ0Esd0JBQU0sYUFBYSxJQUFJLE1BQUosRUFBWSxTQUFaLENBQW5CO0FBQ0Esd0JBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxVQUFKLEVBQWdCLElBQUksQ0FBSixHQUFRLE9BQU8sU0FBUCxDQUF4QixDQUFQLENBQUo7QUFDSDtBQVJlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBU2hCLGdCQUFJLElBQUksQ0FBSixFQUFPLENBQUMsS0FBSyxNQUFMLENBQVksQ0FBYixHQUFpQixLQUFLLENBQTdCLENBQUo7QUFDQSxnQkFBTSxJQUFJLElBQUksQ0FBSixFQUFPLEtBQUssQ0FBWixDQUFWO0FBQ0EsaUJBQUssQ0FBTCxHQUFTLElBQUksS0FBSyxDQUFULEVBQVksQ0FBWixDQUFUO0FBQ0g7Ozs0Q0FFbUI7QUFDaEIsaUJBQUssR0FBTCxHQUFXLElBQUksS0FBSyxHQUFULEVBQWMsS0FBSyxDQUFuQixDQUFYO0FBQ0g7OztpQ0FFUSxDLEVBQUc7QUFDUixnQkFBTSxJQUFJLEtBQUssV0FBTCxDQUFpQixHQUFqQixFQUFWO0FBQ0EsaUJBQUssQ0FBTCxHQUFTLENBQVQ7QUFDSDs7O21DQUVVLEMsRUFBRztBQUNWLGdCQUFNLElBQUksS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVY7QUFDQSxnQkFBTSxJQUFJLEtBQUssY0FBTCxDQUFvQixHQUFwQixFQUFWO0FBQ0EsaUJBQUssR0FBTCxHQUFXLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBWDtBQUNIOzs7aUNBRVEsQyxFQUFHO0FBQ1IsZ0JBQU0sTUFBTSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBWjtBQUNBLGdCQUFNLE1BQU0sUUFBUSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBUixDQUFaO0FBQ0EsaUJBQUssQ0FBTCxHQUFTLGdCQUFnQixHQUFoQixFQUFxQixHQUFyQixDQUFUO0FBQ0g7Ozt1Q0FFYyxDLEVBQUcsQyxFQUFHO0FBQ2pCLGdCQUFJLEtBQUssVUFBTCxJQUFtQixLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBdkIsRUFBaUQ7QUFDN0Msb0JBQU0sY0FBYyxLQUFLLFVBQUwsQ0FBZ0IsV0FBcEM7QUFDQSw0QkFBWSxHQUFaLENBQWdCLE1BQWhCLEVBQXdCLElBQUksSUFBNUI7QUFDQSw0QkFBWSxHQUFaLENBQWdCLEtBQWhCLEVBQXVCLElBQUksSUFBM0I7QUFDQSw0QkFBWSxTQUFaLENBQXNCLHVCQUF0QixFQUErQyxZQUEvQyxDQUE0RCxXQUE1RDtBQUNILGFBTEQsTUFLTztBQUNILG9CQUFNLFNBQVMsR0FBZjs7QUFFQSxvQkFBSSxXQUFXLElBQUksSUFBSSxLQUFLLE1BQUwsQ0FBWSxDQUFoQixFQUFtQixLQUFLLE1BQUwsQ0FBWSxDQUEvQixJQUFvQyxDQUF4QyxFQUEyQyxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxLQUFLLEdBQWxCLENBQWhCLElBQTBDLE1BQXJGLENBQWY7QUFIRztBQUFBO0FBQUE7O0FBQUE7QUFJSCwwQ0FBa0IsS0FBSyxNQUFMLENBQVksSUFBOUIsbUlBQW9DO0FBQUEsNEJBQXpCLEdBQXlCOztBQUNoQyxtQ0FBVyxJQUFJLFFBQUosRUFBYyxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLElBQUksR0FBSixDQUFRLEdBQVIsQ0FBWSxLQUFLLEdBQWpCLENBQWhCLElBQXlDLE1BQXZELENBQVg7QUFDSDtBQU5FO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBUUgsb0JBQU0sSUFBSSxLQUFLLENBQWY7O0FBRUEsb0JBQU0sSUFBSSxlQUFlLEtBQUssQ0FBcEIsQ0FBVjtBQUNBLG9CQUFJLFNBQVMsSUFBSSxLQUFLLE1BQUwsQ0FBWSxZQUFoQixFQUE4QixJQUFJLEtBQUssQ0FBVCxJQUFjLE1BQTVDLENBQWI7QUFYRztBQUFBO0FBQUE7O0FBQUE7QUFZSCwwQ0FBa0IsS0FBSyxNQUFMLENBQVksSUFBOUIsbUlBQW9DO0FBQUEsNEJBQXpCLElBQXlCOztBQUNoQyxpQ0FBUyxJQUFJLE1BQUosRUFBWSxJQUFJLEtBQUksQ0FBUixJQUFhLE1BQXpCLENBQVQ7QUFDSDtBQWRFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBZ0JILHFCQUFLLGlCQUFMLENBQXVCLFFBQXZCLEVBQWlDLENBQWpDLEVBQW9DLENBQXBDLEVBQXVDLE1BQXZDO0FBQ0EscUJBQUssVUFBTCxHQUFrQixJQUFJLFVBQUosQ0FBZSxLQUFLLEdBQXBCLEVBQXlCLEtBQUssY0FBTCxFQUF6QixFQUFnRCxDQUFoRCxFQUFtRCxDQUFuRCxDQUFsQjtBQUNBLHFCQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLElBQXpCLENBQThCLEtBQUssVUFBbkM7QUFDSDtBQUNKOzs7MENBRWlCLFEsRUFBVSxDLEVBQUcsQyxFQUFHLE0sRUFBUTtBQUN0QyxpQkFBSyxXQUFMLEdBQW1CLElBQUksVUFBSixDQUFlLElBQWYsRUFBcUIsUUFBckIsRUFBK0IsS0FBSyxNQUFMLENBQVksUUFBM0MsRUFBcUQsS0FBSyxNQUFMLENBQVksUUFBakUsRUFBMkUsQ0FBM0UsRUFBOEUsS0FBSyxRQUFuRixDQUFuQjtBQUNBLGlCQUFLLGNBQUwsR0FBc0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFDLFFBQXBDLEVBQThDLFFBQTlDLEVBQXdELEtBQUssR0FBTCxDQUFTLENBQVQsQ0FBeEQsRUFBcUUsS0FBSyxVQUExRSxDQUF0QjtBQUNBLGlCQUFLLGNBQUwsR0FBc0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFDLFFBQXBDLEVBQThDLFFBQTlDLEVBQXdELEtBQUssR0FBTCxDQUFTLENBQVQsQ0FBeEQsRUFBcUUsS0FBSyxVQUExRSxDQUF0QjtBQUNBLGlCQUFLLGNBQUwsR0FBc0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFuQyxFQUFzQyxNQUF0QyxFQUE4QyxFQUFFLENBQUYsQ0FBOUMsRUFBb0QsS0FBSyxRQUF6RCxDQUF0QjtBQUNBLGlCQUFLLGNBQUwsR0FBc0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFDLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLFFBQVEsRUFBRSxDQUFGLENBQVIsQ0FBOUMsRUFBNkQsS0FBSyxRQUFsRSxDQUF0QjtBQUNIOzs7eUNBRWdCO0FBQ2IsbUJBQU8sQ0FDSCxLQUFLLFdBREYsRUFFSCxLQUFLLGNBRkYsRUFHSCxLQUFLLGNBSEYsRUFJSCxLQUFLLGNBSkYsRUFLSCxLQUFLLGNBTEYsQ0FBUDtBQU9IOzs7bUNBVVU7QUFDUCxtQkFBTyxLQUFLLFNBQUwsQ0FBZSxFQUFDLE9BQU8sS0FBSyxHQUFiLEVBQWtCLEtBQUssS0FBSyxDQUE1QixFQUErQixPQUFPLEtBQUssR0FBM0MsRUFBZixDQUFQO0FBQ0g7OzswQ0FWd0IsQyxFQUFHO0FBQ3hCLG1CQUFPLElBQUksQ0FBSixFQUFPLElBQUksQ0FBWCxDQUFQO0FBQ0g7OzswQ0FFd0IsQyxFQUFHO0FBQ3hCLG1CQUFPLE9BQU8sQ0FBUCxDQUFQO0FBQ0g7Ozs7OztBQU9MLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7Ozs7Ozs7Ozs7O0FDNUhBLElBQU0sU0FBUyxRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU0sYUFBYSxRQUFRLHVCQUFSLENBQW5COztlQUNnRCxRQUFRLFNBQVIsQztJQUF6QyxPLFlBQUEsTztJQUFTLE8sWUFBQSxPO0lBQVMsbUIsWUFBQSxtQjs7Z0JBQ1YsUUFBUSxTQUFSLEM7SUFBUixJLGFBQUEsSTs7SUFDQSxHLEdBQU8sSSxDQUFQLEc7O0lBR0QsTTs7Ozs7Ozs7Ozs7O0FBQ0Y7Ozs7O29DQUtZO0FBQ1IsbUJBQU8sT0FBTyxpQkFBUCxDQUF5QixLQUFLLENBQTlCLENBQVA7QUFDSDs7O21DQUVVLEMsRUFBRztBQUNWLGdCQUFNLElBQUksS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVY7QUFDQSxnQkFBTSxJQUFJLEtBQUssY0FBTCxDQUFvQixHQUFwQixFQUFWO0FBQ0EsZ0JBQU0sSUFBSSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBVjtBQUNBLGlCQUFLLEdBQUwsR0FBVyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFYO0FBQ0g7OztpQ0FFUSxDLEVBQUc7QUFDUixnQkFBTSxNQUFNLFFBQVEsS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVIsQ0FBWjtBQUNBLGdCQUFNLFFBQVEsUUFBUSxLQUFLLGdCQUFMLENBQXNCLEdBQXRCLEVBQVIsQ0FBZDtBQUNBLGdCQUFNLE1BQU0sS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVo7QUFDQSxpQkFBSyxDQUFMLEdBQVMsb0JBQW9CLEdBQXBCLEVBQXlCLEdBQXpCLEVBQThCLEtBQTlCLENBQVQ7QUFDSDs7OzBDQUVpQixTLEVBQVcsQyxFQUFHLEMsRUFBRyxPLEVBQVM7QUFDeEMsOEhBQXdCLFNBQXhCLEVBQW1DLENBQW5DLEVBQXNDLENBQXRDLEVBQXlDLE9BQXpDO0FBQ0EsaUJBQUssY0FBTCxHQUFzQixJQUFJLFVBQUosQ0FBZSxJQUFmLEVBQXFCLFlBQXJCLEVBQW1DLENBQUMsU0FBcEMsRUFBK0MsU0FBL0MsRUFBMEQsS0FBSyxHQUFMLENBQVMsQ0FBVCxDQUExRCxFQUF1RSxLQUFLLFVBQTVFLENBQXRCO0FBQ0EsaUJBQUssZ0JBQUwsR0FBd0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFDLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLFFBQVEsRUFBRSxDQUFGLENBQVIsQ0FBOUMsRUFBNkQsS0FBSyxRQUFsRSxDQUF4QjtBQUNIOzs7eUNBRWdCO0FBQ2IsbUJBQU8sQ0FDSCxLQUFLLFdBREYsRUFFSCxLQUFLLGNBRkYsRUFHSCxLQUFLLGNBSEYsRUFJSCxLQUFLLGNBSkYsRUFLSCxLQUFLLGNBTEYsRUFNSCxLQUFLLGNBTkYsRUFPSCxLQUFLLGdCQVBGLENBQVA7QUFTSDs7OzBDQUV3QixDLEVBQUc7QUFDeEIsbUJBQU8sSUFBSSxDQUFKLEVBQU8sSUFBSSxDQUFYLENBQVA7QUFDSDs7OzBDQUV3QixDLEVBQUc7QUFDeEIsbUJBQU8sS0FBSyxDQUFMLENBQVA7QUFDSDs7OztFQWhEZ0IsTTs7QUFtRHJCLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7QUMxREEsSUFBTSxpQkFBaUIsUUFBUSxtQkFBUixDQUF2Qjs7ZUFDbUIsUUFBUSxVQUFSLEM7SUFBWixHLFlBQUEsRztJQUFLLEcsWUFBQSxHOztBQUVaLElBQU0sT0FBTztBQUNULFlBQVEsZ0JBQUMsQ0FBRCxFQUFPO0FBQ1gsZUFBTyxJQUFJLENBQVg7QUFDSCxLQUhROztBQUtULFVBQU0sY0FBQyxDQUFELEVBQU87QUFDVCxlQUFPLElBQUksQ0FBSixHQUFRLENBQWY7QUFDSCxLQVBROztBQVNULHFCQUFpQix5QkFBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQzNCLGVBQU8sQ0FDSCxNQUFNLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FESCxFQUVILE1BQU0sS0FBSyxHQUFMLENBQVMsR0FBVCxDQUZILENBQVA7QUFJSCxLQWRROztBQWdCVCxxQkFBaUIseUJBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUN2QixlQUFPLENBQ0gsSUFBSSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUosQ0FERyxFQUVILEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxDQUFkLENBRkcsQ0FBUDtBQUlILEtBckJROztBQXVCVCx5QkFBcUIsNkJBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxLQUFYLEVBQXFCO0FBQ3RDLGVBQU8sQ0FDSCxNQUFNLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FBTixHQUF3QixLQUFLLEdBQUwsQ0FBUyxHQUFULENBRHJCLEVBRUgsTUFBTSxLQUFLLEdBQUwsQ0FBUyxLQUFULENBQU4sR0FBd0IsS0FBSyxHQUFMLENBQVMsR0FBVCxDQUZyQixFQUdILE1BQU0sS0FBSyxHQUFMLENBQVMsS0FBVCxDQUhILENBQVA7QUFLSCxLQTdCUTs7QUErQlQseUJBQXFCLDZCQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFhO0FBQzlCLFlBQU0sTUFBTSxJQUFJLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQUosQ0FBWjtBQUNBLGVBQU8sQ0FDSCxHQURHLEVBRUgsS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FGRyxFQUdILE9BQU8sQ0FBUCxHQUFXLEtBQUssSUFBTCxDQUFVLElBQUksR0FBZCxDQUFYLEdBQWdDLENBSDdCLENBQVA7QUFLSCxLQXRDUTs7QUF3Q1Qsb0JBQWdCLHdCQUFDLE1BQUQsRUFBWTtBQUN4QixlQUFPLE9BQU8sTUFBUCxJQUFpQixDQUFqQixHQUNELEtBQUssZUFBTCxDQUFxQixPQUFPLENBQVAsQ0FBckIsRUFBZ0MsT0FBTyxDQUFQLENBQWhDLENBREMsR0FFRCxLQUFLLG1CQUFMLENBQXlCLE9BQU8sQ0FBUCxDQUF6QixFQUFvQyxPQUFPLENBQVAsQ0FBcEMsRUFBK0MsT0FBTyxDQUFQLENBQS9DLENBRk47QUFHSCxLQTVDUTs7QUE4Q1QsYUFBUyxpQkFBQyxHQUFELEVBQVM7QUFDZCxlQUFPLE1BQU0sS0FBSyxFQUFYLEdBQWdCLEdBQXZCO0FBQ0gsS0FoRFE7O0FBa0RULGFBQVMsaUJBQUMsR0FBRCxFQUFTO0FBQ2QsZUFBTyxNQUFNLEdBQU4sR0FBWSxLQUFLLEVBQXhCO0FBQ0gsS0FwRFE7O0FBc0RULGlCQUFhLHFCQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsRUFBb0I7QUFDN0IsZUFBTyxJQUFJLENBQUMsS0FBSyxFQUFOLEVBQVUsS0FBSyxFQUFmLENBQUosQ0FBUDtBQUNILEtBeERROztBQTBEVCxZQUFRLGdCQUFDLE1BQUQsRUFBUyxNQUFULEVBQW9CO0FBQ3hCLGVBQU8sSUFBSSxDQUFDLE1BQUQsQ0FBSixFQUFjLE1BQWQsRUFBc0IsQ0FBdEIsQ0FBUDtBQUNILEtBNURROztBQThEVCxTQUFLLGVBQU07QUFDUCxlQUFPLElBQUksSUFBSixHQUFXLE9BQVgsS0FBdUIsSUFBOUI7QUFDSCxLQWhFUTs7QUFrRVQsWUFBUSxnQkFBQyxHQUFELEVBQXFCO0FBQUEsWUFBZixHQUFlLHVFQUFULElBQVM7O0FBQ3pCLFlBQUksT0FBTyxJQUFYLEVBQWlCO0FBQ2Isa0JBQU0sR0FBTjtBQUNBLGtCQUFNLENBQU47QUFDSDtBQUNELGVBQU8sS0FBSyxNQUFMLE1BQWlCLE1BQU0sR0FBdkIsSUFBOEIsR0FBckM7QUFDSCxLQXhFUTs7QUEwRVQsZUFBVyxxQkFBTTtBQUNiLGVBQU8sTUFBTSxLQUFLLEtBQUwsQ0FBVyxZQUFZLEtBQUssTUFBTCxLQUFnQixTQUF2QyxFQUFrRCxRQUFsRCxDQUEyRCxFQUEzRCxFQUErRCxTQUEvRCxDQUF5RSxDQUF6RSxDQUFiO0FBQ0gsS0E1RVE7O0FBOEVULHVCQUFtQiwyQkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQy9CLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFDLEdBQVAsQ0FERyxFQUVILENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FGRyxDQUFQO0FBSUgsS0FyRlE7O0FBdUZULHdCQUFvQiw0QkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ2hDLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQURHLEVBRUgsQ0FBQyxDQUFELEVBQUksR0FBSixFQUFTLENBQUMsR0FBVixDQUZHLEVBR0gsQ0FBQyxDQUFELEVBQUksR0FBSixFQUFTLEdBQVQsQ0FIRyxDQUFQO0FBS0gsS0EvRlE7O0FBaUdULHdCQUFvQiw0QkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ2hDLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFOLEVBQVMsR0FBVCxDQURHLEVBRUgsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FGRyxFQUdILENBQUMsQ0FBQyxHQUFGLEVBQU8sQ0FBUCxFQUFVLEdBQVYsQ0FIRyxDQUFQO0FBS0gsS0F6R1E7O0FBMkdULHdCQUFvQiw0QkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ2hDLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFDLEdBQVAsRUFBWSxDQUFaLENBREcsRUFFSCxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQUZHLEVBR0gsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FIRyxDQUFQO0FBS0gsS0FuSFE7O0FBcUhULHdCQUFvQixrQ0FBUTtBQUN4QixZQUFJO0FBQ0EsbUJBQU8sTUFBUDtBQUNILFNBRkQsQ0FFRSxPQUFPLENBQVAsRUFBVTtBQUNSLGdCQUFJLEVBQUUsYUFBYSxjQUFmLENBQUosRUFBb0M7QUFDaEMsd0JBQVEsS0FBUixDQUFjLENBQWQ7QUFDQSxzQkFBTSxJQUFJLEtBQUosRUFBTjtBQUNIO0FBQ0o7QUFDRCxlQUFPLElBQVA7QUFDSDtBQS9IUSxDQUFiOztBQWtJQSxPQUFPLE9BQVAsR0FBaUIsSUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgcHJlc2V0ID0gcmVxdWlyZSgnLi9wcmVzZXQnKTtcbmNvbnN0IFNpbXVsYXRvciA9IHJlcXVpcmUoJy4vc2ltdWxhdG9yJyk7XG5cbmNvbnN0IHNpbXVsYXRvciA9IG5ldyBTaW11bGF0b3IocHJlc2V0KTtcbnNpbXVsYXRvci5hbmltYXRlKCk7XG5cbmxldCAkbW92aW5nID0gbnVsbDtcbmxldCBweCwgcHk7XG5cbiQoJ2JvZHknKS5vbignbW91c2Vkb3duJywgJy5jb250cm9sLWJveCAudGl0bGUtYmFyJywgZnVuY3Rpb24gKGUpIHtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcgPSAkKHRoaXMpLnBhcmVudCgnLmNvbnRyb2wtYm94Jyk7XG4gICAgJG1vdmluZy5uZXh0VW50aWwoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpLmluc2VydEJlZm9yZSgkbW92aW5nKTtcbiAgICByZXR1cm4gZmFsc2U7XG59KTtcblxuJCgnYm9keScpLm1vdXNlbW92ZShmdW5jdGlvbiAoZSkge1xuICAgIGlmICghJG1vdmluZykgcmV0dXJuO1xuICAgIGNvbnN0IHggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcuY3NzKCdsZWZ0JywgcGFyc2VJbnQoJG1vdmluZy5jc3MoJ2xlZnQnKSkgKyAoeCAtIHB4KSArICdweCcpO1xuICAgICRtb3ZpbmcuY3NzKCd0b3AnLCBwYXJzZUludCgkbW92aW5nLmNzcygndG9wJykpICsgKHkgLSBweSkgKyAncHgnKTtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xufSk7XG5cbiQoJ2JvZHknKS5tb3VzZXVwKGZ1bmN0aW9uIChlKSB7XG4gICAgJG1vdmluZyA9IG51bGw7XG59KTtcblxuY29uc3Qge2RlZzJyYWQsIGdldFhSb3RhdGlvbk1hdHJpeCwgZ2V0WVJvdGF0aW9uTWF0cml4LCByb3RhdGV9ID0gcmVxdWlyZSgnLi9zaW11bGF0b3IvdXRpbCcpO1xuY29uc3QgYW5nbGVYID0gZGVnMnJhZCgzMCk7XG5jb25zdCBhbmdsZVkgPSBkZWcycmFkKDUwKTtcbmNvbnN0IFJ4ID0gZ2V0WFJvdGF0aW9uTWF0cml4KGFuZ2xlWCk7XG5jb25zdCBSeF8gPSBnZXRYUm90YXRpb25NYXRyaXgoYW5nbGVYLCAtMSk7XG5jb25zdCBSeSA9IGdldFlSb3RhdGlvbk1hdHJpeChhbmdsZVkpO1xuY29uc3QgUnlfID0gZ2V0WVJvdGF0aW9uTWF0cml4KGFuZ2xlWSwgLTEpO1xuY29uc29sZS5sb2cocm90YXRlKHJvdGF0ZShyb3RhdGUocm90YXRlKFstNSwgOCwgM10sIFJ4KSwgUnkpLCBSeV8pLCBSeF8pKTsiLCJjb25zdCB7ZXh0ZW5kfSA9ICQ7XG5cblxuZnVuY3Rpb24gRU1QVFlfMkQoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgYywge1xuICAgICAgICBUSVRMRTogJ0dyYXZpdHkgU2ltdWxhdG9yJyxcbiAgICAgICAgQkFDS0dST1VORDogJ3doaXRlJyxcbiAgICAgICAgRElNRU5TSU9OOiAyLFxuICAgICAgICBNQVhfUEFUSFM6IDEwMDAsXG4gICAgICAgIENBTUVSQV9DT09SRF9TVEVQOiA1LFxuICAgICAgICBDQU1FUkFfQU5HTEVfU1RFUDogMSxcbiAgICAgICAgQ0FNRVJBX0FDQ0VMRVJBVElPTjogMS4xLFxuICAgICAgICBHOiAwLjEsXG4gICAgICAgIE1BU1NfTUlOOiAxLFxuICAgICAgICBNQVNTX01BWDogNGU0LFxuICAgICAgICBWRUxPQ0lUWV9NQVg6IDEwLFxuICAgICAgICBESVJFQ1RJT05fTEVOR1RIOiA1MCxcbiAgICAgICAgQ0FNRVJBX0RJU1RBTkNFOiAxMDBcbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBFTVBUWV8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8yRChjKSwge1xuICAgICAgICBESU1FTlNJT046IDMsXG4gICAgICAgIEc6IDAuMDAxLFxuICAgICAgICBNQVNTX01JTjogMSxcbiAgICAgICAgTUFTU19NQVg6IDhlNixcbiAgICAgICAgVkVMT0NJVFlfTUFYOiAxMFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBURVNUKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzNEKGMpLCB7XG4gICAgICAgIGluaXQ6IChlbmdpbmUpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ2JhbGwxJywgWy0xNTAsIDAsIDBdLCAxMDAwMDAwLCBbMCwgMCwgMF0sICdncmVlbicpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnYmFsbDInLCBbNTAsIDAsIDBdLCAxMDAwMCwgWzAsIDAsIDBdLCAnYmx1ZScpO1xuICAgICAgICAgICAgZW5naW5lLnRvZ2dsZUFuaW1hdGluZygpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRU1QVFlfM0Q7XG4iLCJjb25zdCBJbnZpc2libGVFcnJvciA9IHJlcXVpcmUoJy4uL2Vycm9yL2ludmlzaWJsZScpO1xuY29uc3Qge2RlZzJyYWQsIHJvdGF0ZSwgbm93LCBnZXRSb3RhdGlvbk1hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7cG93fSA9IE1hdGg7XG5cbmNsYXNzIENhbWVyYTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy56ID0gY29uZmlnLkNBTUVSQV9ESVNUQU5DRTtcbiAgICAgICAgdGhpcy5waGkgPSAwO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5sYXN0VGltZSA9IDA7XG4gICAgICAgIHRoaXMubGFzdEtleSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29tYm8gPSAwO1xuICAgICAgICB0aGlzLmNlbnRlciA9IFtjb25maWcuVyAvIDIsIGNvbmZpZy5IIC8gMl07XG4gICAgfVxuXG4gICAgZ2V0Q29vcmRTdGVwKGtleSkge1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IG5vdygpO1xuICAgICAgICBpZiAoa2V5ID09IHRoaXMubGFzdEtleSAmJiBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWUgPCAxKSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgIHRoaXMubGFzdEtleSA9IGtleTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLkNBTUVSQV9DT09SRF9TVEVQICogcG93KHRoaXMuY29uZmlnLkNBTUVSQV9BQ0NFTEVSQVRJT04sIHRoaXMuY29tYm8pO1xuICAgIH1cblxuICAgIHVwKGtleSkge1xuICAgICAgICB0aGlzLnkgLT0gdGhpcy5nZXRDb29yZFN0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgZG93bihrZXkpIHtcbiAgICAgICAgdGhpcy55ICs9IHRoaXMuZ2V0Q29vcmRTdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGxlZnQoa2V5KSB7XG4gICAgICAgIHRoaXMueCAtPSB0aGlzLmdldENvb3JkU3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByaWdodChrZXkpIHtcbiAgICAgICAgdGhpcy54ICs9IHRoaXMuZ2V0Q29vcmRTdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHpvb21JbihrZXkpIHtcbiAgICAgICAgdGhpcy56IC09IHRoaXMuZ2V0Q29vcmRTdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHpvb21PdXQoa2V5KSB7XG4gICAgICAgIHRoaXMueiArPSB0aGlzLmdldENvb3JkU3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVMZWZ0KGtleSkge1xuICAgICAgICB0aGlzLnBoaSAtPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlUmlnaHQoa2V5KSB7XG4gICAgICAgIHRoaXMucGhpICs9IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgIH1cblxuICAgIGdldFpvb20oeiA9IDApIHtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy56IC0gejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDw9IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbnZpc2libGVFcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5DQU1FUkFfRElTVEFOQ0UgLyBkaXN0YW5jZTtcbiAgICB9XG5cbiAgICBhZGp1c3RDb29yZHMoYykge1xuICAgICAgICBjb25zdCBSID0gZ2V0Um90YXRpb25NYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICBjID0gcm90YXRlKGMsIFIpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRab29tKCk7XG4gICAgICAgIGNvbnN0IGNvb3JkcyA9IGFkZCh0aGlzLmNlbnRlciwgbXVsKHN1YihjLCBbdGhpcy54LCB0aGlzLnldKSwgem9vbSkpO1xuICAgICAgICByZXR1cm4ge2Nvb3Jkc307XG4gICAgfVxuXG4gICAgYWRqdXN0UmFkaXVzKGNvb3JkcywgcmFkaXVzKSB7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldFpvb20oKTtcbiAgICAgICAgcmV0dXJuIHJhZGl1cyAqIHpvb207XG4gICAgfVxuXG4gICAgYWN0dWFsUG9pbnQoeCwgeSkge1xuICAgICAgICBjb25zdCBSXyA9IGdldFJvdGF0aW9uTWF0cml4KGRlZzJyYWQodGhpcy5waGkpLCAtMSk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldFpvb20oKTtcbiAgICAgICAgcmV0dXJuIHJvdGF0ZShhZGQoZGl2KHN1YihbeCwgeV0sIHRoaXMuY2VudGVyKSwgem9vbSksIFt0aGlzLngsIHRoaXMueV0pLCBSXyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTJEOyIsImNvbnN0IENhbWVyYTJEID0gcmVxdWlyZSgnLi8yZCcpO1xuY29uc3Qge2RlZzJyYWQsIHJvdGF0ZSwgZ2V0WFJvdGF0aW9uTWF0cml4LCBnZXRZUm90YXRpb25NYXRyaXh9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuXG5cbmNsYXNzIENhbWVyYTNEIGV4dGVuZHMgQ2FtZXJhMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgZW5naW5lKSB7XG4gICAgICAgIHN1cGVyKGNvbmZpZywgZW5naW5lKTtcbiAgICAgICAgdGhpcy50aGV0YSA9IDA7XG4gICAgfVxuXG4gICAgcm90YXRlVXAoa2V5KSB7XG4gICAgICAgIHRoaXMudGhldGEgLT0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZURvd24oa2V5KSB7XG4gICAgICAgIHRoaXMudGhldGEgKz0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZWRDb29yZHMoYykge1xuICAgICAgICBjb25zdCBSeCA9IGdldFhSb3RhdGlvbk1hdHJpeChkZWcycmFkKHRoaXMudGhldGEpKTtcbiAgICAgICAgY29uc3QgUnkgPSBnZXRZUm90YXRpb25NYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICByZXR1cm4gcm90YXRlKHJvdGF0ZShjLCBSeCksIFJ5KTtcbiAgICB9XG5cbiAgICBhZGp1c3RDb29yZHMoYykge1xuICAgICAgICBjID0gdGhpcy5yb3RhdGVkQ29vcmRzKGMpO1xuICAgICAgICBjb25zdCB6ID0gYy5wb3AoKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0Wm9vbSh6KTtcbiAgICAgICAgY29uc3QgY29vcmRzID0gYWRkKHRoaXMuY2VudGVyLCBtdWwoc3ViKGMsIFt0aGlzLngsIHRoaXMueV0pLCB6b29tKSk7XG4gICAgICAgIHJldHVybiB7Y29vcmRzLCB6fTtcbiAgICB9XG5cbiAgICBhZGp1c3RSYWRpdXMoYywgcmFkaXVzKSB7XG4gICAgICAgIGMgPSB0aGlzLnJvdGF0ZWRDb29yZHMoYyk7XG4gICAgICAgIGNvbnN0IHogPSBjLnBvcCgpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRab29tKHopO1xuICAgICAgICByZXR1cm4gcmFkaXVzICogem9vbTtcbiAgICB9XG5cbiAgICBhY3R1YWxQb2ludCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IFJ4XyA9IGdldFhSb3RhdGlvbk1hdHJpeChkZWcycmFkKHRoaXMudGhldGEpLCAtMSk7XG4gICAgICAgIGNvbnN0IFJ5XyA9IGdldFlSb3RhdGlvbk1hdHJpeChkZWcycmFkKHRoaXMucGhpKSwgLTEpO1xuICAgICAgICBjb25zdCBjID0gYWRkKHN1YihbeCwgeV0sIHRoaXMuY2VudGVyKSwgW3RoaXMueCwgdGhpcy55XSkuY29uY2F0KHRoaXMueiAtIHRoaXMuY29uZmlnLkNBTUVSQV9ESVNUQU5DRSk7XG4gICAgICAgIHJldHVybiByb3RhdGUocm90YXRlKGMsIFJ5XyksIFJ4Xyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTNEOyIsImNsYXNzIENvbnRyb2xCb3gge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBjb250cm9sbGVycywgeCwgeSkge1xuICAgICAgICBjb25zdCAkdGVtcGxhdGVDb250cm9sQm94ID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJyk7XG4gICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gJHRlbXBsYXRlQ29udHJvbEJveC5jbG9uZSgpO1xuICAgICAgICAkY29udHJvbEJveC5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnRpdGxlJykudGV4dCh0aXRsZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dENvbnRhaW5lciA9ICRjb250cm9sQm94LmZpbmQoJy5pbnB1dC1jb250YWluZXInKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sbGVyIG9mIGNvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgICAkaW5wdXRDb250YWluZXIuYXBwZW5kKGNvbnRyb2xsZXIuJGlucHV0V3JhcHBlcik7XG4gICAgICAgIH1cbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLmNsb3NlJykuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY29udHJvbEJveC5pbnNlcnRCZWZvcmUoJHRlbXBsYXRlQ29udHJvbEJveCk7XG4gICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG5cbiAgICAgICAgdGhpcy4kY29udHJvbEJveCA9ICRjb250cm9sQm94O1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLiRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGlzT3BlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGNvbnRyb2xCb3hbMF0ucGFyZW50Tm9kZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbEJveDsiLCJjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIG5hbWUsIG1pbiwgbWF4LCB2YWx1ZSwgZnVuYykge1xuICAgICAgICBjb25zdCAkaW5wdXRXcmFwcGVyID0gdGhpcy4kaW5wdXRXcmFwcGVyID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlIC5pbnB1dC13cmFwcGVyLnRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5maW5kKCcubmFtZScpLnRleHQobmFtZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dCA9IHRoaXMuJGlucHV0ID0gJGlucHV0V3JhcHBlci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAkaW5wdXQuYXR0cignbWluJywgbWluKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21heCcsIG1heCk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd2YWx1ZScsIHZhbHVlKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3N0ZXAnLCAwLjAxKTtcbiAgICAgICAgY29uc3QgJHZhbHVlID0gJGlucHV0V3JhcHBlci5maW5kKCcudmFsdWUnKTtcbiAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICRpbnB1dC5vbignaW5wdXQnLCBlID0+IHtcbiAgICAgICAgICAgICR2YWx1ZS50ZXh0KHRoaXMuZ2V0KCkpO1xuICAgICAgICAgICAgZnVuYy5jYWxsKG9iamVjdCwgZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy4kaW5wdXQudmFsKCkpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sbGVyOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4uL29iamVjdC9jaXJjbGUnKTtcbmNvbnN0IENhbWVyYTJEID0gcmVxdWlyZSgnLi4vY2FtZXJhLzJkJyk7XG5jb25zdCB7cm90YXRlLCBub3csIHJhbmRvbSwgcG9sYXIyY2FydGVzaWFuLCByYW5kQ29sb3IsIGdldFJvdGF0aW9uTWF0cml4LCBjYXJ0ZXNpYW4yYXV0bywgc2tpcEludmlzaWJsZUVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsfSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbiwgbWF4fSA9IE1hdGg7XG5cblxuY2xhc3MgUGF0aCB7XG4gICAgY29uc3RydWN0b3Iob2JqKSB7XG4gICAgICAgIHRoaXMucHJldlBvcyA9IG9iai5wcmV2UG9zLnNsaWNlKCk7XG4gICAgICAgIHRoaXMucG9zID0gb2JqLnBvcy5zbGljZSgpO1xuICAgIH1cbn1cblxuY2xhc3MgRW5naW5lMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgY3R4KSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcbiAgICAgICAgdGhpcy5vYmpzID0gW107XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW107XG4gICAgICAgIHRoaXMucGF0aHMgPSBbXTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhMkQoY29uZmlnLCB0aGlzKTtcbiAgICAgICAgdGhpcy5mcHNMYXN0VGltZSA9IG5vdygpO1xuICAgICAgICB0aGlzLmZwc0NvdW50ID0gMDtcbiAgICB9XG5cbiAgICB0b2dnbGVBbmltYXRpbmcoKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gIXRoaXMuYW5pbWF0aW5nO1xuICAgICAgICBkb2N1bWVudC50aXRsZSA9IGAke3RoaXMuY29uZmlnLlRJVExFfSAoJHt0aGlzLmFuaW1hdGluZyA/IFwiU2ltdWxhdGluZ1wiIDogXCJQYXVzZWRcIn0pYDtcbiAgICB9XG5cbiAgICBkZXN0cm95Q29udHJvbEJveGVzKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRyb2xCb3ggb2YgdGhpcy5jb250cm9sQm94ZXMpIHtcbiAgICAgICAgICAgIGNvbnRyb2xCb3guY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRyb2xCb3hlcyA9IFtdXG4gICAgfVxuXG4gICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgdGhpcy5wcmludEZwcygpO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlQWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWRyYXdBbGwoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUoKTtcbiAgICAgICAgfSwgMTApO1xuICAgIH1cblxuICAgIG9iamVjdENvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuY2FtZXJhLmFkanVzdFJhZGl1cyhvYmoucG9zLCBvYmouZ2V0UmFkaXVzKCkpO1xuICAgICAgICBjb25zdCB7Y29vcmRzLCB6fSA9IHRoaXMuY2FtZXJhLmFkanVzdENvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIGNvb3Jkcy5jb25jYXQocikuY29uY2F0KHopO1xuICAgIH1cblxuICAgIGRpcmVjdGlvbkNvb3JkcyhvYmosIGZhY3RvciA9IHRoaXMuY29uZmlnLkRJUkVDVElPTl9MRU5HVEgpIHtcbiAgICAgICAgY29uc3Qge2Nvb3JkczogYzF9ID0gdGhpcy5jYW1lcmEuYWRqdXN0Q29vcmRzKG9iai5wb3MpO1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMiwgen0gPSB0aGlzLmNhbWVyYS5hZGp1c3RDb29yZHMoYWRkKG9iai5wb3MsIG11bChvYmoudiwgZmFjdG9yKSkpO1xuICAgICAgICByZXR1cm4gYzEuY29uY2F0KGMyKS5jb25jYXQoeik7XG4gICAgfVxuXG4gICAgcGF0aENvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3Qge2Nvb3JkczogYzEsIHoxfSA9IHRoaXMuY2FtZXJhLmFkanVzdENvb3JkcyhvYmoucHJldlBvcyk7XG4gICAgICAgIGNvbnN0IHtjb29yZHM6IGMyLCB6Mn0gPSB0aGlzLmNhbWVyYS5hZGp1c3RDb29yZHMob2JqLnBvcyk7XG4gICAgICAgIHJldHVybiBjMS5jb25jYXQoYzIsIG1heCh6MSwgejIpKTtcbiAgICB9XG5cbiAgICBkcmF3T2JqZWN0KGMsIGNvbG9yID0gbnVsbCkge1xuICAgICAgICBza2lwSW52aXNpYmxlRXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgY29sb3IgPSBjb2xvciB8fCBjLmNvbG9yO1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBDaXJjbGUpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5vYmplY3RDb29yZHMoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhjWzBdLCBjWzFdLCBjWzJdLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gY29sb3I7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdEaXJlY3Rpb24oYykge1xuICAgICAgICBza2lwSW52aXNpYmxlRXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBDaXJjbGUpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5kaXJlY3Rpb25Db29yZHMoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhjWzBdLCBjWzFdKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhjWzJdLCBjWzNdKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJyMwMDAwMDAnO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdQYXRoKGMpIHtcbiAgICAgICAgc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChjIGluc3RhbmNlb2YgUGF0aCkge1xuICAgICAgICAgICAgICAgIGMgPSB0aGlzLnBhdGhDb29yZHMoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhjWzBdLCBjWzFdKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhjWzJdLCBjWzNdKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJyNkZGRkZGQnO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNyZWF0ZVBhdGgob2JqKSB7XG4gICAgICAgIGlmIChtYWcoc3ViKG9iai5wb3MsIG9iai5wcmV2UG9zKSkgPiA1KSB7XG4gICAgICAgICAgICB0aGlzLnBhdGhzLnB1c2gobmV3IFBhdGgob2JqKSk7XG4gICAgICAgICAgICBvYmoucHJldlBvcyA9IG9iai5wb3Muc2xpY2UoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhdGhzLmxlbmd0aCA+IHRoaXMuY29uZmlnLk1BWF9QQVRIUykge1xuICAgICAgICAgICAgICAgIHRoaXMucGF0aHMgPSB0aGlzLnBhdGhzLnNsaWNlKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXNlckNyZWF0ZU9iamVjdCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuY2FtZXJhLmFjdHVhbFBvaW50KHgsIHkpO1xuICAgICAgICBsZXQgbWF4UiA9IENpcmNsZS5nZXRSYWRpdXNGcm9tTWFzcyh0aGlzLmNvbmZpZy5NQVNTX01BWCk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgbWF4UiA9IG1pbihtYXhSLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5nZXRSYWRpdXMoKSkgLyAxLjUpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbSA9IENpcmNsZS5nZXRNYXNzRnJvbVJhZGl1cyhyYW5kb20oQ2lyY2xlLmdldFJhZGl1c0Zyb21NYXNzKHRoaXMuY29uZmlnLk1BU1NfTUlOKSwgbWF4UikpO1xuICAgICAgICBjb25zdCB2ID0gcG9sYXIyY2FydGVzaWFuKHJhbmRvbSh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVggLyAyKSwgcmFuZG9tKC0xODAsIDE4MCkpO1xuICAgICAgICBjb25zdCBjb2xvciA9IHJhbmRDb2xvcigpO1xuICAgICAgICBjb25zdCB0YWcgPSBgY2lyY2xlJHt0aGlzLm9ianMubGVuZ3RofWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBDaXJjbGUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIG9iai5zaG93Q29udHJvbEJveCh4LCB5KTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBjcmVhdGVPYmplY3QodGFnLCBwb3MsIG0sIHYsIGNvbG9yKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBDaXJjbGUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzLCBkaXIgPSAxKSB7XG4gICAgICAgIHJldHVybiBnZXRSb3RhdGlvbk1hdHJpeChhbmdsZXNbMF0sIGRpcik7XG4gICAgfVxuXG4gICAgZ2V0UGl2b3RBeGlzKCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBjb2xsaWRlRWxhc3RpY2FsbHkoKSB7XG4gICAgICAgIGNvbnN0IGRpbWVuc2lvbiA9IHRoaXMuY29uZmlnLkRJTUVOU0lPTjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG8xID0gdGhpcy5vYmpzW2ldO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgdGhpcy5vYmpzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbzIgPSB0aGlzLm9ianNbal07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sbGlzaW9uID0gc3ViKG8yLnBvcywgbzEucG9zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbmdsZXMgPSBjYXJ0ZXNpYW4yYXV0byhjb2xsaXNpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBhbmdsZXMuc2hpZnQoKTtcblxuICAgICAgICAgICAgICAgIGlmIChkIDwgbzEuZ2V0UmFkaXVzKCkgKyBvMi5nZXRSYWRpdXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBSID0gdGhpcy5nZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBSXyA9IHRoaXMuZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzLCAtMSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLmdldFBpdm90QXhpcygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZUZW1wID0gW3JvdGF0ZShvMS52LCBSKSwgcm90YXRlKG8yLnYsIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdkZpbmFsID0gW3ZUZW1wWzBdLnNsaWNlKCksIHZUZW1wWzFdLnNsaWNlKCldO1xuICAgICAgICAgICAgICAgICAgICB2RmluYWxbMF1baV0gPSAoKG8xLm0gLSBvMi5tKSAqIHZUZW1wWzBdW2ldICsgMiAqIG8yLm0gKiB2VGVtcFsxXVtpXSkgLyAobzEubSArIG8yLm0pO1xuICAgICAgICAgICAgICAgICAgICB2RmluYWxbMV1baV0gPSAoKG8yLm0gLSBvMS5tKSAqIHZUZW1wWzFdW2ldICsgMiAqIG8xLm0gKiB2VGVtcFswXVtpXSkgLyAobzEubSArIG8yLm0pO1xuICAgICAgICAgICAgICAgICAgICBvMS52ID0gcm90YXRlKHZGaW5hbFswXSwgUl8pO1xuICAgICAgICAgICAgICAgICAgICBvMi52ID0gcm90YXRlKHZGaW5hbFsxXSwgUl8pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc1RlbXAgPSBbemVyb3MoZGltZW5zaW9uKSwgcm90YXRlKGNvbGxpc2lvbiwgUildO1xuICAgICAgICAgICAgICAgICAgICBwb3NUZW1wWzBdW2ldICs9IHZGaW5hbFswXVtpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zVGVtcFsxXVtpXSArPSB2RmluYWxbMV1baV07XG4gICAgICAgICAgICAgICAgICAgIG8xLnBvcyA9IGFkZChvMS5wb3MsIHJvdGF0ZShwb3NUZW1wWzBdLCBSXykpO1xuICAgICAgICAgICAgICAgICAgICBvMi5wb3MgPSBhZGQobzEucG9zLCByb3RhdGUocG9zVGVtcFsxXSwgUl8pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxjdWxhdGVBbGwoKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZVZlbG9jaXR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb2xsaWRlRWxhc3RpY2FsbHkoKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUGF0aChvYmopO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVkcmF3QWxsKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgdGhpcy5kcmF3T2JqZWN0KG9iaik7XG4gICAgICAgICAgICB0aGlzLmRyYXdEaXJlY3Rpb24ob2JqKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wYXRocykge1xuICAgICAgICAgICAgdGhpcy5kcmF3UGF0aChwYXRoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaW50RnBzKCkge1xuICAgICAgICB0aGlzLmZwc0NvdW50ICs9IDE7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbm93KCk7XG4gICAgICAgIGNvbnN0IHRpbWVEaWZmID0gY3VycmVudFRpbWUgLSB0aGlzLmZwc0xhc3RUaW1lO1xuICAgICAgICBpZiAodGltZURpZmYgPiAxKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHsodGhpcy5mcHNDb3VudCAvIHRpbWVEaWZmKSB8IDB9IGZwc2ApO1xuICAgICAgICAgICAgdGhpcy5mcHNMYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgdGhpcy5mcHNDb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5naW5lMkQ7IiwiY29uc3QgRW5naW5lMkQgPSByZXF1aXJlKCcuLzJkJyk7XG5jb25zdCBDYW1lcmEzRCA9IHJlcXVpcmUoJy4uL2NhbWVyYS8zZCcpO1xuY29uc3QgU3BoZXJlID0gcmVxdWlyZSgnLi4vb2JqZWN0L3NwaGVyZScpO1xuY29uc3Qge3JhbmRvbSwgZ2V0WVJvdGF0aW9uTWF0cml4LCBnZXRaUm90YXRpb25NYXRyaXgsIHJhbmRDb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbiwgc2tpcEludmlzaWJsZUVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHttYWcsIHN1YiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbn0gPSBNYXRoO1xuXG5cbmNsYXNzIEVuZ2luZTNEIGV4dGVuZHMgRW5naW5lMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgY3R4KSB7XG4gICAgICAgIHN1cGVyKGNvbmZpZywgY3R4KTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhM0QoY29uZmlnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBkaXJlY3Rpb25Db29yZHMob2JqKSB7XG4gICAgICAgIGNvbnN0IGMgPSB0aGlzLmNhbWVyYS5yb3RhdGVkQ29vcmRzKG9iai5wb3MpO1xuICAgICAgICBjb25zdCBhZGp1c3RlZEZhY3RvciA9ICh0aGlzLmNhbWVyYS56IC0gY1syXSAtIDEpIC8gb2JqLnZbMl07XG4gICAgICAgIGxldCBmYWN0b3IgPSB0aGlzLmNvbmZpZy5ESVJFQ1RJT05fTEVOR1RIO1xuICAgICAgICBpZiAoYWRqdXN0ZWRGYWN0b3IgPiAwKSBmYWN0b3IgPSBtaW4oZmFjdG9yLCBhZGp1c3RlZEZhY3Rvcik7XG4gICAgICAgIHJldHVybiBzdXBlci5kaXJlY3Rpb25Db29yZHMob2JqLCBmYWN0b3IpO1xuICAgIH1cblxuICAgIHVzZXJDcmVhdGVPYmplY3QoeCwgeSkge1xuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmNhbWVyYS5hY3R1YWxQb2ludCh4LCB5KTtcbiAgICAgICAgbGV0IG1heFIgPSBTcGhlcmUuZ2V0UmFkaXVzRnJvbU1hc3ModGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG1heFIgPSBtaW4obWF4UiwgKG1hZyhzdWIob2JqLnBvcywgcG9zKSkgLSBvYmouZ2V0UmFkaXVzKCkpIC8gMS41KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtID0gU3BoZXJlLmdldE1hc3NGcm9tUmFkaXVzKHJhbmRvbShTcGhlcmUuZ2V0UmFkaXVzRnJvbU1hc3ModGhpcy5jb25maWcuTUFTU19NSU4pLCBtYXhSKSk7XG4gICAgICAgIGNvbnN0IHYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJhbmRvbSh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVggLyAyKSwgcmFuZG9tKC0xODAsIDE4MCksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSByYW5kQ29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYHNwaGVyZSR7dGhpcy5vYmpzLmxlbmd0aH1gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KHRhZywgcG9zLCBtLCB2LCBjb2xvcikge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZG90KGdldFpSb3RhdGlvbk1hdHJpeChhbmdsZXNbMF0sIGRpciksIGdldFlSb3RhdGlvbk1hdHJpeChhbmdsZXNbMV0sIGRpciksIGRpcik7XG4gICAgfVxuXG4gICAgZ2V0UGl2b3RBeGlzKCkge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG5cbiAgICByZWRyYXdBbGwoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKTtcbiAgICAgICAgY29uc3Qgb3JkZXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLm9iamVjdENvb3JkcyhvYmopO1xuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBjb29yZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgb3JkZXJzLnB1c2goWydvYmplY3QnLCBjb29yZHMsIHosIG9iai5jb2xvcl0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBza2lwSW52aXNpYmxlRXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IHRoaXMuZGlyZWN0aW9uQ29vcmRzKG9iaik7XG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IGNvb3Jkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBvcmRlcnMucHVzaChbJ2RpcmVjdGlvbicsIGNvb3Jkcywgel0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHRoaXMucGF0aHMpIHtcbiAgICAgICAgICAgIHNraXBJbnZpc2libGVFcnJvcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0gdGhpcy5wYXRoQ29vcmRzKHBhdGgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBjb29yZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgb3JkZXJzLnB1c2goWydwYXRoJywgY29vcmRzLCB6XSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBvcmRlcnMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGFbMl0gLSBiWzJdO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChjb25zdCBbdHlwZSwgY29vcmRzLCB6LCBjb2xvcl0gb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdPYmplY3QoY29vcmRzLCBjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGlvbic6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0RpcmVjdGlvbihjb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwYXRoJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGF0aChjb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUzRDsiLCJjbGFzcyBJbnZpc2libGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludmlzaWJsZUVycm9yOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi9lbmdpbmUvMmQnKTtcbmNvbnN0IEVuZ2luZTNEID0gcmVxdWlyZSgnLi9lbmdpbmUvM2QnKTtcbmNvbnN0IHtnZXREaXN0YW5jZSwgc2tpcEludmlzaWJsZUVycm9yfSA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5cbmxldCBjb25maWcgPSBudWxsO1xuY29uc3Qga2V5bWFwID0ge1xuICAgIDM4OiAndXAnLFxuICAgIDQwOiAnZG93bicsXG4gICAgMzc6ICdsZWZ0JyxcbiAgICAzOTogJ3JpZ2h0JyxcbiAgICA5MDogJ3pvb21JbicsIC8vIHpcbiAgICA4ODogJ3pvb21PdXQnLCAvLyB4XG4gICAgODc6ICdyb3RhdGVVcCcsIC8vIHdcbiAgICA4MzogJ3JvdGF0ZURvd24nLCAvLyBzXG4gICAgNjU6ICdyb3RhdGVMZWZ0JywgLy8gYVxuICAgIDY4OiAncm90YXRlUmlnaHQnIC8vIGRcbn07XG5cbmZ1bmN0aW9uIG9uX3Jlc2l6ZSgkY2FudmFzKSB7XG4gICAgY29uZmlnLlcgPSAkY2FudmFzWzBdLndpZHRoID0gJGNhbnZhcy53aWR0aCgpO1xuICAgIGNvbmZpZy5IID0gJGNhbnZhc1swXS5oZWlnaHQgPSAkY2FudmFzLmhlaWdodCgpO1xufVxuXG5mdW5jdGlvbiBvbl9jbGljayhldmVudCwgZW5naW5lKSB7XG4gICAgY29uc3QgeCA9IGV2ZW50LnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBldmVudC5wYWdlWTtcbiAgICBpZiAoIWVuZ2luZS5hbmltYXRpbmcpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIGlmIChza2lwSW52aXNpYmxlRXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbY3gsIGN5LCByXSA9IGVuZ2luZS5vYmplY3RDb29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdldERpc3RhbmNlKGN4LCBjeSwgeCwgeSkgPCByKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKSByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZW5naW5lLnVzZXJDcmVhdGVPYmplY3QoeCwgeSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbl9rZXlfZG93bihldmVudCwgZW5naW5lKSB7XG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG4gICAgaWYgKGtleUNvZGUgPT0gMzIpIHsgLy8gc3BhY2UgYmFyXG4gICAgICAgIGVuZ2luZS5kZXN0cm95Q29udHJvbEJveGVzKCk7XG4gICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgaW4ga2V5bWFwICYmIGtleW1hcFtrZXlDb2RlXSBpbiBlbmdpbmUuY2FtZXJhKSB7XG4gICAgICAgIGVuZ2luZS5jYW1lcmFba2V5bWFwW2tleUNvZGVdXShrZXlDb2RlKTtcbiAgICB9XG59XG5cbmNsYXNzIFNpbXVsYXRvciB7XG4gICAgY29uc3RydWN0b3IocHJlc2V0KSB7XG4gICAgICAgIGNvbmZpZyA9IHByZXNldCh7fSk7XG4gICAgICAgIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMnKTtcbiAgICAgICAgY29uc3QgY3R4ID0gJGNhbnZhc1swXS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBvbl9yZXNpemUoJGNhbnZhcyk7XG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IChjb25maWcuRElNRU5TSU9OID09IDIgPyBFbmdpbmUyRCA6IEVuZ2luZTNEKShjb25maWcsIGN0eCk7XG4gICAgICAgIGlmICgnaW5pdCcgaW4gY29uZmlnKSBjb25maWcuaW5pdCh0aGlzLmVuZ2luZSk7XG4gICAgICAgICRjYW52YXMucmVzaXplKGUgPT4ge1xuICAgICAgICAgICAgb25fcmVzaXplKCRjYW52YXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNhbnZhcy5jbGljayhlID0+IHtcbiAgICAgICAgICAgIG9uX2NsaWNrKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJ2JvZHknKS5rZXlkb3duKGUgPT4ge1xuICAgICAgICAgICAgb25fa2V5X2Rvd24oZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhbmltYXRlKCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5hbmltYXRlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvcjsiLCJmdW5jdGlvbiBpdGVyKGEsIGZ1bmMpIHtcbiAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICBtW2ldID0gZnVuYyhpKTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHplcm9zOiBOID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheShOKS5maWxsKDApO1xuICAgIH0sXG5cbiAgICBtYWc6IGEgPT4ge1xuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBhW2ldICogYVtpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHN1bSk7XG4gICAgfSxcblxuICAgIGFkZDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSArIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzdWI6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLSBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbXVsOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICogYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRpdjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAvIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkb3Q6IChhLCBiLCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGlmIChkaXIgPT0gLTEpIHtcbiAgICAgICAgICAgIFthLCBiXSA9IFtiLCBhXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYV9jID0gYVswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJfYyA9IGJbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgYV9yOyByKyspIHtcbiAgICAgICAgICAgIG1bcl0gPSBuZXcgQXJyYXkoYl9jKTtcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgYl9jOyBjKyspIHtcbiAgICAgICAgICAgICAgICBtW3JdW2NdID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG1bcl1bY10gKz0gYVtyXVtpXSAqIGJbaV1bY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbn07IiwiY29uc3QgQ29udHJvbEJveCA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbF9ib3gnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHtyYWQyZGVnLCBkZWcycmFkLCBwb2xhcjJjYXJ0ZXNpYW4sIGNhcnRlc2lhbjJhdXRvLCBzcXVhcmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdn0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttYXgsIHBvd30gPSBNYXRoO1xuXG5cbmNsYXNzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogUG9sYXIgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2xhcl9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldlBvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBudWxsO1xuICAgIH1cblxuICAgIGdldFJhZGl1cygpIHtcbiAgICAgICAgcmV0dXJuIENpcmNsZS5nZXRSYWRpdXNGcm9tTWFzcyh0aGlzLm0pXG4gICAgfVxuXG4gICAgY2FsY3VsYXRlVmVsb2NpdHkoKSB7XG4gICAgICAgIGxldCBGID0gemVyb3ModGhpcy5jb25maWcuRElNRU5TSU9OKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgaWYgKG9iaiA9PSB0aGlzKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvciA9IHN1Yih0aGlzLnBvcywgb2JqLnBvcyk7XG4gICAgICAgICAgICBjb25zdCBtYWduaXR1ZGUgPSBtYWcodmVjdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXRWZWN0b3IgPSBkaXYodmVjdG9yLCBtYWduaXR1ZGUpO1xuICAgICAgICAgICAgRiA9IGFkZChGLCBtdWwodW5pdFZlY3Rvciwgb2JqLm0gLyBzcXVhcmUobWFnbml0dWRlKSkpXG4gICAgICAgIH1cbiAgICAgICAgRiA9IG11bChGLCAtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBkaXYoRiwgdGhpcy5tKTtcbiAgICAgICAgdGhpcy52ID0gYWRkKHRoaXMudiwgYSk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlUG9zaXRpb24oKSB7XG4gICAgICAgIHRoaXMucG9zID0gYWRkKHRoaXMucG9zLCB0aGlzLnYpO1xuICAgIH1cblxuICAgIGNvbnRyb2xNKGUpIHtcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgfVxuXG4gICAgY29udHJvbFBvcyhlKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc1hDb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NZQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBbeCwgeV07XG4gICAgfVxuXG4gICAgY29udHJvbFYoZSkge1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZSaG9Db250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudlBoaUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICB0aGlzLnYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmhvLCBwaGkpO1xuICAgIH1cblxuICAgIHNob3dDb250cm9sQm94KHgsIHkpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udHJvbEJveCAmJiB0aGlzLmNvbnRyb2xCb3guaXNPcGVuKCkpIHtcbiAgICAgICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gdGhpcy5jb250cm9sQm94LiRjb250cm9sQm94O1xuICAgICAgICAgICAgJGNvbnRyb2xCb3guY3NzKCdsZWZ0JywgeCArICdweCcpO1xuICAgICAgICAgICAgJGNvbnRyb2xCb3guY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG4gICAgICAgICAgICAkY29udHJvbEJveC5uZXh0VW50aWwoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpLmluc2VydEJlZm9yZSgkY29udHJvbEJveCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBtYXJnaW4gPSAxLjU7XG5cbiAgICAgICAgICAgIHZhciBwb3NSYW5nZSA9IG1heChtYXgodGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCkgLyAyLCBtYXguYXBwbHkobnVsbCwgdGhpcy5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgICAgIHBvc1JhbmdlID0gbWF4KHBvc1JhbmdlLCBtYXguYXBwbHkobnVsbCwgb2JqLnBvcy5tYXAoTWF0aC5hYnMpKSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZSYW5nZSA9IG1heCh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVgsIG1hZyh0aGlzLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICB2UmFuZ2UgPSBtYXgodlJhbmdlLCBtYWcob2JqLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgbSwgdiwgdlJhbmdlKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbEJveCA9IG5ldyBDb250cm9sQm94KHRoaXMudGFnLCB0aGlzLmdldENvbnRyb2xsZXJzKCksIHgsIHkpO1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUuY29udHJvbEJveGVzLnB1c2godGhpcy5jb250cm9sQm94KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc1JhbmdlLCBtLCB2LCB2UmFuZ2UpIHtcbiAgICAgICAgdGhpcy5tQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiTWFzcyBtXCIsIHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCwgbSwgdGhpcy5jb250cm9sTSk7XG4gICAgICAgIHRoaXMucG9zWENvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHhcIiwgLXBvc1JhbmdlLCBwb3NSYW5nZSwgdGhpcy5wb3NbMF0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHlcIiwgLXBvc1JhbmdlLCBwb3NSYW5nZSwgdGhpcy5wb3NbMV0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMudlJob0NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM+BXCIsIDAsIHZSYW5nZSwgdlswXSwgdGhpcy5jb250cm9sVik7XG4gICAgICAgIHRoaXMudlBoaUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM+GXCIsIC0xODAsIDE4MCwgcmFkMmRlZyh2WzFdKSwgdGhpcy5jb250cm9sVik7XG4gICAgfVxuXG4gICAgZ2V0Q29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRSYWRpdXNGcm9tTWFzcyhtKSB7XG4gICAgICAgIHJldHVybiBwb3cobSwgMSAvIDIpXG4gICAgfVxuXG4gICAgc3RhdGljIGdldE1hc3NGcm9tUmFkaXVzKHIpIHtcbiAgICAgICAgcmV0dXJuIHNxdWFyZShyKVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyd0YWcnOiB0aGlzLnRhZywgJ3YnOiB0aGlzLnYsICdwb3MnOiB0aGlzLnBvc30pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGU7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi9jaXJjbGUnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHtyYWQyZGVnLCBkZWcycmFkLCBzcGhlcmljYWwyY2FydGVzaWFufSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHtjdWJlfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHtwb3d9ID0gTWF0aDtcblxuXG5jbGFzcyBTcGhlcmUgZXh0ZW5kcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFNwaGVyaWNhbCBjb29yZGluYXRlIHN5c3RlbVxuICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NwaGVyaWNhbF9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgZ2V0UmFkaXVzKCkge1xuICAgICAgICByZXR1cm4gU3BoZXJlLmdldFJhZGl1c0Zyb21NYXNzKHRoaXMubSk7XG4gICAgfVxuXG4gICAgY29udHJvbFBvcyhlKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc1hDb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NZQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeiA9IHRoaXMucG9zWkNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHksIHpdO1xuICAgIH1cblxuICAgIGNvbnRyb2xWKGUpIHtcbiAgICAgICAgY29uc3QgcGhpID0gZGVnMnJhZCh0aGlzLnZQaGlDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgdGhldGEgPSBkZWcycmFkKHRoaXMudlRoZXRhQ29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudlJob0NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMudiA9IHNwaGVyaWNhbDJjYXJ0ZXNpYW4ocmhvLCBwaGksIHRoZXRhKTtcbiAgICB9XG5cbiAgICBzZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpIHtcbiAgICAgICAgc3VwZXIuc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKTtcbiAgICAgICAgdGhpcy5wb3NaQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24gelwiLCAtcG9zX3JhbmdlLCBwb3NfcmFuZ2UsIHRoaXMucG9zWzJdLCB0aGlzLmNvbnRyb2xQb3MpO1xuICAgICAgICB0aGlzLnZUaGV0YUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM64XCIsIC0xODAsIDE4MCwgcmFkMmRlZyh2WzJdKSwgdGhpcy5jb250cm9sVik7XG4gICAgfVxuXG4gICAgZ2V0Q29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1pDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlBoaUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZUaGV0YUNvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UmFkaXVzRnJvbU1hc3MobSkge1xuICAgICAgICByZXR1cm4gcG93KG0sIDEgLyAzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0TWFzc0Zyb21SYWRpdXMocikge1xuICAgICAgICByZXR1cm4gY3ViZShyKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3BoZXJlOyIsImNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi9lcnJvci9pbnZpc2libGUnKTtcbmNvbnN0IHttYWcsIGRvdH0gPSByZXF1aXJlKCcuL21hdHJpeCcpO1xuXG5jb25zdCBVdGlsID0ge1xuICAgIHNxdWFyZTogKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIHggKiB4O1xuICAgIH0sXG5cbiAgICBjdWJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHggKiB4O1xuICAgIH0sXG5cbiAgICBwb2xhcjJjYXJ0ZXNpYW46IChyaG8sIHBoaSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHBoaSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnBvbGFyOiAoeCwgeSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbWFnKFt4LCB5XSksXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIHNwaGVyaWNhbDJjYXJ0ZXNpYW46IChyaG8sIHBoaSwgdGhldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLnNpbihwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5jb3ModGhldGEpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJzcGhlcmljYWw6ICh4LCB5LCB6KSA9PiB7XG4gICAgICAgIGNvbnN0IHJobyA9IG1hZyhbeCwgeSwgel0pO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvLFxuICAgICAgICAgICAgTWF0aC5hdGFuMih5LCB4KSxcbiAgICAgICAgICAgIHJobyAhPSAwID8gTWF0aC5hY29zKHogLyByaG8pIDogMFxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4yYXV0bzogKHZlY3RvcikgPT4ge1xuICAgICAgICByZXR1cm4gdmVjdG9yLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICA/IFV0aWwuY2FydGVzaWFuMnBvbGFyKHZlY3RvclswXSwgdmVjdG9yWzFdKVxuICAgICAgICAgICAgOiBVdGlsLmNhcnRlc2lhbjJzcGhlcmljYWwodmVjdG9yWzBdLCB2ZWN0b3JbMV0sIHZlY3RvclsyXSk7XG4gICAgfSxcblxuICAgIHJhZDJkZWc6IChyYWQpID0+IHtcbiAgICAgICAgcmV0dXJuIHJhZCAvIE1hdGguUEkgKiAxODA7XG4gICAgfSxcblxuICAgIGRlZzJyYWQ6IChkZWcpID0+IHtcbiAgICAgICAgcmV0dXJuIGRlZyAvIDE4MCAqIE1hdGguUEk7XG4gICAgfSxcblxuICAgIGdldERpc3RhbmNlOiAoeDAsIHkwLCB4MSwgeTEpID0+IHtcbiAgICAgICAgcmV0dXJuIG1hZyhbeDEgLSB4MCwgeTEgLSB5MF0pO1xuICAgIH0sXG5cbiAgICByb3RhdGU6ICh2ZWN0b3IsIG1hdHJpeCkgPT4ge1xuICAgICAgICByZXR1cm4gZG90KFt2ZWN0b3JdLCBtYXRyaXgpWzBdO1xuICAgIH0sXG5cbiAgICBub3c6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICB9LFxuXG4gICAgcmFuZG9tOiAobWluLCBtYXggPSBudWxsKSA9PiB7XG4gICAgICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4ID0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuICAgIH0sXG5cbiAgICByYW5kQ29sb3I6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuICcjJyArIE1hdGguZmxvb3IoMHgxMDAwMDAwICsgTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbiAgICB9LFxuXG4gICAgZ2V0Um90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIC1zaW5dLFxuICAgICAgICAgICAgW3NpbiwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRYUm90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFsxLCAwLCAwXSxcbiAgICAgICAgICAgIFswLCBjb3MsIC1zaW5dLFxuICAgICAgICAgICAgWzAsIHNpbiwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRZUm90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIDAsIHNpbl0sXG4gICAgICAgICAgICBbMCwgMSwgMF0sXG4gICAgICAgICAgICBbLXNpbiwgMCwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRaUm90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIC1zaW4sIDBdLFxuICAgICAgICAgICAgW3NpbiwgY29zLCAwXSxcbiAgICAgICAgICAgIFswLCAwLCAxXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBza2lwSW52aXNpYmxlRXJyb3I6IGZ1bmMgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsOyJdfQ==

//# sourceMappingURL=gravity_simulator.js.map
