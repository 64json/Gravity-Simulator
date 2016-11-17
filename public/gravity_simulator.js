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

},{"./preset":2,"./simulator":10}],2:[function(require,module,exports){
'use strict';

var _$ = $,
    extend = _$.extend;


function EMPTY_2D(c) {
    return extend(true, c, {
        'TITLE': 'Gravity Simulator',
        'BACKGROUND': "white",
        'DIMENSION': 2,
        'MAX_PATHS': 1000,
        'CAMERA_COORD_STEP': 5,
        'CAMERA_ANGLE_STEP': 1,
        'CAMERA_ACCELERATION': 1.1,
        'G': 0.1,
        'MASS_MIN': 1,
        'MASS_MAX': 4e4,
        'VELOCITY_MAX': 10
    });
}

function EMPTY_3D(c) {
    return extend(true, EMPTY_2D(c), {
        'DIMENSION': 3,
        'G': 0.001,
        'MASS_MIN': 1,
        'MASS_MAX': 8e6,
        'VELOCITY_MAX': 10
    });
}

module.exports = EMPTY_2D;

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InvisibleError = require('../error/invisible');

var _require = require('../util'),
    deg2rad = _require.deg2rad,
    rotate = _require.rotate,
    now = _require.now,
    get_rotation_matrix = _require.get_rotation_matrix;

var pow = Math.pow;

var Camera2D = function () {
    function Camera2D(config, engine) {
        _classCallCheck(this, Camera2D);

        this.config = config;
        this.x = 0;
        this.y = 0;
        this.z = 100;
        this.phi = 0;
        this.engine = engine;
        this.last_time = 0;
        this.last_key = null;
        this.combo = 0;
        this.center = nj.array([config.W / 2, config.H / 2]);
    }

    _createClass(Camera2D, [{
        key: 'get_coord_step',
        value: function get_coord_step(key) {
            var current_time = now();
            if (key == this.last_key && current_time - this.last_time < 1) {
                this.combo += 1;
            } else {
                this.combo = 0;
            }
            this.last_time = current_time;
            this.last_key = key;
            return this.config.CAMERA_COORD_STEP * pow(this.config.CAMERA_ACCELERATION, this.combo);
        }
    }, {
        key: 'up',
        value: function up(key) {
            this.y -= this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'down',
        value: function down(key) {
            this.y += this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'left',
        value: function left(key) {
            this.x -= this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'right',
        value: function right(key) {
            this.x += this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'zoom_in',
        value: function zoom_in(key) {
            this.z -= this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'zoom_out',
        value: function zoom_out(key) {
            this.z += this.get_coord_step(key);
            this.refresh();
        }
    }, {
        key: 'rotate_left',
        value: function rotate_left(key) {
            this.phi -= this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'rotate_right',
        value: function rotate_right(key) {
            this.phi += this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'refresh',
        value: function refresh() {}
    }, {
        key: 'get_zoom',
        value: function get_zoom() {
            var z = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var allow_invisible = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var distance = this.z - z;
            if (distance <= 0) {
                if (!allow_invisible) throw InvisibleError;
                distance = Infinity;
            }
            return 100 / distance;
        }
    }, {
        key: 'adjust_coord',
        value: function adjust_coord(coord) {
            var allow_invisible = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var R = get_rotation_matrix(deg2rad(this.phi));
            var zoom = this.get_zoom();
            return this.center + (rotate(coord, R) - [this.x, this.y]) * zoom;
        }
    }, {
        key: 'adjust_radius',
        value: function adjust_radius(coord, radius) {
            var zoom = this.get_zoom();
            return radius * zoom;
        }
    }, {
        key: 'actual_point',
        value: function actual_point(x, y) {
            var R_ = get_rotation_matrix(deg2rad(this.phi), -1);
            var zoom = this.get_zoom();
            return rotate(nj.array([x, y]).subtract(this.center).divide(zoom).add([this.x, this.y]), R_);
        }
    }]);

    return Camera2D;
}();

module.exports = Camera2D;

},{"../error/invisible":9,"../util":13}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Camera2D = require('./2d');

var _require = require('../util'),
    deg2rad = _require.deg2rad,
    rotate = _require.rotate,
    get_rotation_x_matrix = _require.get_rotation_x_matrix,
    get_rotation_y_matrix = _require.get_rotation_y_matrix;

var Camera3D = function (_Camera2D) {
    _inherits(Camera3D, _Camera2D);

    function Camera3D(config, engine) {
        _classCallCheck(this, Camera3D);

        var _this = _possibleConstructorReturn(this, (Camera3D.__proto__ || Object.getPrototypeOf(Camera3D)).call(this, config, engine));

        _this.theta = 0;
        return _this;
    }

    _createClass(Camera3D, [{
        key: 'rotate_up',
        value: function rotate_up(key) {
            this.theta -= this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'rotate_down',
        value: function rotate_down(key) {
            this.theta += this.config.CAMERA_ANGLE_STEP;
            this.refresh();
        }
    }, {
        key: 'adjust_coord',
        value: function adjust_coord(coord) {
            var allow_invisible = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : False;

            var Rx = get_rotation_x_matrix(deg2rad(this.theta));
            var Ry = get_rotation_y_matrix(deg2rad(this.phi));
            var c = rotate(rotate(coord, Rx), Ry);
            var zoom = this.get_zoom(c.pop(), allow_invisible);
            return this.center + (c - [this.x, this.y]) * zoom;
        }
    }, {
        key: 'adjust_radius',
        value: function adjust_radius(coord, radius) {
            var Rx = get_rotation_x_matrix(deg2rad(this.theta));
            var Ry = get_rotation_y_matrix(deg2rad(this.phi));
            var c = rotate(rotate(coord, Rx), Ry);
            var zoom = this.get_zoom(c.pop());
            return radius * zoom;
        }
    }, {
        key: 'actual_point',
        value: function actual_point(x, y) {
            var Rx_ = get_rotation_x_matrix(deg2rad(this.theta), -1);
            var Ry_ = get_rotation_y_matrix(deg2rad(this.phi), -1);
            var c = ([x, y] - this.center + [this.x, this.y]).concat(0);
            return rotate(rotate(c, Ry_), Rx_);
        }
    }]);

    return Camera3D;
}(Camera2D);

module.exports = Camera3D;

},{"../util":13,"./2d":3}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBox = function () {
    function ControlBox(title, controllers) {
        _classCallCheck(this, ControlBox);

        var $controlBox = $('.control-box.template').clone();
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

        this.$controlBox = $controlBox;
    }

    _createClass(ControlBox, [{
        key: 'destroy',
        value: function destroy() {
            this.$controlBox.remove();
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
    function Controller(name, min, max, value, func) {
        _classCallCheck(this, Controller);

        var $inputWrapper = $('.input-wrapper.template').clone();
        $inputWrapper.removeClass('template');
        $inputWrapper.find('span').text(name);
        var $input = $inputWrapper.find('input');
        $input.attr('min', min);
        $input.attr('max', max);
        $input.attr('value', value);
        $input.change(func);

        this.$inputWrapper = $inputWrapper;
        this.$input = $input;
    }

    _createClass(Controller, [{
        key: 'get',
        value: function get() {
            return this.$input.val();
        }
    }]);

    return Controller;
}();

module.exports = Controller;

},{}],7:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Circle = require('../object/circle');
var Camera2D = require('../camera/2d');
var InvisibleError = require('../error/invisible');

var _require = require('../util'),
    vector_magnitude = _require.vector_magnitude,
    rotate = _require.rotate,
    now = _require.now,
    random = _require.random,
    polar2cartesian = _require.polar2cartesian,
    rand_color = _require.rand_color,
    _get_rotation_matrix = _require.get_rotation_matrix,
    cartesian2auto = _require.cartesian2auto;

var min = Math.min;

var Path = function Path(obj) {
    _classCallCheck(this, Path);

    this.prev_pos = obj.prev_pos.slice();
    this.pos = obj.pos.slice();
};

var Engine2D = function () {
    function Engine2D(config, ctx) {
        _classCallCheck(this, Engine2D);

        this.config = config;
        this.ctx = ctx;
        this.objs = [];
        this.animating = false;
        this.controlboxes = [];
        this.paths = [];
        this.camera = new Camera2D(config, this);
        this.fps_last_time = now();
        this.fps_count = 0;
    }

    _createClass(Engine2D, [{
        key: 'destroy_controlboxes',
        value: function destroy_controlboxes() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.controlboxes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var controlbox = _step.value;

                    controlbox.destroy();
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

            this.controlboxes = [];
        }
    }, {
        key: 'animate',
        value: function animate() {
            var _this = this;

            this.print_fps();
            if (this.animating) {
                this.calculate_all();
            }
            this.redraw_all();
            setTimeout(function () {
                _this.animate();
            }, 10);
        }
    }, {
        key: 'object_coords',
        value: function object_coords(obj) {
            var r = this.camera.adjust_radius(obj.pos, obj.get_r());

            var _camera$adjust_coord = this.camera.adjust_coord(obj.pos),
                _camera$adjust_coord2 = _slicedToArray(_camera$adjust_coord, 2),
                x = _camera$adjust_coord2[0],
                y = _camera$adjust_coord2[1];

            return [x, y, r];
        }
    }, {
        key: 'direction_coords',
        value: function direction_coords(obj) {
            var _camera$adjust_coord3 = this.camera.adjust_coord(obj.pos),
                _camera$adjust_coord4 = _slicedToArray(_camera$adjust_coord3, 2),
                cx = _camera$adjust_coord4[0],
                cy = _camera$adjust_coord4[1];

            var _camera$adjust_coord5 = this.camera.adjust_coord(obj.pos + obj.v * 50, true),
                _camera$adjust_coord6 = _slicedToArray(_camera$adjust_coord5, 2),
                dx = _camera$adjust_coord6[0],
                dy = _camera$adjust_coord6[1];

            return [cx, cy, dx, dy];
        }
    }, {
        key: 'path_coords',
        value: function path_coords(obj) {
            var _camera$adjust_coord7 = this.camera.adjust_coord(obj.prev_pos),
                _camera$adjust_coord8 = _slicedToArray(_camera$adjust_coord7, 2),
                fx = _camera$adjust_coord8[0],
                fy = _camera$adjust_coord8[1];

            var _camera$adjust_coord9 = this.camera.adjust_coord(obj.pos),
                _camera$adjust_coord10 = _slicedToArray(_camera$adjust_coord9, 2),
                tx = _camera$adjust_coord10[0],
                ty = _camera$adjust_coord10[1];

            return [fx, fy, tx, ty];
        }
    }, {
        key: 'draw_object',
        value: function draw_object(obj) {
            try {
                var c = this.object_coords(obj);
                this.ctx.beginPath();
                this.ctx.arc(c[0], c[1], c[2], 0, 2 * Math.PI, false);
                this.ctx.fillStyle = obj.color;
                this.ctx.fill();
            } catch (e) {
                if (!(e instanceof InvisibleError)) {
                    throw e;
                }
            }
        }
    }, {
        key: 'draw_direction',
        value: function draw_direction(obj) {
            try {
                var c = this.object_coords(obj);
                this.ctx.beginPath();
                this.ctx.moveTo(c[0], c[1]);
                this.ctx.lineTo(c[2], c[3]);
                this.ctx.strokeStyle = '#000000';
                this.ctx.stroke();
            } catch (e) {
                if (!(e instanceof InvisibleError)) {
                    throw e;
                }
            }
        }
    }, {
        key: 'draw_paths',
        value: function draw_paths() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.paths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var path = _step2.value;

                    try {
                        var c = this.path_coords(path);
                        this.ctx.beginPath();
                        this.ctx.moveTo(c[0], c[1]);
                        this.ctx.lineTo(c[2], c[3]);
                        this.ctx.strokeStyle = '#dddddd';
                        this.ctx.stroke();
                    } catch (e) {
                        if (!(e instanceof InvisibleError)) {
                            throw e;
                        }
                    }
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
        }
    }, {
        key: 'create_path',
        value: function create_path(obj) {
            if (vector_magnitude(obj.pos.subtract(obj.prev_pos)) > 5) {
                this.paths.push(new Path(obj));
                obj.prev_pos = obj.pos.slice();
                if (this.paths.length > this.config.MAX_PATHS) {
                    this.paths = this.paths.slice(1);
                }
            }
        }
    }, {
        key: 'create_object',
        value: function create_object(x, y) {
            var m = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            var v = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            var color = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
            var controlbox = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;

            var pos = this.camera.actual_point(x, y);
            if (!m) {
                var max_r = Circle.get_r_from_m(this.config.MASS_MAX);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _obj = _step3.value;

                        max_r = min(max_r, (vector_magnitude(_obj.pos.subtract(pos)) - _obj.get_r()) / 1.5);
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

                m = Circle.get_m_from_r(random(Circle.get_r_from_m(this.config.MASS_MIN), max_r));
            }
            if (!v) {
                v = nj.array(polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180)));
            }
            if (!color) {
                color = rand_color();
            }
            var tag = 'circle' + this.objs.length;
            var dir_tag = tag + "_dir";
            var obj = new Circle(this.config, m, pos, v, color, tag, dir_tag, this, controlbox);
            this.objs.push(obj);
        }
    }, {
        key: 'get_rotation_matrix',
        value: function get_rotation_matrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return _get_rotation_matrix(angles[0], dir);
        }
    }, {
        key: 'elastic_collision',
        value: function elastic_collision() {
            var dimension = this.config.DIMENSION;
            for (var i = 0; i < this.objs.length; i++) {
                var o1 = this.objs[i];
                for (var j = i + 1; j < this.objs.length; j++) {
                    var o2 = this.objs[j];
                    var collision = o2.pos.subtract(o1.pos);
                    var angles = cartesian2auto(collision);
                    var d = angles.shift();

                    if (d < o1.get_r() + o2.get_r()) {
                        var R = this.get_rotation_matrix(angles);
                        var R_ = this.get_rotation_matrix(angles, -1);

                        var v_temp = [rotate(o1.v, R), rotate(o2.v, R)];
                        var v_final = [v_temp[0].clone(), v_temp[1].clone()];
                        v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m);
                        v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m);
                        o1.v = rotate(v_final[0], R_);
                        o2.v = rotate(v_final[1], R_);

                        var pos_temp = [[0] * dimension, rotate(collision, R)];
                        pos_temp[0][0] += v_final[0][0];
                        pos_temp[1][0] += v_final[1][0];
                        o1.pos = o1.pos.add(rotate(pos_temp[0], R_));
                        o2.pos = o1.pos.add(rotate(pos_temp[1], R_));
                    }
                }
            }
        }
    }, {
        key: 'calculate_all',
        value: function calculate_all() {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.objs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var obj = _step4.value;

                    obj.calculate_velocity();
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

            this.elastic_collision();

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.objs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _obj2 = _step5.value;

                    _obj2.calculate_position();
                    this.create_path(_obj2);
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
    }, {
        key: 'redraw_all',
        value: function redraw_all() {
            this.ctx.clearRect(0, 0, this.config.W, this.config.H);
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.objs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var obj = _step6.value;

                    this.draw_object(obj);
                    this.draw_direction(obj);
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

            this.draw_paths();
        }
    }, {
        key: 'print_fps',
        value: function print_fps() {
            this.fps_count += 1;
            var current_time = now();
            var fps_time_diff = current_time - this.fps_last_time;
            if (fps_time_diff > 1) {
                console.log((this.fps_count / fps_time_diff | 0) + ' fps');
                this.fps_last_time = current_time;
                this.fps_count = 0;
            }
        }
    }]);

    return Engine2D;
}();

module.exports = Engine2D;

},{"../camera/2d":3,"../error/invisible":9,"../object/circle":11,"../util":13}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Engine2D = require('./2d');
var Camera3D = require('../camera/3d');
var Sphere = require('../object/sphere');

var _require = require('../util'),
    vector_magnitude = _require.vector_magnitude,
    random = _require.random,
    get_rotation_x_matrix = _require.get_rotation_x_matrix,
    get_rotation_z_matrix = _require.get_rotation_z_matrix,
    rand_color = _require.rand_color,
    spherical2cartesian = _require.spherical2cartesian;

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
        key: 'create_object',
        value: function create_object(x, y) {
            var m = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : None;
            var v = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : None;
            var color = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : None;
            var controlbox = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : True;

            var pos = nj.array(this.camera.actual_point(x, y));
            if (!m) {
                var max_r = Sphere.get_r_from_m(this.config.MASS_MAX);
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _obj = _step.value;

                        max_r = min(max_r, (vector_magnitude(_obj.pos - pos) - _obj.get_r()) / 1.5);
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

                m = Sphere.get_m_from_r(random(Sphere.get_r_from_m(this.config.MASS_MIN), max_r));
            }
            if (!v) {
                v = nj.array(spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180)));
            }
            if (!color) {
                color = rand_color();
            }
            var tag = 'sphere' + this.objs.length;
            var dir_tag = tag + "_dir";
            var obj = new Sphere(this.config, m, pos, v, color, tag, dir_tag, this, controlbox);
            this.objs.push(obj);
            this.draw_object(obj);
            this.draw_direction(obj);
        }
    }, {
        key: 'get_rotation_matrix',
        value: function get_rotation_matrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return dir == 1 ? get_rotation_z_matrix(angles[0]) * get_rotation_x_matrix(angles[1]) : get_rotation_x_matrix(angles[1], -1) * get_rotation_z_matrix(angles[0], -1);
        }
    }]);

    return Engine3D;
}(Engine2D);

