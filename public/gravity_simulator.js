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
        RADIUS_MIN: 1,
        RADIUS_MAX: 2e2,
        VELOCITY_MAX: 10
    });
}
EMPTY_3D.prototype.title = '3D Gravity Simulator';

function MANUAL_2D(c) {
    return extend(true, EMPTY_2D(c), {
        INPUT_TYPE: 'number'
    });
}
MANUAL_2D.prototype.title = '2D Manual';

function MANUAL_3D(c) {
    return extend(true, EMPTY_3D(c), {
        INPUT_TYPE: 'number'
    });
}
MANUAL_3D.prototype.title = '3D Manual';

function ORBITING(c) {
    return extend(true, EMPTY_3D(c), {
        init: function init(engine) {
            engine.createObject('Sun', [0, 0, 0], 1000000, 100, [0, 0, 0], 'blue');
            engine.createObject('Mercury', [180, 0, 0], 1, 20, [0, 2.4, 0], 'red');
            engine.createObject('Venus', [240, 0, 0], 1, 20, [0, 2.1, 0], 'yellow');
            engine.createObject('Earth', [300, 0, 0], 1, 20, [0, 1.9, 0], 'green');
            engine.toggleAnimating();
        }
    });
}
ORBITING.prototype.title = 'Orbiting';

function COLLISION(c) {
    return extend(true, EMPTY_3D(c), {
        init: function init(engine) {
            engine.createObject('Ball A', [-100, 0, 0], 100000, 50, [.5, .5, 0], 'blue');
            engine.createObject('Ball B', [100, 0, 0], 100000, 50, [-.5, -.5, 0], 'red');
            engine.createObject('Ball C', [0, 100, 0], 100000, 50, [0, 0, 0], 'green');
            engine.toggleAnimating();
        }
    });
}
COLLISION.prototype.title = 'Elastic Collision';

