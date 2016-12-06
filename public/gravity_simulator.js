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

var Path = function Path(obj) {
    _classCallCheck(this, Path);

    this.prevPos = obj.prevPos.slice();
    this.pos = obj.pos.slice();
};

var Engine2D = function () {
    function Engine2D(config, renderer) {
        _classCallCheck(this, Engine2D);

        this.config = config;
        this.objs = [];
        this.animating = false;
        this.controlBoxes = [];
        this.paths = [];
        this.fpsLastTime = now();
        this.fpsCount = 0;
        this.lastObjNo = 0;
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-this.config.W / 2, this.config.W / 2, -this.config.H / 2, this.config.H / 2, 1, 1000);
        this.camera.position.z = 100;

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
            var pos = [(x - this.config.W / 2) / this.camera.zoom, (y - this.config.H / 2) / this.camera.zoom];
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
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.objs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var obj = _step5.value;

                    obj.update();
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
            this.camera.left = -this.config.W / 2;
            this.camera.right = this.config.W / 2;
            this.camera.top = -this.config.H / 2;
            this.camera.bottom = this.config.H / 2;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.config.W, this.config.H);
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove(e) {
            if (!this.mouseDown) {
                return;
            }

            var delta = atan2(e.clientY - this.config.H / 2, e.clientX - this.config.W / 2) - atan2(this.mouseY - this.config.H / 2, this.mouseX - this.config.W / 2);
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
        key: 'up',
        value: function up(key) {
            this.camera.translateY(-this.getCoordStep(key));
            this.camera.updateProjectionMatrix();
        }
    }, {
        key: 'down',
        value: function down(key) {
            this.camera.translateY(+this.getCoordStep(key));
            this.camera.updateProjectionMatrix();
        }
    }, {
        key: 'left',
        value: function left(key) {
            this.camera.translateX(-this.getCoordStep(key));
            this.camera.updateProjectionMatrix();
        }
    }, {
        key: 'right',
        value: function right(key) {
            this.camera.translateX(+this.getCoordStep(key));
            this.camera.updateProjectionMatrix();
        }
    }, {
        key: 'zoomIn',
        value: function zoomIn(key) {
            this.camera.zoom += this.getCoordStep(key) / 100;
            this.camera.updateProjectionMatrix();
        }
    }, {
        key: 'zoomOut',
        value: function zoomOut(key) {
            this.camera.zoom -= this.getCoordStep(key) / 100;
            if (this.camera.zoom < 0.01) this.camera.zoom = 0.01;
            this.camera.updateProjectionMatrix();
        }
    }]);

    return Engine2D;
}();