module.exports = Engine3D;

},{"../camera/3d":4,"../object/sphere":12,"../util":13,"./2d":7}],9:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InvisibleError = function (_Error) {
  _inherits(InvisibleError, _Error);

  function InvisibleError() {
    _classCallCheck(this, InvisibleError);

    return _possibleConstructorReturn(this, (InvisibleError.__proto__ || Object.getPrototypeOf(InvisibleError)).apply(this, arguments));
  }

  return InvisibleError;
}(Error);

module.exports = InvisibleError;

},{}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Engine2D = require('./engine/2d');
var Engine3D = require('./engine/3d');

var _require = require('./util'),
    get_distance = _require.get_distance;

var config = null;
var keymap = {
    38: 'up',
    40: 'down',
    37: 'left',
    39: 'right',
    90: 'zoom_in', // z
    88: 'zoom_out', // x
    87: 'rotate_up', // w
    83: 'rotate_down', // s
    65: 'rotate_left', // a
    68: 'rotate_right' // d
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
            for (var _iterator = engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var obj = _step.value;

                var c = engine.object_coords(obj);
                var cx = (c[0] + c[2]) / 2;
                var cy = (c[1] + c[3]) / 2;
                var r = (c[2] - c[0]) / 2;
                if (get_distance(cx, cy, x, y) < r) {
                    obj.show_controlbox();
                    return;
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

        engine.create_object(x, y);
    }
}

function on_key_down(event, engine) {
    var keyCode = event.keyCode;

    if (keyCode == 32) {
        // space bar
        engine.destroy_controlboxes();
        engine.animating = !engine.animating;
        document.title = config.TITLE + ' (' + (engine.animating ? "Simulating" : "Paused") + ')';
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

},{"./engine/2d":7,"./engine/3d":8,"./util":13}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ControlBox = require('../control/control_box');
var Controller = require('../control/controller');

var _require = require('../util'),
    vector_magnitude = _require.vector_magnitude,
    rad2deg = _require.rad2deg,
    deg2rad = _require.deg2rad,
    polar2cartesian = _require.polar2cartesian,
    cartesian2auto = _require.cartesian2auto,
    square = _require.square;

var max = Math.max,
    pow = Math.pow;

var Circle = function () {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    function Circle(config, m, pos, v, color, tag, dir_tag, engine, controlbox) {
        _classCallCheck(this, Circle);

        this.config = config;
        this.m = m;
        this.pos = pos;
        this.prev_pos = pos.slice();
        this.v = v;
        this.color = color;
        this.tag = tag;
        this.dir_tag = dir_tag;
        this.engine = engine;

        this.controlbox = null;
        if (controlbox) {
            this.show_controlbox();
        }
    }

    _createClass(Circle, [{
        key: 'get_r',
        value: function get_r() {
            return Circle.get_r_from_m(this.m);
        }
    }, {
        key: 'calculate_velocity',
        value: function calculate_velocity() {
            var F = nj.zeros(this.config.DIMENSION);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var obj = _step.value;

                    if (obj == this) continue;
                    var vector = this.pos.subtract(obj.pos);
                    var magnitude = vector_magnitude(vector);
                    var unit_vector = vector.divide(magnitude);
                    F = F.add(unit_vector.multiply(obj.m / square(magnitude)));
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

            F = F.multiply(-this.config.G * this.m);
            var a = F.divide(this.m);
            this.v = this.v.add(a);
        }
    }, {
        key: 'calculate_position',
        value: function calculate_position() {
            this.pos = this.pos.add(this.v);
        }
    }, {
        key: 'control_m',
        value: function control_m(e) {
            var m = this.m_controller.get();
            this.m = m;
        }
    }, {
        key: 'control_pos',
        value: function control_pos(e) {
            var x = this.pos_x_controller.get();
            var y = this.pos_y_controller.get();
            this.pos = nj.array([x, y]);
        }
    }, {
        key: 'control_v',
        value: function control_v(e) {
            var phi = deg2rad(this.v_phi_controller.get());
            var rho = this.v_rho_controller.get();
            this.v = nj.array(polar2cartesian(rho, phi));
        }
    }, {
        key: 'show_controlbox',
        value: function show_controlbox() {
            try {
                this.controlbox.tk.lift();
            } catch (e) {
                var margin = 1.5;

                var pos_range = max(max(this.config.W, this.config.H) / 2, max.apply(null, this.pos.tolist().map(Math.abs)) * margin);
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.engine.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var obj = _step2.value;

                        pos_range = max(pos_range, max.apply(null, obj.pos.tolist().map(Math.abs)) * margin);
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
                var v_range = max(this.config.VELOCITY_MAX, vector_magnitude(this.v) * margin);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.engine.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _obj = _step3.value;

                        v_range = max(v_range, vector_magnitude(_obj.v) * margin);
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

                this.setup_controllers(pos_range, m, v, v_range);
                this.controlbox = new ControlBox(this.tag, this.get_controllers());
                this.engine.controlboxes.push(this.controlbox);
            }
        }
    }, {
        key: 'setup_controllers',
        value: function setup_controllers(pos_range, m, v, v_range) {
            this.m_controller = new Controller("Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.control_m);
            this.pos_x_controller = new Controller("Position x", -pos_range, pos_range, this.pos[0], this.control_pos);
            this.pos_y_controller = new Controller("Position y", -pos_range, pos_range, this.pos[1], this.control_pos);
            this.v_rho_controller = new Controller("Velocity ρ", 0, v_range, v[0], this.control_v);
            this.v_phi_controller = new Controller("Velocity φ", -180, 180, rad2deg(v[1]), this.control_v);
        }
    }, {
        key: 'get_controllers',
        value: function get_controllers() {
            return [this.m_controller, this.pos_x_controller, this.pos_y_controller, this.v_rho_controller, this.v_phi_controller];
        }
    }, {
        key: 'toString',
        value: function toString() {
            return JSON.stringify({ 'tag': this.tag, 'v': this.v, 'pos': this.pos });
        }
    }], [{
        key: 'get_r_from_m',
        value: function get_r_from_m(m) {
            return pow(m, 1 / 2);
        }
    }, {
        key: 'get_m_from_r',
        value: function get_m_from_r(r) {
            return square(r);
        }
    }]);

    return Circle;
}();

module.exports = Circle;

},{"../control/control_box":5,"../control/controller":6,"../util":13}],12:[function(require,module,exports){
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
        key: 'get_r',

        /**
         * Spherical coordinate system
         * https://en.wikipedia.org/wiki/Spherical_coordinate_system
         */

        value: function get_r() {
            return Sphere.get_r_from_m(this.m);
        }
    }, {
        key: 'control_pos',
        value: function control_pos(e) {
            var x = this.pos_x_controller.get();
            var y = this.pos_y_controller.get();
            var z = this.pos_z_controller.get();
            this.pos = nj.array([x, y, z]);
        }
    }, {
        key: 'control_v',
        value: function control_v(e) {
            var phi = deg2rad(this.v_phi_controller.get());
            var theta = deg2rad(this.v_theta_controller.get());
            var rho = this.v_rho_controller.get();
            this.v = nj.array(spherical2cartesian(rho, phi, theta));
        }
    }, {
        key: 'setup_controllers',
        value: function setup_controllers(pos_range, m, v, v_range) {
            _get(Sphere.prototype.__proto__ || Object.getPrototypeOf(Sphere.prototype), 'setup_controllers', this).call(this, pos_range, m, v, v_range);
            this.pos_z_controller = new Controller("Position z", -pos_range, pos_range, this.pos[2], this.control_pos);
            this.v_theta_controller = new Controller("Velocity θ", -180, 180, rad2deg(v[2]), this.control_v);
        }
    }, {
        key: 'get_controllers',
        value: function get_controllers() {
            return [this.m_controller, this.pos_x_controller, this.pos_y_controller, this.pos_z_controller, this.v_rho_controller, this.v_phi_controller, this.v_theta_controller];
        }
    }], [{
        key: 'get_r_from_m',
        value: function get_r_from_m(m) {
            return pow(m, 1 / 3);
        }
    }, {
        key: 'get_m_from_r',
        value: function get_m_from_r(r) {
            return cube(r);
        }
    }]);

    return Sphere;
}(Circle);

module.exports = Sphere;

},{"../control/controller":6,"../util":13,"./circle":11}],13:[function(require,module,exports){
'use strict';

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
        return [Math.sqrt(Util.square(x) + Util.square(y)), Math.atan2(x, y)];
    },

    spherical2cartesian: function spherical2cartesian(rho, phi, theta) {
        return [rho * Math.sin(theta) * Math.cos(phi), rho * Math.sin(theta) * Math.sin(phi), rho * Math.cos(theta)];
    },

    cartesian2spherical: function cartesian2spherical(x, y, z) {
        var rho = Math.sqrt(Util.square(x) + Util.square(y) + Util.square(z));
        return [rho, Math.atan2(x, y), rho != 0 ? Math.acos(z / rho) : 0];
    },

    cartesian2auto: function cartesian2auto(vector) {
        return vector.size == 2 ? Util.cartesian2polar(vector.get(0), vector.get(1)) : Util.cartesian2spherical(vector.get(0), vector.get(1), vector.get(2));
    },

    rad2deg: function rad2deg(rad) {
        return rad / Math.PI * 180;
    },

    deg2rad: function deg2rad(deg) {
        return deg / 180 * Math.PI;
    },

    get_distance: function get_distance(x0, y0, x1, y1) {
        return Math.sqrt(Util.square(x1 - x0) + Util.square(y1 - y0));
    },

    vector_magnitude: function vector_magnitude(vector) {
        return vector.pow(2).tolist().reduce(function (a, b) {
            return a + b;
        }, 0);
    },

    c2d: function c2d() {
        return nj.array([0, 0]);
    },

    rotate: function rotate(vector, matrix) {
        return vector.dot(matrix);
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

    rand_color: function rand_color() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },

    get_rotation_matrix: function get_rotation_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return nj.array([[cos, -sin], [sin, cos]]);
    },

    get_rotation_x_matrix: function get_rotation_x_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return nj.array([[1, 0, 0], [0, cos, -sin], [0, sin, cos]]);
    },

    get_rotation_y_matrix: function get_rotation_y_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return nj.array([[cos, 0, -sin], [0, 1, 0], [sin, 0, cos]]);
    },

    get_rotation_z_matrix: function get_rotation_z_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return nj.array([[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]]);
    }
};

