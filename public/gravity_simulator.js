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
        value: function adjust_coords(c) {
            var R = get_rotation_matrix(deg2rad(this.phi));
            c = rotate(c, R);
            var zoom = this.get_zoom();
            var coords = add(this.center, mul(sub(c, [this.x, this.y]), zoom));
            return { coords: coords };
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
        value: function rotated_coords(c) {
            var Rx = get_rotation_x_matrix(deg2rad(this.theta));
            var Ry = get_rotation_y_matrix(deg2rad(this.phi));
            return rotate(rotate(c, Rx), Ry);
        }
    }, {
        key: 'adjust_coords',
        value: function adjust_coords(c) {
            c = this.rotated_coords(c);
            var z = c.pop();
            var zoom = this.get_zoom(z);
            var coords = add(this.center, mul(sub(c, [this.x, this.y]), zoom));
            return { coords: coords, z: z };
        }
    }, {
        key: 'adjust_radius',
        value: function adjust_radius(c, radius) {
            c = this.rotated_coords(c);
            var z = c.pop();
            var zoom = this.get_zoom(z);
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
    function ControlBox(title, controllers, count) {
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
        $controlBox.insertBefore($templateControlBox);
        $controlBox.css('top', count * 50 + 'px');
        $controlBox.css('left', count * 50 + 'px');

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

var min = Math.min,
    max = Math.max;

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
                coords = _camera$adjust_coords.coords,
                z = _camera$adjust_coords.z;

            return coords.concat(r).concat(z);
        }
    }, {
        key: 'direction_coords',
        value: function direction_coords(obj) {
            var factor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;

            var _camera$adjust_coords2 = this.camera.adjust_coords(obj.pos),
                c1 = _camera$adjust_coords2.coords;

            var _camera$adjust_coords3 = this.camera.adjust_coords(add(obj.pos, mul(obj.v, factor))),
                c2 = _camera$adjust_coords3.coords,
                z = _camera$adjust_coords3.z;

            return c1.concat(c2).concat(z);
        }
    }, {
        key: 'path_coords',
        value: function path_coords(obj) {
            var _camera$adjust_coords4 = this.camera.adjust_coords(obj.prev_pos),
                c1 = _camera$adjust_coords4.coords,
                z1 = _camera$adjust_coords4.z1;

            var _camera$adjust_coords5 = this.camera.adjust_coords(obj.pos),
                c2 = _camera$adjust_coords5.coords,
                z2 = _camera$adjust_coords5.z2;

            return c1.concat(c2, max(z1, z2));
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
                    console.error(e);
                    throw new Error();
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
                    console.error(e);
                    throw new Error();
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
                    console.error(e);
                    throw new Error();
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

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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
            var c = this.camera.rotated_coords(obj.pos);
            var factor = min(50, (this.camera.z - c[2] - 1) / obj.v[2]);
            return _get(Engine3D.prototype.__proto__ || Object.getPrototypeOf(Engine3D.prototype), 'direction_coords', this).call(this, obj, factor);
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

                        max_r = min(max_r, (mag(sub(_obj.pos, pos)) - _obj.get_r()) / 1.5);
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
                        var z = coords.pop();
                        orders.push(['object', coords, z, obj.color]);
                    } catch (e) {
                        if (!(e instanceof InvisibleError)) {
                            console.error(e);
                            throw new Error();
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
                        var _z = _coords.pop();
                        orders.push(['direction', _coords, _z]);
                    } catch (e) {
                        if (!(e instanceof InvisibleError)) {
                            console.error(e);
                            throw new Error();
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
                        var _z2 = _coords2.pop();
                        orders.push(['path', _coords2, _z2]);
                    } catch (e) {
                        if (!(e instanceof InvisibleError)) {
                            console.error(e);
                            throw new Error();
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
                        _z3 = _step5$value[2],
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
                var $controlBox = this.controlbox.$controlBox;
                $controlBox.nextUntil('.control-box.template').insertBefore($controlBox);
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
                this.controlbox = new ControlBox(this.tag, this.get_controllers(), this.engine.controlboxes.length);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTSxZQUFZLFFBQVEsYUFBUixDQUFsQjs7QUFFQSxJQUFNLFlBQVksSUFBSSxTQUFKLENBQWMsTUFBZCxDQUFsQjtBQUNBLFVBQVUsT0FBVjs7QUFFQSxJQUFJLFVBQVUsSUFBZDtBQUNBLElBQUksV0FBSjtBQUFBLElBQVEsV0FBUjs7QUFFQSxFQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsV0FBYixFQUEwQix5QkFBMUIsRUFBcUQsVUFBVSxDQUFWLEVBQWE7QUFDOUQsU0FBSyxFQUFFLEtBQVA7QUFDQSxTQUFLLEVBQUUsS0FBUDtBQUNBLGNBQVUsRUFBRSxJQUFGLEVBQVEsTUFBUixDQUFlLGNBQWYsQ0FBVjtBQUNBLFlBQVEsU0FBUixDQUFrQix1QkFBbEIsRUFBMkMsWUFBM0MsQ0FBd0QsT0FBeEQ7QUFDQSxXQUFPLEtBQVA7QUFDSCxDQU5EOztBQVFBLEVBQUUsTUFBRixF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QUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLFlBQU0sTUFBTSxLQUFLLEdBQUwsQ0FBUyxJQUFJLEdBQWIsQ0FBWjtBQUNBLGVBQU8sQ0FDSCxDQUFDLEdBQUQsRUFBTSxDQUFDLEdBQVAsRUFBWSxDQUFaLENBREcsRUFFSCxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQUZHLEVBR0gsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FIRyxDQUFQO0FBS0g7QUFuSFEsQ0FBYjs7QUFzSEEsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IHByZXNldCA9IHJlcXVpcmUoJy4vcHJlc2V0Jyk7XG5jb25zdCBTaW11bGF0b3IgPSByZXF1aXJlKCcuL3NpbXVsYXRvcicpO1xuXG5jb25zdCBzaW11bGF0b3IgPSBuZXcgU2ltdWxhdG9yKHByZXNldCk7XG5zaW11bGF0b3IuYW5pbWF0ZSgpO1xuXG5sZXQgJG1vdmluZyA9IG51bGw7XG5sZXQgcHgsIHB5O1xuXG4kKCdib2R5Jykub24oJ21vdXNlZG93bicsICcuY29udHJvbC1ib3ggLnRpdGxlLWJhcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgcHggPSBlLnBhZ2VYO1xuICAgIHB5ID0gZS5wYWdlWTtcbiAgICAkbW92aW5nID0gJCh0aGlzKS5wYXJlbnQoJy5jb250cm9sLWJveCcpO1xuICAgICRtb3ZpbmcubmV4dFVudGlsKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5pbnNlcnRCZWZvcmUoJG1vdmluZyk7XG4gICAgcmV0dXJuIGZhbHNlO1xufSk7XG5cbiQoJ2JvZHknKS5tb3VzZW1vdmUoZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoISRtb3ZpbmcpIHJldHVybjtcbiAgICBjb25zdCB4ID0gZS5wYWdlWDtcbiAgICBjb25zdCB5ID0gZS5wYWdlWTtcbiAgICAkbW92aW5nLmNzcygnbGVmdCcsIHBhcnNlSW50KCRtb3ZpbmcuY3NzKCdsZWZ0JykpICsgKHggLSBweCkgKyAncHgnKTtcbiAgICAkbW92aW5nLmNzcygndG9wJywgcGFyc2VJbnQoJG1vdmluZy5jc3MoJ3RvcCcpKSArICh5IC0gcHkpICsgJ3B4Jyk7XG4gICAgcHggPSBlLnBhZ2VYO1xuICAgIHB5ID0gZS5wYWdlWTtcbn0pO1xuXG4kKCdib2R5JykubW91c2V1cChmdW5jdGlvbiAoZSkge1xuICAgICRtb3ZpbmcgPSBudWxsO1xufSk7IiwiY29uc3Qge2V4dGVuZH0gPSAkO1xuXG5cbmZ1bmN0aW9uIEVNUFRZXzJEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIGMsIHtcbiAgICAgICAgJ1RJVExFJzogJ0dyYXZpdHkgU2ltdWxhdG9yJyxcbiAgICAgICAgJ0JBQ0tHUk9VTkQnOiBcIndoaXRlXCIsXG4gICAgICAgICdESU1FTlNJT04nOiAyLFxuICAgICAgICAnTUFYX1BBVEhTJzogMTAwMCxcbiAgICAgICAgJ0NBTUVSQV9DT09SRF9TVEVQJzogNSxcbiAgICAgICAgJ0NBTUVSQV9BTkdMRV9TVEVQJzogMSxcbiAgICAgICAgJ0NBTUVSQV9BQ0NFTEVSQVRJT04nOiAxLjEsXG4gICAgICAgICdHJzogMC4xLFxuICAgICAgICAnTUFTU19NSU4nOiAxLFxuICAgICAgICAnTUFTU19NQVgnOiA0ZTQsXG4gICAgICAgICdWRUxPQ0lUWV9NQVgnOiAxMFxuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIEVNUFRZXzNEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzJEKGMpLCB7XG4gICAgICAgICdESU1FTlNJT04nOiAzLFxuICAgICAgICAnRyc6IDAuMDAxLFxuICAgICAgICAnTUFTU19NSU4nOiAxLFxuICAgICAgICAnTUFTU19NQVgnOiA4ZTYsXG4gICAgICAgICdWRUxPQ0lUWV9NQVgnOiAxMFxuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVNUFRZXzNEO1xuIiwiY29uc3QgSW52aXNpYmxlRXJyb3IgPSByZXF1aXJlKCcuLi9lcnJvci9pbnZpc2libGUnKTtcbmNvbnN0IHtkZWcycmFkLCByb3RhdGUsIG5vdywgZ2V0X3JvdGF0aW9uX21hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7cG93fSA9IE1hdGg7XG5cbmNsYXNzIENhbWVyYTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy56ID0gMTAwO1xuICAgICAgICB0aGlzLnBoaSA9IDA7XG4gICAgICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICAgICAgICB0aGlzLmxhc3RfdGltZSA9IDA7XG4gICAgICAgIHRoaXMubGFzdF9rZXkgPSBudWxsO1xuICAgICAgICB0aGlzLmNvbWJvID0gMDtcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBbY29uZmlnLlcgLyAyLCBjb25maWcuSCAvIDJdO1xuICAgIH1cblxuICAgIGdldF9jb29yZF9zdGVwKGtleSkge1xuICAgICAgICBjb25zdCBjdXJyZW50X3RpbWUgPSBub3coKTtcbiAgICAgICAgaWYgKGtleSA9PSB0aGlzLmxhc3Rfa2V5ICYmIGN1cnJlbnRfdGltZSAtIHRoaXMubGFzdF90aW1lIDwgMSkge1xuICAgICAgICAgICAgdGhpcy5jb21ibyArPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0X3RpbWUgPSBjdXJyZW50X3RpbWU7XG4gICAgICAgIHRoaXMubGFzdF9rZXkgPSBrZXk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5DQU1FUkFfQ09PUkRfU1RFUCAqIHBvdyh0aGlzLmNvbmZpZy5DQU1FUkFfQUNDRUxFUkFUSU9OLCB0aGlzLmNvbWJvKTtcbiAgICB9XG5cbiAgICB1cChrZXkpIHtcbiAgICAgICAgdGhpcy55IC09IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgZG93bihrZXkpIHtcbiAgICAgICAgdGhpcy55ICs9IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgbGVmdChrZXkpIHtcbiAgICAgICAgdGhpcy54IC09IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcmlnaHQoa2V5KSB7XG4gICAgICAgIHRoaXMueCArPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHpvb21faW4oa2V5KSB7XG4gICAgICAgIHRoaXMueiAtPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHpvb21fb3V0KGtleSkge1xuICAgICAgICB0aGlzLnogKz0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVfbGVmdChrZXkpIHtcbiAgICAgICAgdGhpcy5waGkgLT0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZV9yaWdodChrZXkpIHtcbiAgICAgICAgdGhpcy5waGkgKz0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJlZnJlc2goKSB7XG4gICAgfVxuXG4gICAgZ2V0X3pvb20oeiA9IDApIHtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy56IC0gejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDw9IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbnZpc2libGVFcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxMDAgLyBkaXN0YW5jZTtcbiAgICB9XG5cbiAgICBhZGp1c3RfY29vcmRzKGMpIHtcbiAgICAgICAgY29uc3QgUiA9IGdldF9yb3RhdGlvbl9tYXRyaXgoZGVnMnJhZCh0aGlzLnBoaSkpO1xuICAgICAgICBjID0gcm90YXRlKGMsIFIpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbSgpO1xuICAgICAgICBjb25zdCBjb29yZHMgPSBhZGQodGhpcy5jZW50ZXIsIG11bChzdWIoYywgW3RoaXMueCwgdGhpcy55XSksIHpvb20pKTtcbiAgICAgICAgcmV0dXJuIHtjb29yZHN9O1xuICAgIH1cblxuICAgIGFkanVzdF9yYWRpdXMoY29vcmRzLCByYWRpdXMpIHtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oKTtcbiAgICAgICAgcmV0dXJuIHJhZGl1cyAqIHpvb207XG4gICAgfVxuXG4gICAgYWN0dWFsX3BvaW50KHgsIHkpIHtcbiAgICAgICAgY29uc3QgUl8gPSBnZXRfcm90YXRpb25fbWF0cml4KGRlZzJyYWQodGhpcy5waGkpLCAtMSk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKCk7XG4gICAgICAgIHJldHVybiByb3RhdGUoYWRkKGRpdihzdWIoW3gsIHldLCB0aGlzLmNlbnRlciksIHpvb20pLCBbdGhpcy54LCB0aGlzLnldKSwgUl8pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmEyRDsiLCJjb25zdCBDYW1lcmEyRCA9IHJlcXVpcmUoJy4vMmQnKTtcbmNvbnN0IHtkZWcycmFkLCByb3RhdGUsIGdldF9yb3RhdGlvbl94X21hdHJpeCwgZ2V0X3JvdGF0aW9uX3lfbWF0cml4fSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcblxuXG5jbGFzcyBDYW1lcmEzRCBleHRlbmRzIENhbWVyYTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGVuZ2luZSkge1xuICAgICAgICBzdXBlcihjb25maWcsIGVuZ2luZSk7XG4gICAgICAgIHRoaXMudGhldGEgPSAwO1xuICAgIH1cblxuICAgIHJvdGF0ZV91cChrZXkpIHtcbiAgICAgICAgdGhpcy50aGV0YSAtPSB0aGlzLmNvbmZpZy5DQU1FUkFfQU5HTEVfU1RFUDtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlX2Rvd24oa2V5KSB7XG4gICAgICAgIHRoaXMudGhldGEgKz0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZWRfY29vcmRzKGMpIHtcbiAgICAgICAgY29uc3QgUnggPSBnZXRfcm90YXRpb25feF9tYXRyaXgoZGVnMnJhZCh0aGlzLnRoZXRhKSk7XG4gICAgICAgIGNvbnN0IFJ5ID0gZ2V0X3JvdGF0aW9uX3lfbWF0cml4KGRlZzJyYWQodGhpcy5waGkpKTtcbiAgICAgICAgcmV0dXJuIHJvdGF0ZShyb3RhdGUoYywgUngpLCBSeSk7XG4gICAgfVxuXG4gICAgYWRqdXN0X2Nvb3JkcyhjKSB7XG4gICAgICAgIGMgPSB0aGlzLnJvdGF0ZWRfY29vcmRzKGMpO1xuICAgICAgICBjb25zdCB6ID0gYy5wb3AoKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oeik7XG4gICAgICAgIGNvbnN0IGNvb3JkcyA9IGFkZCh0aGlzLmNlbnRlciwgbXVsKHN1YihjLCBbdGhpcy54LCB0aGlzLnldKSwgem9vbSkpO1xuICAgICAgICByZXR1cm4ge2Nvb3Jkcywgen07XG4gICAgfVxuXG4gICAgYWRqdXN0X3JhZGl1cyhjLCByYWRpdXMpIHtcbiAgICAgICAgYyA9IHRoaXMucm90YXRlZF9jb29yZHMoYyk7XG4gICAgICAgIGNvbnN0IHogPSBjLnBvcCgpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbSh6KTtcbiAgICAgICAgcmV0dXJuIHJhZGl1cyAqIHpvb207XG4gICAgfVxuXG4gICAgYWN0dWFsX3BvaW50KHgsIHkpIHtcbiAgICAgICAgY29uc3QgUnhfID0gZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGRlZzJyYWQodGhpcy50aGV0YSksIC0xKTtcbiAgICAgICAgY29uc3QgUnlfID0gZ2V0X3JvdGF0aW9uX3lfbWF0cml4KGRlZzJyYWQodGhpcy5waGkpLCAtMSk7XG4gICAgICAgIGNvbnN0IGMgPSBhZGQoc3ViKFt4LCB5XSwgdGhpcy5jZW50ZXIpLCBbdGhpcy54LCB0aGlzLnldKS5jb25jYXQoMCk7XG4gICAgICAgIHJldHVybiByb3RhdGUocm90YXRlKGMsIFJ5XyksIFJ4Xyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTNEOyIsImNsYXNzIENvbnRyb2xCb3gge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBjb250cm9sbGVycywgY291bnQpIHtcbiAgICAgICAgY29uc3QgJHRlbXBsYXRlQ29udHJvbEJveCA9ICQoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpO1xuICAgICAgICBjb25zdCAkY29udHJvbEJveCA9ICR0ZW1wbGF0ZUNvbnRyb2xCb3guY2xvbmUoKTtcbiAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy50aXRsZScpLnRleHQodGl0bGUpO1xuICAgICAgICBjb25zdCAkaW5wdXRDb250YWluZXIgPSAkY29udHJvbEJveC5maW5kKCcuaW5wdXQtY29udGFpbmVyJyk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbGxlciBvZiBjb250cm9sbGVycykge1xuICAgICAgICAgICAgJGlucHV0Q29udGFpbmVyLmFwcGVuZChjb250cm9sbGVyLiRpbnB1dFdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy5jbG9zZScpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgICRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNvbnRyb2xCb3guaW5zZXJ0QmVmb3JlKCR0ZW1wbGF0ZUNvbnRyb2xCb3gpO1xuICAgICAgICAkY29udHJvbEJveC5jc3MoJ3RvcCcsIGAke2NvdW50ICogNTB9cHhgKTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCdsZWZ0JywgYCR7Y291bnQgKiA1MH1weGApO1xuXG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3ggPSAkY29udHJvbEJveDtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLiRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sQm94OyIsImNsYXNzIENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgbmFtZSwgbWluLCBtYXgsIHZhbHVlLCBmdW5jKSB7XG4gICAgICAgIGNvbnN0ICRpbnB1dFdyYXBwZXIgPSB0aGlzLiRpbnB1dFdyYXBwZXIgPSAkKCcuY29udHJvbC1ib3gudGVtcGxhdGUgLmlucHV0LXdyYXBwZXIudGVtcGxhdGUnKS5jbG9uZSgpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLnJlbW92ZUNsYXNzKCd0ZW1wbGF0ZScpO1xuICAgICAgICAkaW5wdXRXcmFwcGVyLmZpbmQoJy5uYW1lJykudGV4dChuYW1lKTtcbiAgICAgICAgY29uc3QgJGlucHV0ID0gdGhpcy4kaW5wdXQgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtaW4nLCBtaW4pO1xuICAgICAgICAkaW5wdXQuYXR0cignbWF4JywgbWF4KTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3ZhbHVlJywgdmFsdWUpO1xuICAgICAgICAkaW5wdXQuYXR0cignc3RlcCcsIDAuMDEpO1xuICAgICAgICBjb25zdCAkdmFsdWUgPSAkaW5wdXRXcmFwcGVyLmZpbmQoJy52YWx1ZScpO1xuICAgICAgICAkdmFsdWUudGV4dCh0aGlzLmdldCgpKTtcbiAgICAgICAgJGlucHV0Lm9uKCdpbnB1dCcsIGUgPT4ge1xuICAgICAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICAgICBmdW5jLmNhbGwob2JqZWN0LCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLiRpbnB1dC52YWwoKSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXI7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi4vb2JqZWN0L2NpcmNsZScpO1xuY29uc3QgQ2FtZXJhMkQgPSByZXF1aXJlKCcuLi9jYW1lcmEvMmQnKTtcbmNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7dmVjdG9yX21hZ25pdHVkZSwgcm90YXRlLCBub3csIHJhbmRvbSwgcG9sYXIyY2FydGVzaWFuLCByYW5kX2NvbG9yLCBnZXRfcm90YXRpb25fbWF0cml4LCBjYXJ0ZXNpYW4yYXV0b30gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWluLCBtYXh9ID0gTWF0aDtcblxuXG5jbGFzcyBQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihvYmopIHtcbiAgICAgICAgdGhpcy5wcmV2X3BvcyA9IG9iai5wcmV2X3Bvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnBvcyA9IG9iai5wb3Muc2xpY2UoKTtcbiAgICB9XG59XG5cbmNsYXNzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGN0eCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMub2JqcyA9IFtdO1xuICAgICAgICB0aGlzLmFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbnRyb2xib3hlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhdGhzID0gW107XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYTJEKGNvbmZpZywgdGhpcyk7XG4gICAgICAgIHRoaXMuZnBzX2xhc3RfdGltZSA9IG5vdygpO1xuICAgICAgICB0aGlzLmZwc19jb3VudCA9IDA7XG4gICAgfVxuXG4gICAgZGVzdHJveV9jb250cm9sYm94ZXMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbGJveCBvZiB0aGlzLmNvbnRyb2xib3hlcykge1xuICAgICAgICAgICAgY29udHJvbGJveC5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250cm9sYm94ZXMgPSBbXVxuICAgIH1cblxuICAgIGFuaW1hdGUoKSB7XG4gICAgICAgIHRoaXMucHJpbnRfZnBzKCk7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGluZykge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVfYWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWRyYXdfYWxsKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCk7XG4gICAgICAgIH0sIDEwKTtcbiAgICB9XG5cbiAgICBvYmplY3RfY29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCByID0gdGhpcy5jYW1lcmEuYWRqdXN0X3JhZGl1cyhvYmoucG9zLCBvYmouZ2V0X3IoKSk7XG4gICAgICAgIGNvbnN0IHtjb29yZHMsIHp9ID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIGNvb3Jkcy5jb25jYXQocikuY29uY2F0KHopO1xuICAgIH1cblxuICAgIGRpcmVjdGlvbl9jb29yZHMob2JqLCBmYWN0b3IgPSA1MCkge1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMX0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmRzKG9iai5wb3MpO1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMiwgen0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmRzKGFkZChvYmoucG9zLCBtdWwob2JqLnYsIGZhY3RvcikpKTtcbiAgICAgICAgcmV0dXJuIGMxLmNvbmNhdChjMikuY29uY2F0KHopO1xuICAgIH1cblxuICAgIHBhdGhfY29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMSwgejF9ID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucHJldl9wb3MpO1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMiwgejJ9ID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIGMxLmNvbmNhdChjMiwgbWF4KHoxLCB6MikpO1xuICAgIH1cblxuICAgIGRyYXdfb2JqZWN0KGMsIGNvbG9yID0gbnVsbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBDaXJjbGUpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5vYmplY3RfY29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMoY1swXSwgY1sxXSwgY1syXSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yIHx8IGMuY29sb3I7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd19kaXJlY3Rpb24oYykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBDaXJjbGUpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5kaXJlY3Rpb25fY29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oY1swXSwgY1sxXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oY1syXSwgY1szXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgSW52aXNpYmxlRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXdfcGF0aChjKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIFBhdGgpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5wYXRoX2Nvb3JkcyhjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGNbMF0sIGNbMV0pO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnI2RkZGRkZCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVfcGF0aChvYmopIHtcbiAgICAgICAgaWYgKG1hZyhzdWIob2JqLnBvcywgb2JqLnByZXZfcG9zKSkgPiA1KSB7XG4gICAgICAgICAgICB0aGlzLnBhdGhzLnB1c2gobmV3IFBhdGgob2JqKSk7XG4gICAgICAgICAgICBvYmoucHJldl9wb3MgPSBvYmoucG9zLnNsaWNlKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wYXRocy5sZW5ndGggPiB0aGlzLmNvbmZpZy5NQVhfUEFUSFMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhzID0gdGhpcy5wYXRocy5zbGljZSgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZV9vYmplY3QoeCwgeSwgbSA9IG51bGwsIHYgPSBudWxsLCBjb2xvciA9IG51bGwsIGNvbnRyb2xib3ggPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuY2FtZXJhLmFjdHVhbF9wb2ludCh4LCB5KTtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgICBsZXQgbWF4X3IgPSBDaXJjbGUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgICAgIG1heF9yID0gbWluKG1heF9yLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5nZXRfcigpKSAvIDEuNSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG0gPSBDaXJjbGUuZ2V0X21fZnJvbV9yKHJhbmRvbShDaXJjbGUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUlOKSwgbWF4X3IpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgIHYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbG9yKSB7XG4gICAgICAgICAgICBjb2xvciA9IHJhbmRfY29sb3IoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0YWcgPSBgY2lyY2xlJHt0aGlzLm9ianMubGVuZ3RofWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBDaXJjbGUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcywgY29udHJvbGJveCk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzWzBdLCBkaXIpO1xuICAgIH1cblxuICAgIGVsYXN0aWNfY29sbGlzaW9uKCkge1xuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmNvbmZpZy5ESU1FTlNJT047XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vYmpzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvMSA9IHRoaXMub2Jqc1tpXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMub2Jqcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG8yID0gdGhpcy5vYmpzW2pdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHN1YihvMi5wb3MsIG8xLnBvcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGVzID0gY2FydGVzaWFuMmF1dG8oY29sbGlzaW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYW5nbGVzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZCA8IG8xLmdldF9yKCkgKyBvMi5nZXRfcigpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFIgPSB0aGlzLmdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUl8gPSB0aGlzLmdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzLCAtMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgdl90ZW1wID0gW3JvdGF0ZShvMS52LCBSKSwgcm90YXRlKG8yLnYsIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgdl9maW5hbCA9IFt2X3RlbXBbMF0uc2xpY2UoKSwgdl90ZW1wWzFdLnNsaWNlKCldO1xuICAgICAgICAgICAgICAgICAgICB2X2ZpbmFsWzBdWzBdID0gKChvMS5tIC0gbzIubSkgKiB2X3RlbXBbMF1bMF0gKyAyICogbzIubSAqIHZfdGVtcFsxXVswXSkgLyAobzEubSArIG8yLm0pO1xuICAgICAgICAgICAgICAgICAgICB2X2ZpbmFsWzFdWzBdID0gKChvMi5tIC0gbzEubSkgKiB2X3RlbXBbMV1bMF0gKyAyICogbzEubSAqIHZfdGVtcFswXVswXSkgLyAobzEubSArIG8yLm0pO1xuICAgICAgICAgICAgICAgICAgICBvMS52ID0gcm90YXRlKHZfZmluYWxbMF0sIFJfKTtcbiAgICAgICAgICAgICAgICAgICAgbzIudiA9IHJvdGF0ZSh2X2ZpbmFsWzFdLCBSXyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zX3RlbXAgPSBbemVyb3MoZGltZW5zaW9uKSwgcm90YXRlKGNvbGxpc2lvbiwgUildO1xuICAgICAgICAgICAgICAgICAgICBwb3NfdGVtcFswXVswXSArPSB2X2ZpbmFsWzBdWzBdO1xuICAgICAgICAgICAgICAgICAgICBwb3NfdGVtcFsxXVswXSArPSB2X2ZpbmFsWzFdWzBdO1xuICAgICAgICAgICAgICAgICAgICBvMS5wb3MgPSBhZGQobzEucG9zLCByb3RhdGUocG9zX3RlbXBbMF0sIFJfKSk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnBvcyA9IGFkZChvMS5wb3MsIHJvdGF0ZShwb3NfdGVtcFsxXSwgUl8pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxjdWxhdGVfYWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVfdmVsb2NpdHkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxhc3RpY19jb2xsaXNpb24oKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVfcG9zaXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlX3BhdGgob2JqKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZHJhd19hbGwoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdfb2JqZWN0KG9iaik7XG4gICAgICAgICAgICB0aGlzLmRyYXdfZGlyZWN0aW9uKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHRoaXMucGF0aHMpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd19wYXRoKHBhdGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpbnRfZnBzKCkge1xuICAgICAgICB0aGlzLmZwc19jb3VudCArPSAxO1xuICAgICAgICBjb25zdCBjdXJyZW50X3RpbWUgPSBub3coKTtcbiAgICAgICAgY29uc3QgZnBzX3RpbWVfZGlmZiA9IGN1cnJlbnRfdGltZSAtIHRoaXMuZnBzX2xhc3RfdGltZVxuICAgICAgICBpZiAoZnBzX3RpbWVfZGlmZiA+IDEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAkeyh0aGlzLmZwc19jb3VudCAvIGZwc190aW1lX2RpZmYpIHwgMH0gZnBzYCk7XG4gICAgICAgICAgICB0aGlzLmZwc19sYXN0X3RpbWUgPSBjdXJyZW50X3RpbWU7XG4gICAgICAgICAgICB0aGlzLmZwc19jb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5naW5lMkQ7IiwiY29uc3QgRW5naW5lMkQgPSByZXF1aXJlKCcuLzJkJyk7XG5jb25zdCBDYW1lcmEzRCA9IHJlcXVpcmUoJy4uL2NhbWVyYS8zZCcpO1xuY29uc3QgU3BoZXJlID0gcmVxdWlyZSgnLi4vb2JqZWN0L3NwaGVyZScpO1xuY29uc3QgSW52aXNpYmxlRXJyb3IgPSByZXF1aXJlKCcuLi9lcnJvci9pbnZpc2libGUnKTtcbmNvbnN0IHt2ZWN0b3JfbWFnbml0dWRlLCByYW5kb20sIGdldF9yb3RhdGlvbl94X21hdHJpeCwgZ2V0X3JvdGF0aW9uX3pfbWF0cml4LCByYW5kX2NvbG9yLCBzcGhlcmljYWwyY2FydGVzaWFufSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttaW4sIG1heH0gPSBNYXRoO1xuXG5cbmNsYXNzIEVuZ2luZTNEIGV4dGVuZHMgRW5naW5lMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgY3R4KSB7XG4gICAgICAgIHN1cGVyKGNvbmZpZywgY3R4KTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhM0QoY29uZmlnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBkaXJlY3Rpb25fY29vcmRzKG9iaikge1xuICAgICAgICBsZXQgYyA9IHRoaXMuY2FtZXJhLnJvdGF0ZWRfY29vcmRzKG9iai5wb3MpO1xuICAgICAgICBsZXQgZmFjdG9yID0gbWluKDUwLCAodGhpcy5jYW1lcmEueiAtIGNbMl0gLSAxKSAvIG9iai52WzJdKTtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmRpcmVjdGlvbl9jb29yZHMob2JqLCBmYWN0b3IpO1xuICAgIH1cblxuICAgIGNyZWF0ZV9vYmplY3QoeCwgeSwgbSA9IG51bGwsIHYgPSBudWxsLCBjb2xvciA9IG51bGwsIGNvbnRyb2xib3ggPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuY2FtZXJhLmFjdHVhbF9wb2ludCh4LCB5KTtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgICBsZXQgbWF4X3IgPSBTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgICAgIG1heF9yID0gbWluKG1heF9yLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5nZXRfcigpKSAvIDEuNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtID0gU3BoZXJlLmdldF9tX2Zyb21fcihyYW5kb20oU3BoZXJlLmdldF9yX2Zyb21fbSh0aGlzLmNvbmZpZy5NQVNTX01JTiksIG1heF9yKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgICB2ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyYW5kb20odGhpcy5jb25maWcuVkVMT0NJVFlfTUFYIC8gMiksIHJhbmRvbSgtMTgwLCAxODApLCByYW5kb20oLTE4MCwgMTgwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb2xvcikge1xuICAgICAgICAgICAgY29sb3IgPSByYW5kX2NvbG9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGFnID0gYHNwaGVyZSR7dGhpcy5vYmpzLmxlbmd0aH1gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMsIGNvbnRyb2xib3gpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzLCBkaXIgPSAxKSB7XG4gICAgICAgIHJldHVybiBkaXIgPT0gMVxuICAgICAgICAgICAgPyBkb3QoZ2V0X3JvdGF0aW9uX3pfbWF0cml4KGFuZ2xlc1swXSksIGdldF9yb3RhdGlvbl94X21hdHJpeChhbmdsZXNbMV0pKVxuICAgICAgICAgICAgOiBkb3QoZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGFuZ2xlc1sxXSwgLTEpLCBnZXRfcm90YXRpb25fel9tYXRyaXgoYW5nbGVzWzBdLCAtMSkpO1xuICAgIH1cblxuICAgIHJlZHJhd19hbGwoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbmZpZy5XLCB0aGlzLmNvbmZpZy5IKTtcbiAgICAgICAgY29uc3Qgb3JkZXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLm9iamVjdF9jb29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsnb2JqZWN0JywgY29vcmRzLCB6LCBvYmouY29sb3JdKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgSW52aXNpYmxlRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0gdGhpcy5kaXJlY3Rpb25fY29vcmRzKG9iaik7XG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IGNvb3Jkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBvcmRlcnMucHVzaChbJ2RpcmVjdGlvbicsIGNvb3Jkcywgel0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0aGlzLnBhdGhzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IHRoaXMucGF0aF9jb29yZHMocGF0aCk7XG4gICAgICAgICAgICAgICAgY29uc3QgeiA9IGNvb3Jkcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBvcmRlcnMucHVzaChbJ3BhdGgnLCBjb29yZHMsIHpdKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgSW52aXNpYmxlRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvcmRlcnMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGFbMl0gLSBiWzJdO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChjb25zdCBbdHlwZSwgY29vcmRzLCB6LCBjb2xvcl0gb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdfb2JqZWN0KGNvb3JkcywgY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkaXJlY3Rpb24nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdfZGlyZWN0aW9uKGNvb3Jkcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdGgnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdfcGF0aChjb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUzRDsiLCJjbGFzcyBJbnZpc2libGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlKXtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludmlzaWJsZUVycm9yOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi9lbmdpbmUvMmQnKTtcbmNvbnN0IEVuZ2luZTNEID0gcmVxdWlyZSgnLi9lbmdpbmUvM2QnKTtcbmNvbnN0IHtnZXRfZGlzdGFuY2V9ID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cblxubGV0IGNvbmZpZyA9IG51bGw7XG5jb25zdCBrZXltYXAgPSB7XG4gICAgMzg6ICd1cCcsXG4gICAgNDA6ICdkb3duJyxcbiAgICAzNzogJ2xlZnQnLFxuICAgIDM5OiAncmlnaHQnLFxuICAgIDkwOiAnem9vbV9pbicsIC8vIHpcbiAgICA4ODogJ3pvb21fb3V0JywgLy8geFxuICAgIDg3OiAncm90YXRlX3VwJywgLy8gd1xuICAgIDgzOiAncm90YXRlX2Rvd24nLCAvLyBzXG4gICAgNjU6ICdyb3RhdGVfbGVmdCcsIC8vIGFcbiAgICA2ODogJ3JvdGF0ZV9yaWdodCcgLy8gZFxufTtcblxuZnVuY3Rpb24gb25fcmVzaXplKCRjYW52YXMpIHtcbiAgICBjb25maWcuVyA9ICRjYW52YXNbMF0ud2lkdGggPSAkY2FudmFzLndpZHRoKCk7XG4gICAgY29uZmlnLkggPSAkY2FudmFzWzBdLmhlaWdodCA9ICRjYW52YXMuaGVpZ2h0KCk7XG5cbn1cblxuZnVuY3Rpb24gb25fY2xpY2soZXZlbnQsIGVuZ2luZSkge1xuICAgIGNvbnN0IHggPSBldmVudC5wYWdlWDtcbiAgICBjb25zdCB5ID0gZXZlbnQucGFnZVk7XG4gICAgaWYgKCFlbmdpbmUuYW5pbWF0aW5nKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIGVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICBjb25zdCBbY3gsIGN5LCByXSA9IGVuZ2luZS5vYmplY3RfY29vcmRzKG9iaik7XG4gICAgICAgICAgICBpZiAoZ2V0X2Rpc3RhbmNlKGN4LCBjeSwgeCwgeSkgPCByKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNob3dfY29udHJvbGJveCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbmdpbmUuY3JlYXRlX29iamVjdCh4LCB5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uX2tleV9kb3duKGV2ZW50LCBlbmdpbmUpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBldmVudDtcbiAgICBpZiAoa2V5Q29kZSA9PSAzMikgeyAvLyBzcGFjZSBiYXJcbiAgICAgICAgZW5naW5lLmRlc3Ryb3lfY29udHJvbGJveGVzKCk7XG4gICAgICAgIGVuZ2luZS5hbmltYXRpbmcgPSAhZW5naW5lLmFuaW1hdGluZztcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBgJHtjb25maWcuVElUTEV9ICgke2VuZ2luZS5hbmltYXRpbmcgPyBcIlNpbXVsYXRpbmdcIiA6IFwiUGF1c2VkXCJ9KWA7XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlIGluIGtleW1hcCAmJiBrZXltYXBba2V5Q29kZV0gaW4gZW5naW5lLmNhbWVyYSkge1xuICAgICAgICBlbmdpbmUuY2FtZXJhW2tleW1hcFtrZXlDb2RlXV0oa2V5Q29kZSk7XG4gICAgfVxufVxuXG5jbGFzcyBTaW11bGF0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHByZXNldCkge1xuICAgICAgICBjb25maWcgPSBwcmVzZXQoe30pO1xuICAgICAgICBjb25zdCAkY2FudmFzID0gJCgnY2FudmFzJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9ICRjYW52YXNbMF0uZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgb25fcmVzaXplKCRjYW52YXMpO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyAoY29uZmlnLkRJTUVOU0lPTiA9PSAyID8gRW5naW5lMkQgOiBFbmdpbmUzRCkoY29uZmlnLCBjdHgpO1xuICAgICAgICAkY2FudmFzLnJlc2l6ZShlID0+IHtcbiAgICAgICAgICAgIG9uX3Jlc2l6ZSgkY2FudmFzKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRjYW52YXMuY2xpY2soZSA9PiB7XG4gICAgICAgICAgICBvbl9jbGljayhlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCdib2R5Jykua2V5ZG93bihlID0+IHtcbiAgICAgICAgICAgIG9uX2tleV9kb3duKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUuYW5pbWF0ZSgpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW11bGF0b3I7IiwiZnVuY3Rpb24gaXRlcihhLCBmdW5jKSB7XG4gICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgY29uc3QgbSA9IG5ldyBBcnJheShhX3IpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgbVtpXSA9IGZ1bmMoaSk7XG4gICAgfVxuICAgIHJldHVybiBtO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB6ZXJvczogTiA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXkoTikuZmlsbCgwKTtcbiAgICB9LFxuXG4gICAgbWFnOiBhID0+IHtcbiAgICAgICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfcjsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gYVtpXSAqIGFbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChzdW0pO1xuICAgIH0sXG5cbiAgICBhZGQ6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gKyBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc3ViOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldIC0gYltpXTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG11bDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAqIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkaXY6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLyBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZG90OiAoYSwgYikgPT4ge1xuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYV9jID0gYVswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJfYyA9IGJbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgYV9yOyByKyspIHtcbiAgICAgICAgICAgIG1bcl0gPSBuZXcgQXJyYXkoYl9jKTtcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgYl9jOyBjKyspIHtcbiAgICAgICAgICAgICAgICBtW3JdW2NdID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG1bcl1bY10gKz0gYVtyXVtpXSAqIGJbaV1bY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbn07IiwiY29uc3QgQ29udHJvbEJveCA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbF9ib3gnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHt2ZWN0b3JfbWFnbml0dWRlLCByYWQyZGVnLCBkZWcycmFkLCBwb2xhcjJjYXJ0ZXNpYW4sIGNhcnRlc2lhbjJhdXRvLCBzcXVhcmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21heCwgcG93fSA9IE1hdGg7XG5cblxuY2xhc3MgQ2lyY2xlIHtcbiAgICAvKipcbiAgICAgKiBQb2xhciBjb29yZGluYXRlIHN5c3RlbVxuICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BvbGFyX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgZW5naW5lLCBjb250cm9sYm94KSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICAgICAgdGhpcy5wcmV2X3BvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xib3ggPSBudWxsO1xuICAgICAgICBpZiAoY29udHJvbGJveCkge1xuICAgICAgICAgICAgdGhpcy5zaG93X2NvbnRyb2xib3goKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0X3IoKSB7XG4gICAgICAgIHJldHVybiBDaXJjbGUuZ2V0X3JfZnJvbV9tKHRoaXMubSlcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVfdmVsb2NpdHkoKSB7XG4gICAgICAgIGxldCBGID0gemVyb3ModGhpcy5jb25maWcuRElNRU5TSU9OKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgaWYgKG9iaiA9PSB0aGlzKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvciA9IHN1Yih0aGlzLnBvcywgb2JqLnBvcyk7XG4gICAgICAgICAgICBjb25zdCBtYWduaXR1ZGUgPSBtYWcodmVjdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaXRfdmVjdG9yID0gZGl2KHZlY3RvciwgbWFnbml0dWRlKTtcbiAgICAgICAgICAgIEYgPSBhZGQoRiwgbXVsKHVuaXRfdmVjdG9yLCBvYmoubSAvIHNxdWFyZShtYWduaXR1ZGUpKSlcbiAgICAgICAgfVxuICAgICAgICBGID0gbXVsKEYsIC10aGlzLmNvbmZpZy5HICogdGhpcy5tKTtcbiAgICAgICAgY29uc3QgYSA9IGRpdihGLCB0aGlzLm0pO1xuICAgICAgICB0aGlzLnYgPSBhZGQodGhpcy52LCBhKTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVfcG9zaXRpb24oKSB7XG4gICAgICAgIHRoaXMucG9zID0gYWRkKHRoaXMucG9zLCB0aGlzLnYpO1xuICAgIH1cblxuICAgIGNvbnRyb2xfbShlKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1fY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICB9XG5cbiAgICBjb250cm9sX3BvcyhlKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc194X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc195X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHldO1xuICAgIH1cblxuICAgIGNvbnRyb2xfdihlKSB7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudl9yaG9fY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgY29uc3QgcGhpID0gZGVnMnJhZCh0aGlzLnZfcGhpX2NvbnRyb2xsZXIuZ2V0KCkpO1xuICAgICAgICB0aGlzLnYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmhvLCBwaGkpO1xuICAgIH1cblxuICAgIHNob3dfY29udHJvbGJveCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gdGhpcy5jb250cm9sYm94LiRjb250cm9sQm94O1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gubmV4dFVudGlsKCcuY29udHJvbC1ib3gudGVtcGxhdGUnKS5pbnNlcnRCZWZvcmUoJGNvbnRyb2xCb3gpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zdCBtYXJnaW4gPSAxLjU7XG5cbiAgICAgICAgICAgIHZhciBwb3NfcmFuZ2UgPSBtYXgobWF4KHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpIC8gMiwgbWF4LmFwcGx5KG51bGwsIHRoaXMucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICBwb3NfcmFuZ2UgPSBtYXgocG9zX3JhbmdlLCBtYXguYXBwbHkobnVsbCwgb2JqLnBvcy5tYXAoTWF0aC5hYnMpKSAqIG1hcmdpbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XG5cbiAgICAgICAgICAgIGNvbnN0IHYgPSBjYXJ0ZXNpYW4yYXV0byh0aGlzLnYpO1xuICAgICAgICAgICAgdmFyIHZfcmFuZ2UgPSBtYXgodGhpcy5jb25maWcuVkVMT0NJVFlfTUFYLCBtYWcodGhpcy52KSAqIG1hcmdpbik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLmVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICAgICAgdl9yYW5nZSA9IG1heCh2X3JhbmdlLCBtYWcob2JqLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sYm94ID0gbmV3IENvbnRyb2xCb3godGhpcy50YWcsIHRoaXMuZ2V0X2NvbnRyb2xsZXJzKCksIHRoaXMuZW5naW5lLmNvbnRyb2xib3hlcy5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5lbmdpbmUuY29udHJvbGJveGVzLnB1c2godGhpcy5jb250cm9sYm94KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICB0aGlzLm1fY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiTWFzcyBtXCIsIHRoaXMuY29uZmlnLk1BU1NfTUlOLCB0aGlzLmNvbmZpZy5NQVNTX01BWCwgbSwgdGhpcy5jb250cm9sX20pO1xuICAgICAgICB0aGlzLnBvc194X2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHhcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1swXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geVwiLCAtcG9zX3JhbmdlLCBwb3NfcmFuZ2UsIHRoaXMucG9zWzFdLCB0aGlzLmNvbnRyb2xfcG9zKTtcbiAgICAgICAgdGhpcy52X3Job19jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDPgVwiLCAwLCB2X3JhbmdlLCB2WzBdLCB0aGlzLmNvbnRyb2xfdik7XG4gICAgICAgIHRoaXMudl9waGlfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiVmVsb2NpdHkgz4ZcIiwgLTE4MCwgMTgwLCByYWQyZGVnKHZbMV0pLCB0aGlzLmNvbnRyb2xfdik7XG4gICAgfVxuXG4gICAgZ2V0X2NvbnRyb2xsZXJzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5tX2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc194X2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnBvc195X2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZfcmhvX2NvbnRyb2xsZXIsXG4gICAgICAgICAgICB0aGlzLnZfcGhpX2NvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0X3JfZnJvbV9tKG0pIHtcbiAgICAgICAgcmV0dXJuIHBvdyhtLCAxIC8gMilcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0X21fZnJvbV9yKHIpIHtcbiAgICAgICAgcmV0dXJuIHNxdWFyZShyKVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoeyd0YWcnOiB0aGlzLnRhZywgJ3YnOiB0aGlzLnYsICdwb3MnOiB0aGlzLnBvc30pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGU7IiwiY29uc3QgQ2lyY2xlID0gcmVxdWlyZSgnLi9jaXJjbGUnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHtyYWQyZGVnLCBkZWcycmFkLCBzcGhlcmljYWwyY2FydGVzaWFufSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHtjdWJlfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHtwb3d9ID0gTWF0aDtcblxuXG5jbGFzcyBTcGhlcmUgZXh0ZW5kcyBDaXJjbGUge1xuICAgIC8qKlxuICAgICAqIFNwaGVyaWNhbCBjb29yZGluYXRlIHN5c3RlbVxuICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NwaGVyaWNhbF9jb29yZGluYXRlX3N5c3RlbVxuICAgICAqL1xuXG4gICAgZ2V0X3IoKSB7XG4gICAgICAgIHJldHVybiBTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMubSk7XG4gICAgfVxuXG4gICAgY29udHJvbF9wb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NfeF9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NfeV9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB6ID0gdGhpcy5wb3Nfel9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5LCB6XTtcbiAgICB9XG5cbiAgICBjb250cm9sX3YoZSkge1xuICAgICAgICBjb25zdCBwaGkgPSBkZWcycmFkKHRoaXMudl9waGlfY29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHRoZXRhID0gZGVnMnJhZCh0aGlzLnZfdGhldGFfY29udHJvbGxlci5nZXQoKSk7XG4gICAgICAgIGNvbnN0IHJobyA9IHRoaXMudl9yaG9fY29udHJvbGxlci5nZXQoKTtcbiAgICAgICAgdGhpcy52ID0gc3BoZXJpY2FsMmNhcnRlc2lhbihyaG8sIHBoaSwgdGhldGEpO1xuICAgIH1cblxuICAgIHNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSkge1xuICAgICAgICBzdXBlci5zZXR1cF9jb250cm9sbGVycyhwb3NfcmFuZ2UsIG0sIHYsIHZfcmFuZ2UpO1xuICAgICAgICB0aGlzLnBvc196X2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlBvc2l0aW9uIHpcIiwgLXBvc19yYW5nZSwgcG9zX3JhbmdlLCB0aGlzLnBvc1syXSwgdGhpcy5jb250cm9sX3Bvcyk7XG4gICAgICAgIHRoaXMudl90aGV0YV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDOuFwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsyXSksIHRoaXMuY29udHJvbF92KTtcbiAgICB9XG5cbiAgICBnZXRfY29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3hfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3pfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9yaG9fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9waGlfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl90aGV0YV9jb250cm9sbGVyXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldF9yX2Zyb21fbShtKSB7XG4gICAgICAgIHJldHVybiBwb3cobSwgMSAvIDMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfbV9mcm9tX3Iocikge1xuICAgICAgICByZXR1cm4gY3ViZShyKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3BoZXJlOyIsImNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuL21hdHJpeCcpO1xuXG5jb25zdCBVdGlsID0ge1xuICAgIHNxdWFyZTogKHgpID0+IHtcbiAgICAgICAgcmV0dXJuIHggKiB4O1xuICAgIH0sXG5cbiAgICBjdWJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHggKiB4O1xuICAgIH0sXG5cbiAgICBwb2xhcjJjYXJ0ZXNpYW46IChyaG8sIHBoaSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHBoaSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnBvbGFyOiAoeCwgeSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbWFnKFt4LCB5XSksXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIHNwaGVyaWNhbDJjYXJ0ZXNpYW46IChyaG8sIHBoaSwgdGhldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLnNpbihwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5jb3ModGhldGEpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJzcGhlcmljYWw6ICh4LCB5LCB6KSA9PiB7XG4gICAgICAgIGNvbnN0IHJobyA9IG1hZyhbeCwgeSwgel0pO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvLFxuICAgICAgICAgICAgTWF0aC5hdGFuMih5LCB4KSxcbiAgICAgICAgICAgIHJobyAhPSAwID8gTWF0aC5hY29zKHogLyByaG8pIDogMFxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4yYXV0bzogKHZlY3RvcikgPT4ge1xuICAgICAgICByZXR1cm4gdmVjdG9yLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICA/IFV0aWwuY2FydGVzaWFuMnBvbGFyKHZlY3RvclswXSwgdmVjdG9yWzFdKVxuICAgICAgICAgICAgOiBVdGlsLmNhcnRlc2lhbjJzcGhlcmljYWwodmVjdG9yWzBdLCB2ZWN0b3JbMV0sIHZlY3RvclsyXSk7XG4gICAgfSxcblxuICAgIHJhZDJkZWc6IChyYWQpID0+IHtcbiAgICAgICAgcmV0dXJuIHJhZCAvIE1hdGguUEkgKiAxODA7XG4gICAgfSxcblxuICAgIGRlZzJyYWQ6IChkZWcpID0+IHtcbiAgICAgICAgcmV0dXJuIGRlZyAvIDE4MCAqIE1hdGguUEk7XG4gICAgfSxcblxuICAgIGdldF9kaXN0YW5jZTogKHgwLCB5MCwgeDEsIHkxKSA9PiB7XG4gICAgICAgIHJldHVybiBtYWcoW3gxIC0geDAsIHkxIC0geTBdKTtcbiAgICB9LFxuXG4gICAgcm90YXRlOiAodmVjdG9yLCBtYXRyaXgpID0+IHtcbiAgICAgICAgcmV0dXJuIGRvdChbdmVjdG9yXSwgbWF0cml4KVswXTtcbiAgICB9LFxuXG4gICAgbm93OiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgfSxcblxuICAgIHJhbmRvbTogKG1pbiwgbWF4ID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgICAgICAgIG1heCA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbiAgICB9LFxuXG4gICAgcmFuZF9jb2xvcjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gJyMnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTY3NzcyMTUpLnRvU3RyaW5nKDE2KTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbl0sXG4gICAgICAgICAgICBbc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl94X21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICAgICAgWzAsIGNvcywgLXNpbl0sXG4gICAgICAgICAgICBbMCwgc2luLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl95X21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgMCwgLXNpbl0sXG4gICAgICAgICAgICBbMCwgMSwgMF0sXG4gICAgICAgICAgICBbc2luLCAwLCBjb3NdXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl96X21hdHJpeDogKHgsIGRpciA9IDEpID0+IHtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oeCAqIGRpcik7XG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKHggKiBkaXIpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW2NvcywgLXNpbiwgMF0sXG4gICAgICAgICAgICBbc2luLCBjb3MsIDBdLFxuICAgICAgICAgICAgWzAsIDAsIDFdXG4gICAgICAgIF07XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsOyJdfQ==

//# sourceMappingURL=gravity_simulator.js.map
