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
        CAMERA_DISTANCE: 100,
        INPUT_TYPE: 'range'
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

function WOO_2D(c) {
    return extend(true, EMPTY_2D(c), {
        INPUT_TYPE: 'number'
    });
}
WOO_2D.prototype.title = '2D WOO';

function WOO_3D(c) {
    return extend(true, EMPTY_3D(c), {
        INPUT_TYPE: 'number'
    });
}
WOO_3D.prototype.title = '3D WOO';

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

module.exports = [EMPTY_2D, EMPTY_3D, WOO_2D, WOO_3D, DEBUG];

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
    function ControlBox(object, title, controllers, x, y) {
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
        $controlBox.find('.remove').click(function () {
            object.destroy();
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
        $input.attr('type', object.config.INPUT_TYPE);
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
        this.lastObjNo = 0;
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
            var tag = 'circle' + ++this.lastObjNo;
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
            var tag = 'sphere' + ++this.lastObjNo;
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
                this.controlBox = new ControlBox(this, this.tag, this.getControllers(), x, y);
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
        key: 'destroy',
        value: function destroy() {
            var i = this.engine.objs.indexOf(this);
            this.engine.objs.splice(i, 1);
            if (this.controlBox && this.controlBox.isOpen()) {
                this.controlBox.close();
            }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLElBQU0sWUFBWSxRQUFRLGFBQVIsQ0FBbEI7O0FBRUEsSUFBTSxZQUFZLElBQUksU0FBSixFQUFsQjtBQUNBLElBQUksV0FBVyxDQUFmO0FBQ0EsVUFBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLEtBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3JDLFFBQU0sU0FBUyxRQUFRLENBQVIsQ0FBZjtBQUNBLFlBQVEsTUFBUixxQkFBaUMsQ0FBakMsVUFBc0MsS0FBSyxRQUFMLEdBQWdCLFdBQWhCLEdBQThCLEVBQXBFLFVBQTBFLE9BQU8sU0FBUCxDQUFpQixLQUEzRjtBQUNIO0FBQ0QsUUFBUSxNQUFSLENBQWUsWUFBTTtBQUNqQixlQUFXLFNBQVMsUUFBUSxJQUFSLENBQWEsV0FBYixFQUEwQixHQUExQixFQUFULENBQVg7QUFDQSxjQUFVLElBQVYsQ0FBZSxRQUFRLFFBQVIsQ0FBZjtBQUNILENBSEQ7QUFJQSxRQUFRLEtBQVIsQ0FBYyxZQUFNO0FBQ2hCLFlBQVEsSUFBUjtBQUNILENBRkQ7QUFHQSxFQUFFLFFBQUYsRUFBWSxLQUFaLENBQWtCLFlBQU07QUFDcEIsY0FBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7QUFDSCxDQUZEOztBQUtBLElBQUksVUFBVSxJQUFkO0FBQ0EsSUFBSSxXQUFKO0FBQUEsSUFBUSxXQUFSOztBQUVBLEVBQUUsTUFBRixFQUFVLEVBQVYsQ0FBYSxXQUFiLEVBQTBCLHlCQUExQixFQUFxRCxVQUFVLENBQVYsRUFBYTtBQUM5RCxTQUFLLEVBQUUsS0FBUDtBQUNBLFNBQUssRUFBRSxLQUFQO0FBQ0EsY0FBVSxFQUFFLElBQUYsRUFBUSxNQUFSLENBQWUsY0FBZixDQUFWO0FBQ0EsWUFBUSxTQUFSLENBQWtCLHVCQUFsQixFQUEyQyxZQUEzQyxDQUF3RCxPQUF4RDtBQUNBLFdBQU8sS0FBUDtBQUNILENBTkQ7O0FBUUEsRUFBRSxNQUFGLEVBQVUsU0FBVixDQUFvQixVQUFVLENBQVYsRUFBYTtBQUM3QixRQUFJLENBQUMsT0FBTCxFQUFjO0FBQ2QsUUFBTSxJQUFJLEVBQUUsS0FBWjtBQUNBLFFBQU0sSUFBSSxFQUFFLEtBQVo7QUFDQSxZQUFRLEdBQVIsQ0FBWSxNQUFaLEVBQW9CLFNBQVMsUUFBUSxHQUFSLENBQVksTUFBWixDQUFULEtBQWlDLElBQUksRUFBckMsSUFBMkMsSUFBL0Q7QUFDQSxZQUFRLEdBQVIsQ0FBWSxLQUFaLEVBQW1CLFNBQVMsUUFBUSxHQUFSLENBQVksS0FBWixDQUFULEtBQWdDLElBQUksRUFBcEMsSUFBMEMsSUFBN0Q7QUFDQSxTQUFLLEVBQUUsS0FBUDtBQUNBLFNBQUssRUFBRSxLQUFQO0FBQ0gsQ0FSRDs7QUFVQSxFQUFFLE1BQUYsRUFBVSxPQUFWLENBQWtCLFVBQVUsQ0FBVixFQUFhO0FBQzNCLGNBQVUsSUFBVjtBQUNILENBRkQ7Ozs7O1NDN0NpQixDO0lBQVYsTSxNQUFBLE07OztBQUdQLFNBQVMsUUFBVCxDQUFrQixDQUFsQixFQUFxQjtBQUNqQixXQUFPLE9BQU8sSUFBUCxFQUFhLENBQWIsRUFBZ0I7QUFDbkIsb0JBQVksT0FETztBQUVuQixtQkFBVyxDQUZRO0FBR25CLG1CQUFXLElBSFE7QUFJbkIsMkJBQW1CLENBSkE7QUFLbkIsMkJBQW1CLENBTEE7QUFNbkIsNkJBQXFCLEdBTkY7QUFPbkIsV0FBRyxHQVBnQjtBQVFuQixrQkFBVSxDQVJTO0FBU25CLGtCQUFVLEdBVFM7QUFVbkIsc0JBQWMsRUFWSztBQVduQiwwQkFBa0IsRUFYQztBQVluQix5QkFBaUIsR0FaRTtBQWFuQixvQkFBWTtBQWJPLEtBQWhCLENBQVA7QUFlSDtBQUNELFNBQVMsU0FBVCxDQUFtQixLQUFuQixHQUEyQixzQkFBM0I7O0FBR0EsU0FBUyxRQUFULENBQWtCLENBQWxCLEVBQXFCO0FBQ2pCLFdBQU8sT0FBTyxJQUFQLEVBQWEsU0FBUyxDQUFULENBQWIsRUFBMEI7QUFDN0IsbUJBQVcsQ0FEa0I7QUFFN0IsV0FBRyxLQUYwQjtBQUc3QixrQkFBVSxDQUhtQjtBQUk3QixrQkFBVSxHQUptQjtBQUs3QixzQkFBYztBQUxlLEtBQTFCLENBQVA7QUFPSDtBQUNELFNBQVMsU0FBVCxDQUFtQixLQUFuQixHQUEyQixzQkFBM0I7O0FBRUEsU0FBUyxNQUFULENBQWdCLENBQWhCLEVBQW1CO0FBQ2YsV0FBTyxPQUFPLElBQVAsRUFBYSxTQUFTLENBQVQsQ0FBYixFQUEwQjtBQUM3QixvQkFBWTtBQURpQixLQUExQixDQUFQO0FBR0g7QUFDRCxPQUFPLFNBQVAsQ0FBaUIsS0FBakIsR0FBeUIsUUFBekI7O0FBRUEsU0FBUyxNQUFULENBQWdCLENBQWhCLEVBQW1CO0FBQ2YsV0FBTyxPQUFPLElBQVAsRUFBYSxTQUFTLENBQVQsQ0FBYixFQUEwQjtBQUM3QixvQkFBWTtBQURpQixLQUExQixDQUFQO0FBR0g7QUFDRCxPQUFPLFNBQVAsQ0FBaUIsS0FBakIsR0FBeUIsUUFBekI7O0FBRUEsU0FBUyxLQUFULENBQWUsQ0FBZixFQUFrQjtBQUNkLFdBQU8sT0FBTyxJQUFQLEVBQWEsU0FBUyxDQUFULENBQWIsRUFBMEI7QUFDN0IsY0FBTSxjQUFDLE1BQUQsRUFBWTtBQUNkLG1CQUFPLFlBQVAsQ0FBb0IsT0FBcEIsRUFBNkIsQ0FBQyxDQUFDLEdBQUYsRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUE3QixFQUEyQyxPQUEzQyxFQUFvRCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFwRCxFQUErRCxPQUEvRDtBQUNBLG1CQUFPLFlBQVAsQ0FBb0IsT0FBcEIsRUFBNkIsQ0FBQyxFQUFELEVBQUssQ0FBTCxFQUFRLENBQVIsQ0FBN0IsRUFBeUMsS0FBekMsRUFBZ0QsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBaEQsRUFBMkQsTUFBM0Q7QUFDQSxtQkFBTyxlQUFQO0FBQ0g7QUFMNEIsS0FBMUIsQ0FBUDtBQU9IO0FBQ0QsTUFBTSxTQUFOLENBQWdCLEtBQWhCLEdBQXdCLE9BQXhCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixDQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLE1BQXJCLEVBQTZCLE1BQTdCLEVBQXFDLEtBQXJDLENBQWpCOzs7Ozs7Ozs7QUMzREEsSUFBTSxpQkFBaUIsUUFBUSxvQkFBUixDQUF2Qjs7ZUFDa0QsUUFBUSxTQUFSLEM7SUFBM0MsTyxZQUFBLE87SUFBUyxNLFlBQUEsTTtJQUFRLEcsWUFBQSxHO0lBQUssaUIsWUFBQSxpQjs7Z0JBQ2lCLFFBQVEsV0FBUixDO0lBQXZDLEssYUFBQSxLO0lBQU8sRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHOztJQUNoQyxHLEdBQU8sSSxDQUFQLEc7O0lBRUQsUTtBQUNGLHNCQUFZLE1BQVosRUFBb0IsTUFBcEIsRUFBNEI7QUFBQTs7QUFDeEIsYUFBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLGFBQUssQ0FBTCxHQUFTLENBQVQ7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxDQUFMLEdBQVMsT0FBTyxlQUFoQjtBQUNBLGFBQUssR0FBTCxHQUFXLENBQVg7QUFDQSxhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsYUFBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0EsYUFBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLGFBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxhQUFLLE1BQUw7QUFDSDs7OztpQ0FFUTtBQUNMLGlCQUFLLE1BQUwsR0FBYyxDQUFDLEtBQUssTUFBTCxDQUFZLENBQVosR0FBZ0IsQ0FBakIsRUFBb0IsS0FBSyxNQUFMLENBQVksQ0FBWixHQUFnQixDQUFwQyxDQUFkO0FBQ0g7OztxQ0FFWSxHLEVBQUs7QUFDZCxnQkFBTSxjQUFjLEtBQXBCO0FBQ0EsZ0JBQUksT0FBTyxLQUFLLE9BQVosSUFBdUIsY0FBYyxLQUFLLFFBQW5CLEdBQThCLENBQXpELEVBQTREO0FBQ3hELHFCQUFLLEtBQUwsSUFBYyxDQUFkO0FBQ0gsYUFGRCxNQUVPO0FBQ0gscUJBQUssS0FBTCxHQUFhLENBQWI7QUFDSDtBQUNELGlCQUFLLFFBQUwsR0FBZ0IsV0FBaEI7QUFDQSxpQkFBSyxPQUFMLEdBQWUsR0FBZjtBQUNBLG1CQUFPLEtBQUssTUFBTCxDQUFZLGlCQUFaLEdBQWdDLElBQUksS0FBSyxNQUFMLENBQVksbUJBQWhCLEVBQXFDLEtBQUssS0FBMUMsQ0FBdkM7QUFDSDs7OzJCQUVFLEcsRUFBSztBQUNKLGlCQUFLLENBQUwsSUFBVSxLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7OzZCQUVJLEcsRUFBSztBQUNOLGlCQUFLLENBQUwsSUFBVSxLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7OzZCQUVJLEcsRUFBSztBQUNOLGlCQUFLLENBQUwsSUFBVSxLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7OzhCQUVLLEcsRUFBSztBQUNQLGlCQUFLLENBQUwsSUFBVSxLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7OytCQUVNLEcsRUFBSztBQUNSLGlCQUFLLENBQUwsSUFBVSxLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O2dDQUVPLEcsRUFBSztBQUNULGlCQUFLLENBQUwsSUFBVSxLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O21DQUVVLEcsRUFBSztBQUNaLGlCQUFLLEdBQUwsSUFBWSxLQUFLLE1BQUwsQ0FBWSxpQkFBeEI7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OztvQ0FFVyxHLEVBQUs7QUFDYixpQkFBSyxHQUFMLElBQVksS0FBSyxNQUFMLENBQVksaUJBQXhCO0FBQ0EsaUJBQUssT0FBTDtBQUNIOzs7a0NBRVMsQ0FDVDs7O2tDQUVjO0FBQUEsZ0JBQVAsQ0FBTyx1RUFBSCxDQUFHOztBQUNYLGdCQUFJLFdBQVcsS0FBSyxDQUFMLEdBQVMsQ0FBeEI7QUFDQSxnQkFBSSxZQUFZLENBQWhCLEVBQW1CO0FBQ2Ysc0JBQU0sSUFBSSxjQUFKLEVBQU47QUFDSDtBQUNELG1CQUFPLEtBQUssTUFBTCxDQUFZLGVBQVosR0FBOEIsUUFBckM7QUFDSDs7O3FDQUVZLEMsRUFBRztBQUNaLGdCQUFNLElBQUksa0JBQWtCLFFBQVEsS0FBSyxHQUFiLENBQWxCLENBQVY7QUFDQSxnQkFBSSxPQUFPLENBQVAsRUFBVSxDQUFWLENBQUo7QUFDQSxnQkFBTSxPQUFPLEtBQUssT0FBTCxFQUFiO0FBQ0EsZ0JBQU0sU0FBUyxJQUFJLEtBQUssTUFBVCxFQUFpQixJQUFJLElBQUksQ0FBSixFQUFPLENBQUMsS0FBSyxDQUFOLEVBQVMsS0FBSyxDQUFkLENBQVAsQ0FBSixFQUE4QixJQUE5QixDQUFqQixDQUFmO0FBQ0EsbUJBQU8sRUFBQyxjQUFELEVBQVA7QUFDSDs7O3FDQUVZLE0sRUFBUSxNLEVBQVE7QUFDekIsZ0JBQU0sT0FBTyxLQUFLLE9BQUwsRUFBYjtBQUNBLG1CQUFPLFNBQVMsSUFBaEI7QUFDSDs7O29DQUVXLEMsRUFBRyxDLEVBQUc7QUFDZCxnQkFBTSxLQUFLLGtCQUFrQixRQUFRLEtBQUssR0FBYixDQUFsQixFQUFxQyxDQUFDLENBQXRDLENBQVg7QUFDQSxnQkFBTSxPQUFPLEtBQUssT0FBTCxFQUFiO0FBQ0EsbUJBQU8sT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUosRUFBWSxLQUFLLE1BQWpCLENBQUosRUFBOEIsSUFBOUIsQ0FBSixFQUF5QyxDQUFDLEtBQUssQ0FBTixFQUFTLEtBQUssQ0FBZCxDQUF6QyxDQUFQLEVBQW1FLEVBQW5FLENBQVA7QUFDSDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7Ozs7O0FDMUdBLElBQU0sV0FBVyxRQUFRLE1BQVIsQ0FBakI7O2VBQ2tFLFFBQVEsU0FBUixDO0lBQTNELE8sWUFBQSxPO0lBQVMsTSxZQUFBLE07SUFBUSxrQixZQUFBLGtCO0lBQW9CLGtCLFlBQUEsa0I7O2dCQUNFLFFBQVEsV0FBUixDO0lBQXZDLEssYUFBQSxLO0lBQU8sRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHOztJQUdqQyxROzs7QUFDRixzQkFBWSxNQUFaLEVBQW9CLE1BQXBCLEVBQTRCO0FBQUE7O0FBQUEsd0hBQ2xCLE1BRGtCLEVBQ1YsTUFEVTs7QUFFeEIsY0FBSyxLQUFMLEdBQWEsQ0FBYjtBQUZ3QjtBQUczQjs7OztpQ0FFUSxHLEVBQUs7QUFDVixpQkFBSyxLQUFMLElBQWMsS0FBSyxNQUFMLENBQVksaUJBQTFCO0FBQ0EsaUJBQUssT0FBTDtBQUNIOzs7bUNBRVUsRyxFQUFLO0FBQ1osaUJBQUssS0FBTCxJQUFjLEtBQUssTUFBTCxDQUFZLGlCQUExQjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O3NDQUVhLEMsRUFBRztBQUNiLGdCQUFNLEtBQUssbUJBQW1CLFFBQVEsS0FBSyxLQUFiLENBQW5CLENBQVg7QUFDQSxnQkFBTSxLQUFLLG1CQUFtQixRQUFRLEtBQUssR0FBYixDQUFuQixDQUFYO0FBQ0EsbUJBQU8sT0FBTyxPQUFPLENBQVAsRUFBVSxFQUFWLENBQVAsRUFBc0IsRUFBdEIsQ0FBUDtBQUNIOzs7cUNBRVksQyxFQUFHO0FBQ1osZ0JBQUksS0FBSyxhQUFMLENBQW1CLENBQW5CLENBQUo7QUFDQSxnQkFBTSxJQUFJLEVBQUUsR0FBRixFQUFWO0FBQ0EsZ0JBQU0sT0FBTyxLQUFLLE9BQUwsQ0FBYSxDQUFiLENBQWI7QUFDQSxnQkFBTSxTQUFTLElBQUksS0FBSyxNQUFULEVBQWlCLElBQUksSUFBSSxDQUFKLEVBQU8sQ0FBQyxLQUFLLENBQU4sRUFBUyxLQUFLLENBQWQsQ0FBUCxDQUFKLEVBQThCLElBQTlCLENBQWpCLENBQWY7QUFDQSxtQkFBTyxFQUFDLGNBQUQsRUFBUyxJQUFULEVBQVA7QUFDSDs7O3FDQUVZLEMsRUFBRyxNLEVBQVE7QUFDcEIsZ0JBQUksS0FBSyxhQUFMLENBQW1CLENBQW5CLENBQUo7QUFDQSxnQkFBTSxJQUFJLEVBQUUsR0FBRixFQUFWO0FBQ0EsZ0JBQU0sT0FBTyxLQUFLLE9BQUwsQ0FBYSxDQUFiLENBQWI7QUFDQSxtQkFBTyxTQUFTLElBQWhCO0FBQ0g7OztvQ0FFVyxDLEVBQUcsQyxFQUFHO0FBQ2QsZ0JBQU0sTUFBTSxtQkFBbUIsUUFBUSxLQUFLLEtBQWIsQ0FBbkIsRUFBd0MsQ0FBQyxDQUF6QyxDQUFaO0FBQ0EsZ0JBQU0sTUFBTSxtQkFBbUIsUUFBUSxLQUFLLEdBQWIsQ0FBbkIsRUFBc0MsQ0FBQyxDQUF2QyxDQUFaO0FBQ0EsZ0JBQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFKLEVBQVksS0FBSyxNQUFqQixDQUFKLEVBQThCLENBQUMsS0FBSyxDQUFOLEVBQVMsS0FBSyxDQUFkLENBQTlCLEVBQWdELE1BQWhELENBQXVELEtBQUssQ0FBTCxHQUFTLEtBQUssTUFBTCxDQUFZLGVBQTVFLENBQVY7QUFDQSxtQkFBTyxPQUFPLE9BQU8sQ0FBUCxFQUFVLEdBQVYsQ0FBUCxFQUF1QixHQUF2QixDQUFQO0FBQ0g7Ozs7RUExQ2tCLFE7O0FBNkN2QixPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7OztJQ2xETSxVO0FBQ0Ysd0JBQVksTUFBWixFQUFvQixLQUFwQixFQUEyQixXQUEzQixFQUF3QyxDQUF4QyxFQUEyQyxDQUEzQyxFQUE4QztBQUFBOztBQUMxQyxZQUFNLHNCQUFzQixFQUFFLHVCQUFGLENBQTVCO0FBQ0EsWUFBTSxjQUFjLG9CQUFvQixLQUFwQixFQUFwQjtBQUNBLG9CQUFZLFdBQVosQ0FBd0IsVUFBeEI7QUFDQSxvQkFBWSxJQUFaLENBQWlCLFFBQWpCLEVBQTJCLElBQTNCLENBQWdDLEtBQWhDO0FBQ0EsWUFBTSxrQkFBa0IsWUFBWSxJQUFaLENBQWlCLGtCQUFqQixDQUF4QjtBQUwwQztBQUFBO0FBQUE7O0FBQUE7QUFNMUMsaUNBQXlCLFdBQXpCLDhIQUFzQztBQUFBLG9CQUEzQixVQUEyQjs7QUFDbEMsZ0NBQWdCLE1BQWhCLENBQXVCLFdBQVcsYUFBbEM7QUFDSDtBQVJ5QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVMxQyxvQkFBWSxJQUFaLENBQWlCLFFBQWpCLEVBQTJCLEtBQTNCLENBQWlDLFlBQU07QUFDbkMsd0JBQVksTUFBWjtBQUNILFNBRkQ7QUFHQSxvQkFBWSxJQUFaLENBQWlCLFNBQWpCLEVBQTRCLEtBQTVCLENBQWtDLFlBQU07QUFDcEMsbUJBQU8sT0FBUDtBQUNILFNBRkQ7QUFHQSxvQkFBWSxZQUFaLENBQXlCLG1CQUF6QjtBQUNBLG9CQUFZLEdBQVosQ0FBZ0IsTUFBaEIsRUFBd0IsSUFBSSxJQUE1QjtBQUNBLG9CQUFZLEdBQVosQ0FBZ0IsS0FBaEIsRUFBdUIsSUFBSSxJQUEzQjs7QUFFQSxhQUFLLFdBQUwsR0FBbUIsV0FBbkI7QUFDSDs7OztnQ0FFTztBQUNKLGlCQUFLLFdBQUwsQ0FBaUIsTUFBakI7QUFDSDs7O2lDQUVRO0FBQ0wsbUJBQU8sS0FBSyxXQUFMLENBQWlCLENBQWpCLEVBQW9CLFVBQTNCO0FBQ0g7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixVQUFqQjs7Ozs7Ozs7O0lDaENNLFU7QUFDRix3QkFBWSxNQUFaLEVBQW9CLElBQXBCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEtBQXBDLEVBQTJDLElBQTNDLEVBQWlEO0FBQUE7O0FBQUE7O0FBQzdDLFlBQU0sZ0JBQWdCLEtBQUssYUFBTCxHQUFxQixFQUFFLCtDQUFGLEVBQW1ELEtBQW5ELEVBQTNDO0FBQ0Esc0JBQWMsV0FBZCxDQUEwQixVQUExQjtBQUNBLHNCQUFjLElBQWQsQ0FBbUIsT0FBbkIsRUFBNEIsSUFBNUIsQ0FBaUMsSUFBakM7QUFDQSxZQUFNLFNBQVMsS0FBSyxNQUFMLEdBQWMsY0FBYyxJQUFkLENBQW1CLE9BQW5CLENBQTdCO0FBQ0EsZUFBTyxJQUFQLENBQVksTUFBWixFQUFvQixPQUFPLE1BQVAsQ0FBYyxVQUFsQztBQUNBLGVBQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsR0FBbkI7QUFDQSxlQUFPLElBQVAsQ0FBWSxLQUFaLEVBQW1CLEdBQW5CO0FBQ0EsZUFBTyxJQUFQLENBQVksT0FBWixFQUFxQixLQUFyQjtBQUNBLGVBQU8sSUFBUCxDQUFZLE1BQVosRUFBb0IsSUFBcEI7QUFDQSxZQUFNLFNBQVMsY0FBYyxJQUFkLENBQW1CLFFBQW5CLENBQWY7QUFDQSxlQUFPLElBQVAsQ0FBWSxLQUFLLEdBQUwsRUFBWjtBQUNBLGVBQU8sRUFBUCxDQUFVLE9BQVYsRUFBbUIsYUFBSztBQUNwQixtQkFBTyxJQUFQLENBQVksTUFBSyxHQUFMLEVBQVo7QUFDQSxpQkFBSyxJQUFMLENBQVUsTUFBVixFQUFrQixDQUFsQjtBQUNILFNBSEQ7QUFJSDs7Ozs4QkFFSztBQUNGLG1CQUFPLFdBQVcsS0FBSyxNQUFMLENBQVksR0FBWixFQUFYLENBQVA7QUFDSDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFVBQWpCOzs7Ozs7Ozs7QUN4QkEsSUFBTSxTQUFTLFFBQVEsa0JBQVIsQ0FBZjtBQUNBLElBQU0sV0FBVyxRQUFRLGNBQVIsQ0FBakI7O2VBQ2lILFFBQVEsU0FBUixDO0lBQTFHLE0sWUFBQSxNO0lBQVEsRyxZQUFBLEc7SUFBSyxNLFlBQUEsTTtJQUFRLGUsWUFBQSxlO0lBQWlCLFMsWUFBQSxTO0lBQVcsa0IsWUFBQSxpQjtJQUFtQixjLFlBQUEsYztJQUFnQixrQixZQUFBLGtCOztnQkFDdkQsUUFBUSxXQUFSLEM7SUFBN0IsSyxhQUFBLEs7SUFBTyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRzs7SUFDdEIsRyxHQUFZLEksQ0FBWixHO0lBQUssRyxHQUFPLEksQ0FBUCxHOztJQUdOLEksR0FDRixjQUFZLEdBQVosRUFBaUI7QUFBQTs7QUFDYixTQUFLLE9BQUwsR0FBZSxJQUFJLE9BQUosQ0FBWSxLQUFaLEVBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUSxLQUFSLEVBQVg7QUFDSCxDOztJQUdDLFE7QUFDRixzQkFBWSxNQUFaLEVBQW9CLEdBQXBCLEVBQXlCO0FBQUE7O0FBQ3JCLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxhQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsYUFBSyxJQUFMLEdBQVksRUFBWjtBQUNBLGFBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNBLGFBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLGFBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxhQUFLLE1BQUwsR0FBYyxJQUFJLFFBQUosQ0FBYSxNQUFiLEVBQXFCLElBQXJCLENBQWQ7QUFDQSxhQUFLLFdBQUwsR0FBbUIsS0FBbkI7QUFDQSxhQUFLLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDQSxhQUFLLFNBQUwsR0FBaUIsQ0FBakI7QUFDSDs7OzswQ0FFaUI7QUFDZCxpQkFBSyxTQUFMLEdBQWlCLENBQUMsS0FBSyxTQUF2QjtBQUNBLHFCQUFTLEtBQVQsR0FBb0IsS0FBSyxNQUFMLENBQVksS0FBaEMsV0FBMEMsS0FBSyxTQUFMLEdBQWlCLFlBQWpCLEdBQWdDLFFBQTFFO0FBQ0g7Ozs4Q0FFcUI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDbEIscUNBQXlCLEtBQUssWUFBOUIsOEhBQTRDO0FBQUEsd0JBQWpDLFVBQWlDOztBQUN4QywrQkFBVyxLQUFYO0FBQ0g7QUFIaUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFJbEIsaUJBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNIOzs7a0NBRVM7QUFDTixpQkFBSyxHQUFMLEdBQVcsSUFBWDtBQUNBLGlCQUFLLG1CQUFMO0FBQ0g7OztrQ0FFUztBQUFBOztBQUNOLGdCQUFJLENBQUMsS0FBSyxHQUFWLEVBQWU7QUFDZixpQkFBSyxRQUFMO0FBQ0EsZ0JBQUksS0FBSyxTQUFULEVBQW9CO0FBQ2hCLHFCQUFLLFlBQUw7QUFDSDtBQUNELGlCQUFLLFNBQUw7QUFDQSx1QkFBVyxZQUFNO0FBQ2Isc0JBQUssT0FBTDtBQUNILGFBRkQsRUFFRyxFQUZIO0FBR0g7OztxQ0FFWSxHLEVBQUs7QUFDZCxnQkFBTSxJQUFJLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBSSxHQUE3QixFQUFrQyxJQUFJLFNBQUosRUFBbEMsQ0FBVjs7QUFEYyx1Q0FFTSxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLElBQUksR0FBN0IsQ0FGTjtBQUFBLGdCQUVQLE1BRk8sd0JBRVAsTUFGTztBQUFBLGdCQUVDLENBRkQsd0JBRUMsQ0FGRDs7QUFHZCxtQkFBTyxPQUFPLE1BQVAsQ0FBYyxDQUFkLEVBQWlCLE1BQWpCLENBQXdCLENBQXhCLENBQVA7QUFDSDs7O3dDQUVlLEcsRUFBNEM7QUFBQSxnQkFBdkMsTUFBdUMsdUVBQTlCLEtBQUssTUFBTCxDQUFZLGdCQUFrQjs7QUFBQSx3Q0FDbkMsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixJQUFJLEdBQTdCLENBRG1DO0FBQUEsZ0JBQ3pDLEVBRHlDLHlCQUNqRCxNQURpRDs7QUFBQSx3Q0FFaEMsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixJQUFJLElBQUksR0FBUixFQUFhLElBQUksSUFBSSxDQUFSLEVBQVcsTUFBWCxDQUFiLENBQXpCLENBRmdDO0FBQUEsZ0JBRXpDLEVBRnlDLHlCQUVqRCxNQUZpRDtBQUFBLGdCQUVyQyxDQUZxQyx5QkFFckMsQ0FGcUM7O0FBR3hELG1CQUFPLEdBQUcsTUFBSCxDQUFVLEVBQVYsRUFBYyxNQUFkLENBQXFCLENBQXJCLENBQVA7QUFDSDs7O21DQUVVLEcsRUFBSztBQUFBLHdDQUNTLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBSSxPQUE3QixDQURUO0FBQUEsZ0JBQ0csRUFESCx5QkFDTCxNQURLOztBQUFBLHdDQUVZLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBSSxHQUE3QixDQUZaO0FBQUEsZ0JBRUcsRUFGSCx5QkFFTCxNQUZLO0FBQUEsZ0JBRU8sQ0FGUCx5QkFFTyxDQUZQOztBQUdaLG1CQUFPLEdBQUcsTUFBSCxDQUFVLEVBQVYsRUFBYyxNQUFkLENBQXFCLENBQXJCLENBQVA7QUFDSDs7O21DQUVVLEMsRUFBaUI7QUFBQTs7QUFBQSxnQkFBZCxLQUFjLHVFQUFOLElBQU07O0FBQ3hCLCtCQUFtQixZQUFNO0FBQ3JCLHdCQUFRLFNBQVMsRUFBRSxLQUFuQjtBQUNBLG9CQUFJLGFBQWEsTUFBakIsRUFBeUI7QUFDckIsd0JBQUksT0FBSyxZQUFMLENBQWtCLENBQWxCLENBQUo7QUFDSDtBQUNELHVCQUFLLEdBQUwsQ0FBUyxTQUFUO0FBQ0EsdUJBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxFQUFFLENBQUYsQ0FBYixFQUFtQixFQUFFLENBQUYsQ0FBbkIsRUFBeUIsRUFBRSxDQUFGLENBQXpCLEVBQStCLENBQS9CLEVBQWtDLElBQUksS0FBSyxFQUEzQyxFQUErQyxLQUEvQztBQUNBLHVCQUFLLEdBQUwsQ0FBUyxTQUFULEdBQXFCLEtBQXJCO0FBQ0EsdUJBQUssR0FBTCxDQUFTLElBQVQ7QUFDSCxhQVREO0FBVUg7OztzQ0FFYSxDLEVBQUc7QUFBQTs7QUFDYiwrQkFBbUIsWUFBTTtBQUNyQixvQkFBSSxhQUFhLE1BQWpCLEVBQXlCO0FBQ3JCLHdCQUFJLE9BQUssZUFBTCxDQUFxQixDQUFyQixDQUFKO0FBQ0g7QUFDRCx1QkFBSyxHQUFMLENBQVMsU0FBVDtBQUNBLHVCQUFLLEdBQUwsQ0FBUyxNQUFULENBQWdCLEVBQUUsQ0FBRixDQUFoQixFQUFzQixFQUFFLENBQUYsQ0FBdEI7QUFDQSx1QkFBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixFQUFFLENBQUYsQ0FBaEIsRUFBc0IsRUFBRSxDQUFGLENBQXRCO0FBQ0EsdUJBQUssR0FBTCxDQUFTLFdBQVQsR0FBdUIsU0FBdkI7QUFDQSx1QkFBSyxHQUFMLENBQVMsTUFBVDtBQUNILGFBVEQ7QUFVSDs7O2lDQUVRLEMsRUFBRztBQUFBOztBQUNSLCtCQUFtQixZQUFNO0FBQ3JCLG9CQUFJLGFBQWEsSUFBakIsRUFBdUI7QUFDbkIsd0JBQUksT0FBSyxVQUFMLENBQWdCLENBQWhCLENBQUo7QUFDSDtBQUNELHVCQUFLLEdBQUwsQ0FBUyxTQUFUO0FBQ0EsdUJBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsRUFBRSxDQUFGLENBQWhCLEVBQXNCLEVBQUUsQ0FBRixDQUF0QjtBQUNBLHVCQUFLLEdBQUwsQ0FBUyxNQUFULENBQWdCLEVBQUUsQ0FBRixDQUFoQixFQUFzQixFQUFFLENBQUYsQ0FBdEI7QUFDQSx1QkFBSyxHQUFMLENBQVMsV0FBVCxHQUF1QixTQUF2QjtBQUNBLHVCQUFLLEdBQUwsQ0FBUyxNQUFUO0FBQ0gsYUFURDtBQVVIOzs7bUNBRVUsRyxFQUFLO0FBQ1osZ0JBQUksSUFBSSxJQUFJLElBQUksR0FBUixFQUFhLElBQUksT0FBakIsQ0FBSixJQUFpQyxDQUFyQyxFQUF3QztBQUNwQyxxQkFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixJQUFJLElBQUosQ0FBUyxHQUFULENBQWhCO0FBQ0Esb0JBQUksT0FBSixHQUFjLElBQUksR0FBSixDQUFRLEtBQVIsRUFBZDtBQUNBLG9CQUFJLEtBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsS0FBSyxNQUFMLENBQVksU0FBcEMsRUFBK0M7QUFDM0MseUJBQUssS0FBTCxHQUFhLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsQ0FBakIsQ0FBYjtBQUNIO0FBQ0o7QUFDSjs7O3lDQUVnQixDLEVBQUcsQyxFQUFHO0FBQ25CLGdCQUFNLE1BQU0sS0FBSyxNQUFMLENBQVksV0FBWixDQUF3QixDQUF4QixFQUEyQixDQUEzQixDQUFaO0FBQ0EsZ0JBQUksT0FBTyxPQUFPLGlCQUFQLENBQXlCLEtBQUssTUFBTCxDQUFZLFFBQXJDLENBQVg7QUFGbUI7QUFBQTtBQUFBOztBQUFBO0FBR25CLHNDQUFrQixLQUFLLElBQXZCLG1JQUE2QjtBQUFBLHdCQUFsQixJQUFrQjs7QUFDekIsMkJBQU8sSUFBSSxJQUFKLEVBQVUsQ0FBQyxJQUFJLElBQUksS0FBSSxHQUFSLEVBQWEsR0FBYixDQUFKLElBQXlCLEtBQUksU0FBSixFQUExQixJQUE2QyxHQUF2RCxDQUFQO0FBQ0g7QUFMa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNbkIsZ0JBQU0sSUFBSSxPQUFPLGlCQUFQLENBQXlCLE9BQU8sT0FBTyxpQkFBUCxDQUF5QixLQUFLLE1BQUwsQ0FBWSxRQUFyQyxDQUFQLEVBQXVELElBQXZELENBQXpCLENBQVY7QUFDQSxnQkFBTSxJQUFJLGdCQUFnQixPQUFPLEtBQUssTUFBTCxDQUFZLFlBQVosR0FBMkIsQ0FBbEMsQ0FBaEIsRUFBc0QsT0FBTyxDQUFDLEdBQVIsRUFBYSxHQUFiLENBQXRELENBQVY7QUFDQSxnQkFBTSxRQUFRLFdBQWQ7QUFDQSxnQkFBTSxpQkFBZSxFQUFFLEtBQUssU0FBNUI7QUFDQSxnQkFBTSxNQUFNLElBQUksTUFBSixDQUFXLEtBQUssTUFBaEIsRUFBd0IsQ0FBeEIsRUFBMkIsR0FBM0IsRUFBZ0MsQ0FBaEMsRUFBbUMsS0FBbkMsRUFBMEMsR0FBMUMsRUFBK0MsSUFBL0MsQ0FBWjtBQUNBLGdCQUFJLGNBQUosQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEI7QUFDQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLEdBQWY7QUFDSDs7O3FDQUVZLEcsRUFBSyxHLEVBQUssQyxFQUFHLEMsRUFBRyxLLEVBQU87QUFDaEMsZ0JBQU0sTUFBTSxJQUFJLE1BQUosQ0FBVyxLQUFLLE1BQWhCLEVBQXdCLENBQXhCLEVBQTJCLEdBQTNCLEVBQWdDLENBQWhDLEVBQW1DLEtBQW5DLEVBQTBDLEdBQTFDLEVBQStDLElBQS9DLENBQVo7QUFDQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLEdBQWY7QUFDSDs7OzBDQUVpQixNLEVBQWlCO0FBQUEsZ0JBQVQsR0FBUyx1RUFBSCxDQUFHOztBQUMvQixtQkFBTyxtQkFBa0IsT0FBTyxDQUFQLENBQWxCLEVBQTZCLEdBQTdCLENBQVA7QUFDSDs7O3VDQUVjO0FBQ1gsbUJBQU8sQ0FBUDtBQUNIOzs7NkNBRW9CO0FBQ2pCLGdCQUFNLFlBQVksS0FBSyxNQUFMLENBQVksU0FBOUI7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssSUFBTCxDQUFVLE1BQTlCLEVBQXNDLEdBQXRDLEVBQTJDO0FBQ3ZDLG9CQUFNLEtBQUssS0FBSyxJQUFMLENBQVUsQ0FBVixDQUFYO0FBQ0EscUJBQUssSUFBSSxJQUFJLElBQUksQ0FBakIsRUFBb0IsSUFBSSxLQUFLLElBQUwsQ0FBVSxNQUFsQyxFQUEwQyxHQUExQyxFQUErQztBQUMzQyx3QkFBTSxLQUFLLEtBQUssSUFBTCxDQUFVLENBQVYsQ0FBWDtBQUNBLHdCQUFNLFlBQVksSUFBSSxHQUFHLEdBQVAsRUFBWSxHQUFHLEdBQWYsQ0FBbEI7QUFDQSx3QkFBTSxTQUFTLGVBQWUsU0FBZixDQUFmO0FBQ0Esd0JBQU0sSUFBSSxPQUFPLEtBQVAsRUFBVjs7QUFFQSx3QkFBSSxJQUFJLEdBQUcsU0FBSCxLQUFpQixHQUFHLFNBQUgsRUFBekIsRUFBeUM7QUFDckMsNEJBQU0sSUFBSSxLQUFLLGlCQUFMLENBQXVCLE1BQXZCLENBQVY7QUFDQSw0QkFBTSxLQUFLLEtBQUssaUJBQUwsQ0FBdUIsTUFBdkIsRUFBK0IsQ0FBQyxDQUFoQyxDQUFYO0FBQ0EsNEJBQU0sS0FBSSxLQUFLLFlBQUwsRUFBVjs7QUFFQSw0QkFBTSxRQUFRLENBQUMsT0FBTyxHQUFHLENBQVYsRUFBYSxDQUFiLENBQUQsRUFBa0IsT0FBTyxHQUFHLENBQVYsRUFBYSxDQUFiLENBQWxCLENBQWQ7QUFDQSw0QkFBTSxTQUFTLENBQUMsTUFBTSxDQUFOLEVBQVMsS0FBVCxFQUFELEVBQW1CLE1BQU0sQ0FBTixFQUFTLEtBQVQsRUFBbkIsQ0FBZjtBQUNBLCtCQUFPLENBQVAsRUFBVSxFQUFWLElBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBWCxJQUFnQixNQUFNLENBQU4sRUFBUyxFQUFULENBQWhCLEdBQThCLElBQUksR0FBRyxDQUFQLEdBQVcsTUFBTSxDQUFOLEVBQVMsRUFBVCxDQUExQyxLQUEwRCxHQUFHLENBQUgsR0FBTyxHQUFHLENBQXBFLENBQWY7QUFDQSwrQkFBTyxDQUFQLEVBQVUsRUFBVixJQUFlLENBQUMsQ0FBQyxHQUFHLENBQUgsR0FBTyxHQUFHLENBQVgsSUFBZ0IsTUFBTSxDQUFOLEVBQVMsRUFBVCxDQUFoQixHQUE4QixJQUFJLEdBQUcsQ0FBUCxHQUFXLE1BQU0sQ0FBTixFQUFTLEVBQVQsQ0FBMUMsS0FBMEQsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFwRSxDQUFmO0FBQ0EsMkJBQUcsQ0FBSCxHQUFPLE9BQU8sT0FBTyxDQUFQLENBQVAsRUFBa0IsRUFBbEIsQ0FBUDtBQUNBLDJCQUFHLENBQUgsR0FBTyxPQUFPLE9BQU8sQ0FBUCxDQUFQLEVBQWtCLEVBQWxCLENBQVA7O0FBRUEsNEJBQU0sVUFBVSxDQUFDLE1BQU0sU0FBTixDQUFELEVBQW1CLE9BQU8sU0FBUCxFQUFrQixDQUFsQixDQUFuQixDQUFoQjtBQUNBLGdDQUFRLENBQVIsRUFBVyxFQUFYLEtBQWlCLE9BQU8sQ0FBUCxFQUFVLEVBQVYsQ0FBakI7QUFDQSxnQ0FBUSxDQUFSLEVBQVcsRUFBWCxLQUFpQixPQUFPLENBQVAsRUFBVSxFQUFWLENBQWpCO0FBQ0EsMkJBQUcsR0FBSCxHQUFTLElBQUksR0FBRyxHQUFQLEVBQVksT0FBTyxRQUFRLENBQVIsQ0FBUCxFQUFtQixFQUFuQixDQUFaLENBQVQ7QUFDQSwyQkFBRyxHQUFILEdBQVMsSUFBSSxHQUFHLEdBQVAsRUFBWSxPQUFPLFFBQVEsQ0FBUixDQUFQLEVBQW1CLEVBQW5CLENBQVosQ0FBVDtBQUNIO0FBQ0o7QUFDSjtBQUNKOzs7dUNBRWM7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDWCxzQ0FBa0IsS0FBSyxJQUF2QixtSUFBNkI7QUFBQSx3QkFBbEIsR0FBa0I7O0FBQ3pCLHdCQUFJLGlCQUFKO0FBQ0g7QUFIVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUlYLGlCQUFLLGtCQUFMO0FBSlc7QUFBQTtBQUFBOztBQUFBO0FBS1gsc0NBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUEsd0JBQWxCLEtBQWtCOztBQUN6QiwwQkFBSSxpQkFBSjtBQUNBLHlCQUFLLFVBQUwsQ0FBZ0IsS0FBaEI7QUFDSDtBQVJVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFTZDs7O29DQUVXO0FBQ1IsaUJBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsS0FBSyxNQUFMLENBQVksQ0FBckMsRUFBd0MsS0FBSyxNQUFMLENBQVksQ0FBcEQ7QUFEUTtBQUFBO0FBQUE7O0FBQUE7QUFFUixzQ0FBa0IsS0FBSyxJQUF2QixtSUFBNkI7QUFBQSx3QkFBbEIsR0FBa0I7O0FBQ3pCLHlCQUFLLFVBQUwsQ0FBZ0IsR0FBaEI7QUFDQSx5QkFBSyxhQUFMLENBQW1CLEdBQW5CO0FBQ0g7QUFMTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQU1SLHNDQUFtQixLQUFLLEtBQXhCLG1JQUErQjtBQUFBLHdCQUFwQixJQUFvQjs7QUFDM0IseUJBQUssUUFBTCxDQUFjLElBQWQ7QUFDSDtBQVJPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFTWDs7O21DQUVVO0FBQ1AsaUJBQUssUUFBTCxJQUFpQixDQUFqQjtBQUNBLGdCQUFNLGNBQWMsS0FBcEI7QUFDQSxnQkFBTSxXQUFXLGNBQWMsS0FBSyxXQUFwQztBQUNBLGdCQUFJLFdBQVcsQ0FBZixFQUFrQjtBQUNkLHdCQUFRLEdBQVIsRUFBZ0IsS0FBSyxRQUFMLEdBQWdCLFFBQWpCLEdBQTZCLENBQTVDO0FBQ0EscUJBQUssV0FBTCxHQUFtQixXQUFuQjtBQUNBLHFCQUFLLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDSDtBQUNKOzs7Ozs7QUFHTCxPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMU5BLElBQU0sV0FBVyxRQUFRLE1BQVIsQ0FBakI7QUFDQSxJQUFNLFdBQVcsUUFBUSxjQUFSLENBQWpCO0FBQ0EsSUFBTSxTQUFTLFFBQVEsa0JBQVIsQ0FBZjs7ZUFDNkcsUUFBUSxTQUFSLEM7SUFBdEcsTSxZQUFBLE07SUFBUSxrQixZQUFBLGtCO0lBQW9CLGtCLFlBQUEsa0I7SUFBb0IsUyxZQUFBLFM7SUFBVyxtQixZQUFBLG1CO0lBQXFCLGtCLFlBQUEsa0I7O2dCQUMvRCxRQUFRLFdBQVIsQztJQUFqQixHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7O0lBQ1YsRyxHQUFPLEksQ0FBUCxHOztJQUdELFE7OztBQUNGLHNCQUFZLE1BQVosRUFBb0IsR0FBcEIsRUFBeUI7QUFBQTs7QUFBQSx3SEFDZixNQURlLEVBQ1AsR0FETzs7QUFFckIsY0FBSyxNQUFMLEdBQWMsSUFBSSxRQUFKLENBQWEsTUFBYixRQUFkO0FBRnFCO0FBR3hCOzs7O3dDQUVlLEcsRUFBSztBQUNqQixnQkFBTSxJQUFJLEtBQUssTUFBTCxDQUFZLGFBQVosQ0FBMEIsSUFBSSxHQUE5QixDQUFWO0FBQ0EsZ0JBQU0saUJBQWlCLENBQUMsS0FBSyxNQUFMLENBQVksQ0FBWixHQUFnQixFQUFFLENBQUYsQ0FBaEIsR0FBdUIsQ0FBeEIsSUFBNkIsSUFBSSxDQUFKLENBQU0sQ0FBTixDQUFwRDtBQUNBLGdCQUFJLFNBQVMsS0FBSyxNQUFMLENBQVksZ0JBQXpCO0FBQ0EsZ0JBQUksaUJBQWlCLENBQXJCLEVBQXdCLFNBQVMsSUFBSSxNQUFKLEVBQVksY0FBWixDQUFUO0FBQ3hCLHVJQUE2QixHQUE3QixFQUFrQyxNQUFsQztBQUNIOzs7eUNBRWdCLEMsRUFBRyxDLEVBQUc7QUFDbkIsZ0JBQU0sTUFBTSxLQUFLLE1BQUwsQ0FBWSxXQUFaLENBQXdCLENBQXhCLEVBQTJCLENBQTNCLENBQVo7QUFDQSxnQkFBSSxPQUFPLE9BQU8saUJBQVAsQ0FBeUIsS0FBSyxNQUFMLENBQVksUUFBckMsQ0FBWDtBQUZtQjtBQUFBO0FBQUE7O0FBQUE7QUFHbkIscUNBQWtCLEtBQUssSUFBdkIsOEhBQTZCO0FBQUEsd0JBQWxCLElBQWtCOztBQUN6QiwyQkFBTyxJQUFJLElBQUosRUFBVSxDQUFDLElBQUksSUFBSSxLQUFJLEdBQVIsRUFBYSxHQUFiLENBQUosSUFBeUIsS0FBSSxTQUFKLEVBQTFCLElBQTZDLEdBQXZELENBQVA7QUFDSDtBQUxrQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1uQixnQkFBTSxJQUFJLE9BQU8saUJBQVAsQ0FBeUIsT0FBTyxPQUFPLGlCQUFQLENBQXlCLEtBQUssTUFBTCxDQUFZLFFBQXJDLENBQVAsRUFBdUQsSUFBdkQsQ0FBekIsQ0FBVjtBQUNBLGdCQUFNLElBQUksb0JBQW9CLE9BQU8sS0FBSyxNQUFMLENBQVksWUFBWixHQUEyQixDQUFsQyxDQUFwQixFQUEwRCxPQUFPLENBQUMsR0FBUixFQUFhLEdBQWIsQ0FBMUQsRUFBNkUsT0FBTyxDQUFDLEdBQVIsRUFBYSxHQUFiLENBQTdFLENBQVY7QUFDQSxnQkFBTSxRQUFRLFdBQWQ7QUFDQSxnQkFBTSxpQkFBZSxFQUFFLEtBQUssU0FBNUI7QUFDQSxnQkFBTSxNQUFNLElBQUksTUFBSixDQUFXLEtBQUssTUFBaEIsRUFBd0IsQ0FBeEIsRUFBMkIsR0FBM0IsRUFBZ0MsQ0FBaEMsRUFBbUMsS0FBbkMsRUFBMEMsR0FBMUMsRUFBK0MsSUFBL0MsQ0FBWjtBQUNBLGdCQUFJLGNBQUosQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEI7QUFDQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLEdBQWY7QUFDSDs7O3FDQUVZLEcsRUFBSyxHLEVBQUssQyxFQUFHLEMsRUFBRyxLLEVBQU87QUFDaEMsZ0JBQU0sTUFBTSxJQUFJLE1BQUosQ0FBVyxLQUFLLE1BQWhCLEVBQXdCLENBQXhCLEVBQTJCLEdBQTNCLEVBQWdDLENBQWhDLEVBQW1DLEtBQW5DLEVBQTBDLEdBQTFDLEVBQStDLElBQS9DLENBQVo7QUFDQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLEdBQWY7QUFDSDs7OzBDQUVpQixNLEVBQWlCO0FBQUEsZ0JBQVQsR0FBUyx1RUFBSCxDQUFHOztBQUMvQixtQkFBTyxJQUFJLG1CQUFtQixPQUFPLENBQVAsQ0FBbkIsRUFBOEIsR0FBOUIsQ0FBSixFQUF3QyxtQkFBbUIsT0FBTyxDQUFQLENBQW5CLEVBQThCLEdBQTlCLENBQXhDLEVBQTRFLEdBQTVFLENBQVA7QUFDSDs7O3VDQUVjO0FBQ1gsbUJBQU8sQ0FBUDtBQUNIOzs7b0NBRVc7QUFBQTs7QUFDUixpQkFBSyxHQUFMLENBQVMsU0FBVCxDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixLQUFLLE1BQUwsQ0FBWSxDQUFyQyxFQUF3QyxLQUFLLE1BQUwsQ0FBWSxDQUFwRDtBQUNBLGdCQUFNLFNBQVMsRUFBZjtBQUZRO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBR0csR0FISDs7QUFJSix1Q0FBbUIsWUFBTTtBQUNyQiw0QkFBTSxTQUFTLE9BQUssWUFBTCxDQUFrQixHQUFsQixDQUFmO0FBQ0EsNEJBQU0sSUFBSSxPQUFPLEdBQVAsRUFBVjtBQUNBLCtCQUFPLElBQVAsQ0FBWSxDQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLENBQW5CLEVBQXNCLElBQUksS0FBMUIsQ0FBWjtBQUNILHFCQUpEO0FBSkk7O0FBR1Isc0NBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUE7QUFNNUI7QUFUTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBVUcsR0FWSDs7QUFXSix1Q0FBbUIsWUFBTTtBQUNyQiw0QkFBTSxTQUFTLE9BQUssZUFBTCxDQUFxQixHQUFyQixDQUFmO0FBQ0EsNEJBQU0sSUFBSSxPQUFPLEdBQVAsRUFBVjtBQUNBLCtCQUFPLElBQVAsQ0FBWSxDQUFDLFdBQUQsRUFBYyxNQUFkLEVBQXNCLENBQXRCLENBQVo7QUFDSCxxQkFKRDtBQVhJOztBQVVSLHNDQUFrQixLQUFLLElBQXZCLG1JQUE2QjtBQUFBO0FBTTVCO0FBaEJPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx3QkFpQkcsSUFqQkg7O0FBa0JKLHVDQUFtQixZQUFNO0FBQ3JCLDRCQUFNLFNBQVMsT0FBSyxVQUFMLENBQWdCLElBQWhCLENBQWY7QUFDQSw0QkFBTSxJQUFJLE9BQU8sR0FBUCxFQUFWO0FBQ0EsK0JBQU8sSUFBUCxDQUFZLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsQ0FBakIsQ0FBWjtBQUNILHFCQUpEO0FBbEJJOztBQWlCUixzQ0FBbUIsS0FBSyxLQUF4QixtSUFBK0I7QUFBQTtBQU05QjtBQXZCTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXdCUixtQkFBTyxJQUFQLENBQVksVUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQjtBQUN4Qix1QkFBTyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBZDtBQUNILGFBRkQ7QUF4QlE7QUFBQTtBQUFBOztBQUFBO0FBMkJSLHNDQUF1QyxNQUF2QyxtSUFBK0M7QUFBQTtBQUFBLHdCQUFuQyxJQUFtQztBQUFBLHdCQUE3QixNQUE2QjtBQUFBLHdCQUFyQixDQUFxQjtBQUFBLHdCQUFsQixLQUFrQjs7QUFDM0MsNEJBQVEsSUFBUjtBQUNJLDZCQUFLLFFBQUw7QUFDSSxpQ0FBSyxVQUFMLENBQWdCLE1BQWhCLEVBQXdCLEtBQXhCO0FBQ0E7QUFDSiw2QkFBSyxXQUFMO0FBQ0ksaUNBQUssYUFBTCxDQUFtQixNQUFuQjtBQUNBO0FBQ0osNkJBQUssTUFBTDtBQUNJLGlDQUFLLFFBQUwsQ0FBYyxNQUFkO0FBQ0E7QUFUUjtBQVdIO0FBdkNPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF3Q1g7Ozs7RUFsRmtCLFE7O0FBcUZ2QixPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUM3Rk0sYzs7O0FBQ0YsNEJBQVksT0FBWixFQUFvQjtBQUFBOztBQUFBLCtIQUNWLE9BRFU7QUFFbkI7OztxQkFId0IsSzs7QUFNN0IsT0FBTyxPQUFQLEdBQWlCLGNBQWpCOzs7Ozs7Ozs7Ozs7O0FDTkEsSUFBTSxXQUFXLFFBQVEsYUFBUixDQUFqQjtBQUNBLElBQU0sV0FBVyxRQUFRLGFBQVIsQ0FBakI7O2VBQzBDLFFBQVEsUUFBUixDO0lBQW5DLFcsWUFBQSxXO0lBQWEsa0IsWUFBQSxrQjs7QUFHcEIsSUFBSSxTQUFTLElBQWI7QUFDQSxJQUFNLFNBQVM7QUFDWCxRQUFJLElBRE87QUFFWCxRQUFJLE1BRk87QUFHWCxRQUFJLE1BSE87QUFJWCxRQUFJLE9BSk87QUFLWCxRQUFJLFFBTE8sRUFLRztBQUNkLFFBQUksU0FOTyxFQU1JO0FBQ2YsUUFBSSxVQVBPLEVBT0s7QUFDaEIsUUFBSSxZQVJPLEVBUU87QUFDbEIsUUFBSSxZQVRPLEVBU087QUFDbEIsUUFBSSxhQVZPLENBVU87QUFWUCxDQUFmOztBQWFBLFNBQVMsUUFBVCxDQUFrQixNQUFsQixFQUEwQixPQUExQixFQUFtQztBQUMvQixXQUFPLENBQVAsR0FBVyxRQUFRLENBQVIsRUFBVyxLQUFYLEdBQW1CLFFBQVEsS0FBUixFQUE5QjtBQUNBLFdBQU8sQ0FBUCxHQUFXLFFBQVEsQ0FBUixFQUFXLE1BQVgsR0FBb0IsUUFBUSxNQUFSLEVBQS9CO0FBQ0EsUUFBSSxNQUFKLEVBQVksT0FBTyxNQUFQLENBQWMsTUFBZDtBQUNmOztBQUVELFNBQVMsT0FBVCxDQUFpQixLQUFqQixFQUF3QixNQUF4QixFQUFnQztBQUM1QixRQUFNLElBQUksTUFBTSxLQUFoQjtBQUNBLFFBQU0sSUFBSSxNQUFNLEtBQWhCO0FBQ0EsUUFBSSxDQUFDLE9BQU8sU0FBWixFQUF1QjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsb0JBQ1IsR0FEUTs7QUFFZixvQkFBSSxtQkFBbUIsWUFBTTtBQUFBLCtDQUNELE9BQU8sWUFBUCxDQUFvQixHQUFwQixDQURDO0FBQUE7QUFBQSx3QkFDZCxFQURjO0FBQUEsd0JBQ1YsRUFEVTtBQUFBLHdCQUNOLENBRE07O0FBRXJCLHdCQUFJLFlBQVksRUFBWixFQUFnQixFQUFoQixFQUFvQixDQUFwQixFQUF1QixDQUF2QixJQUE0QixDQUFoQyxFQUFtQztBQUMvQiw0QkFBSSxjQUFKLENBQW1CLENBQW5CLEVBQXNCLENBQXRCO0FBQ0EsK0JBQU8sSUFBUDtBQUNIO0FBQ0osaUJBTkQsQ0FBSixFQU1RO0FBQUE7QUFBQTtBQVJPOztBQUNuQixpQ0FBa0IsT0FBTyxJQUF6Qiw4SEFBK0I7QUFBQTs7QUFBQTtBQVE5QjtBQVRrQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVVuQixlQUFPLGdCQUFQLENBQXdCLENBQXhCLEVBQTJCLENBQTNCO0FBQ0g7QUFDSjs7QUFFRCxTQUFTLFNBQVQsQ0FBbUIsS0FBbkIsRUFBMEIsTUFBMUIsRUFBa0M7QUFBQSxRQUN2QixPQUR1QixHQUNaLEtBRFksQ0FDdkIsT0FEdUI7O0FBRTlCLFFBQUksV0FBVyxFQUFmLEVBQW1CO0FBQUU7QUFDakIsZUFBTyxtQkFBUDtBQUNBLGdCQUFRLEdBQVIsQ0FBWSxHQUFaO0FBQ0EsZUFBTyxlQUFQO0FBQ0gsS0FKRCxNQUlPLElBQUksV0FBVyxNQUFYLElBQXFCLE9BQU8sT0FBUCxLQUFtQixPQUFPLE1BQW5ELEVBQTJEO0FBQzlELGVBQU8sTUFBUCxDQUFjLE9BQU8sT0FBUCxDQUFkLEVBQStCLE9BQS9CO0FBQ0g7QUFDSjs7SUFFSyxTO0FBQ0YseUJBQWM7QUFBQTs7QUFBQTs7QUFDVixhQUFLLE9BQUwsR0FBZSxFQUFFLFFBQUYsQ0FBZjtBQUNBLGFBQUssR0FBTCxHQUFXLEtBQUssT0FBTCxDQUFhLENBQWIsRUFBZ0IsVUFBaEIsQ0FBMkIsSUFBM0IsQ0FBWDtBQUNBLFVBQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUIsYUFBSztBQUNsQixxQkFBUyxNQUFLLE1BQWQsRUFBc0IsTUFBSyxPQUEzQjtBQUNILFNBRkQ7QUFHQSxhQUFLLE9BQUwsQ0FBYSxLQUFiLENBQW1CLGFBQUs7QUFDcEIsb0JBQVEsQ0FBUixFQUFXLE1BQUssTUFBaEI7QUFDSCxTQUZEO0FBR0EsVUFBRSxNQUFGLEVBQVUsT0FBVixDQUFrQixhQUFLO0FBQ25CLHNCQUFVLENBQVYsRUFBYSxNQUFLLE1BQWxCO0FBQ0gsU0FGRDtBQUdIOzs7OzZCQUVJLE0sRUFBUTtBQUNULGdCQUFJLEtBQUssTUFBVCxFQUFpQixLQUFLLE1BQUwsQ0FBWSxPQUFaO0FBQ2pCLHFCQUFTLE9BQU8sRUFBUCxDQUFUO0FBQ0EscUJBQVMsS0FBVCxHQUFpQixPQUFPLEtBQVAsR0FBZSxPQUFPLFNBQVAsQ0FBaUIsS0FBakQ7QUFDQSxxQkFBUyxLQUFLLE1BQWQsRUFBc0IsS0FBSyxPQUEzQjtBQUNBLGlCQUFLLE1BQUwsR0FBYyxLQUFLLE9BQU8sU0FBUCxJQUFvQixDQUFwQixHQUF3QixRQUF4QixHQUFtQyxRQUF4QyxFQUFrRCxNQUFsRCxFQUEwRCxLQUFLLEdBQS9ELENBQWQ7QUFDQSxnQkFBSSxVQUFVLE1BQWQsRUFBc0IsT0FBTyxJQUFQLENBQVksS0FBSyxNQUFqQjtBQUN0QixpQkFBSyxNQUFMLENBQVksT0FBWjtBQUNIOzs7Ozs7QUFHTCxPQUFPLE9BQVAsR0FBaUIsU0FBakI7Ozs7O0FDL0VBLFNBQVMsSUFBVCxDQUFjLENBQWQsRUFBaUIsSUFBakIsRUFBdUI7QUFDbkIsUUFBTSxNQUFNLEVBQUUsTUFBZDtBQUNBLFFBQU0sSUFBSSxJQUFJLEtBQUosQ0FBVSxHQUFWLENBQVY7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksR0FBcEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDMUIsVUFBRSxDQUFGLElBQU8sS0FBSyxDQUFMLENBQVA7QUFDSDtBQUNELFdBQU8sQ0FBUDtBQUNIOztBQUVELE9BQU8sT0FBUCxHQUFpQjtBQUNiLFdBQU8sa0JBQUs7QUFDUixlQUFPLElBQUksS0FBSixDQUFVLENBQVYsRUFBYSxJQUFiLENBQWtCLENBQWxCLENBQVA7QUFDSCxLQUhZOztBQUtiLFNBQUssZ0JBQUs7QUFDTixZQUFNLE1BQU0sRUFBRSxNQUFkO0FBQ0EsWUFBSSxNQUFNLENBQVY7QUFDQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksR0FBcEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDMUIsbUJBQU8sRUFBRSxDQUFGLElBQU8sRUFBRSxDQUFGLENBQWQ7QUFDSDtBQUNELGVBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixDQUFQO0FBQ0gsS0FaWTs7QUFjYixTQUFLLGFBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNYLGVBQU8sS0FBSyxDQUFMLEVBQVEsYUFBSztBQUNoQixtQkFBTyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBZDtBQUNILFNBRk0sQ0FBUDtBQUdILEtBbEJZOztBQW9CYixTQUFLLGFBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNYLGVBQU8sS0FBSyxDQUFMLEVBQVEsYUFBSztBQUNoQixtQkFBTyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBZDtBQUNILFNBRk0sQ0FBUDtBQUdILEtBeEJZOztBQTBCYixTQUFLLGFBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNYLGVBQU8sS0FBSyxDQUFMLEVBQVEsYUFBSztBQUNoQixtQkFBTyxFQUFFLENBQUYsSUFBTyxDQUFkO0FBQ0gsU0FGTSxDQUFQO0FBR0gsS0E5Qlk7O0FBZ0NiLFNBQUssYUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ1gsZUFBTyxLQUFLLENBQUwsRUFBUSxhQUFLO0FBQ2hCLG1CQUFPLEVBQUUsQ0FBRixJQUFPLENBQWQ7QUFDSCxTQUZNLENBQVA7QUFHSCxLQXBDWTs7QUFzQ2IsU0FBSyxhQUFDLENBQUQsRUFBSSxDQUFKLEVBQW1CO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ3BCLFlBQUksT0FBTyxDQUFDLENBQVosRUFBZTtBQUFBLHVCQUNGLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FERTtBQUNWLGFBRFU7QUFDUCxhQURPO0FBRWQ7QUFDRCxZQUFNLE1BQU0sRUFBRSxNQUFkO0FBQ0EsWUFBTSxNQUFNLEVBQUUsQ0FBRixFQUFLLE1BQWpCO0FBQ0EsWUFBTSxNQUFNLEVBQUUsQ0FBRixFQUFLLE1BQWpCO0FBQ0EsWUFBTSxJQUFJLElBQUksS0FBSixDQUFVLEdBQVYsQ0FBVjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxHQUFwQixFQUF5QixHQUF6QixFQUE4QjtBQUMxQixjQUFFLENBQUYsSUFBTyxJQUFJLEtBQUosQ0FBVSxHQUFWLENBQVA7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEdBQXBCLEVBQXlCLEdBQXpCLEVBQThCO0FBQzFCLGtCQUFFLENBQUYsRUFBSyxDQUFMLElBQVUsQ0FBVjtBQUNBLHFCQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksR0FBcEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDMUIsc0JBQUUsQ0FBRixFQUFLLENBQUwsS0FBVyxFQUFFLENBQUYsRUFBSyxDQUFMLElBQVUsRUFBRSxDQUFGLEVBQUssQ0FBTCxDQUFyQjtBQUNIO0FBQ0o7QUFDSjtBQUNELGVBQU8sQ0FBUDtBQUNIO0FBeERZLENBQWpCOzs7Ozs7Ozs7QUNUQSxJQUFNLGFBQWEsUUFBUSx3QkFBUixDQUFuQjtBQUNBLElBQU0sYUFBYSxRQUFRLHVCQUFSLENBQW5COztlQUNvRSxRQUFRLFNBQVIsQztJQUE3RCxPLFlBQUEsTztJQUFTLE8sWUFBQSxPO0lBQVMsZSxZQUFBLGU7SUFBaUIsYyxZQUFBLGM7SUFBZ0IsTSxZQUFBLE07O2dCQUNqQixRQUFRLFdBQVIsQztJQUFsQyxLLGFBQUEsSztJQUFPLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7O0lBQzNCLEcsR0FBWSxJLENBQVosRztJQUFLLEcsR0FBTyxJLENBQVAsRzs7SUFHTixNO0FBQ0Y7Ozs7O0FBS0Esb0JBQVksTUFBWixFQUFvQixDQUFwQixFQUF1QixHQUF2QixFQUE0QixDQUE1QixFQUErQixLQUEvQixFQUFzQyxHQUF0QyxFQUEyQyxNQUEzQyxFQUFtRDtBQUFBOztBQUMvQyxhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssR0FBTCxHQUFXLEdBQVg7QUFDQSxhQUFLLE9BQUwsR0FBZSxJQUFJLEtBQUosRUFBZjtBQUNBLGFBQUssQ0FBTCxHQUFTLENBQVQ7QUFDQSxhQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsYUFBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLGFBQUssTUFBTCxHQUFjLE1BQWQ7O0FBRUEsYUFBSyxVQUFMLEdBQWtCLElBQWxCO0FBQ0g7Ozs7b0NBRVc7QUFDUixtQkFBTyxPQUFPLGlCQUFQLENBQXlCLEtBQUssQ0FBOUIsQ0FBUDtBQUNIOzs7NENBRW1CO0FBQ2hCLGdCQUFJLElBQUksTUFBTSxLQUFLLE1BQUwsQ0FBWSxTQUFsQixDQUFSO0FBRGdCO0FBQUE7QUFBQTs7QUFBQTtBQUVoQixxQ0FBa0IsS0FBSyxNQUFMLENBQVksSUFBOUIsOEhBQW9DO0FBQUEsd0JBQXpCLEdBQXlCOztBQUNoQyx3QkFBSSxPQUFPLElBQVgsRUFBaUI7QUFDakIsd0JBQU0sU0FBUyxJQUFJLEtBQUssR0FBVCxFQUFjLElBQUksR0FBbEIsQ0FBZjtBQUNBLHdCQUFNLFlBQVksSUFBSSxNQUFKLENBQWxCO0FBQ0Esd0JBQU0sYUFBYSxJQUFJLE1BQUosRUFBWSxTQUFaLENBQW5CO0FBQ0Esd0JBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxVQUFKLEVBQWdCLElBQUksQ0FBSixHQUFRLE9BQU8sU0FBUCxDQUF4QixDQUFQLENBQUo7QUFDSDtBQVJlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBU2hCLGdCQUFJLElBQUksQ0FBSixFQUFPLENBQUMsS0FBSyxNQUFMLENBQVksQ0FBYixHQUFpQixLQUFLLENBQTdCLENBQUo7QUFDQSxnQkFBTSxJQUFJLElBQUksQ0FBSixFQUFPLEtBQUssQ0FBWixDQUFWO0FBQ0EsaUJBQUssQ0FBTCxHQUFTLElBQUksS0FBSyxDQUFULEVBQVksQ0FBWixDQUFUO0FBQ0g7Ozs0Q0FFbUI7QUFDaEIsaUJBQUssR0FBTCxHQUFXLElBQUksS0FBSyxHQUFULEVBQWMsS0FBSyxDQUFuQixDQUFYO0FBQ0g7OztpQ0FFUSxDLEVBQUc7QUFDUixnQkFBTSxJQUFJLEtBQUssV0FBTCxDQUFpQixHQUFqQixFQUFWO0FBQ0EsaUJBQUssQ0FBTCxHQUFTLENBQVQ7QUFDSDs7O21DQUVVLEMsRUFBRztBQUNWLGdCQUFNLElBQUksS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVY7QUFDQSxnQkFBTSxJQUFJLEtBQUssY0FBTCxDQUFvQixHQUFwQixFQUFWO0FBQ0EsaUJBQUssR0FBTCxHQUFXLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBWDtBQUNIOzs7aUNBRVEsQyxFQUFHO0FBQ1IsZ0JBQU0sTUFBTSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBWjtBQUNBLGdCQUFNLE1BQU0sUUFBUSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBUixDQUFaO0FBQ0EsaUJBQUssQ0FBTCxHQUFTLGdCQUFnQixHQUFoQixFQUFxQixHQUFyQixDQUFUO0FBQ0g7Ozt1Q0FFYyxDLEVBQUcsQyxFQUFHO0FBQ2pCLGdCQUFJLEtBQUssVUFBTCxJQUFtQixLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBdkIsRUFBaUQ7QUFDN0Msb0JBQU0sY0FBYyxLQUFLLFVBQUwsQ0FBZ0IsV0FBcEM7QUFDQSw0QkFBWSxHQUFaLENBQWdCLE1BQWhCLEVBQXdCLElBQUksSUFBNUI7QUFDQSw0QkFBWSxHQUFaLENBQWdCLEtBQWhCLEVBQXVCLElBQUksSUFBM0I7QUFDQSw0QkFBWSxTQUFaLENBQXNCLHVCQUF0QixFQUErQyxZQUEvQyxDQUE0RCxXQUE1RDtBQUNILGFBTEQsTUFLTztBQUNILG9CQUFNLFNBQVMsR0FBZjs7QUFFQSxvQkFBSSxXQUFXLElBQUksSUFBSSxLQUFLLE1BQUwsQ0FBWSxDQUFoQixFQUFtQixLQUFLLE1BQUwsQ0FBWSxDQUEvQixJQUFvQyxDQUF4QyxFQUEyQyxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxLQUFLLEdBQWxCLENBQWhCLElBQTBDLE1BQXJGLENBQWY7QUFIRztBQUFBO0FBQUE7O0FBQUE7QUFJSCwwQ0FBa0IsS0FBSyxNQUFMLENBQVksSUFBOUIsbUlBQW9DO0FBQUEsNEJBQXpCLEdBQXlCOztBQUNoQyxtQ0FBVyxJQUFJLFFBQUosRUFBYyxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLElBQUksR0FBSixDQUFRLEdBQVIsQ0FBWSxLQUFLLEdBQWpCLENBQWhCLElBQXlDLE1BQXZELENBQVg7QUFDSDtBQU5FO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBUUgsb0JBQU0sSUFBSSxLQUFLLENBQWY7O0FBRUEsb0JBQU0sSUFBSSxlQUFlLEtBQUssQ0FBcEIsQ0FBVjtBQUNBLG9CQUFJLFNBQVMsSUFBSSxLQUFLLE1BQUwsQ0FBWSxZQUFoQixFQUE4QixJQUFJLEtBQUssQ0FBVCxJQUFjLE1BQTVDLENBQWI7QUFYRztBQUFBO0FBQUE7O0FBQUE7QUFZSCwwQ0FBa0IsS0FBSyxNQUFMLENBQVksSUFBOUIsbUlBQW9DO0FBQUEsNEJBQXpCLElBQXlCOztBQUNoQyxpQ0FBUyxJQUFJLE1BQUosRUFBWSxJQUFJLEtBQUksQ0FBUixJQUFhLE1BQXpCLENBQVQ7QUFDSDtBQWRFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBZ0JILHFCQUFLLGlCQUFMLENBQXVCLFFBQXZCLEVBQWlDLENBQWpDLEVBQW9DLENBQXBDLEVBQXVDLE1BQXZDO0FBQ0EscUJBQUssVUFBTCxHQUFrQixJQUFJLFVBQUosQ0FBZSxJQUFmLEVBQXFCLEtBQUssR0FBMUIsRUFBK0IsS0FBSyxjQUFMLEVBQS9CLEVBQXNELENBQXRELEVBQXlELENBQXpELENBQWxCO0FBQ0EscUJBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBekIsQ0FBOEIsS0FBSyxVQUFuQztBQUNIO0FBQ0o7OzswQ0FFaUIsUSxFQUFVLEMsRUFBRyxDLEVBQUcsTSxFQUFRO0FBQ3RDLGlCQUFLLFdBQUwsR0FBbUIsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixRQUFyQixFQUErQixLQUFLLE1BQUwsQ0FBWSxRQUEzQyxFQUFxRCxLQUFLLE1BQUwsQ0FBWSxRQUFqRSxFQUEyRSxDQUEzRSxFQUE4RSxLQUFLLFFBQW5GLENBQW5CO0FBQ0EsaUJBQUssY0FBTCxHQUFzQixJQUFJLFVBQUosQ0FBZSxJQUFmLEVBQXFCLFlBQXJCLEVBQW1DLENBQUMsUUFBcEMsRUFBOEMsUUFBOUMsRUFBd0QsS0FBSyxHQUFMLENBQVMsQ0FBVCxDQUF4RCxFQUFxRSxLQUFLLFVBQTFFLENBQXRCO0FBQ0EsaUJBQUssY0FBTCxHQUFzQixJQUFJLFVBQUosQ0FBZSxJQUFmLEVBQXFCLFlBQXJCLEVBQW1DLENBQUMsUUFBcEMsRUFBOEMsUUFBOUMsRUFBd0QsS0FBSyxHQUFMLENBQVMsQ0FBVCxDQUF4RCxFQUFxRSxLQUFLLFVBQTFFLENBQXRCO0FBQ0EsaUJBQUssY0FBTCxHQUFzQixJQUFJLFVBQUosQ0FBZSxJQUFmLEVBQXFCLFlBQXJCLEVBQW1DLENBQW5DLEVBQXNDLE1BQXRDLEVBQThDLEVBQUUsQ0FBRixDQUE5QyxFQUFvRCxLQUFLLFFBQXpELENBQXRCO0FBQ0EsaUJBQUssY0FBTCxHQUFzQixJQUFJLFVBQUosQ0FBZSxJQUFmLEVBQXFCLFlBQXJCLEVBQW1DLENBQUMsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsUUFBUSxFQUFFLENBQUYsQ0FBUixDQUE5QyxFQUE2RCxLQUFLLFFBQWxFLENBQXRCO0FBQ0g7Ozt5Q0FFZ0I7QUFDYixtQkFBTyxDQUNILEtBQUssV0FERixFQUVILEtBQUssY0FGRixFQUdILEtBQUssY0FIRixFQUlILEtBQUssY0FKRixFQUtILEtBQUssY0FMRixDQUFQO0FBT0g7OztrQ0FFUztBQUNOLGdCQUFNLElBQUksS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixPQUFqQixDQUF5QixJQUF6QixDQUFWO0FBQ0EsaUJBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsTUFBakIsQ0FBd0IsQ0FBeEIsRUFBMkIsQ0FBM0I7QUFDQSxnQkFBSSxLQUFLLFVBQUwsSUFBbUIsS0FBSyxVQUFMLENBQWdCLE1BQWhCLEVBQXZCLEVBQWlEO0FBQzdDLHFCQUFLLFVBQUwsQ0FBZ0IsS0FBaEI7QUFDSDtBQUNKOzs7bUNBVVU7QUFDUCxtQkFBTyxLQUFLLFNBQUwsQ0FBZSxFQUFDLE9BQU8sS0FBSyxHQUFiLEVBQWtCLEtBQUssS0FBSyxDQUE1QixFQUErQixPQUFPLEtBQUssR0FBM0MsRUFBZixDQUFQO0FBQ0g7OzswQ0FWd0IsQyxFQUFHO0FBQ3hCLG1CQUFPLElBQUksQ0FBSixFQUFPLElBQUksQ0FBWCxDQUFQO0FBQ0g7OzswQ0FFd0IsQyxFQUFHO0FBQ3hCLG1CQUFPLE9BQU8sQ0FBUCxDQUFQO0FBQ0g7Ozs7OztBQU9MLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7Ozs7Ozs7Ozs7O0FDcElBLElBQU0sU0FBUyxRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU0sYUFBYSxRQUFRLHVCQUFSLENBQW5COztlQUNnRCxRQUFRLFNBQVIsQztJQUF6QyxPLFlBQUEsTztJQUFTLE8sWUFBQSxPO0lBQVMsbUIsWUFBQSxtQjs7Z0JBQ1YsUUFBUSxTQUFSLEM7SUFBUixJLGFBQUEsSTs7SUFDQSxHLEdBQU8sSSxDQUFQLEc7O0lBR0QsTTs7Ozs7Ozs7Ozs7O0FBQ0Y7Ozs7O29DQUtZO0FBQ1IsbUJBQU8sT0FBTyxpQkFBUCxDQUF5QixLQUFLLENBQTlCLENBQVA7QUFDSDs7O21DQUVVLEMsRUFBRztBQUNWLGdCQUFNLElBQUksS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVY7QUFDQSxnQkFBTSxJQUFJLEtBQUssY0FBTCxDQUFvQixHQUFwQixFQUFWO0FBQ0EsZ0JBQU0sSUFBSSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBVjtBQUNBLGlCQUFLLEdBQUwsR0FBVyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFYO0FBQ0g7OztpQ0FFUSxDLEVBQUc7QUFDUixnQkFBTSxNQUFNLFFBQVEsS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVIsQ0FBWjtBQUNBLGdCQUFNLFFBQVEsUUFBUSxLQUFLLGdCQUFMLENBQXNCLEdBQXRCLEVBQVIsQ0FBZDtBQUNBLGdCQUFNLE1BQU0sS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVo7QUFDQSxpQkFBSyxDQUFMLEdBQVMsb0JBQW9CLEdBQXBCLEVBQXlCLEdBQXpCLEVBQThCLEtBQTlCLENBQVQ7QUFDSDs7OzBDQUVpQixTLEVBQVcsQyxFQUFHLEMsRUFBRyxPLEVBQVM7QUFDeEMsOEhBQXdCLFNBQXhCLEVBQW1DLENBQW5DLEVBQXNDLENBQXRDLEVBQXlDLE9BQXpDO0FBQ0EsaUJBQUssY0FBTCxHQUFzQixJQUFJLFVBQUosQ0FBZSxJQUFmLEVBQXFCLFlBQXJCLEVBQW1DLENBQUMsU0FBcEMsRUFBK0MsU0FBL0MsRUFBMEQsS0FBSyxHQUFMLENBQVMsQ0FBVCxDQUExRCxFQUF1RSxLQUFLLFVBQTVFLENBQXRCO0FBQ0EsaUJBQUssZ0JBQUwsR0FBd0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFDLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLFFBQVEsRUFBRSxDQUFGLENBQVIsQ0FBOUMsRUFBNkQsS0FBSyxRQUFsRSxDQUF4QjtBQUNIOzs7eUNBRWdCO0FBQ2IsbUJBQU8sQ0FDSCxLQUFLLFdBREYsRUFFSCxLQUFLLGNBRkYsRUFHSCxLQUFLLGNBSEYsRUFJSCxLQUFLLGNBSkYsRUFLSCxLQUFLLGNBTEYsRUFNSCxLQUFLLGNBTkYsRUFPSCxLQUFLLGdCQVBGLENBQVA7QUFTSDs7OzBDQUV3QixDLEVBQUc7QUFDeEIsbUJBQU8sSUFBSSxDQUFKLEVBQU8sSUFBSSxDQUFYLENBQVA7QUFDSDs7OzBDQUV3QixDLEVBQUc7QUFDeEIsbUJBQU8sS0FBSyxDQUFMLENBQVA7QUFDSDs7OztFQWhEZ0IsTTs7QUFtRHJCLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7QUMxREEsSUFBTSxpQkFBaUIsUUFBUSxtQkFBUixDQUF2Qjs7ZUFDbUIsUUFBUSxVQUFSLEM7SUFBWixHLFlBQUEsRztJQUFLLEcsWUFBQSxHOztBQUVaLElBQU0sT0FBTztBQUNULFlBQVEsZ0JBQUMsQ0FBRCxFQUFPO0FBQ1gsZUFBTyxJQUFJLENBQVg7QUFDSCxLQUhROztBQUtULFVBQU0sY0FBQyxDQUFELEVBQU87QUFDVCxlQUFPLElBQUksQ0FBSixHQUFRLENBQWY7QUFDSCxLQVBROztBQVNULHFCQUFpQix5QkFBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQzNCLGVBQU8sQ0FDSCxNQUFNLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FESCxFQUVILE1BQU0sS0FBSyxHQUFMLENBQVMsR0FBVCxDQUZILENBQVA7QUFJSCxLQWRROztBQWdCVCxxQkFBaUIseUJBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUN2QixlQUFPLENBQ0gsSUFBSSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUosQ0FERyxFQUVILEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxDQUFkLENBRkcsQ0FBUDtBQUlILEtBckJROztBQXVCVCx5QkFBcUIsNkJBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxLQUFYLEVBQXFCO0FBQ3RDLGVBQU8sQ0FDSCxNQUFNLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FBTixHQUF3QixLQUFLLEdBQUwsQ0FBUyxHQUFULENBRHJCLEVBRUgsTUFBTSxLQUFLLEdBQUwsQ0FBUyxLQUFULENBQU4sR0FBd0IsS0FBSyxHQUFMLENBQVMsR0FBVCxDQUZyQixFQUdILE1BQU0sS0FBSyxHQUFMLENBQVMsS0FBVCxDQUhILENBQVA7QUFLSCxLQTdCUTs7QUErQlQseUJBQXFCLDZCQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFhO0FBQzlCLFlBQU0sTUFBTSxJQUFJLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQUosQ0FBWjtBQUNBLGVBQU8sQ0FDSCxHQURHLEVBRUgsS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FGRyxFQUdILE9BQU8sQ0FBUCxHQUFXLEtBQUssSUFBTCxDQUFVLElBQUksR0FBZCxDQUFYLEdBQWdDLENBSDdCLENBQVA7QUFLSCxLQXRDUTs7QUF3Q1Qsb0JBQWdCLHdCQUFDLE1BQUQsRUFBWTtBQUN4QixlQUFPLE9BQU8sTUFBUCxJQUFpQixDQUFqQixHQUNELEtBQUssZUFBTCxDQUFxQixPQUFPLENBQVAsQ0FBckIsRUFBZ0MsT0FBTyxDQUFQLENBQWhDLENBREMsR0FFRCxLQUFLLG1CQUFMLENBQXlCLE9BQU8sQ0FBUCxDQUF6QixFQUFvQyxPQUFPLENBQVAsQ0FBcEMsRUFBK0MsT0FBTyxDQUFQLENBQS9DLENBRk47QUFHSCxLQTVDUTs7QUE4Q1QsYUFBUyxpQkFBQyxHQUFELEVBQVM7QUFDZCxlQUFPLE1BQU0sS0FBSyxFQUFYLEdBQWdCLEdBQXZCO0FBQ0gsS0FoRFE7O0FBa0RULGFBQVMsaUJBQUMsR0FBRCxFQUFTO0FBQ2QsZUFBTyxNQUFNLEdBQU4sR0FBWSxLQUFLLEVBQXhCO0FBQ0gsS0FwRFE7O0FBc0RULGlCQUFhLHFCQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsRUFBb0I7QUFDN0IsZUFBTyxJQUFJLENBQUMsS0FBSyxFQUFOLEVBQVUsS0FBSyxFQUFmLENBQUosQ0FBUDtBQUNILEtBeERROztBQTBEVCxZQUFRLGdCQUFDLE1BQUQsRUFBUyxNQUFULEVBQW9CO0FBQ3hCLGVBQU8sSUFBSSxDQUFDLE1BQUQsQ0FBSixFQUFjLE1BQWQsRUFBc0IsQ0FBdEIsQ0FBUDtBQUNILEtBNURROztBQThEVCxTQUFLLGVBQU07QUFDUCxlQUFPLElBQUksSUFBSixHQUFXLE9BQVgsS0FBdUIsSUFBOUI7QUFDSCxLQWhFUTs7QUFrRVQsWUFBUSxnQkFBQyxHQUFELEVBQXFCO0FBQUEsWUFBZixHQUFlLHVFQUFULElBQVM7O0FBQ3pCLFlBQUksT0FBTyxJQUFYLEVBQWlCO0FBQ2Isa0JBQU0sR0FBTjtBQUNBLGtCQUFNLENBQU47QUFDSDtBQUNELGVBQU8sS0FBSyxNQUFMLE1BQWlCLE1BQU0sR0FBdkIsSUFBOEIsR0FBckM7QUFDSCxLQXhFUTs7QUEwRVQsZUFBVyxxQkFBTTtBQUNiLGVBQU8sTUFBTSxLQUFLLEtBQUwsQ0FBVyxZQUFZLEtBQUssTUFBTCxLQUFnQixTQUF2QyxFQUFrRCxRQUFsRCxDQUEyRCxFQUEzRCxFQUErRCxTQUEvRCxDQUF5RSxDQUF6RSxDQUFiO0FBQ0gsS0E1RVE7O0FBOEVULHVCQUFtQiwyQkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQy9CLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFDLEdBQVAsQ0FERyxFQUVILENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FGRyxDQUFQO0FBSUgsS0FyRlE7O0FBdUZULHdCQUFvQiw0QkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ2hDLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQURHLEVBRUgsQ0FBQyxDQUFELEVBQUksR0FBSixFQUFTLENBQUMsR0FBVixDQUZHLEVBR0gsQ0FBQyxDQUFELEVBQUksR0FBSixFQUFTLEdBQVQsQ0FIRyxDQUFQO0FBS0gsS0EvRlE7O0FBaUdULHdCQUFvQiw0QkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ2hDLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFOLEVBQVMsR0FBVCxDQURHLEVBRUgsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FGRyxFQUdILENBQUMsQ0FBQyxHQUFGLEVBQU8sQ0FBUCxFQUFVLEdBQVYsQ0FIRyxDQUFQO0FBS0gsS0F6R1E7O0FBMkdULHdCQUFvQiw0QkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ2hDLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFDLEdBQVAsRUFBWSxDQUFaLENBREcsRUFFSCxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQUZHLEVBR0gsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FIRyxDQUFQO0FBS0gsS0FuSFE7O0FBcUhULHdCQUFvQixrQ0FBUTtBQUN4QixZQUFJO0FBQ0EsbUJBQU8sTUFBUDtBQUNILFNBRkQsQ0FFRSxPQUFPLENBQVAsRUFBVTtBQUNSLGdCQUFJLEVBQUUsYUFBYSxjQUFmLENBQUosRUFBb0M7QUFDaEMsd0JBQVEsS0FBUixDQUFjLENBQWQ7QUFDQSxzQkFBTSxJQUFJLEtBQUosRUFBTjtBQUNIO0FBQ0o7QUFDRCxlQUFPLElBQVA7QUFDSDtBQS9IUSxDQUFiOztBQWtJQSxPQUFPLE9BQVAsR0FBaUIsSUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgcHJlc2V0cyA9IHJlcXVpcmUoJy4vcHJlc2V0Jyk7XG5jb25zdCBTaW11bGF0b3IgPSByZXF1aXJlKCcuL3NpbXVsYXRvcicpO1xuXG5jb25zdCBzaW11bGF0b3IgPSBuZXcgU2ltdWxhdG9yKCk7XG5sZXQgc2VsZWN0ZWQgPSAxO1xuc2ltdWxhdG9yLmluaXQocHJlc2V0c1tzZWxlY3RlZF0pO1xuXG5jb25zdCAkc2VsZWN0ID0gJCgnc2VsZWN0Jyk7XG5mb3IgKGxldCBpID0gMDsgaSA8IHByZXNldHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwcmVzZXQgPSBwcmVzZXRzW2ldO1xuICAgICRzZWxlY3QuYXBwZW5kKGA8b3B0aW9uIHZhbHVlPVwiJHtpfVwiJHtpID09IHNlbGVjdGVkID8gJyBzZWxlY3RlZCcgOiAnJ30+JHtwcmVzZXQucHJvdG90eXBlLnRpdGxlfTwvb3B0aW9uPmApO1xufVxuJHNlbGVjdC5jaGFuZ2UoKCkgPT4ge1xuICAgIHNlbGVjdGVkID0gcGFyc2VJbnQoJHNlbGVjdC5maW5kKCc6c2VsZWN0ZWQnKS52YWwoKSk7XG4gICAgc2ltdWxhdG9yLmluaXQocHJlc2V0c1tzZWxlY3RlZF0pO1xufSk7XG4kc2VsZWN0LmZvY3VzKCgpID0+IHtcbiAgICAkc2VsZWN0LmJsdXIoKTtcbn0pO1xuJCgnI3Jlc2V0JykuY2xpY2soKCkgPT4ge1xuICAgIHNpbXVsYXRvci5pbml0KHByZXNldHNbc2VsZWN0ZWRdKTtcbn0pO1xuXG5cbmxldCAkbW92aW5nID0gbnVsbDtcbmxldCBweCwgcHk7XG5cbiQoJ2JvZHknKS5vbignbW91c2Vkb3duJywgJy5jb250cm9sLWJveCAudGl0bGUtYmFyJywgZnVuY3Rpb24gKGUpIHtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcgPSAkKHRoaXMpLnBhcmVudCgnLmNvbnRyb2wtYm94Jyk7XG4gICAgJG1vdmluZy5uZXh0VW50aWwoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpLmluc2VydEJlZm9yZSgkbW92aW5nKTtcbiAgICByZXR1cm4gZmFsc2U7XG59KTtcblxuJCgnYm9keScpLm1vdXNlbW92ZShmdW5jdGlvbiAoZSkge1xuICAgIGlmICghJG1vdmluZykgcmV0dXJuO1xuICAgIGNvbnN0IHggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcuY3NzKCdsZWZ0JywgcGFyc2VJbnQoJG1vdmluZy5jc3MoJ2xlZnQnKSkgKyAoeCAtIHB4KSArICdweCcpO1xuICAgICRtb3ZpbmcuY3NzKCd0b3AnLCBwYXJzZUludCgkbW92aW5nLmNzcygndG9wJykpICsgKHkgLSBweSkgKyAncHgnKTtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xufSk7XG5cbiQoJ2JvZHknKS5tb3VzZXVwKGZ1bmN0aW9uIChlKSB7XG4gICAgJG1vdmluZyA9IG51bGw7XG59KTsiLCJjb25zdCB7ZXh0ZW5kfSA9ICQ7XG5cblxuZnVuY3Rpb24gRU1QVFlfMkQoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgYywge1xuICAgICAgICBCQUNLR1JPVU5EOiAnd2hpdGUnLFxuICAgICAgICBESU1FTlNJT046IDIsXG4gICAgICAgIE1BWF9QQVRIUzogMTAwMCxcbiAgICAgICAgQ0FNRVJBX0NPT1JEX1NURVA6IDUsXG4gICAgICAgIENBTUVSQV9BTkdMRV9TVEVQOiAxLFxuICAgICAgICBDQU1FUkFfQUNDRUxFUkFUSU9OOiAxLjEsXG4gICAgICAgIEc6IDAuMSxcbiAgICAgICAgTUFTU19NSU46IDEsXG4gICAgICAgIE1BU1NfTUFYOiA0ZTQsXG4gICAgICAgIFZFTE9DSVRZX01BWDogMTAsXG4gICAgICAgIERJUkVDVElPTl9MRU5HVEg6IDUwLFxuICAgICAgICBDQU1FUkFfRElTVEFOQ0U6IDEwMCxcbiAgICAgICAgSU5QVVRfVFlQRTogJ3JhbmdlJ1xuICAgIH0pO1xufVxuRU1QVFlfMkQucHJvdG90eXBlLnRpdGxlID0gJzJEIEdyYXZpdHkgU2ltdWxhdG9yJztcblxuXG5mdW5jdGlvbiBFTVBUWV8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8yRChjKSwge1xuICAgICAgICBESU1FTlNJT046IDMsXG4gICAgICAgIEc6IDAuMDAxLFxuICAgICAgICBNQVNTX01JTjogMSxcbiAgICAgICAgTUFTU19NQVg6IDhlNixcbiAgICAgICAgVkVMT0NJVFlfTUFYOiAxMFxuICAgIH0pO1xufVxuRU1QVFlfM0QucHJvdG90eXBlLnRpdGxlID0gJzNEIEdyYXZpdHkgU2ltdWxhdG9yJztcblxuZnVuY3Rpb24gV09PXzJEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzJEKGMpLCB7XG4gICAgICAgIElOUFVUX1RZUEU6ICdudW1iZXInXG4gICAgfSk7XG59XG5XT09fMkQucHJvdG90eXBlLnRpdGxlID0gJzJEIFdPTyc7XG5cbmZ1bmN0aW9uIFdPT18zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBJTlBVVF9UWVBFOiAnbnVtYmVyJ1xuICAgIH0pO1xufVxuV09PXzNELnByb3RvdHlwZS50aXRsZSA9ICczRCBXT08nO1xuXG5mdW5jdGlvbiBERUJVRyhjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBpbml0OiAoZW5naW5lKSA9PiB7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdiYWxsMScsIFstMTUwLCAwLCAwXSwgMTAwMDAwMCwgWzAsIDAsIDBdLCAnZ3JlZW4nKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ2JhbGwyJywgWzUwLCAwLCAwXSwgMTAwMDAsIFswLCAwLCAwXSwgJ2JsdWUnKTtcbiAgICAgICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuREVCVUcucHJvdG90eXBlLnRpdGxlID0gJ0RFQlVHJztcblxubW9kdWxlLmV4cG9ydHMgPSBbRU1QVFlfMkQsIEVNUFRZXzNELCBXT09fMkQsIFdPT18zRCwgREVCVUddOyIsImNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBub3csIGdldFJvdGF0aW9uTWF0cml4fSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHtwb3d9ID0gTWF0aDtcblxuY2xhc3MgQ2FtZXJhMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgZW5naW5lKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICB0aGlzLnkgPSAwO1xuICAgICAgICB0aGlzLnogPSBjb25maWcuQ0FNRVJBX0RJU1RBTkNFO1xuICAgICAgICB0aGlzLnBoaSA9IDA7XG4gICAgICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICAgICAgICB0aGlzLmxhc3RUaW1lID0gMDtcbiAgICAgICAgdGhpcy5sYXN0S2V5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIHRoaXMucmVzaXplKCk7XG4gICAgfVxuXG4gICAgcmVzaXplKCkge1xuICAgICAgICB0aGlzLmNlbnRlciA9IFt0aGlzLmNvbmZpZy5XIC8gMiwgdGhpcy5jb25maWcuSCAvIDJdO1xuICAgIH1cblxuICAgIGdldENvb3JkU3RlcChrZXkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBub3coKTtcbiAgICAgICAgaWYgKGtleSA9PSB0aGlzLmxhc3RLZXkgJiYgY3VycmVudFRpbWUgLSB0aGlzLmxhc3RUaW1lIDwgMSkge1xuICAgICAgICAgICAgdGhpcy5jb21ibyArPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICB0aGlzLmxhc3RLZXkgPSBrZXk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5DQU1FUkFfQ09PUkRfU1RFUCAqIHBvdyh0aGlzLmNvbmZpZy5DQU1FUkFfQUNDRUxFUkFUSU9OLCB0aGlzLmNvbWJvKTtcbiAgICB9XG5cbiAgICB1cChrZXkpIHtcbiAgICAgICAgdGhpcy55IC09IHRoaXMuZ2V0Q29vcmRTdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGRvd24oa2V5KSB7XG4gICAgICAgIHRoaXMueSArPSB0aGlzLmdldENvb3JkU3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBsZWZ0KGtleSkge1xuICAgICAgICB0aGlzLnggLT0gdGhpcy5nZXRDb29yZFN0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcmlnaHQoa2V5KSB7XG4gICAgICAgIHRoaXMueCArPSB0aGlzLmdldENvb3JkU3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICB6b29tSW4oa2V5KSB7XG4gICAgICAgIHRoaXMueiAtPSB0aGlzLmdldENvb3JkU3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICB6b29tT3V0KGtleSkge1xuICAgICAgICB0aGlzLnogKz0gdGhpcy5nZXRDb29yZFN0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlTGVmdChrZXkpIHtcbiAgICAgICAgdGhpcy5waGkgLT0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZVJpZ2h0KGtleSkge1xuICAgICAgICB0aGlzLnBoaSArPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICB9XG5cbiAgICBnZXRab29tKHogPSAwKSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMueiAtIHo7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgSW52aXNpYmxlRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuQ0FNRVJBX0RJU1RBTkNFIC8gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgYWRqdXN0Q29vcmRzKGMpIHtcbiAgICAgICAgY29uc3QgUiA9IGdldFJvdGF0aW9uTWF0cml4KGRlZzJyYWQodGhpcy5waGkpKTtcbiAgICAgICAgYyA9IHJvdGF0ZShjLCBSKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0Wm9vbSgpO1xuICAgICAgICBjb25zdCBjb29yZHMgPSBhZGQodGhpcy5jZW50ZXIsIG11bChzdWIoYywgW3RoaXMueCwgdGhpcy55XSksIHpvb20pKTtcbiAgICAgICAgcmV0dXJuIHtjb29yZHN9O1xuICAgIH1cblxuICAgIGFkanVzdFJhZGl1cyhjb29yZHMsIHJhZGl1cykge1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRab29tKCk7XG4gICAgICAgIHJldHVybiByYWRpdXMgKiB6b29tO1xuICAgIH1cblxuICAgIGFjdHVhbFBvaW50KHgsIHkpIHtcbiAgICAgICAgY29uc3QgUl8gPSBnZXRSb3RhdGlvbk1hdHJpeChkZWcycmFkKHRoaXMucGhpKSwgLTEpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRab29tKCk7XG4gICAgICAgIHJldHVybiByb3RhdGUoYWRkKGRpdihzdWIoW3gsIHldLCB0aGlzLmNlbnRlciksIHpvb20pLCBbdGhpcy54LCB0aGlzLnldKSwgUl8pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmEyRDsiLCJjb25zdCBDYW1lcmEyRCA9IHJlcXVpcmUoJy4vMmQnKTtcbmNvbnN0IHtkZWcycmFkLCByb3RhdGUsIGdldFhSb3RhdGlvbk1hdHJpeCwgZ2V0WVJvdGF0aW9uTWF0cml4fSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcblxuXG5jbGFzcyBDYW1lcmEzRCBleHRlbmRzIENhbWVyYTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGVuZ2luZSkge1xuICAgICAgICBzdXBlcihjb25maWcsIGVuZ2luZSk7XG4gICAgICAgIHRoaXMudGhldGEgPSAwO1xuICAgIH1cblxuICAgIHJvdGF0ZVVwKGtleSkge1xuICAgICAgICB0aGlzLnRoZXRhIC09IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVEb3duKGtleSkge1xuICAgICAgICB0aGlzLnRoZXRhICs9IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVkQ29vcmRzKGMpIHtcbiAgICAgICAgY29uc3QgUnggPSBnZXRYUm90YXRpb25NYXRyaXgoZGVnMnJhZCh0aGlzLnRoZXRhKSk7XG4gICAgICAgIGNvbnN0IFJ5ID0gZ2V0WVJvdGF0aW9uTWF0cml4KGRlZzJyYWQodGhpcy5waGkpKTtcbiAgICAgICAgcmV0dXJuIHJvdGF0ZShyb3RhdGUoYywgUngpLCBSeSk7XG4gICAgfVxuXG4gICAgYWRqdXN0Q29vcmRzKGMpIHtcbiAgICAgICAgYyA9IHRoaXMucm90YXRlZENvb3JkcyhjKTtcbiAgICAgICAgY29uc3QgeiA9IGMucG9wKCk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldFpvb20oeik7XG4gICAgICAgIGNvbnN0IGNvb3JkcyA9IGFkZCh0aGlzLmNlbnRlciwgbXVsKHN1YihjLCBbdGhpcy54LCB0aGlzLnldKSwgem9vbSkpO1xuICAgICAgICByZXR1cm4ge2Nvb3Jkcywgen07XG4gICAgfVxuXG4gICAgYWRqdXN0UmFkaXVzKGMsIHJhZGl1cykge1xuICAgICAgICBjID0gdGhpcy5yb3RhdGVkQ29vcmRzKGMpO1xuICAgICAgICBjb25zdCB6ID0gYy5wb3AoKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0Wm9vbSh6KTtcbiAgICAgICAgcmV0dXJuIHJhZGl1cyAqIHpvb207XG4gICAgfVxuXG4gICAgYWN0dWFsUG9pbnQoeCwgeSkge1xuICAgICAgICBjb25zdCBSeF8gPSBnZXRYUm90YXRpb25NYXRyaXgoZGVnMnJhZCh0aGlzLnRoZXRhKSwgLTEpO1xuICAgICAgICBjb25zdCBSeV8gPSBnZXRZUm90YXRpb25NYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSksIC0xKTtcbiAgICAgICAgY29uc3QgYyA9IGFkZChzdWIoW3gsIHldLCB0aGlzLmNlbnRlciksIFt0aGlzLngsIHRoaXMueV0pLmNvbmNhdCh0aGlzLnogLSB0aGlzLmNvbmZpZy5DQU1FUkFfRElTVEFOQ0UpO1xuICAgICAgICByZXR1cm4gcm90YXRlKHJvdGF0ZShjLCBSeV8pLCBSeF8pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmEzRDsiLCJjbGFzcyBDb250cm9sQm94IHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIHRpdGxlLCBjb250cm9sbGVycywgeCwgeSkge1xuICAgICAgICBjb25zdCAkdGVtcGxhdGVDb250cm9sQm94ID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJyk7XG4gICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gJHRlbXBsYXRlQ29udHJvbEJveC5jbG9uZSgpO1xuICAgICAgICAkY29udHJvbEJveC5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnRpdGxlJykudGV4dCh0aXRsZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dENvbnRhaW5lciA9ICRjb250cm9sQm94LmZpbmQoJy5pbnB1dC1jb250YWluZXInKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sbGVyIG9mIGNvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgICAkaW5wdXRDb250YWluZXIuYXBwZW5kKGNvbnRyb2xsZXIuJGlucHV0V3JhcHBlcik7XG4gICAgICAgIH1cbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLmNsb3NlJykuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY29udHJvbEJveC5maW5kKCcucmVtb3ZlJykuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgb2JqZWN0LmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRjb250cm9sQm94Lmluc2VydEJlZm9yZSgkdGVtcGxhdGVDb250cm9sQm94KTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCdsZWZ0JywgeCArICdweCcpO1xuICAgICAgICAkY29udHJvbEJveC5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcblxuICAgICAgICB0aGlzLiRjb250cm9sQm94ID0gJGNvbnRyb2xCb3g7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgaXNPcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kY29udHJvbEJveFswXS5wYXJlbnROb2RlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sQm94OyIsImNsYXNzIENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgbmFtZSwgbWluLCBtYXgsIHZhbHVlLCBmdW5jKSB7XG4gICAgICAgIGNvbnN0ICRpbnB1dFdyYXBwZXIgPSB0aGlzLiRpbnB1dFdyYXBwZXIgPSAkKCcuY29udHJvbC1ib3gudGVtcGxhdGUgLmlucHV0LXdyYXBwZXIudGVtcGxhdGUnKS5jbG9uZSgpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLmZpbmQoJy5uYW1lJykudGV4dChuYW1lKTtcbiAgICAgICAgY29uc3QgJGlucHV0ID0gdGhpcy4kaW5wdXQgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd0eXBlJywgb2JqZWN0LmNvbmZpZy5JTlBVVF9UWVBFKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21pbicsIG1pbik7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtYXgnLCBtYXgpO1xuICAgICAgICAkaW5wdXQuYXR0cigndmFsdWUnLCB2YWx1ZSk7XG4gICAgICAgICRpbnB1dC5hdHRyKCdzdGVwJywgMC4wMSk7XG4gICAgICAgIGNvbnN0ICR2YWx1ZSA9ICRpbnB1dFdyYXBwZXIuZmluZCgnLnZhbHVlJyk7XG4gICAgICAgICR2YWx1ZS50ZXh0KHRoaXMuZ2V0KCkpO1xuICAgICAgICAkaW5wdXQub24oJ2lucHV0JywgZSA9PiB7XG4gICAgICAgICAgICAkdmFsdWUudGV4dCh0aGlzLmdldCgpKTtcbiAgICAgICAgICAgIGZ1bmMuY2FsbChvYmplY3QsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuJGlucHV0LnZhbCgpKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuLi9vYmplY3QvY2lyY2xlJyk7XG5jb25zdCBDYW1lcmEyRCA9IHJlcXVpcmUoJy4uL2NhbWVyYS8yZCcpO1xuY29uc3Qge3JvdGF0ZSwgbm93LCByYW5kb20sIHBvbGFyMmNhcnRlc2lhbiwgcmFuZENvbG9yLCBnZXRSb3RhdGlvbk1hdHJpeCwgY2FydGVzaWFuMmF1dG8sIHNraXBJbnZpc2libGVFcnJvcn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttaW4sIG1heH0gPSBNYXRoO1xuXG5cbmNsYXNzIFBhdGgge1xuICAgIGNvbnN0cnVjdG9yKG9iaikge1xuICAgICAgICB0aGlzLnByZXZQb3MgPSBvYmoucHJldlBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnBvcyA9IG9iai5wb3Muc2xpY2UoKTtcbiAgICB9XG59XG5cbmNsYXNzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGN0eCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMub2JqcyA9IFtdO1xuICAgICAgICB0aGlzLmFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbnRyb2xCb3hlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhdGhzID0gW107XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYTJEKGNvbmZpZywgdGhpcyk7XG4gICAgICAgIHRoaXMuZnBzTGFzdFRpbWUgPSBub3coKTtcbiAgICAgICAgdGhpcy5mcHNDb3VudCA9IDA7XG4gICAgICAgIHRoaXMubGFzdE9iak5vID0gMDtcbiAgICB9XG5cbiAgICB0b2dnbGVBbmltYXRpbmcoKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gIXRoaXMuYW5pbWF0aW5nO1xuICAgICAgICBkb2N1bWVudC50aXRsZSA9IGAke3RoaXMuY29uZmlnLlRJVExFfSAoJHt0aGlzLmFuaW1hdGluZyA/IFwiU2ltdWxhdGluZ1wiIDogXCJQYXVzZWRcIn0pYDtcbiAgICB9XG5cbiAgICBkZXN0cm95Q29udHJvbEJveGVzKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRyb2xCb3ggb2YgdGhpcy5jb250cm9sQm94ZXMpIHtcbiAgICAgICAgICAgIGNvbnRyb2xCb3guY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRyb2xCb3hlcyA9IFtdXG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5jdHggPSBudWxsO1xuICAgICAgICB0aGlzLmRlc3Ryb3lDb250cm9sQm94ZXMoKTtcbiAgICB9XG5cbiAgICBhbmltYXRlKCkge1xuICAgICAgICBpZiAoIXRoaXMuY3R4KSByZXR1cm47XG4gICAgICAgIHRoaXMucHJpbnRGcHMoKTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUFsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVkcmF3QWxsKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCk7XG4gICAgICAgIH0sIDEwKTtcbiAgICB9XG5cbiAgICBvYmplY3RDb29yZHMob2JqKSB7XG4gICAgICAgIGNvbnN0IHIgPSB0aGlzLmNhbWVyYS5hZGp1c3RSYWRpdXMob2JqLnBvcywgb2JqLmdldFJhZGl1cygpKTtcbiAgICAgICAgY29uc3Qge2Nvb3Jkcywgen0gPSB0aGlzLmNhbWVyYS5hZGp1c3RDb29yZHMob2JqLnBvcyk7XG4gICAgICAgIHJldHVybiBjb29yZHMuY29uY2F0KHIpLmNvbmNhdCh6KTtcbiAgICB9XG5cbiAgICBkaXJlY3Rpb25Db29yZHMob2JqLCBmYWN0b3IgPSB0aGlzLmNvbmZpZy5ESVJFQ1RJT05fTEVOR1RIKSB7XG4gICAgICAgIGNvbnN0IHtjb29yZHM6IGMxfSA9IHRoaXMuY2FtZXJhLmFkanVzdENvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgY29uc3Qge2Nvb3JkczogYzIsIHp9ID0gdGhpcy5jYW1lcmEuYWRqdXN0Q29vcmRzKGFkZChvYmoucG9zLCBtdWwob2JqLnYsIGZhY3RvcikpKTtcbiAgICAgICAgcmV0dXJuIGMxLmNvbmNhdChjMikuY29uY2F0KHopO1xuICAgIH1cblxuICAgIHBhdGhDb29yZHMob2JqKSB7XG4gICAgICAgIGNvbnN0IHtjb29yZHM6IGMxfSA9IHRoaXMuY2FtZXJhLmFkanVzdENvb3JkcyhvYmoucHJldlBvcyk7XG4gICAgICAgIGNvbnN0IHtjb29yZHM6IGMyLCB6fSA9IHRoaXMuY2FtZXJhLmFkanVzdENvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIGMxLmNvbmNhdChjMikuY29uY2F0KHopO1xuICAgIH1cblxuICAgIGRyYXdPYmplY3QoYywgY29sb3IgPSBudWxsKSB7XG4gICAgICAgIHNraXBJbnZpc2libGVFcnJvcigoKSA9PiB7XG4gICAgICAgICAgICBjb2xvciA9IGNvbG9yIHx8IGMuY29sb3I7XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIENpcmNsZSkge1xuICAgICAgICAgICAgICAgIGMgPSB0aGlzLm9iamVjdENvb3JkcyhjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguYXJjKGNbMF0sIGNbMV0sIGNbMl0sIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd0RpcmVjdGlvbihjKSB7XG4gICAgICAgIHNraXBJbnZpc2libGVFcnJvcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIENpcmNsZSkge1xuICAgICAgICAgICAgICAgIGMgPSB0aGlzLmRpcmVjdGlvbkNvb3JkcyhjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGNbMF0sIGNbMV0pO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd1BhdGgoYykge1xuICAgICAgICBza2lwSW52aXNpYmxlRXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBQYXRoKSB7XG4gICAgICAgICAgICAgICAgYyA9IHRoaXMucGF0aENvb3JkcyhjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGNbMF0sIGNbMV0pO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnI2RkZGRkZCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3JlYXRlUGF0aChvYmopIHtcbiAgICAgICAgaWYgKG1hZyhzdWIob2JqLnBvcywgb2JqLnByZXZQb3MpKSA+IDUpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aHMucHVzaChuZXcgUGF0aChvYmopKTtcbiAgICAgICAgICAgIG9iai5wcmV2UG9zID0gb2JqLnBvcy5zbGljZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMucGF0aHMubGVuZ3RoID4gdGhpcy5jb25maWcuTUFYX1BBVEhTKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXRocyA9IHRoaXMucGF0aHMuc2xpY2UoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1c2VyQ3JlYXRlT2JqZWN0KHgsIHkpIHtcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5jYW1lcmEuYWN0dWFsUG9pbnQoeCwgeSk7XG4gICAgICAgIGxldCBtYXhSID0gQ2lyY2xlLmdldFJhZGl1c0Zyb21NYXNzKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBtYXhSID0gbWluKG1heFIsIChtYWcoc3ViKG9iai5wb3MsIHBvcykpIC0gb2JqLmdldFJhZGl1cygpKSAvIDEuNSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtID0gQ2lyY2xlLmdldE1hc3NGcm9tUmFkaXVzKHJhbmRvbShDaXJjbGUuZ2V0UmFkaXVzRnJvbU1hc3ModGhpcy5jb25maWcuTUFTU19NSU4pLCBtYXhSKSk7XG4gICAgICAgIGNvbnN0IHYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcmFuZENvbG9yKCk7XG4gICAgICAgIGNvbnN0IHRhZyA9IGBjaXJjbGUkeysrdGhpcy5sYXN0T2JqTm99YDtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IENpcmNsZSh0aGlzLmNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgb2JqLnNob3dDb250cm9sQm94KHgsIHkpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGNyZWF0ZU9iamVjdCh0YWcsIHBvcywgbSwgdiwgY29sb3IpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IENpcmNsZSh0aGlzLmNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlc1swXSwgZGlyKTtcbiAgICB9XG5cbiAgICBnZXRQaXZvdEF4aXMoKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGNvbGxpZGVFbGFzdGljYWxseSgpIHtcbiAgICAgICAgY29uc3QgZGltZW5zaW9uID0gdGhpcy5jb25maWcuRElNRU5TSU9OO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbzEgPSB0aGlzLm9ianNbaV07XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCB0aGlzLm9ianMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvMiA9IHRoaXMub2Jqc1tqXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xsaXNpb24gPSBzdWIobzIucG9zLCBvMS5wb3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlcyA9IGNhcnRlc2lhbjJhdXRvKGNvbGxpc2lvbik7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFuZ2xlcy5zaGlmdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGQgPCBvMS5nZXRSYWRpdXMoKSArIG8yLmdldFJhZGl1cygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFIgPSB0aGlzLmdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFJfID0gdGhpcy5nZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMsIC0xKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaSA9IHRoaXMuZ2V0UGl2b3RBeGlzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdlRlbXAgPSBbcm90YXRlKG8xLnYsIFIpLCByb3RhdGUobzIudiwgUildO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2RmluYWwgPSBbdlRlbXBbMF0uc2xpY2UoKSwgdlRlbXBbMV0uc2xpY2UoKV07XG4gICAgICAgICAgICAgICAgICAgIHZGaW5hbFswXVtpXSA9ICgobzEubSAtIG8yLm0pICogdlRlbXBbMF1baV0gKyAyICogbzIubSAqIHZUZW1wWzFdW2ldKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIHZGaW5hbFsxXVtpXSA9ICgobzIubSAtIG8xLm0pICogdlRlbXBbMV1baV0gKyAyICogbzEubSAqIHZUZW1wWzBdW2ldKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIG8xLnYgPSByb3RhdGUodkZpbmFsWzBdLCBSXyk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnYgPSByb3RhdGUodkZpbmFsWzFdLCBSXyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zVGVtcCA9IFt6ZXJvcyhkaW1lbnNpb24pLCByb3RhdGUoY29sbGlzaW9uLCBSKV07XG4gICAgICAgICAgICAgICAgICAgIHBvc1RlbXBbMF1baV0gKz0gdkZpbmFsWzBdW2ldO1xuICAgICAgICAgICAgICAgICAgICBwb3NUZW1wWzFdW2ldICs9IHZGaW5hbFsxXVtpXTtcbiAgICAgICAgICAgICAgICAgICAgbzEucG9zID0gYWRkKG8xLnBvcywgcm90YXRlKHBvc1RlbXBbMF0sIFJfKSk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnBvcyA9IGFkZChvMS5wb3MsIHJvdGF0ZShwb3NUZW1wWzFdLCBSXykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZUFsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlVmVsb2NpdHkoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbGxpZGVFbGFzdGljYWxseSgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVQYXRoKG9iaik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWRyYXdBbGwoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdPYmplY3Qob2JqKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd0RpcmVjdGlvbihvYmopO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0aGlzLnBhdGhzKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdQYXRoKHBhdGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpbnRGcHMoKSB7XG4gICAgICAgIHRoaXMuZnBzQ291bnQgKz0gMTtcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBub3coKTtcbiAgICAgICAgY29uc3QgdGltZURpZmYgPSBjdXJyZW50VGltZSAtIHRoaXMuZnBzTGFzdFRpbWU7XG4gICAgICAgIGlmICh0aW1lRGlmZiA+IDEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAkeyh0aGlzLmZwc0NvdW50IC8gdGltZURpZmYpIHwgMH0gZnBzYCk7XG4gICAgICAgICAgICB0aGlzLmZwc0xhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgICAgICB0aGlzLmZwc0NvdW50ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUyRDsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vMmQnKTtcbmNvbnN0IENhbWVyYTNEID0gcmVxdWlyZSgnLi4vY2FtZXJhLzNkJyk7XG5jb25zdCBTcGhlcmUgPSByZXF1aXJlKCcuLi9vYmplY3Qvc3BoZXJlJyk7XG5jb25zdCB7cmFuZG9tLCBnZXRZUm90YXRpb25NYXRyaXgsIGdldFpSb3RhdGlvbk1hdHJpeCwgcmFuZENvbG9yLCBzcGhlcmljYWwyY2FydGVzaWFuLCBza2lwSW52aXNpYmxlRXJyb3J9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge21hZywgc3ViLCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWlufSA9IE1hdGg7XG5cblxuY2xhc3MgRW5naW5lM0QgZXh0ZW5kcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBjdHgpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCBjdHgpO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEzRChjb25maWcsIHRoaXMpO1xuICAgIH1cblxuICAgIGRpcmVjdGlvbkNvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3QgYyA9IHRoaXMuY2FtZXJhLnJvdGF0ZWRDb29yZHMob2JqLnBvcyk7XG4gICAgICAgIGNvbnN0IGFkanVzdGVkRmFjdG9yID0gKHRoaXMuY2FtZXJhLnogLSBjWzJdIC0gMSkgLyBvYmoudlsyXTtcbiAgICAgICAgbGV0IGZhY3RvciA9IHRoaXMuY29uZmlnLkRJUkVDVElPTl9MRU5HVEg7XG4gICAgICAgIGlmIChhZGp1c3RlZEZhY3RvciA+IDApIGZhY3RvciA9IG1pbihmYWN0b3IsIGFkanVzdGVkRmFjdG9yKTtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmRpcmVjdGlvbkNvb3JkcyhvYmosIGZhY3Rvcik7XG4gICAgfVxuXG4gICAgdXNlckNyZWF0ZU9iamVjdCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuY2FtZXJhLmFjdHVhbFBvaW50KHgsIHkpO1xuICAgICAgICBsZXQgbWF4UiA9IFNwaGVyZS5nZXRSYWRpdXNGcm9tTWFzcyh0aGlzLmNvbmZpZy5NQVNTX01BWCk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgbWF4UiA9IG1pbihtYXhSLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5nZXRSYWRpdXMoKSkgLyAxLjUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG0gPSBTcGhlcmUuZ2V0TWFzc0Zyb21SYWRpdXMocmFuZG9tKFNwaGVyZS5nZXRSYWRpdXNGcm9tTWFzcyh0aGlzLmNvbmZpZy5NQVNTX01JTiksIG1heFIpKTtcbiAgICAgICAgY29uc3QgdiA9IHNwaGVyaWNhbDJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSwgcmFuZG9tKC0xODAsIDE4MCkpO1xuICAgICAgICBjb25zdCBjb2xvciA9IHJhbmRDb2xvcigpO1xuICAgICAgICBjb25zdCB0YWcgPSBgc3BoZXJlJHsrK3RoaXMubGFzdE9iak5vfWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBTcGhlcmUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIG9iai5zaG93Q29udHJvbEJveCh4LCB5KTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBjcmVhdGVPYmplY3QodGFnLCBwb3MsIG0sIHYsIGNvbG9yKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBTcGhlcmUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzLCBkaXIgPSAxKSB7XG4gICAgICAgIHJldHVybiBkb3QoZ2V0WlJvdGF0aW9uTWF0cml4KGFuZ2xlc1swXSwgZGlyKSwgZ2V0WVJvdGF0aW9uTWF0cml4KGFuZ2xlc1sxXSwgZGlyKSwgZGlyKTtcbiAgICB9XG5cbiAgICBnZXRQaXZvdEF4aXMoKSB7XG4gICAgICAgIHJldHVybiAyO1xuICAgIH1cblxuICAgIHJlZHJhd0FsbCgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpO1xuICAgICAgICBjb25zdCBvcmRlcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBza2lwSW52aXNpYmxlRXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IHRoaXMub2JqZWN0Q29vcmRzKG9iaik7XG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IGNvb3Jkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBvcmRlcnMucHVzaChbJ29iamVjdCcsIGNvb3Jkcywgeiwgb2JqLmNvbG9yXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIHNraXBJbnZpc2libGVFcnJvcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0gdGhpcy5kaXJlY3Rpb25Db29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsnZGlyZWN0aW9uJywgY29vcmRzLCB6XSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wYXRocykge1xuICAgICAgICAgICAgc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLnBhdGhDb29yZHMocGF0aCk7XG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IGNvb3Jkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBvcmRlcnMucHVzaChbJ3BhdGgnLCBjb29yZHMsIHpdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIG9yZGVycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVsyXSAtIGJbMl07XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IFt0eXBlLCBjb29yZHMsIHosIGNvbG9yXSBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd09iamVjdChjb29yZHMsIGNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGlyZWN0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RGlyZWN0aW9uKGNvb3Jkcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdGgnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQYXRoKGNvb3Jkcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTNEOyIsImNsYXNzIEludmlzaWJsZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2Upe1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW52aXNpYmxlRXJyb3I7IiwiY29uc3QgRW5naW5lMkQgPSByZXF1aXJlKCcuL2VuZ2luZS8yZCcpO1xuY29uc3QgRW5naW5lM0QgPSByZXF1aXJlKCcuL2VuZ2luZS8zZCcpO1xuY29uc3Qge2dldERpc3RhbmNlLCBza2lwSW52aXNpYmxlRXJyb3J9ID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cblxubGV0IGNvbmZpZyA9IG51bGw7XG5jb25zdCBrZXltYXAgPSB7XG4gICAgMzg6ICd1cCcsXG4gICAgNDA6ICdkb3duJyxcbiAgICAzNzogJ2xlZnQnLFxuICAgIDM5OiAncmlnaHQnLFxuICAgIDkwOiAnem9vbUluJywgLy8gelxuICAgIDg4OiAnem9vbU91dCcsIC8vIHhcbiAgICA4NzogJ3JvdGF0ZVVwJywgLy8gd1xuICAgIDgzOiAncm90YXRlRG93bicsIC8vIHNcbiAgICA2NTogJ3JvdGF0ZUxlZnQnLCAvLyBhXG4gICAgNjg6ICdyb3RhdGVSaWdodCcgLy8gZFxufTtcblxuZnVuY3Rpb24gb25SZXNpemUoZW5naW5lLCAkY2FudmFzKSB7XG4gICAgY29uZmlnLlcgPSAkY2FudmFzWzBdLndpZHRoID0gJGNhbnZhcy53aWR0aCgpO1xuICAgIGNvbmZpZy5IID0gJGNhbnZhc1swXS5oZWlnaHQgPSAkY2FudmFzLmhlaWdodCgpO1xuICAgIGlmIChlbmdpbmUpIGVuZ2luZS5jYW1lcmEucmVzaXplKCk7XG59XG5cbmZ1bmN0aW9uIG9uQ2xpY2soZXZlbnQsIGVuZ2luZSkge1xuICAgIGNvbnN0IHggPSBldmVudC5wYWdlWDtcbiAgICBjb25zdCB5ID0gZXZlbnQucGFnZVk7XG4gICAgaWYgKCFlbmdpbmUuYW5pbWF0aW5nKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIGVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICBpZiAoc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW2N4LCBjeSwgcl0gPSBlbmdpbmUub2JqZWN0Q29vcmRzKG9iaik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXREaXN0YW5jZShjeCwgY3ksIHgsIHkpIDwgcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnNob3dDb250cm9sQm94KHgsIHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSkgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVuZ2luZS51c2VyQ3JlYXRlT2JqZWN0KHgsIHkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25LZXlEb3duKGV2ZW50LCBlbmdpbmUpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBldmVudDtcbiAgICBpZiAoa2V5Q29kZSA9PSAzMikgeyAvLyBzcGFjZSBiYXJcbiAgICAgICAgZW5naW5lLmRlc3Ryb3lDb250cm9sQm94ZXMoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ2EnKTtcbiAgICAgICAgZW5naW5lLnRvZ2dsZUFuaW1hdGluZygpO1xuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSBpbiBrZXltYXAgJiYga2V5bWFwW2tleUNvZGVdIGluIGVuZ2luZS5jYW1lcmEpIHtcbiAgICAgICAgZW5naW5lLmNhbWVyYVtrZXltYXBba2V5Q29kZV1dKGtleUNvZGUpO1xuICAgIH1cbn1cblxuY2xhc3MgU2ltdWxhdG9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy4kY2FudmFzID0gJCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy4kY2FudmFzWzBdLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICQod2luZG93KS5yZXNpemUoZSA9PiB7XG4gICAgICAgICAgICBvblJlc2l6ZSh0aGlzLmVuZ2luZSwgdGhpcy4kY2FudmFzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGNhbnZhcy5jbGljayhlID0+IHtcbiAgICAgICAgICAgIG9uQ2xpY2soZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnYm9keScpLmtleWRvd24oZSA9PiB7XG4gICAgICAgICAgICBvbktleURvd24oZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0KHByZXNldCkge1xuICAgICAgICBpZiAodGhpcy5lbmdpbmUpIHRoaXMuZW5naW5lLmRlc3Ryb3koKTtcbiAgICAgICAgY29uZmlnID0gcHJlc2V0KHt9KTtcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBjb25maWcuVElUTEUgPSBwcmVzZXQucHJvdG90eXBlLnRpdGxlO1xuICAgICAgICBvblJlc2l6ZSh0aGlzLmVuZ2luZSwgdGhpcy4kY2FudmFzKTtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBuZXcgKGNvbmZpZy5ESU1FTlNJT04gPT0gMiA/IEVuZ2luZTJEIDogRW5naW5lM0QpKGNvbmZpZywgdGhpcy5jdHgpO1xuICAgICAgICBpZiAoJ2luaXQnIGluIGNvbmZpZykgY29uZmlnLmluaXQodGhpcy5lbmdpbmUpO1xuICAgICAgICB0aGlzLmVuZ2luZS5hbmltYXRlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvcjsiLCJmdW5jdGlvbiBpdGVyKGEsIGZ1bmMpIHtcbiAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICBtW2ldID0gZnVuYyhpKTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHplcm9zOiBOID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheShOKS5maWxsKDApO1xuICAgIH0sXG5cbiAgICBtYWc6IGEgPT4ge1xuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBhW2ldICogYVtpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHN1bSk7XG4gICAgfSxcblxuICAgIGFkZDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSArIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzdWI6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLSBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbXVsOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICogYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRpdjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAvIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkb3Q6IChhLCBiLCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGlmIChkaXIgPT0gLTEpIHtcbiAgICAgICAgICAgIFthLCBiXSA9IFtiLCBhXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYV9jID0gYVswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJfYyA9IGJbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgYV9yOyByKyspIHtcbiAgICAgICAgICAgIG1bcl0gPSBuZXcgQXJyYXkoYl9jKTtcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgYl9jOyBjKyspIHtcbiAgICAgICAgICAgICAgICBtW3JdW2NdID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG1bcl1bY10gKz0gYVtyXVtpXSAqIGJbaV1bY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbn07IiwiY29uc3QgQ29udHJvbEJveCA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbF9ib3gnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHtyYWQyZGVnLCBkZWcycmFkLCBwb2xhcjJjYXJ0ZXNpYW4sIGNhcnRlc2lhbjJhdXRvLCBzcXVhcmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdn0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttYXgsIHBvd30gPSBNYXRoO1xuXG5cbmNsYXNzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogUG9sYXIgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2xhcl9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldlBvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBudWxsO1xuICAgIH1cblxuICAgIGdldFJhZGl1cygpIHtcbiAgICAgICAgcmV0dXJuIENpcmNsZS5nZXRSYWRpdXNGcm9tTWFzcyh0aGlzLm0pXG4gICAgfVxuXG4gICAgY2FsY3VsYXRlVmVsb2NpdHkoKSB7XG4gICAgICAgIGxldCBGID0gemVyb3ModGhpcy5jb25maWcuRElNRU5TSU9OKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgaWYgKG9iaiA9PSB0aGlzKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvciA9IHN1Yih0aGlzLnBvcywgb2JqLnBvcyk7XG4gICAgICAgICAgICBjb25zdCBtYWduaXR1ZGUgPSBtYWcodmVjdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXRWZWN0b3IgPSBkaXYodmVjdG9yLCBtYWduaXR1ZGUpO1xuICAgICAgICAgICAgRiA9IGFkZChGLCBtdWwodW5pdFZlY3Rvciwgb2JqLm0gLyBzcXVhcmUobWFnbml0dWRlKSkpXG4gICAgICAgIH1cbiAgICAgICAgRiA9IG11bChGLCAtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBkaXYoRiwgdGhpcy5tKTtcbiAgICAgICAgdGhpcy52ID0gYWRkKHRoaXMudiwgYSk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlUG9zaXRpb24oKSB7XG4gICAgICAgIHRoaXMucG9zID0gYWRkKHRoaXMucG9zLCB0aGlzLnYpO1xuICAgIH1cblxuICAgIGNvbnRyb2xNKGUpIHtcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgfVxuXG4gICAgY29udHJvbFBvcyhlKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc1hDb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NZQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBbeCwgeV07XG4gICAgfVxuXG4gICAgY29udHJvbFYoZSkge1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZSaG9Db250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudlBoaUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICB0aGlzLnYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmhvLCBwaGkpO1xuICAgIH1cblxuICAgIHNob3dDb250cm9sQm94KHgsIHkpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udHJvbEJveCAmJiB0aGlzLmNvbnRyb2xCb3guaXNPcGVuKCkpIHtcbiAgICAgICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gdGhpcy5jb250cm9sQm94LiRjb250cm9sQm94O1xuICAgICAgICAgICAgJGNvbnRyb2xCb3guY3NzKCdsZWZ0JywgeCArICdweCcpO1xuICAgICAgICAgICAgJGNvbnRyb2xCb3guY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG4gICAgICAgICAgICAkY29udHJvbEJveC5uZXh0VW50aWwoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpLmluc2VydEJlZm9yZSgkY29udHJvbEJveCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBtYXJnaW4gPSAxLjU7XG5cbiAgICAgICAgICAgIHZhciBwb3NSYW5nZSA9IG1heChtYXgodGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCkgLyAyLCBtYXguYXBwbHkobnVsbCwgdGhpcy5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgICAgIHBvc1JhbmdlID0gbWF4KHBvc1JhbmdlLCBtYXguYXBwbHkobnVsbCwgb2JqLnBvcy5tYXAoTWF0aC5hYnMpKSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZSYW5nZSA9IG1heCh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVgsIG1hZyh0aGlzLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICB2UmFuZ2UgPSBtYXgodlJhbmdlLCBtYWcob2JqLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgbSwgdiwgdlJhbmdlKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbEJveCA9IG5ldyBDb250cm9sQm94KHRoaXMsIHRoaXMudGFnLCB0aGlzLmdldENvbnRyb2xsZXJzKCksIHgsIHkpO1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUuY29udHJvbEJveGVzLnB1c2godGhpcy5jb250cm9sQm94KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc1JhbmdlLCBtLCB2LCB2UmFuZ2UpIHtcbiAgICAgICAgdGhpcy5tQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiTWFzcyBtXCIsIHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCwgbSwgdGhpcy5jb250cm9sTSk7XG4gICAgICAgIHRoaXMucG9zWENvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHhcIiwgLXBvc1JhbmdlLCBwb3NSYW5nZSwgdGhpcy5wb3NbMF0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHlcIiwgLXBvc1JhbmdlLCBwb3NSYW5nZSwgdGhpcy5wb3NbMV0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMudlJob0NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM+BXCIsIDAsIHZSYW5nZSwgdlswXSwgdGhpcy5jb250cm9sVik7XG4gICAgICAgIHRoaXMudlBoaUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM+GXCIsIC0xODAsIDE4MCwgcmFkMmRlZyh2WzFdKSwgdGhpcy5jb250cm9sVik7XG4gICAgfVxuXG4gICAgZ2V0Q29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLmVuZ2luZS5vYmpzLmluZGV4T2YodGhpcyk7XG4gICAgICAgIHRoaXMuZW5naW5lLm9ianMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpZiAodGhpcy5jb250cm9sQm94ICYmIHRoaXMuY29udHJvbEJveC5pc09wZW4oKSkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sQm94LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UmFkaXVzRnJvbU1hc3MobSkge1xuICAgICAgICByZXR1cm4gcG93KG0sIDEgLyAyKVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRNYXNzRnJvbVJhZGl1cyhyKSB7XG4gICAgICAgIHJldHVybiBzcXVhcmUocilcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsndGFnJzogdGhpcy50YWcsICd2JzogdGhpcy52LCAncG9zJzogdGhpcy5wb3N9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4vY2lyY2xlJyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7cmFkMmRlZywgZGVnMnJhZCwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7Y3ViZX0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7cG93fSA9IE1hdGg7XG5cblxuY2xhc3MgU3BoZXJlIGV4dGVuZHMgQ2lyY2xlIHtcbiAgICAvKipcbiAgICAgKiBTcGhlcmljYWwgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TcGhlcmljYWxfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGdldFJhZGl1cygpIHtcbiAgICAgICAgcmV0dXJuIFNwaGVyZS5nZXRSYWRpdXNGcm9tTWFzcyh0aGlzLm0pO1xuICAgIH1cblxuICAgIGNvbnRyb2xQb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NYQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zWUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHogPSB0aGlzLnBvc1pDb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5LCB6XTtcbiAgICB9XG5cbiAgICBjb250cm9sVihlKSB7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52UGhpQ29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHRoZXRhID0gZGVnMnJhZCh0aGlzLnZUaGV0YUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZSaG9Db250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJobywgcGhpLCB0aGV0YSk7XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKSB7XG4gICAgICAgIHN1cGVyLnNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSk7XG4gICAgICAgIHRoaXMucG9zWkNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHpcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1syXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy52VGhldGFDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDOuFwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsyXSksIHRoaXMuY29udHJvbFYpO1xuICAgIH1cblxuICAgIGdldENvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWENvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1lDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NaQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlJob0NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZQaGlDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52VGhldGFDb250cm9sbGVyXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFJhZGl1c0Zyb21NYXNzKG0pIHtcbiAgICAgICAgcmV0dXJuIHBvdyhtLCAxIC8gMyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldE1hc3NGcm9tUmFkaXVzKHIpIHtcbiAgICAgICAgcmV0dXJuIGN1YmUocik7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaGVyZTsiLCJjb25zdCBJbnZpc2libGVFcnJvciA9IHJlcXVpcmUoJy4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7bWFnLCBkb3R9ID0gcmVxdWlyZSgnLi9tYXRyaXgnKTtcblxuY29uc3QgVXRpbCA9IHtcbiAgICBzcXVhcmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeDtcbiAgICB9LFxuXG4gICAgY3ViZTogKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIHggKiB4ICogeDtcbiAgICB9LFxuXG4gICAgcG9sYXIyY2FydGVzaWFuOiAocmhvLCBwaGkpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyAqIE1hdGguY29zKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbihwaGkpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJwb2xhcjogKHgsIHkpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG1hZyhbeCwgeV0pLFxuICAgICAgICAgICAgTWF0aC5hdGFuMih5LCB4KVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBzcGhlcmljYWwyY2FydGVzaWFuOiAocmhvLCBwaGksIHRoZXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5zaW4ocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguY29zKHRoZXRhKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4yc3BoZXJpY2FsOiAoeCwgeSwgeikgPT4ge1xuICAgICAgICBjb25zdCByaG8gPSBtYWcoW3gsIHksIHpdKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeSwgeCksXG4gICAgICAgICAgICByaG8gIT0gMCA/IE1hdGguYWNvcyh6IC8gcmhvKSA6IDBcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMmF1dG86ICh2ZWN0b3IpID0+IHtcbiAgICAgICAgcmV0dXJuIHZlY3Rvci5sZW5ndGggPT0gMlxuICAgICAgICAgICAgPyBVdGlsLmNhcnRlc2lhbjJwb2xhcih2ZWN0b3JbMF0sIHZlY3RvclsxXSlcbiAgICAgICAgICAgIDogVXRpbC5jYXJ0ZXNpYW4yc3BoZXJpY2FsKHZlY3RvclswXSwgdmVjdG9yWzFdLCB2ZWN0b3JbMl0pO1xuICAgIH0sXG5cbiAgICByYWQyZGVnOiAocmFkKSA9PiB7XG4gICAgICAgIHJldHVybiByYWQgLyBNYXRoLlBJICogMTgwO1xuICAgIH0sXG5cbiAgICBkZWcycmFkOiAoZGVnKSA9PiB7XG4gICAgICAgIHJldHVybiBkZWcgLyAxODAgKiBNYXRoLlBJO1xuICAgIH0sXG5cbiAgICBnZXREaXN0YW5jZTogKHgwLCB5MCwgeDEsIHkxKSA9PiB7XG4gICAgICAgIHJldHVybiBtYWcoW3gxIC0geDAsIHkxIC0geTBdKTtcbiAgICB9LFxuXG4gICAgcm90YXRlOiAodmVjdG9yLCBtYXRyaXgpID0+IHtcbiAgICAgICAgcmV0dXJuIGRvdChbdmVjdG9yXSwgbWF0cml4KVswXTtcbiAgICB9LFxuXG4gICAgbm93OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgfSxcblxuICAgIHJhbmRvbTogKG1pbiwgbWF4ID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgICAgICAgIG1heCA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiAgICB9LFxuXG4gICAgcmFuZENvbG9yOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiAnIycgKyBNYXRoLmZsb29yKDB4MTAwMDAwMCArIE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XG4gICAgfSxcblxuICAgIGdldFJvdGF0aW9uTWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAtc2luXSxcbiAgICAgICAgICAgIFtzaW4sIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0WFJvdGF0aW9uTWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbMSwgMCwgMF0sXG4gICAgICAgICAgICBbMCwgY29zLCAtc2luXSxcbiAgICAgICAgICAgIFswLCBzaW4sIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0WVJvdGF0aW9uTWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAwLCBzaW5dLFxuICAgICAgICAgICAgWzAsIDEsIDBdLFxuICAgICAgICAgICAgWy1zaW4sIDAsIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0WlJvdGF0aW9uTWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAtc2luLCAwXSxcbiAgICAgICAgICAgIFtzaW4sIGNvcywgMF0sXG4gICAgICAgICAgICBbMCwgMCwgMV1cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgc2tpcEludmlzaWJsZUVycm9yOiBmdW5jID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbDsiXX0=

//# sourceMappingURL=gravity_simulator.js.map
