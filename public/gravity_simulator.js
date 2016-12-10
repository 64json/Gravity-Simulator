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

        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        this.scene.add(hemiLight);

        var dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
        dirLight.position.set(-1, 1, 1);
        dirLight.position.multiplyScalar(50);
        this.scene.add(dirLight);

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
        key: 'createThreeObject',
        value: function createThreeObject() {
            if (this.object) this.engine.scene.remove(this.object);
            var geometry = this.getThreeGeometry();
            var materialOption = {};
            if (typeof this.texture === 'string' && this.texture.indexOf('map/') == 0) materialOption.map = textureLoader.load(this.texture);else materialOption.color = this.texture;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jb250cm9sL2NvbnRyb2xfYm94LmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbGxlci5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvMmQuanMiLCJqcy9zaW11bGF0b3IvZW5naW5lLzNkLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLElBQU0sWUFBWSxRQUFRLGFBQVIsQ0FBbEI7O0FBRUEsSUFBTSxZQUFZLElBQUksU0FBSixFQUFsQjtBQUNBLElBQUksV0FBVyxDQUFmO0FBQ0EsVUFBVSxJQUFWLENBQWUsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLEtBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3JDLFFBQU0sU0FBUyxRQUFRLENBQVIsQ0FBZjtBQUNBLFlBQVEsTUFBUixxQkFBaUMsQ0FBakMsVUFBc0MsS0FBSyxRQUFMLEdBQWdCLFdBQWhCLEdBQThCLEVBQXBFLFVBQTBFLE9BQU8sU0FBUCxDQUFpQixLQUEzRjtBQUNIO0FBQ0QsUUFBUSxNQUFSLENBQWUsWUFBTTtBQUNqQixlQUFXLFNBQVMsUUFBUSxJQUFSLENBQWEsV0FBYixFQUEwQixHQUExQixFQUFULENBQVg7QUFDQSxjQUFVLElBQVYsQ0FBZSxRQUFRLFFBQVIsQ0FBZjtBQUNILENBSEQ7QUFJ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RCxFQUFJLENBQUosRUFBTyxDQUFQLENBSEcsQ0FBUDtBQUtIO0FBbkhRLENBQWI7O0FBc0hBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBwcmVzZXRzID0gcmVxdWlyZSgnLi9wcmVzZXQnKTtcbmNvbnN0IFNpbXVsYXRvciA9IHJlcXVpcmUoJy4vc2ltdWxhdG9yJyk7XG5cbmNvbnN0IHNpbXVsYXRvciA9IG5ldyBTaW11bGF0b3IoKTtcbmxldCBzZWxlY3RlZCA9IDY7XG5zaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG5cbmNvbnN0ICRzZWxlY3QgPSAkKCdzZWxlY3QnKTtcbmZvciAobGV0IGkgPSAwOyBpIDwgcHJlc2V0cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHByZXNldCA9IHByZXNldHNbaV07XG4gICAgJHNlbGVjdC5hcHBlbmQoYDxvcHRpb24gdmFsdWU9XCIke2l9XCIke2kgPT0gc2VsZWN0ZWQgPyAnIHNlbGVjdGVkJyA6ICcnfT4ke3ByZXNldC5wcm90b3R5cGUudGl0bGV9PC9vcHRpb24+YCk7XG59XG4kc2VsZWN0LmNoYW5nZSgoKSA9PiB7XG4gICAgc2VsZWN0ZWQgPSBwYXJzZUludCgkc2VsZWN0LmZpbmQoJzpzZWxlY3RlZCcpLnZhbCgpKTtcbiAgICBzaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG59KTtcbiQoJyNyZXNldCcpLmNsaWNrKCgpID0+IHtcbiAgICBzaW11bGF0b3IuaW5pdChwcmVzZXRzW3NlbGVjdGVkXSk7XG59KTtcblxuXG5sZXQgJG1vdmluZyA9IG51bGw7XG5sZXQgcHgsIHB5O1xuXG4kKCdib2R5Jykub24oJ21vdXNlZG93bicsICcuY29udHJvbC1ib3ggLnRpdGxlLWJhcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgcHggPSBlLnBhZ2VYO1xuICAgIHB5ID0gZS5wYWdlWTtcbiAgICAkbW92aW5nID0gJCh0aGlzKS5wYXJlbnQoJy5jb250cm9sLWJveCcpO1xuICAgICRtb3ZpbmcubmV4dFVudGlsKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5pbnNlcnRCZWZvcmUoJG1vdmluZyk7XG4gICAgcmV0dXJuIGZhbHNlO1xufSk7XG5cbiQoJ2JvZHknKS5tb3VzZW1vdmUoZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoISRtb3ZpbmcpIHJldHVybjtcbiAgICBjb25zdCB4ID0gZS5wYWdlWDtcbiAgICBjb25zdCB5ID0gZS5wYWdlWTtcbiAgICAkbW92aW5nLmNzcygnbGVmdCcsIHBhcnNlSW50KCRtb3ZpbmcuY3NzKCdsZWZ0JykpICsgKHggLSBweCkgKyAncHgnKTtcbiAgICAkbW92aW5nLmNzcygndG9wJywgcGFyc2VJbnQoJG1vdmluZy5jc3MoJ3RvcCcpKSArICh5IC0gcHkpICsgJ3B4Jyk7XG4gICAgcHggPSBlLnBhZ2VYO1xuICAgIHB5ID0gZS5wYWdlWTtcbn0pO1xuXG4kKCdib2R5JykubW91c2V1cChmdW5jdGlvbiAoZSkge1xuICAgICRtb3ZpbmcgPSBudWxsO1xufSk7IiwiY29uc3Qge2V4dGVuZH0gPSAkO1xuXG5cbmZ1bmN0aW9uIEVNUFRZXzJEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIGMsIHtcbiAgICAgICAgQkFDS0dST1VORDogJ2JsYWNrJyxcbiAgICAgICAgRElNRU5TSU9OOiAyLFxuICAgICAgICBNQVhfUEFUSFM6IDFlNSxcbiAgICAgICAgRzogMC4xLFxuICAgICAgICBHX01JTjogMC4wMDAxLFxuICAgICAgICBHX01BWDogMSxcbiAgICAgICAgTUFTU19NSU46IDEsXG4gICAgICAgIE1BU1NfTUFYOiA0ZTQsXG4gICAgICAgIFJBRElVU19NSU46IDEsXG4gICAgICAgIFJBRElVU19NQVg6IDJlMixcbiAgICAgICAgVkVMT0NJVFlfTUFYOiAxMCxcbiAgICAgICAgRElSRUNUSU9OX0xFTkdUSDogMjAsXG4gICAgICAgIENBTUVSQV9QT1NJVElPTjogWzAsIDAsIDUwMF0sXG4gICAgICAgIElOUFVUX1RZUEU6ICdyYW5nZSdcbiAgICB9KTtcbn1cbkVNUFRZXzJELnByb3RvdHlwZS50aXRsZSA9ICcyRCBHcmF2aXR5IFNpbXVsYXRvcic7XG5cblxuZnVuY3Rpb24gRU1QVFlfM0QoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfMkQoYyksIHtcbiAgICAgICAgRElNRU5TSU9OOiAzLFxuICAgICAgICBHOiAwLjAwMSxcbiAgICAgICAgTUFTU19NSU46IDEsXG4gICAgICAgIE1BU1NfTUFYOiA4ZTYsXG4gICAgICAgIFJBRElVU19NSU46IDEsXG4gICAgICAgIFJBRElVU19NQVg6IDJlMixcbiAgICAgICAgVkVMT0NJVFlfTUFYOiAxMFxuICAgIH0pO1xufVxuRU1QVFlfM0QucHJvdG90eXBlLnRpdGxlID0gJzNEIEdyYXZpdHkgU2ltdWxhdG9yJztcblxuZnVuY3Rpb24gTUFOVUFMXzJEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzJEKGMpLCB7XG4gICAgICAgIElOUFVUX1RZUEU6ICdudW1iZXInXG4gICAgfSk7XG59XG5NQU5VQUxfMkQucHJvdG90eXBlLnRpdGxlID0gJzJEIE1hbnVhbCc7XG5cbmZ1bmN0aW9uIE1BTlVBTF8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBJTlBVVF9UWVBFOiAnbnVtYmVyJ1xuICAgIH0pO1xufVxuTUFOVUFMXzNELnByb3RvdHlwZS50aXRsZSA9ICczRCBNYW51YWwnO1xuXG5mdW5jdGlvbiBPUkJJVElORyhjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBpbml0OiAoZW5naW5lKSA9PiB7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdCYWxsIEEnLCBbMCwgMCwgMF0sIDEwMDAwMDAsIDEwMCwgWzAsIDAsIDBdLCAnYmx1ZScpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnQmFsbCBCJywgWzE4MCwgMCwgMF0sIDEsIDIwLCBbMCwgMi40LCAwXSwgJ3JlZCcpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnQmFsbCBDJywgWzI0MCwgMCwgMF0sIDEsIDIwLCBbMCwgMi4xLCAwXSwgJ3llbGxvdycpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnQmFsbCBEJywgWzMwMCwgMCwgMF0sIDEsIDIwLCBbMCwgMS45LCAwXSwgJ2dyZWVuJyk7XG4gICAgICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbk9SQklUSU5HLnByb3RvdHlwZS50aXRsZSA9ICdPcmJpdGluZyc7XG5cbmZ1bmN0aW9uIENPTExJU0lPTihjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8zRChjKSwge1xuICAgICAgICBpbml0OiAoZW5naW5lKSA9PiB7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdCYWxsIEEnLCBbLTEwMCwgMCwgMF0sIDEwMDAwMCwgNTAsIFsuNSwgLjUsIDBdLCAnYmx1ZScpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnQmFsbCBCJywgWzEwMCwgMCwgMF0sIDEwMDAwMCwgNTAsIFstLjUsIC0uNSwgMF0sICdyZWQnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ0JhbGwgQycsIFswLCAxMDAsIDBdLCAxMDAwMDAsIDUwLCBbMCwgMCwgMF0sICdncmVlbicpO1xuICAgICAgICAgICAgZW5naW5lLnRvZ2dsZUFuaW1hdGluZygpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5DT0xMSVNJT04ucHJvdG90eXBlLnRpdGxlID0gJ0VsYXN0aWMgQ29sbGlzaW9uJztcblxuZnVuY3Rpb24gU09MQVJfU1lTVEVNKGMpIHtcbiAgICBjb25zdCBrX3YgPSA1ZS0yO1xuICAgIGNvbnN0IGtfciA9IChyKSA9PiB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyhNYXRoLmxvZyhyKSwgMykgKiAxZS0yO1xuICAgIH07XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBNQU5VQUxfM0QoYyksIHtcbiAgICAgICAgRzogMzk4NjgyZS02ICogTWF0aC5wb3coa192LCAyKSxcbiAgICAgICAgQ0FNRVJBX1BPU0lUSU9OOiBbMCwgMCwgNWUyXSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIExlbmd0aDoga21cbiAgICAgICAgICogTWFzczogZWFydGggbWFzc1xuICAgICAgICAgKlxuICAgICAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX1NvbGFyX1N5c3RlbV9vYmplY3RzX2J5X3NpemVcbiAgICAgICAgICogaHR0cDovL25zc2RjLmdzZmMubmFzYS5nb3YvcGxhbmV0YXJ5L2ZhY3RzaGVldC9cbiAgICAgICAgICovXG4gICAgICAgIGluaXQ6IChlbmdpbmUpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ1N1bicsIFswLCAwLCAwXSwgMzMzMDAwLCBrX3IoNjk2MzQyKSwgWzAsIDAsIDBdLCAnbWFwL3NvbGFyX3N5c3RlbS9zdW4uanBnJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdNZXJjdXJ5JywgWzU3LjksIDAsIDBdLCAwLjA1NTMsIGtfcigyNDM5LjcpLCBbMCwgNDcuNCAqIGtfdiwgMF0sICdtYXAvc29sYXJfc3lzdGVtL21lcmN1cnkucG5nJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdWZW51cycsIFsxMDguMiwgMCwgMF0sIDAuODE1LCBrX3IoNjA1MS44KSwgWzAsIDM1LjAgKiBrX3YsIDBdLCAnbWFwL3NvbGFyX3N5c3RlbS92ZW51cy5qcGcnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ0VhcnRoJywgWzE0OS42LCAwLCAwXSwgMSwga19yKDYzNzEuMCksIFswLCAyOS44ICoga192LCAwXSwgJ21hcC9zb2xhcl9zeXN0ZW0vZWFydGguanBnJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdNYXJzJywgWzIyNy45LCAwLCAwXSwgMC4xMDcsIGtfcigzMzg5LjUpLCBbMCwgMjQuMSAqIGtfdiwgMF0sICdtYXAvc29sYXJfc3lzdGVtL21hcnMuanBnJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdKdXBpdGVyJywgWzc3OC42LCAwLCAwXSwgMzE3LjgzLCBrX3IoNjk5MTEpLCBbMCwgMTMuMSAqIGtfdiwgMF0sICdtYXAvc29sYXJfc3lzdGVtL2p1cGl0ZXIuanBnJyk7XG4gICAgICAgICAgICBlbmdpbmUuY3JlYXRlT2JqZWN0KCdTYXR1cm4nLCBbMTQzMy41LCAwLCAwXSwgOTUuMTYyLCBrX3IoNTgyMzIpLCBbMCwgOS43ICoga192LCAwXSwgJ21hcC9zb2xhcl9zeXN0ZW0vc2F0dXJuLmpwZycpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZU9iamVjdCgnVXJhbnVzJywgWzI4NzIuNSwgMCwgMF0sIDE0LjUzNiwga19yKDI1MzYyKSwgWzAsIDYuOCAqIGtfdiwgMF0sICdtYXAvc29sYXJfc3lzdGVtL3VyYW51cy5qcGcnKTtcbiAgICAgICAgICAgIGVuZ2luZS5jcmVhdGVPYmplY3QoJ05lcHR1bmUnLCBbNDQ5NS4xLCAwLCAwXSwgMTcuMTQ3LCBrX3IoMjQ2MjIpLCBbMCwgNS40ICoga192LCAwXSwgJ21hcC9zb2xhcl9zeXN0ZW0vbmVwdHVuZS5qcGcnKTtcblxuICAgICAgICAgICAgY29uc3QgbGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgLjgsIDApO1xuICAgICAgICAgICAgbGlnaHQucG9zaXRpb24uc2V0KDAsIDAsIDApO1xuICAgICAgICAgICAgZW5naW5lLnNjZW5lLmFkZChsaWdodCk7XG5cbiAgICAgICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuU09MQVJfU1lTVEVNLnByb3RvdHlwZS50aXRsZSA9ICdTb2xhciBTeXN0ZW0nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtFTVBUWV8yRCwgRU1QVFlfM0QsIE1BTlVBTF8yRCwgTUFOVUFMXzNELCBPUkJJVElORywgQ09MTElTSU9OLCBTT0xBUl9TWVNURU1dOyIsImNsYXNzIENvbnRyb2xCb3gge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgdGl0bGUsIGNvbnRyb2xsZXJzLCB4LCB5KSB7XG4gICAgICAgIGNvbnN0ICR0ZW1wbGF0ZUNvbnRyb2xCb3ggPSAkKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKTtcbiAgICAgICAgY29uc3QgJGNvbnRyb2xCb3ggPSAkdGVtcGxhdGVDb250cm9sQm94LmNsb25lKCk7XG4gICAgICAgICRjb250cm9sQm94LnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICAkY29udHJvbEJveC5maW5kKCcudGl0bGUnKS50ZXh0KHRpdGxlKTtcbiAgICAgICAgY29uc3QgJGlucHV0Q29udGFpbmVyID0gJGNvbnRyb2xCb3guZmluZCgnLmlucHV0LWNvbnRhaW5lcicpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRyb2xsZXIgb2YgY29udHJvbGxlcnMpIHtcbiAgICAgICAgICAgICRpbnB1dENvbnRhaW5lci5hcHBlbmQoY29udHJvbGxlci4kaW5wdXRXcmFwcGVyKTtcbiAgICAgICAgfVxuICAgICAgICAkY29udHJvbEJveC5maW5kKCcuY2xvc2UnKS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAkY29udHJvbEJveC5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy5yZW1vdmUnKS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICBvYmplY3QuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNvbnRyb2xCb3guaW5zZXJ0QmVmb3JlKCR0ZW1wbGF0ZUNvbnRyb2xCb3gpO1xuICAgICAgICAkY29udHJvbEJveC5jc3MoJ2xlZnQnLCB4ICsgJ3B4Jyk7XG4gICAgICAgICRjb250cm9sQm94LmNzcygndG9wJywgeSArICdweCcpO1xuXG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3ggPSAkY29udHJvbEJveDtcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy4kY29udHJvbEJveC5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBpc09wZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRjb250cm9sQm94WzBdLnBhcmVudE5vZGU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xCb3g7IiwiY2xhc3MgQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCBuYW1lLCBtaW4sIG1heCwgdmFsdWUsIGZ1bmMpIHtcbiAgICAgICAgY29uc3QgJGlucHV0V3JhcHBlciA9IHRoaXMuJGlucHV0V3JhcHBlciA9ICQoJy5jb250cm9sLWJveC50ZW1wbGF0ZSAuaW5wdXQtd3JhcHBlci50ZW1wbGF0ZScpLmNsb25lKCk7XG4gICAgICAgICRpbnB1dFdyYXBwZXIucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRpbnB1dFdyYXBwZXIuZmluZCgnLm5hbWUnKS50ZXh0KG5hbWUpO1xuICAgICAgICBjb25zdCAkaW5wdXQgPSB0aGlzLiRpbnB1dCA9ICRpbnB1dFdyYXBwZXIuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3R5cGUnLCBvYmplY3QuY29uZmlnLklOUFVUX1RZUEUpO1xuICAgICAgICAkaW5wdXQuYXR0cignbWluJywgbWluKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21heCcsIG1heCk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd2YWx1ZScsIHZhbHVlKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3N0ZXAnLCAwLjAxKTtcbiAgICAgICAgY29uc3QgJHZhbHVlID0gJGlucHV0V3JhcHBlci5maW5kKCcudmFsdWUnKTtcbiAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICRpbnB1dC5vbignaW5wdXQnLCBlID0+IHtcbiAgICAgICAgICAgICR2YWx1ZS50ZXh0KHRoaXMuZ2V0KCkpO1xuICAgICAgICAgICAgZnVuYy5jYWxsKG9iamVjdCwgZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy4kaW5wdXQudmFsKCkpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sbGVyOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4uL29iamVjdC9jaXJjbGUnKTtcbmNvbnN0IHtub3csIHJhbmRvbSwgcG9sYXIyY2FydGVzaWFuLCByYW5kQ29sb3J9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge21hZywgc3VifSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3QgJGZwcyA9ICQoJyNmcHMnKTtcbmNvbnN0IHttaW4sIFBJLCBhdGFuMn0gPSBNYXRoO1xuXG5jbGFzcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCByZW5kZXJlcikge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5vYmpzID0gW107XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW107XG4gICAgICAgIHRoaXMuZnBzTGFzdFRpbWUgPSBub3coKTtcbiAgICAgICAgdGhpcy5mcHNDb3VudCA9IDA7XG4gICAgICAgIHRoaXMubGFzdE9iak5vID0gMDtcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgICAgIHRoaXMuc2NlbmUuYmFja2dyb3VuZCA9IG5ldyBUSFJFRS5Db2xvcihjb25maWcuQkFDS0dST1VORCk7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCBjb25maWcuVyAvIGNvbmZpZy5ILCAxZS0zLCAxZTUpO1xuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi54ID0gY29uZmlnLkNBTUVSQV9QT1NJVElPTlswXTtcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueSA9IGNvbmZpZy5DQU1FUkFfUE9TSVRJT05bMV07XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSBjb25maWcuQ0FNRVJBX1BPU0lUSU9OWzJdO1xuICAgICAgICB0aGlzLmNhbWVyYS5sb29rQXQodGhpcy5zY2VuZS5wb3NpdGlvbik7XG5cbiAgICAgICAgY29uc3QgaGVtaUxpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHhmZmZmZmYsIDEpO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZChoZW1pTGlnaHQpO1xuXG4gICAgICAgIGNvbnN0IGRpckxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDAuMik7XG4gICAgICAgIGRpckxpZ2h0LnBvc2l0aW9uLnNldCgtMSwgMSwgMSk7XG4gICAgICAgIGRpckxpZ2h0LnBvc2l0aW9uLm11bHRpcGx5U2NhbGFyKDUwKTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQoZGlyTGlnaHQpO1xuXG4gICAgICAgIHRoaXMuY29udHJvbHMgPSBuZXcgVEhSRUUuT3JiaXRDb250cm9scyh0aGlzLmNhbWVyYSwgdGhpcy5yZW5kZXJlci5kb21FbGVtZW50KTtcbiAgICAgICAgdGhpcy5jb250cm9scy5lbmFibGVEYW1waW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250cm9scy5kYW1waW5nRmFjdG9yID0gMC4yO1xuICAgICAgICB0aGlzLmNvbnRyb2xzLmVuYWJsZVJvdGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0ICRncmF2aXR5X2lucHV0ID0gJCgnI2dyYXZpdHlfaW5wdXQnKTtcbiAgICAgICAgY29uc3QgJGdyYXZpdHlfdmFsdWUgPSAkKCcjZ3Jhdml0eV92YWx1ZScpO1xuICAgICAgICAkZ3Jhdml0eV9pbnB1dC5hdHRyKCd0eXBlJywgY29uZmlnLklOUFVUX1RZUEUpO1xuICAgICAgICAkZ3Jhdml0eV9pbnB1dC5hdHRyKCdtaW4nLCBjb25maWcuR19NSU4pO1xuICAgICAgICAkZ3Jhdml0eV9pbnB1dC5hdHRyKCdtYXgnLCBjb25maWcuR19NQVgpO1xuICAgICAgICAkZ3Jhdml0eV9pbnB1dC52YWwoY29uZmlnLkcpO1xuICAgICAgICAkZ3Jhdml0eV9pbnB1dC5hdHRyKCdzdGVwJywgMC4wMDAxKTtcbiAgICAgICAgJGdyYXZpdHlfdmFsdWUudGV4dChjb25maWcuRyk7XG4gICAgICAgICQoJyNncmF2aXR5X2NoYW5nZScpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdyYXZpdHkgPSBwYXJzZUZsb2F0KCRncmF2aXR5X2lucHV0LnZhbCgpKTtcbiAgICAgICAgICAgIGNvbmZpZy5HID0gZ3Jhdml0eTtcbiAgICAgICAgfSk7XG4gICAgICAgICRncmF2aXR5X2lucHV0Lm9uKCdpbnB1dCcsIGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3Jhdml0eSA9IHBhcnNlRmxvYXQoJGdyYXZpdHlfaW5wdXQudmFsKCkpO1xuICAgICAgICAgICAgJGdyYXZpdHlfdmFsdWUudGV4dChncmF2aXR5KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9nZ2xlQW5pbWF0aW5nKCkge1xuICAgICAgICB0aGlzLmFuaW1hdGluZyA9ICF0aGlzLmFuaW1hdGluZztcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBgJHt0aGlzLmNvbmZpZy5USVRMRX0gKCR7dGhpcy5hbmltYXRpbmcgPyBcIlNpbXVsYXRpbmdcIiA6IFwiUGF1c2VkXCJ9KWA7XG4gICAgfVxuXG4gICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlbmRlcmVyKSByZXR1cm47XG4gICAgICAgIHRoaXMucHJpbnRGcHMoKTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUFsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVkcmF3QWxsKCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgdXNlckNyZWF0ZU9iamVjdCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgICAgIHZlY3Rvci5zZXQoKHggLyB0aGlzLmNvbmZpZy5XKSAqIDIgLSAxLCAtKHkgLyB0aGlzLmNvbmZpZy5IKSAqIDIgKyAxLCAwLjUpO1xuICAgICAgICB2ZWN0b3IudW5wcm9qZWN0KHRoaXMuY2FtZXJhKTtcbiAgICAgICAgY29uc3QgZGlyID0gdmVjdG9yLnN1Yih0aGlzLmNhbWVyYS5wb3NpdGlvbikubm9ybWFsaXplKCk7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gLXRoaXMuY2FtZXJhLnBvc2l0aW9uLnogLyBkaXIuejtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmNhbWVyYS5wb3NpdGlvbi5jbG9uZSgpLmFkZChkaXIubXVsdGlwbHlTY2FsYXIoZGlzdGFuY2UpKTtcbiAgICAgICAgY29uc3QgcG9zID0gW3Bvc2l0aW9uLngsIHBvc2l0aW9uLnldO1xuXG4gICAgICAgIGxldCBtYXhSID0gdGhpcy5jb25maWcuUkFESVVTX01BWDtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBtYXhSID0gbWluKG1heFIsIChtYWcoc3ViKG9iai5wb3MsIHBvcykpIC0gb2JqLnIpIC8gMS41KVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG0gPSByYW5kb20odGhpcy5jb25maWcuTUFTU19NSU4sIHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgY29uc3QgciA9IHJhbmRvbSh0aGlzLmNvbmZpZy5SQURJVVNfTUlOLCBtYXhSKTtcbiAgICAgICAgY29uc3QgdiA9IHBvbGFyMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSByYW5kQ29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYGNpcmNsZSR7Kyt0aGlzLmxhc3RPYmpOb31gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd0NvbnRyb2xCb3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlT2JqZWN0KHRhZywgcG9zLCBtLCByLCB2LCB0ZXh0dXJlKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBDaXJjbGUodGhpcy5jb25maWcsIG0sIHIsIHBvcywgdiwgdGV4dHVyZSwgdGFnLCB0aGlzKTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVBbGwoKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZVZlbG9jaXR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG8xID0gdGhpcy5vYmpzW2ldO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgdGhpcy5vYmpzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbzIgPSB0aGlzLm9ianNbal07XG4gICAgICAgICAgICAgICAgbzEuY2FsY3VsYXRlQ29sbGlzaW9uKG8yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVkcmF3QWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5kcmF3KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250cm9scy51cGRhdGUoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIH1cblxuICAgIHByaW50RnBzKCkge1xuICAgICAgICB0aGlzLmZwc0NvdW50ICs9IDE7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gbm93KCk7XG4gICAgICAgIGNvbnN0IHRpbWVEaWZmID0gY3VycmVudFRpbWUgLSB0aGlzLmZwc0xhc3RUaW1lO1xuICAgICAgICBpZiAodGltZURpZmYgPiAxKSB7XG4gICAgICAgICAgICAkZnBzLnRleHQoYCR7KHRoaXMuZnBzQ291bnQgLyB0aW1lRGlmZikgfCAwfSBmcHNgKTtcbiAgICAgICAgICAgIHRoaXMuZnBzTGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgICAgICAgIHRoaXMuZnBzQ291bnQgPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzaXplKCkge1xuICAgICAgICB0aGlzLmNhbWVyYS5hc3BlY3QgPSB0aGlzLmNvbmZpZy5XIC8gdGhpcy5jb25maWcuSDtcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFNpemUodGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCk7XG4gICAgfVxuXG4gICAgb25Nb3VzZU1vdmUoZSkge1xuICAgICAgICBpZiAoIXRoaXMubW91c2VEb3duKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGVsdGEgPSBhdGFuMihlLnBhZ2VZIC0gdGhpcy5jb25maWcuSCAvIDIsIGUucGFnZVggLSB0aGlzLmNvbmZpZy5XIC8gMikgLSBhdGFuMih0aGlzLm1vdXNlWSAtIHRoaXMuY29uZmlnLkggLyAyLCB0aGlzLm1vdXNlWCAtIHRoaXMuY29uZmlnLlcgLyAyKTtcbiAgICAgICAgaWYgKGRlbHRhIDwgLVBJKSBkZWx0YSArPSAyICogUEk7XG4gICAgICAgIGlmIChkZWx0YSA+ICtQSSkgZGVsdGEgLT0gMiAqIFBJO1xuICAgICAgICB0aGlzLm1vdXNlWCA9IGUucGFnZVg7XG4gICAgICAgIHRoaXMubW91c2VZID0gZS5wYWdlWTtcbiAgICAgICAgdGhpcy5jYW1lcmEucm90YXRpb24ueiArPSBkZWx0YTtcbiAgICAgICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIH1cblxuICAgIGRlc3Ryb3lDb250cm9sQm94ZXMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbEJveCBvZiB0aGlzLmNvbnRyb2xCb3hlcykge1xuICAgICAgICAgICAgY29udHJvbEJveC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbEJveGVzID0gW11cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5kZXN0cm95Q29udHJvbEJveGVzKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTJEOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi8yZCcpO1xuY29uc3QgU3BoZXJlID0gcmVxdWlyZSgnLi4vb2JqZWN0L3NwaGVyZScpO1xuY29uc3Qge3JhbmRvbSwgcmFuZENvbG9yLCBzcGhlcmljYWwyY2FydGVzaWFufSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHttYWcsIHN1YiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbn0gPSBNYXRoO1xuXG5cbmNsYXNzIEVuZ2luZTNEIGV4dGVuZHMgRW5naW5lMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgcmVuZGVyZXIpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCByZW5kZXJlcik7XG4gICAgICAgIHRoaXMuY29udHJvbHMuZW5hYmxlUm90YXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB1c2VyQ3JlYXRlT2JqZWN0KHgsIHkpIHtcbiAgICAgICAgY29uc3QgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICAgICAgdmVjdG9yLnNldCgoeCAvIHRoaXMuY29uZmlnLlcpICogMiAtIDEsIC0oeSAvIHRoaXMuY29uZmlnLkgpICogMiArIDEsIDAuNSk7XG4gICAgICAgIHZlY3Rvci51bnByb2plY3QodGhpcy5jYW1lcmEpO1xuICAgICAgICBjb25zdCBkaXIgPSB2ZWN0b3Iuc3ViKHRoaXMuY2FtZXJhLnBvc2l0aW9uKS5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLmNvbmZpZy5SQURJVVNfTUFYICogMyAtIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogLyBkaXIuejtcbiAgICAgICAgY29uc3QgcCA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uLmNsb25lKCkuYWRkKGRpci5tdWx0aXBseVNjYWxhcihkaXN0YW5jZSkpO1xuICAgICAgICBjb25zdCBwb3MgPSBbcC54LCBwLnksIHAuel07XG5cbiAgICAgICAgbGV0IG1heFIgPSB0aGlzLmNvbmZpZy5SQURJVVNfTUFYO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG1heFIgPSBtaW4obWF4UiwgKG1hZyhzdWIob2JqLnBvcywgcG9zKSkgLSBvYmoucikgLyAxLjUpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbSA9IHJhbmRvbSh0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICBjb25zdCByID0gcmFuZG9tKHRoaXMuY29uZmlnLlJBRElVU19NSU4sIG1heFIpO1xuICAgICAgICBjb25zdCB2ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApLCByYW5kb20oLTE4MCwgMTgwKSk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcmFuZENvbG9yKCk7XG4gICAgICAgIGNvbnN0IHRhZyA9IGBzcGhlcmUkeysrdGhpcy5sYXN0T2JqTm99YDtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IFNwaGVyZSh0aGlzLmNvbmZpZywgbSwgciwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgb2JqLnNob3dDb250cm9sQm94KHgsIHkpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGNyZWF0ZU9iamVjdCh0YWcsIHBvcywgbSwgciwgdiwgdGV4dHVyZSkge1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCByLCBwb3MsIHYsIHRleHR1cmUsIHRhZywgdGhpcyk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgb25Nb3VzZU1vdmUoZSkge1xuICAgIH1cblxuICAgIG9uTW91c2VEb3duKGUpIHtcbiAgICB9XG5cbiAgICBvbk1vdXNlVXAoZSkge1xuICAgIH1cblxuICAgIHVwZGF0ZVBvc2l0aW9uKCkge1xuICAgICAgICBzdXBlci51cGRhdGVQb3NpdGlvbigpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUzRDsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vZW5naW5lLzJkJyk7XG5jb25zdCBFbmdpbmUzRCA9IHJlcXVpcmUoJy4vZW5naW5lLzNkJyk7XG5cblxubGV0IGNvbmZpZyA9IG51bGw7XG5jb25zdCAkcmVuZGVyZXJXcmFwcGVyID0gJCgnLnJlbmRlcmVyLXdyYXBwZXInKTtcblxuZnVuY3Rpb24gb25SZXNpemUoZSwgZW5naW5lKSB7XG4gICAgY29uZmlnLlcgPSAkcmVuZGVyZXJXcmFwcGVyLndpZHRoKCk7XG4gICAgY29uZmlnLkggPSAkcmVuZGVyZXJXcmFwcGVyLmhlaWdodCgpO1xuICAgIGlmIChlbmdpbmUpIGVuZ2luZS5yZXNpemUoKTtcbn1cblxuY29uc3QgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xuY29uc3QgbW91c2UgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuZnVuY3Rpb24gb25DbGljayhlLCBlbmdpbmUpIHtcbiAgICBjb25zdCB4ID0gZS5wYWdlWDtcbiAgICBjb25zdCB5ID0gZS5wYWdlWTtcbiAgICBpZiAoIWVuZ2luZS5hbmltYXRpbmcpIHtcbiAgICAgICAgbW91c2UueCA9ICh4IC8gY29uZmlnLlcpICogMiAtIDE7XG4gICAgICAgIG1vdXNlLnkgPSAtKHkgLyBjb25maWcuSCkgKiAyICsgMTtcbiAgICAgICAgcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEobW91c2UsIGVuZ2luZS5jYW1lcmEpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiBlbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgdmFyIGludGVyc2VjdHMgPSByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0KG9iai5vYmplY3QpO1xuICAgICAgICAgICAgaWYgKGludGVyc2VjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG9iai5zaG93Q29udHJvbEJveCh4LCB5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbmdpbmUudXNlckNyZWF0ZU9iamVjdCh4LCB5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uS2V5RG93bihlLCBlbmdpbmUpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBlO1xuICAgIGlmIChrZXlDb2RlID09IDMyKSB7IC8vIHNwYWNlIGJhclxuICAgICAgICBlbmdpbmUuZGVzdHJveUNvbnRyb2xCb3hlcygpO1xuICAgICAgICBlbmdpbmUudG9nZ2xlQW5pbWF0aW5nKCk7XG4gICAgfVxufVxuXG5jbGFzcyBTaW11bGF0b3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgICAgICAgJHJlbmRlcmVyV3JhcHBlci5hcHBlbmQodGhpcy5yZW5kZXJlci5kb21FbGVtZW50KTtcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShlID0+IHtcbiAgICAgICAgICAgIG9uUmVzaXplKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQodGhpcy5yZW5kZXJlci5kb21FbGVtZW50KS5kYmxjbGljayhlID0+IHtcbiAgICAgICAgICAgIG9uQ2xpY2soZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnYm9keScpLmtleWRvd24oZSA9PiB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBvbktleURvd24oZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0KHByZXNldCkge1xuICAgICAgICBpZiAodGhpcy5lbmdpbmUpIHRoaXMuZW5naW5lLmRlc3Ryb3koKTtcbiAgICAgICAgY29uZmlnID0gcHJlc2V0KHt9KTtcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBjb25maWcuVElUTEUgPSBwcmVzZXQucHJvdG90eXBlLnRpdGxlO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyAoY29uZmlnLkRJTUVOU0lPTiA9PSAyID8gRW5naW5lMkQgOiBFbmdpbmUzRCkoY29uZmlnLCB0aGlzLnJlbmRlcmVyKTtcbiAgICAgICAgb25SZXNpemUobnVsbCwgdGhpcy5lbmdpbmUpO1xuICAgICAgICBpZiAoJ2luaXQnIGluIGNvbmZpZykgY29uZmlnLmluaXQodGhpcy5lbmdpbmUpO1xuICAgICAgICB0aGlzLmVuZ2luZS5hbmltYXRlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvcjsiLCJmdW5jdGlvbiBpdGVyKGEsIGZ1bmMpIHtcbiAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICBtW2ldID0gZnVuYyhpKTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHplcm9zOiBOID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheShOKS5maWxsKDApO1xuICAgIH0sXG5cbiAgICBtYWc6IGEgPT4ge1xuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBhW2ldICogYVtpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHN1bSk7XG4gICAgfSxcblxuICAgIGFkZDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSArIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzdWI6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLSBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbXVsOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICogYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRpdjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAvIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkb3Q6IChhLCBiLCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGlmIChkaXIgPT0gLTEpIHtcbiAgICAgICAgICAgIFthLCBiXSA9IFtiLCBhXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYV9jID0gYVswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJfYyA9IGJbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgYV9yOyByKyspIHtcbiAgICAgICAgICAgIG1bcl0gPSBuZXcgQXJyYXkoYl9jKTtcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgYl9jOyBjKyspIHtcbiAgICAgICAgICAgICAgICBtW3JdW2NdID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG1bcl1bY10gKz0gYVtyXVtpXSAqIGJbaV1bY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH0sXG5cbiAgICB0bzM6IGEgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoYVswXSwgYVsxXSwgYVsyXSk7XG4gICAgfVxufTsiLCJjb25zdCBDb250cm9sQm94ID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sX2JveCcpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHBvbGFyMmNhcnRlc2lhbiwgY2FydGVzaWFuMmF1dG8sIHNxdWFyZSwgcm90YXRlLCBnZXRSb3RhdGlvbk1hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCB0bzN9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWF4fSA9IE1hdGg7XG5jb25zdCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcblxuXG5jbGFzcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFBvbGFyIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9sYXJfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgbSwgciwgcG9zLCB2LCB0ZXh0dXJlLCB0YWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldlBvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gdGhpcy5jcmVhdGVUaHJlZU9iamVjdCgpO1xuICAgICAgICB0aGlzLmNvbnRyb2xCb3ggPSBudWxsO1xuICAgICAgICB0aGlzLnBhdGggPSBudWxsO1xuICAgICAgICB0aGlzLnBhdGhWZXJ0aWNlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhdGhNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgICAgICBjb2xvcjogMHg4ODg4ODhcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb25NYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgICAgICBjb2xvcjogMHhmZmZmZmZcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0VGhyZWVHZW9tZXRyeSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5DaXJjbGVHZW9tZXRyeSh0aGlzLnIsIDMyKTtcbiAgICB9XG5cbiAgICBjcmVhdGVUaHJlZU9iamVjdCgpIHtcbiAgICAgICAgaWYgKHRoaXMub2JqZWN0KSB0aGlzLmVuZ2luZS5zY2VuZS5yZW1vdmUodGhpcy5vYmplY3QpO1xuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IHRoaXMuZ2V0VGhyZWVHZW9tZXRyeSgpO1xuICAgICAgICBjb25zdCBtYXRlcmlhbE9wdGlvbiA9IHt9O1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMudGV4dHVyZSA9PT0gJ3N0cmluZycgJiYgdGhpcy50ZXh0dXJlLmluZGV4T2YoJ21hcC8nKSA9PSAwKSBtYXRlcmlhbE9wdGlvbi5tYXAgPSB0ZXh0dXJlTG9hZGVyLmxvYWQodGhpcy50ZXh0dXJlKTtcbiAgICAgICAgZWxzZSBtYXRlcmlhbE9wdGlvbi5jb2xvciA9IHRoaXMudGV4dHVyZTtcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwobWF0ZXJpYWxPcHRpb24pO1xuICAgICAgICBjb25zdCBvYmplY3QgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgICAgICBvYmplY3QubWF0cml4QXV0b1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVuZ2luZS5zY2VuZS5hZGQob2JqZWN0KTtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVWZWxvY2l0eSgpIHtcbiAgICAgICAgbGV0IEYgPSB6ZXJvcyh0aGlzLmNvbmZpZy5ESU1FTlNJT04pO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICBpZiAob2JqID09IHRoaXMpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgdmVjdG9yID0gc3ViKHRoaXMucG9zLCBvYmoucG9zKTtcbiAgICAgICAgICAgIGNvbnN0IG1hZ25pdHVkZSA9IG1hZyh2ZWN0b3IpO1xuICAgICAgICAgICAgY29uc3QgdW5pdFZlY3RvciA9IGRpdih2ZWN0b3IsIG1hZ25pdHVkZSk7XG4gICAgICAgICAgICBGID0gYWRkKEYsIG11bCh1bml0VmVjdG9yLCBvYmoubSAvIHNxdWFyZShtYWduaXR1ZGUpKSlcbiAgICAgICAgfVxuICAgICAgICBGID0gbXVsKEYsIC10aGlzLmNvbmZpZy5HICogdGhpcy5tKTtcbiAgICAgICAgY29uc3QgYSA9IGRpdihGLCB0aGlzLm0pO1xuICAgICAgICB0aGlzLnYgPSBhZGQodGhpcy52LCBhKTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVQb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5wb3MgPSBhZGQodGhpcy5wb3MsIHRoaXMudik7XG4gICAgICAgIGlmIChtYWcoc3ViKHRoaXMucG9zLCB0aGlzLnByZXZQb3MpKSA+IDEpIHtcbiAgICAgICAgICAgIHRoaXMucHJldlBvcyA9IHRoaXMucG9zLnNsaWNlKCk7XG4gICAgICAgICAgICB0aGlzLnBhdGhWZXJ0aWNlcy5wdXNoKHRvMyh0aGlzLnBvcykpO1xuICAgICAgICAgICAgaWYgKHRoaXMucGF0aFZlcnRpY2VzLmxlbmd0aCA+IHRoaXMuY29uZmlnLk1BWF9QQVRIUykgdGhpcy5wYXRoVmVydGljZXMuc2hpZnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzWzBdLCBkaXIpO1xuICAgIH1cblxuICAgIGdldFBpdm90QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlQ29sbGlzaW9uKG8pe1xuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmNvbmZpZy5ESU1FTlNJT047XG4gICAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHN1YihvLnBvcywgdGhpcy5wb3MpO1xuICAgICAgICBjb25zdCBhbmdsZXMgPSBjYXJ0ZXNpYW4yYXV0byhjb2xsaXNpb24pO1xuICAgICAgICBjb25zdCBkID0gYW5nbGVzLnNoaWZ0KCk7XG5cbiAgICAgICAgaWYgKGQgPCB0aGlzLnIgKyBvLnIpIHtcbiAgICAgICAgICAgIGNvbnN0IFIgPSB0aGlzLmdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcyk7XG4gICAgICAgICAgICBjb25zdCBSXyA9IHRoaXMuZ2V0Um90YXRpb25NYXRyaXgoYW5nbGVzLCAtMSk7XG4gICAgICAgICAgICBjb25zdCBpID0gdGhpcy5nZXRQaXZvdEF4aXMoKTtcblxuICAgICAgICAgICAgY29uc3QgdlRlbXAgPSBbcm90YXRlKHRoaXMudiwgUiksIHJvdGF0ZShvLnYsIFIpXTtcbiAgICAgICAgICAgIGNvbnN0IHZGaW5hbCA9IFt2VGVtcFswXS5zbGljZSgpLCB2VGVtcFsxXS5zbGljZSgpXTtcbiAgICAgICAgICAgIHZGaW5hbFswXVtpXSA9ICgodGhpcy5tIC0gby5tKSAqIHZUZW1wWzBdW2ldICsgMiAqIG8ubSAqIHZUZW1wWzFdW2ldKSAvICh0aGlzLm0gKyBvLm0pO1xuICAgICAgICAgICAgdkZpbmFsWzFdW2ldID0gKChvLm0gLSB0aGlzLm0pICogdlRlbXBbMV1baV0gKyAyICogdGhpcy5tICogdlRlbXBbMF1baV0pIC8gKHRoaXMubSArIG8ubSk7XG4gICAgICAgICAgICB0aGlzLnYgPSByb3RhdGUodkZpbmFsWzBdLCBSXyk7XG4gICAgICAgICAgICBvLnYgPSByb3RhdGUodkZpbmFsWzFdLCBSXyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBvc1RlbXAgPSBbemVyb3MoZGltZW5zaW9uKSwgcm90YXRlKGNvbGxpc2lvbiwgUildO1xuICAgICAgICAgICAgcG9zVGVtcFswXVtpXSArPSB2RmluYWxbMF1baV07XG4gICAgICAgICAgICBwb3NUZW1wWzFdW2ldICs9IHZGaW5hbFsxXVtpXTtcbiAgICAgICAgICAgIHRoaXMucG9zID0gYWRkKHRoaXMucG9zLCByb3RhdGUocG9zVGVtcFswXSwgUl8pKTtcbiAgICAgICAgICAgIG8ucG9zID0gYWRkKHRoaXMucG9zLCByb3RhdGUocG9zVGVtcFsxXSwgUl8pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLnggPSB0aGlzLnBvc1swXTtcbiAgICAgICAgdGhpcy5vYmplY3QucG9zaXRpb24ueSA9IHRoaXMucG9zWzFdO1xuICAgICAgICB0aGlzLm9iamVjdC51cGRhdGVNYXRyaXgoKTtcblxuICAgICAgICBpZiAodGhpcy5wYXRoKSB0aGlzLmVuZ2luZS5zY2VuZS5yZW1vdmUodGhpcy5wYXRoKTtcbiAgICAgICAgY29uc3QgcGF0aEdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG4gICAgICAgIHBhdGhHZW9tZXRyeS52ZXJ0aWNlcyA9IHRoaXMucGF0aFZlcnRpY2VzO1xuICAgICAgICB0aGlzLnBhdGggPSBuZXcgVEhSRUUuTGluZShwYXRoR2VvbWV0cnksIHRoaXMucGF0aE1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5lbmdpbmUuc2NlbmUuYWRkKHRoaXMucGF0aCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uKSB0aGlzLmVuZ2luZS5zY2VuZS5yZW1vdmUodGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICBjb25zdCBkaXJlY3Rpb25HZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICAgICAgICBpZiAobWFnKHRoaXMudikgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc1BvcyA9IGFkZCh0aGlzLnBvcywgbXVsKHRoaXMudiwgdGhpcy5yIC8gbWFnKHRoaXMudikpKTtcbiAgICAgICAgICAgIGNvbnN0IGVQb3MgPSBhZGQoc1BvcywgbXVsKHRoaXMudiwgdGhpcy5jb25maWcuRElSRUNUSU9OX0xFTkdUSCkpO1xuICAgICAgICAgICAgZGlyZWN0aW9uR2VvbWV0cnkudmVydGljZXMgPSBbdG8zKHNQb3MpLCB0bzMoZVBvcyldO1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBuZXcgVEhSRUUuTGluZShkaXJlY3Rpb25HZW9tZXRyeSwgdGhpcy5kaXJlY3Rpb25NYXRlcmlhbCk7XG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5zY2VuZS5hZGQodGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29udHJvbE0oZSkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZVRocmVlT2JqZWN0KCk7XG4gICAgfVxuXG4gICAgY29udHJvbFIoZSkge1xuICAgICAgICBjb25zdCByID0gdGhpcy5yQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmNyZWF0ZVRocmVlT2JqZWN0KCk7XG4gICAgfVxuXG4gICAgY29udHJvbFBvcyhlKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc1hDb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NZQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBbeCwgeV07XG4gICAgfVxuXG4gICAgY29udHJvbFYoZSkge1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZSaG9Db250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudlBoaUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICB0aGlzLnYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmhvLCBwaGkpO1xuICAgIH1cblxuICAgIHNob3dDb250cm9sQm94KHgsIHkpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udHJvbEJveCAmJiB0aGlzLmNvbnRyb2xCb3guaXNPcGVuKCkpIHtcbiAgICAgICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gdGhpcy5jb250cm9sQm94LiRjb250cm9sQm94O1xuICAgICAgICAgICAgJGNvbnRyb2xCb3guY3NzKCdsZWZ0JywgeCArICdweCcpO1xuICAgICAgICAgICAgJGNvbnRyb2xCb3guY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG4gICAgICAgICAgICAkY29udHJvbEJveC5uZXh0VW50aWwoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpLmluc2VydEJlZm9yZSgkY29udHJvbEJveCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBtYXJnaW4gPSAxLjU7XG5cbiAgICAgICAgICAgIHZhciBwb3NSYW5nZSA9IG1heChtYXgodGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCkgLyAyLCBtYXguYXBwbHkobnVsbCwgdGhpcy5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgICAgIHBvc1JhbmdlID0gbWF4KHBvc1JhbmdlLCBtYXguYXBwbHkobnVsbCwgb2JqLnBvcy5tYXAoTWF0aC5hYnMpKSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgY29uc3QgdiA9IGNhcnRlc2lhbjJhdXRvKHRoaXMudik7XG4gICAgICAgICAgICB2YXIgdlJhbmdlID0gbWF4KHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCwgbWFnKHRoaXMudikgKiBtYXJnaW4pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgICAgIHZSYW5nZSA9IG1heCh2UmFuZ2UsIG1hZyhvYmoudikgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldHVwX2NvbnRyb2xsZXJzKHBvc1JhbmdlLCB0aGlzLm0sIHRoaXMuciwgdiwgdlJhbmdlKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbEJveCA9IG5ldyBDb250cm9sQm94KHRoaXMsIHRoaXMudGFnLCB0aGlzLmdldENvbnRyb2xsZXJzKCksIHgsIHkpO1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUuY29udHJvbEJveGVzLnB1c2godGhpcy5jb250cm9sQm94KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc1JhbmdlLCBtLCByLCB2LCB2UmFuZ2UpIHtcbiAgICAgICAgdGhpcy5tQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiTWFzcyBtXCIsIHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCwgbSwgdGhpcy5jb250cm9sTSk7XG4gICAgICAgIHRoaXMuckNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlJhZGl1cyByXCIsIHRoaXMuY29uZmlnLlJBRElVU19NSU4sIHRoaXMuY29uZmlnLlJBRElVU19NQVgsIHIsIHRoaXMuY29udHJvbFIpO1xuICAgICAgICB0aGlzLnBvc1hDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB4XCIsIC1wb3NSYW5nZSwgcG9zUmFuZ2UsIHRoaXMucG9zWzBdLCB0aGlzLmNvbnRyb2xQb3MpO1xuICAgICAgICB0aGlzLnBvc1lDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB5XCIsIC1wb3NSYW5nZSwgcG9zUmFuZ2UsIHRoaXMucG9zWzFdLCB0aGlzLmNvbnRyb2xQb3MpO1xuICAgICAgICB0aGlzLnZSaG9Db250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDPgVwiLCAwLCB2UmFuZ2UsIHZbMF0sIHRoaXMuY29udHJvbFYpO1xuICAgICAgICB0aGlzLnZQaGlDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDPhlwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsxXSksIHRoaXMuY29udHJvbFYpO1xuICAgIH1cblxuICAgIGdldENvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMuckNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1hDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NZQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlJob0NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZQaGlDb250cm9sbGVyXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgaWYgKHRoaXMub2JqZWN0KSB0aGlzLmVuZ2luZS5zY2VuZS5yZW1vdmUodGhpcy5vYmplY3QpO1xuICAgICAgICBpZiAodGhpcy5wYXRoKSB0aGlzLmVuZ2luZS5zY2VuZS5yZW1vdmUodGhpcy5wYXRoKTtcbiAgICAgICAgY29uc3QgaSA9IHRoaXMuZW5naW5lLm9ianMuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgdGhpcy5lbmdpbmUub2Jqcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGlmICh0aGlzLmNvbnRyb2xCb3ggJiYgdGhpcy5jb250cm9sQm94LmlzT3BlbigpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xCb3guY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyd0YWcnOiB0aGlzLnRhZywgJ3YnOiB0aGlzLnYsICdwb3MnOiB0aGlzLnBvc30pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGU7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi9jaXJjbGUnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHtyYWQyZGVnLCBkZWcycmFkLCBzcGhlcmljYWwyY2FydGVzaWFuLCBnZXRZUm90YXRpb25NYXRyaXgsIGdldFpSb3RhdGlvbk1hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7ZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuXG5cbmNsYXNzIFNwaGVyZSBleHRlbmRzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogU3BoZXJpY2FsIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3BoZXJpY2FsX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBnZXRUaHJlZUdlb21ldHJ5KCl7XG4gICAgICAgIHJldHVybiBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkodGhpcy5yLCAzMiwgMzIpO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uTWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZG90KGdldFpSb3RhdGlvbk1hdHJpeChhbmdsZXNbMF0sIGRpciksIGdldFlSb3RhdGlvbk1hdHJpeChhbmdsZXNbMV0sIGRpciksIGRpcik7XG4gICAgfVxuXG4gICAgZ2V0UGl2b3RBeGlzKCkge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLm9iamVjdC5wb3NpdGlvbi56ID0gdGhpcy5wb3NbMl07XG4gICAgICAgIHN1cGVyLmRyYXcoKTtcbiAgICB9XG5cbiAgICBjb250cm9sUG9zKGUpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zWENvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc1lDb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB6ID0gdGhpcy5wb3NaQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBbeCwgeSwgel07XG4gICAgfVxuXG4gICAgY29udHJvbFYoZSkge1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudlBoaUNvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICBjb25zdCB0aGV0YSA9IGRlZzJyYWQodGhpcy52VGhldGFDb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52UmhvQ29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy52ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyaG8sIHBoaSwgdGhldGEpO1xuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgciwgdiwgdl9yYW5nZSkge1xuICAgICAgICBzdXBlci5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHIsIHYsIHZfcmFuZ2UpO1xuICAgICAgICB0aGlzLnBvc1pDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB6XCIsIC1wb3NfcmFuZ2UsIHBvc19yYW5nZSwgdGhpcy5wb3NbMl0sIHRoaXMuY29udHJvbFBvcyk7XG4gICAgICAgIHRoaXMudlRoZXRhQ29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgzrhcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMl0pLCB0aGlzLmNvbnRyb2xWKTtcbiAgICB9XG5cbiAgICBnZXRDb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnJDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NYQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zWUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc1pDb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52UmhvQ29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudlBoaUNvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZUaGV0YUNvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3BoZXJlOyIsImNvbnN0IHttYWcsIGRvdH0gPSByZXF1aXJlKCcuL21hdHJpeCcpO1xuXG5jb25zdCBVdGlsID0ge1xuICAgIHNxdWFyZTogKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIHggKiB4O1xuICAgIH0sXG5cbiAgICBjdWJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHggKiB4O1xuICAgIH0sXG5cbiAgICBwb2xhcjJjYXJ0ZXNpYW46IChyaG8sIHBoaSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHBoaSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnBvbGFyOiAoeCwgeSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbWFnKFt4LCB5XSksXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIHNwaGVyaWNhbDJjYXJ0ZXNpYW46IChyaG8sIHBoaSwgdGhldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLnNpbihwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5jb3ModGhldGEpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJzcGhlcmljYWw6ICh4LCB5LCB6KSA9PiB7XG4gICAgICAgIGNvbnN0IHJobyA9IG1hZyhbeCwgeSwgel0pO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvLFxuICAgICAgICAgICAgTWF0aC5hdGFuMih5LCB4KSxcbiAgICAgICAgICAgIHJobyAhPSAwID8gTWF0aC5hY29zKHogLyByaG8pIDogMFxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4yYXV0bzogKHZlY3RvcikgPT4ge1xuICAgICAgICByZXR1cm4gdmVjdG9yLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICA/IFV0aWwuY2FydGVzaWFuMnBvbGFyKHZlY3RvclswXSwgdmVjdG9yWzFdKVxuICAgICAgICAgICAgOiBVdGlsLmNhcnRlc2lhbjJzcGhlcmljYWwodmVjdG9yWzBdLCB2ZWN0b3JbMV0sIHZlY3RvclsyXSk7XG4gICAgfSxcblxuICAgIHJhZDJkZWc6IChyYWQpID0+IHtcbiAgICAgICAgcmV0dXJuIHJhZCAvIE1hdGguUEkgKiAxODA7XG4gICAgfSxcblxuICAgIGRlZzJyYWQ6IChkZWcpID0+IHtcbiAgICAgICAgcmV0dXJuIGRlZyAvIDE4MCAqIE1hdGguUEk7XG4gICAgfSxcblxuICAgIGdldERpc3RhbmNlOiAoeDAsIHkwLCB4MSwgeTEpID0+IHtcbiAgICAgICAgcmV0dXJuIG1hZyhbeDEgLSB4MCwgeTEgLSB5MF0pO1xuICAgIH0sXG5cbiAgICByb3RhdGU6ICh2ZWN0b3IsIG1hdHJpeCkgPT4ge1xuICAgICAgICByZXR1cm4gZG90KFt2ZWN0b3JdLCBtYXRyaXgpWzBdO1xuICAgIH0sXG5cbiAgICBub3c6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICB9LFxuXG4gICAgcmFuZG9tOiAobWluLCBtYXggPSBudWxsKSA9PiB7XG4gICAgICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4ID0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuICAgIH0sXG5cbiAgICByYW5kQ29sb3I6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZjtcbiAgICB9LFxuXG4gICAgZ2V0Um90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIC1zaW5dLFxuICAgICAgICAgICAgW3NpbiwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRYUm90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFsxLCAwLCAwXSxcbiAgICAgICAgICAgIFswLCBjb3MsIC1zaW5dLFxuICAgICAgICAgICAgWzAsIHNpbiwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRZUm90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIDAsIHNpbl0sXG4gICAgICAgICAgICBbMCwgMSwgMF0sXG4gICAgICAgICAgICBbLXNpbiwgMCwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRaUm90YXRpb25NYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIC1zaW4sIDBdLFxuICAgICAgICAgICAgW3NpbiwgY29zLCAwXSxcbiAgICAgICAgICAgIFswLCAwLCAxXVxuICAgICAgICBdO1xuICAgIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWw7Il19

//# sourceMappingURL=gravity_simulator.js.map
