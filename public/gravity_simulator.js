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
        this.z = 100;
        this.phi = 0;
        this.engine = engine;
        this.last_time = 0;
        this.last_key = null;
        this.combo = 0;
        this.center = [config.W / 2, config.H / 2];
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
            return add(this.center, mul(sub(rotate(coord, R), [this.x, this.y]), zoom));
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
    get_rotation_x_matrix = _require.get_rotation_x_matrix,
    get_rotation_y_matrix = _require.get_rotation_y_matrix;

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
            return add(this.center, mul(sub(c, [this.x, this.y]), zoom));
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
            var c = add(sub([x, y], this.center), [this.x, this.y]).concat(0);
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

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub,
    mul = _require2.mul,
    div = _require2.div,
    dot = _require2.dot;

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

            var _camera$adjust_coord5 = this.camera.adjust_coord(add(obj.pos, mul(obj.v, 50)), true),
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

                        max_r = min(max_r, (mag(sub(_obj.pos, pos)) - _obj.get_r()) / 1.5);
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
                v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
            }
            if (!color) {
                color = rand_color();
            }
            var tag = 'circle' + this.objs.length;
            var obj = new Circle(this.config, m, pos, v, color, tag, this, controlbox);
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
                    var collision = sub(o2.pos, o1.pos);
                    var angles = cartesian2auto(collision);
                    var d = angles.shift();

                    if (d < o1.get_r() + o2.get_r()) {
                        var R = this.get_rotation_matrix(angles);
                        var R_ = this.get_rotation_matrix(angles, -1);

                        var v_temp = [rotate(o1.v, R), rotate(o2.v, R)];
                        var v_final = [v_temp[0].slice(), v_temp[1].slice()];
                        v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m);
                        v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m);
                        o1.v = rotate(v_final[0], R_);
                        o2.v = rotate(v_final[1], R_);

                        var pos_temp = [zeros(dimension), rotate(collision, R)];
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

},{"../camera/2d":3,"../error/invisible":9,"../matrix":11,"../object/circle":12,"../util":14}],8:[function(require,module,exports){
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

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub,
    mul = _require2.mul,
    div = _require2.div,
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
        key: 'create_object',
        value: function create_object(x, y) {
            var m = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : None;
            var v = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : None;
            var color = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : None;
            var controlbox = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : True;

            var pos = this.camera.actual_point(x, y);
            if (!m) {
                var max_r = Sphere.get_r_from_m(this.config.MASS_MAX);
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _obj = _step.value;

                        max_r = min(max_r, (mag(_obj.pos - pos) - _obj.get_r()) / 1.5);
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
                v = spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180));
            }
            if (!color) {
                color = rand_color();
            }
            var tag = 'sphere' + this.objs.length;
            var obj = new Sphere(this.config, m, pos, v, color, tag, this, controlbox);
            this.objs.push(obj);
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

},{"../camera/3d":4,"../matrix":11,"../object/sphere":13,"../util":14,"./2d":7}],9:[function(require,module,exports){
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
        Array.apply(null, Array(N)).map(Number.prototype.valueOf, 0);
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
    vector_magnitude = _require.vector_magnitude,
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
    div = _require2.div,
    dot = _require2.dot;

var max = Math.max,
    pow = Math.pow;

var Circle = function () {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    function Circle(config, m, pos, v, color, tag, engine, controlbox) {
        _classCallCheck(this, Circle);

        this.config = config;
        this.m = m;
        this.pos = pos;
        this.prev_pos = pos.slice();
        this.v = v;
        this.color = color;
        this.tag = tag;
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
                    var unit_vector = div(vector, magnitude);
                    F = add(F, mul(obj.m / square(magnitude), unit_vector));
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
        key: 'calculate_position',
        value: function calculate_position() {
            this.pos = add(this.pos, this.v);
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
            this.pos = [x, y];
        }
    }, {
        key: 'control_v',
        value: function control_v(e) {
            var phi = deg2rad(this.v_phi_controller.get());
            var rho = this.v_rho_controller.get();
            this.v = polar2cartesian(rho, phi);
        }
    }, {
        key: 'show_controlbox',
        value: function show_controlbox() {
            try {
                this.controlbox.tk.lift();
            } catch (e) {
                var margin = 1.5;

                var pos_range = max(max(this.config.W, this.config.H) / 2, max.apply(null, this.pos.map(Math.abs)) * margin);
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.engine.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var obj = _step2.value;

                        pos_range = max(pos_range, max.apply(null, obj.pos.map(Math.abs)) * margin);
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
                var v_range = max(this.config.VELOCITY_MAX, mag(this.v) * margin);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.engine.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _obj = _step3.value;

                        v_range = max(v_range, mag(_obj.v) * margin);
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
            this.pos = [x, y, z];
        }
    }, {
        key: 'control_v',
        value: function control_v(e) {
            var phi = deg2rad(this.v_phi_controller.get());
            var theta = deg2rad(this.v_theta_controller.get());
            var rho = this.v_rho_controller.get();
            this.v = spherical2cartesian(rho, phi, theta);
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

},{"../control/controller":6,"../util":14,"./circle":12}],14:[function(require,module,exports){
'use strict';

var _require = require('./matrix'),
    zeros = _require.zeros,
    mag = _require.mag,
    add = _require.add,
    sub = _require.sub,
    mul = _require.mul,
    div = _require.div,
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
        return vector.length == 2 ? Util.cartesian2polar(vector[0], vector[1]) : Util.cartesian2spherical(vector[0], vector[1], vector[2]);
    },

    rad2deg: function rad2deg(rad) {
        return rad / Math.PI * 180;
    },

    deg2rad: function deg2rad(deg) {
        return deg / 180 * Math.PI;
    },

    get_distance: function get_distance(x0, y0, x1, y1) {
        return mag([x1 - x0, y1 - y0]);
    },

    rotate: function rotate(vector, matrix) {
        return dot(vector, matrix);
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
        return [[cos, -sin], [sin, cos]];
    },

    get_rotation_x_matrix: function get_rotation_x_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[1, 0, 0], [0, cos, -sin], [0, sin, cos]];
    },

    get_rotation_y_matrix: function get_rotation_y_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[cos, 0, -sin], [0, 1, 0], [sin, 0, cos]];
    },

    get_rotation_z_matrix: function get_rotation_z_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]];
    }
};

