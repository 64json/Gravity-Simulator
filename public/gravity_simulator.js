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
var selected = 0;
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

},{"./preset":2,"./simulator":7}],2:[function(require,module,exports){
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
        RADIUS_MIN: 1,
        RADIUS_MAX: 2e2,
        VELOCITY_MAX: 10,
        DIRECTION_LENGTH: 50,
        CAMERA_X: 0,
        CAMERA_Y: 0,
        CAMERA_Z: 200,
        FOCAL_LENGTH: 100,
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
            engine.createObject('ball1', [-150, 0, 0], 1000000, 100, [0, 0, 0], 'green');
            engine.createObject('ball2', [50, 0, 0], 10000, 10, [0, 0, 0], 'blue');
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Circle = require('../object/circle');

var _require = require('../util'),
    rotate = _require.rotate,
    now = _require.now,
    random = _require.random,
    polar2cartesian = _require.polar2cartesian,
    randColor = _require.randColor,
    _getRotationMatrix = _require.getRotationMatrix,
    cartesian2auto = _require.cartesian2auto;

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub;

var min = Math.min,
    PI = Math.PI,
    atan2 = Math.atan2,
    pow = Math.pow;

var Engine2D = function () {
    function Engine2D(config, renderer) {
        _classCallCheck(this, Engine2D);

        this.config = config;
        this.objs = [];
        this.animating = false;
        this.controlBoxes = [];
        this.fpsLastTime = now();
        this.fpsCount = 0;
        this.lastObjNo = 0;
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, config.W / config.H, 0.1, 1e5);
        this.camera.position.z = 500;
        this.camera.lookAt(this.scene.position);

        this.mouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
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
            this.renderer = null;
            this.destroyControlBoxes();
        }
    }, {
        key: 'animate',
        value: function animate() {
            if (!this.renderer) return;
            this.printFps();
            if (this.animating) {
                this.calculateAll();
            }
            this.redrawAll();
            requestAnimationFrame(this.animate.bind(this));
        }
    }, {
        key: 'userCreateObject',
        value: function userCreateObject(x, y) {
            var vector = new THREE.Vector3();
            vector.set(x / this.config.W * 2 - 1, -(y / this.config.H) * 2 + 1, 0.5);
            vector.unproject(this.camera);
            var dir = vector.sub(this.camera.position).normalize();
            var distance = -this.camera.position.z / dir.z;
            var position = this.camera.position.clone().add(dir.multiplyScalar(distance));
            var pos = [position.x, position.y];

            var maxR = this.config.RADIUS_MAX;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _obj = _step2.value;

                    maxR = min(maxR, (mag(sub(_obj.pos, pos)) - _obj.r) / 1.5);
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

            var m = random(this.config.MASS_MIN, this.config.MASS_MAX);
            var r = random(this.config.RADIUS_MIN, maxR);
            var v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
            var color = randColor();
            var tag = 'circle' + ++this.lastObjNo;
            var obj = new Circle(this.config, m, r, pos, v, color, tag, this);
            obj.showControlBox(x, y);
            this.objs.push(obj);
        }
    }, {
        key: 'createObject',
        value: function createObject(tag, pos, m, r, v, color) {
            var obj = new Circle(this.config, m, r, pos, v, color, tag, this);
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

                    if (d < o1.r + o2.r) {
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
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.objs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var obj = _step5.value;

                    obj.draw();
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

            this.renderer.render(this.scene, this.camera);
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
    }, {
        key: 'resize',
        value: function resize() {
            this.camera.aspect = this.config.W / this.config.H;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.config.W, this.config.H);
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove(e) {
            if (!this.mouseDown) {
                return;
            }

            var delta = atan2(e.pageY - this.config.H / 2, e.pageX - this.config.W / 2) - atan2(this.mouseY - this.config.H / 2, this.mouseX - this.config.W / 2);
            if (delta < -PI) delta += 2 * PI;
            if (delta > +PI) delta -= 2 * PI;
            this.mouseX = e.pageX;
            this.mouseY = e.pageY;
            this.camera.rotation.z += delta;
            this.camera.updateProjectionMatrix();
        }
    }, {
        key: 'onMouseDown',
        value: function onMouseDown(e) {
            this.mouseDown = true;
            this.mouseX = e.pageX;
            this.mouseY = e.pageY;
        }
    }, {
        key: 'onMouseUp',
        value: function onMouseUp(e) {
            this.mouseDown = false;
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
        key: 'updatePosition',
        value: function updatePosition() {
            this.camera.updateProjectionMatrix();
        }
    }, {
        key: 'up',
        value: function up(key) {
            this.camera.translateY(+this.getCoordStep(key));
            this.updatePosition();
        }
    }, {
        key: 'down',
        value: function down(key) {
            this.camera.translateY(-this.getCoordStep(key));
            this.updatePosition();
        }
    }, {
        key: 'left',
        value: function left(key) {
            this.camera.translateX(-this.getCoordStep(key));
            this.updatePosition();
        }
    }, {
        key: 'right',
        value: function right(key) {
            this.camera.translateX(+this.getCoordStep(key));
            this.updatePosition();
        }
    }, {
        key: 'zoomIn',
        value: function zoomIn(key) {
            this.camera.translateZ(-this.getCoordStep(key));
            this.updatePosition();
        }
    }, {
        key: 'zoomOut',
        value: function zoomOut(key) {
            this.camera.translateZ(+this.getCoordStep(key));
            this.updatePosition();
        }
    }]);

    return Engine2D;
}();

module.exports = Engine2D;

},{"../matrix":8,"../object/circle":9,"../util":11}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Engine2D = require('./2d');
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

var min = Math.min,
    abs = Math.abs;

var Engine3D = function (_Engine2D) {
    _inherits(Engine3D, _Engine2D);

    function Engine3D(config, renderer) {
        _classCallCheck(this, Engine3D);

        var _this = _possibleConstructorReturn(this, (Engine3D.__proto__ || Object.getPrototypeOf(Engine3D)).call(this, config, renderer));

        _this.controls = new THREE.OrbitControls(_this.camera, _this.renderer.domElement);
        _this.controls.enableDamping = true;
        _this.controls.dampingFactor = 0.25;
        _this.controls.enableZoom = false;
        _this.controls.enableKeys = false;
        return _this;
    }

    _createClass(Engine3D, [{
        key: 'userCreateObject',
        value: function userCreateObject(x, y) {
            var vector = new THREE.Vector3();
            vector.set(x / this.config.W * 2 - 1, -(y / this.config.H) * 2 + 1, 0.5);
            vector.unproject(this.camera);
            var dir = vector.sub(this.camera.position).normalize();
            var distance = this.config.RADIUS_MAX * 3 - this.camera.position.z / dir.z;
            var p = this.camera.position.clone().add(dir.multiplyScalar(distance));
            var pos = [p.x, p.y, p.z];

            var maxR = this.config.RADIUS_MAX;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _obj = _step.value;

                    maxR = min(maxR, (mag(sub(_obj.pos, pos)) - _obj.r) / 1.5);
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

            var m = random(this.config.MASS_MIN, this.config.MASS_MAX);
            var r = random(this.config.RADIUS_MIN, maxR);
            var v = spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180));
            var color = randColor();
            var tag = 'sphere' + ++this.lastObjNo;
            var obj = new Sphere(this.config, m, r, pos, v, color, tag, this);
            obj.showControlBox(x, y);
            this.objs.push(obj);
        }
    }, {
        key: 'createObject',
        value: function createObject(tag, pos, r, m, v, color) {
            var obj = new Sphere(this.config, m, r, pos, v, color, tag, this);
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
        key: 'onMouseMove',
        value: function onMouseMove(e) {}
    }, {
        key: 'onMouseDown',
        value: function onMouseDown(e) {}
    }, {
        key: 'onMouseUp',
        value: function onMouseUp(e) {}
    }, {
        key: 'updatePosition',
        value: function updatePosition() {
            _get(Engine3D.prototype.__proto__ || Object.getPrototypeOf(Engine3D.prototype), 'updatePosition', this).call(this);
            this.controls.position0 = this.camera.position.clone();
            this.controls.reset();
        }
    }]);

    return Engine3D;
}(Engine2D);

