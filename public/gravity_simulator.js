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
var selected = 6;
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
        BACKGROUND: 'black',
        DIMENSION: 2,
        MAX_PATHS: 1e5,
        G: 0.1,
        G_MIN: 0.0001,
        G_MAX: 1,
        MASS_MIN: 1,
        MASS_MAX: 4e4,
        RADIUS_MIN: 1,
        RADIUS_MAX: 2e2,
        VELOCITY_MAX: 10,
        DIRECTION_LENGTH: 20,
        CAMERA_POSITION: [0, 0, 500],
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
            engine.createObject('Ball A', [0, 0, 0], 1000000, 100, [0, 0, 0], 'blue');
            engine.createObject('Ball B', [180, 0, 0], 1, 20, [0, 2.4, 0], 'red');
            engine.createObject('Ball C', [240, 0, 0], 1, 20, [0, 2.1, 0], 'yellow');
            engine.createObject('Ball D', [300, 0, 0], 1, 20, [0, 1.9, 0], 'green');
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
    var k_v = 5e-2;
    var k_r = function k_r(r) {
        return Math.pow(Math.log(r), 3) * 1e-2;
    };
    return extend(true, MANUAL_3D(c), {
        G: 398682e-6 * Math.pow(k_v, 2),
        CAMERA_POSITION: [0, 0, 5e2],
        /**
         * Length: km
         * Mass: earth mass
         *
         * https://en.wikipedia.org/wiki/List_of_Solar_System_objects_by_size
         * http://nssdc.gsfc.nasa.gov/planetary/factsheet/
         */
        init: function init(engine) {
            engine.createObject('Sun', [0, 0, 0], 333000, k_r(696342), [0, 0, 0], 'map/solar_system/sun.jpg');
            engine.createObject('Mercury', [57.9, 0, 0], 0.0553, k_r(2439.7), [0, 47.4 * k_v, 0], 'map/solar_system/mercury.png');
            engine.createObject('Venus', [108.2, 0, 0], 0.815, k_r(6051.8), [0, 35.0 * k_v, 0], 'map/solar_system/venus.jpg');
            engine.createObject('Earth', [149.6, 0, 0], 1, k_r(6371.0), [0, 29.8 * k_v, 0], 'map/solar_system/earth.jpg');
            engine.createObject('Mars', [227.9, 0, 0], 0.107, k_r(3389.5), [0, 24.1 * k_v, 0], 'map/solar_system/mars.jpg');
            engine.createObject('Jupiter', [778.6, 0, 0], 317.83, k_r(69911), [0, 13.1 * k_v, 0], 'map/solar_system/jupiter.jpg');
            engine.createObject('Saturn', [1433.5, 0, 0], 95.162, k_r(58232), [0, 9.7 * k_v, 0], 'map/solar_system/saturn.jpg');
            engine.createObject('Uranus', [2872.5, 0, 0], 14.536, k_r(25362), [0, 6.8 * k_v, 0], 'map/solar_system/uranus.jpg');
            engine.createObject('Neptune', [4495.1, 0, 0], 17.147, k_r(24622), [0, 5.4 * k_v, 0], 'map/solar_system/neptune.jpg');

            var light = new THREE.PointLight(0xffffff, .8, 0);
            light.position.set(0, 0, 0);
            engine.scene.add(light);

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
    now = _require.now,
    random = _require.random,
    polar2cartesian = _require.polar2cartesian,
    randColor = _require.randColor;

var _require2 = require('../matrix'),
    mag = _require2.mag,
    sub = _require2.sub;

var $fps = $('#fps');
var min = Math.min,
    PI = Math.PI,
    atan2 = Math.atan2;

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
        this.scene.background = new THREE.Color(config.BACKGROUND);
        this.camera = new THREE.PerspectiveCamera(45, config.W / config.H, 1e-3, 1e5);
        this.camera.position.x = config.CAMERA_POSITION[0];
        this.camera.position.y = config.CAMERA_POSITION[1];
        this.camera.position.z = config.CAMERA_POSITION[2];
        this.camera.lookAt(this.scene.position);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.2;
        this.controls.enableRotate = false;

        var $gravity_input = $('#gravity_input');
        var $gravity_value = $('#gravity_value');
        $gravity_input.attr('type', config.INPUT_TYPE);
        $gravity_input.attr('min', config.G_MIN);
        $gravity_input.attr('max', config.G_MAX);
        $gravity_input.val(config.G);
        $gravity_input.attr('step', 0.0001);
        $gravity_value.text(config.G);
        $('#gravity_change').click(function () {
            var gravity = parseFloat($gravity_input.val());
            config.G = gravity;
        });
        $gravity_input.on('input', function (e) {
            var gravity = parseFloat($gravity_input.val());
            $gravity_value.text(gravity);
        });
    }

    _createClass(Engine2D, [{
        key: 'toggleAnimating',
        value: function toggleAnimating() {
            this.animating = !this.animating;
            document.title = this.config.TITLE + ' (' + (this.animating ? "Simulating" : "Paused") + ')';
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
            var v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
            var color = randColor();
            var tag = 'circle' + ++this.lastObjNo;
            var obj = new Circle(this.config, m, r, pos, v, color, tag, this);
            obj.showControlBox(x, y);
            this.objs.push(obj);
        }
    }, {
        key: 'createObject',
        value: function createObject(tag, pos, m, r, v, texture) {
            var obj = new Circle(this.config, m, r, pos, v, texture, tag, this);
            this.objs.push(obj);
        }
    }, {
        key: 'calculateAll',
        value: function calculateAll() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var obj = _step2.value;

                    obj.calculateVelocity();
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

            for (var i = 0; i < this.objs.length; i++) {
                var o1 = this.objs[i];
                for (var j = i + 1; j < this.objs.length; j++) {
                    var o2 = this.objs[j];
                    o1.calculateCollision(o2);
                }
            }
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _obj2 = _step3.value;

                    _obj2.calculatePosition();
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
        }
    }, {
        key: 'redrawAll',
        value: function redrawAll() {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.objs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var obj = _step4.value;

                    obj.draw();
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
                $fps.text((this.fpsCount / timeDiff | 0) + ' fps');
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
        key: 'destroyControlBoxes',
        value: function destroyControlBoxes() {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.controlBoxes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var controlBox = _step5.value;

                    controlBox.close();
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

            this.controlBoxes = [];
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.renderer = null;
            this.destroyControlBoxes();
            this.controls.dispose();
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
    randColor = _require.randColor,
    spherical2cartesian = _require.spherical2cartesian;

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

        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        _this.scene.add(hemiLight);

        var dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
        dirLight.position.set(-1, 1, 1);
        dirLight.position.multiplyScalar(50);
        _this.scene.add(dirLight);

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
        value: function createObject(tag, pos, m, r, v, texture) {
            var obj = new Sphere(this.config, m, r, pos, v, texture, tag, this);
            this.objs.push(obj);
        }
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
            e.preventDefault();
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

},{"./engine/2d":5,"./engine/3d":6}],8:[function(require,module,exports){
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
    },

    to3: function to3(a) {
        return new THREE.Vector3(a[0], a[1], a[2]);
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
    square = _require.square,
    rotate = _require.rotate,
    _getRotationMatrix = _require.getRotationMatrix;

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub,
    mul = _require2.mul,
    div = _require2.div,
    to3 = _require2.to3;

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
        this.object = this.createThreeObject();
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
        key: 'getThreeGeometry',
        value: function getThreeGeometry() {
            return new THREE.CircleGeometry(this.r, 32);
        }
    }, {
        key: 'getThreeMaterialOption',
        value: function getThreeMaterialOption() {
            var materialOption = {};
            if (typeof this.texture === 'string' && this.texture.indexOf('map/') == 0) materialOption.map = textureLoader.load(this.texture);else materialOption.color = this.texture;
            return materialOption;
        }
    }, {
        key: 'getThreeMaterial',
        value: function getThreeMaterial() {
            var materialOption = this.getThreeMaterialOption();
            return new THREE.MeshBasicMaterial(materialOption);
        }
    }, {
        key: 'createThreeObject',
        value: function createThreeObject() {
            if (this.object) this.engine.scene.remove(this.object);
            var geometry = this.getThreeGeometry();
            var material = this.getThreeMaterial();
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
                this.pathVertices.push(to3(this.pos));
                if (this.pathVertices.length > this.config.MAX_PATHS) this.pathVertices.shift();
            }
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
        key: 'calculateCollision',
        value: function calculateCollision(o) {
            var dimension = this.config.DIMENSION;
            var collision = sub(o.pos, this.pos);
            var angles = cartesian2auto(collision);
            var d = angles.shift();

            if (d < this.r + o.r) {
                var R = this.getRotationMatrix(angles);
                var R_ = this.getRotationMatrix(angles, -1);
                var i = this.getPivotAxis();

                var vTemp = [rotate(this.v, R), rotate(o.v, R)];
                var vFinal = [vTemp[0].slice(), vTemp[1].slice()];
                vFinal[0][i] = ((this.m - o.m) * vTemp[0][i] + 2 * o.m * vTemp[1][i]) / (this.m + o.m);
                vFinal[1][i] = ((o.m - this.m) * vTemp[1][i] + 2 * this.m * vTemp[0][i]) / (this.m + o.m);
                this.v = rotate(vFinal[0], R_);
                o.v = rotate(vFinal[1], R_);

                var posTemp = [zeros(dimension), rotate(collision, R)];
                posTemp[0][i] += vFinal[0][i];
                posTemp[1][i] += vFinal[1][i];
                this.pos = add(this.pos, rotate(posTemp[0], R_));
                o.pos = add(this.pos, rotate(posTemp[1], R_));
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
                var sPos = add(this.pos, mul(this.v, this.r / mag(this.v)));
                var ePos = add(sPos, mul(this.v, this.config.DIRECTION_LENGTH));
                directionGeometry.vertices = [to3(sPos), to3(ePos)];
                this.direction = new THREE.Line(directionGeometry, this.directionMaterial);
                this.engine.scene.add(this.direction);
            }
        }
    }, {
        key: 'controlM',
        value: function controlM(e) {
            var m = this.mController.get();
            this.m = m;
            this.object = this.createThreeObject();
        }
    }, {
        key: 'controlR',
        value: function controlR(e) {
            var r = this.rController.get();
            this.r = r;
            this.object = this.createThreeObject();
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
    spherical2cartesian = _require.spherical2cartesian,
    getYRotationMatrix = _require.getYRotationMatrix,
    getZRotationMatrix = _require.getZRotationMatrix;

var _require2 = require('../matrix'),
    dot = _require2.dot;

var Sphere = function (_Circle) {
    _inherits(Sphere, _Circle);

    function Sphere() {
        _classCallCheck(this, Sphere);

        return _possibleConstructorReturn(this, (Sphere.__proto__ || Object.getPrototypeOf(Sphere)).apply(this, arguments));
    }

    _createClass(Sphere, [{
        key: 'getThreeGeometry',

        /**
         * Spherical coordinate system
         * https://en.wikipedia.org/wiki/Spherical_coordinate_system
         */

        value: function getThreeGeometry() {
            return new THREE.SphereGeometry(this.r, 32, 32);
        }
    }, {
        key: 'getThreeMaterial',
        value: function getThreeMaterial() {
            var materialOption = this.getThreeMaterialOption();
            return new THREE.MeshStandardMaterial(materialOption);
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

},{"../control/controller":4,"../matrix":8,"../util":11,"./circle":9}],11:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jb250cm9sL2NvbnRyb2xfYm94LmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbGxlci5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvMmQuanMiLCJqcy9zaW11bGF0b3IvZW5naW5lLzNkLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLElBQU0sWUFBWSxRQUFRLGFBQVIsQ0FBbEI7O0FBRUEsSUFBTSxZQUFZLElBQUksU0FBSixFQUFsQjtBQUNBLElBQUksV0FBVyxDQUFmO0FBQ0EsVUFBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLEtBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3JDLFFBQU0sU0FBUyxRQUFRLENBQVIsQ0FBZjtBQUNBLFlBQVEsTUFBUixxQkFBaUMsQ0FBakMsVUFBc0MsS0FBSyxRQUFMLEdBQWdCLFdBQWhCLEdBQThCLEVBQXBFLFVBQTBFLE9BQU8sU0FBUCxDQUFpQixLQUEzRjtBQUNIO0FBQ0QsUUFBUSxNQUFSLENBQWUsWUFBTTtBQUNqQixlQUFXLFNBQVMsUUFBUSxJQUFSLENBQWEsV0FBYixFQUEwQixHQUExQixFQUFULENBQVg7QUFDQSxjQUFVLElBQVYsQ0FBZSxRQUFRLFFBQVIsQ0FBZjtBQUNILENBSEQ7QUFJ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O0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ2hDLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFOLEVBQVMsR0FBVCxDQURHLEVBRUgsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FGRyxFQUdILENBQUMsQ0FBQyxHQUFGLEVBQU8sQ0FBUCxFQUFVLEdBQVYsQ0FIRyxDQUFQO0FBS0gsS0F6R1E7O0FBMkdULHdCQUFvQiw0QkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ2hDLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFDLEdBQVAsRUFBWSxDQUFaLENBREcsRUFFSCxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQUZHLEVBR0gsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FIRyxDQUFQO0FBS0g7QUFuSFEsQ0FBYjs7QUFzSEEsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IHByZXNldHMgPSByZXF1aXJlKCcuL3ByZXNldCcpO1xuY29uc3QgU2ltdWxhdG9yID0gcmVxdWlyZSgnLi9zaW11bGF0b3InKTtcblxuY29uc3Qgc2ltdWxhdG9yID0gbmV3IFNpbXVsYXRvcigpO1xubGV0IHNlbGVjdGVkID0gNjtcbnNpbXVsYXRvci5pbml0KHByZXNldHNbc2VsZWN0ZWRdKTtcblxuY29uc3QgJHNlbGVjdCA9ICQoJ3NlbGVjdCcpO1xuZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVzZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcHJlc2V0ID0gcHJlc2V0c1tpXTtcbiAgICAkc2VsZWN0LmFwcGVuZChgPG9wdGlvbiB2YWx1ZT1cIiR7aX1cIiR7aSA9PSBzZWxlY3RlZCA/ICcgc2VsZWN0ZWQnIDogJyd9PiR7cHJlc2V0LnByb3RvdHlwZS50aXRsZX08L29wdGlvbj5gKTtcbn1cbiRzZWxlY3QuY2hhbmdlKCgpID0+IHtcbiAgICBzZWxlY3RlZCA9IHBhcnNlSW50KCRzZWxlY3QuZmluZCgnOnNlbGVjdGVkJykudmFsKCkpO1xuICAgIHNpbXVsYXRvci5pbml0KHByZXNldHNbc2VsZWN0ZWRdKTtcbn0pO1xuJCgnI3Jlc2V0JykuY2xpY2soKCkgPT4ge1xuICAgIHNpbXVsYXRvci5pbml0KHByZXNldHNbc2VsZWN0ZWRdKTtcbn0pO1xuXG5cbmxldCAkbW92aW5nID0gbnVsbDtcbmxldCBweCwgcHk7XG5cbiQoJ2JvZHknKS5vbignbW91c2Vkb3duJywgJy5jb250cm9sLWJveCAudGl0bGUtYmFyJywgZnVuY3Rpb24gKGUpIHtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcgPSAkKHRoaXMpLnBhcmVudCgnLmNvbnRyb2wtYm94Jyk7XG4gICAgJG1vdmluZy5uZXh0VW50aWwoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpLmluc2VydEJlZm9yZSgkbW92aW5nKTtcbiAgICByZXR1cm4gZmFsc2U7XG59KTtcblxuJCgnYm9keScpLm1vdXNlbW92ZShmdW5jdGlvbiAoZSkge1xuICAgIGlmICghJG1vdmluZykgcmV0dXJuO1xuICAgIGNvbnN0IHggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBlLnBhZ2VZO1xuICAgICRtb3ZpbmcuY3NzKCdsZWZ0JywgcGFyc2VJbnQoJG1vdmluZy5jc3MoJ2xlZnQnKSkgKyAoeCAtIHB4KSArICdweCcpO1xuICAgICRtb3ZpbmcuY3NzKCd0b3AnLCBwYXJzZUludCgkbW92aW5nLmNzcygndG9wJykpICsgKHkgLSBweSkgKyAncHgnKTtcbiAgICBweCA9IGUucGFnZVg7XG4gICAgcHkgPSBlLnBhZ2VZO1xufSk7XG5cbiQoJ2JvZHknKS5tb3VzZXVwKGZ1bmN0aW9uIChlKSB7XG4gICAgJG1vdmluZyA9IG51bGw7XG59KTsiLCJjb25zdCB7ZXh0ZW5kfSA9ICQ7XG5cblxuZnVuY3Rpb24gRU1QVFlfMkQoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgYywge1xuICAgICAgICBCQUNLR1JPVU5EOiAnYmxhY2snLFxuICAgICAgICBESU1FTlNJT046IDIsXG4gICAgICAgIE1BWF9QQVRIUzogMWU1LFxuICAgICAgICBHOiAwLjEsXG4gICAgICAgIEdfTUlOOiAwLjAwMDEsXG4gICAgICAgIEdfTUFYOiAxLFxuICAgICAgICBNQVNTX01JTjogMSxcbiAgICAgICAgTUFTU19NQVg6IDRlNCxcbiAgICAgICAgUkFESVVTX01JTjogMSxcbiAgICAgICAgUkFESVVTX01BWDogMmUyLFxuICAgICAgICBWRUxPQ0lUWV9NQVg6IDEwLFxuICAgICAgICBESVJFQ1RJT05fTEVOR1RIOiAyMCxcbiAgICAgICAgQ0FNRVJBX1BPU0lUSU9OOiBbMCwgMCwgNTAwXSxcbiAgICAgICAgSU5QVVRfVFlQRTogJ3JhbmdlJ1xuICAgIH0pO1xufVxuRU1QVFlfMkQucHJvdG90eXBlLnRpdGxlID0gJzJEIEdyYXZpdHkgU2ltdWxhdG9yJztcblxuXG5mdW5jdGlvbiBFTVBUWV8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8yRChjKSwge1xuICAgICAgICBESU1FTlNJT046IDMsXG4gICAgICAgIEc6IDAuMDAxLFxuICAgICAgICBNQVNTX01JTjogMSxcbiAgICAgICAgTUFTU19NQVg6IDhlNixcbiAgICAgICAgUkFESVVTX01JTjogMSxcbiAgICAgICAgUkFESVVTX01BWDogMmUyLFxuICAgICAgICBWRUxPQ0lUWV9NQVg6IDEwXG4gICAgfSk7XG59XG5FTVBUWV8zRC5wcm90b3R5cGUudGl0bGUgPSAnM0QgR3Jhdml0eSBTaW11bGF0b3InO1xuXG5mdW5jdGlvbiBNQU5VQUxfMkQoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfMkQoYyksIHtcbiAgICAgICAgSU5QVVRfVFlQRTogJ251bWJlcidcbiAgICB9KTtcbn1cbk1BTlVBTF8yRC5wcm90b3R5cGUudGl0bGUgPSAnMkQgTWFudWFsJztcblxuZnVuY3Rpb24gTUFOVUFMXzNEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzNEKGMpLCB7XG4gICAgICAgIElOUFVUX1RZUEU6ICdudW1iZXInXG4gICAgfSk7XG59XG5NQU5VQUxfM0QucHJvdG90eXBlLnRpdGxlID0gJzNEIE1hbnVhbCc7XG5cbmZ1bmN0aW9uIE9SQklUSU5HKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzNEKGMpLCB7XG4gICAgICAgIGluaXQ6IChlbmdpbmUpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ0JhbGwgQScsIFswLCAwLCAwXSwgMTAwMDAwMCwgMTAwLCBbMCwgMCwgMF0sICdibHVlJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdCYWxsIEInLCBbMTgwLCAwLCAwXSwgMSwgMjAsIFswLCAyLjQsIDBdLCAncmVkJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdCYWxsIEMnLCBbMjQwLCAwLCAwXSwgMSwgMjAsIFswLCAyLjEsIDBdLCAneWVsbG93Jyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdCYWxsIEQnLCBbMzAwLCAwLCAwXSwgMSwgMjAsIFswLCAxLjksIDBdLCAnZ3JlZW4nKTtcbiAgICAgICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuT1JCSVRJTkcucHJvdG90eXBlLnRpdGxlID0gJ09yYml0aW5nJztcblxuZnVuY3Rpb24gQ09MTElTSU9OKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzNEKGMpLCB7XG4gICAgICAgIGluaXQ6IChlbmdpbmUpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ0JhbGwgQScsIFstMTAwLCAwLCAwXSwgMTAwMDAwLCA1MCwgWy41LCAuNSwgMF0sICdibHVlJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdCYWxsIEInLCBbMTAwLCAwLCAwXSwgMTAwMDAwLCA1MCwgWy0uNSwgLS41LCAwXSwgJ3JlZCcpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnQmFsbCBDJywgWzAsIDEwMCwgMF0sIDEwMDAwMCwgNTAsIFswLCAwLCAwXSwgJ2dyZWVuJyk7XG4gICAgICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbkNPTExJU0lPTi5wcm90b3R5cGUudGl0bGUgPSAnRWxhc3RpYyBDb2xsaXNpb24nO1xuXG5mdW5jdGlvbiBTT0xBUl9TWVNURU0oYykge1xuICAgIGNvbnN0IGtfdiA9IDVlLTI7XG4gICAgY29uc3Qga19yID0gKHIpID0+IHtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KE1hdGgubG9nKHIpLCAzKSAqIDFlLTI7XG4gICAgfTtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIE1BTlVBTF8zRChjKSwge1xuICAgICAgICBHOiAzOTg2ODJlLTYgKiBNYXRoLnBvdyhrX3YsIDIpLFxuICAgICAgICBDQU1FUkFfUE9TSVRJT046IFswLCAwLCA1ZTJdLFxuICAgICAgICAvKipcbiAgICAgICAgICogTGVuZ3RoOiBrbVxuICAgICAgICAgKiBNYXNzOiBlYXJ0aCBtYXNzXG4gICAgICAgICAqXG4gICAgICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfU29sYXJfU3lzdGVtX29iamVjdHNfYnlfc2l6ZVxuICAgICAgICAgKiBodHRwOi8vbnNzZGMuZ3NmYy5uYXNhLmdvdi9wbGFuZXRhcnkvZmFjdHNoZWV0L1xuICAgICAgICAgKi9cbiAgICAgICAgaW5pdDogKGVuZ2luZSkgPT4ge1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnU3VuJywgWzAsIDAsIDBdLCAzMzMwMDAsIGtfcig2OTYzNDIpLCBbMCwgMCwgMF0sICdtYXAvc29sYXJfc3lzdGVtL3N1bi5qcGcnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ01lcmN1cnknLCBbNTcuOSwgMCwgMF0sIDAuMDU1Mywga19yKDI0MzkuNyksIFswLCA0Ny40ICoga192LCAwXSwgJ21hcC9zb2xhcl9zeXN0ZW0vbWVyY3VyeS5wbmcnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ1ZlbnVzJywgWzEwOC4yLCAwLCAwXSwgMC44MTUsIGtfcig2MDUxLjgpLCBbMCwgMzUuMCAqIGtfdiwgMF0sICdtYXAvc29sYXJfc3lzdGVtL3ZlbnVzLmpwZycpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnRWFydGgnLCBbMTQ5LjYsIDAsIDBdLCAxLCBrX3IoNjM3MS4wKSwgWzAsIDI5LjggKiBrX3YsIDBdLCAnbWFwL3NvbGFyX3N5c3RlbS9lYXJ0aC5qcGcnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ01hcnMnLCBbMjI3LjksIDAsIDBdLCAwLjEwNywga19yKDMzODkuNSksIFswLCAyNC4xICoga192LCAwXSwgJ21hcC9zb2xhcl9zeXN0ZW0vbWFycy5qcGcnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ0p1cGl0ZXInLCBbNzc4LjYsIDAsIDBdLCAzMTcuODMsIGtfcig2OTkxMSksIFswLCAxMy4xICoga192LCAwXSwgJ21hcC9zb2xhcl9zeXN0ZW0vanVwaXRlci5qcGcnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ1NhdHVybicsIFsxNDMzLjUsIDAsIDBdLCA5NS4xNjIsIGtfcig1ODIzMiksIFswLCA5LjcgKiBrX3YsIDBdLCAnbWFwL3NvbGFyX3N5c3RlbS9zYXR1cm4uanBnJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdVcmFudXMnLCBbMjg3Mi41LCAwLCAwXSwgMTQuNTM2LCBrX3IoMjUzNjIpLCBbMCwgNi44ICoga192LCAwXSwgJ21hcC9zb2xhcl9zeXN0ZW0vdXJhbnVzLmpwZycpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnTmVwdHVuZScsIFs0NDk1LjEsIDAsIDBdLCAxNy4xNDcsIGtfcigyNDYyMiksIFswLCA1LjQgKiBrX3YsIDBdLCAnbWFwL3NvbGFyX3N5c3RlbS9uZXB0dW5lLmpwZycpO1xuXG4gICAgICAgICAgICBjb25zdCBsaWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmZmZmZmLCAuOCwgMCk7XG4gICAgICAgICAgICBsaWdodC5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XG4gICAgICAgICAgICBlbmdpbmUuc2NlbmUuYWRkKGxpZ2h0KTtcblxuICAgICAgICAgICAgZW5naW5lLnRvZ2dsZUFuaW1hdGluZygpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5TT0xBUl9TWVNURU0ucHJvdG90eXBlLnRpdGxlID0gJ1NvbGFyIFN5c3RlbSc7XG5cbm1vZHVsZS5leHBvcnRzID0gW0VNUFRZXzJELCBFTVBUWV8zRCwgTUFOVUFMXzJELCBNQU5VQUxfM0QsIE9SQklUSU5HLCBDT0xMSVNJT04sIFNPTEFSX1NZU1RFTV07IiwiY2xhc3MgQ29udHJvbEJveCB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCB0aXRsZSwgY29udHJvbGxlcnMsIHgsIHkpIHtcbiAgICAgICAgY29uc3QgJHRlbXBsYXRlQ29udHJvbEJveCA9ICQoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpO1xuICAgICAgICBjb25zdCAkY29udHJvbEJveCA9ICR0ZW1wbGF0ZUNvbnRyb2xCb3guY2xvbmUoKTtcbiAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy50aXRsZScpLnRleHQodGl0bGUpO1xuICAgICAgICBjb25zdCAkaW5wdXRDb250YWluZXIgPSAkY29udHJvbEJveC5maW5kKCcuaW5wdXQtY29udGFpbmVyJyk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbGxlciBvZiBjb250cm9sbGVycykge1xuICAgICAgICAgICAgJGlucHV0Q29udGFpbmVyLmFwcGVuZChjb250cm9sbGVyLiRpbnB1dFdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy5jbG9zZScpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgICRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnJlbW92ZScpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIG9iamVjdC5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY29udHJvbEJveC5pbnNlcnRCZWZvcmUoJHRlbXBsYXRlQ29udHJvbEJveCk7XG4gICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG5cbiAgICAgICAgdGhpcy4kY29udHJvbEJveCA9ICRjb250cm9sQm94O1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLiRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGlzT3BlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGNvbnRyb2xCb3hbMF0ucGFyZW50Tm9kZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbEJveDsiLCJjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIG5hbWUsIG1pbiwgbWF4LCB2YWx1ZSwgZnVuYykge1xuICAgICAgICBjb25zdCAkaW5wdXRXcmFwcGVyID0gdGhpcy4kaW5wdXRXcmFwcGVyID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlIC5pbnB1dC13cmFwcGVyLnRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5maW5kKCcubmFtZScpLnRleHQobmFtZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dCA9IHRoaXMuJGlucHV0ID0gJGlucHV0V3JhcHBlci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAkaW5wdXQuYXR0cigndHlwZScsIG9iamVjdC5jb25maWcuSU5QVVRfVFlQRSk7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtaW4nLCBtaW4pO1xuICAgICAgICAkaW5wdXQuYXR0cignbWF4JywgbWF4KTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3ZhbHVlJywgdmFsdWUpO1xuICAgICAgICAkaW5wdXQuYXR0cignc3RlcCcsIDAuMDEpO1xuICAgICAgICBjb25zdCAkdmFsdWUgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJy52YWx1ZScpO1xuICAgICAgICAkdmFsdWUudGV4dCh0aGlzLmdldCgpKTtcbiAgICAgICAgJGlucHV0Lm9uKCdpbnB1dCcsIGUgPT4ge1xuICAgICAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICAgICBmdW5jLmNhbGwob2JqZWN0LCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLiRpbnB1dC52YWwoKSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXI7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi4vb2JqZWN0L2NpcmNsZScpO1xuY29uc3Qge25vdywgcmFuZG9tLCBwb2xhcjJjYXJ0ZXNpYW4sIHJhbmRDb2xvcn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7bWFnLCBzdWJ9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCAkZnBzID0gJCgnI2ZwcycpO1xuY29uc3Qge21pbiwgUEksIGF0YW4yfSA9IE1hdGg7XG5cbmNsYXNzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIHJlbmRlcmVyKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLm9ianMgPSBbXTtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb250cm9sQm94ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5mcHNMYXN0VGltZSA9IG5vdygpO1xuICAgICAgICB0aGlzLmZwc0NvdW50ID0gMDtcbiAgICAgICAgdGhpcy5sYXN0T2JqTm8gPSAwO1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICAgICAgdGhpcy5zY2VuZS5iYWNrZ3JvdW5kID0gbmV3IFRIUkVFLkNvbG9yKGNvbmZpZy5CQUNLR1JPVU5EKTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIGNvbmZpZy5XIC8gY29uZmlnLkgsIDFlLTMsIDFlNSk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnggPSBjb25maWcuQ0FNRVJBX1BPU0lUSU9OWzBdO1xuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi55ID0gY29uZmlnLkNBTUVSQV9QT1NJVElPTlsxXTtcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IGNvbmZpZy5DQU1FUkFfUE9TSVRJT05bMl07XG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdCh0aGlzLnNjZW5lLnBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHModGhpcy5jYW1lcmEsIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZW5hYmxlRGFtcGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZGFtcGluZ0ZhY3RvciA9IDAuMjtcbiAgICAgICAgdGhpcy5jb250cm9scy5lbmFibGVSb3RhdGUgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCAkZ3Jhdml0eV9pbnB1dCA9ICQoJyNncmF2aXR5X2lucHV0Jyk7XG4gICAgICAgIGNvbnN0ICRncmF2aXR5X3ZhbHVlID0gJCgnI2dyYXZpdHlfdmFsdWUnKTtcbiAgICAgICAgJGdyYXZpdHlfaW5wdXQuYXR0cigndHlwZScsIGNvbmZpZy5JTlBVVF9UWVBFKTtcbiAgICAgICAgJGdyYXZpdHlfaW5wdXQuYXR0cignbWluJywgY29uZmlnLkdfTUlOKTtcbiAgICAgICAgJGdyYXZpdHlfaW5wdXQuYXR0cignbWF4JywgY29uZmlnLkdfTUFYKTtcbiAgICAgICAgJGdyYXZpdHlfaW5wdXQudmFsKGNvbmZpZy5HKTtcbiAgICAgICAgJGdyYXZpdHlfaW5wdXQuYXR0cignc3RlcCcsIDAuMDAwMSk7XG4gICAgICAgICRncmF2aXR5X3ZhbHVlLnRleHQoY29uZmlnLkcpO1xuICAgICAgICAkKCcjZ3Jhdml0eV9jaGFuZ2UnKS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBncmF2aXR5ID0gcGFyc2VGbG9hdCgkZ3Jhdml0eV9pbnB1dC52YWwoKSk7XG4gICAgICAgICAgICBjb25maWcuRyA9IGdyYXZpdHk7XG4gICAgICAgIH0pO1xuICAgICAgICAkZ3Jhdml0eV9pbnB1dC5vbignaW5wdXQnLCBlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdyYXZpdHkgPSBwYXJzZUZsb2F0KCRncmF2aXR5X2lucHV0LnZhbCgpKTtcbiAgICAgICAgICAgICRncmF2aXR5X3ZhbHVlLnRleHQoZ3Jhdml0eSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvZ2dsZUFuaW1hdGluZygpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSAhdGhpcy5hbmltYXRpbmc7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gYCR7dGhpcy5jb25maWcuVElUTEV9ICgke3RoaXMuYW5pbWF0aW5nID8gXCJTaW11bGF0aW5nXCIgOiBcIlBhdXNlZFwifSlgO1xuICAgIH1cblxuICAgIGFuaW1hdGUoKSB7XG4gICAgICAgIGlmICghdGhpcy5yZW5kZXJlcikgcmV0dXJuO1xuICAgICAgICB0aGlzLnByaW50RnBzKCk7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGluZykge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVBbGwoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlZHJhd0FsbCgpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHVzZXJDcmVhdGVPYmplY3QoeCwgeSkge1xuICAgICAgICBjb25zdCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgICAgICB2ZWN0b3Iuc2V0KCh4IC8gdGhpcy5jb25maWcuVykgKiAyIC0gMSwgLSh5IC8gdGhpcy5jb25maWcuSCkgKiAyICsgMSwgMC41KTtcbiAgICAgICAgdmVjdG9yLnVucHJvamVjdCh0aGlzLmNhbWVyYSk7XG4gICAgICAgIGNvbnN0IGRpciA9IHZlY3Rvci5zdWIodGhpcy5jYW1lcmEucG9zaXRpb24pLm5vcm1hbGl6ZSgpO1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IC10aGlzLmNhbWVyYS5wb3NpdGlvbi56IC8gZGlyLno7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5jYW1lcmEucG9zaXRpb24uY2xvbmUoKS5hZGQoZGlyLm11bHRpcGx5U2NhbGFyKGRpc3RhbmNlKSk7XG4gICAgICAgIGNvbnN0IHBvcyA9IFtwb3NpdGlvbi54LCBwb3NpdGlvbi55XTtcblxuICAgICAgICBsZXQgbWF4UiA9IHRoaXMuY29uZmlnLlJBRElVU19NQVg7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgbWF4UiA9IG1pbihtYXhSLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5yKSAvIDEuNSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtID0gcmFuZG9tKHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCk7XG4gICAgICAgIGNvbnN0IHIgPSByYW5kb20odGhpcy5jb25maWcuUkFESVVTX01JTiwgbWF4Uik7XG4gICAgICAgIGNvbnN0IHYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcmFuZENvbG9yKCk7XG4gICAgICAgIGNvbnN0IHRhZyA9IGBjaXJjbGUkeysrdGhpcy5sYXN0T2JqTm99YDtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IENpcmNsZSh0aGlzLmNvbmZpZywgbSwgciwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgb2JqLnNob3dDb250cm9sQm94KHgsIHkpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGNyZWF0ZU9iamVjdCh0YWcsIHBvcywgbSwgciwgdiwgdGV4dHVyZSkge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIHRleHR1cmUsIHRhZywgdGhpcyk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlQWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVWZWxvY2l0eSgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vYmpzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvMSA9IHRoaXMub2Jqc1tpXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMub2Jqcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG8yID0gdGhpcy5vYmpzW2pdO1xuICAgICAgICAgICAgICAgIG8xLmNhbGN1bGF0ZUNvbGxpc2lvbihvMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlUG9zaXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZHJhd0FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouZHJhdygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbHMudXBkYXRlKCk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgICB9XG5cbiAgICBwcmludEZwcygpIHtcbiAgICAgICAgdGhpcy5mcHNDb3VudCArPSAxO1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IG5vdygpO1xuICAgICAgICBjb25zdCB0aW1lRGlmZiA9IGN1cnJlbnRUaW1lIC0gdGhpcy5mcHNMYXN0VGltZTtcbiAgICAgICAgaWYgKHRpbWVEaWZmID4gMSkge1xuICAgICAgICAgICAgJGZwcy50ZXh0KGAkeyh0aGlzLmZwc0NvdW50IC8gdGltZURpZmYpIHwgMH0gZnBzYCk7XG4gICAgICAgICAgICB0aGlzLmZwc0xhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgICAgICB0aGlzLmZwc0NvdW50ID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2l6ZSgpIHtcbiAgICAgICAgdGhpcy5jYW1lcmEuYXNwZWN0ID0gdGhpcy5jb25maWcuVyAvIHRoaXMuY29uZmlnLkg7XG4gICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3lDb250cm9sQm94ZXMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbEJveCBvZiB0aGlzLmNvbnRyb2xCb3hlcykge1xuICAgICAgICAgICAgY29udHJvbEJveC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW11cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5kZXN0cm95Q29udHJvbEJveGVzKCk7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZGlzcG9zZSgpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUyRDsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vMmQnKTtcbmNvbnN0IFNwaGVyZSA9IHJlcXVpcmUoJy4uL29iamVjdC9zcGhlcmUnKTtcbmNvbnN0IHtyYW5kb20sIHJhbmRDb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7bWFnLCBzdWIsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttaW59ID0gTWF0aDtcblxuXG5jbGFzcyBFbmdpbmUzRCBleHRlbmRzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIHJlbmRlcmVyKSB7XG4gICAgICAgIHN1cGVyKGNvbmZpZywgcmVuZGVyZXIpO1xuXG4gICAgICAgIGNvbnN0IGhlbWlMaWdodCA9IG5ldyBUSFJFRS5IZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4ZmZmZmZmLCAxKTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoaGVtaUxpZ2h0KTtcblxuICAgICAgICBjb25zdCBkaXJMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAwLjIpO1xuICAgICAgICBkaXJMaWdodC5wb3NpdGlvbi5zZXQoLTEsIDEsIDEpO1xuICAgICAgICBkaXJMaWdodC5wb3NpdGlvbi5tdWx0aXBseVNjYWxhcig1MCk7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGRpckxpZ2h0KTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xzLmVuYWJsZVJvdGF0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdXNlckNyZWF0ZU9iamVjdCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgICAgIHZlY3Rvci5zZXQoKHggLyB0aGlzLmNvbmZpZy5XKSAqIDIgLSAxLCAtKHkgLyB0aGlzLmNvbmZpZy5IKSAqIDIgKyAxLCAwLjUpO1xuICAgICAgICB2ZWN0b3IudW5wcm9qZWN0KHRoaXMuY2FtZXJhKTtcbiAgICAgICAgY29uc3QgZGlyID0gdmVjdG9yLnN1Yih0aGlzLmNhbWVyYS5wb3NpdGlvbikubm9ybWFsaXplKCk7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5jb25maWcuUkFESVVTX01BWCAqIDMgLSB0aGlzLmNhbWVyYS5wb3NpdGlvbi56IC8gZGlyLno7XG4gICAgICAgIGNvbnN0IHAgPSB0aGlzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpLmFkZChkaXIubXVsdGlwbHlTY2FsYXIoZGlzdGFuY2UpKTtcbiAgICAgICAgY29uc3QgcG9zID0gW3AueCwgcC55LCBwLnpdO1xuXG4gICAgICAgIGxldCBtYXhSID0gdGhpcy5jb25maWcuUkFESVVTX01BWDtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBtYXhSID0gbWluKG1heFIsIChtYWcoc3ViKG9iai5wb3MsIHBvcykpIC0gb2JqLnIpIC8gMS41KVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG0gPSByYW5kb20odGhpcy5jb25maWcuTUFTU19NSU4sIHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgY29uc3QgciA9IHJhbmRvbSh0aGlzLmNvbmZpZy5SQURJVVNfTUlOLCBtYXhSKTtcbiAgICAgICAgY29uc3QgdiA9IHNwaGVyaWNhbDJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSwgcmFuZG9tKC0xODAsIDE4MCkpO1xuICAgICAgICBjb25zdCBjb2xvciA9IHJhbmRDb2xvcigpO1xuICAgICAgICBjb25zdCB0YWcgPSBgc3BoZXJlJHsrK3RoaXMubGFzdE9iak5vfWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBTcGhlcmUodGhpcy5jb25maWcsIG0sIHIsIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIG9iai5zaG93Q29udHJvbEJveCh4LCB5KTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBjcmVhdGVPYmplY3QodGFnLCBwb3MsIG0sIHIsIHYsIHRleHR1cmUpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IFNwaGVyZSh0aGlzLmNvbmZpZywgbSwgciwgcG9zLCB2LCB0ZXh0dXJlLCB0YWcsIHRoaXMpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIHVwZGF0ZVBvc2l0aW9uKCkge1xuICAgICAgICBzdXBlci51cGRhdGVQb3NpdGlvbigpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUzRDsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vZW5naW5lLzJkJyk7XG5jb25zdCBFbmdpbmUzRCA9IHJlcXVpcmUoJy4vZW5naW5lLzNkJyk7XG5cblxubGV0IGNvbmZpZyA9IG51bGw7XG5jb25zdCAkcmVuZGVyZXJXcmFwcGVyID0gJCgnLnJlbmRlcmVyLXdyYXBwZXInKTtcblxuZnVuY3Rpb24gb25SZXNpemUoZSwgZW5naW5lKSB7XG4gICAgY29uZmlnLlcgPSAkcmVuZGVyZXJXcmFwcGVyLndpZHRoKCk7XG4gICAgY29uZmlnLkggPSAkcmVuZGVyZXJXcmFwcGVyLmhlaWdodCgpO1xuICAgIGlmIChlbmdpbmUpIGVuZ2luZS5yZXNpemUoKTtcbn1cblxuY29uc3QgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xuY29uc3QgbW91c2UgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuZnVuY3Rpb24gb25DbGljayhlLCBlbmdpbmUpIHtcbiAgICBjb25zdCB4ID0gZS5wYWdlWDtcbiAgICBjb25zdCB5ID0gZS5wYWdlWTtcbiAgICBpZiAoIWVuZ2luZS5hbmltYXRpbmcpIHtcbiAgICAgICAgbW91c2UueCA9ICh4IC8gY29uZmlnLlcpICogMiAtIDE7XG4gICAgICAgIG1vdXNlLnkgPSAtKHkgLyBjb25maWcuSCkgKiAyICsgMTtcbiAgICAgICAgcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEobW91c2UsIGVuZ2luZS5jYW1lcmEpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiBlbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgdmFyIGludGVyc2VjdHMgPSByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0KG9iai5vYmplY3QpO1xuICAgICAgICAgICAgaWYgKGludGVyc2VjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG9iai5zaG93Q29udHJvbEJveCh4LCB5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbmdpbmUudXNlckNyZWF0ZU9iamVjdCh4LCB5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uS2V5RG93bihlLCBlbmdpbmUpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBlO1xuICAgIGlmIChrZXlDb2RlID09IDMyKSB7IC8vIHNwYWNlIGJhclxuICAgICAgICBlbmdpbmUuZGVzdHJveUNvbnRyb2xCb3hlcygpO1xuICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgfVxufVxuXG5jbGFzcyBTaW11bGF0b3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgICAgICAgJHJlbmRlcmVyV3JhcHBlci5hcHBlbmQodGhpcy5yZW5kZXJlci5kb21FbGVtZW50KTtcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShlID0+IHtcbiAgICAgICAgICAgIG9uUmVzaXplKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQodGhpcy5yZW5kZXJlci5kb21FbGVtZW50KS5kYmxjbGljayhlID0+IHtcbiAgICAgICAgICAgIG9uQ2xpY2soZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnYm9keScpLmtleWRvd24oZSA9PiB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBvbktleURvd24oZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0KHByZXNldCkge1xuICAgICAgICBpZiAodGhpcy5lbmdpbmUpIHRoaXMuZW5naW5lLmRlc3Ryb3koKTtcbiAgICAgICAgY29uZmlnID0gcHJlc2V0KHt9KTtcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBjb25maWcuVElUTEUgPSBwcmVzZXQucHJvdG90eXBlLnRpdGxlO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyAoY29uZmlnLkRJTUVOU0lPTiA9PSAyID8gRW5naW5lMkQgOiBFbmdpbmUzRCkoY29uZmlnLCB0aGlzLnJlbmRlcmVyKTtcbiAgICAgICAgb25SZXNpemUobnVsbCwgdGhpcy5lbmdpbmUpO1xuICAgICAgICBpZiAoJ2luaXQnIGluIGNvbmZpZykgY29uZmlnLmluaXQodGhpcy5lbmdpbmUpO1xuICAgICAgICB0aGlzLmVuZ2luZS5hbmltYXRlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvcjsiLCJmdW5jdGlvbiBpdGVyKGEsIGZ1bmMpIHtcbiAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICBtW2ldID0gZnVuYyhpKTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHplcm9zOiBOID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheShOKS5maWxsKDApO1xuICAgIH0sXG5cbiAgICBtYWc6IGEgPT4ge1xuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBhW2ldICogYVtpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHN1bSk7XG4gICAgfSxcblxuICAgIGFkZDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSArIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzdWI6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLSBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbXVsOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICogYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRpdjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAvIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkb3Q6IChhLCBiLCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGlmIChkaXIgPT0gLTEpIHtcbiAgICAgICAgICAgIFthLCBiXSA9IFtiLCBhXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYV9jID0gYVswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJfYyA9IGJbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgYV9yOyByKyspIHtcbiAgICAgICAgICAgIG1bcl0gPSBuZXcgQXJyYXkoYl9jKTtcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgYl9jOyBjKyspIHtcbiAgICAgICAgICAgICAgICBtW3JdW2NdID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG1bcl1bY10gKz0gYVtyXVtpXSAqIGJbaV1bY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH0sXG5cbiAgICB0bzM6IGEgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoYVswXSwgYVsxXSwgYVsyXSk7XG4gICAgfVxufTsiLCJjb25zdCBDb250cm9sQm94ID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sX2JveCcpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHBvbGFyMmNhcnRlc2lhbiwgY2FydGVzaWFuMmF1dG8sIHNxdWFyZSwgcm90YXRlLCBnZXRSb3RhdGlvbk1hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCB0bzN9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWF4fSA9IE1hdGg7XG5jb25zdCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcblxuXG5jbGFzcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFBvbGFyIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9sYXJfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgbSwgciwgcG9zLCB2LCB0ZXh0dXJlLCB0YWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldlBvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gdGhpcy5jcmVhdGVUaHJlZU9iamVjdCgpO1xuICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBudWxsO1xuICAgICAgICB0aGlzLnBhdGggPSBudWxsO1xuICAgICAgICB0aGlzLnBhdGhWZXJ0aWNlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhdGhNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgICAgICBjb2xvcjogMHg4ODg4ODhcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb25NYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgICAgICBjb2xvcjogMHhmZmZmZmZcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0VGhyZWVHZW9tZXRyeSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5DaXJjbGVHZW9tZXRyeSh0aGlzLnIsIDMyKTtcbiAgICB9XG5cbiAgICBnZXRUaHJlZU1hdGVyaWFsT3B0aW9uKCkge1xuICAgICAgICBjb25zdCBtYXRlcmlhbE9wdGlvbiA9IHt9O1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMudGV4dHVyZSA9PT0gJ3N0cmluZycgJiYgdGhpcy50ZXh0dXJlLmluZGV4T2YoJ21hcC8nKSA9PSAwKSBtYXRlcmlhbE9wdGlvbi5tYXAgPSB0ZXh0dXJlTG9hZGVyLmxvYWQodGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZWxzZSBtYXRlcmlhbE9wdGlvbi5jb2xvciA9IHRoaXMudGV4dHVyZTtcbiAgICAgICAgcmV0dXJuIG1hdGVyaWFsT3B0aW9uO1xuICAgIH1cblxuICAgIGdldFRocmVlTWF0ZXJpYWwoKSB7XG4gICAgICAgIGNvbnN0IG1hdGVyaWFsT3B0aW9uID0gdGhpcy5nZXRUaHJlZU1hdGVyaWFsT3B0aW9uKCk7XG4gICAgICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwobWF0ZXJpYWxPcHRpb24pO1xuICAgIH1cblxuICAgIGNyZWF0ZVRocmVlT2JqZWN0KCkge1xuICAgICAgICBpZiAodGhpcy5vYmplY3QpIHRoaXMuZW5naW5lLnNjZW5lLnJlbW92ZSh0aGlzLm9iamVjdCk7XG4gICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gdGhpcy5nZXRUaHJlZUdlb21ldHJ5KCk7XG4gICAgICAgIGNvbnN0IG1hdGVyaWFsID0gdGhpcy5nZXRUaHJlZU1hdGVyaWFsKCk7XG4gICAgICAgIGNvbnN0IG9iamVjdCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgICAgIG9iamVjdC5tYXRyaXhBdXRvVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZW5naW5lLnNjZW5lLmFkZChvYmplY3QpO1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cblxuICAgIGNhbGN1bGF0ZVZlbG9jaXR5KCkge1xuICAgICAgICBsZXQgRiA9IHplcm9zKHRoaXMuY29uZmlnLkRJTUVOU0lPTik7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIGlmIChvYmogPT0gdGhpcykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCB2ZWN0b3IgPSBzdWIodGhpcy5wb3MsIG9iai5wb3MpO1xuICAgICAgICAgICAgY29uc3QgbWFnbml0dWRlID0gbWFnKHZlY3Rvcik7XG4gICAgICAgICAgICBjb25zdCB1bml0VmVjdG9yID0gZGl2KHZlY3RvciwgbWFnbml0dWRlKTtcbiAgICAgICAgICAgIEYgPSBhZGQoRiwgbXVsKHVuaXRWZWN0b3IsIG9iai5tIC8gc3F1YXJlKG1hZ25pdHVkZSkpKTtcbiAgICAgICAgfVxuICAgICAgICBGID0gbXVsKEYsIC10aGlzLmNvbmZpZy5HICogdGhpcy5tKTtcbiAgICAgICAgY29uc3QgYSA9IGRpdihGLCB0aGlzLm0pO1xuICAgICAgICB0aGlzLnYgPSBhZGQodGhpcy52LCBhKTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVQb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5wb3MgPSBhZGQodGhpcy5wb3MsIHRoaXMudik7XG4gICAgICAgIGlmIChtYWcoc3ViKHRoaXMucG9zLCB0aGlzLnByZXZQb3MpKSA+IDEpIHtcbiAgICAgICAgICAgIHRoaXMucHJldlBvcyA9IHRoaXMucG9zLnNsaWNlKCk7XG4gICAgICAgICAgICB0aGlzLnBhdGhWZXJ0aWNlcy5wdXNoKHRvMyh0aGlzLnBvcykpO1xuICAgICAgICAgICAgaWYgKHRoaXMucGF0aFZlcnRpY2VzLmxlbmd0aCA+IHRoaXMuY29uZmlnLk1BWF9QQVRIUykgdGhpcy5wYXRoVmVydGljZXMuc2hpZnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzWzBdLCBkaXIpO1xuICAgIH1cblxuICAgIGdldFBpdm90QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlQ29sbGlzaW9uKG8pIHtcbiAgICAgICAgY29uc3QgZGltZW5zaW9uID0gdGhpcy5jb25maWcuRElNRU5TSU9OO1xuICAgICAgICBjb25zdCBjb2xsaXNpb24gPSBzdWIoby5wb3MsIHRoaXMucG9zKTtcbiAgICAgICAgY29uc3QgYW5nbGVzID0gY2FydGVzaWFuMmF1dG8oY29sbGlzaW9uKTtcbiAgICAgICAgY29uc3QgZCA9IGFuZ2xlcy5zaGlmdCgpO1xuXG4gICAgICAgIGlmIChkIDwgdGhpcy5yICsgby5yKSB7XG4gICAgICAgICAgICBjb25zdCBSID0gdGhpcy5nZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMpO1xuICAgICAgICAgICAgY29uc3QgUl8gPSB0aGlzLmdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgLTEpO1xuICAgICAgICAgICAgY29uc3QgaSA9IHRoaXMuZ2V0UGl2b3RBeGlzKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHZUZW1wID0gW3JvdGF0ZSh0aGlzLnYsIFIpLCByb3RhdGUoby52LCBSKV07XG4gICAgICAgICAgICBjb25zdCB2RmluYWwgPSBbdlRlbXBbMF0uc2xpY2UoKSwgdlRlbXBbMV0uc2xpY2UoKV07XG4gICAgICAgICAgICB2RmluYWxbMF1baV0gPSAoKHRoaXMubSAtIG8ubSkgKiB2VGVtcFswXVtpXSArIDIgKiBvLm0gKiB2VGVtcFsxXVtpXSkgLyAodGhpcy5tICsgby5tKTtcbiAgICAgICAgICAgIHZGaW5hbFsxXVtpXSA9ICgoby5tIC0gdGhpcy5tKSAqIHZUZW1wWzFdW2ldICsgMiAqIHRoaXMubSAqIHZUZW1wWzBdW2ldKSAvICh0aGlzLm0gKyBvLm0pO1xuICAgICAgICAgICAgdGhpcy52ID0gcm90YXRlKHZGaW5hbFswXSwgUl8pO1xuICAgICAgICAgICAgby52ID0gcm90YXRlKHZGaW5hbFsxXSwgUl8pO1xuXG4gICAgICAgICAgICBjb25zdCBwb3NUZW1wID0gW3plcm9zKGRpbWVuc2lvbiksIHJvdGF0ZShjb2xsaXNpb24sIFIpXTtcbiAgICAgICAgICAgIHBvc1RlbXBbMF1baV0gKz0gdkZpbmFsWzBdW2ldO1xuICAgICAgICAgICAgcG9zVGVtcFsxXVtpXSArPSB2RmluYWxbMV1baV07XG4gICAgICAgICAgICB0aGlzLnBvcyA9IGFkZCh0aGlzLnBvcywgcm90YXRlKHBvc1RlbXBbMF0sIFJfKSk7XG4gICAgICAgICAgICBvLnBvcyA9IGFkZCh0aGlzLnBvcywgcm90YXRlKHBvc1RlbXBbMV0sIFJfKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLm9iamVjdC5wb3NpdGlvbi54ID0gdGhpcy5wb3NbMF07XG4gICAgICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLnkgPSB0aGlzLnBvc1sxXTtcbiAgICAgICAgdGhpcy5vYmplY3QudXBkYXRlTWF0cml4KCk7XG5cbiAgICAgICAgaWYgKHRoaXMucGF0aCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMucGF0aCk7XG4gICAgICAgIGNvbnN0IHBhdGhHZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICAgICAgICBwYXRoR2VvbWV0cnkudmVydGljZXMgPSB0aGlzLnBhdGhWZXJ0aWNlcztcbiAgICAgICAgdGhpcy5wYXRoID0gbmV3IFRIUkVFLkxpbmUocGF0aEdlb21ldHJ5LCB0aGlzLnBhdGhNYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuZW5naW5lLnNjZW5lLmFkZCh0aGlzLnBhdGgpO1xuXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbikgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uR2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgICAgICAgaWYgKG1hZyh0aGlzLnYpID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHNQb3MgPSBhZGQodGhpcy5wb3MsIG11bCh0aGlzLnYsIHRoaXMuciAvIG1hZyh0aGlzLnYpKSk7XG4gICAgICAgICAgICBjb25zdCBlUG9zID0gYWRkKHNQb3MsIG11bCh0aGlzLnYsIHRoaXMuY29uZmlnLkRJUkVDVElPTl9MRU5HVEgpKTtcbiAgICAgICAgICAgIGRpcmVjdGlvbkdlb21ldHJ5LnZlcnRpY2VzID0gW3RvMyhzUG9zKSwgdG8zKGVQb3MpXTtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbmV3IFRIUkVFLkxpbmUoZGlyZWN0aW9uR2VvbWV0cnksIHRoaXMuZGlyZWN0aW9uTWF0ZXJpYWwpO1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUuc2NlbmUuYWRkKHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnRyb2xNKGUpIHtcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgICAgIHRoaXMub2JqZWN0ID0gdGhpcy5jcmVhdGVUaHJlZU9iamVjdCgpO1xuICAgIH1cblxuICAgIGNvbnRyb2xSKGUpIHtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuckNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMuciA9IHI7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gdGhpcy5jcmVhdGVUaHJlZU9iamVjdCgpO1xuICAgIH1cblxuICAgIGNvbnRyb2xQb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NYQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zWUNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHldO1xuICAgIH1cblxuICAgIGNvbnRyb2xWKGUpIHtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52UmhvQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgcGhpID0gZGVnMnJhZCh0aGlzLnZQaGlDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgdGhpcy52ID0gcG9sYXIyY2FydGVzaWFuKHJobywgcGhpKTtcbiAgICB9XG5cbiAgICBzaG93Q29udHJvbEJveCh4LCB5KSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRyb2xCb3ggJiYgdGhpcy5jb250cm9sQm94LmlzT3BlbigpKSB7XG4gICAgICAgICAgICBjb25zdCAkY29udHJvbEJveCA9IHRoaXMuY29udHJvbEJveC4kY29udHJvbEJveDtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgICAgICRjb250cm9sQm94LmNzcygndG9wJywgeSArICdweCcpO1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gubmV4dFVudGlsKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5pbnNlcnRCZWZvcmUoJGNvbnRyb2xCb3gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbWFyZ2luID0gMS41O1xuXG4gICAgICAgICAgICB2YXIgcG9zUmFuZ2UgPSBtYXgobWF4KHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpIC8gMiwgbWF4LmFwcGx5KG51bGwsIHRoaXMucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICBwb3NSYW5nZSA9IG1heChwb3NSYW5nZSwgbWF4LmFwcGx5KG51bGwsIG9iai5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZSYW5nZSA9IG1heCh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVgsIG1hZyh0aGlzLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICB2UmFuZ2UgPSBtYXgodlJhbmdlLCBtYWcob2JqLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgdGhpcy5tLCB0aGlzLnIsIHYsIHZSYW5nZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBuZXcgQ29udHJvbEJveCh0aGlzLCB0aGlzLnRhZywgdGhpcy5nZXRDb250cm9sbGVycygpLCB4LCB5KTtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmNvbnRyb2xCb3hlcy5wdXNoKHRoaXMuY29udHJvbEJveCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXR1cF9jb250cm9sbGVycyhwb3NSYW5nZSwgbSwgciwgdiwgdlJhbmdlKSB7XG4gICAgICAgIHRoaXMubUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIk1hc3MgbVwiLCB0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgsIG0sIHRoaXMuY29udHJvbE0pO1xuICAgICAgICB0aGlzLnJDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJSYWRpdXMgclwiLCB0aGlzLmNvbmZpZy5SQURJVVNfTUlOLCB0aGlzLmNvbmZpZy5SQURJVVNfTUFYLCByLCB0aGlzLmNvbnRyb2xSKTtcbiAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geFwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1swXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geVwiLCAtcG9zUmFuZ2UsIHBvc1JhbmdlLCB0aGlzLnBvc1sxXSwgdGhpcy5jb250cm9sUG9zKTtcbiAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4FcIiwgMCwgdlJhbmdlLCB2WzBdLCB0aGlzLmNvbnRyb2xWKTtcbiAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4ZcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMV0pLCB0aGlzLmNvbnRyb2xWKTtcbiAgICB9XG5cbiAgICBnZXRDb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnJDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UGhpQ29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLm9iamVjdCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMub2JqZWN0KTtcbiAgICAgICAgaWYgKHRoaXMucGF0aCkgdGhpcy5lbmdpbmUuc2NlbmUucmVtb3ZlKHRoaXMucGF0aCk7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLmVuZ2luZS5vYmpzLmluZGV4T2YodGhpcyk7XG4gICAgICAgIHRoaXMuZW5naW5lLm9ianMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpZiAodGhpcy5jb250cm9sQm94ICYmIHRoaXMuY29udHJvbEJveC5pc09wZW4oKSkge1xuICAgICAgICAgICAgdGhpcy5jb250cm9sQm94LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsndGFnJzogdGhpcy50YWcsICd2JzogdGhpcy52LCAncG9zJzogdGhpcy5wb3N9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4vY2lyY2xlJyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7cmFkMmRlZywgZGVnMnJhZCwgc3BoZXJpY2FsMmNhcnRlc2lhbiwgZ2V0WVJvdGF0aW9uTWF0cml4LCBnZXRaUm90YXRpb25NYXRyaXh9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge2RvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcblxuXG5jbGFzcyBTcGhlcmUgZXh0ZW5kcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFNwaGVyaWNhbCBjb29yZGluYXRlIHN5c3RlbVxuICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NwaGVyaWNhbF9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgZ2V0VGhyZWVHZW9tZXRyeSgpe1xuICAgICAgICByZXR1cm4gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHRoaXMuciwgMzIsIDMyKTtcbiAgICB9XG5cbiAgICBnZXRUaHJlZU1hdGVyaWFsKCkge1xuICAgICAgICBjb25zdCBtYXRlcmlhbE9wdGlvbiA9IHRoaXMuZ2V0VGhyZWVNYXRlcmlhbE9wdGlvbigpO1xuICAgICAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKG1hdGVyaWFsT3B0aW9uKTtcbiAgICB9XG5cbiAgICBnZXRSb3RhdGlvbk1hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGRvdChnZXRaUm90YXRpb25NYXRyaXgoYW5nbGVzWzBdLCBkaXIpLCBnZXRZUm90YXRpb25NYXRyaXgoYW5nbGVzWzFdLCBkaXIpLCBkaXIpO1xuICAgIH1cblxuICAgIGdldFBpdm90QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5vYmplY3QucG9zaXRpb24ueiA9IHRoaXMucG9zWzJdO1xuICAgICAgICBzdXBlci5kcmF3KCk7XG4gICAgfVxuXG4gICAgY29udHJvbFBvcyhlKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc1hDb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NZQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeiA9IHRoaXMucG9zWkNvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHksIHpdO1xuICAgIH1cblxuICAgIGNvbnRyb2xWKGUpIHtcbiAgICAgICAgY29uc3QgcGhpID0gZGVnMnJhZCh0aGlzLnZQaGlDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgdGhldGEgPSBkZWcycmFkKHRoaXMudlRoZXRhQ29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudlJob0NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMudiA9IHNwaGVyaWNhbDJjYXJ0ZXNpYW4ocmhvLCBwaGksIHRoZXRhKTtcbiAgICB9XG5cbiAgICBzZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHIsIHYsIHZfcmFuZ2UpIHtcbiAgICAgICAgc3VwZXIuc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCByLCB2LCB2X3JhbmdlKTtcbiAgICAgICAgdGhpcy5wb3NaQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24gelwiLCAtcG9zX3JhbmdlLCBwb3NfcmFuZ2UsIHRoaXMucG9zWzJdLCB0aGlzLmNvbnRyb2xQb3MpO1xuICAgICAgICB0aGlzLnZUaGV0YUNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM64XCIsIC0xODAsIDE4MCwgcmFkMmRlZyh2WzJdKSwgdGhpcy5jb250cm9sVik7XG4gICAgfVxuXG4gICAgZ2V0Q29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1Db250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5yQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWENvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1lDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NaQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlJob0NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZQaGlDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52VGhldGFDb250cm9sbGVyXG4gICAgICAgIF07XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaGVyZTsiLCJjb25zdCB7bWFnLCBkb3R9ID0gcmVxdWlyZSgnLi9tYXRyaXgnKTtcblxuY29uc3QgVXRpbCA9IHtcbiAgICBzcXVhcmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeDtcbiAgICB9LFxuXG4gICAgY3ViZTogKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIHggKiB4ICogeDtcbiAgICB9LFxuXG4gICAgcG9sYXIyY2FydGVzaWFuOiAocmhvLCBwaGkpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyAqIE1hdGguY29zKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbihwaGkpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJwb2xhcjogKHgsIHkpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG1hZyhbeCwgeV0pLFxuICAgICAgICAgICAgTWF0aC5hdGFuMih5LCB4KVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBzcGhlcmljYWwyY2FydGVzaWFuOiAocmhvLCBwaGksIHRoZXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5zaW4ocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguY29zKHRoZXRhKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4yc3BoZXJpY2FsOiAoeCwgeSwgeikgPT4ge1xuICAgICAgICBjb25zdCByaG8gPSBtYWcoW3gsIHksIHpdKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeSwgeCksXG4gICAgICAgICAgICByaG8gIT0gMCA/IE1hdGguYWNvcyh6IC8gcmhvKSA6IDBcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMmF1dG86ICh2ZWN0b3IpID0+IHtcbiAgICAgICAgcmV0dXJuIHZlY3Rvci5sZW5ndGggPT0gMlxuICAgICAgICAgICAgPyBVdGlsLmNhcnRlc2lhbjJwb2xhcih2ZWN0b3JbMF0sIHZlY3RvclsxXSlcbiAgICAgICAgICAgIDogVXRpbC5jYXJ0ZXNpYW4yc3BoZXJpY2FsKHZlY3RvclswXSwgdmVjdG9yWzFdLCB2ZWN0b3JbMl0pO1xuICAgIH0sXG5cbiAgICByYWQyZGVnOiAocmFkKSA9PiB7XG4gICAgICAgIHJldHVybiByYWQgLyBNYXRoLlBJICogMTgwO1xuICAgIH0sXG5cbiAgICBkZWcycmFkOiAoZGVnKSA9PiB7XG4gICAgICAgIHJldHVybiBkZWcgLyAxODAgKiBNYXRoLlBJO1xuICAgIH0sXG5cbiAgICBnZXREaXN0YW5jZTogKHgwLCB5MCwgeDEsIHkxKSA9PiB7XG4gICAgICAgIHJldHVybiBtYWcoW3gxIC0geDAsIHkxIC0geTBdKTtcbiAgICB9LFxuXG4gICAgcm90YXRlOiAodmVjdG9yLCBtYXRyaXgpID0+IHtcbiAgICAgICAgcmV0dXJuIGRvdChbdmVjdG9yXSwgbWF0cml4KVswXTtcbiAgICB9LFxuXG4gICAgbm93OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgfSxcblxuICAgIHJhbmRvbTogKG1pbiwgbWF4ID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgICAgICAgIG1heCA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiAgICB9LFxuXG4gICAgcmFuZENvbG9yOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmY7XG4gICAgfSxcblxuICAgIGdldFJvdGF0aW9uTWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAtc2luXSxcbiAgICAgICAgICAgIFtzaW4sIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0WFJvdGF0aW9uTWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbMSwgMCwgMF0sXG4gICAgICAgICAgICBbMCwgY29zLCAtc2luXSxcbiAgICAgICAgICAgIFswLCBzaW4sIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0WVJvdGF0aW9uTWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAwLCBzaW5dLFxuICAgICAgICAgICAgWzAsIDEsIDBdLFxuICAgICAgICAgICAgWy1zaW4sIDAsIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0WlJvdGF0aW9uTWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAtc2luLCAwXSxcbiAgICAgICAgICAgIFtzaW4sIGNvcywgMF0sXG4gICAgICAgICAgICBbMCwgMCwgMV1cbiAgICAgICAgXTtcbiAgICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsOyJdfQ==

//# sourceMappingURL=gravity_simulator.js.map
