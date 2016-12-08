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

function SOLAR_SYSTEM(c) {
    return extend(true, MANUAL_3D(c), {
        G: 0.00266418,
        init: function init(engine) {
            engine.createObject('Sun', [0, 0, 0], 1000000, 100, [0, 0, 0], 'map/solar_system/sun.jpg');
            engine.createObject('Mercury', [200, 0, 0], 1000000, 100, [0, 0, 0], 'map/solar_system/mercury.png');
            engine.toggleAnimating();
        }
    });
}
SOLAR_SYSTEM.prototype.title = 'Solar System';

module.exports = [EMPTY_2D, EMPTY_3D, MANUAL_2D, MANUAL_3D, ORBITING, COLLISION, SOLAR_SYSTEM];

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

        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        this.scene.add(hemiLight);

        var dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
        dirLight.position.set(-1, 1, 1);
        dirLight.position.multiplyScalar(50);
        this.scene.add(dirLight);

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

var min = Math.min;

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

var max = Math.max;

var textureLoader = new THREE.TextureLoader();

var Circle = function () {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    function Circle(config, m, r, pos, v, texture, tag, engine) {
        _classCallCheck(this, Circle);

        this.config = config;
        this.m = m;
        this.r = r;
        this.pos = pos;
        this.prevPos = pos.slice();
        this.v = v;
        this.texture = texture;
        this.tag = tag;
        this.engine = engine;
        this.object = this.createObject();
        this.controlBox = null;
        this.path = null;
        this.pathVertices = [];
        this.pathMaterial = new THREE.LineBasicMaterial({
            color: 0x888888
        });
        this.direction = null;
        this.directionMaterial = new THREE.LineBasicMaterial({
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
            var materialOption = {};
            if (this.texture.indexOf('map/') == 0) materialOption.map = textureLoader.load(this.texture);else materialOption.color = this.texture;
            var material = new THREE.MeshStandardMaterial(materialOption);
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

            if (this.direction) this.engine.scene.remove(this.direction);
            var directionGeometry = new THREE.Geometry();
            if (mag(this.v) == 0) {
                this.direction = null;
            } else {
                var nextPos = add(this.pos, mul(this.v, this.r / mag(this.v) + 20));
                directionGeometry.vertices = [new THREE.Vector3(this.pos[0], this.pos[1], this.pos[2]), new THREE.Vector3(nextPos[0], nextPos[1], nextPos[2])];
                this.direction = new THREE.Line(directionGeometry, this.directionMaterial);
                this.engine.scene.add(this.direction);
            }
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
        value: function setup_controllers(pos_range, m, r, v, v_range) {
            _get(Sphere.prototype.__proto__ || Object.getPrototypeOf(Sphere.prototype), 'setup_controllers', this).call(this, pos_range, m, r, v, v_range);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jb250cm9sL2NvbnRyb2xfYm94LmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbGxlci5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvMmQuanMiLCJqcy9zaW11bGF0b3IvZW5naW5lLzNkLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLElBQU0sWUFBWSxRQUFRLGFBQVIsQ0FBbEI7O0FBRUEsSUFBTSxZQUFZLElBQUksU0FBSixFQUFsQjtBQUNBLElBQUksV0FBVyxDQUFmO0FBQ0EsVUFBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLEtBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3JDLFFBQU0sU0FBUyxRQUFRLENBQVIsQ0FBZjtBQUNBLFlBQVEsTUFBUixxQkFBaUMsQ0FBakMsVUFBc0MsS0FBSyxRQUFMLEdBQWdCLFdBQWhCLEdBQThCLEVBQXBFLFVBQTBFLE9BQU8sU0FBUCxDQUFpQixLQUEzRjtBQUNIO0FBQ0QsUUFBUSxNQUFSLENBQWUsWUFBTTtBQUNqQixlQUFXLFNBQVMsUUFBUSxJQUFSLENBQWEsV0FBYixFQUEwQixHQUExQixFQUFULENBQVg7QUFDQSxjQUFVLElBQVYsQ0FBZSxRQUFRLFFBQVIsQ0FBZjtBQUNILENBSEQ7QUFJ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QUFJLEdBQUosRUFBUyxDQUFDLEdBQVYsQ0FGRyxFQUdILENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxHQUFULENBSEcsQ0FBUDtBQUtILEtBL0ZROztBQWlHVCx3QkFBb0IsNEJBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNoQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLEdBQVQsQ0FERyxFQUVILENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRkcsRUFHSCxDQUFDLENBQUMsR0FBRixFQUFPLENBQVAsRUFBVSxHQUFWLENBSEcsQ0FBUDtBQUtILEtBekdROztBQTJHVCx3QkFBb0IsNEJBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNoQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBQyxHQUFQLEVBQVksQ0FBWixDQURHLEVBRUgsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0FGRyxFQUdILENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSEcsQ0FBUDtBQUtIO0FBbkhRLENBQWI7O0FBc0hBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBwcmVzZXRzID0gcmVxdWlyZSgnLi9wcmVzZXQnKTtcbmNvbnN0IFNpbXVsYXRvciA9IHJlcXVpcmUoJy4vc2ltdWxhdG9yJyk7XG5cbmNvbnN0IHNpbXVsYXRvciA9IG5ldyBTaW11bGF0b3IoKTtcbmxldCBzZWxlY3RlZCA9IDE7XG5zaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG5cbmNvbnN0ICRzZWxlY3QgPSAkKCdzZWxlY3QnKTtcbmZvciAobGV0IGkgPSAwOyBpIDwgcHJlc2V0cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHByZXNldCA9IHByZXNldHNbaV07XG4gICAgJHNlbGVjdC5hcHBlbmQoYDxvcHRpb24gdmFsdWU9XCIke2l9XCIke2kgPT0gc2VsZWN0ZWQgPyAnIHNlbGVjdGVkJyA6ICcnfT4ke3ByZXNldC5wcm90b3R5cGUudGl0bGV9PC9vcHRpb24+YCk7XG59XG4kc2VsZWN0LmNoYW5nZSgoKSA9PiB7XG4gICAgc2VsZWN0ZWQgPSBwYXJzZUludCgkc2VsZWN0LmZpbmQoJzpzZWxlY3RlZCcpLnZhbCgpKTtcbiAgICBzaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG59KTtcbiRzZWxlY3QuZm9jdXMoKCkgPT4ge1xuICAgICRzZWxlY3QuYmx1cigpO1xufSk7XG4kKCcjcmVzZXQnKS5jbGljaygoKSA9PiB7XG4gICAgc2ltdWxhdG9yLmluaXQocHJlc2V0c1tzZWxlY3RlZF0pO1xufSk7XG5cblxubGV0ICRtb3ZpbmcgPSBudWxsO1xubGV0IHB4LCBweTtcblxuJCgnYm9keScpLm9uKCdtb3VzZWRvd24nLCAnLmNvbnRyb2wtYm94IC50aXRsZS1iYXInLCBmdW5jdGlvbiAoZSkge1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG4gICAgJG1vdmluZyA9ICQodGhpcykucGFyZW50KCcuY29udHJvbC1ib3gnKTtcbiAgICAkbW92aW5nLm5leHRVbnRpbCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuaW5zZXJ0QmVmb3JlKCRtb3ZpbmcpO1xuICAgIHJldHVybiBmYWxzZTtcbn0pO1xuXG4kKCdib2R5JykubW91c2Vtb3ZlKGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCEkbW92aW5nKSByZXR1cm47XG4gICAgY29uc3QgeCA9IGUucGFnZVg7XG4gICAgY29uc3QgeSA9IGUucGFnZVk7XG4gICAgJG1vdmluZy5jc3MoJ2xlZnQnLCBwYXJzZUludCgkbW92aW5nLmNzcygnbGVmdCcpKSArICh4IC0gcHgpICsgJ3B4Jyk7XG4gICAgJG1vdmluZy5jc3MoJ3RvcCcsIHBhcnNlSW50KCRtb3ZpbmcuY3NzKCd0b3AnKSkgKyAoeSAtIHB5KSArICdweCcpO1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG59KTtcblxuJCgnYm9keScpLm1vdXNldXAoZnVuY3Rpb24gKGUpIHtcbiAgICAkbW92aW5nID0gbnVsbDtcbn0pOyIsImNvbnN0IHtleHRlbmR9ID0gJDtcblxuXG5mdW5jdGlvbiBFTVBUWV8yRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBjLCB7XG4gICAgICAgIEJBQ0tHUk9VTkQ6ICd3aGl0ZScsXG4gICAgICAgIERJTUVOU0lPTjogMixcbiAgICAgICAgTUFYX1BBVEhTOiAxMDAwLFxuICAgICAgICBDQU1FUkFfQ09PUkRfU1RFUDogNSxcbiAgICAgICAgQ0FNRVJBX0FOR0xFX1NURVA6IDEsXG4gICAgICAgIENBTUVSQV9BQ0NFTEVSQVRJT046IDEuMSxcbiAgICAgICAgRzogMC4xLFxuICAgICAgICBNQVNTX01JTjogMSxcbiAgICAgICAgTUFTU19NQVg6IDRlNCxcbiAgICAgICAgUkFESVVTX01JTjogMSxcbiAgICAgICAgUkFESVVTX01BWDogMmUyLFxuICAgICAgICBWRUxPQ0lUWV9NQVg6IDEwLFxuICAgICAgICBESVJFQ1RJT05fTEVOR1RIOiA1MCxcbiAgICAgICAgQ0FNRVJBX0RJU1RBTkNFOiAxMDAsXG4gICAgICAgIElOUFVUX1RZUEU6ICdyYW5nZSdcbiAgICB9KTtcbn1cbkVNUFRZXzJELnByb3RvdHlwZS50aXRsZSA9ICcyRCBHcmF2aXR5IFNpbXVsYXRvcic7XG5cblxuZnVuY3Rpb24gRU1QVFlfM0QoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfMkQoYyksIHtcbiAgICAgICAgRElNRU5TSU9OOiAzLFxuICAgICAgICBHOiAwLjAwMSxcbiAgICAgICAgTUFTU19NSU46IDEsXG4gICAgICAgIE1BU1NfTUFYOiA4ZTYsXG4gICAgICAgIFJBRElVU19NSU46IDEsXG4gICAgICAgIFJBRElVU19NQVg6IDJlMixcbiAgICAgICAgVkVMT0NJVFlfTUFYOiAxMFxuICAgIH0pO1xufVxuRU1QVFlfM0QucHJvdG90eXBlLnRpdGxlID0gJzNEIEdyYXZpdHkgU2ltdWxhdG9yJztcblxuZnVuY3Rpb24gTUFOVUFMXzJEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzJEKGMpLCB7XG4gICAgICAgIElOUFVUX1RZUEU6ICdudW1iZXInXG4gICAgfSk7XG59XG5NQU5VQUxfMkQucHJvdG90eXBlLnRpdGxlID0gJzJEIE1hbnVhbCc7XG5cbmZ1bmN0aW9uIE1BTlVBTF8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBJTlBVVF9UWVBFOiAnbnVtYmVyJ1xuICAgIH0pO1xufVxuTUFOVUFMXzNELnByb3RvdHlwZS50aXRsZSA9ICczRCBNYW51YWwnO1xuXG5mdW5jdGlvbiBPUkJJVElORyhjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBpbml0OiAoZW5naW5lKSA9PiB7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdTdW4nLCBbMCwgMCwgMF0sIDEwMDAwMDAsIDEwMCwgWzAsIDAsIDBdLCAnYmx1ZScpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnTWVyY3VyeScsIFsxODAsIDAsIDBdLCAxLCAyMCwgWzAsIDIuNCwgMF0sICdyZWQnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ1ZlbnVzJywgWzI0MCwgMCwgMF0sIDEsIDIwLCBbMCwgMi4xLCAwXSwgJ3llbGxvdycpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnRWFydGgnLCBbMzAwLCAwLCAwXSwgMSwgMjAsIFswLCAxLjksIDBdLCAnZ3JlZW4nKTtcbiAgICAgICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuT1JCSVRJTkcucHJvdG90eXBlLnRpdGxlID0gJ09yYml0aW5nJztcblxuZnVuY3Rpb24gQ09MTElTSU9OKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzNEKGMpLCB7XG4gICAgICAgIGluaXQ6IChlbmdpbmUpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ0JhbGwgQScsIFstMTAwLCAwLCAwXSwgMTAwMDAwLCA1MCwgWy41LCAuNSwgMF0sICdibHVlJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdCYWxsIEInLCBbMTAwLCAwLCAwXSwgMTAwMDAwLCA1MCwgWy0uNSwgLS41LCAwXSwgJ3JlZCcpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnQmFsbCBDJywgWzAsIDEwMCwgMF0sIDEwMDAwMCwgNTAsIFswLCAwLCAwXSwgJ2dyZWVuJyk7XG4gICAgICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbkNPTExJU0lPTi5wcm90b3R5cGUudGl0bGUgPSAnRWxhc3RpYyBDb2xsaXNpb24nO1xuXG5mdW5jdGlvbiBTT0xBUl9TWVNURU0oYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgTUFOVUFMXzNEKGMpLCB7XG4gICAgICAgIEc6IDAuMDAyNjY0MTgsXG4gICAgICAgIGluaXQ6IChlbmdpbmUpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ1N1bicsIFswLCAwLCAwXSwgMTAwMDAwMCwgMTAwLCBbMCwgMCwgMF0sICdtYXAvc29sYXJfc3lzdGVtL3N1bi5qcGcnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ01lcmN1cnknLCBbMjAwLCAwLCAwXSwgMTAwMDAwMCwgMTAwLCBbMCwgMCwgMF0sICdtYXAvc29sYXJfc3lzdGVtL21lcmN1cnkucG5nJyk7XG4gICAgICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblNPTEFSX1NZU1RFTS5wcm90b3R5cGUudGl0bGUgPSAnU29sYXIgU3lzdGVtJztcblxubW9kdWxlLmV4cG9ydHMgPSBbRU1QVFlfMkQsIEVNUFRZXzNELCBNQU5VQUxfMkQsIE1BTlVBTF8zRCwgT1JCSVRJTkcsIENPTExJU0lPTiwgU09MQVJfU1lTVEVNXTsiLCJjbGFzcyBDb250cm9sQm94IHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIHRpdGxlLCBjb250cm9sbGVycywgeCwgeSkge1xuICAgICAgICBjb25zdCAkdGVtcGxhdGVDb250cm9sQm94ID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJyk7XG4gICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gJHRlbXBsYXRlQ29udHJvbEJveC5jbG9uZSgpO1xuICAgICAgICAkY29udHJvbEJveC5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnRpdGxlJykudGV4dCh0aXRsZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dENvbnRhaW5lciA9ICRjb250cm9sQm94LmZpbmQoJy5pbnB1dC1jb250YWluZXInKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sbGVyIG9mIGNvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgICAkaW5wdXRDb250YWluZXIuYXBwZW5kKGNvbnRyb2xsZXIuJGlucHV0V3JhcHBlcik7XG4gICAgICAgIH1cbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLmNsb3NlJykuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY29udHJvbEJveC5maW5kKCcucmVtb3ZlJykuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgb2JqZWN0LmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRjb250cm9sQm94Lmluc2VydEJlZm9yZSgkdGVtcGxhdGVDb250cm9sQm94KTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCdsZWZ0JywgeCArICdweCcpO1xuICAgICAgICAkY29udHJvbEJveC5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcblxuICAgICAgICB0aGlzLiRjb250cm9sQm94ID0gJGNvbnRyb2xCb3g7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgaXNPcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kY29udHJvbEJveFswXS5wYXJlbnROb2RlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sQm94OyIsImNsYXNzIENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgbmFtZSwgbWluLCBtYXgsIHZhbHVlLCBmdW5jKSB7XG4gICAgICAgIGNvbnN0ICRpbnB1dFdyYXBwZXIgPSB0aGlzLiRpbnB1dFdyYXBwZXIgPSAkKCcuY29udHJvbC1ib3gudGVtcGxhdGUgLmlucHV0LXdyYXBwZXIudGVtcGxhdGUnKS5jbG9uZSgpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLmZpbmQoJy5uYW1lJykudGV4dChuYW1lKTtcbiAgICAgICAgY29uc3QgJGlucHV0ID0gdGhpcy4kaW5wdXQgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd0eXBlJywgb2JqZWN0LmNvbmZpZy5JTlBVVF9UWVBFKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21pbicsIG1pbik7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtYXgnLCBtYXgpO1xuICAgICAgICAkaW5wdXQuYXR0cigndmFsdWUnLCB2YWx1ZSk7XG4gICAgICAgICRpbnB1dC5hdHRyKCdzdGVwJywgMC4wMSk7XG4gICAgICAgIGNvbnN0ICR2YWx1ZSA9ICRpbnB1dFdyYXBwZXIuZmluZCgnLnZhbHVlJyk7XG4gICAgICAgICR2YWx1ZS50ZXh0KHRoaXMuZ2V0KCkpO1xuICAgICAgICAkaW5wdXQub24oJ2lucHV0JywgZSA9PiB7XG4gICAgICAgICAgICAkdmFsdWUudGV4dCh0aGlzLmdldCgpKTtcbiAgICAgICAgICAgIGZ1bmMuY2FsbChvYmplY3QsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuJGlucHV0LnZhbCgpKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuLi9vYmplY3QvY2lyY2xlJyk7XG5jb25zdCB7cm90YXRlLCBub3csIHJhbmRvbSwgcG9sYXIyY2FydGVzaWFuLCByYW5kQ29sb3IsIGdldFJvdGF0aW9uTWF0cml4LCBjYXJ0ZXNpYW4yYXV0b30gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWJ9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWluLCBQSSwgYXRhbjIsIHBvd30gPSBNYXRoO1xuXG5jbGFzcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCByZW5kZXJlcikge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5vYmpzID0gW107XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW107XG4gICAgICAgIHRoaXMuZnBzTGFzdFRpbWUgPSBub3coKTtcbiAgICAgICAgdGhpcy5mcHNDb3VudCA9IDA7XG4gICAgICAgIHRoaXMubGFzdE9iak5vID0gMDtcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCBjb25maWcuVyAvIGNvbmZpZy5ILCAwLjEsIDFlNSk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSA1MDA7XG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdCh0aGlzLnNjZW5lLnBvc2l0aW9uKTtcblxuICAgICAgICBjb25zdCBoZW1pTGlnaHQgPSBuZXcgVEhSRUUuSGVtaXNwaGVyZUxpZ2h0KDB4ZmZmZmZmLCAweGZmZmZmZiwgMSk7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGhlbWlMaWdodCk7XG5cbiAgICAgICAgY29uc3QgZGlyTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMC4yKTtcbiAgICAgICAgZGlyTGlnaHQucG9zaXRpb24uc2V0KC0xLCAxLCAxKTtcbiAgICAgICAgZGlyTGlnaHQucG9zaXRpb24ubXVsdGlwbHlTY2FsYXIoNTApO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZChkaXJMaWdodCk7XG5cbiAgICAgICAgdGhpcy5jb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICAgICAgICB0aGlzLmNvbnRyb2xzLmVuYWJsZURhbXBpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRyb2xzLmRhbXBpbmdGYWN0b3IgPSAwLjE1O1xuICAgICAgICB0aGlzLmNvbnRyb2xzLmVuYWJsZVJvdGF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRvZ2dsZUFuaW1hdGluZygpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSAhdGhpcy5hbmltYXRpbmc7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gYCR7dGhpcy5jb25maWcuVElUTEV9ICgke3RoaXMuYW5pbWF0aW5nID8gXCJTaW11bGF0aW5nXCIgOiBcIlBhdXNlZFwifSlgO1xuICAgIH1cblxuICAgIGRlc3Ryb3lDb250cm9sQm94ZXMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbEJveCBvZiB0aGlzLmNvbnRyb2xCb3hlcykge1xuICAgICAgICAgICAgY29udHJvbEJveC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW11cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5kZXN0cm95Q29udHJvbEJveGVzKCk7XG4gICAgfVxuXG4gICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlbmRlcmVyKSByZXR1cm47XG4gICAgICAgIHRoaXMucHJpbnRGcHMoKTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUFsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVkcmF3QWxsKCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgdXNlckNyZWF0ZU9iamVjdCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgICAgIHZlY3Rvci5zZXQoKHggLyB0aGlzLmNvbmZpZy5XKSAqIDIgLSAxLCAtKHkgLyB0aGlzLmNvbmZpZy5IKSAqIDIgKyAxLCAwLjUpO1xuICAgICAgICB2ZWN0b3IudW5wcm9qZWN0KHRoaXMuY2FtZXJhKTtcbiAgICAgICAgY29uc3QgZGlyID0gdmVjdG9yLnN1Yih0aGlzLmNhbWVyYS5wb3NpdGlvbikubm9ybWFsaXplKCk7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gLXRoaXMuY2FtZXJhLnBvc2l0aW9uLnogLyBkaXIuejtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpLmFkZChkaXIubXVsdGlwbHlTY2FsYXIoZGlzdGFuY2UpKTtcbiAgICAgICAgY29uc3QgcG9zID0gW3Bvc2l0aW9uLngsIHBvc2l0aW9uLnldO1xuXG4gICAgICAgIGxldCBtYXhSID0gdGhpcy5jb25maWcuUkFESVVTX01BWDtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBtYXhSID0gbWluKG1heFIsIChtYWcoc3ViKG9iai5wb3MsIHBvcykpIC0gb2JqLnIpIC8gMS41KVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG0gPSByYW5kb20odGhpcy5jb25maWcuTUFTU19NSU4sIHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgY29uc3QgciA9IHJhbmRvbSh0aGlzLmNvbmZpZy5SQURJVVNfTUlOLCBtYXhSKTtcbiAgICAgICAgY29uc3QgdiA9IHBvbGFyMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSByYW5kQ29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYGNpcmNsZSR7Kyt0aGlzLmxhc3RPYmpOb31gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KHRhZywgcG9zLCBtLCByLCB2LCBjb2xvcikge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzWzBdLCBkaXIpO1xuICAgIH1cblxuICAgIGdldFBpdm90QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY29sbGlkZUVsYXN0aWNhbGx5KCkge1xuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmNvbmZpZy5ESU1FTlNJT047XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vYmpzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvMSA9IHRoaXMub2Jqc1tpXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMub2Jqcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG8yID0gdGhpcy5vYmpzW2pdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHN1YihvMi5wb3MsIG8xLnBvcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGVzID0gY2FydGVzaWFuMmF1dG8oY29sbGlzaW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYW5nbGVzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZCA8IG8xLnIgKyBvMi5yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFIgPSB0aGlzLmdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFJfID0gdGhpcy5nZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMsIC0xKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaSA9IHRoaXMuZ2V0UGl2b3RBeGlzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdlRlbXAgPSBbcm90YXRlKG8xLnYsIFIpLCByb3RhdGUobzIudiwgUildO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2RmluYWwgPSBbdlRlbXBbMF0uc2xpY2UoKSwgdlRlbXBbMV0uc2xpY2UoKV07XG4gICAgICAgICAgICAgICAgICAgIHZGaW5hbFswXVtpXSA9ICgobzEubSAtIG8yLm0pICogdlRlbXBbMF1baV0gKyAyICogbzIubSAqIHZUZW1wWzFdW2ldKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIHZGaW5hbFsxXVtpXSA9ICgobzIubSAtIG8xLm0pICogdlRlbXBbMV1baV0gKyAyICogbzEubSAqIHZUZW1wWzBdW2ldKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIG8xLnYgPSByb3RhdGUodkZpbmFsWzBdLCBSXyk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnYgPSByb3RhdGUodkZpbmFsWzFdLCBSXyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zVGVtcCA9IFt6ZXJvcyhkaW1lbnNpb24pLCByb3RhdGUoY29sbGlzaW9uLCBSKV07XG4gICAgICAgICAgICAgICAgICAgIHBvc1RlbXBbMF1baV0gKz0gdkZpbmFsWzBdW2ldO1xuICAgICAgICAgICAgICAgICAgICBwb3NUZW1wWzFdW2ldICs9IHZGaW5hbFsxXVtpXTtcbiAgICAgICAgICAgICAgICAgICAgbzEucG9zID0gYWRkKG8xLnBvcywgcm90YXRlKHBvc1RlbXBbMF0sIFJfKSk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnBvcyA9IGFkZChvMS5wb3MsIHJvdGF0ZShwb3NUZW1wWzFdLCBSXykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZUFsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlVmVsb2NpdHkoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbGxpZGVFbGFzdGljYWxseSgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVkcmF3QWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5kcmF3KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250cm9scy51cGRhdGUoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIH1cblxuICAgIHByaW50RnBzKCkge1xuICAgICAgICB0aGlzLmZwc0NvdW50ICs9IDE7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbm93KCk7XG4gICAgICAgIGNvbnN0IHRpbWVEaWZmID0gY3VycmVudFRpbWUgLSB0aGlzLmZwc0xhc3RUaW1lO1xuICAgICAgICBpZiAodGltZURpZmYgPiAxKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHsodGhpcy5mcHNDb3VudCAvIHRpbWVEaWZmKSB8IDB9IGZwc2ApO1xuICAgICAgICAgICAgdGhpcy5mcHNMYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgdGhpcy5mcHNDb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNpemUoKSB7XG4gICAgICAgIHRoaXMuY2FtZXJhLmFzcGVjdCA9IHRoaXMuY29uZmlnLlcgLyB0aGlzLmNvbmZpZy5IO1xuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKTtcbiAgICB9XG5cbiAgICBvbk1vdXNlTW92ZShlKSB7XG4gICAgICAgIGlmICghdGhpcy5tb3VzZURvd24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZWx0YSA9IGF0YW4yKGUucGFnZVkgLSB0aGlzLmNvbmZpZy5IIC8gMiwgZS5wYWdlWCAtIHRoaXMuY29uZmlnLlcgLyAyKSAtIGF0YW4yKHRoaXMubW91c2VZIC0gdGhpcy5jb25maWcuSCAvIDIsIHRoaXMubW91c2VYIC0gdGhpcy5jb25maWcuVyAvIDIpO1xuICAgICAgICBpZiAoZGVsdGEgPCAtUEkpIGRlbHRhICs9IDIgKiBQSTtcbiAgICAgICAgaWYgKGRlbHRhID4gK1BJKSBkZWx0YSAtPSAyICogUEk7XG4gICAgICAgIHRoaXMubW91c2VYID0gZS5wYWdlWDtcbiAgICAgICAgdGhpcy5tb3VzZVkgPSBlLnBhZ2VZO1xuICAgICAgICB0aGlzLmNhbWVyYS5yb3RhdGlvbi56ICs9IGRlbHRhO1xuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgfVxuXG4gICAgZ2V0Q29vcmRTdGVwKGtleSkge1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IG5vdygpO1xuICAgICAgICBpZiAoa2V5ID09IHRoaXMubGFzdEtleSAmJiBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWUgPCAxKSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgIHRoaXMubGFzdEtleSA9IGtleTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLkNBTUVSQV9DT09SRF9TVEVQICogcG93KHRoaXMuY29uZmlnLkNBTUVSQV9BQ0NFTEVSQVRJT04sIHRoaXMuY29tYm8pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUyRDsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vMmQnKTtcbmNvbnN0IFNwaGVyZSA9IHJlcXVpcmUoJy4uL29iamVjdC9zcGhlcmUnKTtcbmNvbnN0IHtyYW5kb20sIGdldFlSb3RhdGlvbk1hdHJpeCwgZ2V0WlJvdGF0aW9uTWF0cml4LCByYW5kQ29sb3IsIHNwaGVyaWNhbDJjYXJ0ZXNpYW4sIHNraXBJbnZpc2libGVFcnJvcn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7bWFnLCBzdWIsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttaW59ID0gTWF0aDtcblxuXG5jbGFzcyBFbmdpbmUzRCBleHRlbmRzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIHJlbmRlcmVyKSB7XG4gICAgICAgIHN1cGVyKGNvbmZpZywgcmVuZGVyZXIpO1xuICAgICAgICB0aGlzLmNvbnRyb2xzLmVuYWJsZVJvdGF0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdXNlckNyZWF0ZU9iamVjdCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgICAgIHZlY3Rvci5zZXQoKHggLyB0aGlzLmNvbmZpZy5XKSAqIDIgLSAxLCAtKHkgLyB0aGlzLmNvbmZpZy5IKSAqIDIgKyAxLCAwLjUpO1xuICAgICAgICB2ZWN0b3IudW5wcm9qZWN0KHRoaXMuY2FtZXJhKTtcbiAgICAgICAgY29uc3QgZGlyID0gdmVjdG9yLnN1Yih0aGlzLmNhbWVyYS5wb3NpdGlvbikubm9ybWFsaXplKCk7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5jb25maWcuUkFESVVTX01BWCAqIDMgLSB0aGlzLmNhbWVyYS5wb3NpdGlvbi56IC8gZGlyLno7XG4gICAgICAgIGNvbnN0IHAgPSB0aGlzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpLmFkZChkaXIubXVsdGlwbHlTY2FsYXIoZGlzdGFuY2UpKTtcbiAgICAgICAgY29uc3QgcG9zID0gW3AueCwgcC55LCBwLnpdO1xuXG4gICAgICAgIGxldCBtYXhSID0gdGhpcy5jb25maWcuUkFESVVTX01BWDtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBtYXhSID0gbWluKG1heFIsIChtYWcoc3ViKG9iai5wb3MsIHBvcykpIC0gb2JqLnIpIC8gMS41KVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG0gPSByYW5kb20odGhpcy5jb25maWcuTUFTU19NSU4sIHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgY29uc3QgciA9IHJhbmRvbSh0aGlzLmNvbmZpZy5SQURJVVNfTUlOLCBtYXhSKTtcbiAgICAgICAgY29uc3QgdiA9IHNwaGVyaWNhbDJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSwgcmFuZG9tKC0xODAsIDE4MCkpO1xuICAgICAgICBjb25zdCBjb2xvciA9IHJhbmRDb2xvcigpO1xuICAgICAgICBjb25zdCB0YWcgPSBgc3BoZXJlJHsrK3RoaXMubGFzdE9iak5vfWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBTcGhlcmUodGhpcy5jb25maWcsIG0sIHIsIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIG9iai5zaG93Q29udHJvbEJveCh4LCB5KTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBjcmVhdGVPYmplY3QodGFnLCBwb3MsIG0sIHIsIHYsIGNvbG9yKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBTcGhlcmUodGhpcy5jb25maWcsIG0sIHIsIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzLCBkaXIgPSAxKSB7XG4gICAgICAgIHJldHVybiBkb3QoZ2V0WlJvdGF0aW9uTWF0cml4KGFuZ2xlc1swXSwgZGlyKSwgZ2V0WVJvdGF0aW9uTWF0cml4KGFuZ2xlc1sxXSwgZGlyKSwgZGlyKTtcbiAgICB9XG5cbiAgICBnZXRQaXZvdEF4aXMoKSB7XG4gICAgICAgIHJldHVybiAyO1xuICAgIH1cblxuICAgIG9uTW91c2VNb3ZlKGUpIHtcbiAgICB9XG5cbiAgICBvbk1vdXNlRG93bihlKSB7XG4gICAgfVxuXG4gICAgb25Nb3VzZVVwKGUpIHtcbiAgICB9XG5cbiAgICB1cGRhdGVQb3NpdGlvbigpIHtcbiAgICAgICAgc3VwZXIudXBkYXRlUG9zaXRpb24oKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5naW5lM0Q7IiwiY29uc3QgRW5naW5lMkQgPSByZXF1aXJlKCcuL2VuZ2luZS8yZCcpO1xuY29uc3QgRW5naW5lM0QgPSByZXF1aXJlKCcuL2VuZ2luZS8zZCcpO1xuY29uc3Qge2dldERpc3RhbmNlfSA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5cbmxldCBjb25maWcgPSBudWxsO1xuY29uc3QgJHJlbmRlcmVyV3JhcHBlciA9ICQoJy5yZW5kZXJlci13cmFwcGVyJyk7XG5cbmZ1bmN0aW9uIG9uUmVzaXplKGUsIGVuZ2luZSkge1xuICAgIGNvbmZpZy5XID0gJHJlbmRlcmVyV3JhcHBlci53aWR0aCgpO1xuICAgIGNvbmZpZy5IID0gJHJlbmRlcmVyV3JhcHBlci5oZWlnaHQoKTtcbiAgICBpZiAoZW5naW5lKSBlbmdpbmUucmVzaXplKCk7XG59XG5cbmNvbnN0IHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcbmNvbnN0IG1vdXNlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbmZ1bmN0aW9uIG9uQ2xpY2soZSwgZW5naW5lKSB7XG4gICAgY29uc3QgeCA9IGUucGFnZVg7XG4gICAgY29uc3QgeSA9IGUucGFnZVk7XG4gICAgaWYgKCFlbmdpbmUuYW5pbWF0aW5nKSB7XG4gICAgICAgIG1vdXNlLnggPSAoeCAvIGNvbmZpZy5XKSAqIDIgLSAxO1xuICAgICAgICBtb3VzZS55ID0gLSh5IC8gY29uZmlnLkgpICogMiArIDE7XG4gICAgICAgIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKG1vdXNlLCBlbmdpbmUuY2FtZXJhKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIHZhciBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdChvYmoub2JqZWN0KTtcbiAgICAgICAgICAgIGlmIChpbnRlcnNlY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZW5naW5lLnVzZXJDcmVhdGVPYmplY3QoeCwgeSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbktleURvd24oZSwgZW5naW5lKSB7XG4gICAgY29uc3Qge2tleUNvZGV9ID0gZTtcbiAgICBpZiAoa2V5Q29kZSA9PSAzMikgeyAvLyBzcGFjZSBiYXJcbiAgICAgICAgZW5naW5lLmRlc3Ryb3lDb250cm9sQm94ZXMoKTtcbiAgICAgICAgZW5naW5lLnRvZ2dsZUFuaW1hdGluZygpO1xuICAgIH1cbn1cblxuY2xhc3MgU2ltdWxhdG9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4gICAgICAgICRyZW5kZXJlcldyYXBwZXIuYXBwZW5kKHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gICAgICAgICQod2luZG93KS5yZXNpemUoZSA9PiB7XG4gICAgICAgICAgICBvblJlc2l6ZShlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCkuZGJsY2xpY2soZSA9PiB7XG4gICAgICAgICAgICBvbkNsaWNrKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJ2JvZHknKS5rZXlkb3duKGUgPT4ge1xuICAgICAgICAgICAgb25LZXlEb3duKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdChwcmVzZXQpIHtcbiAgICAgICAgaWYgKHRoaXMuZW5naW5lKSB0aGlzLmVuZ2luZS5kZXN0cm95KCk7XG4gICAgICAgIGNvbmZpZyA9IHByZXNldCh7fSk7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gY29uZmlnLlRJVExFID0gcHJlc2V0LnByb3RvdHlwZS50aXRsZTtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBuZXcgKGNvbmZpZy5ESU1FTlNJT04gPT0gMiA/IEVuZ2luZTJEIDogRW5naW5lM0QpKGNvbmZpZywgdGhpcy5yZW5kZXJlcik7XG4gICAgICAgIG9uUmVzaXplKG51bGwsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgaWYgKCdpbml0JyBpbiBjb25maWcpIGNvbmZpZy5pbml0KHRoaXMuZW5naW5lKTtcbiAgICAgICAgdGhpcy5lbmdpbmUuYW5pbWF0ZSgpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW11bGF0b3I7IiwiZnVuY3Rpb24gaXRlcihhLCBmdW5jKSB7XG4gICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgY29uc3QgbSA9IG5ldyBBcnJheShhX3IpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgbVtpXSA9IGZ1bmMoaSk7XG4gICAgfVxuICAgIHJldHVybiBtO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB6ZXJvczogTiA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXkoTikuZmlsbCgwKTtcbiAgICB9LFxuXG4gICAgbWFnOiBhID0+IHtcbiAgICAgICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfcjsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gYVtpXSAqIGFbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChzdW0pO1xuICAgIH0sXG5cbiAgICBhZGQ6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gKyBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc3ViOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldIC0gYltpXTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG11bDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAqIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkaXY6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLyBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZG90OiAoYSwgYiwgZGlyID0gMSkgPT4ge1xuICAgICAgICBpZiAoZGlyID09IC0xKSB7XG4gICAgICAgICAgICBbYSwgYl0gPSBbYiwgYV07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGFfYyA9IGFbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBiX2MgPSBiWzBdLmxlbmd0aDtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBBcnJheShhX3IpO1xuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IGFfcjsgcisrKSB7XG4gICAgICAgICAgICBtW3JdID0gbmV3IEFycmF5KGJfYyk7XG4gICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGJfYzsgYysrKSB7XG4gICAgICAgICAgICAgICAgbVtyXVtjXSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX2M7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBtW3JdW2NdICs9IGFbcl1baV0gKiBiW2ldW2NdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG59OyIsImNvbnN0IENvbnRyb2xCb3ggPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xfYm94Jyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7cmFkMmRlZywgZGVnMnJhZCwgcG9sYXIyY2FydGVzaWFuLCBjYXJ0ZXNpYW4yYXV0bywgc3F1YXJlfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXZ9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWF4fSA9IE1hdGg7XG5jb25zdCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcblxuXG5jbGFzcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFBvbGFyIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9sYXJfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgbSwgciwgcG9zLCB2LCB0ZXh0dXJlLCB0YWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldlBvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gdGhpcy5jcmVhdGVPYmplY3QoKTtcbiAgICAgICAgdGhpcy5jb250cm9sQm94ID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXRoID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXRoVmVydGljZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXRoTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgICAgICAgY29sb3I6IDB4ODg4ODg4XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IG51bGw7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgICAgICAgY29sb3I6IDB4ZmZmZmZmXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEdlb21ldHJ5KCkge1xuICAgICAgICByZXR1cm4gbmV3IFRIUkVFLkNpcmNsZUdlb21ldHJ5KHRoaXMuciwgMzIpO1xuICAgIH1cblxuICAgIGNyZWF0ZU9iamVjdCgpIHtcbiAgICAgICAgaWYgKHRoaXMub2JqZWN0KSB0aGlzLmVuZ2luZS5zY2VuZS5yZW1vdmUodGhpcy5vYmplY3QpO1xuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IHRoaXMuZ2V0R2VvbWV0cnkoKTtcbiAgICAgICAgY29uc3QgbWF0ZXJpYWxPcHRpb24gPSB7fTtcbiAgICAgICAgaWYgKHRoaXMudGV4dHVyZS5pbmRleE9mKCdtYXAvJykgPT0gMCkgbWF0ZXJpYWxPcHRpb24ubWFwID0gdGV4dHVyZUxvYWRlci5sb2FkKHRoaXMudGV4dHVyZSk7XG4gICAgICAgIGVsc2UgbWF0ZXJpYWxPcHRpb24uY29sb3IgPSB0aGlzLnRleHR1cmU7XG4gICAgICAgIGNvbnN0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKG1hdGVyaWFsT3B0aW9uKTtcbiAgICAgICAgY29uc3Qgb2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgb2JqZWN0Lm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lbmdpbmUuc2NlbmUuYWRkKG9iamVjdCk7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlVmVsb2NpdHkoKSB7XG4gICAgICAgIGxldCBGID0gemVyb3ModGhpcy5jb25maWcuRElNRU5TSU9OKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgaWYgKG9iaiA9PSB0aGlzKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvciA9IHN1Yih0aGlzLnBvcywgb2JqLnBvcyk7XG4gICAgICAgICAgICBjb25zdCBtYWduaXR1ZGUgPSBtYWcodmVjdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXRWZWN0b3IgPSBkaXYodmVjdG9yLCBtYWduaXR1ZGUpO1xuICAgICAgICAgICAgRiA9IGFkZChGLCBtdWwodW5pdFZlY3Rvciwgb2JqLm0gLyBzcXVhcmUobWFnbml0dWRlKSkpXG4gICAgICAgIH1cbiAgICAgICAgRiA9IG11bChGLCAtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBkaXYoRiwgdGhpcy5tKTtcbiAgICAgICAgdGhpcy52ID0gYWRkKHRoaXMudiwgYSk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlUG9zaXRpb24oKSB7XG4gICAgICAgIHRoaXMucG9zID0gYWRkKHRoaXMucG9zLCB0aGlzLnYpO1xuICAgICAgICBpZiAobWFnKHN1Yih0aGlzLnBvcywgdGhpcy5wcmV2UG9zKSkgPiAxKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZQb3MgPSB0aGlzLnBvcy5zbGljZSgpO1xuICAgICAgICAgICAgdGhpcy5wYXRoVmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyh0aGlzLnBvc1swXSwgdGhpcy5wb3NbMV0sIHRoaXMucG9zWzJdKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLm9iamVjdC5wb3NpdGlvbi54ID0gdGhpcy5wb3NbMF07XG4gICAgICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgPSB0aGlzLnBvc1sxXTtcbiAgICAgICAgdGhpcy5vYmplY3QudXBkYXRlTWF0cml4KCk7XG5cbiAgICAgICAgaWYgKHRoaXMucGF0aCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMucGF0aCk7XG4gICAgICAgIGNvbnN0IHBhdGhHZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICAgICAgICBwYXRoR2VvbWV0cnkudmVydGljZXMgPSB0aGlzLnBhdGhWZXJ0aWNlcztcbiAgICAgICAgdGhpcy5wYXRoID0gbmV3IFRIUkVFLkxpbmUocGF0aEdlb21ldHJ5LCB0aGlzLnBhdGhNYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuZW5naW5lLnNjZW5lLmFkZCh0aGlzLnBhdGgpO1xuXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbikgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uR2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgICAgICAgaWYgKG1hZyh0aGlzLnYpID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG5leHRQb3MgPSBhZGQodGhpcy5wb3MsIG11bCh0aGlzLnYsIHRoaXMuciAvIG1hZyh0aGlzLnYpICsgMjApKTtcbiAgICAgICAgICAgIGRpcmVjdGlvbkdlb21ldHJ5LnZlcnRpY2VzID0gW25ldyBUSFJFRS5WZWN0b3IzKHRoaXMucG9zWzBdLCB0aGlzLnBvc1sxXSwgdGhpcy5wb3NbMl0pLCBuZXcgVEhSRUUuVmVjdG9yMyhuZXh0UG9zWzBdLCBuZXh0UG9zWzFdLCBuZXh0UG9zWzJdKV07XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IG5ldyBUSFJFRS5MaW5lKGRpcmVjdGlvbkdlb21ldHJ5LCB0aGlzLmRpcmVjdGlvbk1hdGVyaWFsKTtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLnNjZW5lLmFkZCh0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb250cm9sTShlKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1Db250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgICAgICB0aGlzLm9iamVjdCA9IHRoaXMuY3JlYXRlT2JqZWN0KCk7XG4gICAgfVxuXG4gICAgY29udHJvbFIoZSkge1xuICAgICAgICBjb25zdCByID0gdGhpcy5yQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZU9iamVjdCgpO1xuICAgIH1cblxuICAgIGNvbnRyb2xQb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NYQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zWUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHldO1xuICAgIH1cblxuICAgIGNvbnRyb2xWKGUpIHtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52UmhvQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgcGhpID0gZGVnMnJhZCh0aGlzLnZQaGlDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgdGhpcy52ID0gcG9sYXIyY2FydGVzaWFuKHJobywgcGhpKTtcbiAgICB9XG5cbiAgICBzaG93Q29udHJvbEJveCh4LCB5KSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRyb2xCb3ggJiYgdGhpcy5jb250cm9sQm94LmlzT3BlbigpKSB7XG4gICAgICAgICAgICBjb25zdCAkY29udHJvbEJveCA9IHRoaXMuY29udHJvbEJveC4kY29udHJvbEJveDtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygndG9wJywgeSArICdweCcpO1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gubmV4dFVudGlsKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5pbnNlcnRCZWZvcmUoJGNvbnRyb2xCb3gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWFyZ2luID0gMS41O1xuXG4gICAgICAgICAgICB2YXIgcG9zUmFuZ2UgPSBtYXgobWF4KHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpIC8gMiwgbWF4LmFwcGx5KG51bGwsIHRoaXMucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICBwb3NSYW5nZSA9IG1heChwb3NSYW5nZSwgbWF4LmFwcGx5KG51bGwsIG9iai5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZSYW5nZSA9IG1heCh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVgsIG1hZyh0aGlzLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICB2UmFuZ2UgPSBtYXgodlJhbmdlLCBtYWcob2JqLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgdGhpcy5tLCB0aGlzLnIsIHYsIHZSYW5nZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBuZXcgQ29udHJvbEJveCh0aGlzLCB0aGlzLnRhZywgdGhpcy5nZXRDb250cm9sbGVycygpLCB4LCB5KTtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmNvbnRyb2xCb3hlcy5wdXNoKHRoaXMuY29udHJvbEJveCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgbSwgciwgdiwgdlJhbmdlKSB7XG4gICAgICAgIHRoaXMubUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIk1hc3MgbVwiLCB0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgsIG0sIHRoaXMuY29udHJvbE0pO1xuICAgICAgICB0aGlzLnJDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJSYWRpdXMgclwiLCB0aGlzLmNvbmZpZy5SQURJVVNfTUlOLCB0aGlzLmNvbmZpZy5SQURJVVNfTUFYLCByLCB0aGlzLmNvbnRyb2xSKTtcbiAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geFwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1swXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geVwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1sxXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4FcIiwgMCwgdlJhbmdlLCB2WzBdLCB0aGlzLmNvbnRyb2xWKTtcbiAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4ZcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMV0pLCB0aGlzLmNvbnRyb2xWKTtcbiAgICB9XG5cbiAgICBnZXRDb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnJDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLm9iamVjdCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMub2JqZWN0KTtcbiAgICAgICAgaWYgKHRoaXMucGF0aCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMucGF0aCk7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLmVuZ2luZS5vYmpzLmluZGV4T2YodGhpcyk7XG4gICAgICAgIHRoaXMuZW5naW5lLm9ianMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpZiAodGhpcy5jb250cm9sQm94ICYmIHRoaXMuY29udHJvbEJveC5pc09wZW4oKSkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sQm94LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsndGFnJzogdGhpcy50YWcsICd2JzogdGhpcy52LCAncG9zJzogdGhpcy5wb3N9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4vY2lyY2xlJyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7cmFkMmRlZywgZGVnMnJhZCwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cblxuY2xhc3MgU3BoZXJlIGV4dGVuZHMgQ2lyY2xlIHtcbiAgICAvKipcbiAgICAgKiBTcGhlcmljYWwgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TcGhlcmljYWxfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGdldEdlb21ldHJ5KCl7XG4gICAgICAgIHJldHVybiBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5yLCAzMiwgMzIpO1xuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLnogPSB0aGlzLnBvc1syXTtcbiAgICAgICAgc3VwZXIuZHJhdygpO1xuICAgIH1cblxuICAgIGNvbnRyb2xQb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NYQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zWUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHogPSB0aGlzLnBvc1pDb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5LCB6XTtcbiAgICB9XG5cbiAgICBjb250cm9sVihlKSB7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52UGhpQ29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHRoZXRhID0gZGVnMnJhZCh0aGlzLnZUaGV0YUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZSaG9Db250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJobywgcGhpLCB0aGV0YSk7XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCByLCB2LCB2X3JhbmdlKSB7XG4gICAgICAgIHN1cGVyLnNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgciwgdiwgdl9yYW5nZSk7XG4gICAgICAgIHRoaXMucG9zWkNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHpcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1syXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy52VGhldGFDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDOuFwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsyXSksIHRoaXMuY29udHJvbFYpO1xuICAgIH1cblxuICAgIGdldENvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMuckNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1hDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWkNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlRoZXRhQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGhlcmU7IiwiY29uc3Qge21hZywgZG90fSA9IHJlcXVpcmUoJy4vbWF0cml4Jyk7XG5cbmNvbnN0IFV0aWwgPSB7XG4gICAgc3F1YXJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHg7XG4gICAgfSxcblxuICAgIGN1YmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeCAqIHg7XG4gICAgfSxcblxuICAgIHBvbGFyMmNhcnRlc2lhbjogKHJobywgcGhpKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4ocGhpKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4ycG9sYXI6ICh4LCB5KSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYWcoW3gsIHldKSxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeSwgeClcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgc3BoZXJpY2FsMmNhcnRlc2lhbjogKHJobywgcGhpLCB0aGV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyh0aGV0YSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnNwaGVyaWNhbDogKHgsIHksIHopID0+IHtcbiAgICAgICAgY29uc3QgcmhvID0gbWFnKFt4LCB5LCB6XSk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8sXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpLFxuICAgICAgICAgICAgcmhvICE9IDAgPyBNYXRoLmFjb3MoeiAvIHJobykgOiAwXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJhdXRvOiAodmVjdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiB2ZWN0b3IubGVuZ3RoID09IDJcbiAgICAgICAgICAgID8gVXRpbC5jYXJ0ZXNpYW4ycG9sYXIodmVjdG9yWzBdLCB2ZWN0b3JbMV0pXG4gICAgICAgICAgICA6IFV0aWwuY2FydGVzaWFuMnNwaGVyaWNhbCh2ZWN0b3JbMF0sIHZlY3RvclsxXSwgdmVjdG9yWzJdKTtcbiAgICB9LFxuXG4gICAgcmFkMmRlZzogKHJhZCkgPT4ge1xuICAgICAgICByZXR1cm4gcmFkIC8gTWF0aC5QSSAqIDE4MDtcbiAgICB9LFxuXG4gICAgZGVnMnJhZDogKGRlZykgPT4ge1xuICAgICAgICByZXR1cm4gZGVnIC8gMTgwICogTWF0aC5QSTtcbiAgICB9LFxuXG4gICAgZ2V0RGlzdGFuY2U6ICh4MCwgeTAsIHgxLCB5MSkgPT4ge1xuICAgICAgICByZXR1cm4gbWFnKFt4MSAtIHgwLCB5MSAtIHkwXSk7XG4gICAgfSxcblxuICAgIHJvdGF0ZTogKHZlY3RvciwgbWF0cml4KSA9PiB7XG4gICAgICAgIHJldHVybiBkb3QoW3ZlY3Rvcl0sIG1hdHJpeClbMF07XG4gICAgfSxcblxuICAgIG5vdzogKCkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICAgIH0sXG5cbiAgICByYW5kb206IChtaW4sIG1heCA9IG51bGwpID0+IHtcbiAgICAgICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICAgICAgICBtYXggPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4gICAgfSxcblxuICAgIHJhbmRDb2xvcjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmO1xuICAgIH0sXG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbl0sXG4gICAgICAgICAgICBbc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFhSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIGNvcywgLXNpbl0sXG4gICAgICAgICAgICBbMCwgc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFlSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgMCwgc2luXSxcbiAgICAgICAgICAgIFswLCAxLCAwXSxcbiAgICAgICAgICAgIFstc2luLCAwLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFpSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbiwgMF0sXG4gICAgICAgICAgICBbc2luLCBjb3MsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDFdXG4gICAgICAgIF07XG4gICAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbDsiXX0=

//# sourceMappingURL=gravity_simulator.js.map