module.exports = Engine3D;

},{"../matrix":8,"../object/sphere":10,"../util":11,"./2d":5}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Engine2D = require('./engine/2d');
var Engine3D = require('./engine/3d');

var _require = require('./util'),
    getDistance = _require.getDistance;

var config = null;
var keymap = {
    38: 'up',
    40: 'down',
    37: 'left',
    39: 'right',
    90: 'zoomIn', // z
    88: 'zoomOut' };
var $rendererWrapper = $('.renderer-wrapper');

function onResize(e, engine) {
    config.W = $rendererWrapper.width();
    config.H = $rendererWrapper.height();
    if (engine) engine.resize();
}

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
function onClick(e, engine) {
    var x = e.pageX;
    var y = e.pageY;
    if (!engine.animating) {
        mouse.x = x / config.W * 2 - 1;
        mouse.y = -(y / config.H) * 2 + 1;
        raycaster.setFromCamera(mouse, engine.camera);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var obj = _step.value;

                var intersects = raycaster.intersectObject(obj.object);
                if (intersects.length > 0) {
                    obj.showControlBox(x, y);
                    return true;
                }
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

function onKeyDown(e, engine) {
    var keyCode = e.keyCode;

    if (keyCode == 32) {
        // space bar
        engine.destroyControlBoxes();
        engine.toggleAnimating();
    } else if (keyCode in keymap && keymap[keyCode] in engine) {
        engine[keymap[keyCode]](keyCode);
    }
}

var Simulator = function () {
    function Simulator() {
        var _this = this;

        _classCallCheck(this, Simulator);

        this.renderer = new THREE.WebGLRenderer();
        $rendererWrapper.append(this.renderer.domElement);
        $(window).resize(function (e) {
            onResize(e, _this.engine);
        });
        $(this.renderer.domElement).contextmenu(function (e) {
            e.preventDefault();
            _this.engine.onMouseUp(e);
            onClick(e, _this.engine);
        });
        $('body').keydown(function (e) {
            onKeyDown(e, _this.engine);
        });
        $rendererWrapper.mousedown(function (e) {
            _this.engine.onMouseDown(e);
        });
        $rendererWrapper.mousemove(function (e) {
            _this.engine.onMouseMove(e);
        });
        $rendererWrapper.mouseup(function (e) {
            _this.engine.onMouseUp(e);
        });
    }

    _createClass(Simulator, [{
        key: 'init',
        value: function init(preset) {
            if (this.engine) this.engine.destroy();
            config = preset({});
            document.title = config.TITLE = preset.prototype.title;
            this.engine = new (config.DIMENSION == 2 ? Engine2D : Engine3D)(config, this.renderer);
            onResize(null, this.engine);
            if ('init' in config) config.init(this.engine);
            this.engine.animate();
        }
    }]);

    return Simulator;
}();

module.exports = Simulator;

},{"./engine/2d":5,"./engine/3d":6,"./util":11}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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
    PI = Math.PI;

var Circle = function () {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    function Circle(config, m, r, pos, v, color, tag, engine) {
        _classCallCheck(this, Circle);

        this.config = config;
        this.m = m;
        this.r = r;
        this.pos = pos;
        this.prevPos = pos.slice();
        this.v = v;
        this.color = color;
        this.tag = tag;
        this.engine = engine;
        this.object = this.createObject();
        this.controlBox = null;
        this.path = null;
        this.pathVertices = [];
        this.pathMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff
        });
    }

    _createClass(Circle, [{
        key: 'createObject',
        value: function createObject() {
            if (this.object) this.engine.scene.remove(this.object);
            var geometry = new THREE.SphereGeometry(this.r, 32, 32);
            var material = new THREE.MeshBasicMaterial({ color: this.color });
            var object = new THREE.Mesh(geometry, material);
            object.matrixAutoUpdate = false;
            this.engine.scene.add(object);
            return object;
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
            if (mag(sub(this.pos, this.prevPos)) > 1) {
                this.prevPos = this.pos.slice();
                this.pathVertices.push(new THREE.Vector3(this.pos[0], this.pos[1], this.pos[2]));
            }
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.object.position.x = this.pos[0];
            this.object.position.y = this.pos[1];
            this.object.updateMatrix();
            if (this.path) this.engine.scene.remove(this.path);
            var pathGeometry = new THREE.Geometry();
            pathGeometry.vertices = this.pathVertices;
            this.path = new THREE.Line(pathGeometry, this.pathMaterial);
            this.engine.scene.add(this.path);
        }
    }, {
        key: 'controlM',
        value: function controlM(e) {
            var m = this.mController.get();
            this.m = m;
            this.object = this.createObject();
        }
    }, {
        key: 'controlR',
        value: function controlR(e) {
            var r = this.rController.get();
            this.r = r;
            this.object = this.createObject();
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

                this.setup_controllers(posRange, this.m, this.r, v, vRange);
                this.controlBox = new ControlBox(this, this.tag, this.getControllers(), x, y);
                this.engine.controlBoxes.push(this.controlBox);
            }
        }
    }, {
        key: 'setup_controllers',
        value: function setup_controllers(posRange, m, r, v, vRange) {
            this.mController = new Controller(this, "Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.controlM);
            this.rController = new Controller(this, "Radius r", this.config.RADIUS_MIN, this.config.RADIUS_MAX, r, this.controlR);
            this.posXController = new Controller(this, "Position x", -posRange, posRange, this.pos[0], this.controlPos);
            this.posYController = new Controller(this, "Position y", -posRange, posRange, this.pos[1], this.controlPos);
            this.vRhoController = new Controller(this, "Velocity ρ", 0, vRange, v[0], this.controlV);
            this.vPhiController = new Controller(this, "Velocity φ", -180, 180, rad2deg(v[1]), this.controlV);
        }
    }, {
        key: 'getControllers',
        value: function getControllers() {
            return [this.mController, this.rController, this.posXController, this.posYController, this.vRhoController, this.vPhiController];
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            if (this.object) this.engine.scene.remove(this.object);
            if (this.path) this.engine.scene.remove(this.path);
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
    }]);

    return Circle;
}();

module.exports = Circle;

},{"../control/control_box":3,"../control/controller":4,"../matrix":8,"../util":11}],10:[function(require,module,exports){
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
        key: 'draw',

        /**
         * Spherical coordinate system
         * https://en.wikipedia.org/wiki/Spherical_coordinate_system
         */

        value: function draw() {
            this.object.position.z = this.pos[2];
            _get(Sphere.prototype.__proto__ || Object.getPrototypeOf(Sphere.prototype), 'draw', this).call(this);
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
            return [this.mController, this.rController, this.posXController, this.posYController, this.posZController, this.vRhoController, this.vPhiController, this.vThetaController];
        }
    }]);

    return Sphere;
}(Circle);

module.exports = Sphere;

},{"../control/controller":4,"../util":11,"./circle":9}],11:[function(require,module,exports){
'use strict';

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
        return Math.random() * 0xffffff;
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
    }
};