module.exports = Engine2D;

},{"../matrix":8,"../object/circle":9,"../util":11}],6:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

        _this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        return _this;
    }

    _createClass(Engine3D, [{
        key: 'userCreateObject',
        value: function userCreateObject(x, y) {
            var vector = new THREE.Vector3();
            vector.set(x / this.config.W * 2 - 1, -(y / this.config.H) * 2 + 1, 0.5);
            vector.unproject(this.camera);
            var dir = vector.sub(this.camera.position).normalize();
            var distance = -this.camera.position.z / dir.z;
            var position = this.camera.position.clone().add(dir.multiplyScalar(distance));
            var pos = [position.x, position.y, position.z];

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
                        var coords = _this2.camera.objectCoords(obj);
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
                        var coords = _this2.camera.directionCoords(obj);
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
                        var coords = _this2.camera.pathCoords(path);
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
        console.log(engine.camera);
        raycaster.setFromCamera(mouse, engine.camera);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var obj = _step.value;

                var intersects = raycaster.intersectObject(obj.object);
                console.log(intersects);
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
        $(this.renderer.domElement).click(function (e) {
            onClick(e, _this.engine);
        });
        $('body').keydown(function (e) {
            onKeyDown(e, _this.engine);
        });
        $(document).mousedown(function (e) {
            _this.engine.onMouseDown(e);
        });
        $(document).mousemove(function (e) {
            _this.engine.onMouseMove(e);
        });
        $(document).mouseup(function (e) {
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
        this.object = this.createObject();
        this.controlBox = null;
    }

    _createClass(Circle, [{
        key: 'createObject',
        value: function createObject() {
            if (this.object) this.engine.scene.remove(this.object);
            var geometry = new THREE.SphereGeometry(this.getRadius(), 32, 32);
            var material = new THREE.MeshBasicMaterial({ color: this.color });
            var object = new THREE.Mesh(geometry, material);
            object.matrixAutoUpdate = false;
            this.engine.scene.add(object);
            return object;
        }
    }, {
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
        key: 'update',
        value: function update() {
            this.object.position.x = this.pos[0];
            this.object.position.y = this.pos[1];
            this.object.updateMatrix();
        }
    }, {
        key: 'controlM',
        value: function controlM(e) {
            var m = this.mController.get();
            this.m = m;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jb250cm9sL2NvbnRyb2xfYm94LmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbGxlci5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvMmQuanMiLCJqcy9zaW11bGF0b3IvZW5naW5lLzNkLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLElBQU0sWUFBWSxRQUFRLGFBQVIsQ0FBbEI7O0FBRUEsSUFBTSxZQUFZLElBQUksU0FBSixFQUFsQjtBQUNBLElBQUksV0FBVyxDQUFmO0FBQ0EsVUFBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLEtBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3JDLFFBQU0sU0FBUyxRQUFRLENBQVIsQ0FBZjtBQUNBLFlBQVEsTUFBUixxQkFBaUMsQ0FBakMsVUFBc0MsS0FBSyxRQUFMLEdBQWdCLFdBQWhCLEdBQThCLEVBQXBFLFVBQTBFLE9BQU8sU0FBUCxDQUFpQixLQUEzRjtBQUNIO0FBQ0QsUUFBUSxNQUFSLENBQWUsWUFBTTtBQUNqQixlQUFXLFNBQVMsUUFBUSxJQUFSLENBQWEsV0FBYixFQUEwQixHQUExQixFQUFULENBQVg7QUFDQSxjQUFVLElBQVYsQ0FBZSxRQUFRLFFBQVIsQ0FBZjtBQUNILENBSEQ7QUFJQSxRQUFRLEtBQVIsQ0FBYyxZQUFNO0FBQ2hCLFlBQVEsSUFBUjtBQUNILENBRkQ7QUFHQSxFQUFFLFFBQUYsRUFBWSxLQUFaLENBQWtCLFlBQU07QUFDcEIsY0FBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7QUFDSCxDQUZEOztBQUtBLElBQUksVUFBVSxJQUFkO0FBQ0EsSUFBSSxXQUFKO0FBQUEsSUFBUSxXQUFSOztBQUVBLEVBQUUsTUFBRixFQUFVLEVBQVYsQ0FBYSxXQUFiLEVBQTBCLHlCQUExQixFQUFxRCxVQUFVLENBQVYsRUFBYTtBQUM5RCxTQUFLLEVBQUUsS0FBUDtBQUNBLFNBQUssRUFBRSxLQUFQO0FBQ0EsY0FBVSxFQUFFLElBQUYsRUFBUSxNQUFSLENBQWUsY0FBZixDQUFWO0FBQ0EsWUFBUSxTQUFSLENBQWtCLHVCQUFsQixFQUEyQyxZQUEzQyxDQUF3RCxPQUF4RDtBQUNBLFdBQU8sS0FBUDtBQUNILENBTkQ7O0FBUUEsRUFBRSxNQUFGLEVBQVUsU0FBVixDQUFvQixVQUFVLENBQVYsRUFBYTtBQUM3QixRQUFJLENBQUMsT0FBTCxFQUFjO0FBQ2QsUUFBTSxJQUFJLEVBQUUsS0FBWjtBQUNBLFFBQU0sSUFBSSxFQUFFLEtBQVo7QUFDQSxZQUFRLEdBQVIsQ0FBWSxNQUFaLEVBQW9CLFNBQVMsUUFBUSxHQUFSLENBQVksTUFBWixDQUFULEtBQWlDLElBQUksRUFBckMsSUFBMkMsSUFBL0Q7QUFDQSxZQUFRLEdBQVIsQ0FBWSxLQUFaLEVBQW1CLFNBQVMsUUFBUSxHQUFSLENBQVksS0FBWixDQUFULEtBQWdDLElBQUksRUFBcEMsSUFBMEMsSUFBN0Q7QUFDQSxTQUFLLEVBQUUsS0FBUDtBQUNBLFNBQUssRUFBRSxLQUFQO0FBQ0gsQ0FSRDs7QUFVQSxFQUFFLE1BQUYsRUFBVSxPQUFWLENBQWtCLFVBQVUsQ0FBVixFQUFhO0FBQzNCLGNBQVUsSUFBVjtBQUNILENBRkQ7Ozs7O1NDN0NpQixDO0lBQVYsTSxNQUFBLE07OztBQUdQLFNBQVMsUUFBVCxDQUFrQixDQUFsQixFQUFxQjtBQUNqQixXQUFPLE9BQU8sSUFBUCxFQUFhLENBQWIsRUFBZ0I7QUFDbkIsb0JBQVksT0FETztBQUVuQixtQkFBVyxDQUZRO0FBR25CLG1CQUFXLElBSFE7QUFJbkIsMkJBQW1CLENBSkE7QUFLbkIsMkJBQW1CLENBTEE7QUFNbkIsNkJBQXFCLEdBTkY7QUFPbkIsV0FBRyxHQVBnQjtBQVFuQixrQkFBVSxDQVJTO0FBU25CLGtCQUFVLEdBVFM7QUFVbkIsc0JBQWMsRUFWSztBQVduQiwwQkFBa0IsRUFYQztBQVluQixrQkFBVSxDQVpTO0FBYW5CLGtCQUFVLENBYlM7QUFjbkIsa0JBQVUsR0FkUztBQWVuQixzQkFBYyxHQWZLO0FBZ0JuQixvQkFBWTtBQWhCTyxLQUFoQixDQUFQO0FBa0JIO0FBQ0QsU0FBUyxTQUFULENBQW1CLEtBQW5CLEdBQTJCLHNCQUEzQjs7QUFHQSxTQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUI7QUFDakIsV0FBTyxPQUFPLElBQVAsRUFBYSxTQUFTLENBQVQsQ0FBYixFQUEwQjtBQUM3QixtQkFBVyxDQURrQjtBQUU3QixXQUFHLEtBRjBCO0FBRzdCLGtCQUFVLENBSG1CO0FBSTdCLGtCQUFVLEdBSm1CO0FBSzdCLHNCQUFjO0FBTGUsS0FBMUIsQ0FBUDtBQU9IO0FBQ0QsU0FBUyxTQUFULENBQW1CLEtBQW5CLEdBQTJCLHNCQUEzQjs7QUFFQSxTQUFTLE1BQVQsQ0FBZ0IsQ0FBaEIsRUFBbUI7QUFDZixXQUFPLE9BQU8sSUFBUCxFQUFhLFNBQVMsQ0FBVCxDQUFiLEVBQTBCO0FBQzdCLG9CQUFZO0FBRGlCLEtBQTFCLENBQVA7QUFHSDtBQUNELE9BQU8sU0FBUCxDQUFpQixLQUFqQixHQUF5QixRQUF6Qjs7QUFFQSxTQUFTLE1BQVQsQ0FBZ0IsQ0FBaEIsRUFBbUI7QUFDZixXQUFPLE9BQU8sSUFBUCxFQUFhLFNBQVMsQ0FBVCxDQUFiLEVBQTBCO0FBQzdCLG9CQUFZO0FBRGlCLEtBQTFCLENBQVA7QUFHSDtBQUNELE9BQU8sU0FBUCxDQUFpQixLQUFqQixHQUF5QixRQUF6Qjs7QUFFQSxTQUFTLEtBQVQsQ0FBZSxDQUFmLEVBQWtCO0FBQ2QsV0FBTyxPQUFPLElBQVAsRUFBYSxTQUFTLENBQVQsQ0FBYixFQUEwQjtBQUM3QixjQUFNLGNBQUMsTUFBRCxFQUFZO0FBQ2QsbUJBQU8sWUFBUCxDQUFvQixPQUFwQixFQUE2QixDQUFDLENBQUMsR0FBRixFQUFPLENBQVAsRUFBVSxDQUFWLENBQTdCLEVBQTJDLE9BQTNDLEVBQW9ELENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQXBELEVBQStELE9BQS9EO0FBQ0EsbUJBQU8sWUFBUCxDQUFvQixPQUFwQixFQUE2QixDQUFDLEVBQUQsRUFBSyxDQUFMLEVBQVEsQ0FBUixDQUE3QixFQUF5QyxLQUF6QyxFQUFnRCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFoRCxFQUEyRCxNQUEzRDtBQUNBLG1CQUFPLGVBQVA7QUFDSDtBQUw0QixLQUExQixDQUFQO0FBT0g7QUFDRCxNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsR0FBd0IsT0FBeEI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLENBQUMsUUFBRCxFQUFXLFFBQVgsRUFBcUIsTUFBckIsRUFBNkIsTUFBN0IsRUFBcUMsS0FBckMsQ0FBakI7Ozs7Ozs7OztJQzlETSxVO0FBQ0Ysd0JBQVksTUFBWixFQUFvQixLQUFwQixFQUEyQixXQUEzQixFQUF3QyxDQUF4QyxFQUEyQyxDQUEzQyxFQUE4QztBQUFBOztBQUMxQyxZQUFNLHNCQUFzQixFQUFFLHVCQUFGLENBQTVCO0FBQ0EsWUFBTSxjQUFjLG9CQUFvQixLQUFwQixFQUFwQjtBQUNBLG9CQUFZLFdBQVosQ0FBd0IsVUFBeEI7QUFDQSxvQkFBWSxJQUFaLENBQWlCLFFBQWpCLEVBQTJCLElBQTNCLENBQWdDLEtBQWhDO0FBQ0EsWUFBTSxrQkFBa0IsWUFBWSxJQUFaLENBQWlCLGtCQUFqQixDQUF4QjtBQUwwQztBQUFBO0FBQUE7O0FBQUE7QUFNMUMsaUNBQXlCLFdBQXpCLDhIQUFzQztBQUFBLG9CQUEzQixVQUEyQjs7QUFDbEMsZ0NBQWdCLE1BQWhCLENBQXVCLFdBQVcsYUFBbEM7QUFDSDtBQVJ5QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVMxQyxvQkFBWSxJQUFaLENBQWlCLFFBQWpCLEVBQTJCLEtBQTNCLENBQWlDLFlBQU07QUFDbkMsd0JBQVksTUFBWjtBQUNILFNBRkQ7QUFHQSxvQkFBWSxJQUFaLENBQWlCLFNBQWpCLEVBQTRCLEtBQTVCLENBQWtDLFlBQU07QUFDcEMsbUJBQU8sT0FBUDtBQUNILFNBRkQ7QUFHQSxvQkFBWSxZQUFaLENBQXlCLG1CQUF6QjtBQUNBLG9CQUFZLEdBQVosQ0FBZ0IsTUFBaEIsRUFBd0IsSUFBSSxJQUE1QjtBQUNBLG9CQUFZLEdBQVosQ0FBZ0IsS0FBaEIsRUFBdUIsSUFBSSxJQUEzQjs7QUFFQSxhQUFLLFdBQUwsR0FBbUIsV0FBbkI7QUFDSDs7OztnQ0FFTztBQUNKLGlCQUFLLFdBQUwsQ0FBaUIsTUFBakI7QUFDSDs7O2lDQUVRO0FBQ0wsbUJBQU8sS0FBSyxXQUFMLENBQWlCLENBQWpCLEVBQW9CLFVBQTNCO0FBQ0g7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixVQUFqQjs7Ozs7Ozs7O0lDaENNLFU7QUFDRix3QkFBWSxNQUFaLEVBQW9CLElBQXBCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEtBQXBDLEVBQTJDLElBQTNDLEVBQWlEO0FBQUE7O0FBQUE7O0FBQzdDLFlBQU0sZ0JBQWdCLEtBQUssYUFBTCxHQUFxQixFQUFFLCtDQUFGLEVBQW1ELEtBQW5ELEVBQTNDO0FBQ0Esc0JBQWMsV0FBZCxDQUEwQixVQUExQjtBQUNBLHNCQUFjLElBQWQsQ0FBbUIsT0FBbkIsRUFBNEIsSUFBNUIsQ0FBaUMsSUFBakM7QUFDQSxZQUFNLFNBQVMsS0FBSyxNQUFMLEdBQWMsY0FBYyxJQUFkLENBQW1CLE9BQW5CLENBQTdCO0FBQ0EsZUFBTyxJQUFQLENBQVksTUFBWixFQUFvQixPQUFPLE1BQVAsQ0FBYyxVQUFsQztBQUNBLGVBQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsR0FBbkI7QUFDQSxlQUFPLElBQVAsQ0FBWSxLQUFaLEVBQW1CLEdBQW5CO0FBQ0EsZUFBTyxJQUFQLENBQVksT0FBWixFQUFxQixLQUFyQjtBQUNBLGVBQU8sSUFBUCxDQUFZLE1BQVosRUFBb0IsSUFBcEI7QUFDQSxZQUFNLFNBQVMsY0FBYyxJQUFkLENBQW1CLFFBQW5CLENBQWY7QUFDQSxlQUFPLElBQVAsQ0FBWSxLQUFLLEdBQUwsRUFBWjtBQUNBLGVBQU8sRUFBUCxDQUFVLE9BQVYsRUFBbUIsYUFBSztBQUNwQixtQkFBTyxJQUFQLENBQVksTUFBSyxHQUFMLEVBQVo7QUFDQSxpQkFBSyxJQUFMLENBQVUsTUFBVixFQUFrQixDQUFsQjtBQUNILFNBSEQ7QUFJSDs7Ozs4QkFFSztBQUNGLG1CQUFPLFdBQVcsS0FBSyxNQUFMLENBQVksR0FBWixFQUFYLENBQVA7QUFDSDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFVBQWpCOzs7Ozs7Ozs7QUN4QkEsSUFBTSxTQUFTLFFBQVEsa0JBQVIsQ0FBZjs7ZUFDNkYsUUFBUSxTQUFSLEM7SUFBdEYsTSxZQUFBLE07SUFBUSxHLFlBQUEsRztJQUFLLE0sWUFBQSxNO0lBQVEsZSxZQUFBLGU7SUFBaUIsUyxZQUFBLFM7SUFBVyxrQixZQUFBLGlCO0lBQW1CLGMsWUFBQSxjOztnQkFDNUMsUUFBUSxXQUFSLEM7SUFBeEIsSyxhQUFBLEs7SUFBTyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7O0lBQ2pCLEcsR0FBdUIsSSxDQUF2QixHO0lBQUssRSxHQUFrQixJLENBQWxCLEU7SUFBSSxLLEdBQWMsSSxDQUFkLEs7SUFBTyxHLEdBQU8sSSxDQUFQLEc7O0lBR2pCLEksR0FDRixjQUFZLEdBQVosRUFBaUI7QUFBQTs7QUFDYixTQUFLLE9BQUwsR0FBZSxJQUFJLE9BQUosQ0FBWSxLQUFaLEVBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUSxLQUFSLEVBQVg7QUFDSCxDOztJQUdDLFE7QUFDRixzQkFBWSxNQUFaLEVBQW9CLFFBQXBCLEVBQThCO0FBQUE7O0FBQzFCLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxhQUFLLElBQUwsR0FBWSxFQUFaO0FBQ0EsYUFBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLEVBQXBCO0FBQ0EsYUFBSyxLQUFMLEdBQWEsRUFBYjtBQUNBLGFBQUssV0FBTCxHQUFtQixLQUFuQjtBQUNBLGFBQUssUUFBTCxHQUFnQixDQUFoQjtBQUNBLGFBQUssU0FBTCxHQUFpQixDQUFqQjtBQUNBLGFBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNBLGFBQUssS0FBTCxHQUFhLElBQUksTUFBTSxLQUFWLEVBQWI7QUFDQSxhQUFLLE1BQUwsR0FBYyxJQUFJLE1BQU0sa0JBQVYsQ0FBNkIsQ0FBQyxLQUFLLE1BQUwsQ0FBWSxDQUFiLEdBQWlCLENBQTlDLEVBQWlELEtBQUssTUFBTCxDQUFZLENBQVosR0FBZ0IsQ0FBakUsRUFBb0UsQ0FBQyxLQUFLLE1BQUwsQ0FBWSxDQUFiLEdBQWlCLENBQXJGLEVBQXdGLEtBQUssTUFBTCxDQUFZLENBQVosR0FBZ0IsQ0FBeEcsRUFBMkcsQ0FBM0csRUFBOEcsSUFBOUcsQ0FBZDtBQUNBLGFBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsQ0FBckIsR0FBeUIsR0FBekI7O0FBRUEsYUFBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsYUFBSyxNQUFMLEdBQWMsQ0FBZDtBQUNBLGFBQUssTUFBTCxHQUFjLENBQWQ7QUFDSDs7OzswQ0FFaUI7QUFDZCxpQkFBSyxTQUFMLEdBQWlCLENBQUMsS0FBSyxTQUF2QjtBQUNBLHFCQUFTLEtBQVQsR0FBb0IsS0FBSyxNQUFMLENBQVksS0FBaEMsV0FBMEMsS0FBSyxTQUFMLEdBQWlCLFlBQWpCLEdBQWdDLFFBQTFFO0FBQ0g7Ozs4Q0FFcUI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDbEIscUNBQXlCLEtBQUssWUFBOUIsOEhBQTRDO0FBQUEsd0JBQWpDLFVBQWlDOztBQUN4QywrQkFBVyxLQUFYO0FBQ0g7QUFIaUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFJbEIsaUJBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNIOzs7a0NBRVM7QUFDTixpQkFBSyxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsaUJBQUssbUJBQUw7QUFDSDs7O2tDQUVTO0FBQ04sZ0JBQUksQ0FBQyxLQUFLLFFBQVYsRUFBb0I7QUFDcEIsaUJBQUssUUFBTDtBQUNBLGdCQUFJLEtBQUssU0FBVCxFQUFvQjtBQUNoQixxQkFBSyxZQUFMO0FBQ0g7QUFDRCxpQkFBSyxTQUFMO0FBQ0Esa0NBQXNCLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBdEI7QUFDSDs7O21DQUVVLEcsRUFBSztBQUNaLGdCQUFJLElBQUksSUFBSSxJQUFJLEdBQVIsRUFBYSxJQUFJLE9BQWpCLENBQUosSUFBaUMsQ0FBckMsRUFBd0M7QUFDcEMscUJBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsSUFBSSxJQUFKLENBQVMsR0FBVCxDQUFoQjtBQUNBLG9CQUFJLE9BQUosR0FBYyxJQUFJLEdBQUosQ0FBUSxLQUFSLEVBQWQ7QUFDQSxvQkFBSSxLQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLEtBQUssTUFBTCxDQUFZLFNBQXBDLEVBQStDO0FBQzNDLHlCQUFLLEtBQUwsR0FBYSxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLENBQWpCLENBQWI7QUFDSDtBQUNKO0FBQ0o7Ozt5Q0FFZ0IsQyxFQUFHLEMsRUFBRztBQUNuQixnQkFBTSxNQUFNLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTCxDQUFZLENBQVosR0FBZ0IsQ0FBckIsSUFBMEIsS0FBSyxNQUFMLENBQVksSUFBdkMsRUFBNkMsQ0FBQyxJQUFJLEtBQUssTUFBTCxDQUFZLENBQVosR0FBZ0IsQ0FBckIsSUFBMEIsS0FBSyxNQUFMLENBQVksSUFBbkYsQ0FBWjtBQUNBLGdCQUFJLE9BQU8sT0FBTyxpQkFBUCxDQUF5QixLQUFLLE1BQUwsQ0FBWSxRQUFyQyxDQUFYO0FBRm1CO0FBQUE7QUFBQTs7QUFBQTtBQUduQixzQ0FBa0IsS0FBSyxJQUF2QixtSUFBNkI7QUFBQSx3QkFBbEIsSUFBa0I7O0FBQ3pCLDJCQUFPLElBQUksSUFBSixFQUFVLENBQUMsSUFBSSxJQUFJLEtBQUksR0FBUixFQUFhLEdBQWIsQ0FBSixJQUF5QixLQUFJLFNBQUosRUFBMUIsSUFBNkMsR0FBdkQsQ0FBUDtBQUNIO0FBTGtCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBTW5CLGdCQUFNLElBQUksT0FBTyxpQkFBUCxDQUF5QixPQUFPLE9BQU8saUJBQVAsQ0FBeUIsS0FBSyxNQUFMLENBQVksUUFBckMsQ0FBUCxFQUF1RCxJQUF2RCxDQUF6QixDQUFWO0FBQ0EsZ0JBQU0sSUFBSSxnQkFBZ0IsT0FBTyxLQUFLLE1BQUwsQ0FBWSxZQUFaLEdBQTJCLENBQWxDLENBQWhCLEVBQXNELE9BQU8sQ0FBQyxHQUFSLEVBQWEsR0FBYixDQUF0RCxDQUFWO0FBQ0EsZ0JBQU0sUUFBUSxXQUFkO0FBQ0EsZ0JBQU0saUJBQWUsRUFBRSxLQUFLLFNBQTVCO0FBQ0EsZ0JBQU0sTUFBTSxJQUFJLE1BQUosQ0FBVyxLQUFLLE1BQWhCLEVBQXdCLENBQXhCLEVBQTJCLEdBQTNCLEVBQWdDLENBQWhDLEVBQW1DLEtBQW5DLEVBQTBDLEdBQTFDLEVBQStDLElBQS9DLENBQVo7QUFDQSxnQkFBSSxjQUFKLENBQW1CLENBQW5CLEVBQXNCLENBQXRCO0FBQ0EsaUJBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxHQUFmO0FBQ0g7OztxQ0FFWSxHLEVBQUssRyxFQUFLLEMsRUFBRyxDLEVBQUcsSyxFQUFPO0FBQ2hDLGdCQUFNLE1BQU0sSUFBSSxNQUFKLENBQVcsS0FBSyxNQUFoQixFQUF3QixDQUF4QixFQUEyQixHQUEzQixFQUFnQyxDQUFoQyxFQUFtQyxLQUFuQyxFQUEwQyxHQUExQyxFQUErQyxJQUEvQyxDQUFaO0FBQ0EsaUJBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxHQUFmO0FBQ0g7OzswQ0FFaUIsTSxFQUFpQjtBQUFBLGdCQUFULEdBQVMsdUVBQUgsQ0FBRzs7QUFDL0IsbUJBQU8sbUJBQWtCLE9BQU8sQ0FBUCxDQUFsQixFQUE2QixHQUE3QixDQUFQO0FBQ0g7Ozt1Q0FFYztBQUNYLG1CQUFPLENBQVA7QUFDSDs7OzZDQUVvQjtBQUNqQixnQkFBTSxZQUFZLEtBQUssTUFBTCxDQUFZLFNBQTlCO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLElBQUwsQ0FBVSxNQUE5QixFQUFzQyxHQUF0QyxFQUEyQztBQUN2QyxvQkFBTSxLQUFLLEtBQUssSUFBTCxDQUFVLENBQVYsQ0FBWDtBQUNBLHFCQUFLLElBQUksSUFBSSxJQUFJLENBQWpCLEVBQW9CLElBQUksS0FBSyxJQUFMLENBQVUsTUFBbEMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDM0Msd0JBQU0sS0FBSyxLQUFLLElBQUwsQ0FBVSxDQUFWLENBQVg7QUFDQSx3QkFBTSxZQUFZLElBQUksR0FBRyxHQUFQLEVBQVksR0FBRyxHQUFmLENBQWxCO0FBQ0Esd0JBQU0sU0FBUyxlQUFlLFNBQWYsQ0FBZjtBQUNBLHdCQUFNLElBQUksT0FBTyxLQUFQLEVBQVY7O0FBRUEsd0JBQUksSUFBSSxHQUFHLFNBQUgsS0FBaUIsR0FBRyxTQUFILEVBQXpCLEVBQXlDO0FBQ3JDLDRCQUFNLElBQUksS0FBSyxpQkFBTCxDQUF1QixNQUF2QixDQUFWO0FBQ0EsNEJBQU0sS0FBSyxLQUFLLGlCQUFMLENBQXVCLE1BQXZCLEVBQStCLENBQUMsQ0FBaEMsQ0FBWDtBQUNBLDRCQUFNLEtBQUksS0FBSyxZQUFMLEVBQVY7O0FBRUEsNEJBQU0sUUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFWLEVBQWEsQ0FBYixDQUFELEVBQWtCLE9BQU8sR0FBRyxDQUFWLEVBQWEsQ0FBYixDQUFsQixDQUFkO0FBQ0EsNEJBQU0sU0FBUyxDQUFDLE1BQU0sQ0FBTixFQUFTLEtBQVQsRUFBRCxFQUFtQixNQUFNLENBQU4sRUFBUyxLQUFULEVBQW5CLENBQWY7QUFDQSwrQkFBTyxDQUFQLEVBQVUsRUFBVixJQUFlLENBQUMsQ0FBQyxHQUFHLENBQUgsR0FBTyxHQUFHLENBQVgsSUFBZ0IsTUFBTSxDQUFOLEVBQVMsRUFBVCxDQUFoQixHQUE4QixJQUFJLEdBQUcsQ0FBUCxHQUFXLE1BQU0sQ0FBTixFQUFTLEVBQVQsQ0FBMUMsS0FBMEQsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFwRSxDQUFmO0FBQ0EsK0JBQU8sQ0FBUCxFQUFVLEVBQVYsSUFBZSxDQUFDLENBQUMsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFYLElBQWdCLE1BQU0sQ0FBTixFQUFTLEVBQVQsQ0FBaEIsR0FBOEIsSUFBSSxHQUFHLENBQVAsR0FBVyxNQUFNLENBQU4sRUFBUyxFQUFULENBQTFDLEtBQTBELEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBcEUsQ0FBZjtBQUNBLDJCQUFHLENBQUgsR0FBTyxPQUFPLE9BQU8sQ0FBUCxDQUFQLEVBQWtCLEVBQWxCLENBQVA7QUFDQSwyQkFBRyxDQUFILEdBQU8sT0FBTyxPQUFPLENBQVAsQ0FBUCxFQUFrQixFQUFsQixDQUFQOztBQUVBLDRCQUFNLFVBQVUsQ0FBQyxNQUFNLFNBQU4sQ0FBRCxFQUFtQixPQUFPLFNBQVAsRUFBa0IsQ0FBbEIsQ0FBbkIsQ0FBaEI7QUFDQSxnQ0FBUSxDQUFSLEVBQVcsRUFBWCxLQUFpQixPQUFPLENBQVAsRUFBVSxFQUFWLENBQWpCO0FBQ0EsZ0NBQVEsQ0FBUixFQUFXLEVBQVgsS0FBaUIsT0FBTyxDQUFQLEVBQVUsRUFBVixDQUFqQjtBQUNBLDJCQUFHLEdBQUgsR0FBUyxJQUFJLEdBQUcsR0FBUCxFQUFZLE9BQU8sUUFBUSxDQUFSLENBQVAsRUFBbUIsRUFBbkIsQ0FBWixDQUFUO0FBQ0EsMkJBQUcsR0FBSCxHQUFTLElBQUksR0FBRyxHQUFQLEVBQVksT0FBTyxRQUFRLENBQVIsQ0FBUCxFQUFtQixFQUFuQixDQUFaLENBQVQ7QUFDSDtBQUNKO0FBQ0o7QUFDSjs7O3VDQUVjO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ1gsc0NBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUEsd0JBQWxCLEdBQWtCOztBQUN6Qix3QkFBSSxpQkFBSjtBQUNIO0FBSFU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFJWCxpQkFBSyxrQkFBTDtBQUpXO0FBQUE7QUFBQTs7QUFBQTtBQUtYLHNDQUFrQixLQUFLLElBQXZCLG1JQUE2QjtBQUFBLHdCQUFsQixLQUFrQjs7QUFDekIsMEJBQUksaUJBQUo7QUFDQSx5QkFBSyxVQUFMLENBQWdCLEtBQWhCO0FBQ0g7QUFSVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU2Q7OztvQ0FFVztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNSLHNDQUFrQixLQUFLLElBQXZCLG1JQUE2QjtBQUFBLHdCQUFsQixHQUFrQjs7QUFDekIsd0JBQUksTUFBSjtBQUNIO0FBSE87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFJUixpQkFBSyxRQUFMLENBQWMsTUFBZCxDQUFxQixLQUFLLEtBQTFCLEVBQWlDLEtBQUssTUFBdEM7QUFDSDs7O21DQUVVO0FBQ1AsaUJBQUssUUFBTCxJQUFpQixDQUFqQjtBQUNBLGdCQUFNLGNBQWMsS0FBcEI7QUFDQSxnQkFBTSxXQUFXLGNBQWMsS0FBSyxXQUFwQztBQUNBLGdCQUFJLFdBQVcsQ0FBZixFQUFrQjtBQUNkLHdCQUFRLEdBQVIsRUFBZ0IsS0FBSyxRQUFMLEdBQWdCLFFBQWpCLEdBQTZCLENBQTVDO0FBQ0EscUJBQUssV0FBTCxHQUFtQixXQUFuQjtBQUNBLHFCQUFLLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDSDtBQUNKOzs7aUNBRVE7QUFDTCxpQkFBSyxNQUFMLENBQVksSUFBWixHQUFtQixDQUFDLEtBQUssTUFBTCxDQUFZLENBQWIsR0FBaUIsQ0FBcEM7QUFDQSxpQkFBSyxNQUFMLENBQVksS0FBWixHQUFvQixLQUFLLE1BQUwsQ0FBWSxDQUFaLEdBQWdCLENBQXBDO0FBQ0EsaUJBQUssTUFBTCxDQUFZLEdBQVosR0FBa0IsQ0FBQyxLQUFLLE1BQUwsQ0FBWSxDQUFiLEdBQWlCLENBQW5DO0FBQ0EsaUJBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsS0FBSyxNQUFMLENBQVksQ0FBWixHQUFnQixDQUFyQztBQUNBLGlCQUFLLE1BQUwsQ0FBWSxzQkFBWjtBQUNBLGlCQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLEtBQUssTUFBTCxDQUFZLENBQWxDLEVBQXFDLEtBQUssTUFBTCxDQUFZLENBQWpEO0FBQ0g7OztvQ0FFVyxDLEVBQUc7QUFDWCxnQkFBSSxDQUFDLEtBQUssU0FBVixFQUFxQjtBQUNqQjtBQUNIOztBQUVELGdCQUFJLFFBQVEsTUFBTSxFQUFFLE9BQUYsR0FBWSxLQUFLLE1BQUwsQ0FBWSxDQUFaLEdBQWdCLENBQWxDLEVBQXFDLEVBQUUsT0FBRixHQUFZLEtBQUssTUFBTCxDQUFZLENBQVosR0FBZ0IsQ0FBakUsSUFBc0UsTUFBTSxLQUFLLE1BQUwsR0FBYyxLQUFLLE1BQUwsQ0FBWSxDQUFaLEdBQWdCLENBQXBDLEVBQXVDLEtBQUssTUFBTCxHQUFjLEtBQUssTUFBTCxDQUFZLENBQVosR0FBZ0IsQ0FBckUsQ0FBbEY7QUFDQSxnQkFBSSxRQUFRLENBQUMsRUFBYixFQUFpQixTQUFTLElBQUksRUFBYjtBQUNqQixnQkFBSSxRQUFRLENBQUMsRUFBYixFQUFpQixTQUFTLElBQUksRUFBYjtBQUNqQixpQkFBSyxNQUFMLEdBQWMsRUFBRSxLQUFoQjtBQUNBLGlCQUFLLE1BQUwsR0FBYyxFQUFFLEtBQWhCO0FBQ0EsaUJBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsQ0FBckIsSUFBMEIsS0FBMUI7QUFDQSxpQkFBSyxNQUFMLENBQVksc0JBQVo7QUFDSDs7O29DQUVXLEMsRUFBRztBQUNYLGlCQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxpQkFBSyxNQUFMLEdBQWMsRUFBRSxLQUFoQjtBQUNBLGlCQUFLLE1BQUwsR0FBYyxFQUFFLEtBQWhCO0FBQ0g7OztrQ0FFUyxDLEVBQUc7QUFDVCxpQkFBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0g7OztxQ0FFWSxHLEVBQUs7QUFDZCxnQkFBTSxjQUFjLEtBQXBCO0FBQ0EsZ0JBQUksT0FBTyxLQUFLLE9BQVosSUFBdUIsY0FBYyxLQUFLLFFBQW5CLEdBQThCLENBQXpELEVBQTREO0FBQ3hELHFCQUFLLEtBQUwsSUFBYyxDQUFkO0FBQ0gsYUFGRCxNQUVPO0FBQ0gscUJBQUssS0FBTCxHQUFhLENBQWI7QUFDSDtBQUNELGlCQUFLLFFBQUwsR0FBZ0IsV0FBaEI7QUFDQSxpQkFBSyxPQUFMLEdBQWUsR0FBZjtBQUNBLG1CQUFPLEtBQUssTUFBTCxDQUFZLGlCQUFaLEdBQWdDLElBQUksS0FBSyxNQUFMLENBQVksbUJBQWhCLEVBQXFDLEtBQUssS0FBMUMsQ0FBdkM7QUFDSDs7OzJCQUVFLEcsRUFBSztBQUNKLGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLENBQUMsS0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQXhCO0FBQ0EsaUJBQUssTUFBTCxDQUFZLHNCQUFaO0FBQ0g7Ozs2QkFFSSxHLEVBQUs7QUFDTixpQkFBSyxNQUFMLENBQVksVUFBWixDQUF1QixDQUFDLEtBQUssWUFBTCxDQUFrQixHQUFsQixDQUF4QjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxzQkFBWjtBQUNIOzs7NkJBRUksRyxFQUFLO0FBQ04saUJBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsQ0FBQyxLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBeEI7QUFDQSxpQkFBSyxNQUFMLENBQVksc0JBQVo7QUFDSDs7OzhCQUVLLEcsRUFBSztBQUNQLGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLENBQUMsS0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQXhCO0FBQ0EsaUJBQUssTUFBTCxDQUFZLHNCQUFaO0FBQ0g7OzsrQkFFTSxHLEVBQUs7QUFDUixpQkFBSyxNQUFMLENBQVksSUFBWixJQUFvQixLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsSUFBeUIsR0FBN0M7QUFDQSxpQkFBSyxNQUFMLENBQVksc0JBQVo7QUFDSDs7O2dDQUVPLEcsRUFBSztBQUNULGlCQUFLLE1BQUwsQ0FBWSxJQUFaLElBQW9CLEtBQUssWUFBTCxDQUFrQixHQUFsQixJQUF5QixHQUE3QztBQUNBLGdCQUFJLEtBQUssTUFBTCxDQUFZLElBQVosR0FBbUIsSUFBdkIsRUFBNEIsS0FBSyxNQUFMLENBQVksSUFBWixHQUFtQixJQUFuQjtBQUM1QixpQkFBSyxNQUFMLENBQVksc0JBQVo7QUFDSDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7Ozs7Ozs7QUM1T0EsSUFBTSxXQUFXLFFBQVEsTUFBUixDQUFqQjtBQUNBLElBQU0sU0FBUyxRQUFRLGtCQUFSLENBQWY7O2VBQzZHLFFBQVEsU0FBUixDO0lBQXRHLE0sWUFBQSxNO0lBQVEsa0IsWUFBQSxrQjtJQUFvQixrQixZQUFBLGtCO0lBQW9CLFMsWUFBQSxTO0lBQVcsbUIsWUFBQSxtQjtJQUFxQixrQixZQUFBLGtCOztnQkFDL0QsUUFBUSxXQUFSLEM7SUFBakIsRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHOztJQUNWLEcsR0FBTyxJLENBQVAsRzs7SUFHRCxROzs7QUFDRixzQkFBWSxNQUFaLEVBQW9CLFFBQXBCLEVBQThCO0FBQUE7O0FBQUEsd0hBQ3BCLE1BRG9CLEVBQ1osUUFEWTs7QUFFMUIsY0FBSyxNQUFMLEdBQWMsSUFBSSxNQUFNLGlCQUFWLENBQTRCLEVBQTVCLEVBQWdDLE9BQU8sVUFBUCxHQUFvQixPQUFPLFdBQTNELEVBQXdFLEdBQXhFLEVBQTZFLElBQTdFLENBQWQ7QUFGMEI7QUFHN0I7Ozs7eUNBRWdCLEMsRUFBRyxDLEVBQUc7QUFDbkIsZ0JBQU0sU0FBUyxJQUFJLE1BQU0sT0FBVixFQUFmO0FBQ0EsbUJBQU8sR0FBUCxDQUFZLElBQUksS0FBSyxNQUFMLENBQVksQ0FBakIsR0FBc0IsQ0FBdEIsR0FBMEIsQ0FBckMsRUFBd0MsRUFBRSxJQUFJLEtBQUssTUFBTCxDQUFZLENBQWxCLElBQXVCLENBQXZCLEdBQTJCLENBQW5FLEVBQXNFLEdBQXRFO0FBQ0EsbUJBQU8sU0FBUCxDQUFpQixLQUFLLE1BQXRCO0FBQ0EsZ0JBQU0sTUFBTSxPQUFPLEdBQVAsQ0FBVyxLQUFLLE1BQUwsQ0FBWSxRQUF2QixFQUFpQyxTQUFqQyxFQUFaO0FBQ0EsZ0JBQU0sV0FBVyxDQUFDLEtBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsQ0FBdEIsR0FBMEIsSUFBSSxDQUEvQztBQUNBLGdCQUFNLFdBQVcsS0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixLQUFyQixHQUE2QixHQUE3QixDQUFpQyxJQUFJLGNBQUosQ0FBbUIsUUFBbkIsQ0FBakMsQ0FBakI7QUFDQSxnQkFBTSxNQUFNLENBQUMsU0FBUyxDQUFWLEVBQWEsU0FBUyxDQUF0QixFQUF5QixTQUFTLENBQWxDLENBQVo7O0FBRUEsZ0JBQUksT0FBTyxPQUFPLGlCQUFQLENBQXlCLEtBQUssTUFBTCxDQUFZLFFBQXJDLENBQVg7QUFUbUI7QUFBQTtBQUFBOztBQUFBO0FBVW5CLHFDQUFrQixLQUFLLElBQXZCLDhIQUE2QjtBQUFBLHdCQUFsQixJQUFrQjs7QUFDekIsMkJBQU8sSUFBSSxJQUFKLEVBQVUsQ0FBQyxJQUFJLElBQUksS0FBSSxHQUFSLEVBQWEsR0FBYixDQUFKLElBQXlCLEtBQUksU0FBSixFQUExQixJQUE2QyxHQUF2RCxDQUFQO0FBQ0g7QUFaa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFhbkIsZ0JBQU0sSUFBSSxPQUFPLGlCQUFQLENBQXlCLE9BQU8sT0FBTyxpQkFBUCxDQUF5QixLQUFLLE1BQUwsQ0FBWSxRQUFyQyxDQUFQLEVBQXVELElBQXZELENBQXpCLENBQVY7QUFDQSxnQkFBTSxJQUFJLG9CQUFvQixPQUFPLEtBQUssTUFBTCxDQUFZLFlBQVosR0FBMkIsQ0FBbEMsQ0FBcEIsRUFBMEQsT0FBTyxDQUFDLEdBQVIsRUFBYSxHQUFiLENBQTFELEVBQTZFLE9BQU8sQ0FBQyxHQUFSLEVBQWEsR0FBYixDQUE3RSxDQUFWO0FBQ0EsZ0JBQU0sUUFBUSxXQUFkO0FBQ0EsZ0JBQU0saUJBQWUsRUFBRSxLQUFLLFNBQTVCO0FBQ0EsZ0JBQU0sTUFBTSxJQUFJLE1BQUosQ0FBVyxLQUFLLE1BQWhCLEVBQXdCLENBQXhCLEVBQTJCLEdBQTNCLEVBQWdDLENBQWhDLEVBQW1DLEtBQW5DLEVBQTBDLEdBQTFDLEVBQStDLElBQS9DLENBQVo7QUFDQSxnQkFBSSxjQUFKLENBQW1CLENBQW5CLEVBQXNCLENBQXRCO0FBQ0EsaUJBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxHQUFmO0FBQ0g7OztxQ0FFWSxHLEVBQUssRyxFQUFLLEMsRUFBRyxDLEVBQUcsSyxFQUFPO0FBQ2hDLGdCQUFNLE1BQU0sSUFBSSxNQUFKLENBQVcsS0FBSyxNQUFoQixFQUF3QixDQUF4QixFQUEyQixHQUEzQixFQUFnQyxDQUFoQyxFQUFtQyxLQUFuQyxFQUEwQyxHQUExQyxFQUErQyxJQUEvQyxDQUFaO0FBQ0EsaUJBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxHQUFmO0FBQ0g7OzswQ0FFaUIsTSxFQUFpQjtBQUFBLGdCQUFULEdBQVMsdUVBQUgsQ0FBRzs7QUFDL0IsbUJBQU8sSUFBSSxtQkFBbUIsT0FBTyxDQUFQLENBQW5CLEVBQThCLEdBQTlCLENBQUosRUFBd0MsbUJBQW1CLE9BQU8sQ0FBUCxDQUFuQixFQUE4QixHQUE5QixDQUF4QyxFQUE0RSxHQUE1RSxDQUFQO0FBQ0g7Ozt1Q0FFYztBQUNYLG1CQUFPLENBQVA7QUFDSDs7O29DQUVXO0FBQUE7O0FBQ1IsaUJBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsS0FBSyxNQUFMLENBQVksQ0FBckMsRUFBd0MsS0FBSyxNQUFMLENBQVksQ0FBcEQ7QUFDQSxnQkFBTSxTQUFTLEVBQWY7QUFGUTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLHdCQUdHLEdBSEg7O0FBSUosdUNBQW1CLFlBQU07QUFDckIsNEJBQU0sU0FBUyxPQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLEdBQXpCLENBQWY7QUFDQSw0QkFBTSxJQUFJLE9BQU8sR0FBUCxFQUFWO0FBQ0EsK0JBQU8sSUFBUCxDQUFZLENBQUMsUUFBRCxFQUFXLE1BQVgsRUFBbUIsQ0FBbkIsRUFBc0IsSUFBSSxLQUExQixDQUFaO0FBQ0gscUJBSkQ7QUFKSTs7QUFHUixzQ0FBa0IsS0FBSyxJQUF2QixtSUFBNkI7QUFBQTtBQU01QjtBQVRPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx3QkFVRyxHQVZIOztBQVdKLHVDQUFtQixZQUFNO0FBQ3JCLDRCQUFNLFNBQVMsT0FBSyxNQUFMLENBQVksZUFBWixDQUE0QixHQUE1QixDQUFmO0FBQ0EsNEJBQU0sSUFBSSxPQUFPLEdBQVAsRUFBVjtBQUNBLCtCQUFPLElBQVAsQ0FBWSxDQUFDLFdBQUQsRUFBYyxNQUFkLEVBQXNCLENBQXRCLENBQVo7QUFDSCxxQkFKRDtBQVhJOztBQVVSLHNDQUFrQixLQUFLLElBQXZCLG1JQUE2QjtBQUFBO0FBTTVCO0FBaEJPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx3QkFpQkcsSUFqQkg7O0FBa0JKLHVDQUFtQixZQUFNO0FBQ3JCLDRCQUFNLFNBQVMsT0FBSyxNQUFMLENBQVksVUFBWixDQUF1QixJQUF2QixDQUFmO0FBQ0EsNEJBQU0sSUFBSSxPQUFPLEdBQVAsRUFBVjtBQUNBLCtCQUFPLElBQVAsQ0FBWSxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLENBQWpCLENBQVo7QUFDSCxxQkFKRDtBQWxCSTs7QUFpQlIsc0NBQW1CLEtBQUssS0FBeEIsbUlBQStCO0FBQUE7QUFNOUI7QUF2Qk87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUF3QlIsbUJBQU8sSUFBUCxDQUFZLFVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0I7QUFDeEIsdUJBQU8sRUFBRSxDQUFGLElBQU8sRUFBRSxDQUFGLENBQWQ7QUFDSCxhQUZEO0FBeEJRO0FBQUE7QUFBQTs7QUFBQTtBQTJCUixzQ0FBdUMsTUFBdkMsbUlBQStDO0FBQUE7QUFBQSx3QkFBbkMsSUFBbUM7QUFBQSx3QkFBN0IsTUFBNkI7QUFBQSx3QkFBckIsQ0FBcUI7QUFBQSx3QkFBbEIsS0FBa0I7O0FBQzNDLDRCQUFRLElBQVI7QUFDSSw2QkFBSyxRQUFMO0FBQ0ksaUNBQUssVUFBTCxDQUFnQixNQUFoQixFQUF3QixLQUF4QjtBQUNBO0FBQ0osNkJBQUssV0FBTDtBQUNJLGlDQUFLLGFBQUwsQ0FBbUIsTUFBbkI7QUFDQTtBQUNKLDZCQUFLLE1BQUw7QUFDSSxpQ0FBSyxRQUFMLENBQWMsTUFBZDtBQUNBO0FBVFI7QUFXSDtBQXZDTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBd0NYOzs7O0VBakZrQixROztBQW9GdkIsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7QUMzRkEsSUFBTSxXQUFXLFFBQVEsYUFBUixDQUFqQjtBQUNBLElBQU0sV0FBVyxRQUFRLGFBQVIsQ0FBakI7O2VBQ3NCLFFBQVEsUUFBUixDO0lBQWYsVyxZQUFBLFc7O0FBR1AsSUFBSSxTQUFTLElBQWI7QUFDQSxJQUFNLFNBQVM7QUFDWCxRQUFJLElBRE87QUFFWCxRQUFJLE1BRk87QUFHWCxRQUFJLE1BSE87QUFJWCxRQUFJLE9BSk87QUFLWCxRQUFJLFFBTE8sRUFLRztBQUNkLFFBQUksU0FOTyxFQUFmO0FBUUEsSUFBTSxtQkFBbUIsRUFBRSxtQkFBRixDQUF6Qjs7QUFFQSxTQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUIsTUFBckIsRUFBNkI7QUFDekIsV0FBTyxDQUFQLEdBQVcsaUJBQWlCLEtBQWpCLEVBQVg7QUFDQSxXQUFPLENBQVAsR0FBVyxpQkFBaUIsTUFBakIsRUFBWDtBQUNBLFFBQUksTUFBSixFQUFZLE9BQU8sTUFBUDtBQUNmOztBQUVELElBQU0sWUFBWSxJQUFJLE1BQU0sU0FBVixFQUFsQjtBQUNBLElBQU0sUUFBUSxJQUFJLE1BQU0sT0FBVixFQUFkO0FBQ0EsU0FBUyxPQUFULENBQWlCLENBQWpCLEVBQW9CLE1BQXBCLEVBQTRCO0FBQ3hCLFFBQU0sSUFBSSxFQUFFLEtBQVo7QUFDQSxRQUFNLElBQUksRUFBRSxLQUFaO0FBQ0EsUUFBSSxDQUFDLE9BQU8sU0FBWixFQUF1QjtBQUNuQixjQUFNLENBQU4sR0FBVyxJQUFJLE9BQU8sQ0FBWixHQUFpQixDQUFqQixHQUFxQixDQUEvQjtBQUNBLGNBQU0sQ0FBTixHQUFVLEVBQUUsSUFBSSxPQUFPLENBQWIsSUFBa0IsQ0FBbEIsR0FBc0IsQ0FBaEM7QUFDQSxnQkFBUSxHQUFSLENBQVksT0FBTyxNQUFuQjtBQUNBLGtCQUFVLGFBQVYsQ0FBd0IsS0FBeEIsRUFBK0IsT0FBTyxNQUF0QztBQUptQjtBQUFBO0FBQUE7O0FBQUE7QUFLbkIsaUNBQWtCLE9BQU8sSUFBekIsOEhBQStCO0FBQUEsb0JBQXBCLEdBQW9COztBQUMzQixvQkFBSSxhQUFhLFVBQVUsZUFBVixDQUEwQixJQUFJLE1BQTlCLENBQWpCO0FBQ0Esd0JBQVEsR0FBUixDQUFZLFVBQVo7QUFDQSxvQkFBSSxXQUFXLE1BQVgsR0FBb0IsQ0FBeEIsRUFBMkI7QUFDdkIsd0JBQUksY0FBSixDQUFtQixDQUFuQixFQUFzQixDQUF0QjtBQUNBLDJCQUFPLElBQVA7QUFDSDtBQUNKO0FBWmtCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBYW5CLGVBQU8sZ0JBQVAsQ0FBd0IsQ0FBeEIsRUFBMkIsQ0FBM0I7QUFDSDtBQUNKOztBQUVELFNBQVMsU0FBVCxDQUFtQixDQUFuQixFQUFzQixNQUF0QixFQUE4QjtBQUFBLFFBQ25CLE9BRG1CLEdBQ1IsQ0FEUSxDQUNuQixPQURtQjs7QUFFMUIsUUFBSSxXQUFXLEVBQWYsRUFBbUI7QUFBRTtBQUNqQixlQUFPLG1CQUFQO0FBQ0EsZUFBTyxlQUFQO0FBQ0gsS0FIRCxNQUdPLElBQUksV0FBVyxNQUFYLElBQXFCLE9BQU8sT0FBUCxLQUFtQixNQUE1QyxFQUFvRDtBQUN2RCxlQUFPLE9BQU8sT0FBUCxDQUFQLEVBQXdCLE9BQXhCO0FBQ0g7QUFDSjs7SUFFSyxTO0FBQ0YseUJBQWM7QUFBQTs7QUFBQTs7QUFDVixhQUFLLFFBQUwsR0FBZ0IsSUFBSSxNQUFNLGFBQVYsRUFBaEI7QUFDQSx5QkFBaUIsTUFBakIsQ0FBd0IsS0FBSyxRQUFMLENBQWMsVUFBdEM7QUFDQSxVQUFFLE1BQUYsRUFBVSxNQUFWLENBQWlCLGFBQUs7QUFDbEIscUJBQVMsQ0FBVCxFQUFZLE1BQUssTUFBakI7QUFDSCxTQUZEO0FBR0EsVUFBRSxLQUFLLFFBQUwsQ0FBYyxVQUFoQixFQUE0QixLQUE1QixDQUFrQyxhQUFLO0FBQ25DLG9CQUFRLENBQVIsRUFBVyxNQUFLLE1BQWhCO0FBQ0gsU0FGRDtBQUdBLFVBQUUsTUFBRixFQUFVLE9BQVYsQ0FBa0IsYUFBSztBQUNuQixzQkFBVSxDQUFWLEVBQWEsTUFBSyxNQUFsQjtBQUNILFNBRkQ7QUFHQSxVQUFFLFFBQUYsRUFBWSxTQUFaLENBQXNCLGFBQUs7QUFDdkIsa0JBQUssTUFBTCxDQUFZLFdBQVosQ0FBd0IsQ0FBeEI7QUFDSCxTQUZEO0FBR0EsVUFBRSxRQUFGLEVBQVksU0FBWixDQUFzQixhQUFLO0FBQ3ZCLGtCQUFLLE1BQUwsQ0FBWSxXQUFaLENBQXdCLENBQXhCO0FBQ0gsU0FGRDtBQUdBLFVBQUUsUUFBRixFQUFZLE9BQVosQ0FBb0IsYUFBSztBQUNyQixrQkFBSyxNQUFMLENBQVksU0FBWixDQUFzQixDQUF0QjtBQUNILFNBRkQ7QUFHSDs7Ozs2QkFFSSxNLEVBQVE7QUFDVCxnQkFBSSxLQUFLLE1BQVQsRUFBaUIsS0FBSyxNQUFMLENBQVksT0FBWjtBQUNqQixxQkFBUyxPQUFPLEVBQVAsQ0FBVDtBQUNBLHFCQUFTLEtBQVQsR0FBaUIsT0FBTyxLQUFQLEdBQWUsT0FBTyxTQUFQLENBQWlCLEtBQWpEO0FBQ0EsaUJBQUssTUFBTCxHQUFjLEtBQUssT0FBTyxTQUFQLElBQW9CLENBQXBCLEdBQXdCLFFBQXhCLEdBQW1DLFFBQXhDLEVBQWtELE1BQWxELEVBQTBELEtBQUssUUFBL0QsQ0FBZDtBQUNBLHFCQUFTLElBQVQsRUFBZSxLQUFLLE1BQXBCO0FBQ0EsZ0JBQUksVUFBVSxNQUFkLEVBQXNCLE9BQU8sSUFBUCxDQUFZLEtBQUssTUFBakI7QUFDdEIsaUJBQUssTUFBTCxDQUFZLE9BQVo7QUFDSDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFNBQWpCOzs7OztBQ3pGQSxTQUFTLElBQVQsQ0FBYyxDQUFkLEVBQWlCLElBQWpCLEVBQXVCO0FBQ25CLFFBQU0sTUFBTSxFQUFFLE1BQWQ7QUFDQSxRQUFNLElBQUksSUFBSSxLQUFKLENBQVUsR0FBVixDQUFWO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEdBQXBCLEVBQXlCLEdBQXpCLEVBQThCO0FBQzFCLFVBQUUsQ0FBRixJQUFPLEtBQUssQ0FBTCxDQUFQO0FBQ0g7QUFDRCxXQUFPLENBQVA7QUFDSDs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDYixXQUFPLGtCQUFLO0FBQ1IsZUFBTyxJQUFJLEtBQUosQ0FBVSxDQUFWLEVBQWEsSUFBYixDQUFrQixDQUFsQixDQUFQO0FBQ0gsS0FIWTs7QUFLYixTQUFLLGdCQUFLO0FBQ04sWUFBTSxNQUFNLEVBQUUsTUFBZDtBQUNBLFlBQUksTUFBTSxDQUFWO0FBQ0EsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEdBQXBCLEVBQXlCLEdBQXpCLEVBQThCO0FBQzFCLG1CQUFPLEVBQUUsQ0FBRixJQUFPLEVBQUUsQ0FBRixDQUFkO0FBQ0g7QUFDRCxlQUFPLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBUDtBQUNILEtBWlk7O0FBY2IsU0FBSyxhQUFDLENBQUQsRUFBSSxDQUFKLEVBQVU7QUFDWCxlQUFPLEtBQUssQ0FBTCxFQUFRLGFBQUs7QUFDaEIsbUJBQU8sRUFBRSxDQUFGLElBQU8sRUFBRSxDQUFGLENBQWQ7QUFDSCxTQUZNLENBQVA7QUFHSCxLQWxCWTs7QUFvQmIsU0FBSyxhQUFDLENBQUQsRUFBSSxDQUFKLEVBQVU7QUFDWCxlQUFPLEtBQUssQ0FBTCxFQUFRLGFBQUs7QUFDaEIsbUJBQU8sRUFBRSxDQUFGLElBQU8sRUFBRSxDQUFGLENBQWQ7QUFDSCxTQUZNLENBQVA7QUFHSCxLQXhCWTs7QUEwQmIsU0FBSyxhQUFDLENBQUQsRUFBSSxDQUFKLEVBQVU7QUFDWCxlQUFPLEtBQUssQ0FBTCxFQUFRLGFBQUs7QUFDaEIsbUJBQU8sRUFBRSxDQUFGLElBQU8sQ0FBZDtBQUNILFNBRk0sQ0FBUDtBQUdILEtBOUJZOztBQWdDYixTQUFLLGFBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNYLGVBQU8sS0FBSyxDQUFMLEVBQVEsYUFBSztBQUNoQixtQkFBTyxFQUFFLENBQUYsSUFBTyxDQUFkO0FBQ0gsU0FGTSxDQUFQO0FBR0gsS0FwQ1k7O0FBc0NiLFNBQUssYUFBQyxDQUFELEVBQUksQ0FBSixFQUFtQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNwQixZQUFJLE9BQU8sQ0FBQyxDQUFaLEVBQWU7QUFBQSx1QkFDRixDQUFDLENBQUQsRUFBSSxDQUFKLENBREU7QUFDVixhQURVO0FBQ1AsYUFETztBQUVkO0FBQ0QsWUFBTSxNQUFNLEVBQUUsTUFBZDtBQUNBLFlBQU0sTUFBTSxFQUFFLENBQUYsRUFBSyxNQUFqQjtBQUNBLFlBQU0sTUFBTSxFQUFFLENBQUYsRUFBSyxNQUFqQjtBQUNBLFlBQU0sSUFBSSxJQUFJLEtBQUosQ0FBVSxHQUFWLENBQVY7QUFDQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksR0FBcEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDMUIsY0FBRSxDQUFGLElBQU8sSUFBSSxLQUFKLENBQVUsR0FBVixDQUFQO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxHQUFwQixFQUF5QixHQUF6QixFQUE4QjtBQUMxQixrQkFBRSxDQUFGLEVBQUssQ0FBTCxJQUFVLENBQVY7QUFDQSxxQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEdBQXBCLEVBQXlCLEdBQXpCLEVBQThCO0FBQzFCLHNCQUFFLENBQUYsRUFBSyxDQUFMLEtBQVcsRUFBRSxDQUFGLEVBQUssQ0FBTCxJQUFVLEVBQUUsQ0FBRixFQUFLLENBQUwsQ0FBckI7QUFDSDtBQUNKO0FBQ0o7QUFDRCxlQUFPLENBQVA7QUFDSDtBQXhEWSxDQUFqQjs7Ozs7Ozs7O0FDVEEsSUFBTSxhQUFhLFFBQVEsd0JBQVIsQ0FBbkI7QUFDQSxJQUFNLGFBQWEsUUFBUSx1QkFBUixDQUFuQjs7ZUFDb0UsUUFBUSxTQUFSLEM7SUFBN0QsTyxZQUFBLE87SUFBUyxPLFlBQUEsTztJQUFTLGUsWUFBQSxlO0lBQWlCLGMsWUFBQSxjO0lBQWdCLE0sWUFBQSxNOztnQkFDakIsUUFBUSxXQUFSLEM7SUFBbEMsSyxhQUFBLEs7SUFBTyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHOztJQUMzQixHLEdBQVksSSxDQUFaLEc7SUFBSyxHLEdBQU8sSSxDQUFQLEc7O0lBR04sTTtBQUNGOzs7OztBQUtBLG9CQUFZLE1BQVosRUFBb0IsQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEIsQ0FBNUIsRUFBK0IsS0FBL0IsRUFBc0MsR0FBdEMsRUFBMkMsTUFBM0MsRUFBbUQ7QUFBQTs7QUFDL0MsYUFBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLGFBQUssQ0FBTCxHQUFTLENBQVQ7QUFDQSxhQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsYUFBSyxPQUFMLEdBQWUsSUFBSSxLQUFKLEVBQWY7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLGFBQUssR0FBTCxHQUFXLEdBQVg7QUFDQSxhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsYUFBSyxNQUFMLEdBQWMsS0FBSyxZQUFMLEVBQWQ7QUFDQSxhQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDSDs7Ozt1Q0FFYztBQUNYLGdCQUFJLEtBQUssTUFBVCxFQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLE1BQWxCLENBQXlCLEtBQUssTUFBOUI7QUFDakIsZ0JBQU0sV0FBVyxJQUFJLE1BQU0sY0FBVixDQUF5QixLQUFLLFNBQUwsRUFBekIsRUFBMkMsRUFBM0MsRUFBK0MsRUFBL0MsQ0FBakI7QUFDQSxnQkFBTSxXQUFXLElBQUksTUFBTSxpQkFBVixDQUE0QixFQUFDLE9BQU8sS0FBSyxLQUFiLEVBQTVCLENBQWpCO0FBQ0EsZ0JBQU0sU0FBUyxJQUFJLE1BQU0sSUFBVixDQUFlLFFBQWYsRUFBeUIsUUFBekIsQ0FBZjtBQUNBLG1CQUFPLGdCQUFQLEdBQTBCLEtBQTFCO0FBQ0EsaUJBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsQ0FBc0IsTUFBdEI7QUFDQSxtQkFBTyxNQUFQO0FBQ0g7OztvQ0FFVztBQUNSLG1CQUFPLE9BQU8saUJBQVAsQ0FBeUIsS0FBSyxDQUE5QixDQUFQO0FBQ0g7Ozs0Q0FFbUI7QUFDaEIsZ0JBQUksSUFBSSxNQUFNLEtBQUssTUFBTCxDQUFZLFNBQWxCLENBQVI7QUFEZ0I7QUFBQTtBQUFBOztBQUFBO0FBRWhCLHFDQUFrQixLQUFLLE1BQUwsQ0FBWSxJQUE5Qiw4SEFBb0M7QUFBQSx3QkFBekIsR0FBeUI7O0FBQ2hDLHdCQUFJLE9BQU8sSUFBWCxFQUFpQjtBQUNqQix3QkFBTSxTQUFTLElBQUksS0FBSyxHQUFULEVBQWMsSUFBSSxHQUFsQixDQUFmO0FBQ0Esd0JBQU0sWUFBWSxJQUFJLE1BQUosQ0FBbEI7QUFDQSx3QkFBTSxhQUFhLElBQUksTUFBSixFQUFZLFNBQVosQ0FBbkI7QUFDQSx3QkFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFVBQUosRUFBZ0IsSUFBSSxDQUFKLEdBQVEsT0FBTyxTQUFQLENBQXhCLENBQVAsQ0FBSjtBQUNIO0FBUmU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTaEIsZ0JBQUksSUFBSSxDQUFKLEVBQU8sQ0FBQyxLQUFLLE1BQUwsQ0FBWSxDQUFiLEdBQWlCLEtBQUssQ0FBN0IsQ0FBSjtBQUNBLGdCQUFNLElBQUksSUFBSSxDQUFKLEVBQU8sS0FBSyxDQUFaLENBQVY7QUFDQSxpQkFBSyxDQUFMLEdBQVMsSUFBSSxLQUFLLENBQVQsRUFBWSxDQUFaLENBQVQ7QUFDSDs7OzRDQUVtQjtBQUNoQixpQkFBSyxHQUFMLEdBQVcsSUFBSSxLQUFLLEdBQVQsRUFBYyxLQUFLLENBQW5CLENBQVg7QUFDSDs7O2lDQUVRO0FBQ0wsaUJBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsQ0FBckIsR0FBeUIsS0FBSyxHQUFMLENBQVMsQ0FBVCxDQUF6QjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLENBQXJCLEdBQXlCLEtBQUssR0FBTCxDQUFTLENBQVQsQ0FBekI7QUFDQSxpQkFBSyxNQUFMLENBQVksWUFBWjtBQUNIOzs7aUNBRVEsQyxFQUFHO0FBQ1IsZ0JBQU0sSUFBSSxLQUFLLFdBQUwsQ0FBaUIsR0FBakIsRUFBVjtBQUNBLGlCQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsaUJBQUssTUFBTCxHQUFjLEtBQUssWUFBTCxFQUFkO0FBQ0g7OzttQ0FFVSxDLEVBQUc7QUFDVixnQkFBTSxJQUFJLEtBQUssY0FBTCxDQUFvQixHQUFwQixFQUFWO0FBQ0EsZ0JBQU0sSUFBSSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBVjtBQUNBLGlCQUFLLEdBQUwsR0FBVyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVg7QUFDSDs7O2lDQUVRLEMsRUFBRztBQUNSLGdCQUFNLE1BQU0sS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVo7QUFDQSxnQkFBTSxNQUFNLFFBQVEsS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVIsQ0FBWjtBQUNBLGlCQUFLLENBQUwsR0FBUyxnQkFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsQ0FBVDtBQUNIOzs7dUNBRWMsQyxFQUFHLEMsRUFBRztBQUNqQixnQkFBSSxLQUFLLFVBQUwsSUFBbUIsS0FBSyxVQUFMLENBQWdCLE1BQWhCLEVBQXZCLEVBQWlEO0FBQzdDLG9CQUFNLGNBQWMsS0FBSyxVQUFMLENBQWdCLFdBQXBDO0FBQ0EsNEJBQVksR0FBWixDQUFnQixNQUFoQixFQUF3QixJQUFJLElBQTVCO0FBQ0EsNEJBQVksR0FBWixDQUFnQixLQUFoQixFQUF1QixJQUFJLElBQTNCO0FBQ0EsNEJBQVksU0FBWixDQUFzQix1QkFBdEIsRUFBK0MsWUFBL0MsQ0FBNEQsV0FBNUQ7QUFDSCxhQUxELE1BS087QUFDSCxvQkFBTSxTQUFTLEdBQWY7O0FBRUEsb0JBQUksV0FBVyxJQUFJLElBQUksS0FBSyxNQUFMLENBQVksQ0FBaEIsRUFBbUIsS0FBSyxNQUFMLENBQVksQ0FBL0IsSUFBb0MsQ0FBeEMsRUFBMkMsSUFBSSxLQUFKLENBQVUsSUFBVixFQUFnQixLQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsS0FBSyxHQUFsQixDQUFoQixJQUEwQyxNQUFyRixDQUFmO0FBSEc7QUFBQTtBQUFBOztBQUFBO0FBSUgsMENBQWtCLEtBQUssTUFBTCxDQUFZLElBQTlCLG1JQUFvQztBQUFBLDRCQUF6QixHQUF5Qjs7QUFDaEMsbUNBQVcsSUFBSSxRQUFKLEVBQWMsSUFBSSxLQUFKLENBQVUsSUFBVixFQUFnQixJQUFJLEdBQUosQ0FBUSxHQUFSLENBQVksS0FBSyxHQUFqQixDQUFoQixJQUF5QyxNQUF2RCxDQUFYO0FBQ0g7QUFORTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVFILG9CQUFNLElBQUksS0FBSyxDQUFmOztBQUVBLG9CQUFNLElBQUksZUFBZSxLQUFLLENBQXBCLENBQVY7QUFDQSxvQkFBSSxTQUFTLElBQUksS0FBSyxNQUFMLENBQVksWUFBaEIsRUFBOEIsSUFBSSxLQUFLLENBQVQsSUFBYyxNQUE1QyxDQUFiO0FBWEc7QUFBQTtBQUFBOztBQUFBO0FBWUgsMENBQWtCLEtBQUssTUFBTCxDQUFZLElBQTlCLG1JQUFvQztBQUFBLDRCQUF6QixJQUF5Qjs7QUFDaEMsaUNBQVMsSUFBSSxNQUFKLEVBQVksSUFBSSxLQUFJLENBQVIsSUFBYSxNQUF6QixDQUFUO0FBQ0g7QUFkRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWdCSCxxQkFBSyxpQkFBTCxDQUF1QixRQUF2QixFQUFpQyxDQUFqQyxFQUFvQyxDQUFwQyxFQUF1QyxNQUF2QztBQUNBLHFCQUFLLFVBQUwsR0FBa0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixLQUFLLEdBQTFCLEVBQStCLEtBQUssY0FBTCxFQUEvQixFQUFzRCxDQUF0RCxFQUF5RCxDQUF6RCxDQUFsQjtBQUNBLHFCQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLElBQXpCLENBQThCLEtBQUssVUFBbkM7QUFDSDtBQUNKOzs7MENBRWlCLFEsRUFBVSxDLEVBQUcsQyxFQUFHLE0sRUFBUTtBQUN0QyxpQkFBSyxXQUFMLEdBQW1CLElBQUksVUFBSixDQUFlLElBQWYsRUFBcUIsUUFBckIsRUFBK0IsS0FBSyxNQUFMLENBQVksUUFBM0MsRUFBcUQsS0FBSyxNQUFMLENBQVksUUFBakUsRUFBMkUsQ0FBM0UsRUFBOEUsS0FBSyxRQUFuRixDQUFuQjtBQUNBLGlCQUFLLGNBQUwsR0FBc0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFDLFFBQXBDLEVBQThDLFFBQTlDLEVBQXdELEtBQUssR0FBTCxDQUFTLENBQVQsQ0FBeEQsRUFBcUUsS0FBSyxVQUExRSxDQUF0QjtBQUNBLGlCQUFLLGNBQUwsR0FBc0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFDLFFBQXBDLEVBQThDLFFBQTlDLEVBQXdELEtBQUssR0FBTCxDQUFTLENBQVQsQ0FBeEQsRUFBcUUsS0FBSyxVQUExRSxDQUF0QjtBQUNBLGlCQUFLLGNBQUwsR0FBc0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFuQyxFQUFzQyxNQUF0QyxFQUE4QyxFQUFFLENBQUYsQ0FBOUMsRUFBb0QsS0FBSyxRQUF6RCxDQUF0QjtBQUNBLGlCQUFLLGNBQUwsR0FBc0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFDLEdBQXBDLEVBQXlDLEdBQXpDLEVBQThDLFFBQVEsRUFBRSxDQUFGLENBQVIsQ0FBOUMsRUFBNkQsS0FBSyxRQUFsRSxDQUF0QjtBQUNIOzs7eUNBRWdCO0FBQ2IsbUJBQU8sQ0FDSCxLQUFLLFdBREYsRUFFSCxLQUFLLGNBRkYsRUFHSCxLQUFLLGNBSEYsRUFJSCxLQUFLLGNBSkYsRUFLSCxLQUFLLGNBTEYsQ0FBUDtBQU9IOzs7a0NBRVM7QUFDTixnQkFBTSxJQUFJLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsT0FBakIsQ0FBeUIsSUFBekIsQ0FBVjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE1BQWpCLENBQXdCLENBQXhCLEVBQTJCLENBQTNCO0FBQ0EsZ0JBQUksS0FBSyxVQUFMLElBQW1CLEtBQUssVUFBTCxDQUFnQixNQUFoQixFQUF2QixFQUFpRDtBQUM3QyxxQkFBSyxVQUFMLENBQWdCLEtBQWhCO0FBQ0g7QUFDSjs7O21DQVVVO0FBQ1AsbUJBQU8sS0FBSyxTQUFMLENBQWUsRUFBQyxPQUFPLEtBQUssR0FBYixFQUFrQixLQUFLLEtBQUssQ0FBNUIsRUFBK0IsT0FBTyxLQUFLLEdBQTNDLEVBQWYsQ0FBUDtBQUNIOzs7MENBVndCLEMsRUFBRztBQUN4QixtQkFBTyxJQUFJLENBQUosRUFBTyxJQUFJLENBQVgsQ0FBUDtBQUNIOzs7MENBRXdCLEMsRUFBRztBQUN4QixtQkFBTyxPQUFPLENBQVAsQ0FBUDtBQUNIOzs7Ozs7QUFPTCxPQUFPLE9BQVAsR0FBaUIsTUFBakI7Ozs7Ozs7Ozs7Ozs7OztBQ3JKQSxJQUFNLFNBQVMsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNLGFBQWEsUUFBUSx1QkFBUixDQUFuQjs7ZUFDZ0QsUUFBUSxTQUFSLEM7SUFBekMsTyxZQUFBLE87SUFBUyxPLFlBQUEsTztJQUFTLG1CLFlBQUEsbUI7O2dCQUNWLFFBQVEsU0FBUixDO0lBQVIsSSxhQUFBLEk7O0lBQ0EsRyxHQUFPLEksQ0FBUCxHOztJQUdELE07Ozs7Ozs7Ozs7OztBQUNGOzs7OztvQ0FLWTtBQUNSLG1CQUFPLE9BQU8saUJBQVAsQ0FBeUIsS0FBSyxDQUE5QixDQUFQO0FBQ0g7OzttQ0FFVSxDLEVBQUc7QUFDVixnQkFBTSxJQUFJLEtBQUssY0FBTCxDQUFvQixHQUFwQixFQUFWO0FBQ0EsZ0JBQU0sSUFBSSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsRUFBVjtBQUNBLGdCQUFNLElBQUksS0FBSyxjQUFMLENBQW9CLEdBQXBCLEVBQVY7QUFDQSxpQkFBSyxHQUFMLEdBQVcsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBWDtBQUNIOzs7aUNBRVEsQyxFQUFHO0FBQ1IsZ0JBQU0sTUFBTSxRQUFRLEtBQUssY0FBTCxDQUFvQixHQUFwQixFQUFSLENBQVo7QUFDQSxnQkFBTSxRQUFRLFFBQVEsS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUFSLENBQWQ7QUFDQSxnQkFBTSxNQUFNLEtBQUssY0FBTCxDQUFvQixHQUFwQixFQUFaO0FBQ0EsaUJBQUssQ0FBTCxHQUFTLG9CQUFvQixHQUFwQixFQUF5QixHQUF6QixFQUE4QixLQUE5QixDQUFUO0FBQ0g7OzswQ0FFaUIsUyxFQUFXLEMsRUFBRyxDLEVBQUcsTyxFQUFTO0FBQ3hDLDhIQUF3QixTQUF4QixFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxFQUF5QyxPQUF6QztBQUNBLGlCQUFLLGNBQUwsR0FBc0IsSUFBSSxVQUFKLENBQWUsSUFBZixFQUFxQixZQUFyQixFQUFtQyxDQUFDLFNBQXBDLEVBQStDLFNBQS9DLEVBQTBELEtBQUssR0FBTCxDQUFTLENBQVQsQ0FBMUQsRUFBdUUsS0FBSyxVQUE1RSxDQUF0QjtBQUNBLGlCQUFLLGdCQUFMLEdBQXdCLElBQUksVUFBSixDQUFlLElBQWYsRUFBcUIsWUFBckIsRUFBbUMsQ0FBQyxHQUFwQyxFQUF5QyxHQUF6QyxFQUE4QyxRQUFRLEVBQUUsQ0FBRixDQUFSLENBQTlDLEVBQTZELEtBQUssUUFBbEUsQ0FBeEI7QUFDSDs7O3lDQUVnQjtBQUNiLG1CQUFPLENBQ0gsS0FBSyxXQURGLEVBRUgsS0FBSyxjQUZGLEVBR0gsS0FBSyxjQUhGLEVBSUgsS0FBSyxjQUpGLEVBS0gsS0FBSyxjQUxGLEVBTUgsS0FBSyxjQU5GLEVBT0gsS0FBSyxnQkFQRixDQUFQO0FBU0g7OzswQ0FFd0IsQyxFQUFHO0FBQ3hCLG1CQUFPLElBQUksQ0FBSixFQUFPLElBQUksQ0FBWCxDQUFQO0FBQ0g7OzswQ0FFd0IsQyxFQUFHO0FBQ3hCLG1CQUFPLEtBQUssQ0FBTCxDQUFQO0FBQ0g7Ozs7RUFoRGdCLE07O0FBbURyQixPQUFPLE9BQVAsR0FBaUIsTUFBakI7Ozs7O2VDMURtQixRQUFRLFVBQVIsQztJQUFaLEcsWUFBQSxHO0lBQUssRyxZQUFBLEc7O0FBRVosSUFBTSxPQUFPO0FBQ1QsWUFBUSxnQkFBQyxDQUFELEVBQU87QUFDWCxlQUFPLElBQUksQ0FBWDtBQUNILEtBSFE7O0FBS1QsVUFBTSxjQUFDLENBQUQsRUFBTztBQUNULGVBQU8sSUFBSSxDQUFKLEdBQVEsQ0FBZjtBQUNILEtBUFE7O0FBU1QscUJBQWlCLHlCQUFDLEdBQUQsRUFBTSxHQUFOLEVBQWM7QUFDM0IsZUFBTyxDQUNILE1BQU0sS0FBSyxHQUFMLENBQVMsR0FBVCxDQURILEVBRUgsTUFBTSxLQUFLLEdBQUwsQ0FBUyxHQUFULENBRkgsQ0FBUDtBQUlILEtBZFE7O0FBZ0JULHFCQUFpQix5QkFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ3ZCLGVBQU8sQ0FDSCxJQUFJLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBSixDQURHLEVBRUgsS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FGRyxDQUFQO0FBSUgsS0FyQlE7O0FBdUJULHlCQUFxQiw2QkFBQyxHQUFELEVBQU0sR0FBTixFQUFXLEtBQVgsRUFBcUI7QUFDdEMsZUFBTyxDQUNILE1BQU0sS0FBSyxHQUFMLENBQVMsS0FBVCxDQUFOLEdBQXdCLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FEckIsRUFFSCxNQUFNLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FBTixHQUF3QixLQUFLLEdBQUwsQ0FBUyxHQUFULENBRnJCLEVBR0gsTUFBTSxLQUFLLEdBQUwsQ0FBUyxLQUFULENBSEgsQ0FBUDtBQUtILEtBN0JROztBQStCVCx5QkFBcUIsNkJBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQWE7QUFDOUIsWUFBTSxNQUFNLElBQUksQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBSixDQUFaO0FBQ0EsZUFBTyxDQUNILEdBREcsRUFFSCxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsQ0FBZCxDQUZHLEVBR0gsT0FBTyxDQUFQLEdBQVcsS0FBSyxJQUFMLENBQVUsSUFBSSxHQUFkLENBQVgsR0FBZ0MsQ0FIN0IsQ0FBUDtBQUtILEtBdENROztBQXdDVCxvQkFBZ0Isd0JBQUMsTUFBRCxFQUFZO0FBQ3hCLGVBQU8sT0FBTyxNQUFQLElBQWlCLENBQWpCLEdBQ0QsS0FBSyxlQUFMLENBQXFCLE9BQU8sQ0FBUCxDQUFyQixFQUFnQyxPQUFPLENBQVAsQ0FBaEMsQ0FEQyxHQUVELEtBQUssbUJBQUwsQ0FBeUIsT0FBTyxDQUFQLENBQXpCLEVBQW9DLE9BQU8sQ0FBUCxDQUFwQyxFQUErQyxPQUFPLENBQVAsQ0FBL0MsQ0FGTjtBQUdILEtBNUNROztBQThDVCxhQUFTLGlCQUFDLEdBQUQsRUFBUztBQUNkLGVBQU8sTUFBTSxLQUFLLEVBQVgsR0FBZ0IsR0FBdkI7QUFDSCxLQWhEUTs7QUFrRFQsYUFBUyxpQkFBQyxHQUFELEVBQVM7QUFDZCxlQUFPLE1BQU0sR0FBTixHQUFZLEtBQUssRUFBeEI7QUFDSCxLQXBEUTs7QUFzRFQsaUJBQWEscUJBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYixFQUFvQjtBQUM3QixlQUFPLElBQUksQ0FBQyxLQUFLLEVBQU4sRUFBVSxLQUFLLEVBQWYsQ0FBSixDQUFQO0FBQ0gsS0F4RFE7O0FBMERULFlBQVEsZ0JBQUMsTUFBRCxFQUFTLE1BQVQsRUFBb0I7QUFDeEIsZUFBTyxJQUFJLENBQUMsTUFBRCxDQUFKLEVBQWMsTUFBZCxFQUFzQixDQUF0QixDQUFQO0FBQ0gsS0E1RFE7O0FBOERULFNBQUssZUFBTTtBQUNQLGVBQU8sSUFBSSxJQUFKLEdBQVcsT0FBWCxLQUF1QixJQUE5QjtBQUNILEtBaEVROztBQWtFVCxZQUFRLGdCQUFDLEdBQUQsRUFBcUI7QUFBQSxZQUFmLEdBQWUsdUVBQVQsSUFBUzs7QUFDekIsWUFBSSxPQUFPLElBQVgsRUFBaUI7QUFDYixrQkFBTSxHQUFOO0FBQ0Esa0JBQU0sQ0FBTjtBQUNIO0FBQ0QsZUFBTyxLQUFLLE1BQUwsTUFBaUIsTUFBTSxHQUF2QixJQUE4QixHQUFyQztBQUNILEtBeEVROztBQTBFVCxlQUFXLHFCQUFNO0FBQ2IsZUFBTyxLQUFLLE1BQUwsS0FBZ0IsUUFBdkI7QUFDSCxLQTVFUTs7QUE4RVQsdUJBQW1CLDJCQUFDLENBQUQsRUFBZ0I7QUFBQSxZQUFaLEdBQVksdUVBQU4sQ0FBTTs7QUFDL0IsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsZUFBTyxDQUNILENBQUMsR0FBRCxFQUFNLENBQUMsR0FBUCxDQURHLEVBRUgsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUZHLENBQVA7QUFJSCxLQXJGUTs7QUF1RlQsd0JBQW9CLDRCQUFDLENBQUQsRUFBZ0I7QUFBQSxZQUFaLEdBQVksdUVBQU4sQ0FBTTs7QUFDaEMsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsZUFBTyxDQUNILENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBREcsRUFFSCxDQUFDLENBQUQsRUFBSSxHQUFKLEVBQVMsQ0FBQyxHQUFWLENBRkcsRUFHSCxDQUFDLENBQUQsRUFBSSxHQUFKLEVBQVMsR0FBVCxDQUhHLENBQVA7QUFLSCxLQS9GUTs7QUFpR1Qsd0JBQW9CLDRCQUFDLENBQUQsRUFBZ0I7QUFBQSxZQUFaLEdBQVksdUVBQU4sQ0FBTTs7QUFDaEMsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsZUFBTyxDQUNILENBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxHQUFULENBREcsRUFFSCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUZHLEVBR0gsQ0FBQyxDQUFDLEdBQUYsRUFBTyxDQUFQLEVBQVUsR0FBVixDQUhHLENBQVA7QUFLSCxLQXpHUTs7QUEyR1Qsd0JBQW9CLDRCQUFDLENBQUQsRUFBZ0I7QUFBQSxZQUFaLEdBQVksdUVBQU4sQ0FBTTs7QUFDaEMsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsZUFBTyxDQUNILENBQUMsR0FBRCxFQUFNLENBQUMsR0FBUCxFQUFZLENBQVosQ0FERyxFQUVILENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxDQUFYLENBRkcsRUFHSCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUhHLENBQVA7QUFLSDtBQW5IUSxDQUFiOztBQXNIQSxPQUFPLE9BQVAsR0FBaUIsSUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgcHJlc2V0cyA9IHJlcXVpcmUoJy4vcHJlc2V0Jyk7XG5jb25zdCBTaW11bGF0b3IgPSByZXF1aXJlKCcuL3NpbXVsYXRvcicpO1xuXG5jb25zdCBzaW11bGF0b3IgPSBuZXcgU2ltdWxhdG9yKCk7XG5sZXQgc2VsZWN0ZWQgPSAwO1xuc2ltdWxhdG9yLmluaXQocHJlc2V0c1tzZWxlY3RlZF0pO1xuXG5jb25zdCAkc2VsZWN0ID0gJCgnc2VsZWN0Jyk7XG5mb3IgKGxldCBpID0gMDsgaSA8IHByZXNldHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwcmVzZXQgPSBwcmVzZXRzW2ldO1xuICAgICRzZWxlY3QuYXBwZW5kKGA8b3B0aW9uIHZhbHVlPVwiJHtpfVwiJHtpID09IHNlbGVjdGVkID8gJyBzZWxlY3RlZCcgOiAnJ30+JHtwcmVzZXQucHJvdG90eXBlLnRpdGxlfTwvb3B0aW9uPmApO1xufVxuJHNlbGVjdC5jaGFuZ2UoKCkgPT4ge1xuICAgIHNlbGVjdGVkID0gcGFyc2VJbnQoJHNlbGVjdC5maW5kKCc6c2VsZWN0ZWQnKS52YWwoKSk7XG4gICAgc2ltdWxhdG9yLmluaXQocHJlc2V0c1tzZWxlY3RlZF0pO1xufSk7XG4kc2VsZWN0LmZvY3VzKCgpID0+IHtcbiAgICAkc2VsZWN0LmJsdXIoKTtcbn0pO1xuJCgnI3Jlc2V0JykuY2xpY2soKCkgPT4ge1xuICAgIHNpbXVsYXRvci5pbml0KHByZXNldHNbc2VsZWN0ZWRdKTtcbn0pO1xuXG5cbmxldCAkbW92aW5nID0gbnVsbDtcbmxldCBweCwgcHk7XG5cbiQoJ2JvZHknKS5vbignbW91c2Vkb3duJywgJy5jb250cm9sLWJveCAudGl0bGUtYmFyJywgZnVuY3Rpb24gKGUpIHtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcgPSAkKHRoaXMpLnBhcmVudCgnLmNvbnRyb2wtYm94Jyk7XG4gICAgJG1vdmluZy5uZXh0VW50aWwoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpLmluc2VydEJlZm9yZSgkbW92aW5nKTtcbiAgICByZXR1cm4gZmFsc2U7XG59KTtcblxuJCgnYm9keScpLm1vdXNlbW92ZShmdW5jdGlvbiAoZSkge1xuICAgIGlmICghJG1vdmluZykgcmV0dXJuO1xuICAgIGNvbnN0IHggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcuY3NzKCdsZWZ0JywgcGFyc2VJbnQoJG1vdmluZy5jc3MoJ2xlZnQnKSkgKyAoeCAtIHB4KSArICdweCcpO1xuICAgICRtb3ZpbmcuY3NzKCd0b3AnLCBwYXJzZUludCgkbW92aW5nLmNzcygndG9wJykpICsgKHkgLSBweSkgKyAncHgnKTtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xufSk7XG5cbiQoJ2JvZHknKS5tb3VzZXVwKGZ1bmN0aW9uIChlKSB7XG4gICAgJG1vdmluZyA9IG51bGw7XG59KTsiLCJjb25zdCB7ZXh0ZW5kfSA9ICQ7XG5cblxuZnVuY3Rpb24gRU1QVFlfMkQoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgYywge1xuICAgICAgICBCQUNLR1JPVU5EOiAnd2hpdGUnLFxuICAgICAgICBESU1FTlNJT046IDIsXG4gICAgICAgIE1BWF9QQVRIUzogMTAwMCxcbiAgICAgICAgQ0FNRVJBX0NPT1JEX1NURVA6IDUsXG4gICAgICAgIENBTUVSQV9BTkdMRV9TVEVQOiAxLFxuICAgICAgICBDQU1FUkFfQUNDRUxFUkFUSU9OOiAxLjEsXG4gICAgICAgIEc6IDAuMSxcbiAgICAgICAgTUFTU19NSU46IDEsXG4gICAgICAgIE1BU1NfTUFYOiA0ZTQsXG4gICAgICAgIFZFTE9DSVRZX01BWDogMTAsXG4gICAgICAgIERJUkVDVElPTl9MRU5HVEg6IDUwLFxuICAgICAgICBDQU1FUkFfWDogMCxcbiAgICAgICAgQ0FNRVJBX1k6IDAsXG4gICAgICAgIENBTUVSQV9aOiAyMDAsXG4gICAgICAgIEZPQ0FMX0xFTkdUSDogMTAwLFxuICAgICAgICBJTlBVVF9UWVBFOiAncmFuZ2UnXG4gICAgfSk7XG59XG5FTVBUWV8yRC5wcm90b3R5cGUudGl0bGUgPSAnMkQgR3Jhdml0eSBTaW11bGF0b3InO1xuXG5cbmZ1bmN0aW9uIEVNUFRZXzNEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzJEKGMpLCB7XG4gICAgICAgIERJTUVOU0lPTjogMyxcbiAgICAgICAgRzogMC4wMDEsXG4gICAgICAgIE1BU1NfTUlOOiAxLFxuICAgICAgICBNQVNTX01BWDogOGU2LFxuICAgICAgICBWRUxPQ0lUWV9NQVg6IDEwXG4gICAgfSk7XG59XG5FTVBUWV8zRC5wcm90b3R5cGUudGl0bGUgPSAnM0QgR3Jhdml0eSBTaW11bGF0b3InO1xuXG5mdW5jdGlvbiBXT09fMkQoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfMkQoYyksIHtcbiAgICAgICAgSU5QVVRfVFlQRTogJ251bWJlcidcbiAgICB9KTtcbn1cbldPT18yRC5wcm90b3R5cGUudGl0bGUgPSAnMkQgV09PJztcblxuZnVuY3Rpb24gV09PXzNEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzNEKGMpLCB7XG4gICAgICAgIElOUFVUX1RZUEU6ICdudW1iZXInXG4gICAgfSk7XG59XG5XT09fM0QucHJvdG90eXBlLnRpdGxlID0gJzNEIFdPTyc7XG5cbmZ1bmN0aW9uIERFQlVHKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzNEKGMpLCB7XG4gICAgICAgIGluaXQ6IChlbmdpbmUpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ2JhbGwxJywgWy0xNTAsIDAsIDBdLCAxMDAwMDAwLCBbMCwgMCwgMF0sICdncmVlbicpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnYmFsbDInLCBbNTAsIDAsIDBdLCAxMDAwMCwgWzAsIDAsIDBdLCAnYmx1ZScpO1xuICAgICAgICAgICAgZW5naW5lLnRvZ2dsZUFuaW1hdGluZygpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5ERUJVRy5wcm90b3R5cGUudGl0bGUgPSAnREVCVUcnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtFTVBUWV8yRCwgRU1QVFlfM0QsIFdPT18yRCwgV09PXzNELCBERUJVR107IiwiY2xhc3MgQ29udHJvbEJveCB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCB0aXRsZSwgY29udHJvbGxlcnMsIHgsIHkpIHtcbiAgICAgICAgY29uc3QgJHRlbXBsYXRlQ29udHJvbEJveCA9ICQoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpO1xuICAgICAgICBjb25zdCAkY29udHJvbEJveCA9ICR0ZW1wbGF0ZUNvbnRyb2xCb3guY2xvbmUoKTtcbiAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy50aXRsZScpLnRleHQodGl0bGUpO1xuICAgICAgICBjb25zdCAkaW5wdXRDb250YWluZXIgPSAkY29udHJvbEJveC5maW5kKCcuaW5wdXQtY29udGFpbmVyJyk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbGxlciBvZiBjb250cm9sbGVycykge1xuICAgICAgICAgICAgJGlucHV0Q29udGFpbmVyLmFwcGVuZChjb250cm9sbGVyLiRpbnB1dFdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy5jbG9zZScpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgICRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnJlbW92ZScpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIG9iamVjdC5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY29udHJvbEJveC5pbnNlcnRCZWZvcmUoJHRlbXBsYXRlQ29udHJvbEJveCk7XG4gICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG5cbiAgICAgICAgdGhpcy4kY29udHJvbEJveCA9ICRjb250cm9sQm94O1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLiRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGlzT3BlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGNvbnRyb2xCb3hbMF0ucGFyZW50Tm9kZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbEJveDsiLCJjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIG5hbWUsIG1pbiwgbWF4LCB2YWx1ZSwgZnVuYykge1xuICAgICAgICBjb25zdCAkaW5wdXRXcmFwcGVyID0gdGhpcy4kaW5wdXRXcmFwcGVyID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlIC5pbnB1dC13cmFwcGVyLnRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5maW5kKCcubmFtZScpLnRleHQobmFtZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dCA9IHRoaXMuJGlucHV0ID0gJGlucHV0V3JhcHBlci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAkaW5wdXQuYXR0cigndHlwZScsIG9iamVjdC5jb25maWcuSU5QVVRfVFlQRSk7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtaW4nLCBtaW4pO1xuICAgICAgICAkaW5wdXQuYXR0cignbWF4JywgbWF4KTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3ZhbHVlJywgdmFsdWUpO1xuICAgICAgICAkaW5wdXQuYXR0cignc3RlcCcsIDAuMDEpO1xuICAgICAgICBjb25zdCAkdmFsdWUgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJy52YWx1ZScpO1xuICAgICAgICAkdmFsdWUudGV4dCh0aGlzLmdldCgpKTtcbiAgICAgICAgJGlucHV0Lm9uKCdpbnB1dCcsIGUgPT4ge1xuICAgICAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICAgICBmdW5jLmNhbGwob2JqZWN0LCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLiRpbnB1dC52YWwoKSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXI7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi4vb2JqZWN0L2NpcmNsZScpO1xuY29uc3Qge3JvdGF0ZSwgbm93LCByYW5kb20sIHBvbGFyMmNhcnRlc2lhbiwgcmFuZENvbG9yLCBnZXRSb3RhdGlvbk1hdHJpeCwgY2FydGVzaWFuMmF1dG99ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3VifSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbiwgUEksIGF0YW4yLCBwb3d9ID0gTWF0aDtcblxuXG5jbGFzcyBQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihvYmopIHtcbiAgICAgICAgdGhpcy5wcmV2UG9zID0gb2JqLnByZXZQb3Muc2xpY2UoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBvYmoucG9zLnNsaWNlKCk7XG4gICAgfVxufVxuXG5jbGFzcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCByZW5kZXJlcikge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5vYmpzID0gW107XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW107XG4gICAgICAgIHRoaXMucGF0aHMgPSBbXTtcbiAgICAgICAgdGhpcy5mcHNMYXN0VGltZSA9IG5vdygpO1xuICAgICAgICB0aGlzLmZwc0NvdW50ID0gMDtcbiAgICAgICAgdGhpcy5sYXN0T2JqTm8gPSAwO1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKC10aGlzLmNvbmZpZy5XIC8gMiwgdGhpcy5jb25maWcuVyAvIDIsIC10aGlzLmNvbmZpZy5IIC8gMiwgdGhpcy5jb25maWcuSCAvIDIsIDEsIDEwMDApO1xuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi56ID0gMTAwO1xuXG4gICAgICAgIHRoaXMubW91c2VEb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMubW91c2VYID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZVkgPSAwO1xuICAgIH1cblxuICAgIHRvZ2dsZUFuaW1hdGluZygpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSAhdGhpcy5hbmltYXRpbmc7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gYCR7dGhpcy5jb25maWcuVElUTEV9ICgke3RoaXMuYW5pbWF0aW5nID8gXCJTaW11bGF0aW5nXCIgOiBcIlBhdXNlZFwifSlgO1xuICAgIH1cblxuICAgIGRlc3Ryb3lDb250cm9sQm94ZXMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbEJveCBvZiB0aGlzLmNvbnRyb2xCb3hlcykge1xuICAgICAgICAgICAgY29udHJvbEJveC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW11cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5kZXN0cm95Q29udHJvbEJveGVzKCk7XG4gICAgfVxuXG4gICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlbmRlcmVyKSByZXR1cm47XG4gICAgICAgIHRoaXMucHJpbnRGcHMoKTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUFsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVkcmF3QWxsKCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgY3JlYXRlUGF0aChvYmopIHtcbiAgICAgICAgaWYgKG1hZyhzdWIob2JqLnBvcywgb2JqLnByZXZQb3MpKSA+IDUpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aHMucHVzaChuZXcgUGF0aChvYmopKTtcbiAgICAgICAgICAgIG9iai5wcmV2UG9zID0gb2JqLnBvcy5zbGljZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMucGF0aHMubGVuZ3RoID4gdGhpcy5jb25maWcuTUFYX1BBVEhTKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXRocyA9IHRoaXMucGF0aHMuc2xpY2UoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1c2VyQ3JlYXRlT2JqZWN0KHgsIHkpIHtcbiAgICAgICAgY29uc3QgcG9zID0gWyh4IC0gdGhpcy5jb25maWcuVyAvIDIpIC8gdGhpcy5jYW1lcmEuem9vbSwgKHkgLSB0aGlzLmNvbmZpZy5IIC8gMikgLyB0aGlzLmNhbWVyYS56b29tXTtcbiAgICAgICAgbGV0IG1heFIgPSBDaXJjbGUuZ2V0UmFkaXVzRnJvbU1hc3ModGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG1heFIgPSBtaW4obWF4UiwgKG1hZyhzdWIob2JqLnBvcywgcG9zKSkgLSBvYmouZ2V0UmFkaXVzKCkpIC8gMS41KVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG0gPSBDaXJjbGUuZ2V0TWFzc0Zyb21SYWRpdXMocmFuZG9tKENpcmNsZS5nZXRSYWRpdXNGcm9tTWFzcyh0aGlzLmNvbmZpZy5NQVNTX01JTiksIG1heFIpKTtcbiAgICAgICAgY29uc3QgdiA9IHBvbGFyMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSByYW5kQ29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYGNpcmNsZSR7Kyt0aGlzLmxhc3RPYmpOb31gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KHRhZywgcG9zLCBtLCB2LCBjb2xvcikge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzWzBdLCBkaXIpO1xuICAgIH1cblxuICAgIGdldFBpdm90QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY29sbGlkZUVsYXN0aWNhbGx5KCkge1xuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmNvbmZpZy5ESU1FTlNJT047XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vYmpzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvMSA9IHRoaXMub2Jqc1tpXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMub2Jqcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG8yID0gdGhpcy5vYmpzW2pdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHN1YihvMi5wb3MsIG8xLnBvcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGVzID0gY2FydGVzaWFuMmF1dG8oY29sbGlzaW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYW5nbGVzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZCA8IG8xLmdldFJhZGl1cygpICsgbzIuZ2V0UmFkaXVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUiA9IHRoaXMuZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUl8gPSB0aGlzLmdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgLTEpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpID0gdGhpcy5nZXRQaXZvdEF4aXMoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2VGVtcCA9IFtyb3RhdGUobzEudiwgUiksIHJvdGF0ZShvMi52LCBSKV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZGaW5hbCA9IFt2VGVtcFswXS5zbGljZSgpLCB2VGVtcFsxXS5zbGljZSgpXTtcbiAgICAgICAgICAgICAgICAgICAgdkZpbmFsWzBdW2ldID0gKChvMS5tIC0gbzIubSkgKiB2VGVtcFswXVtpXSArIDIgKiBvMi5tICogdlRlbXBbMV1baV0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgdkZpbmFsWzFdW2ldID0gKChvMi5tIC0gbzEubSkgKiB2VGVtcFsxXVtpXSArIDIgKiBvMS5tICogdlRlbXBbMF1baV0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgbzEudiA9IHJvdGF0ZSh2RmluYWxbMF0sIFJfKTtcbiAgICAgICAgICAgICAgICAgICAgbzIudiA9IHJvdGF0ZSh2RmluYWxbMV0sIFJfKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NUZW1wID0gW3plcm9zKGRpbWVuc2lvbiksIHJvdGF0ZShjb2xsaXNpb24sIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zVGVtcFswXVtpXSArPSB2RmluYWxbMF1baV07XG4gICAgICAgICAgICAgICAgICAgIHBvc1RlbXBbMV1baV0gKz0gdkZpbmFsWzFdW2ldO1xuICAgICAgICAgICAgICAgICAgICBvMS5wb3MgPSBhZGQobzEucG9zLCByb3RhdGUocG9zVGVtcFswXSwgUl8pKTtcbiAgICAgICAgICAgICAgICAgICAgbzIucG9zID0gYWRkKG8xLnBvcywgcm90YXRlKHBvc1RlbXBbMV0sIFJfKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlQWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVWZWxvY2l0eSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29sbGlkZUVsYXN0aWNhbGx5KCk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZVBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVBhdGgob2JqKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZHJhd0FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmoudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIH1cblxuICAgIHByaW50RnBzKCkge1xuICAgICAgICB0aGlzLmZwc0NvdW50ICs9IDE7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbm93KCk7XG4gICAgICAgIGNvbnN0IHRpbWVEaWZmID0gY3VycmVudFRpbWUgLSB0aGlzLmZwc0xhc3RUaW1lO1xuICAgICAgICBpZiAodGltZURpZmYgPiAxKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHsodGhpcy5mcHNDb3VudCAvIHRpbWVEaWZmKSB8IDB9IGZwc2ApO1xuICAgICAgICAgICAgdGhpcy5mcHNMYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgdGhpcy5mcHNDb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNpemUoKSB7XG4gICAgICAgIHRoaXMuY2FtZXJhLmxlZnQgPSAtdGhpcy5jb25maWcuVyAvIDI7XG4gICAgICAgIHRoaXMuY2FtZXJhLnJpZ2h0ID0gdGhpcy5jb25maWcuVyAvIDI7XG4gICAgICAgIHRoaXMuY2FtZXJhLnRvcCA9IC10aGlzLmNvbmZpZy5IIC8gMjtcbiAgICAgICAgdGhpcy5jYW1lcmEuYm90dG9tID0gdGhpcy5jb25maWcuSCAvIDI7XG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpO1xuICAgIH1cblxuICAgIG9uTW91c2VNb3ZlKGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1vdXNlRG93bikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlbHRhID0gYXRhbjIoZS5jbGllbnRZIC0gdGhpcy5jb25maWcuSCAvIDIsIGUuY2xpZW50WCAtIHRoaXMuY29uZmlnLlcgLyAyKSAtIGF0YW4yKHRoaXMubW91c2VZIC0gdGhpcy5jb25maWcuSCAvIDIsIHRoaXMubW91c2VYIC0gdGhpcy5jb25maWcuVyAvIDIpO1xuICAgICAgICBpZiAoZGVsdGEgPCAtUEkpIGRlbHRhICs9IDIgKiBQSTtcbiAgICAgICAgaWYgKGRlbHRhID4gK1BJKSBkZWx0YSAtPSAyICogUEk7XG4gICAgICAgIHRoaXMubW91c2VYID0gZS5wYWdlWDtcbiAgICAgICAgdGhpcy5tb3VzZVkgPSBlLnBhZ2VZO1xuICAgICAgICB0aGlzLmNhbWVyYS5yb3RhdGlvbi56ICs9IGRlbHRhO1xuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgfVxuXG4gICAgb25Nb3VzZURvd24oZSkge1xuICAgICAgICB0aGlzLm1vdXNlRG93biA9IHRydWU7XG4gICAgICAgIHRoaXMubW91c2VYID0gZS5wYWdlWDtcbiAgICAgICAgdGhpcy5tb3VzZVkgPSBlLnBhZ2VZO1xuICAgIH1cblxuICAgIG9uTW91c2VVcChlKSB7XG4gICAgICAgIHRoaXMubW91c2VEb3duID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0Q29vcmRTdGVwKGtleSkge1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IG5vdygpO1xuICAgICAgICBpZiAoa2V5ID09IHRoaXMubGFzdEtleSAmJiBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWUgPCAxKSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgIHRoaXMubGFzdEtleSA9IGtleTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLkNBTUVSQV9DT09SRF9TVEVQICogcG93KHRoaXMuY29uZmlnLkNBTUVSQV9BQ0NFTEVSQVRJT04sIHRoaXMuY29tYm8pO1xuICAgIH1cblxuICAgIHVwKGtleSkge1xuICAgICAgICB0aGlzLmNhbWVyYS50cmFuc2xhdGVZKC10aGlzLmdldENvb3JkU3RlcChrZXkpKTtcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuICAgIGRvd24oa2V5KSB7XG4gICAgICAgIHRoaXMuY2FtZXJhLnRyYW5zbGF0ZVkoK3RoaXMuZ2V0Q29vcmRTdGVwKGtleSkpO1xuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgfVxuXG4gICAgbGVmdChrZXkpIHtcbiAgICAgICAgdGhpcy5jYW1lcmEudHJhbnNsYXRlWCgtdGhpcy5nZXRDb29yZFN0ZXAoa2V5KSk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICB9XG5cbiAgICByaWdodChrZXkpIHtcbiAgICAgICAgdGhpcy5jYW1lcmEudHJhbnNsYXRlWCgrdGhpcy5nZXRDb29yZFN0ZXAoa2V5KSk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICB9XG5cbiAgICB6b29tSW4oa2V5KSB7XG4gICAgICAgIHRoaXMuY2FtZXJhLnpvb20gKz0gdGhpcy5nZXRDb29yZFN0ZXAoa2V5KSAvIDEwMDtcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuICAgIHpvb21PdXQoa2V5KSB7XG4gICAgICAgIHRoaXMuY2FtZXJhLnpvb20gLT0gdGhpcy5nZXRDb29yZFN0ZXAoa2V5KSAvIDEwMDtcbiAgICAgICAgaWYgKHRoaXMuY2FtZXJhLnpvb20gPCAwLjAxKXRoaXMuY2FtZXJhLnpvb20gPSAwLjAxO1xuICAgICAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTJEOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi8yZCcpO1xuY29uc3QgU3BoZXJlID0gcmVxdWlyZSgnLi4vb2JqZWN0L3NwaGVyZScpO1xuY29uc3Qge3JhbmRvbSwgZ2V0WVJvdGF0aW9uTWF0cml4LCBnZXRaUm90YXRpb25NYXRyaXgsIHJhbmRDb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbiwgc2tpcEludmlzaWJsZUVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHttYWcsIHN1YiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbn0gPSBNYXRoO1xuXG5cbmNsYXNzIEVuZ2luZTNEIGV4dGVuZHMgRW5naW5lMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgcmVuZGVyZXIpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCByZW5kZXJlcik7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDc1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMC4xLCAxMDAwKTtcbiAgICB9XG5cbiAgICB1c2VyQ3JlYXRlT2JqZWN0KHgsIHkpIHtcbiAgICAgICAgY29uc3QgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICAgICAgdmVjdG9yLnNldCgoeCAvIHRoaXMuY29uZmlnLlcpICogMiAtIDEsIC0oeSAvIHRoaXMuY29uZmlnLkgpICogMiArIDEsIDAuNSk7XG4gICAgICAgIHZlY3Rvci51bnByb2plY3QodGhpcy5jYW1lcmEpO1xuICAgICAgICBjb25zdCBkaXIgPSB2ZWN0b3Iuc3ViKHRoaXMuY2FtZXJhLnBvc2l0aW9uKS5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSAtdGhpcy5jYW1lcmEucG9zaXRpb24ueiAvIGRpci56O1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKCkuYWRkKGRpci5tdWx0aXBseVNjYWxhcihkaXN0YW5jZSkpO1xuICAgICAgICBjb25zdCBwb3MgPSBbcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24uel07XG5cbiAgICAgICAgbGV0IG1heFIgPSBTcGhlcmUuZ2V0UmFkaXVzRnJvbU1hc3ModGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG1heFIgPSBtaW4obWF4UiwgKG1hZyhzdWIob2JqLnBvcywgcG9zKSkgLSBvYmouZ2V0UmFkaXVzKCkpIC8gMS41KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtID0gU3BoZXJlLmdldE1hc3NGcm9tUmFkaXVzKHJhbmRvbShTcGhlcmUuZ2V0UmFkaXVzRnJvbU1hc3ModGhpcy5jb25maWcuTUFTU19NSU4pLCBtYXhSKSk7XG4gICAgICAgIGNvbnN0IHYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJhbmRvbSh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVggLyAyKSwgcmFuZG9tKC0xODAsIDE4MCksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSByYW5kQ29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYHNwaGVyZSR7Kyt0aGlzLmxhc3RPYmpOb31gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KHRhZywgcG9zLCBtLCB2LCBjb2xvcikge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZG90KGdldFpSb3RhdGlvbk1hdHJpeChhbmdsZXNbMF0sIGRpciksIGdldFlSb3RhdGlvbk1hdHJpeChhbmdsZXNbMV0sIGRpciksIGRpcik7XG4gICAgfVxuXG4gICAgZ2V0UGl2b3RBeGlzKCkge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG5cbiAgICByZWRyYXdBbGwoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKTtcbiAgICAgICAgY29uc3Qgb3JkZXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLmNhbWVyYS5vYmplY3RDb29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsnb2JqZWN0JywgY29vcmRzLCB6LCBvYmouY29sb3JdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLmNhbWVyYS5kaXJlY3Rpb25Db29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsnZGlyZWN0aW9uJywgY29vcmRzLCB6XSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wYXRocykge1xuICAgICAgICAgICAgc2tpcEludmlzaWJsZUVycm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLmNhbWVyYS5wYXRoQ29vcmRzKHBhdGgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBjb29yZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgb3JkZXJzLnB1c2goWydwYXRoJywgY29vcmRzLCB6XSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBvcmRlcnMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGFbMl0gLSBiWzJdO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChjb25zdCBbdHlwZSwgY29vcmRzLCB6LCBjb2xvcl0gb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdPYmplY3QoY29vcmRzLCBjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGlvbic6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0RpcmVjdGlvbihjb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwYXRoJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGF0aChjb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUzRDsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vZW5naW5lLzJkJyk7XG5jb25zdCBFbmdpbmUzRCA9IHJlcXVpcmUoJy4vZW5naW5lLzNkJyk7XG5jb25zdCB7Z2V0RGlzdGFuY2V9ID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cblxubGV0IGNvbmZpZyA9IG51bGw7XG5jb25zdCBrZXltYXAgPSB7XG4gICAgMzg6ICd1cCcsXG4gICAgNDA6ICdkb3duJyxcbiAgICAzNzogJ2xlZnQnLFxuICAgIDM5OiAncmlnaHQnLFxuICAgIDkwOiAnem9vbUluJywgLy8gelxuICAgIDg4OiAnem9vbU91dCcsIC8vIHhcbn07XG5jb25zdCAkcmVuZGVyZXJXcmFwcGVyID0gJCgnLnJlbmRlcmVyLXdyYXBwZXInKTtcblxuZnVuY3Rpb24gb25SZXNpemUoZSwgZW5naW5lKSB7XG4gICAgY29uZmlnLlcgPSAkcmVuZGVyZXJXcmFwcGVyLndpZHRoKCk7XG4gICAgY29uZmlnLkggPSAkcmVuZGVyZXJXcmFwcGVyLmhlaWdodCgpO1xuICAgIGlmIChlbmdpbmUpIGVuZ2luZS5yZXNpemUoKTtcbn1cblxuY29uc3QgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xuY29uc3QgbW91c2UgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuZnVuY3Rpb24gb25DbGljayhlLCBlbmdpbmUpIHtcbiAgICBjb25zdCB4ID0gZS5wYWdlWDtcbiAgICBjb25zdCB5ID0gZS5wYWdlWTtcbiAgICBpZiAoIWVuZ2luZS5hbmltYXRpbmcpIHtcbiAgICAgICAgbW91c2UueCA9ICh4IC8gY29uZmlnLlcpICogMiAtIDE7XG4gICAgICAgIG1vdXNlLnkgPSAtKHkgLyBjb25maWcuSCkgKiAyICsgMTtcbiAgICAgICAgY29uc29sZS5sb2coZW5naW5lLmNhbWVyYSk7XG4gICAgICAgIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKG1vdXNlLCBlbmdpbmUuY2FtZXJhKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIHZhciBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdChvYmoub2JqZWN0KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGludGVyc2VjdHMpO1xuICAgICAgICAgICAgaWYgKGludGVyc2VjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG9iai5zaG93Q29udHJvbEJveCh4LCB5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbmdpbmUudXNlckNyZWF0ZU9iamVjdCh4LCB5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uS2V5RG93bihlLCBlbmdpbmUpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBlO1xuICAgIGlmIChrZXlDb2RlID09IDMyKSB7IC8vIHNwYWNlIGJhclxuICAgICAgICBlbmdpbmUuZGVzdHJveUNvbnRyb2xCb3hlcygpO1xuICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlIGluIGtleW1hcCAmJiBrZXltYXBba2V5Q29kZV0gaW4gZW5naW5lKSB7XG4gICAgICAgIGVuZ2luZVtrZXltYXBba2V5Q29kZV1dKGtleUNvZGUpO1xuICAgIH1cbn1cblxuY2xhc3MgU2ltdWxhdG9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4gICAgICAgICRyZW5kZXJlcldyYXBwZXIuYXBwZW5kKHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gICAgICAgICQod2luZG93KS5yZXNpemUoZSA9PiB7XG4gICAgICAgICAgICBvblJlc2l6ZShlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCkuY2xpY2soZSA9PiB7XG4gICAgICAgICAgICBvbkNsaWNrKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJ2JvZHknKS5rZXlkb3duKGUgPT4ge1xuICAgICAgICAgICAgb25LZXlEb3duKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNlZG93bihlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLm9uTW91c2VEb3duKGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJChkb2N1bWVudCkubW91c2Vtb3ZlKGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUub25Nb3VzZU1vdmUoZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKGRvY3VtZW50KS5tb3VzZXVwKGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUub25Nb3VzZVVwKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0KHByZXNldCkge1xuICAgICAgICBpZiAodGhpcy5lbmdpbmUpIHRoaXMuZW5naW5lLmRlc3Ryb3koKTtcbiAgICAgICAgY29uZmlnID0gcHJlc2V0KHt9KTtcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBjb25maWcuVElUTEUgPSBwcmVzZXQucHJvdG90eXBlLnRpdGxlO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyAoY29uZmlnLkRJTUVOU0lPTiA9PSAyID8gRW5naW5lMkQgOiBFbmdpbmUzRCkoY29uZmlnLCB0aGlzLnJlbmRlcmVyKTtcbiAgICAgICAgb25SZXNpemUobnVsbCwgdGhpcy5lbmdpbmUpO1xuICAgICAgICBpZiAoJ2luaXQnIGluIGNvbmZpZykgY29uZmlnLmluaXQodGhpcy5lbmdpbmUpO1xuICAgICAgICB0aGlzLmVuZ2luZS5hbmltYXRlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvcjsiLCJmdW5jdGlvbiBpdGVyKGEsIGZ1bmMpIHtcbiAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICBtW2ldID0gZnVuYyhpKTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHplcm9zOiBOID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheShOKS5maWxsKDApO1xuICAgIH0sXG5cbiAgICBtYWc6IGEgPT4ge1xuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBhW2ldICogYVtpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHN1bSk7XG4gICAgfSxcblxuICAgIGFkZDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSArIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzdWI6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLSBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbXVsOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICogYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRpdjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAvIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkb3Q6IChhLCBiLCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGlmIChkaXIgPT0gLTEpIHtcbiAgICAgICAgICAgIFthLCBiXSA9IFtiLCBhXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYV9jID0gYVswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJfYyA9IGJbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgYV9yOyByKyspIHtcbiAgICAgICAgICAgIG1bcl0gPSBuZXcgQXJyYXkoYl9jKTtcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgYl9jOyBjKyspIHtcbiAgICAgICAgICAgICAgICBtW3JdW2NdID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG1bcl1bY10gKz0gYVtyXVtpXSAqIGJbaV1bY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbn07IiwiY29uc3QgQ29udHJvbEJveCA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbF9ib3gnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHtyYWQyZGVnLCBkZWcycmFkLCBwb2xhcjJjYXJ0ZXNpYW4sIGNhcnRlc2lhbjJhdXRvLCBzcXVhcmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdn0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttYXgsIHBvd30gPSBNYXRoO1xuXG5cbmNsYXNzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogUG9sYXIgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2xhcl9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldlBvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZU9iamVjdCgpO1xuICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBudWxsO1xuICAgIH1cblxuICAgIGNyZWF0ZU9iamVjdCgpIHtcbiAgICAgICAgaWYgKHRoaXMub2JqZWN0KSB0aGlzLmVuZ2luZS5zY2VuZS5yZW1vdmUodGhpcy5vYmplY3QpO1xuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSh0aGlzLmdldFJhZGl1cygpLCAzMiwgMzIpO1xuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6IHRoaXMuY29sb3J9KTtcbiAgICAgICAgY29uc3Qgb2JqZWN0ID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgb2JqZWN0Lm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lbmdpbmUuc2NlbmUuYWRkKG9iamVjdCk7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgZ2V0UmFkaXVzKCkge1xuICAgICAgICByZXR1cm4gQ2lyY2xlLmdldFJhZGl1c0Zyb21NYXNzKHRoaXMubSlcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVWZWxvY2l0eSgpIHtcbiAgICAgICAgbGV0IEYgPSB6ZXJvcyh0aGlzLmNvbmZpZy5ESU1FTlNJT04pO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICBpZiAob2JqID09IHRoaXMpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgdmVjdG9yID0gc3ViKHRoaXMucG9zLCBvYmoucG9zKTtcbiAgICAgICAgICAgIGNvbnN0IG1hZ25pdHVkZSA9IG1hZyh2ZWN0b3IpO1xuICAgICAgICAgICAgY29uc3QgdW5pdFZlY3RvciA9IGRpdih2ZWN0b3IsIG1hZ25pdHVkZSk7XG4gICAgICAgICAgICBGID0gYWRkKEYsIG11bCh1bml0VmVjdG9yLCBvYmoubSAvIHNxdWFyZShtYWduaXR1ZGUpKSlcbiAgICAgICAgfVxuICAgICAgICBGID0gbXVsKEYsIC10aGlzLmNvbmZpZy5HICogdGhpcy5tKTtcbiAgICAgICAgY29uc3QgYSA9IGRpdihGLCB0aGlzLm0pO1xuICAgICAgICB0aGlzLnYgPSBhZGQodGhpcy52LCBhKTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVQb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5wb3MgPSBhZGQodGhpcy5wb3MsIHRoaXMudik7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLm9iamVjdC5wb3NpdGlvbi54ID0gdGhpcy5wb3NbMF07XG4gICAgICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgPSB0aGlzLnBvc1sxXTtcbiAgICAgICAgdGhpcy5vYmplY3QudXBkYXRlTWF0cml4KCk7XG4gICAgfVxuXG4gICAgY29udHJvbE0oZSkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZU9iamVjdCgpO1xuICAgIH1cblxuICAgIGNvbnRyb2xQb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NYQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zWUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHldO1xuICAgIH1cblxuICAgIGNvbnRyb2xWKGUpIHtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52UmhvQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgcGhpID0gZGVnMnJhZCh0aGlzLnZQaGlDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgdGhpcy52ID0gcG9sYXIyY2FydGVzaWFuKHJobywgcGhpKTtcbiAgICB9XG5cbiAgICBzaG93Q29udHJvbEJveCh4LCB5KSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRyb2xCb3ggJiYgdGhpcy5jb250cm9sQm94LmlzT3BlbigpKSB7XG4gICAgICAgICAgICBjb25zdCAkY29udHJvbEJveCA9IHRoaXMuY29udHJvbEJveC4kY29udHJvbEJveDtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygndG9wJywgeSArICdweCcpO1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gubmV4dFVudGlsKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5pbnNlcnRCZWZvcmUoJGNvbnRyb2xCb3gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWFyZ2luID0gMS41O1xuXG4gICAgICAgICAgICB2YXIgcG9zUmFuZ2UgPSBtYXgobWF4KHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpIC8gMiwgbWF4LmFwcGx5KG51bGwsIHRoaXMucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICBwb3NSYW5nZSA9IG1heChwb3NSYW5nZSwgbWF4LmFwcGx5KG51bGwsIG9iai5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xuXG4gICAgICAgICAgICBjb25zdCB2ID0gY2FydGVzaWFuMmF1dG8odGhpcy52KTtcbiAgICAgICAgICAgIHZhciB2UmFuZ2UgPSBtYXgodGhpcy5jb25maWcuVkVMT0NJVFlfTUFYLCBtYWcodGhpcy52KSAqIG1hcmdpbik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICAgICAgdlJhbmdlID0gbWF4KHZSYW5nZSwgbWFnKG9iai52KSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0dXBfY29udHJvbGxlcnMocG9zUmFuZ2UsIG0sIHYsIHZSYW5nZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBuZXcgQ29udHJvbEJveCh0aGlzLCB0aGlzLnRhZywgdGhpcy5nZXRDb250cm9sbGVycygpLCB4LCB5KTtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmNvbnRyb2xCb3hlcy5wdXNoKHRoaXMuY29udHJvbEJveCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgbSwgdiwgdlJhbmdlKSB7XG4gICAgICAgIHRoaXMubUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIk1hc3MgbVwiLCB0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgsIG0sIHRoaXMuY29udHJvbE0pO1xuICAgICAgICB0aGlzLnBvc1hDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB4XCIsIC1wb3NSYW5nZSwgcG9zUmFuZ2UsIHRoaXMucG9zWzBdLCB0aGlzLmNvbnRyb2xQb3MpO1xuICAgICAgICB0aGlzLnBvc1lDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB5XCIsIC1wb3NSYW5nZSwgcG9zUmFuZ2UsIHRoaXMucG9zWzFdLCB0aGlzLmNvbnRyb2xQb3MpO1xuICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDPgVwiLCAwLCB2UmFuZ2UsIHZbMF0sIHRoaXMuY29udHJvbFYpO1xuICAgICAgICB0aGlzLnZQaGlDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDPhlwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsxXSksIHRoaXMuY29udHJvbFYpO1xuICAgIH1cblxuICAgIGdldENvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWENvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1lDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlBoaUNvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBjb25zdCBpID0gdGhpcy5lbmdpbmUub2Jqcy5pbmRleE9mKHRoaXMpO1xuICAgICAgICB0aGlzLmVuZ2luZS5vYmpzLnNwbGljZShpLCAxKTtcbiAgICAgICAgaWYgKHRoaXMuY29udHJvbEJveCAmJiB0aGlzLmNvbnRyb2xCb3guaXNPcGVuKCkpIHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbEJveC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFJhZGl1c0Zyb21NYXNzKG0pIHtcbiAgICAgICAgcmV0dXJuIHBvdyhtLCAxIC8gMilcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0TWFzc0Zyb21SYWRpdXMocikge1xuICAgICAgICByZXR1cm4gc3F1YXJlKHIpXG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7J3RhZyc6IHRoaXMudGFnLCAndic6IHRoaXMudiwgJ3Bvcyc6IHRoaXMucG9zfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuL2NpcmNsZScpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHNwaGVyaWNhbDJjYXJ0ZXNpYW59ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge2N1YmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5cbmNsYXNzIFNwaGVyZSBleHRlbmRzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogU3BoZXJpY2FsIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3BoZXJpY2FsX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBnZXRSYWRpdXMoKSB7XG4gICAgICAgIHJldHVybiBTcGhlcmUuZ2V0UmFkaXVzRnJvbU1hc3ModGhpcy5tKTtcbiAgICB9XG5cbiAgICBjb250cm9sUG9zKGUpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zWENvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc1lDb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB6ID0gdGhpcy5wb3NaQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBbeCwgeSwgel07XG4gICAgfVxuXG4gICAgY29udHJvbFYoZSkge1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudlBoaUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICBjb25zdCB0aGV0YSA9IGRlZzJyYWQodGhpcy52VGhldGFDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52UmhvQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy52ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyaG8sIHBoaSwgdGhldGEpO1xuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICBzdXBlci5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICB0aGlzLnBvc1pDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB6XCIsIC1wb3NfcmFuZ2UsIHBvc19yYW5nZSwgdGhpcy5wb3NbMl0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMudlRoZXRhQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgzrhcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMl0pLCB0aGlzLmNvbnRyb2xWKTtcbiAgICB9XG5cbiAgICBnZXRDb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1hDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWkNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlRoZXRhQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRSYWRpdXNGcm9tTWFzcyhtKSB7XG4gICAgICAgIHJldHVybiBwb3cobSwgMSAvIDMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRNYXNzRnJvbVJhZGl1cyhyKSB7XG4gICAgICAgIHJldHVybiBjdWJlKHIpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGhlcmU7IiwiY29uc3Qge21hZywgZG90fSA9IHJlcXVpcmUoJy4vbWF0cml4Jyk7XG5cbmNvbnN0IFV0aWwgPSB7XG4gICAgc3F1YXJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHg7XG4gICAgfSxcblxuICAgIGN1YmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeCAqIHg7XG4gICAgfSxcblxuICAgIHBvbGFyMmNhcnRlc2lhbjogKHJobywgcGhpKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4ocGhpKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4ycG9sYXI6ICh4LCB5KSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYWcoW3gsIHldKSxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeSwgeClcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgc3BoZXJpY2FsMmNhcnRlc2lhbjogKHJobywgcGhpLCB0aGV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyh0aGV0YSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnNwaGVyaWNhbDogKHgsIHksIHopID0+IHtcbiAgICAgICAgY29uc3QgcmhvID0gbWFnKFt4LCB5LCB6XSk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8sXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpLFxuICAgICAgICAgICAgcmhvICE9IDAgPyBNYXRoLmFjb3MoeiAvIHJobykgOiAwXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJhdXRvOiAodmVjdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiB2ZWN0b3IubGVuZ3RoID09IDJcbiAgICAgICAgICAgID8gVXRpbC5jYXJ0ZXNpYW4ycG9sYXIodmVjdG9yWzBdLCB2ZWN0b3JbMV0pXG4gICAgICAgICAgICA6IFV0aWwuY2FydGVzaWFuMnNwaGVyaWNhbCh2ZWN0b3JbMF0sIHZlY3RvclsxXSwgdmVjdG9yWzJdKTtcbiAgICB9LFxuXG4gICAgcmFkMmRlZzogKHJhZCkgPT4ge1xuICAgICAgICByZXR1cm4gcmFkIC8gTWF0aC5QSSAqIDE4MDtcbiAgICB9LFxuXG4gICAgZGVnMnJhZDogKGRlZykgPT4ge1xuICAgICAgICByZXR1cm4gZGVnIC8gMTgwICogTWF0aC5QSTtcbiAgICB9LFxuXG4gICAgZ2V0RGlzdGFuY2U6ICh4MCwgeTAsIHgxLCB5MSkgPT4ge1xuICAgICAgICByZXR1cm4gbWFnKFt4MSAtIHgwLCB5MSAtIHkwXSk7XG4gICAgfSxcblxuICAgIHJvdGF0ZTogKHZlY3RvciwgbWF0cml4KSA9PiB7XG4gICAgICAgIHJldHVybiBkb3QoW3ZlY3Rvcl0sIG1hdHJpeClbMF07XG4gICAgfSxcblxuICAgIG5vdzogKCkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICAgIH0sXG5cbiAgICByYW5kb206IChtaW4sIG1heCA9IG51bGwpID0+IHtcbiAgICAgICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICAgICAgICBtYXggPSBtaW47XG4gICAgICAgICAgICBtaW4gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG4gICAgfSxcblxuICAgIHJhbmRDb2xvcjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmO1xuICAgIH0sXG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbl0sXG4gICAgICAgICAgICBbc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFhSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIGNvcywgLXNpbl0sXG4gICAgICAgICAgICBbMCwgc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFlSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgMCwgc2luXSxcbiAgICAgICAgICAgIFswLCAxLCAwXSxcbiAgICAgICAgICAgIFstc2luLCAwLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldFpSb3RhdGlvbk1hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbiwgMF0sXG4gICAgICAgICAgICBbc2luLCBjb3MsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDFdXG4gICAgICAgIF07XG4gICAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbDsiXX0=

//# sourceMappingURL=gravity_simulator.js.map
