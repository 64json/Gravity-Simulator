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

var _require = require('./simulator/util'),
    deg2rad = _require.deg2rad,
    get_rotation_x_matrix = _require.get_rotation_x_matrix,
    get_rotation_y_matrix = _require.get_rotation_y_matrix,
    rotate = _require.rotate;

var angleX = deg2rad(30);
var angleY = deg2rad(50);
var Rx = get_rotation_x_matrix(angleX);
var Rx_ = get_rotation_x_matrix(angleX, -1);
var Ry = get_rotation_y_matrix(angleY);
var Ry_ = get_rotation_y_matrix(angleY, -1);
console.log(rotate(rotate(rotate(rotate([-5, 8, 3], Rx), Ry), Ry_), Rx_));

},{"./preset":2,"./simulator":10,"./simulator/util":14}],2:[function(require,module,exports){
'use strict';

var _$ = $,
    extend = _$.extend;


function EMPTY_2D(c) {
    return extend(true, c, {
        TITLE: 'Gravity Simulator',
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
        CAMERA_DISTANCE: 100
    });
}

function EMPTY_3D(c) {
    return extend(true, EMPTY_2D(c), {
        DIMENSION: 3,
        G: 0.001,
        MASS_MIN: 1,
        MASS_MAX: 8e6,
        VELOCITY_MAX: 10
    });
}

function TEST(c) {
    return extend(true, EMPTY_3D(c), {
        init: function init(engine) {
            engine.create_object('ball1', [-150, 0, 0], 1000000, [0, 0, 0], 'green');
            engine.create_object('ball2', [50, 0, 0], 10000, [0, 0, 0], 'blue');
            engine.toggleAnimating();
        }
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
        this.z = config.CAMERA_DISTANCE;
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
            return this.config.CAMERA_DISTANCE / distance;
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
            var c = add(sub([x, y], this.center), [this.x, this.y]).concat(this.z - this.config.CAMERA_DISTANCE);
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
    function ControlBox(title, controllers, x, y) {
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
        key: 'is_opened',
        value: function is_opened() {
            return this.$controlBox[0].parentNode;
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

var _require = require('../util'),
    rotate = _require.rotate,
    now = _require.now,
    random = _require.random,
    polar2cartesian = _require.polar2cartesian,
    rand_color = _require.rand_color,
    _get_rotation_matrix = _require.get_rotation_matrix,
    cartesian2auto = _require.cartesian2auto,
    skip_invisible_error = _require.skip_invisible_error;

var _require2 = require('../matrix'),
    zeros = _require2.zeros,
    mag = _require2.mag,
    add = _require2.add,
    sub = _require2.sub,
    mul = _require2.mul;

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
        key: 'toggleAnimating',
        value: function toggleAnimating() {
            this.animating = !this.animating;
            document.title = this.config.TITLE + ' (' + (this.animating ? "Simulating" : "Paused") + ')';
        }
    }, {
        key: 'destroy_controlboxes',
        value: function destroy_controlboxes() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.controlboxes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var controlbox = _step.value;

                    controlbox.close();
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
            var factor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.config.DIRECTION_LENGTH;

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
            var _this2 = this;

            var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            skip_invisible_error(function () {
                color = color || c.color;
                if (c instanceof Circle) {
                    c = _this2.object_coords(c);
                }
                _this2.ctx.beginPath();
                _this2.ctx.arc(c[0], c[1], c[2], 0, 2 * Math.PI, false);
                _this2.ctx.fillStyle = color;
                _this2.ctx.fill();
            });
        }
    }, {
        key: 'draw_direction',
        value: function draw_direction(c) {
            var _this3 = this;

            skip_invisible_error(function () {
                if (c instanceof Circle) {
                    c = _this3.direction_coords(c);
                }
                _this3.ctx.beginPath();
                _this3.ctx.moveTo(c[0], c[1]);
                _this3.ctx.lineTo(c[2], c[3]);
                _this3.ctx.strokeStyle = '#000000';
                _this3.ctx.stroke();
            });
        }
    }, {
        key: 'draw_path',
        value: function draw_path(c) {
            var _this4 = this;

            skip_invisible_error(function () {
                if (c instanceof Path) {
                    c = _this4.path_coords(c);
                }
                _this4.ctx.beginPath();
                _this4.ctx.moveTo(c[0], c[1]);
                _this4.ctx.lineTo(c[2], c[3]);
                _this4.ctx.strokeStyle = '#dddddd';
                _this4.ctx.stroke();
            });
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
        key: 'user_create_object',
        value: function user_create_object(x, y) {
            var pos = this.camera.actual_point(x, y);
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

            var m = Circle.get_m_from_r(random(Circle.get_r_from_m(this.config.MASS_MIN), max_r));
            var v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
            var color = rand_color();
            var tag = 'circle' + this.objs.length;
            var obj = new Circle(this.config, m, pos, v, color, tag, this);
            obj.show_controlbox(x, y);
            this.objs.push(obj);
        }
    }, {
        key: 'create_object',
        value: function create_object(tag, pos, m, v, color) {
            var obj = new Circle(this.config, m, pos, v, color, tag, this);
            this.objs.push(obj);
        }
    }, {
        key: 'get_rotation_matrix',
        value: function get_rotation_matrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return _get_rotation_matrix(angles[0], dir);
        }
    }, {
        key: 'get_pivot_axis',
        value: function get_pivot_axis() {
            return 0;
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
                        var _i = this.get_pivot_axis();

                        var v_temp = [rotate(o1.v, R), rotate(o2.v, R)];
                        var v_final = [v_temp[0].slice(), v_temp[1].slice()];
                        v_final[0][_i] = ((o1.m - o2.m) * v_temp[0][_i] + 2 * o2.m * v_temp[1][_i]) / (o1.m + o2.m);
                        v_final[1][_i] = ((o2.m - o1.m) * v_temp[1][_i] + 2 * o1.m * v_temp[0][_i]) / (o1.m + o2.m);
                        o1.v = rotate(v_final[0], R_);
                        o2.v = rotate(v_final[1], R_);

                        var pos_temp = [zeros(dimension), rotate(collision, R)];
                        pos_temp[0][_i] += v_final[0][_i];
                        pos_temp[1][_i] += v_final[1][_i];
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

},{"../camera/2d":3,"../matrix":11,"../object/circle":12,"../util":14}],8:[function(require,module,exports){
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

var _require = require('../util'),
    random = _require.random,
    get_rotation_y_matrix = _require.get_rotation_y_matrix,
    get_rotation_z_matrix = _require.get_rotation_z_matrix,
    rand_color = _require.rand_color,
    spherical2cartesian = _require.spherical2cartesian,
    skip_invisible_error = _require.skip_invisible_error;

var _require2 = require('../matrix'),
    mag = _require2.mag,
    sub = _require2.sub,
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
        key: 'direction_coords',
        value: function direction_coords(obj) {
            var c = this.camera.rotated_coords(obj.pos);
            var adjustedFactor = (this.camera.z - c[2] - 1) / obj.v[2];
            var factor = this.config.DIRECTION_LENGTH;
            if (adjustedFactor > 0) factor = min(factor, adjustedFactor);
            return _get(Engine3D.prototype.__proto__ || Object.getPrototypeOf(Engine3D.prototype), 'direction_coords', this).call(this, obj, factor);
        }
    }, {
        key: 'user_create_object',
        value: function user_create_object(x, y) {
            var pos = this.camera.actual_point(x, y);
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

            var m = Sphere.get_m_from_r(random(Sphere.get_r_from_m(this.config.MASS_MIN), max_r));
            var v = spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180));
            var color = rand_color();
            var tag = 'sphere' + this.objs.length;
            var obj = new Sphere(this.config, m, pos, v, color, tag, this);
            obj.show_controlbox(x, y);
            this.objs.push(obj);
        }
    }, {
        key: 'create_object',
        value: function create_object(tag, pos, m, v, color) {
            var obj = new Sphere(this.config, m, pos, v, color, tag, this);
            this.objs.push(obj);
        }
    }, {
        key: 'get_rotation_matrix',
        value: function get_rotation_matrix(angles) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return dot(get_rotation_z_matrix(angles[0], dir), get_rotation_y_matrix(angles[1], dir), dir);
        }
    }, {
        key: 'get_pivot_axis',
        value: function get_pivot_axis() {
            return 2;
        }
    }, {
        key: 'redraw_all',
        value: function redraw_all() {
            var _this2 = this;

            this.ctx.clearRect(0, 0, this.config.W, this.config.H);
            var orders = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                var _loop = function _loop() {
                    var obj = _step2.value;

                    skip_invisible_error(function () {
                        var coords = _this2.object_coords(obj);
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

                    skip_invisible_error(function () {
                        var coords = _this2.direction_coords(obj);
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

                    skip_invisible_error(function () {
                        var coords = _this2.path_coords(path);
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
                            this.draw_object(coords, color);
                            break;
                        case 'direction':
                            this.draw_direction(coords);
                            break;
                        case 'path':
                            this.draw_path(coords);
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

},{"../camera/3d":4,"../matrix":11,"../object/sphere":13,"../util":14,"./2d":7}],9:[function(require,module,exports){
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Engine2D = require('./engine/2d');
var Engine3D = require('./engine/3d');

var _require = require('./util'),
    get_distance = _require.get_distance,
    skip_invisible_error = _require.skip_invisible_error;

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
            var _loop = function _loop() {
                var obj = _step.value;

                if (skip_invisible_error(function () {
                    var _engine$object_coords = engine.object_coords(obj),
                        _engine$object_coords2 = _slicedToArray(_engine$object_coords, 3),
                        cx = _engine$object_coords2[0],
                        cy = _engine$object_coords2[1],
                        r = _engine$object_coords2[2];

                    if (get_distance(cx, cy, x, y) < r) {
                        obj.show_controlbox(x, y);
                        return true;
                    }
                })) return {
                        v: void 0
                    };
            };

            for (var _iterator = engine.objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _ret = _loop();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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

        engine.user_create_object(x, y);
    }
}

function on_key_down(event, engine) {
    var keyCode = event.keyCode;

    if (keyCode == 32) {
        // space bar
        engine.destroy_controlboxes();
        engine.toggleAnimating();
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
        if ('init' in config) config.init(this.engine);
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

    function Circle(config, m, pos, v, color, tag, engine) {
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
        value: function show_controlbox(x, y) {
            if (this.controlbox && this.controlbox.is_opened()) {
                var $controlBox = this.controlbox.$controlBox;
                $controlBox.css('left', x + 'px');
                $controlBox.css('top', y + 'px');
                $controlBox.nextUntil('.control-box.template').insertBefore($controlBox);
            } else {
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
                this.controlbox = new ControlBox(this.tag, this.get_controllers(), x, y);
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

var InvisibleError = require('./error/invisible');

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
        return '#' + Math.floor(0x1000000 + Math.random() * 0x1000000).toString(16).substring(1);
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
        return [[cos, 0, sin], [0, 1, 0], [-sin, 0, cos]];
    },

    get_rotation_z_matrix: function get_rotation_z_matrix(x) {
        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        var sin = Math.sin(x * dir);
        var cos = Math.cos(x * dir);
        return [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]];
    },

    skip_invisible_error: function skip_invisible_error(func) {
        try {
            return func();
        } catch (e) {
            if (!(e instanceof InvisibleError)) {
                console.error(e);
                throw new Error();
            }
        }
        return null;
    }
};

module.exports = Util;

},{"./error/invisible":9,"./matrix":11}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTSxZQUFZLFFBQVEsYUFBUixDQUFsQjs7QUFFQSxJQUFNLFlBQVksSUFBSSxTQUFKLENBQWMsTUFBZCxDQUFsQjtBQUNBLFVBQVUsT0FBVjs7QUFFQSxJQUFJLFVBQVUsSUFBZDtBQUNBLElBQUksV0FBSjtBQUFBLElBQVEsV0FBUjs7QUFFQSxFQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsV0FBYixFQUEwQix5QkFBMUIsRUFBcUQsVUFBVSxDQUFWLEVBQWE7QUFDOUQsU0FBSyxFQUFFLEtBQVA7QUFDQSxTQUFLLEVBQUUsS0FBUDtBQUNBLGNBQVUsRUFBRSxJQUFGLEVBQVEsTUFBUixDQUFlLGNBQWYsQ0FBVjtBQUNBLFlBQVEsU0FBUixDQUFrQix1QkFBbEIsRUFBMkMsWUFBM0MsQ0FBd0QsT0FBeEQ7QUFDQSxXQUFPLEtBQVA7QUFDSCxDQU5EOztBQVFBLEVBQUUsTUFBRixF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LEtBQUssR0FBTCxDQUFTLElBQUksR0FBYixDQUFaO0FBQ0EsZUFBTyxDQUNILENBQUMsR0FBRCxFQUFNLENBQUMsR0FBUCxFQUFZLENBQVosQ0FERyxFQUVILENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxDQUFYLENBRkcsRUFHSCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUhHLENBQVA7QUFLSCxLQW5IUTs7QUFxSFQsMEJBQXNCLG9DQUFRO0FBQzFCLFlBQUk7QUFDQSxtQkFBTyxNQUFQO0FBQ0gsU0FGRCxDQUVFLE9BQU8sQ0FBUCxFQUFVO0FBQ1IsZ0JBQUksRUFBRSxhQUFhLGNBQWYsQ0FBSixFQUFvQztBQUNoQyx3QkFBUSxLQUFSLENBQWMsQ0FBZDtBQUNBLHNCQUFNLElBQUksS0FBSixFQUFOO0FBQ0g7QUFDSjtBQUNELGVBQU8sSUFBUDtBQUNIO0FBL0hRLENBQWI7O0FBa0lBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBwcmVzZXQgPSByZXF1aXJlKCcuL3ByZXNldCcpO1xuY29uc3QgU2ltdWxhdG9yID0gcmVxdWlyZSgnLi9zaW11bGF0b3InKTtcblxuY29uc3Qgc2ltdWxhdG9yID0gbmV3IFNpbXVsYXRvcihwcmVzZXQpO1xuc2ltdWxhdG9yLmFuaW1hdGUoKTtcblxubGV0ICRtb3ZpbmcgPSBudWxsO1xubGV0IHB4LCBweTtcblxuJCgnYm9keScpLm9uKCdtb3VzZWRvd24nLCAnLmNvbnRyb2wtYm94IC50aXRsZS1iYXInLCBmdW5jdGlvbiAoZSkge1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG4gICAgJG1vdmluZyA9ICQodGhpcykucGFyZW50KCcuY29udHJvbC1ib3gnKTtcbiAgICAkbW92aW5nLm5leHRVbnRpbCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuaW5zZXJ0QmVmb3JlKCRtb3ZpbmcpO1xuICAgIHJldHVybiBmYWxzZTtcbn0pO1xuXG4kKCdib2R5JykubW91c2Vtb3ZlKGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCEkbW92aW5nKSByZXR1cm47XG4gICAgY29uc3QgeCA9IGUucGFnZVg7XG4gICAgY29uc3QgeSA9IGUucGFnZVk7XG4gICAgJG1vdmluZy5jc3MoJ2xlZnQnLCBwYXJzZUludCgkbW92aW5nLmNzcygnbGVmdCcpKSArICh4IC0gcHgpICsgJ3B4Jyk7XG4gICAgJG1vdmluZy5jc3MoJ3RvcCcsIHBhcnNlSW50KCRtb3ZpbmcuY3NzKCd0b3AnKSkgKyAoeSAtIHB5KSArICdweCcpO1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG59KTtcblxuJCgnYm9keScpLm1vdXNldXAoZnVuY3Rpb24gKGUpIHtcbiAgICAkbW92aW5nID0gbnVsbDtcbn0pO1xuXG5jb25zdCB7ZGVnMnJhZCwgZ2V0X3JvdGF0aW9uX3hfbWF0cml4LCBnZXRfcm90YXRpb25feV9tYXRyaXgsIHJvdGF0ZX0gPSByZXF1aXJlKCcuL3NpbXVsYXRvci91dGlsJyk7XG5jb25zdCBhbmdsZVggPSBkZWcycmFkKDMwKTtcbmNvbnN0IGFuZ2xlWSA9IGRlZzJyYWQoNTApO1xuY29uc3QgUnggPSBnZXRfcm90YXRpb25feF9tYXRyaXgoYW5nbGVYKTtcbmNvbnN0IFJ4XyA9IGdldF9yb3RhdGlvbl94X21hdHJpeChhbmdsZVgsIC0xKTtcbmNvbnN0IFJ5ID0gZ2V0X3JvdGF0aW9uX3lfbWF0cml4KGFuZ2xlWSk7XG5jb25zdCBSeV8gPSBnZXRfcm90YXRpb25feV9tYXRyaXgoYW5nbGVZLCAtMSk7XG5jb25zb2xlLmxvZyhyb3RhdGUocm90YXRlKHJvdGF0ZShyb3RhdGUoWy01LCA4LCAzXSwgUngpLCBSeSksIFJ5XyksIFJ4XykpOyIsImNvbnN0IHtleHRlbmR9ID0gJDtcblxuXG5mdW5jdGlvbiBFTVBUWV8yRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBjLCB7XG4gICAgICAgIFRJVExFOiAnR3Jhdml0eSBTaW11bGF0b3InLFxuICAgICAgICBCQUNLR1JPVU5EOiAnd2hpdGUnLFxuICAgICAgICBESU1FTlNJT046IDIsXG4gICAgICAgIE1BWF9QQVRIUzogMTAwMCxcbiAgICAgICAgQ0FNRVJBX0NPT1JEX1NURVA6IDUsXG4gICAgICAgIENBTUVSQV9BTkdMRV9TVEVQOiAxLFxuICAgICAgICBDQU1FUkFfQUNDRUxFUkFUSU9OOiAxLjEsXG4gICAgICAgIEc6IDAuMSxcbiAgICAgICAgTUFTU19NSU46IDEsXG4gICAgICAgIE1BU1NfTUFYOiA0ZTQsXG4gICAgICAgIFZFTE9DSVRZX01BWDogMTAsXG4gICAgICAgIERJUkVDVElPTl9MRU5HVEg6IDUwLFxuICAgICAgICBDQU1FUkFfRElTVEFOQ0U6IDEwMFxuICAgIH0pO1xufVxuXG5cbmZ1bmN0aW9uIEVNUFRZXzNEKGMpIHtcbiAgICByZXR1cm4gZXh0ZW5kKHRydWUsIEVNUFRZXzJEKGMpLCB7XG4gICAgICAgIERJTUVOU0lPTjogMyxcbiAgICAgICAgRzogMC4wMDEsXG4gICAgICAgIE1BU1NfTUlOOiAxLFxuICAgICAgICBNQVNTX01BWDogOGU2LFxuICAgICAgICBWRUxPQ0lUWV9NQVg6IDEwXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIFRFU1QoYykge1xuICAgIHJldHVybiBleHRlbmQodHJ1ZSwgRU1QVFlfM0QoYyksIHtcbiAgICAgICAgaW5pdDogKGVuZ2luZSkgPT4ge1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZV9vYmplY3QoJ2JhbGwxJywgWy0xNTAsIDAsIDBdLCAxMDAwMDAwLCBbMCwgMCwgMF0sICdncmVlbicpO1xuICAgICAgICAgICAgZW5naW5lLmNyZWF0ZV9vYmplY3QoJ2JhbGwyJywgWzUwLCAwLCAwXSwgMTAwMDAsIFswLCAwLCAwXSwgJ2JsdWUnKTtcbiAgICAgICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVNUFRZXzNEO1xuIiwiY29uc3QgSW52aXNpYmxlRXJyb3IgPSByZXF1aXJlKCcuLi9lcnJvci9pbnZpc2libGUnKTtcbmNvbnN0IHtkZWcycmFkLCByb3RhdGUsIG5vdywgZ2V0X3JvdGF0aW9uX21hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7cG93fSA9IE1hdGg7XG5cbmNsYXNzIENhbWVyYTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGVuZ2luZSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy56ID0gY29uZmlnLkNBTUVSQV9ESVNUQU5DRTtcbiAgICAgICAgdGhpcy5waGkgPSAwO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5sYXN0X3RpbWUgPSAwO1xuICAgICAgICB0aGlzLmxhc3Rfa2V5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIHRoaXMuY2VudGVyID0gW2NvbmZpZy5XIC8gMiwgY29uZmlnLkggLyAyXTtcbiAgICB9XG5cbiAgICBnZXRfY29vcmRfc3RlcChrZXkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudF90aW1lID0gbm93KCk7XG4gICAgICAgIGlmIChrZXkgPT0gdGhpcy5sYXN0X2tleSAmJiBjdXJyZW50X3RpbWUgLSB0aGlzLmxhc3RfdGltZSA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdF90aW1lID0gY3VycmVudF90aW1lO1xuICAgICAgICB0aGlzLmxhc3Rfa2V5ID0ga2V5O1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuQ0FNRVJBX0NPT1JEX1NURVAgKiBwb3codGhpcy5jb25maWcuQ0FNRVJBX0FDQ0VMRVJBVElPTiwgdGhpcy5jb21ibyk7XG4gICAgfVxuXG4gICAgdXAoa2V5KSB7XG4gICAgICAgIHRoaXMueSAtPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGRvd24oa2V5KSB7XG4gICAgICAgIHRoaXMueSArPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGxlZnQoa2V5KSB7XG4gICAgICAgIHRoaXMueCAtPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJpZ2h0KGtleSkge1xuICAgICAgICB0aGlzLnggKz0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICB6b29tX2luKGtleSkge1xuICAgICAgICB0aGlzLnogLT0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICB6b29tX291dChrZXkpIHtcbiAgICAgICAgdGhpcy56ICs9IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlX2xlZnQoa2V5KSB7XG4gICAgICAgIHRoaXMucGhpIC09IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVfcmlnaHQoa2V5KSB7XG4gICAgICAgIHRoaXMucGhpICs9IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgIH1cblxuICAgIGdldF96b29tKHogPSAwKSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMueiAtIHo7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgSW52aXNpYmxlRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuQ0FNRVJBX0RJU1RBTkNFIC8gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgYWRqdXN0X2Nvb3JkcyhjKSB7XG4gICAgICAgIGNvbnN0IFIgPSBnZXRfcm90YXRpb25fbWF0cml4KGRlZzJyYWQodGhpcy5waGkpKTtcbiAgICAgICAgYyA9IHJvdGF0ZShjLCBSKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oKTtcbiAgICAgICAgY29uc3QgY29vcmRzID0gYWRkKHRoaXMuY2VudGVyLCBtdWwoc3ViKGMsIFt0aGlzLngsIHRoaXMueV0pLCB6b29tKSk7XG4gICAgICAgIHJldHVybiB7Y29vcmRzfTtcbiAgICB9XG5cbiAgICBhZGp1c3RfcmFkaXVzKGNvb3JkcywgcmFkaXVzKSB7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKCk7XG4gICAgICAgIHJldHVybiByYWRpdXMgKiB6b29tO1xuICAgIH1cblxuICAgIGFjdHVhbF9wb2ludCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IFJfID0gZ2V0X3JvdGF0aW9uX21hdHJpeChkZWcycmFkKHRoaXMucGhpKSwgLTEpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbSgpO1xuICAgICAgICByZXR1cm4gcm90YXRlKGFkZChkaXYoc3ViKFt4LCB5XSwgdGhpcy5jZW50ZXIpLCB6b29tKSwgW3RoaXMueCwgdGhpcy55XSksIFJfKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhMkQ7IiwiY29uc3QgQ2FtZXJhMkQgPSByZXF1aXJlKCcuLzJkJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBnZXRfcm90YXRpb25feF9tYXRyaXgsIGdldF9yb3RhdGlvbl95X21hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5cblxuY2xhc3MgQ2FtZXJhM0QgZXh0ZW5kcyBDYW1lcmEyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBlbmdpbmUpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCBlbmdpbmUpO1xuICAgICAgICB0aGlzLnRoZXRhID0gMDtcbiAgICB9XG5cbiAgICByb3RhdGVfdXAoa2V5KSB7XG4gICAgICAgIHRoaXMudGhldGEgLT0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZV9kb3duKGtleSkge1xuICAgICAgICB0aGlzLnRoZXRhICs9IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVkX2Nvb3JkcyhjKSB7XG4gICAgICAgIGNvbnN0IFJ4ID0gZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGRlZzJyYWQodGhpcy50aGV0YSkpO1xuICAgICAgICBjb25zdCBSeSA9IGdldF9yb3RhdGlvbl95X21hdHJpeChkZWcycmFkKHRoaXMucGhpKSk7XG4gICAgICAgIHJldHVybiByb3RhdGUocm90YXRlKGMsIFJ4KSwgUnkpO1xuICAgIH1cblxuICAgIGFkanVzdF9jb29yZHMoYykge1xuICAgICAgICBjID0gdGhpcy5yb3RhdGVkX2Nvb3JkcyhjKTtcbiAgICAgICAgY29uc3QgeiA9IGMucG9wKCk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKHopO1xuICAgICAgICBjb25zdCBjb29yZHMgPSBhZGQodGhpcy5jZW50ZXIsIG11bChzdWIoYywgW3RoaXMueCwgdGhpcy55XSksIHpvb20pKTtcbiAgICAgICAgcmV0dXJuIHtjb29yZHMsIHp9O1xuICAgIH1cblxuICAgIGFkanVzdF9yYWRpdXMoYywgcmFkaXVzKSB7XG4gICAgICAgIGMgPSB0aGlzLnJvdGF0ZWRfY29vcmRzKGMpO1xuICAgICAgICBjb25zdCB6ID0gYy5wb3AoKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oeik7XG4gICAgICAgIHJldHVybiByYWRpdXMgKiB6b29tO1xuICAgIH1cblxuICAgIGFjdHVhbF9wb2ludCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IFJ4XyA9IGdldF9yb3RhdGlvbl94X21hdHJpeChkZWcycmFkKHRoaXMudGhldGEpLCAtMSk7XG4gICAgICAgIGNvbnN0IFJ5XyA9IGdldF9yb3RhdGlvbl95X21hdHJpeChkZWcycmFkKHRoaXMucGhpKSwgLTEpO1xuICAgICAgICBjb25zdCBjID0gYWRkKHN1YihbeCwgeV0sIHRoaXMuY2VudGVyKSwgW3RoaXMueCwgdGhpcy55XSkuY29uY2F0KHRoaXMueiAtIHRoaXMuY29uZmlnLkNBTUVSQV9ESVNUQU5DRSk7XG4gICAgICAgIHJldHVybiByb3RhdGUocm90YXRlKGMsIFJ5XyksIFJ4Xyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYTNEOyIsImNsYXNzIENvbnRyb2xCb3gge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBjb250cm9sbGVycywgeCwgeSkge1xuICAgICAgICBjb25zdCAkdGVtcGxhdGVDb250cm9sQm94ID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJyk7XG4gICAgICAgIGNvbnN0ICRjb250cm9sQm94ID0gJHRlbXBsYXRlQ29udHJvbEJveC5jbG9uZSgpO1xuICAgICAgICAkY29udHJvbEJveC5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLnRpdGxlJykudGV4dCh0aXRsZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dENvbnRhaW5lciA9ICRjb250cm9sQm94LmZpbmQoJy5pbnB1dC1jb250YWluZXInKTtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sbGVyIG9mIGNvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgICAkaW5wdXRDb250YWluZXIuYXBwZW5kKGNvbnRyb2xsZXIuJGlucHV0V3JhcHBlcik7XG4gICAgICAgIH1cbiAgICAgICAgJGNvbnRyb2xCb3guZmluZCgnLmNsb3NlJykuY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkY29udHJvbEJveC5pbnNlcnRCZWZvcmUoJHRlbXBsYXRlQ29udHJvbEJveCk7XG4gICAgICAgICRjb250cm9sQm94LmNzcygnbGVmdCcsIHggKyAncHgnKTtcbiAgICAgICAgJGNvbnRyb2xCb3guY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG5cbiAgICAgICAgdGhpcy4kY29udHJvbEJveCA9ICRjb250cm9sQm94O1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLiRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGlzX29wZW5lZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGNvbnRyb2xCb3hbMF0ucGFyZW50Tm9kZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbEJveDsiLCJjbGFzcyBDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihvYmplY3QsIG5hbWUsIG1pbiwgbWF4LCB2YWx1ZSwgZnVuYykge1xuICAgICAgICBjb25zdCAkaW5wdXRXcmFwcGVyID0gdGhpcy4kaW5wdXRXcmFwcGVyID0gJCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlIC5pbnB1dC13cmFwcGVyLnRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5yZW1vdmVDbGFzcygndGVtcGxhdGUnKTtcbiAgICAgICAgJGlucHV0V3JhcHBlci5maW5kKCcubmFtZScpLnRleHQobmFtZSk7XG4gICAgICAgIGNvbnN0ICRpbnB1dCA9IHRoaXMuJGlucHV0ID0gJGlucHV0V3JhcHBlci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAkaW5wdXQuYXR0cignbWluJywgbWluKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21heCcsIG1heCk7XG4gICAgICAgICRpbnB1dC5hdHRyKCd2YWx1ZScsIHZhbHVlKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ3N0ZXAnLCAwLjAxKTtcbiAgICAgICAgY29uc3QgJHZhbHVlID0gJGlucHV0V3JhcHBlci5maW5kKCcudmFsdWUnKTtcbiAgICAgICAgJHZhbHVlLnRleHQodGhpcy5nZXQoKSk7XG4gICAgICAgICRpbnB1dC5vbignaW5wdXQnLCBlID0+IHtcbiAgICAgICAgICAgICR2YWx1ZS50ZXh0KHRoaXMuZ2V0KCkpO1xuICAgICAgICAgICAgZnVuYy5jYWxsKG9iamVjdCwgZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy4kaW5wdXQudmFsKCkpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sbGVyOyIsImNvbnN0IENpcmNsZSA9IHJlcXVpcmUoJy4uL29iamVjdC9jaXJjbGUnKTtcbmNvbnN0IENhbWVyYTJEID0gcmVxdWlyZSgnLi4vY2FtZXJhLzJkJyk7XG5jb25zdCB7cm90YXRlLCBub3csIHJhbmRvbSwgcG9sYXIyY2FydGVzaWFuLCByYW5kX2NvbG9yLCBnZXRfcm90YXRpb25fbWF0cml4LCBjYXJ0ZXNpYW4yYXV0bywgc2tpcF9pbnZpc2libGVfZXJyb3J9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWx9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWluLCBtYXh9ID0gTWF0aDtcblxuXG5jbGFzcyBQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihvYmopIHtcbiAgICAgICAgdGhpcy5wcmV2X3BvcyA9IG9iai5wcmV2X3Bvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnBvcyA9IG9iai5wb3Muc2xpY2UoKTtcbiAgICB9XG59XG5cbmNsYXNzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGN0eCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMub2JqcyA9IFtdO1xuICAgICAgICB0aGlzLmFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbnRyb2xib3hlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhdGhzID0gW107XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYTJEKGNvbmZpZywgdGhpcyk7XG4gICAgICAgIHRoaXMuZnBzX2xhc3RfdGltZSA9IG5vdygpO1xuICAgICAgICB0aGlzLmZwc19jb3VudCA9IDA7XG4gICAgfVxuXG4gICAgdG9nZ2xlQW5pbWF0aW5nKCkge1xuICAgICAgICB0aGlzLmFuaW1hdGluZyA9ICF0aGlzLmFuaW1hdGluZztcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBgJHt0aGlzLmNvbmZpZy5USVRMRX0gKCR7dGhpcy5hbmltYXRpbmcgPyBcIlNpbXVsYXRpbmdcIiA6IFwiUGF1c2VkXCJ9KWA7XG4gICAgfVxuXG4gICAgZGVzdHJveV9jb250cm9sYm94ZXMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbGJveCBvZiB0aGlzLmNvbnRyb2xib3hlcykge1xuICAgICAgICAgICAgY29udHJvbGJveC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbGJveGVzID0gW11cbiAgICB9XG5cbiAgICBhbmltYXRlKCkge1xuICAgICAgICB0aGlzLnByaW50X2ZwcygpO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlX2FsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVkcmF3X2FsbCgpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xuICAgICAgICB9LCAxMCk7XG4gICAgfVxuXG4gICAgb2JqZWN0X2Nvb3JkcyhvYmopIHtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuY2FtZXJhLmFkanVzdF9yYWRpdXMob2JqLnBvcywgb2JqLmdldF9yKCkpO1xuICAgICAgICBjb25zdCB7Y29vcmRzLCB6fSA9IHRoaXMuY2FtZXJhLmFkanVzdF9jb29yZHMob2JqLnBvcyk7XG4gICAgICAgIHJldHVybiBjb29yZHMuY29uY2F0KHIpLmNvbmNhdCh6KTtcbiAgICB9XG5cbiAgICBkaXJlY3Rpb25fY29vcmRzKG9iaiwgZmFjdG9yID0gdGhpcy5jb25maWcuRElSRUNUSU9OX0xFTkdUSCkge1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMX0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmRzKG9iai5wb3MpO1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMiwgen0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmRzKGFkZChvYmoucG9zLCBtdWwob2JqLnYsIGZhY3RvcikpKTtcbiAgICAgICAgcmV0dXJuIGMxLmNvbmNhdChjMikuY29uY2F0KHopO1xuICAgIH1cblxuICAgIHBhdGhfY29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMSwgejF9ID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucHJldl9wb3MpO1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMiwgejJ9ID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIGMxLmNvbmNhdChjMiwgbWF4KHoxLCB6MikpO1xuICAgIH1cblxuICAgIGRyYXdfb2JqZWN0KGMsIGNvbG9yID0gbnVsbCkge1xuICAgICAgICBza2lwX2ludmlzaWJsZV9lcnJvcigoKSA9PiB7XG4gICAgICAgICAgICBjb2xvciA9IGNvbG9yIHx8IGMuY29sb3I7XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIENpcmNsZSkge1xuICAgICAgICAgICAgICAgIGMgPSB0aGlzLm9iamVjdF9jb29yZHMoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhjWzBdLCBjWzFdLCBjWzJdLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gY29sb3I7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdfZGlyZWN0aW9uKGMpIHtcbiAgICAgICAgc2tpcF9pbnZpc2libGVfZXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBDaXJjbGUpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5kaXJlY3Rpb25fY29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oY1swXSwgY1sxXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oY1syXSwgY1szXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3X3BhdGgoYykge1xuICAgICAgICBza2lwX2ludmlzaWJsZV9lcnJvcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIFBhdGgpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5wYXRoX2Nvb3JkcyhjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGNbMF0sIGNbMV0pO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnI2RkZGRkZCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3JlYXRlX3BhdGgob2JqKSB7XG4gICAgICAgIGlmIChtYWcoc3ViKG9iai5wb3MsIG9iai5wcmV2X3BvcykpID4gNSkge1xuICAgICAgICAgICAgdGhpcy5wYXRocy5wdXNoKG5ldyBQYXRoKG9iaikpO1xuICAgICAgICAgICAgb2JqLnByZXZfcG9zID0gb2JqLnBvcy5zbGljZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMucGF0aHMubGVuZ3RoID4gdGhpcy5jb25maWcuTUFYX1BBVEhTKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXRocyA9IHRoaXMucGF0aHMuc2xpY2UoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1c2VyX2NyZWF0ZV9vYmplY3QoeCwgeSkge1xuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmNhbWVyYS5hY3R1YWxfcG9pbnQoeCwgeSk7XG4gICAgICAgIGxldCBtYXhfciA9IENpcmNsZS5nZXRfcl9mcm9tX20odGhpcy5jb25maWcuTUFTU19NQVgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG1heF9yID0gbWluKG1heF9yLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5nZXRfcigpKSAvIDEuNSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtID0gQ2lyY2xlLmdldF9tX2Zyb21fcihyYW5kb20oQ2lyY2xlLmdldF9yX2Zyb21fbSh0aGlzLmNvbmZpZy5NQVNTX01JTiksIG1heF9yKSk7XG4gICAgICAgIGNvbnN0IHYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gcmFuZF9jb2xvcigpO1xuICAgICAgICBjb25zdCB0YWcgPSBgY2lyY2xlJHt0aGlzLm9ianMubGVuZ3RofWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBDaXJjbGUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIG9iai5zaG93X2NvbnRyb2xib3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgY3JlYXRlX29iamVjdCh0YWcsIHBvcywgbSwgdiwgY29sb3IpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IENpcmNsZSh0aGlzLmNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzKTtcbiAgICAgICAgdGhpcy5vYmpzLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBnZXRfcm90YXRpb25fbWF0cml4KGFuZ2xlcywgZGlyID0gMSkge1xuICAgICAgICByZXR1cm4gZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXNbMF0sIGRpcik7XG4gICAgfVxuXG4gICAgZ2V0X3Bpdm90X2F4aXMoKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGVsYXN0aWNfY29sbGlzaW9uKCkge1xuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmNvbmZpZy5ESU1FTlNJT047XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vYmpzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvMSA9IHRoaXMub2Jqc1tpXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMub2Jqcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG8yID0gdGhpcy5vYmpzW2pdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxpc2lvbiA9IHN1YihvMi5wb3MsIG8xLnBvcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGVzID0gY2FydGVzaWFuMmF1dG8oY29sbGlzaW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gYW5nbGVzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZCA8IG8xLmdldF9yKCkgKyBvMi5nZXRfcigpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFIgPSB0aGlzLmdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUl8gPSB0aGlzLmdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzLCAtMSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLmdldF9waXZvdF9heGlzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgdl90ZW1wID0gW3JvdGF0ZShvMS52LCBSKSwgcm90YXRlKG8yLnYsIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgdl9maW5hbCA9IFt2X3RlbXBbMF0uc2xpY2UoKSwgdl90ZW1wWzFdLnNsaWNlKCldO1xuICAgICAgICAgICAgICAgICAgICB2X2ZpbmFsWzBdW2ldID0gKChvMS5tIC0gbzIubSkgKiB2X3RlbXBbMF1baV0gKyAyICogbzIubSAqIHZfdGVtcFsxXVtpXSkgLyAobzEubSArIG8yLm0pO1xuICAgICAgICAgICAgICAgICAgICB2X2ZpbmFsWzFdW2ldID0gKChvMi5tIC0gbzEubSkgKiB2X3RlbXBbMV1baV0gKyAyICogbzEubSAqIHZfdGVtcFswXVtpXSkgLyAobzEubSArIG8yLm0pO1xuICAgICAgICAgICAgICAgICAgICBvMS52ID0gcm90YXRlKHZfZmluYWxbMF0sIFJfKTtcbiAgICAgICAgICAgICAgICAgICAgbzIudiA9IHJvdGF0ZSh2X2ZpbmFsWzFdLCBSXyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zX3RlbXAgPSBbemVyb3MoZGltZW5zaW9uKSwgcm90YXRlKGNvbGxpc2lvbiwgUildO1xuICAgICAgICAgICAgICAgICAgICBwb3NfdGVtcFswXVtpXSArPSB2X2ZpbmFsWzBdW2ldO1xuICAgICAgICAgICAgICAgICAgICBwb3NfdGVtcFsxXVtpXSArPSB2X2ZpbmFsWzFdW2ldO1xuICAgICAgICAgICAgICAgICAgICBvMS5wb3MgPSBhZGQobzEucG9zLCByb3RhdGUocG9zX3RlbXBbMF0sIFJfKSk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnBvcyA9IGFkZChvMS5wb3MsIHJvdGF0ZShwb3NfdGVtcFsxXSwgUl8pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxjdWxhdGVfYWxsKCkge1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIG9iai5jYWxjdWxhdGVfdmVsb2NpdHkoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsYXN0aWNfY29sbGlzaW9uKCk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgb2JqLmNhbGN1bGF0ZV9wb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVfcGF0aChvYmopO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVkcmF3X2FsbCgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd19vYmplY3Qob2JqKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd19kaXJlY3Rpb24ob2JqKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wYXRocykge1xuICAgICAgICAgICAgdGhpcy5kcmF3X3BhdGgocGF0aCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmludF9mcHMoKSB7XG4gICAgICAgIHRoaXMuZnBzX2NvdW50ICs9IDE7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfdGltZSA9IG5vdygpO1xuICAgICAgICBjb25zdCBmcHNfdGltZV9kaWZmID0gY3VycmVudF90aW1lIC0gdGhpcy5mcHNfbGFzdF90aW1lXG4gICAgICAgIGlmIChmcHNfdGltZV9kaWZmID4gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7KHRoaXMuZnBzX2NvdW50IC8gZnBzX3RpbWVfZGlmZikgfCAwfSBmcHNgKTtcbiAgICAgICAgICAgIHRoaXMuZnBzX2xhc3RfdGltZSA9IGN1cnJlbnRfdGltZTtcbiAgICAgICAgICAgIHRoaXMuZnBzX2NvdW50ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmUyRDsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vMmQnKTtcbmNvbnN0IENhbWVyYTNEID0gcmVxdWlyZSgnLi4vY2FtZXJhLzNkJyk7XG5jb25zdCBTcGhlcmUgPSByZXF1aXJlKCcuLi9vYmplY3Qvc3BoZXJlJyk7XG5jb25zdCB7cmFuZG9tLCBnZXRfcm90YXRpb25feV9tYXRyaXgsIGdldF9yb3RhdGlvbl96X21hdHJpeCwgcmFuZF9jb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbiwgc2tpcF9pbnZpc2libGVfZXJyb3J9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge21hZywgc3ViLCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWlufSA9IE1hdGg7XG5cblxuY2xhc3MgRW5naW5lM0QgZXh0ZW5kcyBFbmdpbmUyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBjdHgpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCBjdHgpO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEzRChjb25maWcsIHRoaXMpO1xuICAgIH1cblxuICAgIGRpcmVjdGlvbl9jb29yZHMob2JqKSB7XG4gICAgICAgIGNvbnN0IGMgPSB0aGlzLmNhbWVyYS5yb3RhdGVkX2Nvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRGYWN0b3IgPSAodGhpcy5jYW1lcmEueiAtIGNbMl0gLSAxKSAvIG9iai52WzJdO1xuICAgICAgICBsZXQgZmFjdG9yID0gdGhpcy5jb25maWcuRElSRUNUSU9OX0xFTkdUSDtcbiAgICAgICAgaWYgKGFkanVzdGVkRmFjdG9yID4gMCkgZmFjdG9yID0gbWluKGZhY3RvciwgYWRqdXN0ZWRGYWN0b3IpO1xuICAgICAgICByZXR1cm4gc3VwZXIuZGlyZWN0aW9uX2Nvb3JkcyhvYmosIGZhY3Rvcik7XG4gICAgfVxuXG4gICAgdXNlcl9jcmVhdGVfb2JqZWN0KHgsIHkpIHtcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5jYW1lcmEuYWN0dWFsX3BvaW50KHgsIHkpO1xuICAgICAgICBsZXQgbWF4X3IgPSBTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBtYXhfciA9IG1pbihtYXhfciwgKG1hZyhzdWIob2JqLnBvcywgcG9zKSkgLSBvYmouZ2V0X3IoKSkgLyAxLjUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG0gPSBTcGhlcmUuZ2V0X21fZnJvbV9yKHJhbmRvbShTcGhlcmUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUlOKSwgbWF4X3IpKTtcbiAgICAgICAgY29uc3QgdiA9IHNwaGVyaWNhbDJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSwgcmFuZG9tKC0xODAsIDE4MCkpO1xuICAgICAgICBjb25zdCBjb2xvciA9IHJhbmRfY29sb3IoKTtcbiAgICAgICAgY29uc3QgdGFnID0gYHNwaGVyZSR7dGhpcy5vYmpzLmxlbmd0aH1gO1xuICAgICAgICBjb25zdCBvYmogPSBuZXcgU3BoZXJlKHRoaXMuY29uZmlnLCBtLCBwb3MsIHYsIGNvbG9yLCB0YWcsIHRoaXMpO1xuICAgICAgICBvYmouc2hvd19jb250cm9sYm94KHgsIHkpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGNyZWF0ZV9vYmplY3QodGFnLCBwb3MsIG0sIHYsIGNvbG9yKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBTcGhlcmUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGRvdChnZXRfcm90YXRpb25fel9tYXRyaXgoYW5nbGVzWzBdLCBkaXIpLCBnZXRfcm90YXRpb25feV9tYXRyaXgoYW5nbGVzWzFdLCBkaXIpLCBkaXIpO1xuICAgIH1cblxuICAgIGdldF9waXZvdF9heGlzKCkge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG5cbiAgICByZWRyYXdfYWxsKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCk7XG4gICAgICAgIGNvbnN0IG9yZGVycyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgIHNraXBfaW52aXNpYmxlX2Vycm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLm9iamVjdF9jb29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsnb2JqZWN0JywgY29vcmRzLCB6LCBvYmouY29sb3JdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgc2tpcF9pbnZpc2libGVfZXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IHRoaXMuZGlyZWN0aW9uX2Nvb3JkcyhvYmopO1xuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBjb29yZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgb3JkZXJzLnB1c2goWydkaXJlY3Rpb24nLCBjb29yZHMsIHpdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0aGlzLnBhdGhzKSB7XG4gICAgICAgICAgICBza2lwX2ludmlzaWJsZV9lcnJvcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0gdGhpcy5wYXRoX2Nvb3JkcyhwYXRoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsncGF0aCcsIGNvb3Jkcywgel0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgb3JkZXJzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhWzJdIC0gYlsyXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAoY29uc3QgW3R5cGUsIGNvb3JkcywgeiwgY29sb3JdIG9mIG9yZGVycykge1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3X29iamVjdChjb29yZHMsIGNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGlyZWN0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3X2RpcmVjdGlvbihjb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwYXRoJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3X3BhdGgoY29vcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5naW5lM0Q7IiwiY2xhc3MgSW52aXNpYmxlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnZpc2libGVFcnJvcjsiLCJjb25zdCBFbmdpbmUyRCA9IHJlcXVpcmUoJy4vZW5naW5lLzJkJyk7XG5jb25zdCBFbmdpbmUzRCA9IHJlcXVpcmUoJy4vZW5naW5lLzNkJyk7XG5jb25zdCB7Z2V0X2Rpc3RhbmNlLCBza2lwX2ludmlzaWJsZV9lcnJvcn0gPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuXG5sZXQgY29uZmlnID0gbnVsbDtcbmNvbnN0IGtleW1hcCA9IHtcbiAgICAzODogJ3VwJyxcbiAgICA0MDogJ2Rvd24nLFxuICAgIDM3OiAnbGVmdCcsXG4gICAgMzk6ICdyaWdodCcsXG4gICAgOTA6ICd6b29tX2luJywgLy8gelxuICAgIDg4OiAnem9vbV9vdXQnLCAvLyB4XG4gICAgODc6ICdyb3RhdGVfdXAnLCAvLyB3XG4gICAgODM6ICdyb3RhdGVfZG93bicsIC8vIHNcbiAgICA2NTogJ3JvdGF0ZV9sZWZ0JywgLy8gYVxuICAgIDY4OiAncm90YXRlX3JpZ2h0JyAvLyBkXG59O1xuXG5mdW5jdGlvbiBvbl9yZXNpemUoJGNhbnZhcykge1xuICAgIGNvbmZpZy5XID0gJGNhbnZhc1swXS53aWR0aCA9ICRjYW52YXMud2lkdGgoKTtcbiAgICBjb25maWcuSCA9ICRjYW52YXNbMF0uaGVpZ2h0ID0gJGNhbnZhcy5oZWlnaHQoKTtcbn1cblxuZnVuY3Rpb24gb25fY2xpY2soZXZlbnQsIGVuZ2luZSkge1xuICAgIGNvbnN0IHggPSBldmVudC5wYWdlWDtcbiAgICBjb25zdCB5ID0gZXZlbnQucGFnZVk7XG4gICAgaWYgKCFlbmdpbmUuYW5pbWF0aW5nKSB7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIGVuZ2luZS5vYmpzKSB7XG4gICAgICAgICAgICBpZiAoc2tpcF9pbnZpc2libGVfZXJyb3IoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbY3gsIGN5LCByXSA9IGVuZ2luZS5vYmplY3RfY29vcmRzKG9iaik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRfZGlzdGFuY2UoY3gsIGN5LCB4LCB5KSA8IHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iai5zaG93X2NvbnRyb2xib3goeCwgeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKSByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZW5naW5lLnVzZXJfY3JlYXRlX29iamVjdCh4LCB5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uX2tleV9kb3duKGV2ZW50LCBlbmdpbmUpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBldmVudDtcbiAgICBpZiAoa2V5Q29kZSA9PSAzMikgeyAvLyBzcGFjZSBiYXJcbiAgICAgICAgZW5naW5lLmRlc3Ryb3lfY29udHJvbGJveGVzKCk7XG4gICAgICAgIGVuZ2luZS50b2dnbGVBbmltYXRpbmcoKTtcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgaW4ga2V5bWFwICYmIGtleW1hcFtrZXlDb2RlXSBpbiBlbmdpbmUuY2FtZXJhKSB7XG4gICAgICAgIGVuZ2luZS5jYW1lcmFba2V5bWFwW2tleUNvZGVdXShrZXlDb2RlKTtcbiAgICB9XG59XG5cbmNsYXNzIFNpbXVsYXRvciB7XG4gICAgY29uc3RydWN0b3IocHJlc2V0KSB7XG4gICAgICAgIGNvbmZpZyA9IHByZXNldCh7fSk7XG4gICAgICAgIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMnKTtcbiAgICAgICAgY29uc3QgY3R4ID0gJGNhbnZhc1swXS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBvbl9yZXNpemUoJGNhbnZhcyk7XG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IChjb25maWcuRElNRU5TSU9OID09IDIgPyBFbmdpbmUyRCA6IEVuZ2luZTNEKShjb25maWcsIGN0eCk7XG4gICAgICAgIGlmICgnaW5pdCcgaW4gY29uZmlnKSBjb25maWcuaW5pdCh0aGlzLmVuZ2luZSk7XG4gICAgICAgICRjYW52YXMucmVzaXplKGUgPT4ge1xuICAgICAgICAgICAgb25fcmVzaXplKCRjYW52YXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNhbnZhcy5jbGljayhlID0+IHtcbiAgICAgICAgICAgIG9uX2NsaWNrKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJ2JvZHknKS5rZXlkb3duKGUgPT4ge1xuICAgICAgICAgICAgb25fa2V5X2Rvd24oZSwgdGhpcy5lbmdpbmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhbmltYXRlKCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5hbmltYXRlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXVsYXRvcjsiLCJmdW5jdGlvbiBpdGVyKGEsIGZ1bmMpIHtcbiAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhX3I7IGkrKykge1xuICAgICAgICBtW2ldID0gZnVuYyhpKTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHplcm9zOiBOID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheShOKS5maWxsKDApO1xuICAgIH0sXG5cbiAgICBtYWc6IGEgPT4ge1xuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgICAgIHN1bSArPSBhW2ldICogYVtpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHN1bSk7XG4gICAgfSxcblxuICAgIGFkZDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSArIGJbaV07XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzdWI6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLSBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbXVsOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldICogYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRpdjogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAvIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkb3Q6IChhLCBiLCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGlmIChkaXIgPT0gLTEpIHtcbiAgICAgICAgICAgIFthLCBiXSA9IFtiLCBhXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYV9jID0gYVswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJfYyA9IGJbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgYV9yOyByKyspIHtcbiAgICAgICAgICAgIG1bcl0gPSBuZXcgQXJyYXkoYl9jKTtcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgYl9jOyBjKyspIHtcbiAgICAgICAgICAgICAgICBtW3JdW2NdID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG1bcl1bY10gKz0gYVtyXVtpXSAqIGJbaV1bY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbn07IiwiY29uc3QgQ29udHJvbEJveCA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbF9ib3gnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHt2ZWN0b3JfbWFnbml0dWRlLCByYWQyZGVnLCBkZWcycmFkLCBwb2xhcjJjYXJ0ZXNpYW4sIGNhcnRlc2lhbjJhdXRvLCBzcXVhcmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21heCwgcG93fSA9IE1hdGg7XG5cblxuY2xhc3MgQ2lyY2xlIHtcbiAgICAvKipcbiAgICAgKiBQb2xhciBjb29yZGluYXRlIHN5c3RlbVxuICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BvbGFyX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgZW5naW5lKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICAgICAgdGhpcy5wcmV2X3BvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xib3ggPSBudWxsO1xuICAgIH1cblxuICAgIGdldF9yKCkge1xuICAgICAgICByZXR1cm4gQ2lyY2xlLmdldF9yX2Zyb21fbSh0aGlzLm0pXG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX3ZlbG9jaXR5KCkge1xuICAgICAgICBsZXQgRiA9IHplcm9zKHRoaXMuY29uZmlnLkRJTUVOU0lPTik7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIGlmIChvYmogPT0gdGhpcykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCB2ZWN0b3IgPSBzdWIodGhpcy5wb3MsIG9iai5wb3MpO1xuICAgICAgICAgICAgY29uc3QgbWFnbml0dWRlID0gbWFnKHZlY3Rvcik7XG4gICAgICAgICAgICBjb25zdCB1bml0X3ZlY3RvciA9IGRpdih2ZWN0b3IsIG1hZ25pdHVkZSk7XG4gICAgICAgICAgICBGID0gYWRkKEYsIG11bCh1bml0X3ZlY3Rvciwgb2JqLm0gLyBzcXVhcmUobWFnbml0dWRlKSkpXG4gICAgICAgIH1cbiAgICAgICAgRiA9IG11bChGLCAtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBkaXYoRiwgdGhpcy5tKTtcbiAgICAgICAgdGhpcy52ID0gYWRkKHRoaXMudiwgYSk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX3Bvc2l0aW9uKCkge1xuICAgICAgICB0aGlzLnBvcyA9IGFkZCh0aGlzLnBvcywgdGhpcy52KTtcbiAgICB9XG5cbiAgICBjb250cm9sX20oZSkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tX2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgfVxuXG4gICAgY29udHJvbF9wb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NfeF9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NfeV9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5XTtcbiAgICB9XG5cbiAgICBjb250cm9sX3YoZSkge1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZfcmhvX2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52X3BoaV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgdGhpcy52ID0gcG9sYXIyY2FydGVzaWFuKHJobywgcGhpKTtcbiAgICB9XG5cbiAgICBzaG93X2NvbnRyb2xib3goeCwgeSkge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sYm94ICYmIHRoaXMuY29udHJvbGJveC5pc19vcGVuZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgJGNvbnRyb2xCb3ggPSB0aGlzLmNvbnRyb2xib3guJGNvbnRyb2xCb3g7XG4gICAgICAgICAgICAkY29udHJvbEJveC5jc3MoJ2xlZnQnLCB4ICsgJ3B4Jyk7XG4gICAgICAgICAgICAkY29udHJvbEJveC5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcbiAgICAgICAgICAgICRjb250cm9sQm94Lm5leHRVbnRpbCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuaW5zZXJ0QmVmb3JlKCRjb250cm9sQm94KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpbiA9IDEuNTtcblxuICAgICAgICAgICAgdmFyIHBvc19yYW5nZSA9IG1heChtYXgodGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCkgLyAyLCBtYXguYXBwbHkobnVsbCwgdGhpcy5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgICAgIHBvc19yYW5nZSA9IG1heChwb3NfcmFuZ2UsIG1heC5hcHBseShudWxsLCBvYmoucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcblxuICAgICAgICAgICAgY29uc3QgdiA9IGNhcnRlc2lhbjJhdXRvKHRoaXMudik7XG4gICAgICAgICAgICB2YXIgdl9yYW5nZSA9IG1heCh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVgsIG1hZyh0aGlzLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICB2X3JhbmdlID0gbWF4KHZfcmFuZ2UsIG1hZyhvYmoudikgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xib3ggPSBuZXcgQ29udHJvbEJveCh0aGlzLnRhZywgdGhpcy5nZXRfY29udHJvbGxlcnMoKSwgeCwgeSk7XG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5jb250cm9sYm94ZXMucHVzaCh0aGlzLmNvbnRyb2xib3gpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKSB7XG4gICAgICAgIHRoaXMubV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJNYXNzIG1cIiwgdGhpcy5jb25maWcuTUFTU19NSU4sIHRoaXMuY29uZmlnLk1BU1NfTUFYLCBtLCB0aGlzLmNvbnRyb2xfbSk7XG4gICAgICAgIHRoaXMucG9zX3hfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geFwiLCAtcG9zX3JhbmdlLCBwb3NfcmFuZ2UsIHRoaXMucG9zWzBdLCB0aGlzLmNvbnRyb2xfcG9zKTtcbiAgICAgICAgdGhpcy5wb3NfeV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB5XCIsIC1wb3NfcmFuZ2UsIHBvc19yYW5nZSwgdGhpcy5wb3NbMV0sIHRoaXMuY29udHJvbF9wb3MpO1xuICAgICAgICB0aGlzLnZfcmhvX2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM+BXCIsIDAsIHZfcmFuZ2UsIHZbMF0sIHRoaXMuY29udHJvbF92KTtcbiAgICAgICAgdGhpcy52X3BoaV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDPhlwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsxXSksIHRoaXMuY29udHJvbF92KTtcbiAgICB9XG5cbiAgICBnZXRfY29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3hfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9yaG9fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9waGlfY29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfcl9mcm9tX20obSkge1xuICAgICAgICByZXR1cm4gcG93KG0sIDEgLyAyKVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfbV9mcm9tX3Iocikge1xuICAgICAgICByZXR1cm4gc3F1YXJlKHIpXG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7J3RhZyc6IHRoaXMudGFnLCAndic6IHRoaXMudiwgJ3Bvcyc6IHRoaXMucG9zfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuL2NpcmNsZScpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHNwaGVyaWNhbDJjYXJ0ZXNpYW59ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge2N1YmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5cbmNsYXNzIFNwaGVyZSBleHRlbmRzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogU3BoZXJpY2FsIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3BoZXJpY2FsX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBnZXRfcigpIHtcbiAgICAgICAgcmV0dXJuIFNwaGVyZS5nZXRfcl9mcm9tX20odGhpcy5tKTtcbiAgICB9XG5cbiAgICBjb250cm9sX3BvcyhlKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc194X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc195X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHogPSB0aGlzLnBvc196X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHksIHpdO1xuICAgIH1cblxuICAgIGNvbnRyb2xfdihlKSB7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52X3BoaV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgdGhldGEgPSBkZWcycmFkKHRoaXMudl90aGV0YV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52X3Job19jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJobywgcGhpLCB0aGV0YSk7XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKSB7XG4gICAgICAgIHN1cGVyLnNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSk7XG4gICAgICAgIHRoaXMucG9zX3pfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24gelwiLCAtcG9zX3JhbmdlLCBwb3NfcmFuZ2UsIHRoaXMucG9zWzJdLCB0aGlzLmNvbnRyb2xfcG9zKTtcbiAgICAgICAgdGhpcy52X3RoZXRhX2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM64XCIsIC0xODAsIDE4MCwgcmFkMmRlZyh2WzJdKSwgdGhpcy5jb250cm9sX3YpO1xuICAgIH1cblxuICAgIGdldF9jb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NfeF9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NfeV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3Nfel9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3Job19jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3BoaV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3RoZXRhX2NvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0X3JfZnJvbV9tKG0pIHtcbiAgICAgICAgcmV0dXJuIHBvdyhtLCAxIC8gMyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldF9tX2Zyb21fcihyKSB7XG4gICAgICAgIHJldHVybiBjdWJlKHIpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGhlcmU7IiwiY29uc3QgSW52aXNpYmxlRXJyb3IgPSByZXF1aXJlKCcuL2Vycm9yL2ludmlzaWJsZScpO1xuY29uc3Qge21hZywgZG90fSA9IHJlcXVpcmUoJy4vbWF0cml4Jyk7XG5cbmNvbnN0IFV0aWwgPSB7XG4gICAgc3F1YXJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHg7XG4gICAgfSxcblxuICAgIGN1YmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeCAqIHg7XG4gICAgfSxcblxuICAgIHBvbGFyMmNhcnRlc2lhbjogKHJobywgcGhpKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4ocGhpKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4ycG9sYXI6ICh4LCB5KSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYWcoW3gsIHldKSxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeSwgeClcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgc3BoZXJpY2FsMmNhcnRlc2lhbjogKHJobywgcGhpLCB0aGV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyh0aGV0YSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnNwaGVyaWNhbDogKHgsIHksIHopID0+IHtcbiAgICAgICAgY29uc3QgcmhvID0gbWFnKFt4LCB5LCB6XSk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8sXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpLFxuICAgICAgICAgICAgcmhvICE9IDAgPyBNYXRoLmFjb3MoeiAvIHJobykgOiAwXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJhdXRvOiAodmVjdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiB2ZWN0b3IubGVuZ3RoID09IDJcbiAgICAgICAgICAgID8gVXRpbC5jYXJ0ZXNpYW4ycG9sYXIodmVjdG9yWzBdLCB2ZWN0b3JbMV0pXG4gICAgICAgICAgICA6IFV0aWwuY2FydGVzaWFuMnNwaGVyaWNhbCh2ZWN0b3JbMF0sIHZlY3RvclsxXSwgdmVjdG9yWzJdKTtcbiAgICB9LFxuXG4gICAgcmFkMmRlZzogKHJhZCkgPT4ge1xuICAgICAgICByZXR1cm4gcmFkIC8gTWF0aC5QSSAqIDE4MDtcbiAgICB9LFxuXG4gICAgZGVnMnJhZDogKGRlZykgPT4ge1xuICAgICAgICByZXR1cm4gZGVnIC8gMTgwICogTWF0aC5QSTtcbiAgICB9LFxuXG4gICAgZ2V0X2Rpc3RhbmNlOiAoeDAsIHkwLCB4MSwgeTEpID0+IHtcbiAgICAgICAgcmV0dXJuIG1hZyhbeDEgLSB4MCwgeTEgLSB5MF0pO1xuICAgIH0sXG5cbiAgICByb3RhdGU6ICh2ZWN0b3IsIG1hdHJpeCkgPT4ge1xuICAgICAgICByZXR1cm4gZG90KFt2ZWN0b3JdLCBtYXRyaXgpWzBdO1xuICAgIH0sXG5cbiAgICBub3c6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICB9LFxuXG4gICAgcmFuZG9tOiAobWluLCBtYXggPSBudWxsKSA9PiB7XG4gICAgICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4ID0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuICAgIH0sXG5cbiAgICByYW5kX2NvbG9yOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiAnIycgKyBNYXRoLmZsb29yKDB4MTAwMDAwMCArIE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XG4gICAgfSxcblxuICAgIGdldF9yb3RhdGlvbl9tYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIC1zaW5dLFxuICAgICAgICAgICAgW3NpbiwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRfcm90YXRpb25feF9tYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFsxLCAwLCAwXSxcbiAgICAgICAgICAgIFswLCBjb3MsIC1zaW5dLFxuICAgICAgICAgICAgWzAsIHNpbiwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRfcm90YXRpb25feV9tYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIDAsIHNpbl0sXG4gICAgICAgICAgICBbMCwgMSwgMF0sXG4gICAgICAgICAgICBbLXNpbiwgMCwgY29zXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBnZXRfcm90YXRpb25fel9tYXRyaXg6ICh4LCBkaXIgPSAxKSA9PiB7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKHggKiBkaXIpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyh4ICogZGlyKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFtjb3MsIC1zaW4sIDBdLFxuICAgICAgICAgICAgW3NpbiwgY29zLCAwXSxcbiAgICAgICAgICAgIFswLCAwLCAxXVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBza2lwX2ludmlzaWJsZV9lcnJvcjogZnVuYyA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuYygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgSW52aXNpYmxlRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWw7Il19

//# sourceMappingURL=gravity_simulator.js.map