module.exports = Util;

},{"./matrix":8}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jb250cm9sL2NvbnRyb2xfYm94LmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbGxlci5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvMmQuanMiLCJqcy9zaW11bGF0b3IvZW5naW5lLzNkLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLElBQU0sWUFBWSxRQUFRLGFBQVIsQ0FBbEI7O0FBRUEsSUFBTSxZQUFZLElBQUksU0FBSixFQUFsQjtBQUNBLElBQUksV0FBVyxDQUFmO0FBQ0EsVUFBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLEtBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3JDLFFBQU0sU0FBUyxRQUFRLENBQVIsQ0FBZjtBQUNBLFlBQVEsTUFBUixxQkFBaUMsQ0FBakMsVUFBc0MsS0FBSyxRQUFMLEdBQWdCLFdBQWhCLEdBQThCLEVBQXBFLFVBQTBFLE9BQU8sU0FBUCxDQUFpQixLQUEzRjtBQUNIO0FBQ0QsUUFBUSxNQUFSLENBQWUsWUFBTTtBQUNqQixlQUFXLFNBQVMsUUFBUSxJQUFSLENBQWEsV0FBYixFQUEwQixHQUExQixFQUFULENBQVg7QUFDQSxjQUFVLElBQVYsQ0FBZSxRQUFRLFFBQVIsQ0FBZjtBQUNILENBSEQ7QUFJ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RUFBTixDQUFNOztBQUNoQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBQyxHQUFQLEVBQVksQ0FBWixDQURHLEVBRUgsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0FGRyxFQUdILENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSEcsQ0FBUDtBQUtIO0FBbkhRLENBQWI7O0FBc0hBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBwcmVzZXRzID0gcmVxdWlyZSgnLi9wcmVzZXQnKTtcbmNvbnN0IFNpbXVsYXRvciA9IHJlcXVpcmUoJy4vc2ltdWxhdG9yJyk7XG5cbmNvbnN0IHNpbXVsYXRvciA9IG5ldyBTaW11bGF0b3IoKTtcbmxldCBzZWxlY3RlZCA9IDA7XG5zaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG5cbmNvbnN0ICRzZWxlY3QgPSAkKCdzZWxlY3QnKTtcbmZvciAobGV0IGkgPSAwOyBpIDwgcHJlc2V0cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHByZXNldCA9IHByZXNldHNbaV07XG4gICAgJHNlbGVjdC5hcHBlbmQoYDxvcHRpb24gdmFsdWU9XCIke2l9XCIke2kgPT0gc2VsZWN0ZWQgPyAnIHNlbGVjdGVkJyA6ICcnfT4ke3ByZXNldC5wcm90b3R5cGUudGl0bGV9PC9vcHRpb24+YCk7XG59XG4kc2VsZWN0LmNoYW5nZSgoKSA9PiB7XG4gICAgc2VsZWN0ZWQgPSBwYXJzZUludCgkc2VsZWN0LmZpbmQoJzpzZWxlY3RlZCcpLnZhbCgpKTtcbiAgICBzaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG59KTtcbiRzZWxlY3QuZm9jdXMoKCkgPT4ge1xuICAgICRzZWxlY3QuYmx1cigpO1xufSk7XG4kKCcjcmVzZXQnKS5jbGljaygoKSA9PiB7XG4gICAgc2ltdWxhdG9yLmluaXQocHJlc2V0c1tzZWxlY3RlZF0pO1xufSk7XG5cblxubGV0ICRtb3ZpbmcgPSBudWxsO1xubGV0IHB4LCBweTtcblxuJCgnYm9keScpLm9uKCdtb3VzZWRvd24nLCAnLmNvbnRyb2wtYm94IC50aXRsZS1iYXInLCBmdW5jdGlvbiAoZSkge1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG4gICAgJG1vdmluZyA9ICQodGhpcykucGFyZW50KCcuY29udHJvbC1ib3gnKTtcbiAgICAkbW92aW5nLm5leHRVbnRpbCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuaW5zZXJ0QmVmb3JlKCRtb3ZpbmcpO1xuICAgIHJldHVybiBmYWxzZTtcbn0pO1xuXG4kKCdib2R5JykubW91c2Vtb3ZlKGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCEkbW92aW5nKSByZXR1cm47XG4gICAgY29uc3QgeCA9IGUucGFnZVg7XG4gICAgY29uc3QgeSA9IGUucGFnZVk7XG4gICAgJG1vdmluZy5jc3MoJ2xlZnQnLCBwYXJzZUludCgkbW92aW5nLmNzcygnbGVmdCcpKSArICh4IC0gcHgpICsgJ3B4Jyk7XG4gICAgJG1vdmluZy5jc3MoJ3RvcCcsIHBhcnNlSW50KCRtb3ZpbmcuY3NzKCd0b3AnKSkgKyAoeSAtIHB5KSArICdweCcpO1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG59KTtcblxuJCgnYm9keScpLm1vdXNldXAoZnVuY3Rpb24gKGUpIHtcbiAgICAkbW92aW5nID0gbnVsbDtcbn0pOyIsImNvbnN0IHtleHRlbmR9ID0gJDtcblxuXG5mdW5jdGlvbiBFTVBUWV8yRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBjLCB7XG4gICAgICAgIEJBQ0tHUk9VTkQ6ICd3aGl0ZScsXG4gICAgICAgIERJTUVOU0lPTjogMixcbiAgICAgICAgTUFYX1BBVEhTOiAxMDAwLFxuICAgICAgICBDQU1FUkFfQ09PUkRfU1RFUDogNSxcbiAgICAgICAgQ0FNRVJBX0FOR0xFX1NURVA6IDEsXG4gICAgICAgIENBTUVSQV9BQ0NFTEVSQVRJT046IDEuMSxcbiAgICAgICAgRzogMC4xLFxuICAgICAgICBNQVNTX01JTjogMSxcbiAgICAgICAgTUFTU19NQVg6IDRlNCxcbiAgICAgICAgUkFESVVTX01JTjogMSxcbiAgICAgICAgUkFESVVTX01BWDogMmUyLFxuICAgICAgICBWRUxPQ0lUWV9NQVg6IDEwLFxuICAgICAgICBESVJFQ1RJT05fTEVOR1RIOiA1MCxcbiAgICAgICAgQ0FNRVJBX1g6IDAsXG4gICAgICAgIENBTUVSQV9ZOiAwLFxuICAgICAgICBDQU1FUkFfWjogMjAwLFxuICAgICAgICBGT0NBTF9MRU5HVEg6IDEwMCxcbiAgICAgICAgSU5QVVRfVFlQRTogJ3JhbmdlJ1xuICAgIH0pO1xufVxuRU1QVFlfMkQucHJvdG90eXBlLnRpdGxlID0gJzJEIEdyYXZpdHkgU2ltdWxhdG9yJztcblxuXG5mdW5jdGlvbiBFTVBUWV8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8yRChjKSwge1xuICAgICAgICBESU1FTlNJT046IDMsXG4gICAgICAgIEc6IDAuMDAxLFxuICAgICAgICBNQVNTX01JTjogMSxcbiAgICAgICAgTUFTU19NQVg6IDhlNixcbiAgICAgICAgVkVMT0NJVFlfTUFYOiAxMFxuICAgIH0pO1xufVxuRU1QVFlfM0QucHJvdG90eXBlLnRpdGxlID0gJzNEIEdyYXZpdHkgU2ltdWxhdG9yJztcblxuZnVuY3Rpb24gV09PXzJEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzJEKGMpLCB7XG4gICAgICAgIElOUFVUX1RZUEU6ICdudW1iZXInXG4gICAgfSk7XG59XG5XT09fMkQucHJvdG90eXBlLnRpdGxlID0gJzJEIFdPTyc7XG5cbmZ1bmN0aW9uIFdPT18zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBJTlBVVF9UWVBFOiAnbnVtYmVyJ1xuICAgIH0pO1xufVxuV09PXzNELnByb3RvdHlwZS50aXRsZSA9ICczRCBXT08nO1xuXG5mdW5jdGlvbiBERUJVRyhjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBpbml0OiAoZW5naW5lKSA9PiB7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdiYWxsMScsIFstMTUwLCAwLCAwXSwgMTAwMDAwMCwgMTAwLCBbMCwgMCwgMF0sICdncmVlbicpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnYmFsbDInLCBbNTAsIDAsIDBdLCAxMDAwMCwgMTAsIFswLCAwLCAwXSwgJ2JsdWUnKTtcbiAgICAgICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuREVCVUcucHJvdG90eXBlLnRpdGxlID0gJ0RFQlVHJztcblxubW9kdWxlLmV4cG9ydHMgPSBbRU1QVFlfMkQsIEVNUFRZXzNELCBXT09fMkQsIFdPT18zRCwgREVCVUddOyIsImNsYXNzIENvbnRyb2xCb3gge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgdGl0bGUsIGNvbnRyb2xsZXJzLCB4LCB5KSB7XG4gICAgICAgIGNvbnN0ICR0ZW1wbGF0ZUNvbnRyb2xCb3ggPSAkKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKTtcbiAgICAgICAgY29uc3QgJGNvbnRyb2xCb3ggPSAkdGVtcGxhdGVDb250cm9sQm94LmNsb25lKCk7XG4gICAgICAgICRjb250cm9sQm94LnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICAkY29udHJvbEJveC5maW5kKCcudGl0bGUnKS50ZXh0KHRpdGxlKTtcbiAgICAgICAgY29uc3QgJGlucHV0Q29udGFpbmVyID0gJGNvbnRyb2xCb3guZmluZCgnLmlucHV0LWNvbnRhaW5lcicpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRyb2xsZXIgb2YgY29udHJvbGxlcnMpIHtcbiAgICAgICAgICAgICRpbnB1dENvbnRhaW5lci5hcHBlbmQoY29udHJvbGxlci4kaW5wdXRXcmFwcGVyKTtcbiAgICAgICAgfVxuICAgICAgICAkY29udHJvbEJveC5maW5kKCcuY2xvc2UnKS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAkY29udHJvbEJveC5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy5yZW1vdmUnKS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICBvYmplY3QuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNvbnRyb2xCb3guaW5zZXJ0QmVmb3JlKCR0ZW1wbGF0ZUNvbnRyb2xCb3gpO1xuICAgICAgICAkY29udHJvbEJveC5jc3MoJ2xlZnQnLCB4ICsgJ3B4Jyk7XG4gICAgICAgICRjb250cm9sQm94LmNzcygndG9wJywgeSArICdweCcpO1xuXG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3ggPSAkY29udHJvbEJveDtcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy4kY29udHJvbEJveC5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBpc09wZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRjb250cm9sQm94WzBdLnBhcmVudE5vZGU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xCb3g7IiwiY2xhc3MgQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCBuYW1lLCBtaW4sIG1heCwgdmFsdWUsIGZ1bmMpIHtcbiAgICAgICAgY29uc3QgJGlucHV0V3JhcHBlciA9IHRoaXMuJGlucHV0V3JhcHBlciA9ICQoJy5jb250cm9sLWJveC50ZW1wbGF0ZSAuaW5wdXQtd3JhcHBlci50ZW1wbGF0ZScpLmNsb25lKCk7XG4gICAgICAgICRpbnB1dFdyYXBwZXIucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRpbnB1dFdyYXBwZXIuZmluZCgnLm5hbWUnKS50ZXh0KG5hbWUpO1xuICAgICAgICBjb25zdCAkaW5wdXQgPSB0aGlzLiRpbnB1dCA9ICRpbnB1dFdyYXBwZXIuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3R5cGUnLCBvYmplY3QuY29uZmlnLklOUFVUX1RZUEUpO1xuICAgICAgICAkaW5wdXQuYXR0cignbWluJywgbWluKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21heCcsIG1heCk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd2YWx1ZScsIHZhbHVlKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3N0ZXAnLCAwLjAxKTtcbiAgICAgICAgY29uc3QgJHZhbHVlID0gJGlucHV0V3JhcHBlci5maW5kKCcudmFsdWUnKTtcbiAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICRpbnB1dC5vbignaW5wdXQnLCBlID0+IHtcbiAgICAgICAgICAgICR2YWx1ZS50ZXh0KHRoaXMuZ2V0KCkpO1xuICAgICAgICAgICAgZnVuYy5jYWxsKG9iamVjdCwgZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy4kaW5wdXQudmFsKCkpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sbGVyOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4uL29iamVjdC9jaXJjbGUnKTtcbmNvbnN0IHtyb3RhdGUsIG5vdywgcmFuZG9tLCBwb2xhcjJjYXJ0ZXNpYW4sIHJhbmRDb2xvciwgZ2V0Um90YXRpb25NYXRyaXgsIGNhcnRlc2lhbjJhdXRvfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1Yn0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttaW4sIFBJLCBhdGFuMiwgcG93fSA9IE1hdGg7XG5cbmNsYXNzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIHJlbmRlcmVyKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLm9ianMgPSBbXTtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb250cm9sQm94ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5mcHNMYXN0VGltZSA9IG5vdygpO1xuICAgICAgICB0aGlzLmZwc0NvdW50ID0gMDtcbiAgICAgICAgdGhpcy5sYXN0T2JqTm8gPSAwO1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIGNvbmZpZy5XIC8gY29uZmlnLkgsIDAuMSwgMWU1KTtcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IDUwMDtcbiAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHRoaXMuc2NlbmUucG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMubW91c2VEb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMubW91c2VYID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZVkgPSAwO1xuICAgIH1cblxuICAgIHRvZ2dsZUFuaW1hdGluZygpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSAhdGhpcy5hbmltYXRpbmc7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gYCR7dGhpcy5jb25maWcuVElUTEV9ICgke3RoaXMuYW5pbWF0aW5nID8gXCJTaW11bGF0aW5nXCIgOiBcIlBhdXNlZFwifSlgO1xuICAgIH1cblxuICAgIGRlc3Ryb3lDb250cm9sQm94ZXMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbEJveCBvZiB0aGlzLmNvbnRyb2xCb3hlcykge1xuICAgICAgICAgICAgY29udHJvbEJveC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW11cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5kZXN0cm95Q29udHJvbEJveGVzKCk7XG4gICAgfVxuXG4gICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlbmRlcmVyKSByZXR1cm47XG4gICAgICAgIHRoaXMucHJpbnRGcHMoKTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUFsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVkcmF3QWxsKCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgdXNlckNyZWF0ZU9iamVjdCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgICAgIHZlY3Rvci5zZXQoKHggLyB0aGlzLmNvbmZpZy5XKSAqIDIgLSAxLCAtKHkgLyB0aGlzLmNvbmZpZy5IKSAqIDIgKyAxLCAwLjUpO1xuICAgICAgICB2ZWN0b3IudW5wcm9qZWN0KHRoaXMuY2FtZXJhKTtcbiAgICAgICAgY29uc3QgZGlyID0gdmVjdG9yLnN1Yih0aGlzLmNhbWVyYS5wb3NpdGlvbikubm9ybWFsaXplKCk7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gLXRoaXMuY2FtZXJhLnBvc2l0aW9uLnogLyBkaXIuejtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpLmFkZChkaXIubXVsdGlwbHlTY2FsYXIoZGlzdGFuY2UpKTtcbiAgICAgICAgY29uc3QgcG9zID0gW3Bvc2l0aW9uLngsIHBvc2l0aW9uLnldO1xuXG4gICAgICAgIGxldCBtYXhSID0gdGhpcy5jb25maWcuUkFESVVTX01BWDtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBtYXhSID0gbWluKG1heFIsIChtYWcoc3ViKG9iai5wb3MsIHBvcykpIC0gb2JqLnIpIC8gMS41KVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG0gPSByYW5kb20odGhpcy5jb25maWcuTUFTU19NSU4sIHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgY29uc3QgciA9IHJhbmRvbSh0aGlzLmNvbmZpZy5SQURJVVNfTUlOLCBtYXhSKTtcbiAgICAgICAgY29uc3QgdiA9IHBvbGFyMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSByYW5kQ29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYGNpcmNsZSR7Kyt0aGlzLmxhc3RPYmpOb31gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KHRhZywgcG9zLCBtLCByLCB2LCBjb2xvcikge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzWzBdLCBkaXIpO1xuICAgIH1cblxuICAgIGdldFBpdm90QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY29sbGlkZUVsYXN0aWNhbGx5KCkge1xuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmNvbmZpZy5ESU1FTlNJT047XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vYmpzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvMSA9IHRoaXMub2Jqc1tpXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMub2Jqcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG8yID0gdGhpcy5vYmpzW2pdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHN1YihvMi5wb3MsIG8xLnBvcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGVzID0gY2FydGVzaWFuMmF1dG8oY29sbGlzaW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYW5nbGVzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZCA8IG8xLnIgKyBvMi5yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFIgPSB0aGlzLmdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFJfID0gdGhpcy5nZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMsIC0xKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaSA9IHRoaXMuZ2V0UGl2b3RBeGlzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdlRlbXAgPSBbcm90YXRlKG8xLnYsIFIpLCByb3RhdGUobzIudiwgUildO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2RmluYWwgPSBbdlRlbXBbMF0uc2xpY2UoKSwgdlRlbXBbMV0uc2xpY2UoKV07XG4gICAgICAgICAgICAgICAgICAgIHZGaW5hbFswXVtpXSA9ICgobzEubSAtIG8yLm0pICogdlRlbXBbMF1baV0gKyAyICogbzIubSAqIHZUZW1wWzFdW2ldKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIHZGaW5hbFsxXVtpXSA9ICgobzIubSAtIG8xLm0pICogdlRlbXBbMV1baV0gKyAyICogbzEubSAqIHZUZW1wWzBdW2ldKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIG8xLnYgPSByb3RhdGUodkZpbmFsWzBdLCBSXyk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnYgPSByb3RhdGUodkZpbmFsWzFdLCBSXyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zVGVtcCA9IFt6ZXJvcyhkaW1lbnNpb24pLCByb3RhdGUoY29sbGlzaW9uLCBSKV07XG4gICAgICAgICAgICAgICAgICAgIHBvc1RlbXBbMF1baV0gKz0gdkZpbmFsWzBdW2ldO1xuICAgICAgICAgICAgICAgICAgICBwb3NUZW1wWzFdW2ldICs9IHZGaW5hbFsxXVtpXTtcbiAgICAgICAgICAgICAgICAgICAgbzEucG9zID0gYWRkKG8xLnBvcywgcm90YXRlKHBvc1RlbXBbMF0sIFJfKSk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnBvcyA9IGFkZChvMS5wb3MsIHJvdGF0ZShwb3NUZW1wWzFdLCBSXykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZUFsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlVmVsb2NpdHkoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbGxpZGVFbGFzdGljYWxseSgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVkcmF3QWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5kcmF3KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIH1cblxuICAgIHByaW50RnBzKCkge1xuICAgICAgICB0aGlzLmZwc0NvdW50ICs9IDE7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbm93KCk7XG4gICAgICAgIGNvbnN0IHRpbWVEaWZmID0gY3VycmVudFRpbWUgLSB0aGlzLmZwc0xhc3RUaW1lO1xuICAgICAgICBpZiAodGltZURpZmYgPiAxKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHsodGhpcy5mcHNDb3VudCAvIHRpbWVEaWZmKSB8IDB9IGZwc2ApO1xuICAgICAgICAgICAgdGhpcy5mcHNMYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgdGhpcy5mcHNDb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNpemUoKSB7XG4gICAgICAgIHRoaXMuY2FtZXJhLmFzcGVjdCA9IHRoaXMuY29uZmlnLlcgLyB0aGlzLmNvbmZpZy5IO1xuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKTtcbiAgICB9XG5cbiAgICBvbk1vdXNlTW92ZShlKSB7XG4gICAgICAgIGlmICghdGhpcy5tb3VzZURvd24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZWx0YSA9IGF0YW4yKGUucGFnZVkgLSB0aGlzLmNvbmZpZy5IIC8gMiwgZS5wYWdlWCAtIHRoaXMuY29uZmlnLlcgLyAyKSAtIGF0YW4yKHRoaXMubW91c2VZIC0gdGhpcy5jb25maWcuSCAvIDIsIHRoaXMubW91c2VYIC0gdGhpcy5jb25maWcuVyAvIDIpO1xuICAgICAgICBpZiAoZGVsdGEgPCAtUEkpIGRlbHRhICs9IDIgKiBQSTtcbiAgICAgICAgaWYgKGRlbHRhID4gK1BJKSBkZWx0YSAtPSAyICogUEk7XG4gICAgICAgIHRoaXMubW91c2VYID0gZS5wYWdlWDtcbiAgICAgICAgdGhpcy5tb3VzZVkgPSBlLnBhZ2VZO1xuICAgICAgICB0aGlzLmNhbWVyYS5yb3RhdGlvbi56ICs9IGRlbHRhO1xuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgfVxuXG4gICAgb25Nb3VzZURvd24oZSkge1xuICAgICAgICB0aGlzLm1vdXNlRG93biA9IHRydWU7XG4gICAgICAgIHRoaXMubW91c2VYID0gZS5wYWdlWDtcbiAgICAgICAgdGhpcy5tb3VzZVkgPSBlLnBhZ2VZO1xuICAgIH1cblxuICAgIG9uTW91c2VVcChlKSB7XG4gICAgICAgIHRoaXMubW91c2VEb3duID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0Q29vcmRTdGVwKGtleSkge1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IG5vdygpO1xuICAgICAgICBpZiAoa2V5ID09IHRoaXMubGFzdEtleSAmJiBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWUgPCAxKSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgIHRoaXMubGFzdEtleSA9IGtleTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLkNBTUVSQV9DT09SRF9TVEVQICogcG93KHRoaXMuY29uZmlnLkNBTUVSQV9BQ0NFTEVSQVRJT04sIHRoaXMuY29tYm8pO1xuICAgIH1cblxuICAgIHVwZGF0ZVBvc2l0aW9uKCl7XG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICB9XG5cbiAgICB1cChrZXkpIHtcbiAgICAgICAgdGhpcy5jYW1lcmEudHJhbnNsYXRlWSgrdGhpcy5nZXRDb29yZFN0ZXAoa2V5KSk7XG4gICAgICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcbiAgICB9XG5cbiAgICBkb3duKGtleSkge1xuICAgICAgICB0aGlzLmNhbWVyYS50cmFuc2xhdGVZKC10aGlzLmdldENvb3JkU3RlcChrZXkpKTtcbiAgICAgICAgdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuICAgIH1cblxuICAgIGxlZnQoa2V5KSB7XG4gICAgICAgIHRoaXMuY2FtZXJhLnRyYW5zbGF0ZVgoLXRoaXMuZ2V0Q29vcmRTdGVwKGtleSkpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgcmlnaHQoa2V5KSB7XG4gICAgICAgIHRoaXMuY2FtZXJhLnRyYW5zbGF0ZVgoK3RoaXMuZ2V0Q29vcmRTdGVwKGtleSkpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgem9vbUluKGtleSkge1xuICAgICAgICB0aGlzLmNhbWVyYS50cmFuc2xhdGVaKC10aGlzLmdldENvb3JkU3RlcChrZXkpKTtcbiAgICAgICAgdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuICAgIH1cblxuICAgIHpvb21PdXQoa2V5KSB7XG4gICAgICAgIHRoaXMuY2FtZXJhLnRyYW5zbGF0ZVooK3RoaXMuZ2V0Q29vcmRTdGVwKGtleSkpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTJEOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi8yZCcpO1xuY29uc3QgU3BoZXJlID0gcmVxdWlyZSgnLi4vb2JqZWN0L3NwaGVyZScpO1xuY29uc3Qge3JhbmRvbSwgZ2V0WVJvdGF0aW9uTWF0cml4LCBnZXRaUm90YXRpb25NYXRyaXgsIHJhbmRDb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbiwgc2tpcEludmlzaWJsZUVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHttYWcsIHN1YiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbiwgYWJzfSA9IE1hdGg7XG5cblxuY2xhc3MgRW5naW5lM0QgZXh0ZW5kcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCByZW5kZXJlcikge1xuICAgICAgICBzdXBlcihjb25maWcsIHJlbmRlcmVyKTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHModGhpcy5jYW1lcmEsIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZW5hYmxlRGFtcGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZGFtcGluZ0ZhY3RvciA9IDAuMjU7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZW5hYmxlWm9vbSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbnRyb2xzLmVuYWJsZUtleXMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB1c2VyQ3JlYXRlT2JqZWN0KHgsIHkpIHtcbiAgICAgICAgY29uc3QgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICAgICAgdmVjdG9yLnNldCgoeCAvIHRoaXMuY29uZmlnLlcpICogMiAtIDEsIC0oeSAvIHRoaXMuY29uZmlnLkgpICogMiArIDEsIDAuNSk7XG4gICAgICAgIHZlY3Rvci51bnByb2plY3QodGhpcy5jYW1lcmEpO1xuICAgICAgICBjb25zdCBkaXIgPSB2ZWN0b3Iuc3ViKHRoaXMuY2FtZXJhLnBvc2l0aW9uKS5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLmNvbmZpZy5SQURJVVNfTUFYICogMyAtIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogLyBkaXIuejtcbiAgICAgICAgY29uc3QgcCA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKCkuYWRkKGRpci5tdWx0aXBseVNjYWxhcihkaXN0YW5jZSkpO1xuICAgICAgICBjb25zdCBwb3MgPSBbcC54LCBwLnksIHAuel07XG5cbiAgICAgICAgbGV0IG1heFIgPSB0aGlzLmNvbmZpZy5SQURJVVNfTUFYO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG1heFIgPSBtaW4obWF4UiwgKG1hZyhzdWIob2JqLnBvcywgcG9zKSkgLSBvYmoucikgLyAxLjUpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbSA9IHJhbmRvbSh0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICBjb25zdCByID0gcmFuZG9tKHRoaXMuY29uZmlnLlJBRElVU19NSU4sIG1heFIpO1xuICAgICAgICBjb25zdCB2ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApLCByYW5kb20oLTE4MCwgMTgwKSk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcmFuZENvbG9yKCk7XG4gICAgICAgIGNvbnN0IHRhZyA9IGBzcGhlcmUkeysrdGhpcy5sYXN0T2JqTm99YDtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IFNwaGVyZSh0aGlzLmNvbmZpZywgbSwgciwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgb2JqLnNob3dDb250cm9sQm94KHgsIHkpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGNyZWF0ZU9iamVjdCh0YWcsIHBvcywgciwgbSwgdiwgY29sb3IpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IFNwaGVyZSh0aGlzLmNvbmZpZywgbSwgciwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGRvdChnZXRaUm90YXRpb25NYXRyaXgoYW5nbGVzWzBdLCBkaXIpLCBnZXRZUm90YXRpb25NYXRyaXgoYW5nbGVzWzFdLCBkaXIpLCBkaXIpO1xuICAgIH1cblxuICAgIGdldFBpdm90QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgfVxuXG4gICAgb25Nb3VzZU1vdmUoZSkge1xuICAgIH1cblxuICAgIG9uTW91c2VEb3duKGUpIHtcbiAgICB9XG5cbiAgICBvbk1vdXNlVXAoZSkge1xuICAgIH1cblxuICAgIHVwZGF0ZVBvc2l0aW9uKCkge1xuICAgICAgICBzdXBlci51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgICB0aGlzLmNvbnRyb2xzLnBvc2l0aW9uMCA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKCk7XG4gICAgICAgIHRoaXMuY29udHJvbHMucmVzZXQoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5naW5lM0Q7IiwiY29uc3QgRW5naW5lMkQgPSByZXF1aXJlKCcuL2VuZ2luZS8yZCcpO1xuY29uc3QgRW5naW5lM0QgPSByZXF1aXJlKCcuL2VuZ2luZS8zZCcpO1xuY29uc3Qge2dldERpc3RhbmNlfSA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5cbmxldCBjb25maWcgPSBudWxsO1xuY29uc3Qga2V5bWFwID0ge1xuICAgIDM4OiAndXAnLFxuICAgIDQwOiAnZG93bicsXG4gICAgMzc6ICdsZWZ0JyxcbiAgICAzOTogJ3JpZ2h0JyxcbiAgICA5MDogJ3pvb21JbicsIC8vIHpcbiAgICA4ODogJ3pvb21PdXQnLCAvLyB4XG59O1xuY29uc3QgJHJlbmRlcmVyV3JhcHBlciA9ICQoJy5yZW5kZXJlci13cmFwcGVyJyk7XG5cbmZ1bmN0aW9uIG9uUmVzaXplKGUsIGVuZ2luZSkge1xuICAgIGNvbmZpZy5XID0gJHJlbmRlcmVyV3JhcHBlci53aWR0aCgpO1xuICAgIGNvbmZpZy5IID0gJHJlbmRlcmVyV3JhcHBlci5oZWlnaHQoKTtcbiAgICBpZiAoZW5naW5lKSBlbmdpbmUucmVzaXplKCk7XG59XG5cbmNvbnN0IHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcbmNvbnN0IG1vdXNlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbmZ1bmN0aW9uIG9uQ2xpY2soZSwgZW5naW5lKSB7XG4gICAgY29uc3QgeCA9IGUucGFnZVg7XG4gICAgY29uc3QgeSA9IGUucGFnZVk7XG4gICAgaWYgKCFlbmdpbmUuYW5pbWF0aW5nKSB7XG4gICAgICAgIG1vdXNlLnggPSAoeCAvIGNvbmZpZy5XKSAqIDIgLSAxO1xuICAgICAgICBtb3VzZS55ID0gLSh5IC8gY29uZmlnLkgpICogMiArIDE7XG4gICAgICAgIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKG1vdXNlLCBlbmdpbmUuY2FtZXJhKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIHZhciBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdChvYmoub2JqZWN0KTtcbiAgICAgICAgICAgIGlmIChpbnRlcnNlY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZW5naW5lLnVzZXJDcmVhdGVPYmplY3QoeCwgeSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbktleURvd24oZSwgZW5naW5lKSB7XG4gICAgY29uc3Qge2tleUNvZGV9ID0gZTtcbiAgICBpZiAoa2V5Q29kZSA9PSAzMikgeyAvLyBzcGFjZSBiYXJcbiAgICAgICAgZW5naW5lLmRlc3Ryb3lDb250cm9sQm94ZXMoKTtcbiAgICAgICAgZW5naW5lLnRvZ2dsZUFuaW1hdGluZygpO1xuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSBpbiBrZXltYXAgJiYga2V5bWFwW2tleUNvZGVdIGluIGVuZ2luZSkge1xuICAgICAgICBlbmdpbmVba2V5bWFwW2tleUNvZGVdXShrZXlDb2RlKTtcbiAgICB9XG59XG5cbmNsYXNzIFNpbXVsYXRvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICAgICAgICAkcmVuZGVyZXJXcmFwcGVyLmFwcGVuZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICAgICAgICAkKHdpbmRvdykucmVzaXplKGUgPT4ge1xuICAgICAgICAgICAgb25SZXNpemUoZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpLmNvbnRleHRtZW51KGUgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUub25Nb3VzZVVwKGUpO1xuICAgICAgICAgICAgb25DbGljayhlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCdib2R5Jykua2V5ZG93bihlID0+IHtcbiAgICAgICAgICAgIG9uS2V5RG93bihlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkcmVuZGVyZXJXcmFwcGVyLm1vdXNlZG93bihlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLm9uTW91c2VEb3duKGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJHJlbmRlcmVyV3JhcHBlci5tb3VzZW1vdmUoZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5vbk1vdXNlTW92ZShlKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRyZW5kZXJlcldyYXBwZXIubW91c2V1cChlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLm9uTW91c2VVcChlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdChwcmVzZXQpIHtcbiAgICAgICAgaWYgKHRoaXMuZW5naW5lKSB0aGlzLmVuZ2luZS5kZXN0cm95KCk7XG4gICAgICAgIGNvbmZpZyA9IHByZXNldCh7fSk7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gY29uZmlnLlRJVExFID0gcHJlc2V0LnByb3RvdHlwZS50aXRsZTtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBuZXcgKGNvbmZpZy5ESU1FTlNJT04gPT0gMiA/IEVuZ2luZTJEIDogRW5naW5lM0QpKGNvbmZpZywgdGhpcy5yZW5kZXJlcik7XG4gICAgICAgIG9uUmVzaXplKG51bGwsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgaWYgKCdpbml0JyBpbiBjb25maWcpIGNvbmZpZy5pbml0KHRoaXMuZW5naW5lKTtcbiAgICAgICAgdGhpcy5lbmdpbmUuYW5pbWF0ZSgpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW11bGF0b3I7IiwiZnVuY3Rpb24gaXRlcihhLCBmdW5jKSB7XG4gICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgY29uc3QgbSA9IG5ldyBBcnJheShhX3IpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgbVtpXSA9IGZ1bmMoaSk7XG4gICAgfVxuICAgIHJldHVybiBtO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB6ZXJvczogTiA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXkoTikuZmlsbCgwKTtcbiAgICB9LFxuXG4gICAgbWFnOiBhID0+IHtcbiAgICAgICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfcjsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gYVtpXSAqIGFbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChzdW0pO1xuICAgIH0sXG5cbiAgICBhZGQ6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gKyBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc3ViOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldIC0gYltpXTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG11bDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAqIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkaXY6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLyBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZG90OiAoYSwgYiwgZGlyID0gMSkgPT4ge1xuICAgICAgICBpZiAoZGlyID09IC0xKSB7XG4gICAgICAgICAgICBbYSwgYl0gPSBbYiwgYV07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGFfYyA9IGFbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBiX2MgPSBiWzBdLmxlbmd0aDtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBBcnJheShhX3IpO1xuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IGFfcjsgcisrKSB7XG4gICAgICAgICAgICBtW3JdID0gbmV3IEFycmF5KGJfYyk7XG4gICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGJfYzsgYysrKSB7XG4gICAgICAgICAgICAgICAgbVtyXVtjXSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX2M7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBtW3JdW2NdICs9IGFbcl1baV0gKiBiW2ldW2NdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG59OyIsImNvbnN0IENvbnRyb2xCb3ggPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xfYm94Jyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7cmFkMmRlZywgZGVnMnJhZCwgcG9sYXIyY2FydGVzaWFuLCBjYXJ0ZXNpYW4yYXV0bywgc3F1YXJlfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXZ9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWF4LCBQSX0gPSBNYXRoO1xuXG5cbmNsYXNzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogUG9sYXIgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2xhcl9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldlBvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZU9iamVjdCgpO1xuICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBudWxsO1xuICAgICAgICB0aGlzLnBhdGggPSBudWxsO1xuICAgICAgICB0aGlzLnBhdGhWZXJ0aWNlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhdGhNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgICAgICBjb2xvcjogMHhmZmZmZmZcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KCkge1xuICAgICAgICBpZiAodGhpcy5vYmplY3QpIHRoaXMuZW5naW5lLnNjZW5lLnJlbW92ZSh0aGlzLm9iamVjdCk7XG4gICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuciwgMzIsIDMyKTtcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiB0aGlzLmNvbG9yfSk7XG4gICAgICAgIGNvbnN0IG9iamVjdCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgICAgIG9iamVjdC5tYXRyaXhBdXRvVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZW5naW5lLnNjZW5lLmFkZChvYmplY3QpO1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cblxuICAgIGNhbGN1bGF0ZVZlbG9jaXR5KCkge1xuICAgICAgICBsZXQgRiA9IHplcm9zKHRoaXMuY29uZmlnLkRJTUVOU0lPTik7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIGlmIChvYmogPT0gdGhpcykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCB2ZWN0b3IgPSBzdWIodGhpcy5wb3MsIG9iai5wb3MpO1xuICAgICAgICAgICAgY29uc3QgbWFnbml0dWRlID0gbWFnKHZlY3Rvcik7XG4gICAgICAgICAgICBjb25zdCB1bml0VmVjdG9yID0gZGl2KHZlY3RvciwgbWFnbml0dWRlKTtcbiAgICAgICAgICAgIEYgPSBhZGQoRiwgbXVsKHVuaXRWZWN0b3IsIG9iai5tIC8gc3F1YXJlKG1hZ25pdHVkZSkpKVxuICAgICAgICB9XG4gICAgICAgIEYgPSBtdWwoRiwgLXRoaXMuY29uZmlnLkcgKiB0aGlzLm0pO1xuICAgICAgICBjb25zdCBhID0gZGl2KEYsIHRoaXMubSk7XG4gICAgICAgIHRoaXMudiA9IGFkZCh0aGlzLnYsIGEpO1xuICAgIH1cblxuICAgIGNhbGN1bGF0ZVBvc2l0aW9uKCkge1xuICAgICAgICB0aGlzLnBvcyA9IGFkZCh0aGlzLnBvcywgdGhpcy52KTtcbiAgICAgICAgaWYgKG1hZyhzdWIodGhpcy5wb3MsIHRoaXMucHJldlBvcykpID4gMSkge1xuICAgICAgICAgICAgdGhpcy5wcmV2UG9zID0gdGhpcy5wb3Muc2xpY2UoKTtcbiAgICAgICAgICAgIHRoaXMucGF0aFZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjModGhpcy5wb3NbMF0sIHRoaXMucG9zWzFdLCB0aGlzLnBvc1syXSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5vYmplY3QucG9zaXRpb24ueCA9IHRoaXMucG9zWzBdO1xuICAgICAgICB0aGlzLm9iamVjdC5wb3NpdGlvbi55ID0gdGhpcy5wb3NbMV07XG4gICAgICAgIHRoaXMub2JqZWN0LnVwZGF0ZU1hdHJpeCgpO1xuICAgICAgICBpZiAodGhpcy5wYXRoKSB0aGlzLmVuZ2luZS5zY2VuZS5yZW1vdmUodGhpcy5wYXRoKTtcbiAgICAgICAgY29uc3QgcGF0aEdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG4gICAgICAgIHBhdGhHZW9tZXRyeS52ZXJ0aWNlcyA9IHRoaXMucGF0aFZlcnRpY2VzO1xuICAgICAgICB0aGlzLnBhdGggPSBuZXcgVEhSRUUuTGluZShwYXRoR2VvbWV0cnksIHRoaXMucGF0aE1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5lbmdpbmUuc2NlbmUuYWRkKHRoaXMucGF0aCk7XG4gICAgfVxuXG4gICAgY29udHJvbE0oZSkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZU9iamVjdCgpO1xuICAgIH1cblxuICAgIGNvbnRyb2xSKGUpIHtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuckNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMuciA9IHI7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gdGhpcy5jcmVhdGVPYmplY3QoKTtcbiAgICB9XG5cbiAgICBjb250cm9sUG9zKGUpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zWENvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc1lDb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5XTtcbiAgICB9XG5cbiAgICBjb250cm9sVihlKSB7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudlJob0NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52UGhpQ29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIHRoaXMudiA9IHBvbGFyMmNhcnRlc2lhbihyaG8sIHBoaSk7XG4gICAgfVxuXG4gICAgc2hvd0NvbnRyb2xCb3goeCwgeSkge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sQm94ICYmIHRoaXMuY29udHJvbEJveC5pc09wZW4oKSkge1xuICAgICAgICAgICAgY29uc3QgJGNvbnRyb2xCb3ggPSB0aGlzLmNvbnRyb2xCb3guJGNvbnRyb2xCb3g7XG4gICAgICAgICAgICAkY29udHJvbEJveC5jc3MoJ2xlZnQnLCB4ICsgJ3B4Jyk7XG4gICAgICAgICAgICAkY29udHJvbEJveC5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcbiAgICAgICAgICAgICRjb250cm9sQm94Lm5leHRVbnRpbCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuaW5zZXJ0QmVmb3JlKCRjb250cm9sQm94KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpbiA9IDEuNTtcblxuICAgICAgICAgICAgdmFyIHBvc1JhbmdlID0gbWF4KG1heCh0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKSAvIDIsIG1heC5hcHBseShudWxsLCB0aGlzLnBvcy5tYXAoTWF0aC5hYnMpKSAqIG1hcmdpbik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICAgICAgcG9zUmFuZ2UgPSBtYXgocG9zUmFuZ2UsIG1heC5hcHBseShudWxsLCBvYmoucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBjb25zdCB2ID0gY2FydGVzaWFuMmF1dG8odGhpcy52KTtcbiAgICAgICAgICAgIHZhciB2UmFuZ2UgPSBtYXgodGhpcy5jb25maWcuVkVMT0NJVFlfTUFYLCBtYWcodGhpcy52KSAqIG1hcmdpbik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICAgICAgdlJhbmdlID0gbWF4KHZSYW5nZSwgbWFnKG9iai52KSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0dXBfY29udHJvbGxlcnMocG9zUmFuZ2UsIHRoaXMubSwgdGhpcy5yLCB2LCB2UmFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sQm94ID0gbmV3IENvbnRyb2xCb3godGhpcywgdGhpcy50YWcsIHRoaXMuZ2V0Q29udHJvbGxlcnMoKSwgeCwgeSk7XG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5jb250cm9sQm94ZXMucHVzaCh0aGlzLmNvbnRyb2xCb3gpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zUmFuZ2UsIG0sIHIsIHYsIHZSYW5nZSkge1xuICAgICAgICB0aGlzLm1Db250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJNYXNzIG1cIiwgdGhpcy5jb25maWcuTUFTU19NSU4sIHRoaXMuY29uZmlnLk1BU1NfTUFYLCBtLCB0aGlzLmNvbnRyb2xNKTtcbiAgICAgICAgdGhpcy5yQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUmFkaXVzIHJcIiwgdGhpcy5jb25maWcuUkFESVVTX01JTiwgdGhpcy5jb25maWcuUkFESVVTX01BWCwgciwgdGhpcy5jb250cm9sUik7XG4gICAgICAgIHRoaXMucG9zWENvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHhcIiwgLXBvc1JhbmdlLCBwb3NSYW5nZSwgdGhpcy5wb3NbMF0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHlcIiwgLXBvc1JhbmdlLCBwb3NSYW5nZSwgdGhpcy5wb3NbMV0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMudlJob0NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM+BXCIsIDAsIHZSYW5nZSwgdlswXSwgdGhpcy5jb250cm9sVik7XG4gICAgICAgIHRoaXMudlBoaUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM+GXCIsIC0xODAsIDE4MCwgcmFkMmRlZyh2WzFdKSwgdGhpcy5jb250cm9sVik7XG4gICAgfVxuXG4gICAgZ2V0Q29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5yQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWENvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1lDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlBoaUNvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy5vYmplY3QpIHRoaXMuZW5naW5lLnNjZW5lLnJlbW92ZSh0aGlzLm9iamVjdCk7XG4gICAgICAgIGlmICh0aGlzLnBhdGgpIHRoaXMuZW5naW5lLnNjZW5lLnJlbW92ZSh0aGlzLnBhdGgpO1xuICAgICAgICBjb25zdCBpID0gdGhpcy5lbmdpbmUub2Jqcy5pbmRleE9mKHRoaXMpO1xuICAgICAgICB0aGlzLmVuZ2luZS5vYmpzLnNwbGljZShpLCAxKTtcbiAgICAgICAgaWYgKHRoaXMuY29udHJvbEJveCAmJiB0aGlzLmNvbnRyb2xCb3guaXNPcGVuKCkpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbEJveC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7J3RhZyc6IHRoaXMudGFnLCAndic6IHRoaXMudiwgJ3Bvcyc6IHRoaXMucG9zfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuL2NpcmNsZScpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHNwaGVyaWNhbDJjYXJ0ZXNpYW59ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge2N1YmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5cbmNsYXNzIFNwaGVyZSBleHRlbmRzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogU3BoZXJpY2FsIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3BoZXJpY2FsX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLm9iamVjdC5wb3NpdGlvbi56ID0gdGhpcy5wb3NbMl07XG4gICAgICAgIHN1cGVyLmRyYXcoKTtcbiAgICB9XG5cbiAgICBjb250cm9sUG9zKGUpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zWENvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc1lDb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB6ID0gdGhpcy5wb3NaQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBbeCwgeSwgel07XG4gICAgfVxuXG4gICAgY29udHJvbFYoZSkge1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudlBoaUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICBjb25zdCB0aGV0YSA9IGRlZzJyYWQodGhpcy52VGhldGFDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52UmhvQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy52ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyaG8sIHBoaSwgdGhldGEpO1xuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICBzdXBlci5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICB0aGlzLnBvc1pDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB6XCIsIC1wb3NfcmFuZ2UsIHBvc19yYW5nZSwgdGhpcy5wb3NbMl0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMudlRoZXRhQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgzrhcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMl0pLCB0aGlzLmNvbnRyb2xWKTtcbiAgICB9XG5cbiAgICBnZXRDb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnJDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1pDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlBoaUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZUaGV0YUNvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3BoZXJlOyIsImNvbnN0IHttYWcsIGRvdH0gPSByZXF1aXJlKCcuL21hdHJpeCcpO1xuXG5jb25zdCBVdGlsID0ge1xuICAgIHNxdWFyZTogKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIHggKiB4O1xuICAgIH0sXG5cbiAgICBjdWJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHggKiB4O1xuICAgIH0sXG5cbiAgICBwb2xhcjJjYXJ0ZXNpYW46IChyaG8sIHBoaSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHBoaSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnBvbGFyOiAoeCwgeSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbWFnKFt4LCB5XSksXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIHNwaGVyaWNhbDJjYXJ0ZXNpYW46IChyaG8sIHBoaSwgdGhldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLnNpbihwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5jb3ModGhldGEpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJzcGhlcmljYWw6ICh4LCB5LCB6KSA9PiB7XG4gICAgICAgIGNvbnN0IHJobyA9IG1hZyhbeCwgeSwgel0pO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvLFxuICAgICAgICAgICAgTWF0aC5hdGFuMih5LCB4KSxcbiAgICAgICAgICAgIHJobyAhPSAwID8gTWF0aC5hY29zKHogLyByaG8pIDogMFxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4yYXV0bzogKHZlY3RvcikgPT4ge1xuICAgICAgICByZXR1cm4gdmVjdG9yLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICA/IFV0aWwuY2FydGVzaWFuMnBvbGFyKHZlY3RvclswXSwgdmVjdG9yWzFdKVxuICAgICAgICAgICAgOiBVdGlsLmNhcnRlc2lhbjJzcGhlcmljYWwodmVjdG9yWzBdLCB2ZWN0b3JbMV0sIHZlY3RvclsyXSk7XG4gICAgfSxcblxuICAgIHJhZDJkZWc6IChyYWQpID0+IHtcbiAgICAgICAgcmV0dXJuIHJhZCAvIE1hdGguUEkgKiAxODA7XG4gICAgfSxcblxuICAgIGRlZzJyYWQ6IChkZWcpID0+IHtcbiAgICAgICAgcmV0dXJuIGRlZyAvIDE4MCAqIE1hdGguUEk7XG4gICAgfSxcblxuICAgIGdldERpc3RhbmNlOiAoeDAsIHkwLCB4MSwgeTEpID0+IHtcbiAgICAgICAgcmV0dXJuIG1hZyhbeDEgLSB4MCwgeTEgLSB5MF0pO1xuICAgIH0sXG5cbiAgICByb3RhdGU6ICh2ZWN0b3IsIG1hdHJpeCkgPT4ge1xuICAgICAgICByZXR1cm4gZG90KFt2ZWN0b3JdLCBtYXRyaXgpWzBdO1xuICAgIH0sXG5cbiAgICBub3c6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICB9LFxuXG4gICAgcmFuZG9tOiAobWluLCBtYXggPSBudWxsKSA9PiB7XG4gICAgICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4ID0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuICAgIH0sXG5cbiAgICByYW5kQ29sb3I6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZjtcbiAgICB9LFxuXG4gICAgZ2V0Um90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIC1zaW5dLFxuICAgICAgICAgICAgW3NpbiwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRYUm90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFsxLCAwLCAwXSxcbiAgICAgICAgICAgIFswLCBjb3MsIC1zaW5dLFxuICAgICAgICAgICAgWzAsIHNpbiwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRZUm90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIDAsIHNpbl0sXG4gICAgICAgICAgICBbMCwgMSwgMF0sXG4gICAgICAgICAgICBbLXNpbiwgMCwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRaUm90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIC1zaW4sIDBdLFxuICAgICAgICAgICAgW3NpbiwgY29zLCAwXSxcbiAgICAgICAgICAgIFswLCAwLCAxXVxuICAgICAgICBdO1xuICAgIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWw7Il19

//# sourceMappingURL=gravity_simulator.js.map
