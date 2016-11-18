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

            var distance = this.z - z;
            if (distance <= 0) {
                throw new InvisibleError();
            }
            return 100 / distance;
        }
    }, {
        key: 'adjust_coords',
        value: function adjust_coords(coords) {
            var R = get_rotation_matrix(deg2rad(this.phi));
            var zoom = this.get_zoom();
            return add(this.center, mul(sub(rotate(coords, R), [this.x, this.y]), zoom));
        }
    }, {
        key: 'adjust_radius',
        value: function adjust_radius(coords, radius) {
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
        key: 'rotated_coords',
        value: function rotated_coords(coords) {
            var Rx = get_rotation_x_matrix(deg2rad(this.theta));
            var Ry = get_rotation_y_matrix(deg2rad(this.phi));
            return rotate(rotate(coords, Rx), Ry);
        }
    }, {
        key: 'adjust_coords',
        value: function adjust_coords(coords) {
            var c = this.rotated_coords(coords);
            var zoom = this.get_zoom(c.pop());
            return add(this.center, mul(sub(c, [this.x, this.y]), zoom));
        }
    }, {
        key: 'adjust_radius',
        value: function adjust_radius(coords, radius) {
            var c = this.rotated_coords(coords);
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
        $controlBox.insertAfter($templateControlBox);

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

            var _camera$adjust_coords = this.camera.adjust_coords(obj.pos),
                _camera$adjust_coords2 = _slicedToArray(_camera$adjust_coords, 2),
                x = _camera$adjust_coords2[0],
                y = _camera$adjust_coords2[1];

            return [x, y, r];
        }
    }, {
        key: 'direction_coords',
        value: function direction_coords(obj) {
            var _camera$adjust_coords3 = this.camera.adjust_coords(obj.pos),
                _camera$adjust_coords4 = _slicedToArray(_camera$adjust_coords3, 2),
                cx = _camera$adjust_coords4[0],
                cy = _camera$adjust_coords4[1];

            var _camera$adjust_coords5 = this.camera.adjust_coords(add(obj.pos, mul(obj.v, 50))),
                _camera$adjust_coords6 = _slicedToArray(_camera$adjust_coords5, 2),
                dx = _camera$adjust_coords6[0],
                dy = _camera$adjust_coords6[1];

            return [cx, cy, dx, dy];
        }
    }, {
        key: 'path_coords',
        value: function path_coords(obj) {
            var _camera$adjust_coords7 = this.camera.adjust_coords(obj.prev_pos),
                _camera$adjust_coords8 = _slicedToArray(_camera$adjust_coords7, 2),
                fx = _camera$adjust_coords8[0],
                fy = _camera$adjust_coords8[1];

            var _camera$adjust_coords9 = this.camera.adjust_coords(obj.pos),
                _camera$adjust_coords10 = _slicedToArray(_camera$adjust_coords9, 2),
                tx = _camera$adjust_coords10[0],
                ty = _camera$adjust_coords10[1];

            return [fx, fy, tx, ty];
        }
    }, {
        key: 'draw_object',
        value: function draw_object(c) {
            var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            try {
                if (c instanceof Circle) {
                    c = this.object_coords(c);
                }
                this.ctx.beginPath();
                this.ctx.arc(c[0], c[1], c[2], 0, 2 * Math.PI, false);
                this.ctx.fillStyle = color || c.color;
                this.ctx.fill();
            } catch (e) {
                if (!(e instanceof InvisibleError)) {
                    throw e;
                }
            }
        }
    }, {
        key: 'draw_direction',
        value: function draw_direction(c) {
            try {
                if (c instanceof Circle) {
                    c = this.direction_coords(c);
                }
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
        key: 'draw_path',
        value: function draw_path(c) {
            try {
                if (c instanceof Path) {
                    c = this.path_coords(c);
                }
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
    }, {
        key: 'create_path',
        value: function create_path(obj) {
            if (mag(sub(obj.pos, obj.prev_pos)) > 5) {
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
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _obj = _step2.value;

                        max_r = min(max_r, (mag(sub(_obj.pos, pos)) - _obj.get_r()) / 1.5);
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
                        console.log(R, R_);

                        var v_temp = [rotate(o1.v, R), rotate(o2.v, R)];
                        var v_final = [v_temp[0].slice(), v_temp[1].slice()];
                        v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m);
                        v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m);
                        o1.v = rotate(v_final[0], R_);
                        o2.v = rotate(v_final[1], R_);

                        var pos_temp = [zeros(dimension), rotate(collision, R)];
                        pos_temp[0][0] += v_final[0][0];
                        pos_temp[1][0] += v_final[1][0];
                        o1.pos = add(o1.pos, rotate(pos_temp[0], R_));
                        o2.pos = add(o1.pos, rotate(pos_temp[1], R_));
                    }
                }
            }
        }
    }, {
        key: 'calculate_all',
        value: function calculate_all() {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var obj = _step3.value;

                    obj.calculate_velocity();
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

            this.elastic_collision();

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.objs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _obj2 = _step4.value;

                    _obj2.calculate_position();
                    this.create_path(_obj2);
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
        key: 'redraw_all',
        value: function redraw_all() {
            this.ctx.clearRect(0, 0, this.config.W, this.config.H);
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.objs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var obj = _step5.value;

                    this.draw_object(obj);
                    this.draw_direction(obj);
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

                    this.draw_path(path);
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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Engine2D = require('./2d');
var Camera3D = require('../camera/3d');
var Sphere = require('../object/sphere');
var InvisibleError = require('../error/invisible');

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

var min = Math.min,
    max = Math.max;

var Engine3D = function (_Engine2D) {
    _inherits(Engine3D, _Engine2D);

    function Engine3D(config, ctx) {
        _classCallCheck(this, Engine3D);

        var _this = _possibleConstructorReturn(this, (Engine3D.__proto__ || Object.getPrototypeOf(Engine3D)).call(this, config, ctx));

        _this.camera = new Camera3D(config, _this);
        return _this;
    }

    _createClass(Engine3D, [{
        key: 'direction_coords',
        value: function direction_coords(obj) {
            var factor = 50;
            var c = this.camera.rotated_coords(obj.pos);
            var minFactor = (this.camera.z - c[2] - 1) / obj.v[2];
            console.log(minFactor);
            if (minFactor > 0) factor = min(factor, minFactor);

            var _camera$adjust_coords = this.camera.adjust_coords(obj.pos),
                _camera$adjust_coords2 = _slicedToArray(_camera$adjust_coords, 2),
                cx = _camera$adjust_coords2[0],
                cy = _camera$adjust_coords2[1];

            var _camera$adjust_coords3 = this.camera.adjust_coords(add(obj.pos, mul(obj.v, factor))),
                _camera$adjust_coords4 = _slicedToArray(_camera$adjust_coords3, 2),
                dx = _camera$adjust_coords4[0],
                dy = _camera$adjust_coords4[1];

            return [cx, cy, dx, dy];
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

            return dir == 1 ? dot(get_rotation_z_matrix(angles[0]), get_rotation_x_matrix(angles[1])) : dot(get_rotation_x_matrix(angles[1], -1), get_rotation_z_matrix(angles[0], -1));
        }
    }, {
        key: 'redraw_all',
        value: function redraw_all() {
            this.ctx.clearRect(0, 0, this.config.W, this.config.H);
            var orders = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var obj = _step2.value;

                    try {
                        var coords = this.object_coords(obj);
                        var z = this.camera.rotated_coords(coords)[2];
                        orders.push(['object', coords, z, obj.color]);
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

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.objs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _obj2 = _step3.value;

                    try {
                        var _coords = this.direction_coords(_obj2);
                        var _z = this.camera.rotated_coords(add(_obj2.pos, mul(_obj2.v, 50)))[2];
                        orders.push(['direction', _coords, _z]);
                    } catch (e) {
                        if (!(e instanceof InvisibleError)) {
                            throw e;
                        }
                    }
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
                for (var _iterator4 = this.paths[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var path = _step4.value;

                    try {
                        var _coords2 = this.path_coords(path);
                        var z1 = this.camera.rotated_coords(path.prev_pos)[2];
                        var z2 = this.camera.rotated_coords(path.pos)[2];
                        orders.push(['path', _coords2, max(z1, z2)]);
                    } catch (e) {
                        if (!(e instanceof InvisibleError)) {
                            throw e;
                        }
                    }
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
                        _coords3 = _step5$value[1],
                        _z2 = _step5$value[2],
                        color = _step5$value[3];

                    switch (type) {
                        case 'object':
                            this.draw_object(_coords3, color);
                            break;
                        case 'direction':
                            this.draw_direction(_coords3);
                            break;
                        case 'path':
                            this.draw_path(_coords3);
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

},{"../camera/3d":4,"../error/invisible":9,"../matrix":11,"../object/sphere":13,"../util":14,"./2d":7}],9:[function(require,module,exports){
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

                var _engine$object_coords = engine.object_coords(obj),
                    _engine$object_coords2 = _slicedToArray(_engine$object_coords, 3),
                    cx = _engine$object_coords2[0],
                    cy = _engine$object_coords2[1],
                    r = _engine$object_coords2[2];

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
                    F = add(F, mul(unit_vector, obj.m / square(magnitude)));
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
            var rho = this.v_rho_controller.get();
            var phi = deg2rad(this.v_phi_controller.get());
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
            this.m_controller = new Controller(this, "Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.control_m);
            this.pos_x_controller = new Controller(this, "Position x", -pos_range, pos_range, this.pos[0], this.control_pos);
            this.pos_y_controller = new Controller(this, "Position y", -pos_range, pos_range, this.pos[1], this.control_pos);
            this.v_rho_controller = new Controller(this, "Velocity ρ", 0, v_range, v[0], this.control_v);
            this.v_phi_controller = new Controller(this, "Velocity φ", -180, 180, rad2deg(v[1]), this.control_v);
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
            this.pos_z_controller = new Controller(this, "Position z", -pos_range, pos_range, this.pos[2], this.control_pos);
            this.v_theta_controller = new Controller(this, "Velocity θ", -180, 180, rad2deg(v[2]), this.control_v);
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

    get_distance: function get_distance(x0, y0, x1, y1) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTSxZQUFZLFFBQVEsYUFBUixDQUFsQjs7QUFFQSxJQUFNLFlBQVksSUFBSSxTQUFKLENBQWMsTUFBZCxDQUFsQjtBQUNBLFVBQVUsT0FBVjs7Ozs7U0NKaUIsQztJQUFWLE0sTUFBQSxNOzs7QUFHUCxTQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUI7QUFDakIsV0FBTyxPQUFPLElBQVAsRUFBYSxDQUFiLEVBQWdCO0FBQ25CLGlCQUFTLG1CQURVO0FBRW5CLHNCQUFjLE9BRks7QUFHbkIscUJBQWEsQ0FITTtBQUluQixxQkFBYSxJQUpNO0FBS25CLDZCQUFxQixDQUxGO0FBTW5CLDZCQUFxQixDQU5GO0FBT25CLCtCQUF1QixHQVBKO0FBUW5CLGFBQUssR0FSYztBQVNuQixvQkFBWSxDQVRPO0FBVW5CLG9CQUFZLEdBVk87QUFXbkIsd0JBQWdCO0FBWEcsS0FBaEIsQ0FBUDtB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LEVBR0gsQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLEdBQVQsQ0FIRyxDQUFQO0FBS0gsS0F6R1E7O0FBMkdULDJCQUF1QiwrQkFBQyxDQUFELEVBQWdCO0FBQUEsWUFBWixHQUFZLHVFQUFOLENBQU07O0FBQ25DLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFDLEdBQVAsRUFBWSxDQUFaLENBREcsRUFFSCxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQUZHLEVBR0gsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FIRyxDQUFQO0FBS0g7QUFuSFEsQ0FBYjs7QUFzSEEsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IHByZXNldCA9IHJlcXVpcmUoJy4vcHJlc2V0Jyk7XG5jb25zdCBTaW11bGF0b3IgPSByZXF1aXJlKCcuL3NpbXVsYXRvcicpO1xuXG5jb25zdCBzaW11bGF0b3IgPSBuZXcgU2ltdWxhdG9yKHByZXNldCk7XG5zaW11bGF0b3IuYW5pbWF0ZSgpOyIsImNvbnN0IHtleHRlbmR9ID0gJDtcblxuXG5mdW5jdGlvbiBFTVBUWV8yRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBjLCB7XG4gICAgICAgICdUSVRMRSc6ICdHcmF2aXR5IFNpbXVsYXRvcicsXG4gICAgICAgICdCQUNLR1JPVU5EJzogXCJ3aGl0ZVwiLFxuICAgICAgICAnRElNRU5TSU9OJzogMixcbiAgICAgICAgJ01BWF9QQVRIUyc6IDEwMDAsXG4gICAgICAgICdDQU1FUkFfQ09PUkRfU1RFUCc6IDUsXG4gICAgICAgICdDQU1FUkFfQU5HTEVfU1RFUCc6IDEsXG4gICAgICAgICdDQU1FUkFfQUNDRUxFUkFUSU9OJzogMS4xLFxuICAgICAgICAnRyc6IDAuMSxcbiAgICAgICAgJ01BU1NfTUlOJzogMSxcbiAgICAgICAgJ01BU1NfTUFYJzogNGU0LFxuICAgICAgICAnVkVMT0NJVFlfTUFYJzogMTBcbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBFTVBUWV8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8yRChjKSwge1xuICAgICAgICAnRElNRU5TSU9OJzogMyxcbiAgICAgICAgJ0cnOiAwLjAwMSxcbiAgICAgICAgJ01BU1NfTUlOJzogMSxcbiAgICAgICAgJ01BU1NfTUFYJzogOGU2LFxuICAgICAgICAnVkVMT0NJVFlfTUFYJzogMTBcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFTVBUWV8zRDtcbiIsImNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBub3csIGdldF9yb3RhdGlvbl9tYXRyaXh9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5jbGFzcyBDYW1lcmEyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBlbmdpbmUpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMueiA9IDEwMDtcbiAgICAgICAgdGhpcy5waGkgPSAwO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5sYXN0X3RpbWUgPSAwO1xuICAgICAgICB0aGlzLmxhc3Rfa2V5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIHRoaXMuY2VudGVyID0gW2NvbmZpZy5XIC8gMiwgY29uZmlnLkggLyAyXTtcbiAgICB9XG5cbiAgICBnZXRfY29vcmRfc3RlcChrZXkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudF90aW1lID0gbm93KCk7XG4gICAgICAgIGlmIChrZXkgPT0gdGhpcy5sYXN0X2tleSAmJiBjdXJyZW50X3RpbWUgLSB0aGlzLmxhc3RfdGltZSA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdF90aW1lID0gY3VycmVudF90aW1lO1xuICAgICAgICB0aGlzLmxhc3Rfa2V5ID0ga2V5O1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuQ0FNRVJBX0NPT1JEX1NURVAgKiBwb3codGhpcy5jb25maWcuQ0FNRVJBX0FDQ0VMRVJBVElPTiwgdGhpcy5jb21ibyk7XG4gICAgfVxuXG4gICAgdXAoa2V5KSB7XG4gICAgICAgIHRoaXMueSAtPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGRvd24oa2V5KSB7XG4gICAgICAgIHRoaXMueSArPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGxlZnQoa2V5KSB7XG4gICAgICAgIHRoaXMueCAtPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJpZ2h0KGtleSkge1xuICAgICAgICB0aGlzLnggKz0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICB6b29tX2luKGtleSkge1xuICAgICAgICB0aGlzLnogLT0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICB6b29tX291dChrZXkpIHtcbiAgICAgICAgdGhpcy56ICs9IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlX2xlZnQoa2V5KSB7XG4gICAgICAgIHRoaXMucGhpIC09IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVfcmlnaHQoa2V5KSB7XG4gICAgICAgIHRoaXMucGhpICs9IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgIH1cblxuICAgIGdldF96b29tKHogPSAwKSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMueiAtIHo7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgSW52aXNpYmxlRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMTAwIC8gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgYWRqdXN0X2Nvb3Jkcyhjb29yZHMpIHtcbiAgICAgICAgY29uc3QgUiA9IGdldF9yb3RhdGlvbl9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbSgpO1xuICAgICAgICByZXR1cm4gYWRkKHRoaXMuY2VudGVyLCBtdWwoc3ViKHJvdGF0ZShjb29yZHMsIFIpLCBbdGhpcy54LCB0aGlzLnldKSwgem9vbSkpO1xuICAgIH1cblxuICAgIGFkanVzdF9yYWRpdXMoY29vcmRzLCByYWRpdXMpIHtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oKTtcbiAgICAgICAgcmV0dXJuIHJhZGl1cyAqIHpvb207XG4gICAgfVxuXG4gICAgYWN0dWFsX3BvaW50KHgsIHkpIHtcbiAgICAgICAgY29uc3QgUl8gPSBnZXRfcm90YXRpb25fbWF0cml4KGRlZzJyYWQodGhpcy5waGkpLCAtMSk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKCk7XG4gICAgICAgIHJldHVybiByb3RhdGUoYWRkKGRpdihzdWIoW3gsIHldLCB0aGlzLmNlbnRlciksIHpvb20pLCBbdGhpcy54LCB0aGlzLnldKSwgUl8pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmEyRDsiLCJjb25zdCBDYW1lcmEyRCA9IHJlcXVpcmUoJy4vMmQnKTtcbmNvbnN0IHtkZWcycmFkLCByb3RhdGUsIGdldF9yb3RhdGlvbl94X21hdHJpeCwgZ2V0X3JvdGF0aW9uX3lfbWF0cml4fSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcblxuXG5jbGFzcyBDYW1lcmEzRCBleHRlbmRzIENhbWVyYTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGVuZ2luZSkge1xuICAgICAgICBzdXBlcihjb25maWcsIGVuZ2luZSk7XG4gICAgICAgIHRoaXMudGhldGEgPSAwO1xuICAgIH1cblxuICAgIHJvdGF0ZV91cChrZXkpIHtcbiAgICAgICAgdGhpcy50aGV0YSAtPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlX2Rvd24oa2V5KSB7XG4gICAgICAgIHRoaXMudGhldGEgKz0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZWRfY29vcmRzKGNvb3Jkcykge1xuICAgICAgICBjb25zdCBSeCA9IGdldF9yb3RhdGlvbl94X21hdHJpeChkZWcycmFkKHRoaXMudGhldGEpKTtcbiAgICAgICAgY29uc3QgUnkgPSBnZXRfcm90YXRpb25feV9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICByZXR1cm4gcm90YXRlKHJvdGF0ZShjb29yZHMsIFJ4KSwgUnkpO1xuICAgIH1cblxuICAgIGFkanVzdF9jb29yZHMoY29vcmRzKSB7XG4gICAgICAgIGNvbnN0IGMgPSB0aGlzLnJvdGF0ZWRfY29vcmRzKGNvb3Jkcyk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKGMucG9wKCkpO1xuICAgICAgICByZXR1cm4gYWRkKHRoaXMuY2VudGVyLCBtdWwoc3ViKGMsIFt0aGlzLngsIHRoaXMueV0pLCB6b29tKSk7XG4gICAgfVxuXG4gICAgYWRqdXN0X3JhZGl1cyhjb29yZHMsIHJhZGl1cykge1xuICAgICAgICBjb25zdCBjID0gdGhpcy5yb3RhdGVkX2Nvb3Jkcyhjb29yZHMpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbShjLnBvcCgpKTtcbiAgICAgICAgcmV0dXJuIHJhZGl1cyAqIHpvb207XG4gICAgfVxuXG4gICAgYWN0dWFsX3BvaW50KHgsIHkpIHtcbiAgICAgICAgY29uc3QgUnhfID0gZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGRlZzJyYWQodGhpcy50aGV0YSksIC0xKTtcbiAgICAgICAgY29uc3QgUnlfID0gZ2V0X3JvdGF0aW9uX3lfbWF0cml4KGRlZzJyYWQodGhpcy5waGkpLCAtMSk7XG4gICAgICAgIGNvbnN0IGMgPSBhZGQoc3ViKFt4LCB5XSwgdGhpcy5jZW50ZXIpLCBbdGhpcy54LCB0aGlzLnldKS5jb25jYXQoMCk7XG4gICAgICAgIHJldHVybiByb3RhdGUocm90YXRlKGMsIFJ5XyksIFJ4Xyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTNEOyIsImNsYXNzIENvbnRyb2xCb3gge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBjb250cm9sbGVycykge1xuICAgICAgICBjb25zdCAkdGVtcGxhdGVDb250cm9sQm94ID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJyk7XG4gICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gJHRlbXBsYXRlQ29udHJvbEJveC5jbG9uZSgpO1xuICAgICAgICAkY29udHJvbEJveC5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnRpdGxlJykudGV4dCh0aXRsZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dENvbnRhaW5lciA9ICRjb250cm9sQm94LmZpbmQoJy5pbnB1dC1jb250YWluZXInKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sbGVyIG9mIGNvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgICAkaW5wdXRDb250YWluZXIuYXBwZW5kKGNvbnRyb2xsZXIuJGlucHV0V3JhcHBlcik7XG4gICAgICAgIH1cbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLmNsb3NlJykuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY29udHJvbEJveC5pbnNlcnRBZnRlcigkdGVtcGxhdGVDb250cm9sQm94KTtcblxuICAgICAgICB0aGlzLiRjb250cm9sQm94ID0gJGNvbnRyb2xCb3g7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy4kY29udHJvbEJveC5yZW1vdmUoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbEJveDsiLCJjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIG5hbWUsIG1pbiwgbWF4LCB2YWx1ZSwgZnVuYykge1xuICAgICAgICBjb25zdCAkaW5wdXRXcmFwcGVyID0gdGhpcy4kaW5wdXRXcmFwcGVyID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlIC5pbnB1dC13cmFwcGVyLnRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5maW5kKCcubmFtZScpLnRleHQobmFtZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dCA9IHRoaXMuJGlucHV0ID0gJGlucHV0V3JhcHBlci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAkaW5wdXQuYXR0cignbWluJywgbWluKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21heCcsIG1heCk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd2YWx1ZScsIHZhbHVlKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3N0ZXAnLCAwLjAxKTtcbiAgICAgICAgY29uc3QgJHZhbHVlID0gJGlucHV0V3JhcHBlci5maW5kKCcudmFsdWUnKTtcbiAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICRpbnB1dC5vbignaW5wdXQnLCBlID0+IHtcbiAgICAgICAgICAgICR2YWx1ZS50ZXh0KHRoaXMuZ2V0KCkpO1xuICAgICAgICAgICAgZnVuYy5jYWxsKG9iamVjdCwgZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy4kaW5wdXQudmFsKCkpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sbGVyOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4uL29iamVjdC9jaXJjbGUnKTtcbmNvbnN0IENhbWVyYTJEID0gcmVxdWlyZSgnLi4vY2FtZXJhLzJkJyk7XG5jb25zdCBJbnZpc2libGVFcnJvciA9IHJlcXVpcmUoJy4uL2Vycm9yL2ludmlzaWJsZScpO1xuY29uc3Qge3ZlY3Rvcl9tYWduaXR1ZGUsIHJvdGF0ZSwgbm93LCByYW5kb20sIHBvbGFyMmNhcnRlc2lhbiwgcmFuZF9jb2xvciwgZ2V0X3JvdGF0aW9uX21hdHJpeCwgY2FydGVzaWFuMmF1dG99ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21pbn0gPSBNYXRoO1xuXG5cbmNsYXNzIFBhdGgge1xuICAgIGNvbnN0cnVjdG9yKG9iaikge1xuICAgICAgICB0aGlzLnByZXZfcG9zID0gb2JqLnByZXZfcG9zLnNsaWNlKCk7XG4gICAgICAgIHRoaXMucG9zID0gb2JqLnBvcy5zbGljZSgpO1xuICAgIH1cbn1cblxuY2xhc3MgRW5naW5lMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgY3R4KSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcbiAgICAgICAgdGhpcy5vYmpzID0gW107XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udHJvbGJveGVzID0gW107XG4gICAgICAgIHRoaXMucGF0aHMgPSBbXTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhMkQoY29uZmlnLCB0aGlzKTtcbiAgICAgICAgdGhpcy5mcHNfbGFzdF90aW1lID0gbm93KCk7XG4gICAgICAgIHRoaXMuZnBzX2NvdW50ID0gMDtcbiAgICB9XG5cbiAgICBkZXN0cm95X2NvbnRyb2xib3hlcygpIHtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sYm94IG9mIHRoaXMuY29udHJvbGJveGVzKSB7XG4gICAgICAgICAgICBjb250cm9sYm94LmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRyb2xib3hlcyA9IFtdXG4gICAgfVxuXG4gICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgdGhpcy5wcmludF9mcHMoKTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZV9hbGwoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlZHJhd19hbGwoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUoKTtcbiAgICAgICAgfSwgMTApO1xuICAgIH1cblxuICAgIG9iamVjdF9jb29yZHMob2JqKSB7XG4gICAgICAgIGNvbnN0IHIgPSB0aGlzLmNhbWVyYS5hZGp1c3RfcmFkaXVzKG9iai5wb3MsIG9iai5nZXRfcigpKTtcbiAgICAgICAgY29uc3QgW3gsIHldID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIFt4LCB5LCByXTtcbiAgICB9XG5cbiAgICBkaXJlY3Rpb25fY29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCBbY3gsIGN5XSA9IHRoaXMuY2FtZXJhLmFkanVzdF9jb29yZHMob2JqLnBvcyk7XG4gICAgICAgIGNvbnN0IFtkeCwgZHldID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhhZGQob2JqLnBvcywgbXVsKG9iai52LCA1MCkpKTtcbiAgICAgICAgcmV0dXJuIFtjeCwgY3ksIGR4LCBkeV07XG4gICAgfVxuXG4gICAgcGF0aF9jb29yZHMob2JqKSB7XG4gICAgICAgIGNvbnN0IFtmeCwgZnldID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucHJldl9wb3MpO1xuICAgICAgICBjb25zdCBbdHgsIHR5XSA9IHRoaXMuY2FtZXJhLmFkanVzdF9jb29yZHMob2JqLnBvcyk7XG4gICAgICAgIHJldHVybiBbZngsIGZ5LCB0eCwgdHldO1xuICAgIH1cblxuICAgIGRyYXdfb2JqZWN0KGMsIGNvbG9yID0gbnVsbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBDaXJjbGUpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5vYmplY3RfY29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMoY1swXSwgY1sxXSwgY1syXSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yIHx8IGMuY29sb3I7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd19kaXJlY3Rpb24oYykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBDaXJjbGUpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5kaXJlY3Rpb25fY29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oY1swXSwgY1sxXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oY1syXSwgY1szXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgSW52aXNpYmxlRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXdfcGF0aChjKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIFBhdGgpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5wYXRoX2Nvb3JkcyhjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGNbMF0sIGNbMV0pO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnI2RkZGRkZCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVfcGF0aChvYmopIHtcbiAgICAgICAgaWYgKG1hZyhzdWIob2JqLnBvcywgb2JqLnByZXZfcG9zKSkgPiA1KSB7XG4gICAgICAgICAgICB0aGlzLnBhdGhzLnB1c2gobmV3IFBhdGgob2JqKSk7XG4gICAgICAgICAgICBvYmoucHJldl9wb3MgPSBvYmoucG9zLnNsaWNlKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wYXRocy5sZW5ndGggPiB0aGlzLmNvbmZpZy5NQVhfUEFUSFMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhzID0gdGhpcy5wYXRocy5zbGljZSgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZV9vYmplY3QoeCwgeSwgbSA9IG51bGwsIHYgPSBudWxsLCBjb2xvciA9IG51bGwsIGNvbnRyb2xib3ggPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuY2FtZXJhLmFjdHVhbF9wb2ludCh4LCB5KTtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgICBsZXQgbWF4X3IgPSBDaXJjbGUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgICAgIG1heF9yID0gbWluKG1heF9yLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5nZXRfcigpKSAvIDEuNSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG0gPSBDaXJjbGUuZ2V0X21fZnJvbV9yKHJhbmRvbShDaXJjbGUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUlOKSwgbWF4X3IpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgIHYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbG9yKSB7XG4gICAgICAgICAgICBjb2xvciA9IHJhbmRfY29sb3IoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0YWcgPSBgY2lyY2xlJHt0aGlzLm9ianMubGVuZ3RofWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBDaXJjbGUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcywgY29udHJvbGJveCk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzWzBdLCBkaXIpO1xuICAgIH1cblxuICAgIGVsYXN0aWNfY29sbGlzaW9uKCkge1xuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmNvbmZpZy5ESU1FTlNJT047XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vYmpzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvMSA9IHRoaXMub2Jqc1tpXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMub2Jqcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG8yID0gdGhpcy5vYmpzW2pdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHN1YihvMi5wb3MsIG8xLnBvcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGVzID0gY2FydGVzaWFuMmF1dG8oY29sbGlzaW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYW5nbGVzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZCA8IG8xLmdldF9yKCkgKyBvMi5nZXRfcigpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFIgPSB0aGlzLmdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUl8gPSB0aGlzLmdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzLCAtMSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFIsIFJfKVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfdGVtcCA9IFtyb3RhdGUobzEudiwgUiksIHJvdGF0ZShvMi52LCBSKV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfZmluYWwgPSBbdl90ZW1wWzBdLnNsaWNlKCksIHZfdGVtcFsxXS5zbGljZSgpXTtcbiAgICAgICAgICAgICAgICAgICAgdl9maW5hbFswXVswXSA9ICgobzEubSAtIG8yLm0pICogdl90ZW1wWzBdWzBdICsgMiAqIG8yLm0gKiB2X3RlbXBbMV1bMF0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgdl9maW5hbFsxXVswXSA9ICgobzIubSAtIG8xLm0pICogdl90ZW1wWzFdWzBdICsgMiAqIG8xLm0gKiB2X3RlbXBbMF1bMF0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgbzEudiA9IHJvdGF0ZSh2X2ZpbmFsWzBdLCBSXyk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnYgPSByb3RhdGUodl9maW5hbFsxXSwgUl8pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc190ZW1wID0gW3plcm9zKGRpbWVuc2lvbiksIHJvdGF0ZShjb2xsaXNpb24sIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RlbXBbMF1bMF0gKz0gdl9maW5hbFswXVswXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RlbXBbMV1bMF0gKz0gdl9maW5hbFsxXVswXTtcbiAgICAgICAgICAgICAgICAgICAgbzEucG9zID0gYWRkKG8xLnBvcywgcm90YXRlKHBvc190ZW1wWzBdLCBSXykpO1xuICAgICAgICAgICAgICAgICAgICBvMi5wb3MgPSBhZGQobzEucG9zLCByb3RhdGUocG9zX3RlbXBbMV0sIFJfKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX2FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlX3ZlbG9jaXR5KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsYXN0aWNfY29sbGlzaW9uKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlX3Bvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZV9wYXRoKG9iaik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWRyYXdfYWxsKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgdGhpcy5kcmF3X29iamVjdChvYmopO1xuICAgICAgICAgICAgdGhpcy5kcmF3X2RpcmVjdGlvbihvYmopO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0aGlzLnBhdGhzKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdfcGF0aChwYXRoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaW50X2ZwcygpIHtcbiAgICAgICAgdGhpcy5mcHNfY291bnQgKz0gMTtcbiAgICAgICAgY29uc3QgY3VycmVudF90aW1lID0gbm93KCk7XG4gICAgICAgIGNvbnN0IGZwc190aW1lX2RpZmYgPSBjdXJyZW50X3RpbWUgLSB0aGlzLmZwc19sYXN0X3RpbWVcbiAgICAgICAgaWYgKGZwc190aW1lX2RpZmYgPiAxKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHsodGhpcy5mcHNfY291bnQgLyBmcHNfdGltZV9kaWZmKSB8IDB9IGZwc2ApO1xuICAgICAgICAgICAgdGhpcy5mcHNfbGFzdF90aW1lID0gY3VycmVudF90aW1lO1xuICAgICAgICAgICAgdGhpcy5mcHNfY291bnQgPSAwO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTJEOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi8yZCcpO1xuY29uc3QgQ2FtZXJhM0QgPSByZXF1aXJlKCcuLi9jYW1lcmEvM2QnKTtcbmNvbnN0IFNwaGVyZSA9IHJlcXVpcmUoJy4uL29iamVjdC9zcGhlcmUnKTtcbmNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7dmVjdG9yX21hZ25pdHVkZSwgcmFuZG9tLCBnZXRfcm90YXRpb25feF9tYXRyaXgsIGdldF9yb3RhdGlvbl96X21hdHJpeCwgcmFuZF9jb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWluLCBtYXh9ID0gTWF0aDtcblxuXG5jbGFzcyBFbmdpbmUzRCBleHRlbmRzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGN0eCkge1xuICAgICAgICBzdXBlcihjb25maWcsIGN0eCk7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYTNEKGNvbmZpZywgdGhpcyk7XG4gICAgfVxuXG4gICAgZGlyZWN0aW9uX2Nvb3JkcyhvYmopIHtcbiAgICAgICAgbGV0IGZhY3RvciA9IDUwO1xuICAgICAgICBsZXQgYyA9IHRoaXMuY2FtZXJhLnJvdGF0ZWRfY29vcmRzKG9iai5wb3MpO1xuICAgICAgICBjb25zdCBtaW5GYWN0b3IgPSAodGhpcy5jYW1lcmEueiAtIGNbMl0gLSAxKSAvIG9iai52WzJdO1xuICAgICAgICBjb25zb2xlLmxvZyhtaW5GYWN0b3IpO1xuICAgICAgICBpZiAobWluRmFjdG9yID4gMCkgZmFjdG9yID0gbWluKGZhY3RvciwgbWluRmFjdG9yKTtcbiAgICAgICAgY29uc3QgW2N4LCBjeV0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmRzKG9iai5wb3MpO1xuICAgICAgICBjb25zdCBbZHgsIGR5XSA9IHRoaXMuY2FtZXJhLmFkanVzdF9jb29yZHMoYWRkKG9iai5wb3MsIG11bChvYmoudiwgZmFjdG9yKSkpO1xuICAgICAgICByZXR1cm4gW2N4LCBjeSwgZHgsIGR5XTtcbiAgICB9XG5cbiAgICBjcmVhdGVfb2JqZWN0KHgsIHksIG0gPSBudWxsLCB2ID0gbnVsbCwgY29sb3IgPSBudWxsLCBjb250cm9sYm94ID0gdHJ1ZSkge1xuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmNhbWVyYS5hY3R1YWxfcG9pbnQoeCwgeSk7XG4gICAgICAgIGlmICghbSkge1xuICAgICAgICAgICAgbGV0IG1heF9yID0gU3BoZXJlLmdldF9yX2Zyb21fbSh0aGlzLmNvbmZpZy5NQVNTX01BWCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgICAgICBtYXhfciA9IG1pbihtYXhfciwgKG1hZyhvYmoucG9zIC0gcG9zKSAtIG9iai5nZXRfcigpKSAvIDEuNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtID0gU3BoZXJlLmdldF9tX2Zyb21fcihyYW5kb20oU3BoZXJlLmdldF9yX2Zyb21fbSh0aGlzLmNvbmZpZy5NQVNTX01JTiksIG1heF9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgICB2ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApLCByYW5kb20oLTE4MCwgMTgwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb2xvcikge1xuICAgICAgICAgICAgY29sb3IgPSByYW5kX2NvbG9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGFnID0gYHNwaGVyZSR7dGhpcy5vYmpzLmxlbmd0aH1gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMsIGNvbnRyb2xib3gpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzLCBkaXIgPSAxKSB7XG4gICAgICAgIHJldHVybiBkaXIgPT0gMVxuICAgICAgICAgICAgPyBkb3QoZ2V0X3JvdGF0aW9uX3pfbWF0cml4KGFuZ2xlc1swXSksIGdldF9yb3RhdGlvbl94X21hdHJpeChhbmdsZXNbMV0pKVxuICAgICAgICAgICAgOiBkb3QoZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGFuZ2xlc1sxXSwgLTEpLCBnZXRfcm90YXRpb25fel9tYXRyaXgoYW5nbGVzWzBdLCAtMSkpO1xuICAgIH1cblxuICAgIHJlZHJhd19hbGwoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKTtcbiAgICAgICAgY29uc3Qgb3JkZXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLm9iamVjdF9jb29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gdGhpcy5jYW1lcmEucm90YXRlZF9jb29yZHMoY29vcmRzKVsyXTtcbiAgICAgICAgICAgICAgICBvcmRlcnMucHVzaChbJ29iamVjdCcsIGNvb3Jkcywgeiwgb2JqLmNvbG9yXSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0gdGhpcy5kaXJlY3Rpb25fY29vcmRzKG9iaik7XG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IHRoaXMuY2FtZXJhLnJvdGF0ZWRfY29vcmRzKGFkZChvYmoucG9zLCBtdWwob2JqLnYsIDUwKSkpWzJdO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsnZGlyZWN0aW9uJywgY29vcmRzLCB6XSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wYXRocykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLnBhdGhfY29vcmRzKHBhdGgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHoxID0gdGhpcy5jYW1lcmEucm90YXRlZF9jb29yZHMocGF0aC5wcmV2X3BvcylbMl07XG4gICAgICAgICAgICAgICAgY29uc3QgejIgPSB0aGlzLmNhbWVyYS5yb3RhdGVkX2Nvb3JkcyhwYXRoLnBvcylbMl07XG4gICAgICAgICAgICAgICAgb3JkZXJzLnB1c2goWydwYXRoJywgY29vcmRzLCBtYXgoejEsIHoyKV0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb3JkZXJzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhWzJdIC0gYlsyXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAoY29uc3QgW3R5cGUsIGNvb3JkcywgeiwgY29sb3JdIG9mIG9yZGVycykge1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3X29iamVjdChjb29yZHMsIGNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGlyZWN0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3X2RpcmVjdGlvbihjb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwYXRoJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3X3BhdGgoY29vcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5naW5lM0Q7IiwiY2xhc3MgSW52aXNpYmxlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnZpc2libGVFcnJvcjsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vZW5naW5lLzJkJyk7XG5jb25zdCBFbmdpbmUzRCA9IHJlcXVpcmUoJy4vZW5naW5lLzNkJyk7XG5jb25zdCB7Z2V0X2Rpc3RhbmNlfSA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5cbmxldCBjb25maWcgPSBudWxsO1xuY29uc3Qga2V5bWFwID0ge1xuICAgIDM4OiAndXAnLFxuICAgIDQwOiAnZG93bicsXG4gICAgMzc6ICdsZWZ0JyxcbiAgICAzOTogJ3JpZ2h0JyxcbiAgICA5MDogJ3pvb21faW4nLCAvLyB6XG4gICAgODg6ICd6b29tX291dCcsIC8vIHhcbiAgICA4NzogJ3JvdGF0ZV91cCcsIC8vIHdcbiAgICA4MzogJ3JvdGF0ZV9kb3duJywgLy8gc1xuICAgIDY1OiAncm90YXRlX2xlZnQnLCAvLyBhXG4gICAgNjg6ICdyb3RhdGVfcmlnaHQnIC8vIGRcbn07XG5cbmZ1bmN0aW9uIG9uX3Jlc2l6ZSgkY2FudmFzKSB7XG4gICAgY29uZmlnLlcgPSAkY2FudmFzWzBdLndpZHRoID0gJGNhbnZhcy53aWR0aCgpO1xuICAgIGNvbmZpZy5IID0gJGNhbnZhc1swXS5oZWlnaHQgPSAkY2FudmFzLmhlaWdodCgpO1xuXG59XG5cbmZ1bmN0aW9uIG9uX2NsaWNrKGV2ZW50LCBlbmdpbmUpIHtcbiAgICBjb25zdCB4ID0gZXZlbnQucGFnZVg7XG4gICAgY29uc3QgeSA9IGV2ZW50LnBhZ2VZO1xuICAgIGlmICghZW5naW5lLmFuaW1hdGluZykge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiBlbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgY29uc3QgW2N4LCBjeSwgcl0gPSBlbmdpbmUub2JqZWN0X2Nvb3JkcyhvYmopO1xuICAgICAgICAgICAgaWYgKGdldF9kaXN0YW5jZShjeCwgY3ksIHgsIHkpIDwgcikge1xuICAgICAgICAgICAgICAgIG9iai5zaG93X2NvbnRyb2xib3goKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZW5naW5lLmNyZWF0ZV9vYmplY3QoeCwgeSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbl9rZXlfZG93bihldmVudCwgZW5naW5lKSB7XG4gICAgY29uc3Qge2tleUNvZGV9ID0gZXZlbnQ7XG4gICAgaWYgKGtleUNvZGUgPT0gMzIpIHsgLy8gc3BhY2UgYmFyXG4gICAgICAgIGVuZ2luZS5kZXN0cm95X2NvbnRyb2xib3hlcygpO1xuICAgICAgICBlbmdpbmUuYW5pbWF0aW5nID0gIWVuZ2luZS5hbmltYXRpbmc7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gYCR7Y29uZmlnLlRJVExFfSAoJHtlbmdpbmUuYW5pbWF0aW5nID8gXCJTaW11bGF0aW5nXCIgOiBcIlBhdXNlZFwifSlgO1xuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSBpbiBrZXltYXAgJiYga2V5bWFwW2tleUNvZGVdIGluIGVuZ2luZS5jYW1lcmEpIHtcbiAgICAgICAgZW5naW5lLmNhbWVyYVtrZXltYXBba2V5Q29kZV1dKGtleUNvZGUpO1xuICAgIH1cbn1cblxuY2xhc3MgU2ltdWxhdG9yIHtcbiAgICBjb25zdHJ1Y3RvcihwcmVzZXQpIHtcbiAgICAgICAgY29uZmlnID0gcHJlc2V0KHt9KTtcbiAgICAgICAgY29uc3QgJGNhbnZhcyA9ICQoJ2NhbnZhcycpO1xuICAgICAgICBjb25zdCBjdHggPSAkY2FudmFzWzBdLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIG9uX3Jlc2l6ZSgkY2FudmFzKTtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBuZXcgKGNvbmZpZy5ESU1FTlNJT04gPT0gMiA/IEVuZ2luZTJEIDogRW5naW5lM0QpKGNvbmZpZywgY3R4KTtcbiAgICAgICAgJGNhbnZhcy5yZXNpemUoZSA9PiB7XG4gICAgICAgICAgICBvbl9yZXNpemUoJGNhbnZhcyk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY2FudmFzLmNsaWNrKGUgPT4ge1xuICAgICAgICAgICAgb25fY2xpY2soZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnYm9keScpLmtleWRvd24oZSA9PiB7XG4gICAgICAgICAgICBvbl9rZXlfZG93bihlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFuaW1hdGUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLmFuaW1hdGUoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltdWxhdG9yOyIsImZ1bmN0aW9uIGl0ZXIoYSwgZnVuYykge1xuICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgIGNvbnN0IG0gPSBuZXcgQXJyYXkoYV9yKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfcjsgaSsrKSB7XG4gICAgICAgIG1baV0gPSBmdW5jKGkpO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgemVyb3M6IE4gPT4ge1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KE4pLmZpbGwoMCk7XG4gICAgfSxcblxuICAgIG1hZzogYSA9PiB7XG4gICAgICAgIGNvbnN0IGFfciA9IGEubGVuZ3RoO1xuICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICAgICAgc3VtICs9IGFbaV0gKiBhW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoc3VtKTtcbiAgICB9LFxuXG4gICAgYWRkOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICsgYltpXTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHN1YjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAtIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBtdWw6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gKiBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZGl2OiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldIC8gYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRvdDogKGEsIGIpID0+IHtcbiAgICAgICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGFfYyA9IGFbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBiX2MgPSBiWzBdLmxlbmd0aDtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBBcnJheShhX3IpO1xuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IGFfcjsgcisrKSB7XG4gICAgICAgICAgICBtW3JdID0gbmV3IEFycmF5KGJfYyk7XG4gICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGJfYzsgYysrKSB7XG4gICAgICAgICAgICAgICAgbVtyXVtjXSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX2M7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBtW3JdW2NdICs9IGFbcl1baV0gKiBiW2ldW2NdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG59OyIsImNvbnN0IENvbnRyb2xCb3ggPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xfYm94Jyk7XG5jb25zdCBDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbC9jb250cm9sbGVyJyk7XG5jb25zdCB7dmVjdG9yX21hZ25pdHVkZSwgcmFkMmRlZywgZGVnMnJhZCwgcG9sYXIyY2FydGVzaWFuLCBjYXJ0ZXNpYW4yYXV0bywgc3F1YXJlfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttYXgsIHBvd30gPSBNYXRoO1xuXG5cbmNsYXNzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogUG9sYXIgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICAgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2xhcl9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIGVuZ2luZSwgY29udHJvbGJveCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMucHJldl9wb3MgPSBwb3Muc2xpY2UoKTtcbiAgICAgICAgdGhpcy52ID0gdjtcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgICAgICB0aGlzLnRhZyA9IHRhZztcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICAgICAgdGhpcy5jb250cm9sYm94ID0gbnVsbDtcbiAgICAgICAgaWYgKGNvbnRyb2xib3gpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd19jb250cm9sYm94KClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldF9yKCkge1xuICAgICAgICByZXR1cm4gQ2lyY2xlLmdldF9yX2Zyb21fbSh0aGlzLm0pXG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX3ZlbG9jaXR5KCkge1xuICAgICAgICBsZXQgRiA9IHplcm9zKHRoaXMuY29uZmlnLkRJTUVOU0lPTik7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIGlmIChvYmogPT0gdGhpcykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCB2ZWN0b3IgPSBzdWIodGhpcy5wb3MsIG9iai5wb3MpO1xuICAgICAgICAgICAgY29uc3QgbWFnbml0dWRlID0gbWFnKHZlY3Rvcik7XG4gICAgICAgICAgICBjb25zdCB1bml0X3ZlY3RvciA9IGRpdih2ZWN0b3IsIG1hZ25pdHVkZSk7XG4gICAgICAgICAgICBGID0gYWRkKEYsIG11bCh1bml0X3ZlY3Rvciwgb2JqLm0gLyBzcXVhcmUobWFnbml0dWRlKSkpXG4gICAgICAgIH1cbiAgICAgICAgRiA9IG11bChGLCAtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBkaXYoRiwgdGhpcy5tKTtcbiAgICAgICAgdGhpcy52ID0gYWRkKHRoaXMudiwgYSk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX3Bvc2l0aW9uKCkge1xuICAgICAgICB0aGlzLnBvcyA9IGFkZCh0aGlzLnBvcywgdGhpcy52KTtcbiAgICB9XG5cbiAgICBjb250cm9sX20oZSkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tX2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgfVxuXG4gICAgY29udHJvbF9wb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NfeF9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NfeV9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5XTtcbiAgICB9XG5cbiAgICBjb250cm9sX3YoZSkge1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZfcmhvX2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52X3BoaV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgdGhpcy52ID0gcG9sYXIyY2FydGVzaWFuKHJobywgcGhpKTtcbiAgICB9XG5cbiAgICBzaG93X2NvbnRyb2xib3goKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xib3gudGsubGlmdCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zdCBtYXJnaW4gPSAxLjU7XG5cbiAgICAgICAgICAgIHZhciBwb3NfcmFuZ2UgPSBtYXgobWF4KHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpIC8gMiwgbWF4LmFwcGx5KG51bGwsIHRoaXMucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICBwb3NfcmFuZ2UgPSBtYXgocG9zX3JhbmdlLCBtYXguYXBwbHkobnVsbCwgb2JqLnBvcy5tYXAoTWF0aC5hYnMpKSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZfcmFuZ2UgPSBtYXgodGhpcy5jb25maWcuVkVMT0NJVFlfTUFYLCBtYWcodGhpcy52KSAqIG1hcmdpbik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICAgICAgdl9yYW5nZSA9IG1heCh2X3JhbmdlLCBtYWcob2JqLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sYm94ID0gbmV3IENvbnRyb2xCb3godGhpcy50YWcsIHRoaXMuZ2V0X2NvbnRyb2xsZXJzKCkpO1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUuY29udHJvbGJveGVzLnB1c2godGhpcy5jb250cm9sYm94KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICB0aGlzLm1fY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiTWFzcyBtXCIsIHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCwgbSwgdGhpcy5jb250cm9sX20pO1xuICAgICAgICB0aGlzLnBvc194X2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHhcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1swXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geVwiLCAtcG9zX3JhbmdlLCBwb3NfcmFuZ2UsIHRoaXMucG9zWzFdLCB0aGlzLmNvbnRyb2xfcG9zKTtcbiAgICAgICAgdGhpcy52X3Job19jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDPgVwiLCAwLCB2X3JhbmdlLCB2WzBdLCB0aGlzLmNvbnRyb2xfdik7XG4gICAgICAgIHRoaXMudl9waGlfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4ZcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMV0pLCB0aGlzLmNvbnRyb2xfdik7XG4gICAgfVxuXG4gICAgZ2V0X2NvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tX2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc194X2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc195X2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZfcmhvX2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZfcGhpX2NvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0X3JfZnJvbV9tKG0pIHtcbiAgICAgICAgcmV0dXJuIHBvdyhtLCAxIC8gMilcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0X21fZnJvbV9yKHIpIHtcbiAgICAgICAgcmV0dXJuIHNxdWFyZShyKVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyd0YWcnOiB0aGlzLnRhZywgJ3YnOiB0aGlzLnYsICdwb3MnOiB0aGlzLnBvc30pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGU7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi9jaXJjbGUnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHtyYWQyZGVnLCBkZWcycmFkLCBzcGhlcmljYWwyY2FydGVzaWFufSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHtjdWJlfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHtwb3d9ID0gTWF0aDtcblxuXG5jbGFzcyBTcGhlcmUgZXh0ZW5kcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFNwaGVyaWNhbCBjb29yZGluYXRlIHN5c3RlbVxuICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NwaGVyaWNhbF9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgZ2V0X3IoKSB7XG4gICAgICAgIHJldHVybiBTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMubSk7XG4gICAgfVxuXG4gICAgY29udHJvbF9wb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NfeF9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NfeV9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB6ID0gdGhpcy5wb3Nfel9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5LCB6XTtcbiAgICB9XG5cbiAgICBjb250cm9sX3YoZSkge1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudl9waGlfY29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHRoZXRhID0gZGVnMnJhZCh0aGlzLnZfdGhldGFfY29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudl9yaG9fY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy52ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyaG8sIHBoaSwgdGhldGEpO1xuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICBzdXBlci5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICB0aGlzLnBvc196X2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHpcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1syXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMudl90aGV0YV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDOuFwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsyXSksIHRoaXMuY29udHJvbF92KTtcbiAgICB9XG5cbiAgICBnZXRfY29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3hfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3pfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9yaG9fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9waGlfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl90aGV0YV9jb250cm9sbGVyXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldF9yX2Zyb21fbShtKSB7XG4gICAgICAgIHJldHVybiBwb3cobSwgMSAvIDMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfbV9mcm9tX3Iocikge1xuICAgICAgICByZXR1cm4gY3ViZShyKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3BoZXJlOyIsImNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuL21hdHJpeCcpO1xuXG5jb25zdCBVdGlsID0ge1xuICAgIHNxdWFyZTogKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIHggKiB4O1xuICAgIH0sXG5cbiAgICBjdWJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHggKiB4O1xuICAgIH0sXG5cbiAgICBwb2xhcjJjYXJ0ZXNpYW46IChyaG8sIHBoaSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHBoaSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnBvbGFyOiAoeCwgeSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbWFnKFt4LCB5XSksXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIHNwaGVyaWNhbDJjYXJ0ZXNpYW46IChyaG8sIHBoaSwgdGhldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLnNpbihwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5jb3ModGhldGEpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJzcGhlcmljYWw6ICh4LCB5LCB6KSA9PiB7XG4gICAgICAgIGNvbnN0IHJobyA9IG1hZyhbeCwgeSwgel0pO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvLFxuICAgICAgICAgICAgTWF0aC5hdGFuMih5LCB4KSxcbiAgICAgICAgICAgIHJobyAhPSAwID8gTWF0aC5hY29zKHogLyByaG8pIDogMFxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4yYXV0bzogKHZlY3RvcikgPT4ge1xuICAgICAgICByZXR1cm4gdmVjdG9yLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICA/IFV0aWwuY2FydGVzaWFuMnBvbGFyKHZlY3RvclswXSwgdmVjdG9yWzFdKVxuICAgICAgICAgICAgOiBVdGlsLmNhcnRlc2lhbjJzcGhlcmljYWwodmVjdG9yWzBdLCB2ZWN0b3JbMV0sIHZlY3RvclsyXSk7XG4gICAgfSxcblxuICAgIHJhZDJkZWc6IChyYWQpID0+IHtcbiAgICAgICAgcmV0dXJuIHJhZCAvIE1hdGguUEkgKiAxODA7XG4gICAgfSxcblxuICAgIGRlZzJyYWQ6IChkZWcpID0+IHtcbiAgICAgICAgcmV0dXJuIGRlZyAvIDE4MCAqIE1hdGguUEk7XG4gICAgfSxcblxuICAgIGdldF9kaXN0YW5jZTogKHgwLCB5MCwgeDEsIHkxKSA9PiB7XG4gICAgICAgIHJldHVybiBtYWcoW3gxIC0geDAsIHkxIC0geTBdKTtcbiAgICB9LFxuXG4gICAgcm90YXRlOiAodmVjdG9yLCBtYXRyaXgpID0+IHtcbiAgICAgICAgcmV0dXJuIGRvdChbdmVjdG9yXSwgbWF0cml4KVswXTtcbiAgICB9LFxuXG4gICAgbm93OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgfSxcblxuICAgIHJhbmRvbTogKG1pbiwgbWF4ID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgICAgICAgIG1heCA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiAgICB9LFxuXG4gICAgcmFuZF9jb2xvcjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gJyMnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTY3NzcyMTUpLnRvU3RyaW5nKDE2KTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbl0sXG4gICAgICAgICAgICBbc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl94X21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIGNvcywgLXNpbl0sXG4gICAgICAgICAgICBbMCwgc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl95X21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgMCwgLXNpbl0sXG4gICAgICAgICAgICBbMCwgMSwgMF0sXG4gICAgICAgICAgICBbc2luLCAwLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl96X21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbiwgMF0sXG4gICAgICAgICAgICBbc2luLCBjb3MsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDFdXG4gICAgICAgIF07XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsOyJdfQ==

//# sourceMappingURL=gravity_simulator.js.map