module.exports = Util;

},{"./matrix":11}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTSxZQUFZLFFBQVEsYUFBUixDQUFsQjs7QUFFQSxJQUFNLFlBQVksSUFBSSxTQUFKLENBQWMsTUFBZCxDQUFsQjtBQUNBLFVBQVUsT0FBVjs7Ozs7U0NKaUIsQztJQUFWLE0sTUFBQSxNOzs7QUFHUCxTQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUI7QUFDakIsV0FBTyxPQUFPLElBQVAsRUFBYSxDQUFiLEVBQWdCO0FBQ25CLGlCQUFTLG1CQURVO0FBRW5CLHNCQUFjLE9BRks7QUFHbkIscUJBQWEsQ0FITTtBQUluQixxQkFBYSxJQUpNO0FBS25CLDZCQUFxQixDQUxGO0FBTW5CLDZCQUFxQixDQU5GO0FBT25CLCtCQUF1QixHQVBKO0FBUW5CLGFBQUssR0FSYztBQVNuQixvQkFBWSxDQVRPO0FBVW5CLG9CQUFZLEdBVk87QUFXbkIsd0JBQWdCO0FBWEcsS0FBaEIsQ0FBUDtBQWFIOztBQUdELFNBQVMsUUFBVCxDQUFrQixDQUFsQixFQUFxQjtBQUNqQixXQUFPLE9BQU8sSUFBUCxFQUFhLFNBQVMsQ0FBVCxDQUFiLEVBQTBCO0FBQzdCLHFCQUFhLENBRGdCO0FBRTdCLGFBQUssS0FGd0I7QUFHN0Isb0JBQVksQ0FIaUI7QUFJN0Isb0JBQVksR0FKaUI7QUFLN0Isd0JBQWdCO0FBTGEsS0FBMUIsQ0FBUDtBQU9IOztBQUVELE9BQU8sT0FBUCxHQUFpQixRQUFqQjs7Ozs7Ozs7O0FDOUJBLElBQU0saUJBQWlCLFFBQVEsb0JBQVIsQ0FBdkI7O2VBQ29ELFFBQVEsU0FBUixDO0lBQTdDLE8sWUFBQSxPO0lBQVMsTSxZQUFBLE07SUFBUSxHLFlBQUEsRztJQUFLLG1CLFlBQUEsbUI7O2dCQUNpQixRQUFRLFdBQVIsQztJQUF2QyxLLGFBQUEsSztJQUFPLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRzs7SUFDaEMsRyxHQUFPLEksQ0FBUCxHOztJQUVELFE7QUFDRixzQkFBWSxNQUFaLEVBQW9CLE1BQXBCLEVBQTRCO0FBQUE7O0FBQ3hCLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssQ0FBTCxHQUFTLEdBQVQ7QUFDQSxhQUFLLEdBQUwsR0FBVyxDQUFYO0FBQ0EsYUFBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLGFBQUssU0FBTCxHQUFpQixDQUFqQjtBQUNBLGFBQUssUUFBTCxHQUFnQixJQUFoQjtBQUNBLGFBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxhQUFLLE1BQUwsR0FBYyxDQUFDLE9BQU8sQ0FBUCxHQUFXLENBQVosRUFBZSxPQUFPLENBQVAsR0FBVyxDQUExQixDQUFkO0FBQ0g7Ozs7dUNBRWMsRyxFQUFLO0FBQ2hCLGdCQUFNLGVBQWUsS0FBckI7QUFDQSxnQkFBSSxPQUFPLEtBQUssUUFBWixJQUF3QixlQUFlLEtBQUssU0FBcEIsR0FBZ0MsQ0FBNUQsRUFBK0Q7QUFDM0QscUJBQUssS0FBTCxJQUFjLENBQWQ7QUFDSCxhQUZELE1BRU87QUFDSCxxQkFBSyxLQUFMLEdBQWEsQ0FBYjtBQUNIO0FBQ0QsaUJBQUssU0FBTCxHQUFpQixZQUFqQjtBQUNBLGlCQUFLLFFBQUwsR0FBZ0IsR0FBaEI7QUFDQSxtQkFBTyxLQUFLLE1BQUwsQ0FBWSxpQkFBWixHQUFnQyxJQUFJLEtBQUssTUFBTCxDQUFZLG1CQUFoQixFQUFxQyxLQUFLLEtBQTFDLENBQXZDO0FBQ0g7OzsyQkFFRSxHLEVBQUs7QUFDSixpQkFBSyxDQUFMLElBQVUsS0FBSyxjQUFMLENBQW9CLEdBQXBCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7Ozs2QkFFSSxHLEVBQUs7QUFDTixpQkFBSyxDQUFMLElBQVUsS0FBSyxjQUFMLENBQW9CLEdBQXBCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7Ozs2QkFFSSxHLEVBQUs7QUFDTixpQkFBSyxDQUFMLElBQVUsS0FBSyxjQUFMLENBQW9CLEdBQXBCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7Ozs4QkFFSyxHLEVBQUs7QUFDUCxpQkFBSyxDQUFMLElBQVUsS0FBSyxjQUFMLENBQW9CLEdBQXBCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OztnQ0FFTyxHLEVBQUs7QUFDVCxpQkFBSyxDQUFMLElBQVUsS0FBSyxjQUFMLENBQW9CLEdBQXBCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OztpQ0FFUSxHLEVBQUs7QUFDVixpQkFBSyxDQUFMLElBQVUsS0FBSyxjQUFMLENBQW9CLEdBQXBCLENBQVY7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OztvQ0FFVyxHLEVBQUs7QUFDYixpQkFBSyxHQUFMLElBQVksS0FBSyxNQUFMLENBQVksaUJBQXhCO0FBQ0EsaUJBQUssT0FBTDtBQUNIOzs7cUNBRVksRyxFQUFLO0FBQ2QsaUJBQUssR0FBTCxJQUFZLEtBQUssTUFBTCxDQUFZLGlCQUF4QjtBQUNBLGlCQUFLLE9BQUw7QUFDSDs7O2tDQUVTLENBQ1Q7OzttQ0FFd0M7QUFBQSxnQkFBaEMsQ0FBZ0MsdUVBQTVCLENBQTRCO0FBQUEsZ0JBQXpCLGVBQXlCLHVFQUFQLEtBQU87O0FBQ3JDLGdCQUFJLFdBQVcsS0FBSyxDQUFMLEdBQVMsQ0FBeEI7QUFDQSxnQkFBSSxZQUFZLENBQWhCLEVBQW1CO0FBQ2Ysb0JBQUksQ0FBQyxlQUFMLEVBQXNCLE1BQU0sY0FBTjtBQUN0QiwyQkFBVyxRQUFYO0FBQ0g7QUFDRCxtQkFBTyxNQUFNLFFBQWI7QUFDSDs7O3FDQUVZLEssRUFBZ0M7QUFBQSxnQkFBekIsZUFBeUIsdUVBQVAsS0FBTzs7QUFDekMsZ0JBQU0sSUFBSSxvQkFBb0IsUUFBUSxLQUFLLEdBQWIsQ0FBcEIsQ0FBVjtBQUNBLGdCQUFNLE9BQU8sS0FBSyxRQUFMLEVBQWI7QUFDQSxtQkFBTyxJQUFJLEtBQUssTUFBVCxFQUFpQixJQUFJLElBQUksT0FBTyxLQUFQLEVBQWMsQ0FBZCxDQUFKLEVBQXNCLENBQUMsS0FBSyxDQUFOLEVBQVMsS0FBSyxDQUFkLENBQXRCLENBQUosRUFBNkMsSUFBN0MsQ0FBakIsQ0FBUDtBQUNIOzs7c0NBRWEsSyxFQUFPLE0sRUFBUTtBQUN6QixnQkFBTSxPQUFPLEtBQUssUUFBTCxFQUFiO0FBQ0EsbUJBQU8sU0FBUyxJQUFoQjtBQUNIOzs7cUNBRVksQyxFQUFHLEMsRUFBRztBQUNmLGdCQUFNLEtBQUssb0JBQW9CLFFBQVEsS0FBSyxHQUFiLENBQXBCLEVBQXVDLENBQUMsQ0FBeEMsQ0FBWDtBQUNBLGdCQUFNLE9BQU8sS0FBSyxRQUFMLEVBQWI7QUFDQSxtQkFBTyxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBSixFQUFZLEtBQUssTUFBakIsQ0FBSixFQUE4QixJQUE5QixDQUFKLEVBQXlDLENBQUMsS0FBSyxDQUFOLEVBQVMsS0FBSyxDQUFkLENBQXpDLENBQVAsRUFBbUUsRUFBbkUsQ0FBUDtBQUNIOzs7Ozs7QUFHTCxPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7Ozs7Ozs7QUNyR0EsSUFBTSxXQUFXLFFBQVEsTUFBUixDQUFqQjs7ZUFDd0UsUUFBUSxTQUFSLEM7SUFBakUsTyxZQUFBLE87SUFBUyxNLFlBQUEsTTtJQUFRLHFCLFlBQUEscUI7SUFBdUIscUIsWUFBQSxxQjs7Z0JBQ0QsUUFBUSxXQUFSLEM7SUFBdkMsSyxhQUFBLEs7SUFBTyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7O0lBR2pDLFE7OztBQUNGLHNCQUFZLE1BQVosRUFBb0IsTUFBcEIsRUFBNEI7QUFBQTs7QUFBQSx3SEFDbEIsTUFEa0IsRUFDVixNQURVOztBQUV4QixjQUFLLEtBQUwsR0FBYSxDQUFiO0FBRndCO0FBRzNCOzs7O2tDQUVTLEcsRUFBSztBQUNYLGlCQUFLLEtBQUwsSUFBYyxLQUFLLE1BQUwsQ0FBWSxpQkFBMUI7QUFDQSxpQkFBSyxPQUFMO0FBQ0g7OztvQ0FFVyxHLEVBQUs7QUFDYixpQkFBSyxLQUFMLElBQWMsS0FBSyxNQUFMLENBQVksaUJBQTFCO0FBQ0EsaUJBQUssT0FBTDtBQUNIOzs7cUNBRVksSyxFQUFnQztBQUFBLGdCQUF6QixlQUF5Qix1RUFBUCxLQUFPOztBQUN6QyxnQkFBTSxLQUFLLHNCQUFzQixRQUFRLEtBQUssS0FBYixDQUF0QixDQUFYO0FBQ0EsZ0JBQU0sS0FBSyxzQkFBc0IsUUFBUSxLQUFLLEdBQWIsQ0FBdEIsQ0FBWDtBQUNBLGdCQUFNLElBQUksT0FBTyxPQUFPLEtBQVAsRUFBYyxFQUFkLENBQVAsRUFBMEIsRUFBMUIsQ0FBVjtBQUNBLGdCQUFNLE9BQU8sS0FBSyxRQUFMLENBQWMsRUFBRSxHQUFGLEVBQWQsRUFBdUIsZUFBdkIsQ0FBYjtBQUNBLG1CQUFPLElBQUksS0FBSyxNQUFULEVBQWlCLElBQUksSUFBSSxDQUFKLEVBQU8sQ0FBQyxLQUFLLENBQU4sRUFBUyxLQUFLLENBQWQsQ0FBUCxDQUFKLEVBQThCLElBQTlCLENBQWpCLENBQVA7QUFDSDs7O3NDQUVhLEssRUFBTyxNLEVBQVE7QUFDekIsZ0JBQU0sS0FBSyxzQkFBc0IsUUFBUSxLQUFLLEtBQWIsQ0FBdEIsQ0FBWDtBQUNBLGdCQUFNLEtBQUssc0JBQXNCLFFBQVEsS0FBSyxHQUFiLENBQXRCLENBQVg7QUFDQSxnQkFBTSxJQUFJLE9BQU8sT0FBTyxLQUFQLEVBQWMsRUFBZCxDQUFQLEVBQTBCLEVBQTFCLENBQVY7QUFDQSxnQkFBTSxPQUFPLEtBQUssUUFBTCxDQUFjLEVBQUUsR0FBRixFQUFkLENBQWI7QUFDQSxtQkFBTyxTQUFTLElBQWhCO0FBQ0g7OztxQ0FFWSxDLEVBQUcsQyxFQUFHO0FBQ2YsZ0JBQU0sTUFBTSxzQkFBc0IsUUFBUSxLQUFLLEtBQWIsQ0FBdEIsRUFBMkMsQ0FBQyxDQUE1QyxDQUFaO0FBQ0EsZ0JBQU0sTUFBTSxzQkFBc0IsUUFBUSxLQUFLLEdBQWIsQ0FBdEIsRUFBeUMsQ0FBQyxDQUExQyxDQUFaO0FBQ0EsZ0JBQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFKLEVBQVksS0FBSyxNQUFqQixDQUFKLEVBQThCLENBQUMsS0FBSyxDQUFOLEVBQVMsS0FBSyxDQUFkLENBQTlCLEVBQWdELE1BQWhELENBQXVELENBQXZELENBQVY7QUFDQSxtQkFBTyxPQUFPLE9BQU8sQ0FBUCxFQUFVLEdBQVYsQ0FBUCxFQUF1QixHQUF2QixDQUFQO0FBQ0g7Ozs7RUFyQ2tCLFE7O0FBd0N2QixPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7OztJQzdDTSxVO0FBQ0Ysd0JBQVksS0FBWixFQUFtQixXQUFuQixFQUFnQztBQUFBOztBQUM1QixZQUFNLGNBQWMsRUFBRSx1QkFBRixFQUEyQixLQUEzQixFQUFwQjtBQUNBLG9CQUFZLFdBQVosQ0FBd0IsVUFBeEI7QUFDQSxvQkFBWSxJQUFaLENBQWlCLFFBQWpCLEVBQTJCLElBQTNCLENBQWdDLEtBQWhDO0FBQ0EsWUFBTSxrQkFBa0IsWUFBWSxJQUFaLENBQWlCLGtCQUFqQixDQUF4QjtBQUo0QjtBQUFBO0FBQUE7O0FBQUE7QUFLNUIsaUNBQXlCLFdBQXpCLDhIQUFzQztBQUFBLG9CQUEzQixVQUEyQjs7QUFDbEMsZ0NBQWdCLE1BQWhCLENBQXVCLFdBQVcsYUFBbEM7QUFDSDtBQVAyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVM1QixhQUFLLFdBQUwsR0FBbUIsV0FBbkI7QUFDSDs7OztrQ0FFUztBQUNOLGlCQUFLLFdBQUwsQ0FBaUIsTUFBakI7QUFDSDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFVBQWpCOzs7Ozs7Ozs7SUNsQk0sVTtBQUNGLHdCQUFZLElBQVosRUFBa0IsR0FBbEIsRUFBdUIsR0FBdkIsRUFBNEIsS0FBNUIsRUFBbUMsSUFBbkMsRUFBeUM7QUFBQTs7QUFDckMsWUFBTSxnQkFBZ0IsRUFBRSx5QkFBRixFQUE2QixLQUE3QixFQUF0QjtBQUNBLHNCQUFjLFdBQWQsQ0FBMEIsVUFBMUI7QUFDQSxzQkFBYyxJQUFkLENBQW1CLE1BQW5CLEVBQTJCLElBQTNCLENBQWdDLElBQWhDO0FBQ0EsWUFBTSxTQUFTLGNBQWMsSUFBZCxDQUFtQixPQUFuQixDQUFmO0FBQ0EsZUFBTyxJQUFQLENBQVksS0FBWixFQUFtQixHQUFuQjtBQUNBLGVBQU8sSUFBUCxDQUFZLEtBQVosRUFBbUIsR0FBbkI7QUFDQSxlQUFPLElBQVAsQ0FBWSxPQUFaLEVBQXFCLEtBQXJCO0FBQ0EsZUFBTyxNQUFQLENBQWMsSUFBZDs7QUFFQSxhQUFLLGFBQUwsR0FBcUIsYUFBckI7QUFDQSxhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0g7Ozs7OEJBRUs7QUFDRixtQkFBTyxLQUFLLE1BQUwsQ0FBWSxHQUFaLEVBQVA7QUFDSDs7Ozs7O0FBR0wsT0FBTyxPQUFQLEdBQWlCLFVBQWpCOzs7Ozs7Ozs7OztBQ3BCQSxJQUFNLFNBQVMsUUFBUSxrQkFBUixDQUFmO0FBQ0EsSUFBTSxXQUFXLFFBQVEsY0FBUixDQUFqQjtBQUNBLElBQU0saUJBQWlCLFFBQVEsb0JBQVIsQ0FBdkI7O2VBQ2tILFFBQVEsU0FBUixDO0lBQTNHLGdCLFlBQUEsZ0I7SUFBa0IsTSxZQUFBLE07SUFBUSxHLFlBQUEsRztJQUFLLE0sWUFBQSxNO0lBQVEsZSxZQUFBLGU7SUFBaUIsVSxZQUFBLFU7SUFBWSxvQixZQUFBLG1CO0lBQXFCLGMsWUFBQSxjOztnQkFDbEQsUUFBUSxXQUFSLEM7SUFBdkMsSyxhQUFBLEs7SUFBTyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7O0lBQ2hDLEcsR0FBTyxJLENBQVAsRzs7SUFHRCxJLEdBQ0YsY0FBWSxHQUFaLEVBQWlCO0FBQUE7O0FBQ2IsU0FBSyxRQUFMLEdBQWdCLElBQUksUUFBSixDQUFhLEtBQWIsRUFBaEI7QUFDQSxTQUFLLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUSxLQUFSLEVBQVg7QUFDSCxDOztJQUdDLFE7QUFDRixzQkFBWSxNQUFaLEVBQW9CLEdBQXBCLEVBQXlCO0FBQUE7O0FBQ3JCLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxhQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsYUFBSyxJQUFMLEdBQVksRUFBWjtBQUNBLGFBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNBLGFBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLGFBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxhQUFLLE1BQUwsR0FBYyxJQUFJLFFBQUosQ0FBYSxNQUFiLEVBQXFCLElBQXJCLENBQWQ7QUFDQSxhQUFLLGFBQUwsR0FBcUIsS0FBckI7QUFDQSxhQUFLLFNBQUwsR0FBaUIsQ0FBakI7QUFDSDs7OzsrQ0FFc0I7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDbkIscUNBQXlCLEtBQUssWUFBOUIsOEhBQTRDO0FBQUEsd0JBQWpDLFVBQWlDOztBQUN4QywrQkFBVyxPQUFYO0FBQ0g7QUFIa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFJbkIsaUJBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNIOzs7a0NBRVM7QUFBQTs7QUFDTixpQkFBSyxTQUFMO0FBQ0EsZ0JBQUksS0FBSyxTQUFULEVBQW9CO0FBQ2hCLHFCQUFLLGFBQUw7QUFDSDtBQUNELGlCQUFLLFVBQUw7QUFDQSx1QkFBVyxZQUFNO0FBQ2Isc0JBQUssT0FBTDtBQUNILGFBRkQsRUFFRyxFQUZIO0FBR0g7OztzQ0FFYSxHLEVBQUs7QUFDZixnQkFBTSxJQUFJLEtBQUssTUFBTCxDQUFZLGFBQVosQ0FBMEIsSUFBSSxHQUE5QixFQUFtQyxJQUFJLEtBQUosRUFBbkMsQ0FBVjs7QUFEZSx1Q0FFQSxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLElBQUksR0FBN0IsQ0FGQTtBQUFBO0FBQUEsZ0JBRVIsQ0FGUTtBQUFBLGdCQUVMLENBRks7O0FBR2YsbUJBQU8sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FBUDtBQUNIOzs7eUNBRWdCLEcsRUFBSztBQUFBLHdDQUNELEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBSSxHQUE3QixDQURDO0FBQUE7QUFBQSxnQkFDWCxFQURXO0FBQUEsZ0JBQ1AsRUFETzs7QUFBQSx3Q0FFRCxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLElBQUksSUFBSSxHQUFSLEVBQWEsSUFBSSxJQUFJLENBQVIsRUFBVyxFQUFYLENBQWIsQ0FBekIsRUFBdUQsSUFBdkQsQ0FGQztBQUFBO0FBQUEsZ0JBRVgsRUFGVztBQUFBLGdCQUVQLEVBRk87O0FBR2xCLG1CQUFPLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYixDQUFQO0FBQ0g7OztvQ0FFVyxHLEVBQUs7QUFBQSx3Q0FDSSxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLElBQUksUUFBN0IsQ0FESjtBQUFBO0FBQUEsZ0JBQ04sRUFETTtBQUFBLGdCQUNGLEVBREU7O0FBQUEsd0NBRUksS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixJQUFJLEdBQTdCLENBRko7QUFBQTtBQUFBLGdCQUVOLEVBRk07QUFBQSxnQkFFRixFQUZFOztBQUdiLG1CQUFPLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYixDQUFQO0FBQ0g7OztvQ0FFVyxHLEVBQUs7QUFDYixnQkFBSTtBQUNBLG9CQUFNLElBQUksS0FBSyxhQUFMLENBQW1CLEdBQW5CLENBQVY7QUFDQSxxQkFBSyxHQUFMLENBQVMsU0FBVDtBQUNBLHFCQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsRUFBRSxDQUFGLENBQWIsRUFBbUIsRUFBRSxDQUFGLENBQW5CLEVBQXlCLEVBQUUsQ0FBRixDQUF6QixFQUErQixDQUEvQixFQUFrQyxJQUFJLEtBQUssRUFBM0MsRUFBK0MsS0FBL0M7QUFDQSxxQkFBSyxHQUFMLENBQVMsU0FBVCxHQUFxQixJQUFJLEtBQXpCO0FBQ0EscUJBQUssR0FBTCxDQUFTLElBQVQ7QUFDSCxhQU5ELENBTUUsT0FBTyxDQUFQLEVBQVU7QUFDUixvQkFBSSxFQUFFLGFBQWEsY0FBZixDQUFKLEVBQW9DO0FBQ2hDLDBCQUFNLENBQU47QUFDSDtBQUNKO0FBQ0o7Ozt1Q0FFYyxHLEVBQUs7QUFDaEIsZ0JBQUk7QUFDQSxvQkFBTSxJQUFJLEtBQUssYUFBTCxDQUFtQixHQUFuQixDQUFWO0FBQ0EscUJBQUssR0FBTCxDQUFTLFNBQVQ7QUFDQSxxQkFBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixFQUFFLENBQUYsQ0FBaEIsRUFBc0IsRUFBRSxDQUFGLENBQXRCO0FBQ0EscUJBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsRUFBRSxDQUFGLENBQWhCLEVBQXNCLEVBQUUsQ0FBRixDQUF0QjtBQUNBLHFCQUFLLEdBQUwsQ0FBUyxXQUFULEdBQXVCLFNBQXZCO0FBQ0EscUJBQUssR0FBTCxDQUFTLE1BQVQ7QUFDSCxhQVBELENBT0UsT0FBTyxDQUFQLEVBQVU7QUFDUixvQkFBSSxFQUFFLGFBQWEsY0FBZixDQUFKLEVBQW9DO0FBQ2hDLDBCQUFNLENBQU47QUFDSDtBQUNKO0FBQ0o7OztxQ0FFWTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNULHNDQUFtQixLQUFLLEtBQXhCLG1JQUErQjtBQUFBLHdCQUFwQixJQUFvQjs7QUFDM0Isd0JBQUk7QUFDQSw0QkFBTSxJQUFJLEtBQUssV0FBTCxDQUFpQixJQUFqQixDQUFWO0FBQ0EsNkJBQUssR0FBTCxDQUFTLFNBQVQ7QUFDQSw2QkFBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixFQUFFLENBQUYsQ0FBaEIsRUFBc0IsRUFBRSxDQUFGLENBQXRCO0FBQ0EsNkJBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsRUFBRSxDQUFGLENBQWhCLEVBQXNCLEVBQUUsQ0FBRixDQUF0QjtBQUNBLDZCQUFLLEdBQUwsQ0FBUyxXQUFULEdBQXVCLFNBQXZCO0FBQ0EsNkJBQUssR0FBTCxDQUFTLE1BQVQ7QUFDSCxxQkFQRCxDQU9FLE9BQU8sQ0FBUCxFQUFVO0FBQ1IsNEJBQUksRUFBRSxhQUFhLGNBQWYsQ0FBSixFQUFvQztBQUNoQyxrQ0FBTSxDQUFOO0FBQ0g7QUFDSjtBQUNKO0FBZFE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWVaOzs7b0NBRVcsRyxFQUFLO0FBQ2IsZ0JBQUksaUJBQWlCLElBQUksR0FBSixDQUFRLFFBQVIsQ0FBaUIsSUFBSSxRQUFyQixDQUFqQixJQUFtRCxDQUF2RCxFQUEwRDtBQUN0RCxxQkFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixJQUFJLElBQUosQ0FBUyxHQUFULENBQWhCO0FBQ0Esb0JBQUksUUFBSixHQUFlLElBQUksR0FBSixDQUFRLEtBQVIsRUFBZjtBQUNBLG9CQUFJLEtBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsS0FBSyxNQUFMLENBQVksU0FBcEMsRUFBK0M7QUFDM0MseUJBQUssS0FBTCxHQUFhLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsQ0FBakIsQ0FBYjtBQUNIO0FBQ0o7QUFDSjs7O3NDQUVhLEMsRUFBRyxDLEVBQXdEO0FBQUEsZ0JBQXJELENBQXFELHVFQUFqRCxJQUFpRDtBQUFBLGdCQUEzQyxDQUEyQyx1RUFBdkMsSUFBdUM7QUFBQSxnQkFBakMsS0FBaUMsdUVBQXpCLElBQXlCO0FBQUEsZ0JBQW5CLFVBQW1CLHVFQUFOLElBQU07O0FBQ3JFLGdCQUFNLE1BQU0sS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixDQUF6QixFQUE0QixDQUE1QixDQUFaO0FBQ0EsZ0JBQUksQ0FBQyxDQUFMLEVBQVE7QUFDSixvQkFBSSxRQUFRLE9BQU8sWUFBUCxDQUFvQixLQUFLLE1BQUwsQ0FBWSxRQUFoQyxDQUFaO0FBREk7QUFBQTtBQUFBOztBQUFBO0FBRUosMENBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUEsNEJBQWxCLElBQWtCOztBQUN6QixnQ0FBUSxJQUFJLEtBQUosRUFBVyxDQUFDLElBQUksSUFBSSxLQUFJLEdBQVIsRUFBYSxHQUFiLENBQUosSUFBeUIsS0FBSSxLQUFKLEVBQTFCLElBQXlDLEdBQXBELENBQVI7QUFDSDtBQUpHO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBS0osb0JBQUksT0FBTyxZQUFQLENBQW9CLE9BQU8sT0FBTyxZQUFQLENBQW9CLEtBQUssTUFBTCxDQUFZLFFBQWhDLENBQVAsRUFBa0QsS0FBbEQsQ0FBcEIsQ0FBSjtBQUNIO0FBQ0QsZ0JBQUksQ0FBQyxDQUFMLEVBQVE7QUFDSixvQkFBSSxnQkFBZ0IsT0FBTyxLQUFLLE1BQUwsQ0FBWSxZQUFaLEdBQTJCLENBQWxDLENBQWhCLEVBQXNELE9BQU8sQ0FBQyxHQUFSLEVBQWEsR0FBYixDQUF0RCxDQUFKO0FBQ0g7QUFDRCxnQkFBSSxDQUFDLEtBQUwsRUFBWTtBQUNSLHdCQUFRLFlBQVI7QUFDSDtBQUNELGdCQUFNLGlCQUFlLEtBQUssSUFBTCxDQUFVLE1BQS9CO0FBQ0EsZ0JBQU0sTUFBTSxJQUFJLE1BQUosQ0FBVyxLQUFLLE1BQWhCLEVBQXdCLENBQXhCLEVBQTJCLEdBQTNCLEVBQWdDLENBQWhDLEVBQW1DLEtBQW5DLEVBQTBDLEdBQTFDLEVBQStDLElBQS9DLEVBQXFELFVBQXJELENBQVo7QUFDQSxpQkFBSyxJQUFMLENBQVUsSUFBVixDQUFlLEdBQWY7QUFDSDs7OzRDQUVtQixNLEVBQWlCO0FBQUEsZ0JBQVQsR0FBUyx1RUFBSCxDQUFHOztBQUNqQyxtQkFBTyxxQkFBb0IsT0FBTyxDQUFQLENBQXBCLEVBQStCLEdBQS9CLENBQVA7QUFDSDs7OzRDQUVtQjtBQUNoQixnQkFBTSxZQUFZLEtBQUssTUFBTCxDQUFZLFNBQTlCO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLElBQUwsQ0FBVSxNQUE5QixFQUFzQyxHQUF0QyxFQUEyQztBQUN2QyxvQkFBTSxLQUFLLEtBQUssSUFBTCxDQUFVLENBQVYsQ0FBWDtBQUNBLHFCQUFLLElBQUksSUFBSSxJQUFJLENBQWpCLEVBQW9CLElBQUksS0FBSyxJQUFMLENBQVUsTUFBbEMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDM0Msd0JBQU0sS0FBSyxLQUFLLElBQUwsQ0FBVSxDQUFWLENBQVg7QUFDQSx3QkFBTSxZQUFZLElBQUksR0FBRyxHQUFQLEVBQVksR0FBRyxHQUFmLENBQWxCO0FBQ0Esd0JBQU0sU0FBUyxlQUFlLFNBQWYsQ0FBZjtBQUNBLHdCQUFNLElBQUksT0FBTyxLQUFQLEVBQVY7O0FBRUEsd0JBQUksSUFBSSxHQUFHLEtBQUgsS0FBYSxHQUFHLEtBQUgsRUFBckIsRUFBaUM7QUFDN0IsNEJBQU0sSUFBSSxLQUFLLG1CQUFMLENBQXlCLE1BQXpCLENBQVY7QUFDQSw0QkFBTSxLQUFLLEtBQUssbUJBQUwsQ0FBeUIsTUFBekIsRUFBaUMsQ0FBQyxDQUFsQyxDQUFYOztBQUVBLDRCQUFNLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBVixFQUFhLENBQWIsQ0FBRCxFQUFrQixPQUFPLEdBQUcsQ0FBVixFQUFhLENBQWIsQ0FBbEIsQ0FBZjtBQUNBLDRCQUFNLFVBQVUsQ0FBQyxPQUFPLENBQVAsRUFBVSxLQUFWLEVBQUQsRUFBb0IsT0FBTyxDQUFQLEVBQVUsS0FBVixFQUFwQixDQUFoQjtBQUNBLGdDQUFRLENBQVIsRUFBVyxDQUFYLElBQWdCLENBQUMsQ0FBQyxHQUFHLENBQUgsR0FBTyxHQUFHLENBQVgsSUFBZ0IsT0FBTyxDQUFQLEVBQVUsQ0FBVixDQUFoQixHQUErQixJQUFJLEdBQUcsQ0FBUCxHQUFXLE9BQU8sQ0FBUCxFQUFVLENBQVYsQ0FBM0MsS0FBNEQsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUF0RSxDQUFoQjtBQUNBLGdDQUFRLENBQVIsRUFBVyxDQUFYLElBQWdCLENBQUMsQ0FBQyxHQUFHLENBQUgsR0FBTyxHQUFHLENBQVgsSUFBZ0IsT0FBTyxDQUFQLEVBQVUsQ0FBVixDQUFoQixHQUErQixJQUFJLEdBQUcsQ0FBUCxHQUFXLE9BQU8sQ0FBUCxFQUFVLENBQVYsQ0FBM0MsS0FBNEQsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUF0RSxDQUFoQjtBQUNBLDJCQUFHLENBQUgsR0FBTyxPQUFPLFFBQVEsQ0FBUixDQUFQLEVBQW1CLEVBQW5CLENBQVA7QUFDQSwyQkFBRyxDQUFILEdBQU8sT0FBTyxRQUFRLENBQVIsQ0FBUCxFQUFtQixFQUFuQixDQUFQOztBQUVBLDRCQUFNLFdBQVcsQ0FBQyxNQUFNLFNBQU4sQ0FBRCxFQUFtQixPQUFPLFNBQVAsRUFBa0IsQ0FBbEIsQ0FBbkIsQ0FBakI7QUFDQSxpQ0FBUyxDQUFULEVBQVksQ0FBWixLQUFrQixRQUFRLENBQVIsRUFBVyxDQUFYLENBQWxCO0FBQ0EsaUNBQVMsQ0FBVCxFQUFZLENBQVosS0FBa0IsUUFBUSxDQUFSLEVBQVcsQ0FBWCxDQUFsQjtBQUNBLDJCQUFHLEdBQUgsR0FBUyxHQUFHLEdBQUgsQ0FBTyxHQUFQLENBQVcsT0FBTyxTQUFTLENBQVQsQ0FBUCxFQUFvQixFQUFwQixDQUFYLENBQVQ7QUFDQSwyQkFBRyxHQUFILEdBQVMsR0FBRyxHQUFILENBQU8sR0FBUCxDQUFXLE9BQU8sU0FBUyxDQUFULENBQVAsRUFBb0IsRUFBcEIsQ0FBWCxDQUFUO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7Ozt3Q0FFZTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNaLHNDQUFrQixLQUFLLElBQXZCLG1JQUE2QjtBQUFBLHdCQUFsQixHQUFrQjs7QUFDekIsd0JBQUksa0JBQUo7QUFDSDtBQUhXO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBS1osaUJBQUssaUJBQUw7O0FBTFk7QUFBQTtBQUFBOztBQUFBO0FBT1osc0NBQWtCLEtBQUssSUFBdkIsbUlBQTZCO0FBQUEsd0JBQWxCLEtBQWtCOztBQUN6QiwwQkFBSSxrQkFBSjtBQUNBLHlCQUFLLFdBQUwsQ0FBaUIsS0FBakI7QUFDSDtBQVZXO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFXZjs7O3FDQUVZO0FBQ1QsaUJBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsS0FBSyxNQUFMLENBQVksQ0FBckMsRUFBd0MsS0FBSyxNQUFMLENBQVksQ0FBcEQ7QUFEUztBQUFBO0FBQUE7O0FBQUE7QUFFVCxzQ0FBa0IsS0FBSyxJQUF2QixtSUFBNkI7QUFBQSx3QkFBbEIsR0FBa0I7O0FBQ3pCLHlCQUFLLFdBQUwsQ0FBaUIsR0FBakI7QUFDQSx5QkFBSyxjQUFMLENBQW9CLEdBQXBCO0FBQ0g7QUFMUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1ULGlCQUFLLFVBQUw7QUFDSDs7O29DQUVXO0FBQ1IsaUJBQUssU0FBTCxJQUFrQixDQUFsQjtBQUNBLGdCQUFNLGVBQWUsS0FBckI7QUFDQSxnQkFBTSxnQkFBZ0IsZUFBZSxLQUFLLGFBQTFDO0FBQ0EsZ0JBQUksZ0JBQWdCLENBQXBCLEVBQXVCO0FBQ25CLHdCQUFRLEdBQVIsRUFBZ0IsS0FBSyxTQUFMLEdBQWlCLGFBQWxCLEdBQW1DLENBQWxEO0FBQ0EscUJBQUssYUFBTCxHQUFxQixZQUFyQjtBQUNBLHFCQUFLLFNBQUwsR0FBaUIsQ0FBakI7QUFDSDtBQUNKOzs7Ozs7QUFHTCxPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7Ozs7Ozs7QUNqTkEsSUFBTSxXQUFXLFFBQVEsTUFBUixDQUFqQjtBQUNBLElBQU0sV0FBVyxRQUFRLGNBQVIsQ0FBakI7QUFDQSxJQUFNLFNBQVMsUUFBUSxrQkFBUixDQUFmOztlQUNrSCxRQUFRLFNBQVIsQztJQUEzRyxnQixZQUFBLGdCO0lBQWtCLE0sWUFBQSxNO0lBQVEscUIsWUFBQSxxQjtJQUF1QixxQixZQUFBLHFCO0lBQXVCLFUsWUFBQSxVO0lBQVksbUIsWUFBQSxtQjs7Z0JBQzdDLFFBQVEsV0FBUixDO0lBQXZDLEssYUFBQSxLO0lBQU8sRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHOztJQUNoQyxHLEdBQU8sSSxDQUFQLEc7O0lBR0QsUTs7O0FBQ0Ysc0JBQVksTUFBWixFQUFvQixHQUFwQixFQUF5QjtBQUFBOztBQUFBLHdIQUNmLE1BRGUsRUFDUCxHQURPOztBQUVyQixjQUFLLE1BQUwsR0FBYyxJQUFJLFFBQUosQ0FBYSxNQUFiLFFBQWQ7QUFGcUI7QUFHeEI7Ozs7c0NBR2EsQyxFQUFHLEMsRUFBd0Q7QUFBQSxnQkFBckQsQ0FBcUQsdUVBQWpELElBQWlEO0FBQUEsZ0JBQTNDLENBQTJDLHVFQUF2QyxJQUF1QztBQUFBLGdCQUFqQyxLQUFpQyx1RUFBekIsSUFBeUI7QUFBQSxnQkFBbkIsVUFBbUIsdUVBQU4sSUFBTTs7QUFDckUsZ0JBQU0sTUFBTSxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLENBQXpCLEVBQTRCLENBQTVCLENBQVo7QUFDQSxnQkFBSSxDQUFDLENBQUwsRUFBUTtBQUNKLG9CQUFJLFFBQVEsT0FBTyxZQUFQLENBQW9CLEtBQUssTUFBTCxDQUFZLFFBQWhDLENBQVo7QUFESTtBQUFBO0FBQUE7O0FBQUE7QUFFSix5Q0FBa0IsS0FBSyxJQUF2Qiw4SEFBNkI7QUFBQSw0QkFBbEIsSUFBa0I7O0FBQ3pCLGdDQUFRLElBQUksS0FBSixFQUFXLENBQUMsSUFBSSxLQUFJLEdBQUosR0FBVSxHQUFkLElBQXFCLEtBQUksS0FBSixFQUF0QixJQUFxQyxHQUFoRCxDQUFSO0FBQ0g7QUFKRztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUtKLG9CQUFJLE9BQU8sWUFBUCxDQUFvQixPQUFPLE9BQU8sWUFBUCxDQUFvQixLQUFLLE1BQUwsQ0FBWSxRQUFoQyxDQUFQLEVBQWtELEtBQWxELENBQXBCLENBQUo7QUFDSDtBQUNELGdCQUFJLENBQUMsQ0FBTCxFQUFRO0FBQ0osb0JBQUksb0JBQW9CLE9BQU8sS0FBSyxNQUFMLENBQVksWUFBWixHQUEyQixDQUFsQyxDQUFwQixFQUEwRCxPQUFPLENBQUMsR0FBUixFQUFhLEdBQWIsQ0FBMUQsRUFBNkUsT0FBTyxDQUFDLEdBQVIsRUFBYSxHQUFiLENBQTdFLENBQUo7QUFDSDtBQUNELGdCQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1Isd0JBQVEsWUFBUjtBQUNIO0FBQ0QsZ0JBQU0saUJBQWUsS0FBSyxJQUFMLENBQVUsTUFBL0I7QUFDQSxnQkFBTSxNQUFNLElBQUksTUFBSixDQUFXLEtBQUssTUFBaEIsRUFBd0IsQ0FBeEIsRUFBMkIsR0FBM0IsRUFBZ0MsQ0FBaEMsRUFBbUMsS0FBbkMsRUFBMEMsR0FBMUMsRUFBK0MsSUFBL0MsRUFBcUQsVUFBckQsQ0FBWjtBQUNBLGlCQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsR0FBZjtBQUNIOzs7NENBRW1CLE0sRUFBaUI7QUFBQSxnQkFBVCxHQUFTLHVFQUFILENBQUc7O0FBQ2pDLG1CQUFPLE9BQU8sQ0FBUCxHQUNELHNCQUFzQixPQUFPLENBQVAsQ0FBdEIsSUFBbUMsc0JBQXNCLE9BQU8sQ0FBUCxDQUF0QixDQURsQyxHQUVELHNCQUFzQixPQUFPLENBQVAsQ0FBdEIsRUFBaUMsQ0FBQyxDQUFsQyxJQUF1QyxzQkFBc0IsT0FBTyxDQUFQLENBQXRCLEVBQWlDLENBQUMsQ0FBbEMsQ0FGN0M7QUFHSDs7OztFQS9Ca0IsUTs7QUFrQ3ZCLE9BQU8sT0FBUCxHQUFpQixRQUFqQjs7Ozs7Ozs7Ozs7SUMxQ00sYzs7Ozs7Ozs7OztFQUF1QixLOztBQUc3QixPQUFPLE9BQVAsR0FBaUIsY0FBakI7Ozs7Ozs7OztBQ0hBLElBQU0sV0FBVyxRQUFRLGFBQVIsQ0FBakI7QUFDQSxJQUFNLFdBQVcsUUFBUSxhQUFSLENBQWpCOztlQUN1QixRQUFRLFFBQVIsQztJQUFoQixZLFlBQUEsWTs7QUFHUCxJQUFJLFNBQVMsSUFBYjtBQUNBLElBQU0sU0FBUztBQUNYLFFBQUksSUFETztBQUVYLFFBQUksTUFGTztBQUdYLFFBQUksTUFITztBQUlYLFFBQUksT0FKTztBQUtYLFFBQUksU0FMTyxFQUtJO0FBQ2YsUUFBSSxVQU5PLEVBTUs7QUFDaEIsUUFBSSxXQVBPLEVBT007QUFDakIsUUFBSSxhQVJPLEVBUVE7QUFDbkIsUUFBSSxhQVRPLEVBU1E7QUFDbkIsUUFBSSxjQVZPLENBVVE7QUFWUixDQUFmOztBQWFBLFNBQVMsU0FBVCxDQUFtQixPQUFuQixFQUE0QjtBQUN4QixXQUFPLENBQVAsR0FBVyxRQUFRLENBQVIsRUFBVyxLQUFYLEdBQW1CLFFBQVEsS0FBUixFQUE5QjtBQUNBLFdBQU8sQ0FBUCxHQUFXLFFBQVEsQ0FBUixFQUFXLE1BQVgsR0FBb0IsUUFBUSxNQUFSLEVBQS9CO0FBRUg7O0FBRUQsU0FBUyxRQUFULENBQWtCLEtBQWxCLEVBQXlCLE1BQXpCLEVBQWlDO0FBQzdCLFFBQU0sSUFBSSxNQUFNLEtBQWhCO0FBQ0EsUUFBTSxJQUFJLE1BQU0sS0FBaEI7QUFDQSxRQUFJLENBQUMsT0FBTyxTQUFaLEVBQXVCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ25CLGlDQUFrQixPQUFPLElBQXpCLDhIQUErQjtBQUFBLG9CQUFwQixHQUFvQjs7QUFDM0Isb0JBQU0sSUFBSSxPQUFPLGFBQVAsQ0FBcUIsR0FBckIsQ0FBVjtBQUNBLG9CQUFNLEtBQUssQ0FBQyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBUixJQUFnQixDQUEzQjtBQUNBLG9CQUFNLEtBQUssQ0FBQyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBUixJQUFnQixDQUEzQjtBQUNBLG9CQUFNLElBQUksQ0FBQyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBUixJQUFnQixDQUExQjtBQUNBLG9CQUFJLGFBQWEsRUFBYixFQUFpQixFQUFqQixFQUFxQixDQUFyQixFQUF3QixDQUF4QixJQUE2QixDQUFqQyxFQUFvQztBQUNoQyx3QkFBSSxlQUFKO0FBQ0E7QUFDSDtBQUNKO0FBVmtCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBV25CLGVBQU8sYUFBUCxDQUFxQixDQUFyQixFQUF3QixDQUF4QjtBQUNIO0FBQ0o7O0FBRUQsU0FBUyxXQUFULENBQXFCLEtBQXJCLEVBQTRCLE1BQTVCLEVBQW9DO0FBQUEsUUFDekIsT0FEeUIsR0FDZCxLQURjLENBQ3pCLE9BRHlCOztBQUVoQyxRQUFJLFdBQVcsRUFBZixFQUFtQjtBQUFFO0FBQ2pCLGVBQU8sb0JBQVA7QUFDQSxlQUFPLFNBQVAsR0FBbUIsQ0FBQyxPQUFPLFNBQTNCO0FBQ0EsaUJBQVMsS0FBVCxHQUFvQixPQUFPLEtBQTNCLFdBQXFDLE9BQU8sU0FBUCxHQUFtQixZQUFuQixHQUFrQyxRQUF2RTtBQUNILEtBSkQsTUFJTyxJQUFJLFdBQVcsTUFBWCxJQUFxQixPQUFPLE9BQVAsS0FBbUIsT0FBTyxNQUFuRCxFQUEyRDtBQUM5RCxlQUFPLE1BQVAsQ0FBYyxPQUFPLE9BQVAsQ0FBZCxFQUErQixPQUEvQjtBQUNIO0FBQ0o7O0lBRUssUztBQUNGLHVCQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFBQTs7QUFDaEIsaUJBQVMsT0FBTyxFQUFQLENBQVQ7QUFDQSxZQUFNLFVBQVUsRUFBRSxRQUFGLENBQWhCO0FBQ0EsWUFBTSxNQUFNLFFBQVEsQ0FBUixFQUFXLFVBQVgsQ0FBc0IsSUFBdEIsQ0FBWjtBQUNBLGtCQUFVLE9BQVY7QUFDQSxhQUFLLE1BQUwsR0FBYyxLQUFLLE9BQU8sU0FBUCxJQUFvQixDQUFwQixHQUF3QixRQUF4QixHQUFtQyxRQUF4QyxFQUFrRCxNQUFsRCxFQUEwRCxHQUExRCxDQUFkO0FBQ0EsZ0JBQVEsTUFBUixDQUFlLGFBQUs7QUFDaEIsc0JBQVUsT0FBVjtBQUNILFNBRkQ7QUFHQSxnQkFBUSxLQUFSLENBQWMsYUFBSztBQUNmLHFCQUFTLENBQVQsRUFBWSxNQUFLLE1BQWpCO0FBQ0gsU0FGRDtBQUdBLFVBQUUsTUFBRixFQUFVLE9BQVYsQ0FBa0IsYUFBSztBQUNuQix3QkFBWSxDQUFaLEVBQWUsTUFBSyxNQUFwQjtBQUNILFNBRkQ7QUFHSDs7OztrQ0FFUztBQUNOLGlCQUFLLE1BQUwsQ0FBWSxPQUFaO0FBQ0g7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7Ozs7QUM3RUEsU0FBUyxJQUFULENBQWMsQ0FBZCxFQUFpQixJQUFqQixFQUF1QjtBQUNuQixRQUFNLE1BQU0sRUFBRSxNQUFkO0FBQ0EsUUFBTSxJQUFJLElBQUksS0FBSixDQUFVLEdBQVYsQ0FBVjtBQUNBLFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxHQUFwQixFQUF5QixHQUF6QixFQUE4QjtBQUMxQixVQUFFLENBQUYsSUFBTyxLQUFLLENBQUwsQ0FBUDtBQUNIO0FBQ0QsV0FBTyxDQUFQO0FBQ0g7O0FBRUQsT0FBTyxPQUFQLEdBQWlCO0FBQ2IsV0FBTyxrQkFBSztBQUNSLGNBQU0sS0FBTixDQUFZLElBQVosRUFBa0IsTUFBTSxDQUFOLENBQWxCLEVBQTRCLEdBQTVCLENBQWdDLE9BQU8sU0FBUCxDQUFpQixPQUFqRCxFQUF5RCxDQUF6RDtBQUNILEtBSFk7O0FBS2IsU0FBSyxnQkFBSztBQUNOLFlBQU0sTUFBTSxFQUFFLE1BQWQ7QUFDQSxZQUFJLE1BQU0sQ0FBVjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxHQUFwQixFQUF5QixHQUF6QixFQUE4QjtBQUMxQixtQkFBTyxFQUFFLENBQUYsSUFBTyxFQUFFLENBQUYsQ0FBZDtBQUNIO0FBQ0QsZUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQVA7QUFDSCxLQVpZOztBQWNiLFNBQUssYUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ1gsZUFBTyxLQUFLLENBQUwsRUFBUSxhQUFLO0FBQ2hCLG1CQUFPLEVBQUUsQ0FBRixJQUFPLEVBQUUsQ0FBRixDQUFkO0FBQ0gsU0FGTSxDQUFQO0FBR0gsS0FsQlk7O0FBb0JiLFNBQUssYUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ1gsZUFBTyxLQUFLLENBQUwsRUFBUSxhQUFLO0FBQ2hCLG1CQUFPLEVBQUUsQ0FBRixJQUFPLEVBQUUsQ0FBRixDQUFkO0FBQ0gsU0FGTSxDQUFQO0FBR0gsS0F4Qlk7O0FBMEJiLFNBQUssYUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ1gsZUFBTyxLQUFLLENBQUwsRUFBUSxhQUFLO0FBQ2hCLG1CQUFPLEVBQUUsQ0FBRixJQUFPLENBQWQ7QUFDSCxTQUZNLENBQVA7QUFHSCxLQTlCWTs7QUFnQ2IsU0FBSyxhQUFDLENBQUQsRUFBSSxDQUFKLEVBQVU7QUFDWCxlQUFPLEtBQUssQ0FBTCxFQUFRLGFBQUs7QUFDaEIsbUJBQU8sRUFBRSxDQUFGLElBQU8sQ0FBZDtBQUNILFNBRk0sQ0FBUDtBQUdILEtBcENZOztBQXNDYixTQUFLLGFBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUNYLFlBQU0sTUFBTSxFQUFFLE1BQWQ7QUFDQSxZQUFNLE1BQU0sRUFBRSxDQUFGLEVBQUssTUFBakI7QUFDQSxZQUFNLE1BQU0sRUFBRSxDQUFGLEVBQUssTUFBakI7QUFDQSxZQUFNLElBQUksSUFBSSxLQUFKLENBQVUsR0FBVixDQUFWO0FBQ0EsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEdBQXBCLEVBQXlCLEdBQXpCLEVBQThCO0FBQzFCLGNBQUUsQ0FBRixJQUFPLElBQUksS0FBSixDQUFVLEdBQVYsQ0FBUDtBQUNBLGlCQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksR0FBcEIsRUFBeUIsR0FBekIsRUFBOEI7QUFDMUIsa0JBQUUsQ0FBRixFQUFLLENBQUwsSUFBVSxDQUFWO0FBQ0EscUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxHQUFwQixFQUF5QixHQUF6QixFQUE4QjtBQUMxQixzQkFBRSxDQUFGLEVBQUssQ0FBTCxLQUFXLEVBQUUsQ0FBRixFQUFLLENBQUwsSUFBVSxFQUFFLENBQUYsRUFBSyxDQUFMLENBQXJCO0FBQ0g7QUFDSjtBQUNKO0FBQ0QsZUFBTyxDQUFQO0FBQ0g7QUFyRFksQ0FBakI7Ozs7Ozs7OztBQ1RBLElBQU0sYUFBYSxRQUFRLHdCQUFSLENBQW5CO0FBQ0EsSUFBTSxhQUFhLFFBQVEsdUJBQVIsQ0FBbkI7O2VBQ3NGLFFBQVEsU0FBUixDO0lBQS9FLGdCLFlBQUEsZ0I7SUFBa0IsTyxZQUFBLE87SUFBUyxPLFlBQUEsTztJQUFTLGUsWUFBQSxlO0lBQWlCLGMsWUFBQSxjO0lBQWdCLE0sWUFBQSxNOztnQkFDOUIsUUFBUSxXQUFSLEM7SUFBdkMsSyxhQUFBLEs7SUFBTyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7SUFBSyxHLGFBQUEsRztJQUFLLEcsYUFBQSxHO0lBQUssRyxhQUFBLEc7O0lBQ2hDLEcsR0FBWSxJLENBQVosRztJQUFLLEcsR0FBTyxJLENBQVAsRzs7SUFHTixNO0FBQ0Y7Ozs7O0FBS0Esb0JBQVksTUFBWixFQUFvQixDQUFwQixFQUF1QixHQUF2QixFQUE0QixDQUE1QixFQUErQixLQUEvQixFQUFzQyxHQUF0QyxFQUEyQyxNQUEzQyxFQUFtRCxVQUFuRCxFQUErRDtBQUFBOztBQUMzRCxhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssR0FBTCxHQUFXLEdBQVg7QUFDQSxhQUFLLFFBQUwsR0FBZ0IsSUFBSSxLQUFKLEVBQWhCO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxhQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsYUFBSyxNQUFMLEdBQWMsTUFBZDs7QUFFQSxhQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDQSxZQUFJLFVBQUosRUFBZ0I7QUFDWixpQkFBSyxlQUFMO0FBQ0g7QUFDSjs7OztnQ0FFTztBQUNKLG1CQUFPLE9BQU8sWUFBUCxDQUFvQixLQUFLLENBQXpCLENBQVA7QUFDSDs7OzZDQUVvQjtBQUNqQixnQkFBSSxJQUFJLE1BQU0sS0FBSyxNQUFMLENBQVksU0FBbEIsQ0FBUjtBQURpQjtBQUFBO0FBQUE7O0FBQUE7QUFFakIscUNBQWtCLEtBQUssTUFBTCxDQUFZLElBQTlCLDhIQUFvQztBQUFBLHdCQUF6QixHQUF5Qjs7QUFDaEMsd0JBQUksT0FBTyxJQUFYLEVBQWlCO0FBQ2pCLHdCQUFNLFNBQVMsSUFBSSxLQUFLLEdBQVQsRUFBYyxJQUFJLEdBQWxCLENBQWY7QUFDQSx3QkFBTSxZQUFZLElBQUksTUFBSixDQUFsQjtBQUNBLHdCQUFNLGNBQWMsSUFBSSxNQUFKLEVBQVksU0FBWixDQUFwQjtBQUNBLHdCQUFJLElBQUksQ0FBSixFQUFPLElBQUksSUFBSSxDQUFKLEdBQVEsT0FBTyxTQUFQLENBQVosRUFBK0IsV0FBL0IsQ0FBUCxDQUFKO0FBQ0g7QUFSZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTakIsZ0JBQUksSUFBSSxDQUFKLEVBQU8sQ0FBQyxLQUFLLE1BQUwsQ0FBWSxDQUFiLEdBQWlCLEtBQUssQ0FBN0IsQ0FBSjtBQUNBLGdCQUFNLElBQUksSUFBSSxDQUFKLEVBQU8sS0FBSyxDQUFaLENBQVY7QUFDQSxpQkFBSyxDQUFMLEdBQVMsSUFBSSxLQUFLLENBQVQsRUFBWSxDQUFaLENBQVQ7QUFDSDs7OzZDQUVvQjtBQUNqQixpQkFBSyxHQUFMLEdBQVcsSUFBSSxLQUFLLEdBQVQsRUFBYyxLQUFLLENBQW5CLENBQVg7QUFDSDs7O2tDQUVTLEMsRUFBRztBQUNULGdCQUFNLElBQUksS0FBSyxZQUFMLENBQWtCLEdBQWxCLEVBQVY7QUFDQSxpQkFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNIOzs7b0NBRVcsQyxFQUFHO0FBQ1gsZ0JBQU0sSUFBSSxLQUFLLGdCQUFMLENBQXNCLEdBQXRCLEVBQVY7QUFDQSxnQkFBTSxJQUFJLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBVjtBQUNBLGlCQUFLLEdBQUwsR0FBVyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVg7QUFDSDs7O2tDQUVTLEMsRUFBRztBQUNULGdCQUFNLE1BQU0sUUFBUSxLQUFLLGdCQUFMLENBQXNCLEdBQXRCLEVBQVIsQ0FBWjtBQUNBLGdCQUFNLE1BQU0sS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUFaO0FBQ0EsaUJBQUssQ0FBTCxHQUFTLGdCQUFnQixHQUFoQixFQUFxQixHQUFyQixDQUFUO0FBQ0g7OzswQ0FFaUI7QUFDZCxnQkFBSTtBQUNBLHFCQUFLLFVBQUwsQ0FBZ0IsRUFBaEIsQ0FBbUIsSUFBbkI7QUFDSCxhQUZELENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDUixvQkFBTSxTQUFTLEdBQWY7O0FBRUEsb0JBQUksWUFBWSxJQUFJLElBQUksS0FBSyxNQUFMLENBQVksQ0FBaEIsRUFBbUIsS0FBSyxNQUFMLENBQVksQ0FBL0IsSUFBb0MsQ0FBeEMsRUFBMkMsSUFBSSxLQUFKLENBQVUsSUFBVixFQUFnQixLQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsS0FBSyxHQUFsQixDQUFoQixJQUEwQyxNQUFyRixDQUFoQjtBQUhRO0FBQUE7QUFBQTs7QUFBQTtBQUlSLDBDQUFrQixLQUFLLE1BQUwsQ0FBWSxJQUE5QixtSUFBb0M7QUFBQSw0QkFBekIsR0FBeUI7O0FBQ2hDLG9DQUFZLElBQUksU0FBSixFQUFlLElBQUksS0FBSixDQUFVLElBQVYsRUFBZ0IsSUFBSSxHQUFKLENBQVEsR0FBUixDQUFZLEtBQUssR0FBakIsQ0FBaEIsSUFBeUMsTUFBeEQsQ0FBWjtBQUNIO0FBTk87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFRUixvQkFBTSxJQUFJLEtBQUssQ0FBZjs7QUFFQSxvQkFBTSxJQUFJLGVBQWUsS0FBSyxDQUFwQixDQUFWO0FBQ0Esb0JBQUksVUFBVSxJQUFJLEtBQUssTUFBTCxDQUFZLFlBQWhCLEVBQThCLElBQUksS0FBSyxDQUFULElBQWMsTUFBNUMsQ0FBZDtBQVhRO0FBQUE7QUFBQTs7QUFBQTtBQVlSLDBDQUFrQixLQUFLLE1BQUwsQ0FBWSxJQUE5QixtSUFBb0M7QUFBQSw0QkFBekIsSUFBeUI7O0FBQ2hDLGtDQUFVLElBQUksT0FBSixFQUFhLElBQUksS0FBSSxDQUFSLElBQWEsTUFBMUIsQ0FBVjtBQUNIO0FBZE87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFnQlIscUJBQUssaUJBQUwsQ0FBdUIsU0FBdkIsRUFBa0MsQ0FBbEMsRUFBcUMsQ0FBckMsRUFBd0MsT0FBeEM7QUFDQSxxQkFBSyxVQUFMLEdBQWtCLElBQUksVUFBSixDQUFlLEtBQUssR0FBcEIsRUFBeUIsS0FBSyxlQUFMLEVBQXpCLENBQWxCO0FBQ0EscUJBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsSUFBekIsQ0FBOEIsS0FBSyxVQUFuQztBQUNIO0FBQ0o7OzswQ0FFaUIsUyxFQUFXLEMsRUFBRyxDLEVBQUcsTyxFQUFTO0FBQ3hDLGlCQUFLLFlBQUwsR0FBb0IsSUFBSSxVQUFKLENBQWUsUUFBZixFQUF5QixLQUFLLE1BQUwsQ0FBWSxRQUFyQyxFQUErQyxLQUFLLE1BQUwsQ0FBWSxRQUEzRCxFQUFxRSxDQUFyRSxFQUF3RSxLQUFLLFNBQTdFLENBQXBCO0FBQ0EsaUJBQUssZ0JBQUwsR0FBd0IsSUFBSSxVQUFKLENBQWUsWUFBZixFQUE2QixDQUFDLFNBQTlCLEVBQXlDLFNBQXpDLEVBQW9ELEtBQUssR0FBTCxDQUFTLENBQVQsQ0FBcEQsRUFBaUUsS0FBSyxXQUF0RSxDQUF4QjtBQUNBLGlCQUFLLGdCQUFMLEdBQXdCLElBQUksVUFBSixDQUFlLFlBQWYsRUFBNkIsQ0FBQyxTQUE5QixFQUF5QyxTQUF6QyxFQUFvRCxLQUFLLEdBQUwsQ0FBUyxDQUFULENBQXBELEVBQWlFLEtBQUssV0FBdEUsQ0FBeEI7QUFDQSxpQkFBSyxnQkFBTCxHQUF3QixJQUFJLFVBQUosQ0FBZSxZQUFmLEVBQTZCLENBQTdCLEVBQWdDLE9BQWhDLEVBQXlDLEVBQUUsQ0FBRixDQUF6QyxFQUErQyxLQUFLLFNBQXBELENBQXhCO0FBQ0EsaUJBQUssZ0JBQUwsR0FBd0IsSUFBSSxVQUFKLENBQWUsWUFBZixFQUE2QixDQUFDLEdBQTlCLEVBQW1DLEdBQW5DLEVBQXdDLFFBQVEsRUFBRSxDQUFGLENBQVIsQ0FBeEMsRUFBdUQsS0FBSyxTQUE1RCxDQUF4QjtBQUNIOzs7MENBRWlCO0FBQ2QsbUJBQU8sQ0FDSCxLQUFLLFlBREYsRUFFSCxLQUFLLGdCQUZGLEVBR0gsS0FBSyxnQkFIRixFQUlILEtBQUssZ0JBSkYsRUFLSCxLQUFLLGdCQUxGLENBQVA7QUFPSDs7O21DQVVVO0FBQ1AsbUJBQU8sS0FBSyxTQUFMLENBQWUsRUFBQyxPQUFPLEtBQUssR0FBYixFQUFrQixLQUFLLEtBQUssQ0FBNUIsRUFBK0IsT0FBTyxLQUFLLEdBQTNDLEVBQWYsQ0FBUDtBQUNIOzs7cUNBVm1CLEMsRUFBRztBQUNuQixtQkFBTyxJQUFJLENBQUosRUFBTyxJQUFJLENBQVgsQ0FBUDtBQUNIOzs7cUNBRW1CLEMsRUFBRztBQUNuQixtQkFBTyxPQUFPLENBQVAsQ0FBUDtBQUNIOzs7Ozs7QUFPTCxPQUFPLE9BQVAsR0FBaUIsTUFBakI7Ozs7Ozs7Ozs7Ozs7OztBQzVIQSxJQUFNLFNBQVMsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNLGFBQWEsUUFBUSx1QkFBUixDQUFuQjs7ZUFDZ0QsUUFBUSxTQUFSLEM7SUFBekMsTyxZQUFBLE87SUFBUyxPLFlBQUEsTztJQUFTLG1CLFlBQUEsbUI7O2dCQUNWLFFBQVEsU0FBUixDO0lBQVIsSSxhQUFBLEk7O0lBQ0EsRyxHQUFPLEksQ0FBUCxHOztJQUdELE07Ozs7Ozs7Ozs7OztBQUNGOzs7OztnQ0FLUTtBQUNKLG1CQUFPLE9BQU8sWUFBUCxDQUFvQixLQUFLLENBQXpCLENBQVA7QUFDSDs7O29DQUVXLEMsRUFBRztBQUNYLGdCQUFNLElBQUksS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUFWO0FBQ0EsZ0JBQU0sSUFBSSxLQUFLLGdCQUFMLENBQXNCLEdBQXRCLEVBQVY7QUFDQSxnQkFBTSxJQUFJLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBVjtBQUNBLGlCQUFLLEdBQUwsR0FBVyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFYO0FBQ0g7OztrQ0FFUyxDLEVBQUc7QUFDVCxnQkFBTSxNQUFNLFFBQVEsS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUFSLENBQVo7QUFDQSxnQkFBTSxRQUFRLFFBQVEsS0FBSyxrQkFBTCxDQUF3QixHQUF4QixFQUFSLENBQWQ7QUFDQSxnQkFBTSxNQUFNLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBWjtBQUNBLGlCQUFLLENBQUwsR0FBUyxvQkFBb0IsR0FBcEIsRUFBeUIsR0FBekIsRUFBOEIsS0FBOUIsQ0FBVDtBQUNIOzs7MENBRWlCLFMsRUFBVyxDLEVBQUcsQyxFQUFHLE8sRUFBUztBQUN4Qyw4SEFBd0IsU0FBeEIsRUFBbUMsQ0FBbkMsRUFBc0MsQ0FBdEMsRUFBeUMsT0FBekM7QUFDQSxpQkFBSyxnQkFBTCxHQUF3QixJQUFJLFVBQUosQ0FBZSxZQUFmLEVBQTZCLENBQUMsU0FBOUIsRUFBeUMsU0FBekMsRUFBb0QsS0FBSyxHQUFMLENBQVMsQ0FBVCxDQUFwRCxFQUFpRSxLQUFLLFdBQXRFLENBQXhCO0FBQ0EsaUJBQUssa0JBQUwsR0FBMEIsSUFBSSxVQUFKLENBQWUsWUFBZixFQUE2QixDQUFDLEdBQTlCLEVBQW1DLEdBQW5DLEVBQXdDLFFBQVEsRUFBRSxDQUFGLENBQVIsQ0FBeEMsRUFBdUQsS0FBSyxTQUE1RCxDQUExQjtBQUNIOzs7MENBRWlCO0FBQ2QsbUJBQU8sQ0FDSCxLQUFLLFlBREYsRUFFSCxLQUFLLGdCQUZGLEVBR0gsS0FBSyxnQkFIRixFQUlILEtBQUssZ0JBSkYsRUFLSCxLQUFLLGdCQUxGLEVBTUgsS0FBSyxnQkFORixFQU9ILEtBQUssa0JBUEYsQ0FBUDtBQVNIOzs7cUNBRW1CLEMsRUFBRztBQUNuQixtQkFBTyxJQUFJLENBQUosRUFBTyxJQUFJLENBQVgsQ0FBUDtBQUNIOzs7cUNBRW1CLEMsRUFBRztBQUNuQixtQkFBTyxLQUFLLENBQUwsQ0FBUDtBQUNIOzs7O0VBaERnQixNOztBQW1EckIsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7OztlQzFEOEMsUUFBUSxVQUFSLEM7SUFBdkMsSyxZQUFBLEs7SUFBTyxHLFlBQUEsRztJQUFLLEcsWUFBQSxHO0lBQUssRyxZQUFBLEc7SUFBSyxHLFlBQUEsRztJQUFLLEcsWUFBQSxHO0lBQUssRyxZQUFBLEc7O0FBRXZDLElBQU0sT0FBTztBQUNULFlBQVEsZ0JBQUMsQ0FBRCxFQUFPO0FBQ1gsZUFBTyxJQUFJLENBQVg7QUFDSCxLQUhROztBQUtULFVBQU0sY0FBQyxDQUFELEVBQU87QUFDVCxlQUFPLElBQUksQ0FBSixHQUFRLENBQWY7QUFDSCxLQVBROztBQVNULHFCQUFpQix5QkFBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQzNCLGVBQU8sQ0FDSCxNQUFNLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FESCxFQUVILE1BQU0sS0FBSyxHQUFMLENBQVMsR0FBVCxDQUZILENBQVA7QUFJSCxLQWRROztBQWdCVCxxQkFBaUIseUJBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUN2QixlQUFPLENBQ0gsS0FBSyxJQUFMLENBQVUsS0FBSyxNQUFMLENBQVksQ0FBWixJQUFpQixLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQTNCLENBREcsRUFFSCxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsQ0FBZCxDQUZHLENBQVA7QUFJSCxLQXJCUTs7QUF1QlQseUJBQXFCLDZCQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsS0FBWCxFQUFxQjtBQUN0QyxlQUFPLENBQ0gsTUFBTSxLQUFLLEdBQUwsQ0FBUyxLQUFULENBQU4sR0FBd0IsS0FBSyxHQUFMLENBQVMsR0FBVCxDQURyQixFQUVILE1BQU0sS0FBSyxHQUFMLENBQVMsS0FBVCxDQUFOLEdBQXdCLEtBQUssR0FBTCxDQUFTLEdBQVQsQ0FGckIsRUFHSCxNQUFNLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FISCxDQUFQO0FBS0gsS0E3QlE7O0FBK0JULHlCQUFxQiw2QkFBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBYTtBQUM5QixZQUFNLE1BQU0sS0FBSyxJQUFMLENBQVUsS0FBSyxNQUFMLENBQVksQ0FBWixJQUFpQixLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQWpCLEdBQWtDLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBNUMsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxHQURHLEVBRUgsS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FGRyxFQUdILE9BQU8sQ0FBUCxHQUFXLEtBQUssSUFBTCxDQUFVLElBQUksR0FBZCxDQUFYLEdBQWdDLENBSDdCLENBQVA7QUFLSCxLQXRDUTs7QUF3Q1Qsb0JBQWdCLHdCQUFDLE1BQUQsRUFBWTtBQUN4QixlQUFPLE9BQU8sTUFBUCxJQUFpQixDQUFqQixHQUNELEtBQUssZUFBTCxDQUFxQixPQUFPLENBQVAsQ0FBckIsRUFBZ0MsT0FBTyxDQUFQLENBQWhDLENBREMsR0FFRCxLQUFLLG1CQUFMLENBQXlCLE9BQU8sQ0FBUCxDQUF6QixFQUFvQyxPQUFPLENBQVAsQ0FBcEMsRUFBK0MsT0FBTyxDQUFQLENBQS9DLENBRk47QUFHSCxLQTVDUTs7QUE4Q1QsYUFBUyxpQkFBQyxHQUFELEVBQVM7QUFDZCxlQUFPLE1BQU0sS0FBSyxFQUFYLEdBQWdCLEdBQXZCO0FBQ0gsS0FoRFE7O0FBa0RULGFBQVMsaUJBQUMsR0FBRCxFQUFTO0FBQ2QsZUFBTyxNQUFNLEdBQU4sR0FBWSxLQUFLLEVBQXhCO0FBQ0gsS0FwRFE7O0FBc0RULGtCQUFjLHNCQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsRUFBb0I7QUFDOUIsZUFBTyxJQUFJLENBQUMsS0FBSyxFQUFOLEVBQVUsS0FBSyxFQUFmLENBQUosQ0FBUDtBQUNILEtBeERROztBQTBEVCxZQUFRLGdCQUFDLE1BQUQsRUFBUyxNQUFULEVBQW9CO0FBQ3hCLGVBQU8sSUFBSSxNQUFKLEVBQVksTUFBWixDQUFQO0FBQ0gsS0E1RFE7O0FBOERULFNBQUssZUFBTTtBQUNQLGVBQU8sSUFBSSxJQUFKLEdBQVcsT0FBWCxLQUF1QixJQUE5QjtBQUNILEtBaEVROztBQWtFVCxZQUFRLGdCQUFDLEdBQUQsRUFBcUI7QUFBQSxZQUFmLEdBQWUsdUVBQVQsSUFBUzs7QUFDekIsWUFBSSxPQUFPLElBQVgsRUFBaUI7QUFDYixrQkFBTSxHQUFOO0FBQ0Esa0JBQU0sQ0FBTjtBQUNIO0FBQ0QsZUFBTyxLQUFLLE1BQUwsTUFBaUIsTUFBTSxHQUF2QixJQUE4QixHQUFyQztBQUNILEtBeEVROztBQTBFVCxnQkFBWSxzQkFBTTtBQUNkLGVBQU8sTUFBTSxLQUFLLEtBQUwsQ0FBVyxLQUFLLE1BQUwsS0FBZ0IsUUFBM0IsRUFBcUMsUUFBckMsQ0FBOEMsRUFBOUMsQ0FBYjtBQUNILEtBNUVROztBQThFVCx5QkFBcUIsNkJBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNqQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBQyxHQUFQLENBREcsRUFFSCxDQUFDLEdBQUQsRUFBTSxHQUFOLENBRkcsQ0FBUDtBQUlILEtBckZROztBQXVGVCwyQkFBdUIsK0JBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNuQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FERyxFQUVILENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxDQUFDLEdBQVYsQ0FGRyxFQUdILENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxHQUFULENBSEcsQ0FBUDtBQUtILEtBL0ZROztBQWlHVCwyQkFBdUIsK0JBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNuQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLENBQUMsR0FBVixDQURHLEVBRUgsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FGRyxFQUdILENBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxHQUFULENBSEcsQ0FBUDtBQUtILEtBekdROztBQTJHVCwyQkFBdUIsK0JBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNuQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBQyxHQUFQLEVBQVksQ0FBWixDQURHLEVBRUgsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0FGRyxFQUdILENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSEcsQ0FBUDtBQUtIO0FBbkhRLENBQWI7O0FBc0hBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBwcmVzZXQgPSByZXF1aXJlKCcuL3ByZXNldCcpO1xuY29uc3QgU2ltdWxhdG9yID0gcmVxdWlyZSgnLi9zaW11bGF0b3InKTtcblxuY29uc3Qgc2ltdWxhdG9yID0gbmV3IFNpbXVsYXRvcihwcmVzZXQpO1xuc2ltdWxhdG9yLmFuaW1hdGUoKTsiLCJjb25zdCB7ZXh0ZW5kfSA9ICQ7XG5cblxuZnVuY3Rpb24gRU1QVFlfMkQoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgYywge1xuICAgICAgICAnVElUTEUnOiAnR3Jhdml0eSBTaW11bGF0b3InLFxuICAgICAgICAnQkFDS0dST1VORCc6IFwid2hpdGVcIixcbiAgICAgICAgJ0RJTUVOU0lPTic6IDIsXG4gICAgICAgICdNQVhfUEFUSFMnOiAxMDAwLFxuICAgICAgICAnQ0FNRVJBX0NPT1JEX1NURVAnOiA1LFxuICAgICAgICAnQ0FNRVJBX0FOR0xFX1NURVAnOiAxLFxuICAgICAgICAnQ0FNRVJBX0FDQ0VMRVJBVElPTic6IDEuMSxcbiAgICAgICAgJ0cnOiAwLjEsXG4gICAgICAgICdNQVNTX01JTic6IDEsXG4gICAgICAgICdNQVNTX01BWCc6IDRlNCxcbiAgICAgICAgJ1ZFTE9DSVRZX01BWCc6IDEwXG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gRU1QVFlfM0QoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfMkQoYyksIHtcbiAgICAgICAgJ0RJTUVOU0lPTic6IDMsXG4gICAgICAgICdHJzogMC4wMDEsXG4gICAgICAgICdNQVNTX01JTic6IDEsXG4gICAgICAgICdNQVNTX01BWCc6IDhlNixcbiAgICAgICAgJ1ZFTE9DSVRZX01BWCc6IDEwXG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRU1QVFlfMkQ7XG4iLCJjb25zdCBJbnZpc2libGVFcnJvciA9IHJlcXVpcmUoJy4uL2Vycm9yL2ludmlzaWJsZScpO1xuY29uc3Qge2RlZzJyYWQsIHJvdGF0ZSwgbm93LCBnZXRfcm90YXRpb25fbWF0cml4fSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHtwb3d9ID0gTWF0aDtcblxuY2xhc3MgQ2FtZXJhMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgZW5naW5lKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICB0aGlzLnkgPSAwO1xuICAgICAgICB0aGlzLnogPSAxMDA7XG4gICAgICAgIHRoaXMucGhpID0gMDtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gICAgICAgIHRoaXMubGFzdF90aW1lID0gMDtcbiAgICAgICAgdGhpcy5sYXN0X2tleSA9IG51bGw7XG4gICAgICAgIHRoaXMuY29tYm8gPSAwO1xuICAgICAgICB0aGlzLmNlbnRlciA9IFtjb25maWcuVyAvIDIsIGNvbmZpZy5IIC8gMl07XG4gICAgfVxuXG4gICAgZ2V0X2Nvb3JkX3N0ZXAoa2V5KSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfdGltZSA9IG5vdygpO1xuICAgICAgICBpZiAoa2V5ID09IHRoaXMubGFzdF9rZXkgJiYgY3VycmVudF90aW1lIC0gdGhpcy5sYXN0X3RpbWUgPCAxKSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbWJvID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RfdGltZSA9IGN1cnJlbnRfdGltZTtcbiAgICAgICAgdGhpcy5sYXN0X2tleSA9IGtleTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLkNBTUVSQV9DT09SRF9TVEVQICogcG93KHRoaXMuY29uZmlnLkNBTUVSQV9BQ0NFTEVSQVRJT04sIHRoaXMuY29tYm8pO1xuICAgIH1cblxuICAgIHVwKGtleSkge1xuICAgICAgICB0aGlzLnkgLT0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBkb3duKGtleSkge1xuICAgICAgICB0aGlzLnkgKz0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBsZWZ0KGtleSkge1xuICAgICAgICB0aGlzLnggLT0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByaWdodChrZXkpIHtcbiAgICAgICAgdGhpcy54ICs9IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgem9vbV9pbihrZXkpIHtcbiAgICAgICAgdGhpcy56IC09IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgem9vbV9vdXQoa2V5KSB7XG4gICAgICAgIHRoaXMueiArPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZV9sZWZ0KGtleSkge1xuICAgICAgICB0aGlzLnBoaSAtPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlX3JpZ2h0KGtleSkge1xuICAgICAgICB0aGlzLnBoaSArPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcmVmcmVzaCgpIHtcbiAgICB9XG5cbiAgICBnZXRfem9vbSh6ID0gMCwgYWxsb3dfaW52aXNpYmxlID0gZmFsc2UpIHtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy56IC0gejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDw9IDApIHtcbiAgICAgICAgICAgIGlmICghYWxsb3dfaW52aXNpYmxlKSB0aHJvdyBJbnZpc2libGVFcnJvcjtcbiAgICAgICAgICAgIGRpc3RhbmNlID0gSW5maW5pdHk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDEwMCAvIGRpc3RhbmNlO1xuICAgIH1cblxuICAgIGFkanVzdF9jb29yZChjb29yZCwgYWxsb3dfaW52aXNpYmxlID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgUiA9IGdldF9yb3RhdGlvbl9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbSgpO1xuICAgICAgICByZXR1cm4gYWRkKHRoaXMuY2VudGVyLCBtdWwoc3ViKHJvdGF0ZShjb29yZCwgUiksIFt0aGlzLngsIHRoaXMueV0pLCB6b29tKSk7XG4gICAgfVxuXG4gICAgYWRqdXN0X3JhZGl1cyhjb29yZCwgcmFkaXVzKSB7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKCk7XG4gICAgICAgIHJldHVybiByYWRpdXMgKiB6b29tO1xuICAgIH1cblxuICAgIGFjdHVhbF9wb2ludCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IFJfID0gZ2V0X3JvdGF0aW9uX21hdHJpeChkZWcycmFkKHRoaXMucGhpKSwgLTEpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbSgpO1xuICAgICAgICByZXR1cm4gcm90YXRlKGFkZChkaXYoc3ViKFt4LCB5XSwgdGhpcy5jZW50ZXIpLCB6b29tKSwgW3RoaXMueCwgdGhpcy55XSksIFJfKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhMkQ7IiwiY29uc3QgQ2FtZXJhMkQgPSByZXF1aXJlKCcuLzJkJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBnZXRfcm90YXRpb25feF9tYXRyaXgsIGdldF9yb3RhdGlvbl95X21hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5cblxuY2xhc3MgQ2FtZXJhM0QgZXh0ZW5kcyBDYW1lcmEyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBlbmdpbmUpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCBlbmdpbmUpO1xuICAgICAgICB0aGlzLnRoZXRhID0gMDtcbiAgICB9XG5cbiAgICByb3RhdGVfdXAoa2V5KSB7XG4gICAgICAgIHRoaXMudGhldGEgLT0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZV9kb3duKGtleSkge1xuICAgICAgICB0aGlzLnRoZXRhICs9IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBhZGp1c3RfY29vcmQoY29vcmQsIGFsbG93X2ludmlzaWJsZSA9IEZhbHNlKSB7XG4gICAgICAgIGNvbnN0IFJ4ID0gZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGRlZzJyYWQodGhpcy50aGV0YSkpO1xuICAgICAgICBjb25zdCBSeSA9IGdldF9yb3RhdGlvbl95X21hdHJpeChkZWcycmFkKHRoaXMucGhpKSk7XG4gICAgICAgIGNvbnN0IGMgPSByb3RhdGUocm90YXRlKGNvb3JkLCBSeCksIFJ5KTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oYy5wb3AoKSwgYWxsb3dfaW52aXNpYmxlKTtcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLmNlbnRlciwgbXVsKHN1YihjLCBbdGhpcy54LCB0aGlzLnldKSwgem9vbSkpO1xuICAgIH1cblxuICAgIGFkanVzdF9yYWRpdXMoY29vcmQsIHJhZGl1cykge1xuICAgICAgICBjb25zdCBSeCA9IGdldF9yb3RhdGlvbl94X21hdHJpeChkZWcycmFkKHRoaXMudGhldGEpKTtcbiAgICAgICAgY29uc3QgUnkgPSBnZXRfcm90YXRpb25feV9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICBjb25zdCBjID0gcm90YXRlKHJvdGF0ZShjb29yZCwgUngpLCBSeSk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKGMucG9wKCkpO1xuICAgICAgICByZXR1cm4gcmFkaXVzICogem9vbTtcbiAgICB9XG5cbiAgICBhY3R1YWxfcG9pbnQoeCwgeSkge1xuICAgICAgICBjb25zdCBSeF8gPSBnZXRfcm90YXRpb25feF9tYXRyaXgoZGVnMnJhZCh0aGlzLnRoZXRhKSwgLTEpO1xuICAgICAgICBjb25zdCBSeV8gPSBnZXRfcm90YXRpb25feV9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSksIC0xKTtcbiAgICAgICAgY29uc3QgYyA9IGFkZChzdWIoW3gsIHldLCB0aGlzLmNlbnRlciksIFt0aGlzLngsIHRoaXMueV0pLmNvbmNhdCgwKTtcbiAgICAgICAgcmV0dXJuIHJvdGF0ZShyb3RhdGUoYywgUnlfKSwgUnhfKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhM0Q7IiwiY2xhc3MgQ29udHJvbEJveCB7XG4gICAgY29uc3RydWN0b3IodGl0bGUsIGNvbnRyb2xsZXJzKSB7XG4gICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy50aXRsZScpLnRleHQodGl0bGUpO1xuICAgICAgICBjb25zdCAkaW5wdXRDb250YWluZXIgPSAkY29udHJvbEJveC5maW5kKCcuaW5wdXQtY29udGFpbmVyJyk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbGxlciBvZiBjb250cm9sbGVycykge1xuICAgICAgICAgICAgJGlucHV0Q29udGFpbmVyLmFwcGVuZChjb250cm9sbGVyLiRpbnB1dFdyYXBwZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy4kY29udHJvbEJveCA9ICRjb250cm9sQm94O1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xCb3g7IiwiY2xhc3MgQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgbWluLCBtYXgsIHZhbHVlLCBmdW5jKSB7XG4gICAgICAgIGNvbnN0ICRpbnB1dFdyYXBwZXIgPSAkKCcuaW5wdXQtd3JhcHBlci50ZW1wbGF0ZScpLmNsb25lKCk7XG4gICAgICAgICRpbnB1dFdyYXBwZXIucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRpbnB1dFdyYXBwZXIuZmluZCgnc3BhbicpLnRleHQobmFtZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dCA9ICRpbnB1dFdyYXBwZXIuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21pbicsIG1pbik7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtYXgnLCBtYXgpO1xuICAgICAgICAkaW5wdXQuYXR0cigndmFsdWUnLCB2YWx1ZSk7XG4gICAgICAgICRpbnB1dC5jaGFuZ2UoZnVuYyk7XG5cbiAgICAgICAgdGhpcy4kaW5wdXRXcmFwcGVyID0gJGlucHV0V3JhcHBlcjtcbiAgICAgICAgdGhpcy4kaW5wdXQgPSAkaW5wdXQ7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kaW5wdXQudmFsKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXI7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi4vb2JqZWN0L2NpcmNsZScpO1xuY29uc3QgQ2FtZXJhMkQgPSByZXF1aXJlKCcuLi9jYW1lcmEvMmQnKTtcbmNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7dmVjdG9yX21hZ25pdHVkZSwgcm90YXRlLCBub3csIHJhbmRvbSwgcG9sYXIyY2FydGVzaWFuLCByYW5kX2NvbG9yLCBnZXRfcm90YXRpb25fbWF0cml4LCBjYXJ0ZXNpYW4yYXV0b30gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWlufSA9IE1hdGg7XG5cblxuY2xhc3MgUGF0aCB7XG4gICAgY29uc3RydWN0b3Iob2JqKSB7XG4gICAgICAgIHRoaXMucHJldl9wb3MgPSBvYmoucHJldl9wb3Muc2xpY2UoKTtcbiAgICAgICAgdGhpcy5wb3MgPSBvYmoucG9zLnNsaWNlKCk7XG4gICAgfVxufVxuXG5jbGFzcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBjdHgpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgICAgICB0aGlzLm9ianMgPSBbXTtcbiAgICAgICAgdGhpcy5hbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb250cm9sYm94ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXRocyA9IFtdO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEyRChjb25maWcsIHRoaXMpO1xuICAgICAgICB0aGlzLmZwc19sYXN0X3RpbWUgPSBub3coKTtcbiAgICAgICAgdGhpcy5mcHNfY291bnQgPSAwO1xuICAgIH1cblxuICAgIGRlc3Ryb3lfY29udHJvbGJveGVzKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRyb2xib3ggb2YgdGhpcy5jb250cm9sYm94ZXMpIHtcbiAgICAgICAgICAgIGNvbnRyb2xib3guZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbGJveGVzID0gW11cbiAgICB9XG5cbiAgICBhbmltYXRlKCkge1xuICAgICAgICB0aGlzLnByaW50X2ZwcygpO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlX2FsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVkcmF3X2FsbCgpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xuICAgICAgICB9LCAxMCk7XG4gICAgfVxuXG4gICAgb2JqZWN0X2Nvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuY2FtZXJhLmFkanVzdF9yYWRpdXMob2JqLnBvcywgb2JqLmdldF9yKCkpO1xuICAgICAgICBjb25zdCBbeCwgeV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnBvcyk7XG4gICAgICAgIHJldHVybiBbeCwgeSwgcl07XG4gICAgfVxuXG4gICAgZGlyZWN0aW9uX2Nvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3QgW2N4LCBjeV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnBvcyk7XG4gICAgICAgIGNvbnN0IFtkeCwgZHldID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkKGFkZChvYmoucG9zLCBtdWwob2JqLnYsIDUwKSksIHRydWUpO1xuICAgICAgICByZXR1cm4gW2N4LCBjeSwgZHgsIGR5XTtcbiAgICB9XG5cbiAgICBwYXRoX2Nvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3QgW2Z4LCBmeV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnByZXZfcG9zKTtcbiAgICAgICAgY29uc3QgW3R4LCB0eV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmQob2JqLnBvcyk7XG4gICAgICAgIHJldHVybiBbZngsIGZ5LCB0eCwgdHldO1xuICAgIH1cblxuICAgIGRyYXdfb2JqZWN0KG9iaikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYyA9IHRoaXMub2JqZWN0X2Nvb3JkcyhvYmopO1xuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMoY1swXSwgY1sxXSwgY1syXSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IG9iai5jb2xvcjtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3X2RpcmVjdGlvbihvYmopIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSB0aGlzLm9iamVjdF9jb29yZHMob2JqKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGNbMF0sIGNbMV0pO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3X3BhdGhzKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wYXRocykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gdGhpcy5wYXRoX2Nvb3JkcyhwYXRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oY1swXSwgY1sxXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJyNkZGRkZGQnO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVfcGF0aChvYmopIHtcbiAgICAgICAgaWYgKHZlY3Rvcl9tYWduaXR1ZGUob2JqLnBvcy5zdWJ0cmFjdChvYmoucHJldl9wb3MpKSA+IDUpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aHMucHVzaChuZXcgUGF0aChvYmopKTtcbiAgICAgICAgICAgIG9iai5wcmV2X3BvcyA9IG9iai5wb3Muc2xpY2UoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhdGhzLmxlbmd0aCA+IHRoaXMuY29uZmlnLk1BWF9QQVRIUykge1xuICAgICAgICAgICAgICAgIHRoaXMucGF0aHMgPSB0aGlzLnBhdGhzLnNsaWNlKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlX29iamVjdCh4LCB5LCBtID0gbnVsbCwgdiA9IG51bGwsIGNvbG9yID0gbnVsbCwgY29udHJvbGJveCA9IHRydWUpIHtcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5jYW1lcmEuYWN0dWFsX3BvaW50KHgsIHkpO1xuICAgICAgICBpZiAoIW0pIHtcbiAgICAgICAgICAgIGxldCBtYXhfciA9IENpcmNsZS5nZXRfcl9mcm9tX20odGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICAgICAgbWF4X3IgPSBtaW4obWF4X3IsIChtYWcoc3ViKG9iai5wb3MsIHBvcykpIC0gb2JqLmdldF9yKCkpIC8gMS41KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbSA9IENpcmNsZS5nZXRfbV9mcm9tX3IocmFuZG9tKENpcmNsZS5nZXRfcl9mcm9tX20odGhpcy5jb25maWcuTUFTU19NSU4pLCBtYXhfcikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdikge1xuICAgICAgICAgICAgdiA9IHBvbGFyMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApKVxuICAgICAgICB9XG4gICAgICAgIGlmICghY29sb3IpIHtcbiAgICAgICAgICAgIGNvbG9yID0gcmFuZF9jb2xvcigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRhZyA9IGBjaXJjbGUke3RoaXMub2Jqcy5sZW5ndGh9YDtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IENpcmNsZSh0aGlzLmNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzLCBjb250cm9sYm94KTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBnZXRfcm90YXRpb25fbWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXNbMF0sIGRpcik7XG4gICAgfVxuXG4gICAgZWxhc3RpY19jb2xsaXNpb24oKSB7XG4gICAgICAgIGNvbnN0IGRpbWVuc2lvbiA9IHRoaXMuY29uZmlnLkRJTUVOU0lPTjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9ianMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG8xID0gdGhpcy5vYmpzW2ldO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgdGhpcy5vYmpzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbzIgPSB0aGlzLm9ianNbal07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sbGlzaW9uID0gc3ViKG8yLnBvcywgbzEucG9zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbmdsZXMgPSBjYXJ0ZXNpYW4yYXV0byhjb2xsaXNpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBhbmdsZXMuc2hpZnQoKTtcblxuICAgICAgICAgICAgICAgIGlmIChkIDwgbzEuZ2V0X3IoKSArIG8yLmdldF9yKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUiA9IHRoaXMuZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBSXyA9IHRoaXMuZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMsIC0xKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2X3RlbXAgPSBbcm90YXRlKG8xLnYsIFIpLCByb3RhdGUobzIudiwgUildO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2X2ZpbmFsID0gW3ZfdGVtcFswXS5zbGljZSgpLCB2X3RlbXBbMV0uc2xpY2UoKV07XG4gICAgICAgICAgICAgICAgICAgIHZfZmluYWxbMF1bMF0gPSAoKG8xLm0gLSBvMi5tKSAqIHZfdGVtcFswXVswXSArIDIgKiBvMi5tICogdl90ZW1wWzFdWzBdKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIHZfZmluYWxbMV1bMF0gPSAoKG8yLm0gLSBvMS5tKSAqIHZfdGVtcFsxXVswXSArIDIgKiBvMS5tICogdl90ZW1wWzBdWzBdKSAvIChvMS5tICsgbzIubSk7XG4gICAgICAgICAgICAgICAgICAgIG8xLnYgPSByb3RhdGUodl9maW5hbFswXSwgUl8pO1xuICAgICAgICAgICAgICAgICAgICBvMi52ID0gcm90YXRlKHZfZmluYWxbMV0sIFJfKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NfdGVtcCA9IFt6ZXJvcyhkaW1lbnNpb24pLCByb3RhdGUoY29sbGlzaW9uLCBSKV07XG4gICAgICAgICAgICAgICAgICAgIHBvc190ZW1wWzBdWzBdICs9IHZfZmluYWxbMF1bMF07XG4gICAgICAgICAgICAgICAgICAgIHBvc190ZW1wWzFdWzBdICs9IHZfZmluYWxbMV1bMF07XG4gICAgICAgICAgICAgICAgICAgIG8xLnBvcyA9IG8xLnBvcy5hZGQocm90YXRlKHBvc190ZW1wWzBdLCBSXykpO1xuICAgICAgICAgICAgICAgICAgICBvMi5wb3MgPSBvMS5wb3MuYWRkKHJvdGF0ZShwb3NfdGVtcFsxXSwgUl8pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxjdWxhdGVfYWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVfdmVsb2NpdHkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxhc3RpY19jb2xsaXNpb24oKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVfcG9zaXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlX3BhdGgob2JqKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZHJhd19hbGwoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdfb2JqZWN0KG9iaik7XG4gICAgICAgICAgICB0aGlzLmRyYXdfZGlyZWN0aW9uKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3X3BhdGhzKCk7XG4gICAgfVxuXG4gICAgcHJpbnRfZnBzKCkge1xuICAgICAgICB0aGlzLmZwc19jb3VudCArPSAxO1xuICAgICAgICBjb25zdCBjdXJyZW50X3RpbWUgPSBub3coKTtcbiAgICAgICAgY29uc3QgZnBzX3RpbWVfZGlmZiA9IGN1cnJlbnRfdGltZSAtIHRoaXMuZnBzX2xhc3RfdGltZVxuICAgICAgICBpZiAoZnBzX3RpbWVfZGlmZiA+IDEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAkeyh0aGlzLmZwc19jb3VudCAvIGZwc190aW1lX2RpZmYpIHwgMH0gZnBzYCk7XG4gICAgICAgICAgICB0aGlzLmZwc19sYXN0X3RpbWUgPSBjdXJyZW50X3RpbWU7XG4gICAgICAgICAgICB0aGlzLmZwc19jb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5naW5lMkQ7IiwiY29uc3QgRW5naW5lMkQgPSByZXF1aXJlKCcuLzJkJyk7XG5jb25zdCBDYW1lcmEzRCA9IHJlcXVpcmUoJy4uL2NhbWVyYS8zZCcpO1xuY29uc3QgU3BoZXJlID0gcmVxdWlyZSgnLi4vb2JqZWN0L3NwaGVyZScpO1xuY29uc3Qge3ZlY3Rvcl9tYWduaXR1ZGUsIHJhbmRvbSwgZ2V0X3JvdGF0aW9uX3hfbWF0cml4LCBnZXRfcm90YXRpb25fel9tYXRyaXgsIHJhbmRfY29sb3IsIHNwaGVyaWNhbDJjYXJ0ZXNpYW59ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbn0gPSBNYXRoO1xuXG5cbmNsYXNzIEVuZ2luZTNEIGV4dGVuZHMgRW5naW5lMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgY3R4KSB7XG4gICAgICAgIHN1cGVyKGNvbmZpZywgY3R4KTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhM0QoY29uZmlnLCB0aGlzKTtcbiAgICB9XG5cblxuICAgIGNyZWF0ZV9vYmplY3QoeCwgeSwgbSA9IE5vbmUsIHYgPSBOb25lLCBjb2xvciA9IE5vbmUsIGNvbnRyb2xib3ggPSBUcnVlKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuY2FtZXJhLmFjdHVhbF9wb2ludCh4LCB5KTtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgICBsZXQgbWF4X3IgPSBTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgICAgIG1heF9yID0gbWluKG1heF9yLCAobWFnKG9iai5wb3MgLSBwb3MpIC0gb2JqLmdldF9yKCkpIC8gMS41KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG0gPSBTcGhlcmUuZ2V0X21fZnJvbV9yKHJhbmRvbShTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUlOKSwgbWF4X3IpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgIHYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJhbmRvbSh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVggLyAyKSwgcmFuZG9tKC0xODAsIDE4MCksIHJhbmRvbSgtMTgwLCAxODApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbG9yKSB7XG4gICAgICAgICAgICBjb2xvciA9IHJhbmRfY29sb3IoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0YWcgPSBgc3BoZXJlJHt0aGlzLm9ianMubGVuZ3RofWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBTcGhlcmUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcywgY29udHJvbGJveCk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGRpciA9PSAxXG4gICAgICAgICAgICA/IGdldF9yb3RhdGlvbl96X21hdHJpeChhbmdsZXNbMF0pICogZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGFuZ2xlc1sxXSlcbiAgICAgICAgICAgIDogZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGFuZ2xlc1sxXSwgLTEpICogZ2V0X3JvdGF0aW9uX3pfbWF0cml4KGFuZ2xlc1swXSwgLTEpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUzRDsiLCJjbGFzcyBJbnZpc2libGVFcnJvciBleHRlbmRzIEVycm9yIHtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnZpc2libGVFcnJvcjsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vZW5naW5lLzJkJyk7XG5jb25zdCBFbmdpbmUzRCA9IHJlcXVpcmUoJy4vZW5naW5lLzNkJyk7XG5jb25zdCB7Z2V0X2Rpc3RhbmNlfSA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5cbmxldCBjb25maWcgPSBudWxsO1xuY29uc3Qga2V5bWFwID0ge1xuICAgIDM4OiAndXAnLFxuICAgIDQwOiAnZG93bicsXG4gICAgMzc6ICdsZWZ0JyxcbiAgICAzOTogJ3JpZ2h0JyxcbiAgICA5MDogJ3pvb21faW4nLCAvLyB6XG4gICAgODg6ICd6b29tX291dCcsIC8vIHhcbiAgICA4NzogJ3JvdGF0ZV91cCcsIC8vIHdcbiAgICA4MzogJ3JvdGF0ZV9kb3duJywgLy8gc1xuICAgIDY1OiAncm90YXRlX2xlZnQnLCAvLyBhXG4gICAgNjg6ICdyb3RhdGVfcmlnaHQnIC8vIGRcbn07XG5cbmZ1bmN0aW9uIG9uX3Jlc2l6ZSgkY2FudmFzKSB7XG4gICAgY29uZmlnLlcgPSAkY2FudmFzWzBdLndpZHRoID0gJGNhbnZhcy53aWR0aCgpO1xuICAgIGNvbmZpZy5IID0gJGNhbnZhc1swXS5oZWlnaHQgPSAkY2FudmFzLmhlaWdodCgpO1xuXG59XG5cbmZ1bmN0aW9uIG9uX2NsaWNrKGV2ZW50LCBlbmdpbmUpIHtcbiAgICBjb25zdCB4ID0gZXZlbnQucGFnZVg7XG4gICAgY29uc3QgeSA9IGV2ZW50LnBhZ2VZO1xuICAgIGlmICghZW5naW5lLmFuaW1hdGluZykge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiBlbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgY29uc3QgYyA9IGVuZ2luZS5vYmplY3RfY29vcmRzKG9iaik7XG4gICAgICAgICAgICBjb25zdCBjeCA9IChjWzBdICsgY1syXSkgLyAyO1xuICAgICAgICAgICAgY29uc3QgY3kgPSAoY1sxXSArIGNbM10pIC8gMjtcbiAgICAgICAgICAgIGNvbnN0IHIgPSAoY1syXSAtIGNbMF0pIC8gMjtcbiAgICAgICAgICAgIGlmIChnZXRfZGlzdGFuY2UoY3gsIGN5LCB4LCB5KSA8IHIpIHtcbiAgICAgICAgICAgICAgICBvYmouc2hvd19jb250cm9sYm94KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVuZ2luZS5jcmVhdGVfb2JqZWN0KHgsIHkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25fa2V5X2Rvd24oZXZlbnQsIGVuZ2luZSkge1xuICAgIGNvbnN0IHtrZXlDb2RlfSA9IGV2ZW50O1xuICAgIGlmIChrZXlDb2RlID09IDMyKSB7IC8vIHNwYWNlIGJhclxuICAgICAgICBlbmdpbmUuZGVzdHJveV9jb250cm9sYm94ZXMoKTtcbiAgICAgICAgZW5naW5lLmFuaW1hdGluZyA9ICFlbmdpbmUuYW5pbWF0aW5nO1xuICAgICAgICBkb2N1bWVudC50aXRsZSA9IGAke2NvbmZpZy5USVRMRX0gKCR7ZW5naW5lLmFuaW1hdGluZyA/IFwiU2ltdWxhdGluZ1wiIDogXCJQYXVzZWRcIn0pYDtcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgaW4ga2V5bWFwICYmIGtleW1hcFtrZXlDb2RlXSBpbiBlbmdpbmUuY2FtZXJhKSB7XG4gICAgICAgIGVuZ2luZS5jYW1lcmFba2V5bWFwW2tleUNvZGVdXShrZXlDb2RlKTtcbiAgICB9XG59XG5cbmNsYXNzIFNpbXVsYXRvciB7XG4gICAgY29uc3RydWN0b3IocHJlc2V0KSB7XG4gICAgICAgIGNvbmZpZyA9IHByZXNldCh7fSk7XG4gICAgICAgIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMnKTtcbiAgICAgICAgY29uc3QgY3R4ID0gJGNhbnZhc1swXS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBvbl9yZXNpemUoJGNhbnZhcyk7XG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IChjb25maWcuRElNRU5TSU9OID09IDIgPyBFbmdpbmUyRCA6IEVuZ2luZTNEKShjb25maWcsIGN0eCk7XG4gICAgICAgICRjYW52YXMucmVzaXplKGUgPT4ge1xuICAgICAgICAgICAgb25fcmVzaXplKCRjYW52YXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNhbnZhcy5jbGljayhlID0+IHtcbiAgICAgICAgICAgIG9uX2NsaWNrKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJ2JvZHknKS5rZXlkb3duKGUgPT4ge1xuICAgICAgICAgICAgb25fa2V5X2Rvd24oZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhbmltYXRlKCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5hbmltYXRlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvcjsiLCJmdW5jdGlvbiBpdGVyKGEsIGZ1bmMpIHtcbiAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICBtW2ldID0gZnVuYyhpKTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHplcm9zOiBOID0+IHtcbiAgICAgICAgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkoTikpLm1hcChOdW1iZXIucHJvdG90eXBlLnZhbHVlT2YsMCk7XG4gICAgfSxcblxuICAgIG1hZzogYSA9PiB7XG4gICAgICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IGFbaV0gKiBhW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoc3VtKTtcbiAgICB9LFxuXG4gICAgYWRkOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICsgYltpXTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHN1YjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAtIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtdWw6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gKiBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZGl2OiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldIC8gYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRvdDogKGEsIGIpID0+IHtcbiAgICAgICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGFfYyA9IGFbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBiX2MgPSBiWzBdLmxlbmd0aDtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBBcnJheShhX3IpO1xuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IGFfcjsgcisrKSB7XG4gICAgICAgICAgICBtW3JdID0gbmV3IEFycmF5KGJfYyk7XG4gICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGJfYzsgYysrKSB7XG4gICAgICAgICAgICAgICAgbVtyXVtjXSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX2M7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBtW3JdW2NdICs9IGFbcl1baV0gKiBiW2ldW2NdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG59OyIsImNvbnN0IENvbnRyb2xCb3ggPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xfYm94Jyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7dmVjdG9yX21hZ25pdHVkZSwgcmFkMmRlZywgZGVnMnJhZCwgcG9sYXIyY2FydGVzaWFuLCBjYXJ0ZXNpYW4yYXV0bywgc3F1YXJlfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttYXgsIHBvd30gPSBNYXRoO1xuXG5cbmNsYXNzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogUG9sYXIgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2xhcl9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIGVuZ2luZSwgY29udHJvbGJveCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldl9wb3MgPSBwb3Muc2xpY2UoKTtcbiAgICAgICAgdGhpcy52ID0gdjtcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICAgICAgdGhpcy5jb250cm9sYm94ID0gbnVsbDtcbiAgICAgICAgaWYgKGNvbnRyb2xib3gpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd19jb250cm9sYm94KClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldF9yKCkge1xuICAgICAgICByZXR1cm4gQ2lyY2xlLmdldF9yX2Zyb21fbSh0aGlzLm0pXG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX3ZlbG9jaXR5KCkge1xuICAgICAgICBsZXQgRiA9IHplcm9zKHRoaXMuY29uZmlnLkRJTUVOU0lPTik7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIGlmIChvYmogPT0gdGhpcykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCB2ZWN0b3IgPSBzdWIodGhpcy5wb3MsIG9iai5wb3MpO1xuICAgICAgICAgICAgY29uc3QgbWFnbml0dWRlID0gbWFnKHZlY3Rvcik7XG4gICAgICAgICAgICBjb25zdCB1bml0X3ZlY3RvciA9IGRpdih2ZWN0b3IsIG1hZ25pdHVkZSk7XG4gICAgICAgICAgICBGID0gYWRkKEYsIG11bChvYmoubSAvIHNxdWFyZShtYWduaXR1ZGUpLCB1bml0X3ZlY3RvcikpXG4gICAgICAgIH1cbiAgICAgICAgRiA9IG11bChGLCAtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBkaXYoRiwgdGhpcy5tKTtcbiAgICAgICAgdGhpcy52ID0gYWRkKHRoaXMudiwgYSk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX3Bvc2l0aW9uKCkge1xuICAgICAgICB0aGlzLnBvcyA9IGFkZCh0aGlzLnBvcywgdGhpcy52KTtcbiAgICB9XG5cbiAgICBjb250cm9sX20oZSkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tX2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgfVxuXG4gICAgY29udHJvbF9wb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NfeF9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NfeV9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5XTtcbiAgICB9XG5cbiAgICBjb250cm9sX3YoZSkge1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudl9waGlfY29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudl9yaG9fY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy52ID0gcG9sYXIyY2FydGVzaWFuKHJobywgcGhpKTtcbiAgICB9XG5cbiAgICBzaG93X2NvbnRyb2xib3goKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xib3gudGsubGlmdCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zdCBtYXJnaW4gPSAxLjU7XG5cbiAgICAgICAgICAgIHZhciBwb3NfcmFuZ2UgPSBtYXgobWF4KHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpIC8gMiwgbWF4LmFwcGx5KG51bGwsIHRoaXMucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICBwb3NfcmFuZ2UgPSBtYXgocG9zX3JhbmdlLCBtYXguYXBwbHkobnVsbCwgb2JqLnBvcy5tYXAoTWF0aC5hYnMpKSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZfcmFuZ2UgPSBtYXgodGhpcy5jb25maWcuVkVMT0NJVFlfTUFYLCBtYWcodGhpcy52KSAqIG1hcmdpbik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICAgICAgdl9yYW5nZSA9IG1heCh2X3JhbmdlLCBtYWcob2JqLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sYm94ID0gbmV3IENvbnRyb2xCb3godGhpcy50YWcsIHRoaXMuZ2V0X2NvbnRyb2xsZXJzKCkpO1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUuY29udHJvbGJveGVzLnB1c2godGhpcy5jb250cm9sYm94KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICB0aGlzLm1fY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKFwiTWFzcyBtXCIsIHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCwgbSwgdGhpcy5jb250cm9sX20pO1xuICAgICAgICB0aGlzLnBvc194X2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcihcIlBvc2l0aW9uIHhcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1swXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKFwiUG9zaXRpb24geVwiLCAtcG9zX3JhbmdlLCBwb3NfcmFuZ2UsIHRoaXMucG9zWzFdLCB0aGlzLmNvbnRyb2xfcG9zKTtcbiAgICAgICAgdGhpcy52X3Job19jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoXCJWZWxvY2l0eSDPgVwiLCAwLCB2X3JhbmdlLCB2WzBdLCB0aGlzLmNvbnRyb2xfdik7XG4gICAgICAgIHRoaXMudl9waGlfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKFwiVmVsb2NpdHkgz4ZcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMV0pLCB0aGlzLmNvbnRyb2xfdik7XG4gICAgfVxuXG4gICAgZ2V0X2NvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tX2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc194X2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc195X2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZfcmhvX2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZfcGhpX2NvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0X3JfZnJvbV9tKG0pIHtcbiAgICAgICAgcmV0dXJuIHBvdyhtLCAxIC8gMilcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0X21fZnJvbV9yKHIpIHtcbiAgICAgICAgcmV0dXJuIHNxdWFyZShyKVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyd0YWcnOiB0aGlzLnRhZywgJ3YnOiB0aGlzLnYsICdwb3MnOiB0aGlzLnBvc30pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGU7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi9jaXJjbGUnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHtyYWQyZGVnLCBkZWcycmFkLCBzcGhlcmljYWwyY2FydGVzaWFufSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHtjdWJlfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHtwb3d9ID0gTWF0aDtcblxuXG5jbGFzcyBTcGhlcmUgZXh0ZW5kcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFNwaGVyaWNhbCBjb29yZGluYXRlIHN5c3RlbVxuICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NwaGVyaWNhbF9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgZ2V0X3IoKSB7XG4gICAgICAgIHJldHVybiBTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMubSk7XG4gICAgfVxuXG4gICAgY29udHJvbF9wb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NfeF9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NfeV9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB6ID0gdGhpcy5wb3Nfel9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5LCB6XTtcbiAgICB9XG5cbiAgICBjb250cm9sX3YoZSkge1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudl9waGlfY29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHRoZXRhID0gZGVnMnJhZCh0aGlzLnZfdGhldGFfY29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudl9yaG9fY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy52ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyaG8sIHBoaSwgdGhldGEpO1xuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICBzdXBlci5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICB0aGlzLnBvc196X2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcihcIlBvc2l0aW9uIHpcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1syXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMudl90aGV0YV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoXCJWZWxvY2l0eSDOuFwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsyXSksIHRoaXMuY29udHJvbF92KTtcbiAgICB9XG5cbiAgICBnZXRfY29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3hfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3pfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9yaG9fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9waGlfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl90aGV0YV9jb250cm9sbGVyXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldF9yX2Zyb21fbShtKSB7XG4gICAgICAgIHJldHVybiBwb3cobSwgMSAvIDMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfbV9mcm9tX3Iocikge1xuICAgICAgICByZXR1cm4gY3ViZShyKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3BoZXJlOyIsImNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuL21hdHJpeCcpO1xuXG5jb25zdCBVdGlsID0ge1xuICAgIHNxdWFyZTogKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIHggKiB4O1xuICAgIH0sXG5cbiAgICBjdWJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHggKiB4O1xuICAgIH0sXG5cbiAgICBwb2xhcjJjYXJ0ZXNpYW46IChyaG8sIHBoaSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHBoaSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnBvbGFyOiAoeCwgeSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgTWF0aC5zcXJ0KFV0aWwuc3F1YXJlKHgpICsgVXRpbC5zcXVhcmUoeSkpLFxuICAgICAgICAgICAgTWF0aC5hdGFuMih4LCB5KVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBzcGhlcmljYWwyY2FydGVzaWFuOiAocmhvLCBwaGksIHRoZXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5zaW4ocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguY29zKHRoZXRhKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4yc3BoZXJpY2FsOiAoeCwgeSwgeikgPT4ge1xuICAgICAgICBjb25zdCByaG8gPSBNYXRoLnNxcnQoVXRpbC5zcXVhcmUoeCkgKyBVdGlsLnNxdWFyZSh5KSArIFV0aWwuc3F1YXJlKHopKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeCwgeSksXG4gICAgICAgICAgICByaG8gIT0gMCA/IE1hdGguYWNvcyh6IC8gcmhvKSA6IDBcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMmF1dG86ICh2ZWN0b3IpID0+IHtcbiAgICAgICAgcmV0dXJuIHZlY3Rvci5sZW5ndGggPT0gMlxuICAgICAgICAgICAgPyBVdGlsLmNhcnRlc2lhbjJwb2xhcih2ZWN0b3JbMF0sIHZlY3RvclsxXSlcbiAgICAgICAgICAgIDogVXRpbC5jYXJ0ZXNpYW4yc3BoZXJpY2FsKHZlY3RvclswXSwgdmVjdG9yWzFdLCB2ZWN0b3JbMl0pO1xuICAgIH0sXG5cbiAgICByYWQyZGVnOiAocmFkKSA9PiB7XG4gICAgICAgIHJldHVybiByYWQgLyBNYXRoLlBJICogMTgwO1xuICAgIH0sXG5cbiAgICBkZWcycmFkOiAoZGVnKSA9PiB7XG4gICAgICAgIHJldHVybiBkZWcgLyAxODAgKiBNYXRoLlBJO1xuICAgIH0sXG5cbiAgICBnZXRfZGlzdGFuY2U6ICh4MCwgeTAsIHgxLCB5MSkgPT4ge1xuICAgICAgICByZXR1cm4gbWFnKFt4MSAtIHgwLCB5MSAtIHkwXSk7XG4gICAgfSxcblxuICAgIHJvdGF0ZTogKHZlY3RvciwgbWF0cml4KSA9PiB7XG4gICAgICAgIHJldHVybiBkb3QodmVjdG9yLCBtYXRyaXgpO1xuICAgIH0sXG5cbiAgICBub3c6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICB9LFxuXG4gICAgcmFuZG9tOiAobWluLCBtYXggPSBudWxsKSA9PiB7XG4gICAgICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4ID0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuICAgIH0sXG5cbiAgICByYW5kX2NvbG9yOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiAnIycgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNjc3NzIxNSkudG9TdHJpbmcoMTYpO1xuICAgIH0sXG5cbiAgICBnZXRfcm90YXRpb25fbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAtc2luXSxcbiAgICAgICAgICAgIFtzaW4sIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX3hfbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbMSwgMCwgMF0sXG4gICAgICAgICAgICBbMCwgY29zLCAtc2luXSxcbiAgICAgICAgICAgIFswLCBzaW4sIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX3lfbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAwLCAtc2luXSxcbiAgICAgICAgICAgIFswLCAxLCAwXSxcbiAgICAgICAgICAgIFtzaW4sIDAsIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX3pfbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAtc2luLCAwXSxcbiAgICAgICAgICAgIFtzaW4sIGNvcywgMF0sXG4gICAgICAgICAgICBbMCwgMCwgMV1cbiAgICAgICAgXTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWw7Il19

//# sourceMappingURL=gravity_simulator.js.map