module.exports = Util;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9jaXJjbGUuanMiLCJqcy9zaW11bGF0b3Ivb2JqZWN0L3NwaGVyZS5qcyIsImpzL3NpbXVsYXRvci91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLFNBQVMsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNLFlBQVksUUFBUSxhQUFSLENBQWxCOztBQUVBLElBQU0sWUFBWSxJQUFJLFNBQUosQ0FBYyxNQUFkLENBQWxCO0FBQ0EsVUFBVSxPQUFWOzs7OztTQ0ppQixDO0lBQVYsTSxNQUFBLE07OztBQUdQLFNBQVMsUUFBVCxDQUFrQixDQUFsQixFQUFxQjtBQUNqQixXQUFPLE9BQU8sSUFBUCxFQUFhLENBQWIsRUFBZ0I7QUFDbkIsaUJBQVMsbUJBRFU7QUFFbkIsc0JBQWMsT0FGSztBQUduQixxQkFBYSxDQUhNO0FBSW5CLHFCQUFhLElBSk07QUFLbkIsNkJBQXFCLENBTEY7QUFNbkIsNkJBQXFCLENBTkY7QUFPbkIsK0JBQXVCLEdBUEo7QUFRbkIsYUFBSyxHQVJjO0FBU25CLG9CQUFZLENBVE87QUFVbkIsb0JBQVksR0FWTztBQVduQix3QkFBZ0I7QUFYRyxLQUFoQixDQUFQO0FBYUg7O0FBR0QsU0FBUyxRQUFULENBQWtCLENBQWxCLEVBQXFCO0FBQ2pCLFdBQU8sT0FBTyxJQUFQLEVBQWEsU0FBUyxDQUFULENBQWIsRUFBMEI7QUFDN0IscUJBQWEsQ0FEZ0I7QUFFN0IsYUFBSyxLQUZ3QjtBQUc3QixvQkFBWSxDQUhpQjtBQUk3QixvQkFBWSxHQUppQjtBQUs3Qix3QkFBZ0I7QUFMYSxLQUExQixDQUFQO0FBT0g7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7QUM5QkEsSUFBTSxpQkFBaUIsUUFBUSxvQkFBUixDQUF2Qjs7ZUFDb0QsUUFBUSxTQUFSLEM7SUFBN0MsTyxZQUFBLE87SUFBUyxNLFlBQUEsTTtJQUFRLEcsWUFBQSxHO0lBQUssbUIsWUFBQSxtQjs7SUFDdEIsRyxHQUFPLEksQ0FBUCxHOztJQUVELFE7QUFDRixzQkFBWSxNQUFaLEVBQW9CLE1BQXBCLEVBQTRCO0FBQUE7O0FBQ3hCLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssQ0FBTCxHQUFTLEdBQVQ7QUFDQSxhQUFLLEdBQUwsR0FBVyxDQUFYO0FBQ0EsYUFBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLGFBQUssU0FBTCxHQUFpQixDQUFqQjtBQUNBLGFBQUssUUFBTCxHQUFnQixJQUFoQjtBQUNBLGFBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxhQUFLLE1BQUwsR0FBYyxHQUFHLEtBQUgsQ0FBUyxDQUFDLE9BQU8sQ0FBUCxHQUFXLENBQVosRUFBZSxPQUFPLENBQVAsR0FBVyxDQUExQixDQUFULENBQWQ7QUFDSDs7Ozt1Q0FFYyxHLEVBQUs7QUFDaEIsZ0JBQU0sZUFBZSxLQUFyQjtBQUNBLGdCQUFJLE9BQU8sS0FBSyxRQUFaLElBQXdCLGVBQWUsS0FBSyxTQUFwQixHQUFnQyxDQUE1RCxFQUErRDtBQUMzRCxxQkFBSyxLQUFMLElBQWMsQ0FBZDtBQUNILGFBRkQsTUFFTztBQUNILHFCQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0g7QUFDRCxpQkFBSyxTQUFMLEdBQWlCLFlBQWpCO0FBQ0EsaUJBQUssUUFBTCxHQUFnQixHQUFoQjtBQUNBLG1CQUFPLEtBQUssTUFBTCxDQUFZLGlCQUFaLEdBQWdDLElBQUksS0FBSyxNQUFMLENBQVksbUJBQWhCLEVBQXFDLEtBQUssS0FBMUMsQ0FBdkM7QUFDSDs7OzJCQUVFLEcsRUFBSztBQUNKLGlCQUFLLENBQUwsSUFBVSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7OzZCQUVJLEcsRUFBSztBQUNOLGlCQUFLLENBQUwsSUFBVSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7OzZCQUVJLEcsRUFBSztBQUNOLGlCQUFLLENBQUwsSUFBVSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7OzhCQUVLLEcsRUFBSztBQUNQLGlCQUFLLENBQUwsSUFBVSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O2dDQUVPLEcsRUFBSztBQUNULGlCQUFLLENBQUwsSUFBVSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O2lDQUVRLEcsRUFBSztBQUNWLGlCQUFLLENBQUwsSUFBVSxLQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBVjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O29DQUVXLEcsRUFBSztBQUNiLGlCQUFLLEdBQUwsSUFBWSxLQUFLLE1BQUwsQ0FBWSxpQkFBeEI7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OztxQ0FFWSxHLEVBQUs7QUFDZCxpQkFBSyxHQUFMLElBQVksS0FBSyxNQUFMLENBQVksaUJBQXhCO0FBQ0EsaUJBQUssT0FBTDtBQUNIOzs7a0NBRVMsQ0FDVDs7O21DQUV3QztBQUFBLGdCQUFoQyxDQUFnQyx1RUFBNUIsQ0FBNEI7QUFBQSxnQkFBekIsZUFBeUIsdUVBQVAsS0FBTzs7QUFDckMsZ0JBQUksV0FBVyxLQUFLLENBQUwsR0FBUyxDQUF4QjtBQUNBLGdCQUFJLFlBQVksQ0FBaEIsRUFBbUI7QUFDZixvQkFBSSxDQUFDLGVBQUwsRUFBc0IsTUFBTSxjQUFOO0FBQ3RCLDJCQUFXLFFBQVg7QUFDSDtBQUNELG1CQUFPLE1BQU0sUUFBYjtBQUNIOzs7cUNBRVksSyxFQUFnQztBQUFBLGdCQUF6QixlQUF5Qix1RUFBUCxLQUFPOztBQUN6QyxnQkFBTSxJQUFJLG9CQUFvQixRQUFRLEtBQUssR0FBYixDQUFwQixDQUFWO0FBQ0EsZ0JBQU0sT0FBTyxLQUFLLFFBQUwsRUFBYjtBQUNBLG1CQUFPLEtBQUssTUFBTCxHQUFjLENBQUMsT0FBTyxLQUFQLEVBQWMsQ0FBZCxJQUFtQixDQUFDLEtBQUssQ0FBTixFQUFTLEtBQUssQ0FBZCxDQUFwQixJQUF3QyxJQUE3RDtBQUNIOzs7c0NBRWEsSyxFQUFPLE0sRUFBUTtBQUN6QixnQkFBTSxPQUFPLEtBQUssUUFBTCxFQUFiO0FBQ0EsbUJBQU8sU0FBUyxJQUFoQjtBQUNIOzs7cUNBRVksQyxFQUFHLEMsRUFBRztBQUNmLGdCQUFNLEtBQUssb0JBQW9CLFFBQVEsS0FBSyxHQUFiLENBQXBCLEVBQXVDLENBQUMsQ0FBeEMsQ0FBWDtBQUNBLGdCQUFNLE9BQU8sS0FBSyxRQUFMLEVBQWI7QUFDQSxtQkFBTyxPQUFRLEdBQUcsS0FBSCxDQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxFQUFpQixRQUFqQixDQUEwQixLQUFLLE1BQS9CLENBQUQsQ0FBeUMsTUFBekMsQ0FBZ0QsSUFBaEQsRUFBc0QsR0FBdEQsQ0FBMEQsQ0FBQyxLQUFLLENBQU4sRUFBUyxLQUFLLENBQWQsQ0FBMUQsQ0FBUCxFQUFvRixFQUFwRixDQUFQO0FBQ0g7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixRQUFqQjs7Ozs7Ozs7Ozs7OztBQ3BHQSxJQUFNLFdBQVcsUUFBUSxNQUFSLENBQWpCOztlQUN3RSxRQUFRLFNBQVIsQztJQUFqRSxPLFlBQUEsTztJQUFTLE0sWUFBQSxNO0lBQVEscUIsWUFBQSxxQjtJQUF1QixxQixZQUFBLHFCOztJQUd6QyxROzs7QUFDRixzQkFBWSxNQUFaLEVBQW9CLE1BQXBCLEVBQTRCO0FBQUE7O0FBQUEsd0hBQ2xCLE1BRGtCLEVBQ1YsTUFEVTs7QUFFeEIsY0FBSyxLQUFMLEdBQWEsQ0FBYjtBQUZ3QjtBQUczQjs7OztrQ0FFUyxHLEVBQUs7QUFDWCxpQkFBSyxLQUFMLElBQWMsS0FBSyxNQUFMLENBQVksaUJBQTFCO0FBQ0EsaUJBQUssT0FBTDtBQUNIOzs7b0NBRVcsRyxFQUFLO0FBQ2IsaUJBQUssS0FBTCxJQUFjLEtBQUssTUFBTCxDQUFZLGlCQUExQjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O3FDQUVZLEssRUFBZ0M7QUFBQSxnQkFBekIsZUFBeUIsdUVBQVAsS0FBTzs7QUFDekMsZ0JBQU0sS0FBSyxzQkFBc0IsUUFBUSxLQUFLLEtBQWIsQ0FBdEIsQ0FBWDtBQUNBLGdCQUFNLEtBQUssc0JBQXNCLFFBQVEsS0FBSyxHQUFiLENBQXRCLENBQVg7QUFDQSxnQkFBTSxJQUFJLE9BQU8sT0FBTyxLQUFQLEVBQWMsRUFBZCxDQUFQLEVBQTBCLEVBQTFCLENBQVY7QUFDQSxnQkFBTSxPQUFPLEtBQUssUUFBTCxDQUFjLEVBQUUsR0FBRixFQUFkLEVBQXVCLGVBQXZCLENBQWI7QUFDQSxtQkFBTyxLQUFLLE1BQUwsR0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQU4sRUFBUyxLQUFLLENBQWQsQ0FBTCxJQUF5QixJQUE5QztBQUNIOzs7c0NBRWEsSyxFQUFPLE0sRUFBUTtBQUN6QixnQkFBTSxLQUFLLHNCQUFzQixRQUFRLEtBQUssS0FBYixDQUF0QixDQUFYO0FBQ0EsZ0JBQU0sS0FBSyxzQkFBc0IsUUFBUSxLQUFLLEdBQWIsQ0FBdEIsQ0FBWDtBQUNBLGdCQUFNLElBQUksT0FBTyxPQUFPLEtBQVAsRUFBYyxFQUFkLENBQVAsRUFBMEIsRUFBMUIsQ0FBVjtBQUNBLGdCQUFNLE9BQU8sS0FBSyxRQUFMLENBQWMsRUFBRSxHQUFGLEVBQWQsQ0FBYjtBQUNBLG1CQUFPLFNBQVMsSUFBaEI7QUFDSDs7O3FDQUVZLEMsRUFBRyxDLEVBQUc7QUFDZixnQkFBTSxNQUFNLHNCQUFzQixRQUFRLEtBQUssS0FBYixDQUF0QixFQUEyQyxDQUFDLENBQTVDLENBQVo7QUFDQSxnQkFBTSxNQUFNLHNCQUFzQixRQUFRLEtBQUssR0FBYixDQUF0QixFQUF5QyxDQUFDLENBQTFDLENBQVo7QUFDQSxnQkFBTSxJQUFJLENBQUUsQ0FBQyxDQUFELEVBQUksQ0FBSixJQUFTLEtBQUssTUFBZixHQUF5QixDQUFDLEtBQUssQ0FBTixFQUFTLEtBQUssQ0FBZCxDQUExQixFQUE0QyxNQUE1QyxDQUFtRCxDQUFuRCxDQUFWO0FBQ0EsbUJBQU8sT0FBTyxPQUFPLENBQVAsRUFBVSxHQUFWLENBQVAsRUFBdUIsR0FBdkIsQ0FBUDtBQUNIOzs7O0VBckNrQixROztBQXdDdkIsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7SUM1Q00sVTtBQUNGLHdCQUFZLEtBQVosRUFBbUIsV0FBbkIsRUFBZ0M7QUFBQTs7QUFDNUIsWUFBTSxjQUFjLEVBQUUsdUJBQUYsRUFBMkIsS0FBM0IsRUFBcEI7QUFDQSxvQkFBWSxXQUFaLENBQXdCLFVBQXhCO0FBQ0Esb0JBQVksSUFBWixDQUFpQixRQUFqQixFQUEyQixJQUEzQixDQUFnQyxLQUFoQztBQUNBLFlBQU0sa0JBQWtCLFlBQVksSUFBWixDQUFpQixrQkFBakIsQ0FBeEI7QUFKNEI7QUFBQTtBQUFBOztBQUFBO0FBSzVCLGlDQUF5QixXQUF6Qiw4SEFBc0M7QUFBQSxvQkFBM0IsVUFBMkI7O0FBQ2xDLGdDQUFnQixNQUFoQixDQUF1QixXQUFXLGFBQWxDO0FBQ0g7QUFQMkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTNUIsYUFBSyxXQUFMLEdBQW1CLFdBQW5CO0FBQ0g7Ozs7a0NBRVM7QUFDTixpQkFBSyxXQUFMLENBQWlCLE1BQWpCO0FBQ0g7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixVQUFqQjs7Ozs7Ozs7O0lDbEJNLFU7QUFDRix3QkFBWSxJQUFaLEVBQWtCLEdBQWxCLEVBQXVCLEdBQXZCLEVBQTRCLEtBQTVCLEVBQW1DLElBQW5DLEVBQXlDO0FBQUE7O0FBQ3JDLFlBQU0sZ0JBQWdCLEVBQUUseUJBQUYsRUFBNkIsS0FBN0IsRUFBdEI7QUFDQSxzQkFBYyxXQUFkLENBQTBCLFVBQTFCO0FBQ0Esc0JBQWMsSUFBZCxDQUFtQixNQUFuQixFQUEyQixJQUEzQixDQUFnQyxJQUFoQztBQUNBLFlBQU0sU0FBUyxjQUFjLElBQWQsQ0FBbUIsT0FBbkIsQ0FBZjtBQUNBLGVBQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsR0FBbkI7QUFDQSxlQUFPLElBQVAsQ0FBWSxLQUFaLEVBQW1CLEdBQW5CO0FBQ0EsZUFBTyxJQUFQLENBQVksT0FBWixFQUFxQixLQUFyQjtBQUNBLGVBQU8sTUFBUCxDQUFjLElBQWQ7O0FBRUEsYUFBSyxhQUFMLEdBQXFCLGFBQXJCO0FBQ0EsYUFBSyxNQUFMLEdBQWMsTUFBZDtBQUNIOzs7OzhCQUVLO0FBQ0YsbUJBQU8sS0FBSyxNQUFMLENBQVksR0FBWixFQUFQO0FBQ0g7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixVQUFqQjs7Ozs7Ozs7Ozs7QUNwQkEsSUFBTSxTQUFTLFFBQVEsa0JBQVIsQ0FBZjtBQUNBLElBQU0sV0FBVyxRQUFRLGNBQVIsQ0FBakI7QUFDQSxJQUFNLGlCQUFpQixRQUFRLG9CQUFSLENBQXZCOztlQUNrSCxRQUFRLFNBQVIsQztJQUEzRyxnQixZQUFBLGdCO0lBQWtCLE0sWUFBQSxNO0lBQVEsRyxZQUFBLEc7SUFBSyxNLFlBQUEsTTtJQUFRLGUsWUFBQSxlO0lBQWlCLFUsWUFBQSxVO0lBQVksb0IsWUFBQSxtQjtJQUFxQixjLFlBQUEsYzs7SUFDekYsRyxHQUFPLEksQ0FBUCxHOztJQUdELEksR0FDRixjQUFZLEdBQVosRUFBaUI7QUFBQTs7QUFDYixTQUFLLFFBQUwsR0FBZ0IsSUFBSSxRQUFKLENBQWEsS0FBYixFQUFoQjtBQUNBLFNBQUssR0FBTCxHQUFXLElBQUksR0FBSixDQUFRLEtBQVIsRUFBWDtBQUNILEM7O0lBR0MsUTtBQUNGLHNCQUFZLE1BQVosRUFBb0IsR0FBcEIsRUFBeUI7QUFBQTs7QUFDckIsYUFBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLGFBQUssR0FBTCxHQUFXLEdBQVg7QUFDQSxhQUFLLElBQUwsR0FBWSxFQUFaO0FBQ0EsYUFBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLEVBQXBCO0FBQ0EsYUFBSyxLQUFMLEdBQWEsRUFBYjtBQUNBLGFBQUssTUFBTCxHQUFjLElBQUksUUFBSixDQUFhLE1BQWIsRUFBcUIsSUFBckIsQ0FBZDtBQUNBLGFBQUssYUFBTCxHQUFxQixLQUFyQjtBQUNBLGFBQUssU0FBTCxHQUFpQixDQUFqQjtBQUNIOzs7OytDQUVzQjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNuQixxQ0FBeUIsS0FBSyxZQUE5Qiw4SEFBNEM7QUFBQSx3QkFBakMsVUFBaUM7O0FBQ3hDLCtCQUFXLE9BQVg7QUFDSDtBQUhrQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUluQixpQkFBSyxZQUFMLEdBQW9CLEVBQXBCO0FBQ0g7OztrQ0FFUztBQUFBOztBQUNOLGlCQUFLLFNBQUw7QUFDQSxnQkFBSSxLQUFLLFNBQVQsRUFBb0I7QUFDaEIscUJBQUssYUFBTDtBQUNIO0FBQ0QsaUJBQUssVUFBTDtBQUNBLHVCQUFXLFlBQU07QUFDYixzQkFBSyxPQUFMO0FBQ0gsYUFGRCxFQUVHLEVBRkg7QUFHSDs7O3NDQUVhLEcsRUFBSztBQUNmLGdCQUFNLElBQUksS0FBSyxNQUFMLENBQVksYUFBWixDQUEwQixJQUFJLEdBQTlCLEVBQW1DLElBQUksS0FBSixFQUFuQyxDQUFWOztBQURlLHVDQUVBLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBSSxHQUE3QixDQUZBO0FBQUE7QUFBQSxnQkFFUixDQUZRO0FBQUEsZ0JBRUwsQ0FGSzs7QUFHZixtQkFBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFQO0FBQ0g7Ozt5Q0FFZ0IsRyxFQUFLO0FBQUEsd0NBQ0QsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixJQUFJLEdBQTdCLENBREM7QUFBQTtBQUFBLGdCQUNYLEVBRFc7QUFBQSxnQkFDUCxFQURPOztBQUFBLHdDQUVELEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBSSxHQUFKLEdBQVUsSUFBSSxDQUFKLEdBQVEsRUFBM0MsRUFBK0MsSUFBL0MsQ0FGQztBQUFBO0FBQUEsZ0JBRVgsRUFGVztBQUFBLGdCQUVQLEVBRk87O0FBR2xCLG1CQUFPLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYixDQUFQO0FBQ0g7OztvQ0FFVyxHLEVBQUs7QUFBQSx3Q0FDSSxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLElBQUksUUFBN0IsQ0FESjtBQUFBO0FBQUEsZ0JBQ04sRUFETTtBQUFBLGdCQUNGLEVBREU7O0FBQUEsd0NBRUksS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixJQUFJLEdBQTdCLENBRko7QUFBQTtBQUFBLGdCQUVOLEVBRk07QUFBQSxnQkFFRixFQUZFOztBQUdiLG1CQUFPLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYixDQUFQO0FBQ0g7OztvQ0FFVyxHLEVBQUs7QUFDYixnQkFBSTtBQUNBLG9CQUFNLElBQUksS0FBSyxhQUFMLENBQW1CLEdBQW5CLENBQVY7QUFDQSxxQkFBSyxHQUFMLENBQVMsU0FBVDtBQUNBLHFCQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsRUFBRSxDQUFGLENBQWIsRUFBbUIsRUFBRSxDQUFGLENBQW5CLEVBQXlCLEVBQUUsQ0FBRixDQUF6QixFQUErQixDQUEvQixFQUFrQyxJQUFJLEtBQUssRUFBM0MsRUFBK0MsS0FBL0M7QUFDQSxxQkFBSyxHQUFMLENBQVMsU0FBVCxHQUFxQixJQUFJLEtBQXpCO0FBQ0EscUJBQUssR0FBTCxDQUFTLElBQVQ7QUFDSCxhQU5ELENBTUUsT0FBTyxDQUFQLEVBQVU7QUFDUixvQkFBSSxFQUFFLGFBQWEsY0FBZixDQUFKLEVBQW9DO0FBQ2hDLDBCQUFNLENBQU47QUFDSDtBQUNKO0FBQ0o7Ozt1Q0FFYyxHLEVBQUs7QUFDaEIsZ0JBQUk7QUFDQSxvQkFBTSxJQUFJLEtBQUssYUFBTCxDQUFtQixHQUFuQixDQUFWO0FBQ0EscUJBQUssR0FBTCxDQUFTLFNBQVQ7QUFDQSxxQkFBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixFQUFFLENBQUYsQ0FBaEIsRUFBc0IsRUFBRSxDQUFGLENBQXRCO0FBQ0EscUJBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsRUFBRSxDQUFGLENBQWhCLEVBQXNCLEVBQUUsQ0FBRixDQUF0QjtBQUNBLHFCQUFLLEdBQUwsQ0FBUyxXQUFULEdBQXVCLFNBQXZCO0FBQ0EscUJBQUssR0FBTCxDQUFTLE1BQVQ7QUFDSCxhQVBELENBT0UsT0FBTyxDQUFQLEVBQVU7QUFDUixvQkFBSSxFQUFFLGFBQWEsY0FBZixDQUFKLEVBQW9DO0FBQ2hDLDBCQUFNLENBQU47QUFDSDtBQUNKO0FBQ0o7OztxQ0FFWTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNULHNDQUFtQixLQUFLLEtBQXhCLG1JQUErQjtBQUFBLHdCQUFwQixJQUFvQjs7QUFDM0Isd0JBQUk7QUFDQSw0QkFBTSxJQUFJLEtBQUssV0FBTCxDQUFpQixJQUFqQixDQUFWO0FBQ0EsNkJBQUssR0FBTCxDQUFTLFNBQVQ7QUFDQSw2QkFBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixFQUFFLENBQUYsQ0FBaEIsRUFBc0IsRUFBRSxDQUFGLENBQXRCO0FBQ0EsNkJBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsRUFBRSxDQUFGLENBQWhCLEVBQXNCLEVBQUUsQ0FBRixDQUF0QjtBQUNBLDZCQUFLLEdBQUwsQ0FBUyxXQUFULEdBQXVCLFNBQXZCO0FBQ0EsNkJBQUssR0FBTCxDQUFTLE1BQVQ7QUFDSCxxQkFQRCxDQU9FLE9BQU8sQ0FBUCxFQUFVO0FBQ1IsNEJBQUksRUFBRSxhQUFhLGNBQWYsQ0FBSixFQUFvQztBQUNoQyxrQ0FBTSxDQUFOO0FBQ0g7QUFDSjtBQUNKO0FBZFE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWVaOzs7b0NBRVcsRyxFQUFLO0FBQ2IsZ0JBQUksaUJBQWlCLElBQUksR0FBSixDQUFRLFFBQVIsQ0FBaUIsSUFBSSxRQUFyQixDQUFqQixJQUFtRCxDQUF2RCxFQUEwRDtBQUN0RCxxQkFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixJQUFJLElBQUosQ0FBUyxHQUFULENBQWhCO0FBQ0Esb0JBQUksUUFBSixHQUFlLElBQUksR0FBSixDQUFRLEtBQVIsRUFBZjtBQUNBLG9CQUFJLEtBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsS0FBSyxNQUFMLENBQVksU0FBcEMsRUFBK0M7QUFDM0MseUJBQUssS0FBTCxHQUFhLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsQ0FBakIsQ0FBYjtBQUNIO0FBQ0o7QUFDSjs7O3NDQUVhLEMsRUFBRyxDLEVBQXdEO0FBQUEsZ0JBQXJELENBQXFELHVFQUFqRCxJQUFpRDtBQUFBLGdCQUEzQyxDQUEyQyx1RUFBdkMsSUFBdUM7QUFBQSxnQkFBakMsS0FBaUMsdUVBQXpCLElBQXlCO0FBQUEsZ0JBQW5CLFVBQW1CLHVFQUFOLElBQU07O0FBQ3JFLGdCQUFNLE1BQU0sS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixDQUF6QixFQUE0QixDQUE1QixDQUFaO0FBQ0EsZ0JBQUksQ0FBQyxDQUFMLEVBQVE7QUFDSixvQkFBSSxRQUFRLE9BQU8sWUFBUCxDQUFvQixLQUFLLE1BQUwsQ0FBWSxRQUFoQyxDQUFaO0FBREk7QUFBQTtBQUFBOztBQUFBO0FBRUosMENBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUEsNEJBQWxCLElBQWtCOztBQUN6QixnQ0FBUSxJQUFJLEtBQUosRUFBVyxDQUFDLGlCQUFpQixLQUFJLEdBQUosQ0FBUSxRQUFSLENBQWlCLEdBQWpCLENBQWpCLElBQTBDLEtBQUksS0FBSixFQUEzQyxJQUEwRCxHQUFyRSxDQUFSO0FBQ0g7QUFKRztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUtKLG9CQUFJLE9BQU8sWUFBUCxDQUFvQixPQUFPLE9BQU8sWUFBUCxDQUFvQixLQUFLLE1BQUwsQ0FBWSxRQUFoQyxDQUFQLEVBQWtELEtBQWxELENBQXBCLENBQUo7QUFDSDtBQUNELGdCQUFJLENBQUMsQ0FBTCxFQUFRO0FBQ0osb0JBQUksR0FBRyxLQUFILENBQVMsZ0JBQWdCLE9BQU8sS0FBSyxNQUFMLENBQVksWUFBWixHQUEyQixDQUFsQyxDQUFoQixFQUFzRCxPQUFPLENBQUMsR0FBUixFQUFhLEdBQWIsQ0FBdEQsQ0FBVCxDQUFKO0FBQ0g7QUFDRCxnQkFBSSxDQUFDLEtBQUwsRUFBWTtBQUNSLHdCQUFRLFlBQVI7QUFDSDtBQUNELGdCQUFNLGlCQUFlLEtBQUssSUFBTCxDQUFVLE1BQS9CO0FBQ0EsZ0JBQU0sVUFBVSxNQUFNLE1BQXRCO0FBQ0EsZ0JBQU0sTUFBTSxJQUFJLE1BQUosQ0FBVyxLQUFLLE1BQWhCLEVBQXdCLENBQXhCLEVBQTJCLEdBQTNCLEVBQWdDLENBQWhDLEVBQW1DLEtBQW5DLEVBQTBDLEdBQTFDLEVBQStDLE9BQS9DLEVBQXdELElBQXhELEVBQThELFVBQTlELENBQVo7QUFDQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLEdBQWY7QUFDSDs7OzRDQUVtQixNLEVBQWlCO0FBQUEsZ0JBQVQsR0FBUyx1RUFBSCxDQUFHOztBQUNqQyxtQkFBTyxxQkFBb0IsT0FBTyxDQUFQLENBQXBCLEVBQStCLEdBQS9CLENBQVA7QUFDSDs7OzRDQUVtQjtBQUNoQixnQkFBTSxZQUFZLEtBQUssTUFBTCxDQUFZLFNBQTlCO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLElBQUwsQ0FBVSxNQUE5QixFQUFzQyxHQUF0QyxFQUEyQztBQUN2QyxvQkFBTSxLQUFLLEtBQUssSUFBTCxDQUFVLENBQVYsQ0FBWDtBQUNBLHFCQUFLLElBQUksSUFBSSxJQUFJLENBQWpCLEVBQW9CLElBQUksS0FBSyxJQUFMLENBQVUsTUFBbEMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDM0Msd0JBQU0sS0FBSyxLQUFLLElBQUwsQ0FBVSxDQUFWLENBQVg7QUFDQSx3QkFBTSxZQUFZLEdBQUcsR0FBSCxDQUFPLFFBQVAsQ0FBZ0IsR0FBRyxHQUFuQixDQUFsQjtBQUNBLHdCQUFNLFNBQVMsZUFBZSxTQUFmLENBQWY7QUFDQSx3QkFBTSxJQUFJLE9BQU8sS0FBUCxFQUFWOztBQUVBLHdCQUFJLElBQUksR0FBRyxLQUFILEtBQWEsR0FBRyxLQUFILEVBQXJCLEVBQWlDO0FBQzdCLDRCQUFNLElBQUksS0FBSyxtQkFBTCxDQUF5QixNQUF6QixDQUFWO0FBQ0EsNEJBQU0sS0FBSyxLQUFLLG1CQUFMLENBQXlCLE1BQXpCLEVBQWlDLENBQUMsQ0FBbEMsQ0FBWDs7QUFFQSw0QkFBTSxTQUFTLENBQUMsT0FBTyxHQUFHLENBQVYsRUFBYSxDQUFiLENBQUQsRUFBa0IsT0FBTyxHQUFHLENBQVYsRUFBYSxDQUFiLENBQWxCLENBQWY7QUFDQSw0QkFBTSxVQUFVLENBQUMsT0FBTyxDQUFQLEVBQVUsS0FBVixFQUFELEVBQW9CLE9BQU8sQ0FBUCxFQUFVLEtBQVYsRUFBcEIsQ0FBaEI7QUFDQSxnQ0FBUSxDQUFSLEVBQVcsQ0FBWCxJQUFnQixDQUFDLENBQUMsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFYLElBQWdCLE9BQU8sQ0FBUCxFQUFVLENBQVYsQ0FBaEIsR0FBK0IsSUFBSSxHQUFHLENBQVAsR0FBVyxPQUFPLENBQVAsRUFBVSxDQUFWLENBQTNDLEtBQTRELEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBdEUsQ0FBaEI7QUFDQSxnQ0FBUSxDQUFSLEVBQVcsQ0FBWCxJQUFnQixDQUFDLENBQUMsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFYLElBQWdCLE9BQU8sQ0FBUCxFQUFVLENBQVYsQ0FBaEIsR0FBK0IsSUFBSSxHQUFHLENBQVAsR0FBVyxPQUFPLENBQVAsRUFBVSxDQUFWLENBQTNDLEtBQTRELEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBdEUsQ0FBaEI7QUFDQSwyQkFBRyxDQUFILEdBQU8sT0FBTyxRQUFRLENBQVIsQ0FBUCxFQUFtQixFQUFuQixDQUFQO0FBQ0EsMkJBQUcsQ0FBSCxHQUFPLE9BQU8sUUFBUSxDQUFSLENBQVAsRUFBbUIsRUFBbkIsQ0FBUDs7QUFFQSw0QkFBTSxXQUFXLENBQUMsQ0FBQyxDQUFELElBQU0sU0FBUCxFQUFrQixPQUFPLFNBQVAsRUFBa0IsQ0FBbEIsQ0FBbEIsQ0FBakI7QUFDQSxpQ0FBUyxDQUFULEVBQVksQ0FBWixLQUFrQixRQUFRLENBQVIsRUFBVyxDQUFYLENBQWxCO0FBQ0EsaUNBQVMsQ0FBVCxFQUFZLENBQVosS0FBa0IsUUFBUSxDQUFSLEVBQVcsQ0FBWCxDQUFsQjtBQUNBLDJCQUFHLEdBQUgsR0FBUyxHQUFHLEdBQUgsQ0FBTyxHQUFQLENBQVcsT0FBTyxTQUFTLENBQVQsQ0FBUCxFQUFvQixFQUFwQixDQUFYLENBQVQ7QUFDQSwyQkFBRyxHQUFILEdBQVMsR0FBRyxHQUFILENBQU8sR0FBUCxDQUFXLE9BQU8sU0FBUyxDQUFULENBQVAsRUFBb0IsRUFBcEIsQ0FBWCxDQUFUO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7Ozt3Q0FFZTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNaLHNDQUFrQixLQUFLLElBQXZCLG1JQUE2QjtBQUFBLHdCQUFsQixHQUFrQjs7QUFDekIsd0JBQUksa0JBQUo7QUFDSDtBQUhXO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBS1osaUJBQUssaUJBQUw7O0FBTFk7QUFBQTtBQUFBOztBQUFBO0FBT1osc0NBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUEsd0JBQWxCLEtBQWtCOztBQUN6QiwwQkFBSSxrQkFBSjtBQUNBLHlCQUFLLFdBQUwsQ0FBaUIsS0FBakI7QUFDSDtBQVZXO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFXZjs7O3FDQUVZO0FBQ1QsaUJBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsS0FBSyxNQUFMLENBQVksQ0FBckMsRUFBd0MsS0FBSyxNQUFMLENBQVksQ0FBcEQ7QUFEUztBQUFBO0FBQUE7O0FBQUE7QUFFVCxzQ0FBa0IsS0FBSyxJQUF2QixtSUFBNkI7QUFBQSx3QkFBbEIsR0FBa0I7O0FBQ3pCLHlCQUFLLFdBQUwsQ0FBaUIsR0FBakI7QUFDQSx5QkFBSyxjQUFMLENBQW9CLEdBQXBCO0FBQ0g7QUFMUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1ULGlCQUFLLFVBQUw7QUFDSDs7O29DQUVXO0FBQ1IsaUJBQUssU0FBTCxJQUFrQixDQUFsQjtBQUNBLGdCQUFNLGVBQWUsS0FBckI7QUFDQSxnQkFBTSxnQkFBZ0IsZUFBZSxLQUFLLGFBQTFDO0FBQ0EsZ0JBQUksZ0JBQWdCLENBQXBCLEVBQXVCO0FBQ25CLHdCQUFRLEdBQVIsRUFBZ0IsS0FBSyxTQUFMLEdBQWlCLGFBQWxCLEdBQW1DLENBQWxEO0FBQ0EscUJBQUssYUFBTCxHQUFxQixZQUFyQjtBQUNBLHFCQUFLLFNBQUwsR0FBaUIsQ0FBakI7QUFDSDtBQUNKOzs7Ozs7QUFHTCxPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7Ozs7Ozs7QUNqTkEsSUFBTSxXQUFXLFFBQVEsTUFBUixDQUFqQjtBQUNBLElBQU0sV0FBVyxRQUFRLGNBQVIsQ0FBakI7QUFDQSxJQUFNLFNBQVMsUUFBUSxrQkFBUixDQUFmOztlQUNrSCxRQUFRLFNBQVIsQztJQUEzRyxnQixZQUFBLGdCO0lBQWtCLE0sWUFBQSxNO0lBQVEscUIsWUFBQSxxQjtJQUF1QixxQixZQUFBLHFCO0lBQXVCLFUsWUFBQSxVO0lBQVksbUIsWUFBQSxtQjs7SUFDcEYsRyxHQUFPLEksQ0FBUCxHOztJQUdELFE7OztBQUNGLHNCQUFZLE1BQVosRUFBb0IsR0FBcEIsRUFBeUI7QUFBQTs7QUFBQSx3SEFDZixNQURlLEVBQ1AsR0FETzs7QUFFckIsY0FBSyxNQUFMLEdBQWMsSUFBSSxRQUFKLENBQWEsTUFBYixRQUFkO0FBRnFCO0FBR3hCOzs7O3NDQUdhLEMsRUFBRyxDLEVBQXdEO0FBQUEsZ0JBQXJELENBQXFELHVFQUFqRCxJQUFpRDtBQUFBLGdCQUEzQyxDQUEyQyx1RUFBdkMsSUFBdUM7QUFBQSxnQkFBakMsS0FBaUMsdUVBQXpCLElBQXlCO0FBQUEsZ0JBQW5CLFVBQW1CLHVFQUFOLElBQU07O0FBQ3JFLGdCQUFNLE1BQU0sR0FBRyxLQUFILENBQVMsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixDQUF6QixFQUE0QixDQUE1QixDQUFULENBQVo7QUFDQSxnQkFBSSxDQUFDLENBQUwsRUFBUTtBQUNKLG9CQUFJLFFBQVEsT0FBTyxZQUFQLENBQW9CLEtBQUssTUFBTCxDQUFZLFFBQWhDLENBQVo7QUFESTtBQUFBO0FBQUE7O0FBQUE7QUFFSix5Q0FBa0IsS0FBSyxJQUF2Qiw4SEFBNkI7QUFBQSw0QkFBbEIsSUFBa0I7O0FBQ3pCLGdDQUFRLElBQUksS0FBSixFQUFXLENBQUMsaUJBQWlCLEtBQUksR0FBSixHQUFVLEdBQTNCLElBQWtDLEtBQUksS0FBSixFQUFuQyxJQUFrRCxHQUE3RCxDQUFSO0FBQ0g7QUFKRztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUtKLG9CQUFJLE9BQU8sWUFBUCxDQUFvQixPQUFPLE9BQU8sWUFBUCxDQUFvQixLQUFLLE1BQUwsQ0FBWSxRQUFoQyxDQUFQLEVBQWtELEtBQWxELENBQXBCLENBQUo7QUFDSDtBQUNELGdCQUFJLENBQUMsQ0FBTCxFQUFRO0FBQ0osb0JBQUksR0FBRyxLQUFILENBQVMsb0JBQ1QsT0FBTyxLQUFLLE1BQUwsQ0FBWSxZQUFaLEdBQTJCLENBQWxDLENBRFMsRUFFVCxPQUFPLENBQUMsR0FBUixFQUFhLEdBQWIsQ0FGUyxFQUdULE9BQU8sQ0FBQyxHQUFSLEVBQWEsR0FBYixDQUhTLENBQVQsQ0FBSjtBQUlIO0FBQ0QsZ0JBQUksQ0FBQyxLQUFMLEVBQVk7QUFDUix3QkFBUSxZQUFSO0FBQ0g7QUFDRCxnQkFBTSxpQkFBZSxLQUFLLElBQUwsQ0FBVSxNQUEvQjtBQUNBLGdCQUFNLFVBQVUsTUFBTSxNQUF0QjtBQUNBLGdCQUFNLE1BQU0sSUFBSSxNQUFKLENBQVcsS0FBSyxNQUFoQixFQUF3QixDQUF4QixFQUEyQixHQUEzQixFQUFnQyxDQUFoQyxFQUFtQyxLQUFuQyxFQUEwQyxHQUExQyxFQUErQyxPQUEvQyxFQUF3RCxJQUF4RCxFQUE4RCxVQUE5RCxDQUFaO0FBQ0EsaUJBQUssSUFBTCxDQUFVLElBQVYsQ0FBZSxHQUFmO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixHQUFqQjtBQUNBLGlCQUFLLGNBQUwsQ0FBb0IsR0FBcEI7QUFDSDs7OzRDQUVtQixNLEVBQWlCO0FBQUEsZ0JBQVQsR0FBUyx1RUFBSCxDQUFHOztBQUNqQyxtQkFBTyxPQUFPLENBQVAsR0FDRCxzQkFBc0IsT0FBTyxDQUFQLENBQXRCLElBQW1DLHNCQUFzQixPQUFPLENBQVAsQ0FBdEIsQ0FEbEMsR0FFRCxzQkFBc0IsT0FBTyxDQUFQLENBQXRCLEVBQWlDLENBQUMsQ0FBbEMsSUFBdUMsc0JBQXNCLE9BQU8sQ0FBUCxDQUF0QixFQUFpQyxDQUFDLENBQWxDLENBRjdDO0FBR0g7Ozs7RUFyQ2tCLFE7O0FBd0N2QixPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7Ozs7O0lDL0NNLGM7Ozs7Ozs7Ozs7RUFBdUIsSzs7QUFHN0IsT0FBTyxPQUFQLEdBQWlCLGNBQWpCOzs7Ozs7Ozs7QUNIQSxJQUFNLFdBQVcsUUFBUSxhQUFSLENBQWpCO0FBQ0EsSUFBTSxXQUFXLFFBQVEsYUFBUixDQUFqQjs7ZUFDdUIsUUFBUSxRQUFSLEM7SUFBaEIsWSxZQUFBLFk7O0FBR1AsSUFBSSxTQUFTLElBQWI7QUFDQSxJQUFNLFNBQVM7QUFDWCxRQUFJLElBRE87QUFFWCxRQUFJLE1BRk87QUFHWCxRQUFJLE1BSE87QUFJWCxRQUFJLE9BSk87QUFLWCxRQUFJLFNBTE8sRUFLSTtBQUNmLFFBQUksVUFOTyxFQU1LO0FBQ2hCLFFBQUksV0FQTyxFQU9NO0FBQ2pCLFFBQUksYUFSTyxFQVFRO0FBQ25CLFFBQUksYUFUTyxFQVNRO0FBQ25CLFFBQUksY0FWTyxDQVVRO0FBVlIsQ0FBZjs7QUFhQSxTQUFTLFNBQVQsQ0FBbUIsT0FBbkIsRUFBNEI7QUFDeEIsV0FBTyxDQUFQLEdBQVcsUUFBUSxDQUFSLEVBQVcsS0FBWCxHQUFtQixRQUFRLEtBQVIsRUFBOUI7QUFDQSxXQUFPLENBQVAsR0FBVyxRQUFRLENBQVIsRUFBVyxNQUFYLEdBQW9CLFFBQVEsTUFBUixFQUEvQjtBQUVIOztBQUVELFNBQVMsUUFBVCxDQUFrQixLQUFsQixFQUF5QixNQUF6QixFQUFpQztBQUM3QixRQUFNLElBQUksTUFBTSxLQUFoQjtBQUNBLFFBQU0sSUFBSSxNQUFNLEtBQWhCO0FBQ0EsUUFBSSxDQUFDLE9BQU8sU0FBWixFQUF1QjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNuQixpQ0FBa0IsT0FBTyxJQUF6Qiw4SEFBK0I7QUFBQSxvQkFBcEIsR0FBb0I7O0FBQzNCLG9CQUFNLElBQUksT0FBTyxhQUFQLENBQXFCLEdBQXJCLENBQVY7QUFDQSxvQkFBTSxLQUFLLENBQUMsRUFBRSxDQUFGLElBQU8sRUFBRSxDQUFGLENBQVIsSUFBZ0IsQ0FBM0I7QUFDQSxvQkFBTSxLQUFLLENBQUMsRUFBRSxDQUFGLElBQU8sRUFBRSxDQUFGLENBQVIsSUFBZ0IsQ0FBM0I7QUFDQSxvQkFBTSxJQUFJLENBQUMsRUFBRSxDQUFGLElBQU8sRUFBRSxDQUFGLENBQVIsSUFBZ0IsQ0FBMUI7QUFDQSxvQkFBSSxhQUFhLEVBQWIsRUFBaUIsRUFBakIsRUFBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsSUFBNkIsQ0FBakMsRUFBb0M7QUFDaEMsd0JBQUksZUFBSjtBQUNBO0FBQ0g7QUFDSjtBQVZrQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVduQixlQUFPLGFBQVAsQ0FBcUIsQ0FBckIsRUFBd0IsQ0FBeEI7QUFDSDtBQUNKOztBQUVELFNBQVMsV0FBVCxDQUFxQixLQUFyQixFQUE0QixNQUE1QixFQUFvQztBQUFBLFFBQ3pCLE9BRHlCLEdBQ2QsS0FEYyxDQUN6QixPQUR5Qjs7QUFFaEMsUUFBSSxXQUFXLEVBQWYsRUFBbUI7QUFBRTtBQUNqQixlQUFPLG9CQUFQO0FBQ0EsZUFBTyxTQUFQLEdBQW1CLENBQUMsT0FBTyxTQUEzQjtBQUNBLGlCQUFTLEtBQVQsR0FBb0IsT0FBTyxLQUEzQixXQUFxQyxPQUFPLFNBQVAsR0FBbUIsWUFBbkIsR0FBa0MsUUFBdkU7QUFDSCxLQUpELE1BSU8sSUFBSSxXQUFXLE1BQVgsSUFBcUIsT0FBTyxPQUFQLEtBQW1CLE9BQU8sTUFBbkQsRUFBMkQ7QUFDOUQsZUFBTyxNQUFQLENBQWMsT0FBTyxPQUFQLENBQWQsRUFBK0IsT0FBL0I7QUFDSDtBQUNKOztJQUVLLFM7QUFDRix1QkFBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQUE7O0FBQ2hCLGlCQUFTLE9BQU8sRUFBUCxDQUFUO0FBQ0EsWUFBTSxVQUFVLEVBQUUsUUFBRixDQUFoQjtBQUNBLFlBQU0sTUFBTSxRQUFRLENBQVIsRUFBVyxVQUFYLENBQXNCLElBQXRCLENBQVo7QUFDQSxrQkFBVSxPQUFWO0FBQ0EsYUFBSyxNQUFMLEdBQWMsS0FBSyxPQUFPLFNBQVAsSUFBb0IsQ0FBcEIsR0FBd0IsUUFBeEIsR0FBbUMsUUFBeEMsRUFBa0QsTUFBbEQsRUFBMEQsR0FBMUQsQ0FBZDtBQUNBLGdCQUFRLE1BQVIsQ0FBZSxhQUFLO0FBQ2hCLHNCQUFVLE9BQVY7QUFDSCxTQUZEO0FBR0EsZ0JBQVEsS0FBUixDQUFjLGFBQUs7QUFDZixxQkFBUyxDQUFULEVBQVksTUFBSyxNQUFqQjtBQUNILFNBRkQ7QUFHQSxVQUFFLE1BQUYsRUFBVSxPQUFWLENBQWtCLGFBQUs7QUFDbkIsd0JBQVksQ0FBWixFQUFlLE1BQUssTUFBcEI7QUFDSCxTQUZEO0FBR0g7Ozs7a0NBRVM7QUFDTixpQkFBSyxNQUFMLENBQVksT0FBWjtBQUNIOzs7Ozs7QUFHTCxPQUFPLE9BQVAsR0FBaUIsU0FBakI7Ozs7Ozs7OztBQzdFQSxJQUFNLGFBQWEsUUFBUSx3QkFBUixDQUFuQjtBQUNBLElBQU0sYUFBYSxRQUFRLHVCQUFSLENBQW5COztlQUNzRixRQUFRLFNBQVIsQztJQUEvRSxnQixZQUFBLGdCO0lBQWtCLE8sWUFBQSxPO0lBQVMsTyxZQUFBLE87SUFBUyxlLFlBQUEsZTtJQUFpQixjLFlBQUEsYztJQUFnQixNLFlBQUEsTTs7SUFDckUsRyxHQUFZLEksQ0FBWixHO0lBQUssRyxHQUFPLEksQ0FBUCxHOztJQUdOLE07QUFDRjs7Ozs7QUFLQSxvQkFBWSxNQUFaLEVBQW9CLENBQXBCLEVBQXVCLEdBQXZCLEVBQTRCLENBQTVCLEVBQStCLEtBQS9CLEVBQXNDLEdBQXRDLEVBQTJDLE9BQTNDLEVBQW9ELE1BQXBELEVBQTRELFVBQTVELEVBQXdFO0FBQUE7O0FBQ3BFLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLGFBQUssUUFBTCxHQUFnQixJQUFJLEtBQUosRUFBaEI7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLGFBQUssR0FBTCxHQUFXLEdBQVg7QUFDQSxhQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0EsYUFBSyxNQUFMLEdBQWMsTUFBZDs7QUFFQSxhQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDQSxZQUFJLFVBQUosRUFBZ0I7QUFDWixpQkFBSyxlQUFMO0FBQ0g7QUFDSjs7OztnQ0FFTztBQUNKLG1CQUFPLE9BQU8sWUFBUCxDQUFvQixLQUFLLENBQXpCLENBQVA7QUFDSDs7OzZDQUVvQjtBQUNqQixnQkFBSSxJQUFJLEdBQUcsS0FBSCxDQUFTLEtBQUssTUFBTCxDQUFZLFNBQXJCLENBQVI7QUFEaUI7QUFBQTtBQUFBOztBQUFBO0FBRWpCLHFDQUFrQixLQUFLLE1BQUwsQ0FBWSxJQUE5Qiw4SEFBb0M7QUFBQSx3QkFBekIsR0FBeUI7O0FBQ2hDLHdCQUFJLE9BQU8sSUFBWCxFQUFpQjtBQUNqQix3QkFBTSxTQUFTLEtBQUssR0FBTCxDQUFTLFFBQVQsQ0FBa0IsSUFBSSxHQUF0QixDQUFmO0FBQ0Esd0JBQU0sWUFBWSxpQkFBaUIsTUFBakIsQ0FBbEI7QUFDQSx3QkFBTSxjQUFjLE9BQU8sTUFBUCxDQUFjLFNBQWQsQ0FBcEI7QUFDQSx3QkFBSSxFQUFFLEdBQUYsQ0FBTSxZQUFZLFFBQVosQ0FBcUIsSUFBSSxDQUFKLEdBQVEsT0FBTyxTQUFQLENBQTdCLENBQU4sQ0FBSjtBQUNIO0FBUmdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBU2pCLGdCQUFJLEVBQUUsUUFBRixDQUFXLENBQUMsS0FBSyxNQUFMLENBQVksQ0FBYixHQUFpQixLQUFLLENBQWpDLENBQUo7QUFDQSxnQkFBTSxJQUFJLEVBQUUsTUFBRixDQUFTLEtBQUssQ0FBZCxDQUFWO0FBQ0EsaUJBQUssQ0FBTCxHQUFTLEtBQUssQ0FBTCxDQUFPLEdBQVAsQ0FBVyxDQUFYLENBQVQ7QUFDSDs7OzZDQUVvQjtBQUNqQixpQkFBSyxHQUFMLEdBQVcsS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhLEtBQUssQ0FBbEIsQ0FBWDtBQUNIOzs7a0NBRVMsQyxFQUFHO0FBQ1QsZ0JBQU0sSUFBSSxLQUFLLFlBQUwsQ0FBa0IsR0FBbEIsRUFBVjtBQUNBLGlCQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0g7OztvQ0FFVyxDLEVBQUc7QUFDWCxnQkFBTSxJQUFJLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBVjtBQUNBLGdCQUFNLElBQUksS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUFWO0FBQ0EsaUJBQUssR0FBTCxHQUFXLEdBQUcsS0FBSCxDQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUFYO0FBQ0g7OztrQ0FFUyxDLEVBQUc7QUFDVCxnQkFBTSxNQUFNLFFBQVEsS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUFSLENBQVo7QUFDQSxnQkFBTSxNQUFNLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBWjtBQUNBLGlCQUFLLENBQUwsR0FBUyxHQUFHLEtBQUgsQ0FBUyxnQkFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsQ0FBVCxDQUFUO0FBQ0g7OzswQ0FFaUI7QUFDZCxnQkFBSTtBQUNBLHFCQUFLLFVBQUwsQ0FBZ0IsRUFBaEIsQ0FBbUIsSUFBbkI7QUFDSCxhQUZELENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDUixvQkFBTSxTQUFTLEdBQWY7O0FBRUEsb0JBQUksWUFBWSxJQUFJLElBQUksS0FBSyxNQUFMLENBQVksQ0FBaEIsRUFBbUIsS0FBSyxNQUFMLENBQVksQ0FBL0IsSUFBb0MsQ0FBeEMsRUFBMkMsSUFBSSxLQUFKLENBQVUsSUFBVixFQUFnQixLQUFLLEdBQUwsQ0FBUyxNQUFULEdBQWtCLEdBQWxCLENBQXNCLEtBQUssR0FBM0IsQ0FBaEIsSUFBbUQsTUFBOUYsQ0FBaEI7QUFIUTtBQUFBO0FBQUE7O0FBQUE7QUFJUiwwQ0FBa0IsS0FBSyxNQUFMLENBQVksSUFBOUIsbUlBQW9DO0FBQUEsNEJBQXpCLEdBQXlCOztBQUNoQyxvQ0FBWSxJQUFJLFNBQUosRUFBZSxJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLElBQUksR0FBSixDQUFRLE1BQVIsR0FBaUIsR0FBakIsQ0FBcUIsS0FBSyxHQUExQixDQUFoQixJQUFrRCxNQUFqRSxDQUFaO0FBQ0g7QUFOTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVFSLG9CQUFNLElBQUksS0FBSyxDQUFmOztBQUVBLG9CQUFNLElBQUksZUFBZSxLQUFLLENBQXBCLENBQVY7QUFDQSxvQkFBSSxVQUFVLElBQUksS0FBSyxNQUFMLENBQVksWUFBaEIsRUFBOEIsaUJBQWlCLEtBQUssQ0FBdEIsSUFBMkIsTUFBekQsQ0FBZDtBQVhRO0FBQUE7QUFBQTs7QUFBQTtBQVlSLDBDQUFrQixLQUFLLE1BQUwsQ0FBWSxJQUE5QixtSUFBb0M7QUFBQSw0QkFBekIsSUFBeUI7O0FBQ2hDLGtDQUFVLElBQUksT0FBSixFQUFhLGlCQUFpQixLQUFJLENBQXJCLElBQTBCLE1BQXZDLENBQVY7QUFDSDtBQWRPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBZ0JSLHFCQUFLLGlCQUFMLENBQXVCLFNBQXZCLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLE9BQXhDO0FBQ0EscUJBQUssVUFBTCxHQUFrQixJQUFJLFVBQUosQ0FBZSxLQUFLLEdBQXBCLEVBQXlCLEtBQUssZUFBTCxFQUF6QixDQUFsQjtBQUNBLHFCQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLElBQXpCLENBQThCLEtBQUssVUFBbkM7QUFDSDtBQUNKOzs7MENBRWlCLFMsRUFBVyxDLEVBQUcsQyxFQUFHLE8sRUFBUztBQUN4QyxpQkFBSyxZQUFMLEdBQW9CLElBQUksVUFBSixDQUFlLFFBQWYsRUFBeUIsS0FBSyxNQUFMLENBQVksUUFBckMsRUFBK0MsS0FBSyxNQUFMLENBQVksUUFBM0QsRUFBcUUsQ0FBckUsRUFBd0UsS0FBSyxTQUE3RSxDQUFwQjtBQUNBLGlCQUFLLGdCQUFMLEdBQXdCLElBQUksVUFBSixDQUFlLFlBQWYsRUFBNkIsQ0FBQyxTQUE5QixFQUF5QyxTQUF6QyxFQUFvRCxLQUFLLEdBQUwsQ0FBUyxDQUFULENBQXBELEVBQWlFLEtBQUssV0FBdEUsQ0FBeEI7QUFDQSxpQkFBSyxnQkFBTCxHQUF3QixJQUFJLFVBQUosQ0FBZSxZQUFmLEVBQTZCLENBQUMsU0FBOUIsRUFBeUMsU0FBekMsRUFBb0QsS0FBSyxHQUFMLENBQVMsQ0FBVCxDQUFwRCxFQUFpRSxLQUFLLFdBQXRFLENBQXhCO0FBQ0EsaUJBQUssZ0JBQUwsR0FBd0IsSUFBSSxVQUFKLENBQWUsWUFBZixFQUE2QixDQUE3QixFQUFnQyxPQUFoQyxFQUF5QyxFQUFFLENBQUYsQ0FBekMsRUFBK0MsS0FBSyxTQUFwRCxDQUF4QjtBQUNBLGlCQUFLLGdCQUFMLEdBQXdCLElBQUksVUFBSixDQUFlLFlBQWYsRUFBNkIsQ0FBQyxHQUE5QixFQUFtQyxHQUFuQyxFQUF3QyxRQUFRLEVBQUUsQ0FBRixDQUFSLENBQXhDLEVBQXVELEtBQUssU0FBNUQsQ0FBeEI7QUFDSDs7OzBDQUVpQjtBQUNkLG1CQUFPLENBQ0gsS0FBSyxZQURGLEVBRUgsS0FBSyxnQkFGRixFQUdILEtBQUssZ0JBSEYsRUFJSCxLQUFLLGdCQUpGLEVBS0gsS0FBSyxnQkFMRixDQUFQO0FBT0g7OzttQ0FVVTtBQUNQLG1CQUFPLEtBQUssU0FBTCxDQUFlLEVBQUMsT0FBTyxLQUFLLEdBQWIsRUFBa0IsS0FBSyxLQUFLLENBQTVCLEVBQStCLE9BQU8sS0FBSyxHQUEzQyxFQUFmLENBQVA7QUFDSDs7O3FDQVZtQixDLEVBQUc7QUFDbkIsbUJBQU8sSUFBSSxDQUFKLEVBQU8sSUFBSSxDQUFYLENBQVA7QUFDSDs7O3FDQUVtQixDLEVBQUc7QUFDbkIsbUJBQU8sT0FBTyxDQUFQLENBQVA7QUFDSDs7Ozs7O0FBT0wsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7Ozs7Ozs7Ozs7Ozs7QUM1SEEsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTSxhQUFhLFFBQVEsdUJBQVIsQ0FBbkI7O2VBQ2dELFFBQVEsU0FBUixDO0lBQXpDLE8sWUFBQSxPO0lBQVMsTyxZQUFBLE87SUFBUyxtQixZQUFBLG1COztnQkFDVixRQUFRLFNBQVIsQztJQUFSLEksYUFBQSxJOztJQUNBLEcsR0FBTyxJLENBQVAsRzs7SUFHRCxNOzs7Ozs7Ozs7Ozs7QUFDRjs7Ozs7Z0NBS1E7QUFDSixtQkFBTyxPQUFPLFlBQVAsQ0FBb0IsS0FBSyxDQUF6QixDQUFQO0FBQ0g7OztvQ0FFVyxDLEVBQUc7QUFDWCxnQkFBTSxJQUFJLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBVjtBQUNBLGdCQUFNLElBQUksS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUFWO0FBQ0EsZ0JBQU0sSUFBSSxLQUFLLGdCQUFMLENBQXNCLEdBQXRCLEVBQVY7QUFDQSxpQkFBSyxHQUFMLEdBQVcsR0FBRyxLQUFILENBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBVCxDQUFYO0FBQ0g7OztrQ0FFUyxDLEVBQUc7QUFDVCxnQkFBTSxNQUFNLFFBQVEsS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUFSLENBQVo7QUFDQSxnQkFBTSxRQUFRLFFBQVEsS0FBSyxrQkFBTCxDQUF3QixHQUF4QixFQUFSLENBQWQ7QUFDQSxnQkFBTSxNQUFNLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBWjtBQUNBLGlCQUFLLENBQUwsR0FBUyxHQUFHLEtBQUgsQ0FBUyxvQkFBb0IsR0FBcEIsRUFBeUIsR0FBekIsRUFBOEIsS0FBOUIsQ0FBVCxDQUFUO0FBQ0g7OzswQ0FFaUIsUyxFQUFXLEMsRUFBRyxDLEVBQUcsTyxFQUFTO0FBQ3hDLDhIQUF3QixTQUF4QixFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxFQUF5QyxPQUF6QztBQUNBLGlCQUFLLGdCQUFMLEdBQXdCLElBQUksVUFBSixDQUFlLFlBQWYsRUFBNkIsQ0FBQyxTQUE5QixFQUF5QyxTQUF6QyxFQUFvRCxLQUFLLEdBQUwsQ0FBUyxDQUFULENBQXBELEVBQWlFLEtBQUssV0FBdEUsQ0FBeEI7QUFDQSxpQkFBSyxrQkFBTCxHQUEwQixJQUFJLFVBQUosQ0FBZSxZQUFmLEVBQTZCLENBQUMsR0FBOUIsRUFBbUMsR0FBbkMsRUFBd0MsUUFBUSxFQUFFLENBQUYsQ0FBUixDQUF4QyxFQUF1RCxLQUFLLFNBQTVELENBQTFCO0FBQ0g7OzswQ0FFaUI7QUFDZCxtQkFBTyxDQUNILEtBQUssWUFERixFQUVILEtBQUssZ0JBRkYsRUFHSCxLQUFLLGdCQUhGLEVBSUgsS0FBSyxnQkFKRixFQUtILEtBQUssZ0JBTEYsRUFNSCxLQUFLLGdCQU5GLEVBT0gsS0FBSyxrQkFQRixDQUFQO0FBU0g7OztxQ0FFbUIsQyxFQUFHO0FBQ25CLG1CQUFPLElBQUksQ0FBSixFQUFPLElBQUksQ0FBWCxDQUFQO0FBQ0g7OztxQ0FFbUIsQyxFQUFHO0FBQ25CLG1CQUFPLEtBQUssQ0FBTCxDQUFQO0FBQ0g7Ozs7RUFoRGdCLE07O0FBbURyQixPQUFPLE9BQVAsR0FBaUIsTUFBakI7Ozs7O0FDMURBLElBQU0sT0FBTztBQUNULFlBQVEsZ0JBQUMsQ0FBRCxFQUFPO0FBQ1gsZUFBTyxJQUFJLENBQVg7QUFDSCxLQUhROztBQUtULFVBQU0sY0FBQyxDQUFELEVBQU87QUFDVCxlQUFPLElBQUksQ0FBSixHQUFRLENBQWY7QUFDSCxLQVBROztBQVNULHFCQUFpQix5QkFBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQzNCLGVBQU8sQ0FDSCxNQUFNLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FESCxFQUVILE1BQU0sS0FBSyxHQUFMLENBQVMsR0FBVCxDQUZILENBQVA7QUFJSCxLQWRROztBQWdCVCxxQkFBaUIseUJBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUN2QixlQUFPLENBQ0gsS0FBSyxJQUFMLENBQVUsS0FBSyxNQUFMLENBQVksQ0FBWixJQUFpQixLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQTNCLENBREcsRUFFSCxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsQ0FBZCxDQUZHLENBQVA7QUFJSCxLQXJCUTs7QUF1QlQseUJBQXFCLDZCQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsS0FBWCxFQUFxQjtBQUN0QyxlQUFPLENBQ0gsTUFBTSxLQUFLLEdBQUwsQ0FBUyxLQUFULENBQU4sR0FBd0IsS0FBSyxHQUFMLENBQVMsR0FBVCxDQURyQixFQUVILE1BQU0sS0FBSyxHQUFMLENBQVMsS0FBVCxDQUFOLEdBQXdCLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FGckIsRUFHSCxNQUFNLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FISCxDQUFQO0FBS0gsS0E3QlE7O0FBK0JULHlCQUFxQiw2QkFBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBYTtBQUM5QixZQUFNLE1BQU0sS0FBSyxJQUFMLENBQVUsS0FBSyxNQUFMLENBQVksQ0FBWixJQUFpQixLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQWpCLEdBQWtDLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBNUMsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxHQURHLEVBRUgsS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FGRyxFQUdILE9BQU8sQ0FBUCxHQUFXLEtBQUssSUFBTCxDQUFVLElBQUksR0FBZCxDQUFYLEdBQWdDLENBSDdCLENBQVA7QUFLSCxLQXRDUTs7QUF3Q1Qsb0JBQWdCLHdCQUFDLE1BQUQsRUFBWTtBQUN4QixlQUFPLE9BQU8sSUFBUCxJQUFlLENBQWYsR0FDRCxLQUFLLGVBQUwsQ0FBcUIsT0FBTyxHQUFQLENBQVcsQ0FBWCxDQUFyQixFQUFvQyxPQUFPLEdBQVAsQ0FBVyxDQUFYLENBQXBDLENBREMsR0FFRCxLQUFLLG1CQUFMLENBQXlCLE9BQU8sR0FBUCxDQUFXLENBQVgsQ0FBekIsRUFBd0MsT0FBTyxHQUFQLENBQVcsQ0FBWCxDQUF4QyxFQUF1RCxPQUFPLEdBQVAsQ0FBVyxDQUFYLENBQXZELENBRk47QUFHSCxLQTVDUTs7QUE4Q1QsYUFBUyxpQkFBQyxHQUFELEVBQVM7QUFDZCxlQUFPLE1BQU0sS0FBSyxFQUFYLEdBQWdCLEdBQXZCO0FBQ0gsS0FoRFE7O0FBa0RULGFBQVMsaUJBQUMsR0FBRCxFQUFTO0FBQ2QsZUFBTyxNQUFNLEdBQU4sR0FBWSxLQUFLLEVBQXhCO0FBQ0gsS0FwRFE7O0FBc0RULGtCQUFjLHNCQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsRUFBb0I7QUFDOUIsZUFBTyxLQUFLLElBQUwsQ0FBVSxLQUFLLE1BQUwsQ0FBWSxLQUFLLEVBQWpCLElBQXVCLEtBQUssTUFBTCxDQUFZLEtBQUssRUFBakIsQ0FBakMsQ0FBUDtBQUNILEtBeERROztBQTBEVCxzQkFBa0IsMEJBQUMsTUFBRCxFQUFZO0FBQzFCLGVBQU8sT0FBTyxHQUFQLENBQVcsQ0FBWCxFQUFjLE1BQWQsR0FBdUIsTUFBdkIsQ0FBOEIsVUFBQyxDQUFELEVBQUksQ0FBSjtBQUFBLG1CQUFVLElBQUksQ0FBZDtBQUFBLFNBQTlCLEVBQStDLENBQS9DLENBQVA7QUFDSCxLQTVEUTs7QUE4RFQsU0FBSyxlQUFNO0FBQ1AsZUFBTyxHQUFHLEtBQUgsQ0FBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBUDtBQUNILEtBaEVROztBQWtFVCxZQUFRLGdCQUFDLE1BQUQsRUFBUyxNQUFULEVBQW9CO0FBQ3hCLGVBQU8sT0FBTyxHQUFQLENBQVcsTUFBWCxDQUFQO0FBQ0gsS0FwRVE7O0FBc0VULFNBQUssZUFBTTtBQUNQLGVBQU8sSUFBSSxJQUFKLEdBQVcsT0FBWCxLQUF1QixJQUE5QjtBQUNILEtBeEVROztBQTBFVCxZQUFRLGdCQUFDLEdBQUQsRUFBcUI7QUFBQSxZQUFmLEdBQWUsdUVBQVQsSUFBUzs7QUFDekIsWUFBSSxPQUFPLElBQVgsRUFBaUI7QUFDYixrQkFBTSxHQUFOO0FBQ0Esa0JBQU0sQ0FBTjtBQUNIO0FBQ0QsZUFBTyxLQUFLLE1BQUwsTUFBaUIsTUFBTSxHQUF2QixJQUE4QixHQUFyQztBQUNILEtBaEZROztBQWtGVCxnQkFBWSxzQkFBTTtBQUNkLGVBQU8sTUFBTSxLQUFLLEtBQUwsQ0FBVyxLQUFLLE1BQUwsS0FBZ0IsUUFBM0IsRUFBcUMsUUFBckMsQ0FBOEMsRUFBOUMsQ0FBYjtBQUNILEtBcEZROztBQXNGVCx5QkFBcUIsNkJBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNqQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLEdBQUcsS0FBSCxDQUFTLENBQ1osQ0FBQyxHQUFELEVBQU0sQ0FBQyxHQUFQLENBRFksRUFFWixDQUFDLEdBQUQsRUFBTSxHQUFOLENBRlksQ0FBVCxDQUFQO0FBSUgsS0E3RlE7O0FBK0ZULDJCQUF1QiwrQkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ25DLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sR0FBRyxLQUFILENBQVMsQ0FDWixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQURZLEVBRVosQ0FBQyxDQUFELEVBQUksR0FBSixFQUFTLENBQUMsR0FBVixDQUZZLEVBR1osQ0FBQyxDQUFELEVBQUksR0FBSixFQUFTLEdBQVQsQ0FIWSxDQUFULENBQVA7QUFLSCxLQXZHUTs7QUF5R1QsMkJBQXVCLCtCQUFDLENBQUQsRUFBZ0I7QUFBQSxZQUFaLEdBQVksdUVBQU4sQ0FBTTs7QUFDbkMsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsWUFBTSxNQUFNLEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsZUFBTyxHQUFHLEtBQUgsQ0FBUyxDQUNaLENBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxDQUFDLEdBQVYsQ0FEWSxFQUVaLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRlksRUFHWixDQUFDLEdBQUQsRUFBTSxDQUFOLEVBQVMsR0FBVCxDQUhZLENBQVQsQ0FBUDtBQUtILEtBakhROztBQW1IVCwyQkFBdUIsK0JBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNuQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLEdBQUcsS0FBSCxDQUFTLENBQ1osQ0FBQyxHQUFELEVBQU0sQ0FBQyxHQUFQLEVBQVksQ0FBWixDQURZLEVBRVosQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0FGWSxFQUdaLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSFksQ0FBVCxDQUFQO0FBS0g7QUEzSFEsQ0FBYjs7QUE4SEEsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IHByZXNldCA9IHJlcXVpcmUoJy4vcHJlc2V0Jyk7XG5jb25zdCBTaW11bGF0b3IgPSByZXF1aXJlKCcuL3NpbXVsYXRvcicpO1xuXG5jb25zdCBzaW11bGF0b3IgPSBuZXcgU2ltdWxhdG9yKHByZXNldCk7XG5zaW11bGF0b3IuYW5pbWF0ZSgpOyIsImNvbnN0IHtleHRlbmR9ID0gJDtcblxuXG5mdW5jdGlvbiBFTVBUWV8yRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBjLCB7XG4gICAgICAgICdUSVRMRSc6ICdHcmF2aXR5IFNpbXVsYXRvcicsXG4gICAgICAgICdCQUNLR1JPVU5EJzogXCJ3aGl0ZVwiLFxuICAgICAgICAnRElNRU5TSU9OJzogMixcbiAgICAgICAgJ01BWF9QQVRIUyc6IDEwMDAsXG4gICAgICAgICdDQU1FUkFfQ09PUkRfU1RFUCc6IDUsXG4gICAgICAgICdDQU1FUkFfQU5HTEVfU1RFUCc6IDEsXG4gICAgICAgICdDQU1FUkFfQUNDRUxFUkFUSU9OJzogMS4xLFxuICAgICAgICAnRyc6IDAuMSxcbiAgICAgICAgJ01BU1NfTUlOJzogMSxcbiAgICAgICAgJ01BU1NfTUFYJzogNGU0LFxuICAgICAgICAnVkVMT0NJVFlfTUFYJzogMTBcbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBFTVBUWV8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8yRChjKSwge1xuICAgICAgICAnRElNRU5TSU9OJzogMyxcbiAgICAgICAgJ0cnOiAwLjAwMSxcbiAgICAgICAgJ01BU1NfTUlOJzogMSxcbiAgICAgICAgJ01BU1NfTUFYJzogOGU2LFxuICAgICAgICAnVkVMT0NJVFlfTUFYJzogMTBcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFTVBUWV8yRDtcbiIsImNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBub3csIGdldF9yb3RhdGlvbl9tYXRyaXh9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5jbGFzcyBDYW1lcmEyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBlbmdpbmUpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMueiA9IDEwMDtcbiAgICAgICAgdGhpcy5waGkgPSAwO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5sYXN0X3RpbWUgPSAwO1xuICAgICAgICB0aGlzLmxhc3Rfa2V5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIHRoaXMuY2VudGVyID0gbmouYXJyYXkoW2NvbmZpZy5XIC8gMiwgY29uZmlnLkggLyAyXSk7XG4gICAgfVxuXG4gICAgZ2V0X2Nvb3JkX3N0ZXAoa2V5KSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfdGltZSA9IG5vdygpO1xuICAgICAgICBpZiAoa2V5ID09IHRoaXMubGFzdF9rZXkgJiYgY3VycmVudF90aW1lIC0gdGhpcy5sYXN0X3RpbWUgPCAxKSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RfdGltZSA9IGN1cnJlbnRfdGltZTtcbiAgICAgICAgdGhpcy5sYXN0X2tleSA9IGtleTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLkNBTUVSQV9DT09SRF9TVEVQICogcG93KHRoaXMuY29uZmlnLkNBTUVSQV9BQ0NFTEVSQVRJT04sIHRoaXMuY29tYm8pO1xuICAgIH1cblxuICAgIHVwKGtleSkge1xuICAgICAgICB0aGlzLnkgLT0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBkb3duKGtleSkge1xuICAgICAgICB0aGlzLnkgKz0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBsZWZ0KGtleSkge1xuICAgICAgICB0aGlzLnggLT0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByaWdodChrZXkpIHtcbiAgICAgICAgdGhpcy54ICs9IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgem9vbV9pbihrZXkpIHtcbiAgICAgICAgdGhpcy56IC09IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgem9vbV9vdXQoa2V5KSB7XG4gICAgICAgIHRoaXMueiArPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZV9sZWZ0KGtleSkge1xuICAgICAgICB0aGlzLnBoaSAtPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlX3JpZ2h0KGtleSkge1xuICAgICAgICB0aGlzLnBoaSArPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICB9XG5cbiAgICBnZXRfem9vbSh6ID0gMCwgYWxsb3dfaW52aXNpYmxlID0gZmFsc2UpIHtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy56IC0gejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDw9IDApIHtcbiAgICAgICAgICAgIGlmICghYWxsb3dfaW52aXNpYmxlKSB0aHJvdyBJbnZpc2libGVFcnJvcjtcbiAgICAgICAgICAgIGRpc3RhbmNlID0gSW5maW5pdHk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDEwMCAvIGRpc3RhbmNlO1xuICAgIH1cblxuICAgIGFkanVzdF9jb29yZChjb29yZCwgYWxsb3dfaW52aXNpYmxlID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgUiA9IGdldF9yb3RhdGlvbl9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5jZW50ZXIgKyAocm90YXRlKGNvb3JkLCBSKSAtIFt0aGlzLngsIHRoaXMueV0pICogem9vbTtcbiAgICB9XG5cbiAgICBhZGp1c3RfcmFkaXVzKGNvb3JkLCByYWRpdXMpIHtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oKTtcbiAgICAgICAgcmV0dXJuIHJhZGl1cyAqIHpvb207XG4gICAgfVxuXG4gICAgYWN0dWFsX3BvaW50KHgsIHkpIHtcbiAgICAgICAgY29uc3QgUl8gPSBnZXRfcm90YXRpb25fbWF0cml4KGRlZzJyYWQodGhpcy5waGkpLCAtMSk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKCk7XG4gICAgICAgIHJldHVybiByb3RhdGUoKG5qLmFycmF5KFt4LCB5XSkuc3VidHJhY3QodGhpcy5jZW50ZXIpKS5kaXZpZGUoem9vbSkuYWRkKFt0aGlzLngsIHRoaXMueV0pLCBSXyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTJEOyIsImNvbnN0IENhbWVyYTJEID0gcmVxdWlyZSgnLi8yZCcpO1xuY29uc3Qge2RlZzJyYWQsIHJvdGF0ZSwgZ2V0X3JvdGF0aW9uX3hfbWF0cml4LCBnZXRfcm90YXRpb25feV9tYXRyaXh9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5cbmNsYXNzIENhbWVyYTNEIGV4dGVuZHMgQ2FtZXJhMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgZW5naW5lKSB7XG4gICAgICAgIHN1cGVyKGNvbmZpZywgZW5naW5lKTtcbiAgICAgICAgdGhpcy50aGV0YSA9IDA7XG4gICAgfVxuXG4gICAgcm90YXRlX3VwKGtleSkge1xuICAgICAgICB0aGlzLnRoZXRhIC09IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVfZG93bihrZXkpIHtcbiAgICAgICAgdGhpcy50aGV0YSArPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgYWRqdXN0X2Nvb3JkKGNvb3JkLCBhbGxvd19pbnZpc2libGUgPSBGYWxzZSkge1xuICAgICAgICBjb25zdCBSeCA9IGdldF9yb3RhdGlvbl94X21hdHJpeChkZWcycmFkKHRoaXMudGhldGEpKTtcbiAgICAgICAgY29uc3QgUnkgPSBnZXRfcm90YXRpb25feV9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICBjb25zdCBjID0gcm90YXRlKHJvdGF0ZShjb29yZCwgUngpLCBSeSk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKGMucG9wKCksIGFsbG93X2ludmlzaWJsZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNlbnRlciArIChjIC0gW3RoaXMueCwgdGhpcy55XSkgKiB6b29tO1xuICAgIH1cblxuICAgIGFkanVzdF9yYWRpdXMoY29vcmQsIHJhZGl1cykge1xuICAgICAgICBjb25zdCBSeCA9IGdldF9yb3RhdGlvbl94X21hdHJpeChkZWcycmFkKHRoaXMudGhldGEpKTtcbiAgICAgICAgY29uc3QgUnkgPSBnZXRfcm90YXRpb25feV9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICBjb25zdCBjID0gcm90YXRlKHJvdGF0ZShjb29yZCwgUngpLCBSeSk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKGMucG9wKCkpO1xuICAgICAgICByZXR1cm4gcmFkaXVzICogem9vbTtcbiAgICB9XG5cbiAgICBhY3R1YWxfcG9pbnQoeCwgeSkge1xuICAgICAgICBjb25zdCBSeF8gPSBnZXRfcm90YXRpb25feF9tYXRyaXgoZGVnMnJhZCh0aGlzLnRoZXRhKSwgLTEpO1xuICAgICAgICBjb25zdCBSeV8gPSBnZXRfcm90YXRpb25feV9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSksIC0xKTtcbiAgICAgICAgY29uc3QgYyA9ICgoW3gsIHldIC0gdGhpcy5jZW50ZXIpICsgW3RoaXMueCwgdGhpcy55XSkuY29uY2F0KDApO1xuICAgICAgICByZXR1cm4gcm90YXRlKHJvdGF0ZShjLCBSeV8pLCBSeF8pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmEzRDsiLCJjbGFzcyBDb250cm9sQm94IHtcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZSwgY29udHJvbGxlcnMpIHtcbiAgICAgICAgY29uc3QgJGNvbnRyb2xCb3ggPSAkKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5jbG9uZSgpO1xuICAgICAgICAkY29udHJvbEJveC5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnRpdGxlJykudGV4dCh0aXRsZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dENvbnRhaW5lciA9ICRjb250cm9sQm94LmZpbmQoJy5pbnB1dC1jb250YWluZXInKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sbGVyIG9mIGNvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgICAkaW5wdXRDb250YWluZXIuYXBwZW5kKGNvbnRyb2xsZXIuJGlucHV0V3JhcHBlcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiRjb250cm9sQm94ID0gJGNvbnRyb2xCb3g7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kY29udHJvbEJveC5yZW1vdmUoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbEJveDsiLCJjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBtaW4sIG1heCwgdmFsdWUsIGZ1bmMpIHtcbiAgICAgICAgY29uc3QgJGlucHV0V3JhcHBlciA9ICQoJy5pbnB1dC13cmFwcGVyLnRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5maW5kKCdzcGFuJykudGV4dChuYW1lKTtcbiAgICAgICAgY29uc3QgJGlucHV0ID0gJGlucHV0V3JhcHBlci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAkaW5wdXQuYXR0cignbWluJywgbWluKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21heCcsIG1heCk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd2YWx1ZScsIHZhbHVlKTtcbiAgICAgICAgJGlucHV0LmNoYW5nZShmdW5jKTtcblxuICAgICAgICB0aGlzLiRpbnB1dFdyYXBwZXIgPSAkaW5wdXRXcmFwcGVyO1xuICAgICAgICB0aGlzLiRpbnB1dCA9ICRpbnB1dDtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRpbnB1dC52YWwoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuLi9vYmplY3QvY2lyY2xlJyk7XG5jb25zdCBDYW1lcmEyRCA9IHJlcXVpcmUoJy4uL2NhbWVyYS8yZCcpO1xuY29uc3QgSW52aXNpYmxlRXJyb3IgPSByZXF1aXJlKCcuLi9lcnJvci9pbnZpc2libGUnKTtcbmNvbnN0IHt2ZWN0b3JfbWFnbml0dWRlLCByb3RhdGUsIG5vdywgcmFuZG9tLCBwb2xhcjJjYXJ0ZXNpYW4sIHJhbmRfY29sb3IsIGdldF9yb3RhdGlvbl9tYXRyaXgsIGNhcnRlc2lhbjJhdXRvfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHttaW59ID0gTWF0aDtcblxuXG5jbGFzcyBQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihvYmopIHtcbiAgICAgICAgdGhpcy5wcmV2X3BvcyA9IG9iai5wcmV2X3Bvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnBvcyA9IG9iai5wb3Muc2xpY2UoKTtcbiAgICB9XG59XG5cbmNsYXNzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGN0eCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMub2JqcyA9IFtdO1xuICAgICAgICB0aGlzLmFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbnRyb2xib3hlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhdGhzID0gW107XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYTJEKGNvbmZpZywgdGhpcyk7XG4gICAgICAgIHRoaXMuZnBzX2xhc3RfdGltZSA9IG5vdygpO1xuICAgICAgICB0aGlzLmZwc19jb3VudCA9IDA7XG4gICAgfVxuXG4gICAgZGVzdHJveV9jb250cm9sYm94ZXMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbGJveCBvZiB0aGlzLmNvbnRyb2xib3hlcykge1xuICAgICAgICAgICAgY29udHJvbGJveC5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250cm9sYm94ZXMgPSBbXVxuICAgIH1cblxuICAgIGFuaW1hdGUoKSB7XG4gICAgICAgIHRoaXMucHJpbnRfZnBzKCk7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGluZykge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVfYWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWRyYXdfYWxsKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCk7XG4gICAgICAgIH0sIDEwKTtcbiAgICB9XG5cbiAgICBvYmplY3RfY29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCByID0gdGhpcy5jYW1lcmEuYWRqdXN0X3JhZGl1cyhvYmoucG9zLCBvYmouZ2V0X3IoKSk7XG4gICAgICAgIGNvbnN0IFt4LCB5XSA9IHRoaXMuY2FtZXJhLmFkanVzdF9jb29yZChvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIFt4LCB5LCByXTtcbiAgICB9XG5cbiAgICBkaXJlY3Rpb25fY29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCBbY3gsIGN5XSA9IHRoaXMuY2FtZXJhLmFkanVzdF9jb29yZChvYmoucG9zKTtcbiAgICAgICAgY29uc3QgW2R4LCBkeV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnBvcyArIG9iai52ICogNTAsIHRydWUpO1xuICAgICAgICByZXR1cm4gW2N4LCBjeSwgZHgsIGR5XTtcbiAgICB9XG5cbiAgICBwYXRoX2Nvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3QgW2Z4LCBmeV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnByZXZfcG9zKTtcbiAgICAgICAgY29uc3QgW3R4LCB0eV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnBvcyk7XG4gICAgICAgIHJldHVybiBbZngsIGZ5LCB0eCwgdHldO1xuICAgIH1cblxuICAgIGRyYXdfb2JqZWN0KG9iaikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYyA9IHRoaXMub2JqZWN0X2Nvb3JkcyhvYmopO1xuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMoY1swXSwgY1sxXSwgY1syXSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IG9iai5jb2xvcjtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3X2RpcmVjdGlvbihvYmopIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSB0aGlzLm9iamVjdF9jb29yZHMob2JqKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGNbMF0sIGNbMV0pO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3X3BhdGhzKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wYXRocykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gdGhpcy5wYXRoX2Nvb3JkcyhwYXRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oY1swXSwgY1sxXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJyNkZGRkZGQnO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVfcGF0aChvYmopIHtcbiAgICAgICAgaWYgKHZlY3Rvcl9tYWduaXR1ZGUob2JqLnBvcy5zdWJ0cmFjdChvYmoucHJldl9wb3MpKSA+IDUpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aHMucHVzaChuZXcgUGF0aChvYmopKTtcbiAgICAgICAgICAgIG9iai5wcmV2X3BvcyA9IG9iai5wb3Muc2xpY2UoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhdGhzLmxlbmd0aCA+IHRoaXMuY29uZmlnLk1BWF9QQVRIUykge1xuICAgICAgICAgICAgICAgIHRoaXMucGF0aHMgPSB0aGlzLnBhdGhzLnNsaWNlKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlX29iamVjdCh4LCB5LCBtID0gbnVsbCwgdiA9IG51bGwsIGNvbG9yID0gbnVsbCwgY29udHJvbGJveCA9IHRydWUpIHtcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5jYW1lcmEuYWN0dWFsX3BvaW50KHgsIHkpO1xuICAgICAgICBpZiAoIW0pIHtcbiAgICAgICAgICAgIGxldCBtYXhfciA9IENpcmNsZS5nZXRfcl9mcm9tX20odGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICAgICAgbWF4X3IgPSBtaW4obWF4X3IsICh2ZWN0b3JfbWFnbml0dWRlKG9iai5wb3Muc3VidHJhY3QocG9zKSkgLSBvYmouZ2V0X3IoKSkgLyAxLjUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtID0gQ2lyY2xlLmdldF9tX2Zyb21fcihyYW5kb20oQ2lyY2xlLmdldF9yX2Zyb21fbSh0aGlzLmNvbmZpZy5NQVNTX01JTiksIG1heF9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgICB2ID0gbmouYXJyYXkocG9sYXIyY2FydGVzaWFuKHJhbmRvbSh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVggLyAyKSwgcmFuZG9tKC0xODAsIDE4MCkpKVxuICAgICAgICB9XG4gICAgICAgIGlmICghY29sb3IpIHtcbiAgICAgICAgICAgIGNvbG9yID0gcmFuZF9jb2xvcigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRhZyA9IGBjaXJjbGUke3RoaXMub2Jqcy5sZW5ndGh9YDtcbiAgICAgICAgY29uc3QgZGlyX3RhZyA9IHRhZyArIFwiX2RpclwiO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgQ2lyY2xlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIGRpcl90YWcsIHRoaXMsIGNvbnRyb2xib3gpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzLCBkaXIgPSAxKSB7XG4gICAgICAgIHJldHVybiBnZXRfcm90YXRpb25fbWF0cml4KGFuZ2xlc1swXSwgZGlyKTtcbiAgICB9XG5cbiAgICBlbGFzdGljX2NvbGxpc2lvbigpIHtcbiAgICAgICAgY29uc3QgZGltZW5zaW9uID0gdGhpcy5jb25maWcuRElNRU5TSU9OO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbzEgPSB0aGlzLm9ianNbaV07XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCB0aGlzLm9ianMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvMiA9IHRoaXMub2Jqc1tqXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xsaXNpb24gPSBvMi5wb3Muc3VidHJhY3QobzEucG9zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbmdsZXMgPSBjYXJ0ZXNpYW4yYXV0byhjb2xsaXNpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBhbmdsZXMuc2hpZnQoKTtcblxuICAgICAgICAgICAgICAgIGlmIChkIDwgbzEuZ2V0X3IoKSArIG8yLmdldF9yKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUiA9IHRoaXMuZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBSXyA9IHRoaXMuZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMsIC0xKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2X3RlbXAgPSBbcm90YXRlKG8xLnYsIFIpLCByb3RhdGUobzIudiwgUildO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2X2ZpbmFsID0gW3ZfdGVtcFswXS5jbG9uZSgpLCB2X3RlbXBbMV0uY2xvbmUoKV07XG4gICAgICAgICAgICAgICAgICAgIHZfZmluYWxbMF1bMF0gPSAoKG8xLm0gLSBvMi5tKSAqIHZfdGVtcFswXVswXSArIDIgKiBvMi5tICogdl90ZW1wWzFdWzBdKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIHZfZmluYWxbMV1bMF0gPSAoKG8yLm0gLSBvMS5tKSAqIHZfdGVtcFsxXVswXSArIDIgKiBvMS5tICogdl90ZW1wWzBdWzBdKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIG8xLnYgPSByb3RhdGUodl9maW5hbFswXSwgUl8pO1xuICAgICAgICAgICAgICAgICAgICBvMi52ID0gcm90YXRlKHZfZmluYWxbMV0sIFJfKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NfdGVtcCA9IFtbMF0gKiBkaW1lbnNpb24sIHJvdGF0ZShjb2xsaXNpb24sIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RlbXBbMF1bMF0gKz0gdl9maW5hbFswXVswXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RlbXBbMV1bMF0gKz0gdl9maW5hbFsxXVswXTtcbiAgICAgICAgICAgICAgICAgICAgbzEucG9zID0gbzEucG9zLmFkZChyb3RhdGUocG9zX3RlbXBbMF0sIFJfKSk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnBvcyA9IG8xLnBvcy5hZGQocm90YXRlKHBvc190ZW1wWzFdLCBSXykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZV9hbGwoKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZV92ZWxvY2l0eSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGFzdGljX2NvbGxpc2lvbigpO1xuXG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZV9wb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVfcGF0aChvYmopO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVkcmF3X2FsbCgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd19vYmplY3Qob2JqKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd19kaXJlY3Rpb24ob2JqKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXdfcGF0aHMoKTtcbiAgICB9XG5cbiAgICBwcmludF9mcHMoKSB7XG4gICAgICAgIHRoaXMuZnBzX2NvdW50ICs9IDE7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfdGltZSA9IG5vdygpO1xuICAgICAgICBjb25zdCBmcHNfdGltZV9kaWZmID0gY3VycmVudF90aW1lIC0gdGhpcy5mcHNfbGFzdF90aW1lXG4gICAgICAgIGlmIChmcHNfdGltZV9kaWZmID4gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7KHRoaXMuZnBzX2NvdW50IC8gZnBzX3RpbWVfZGlmZikgfCAwfSBmcHNgKTtcbiAgICAgICAgICAgIHRoaXMuZnBzX2xhc3RfdGltZSA9IGN1cnJlbnRfdGltZTtcbiAgICAgICAgICAgIHRoaXMuZnBzX2NvdW50ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUyRDsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vMmQnKTtcbmNvbnN0IENhbWVyYTNEID0gcmVxdWlyZSgnLi4vY2FtZXJhLzNkJyk7XG5jb25zdCBTcGhlcmUgPSByZXF1aXJlKCcuLi9vYmplY3Qvc3BoZXJlJyk7XG5jb25zdCB7dmVjdG9yX21hZ25pdHVkZSwgcmFuZG9tLCBnZXRfcm90YXRpb25feF9tYXRyaXgsIGdldF9yb3RhdGlvbl96X21hdHJpeCwgcmFuZF9jb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7bWlufSA9IE1hdGg7XG5cblxuY2xhc3MgRW5naW5lM0QgZXh0ZW5kcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBjdHgpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCBjdHgpO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEzRChjb25maWcsIHRoaXMpO1xuICAgIH1cblxuXG4gICAgY3JlYXRlX29iamVjdCh4LCB5LCBtID0gTm9uZSwgdiA9IE5vbmUsIGNvbG9yID0gTm9uZSwgY29udHJvbGJveCA9IFRydWUpIHtcbiAgICAgICAgY29uc3QgcG9zID0gbmouYXJyYXkodGhpcy5jYW1lcmEuYWN0dWFsX3BvaW50KHgsIHkpKTtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgICBsZXQgbWF4X3IgPSBTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgICAgIG1heF9yID0gbWluKG1heF9yLCAodmVjdG9yX21hZ25pdHVkZShvYmoucG9zIC0gcG9zKSAtIG9iai5nZXRfcigpKSAvIDEuNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtID0gU3BoZXJlLmdldF9tX2Zyb21fcihyYW5kb20oU3BoZXJlLmdldF9yX2Zyb21fbSh0aGlzLmNvbmZpZy5NQVNTX01JTiksIG1heF9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgICB2ID0gbmouYXJyYXkoc3BoZXJpY2FsMmNhcnRlc2lhbihcbiAgICAgICAgICAgICAgICByYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksXG4gICAgICAgICAgICAgICAgcmFuZG9tKC0xODAsIDE4MCksXG4gICAgICAgICAgICAgICAgcmFuZG9tKC0xODAsIDE4MCkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbG9yKSB7XG4gICAgICAgICAgICBjb2xvciA9IHJhbmRfY29sb3IoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0YWcgPSBgc3BoZXJlJHt0aGlzLm9ianMubGVuZ3RofWA7XG4gICAgICAgIGNvbnN0IGRpcl90YWcgPSB0YWcgKyBcIl9kaXJcIjtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IFNwaGVyZSh0aGlzLmNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCBkaXJfdGFnLCB0aGlzLCBjb250cm9sYm94KTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICAgICAgdGhpcy5kcmF3X29iamVjdChvYmopO1xuICAgICAgICB0aGlzLmRyYXdfZGlyZWN0aW9uKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGRpciA9PSAxXG4gICAgICAgICAgICA/IGdldF9yb3RhdGlvbl96X21hdHJpeChhbmdsZXNbMF0pICogZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGFuZ2xlc1sxXSlcbiAgICAgICAgICAgIDogZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGFuZ2xlc1sxXSwgLTEpICogZ2V0X3JvdGF0aW9uX3pfbWF0cml4KGFuZ2xlc1swXSwgLTEpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUzRDsiLCJjbGFzcyBJbnZpc2libGVFcnJvciBleHRlbmRzIEVycm9yIHtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnZpc2libGVFcnJvcjsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vZW5naW5lLzJkJyk7XG5jb25zdCBFbmdpbmUzRCA9IHJlcXVpcmUoJy4vZW5naW5lLzNkJyk7XG5jb25zdCB7Z2V0X2Rpc3RhbmNlfSA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5cbmxldCBjb25maWcgPSBudWxsO1xuY29uc3Qga2V5bWFwID0ge1xuICAgIDM4OiAndXAnLFxuICAgIDQwOiAnZG93bicsXG4gICAgMzc6ICdsZWZ0JyxcbiAgICAzOTogJ3JpZ2h0JyxcbiAgICA5MDogJ3pvb21faW4nLCAvLyB6XG4gICAgODg6ICd6b29tX291dCcsIC8vIHhcbiAgICA4NzogJ3JvdGF0ZV91cCcsIC8vIHdcbiAgICA4MzogJ3JvdGF0ZV9kb3duJywgLy8gc1xuICAgIDY1OiAncm90YXRlX2xlZnQnLCAvLyBhXG4gICAgNjg6ICdyb3RhdGVfcmlnaHQnIC8vIGRcbn07XG5cbmZ1bmN0aW9uIG9uX3Jlc2l6ZSgkY2FudmFzKSB7XG4gICAgY29uZmlnLlcgPSAkY2FudmFzWzBdLndpZHRoID0gJGNhbnZhcy53aWR0aCgpO1xuICAgIGNvbmZpZy5IID0gJGNhbnZhc1swXS5oZWlnaHQgPSAkY2FudmFzLmhlaWdodCgpO1xuXG59XG5cbmZ1bmN0aW9uIG9uX2NsaWNrKGV2ZW50LCBlbmdpbmUpIHtcbiAgICBjb25zdCB4ID0gZXZlbnQucGFnZVg7XG4gICAgY29uc3QgeSA9IGV2ZW50LnBhZ2VZO1xuICAgIGlmICghZW5naW5lLmFuaW1hdGluZykge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiBlbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgY29uc3QgYyA9IGVuZ2luZS5vYmplY3RfY29vcmRzKG9iaik7XG4gICAgICAgICAgICBjb25zdCBjeCA9IChjWzBdICsgY1syXSkgLyAyO1xuICAgICAgICAgICAgY29uc3QgY3kgPSAoY1sxXSArIGNbM10pIC8gMjtcbiAgICAgICAgICAgIGNvbnN0IHIgPSAoY1syXSAtIGNbMF0pIC8gMjtcbiAgICAgICAgICAgIGlmIChnZXRfZGlzdGFuY2UoY3gsIGN5LCB4LCB5KSA8IHIpIHtcbiAgICAgICAgICAgICAgICBvYmouc2hvd19jb250cm9sYm94KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVuZ2luZS5jcmVhdGVfb2JqZWN0KHgsIHkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25fa2V5X2Rvd24oZXZlbnQsIGVuZ2luZSkge1xuICAgIGNvbnN0IHtrZXlDb2RlfSA9IGV2ZW50O1xuICAgIGlmIChrZXlDb2RlID09IDMyKSB7IC8vIHNwYWNlIGJhclxuICAgICAgICBlbmdpbmUuZGVzdHJveV9jb250cm9sYm94ZXMoKTtcbiAgICAgICAgZW5naW5lLmFuaW1hdGluZyA9ICFlbmdpbmUuYW5pbWF0aW5nO1xuICAgICAgICBkb2N1bWVudC50aXRsZSA9IGAke2NvbmZpZy5USVRMRX0gKCR7ZW5naW5lLmFuaW1hdGluZyA/IFwiU2ltdWxhdGluZ1wiIDogXCJQYXVzZWRcIn0pYDtcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgaW4ga2V5bWFwICYmIGtleW1hcFtrZXlDb2RlXSBpbiBlbmdpbmUuY2FtZXJhKSB7XG4gICAgICAgIGVuZ2luZS5jYW1lcmFba2V5bWFwW2tleUNvZGVdXShrZXlDb2RlKTtcbiAgICB9XG59XG5cbmNsYXNzIFNpbXVsYXRvciB7XG4gICAgY29uc3RydWN0b3IocHJlc2V0KSB7XG4gICAgICAgIGNvbmZpZyA9IHByZXNldCh7fSk7XG4gICAgICAgIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMnKTtcbiAgICAgICAgY29uc3QgY3R4ID0gJGNhbnZhc1swXS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBvbl9yZXNpemUoJGNhbnZhcyk7XG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IChjb25maWcuRElNRU5TSU9OID09IDIgPyBFbmdpbmUyRCA6IEVuZ2luZTNEKShjb25maWcsIGN0eCk7XG4gICAgICAgICRjYW52YXMucmVzaXplKGUgPT4ge1xuICAgICAgICAgICAgb25fcmVzaXplKCRjYW52YXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNhbnZhcy5jbGljayhlID0+IHtcbiAgICAgICAgICAgIG9uX2NsaWNrKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJ2JvZHknKS5rZXlkb3duKGUgPT4ge1xuICAgICAgICAgICAgb25fa2V5X2Rvd24oZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhbmltYXRlKCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5hbmltYXRlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvcjsiLCJjb25zdCBDb250cm9sQm94ID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sX2JveCcpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3ZlY3Rvcl9tYWduaXR1ZGUsIHJhZDJkZWcsIGRlZzJyYWQsIHBvbGFyMmNhcnRlc2lhbiwgY2FydGVzaWFuMmF1dG8sIHNxdWFyZX0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7bWF4LCBwb3d9ID0gTWF0aDtcblxuXG5jbGFzcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFBvbGFyIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9sYXJfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCBkaXJfdGFnLCBlbmdpbmUsIGNvbnRyb2xib3gpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgICAgICB0aGlzLnByZXZfcG9zID0gcG9zLnNsaWNlKCk7XG4gICAgICAgIHRoaXMudiA9IHY7XG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgdGhpcy50YWcgPSB0YWc7XG4gICAgICAgIHRoaXMuZGlyX3RhZyA9IGRpcl90YWc7XG4gICAgICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuXG4gICAgICAgIHRoaXMuY29udHJvbGJveCA9IG51bGw7XG4gICAgICAgIGlmIChjb250cm9sYm94KSB7XG4gICAgICAgICAgICB0aGlzLnNob3dfY29udHJvbGJveCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRfcigpIHtcbiAgICAgICAgcmV0dXJuIENpcmNsZS5nZXRfcl9mcm9tX20odGhpcy5tKVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZV92ZWxvY2l0eSgpIHtcbiAgICAgICAgbGV0IEYgPSBuai56ZXJvcyh0aGlzLmNvbmZpZy5ESU1FTlNJT04pO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICBpZiAob2JqID09IHRoaXMpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgdmVjdG9yID0gdGhpcy5wb3Muc3VidHJhY3Qob2JqLnBvcyk7XG4gICAgICAgICAgICBjb25zdCBtYWduaXR1ZGUgPSB2ZWN0b3JfbWFnbml0dWRlKHZlY3Rvcik7XG4gICAgICAgICAgICBjb25zdCB1bml0X3ZlY3RvciA9IHZlY3Rvci5kaXZpZGUobWFnbml0dWRlKTtcbiAgICAgICAgICAgIEYgPSBGLmFkZCh1bml0X3ZlY3Rvci5tdWx0aXBseShvYmoubSAvIHNxdWFyZShtYWduaXR1ZGUpKSlcbiAgICAgICAgfVxuICAgICAgICBGID0gRi5tdWx0aXBseSgtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBGLmRpdmlkZSh0aGlzLm0pO1xuICAgICAgICB0aGlzLnYgPSB0aGlzLnYuYWRkKGEpO1xuICAgIH1cblxuICAgIGNhbGN1bGF0ZV9wb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5wb3MgPSB0aGlzLnBvcy5hZGQodGhpcy52KTtcbiAgICB9XG5cbiAgICBjb250cm9sX20oZSkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tX2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgfVxuXG4gICAgY29udHJvbF9wb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NfeF9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NfeV9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IG5qLmFycmF5KFt4LCB5XSk7XG4gICAgfVxuXG4gICAgY29udHJvbF92KGUpIHtcbiAgICAgICAgY29uc3QgcGhpID0gZGVnMnJhZCh0aGlzLnZfcGhpX2NvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZfcmhvX2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMudiA9IG5qLmFycmF5KHBvbGFyMmNhcnRlc2lhbihyaG8sIHBoaSkpO1xuICAgIH1cblxuICAgIHNob3dfY29udHJvbGJveCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbGJveC50ay5saWZ0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpbiA9IDEuNTtcblxuICAgICAgICAgICAgdmFyIHBvc19yYW5nZSA9IG1heChtYXgodGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCkgLyAyLCBtYXguYXBwbHkobnVsbCwgdGhpcy5wb3MudG9saXN0KCkubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgICAgIHBvc19yYW5nZSA9IG1heChwb3NfcmFuZ2UsIG1heC5hcHBseShudWxsLCBvYmoucG9zLnRvbGlzdCgpLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcblxuICAgICAgICAgICAgY29uc3QgdiA9IGNhcnRlc2lhbjJhdXRvKHRoaXMudik7XG4gICAgICAgICAgICB2YXIgdl9yYW5nZSA9IG1heCh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVgsIHZlY3Rvcl9tYWduaXR1ZGUodGhpcy52KSAqIG1hcmdpbik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICAgICAgdl9yYW5nZSA9IG1heCh2X3JhbmdlLCB2ZWN0b3JfbWFnbml0dWRlKG9iai52KSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbGJveCA9IG5ldyBDb250cm9sQm94KHRoaXMudGFnLCB0aGlzLmdldF9jb250cm9sbGVycygpKTtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lLmNvbnRyb2xib3hlcy5wdXNoKHRoaXMuY29udHJvbGJveCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpIHtcbiAgICAgICAgdGhpcy5tX2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcihcIk1hc3MgbVwiLCB0aGlzLmNvbmZpZy5NQVNTX01JTiwgdGhpcy5jb25maWcuTUFTU19NQVgsIG0sIHRoaXMuY29udHJvbF9tKTtcbiAgICAgICAgdGhpcy5wb3NfeF9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoXCJQb3NpdGlvbiB4XCIsIC1wb3NfcmFuZ2UsIHBvc19yYW5nZSwgdGhpcy5wb3NbMF0sIHRoaXMuY29udHJvbF9wb3MpO1xuICAgICAgICB0aGlzLnBvc195X2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcihcIlBvc2l0aW9uIHlcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1sxXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMudl9yaG9fY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKFwiVmVsb2NpdHkgz4FcIiwgMCwgdl9yYW5nZSwgdlswXSwgdGhpcy5jb250cm9sX3YpO1xuICAgICAgICB0aGlzLnZfcGhpX2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcihcIlZlbG9jaXR5IM+GXCIsIC0xODAsIDE4MCwgcmFkMmRlZyh2WzFdKSwgdGhpcy5jb250cm9sX3YpO1xuICAgIH1cblxuICAgIGdldF9jb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NfeF9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NfeV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3Job19jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3BoaV9jb250cm9sbGVyXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldF9yX2Zyb21fbShtKSB7XG4gICAgICAgIHJldHVybiBwb3cobSwgMSAvIDIpXG4gICAgfVxuXG4gICAgc3RhdGljIGdldF9tX2Zyb21fcihyKSB7XG4gICAgICAgIHJldHVybiBzcXVhcmUocilcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsndGFnJzogdGhpcy50YWcsICd2JzogdGhpcy52LCAncG9zJzogdGhpcy5wb3N9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4vY2lyY2xlJyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7cmFkMmRlZywgZGVnMnJhZCwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7Y3ViZX0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7cG93fSA9IE1hdGg7XG5cblxuY2xhc3MgU3BoZXJlIGV4dGVuZHMgQ2lyY2xlIHtcbiAgICAvKipcbiAgICAgKiBTcGhlcmljYWwgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TcGhlcmljYWxfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICAgKi9cblxuICAgIGdldF9yKCkge1xuICAgICAgICByZXR1cm4gU3BoZXJlLmdldF9yX2Zyb21fbSh0aGlzLm0pO1xuICAgIH1cblxuICAgIGNvbnRyb2xfcG9zKGUpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXMucG9zX3hfY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMucG9zX3lfY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgeiA9IHRoaXMucG9zX3pfY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBuai5hcnJheShbeCwgeSwgel0pO1xuICAgIH1cblxuICAgIGNvbnRyb2xfdihlKSB7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52X3BoaV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgdGhldGEgPSBkZWcycmFkKHRoaXMudl90aGV0YV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52X3Job19jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnYgPSBuai5hcnJheShzcGhlcmljYWwyY2FydGVzaWFuKHJobywgcGhpLCB0aGV0YSkpO1xuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICBzdXBlci5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICB0aGlzLnBvc196X2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcihcIlBvc2l0aW9uIHpcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1syXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMudl90aGV0YV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoXCJWZWxvY2l0eSDOuFwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsyXSksIHRoaXMuY29udHJvbF92KTtcbiAgICB9XG5cbiAgICBnZXRfY29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3hfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3pfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9yaG9fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9waGlfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl90aGV0YV9jb250cm9sbGVyXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldF9yX2Zyb21fbShtKSB7XG4gICAgICAgIHJldHVybiBwb3cobSwgMSAvIDMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfbV9mcm9tX3Iocikge1xuICAgICAgICByZXR1cm4gY3ViZShyKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3BoZXJlOyIsImNvbnN0IFV0aWwgPSB7XG4gICAgc3F1YXJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHg7XG4gICAgfSxcblxuICAgIGN1YmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeCAqIHg7XG4gICAgfSxcblxuICAgIHBvbGFyMmNhcnRlc2lhbjogKHJobywgcGhpKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4ocGhpKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4ycG9sYXI6ICh4LCB5KSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBNYXRoLnNxcnQoVXRpbC5zcXVhcmUoeCkgKyBVdGlsLnNxdWFyZSh5KSksXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHgsIHkpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIHNwaGVyaWNhbDJjYXJ0ZXNpYW46IChyaG8sIHBoaSwgdGhldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLnNpbihwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5jb3ModGhldGEpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJzcGhlcmljYWw6ICh4LCB5LCB6KSA9PiB7XG4gICAgICAgIGNvbnN0IHJobyA9IE1hdGguc3FydChVdGlsLnNxdWFyZSh4KSArIFV0aWwuc3F1YXJlKHkpICsgVXRpbC5zcXVhcmUoeikpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvLFxuICAgICAgICAgICAgTWF0aC5hdGFuMih4LCB5KSxcbiAgICAgICAgICAgIHJobyAhPSAwID8gTWF0aC5hY29zKHogLyByaG8pIDogMFxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4yYXV0bzogKHZlY3RvcikgPT4ge1xuICAgICAgICByZXR1cm4gdmVjdG9yLnNpemUgPT0gMlxuICAgICAgICAgICAgPyBVdGlsLmNhcnRlc2lhbjJwb2xhcih2ZWN0b3IuZ2V0KDApLCB2ZWN0b3IuZ2V0KDEpKVxuICAgICAgICAgICAgOiBVdGlsLmNhcnRlc2lhbjJzcGhlcmljYWwodmVjdG9yLmdldCgwKSwgdmVjdG9yLmdldCgxKSwgdmVjdG9yLmdldCgyKSk7XG4gICAgfSxcblxuICAgIHJhZDJkZWc6IChyYWQpID0+IHtcbiAgICAgICAgcmV0dXJuIHJhZCAvIE1hdGguUEkgKiAxODA7XG4gICAgfSxcblxuICAgIGRlZzJyYWQ6IChkZWcpID0+IHtcbiAgICAgICAgcmV0dXJuIGRlZyAvIDE4MCAqIE1hdGguUEk7XG4gICAgfSxcblxuICAgIGdldF9kaXN0YW5jZTogKHgwLCB5MCwgeDEsIHkxKSA9PiB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoVXRpbC5zcXVhcmUoeDEgLSB4MCkgKyBVdGlsLnNxdWFyZSh5MSAtIHkwKSk7XG4gICAgfSxcblxuICAgIHZlY3Rvcl9tYWduaXR1ZGU6ICh2ZWN0b3IpID0+IHtcbiAgICAgICAgcmV0dXJuIHZlY3Rvci5wb3coMikudG9saXN0KCkucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCk7XG4gICAgfSxcblxuICAgIGMyZDogKCkgPT4ge1xuICAgICAgICByZXR1cm4gbmouYXJyYXkoWzAsIDBdKTtcbiAgICB9LFxuXG4gICAgcm90YXRlOiAodmVjdG9yLCBtYXRyaXgpID0+IHtcbiAgICAgICAgcmV0dXJuIHZlY3Rvci5kb3QobWF0cml4KTtcbiAgICB9LFxuXG4gICAgbm93OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgfSxcblxuICAgIHJhbmRvbTogKG1pbiwgbWF4ID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgICAgICAgIG1heCA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiAgICB9LFxuXG4gICAgcmFuZF9jb2xvcjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gJyMnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTY3NzcyMTUpLnRvU3RyaW5nKDE2KTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gbmouYXJyYXkoW1xuICAgICAgICAgICAgW2NvcywgLXNpbl0sXG4gICAgICAgICAgICBbc2luLCBjb3NdXG4gICAgICAgIF0pO1xuICAgIH0sXG5cbiAgICBnZXRfcm90YXRpb25feF9tYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIG5qLmFycmF5KFtcbiAgICAgICAgICAgIFsxLCAwLCAwXSxcbiAgICAgICAgICAgIFswLCBjb3MsIC1zaW5dLFxuICAgICAgICAgICAgWzAsIHNpbiwgY29zXVxuICAgICAgICBdKTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX3lfbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBuai5hcnJheShbXG4gICAgICAgICAgICBbY29zLCAwLCAtc2luXSxcbiAgICAgICAgICAgIFswLCAxLCAwXSxcbiAgICAgICAgICAgIFtzaW4sIDAsIGNvc11cbiAgICAgICAgXSk7XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl96X21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gbmouYXJyYXkoW1xuICAgICAgICAgICAgW2NvcywgLXNpbiwgMF0sXG4gICAgICAgICAgICBbc2luLCBjb3MsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDFdXG4gICAgICAgIF0pO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbDsiXX0=

//# sourceMappingURL=gravity_simulator.js.map