module.exports = [EMPTY_2D, EMPTY_3D, MANUAL_2D, MANUAL_3D, ORBITING, COLLISION];

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

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.15;
        this.controls.enableRotate = false;
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

            this.controls.update();
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

        _this.controls.enableRotate = true;
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
        value: function createObject(tag, pos, m, r, v, color) {
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
        $(this.renderer.domElement).dblclick(function (e) {
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
        key: 'getGeometry',
        value: function getGeometry() {
            return new THREE.CircleGeometry(this.r, 32);
        }
    }, {
        key: 'createObject',
        value: function createObject() {
            if (this.object) this.engine.scene.remove(this.object);
            var geometry = this.getGeometry();
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
        key: 'getGeometry',

        /**
         * Spherical coordinate system
         * https://en.wikipedia.org/wiki/Spherical_coordinate_system
         */

        value: function getGeometry() {
            return new THREE.SphereGeometry(this.r, 32, 32);
        }
    }, {
        key: 'draw',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jb250cm9sL2NvbnRyb2xfYm94LmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbGxlci5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvMmQuanMiLCJqcy9zaW11bGF0b3IvZW5naW5lLzNkLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLElBQU0sWUFBWSxRQUFRLGFBQVIsQ0FBbEI7O0FBRUEsSUFBTSxZQUFZLElBQUksU0FBSixFQUFsQjtBQUNBLElBQUksV0FBVyxDQUFmO0FBQ0EsVUFBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLEtBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3JDLFFBQU0sU0FBUyxRQUFRLENBQVIsQ0FBZjtBQUNBLFlBQVEsTUFBUixxQkFBaUMsQ0FBakMsVUFBc0MsS0FBSyxRQUFMLEdBQWdCLFdBQWhCLEdBQThCLEVBQXBFLFVBQTBFLE9BQU8sU0FBUCxDQUFpQixLQUEzRjtBQUNIO0FBQ0QsUUFBUSxNQUFSLENBQWUsWUFBTTtBQUNqQixlQUFXLFNBQVMsUUFBUSxJQUFSLENBQWEsV0FBYixFQUEwQixHQUExQixFQUFULENBQVg7QUFDQSxjQUFVLElBQVYsQ0FBZSxRQUFRLFFBQVIsQ0FBZjtBQUNILENBSEQ7QUFJ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QUFPLENBQ0gsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FERyxFQUVILENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxDQUFDLEdBQVYsQ0FGRyxFQUdILENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxHQUFULENBSEcsQ0FBUDtBQUtILEtBL0ZROztBQWlHVCx3QkFBb0IsNEJBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNoQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLEdBQVQsQ0FERyxFQUVILENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRkcsRUFHSCxDQUFDLENBQUMsR0FBRixFQUFPLENBQVAsRUFBVSxHQUFWLENBSEcsQ0FBUDtBQUtILEtBekdROztBQTJHVCx3QkFBb0IsNEJBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNoQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBQyxHQUFQLEVBQVksQ0FBWixDQURHLEVBRUgsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0FGRyxFQUdILENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSEcsQ0FBUDtBQUtIO0FBbkhRLENBQWI7O0FBc0hBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBwcmVzZXRzID0gcmVxdWlyZSgnLi9wcmVzZXQnKTtcbmNvbnN0IFNpbXVsYXRvciA9IHJlcXVpcmUoJy4vc2ltdWxhdG9yJyk7XG5cbmNvbnN0IHNpbXVsYXRvciA9IG5ldyBTaW11bGF0b3IoKTtcbmxldCBzZWxlY3RlZCA9IDA7XG5zaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG5cbmNvbnN0ICRzZWxlY3QgPSAkKCdzZWxlY3QnKTtcbmZvciAobGV0IGkgPSAwOyBpIDwgcHJlc2V0cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHByZXNldCA9IHByZXNldHNbaV07XG4gICAgJHNlbGVjdC5hcHBlbmQoYDxvcHRpb24gdmFsdWU9XCIke2l9XCIke2kgPT0gc2VsZWN0ZWQgPyAnIHNlbGVjdGVkJyA6ICcnfT4ke3ByZXNldC5wcm90b3R5cGUudGl0bGV9PC9vcHRpb24+YCk7XG59XG4kc2VsZWN0LmNoYW5nZSgoKSA9PiB7XG4gICAgc2VsZWN0ZWQgPSBwYXJzZUludCgkc2VsZWN0LmZpbmQoJzpzZWxlY3RlZCcpLnZhbCgpKTtcbiAgICBzaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG59KTtcbiRzZWxlY3QuZm9jdXMoKCkgPT4ge1xuICAgICRzZWxlY3QuYmx1cigpO1xufSk7XG4kKCcjcmVzZXQnKS5jbGljaygoKSA9PiB7XG4gICAgc2ltdWxhdG9yLmluaXQocHJlc2V0c1tzZWxlY3RlZF0pO1xufSk7XG5cblxubGV0ICRtb3ZpbmcgPSBudWxsO1xubGV0IHB4LCBweTtcblxuJCgnYm9keScpLm9uKCdtb3VzZWRvd24nLCAnLmNvbnRyb2wtYm94IC50aXRsZS1iYXInLCBmdW5jdGlvbiAoZSkge1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG4gICAgJG1vdmluZyA9ICQodGhpcykucGFyZW50KCcuY29udHJvbC1ib3gnKTtcbiAgICAkbW92aW5nLm5leHRVbnRpbCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuaW5zZXJ0QmVmb3JlKCRtb3ZpbmcpO1xuICAgIHJldHVybiBmYWxzZTtcbn0pO1xuXG4kKCdib2R5JykubW91c2Vtb3ZlKGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCEkbW92aW5nKSByZXR1cm47XG4gICAgY29uc3QgeCA9IGUucGFnZVg7XG4gICAgY29uc3QgeSA9IGUucGFnZVk7XG4gICAgJG1vdmluZy5jc3MoJ2xlZnQnLCBwYXJzZUludCgkbW92aW5nLmNzcygnbGVmdCcpKSArICh4IC0gcHgpICsgJ3B4Jyk7XG4gICAgJG1vdmluZy5jc3MoJ3RvcCcsIHBhcnNlSW50KCRtb3ZpbmcuY3NzKCd0b3AnKSkgKyAoeSAtIHB5KSArICdweCcpO1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG59KTtcblxuJCgnYm9keScpLm1vdXNldXAoZnVuY3Rpb24gKGUpIHtcbiAgICAkbW92aW5nID0gbnVsbDtcbn0pOyIsImNvbnN0IHtleHRlbmR9ID0gJDtcblxuXG5mdW5jdGlvbiBFTVBUWV8yRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBjLCB7XG4gICAgICAgIEJBQ0tHUk9VTkQ6ICd3aGl0ZScsXG4gICAgICAgIERJTUVOU0lPTjogMixcbiAgICAgICAgTUFYX1BBVEhTOiAxMDAwLFxuICAgICAgICBDQU1FUkFfQ09PUkRfU1RFUDogNSxcbiAgICAgICAgQ0FNRVJBX0FOR0xFX1NURVA6IDEsXG4gICAgICAgIENBTUVSQV9BQ0NFTEVSQVRJT046IDEuMSxcbiAgICAgICAgRzogMC4xLFxuICAgICAgICBNQVNTX01JTjogMSxcbiAgICAgICAgTUFTU19NQVg6IDRlNCxcbiAgICAgICAgUkFESVVTX01JTjogMSxcbiAgICAgICAgUkFESVVTX01BWDogMmUyLFxuICAgICAgICBWRUxPQ0lUWV9NQVg6IDEwLFxuICAgICAgICBESVJFQ1RJT05fTEVOR1RIOiA1MCxcbiAgICAgICAgQ0FNRVJBX0RJU1RBTkNFOiAxMDAsXG4gICAgICAgIElOUFVUX1RZUEU6ICdyYW5nZSdcbiAgICB9KTtcbn1cbkVNUFRZXzJELnByb3RvdHlwZS50aXRsZSA9ICcyRCBHcmF2aXR5IFNpbXVsYXRvcic7XG5cblxuZnVuY3Rpb24gRU1QVFlfM0QoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfMkQoYyksIHtcbiAgICAgICAgRElNRU5TSU9OOiAzLFxuICAgICAgICBHOiAwLjAwMSxcbiAgICAgICAgTUFTU19NSU46IDEsXG4gICAgICAgIE1BU1NfTUFYOiA4ZTYsXG4gICAgICAgIFJBRElVU19NSU46IDEsXG4gICAgICAgIFJBRElVU19NQVg6IDJlMixcbiAgICAgICAgVkVMT0NJVFlfTUFYOiAxMFxuICAgIH0pO1xufVxuRU1QVFlfM0QucHJvdG90eXBlLnRpdGxlID0gJzNEIEdyYXZpdHkgU2ltdWxhdG9yJztcblxuZnVuY3Rpb24gTUFOVUFMXzJEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzJEKGMpLCB7XG4gICAgICAgIElOUFVUX1RZUEU6ICdudW1iZXInXG4gICAgfSk7XG59XG5NQU5VQUxfMkQucHJvdG90eXBlLnRpdGxlID0gJzJEIE1hbnVhbCc7XG5cbmZ1bmN0aW9uIE1BTlVBTF8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBJTlBVVF9UWVBFOiAnbnVtYmVyJ1xuICAgIH0pO1xufVxuTUFOVUFMXzNELnByb3RvdHlwZS50aXRsZSA9ICczRCBNYW51YWwnO1xuXG5mdW5jdGlvbiBPUkJJVElORyhjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBpbml0OiAoZW5naW5lKSA9PiB7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdTdW4nLCBbMCwgMCwgMF0sIDEwMDAwMDAsIDEwMCwgWzAsIDAsIDBdLCAnYmx1ZScpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnTWVyY3VyeScsIFsxODAsIDAsIDBdLCAxLCAyMCwgWzAsIDIuNCwgMF0sICdyZWQnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ1ZlbnVzJywgWzI0MCwgMCwgMF0sIDEsIDIwLCBbMCwgMi4xLCAwXSwgJ3llbGxvdycpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnRWFydGgnLCBbMzAwLCAwLCAwXSwgMSwgMjAsIFswLCAxLjksIDBdLCAnZ3JlZW4nKTtcbiAgICAgICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuT1JCSVRJTkcucHJvdG90eXBlLnRpdGxlID0gJ09yYml0aW5nJztcblxuZnVuY3Rpb24gQ09MTElTSU9OKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzNEKGMpLCB7XG4gICAgICAgIGluaXQ6IChlbmdpbmUpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ0JhbGwgQScsIFstMTAwLCAwLCAwXSwgMTAwMDAwLCA1MCwgWy41LCAuNSwgMF0sICdibHVlJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdCYWxsIEInLCBbMTAwLCAwLCAwXSwgMTAwMDAwLCA1MCwgWy0uNSwgLS41LCAwXSwgJ3JlZCcpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnQmFsbCBDJywgWzAsIDEwMCwgMF0sIDEwMDAwMCwgNTAsIFswLCAwLCAwXSwgJ2dyZWVuJyk7XG4gICAgICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbkNPTExJU0lPTi5wcm90b3R5cGUudGl0bGUgPSAnRWxhc3RpYyBDb2xsaXNpb24nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtFTVBUWV8yRCwgRU1QVFlfM0QsIE1BTlVBTF8yRCwgTUFOVUFMXzNELCBPUkJJVElORywgQ09MTElTSU9OXTsiLCJjbGFzcyBDb250cm9sQm94IHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIHRpdGxlLCBjb250cm9sbGVycywgeCwgeSkge1xuICAgICAgICBjb25zdCAkdGVtcGxhdGVDb250cm9sQm94ID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJyk7XG4gICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gJHRlbXBsYXRlQ29udHJvbEJveC5jbG9uZSgpO1xuICAgICAgICAkY29udHJvbEJveC5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnRpdGxlJykudGV4dCh0aXRsZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dENvbnRhaW5lciA9ICRjb250cm9sQm94LmZpbmQoJy5pbnB1dC1jb250YWluZXInKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sbGVyIG9mIGNvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgICAkaW5wdXRDb250YWluZXIuYXBwZW5kKGNvbnRyb2xsZXIuJGlucHV0V3JhcHBlcik7XG4gICAgICAgIH1cbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLmNsb3NlJykuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY29udHJvbEJveC5maW5kKCcucmVtb3ZlJykuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgb2JqZWN0LmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRjb250cm9sQm94Lmluc2VydEJlZm9yZSgkdGVtcGxhdGVDb250cm9sQm94KTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCdsZWZ0JywgeCArICdweCcpO1xuICAgICAgICAkY29udHJvbEJveC5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcblxuICAgICAgICB0aGlzLiRjb250cm9sQm94ID0gJGNvbnRyb2xCb3g7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgaXNPcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kY29udHJvbEJveFswXS5wYXJlbnROb2RlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sQm94OyIsImNsYXNzIENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgbmFtZSwgbWluLCBtYXgsIHZhbHVlLCBmdW5jKSB7XG4gICAgICAgIGNvbnN0ICRpbnB1dFdyYXBwZXIgPSB0aGlzLiRpbnB1dFdyYXBwZXIgPSAkKCcuY29udHJvbC1ib3gudGVtcGxhdGUgLmlucHV0LXdyYXBwZXIudGVtcGxhdGUnKS5jbG9uZSgpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLmZpbmQoJy5uYW1lJykudGV4dChuYW1lKTtcbiAgICAgICAgY29uc3QgJGlucHV0ID0gdGhpcy4kaW5wdXQgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd0eXBlJywgb2JqZWN0LmNvbmZpZy5JTlBVVF9UWVBFKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21pbicsIG1pbik7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtYXgnLCBtYXgpO1xuICAgICAgICAkaW5wdXQuYXR0cigndmFsdWUnLCB2YWx1ZSk7XG4gICAgICAgICRpbnB1dC5hdHRyKCdzdGVwJywgMC4wMSk7XG4gICAgICAgIGNvbnN0ICR2YWx1ZSA9ICRpbnB1dFdyYXBwZXIuZmluZCgnLnZhbHVlJyk7XG4gICAgICAgICR2YWx1ZS50ZXh0KHRoaXMuZ2V0KCkpO1xuICAgICAgICAkaW5wdXQub24oJ2lucHV0JywgZSA9PiB7XG4gICAgICAgICAgICAkdmFsdWUudGV4dCh0aGlzLmdldCgpKTtcbiAgICAgICAgICAgIGZ1bmMuY2FsbChvYmplY3QsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuJGlucHV0LnZhbCgpKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuLi9vYmplY3QvY2lyY2xlJyk7XG5jb25zdCB7cm90YXRlLCBub3csIHJhbmRvbSwgcG9sYXIyY2FydGVzaWFuLCByYW5kQ29sb3IsIGdldFJvdGF0aW9uTWF0cml4LCBjYXJ0ZXNpYW4yYXV0b30gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWJ9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWluLCBQSSwgYXRhbjIsIHBvd30gPSBNYXRoO1xuXG5jbGFzcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCByZW5kZXJlcikge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5vYmpzID0gW107XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW107XG4gICAgICAgIHRoaXMuZnBzTGFzdFRpbWUgPSBub3coKTtcbiAgICAgICAgdGhpcy5mcHNDb3VudCA9IDA7XG4gICAgICAgIHRoaXMubGFzdE9iak5vID0gMDtcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCBjb25maWcuVyAvIGNvbmZpZy5ILCAwLjEsIDFlNSk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSA1MDA7XG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdCh0aGlzLnNjZW5lLnBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHModGhpcy5jYW1lcmEsIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZW5hYmxlRGFtcGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZGFtcGluZ0ZhY3RvciA9IDAuMTU7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZW5hYmxlUm90YXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdG9nZ2xlQW5pbWF0aW5nKCkge1xuICAgICAgICB0aGlzLmFuaW1hdGluZyA9ICF0aGlzLmFuaW1hdGluZztcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBgJHt0aGlzLmNvbmZpZy5USVRMRX0gKCR7dGhpcy5hbmltYXRpbmcgPyBcIlNpbXVsYXRpbmdcIiA6IFwiUGF1c2VkXCJ9KWA7XG4gICAgfVxuXG4gICAgZGVzdHJveUNvbnRyb2xCb3hlcygpIHtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sQm94IG9mIHRoaXMuY29udHJvbEJveGVzKSB7XG4gICAgICAgICAgICBjb250cm9sQm94LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250cm9sQm94ZXMgPSBbXVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmRlc3Ryb3lDb250cm9sQm94ZXMoKTtcbiAgICB9XG5cbiAgICBhbmltYXRlKCkge1xuICAgICAgICBpZiAoIXRoaXMucmVuZGVyZXIpIHJldHVybjtcbiAgICAgICAgdGhpcy5wcmludEZwcygpO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlQWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWRyYXdBbGwoKTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICB1c2VyQ3JlYXRlT2JqZWN0KHgsIHkpIHtcbiAgICAgICAgY29uc3QgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICAgICAgdmVjdG9yLnNldCgoeCAvIHRoaXMuY29uZmlnLlcpICogMiAtIDEsIC0oeSAvIHRoaXMuY29uZmlnLkgpICogMiArIDEsIDAuNSk7XG4gICAgICAgIHZlY3Rvci51bnByb2plY3QodGhpcy5jYW1lcmEpO1xuICAgICAgICBjb25zdCBkaXIgPSB2ZWN0b3Iuc3ViKHRoaXMuY2FtZXJhLnBvc2l0aW9uKS5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSAtdGhpcy5jYW1lcmEucG9zaXRpb24ueiAvIGRpci56O1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKCkuYWRkKGRpci5tdWx0aXBseVNjYWxhcihkaXN0YW5jZSkpO1xuICAgICAgICBjb25zdCBwb3MgPSBbcG9zaXRpb24ueCwgcG9zaXRpb24ueV07XG5cbiAgICAgICAgbGV0IG1heFIgPSB0aGlzLmNvbmZpZy5SQURJVVNfTUFYO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG1heFIgPSBtaW4obWF4UiwgKG1hZyhzdWIob2JqLnBvcywgcG9zKSkgLSBvYmoucikgLyAxLjUpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbSA9IHJhbmRvbSh0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICBjb25zdCByID0gcmFuZG9tKHRoaXMuY29uZmlnLlJBRElVU19NSU4sIG1heFIpO1xuICAgICAgICBjb25zdCB2ID0gcG9sYXIyY2FydGVzaWFuKHJhbmRvbSh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVggLyAyKSwgcmFuZG9tKC0xODAsIDE4MCkpO1xuICAgICAgICBjb25zdCBjb2xvciA9IHJhbmRDb2xvcigpO1xuICAgICAgICBjb25zdCB0YWcgPSBgY2lyY2xlJHsrK3RoaXMubGFzdE9iak5vfWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBDaXJjbGUodGhpcy5jb25maWcsIG0sIHIsIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIG9iai5zaG93Q29udHJvbEJveCh4LCB5KTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBjcmVhdGVPYmplY3QodGFnLCBwb3MsIG0sIHIsIHYsIGNvbG9yKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBDaXJjbGUodGhpcy5jb25maWcsIG0sIHIsIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzLCBkaXIgPSAxKSB7XG4gICAgICAgIHJldHVybiBnZXRSb3RhdGlvbk1hdHJpeChhbmdsZXNbMF0sIGRpcik7XG4gICAgfVxuXG4gICAgZ2V0UGl2b3RBeGlzKCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBjb2xsaWRlRWxhc3RpY2FsbHkoKSB7XG4gICAgICAgIGNvbnN0IGRpbWVuc2lvbiA9IHRoaXMuY29uZmlnLkRJTUVOU0lPTjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG8xID0gdGhpcy5vYmpzW2ldO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgdGhpcy5vYmpzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbzIgPSB0aGlzLm9ianNbal07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sbGlzaW9uID0gc3ViKG8yLnBvcywgbzEucG9zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbmdsZXMgPSBjYXJ0ZXNpYW4yYXV0byhjb2xsaXNpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBhbmdsZXMuc2hpZnQoKTtcblxuICAgICAgICAgICAgICAgIGlmIChkIDwgbzEuciArIG8yLnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUiA9IHRoaXMuZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUl8gPSB0aGlzLmdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgLTEpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpID0gdGhpcy5nZXRQaXZvdEF4aXMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2VGVtcCA9IFtyb3RhdGUobzEudiwgUiksIHJvdGF0ZShvMi52LCBSKV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZGaW5hbCA9IFt2VGVtcFswXS5zbGljZSgpLCB2VGVtcFsxXS5zbGljZSgpXTtcbiAgICAgICAgICAgICAgICAgICAgdkZpbmFsWzBdW2ldID0gKChvMS5tIC0gbzIubSkgKiB2VGVtcFswXVtpXSArIDIgKiBvMi5tICogdlRlbXBbMV1baV0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgdkZpbmFsWzFdW2ldID0gKChvMi5tIC0gbzEubSkgKiB2VGVtcFsxXVtpXSArIDIgKiBvMS5tICogdlRlbXBbMF1baV0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgbzEudiA9IHJvdGF0ZSh2RmluYWxbMF0sIFJfKTtcbiAgICAgICAgICAgICAgICAgICAgbzIudiA9IHJvdGF0ZSh2RmluYWxbMV0sIFJfKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NUZW1wID0gW3plcm9zKGRpbWVuc2lvbiksIHJvdGF0ZShjb2xsaXNpb24sIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zVGVtcFswXVtpXSArPSB2RmluYWxbMF1baV07XG4gICAgICAgICAgICAgICAgICAgIHBvc1RlbXBbMV1baV0gKz0gdkZpbmFsWzFdW2ldO1xuICAgICAgICAgICAgICAgICAgICBvMS5wb3MgPSBhZGQobzEucG9zLCByb3RhdGUocG9zVGVtcFswXSwgUl8pKTtcbiAgICAgICAgICAgICAgICAgICAgbzIucG9zID0gYWRkKG8xLnBvcywgcm90YXRlKHBvc1RlbXBbMV0sIFJfKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlQWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVWZWxvY2l0eSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29sbGlkZUVsYXN0aWNhbGx5KCk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZVBvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWRyYXdBbGwoKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRyb2xzLnVwZGF0ZSgpO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gICAgfVxuXG4gICAgcHJpbnRGcHMoKSB7XG4gICAgICAgIHRoaXMuZnBzQ291bnQgKz0gMTtcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBub3coKTtcbiAgICAgICAgY29uc3QgdGltZURpZmYgPSBjdXJyZW50VGltZSAtIHRoaXMuZnBzTGFzdFRpbWU7XG4gICAgICAgIGlmICh0aW1lRGlmZiA+IDEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAkeyh0aGlzLmZwc0NvdW50IC8gdGltZURpZmYpIHwgMH0gZnBzYCk7XG4gICAgICAgICAgICB0aGlzLmZwc0xhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgICAgICB0aGlzLmZwc0NvdW50ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2l6ZSgpIHtcbiAgICAgICAgdGhpcy5jYW1lcmEuYXNwZWN0ID0gdGhpcy5jb25maWcuVyAvIHRoaXMuY29uZmlnLkg7XG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpO1xuICAgIH1cblxuICAgIG9uTW91c2VNb3ZlKGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1vdXNlRG93bikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRlbHRhID0gYXRhbjIoZS5wYWdlWSAtIHRoaXMuY29uZmlnLkggLyAyLCBlLnBhZ2VYIC0gdGhpcy5jb25maWcuVyAvIDIpIC0gYXRhbjIodGhpcy5tb3VzZVkgLSB0aGlzLmNvbmZpZy5IIC8gMiwgdGhpcy5tb3VzZVggLSB0aGlzLmNvbmZpZy5XIC8gMik7XG4gICAgICAgIGlmIChkZWx0YSA8IC1QSSkgZGVsdGEgKz0gMiAqIFBJO1xuICAgICAgICBpZiAoZGVsdGEgPiArUEkpIGRlbHRhIC09IDIgKiBQSTtcbiAgICAgICAgdGhpcy5tb3VzZVggPSBlLnBhZ2VYO1xuICAgICAgICB0aGlzLm1vdXNlWSA9IGUucGFnZVk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnJvdGF0aW9uLnogKz0gZGVsdGE7XG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICB9XG5cbiAgICBnZXRDb29yZFN0ZXAoa2V5KSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbm93KCk7XG4gICAgICAgIGlmIChrZXkgPT0gdGhpcy5sYXN0S2V5ICYmIGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZSA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgICAgdGhpcy5sYXN0S2V5ID0ga2V5O1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuQ0FNRVJBX0NPT1JEX1NURVAgKiBwb3codGhpcy5jb25maWcuQ0FNRVJBX0FDQ0VMRVJBVElPTiwgdGhpcy5jb21ibyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTJEOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi8yZCcpO1xuY29uc3QgU3BoZXJlID0gcmVxdWlyZSgnLi4vb2JqZWN0L3NwaGVyZScpO1xuY29uc3Qge3JhbmRvbSwgZ2V0WVJvdGF0aW9uTWF0cml4LCBnZXRaUm90YXRpb25NYXRyaXgsIHJhbmRDb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbiwgc2tpcEludmlzaWJsZUVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHttYWcsIHN1YiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbiwgYWJzfSA9IE1hdGg7XG5cblxuY2xhc3MgRW5naW5lM0QgZXh0ZW5kcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCByZW5kZXJlcikge1xuICAgICAgICBzdXBlcihjb25maWcsIHJlbmRlcmVyKTtcbiAgICAgICAgdGhpcy5jb250cm9scy5lbmFibGVSb3RhdGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHVzZXJDcmVhdGVPYmplY3QoeCwgeSkge1xuICAgICAgICBjb25zdCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgICAgICB2ZWN0b3Iuc2V0KCh4IC8gdGhpcy5jb25maWcuVykgKiAyIC0gMSwgLSh5IC8gdGhpcy5jb25maWcuSCkgKiAyICsgMSwgMC41KTtcbiAgICAgICAgdmVjdG9yLnVucHJvamVjdCh0aGlzLmNhbWVyYSk7XG4gICAgICAgIGNvbnN0IGRpciA9IHZlY3Rvci5zdWIodGhpcy5jYW1lcmEucG9zaXRpb24pLm5vcm1hbGl6ZSgpO1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuY29uZmlnLlJBRElVU19NQVggKiAzIC0gdGhpcy5jYW1lcmEucG9zaXRpb24ueiAvIGRpci56O1xuICAgICAgICBjb25zdCBwID0gdGhpcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5hZGQoZGlyLm11bHRpcGx5U2NhbGFyKGRpc3RhbmNlKSk7XG4gICAgICAgIGNvbnN0IHBvcyA9IFtwLngsIHAueSwgcC56XTtcblxuICAgICAgICBsZXQgbWF4UiA9IHRoaXMuY29uZmlnLlJBRElVU19NQVg7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgbWF4UiA9IG1pbihtYXhSLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5yKSAvIDEuNSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtID0gcmFuZG9tKHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCk7XG4gICAgICAgIGNvbnN0IHIgPSByYW5kb20odGhpcy5jb25maWcuUkFESVVTX01JTiwgbWF4Uik7XG4gICAgICAgIGNvbnN0IHYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJhbmRvbSh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVggLyAyKSwgcmFuZG9tKC0xODAsIDE4MCksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSByYW5kQ29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYHNwaGVyZSR7Kyt0aGlzLmxhc3RPYmpOb31gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KHRhZywgcG9zLCBtLCByLCB2LCBjb2xvcikge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZG90KGdldFpSb3RhdGlvbk1hdHJpeChhbmdsZXNbMF0sIGRpciksIGdldFlSb3RhdGlvbk1hdHJpeChhbmdsZXNbMV0sIGRpciksIGRpcik7XG4gICAgfVxuXG4gICAgZ2V0UGl2b3RBeGlzKCkge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG5cbiAgICBvbk1vdXNlTW92ZShlKSB7XG4gICAgfVxuXG4gICAgb25Nb3VzZURvd24oZSkge1xuICAgIH1cblxuICAgIG9uTW91c2VVcChlKSB7XG4gICAgfVxuXG4gICAgdXBkYXRlUG9zaXRpb24oKSB7XG4gICAgICAgIHN1cGVyLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTNEOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi9lbmdpbmUvMmQnKTtcbmNvbnN0IEVuZ2luZTNEID0gcmVxdWlyZSgnLi9lbmdpbmUvM2QnKTtcbmNvbnN0IHtnZXREaXN0YW5jZX0gPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuXG5sZXQgY29uZmlnID0gbnVsbDtcbmNvbnN0ICRyZW5kZXJlcldyYXBwZXIgPSAkKCcucmVuZGVyZXItd3JhcHBlcicpO1xuXG5mdW5jdGlvbiBvblJlc2l6ZShlLCBlbmdpbmUpIHtcbiAgICBjb25maWcuVyA9ICRyZW5kZXJlcldyYXBwZXIud2lkdGgoKTtcbiAgICBjb25maWcuSCA9ICRyZW5kZXJlcldyYXBwZXIuaGVpZ2h0KCk7XG4gICAgaWYgKGVuZ2luZSkgZW5naW5lLnJlc2l6ZSgpO1xufVxuXG5jb25zdCByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XG5jb25zdCBtb3VzZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5mdW5jdGlvbiBvbkNsaWNrKGUsIGVuZ2luZSkge1xuICAgIGNvbnN0IHggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBlLnBhZ2VZO1xuICAgIGlmICghZW5naW5lLmFuaW1hdGluZykge1xuICAgICAgICBtb3VzZS54ID0gKHggLyBjb25maWcuVykgKiAyIC0gMTtcbiAgICAgICAgbW91c2UueSA9IC0oeSAvIGNvbmZpZy5IKSAqIDIgKyAxO1xuICAgICAgICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShtb3VzZSwgZW5naW5lLmNhbWVyYSk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIGVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3Qob2JqLm9iamVjdCk7XG4gICAgICAgICAgICBpZiAoaW50ZXJzZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNob3dDb250cm9sQm94KHgsIHkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVuZ2luZS51c2VyQ3JlYXRlT2JqZWN0KHgsIHkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25LZXlEb3duKGUsIGVuZ2luZSkge1xuICAgIGNvbnN0IHtrZXlDb2RlfSA9IGU7XG4gICAgaWYgKGtleUNvZGUgPT0gMzIpIHsgLy8gc3BhY2UgYmFyXG4gICAgICAgIGVuZ2luZS5kZXN0cm95Q29udHJvbEJveGVzKCk7XG4gICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICB9XG59XG5cbmNsYXNzIFNpbXVsYXRvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICAgICAgICAkcmVuZGVyZXJXcmFwcGVyLmFwcGVuZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICAgICAgICAkKHdpbmRvdykucmVzaXplKGUgPT4ge1xuICAgICAgICAgICAgb25SZXNpemUoZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpLmRibGNsaWNrKGUgPT4ge1xuICAgICAgICAgICAgb25DbGljayhlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCdib2R5Jykua2V5ZG93bihlID0+IHtcbiAgICAgICAgICAgIG9uS2V5RG93bihlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXQocHJlc2V0KSB7XG4gICAgICAgIGlmICh0aGlzLmVuZ2luZSkgdGhpcy5lbmdpbmUuZGVzdHJveSgpO1xuICAgICAgICBjb25maWcgPSBwcmVzZXQoe30pO1xuICAgICAgICBkb2N1bWVudC50aXRsZSA9IGNvbmZpZy5USVRMRSA9IHByZXNldC5wcm90b3R5cGUudGl0bGU7XG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IChjb25maWcuRElNRU5TSU9OID09IDIgPyBFbmdpbmUyRCA6IEVuZ2luZTNEKShjb25maWcsIHRoaXMucmVuZGVyZXIpO1xuICAgICAgICBvblJlc2l6ZShudWxsLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIGlmICgnaW5pdCcgaW4gY29uZmlnKSBjb25maWcuaW5pdCh0aGlzLmVuZ2luZSk7XG4gICAgICAgIHRoaXMuZW5naW5lLmFuaW1hdGUoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltdWxhdG9yOyIsImZ1bmN0aW9uIGl0ZXIoYSwgZnVuYykge1xuICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgIGNvbnN0IG0gPSBuZXcgQXJyYXkoYV9yKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfcjsgaSsrKSB7XG4gICAgICAgIG1baV0gPSBmdW5jKGkpO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgemVyb3M6IE4gPT4ge1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KE4pLmZpbGwoMCk7XG4gICAgfSxcblxuICAgIG1hZzogYSA9PiB7XG4gICAgICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IGFbaV0gKiBhW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoc3VtKTtcbiAgICB9LFxuXG4gICAgYWRkOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICsgYltpXTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHN1YjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAtIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtdWw6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gKiBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZGl2OiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldIC8gYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRvdDogKGEsIGIsIGRpciA9IDEpID0+IHtcbiAgICAgICAgaWYgKGRpciA9PSAtMSkge1xuICAgICAgICAgICAgW2EsIGJdID0gW2IsIGFdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgICAgICBjb25zdCBhX2MgPSBhWzBdLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYl9jID0gYlswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG0gPSBuZXcgQXJyYXkoYV9yKTtcbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCBhX3I7IHIrKykge1xuICAgICAgICAgICAgbVtyXSA9IG5ldyBBcnJheShiX2MpO1xuICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBiX2M7IGMrKykge1xuICAgICAgICAgICAgICAgIG1bcl1bY10gPSAwO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9jOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbVtyXVtjXSArPSBhW3JdW2ldICogYltpXVtjXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxufTsiLCJjb25zdCBDb250cm9sQm94ID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sX2JveCcpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHBvbGFyMmNhcnRlc2lhbiwgY2FydGVzaWFuMmF1dG8sIHNxdWFyZX0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21heCwgUEl9ID0gTWF0aDtcblxuXG5jbGFzcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFBvbGFyIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9sYXJfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgbSwgciwgcG9zLCB2LCBjb2xvciwgdGFnLCBlbmdpbmUpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgICAgIHRoaXMuciA9IHI7XG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgICAgICB0aGlzLnByZXZQb3MgPSBwb3Muc2xpY2UoKTtcbiAgICAgICAgdGhpcy52ID0gdjtcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gdGhpcy5jcmVhdGVPYmplY3QoKTtcbiAgICAgICAgdGhpcy5jb250cm9sQm94ID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXRoID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXRoVmVydGljZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXRoTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgICAgICAgY29sb3I6IDB4ZmZmZmZmXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEdlb21ldHJ5KCl7XG4gICAgICAgIHJldHVybiBuZXcgVEhSRUUuQ2lyY2xlR2VvbWV0cnkodGhpcy5yLCAzMik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KCkge1xuICAgICAgICBpZiAodGhpcy5vYmplY3QpIHRoaXMuZW5naW5lLnNjZW5lLnJlbW92ZSh0aGlzLm9iamVjdCk7XG4gICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gdGhpcy5nZXRHZW9tZXRyeSgpO1xuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IHRoaXMuY29sb3J9KTtcbiAgICAgICAgY29uc3Qgb2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgb2JqZWN0Lm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lbmdpbmUuc2NlbmUuYWRkKG9iamVjdCk7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlVmVsb2NpdHkoKSB7XG4gICAgICAgIGxldCBGID0gemVyb3ModGhpcy5jb25maWcuRElNRU5TSU9OKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgaWYgKG9iaiA9PSB0aGlzKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvciA9IHN1Yih0aGlzLnBvcywgb2JqLnBvcyk7XG4gICAgICAgICAgICBjb25zdCBtYWduaXR1ZGUgPSBtYWcodmVjdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXRWZWN0b3IgPSBkaXYodmVjdG9yLCBtYWduaXR1ZGUpO1xuICAgICAgICAgICAgRiA9IGFkZChGLCBtdWwodW5pdFZlY3Rvciwgb2JqLm0gLyBzcXVhcmUobWFnbml0dWRlKSkpXG4gICAgICAgIH1cbiAgICAgICAgRiA9IG11bChGLCAtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBkaXYoRiwgdGhpcy5tKTtcbiAgICAgICAgdGhpcy52ID0gYWRkKHRoaXMudiwgYSk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlUG9zaXRpb24oKSB7XG4gICAgICAgIHRoaXMucG9zID0gYWRkKHRoaXMucG9zLCB0aGlzLnYpO1xuICAgICAgICBpZiAobWFnKHN1Yih0aGlzLnBvcywgdGhpcy5wcmV2UG9zKSkgPiAxKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZQb3MgPSB0aGlzLnBvcy5zbGljZSgpO1xuICAgICAgICAgICAgdGhpcy5wYXRoVmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh0aGlzLnBvc1swXSwgdGhpcy5wb3NbMV0sIHRoaXMucG9zWzJdKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLm9iamVjdC5wb3NpdGlvbi54ID0gdGhpcy5wb3NbMF07XG4gICAgICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgPSB0aGlzLnBvc1sxXTtcbiAgICAgICAgdGhpcy5vYmplY3QudXBkYXRlTWF0cml4KCk7XG4gICAgICAgIGlmICh0aGlzLnBhdGgpIHRoaXMuZW5naW5lLnNjZW5lLnJlbW92ZSh0aGlzLnBhdGgpO1xuICAgICAgICBjb25zdCBwYXRoR2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgICAgICAgcGF0aEdlb21ldHJ5LnZlcnRpY2VzID0gdGhpcy5wYXRoVmVydGljZXM7XG4gICAgICAgIHRoaXMucGF0aCA9IG5ldyBUSFJFRS5MaW5lKHBhdGhHZW9tZXRyeSwgdGhpcy5wYXRoTWF0ZXJpYWwpO1xuICAgICAgICB0aGlzLmVuZ2luZS5zY2VuZS5hZGQodGhpcy5wYXRoKTtcbiAgICB9XG5cbiAgICBjb250cm9sTShlKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1Db250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgICAgICB0aGlzLm9iamVjdCA9IHRoaXMuY3JlYXRlT2JqZWN0KCk7XG4gICAgfVxuXG4gICAgY29udHJvbFIoZSkge1xuICAgICAgICBjb25zdCByID0gdGhpcy5yQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZU9iamVjdCgpO1xuICAgIH1cblxuICAgIGNvbnRyb2xQb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NYQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zWUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHldO1xuICAgIH1cblxuICAgIGNvbnRyb2xWKGUpIHtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52UmhvQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgcGhpID0gZGVnMnJhZCh0aGlzLnZQaGlDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgdGhpcy52ID0gcG9sYXIyY2FydGVzaWFuKHJobywgcGhpKTtcbiAgICB9XG5cbiAgICBzaG93Q29udHJvbEJveCh4LCB5KSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRyb2xCb3ggJiYgdGhpcy5jb250cm9sQm94LmlzT3BlbigpKSB7XG4gICAgICAgICAgICBjb25zdCAkY29udHJvbEJveCA9IHRoaXMuY29udHJvbEJveC4kY29udHJvbEJveDtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygndG9wJywgeSArICdweCcpO1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gubmV4dFVudGlsKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5pbnNlcnRCZWZvcmUoJGNvbnRyb2xCb3gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWFyZ2luID0gMS41O1xuXG4gICAgICAgICAgICB2YXIgcG9zUmFuZ2UgPSBtYXgobWF4KHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpIC8gMiwgbWF4LmFwcGx5KG51bGwsIHRoaXMucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICBwb3NSYW5nZSA9IG1heChwb3NSYW5nZSwgbWF4LmFwcGx5KG51bGwsIG9iai5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZSYW5nZSA9IG1heCh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVgsIG1hZyh0aGlzLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICB2UmFuZ2UgPSBtYXgodlJhbmdlLCBtYWcob2JqLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgdGhpcy5tLCB0aGlzLnIsIHYsIHZSYW5nZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBuZXcgQ29udHJvbEJveCh0aGlzLCB0aGlzLnRhZywgdGhpcy5nZXRDb250cm9sbGVycygpLCB4LCB5KTtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmNvbnRyb2xCb3hlcy5wdXNoKHRoaXMuY29udHJvbEJveCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgbSwgciwgdiwgdlJhbmdlKSB7XG4gICAgICAgIHRoaXMubUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIk1hc3MgbVwiLCB0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgsIG0sIHRoaXMuY29udHJvbE0pO1xuICAgICAgICB0aGlzLnJDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJSYWRpdXMgclwiLCB0aGlzLmNvbmZpZy5SQURJVVNfTUlOLCB0aGlzLmNvbmZpZy5SQURJVVNfTUFYLCByLCB0aGlzLmNvbnRyb2xSKTtcbiAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geFwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1swXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geVwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1sxXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4FcIiwgMCwgdlJhbmdlLCB2WzBdLCB0aGlzLmNvbnRyb2xWKTtcbiAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4ZcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMV0pLCB0aGlzLmNvbnRyb2xWKTtcbiAgICB9XG5cbiAgICBnZXRDb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnJDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLm9iamVjdCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMub2JqZWN0KTtcbiAgICAgICAgaWYgKHRoaXMucGF0aCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMucGF0aCk7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLmVuZ2luZS5vYmpzLmluZGV4T2YodGhpcyk7XG4gICAgICAgIHRoaXMuZW5naW5lLm9ianMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpZiAodGhpcy5jb250cm9sQm94ICYmIHRoaXMuY29udHJvbEJveC5pc09wZW4oKSkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sQm94LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsndGFnJzogdGhpcy50YWcsICd2JzogdGhpcy52LCAncG9zJzogdGhpcy5wb3N9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4vY2lyY2xlJyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7cmFkMmRlZywgZGVnMnJhZCwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7Y3ViZX0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7cG93fSA9IE1hdGg7XG5cblxuY2xhc3MgU3BoZXJlIGV4dGVuZHMgQ2lyY2xlIHtcbiAgICAvKipcbiAgICAgKiBTcGhlcmljYWwgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TcGhlcmljYWxfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGdldEdlb21ldHJ5KCl7XG4gICAgICAgIHJldHVybiBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5yLCAzMiwgMzIpO1xuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLnogPSB0aGlzLnBvc1syXTtcbiAgICAgICAgc3VwZXIuZHJhdygpO1xuICAgIH1cblxuICAgIGNvbnRyb2xQb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NYQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zWUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHogPSB0aGlzLnBvc1pDb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5LCB6XTtcbiAgICB9XG5cbiAgICBjb250cm9sVihlKSB7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52UGhpQ29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHRoZXRhID0gZGVnMnJhZCh0aGlzLnZUaGV0YUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZSaG9Db250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJobywgcGhpLCB0aGV0YSk7XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKSB7XG4gICAgICAgIHN1cGVyLnNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSk7XG4gICAgICAgIHRoaXMucG9zWkNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHpcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1syXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy52VGhldGFDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDOuFwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsyXSksIHRoaXMuY29udHJvbFYpO1xuICAgIH1cblxuICAgIGdldENvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMuckNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1hDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWkNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlRoZXRhQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGhlcmU7IiwiY29uc3Qge21hZywgZG90fSA9IHJlcXVpcmUoJy4vbWF0cml4Jyk7XG5cbmNvbnN0IFV0aWwgPSB7XG4gICAgc3F1YXJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHg7XG4gICAgfSxcblxuICAgIGN1YmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeCAqIHg7XG4gICAgfSxcblxuICAgIHBvbGFyMmNhcnRlc2lhbjogKHJobywgcGhpKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4ocGhpKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4ycG9sYXI6ICh4LCB5KSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYWcoW3gsIHldKSxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeSwgeClcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgc3BoZXJpY2FsMmNhcnRlc2lhbjogKHJobywgcGhpLCB0aGV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyh0aGV0YSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnNwaGVyaWNhbDogKHgsIHksIHopID0+IHtcbiAgICAgICAgY29uc3QgcmhvID0gbWFnKFt4LCB5LCB6XSk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8sXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpLFxuICAgICAgICAgICAgcmhvICE9IDAgPyBNYXRoLmFjb3MoeiAvIHJobykgOiAwXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJhdXRvOiAodmVjdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiB2ZWN0b3IubGVuZ3RoID09IDJcbiAgICAgICAgICAgID8gVXRpbC5jYXJ0ZXNpYW4ycG9sYXIodmVjdG9yWzBdLCB2ZWN0b3JbMV0pXG4gICAgICAgICAgICA6IFV0aWwuY2FydGVzaWFuMnNwaGVyaWNhbCh2ZWN0b3JbMF0sIHZlY3RvclsxXSwgdmVjdG9yWzJdKTtcbiAgICB9LFxuXG4gICAgcmFkMmRlZzogKHJhZCkgPT4ge1xuICAgICAgICByZXR1cm4gcmFkIC8gTWF0aC5QSSAqIDE4MDtcbiAgICB9LFxuXG4gICAgZGVnMnJhZDogKGRlZykgPT4ge1xuICAgICAgICByZXR1cm4gZGVnIC8gMTgwICogTWF0aC5QSTtcbiAgICB9LFxuXG4gICAgZ2V0RGlzdGFuY2U6ICh4MCwgeTAsIHgxLCB5MSkgPT4ge1xuICAgICAgICByZXR1cm4gbWFnKFt4MSAtIHgwLCB5MSAtIHkwXSk7XG4gICAgfSxcblxuICAgIHJvdGF0ZTogKHZlY3RvciwgbWF0cml4KSA9PiB7XG4gICAgICAgIHJldHVybiBkb3QoW3ZlY3Rvcl0sIG1hdHJpeClbMF07XG4gICAgfSxcblxuICAgIG5vdzogKCkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICAgIH0sXG5cbiAgICByYW5kb206IChtaW4sIG1heCA9IG51bGwpID0+IHtcbiAgICAgICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICAgICAgICBtYXggPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4gICAgfSxcblxuICAgIHJhbmRDb2xvcjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmO1xuICAgIH0sXG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbl0sXG4gICAgICAgICAgICBbc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFhSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIGNvcywgLXNpbl0sXG4gICAgICAgICAgICBbMCwgc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFlSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgMCwgc2luXSxcbiAgICAgICAgICAgIFswLCAxLCAwXSxcbiAgICAgICAgICAgIFstc2luLCAwLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFpSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbiwgMF0sXG4gICAgICAgICAgICBbc2luLCBjb3MsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDFdXG4gICAgICAgIF07XG4gICAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbDsiXX0=

//# sourceMappingURL=gravity_simulator.js.map
