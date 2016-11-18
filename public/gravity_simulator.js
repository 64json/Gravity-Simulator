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
            var obj = new Circle(this.config, m, pos, v, color, tag, this);
            if (controlbox) obj.show_controlbox(x, y);
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
            if (controlbox) obj.show_controlbox(x, y);
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
                    obj.show_controlbox(x, y);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL3ByZXNldC5qcyIsImpzL3NpbXVsYXRvci9jYW1lcmEvMmQuanMiLCJqcy9zaW11bGF0b3IvY2FtZXJhLzNkLmpzIiwianMvc2ltdWxhdG9yL2NvbnRyb2wvY29udHJvbF9ib3guanMiLCJqcy9zaW11bGF0b3IvY29udHJvbC9jb250cm9sbGVyLmpzIiwianMvc2ltdWxhdG9yL2VuZ2luZS8yZC5qcyIsImpzL3NpbXVsYXRvci9lbmdpbmUvM2QuanMiLCJqcy9zaW11bGF0b3IvZXJyb3IvaW52aXNpYmxlLmpzIiwianMvc2ltdWxhdG9yL2luZGV4LmpzIiwianMvc2ltdWxhdG9yL21hdHJpeC5qcyIsImpzL3NpbXVsYXRvci9vYmplY3QvY2lyY2xlLmpzIiwianMvc2ltdWxhdG9yL29iamVjdC9zcGhlcmUuanMiLCJqcy9zaW11bGF0b3IvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTSxZQUFZLFFBQVEsYUFBUixDQUFsQjs7QUFFQSxJQUFNLFlBQVksSUFBSSxTQUFKLENBQWMsTUFBZCxDQUFsQjtBQUNBLFVBQVUsT0FBVjs7QUFFQSxJQUFJLFVBQVUsSUFBZDtBQUNBLElBQUksV0FBSjtBQUFBLElBQVEsV0FBUjs7QUFFQSxFQUFFLE1BQUYsRUFBVSxFQUFWLENBQWEsV0FBYixFQUEwQix5QkFBMUIsRUFBcUQsVUFBVSxDQUFWLEVBQWE7QUFDOUQsU0FBSyxFQUFFLEtBQVA7QUFDQSxTQUFLLEVBQUUsS0FBUDtBQUNBLGNBQVUsRUFBRSxJQUFGLEVBQVEsTUFBUixDQUFlLGNBQWYsQ0FBVjtBQUNBLFlBQVEsU0FBUixDQUFrQix1QkFBbEIsRUFBMkMsWUFBM0MsQ0FBd0QsT0FBeEQ7QUFDQSxXQUFPLEtBQVA7QUFDSCxDQU5EOztBQVFBLEVBQUUsTUFBRixF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LE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLENBQUMsR0FBVixDQURHLEVBRUgsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FGRyxFQUdILENBQUMsR0FBRCxFQUFNLENBQU4sRUFBUyxHQUFULENBSEcsQ0FBUDtBQUtILEtBekdROztBQTJHVCwyQkFBdUIsK0JBQUMsQ0FBRCxFQUFnQjtBQUFBLFlBQVosR0FBWSx1RUFBTixDQUFNOztBQUNuQyxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxZQUFNLE1BQU0sS0FBSyxHQUFMLENBQVMsSUFBSSxHQUFiLENBQVo7QUFDQSxlQUFPLENBQ0gsQ0FBQyxHQUFELEVBQU0sQ0FBQyxHQUFQLEVBQVksQ0FBWixDQURHLEVBRUgsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLENBQVgsQ0FGRyxFQUdILENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSEcsQ0FBUDtBQUtIO0FBbkhRLENBQWI7O0FBc0hBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBwcmVzZXQgPSByZXF1aXJlKCcuL3ByZXNldCcpO1xuY29uc3QgU2ltdWxhdG9yID0gcmVxdWlyZSgnLi9zaW11bGF0b3InKTtcblxuY29uc3Qgc2ltdWxhdG9yID0gbmV3IFNpbXVsYXRvcihwcmVzZXQpO1xuc2ltdWxhdG9yLmFuaW1hdGUoKTtcblxubGV0ICRtb3ZpbmcgPSBudWxsO1xubGV0IHB4LCBweTtcblxuJCgnYm9keScpLm9uKCdtb3VzZWRvd24nLCAnLmNvbnRyb2wtYm94IC50aXRsZS1iYXInLCBmdW5jdGlvbiAoZSkge1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG4gICAgJG1vdmluZyA9ICQodGhpcykucGFyZW50KCcuY29udHJvbC1ib3gnKTtcbiAgICAkbW92aW5nLm5leHRVbnRpbCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuaW5zZXJ0QmVmb3JlKCRtb3ZpbmcpO1xuICAgIHJldHVybiBmYWxzZTtcbn0pO1xuXG4kKCdib2R5JykubW91c2Vtb3ZlKGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKCEkbW92aW5nKSByZXR1cm47XG4gICAgY29uc3QgeCA9IGUucGFnZVg7XG4gICAgY29uc3QgeSA9IGUucGFnZVk7XG4gICAgJG1vdmluZy5jc3MoJ2xlZnQnLCBwYXJzZUludCgkbW92aW5nLmNzcygnbGVmdCcpKSArICh4IC0gcHgpICsgJ3B4Jyk7XG4gICAgJG1vdmluZy5jc3MoJ3RvcCcsIHBhcnNlSW50KCRtb3ZpbmcuY3NzKCd0b3AnKSkgKyAoeSAtIHB5KSArICdweCcpO1xuICAgIHB4ID0gZS5wYWdlWDtcbiAgICBweSA9IGUucGFnZVk7XG59KTtcblxuJCgnYm9keScpLm1vdXNldXAoZnVuY3Rpb24gKGUpIHtcbiAgICAkbW92aW5nID0gbnVsbDtcbn0pOyIsImNvbnN0IHtleHRlbmR9ID0gJDtcblxuXG5mdW5jdGlvbiBFTVBUWV8yRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBjLCB7XG4gICAgICAgICdUSVRMRSc6ICdHcmF2aXR5IFNpbXVsYXRvcicsXG4gICAgICAgICdCQUNLR1JPVU5EJzogXCJ3aGl0ZVwiLFxuICAgICAgICAnRElNRU5TSU9OJzogMixcbiAgICAgICAgJ01BWF9QQVRIUyc6IDEwMDAsXG4gICAgICAgICdDQU1FUkFfQ09PUkRfU1RFUCc6IDUsXG4gICAgICAgICdDQU1FUkFfQU5HTEVfU1RFUCc6IDEsXG4gICAgICAgICdDQU1FUkFfQUNDRUxFUkFUSU9OJzogMS4xLFxuICAgICAgICAnRyc6IDAuMSxcbiAgICAgICAgJ01BU1NfTUlOJzogMSxcbiAgICAgICAgJ01BU1NfTUFYJzogNGU0LFxuICAgICAgICAnVkVMT0NJVFlfTUFYJzogMTBcbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBFTVBUWV8zRChjKSB7XG4gICAgcmV0dXJuIGV4dGVuZCh0cnVlLCBFTVBUWV8yRChjKSwge1xuICAgICAgICAnRElNRU5TSU9OJzogMyxcbiAgICAgICAgJ0cnOiAwLjAwMSxcbiAgICAgICAgJ01BU1NfTUlOJzogMSxcbiAgICAgICAgJ01BU1NfTUFYJzogOGU2LFxuICAgICAgICAnVkVMT0NJVFlfTUFYJzogMTBcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFTVBUWV8zRDtcbiIsImNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBub3csIGdldF9yb3RhdGlvbl9tYXRyaXh9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5jbGFzcyBDYW1lcmEyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBlbmdpbmUpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMueiA9IDEwMDtcbiAgICAgICAgdGhpcy5waGkgPSAwO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICAgICAgdGhpcy5sYXN0X3RpbWUgPSAwO1xuICAgICAgICB0aGlzLmxhc3Rfa2V5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIHRoaXMuY2VudGVyID0gW2NvbmZpZy5XIC8gMiwgY29uZmlnLkggLyAyXTtcbiAgICB9XG5cbiAgICBnZXRfY29vcmRfc3RlcChrZXkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudF90aW1lID0gbm93KCk7XG4gICAgICAgIGlmIChrZXkgPT0gdGhpcy5sYXN0X2tleSAmJiBjdXJyZW50X3RpbWUgLSB0aGlzLmxhc3RfdGltZSA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29tYm8gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdF90aW1lID0gY3VycmVudF90aW1lO1xuICAgICAgICB0aGlzLmxhc3Rfa2V5ID0ga2V5O1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuQ0FNRVJBX0NPT1JEX1NURVAgKiBwb3codGhpcy5jb25maWcuQ0FNRVJBX0FDQ0VMRVJBVElPTiwgdGhpcy5jb21ibyk7XG4gICAgfVxuXG4gICAgdXAoa2V5KSB7XG4gICAgICAgIHRoaXMueSAtPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGRvd24oa2V5KSB7XG4gICAgICAgIHRoaXMueSArPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIGxlZnQoa2V5KSB7XG4gICAgICAgIHRoaXMueCAtPSB0aGlzLmdldF9jb29yZF9zdGVwKGtleSk7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJpZ2h0KGtleSkge1xuICAgICAgICB0aGlzLnggKz0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICB6b29tX2luKGtleSkge1xuICAgICAgICB0aGlzLnogLT0gdGhpcy5nZXRfY29vcmRfc3RlcChrZXkpO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICB6b29tX291dChrZXkpIHtcbiAgICAgICAgdGhpcy56ICs9IHRoaXMuZ2V0X2Nvb3JkX3N0ZXAoa2V5KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgcm90YXRlX2xlZnQoa2V5KSB7XG4gICAgICAgIHRoaXMucGhpIC09IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVfcmlnaHQoa2V5KSB7XG4gICAgICAgIHRoaXMucGhpICs9IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByZWZyZXNoKCkge1xuICAgIH1cblxuICAgIGdldF96b29tKHogPSAwKSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMueiAtIHo7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgSW52aXNpYmxlRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMTAwIC8gZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgYWRqdXN0X2Nvb3JkcyhjKSB7XG4gICAgICAgIGNvbnN0IFIgPSBnZXRfcm90YXRpb25fbWF0cml4KGRlZzJyYWQodGhpcy5waGkpKTtcbiAgICAgICAgYyA9IHJvdGF0ZShjLCBSKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oKTtcbiAgICAgICAgY29uc3QgY29vcmRzID0gYWRkKHRoaXMuY2VudGVyLCBtdWwoc3ViKGMsIFt0aGlzLngsIHRoaXMueV0pLCB6b29tKSk7XG4gICAgICAgIHJldHVybiB7Y29vcmRzfTtcbiAgICB9XG5cbiAgICBhZGp1c3RfcmFkaXVzKGNvb3JkcywgcmFkaXVzKSB7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKCk7XG4gICAgICAgIHJldHVybiByYWRpdXMgKiB6b29tO1xuICAgIH1cblxuICAgIGFjdHVhbF9wb2ludCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IFJfID0gZ2V0X3JvdGF0aW9uX21hdHJpeChkZWcycmFkKHRoaXMucGhpKSwgLTEpO1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRfem9vbSgpO1xuICAgICAgICByZXR1cm4gcm90YXRlKGFkZChkaXYoc3ViKFt4LCB5XSwgdGhpcy5jZW50ZXIpLCB6b29tKSwgW3RoaXMueCwgdGhpcy55XSksIFJfKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhMkQ7IiwiY29uc3QgQ2FtZXJhMkQgPSByZXF1aXJlKCcuLzJkJyk7XG5jb25zdCB7ZGVnMnJhZCwgcm90YXRlLCBnZXRfcm90YXRpb25feF9tYXRyaXgsIGdldF9yb3RhdGlvbl95X21hdHJpeH0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5cblxuY2xhc3MgQ2FtZXJhM0QgZXh0ZW5kcyBDYW1lcmEyRCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBlbmdpbmUpIHtcbiAgICAgICAgc3VwZXIoY29uZmlnLCBlbmdpbmUpO1xuICAgICAgICB0aGlzLnRoZXRhID0gMDtcbiAgICB9XG5cbiAgICByb3RhdGVfdXAoa2V5KSB7XG4gICAgICAgIHRoaXMudGhldGEgLT0gdGhpcy5jb25maWcuQ0FNRVJBX0FOR0xFX1NURVA7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJvdGF0ZV9kb3duKGtleSkge1xuICAgICAgICB0aGlzLnRoZXRhICs9IHRoaXMuY29uZmlnLkNBTUVSQV9BTkdMRV9TVEVQO1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByb3RhdGVkX2Nvb3JkcyhjKSB7XG4gICAgICAgIGNvbnN0IFJ4ID0gZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGRlZzJyYWQodGhpcy50aGV0YSkpO1xuICAgICAgICBjb25zdCBSeSA9IGdldF9yb3RhdGlvbl95X21hdHJpeChkZWcycmFkKHRoaXMucGhpKSk7XG4gICAgICAgIHJldHVybiByb3RhdGUocm90YXRlKGMsIFJ4KSwgUnkpO1xuICAgIH1cblxuICAgIGFkanVzdF9jb29yZHMoYykge1xuICAgICAgICBjID0gdGhpcy5yb3RhdGVkX2Nvb3JkcyhjKTtcbiAgICAgICAgY29uc3QgeiA9IGMucG9wKCk7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldF96b29tKHopO1xuICAgICAgICBjb25zdCBjb29yZHMgPSBhZGQodGhpcy5jZW50ZXIsIG11bChzdWIoYywgW3RoaXMueCwgdGhpcy55XSksIHpvb20pKTtcbiAgICAgICAgcmV0dXJuIHtjb29yZHMsIHp9O1xuICAgIH1cblxuICAgIGFkanVzdF9yYWRpdXMoYywgcmFkaXVzKSB7XG4gICAgICAgIGMgPSB0aGlzLnJvdGF0ZWRfY29vcmRzKGMpO1xuICAgICAgICBjb25zdCB6ID0gYy5wb3AoKTtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuZ2V0X3pvb20oeik7XG4gICAgICAgIHJldHVybiByYWRpdXMgKiB6b29tO1xuICAgIH1cblxuICAgIGFjdHVhbF9wb2ludCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IFJ4XyA9IGdldF9yb3RhdGlvbl94X21hdHJpeChkZWcycmFkKHRoaXMudGhldGEpLCAtMSk7XG4gICAgICAgIGNvbnN0IFJ5XyA9IGdldF9yb3RhdGlvbl95X21hdHJpeChkZWcycmFkKHRoaXMucGhpKSwgLTEpO1xuICAgICAgICBjb25zdCBjID0gYWRkKHN1YihbeCwgeV0sIHRoaXMuY2VudGVyKSwgW3RoaXMueCwgdGhpcy55XSkuY29uY2F0KDApO1xuICAgICAgICByZXR1cm4gcm90YXRlKHJvdGF0ZShjLCBSeV8pLCBSeF8pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmEzRDsiLCJjbGFzcyBDb250cm9sQm94IHtcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZSwgY29udHJvbGxlcnMsIHgsIHkpIHtcbiAgICAgICAgY29uc3QgJHRlbXBsYXRlQ29udHJvbEJveCA9ICQoJy5jb250cm9sLWJveC50ZW1wbGF0ZScpO1xuICAgICAgICBjb25zdCAkY29udHJvbEJveCA9ICR0ZW1wbGF0ZUNvbnRyb2xCb3guY2xvbmUoKTtcbiAgICAgICAgJGNvbnRyb2xCb3gucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy50aXRsZScpLnRleHQodGl0bGUpO1xuICAgICAgICBjb25zdCAkaW5wdXRDb250YWluZXIgPSAkY29udHJvbEJveC5maW5kKCcuaW5wdXQtY29udGFpbmVyJyk7XG4gICAgICAgIGZvciAoY29uc3QgY29udHJvbGxlciBvZiBjb250cm9sbGVycykge1xuICAgICAgICAgICAgJGlucHV0Q29udGFpbmVyLmFwcGVuZChjb250cm9sbGVyLiRpbnB1dFdyYXBwZXIpO1xuICAgICAgICB9XG4gICAgICAgICRjb250cm9sQm94LmZpbmQoJy5jbG9zZScpLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgICRjb250cm9sQm94LnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGNvbnRyb2xCb3guaW5zZXJ0QmVmb3JlKCR0ZW1wbGF0ZUNvbnRyb2xCb3gpO1xuICAgICAgICAkY29udHJvbEJveC5jc3MoJ2xlZnQnLCB4ICsgJ3B4Jyk7XG4gICAgICAgICRjb250cm9sQm94LmNzcygndG9wJywgeSArICdweCcpO1xuXG4gICAgICAgIHRoaXMuJGNvbnRyb2xCb3ggPSAkY29udHJvbEJveDtcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy4kY29udHJvbEJveC5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBpc19vcGVuZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRjb250cm9sQm94WzBdLnBhcmVudE5vZGU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xCb3g7IiwiY2xhc3MgQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCBuYW1lLCBtaW4sIG1heCwgdmFsdWUsIGZ1bmMpIHtcbiAgICAgICAgY29uc3QgJGlucHV0V3JhcHBlciA9IHRoaXMuJGlucHV0V3JhcHBlciA9ICQoJy5jb250cm9sLWJveC50ZW1wbGF0ZSAuaW5wdXQtd3JhcHBlci50ZW1wbGF0ZScpLmNsb25lKCk7XG4gICAgICAgICRpbnB1dFdyYXBwZXIucmVtb3ZlQ2xhc3MoJ3RlbXBsYXRlJyk7XG4gICAgICAgICRpbnB1dFdyYXBwZXIuZmluZCgnLm5hbWUnKS50ZXh0KG5hbWUpO1xuICAgICAgICBjb25zdCAkaW5wdXQgPSB0aGlzLiRpbnB1dCA9ICRpbnB1dFdyYXBwZXIuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgJGlucHV0LmF0dHIoJ21pbicsIG1pbik7XG4gICAgICAgICRpbnB1dC5hdHRyKCdtYXgnLCBtYXgpO1xuICAgICAgICAkaW5wdXQuYXR0cigndmFsdWUnLCB2YWx1ZSk7XG4gICAgICAgICRpbnB1dC5hdHRyKCdzdGVwJywgMC4wMSk7XG4gICAgICAgIGNvbnN0ICR2YWx1ZSA9ICRpbnB1dFdyYXBwZXIuZmluZCgnLnZhbHVlJyk7XG4gICAgICAgICR2YWx1ZS50ZXh0KHRoaXMuZ2V0KCkpO1xuICAgICAgICAkaW5wdXQub24oJ2lucHV0JywgZSA9PiB7XG4gICAgICAgICAgICAkdmFsdWUudGV4dCh0aGlzLmdldCgpKTtcbiAgICAgICAgICAgIGZ1bmMuY2FsbChvYmplY3QsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuJGlucHV0LnZhbCgpKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuLi9vYmplY3QvY2lyY2xlJyk7XG5jb25zdCBDYW1lcmEyRCA9IHJlcXVpcmUoJy4uL2NhbWVyYS8yZCcpO1xuY29uc3QgSW52aXNpYmxlRXJyb3IgPSByZXF1aXJlKCcuLi9lcnJvci9pbnZpc2libGUnKTtcbmNvbnN0IHt2ZWN0b3JfbWFnbml0dWRlLCByb3RhdGUsIG5vdywgcmFuZG9tLCBwb2xhcjJjYXJ0ZXNpYW4sIHJhbmRfY29sb3IsIGdldF9yb3RhdGlvbl9tYXRyaXgsIGNhcnRlc2lhbjJhdXRvfSA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbmNvbnN0IHt6ZXJvcywgbWFnLCBhZGQsIHN1YiwgbXVsLCBkaXYsIGRvdH0gPSByZXF1aXJlKCcuLi9tYXRyaXgnKTtcbmNvbnN0IHttaW4sIG1heH0gPSBNYXRoO1xuXG5cbmNsYXNzIFBhdGgge1xuICAgIGNvbnN0cnVjdG9yKG9iaikge1xuICAgICAgICB0aGlzLnByZXZfcG9zID0gb2JqLnByZXZfcG9zLnNsaWNlKCk7XG4gICAgICAgIHRoaXMucG9zID0gb2JqLnBvcy5zbGljZSgpO1xuICAgIH1cbn1cblxuY2xhc3MgRW5naW5lMkQge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZywgY3R4KSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcbiAgICAgICAgdGhpcy5vYmpzID0gW107XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udHJvbGJveGVzID0gW107XG4gICAgICAgIHRoaXMucGF0aHMgPSBbXTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhMkQoY29uZmlnLCB0aGlzKTtcbiAgICAgICAgdGhpcy5mcHNfbGFzdF90aW1lID0gbm93KCk7XG4gICAgICAgIHRoaXMuZnBzX2NvdW50ID0gMDtcbiAgICB9XG5cbiAgICBkZXN0cm95X2NvbnRyb2xib3hlcygpIHtcbiAgICAgICAgZm9yIChjb25zdCBjb250cm9sYm94IG9mIHRoaXMuY29udHJvbGJveGVzKSB7XG4gICAgICAgICAgICBjb250cm9sYm94LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250cm9sYm94ZXMgPSBbXVxuICAgIH1cblxuICAgIGFuaW1hdGUoKSB7XG4gICAgICAgIHRoaXMucHJpbnRfZnBzKCk7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGluZykge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVfYWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWRyYXdfYWxsKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlKCk7XG4gICAgICAgIH0sIDEwKTtcbiAgICB9XG5cbiAgICBvYmplY3RfY29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCByID0gdGhpcy5jYW1lcmEuYWRqdXN0X3JhZGl1cyhvYmoucG9zLCBvYmouZ2V0X3IoKSk7XG4gICAgICAgIGNvbnN0IHtjb29yZHMsIHp9ID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIGNvb3Jkcy5jb25jYXQocikuY29uY2F0KHopO1xuICAgIH1cblxuICAgIGRpcmVjdGlvbl9jb29yZHMob2JqLCBmYWN0b3IgPSA1MCkge1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMX0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmRzKG9iai5wb3MpO1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMiwgen0gPSB0aGlzLmNhbWVyYS5hZGp1c3RfY29vcmRzKGFkZChvYmoucG9zLCBtdWwob2JqLnYsIGZhY3RvcikpKTtcbiAgICAgICAgcmV0dXJuIGMxLmNvbmNhdChjMikuY29uY2F0KHopO1xuICAgIH1cblxuICAgIHBhdGhfY29vcmRzKG9iaikge1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMSwgejF9ID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucHJldl9wb3MpO1xuICAgICAgICBjb25zdCB7Y29vcmRzOiBjMiwgejJ9ID0gdGhpcy5jYW1lcmEuYWRqdXN0X2Nvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgcmV0dXJuIGMxLmNvbmNhdChjMiwgbWF4KHoxLCB6MikpO1xuICAgIH1cblxuICAgIGRyYXdfb2JqZWN0KGMsIGNvbG9yID0gbnVsbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBDaXJjbGUpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5vYmplY3RfY29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5hcmMoY1swXSwgY1sxXSwgY1syXSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yIHx8IGMuY29sb3I7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHJhd19kaXJlY3Rpb24oYykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBDaXJjbGUpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5kaXJlY3Rpb25fY29vcmRzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oY1swXSwgY1sxXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oY1syXSwgY1szXSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgSW52aXNpYmxlRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXdfcGF0aChjKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoYyBpbnN0YW5jZW9mIFBhdGgpIHtcbiAgICAgICAgICAgICAgICBjID0gdGhpcy5wYXRoX2Nvb3JkcyhjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGNbMF0sIGNbMV0pO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGNbMl0sIGNbM10pO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnI2RkZGRkZCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVfcGF0aChvYmopIHtcbiAgICAgICAgaWYgKG1hZyhzdWIob2JqLnBvcywgb2JqLnByZXZfcG9zKSkgPiA1KSB7XG4gICAgICAgICAgICB0aGlzLnBhdGhzLnB1c2gobmV3IFBhdGgob2JqKSk7XG4gICAgICAgICAgICBvYmoucHJldl9wb3MgPSBvYmoucG9zLnNsaWNlKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wYXRocy5sZW5ndGggPiB0aGlzLmNvbmZpZy5NQVhfUEFUSFMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhzID0gdGhpcy5wYXRocy5zbGljZSgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZV9vYmplY3QoeCwgeSwgbSA9IG51bGwsIHYgPSBudWxsLCBjb2xvciA9IG51bGwsIGNvbnRyb2xib3ggPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuY2FtZXJhLmFjdHVhbF9wb2ludCh4LCB5KTtcbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgICBsZXQgbWF4X3IgPSBDaXJjbGUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUFYKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgICAgIG1heF9yID0gbWluKG1heF9yLCAobWFnKHN1YihvYmoucG9zLCBwb3MpKSAtIG9iai5nZXRfcigpKSAvIDEuNSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG0gPSBDaXJjbGUuZ2V0X21fZnJvbV9yKHJhbmRvbShDaXJjbGUuZ2V0X3JfZnJvbV9tKHRoaXMuY29uZmlnLk1BU1NfTUlOKSwgbWF4X3IpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICAgIHYgPSBwb2xhcjJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbG9yKSB7XG4gICAgICAgICAgICBjb2xvciA9IHJhbmRfY29sb3IoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0YWcgPSBgY2lyY2xlJHt0aGlzLm9ianMubGVuZ3RofWA7XG4gICAgICAgIGNvbnN0IG9iaiA9IG5ldyBDaXJjbGUodGhpcy5jb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgdGhpcyk7XG4gICAgICAgIGlmIChjb250cm9sYm94KSBvYmouc2hvd19jb250cm9sYm94KHgsIHkpO1xuICAgICAgICB0aGlzLm9ianMucHVzaChvYmopO1xuICAgIH1cblxuICAgIGdldF9yb3RhdGlvbl9tYXRyaXgoYW5nbGVzLCBkaXIgPSAxKSB7XG4gICAgICAgIHJldHVybiBnZXRfcm90YXRpb25fbWF0cml4KGFuZ2xlc1swXSwgZGlyKTtcbiAgICB9XG5cbiAgICBlbGFzdGljX2NvbGxpc2lvbigpIHtcbiAgICAgICAgY29uc3QgZGltZW5zaW9uID0gdGhpcy5jb25maWcuRElNRU5TSU9OO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub2Jqcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbzEgPSB0aGlzLm9ianNbaV07XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCB0aGlzLm9ianMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvMiA9IHRoaXMub2Jqc1tqXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xsaXNpb24gPSBzdWIobzIucG9zLCBvMS5wb3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlcyA9IGNhcnRlc2lhbjJhdXRvKGNvbGxpc2lvbik7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IGFuZ2xlcy5zaGlmdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGQgPCBvMS5nZXRfcigpICsgbzIuZ2V0X3IoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBSID0gdGhpcy5nZXRfcm90YXRpb25fbWF0cml4KGFuZ2xlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFJfID0gdGhpcy5nZXRfcm90YXRpb25fbWF0cml4KGFuZ2xlcywgLTEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfdGVtcCA9IFtyb3RhdGUobzEudiwgUiksIHJvdGF0ZShvMi52LCBSKV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZfZmluYWwgPSBbdl90ZW1wWzBdLnNsaWNlKCksIHZfdGVtcFsxXS5zbGljZSgpXTtcbiAgICAgICAgICAgICAgICAgICAgdl9maW5hbFswXVswXSA9ICgobzEubSAtIG8yLm0pICogdl90ZW1wWzBdWzBdICsgMiAqIG8yLm0gKiB2X3RlbXBbMV1bMF0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgdl9maW5hbFsxXVswXSA9ICgobzIubSAtIG8xLm0pICogdl90ZW1wWzFdWzBdICsgMiAqIG8xLm0gKiB2X3RlbXBbMF1bMF0pIC8gKG8xLm0gKyBvMi5tKTtcbiAgICAgICAgICAgICAgICAgICAgbzEudiA9IHJvdGF0ZSh2X2ZpbmFsWzBdLCBSXyk7XG4gICAgICAgICAgICAgICAgICAgIG8yLnYgPSByb3RhdGUodl9maW5hbFsxXSwgUl8pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc190ZW1wID0gW3plcm9zKGRpbWVuc2lvbiksIHJvdGF0ZShjb2xsaXNpb24sIFIpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RlbXBbMF1bMF0gKz0gdl9maW5hbFswXVswXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zX3RlbXBbMV1bMF0gKz0gdl9maW5hbFsxXVswXTtcbiAgICAgICAgICAgICAgICAgICAgbzEucG9zID0gYWRkKG8xLnBvcywgcm90YXRlKHBvc190ZW1wWzBdLCBSXykpO1xuICAgICAgICAgICAgICAgICAgICBvMi5wb3MgPSBhZGQobzEucG9zLCByb3RhdGUocG9zX3RlbXBbMV0sIFJfKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX2FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlX3ZlbG9jaXR5KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsYXN0aWNfY29sbGlzaW9uKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICBvYmouY2FsY3VsYXRlX3Bvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZV9wYXRoKG9iaik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWRyYXdfYWxsKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCk7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgdGhpcy5kcmF3X29iamVjdChvYmopO1xuICAgICAgICAgICAgdGhpcy5kcmF3X2RpcmVjdGlvbihvYmopO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0aGlzLnBhdGhzKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdfcGF0aChwYXRoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaW50X2ZwcygpIHtcbiAgICAgICAgdGhpcy5mcHNfY291bnQgKz0gMTtcbiAgICAgICAgY29uc3QgY3VycmVudF90aW1lID0gbm93KCk7XG4gICAgICAgIGNvbnN0IGZwc190aW1lX2RpZmYgPSBjdXJyZW50X3RpbWUgLSB0aGlzLmZwc19sYXN0X3RpbWVcbiAgICAgICAgaWYgKGZwc190aW1lX2RpZmYgPiAxKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHsodGhpcy5mcHNfY291bnQgLyBmcHNfdGltZV9kaWZmKSB8IDB9IGZwc2ApO1xuICAgICAgICAgICAgdGhpcy5mcHNfbGFzdF90aW1lID0gY3VycmVudF90aW1lO1xuICAgICAgICAgICAgdGhpcy5mcHNfY291bnQgPSAwO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTJEOyIsImNvbnN0IEVuZ2luZTJEID0gcmVxdWlyZSgnLi8yZCcpO1xuY29uc3QgQ2FtZXJhM0QgPSByZXF1aXJlKCcuLi9jYW1lcmEvM2QnKTtcbmNvbnN0IFNwaGVyZSA9IHJlcXVpcmUoJy4uL29iamVjdC9zcGhlcmUnKTtcbmNvbnN0IEludmlzaWJsZUVycm9yID0gcmVxdWlyZSgnLi4vZXJyb3IvaW52aXNpYmxlJyk7XG5jb25zdCB7dmVjdG9yX21hZ25pdHVkZSwgcmFuZG9tLCBnZXRfcm90YXRpb25feF9tYXRyaXgsIGdldF9yb3RhdGlvbl96X21hdHJpeCwgcmFuZF9jb2xvciwgc3BoZXJpY2FsMmNhcnRlc2lhbn0gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5jb25zdCB7emVyb3MsIG1hZywgYWRkLCBzdWIsIG11bCwgZGl2LCBkb3R9ID0gcmVxdWlyZSgnLi4vbWF0cml4Jyk7XG5jb25zdCB7bWluLCBtYXh9ID0gTWF0aDtcblxuXG5jbGFzcyBFbmdpbmUzRCBleHRlbmRzIEVuZ2luZTJEIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIGN0eCkge1xuICAgICAgICBzdXBlcihjb25maWcsIGN0eCk7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYTNEKGNvbmZpZywgdGhpcyk7XG4gICAgfVxuXG4gICAgZGlyZWN0aW9uX2Nvb3JkcyhvYmopIHtcbiAgICAgICAgbGV0IGMgPSB0aGlzLmNhbWVyYS5yb3RhdGVkX2Nvb3JkcyhvYmoucG9zKTtcbiAgICAgICAgbGV0IGZhY3RvciA9IG1pbig1MCwgKHRoaXMuY2FtZXJhLnogLSBjWzJdIC0gMSkgLyBvYmoudlsyXSk7XG4gICAgICAgIHJldHVybiBzdXBlci5kaXJlY3Rpb25fY29vcmRzKG9iaiwgZmFjdG9yKTtcbiAgICB9XG5cbiAgICBjcmVhdGVfb2JqZWN0KHgsIHksIG0gPSBudWxsLCB2ID0gbnVsbCwgY29sb3IgPSBudWxsLCBjb250cm9sYm94ID0gdHJ1ZSkge1xuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmNhbWVyYS5hY3R1YWxfcG9pbnQoeCwgeSk7XG4gICAgICAgIGlmICghbSkge1xuICAgICAgICAgICAgbGV0IG1heF9yID0gU3BoZXJlLmdldF9yX2Zyb21fbSh0aGlzLmNvbmZpZy5NQVNTX01BWCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB0aGlzLm9ianMpIHtcbiAgICAgICAgICAgICAgICBtYXhfciA9IG1pbihtYXhfciwgKG1hZyhzdWIob2JqLnBvcywgcG9zKSkgLSBvYmouZ2V0X3IoKSkgLyAxLjUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbSA9IFNwaGVyZS5nZXRfbV9mcm9tX3IocmFuZG9tKFNwaGVyZS5nZXRfcl9mcm9tX20odGhpcy5jb25maWcuTUFTU19NSU4pLCBtYXhfcikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdikge1xuICAgICAgICAgICAgdiA9IHNwaGVyaWNhbDJjYXJ0ZXNpYW4ocmFuZG9tKHRoaXMuY29uZmlnLlZFTE9DSVRZX01BWCAvIDIpLCByYW5kb20oLTE4MCwgMTgwKSwgcmFuZG9tKC0xODAsIDE4MCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29sb3IpIHtcbiAgICAgICAgICAgIGNvbG9yID0gcmFuZF9jb2xvcigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRhZyA9IGBzcGhlcmUke3RoaXMub2Jqcy5sZW5ndGh9YDtcbiAgICAgICAgY29uc3Qgb2JqID0gbmV3IFNwaGVyZSh0aGlzLmNvbmZpZywgbSwgcG9zLCB2LCBjb2xvciwgdGFnLCB0aGlzLCBjb250cm9sYm94KTtcbiAgICAgICAgaWYgKGNvbnRyb2xib3gpIG9iai5zaG93X2NvbnRyb2xib3goeCwgeSk7XG4gICAgICAgIHRoaXMub2Jqcy5wdXNoKG9iaik7XG4gICAgfVxuXG4gICAgZ2V0X3JvdGF0aW9uX21hdHJpeChhbmdsZXMsIGRpciA9IDEpIHtcbiAgICAgICAgcmV0dXJuIGRpciA9PSAxXG4gICAgICAgICAgICA/IGRvdChnZXRfcm90YXRpb25fel9tYXRyaXgoYW5nbGVzWzBdKSwgZ2V0X3JvdGF0aW9uX3hfbWF0cml4KGFuZ2xlc1sxXSkpXG4gICAgICAgICAgICA6IGRvdChnZXRfcm90YXRpb25feF9tYXRyaXgoYW5nbGVzWzFdLCAtMSksIGdldF9yb3RhdGlvbl96X21hdHJpeChhbmdsZXNbMF0sIC0xKSk7XG4gICAgfVxuXG4gICAgcmVkcmF3X2FsbCgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY29uZmlnLlcsIHRoaXMuY29uZmlnLkgpO1xuICAgICAgICBjb25zdCBvcmRlcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5vYmpzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IHRoaXMub2JqZWN0X2Nvb3JkcyhvYmopO1xuICAgICAgICAgICAgICAgIGNvbnN0IHogPSBjb29yZHMucG9wKCk7XG4gICAgICAgICAgICAgICAgb3JkZXJzLnB1c2goWydvYmplY3QnLCBjb29yZHMsIHosIG9iai5jb2xvcl0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMub2Jqcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB0aGlzLmRpcmVjdGlvbl9jb29yZHMob2JqKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsnZGlyZWN0aW9uJywgY29vcmRzLCB6XSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEludmlzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHRoaXMucGF0aHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0gdGhpcy5wYXRoX2Nvb3JkcyhwYXRoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6ID0gY29vcmRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIG9yZGVycy5wdXNoKFsncGF0aCcsIGNvb3Jkcywgel0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBJbnZpc2libGVFcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9yZGVycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVsyXSAtIGJbMl07XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IFt0eXBlLCBjb29yZHMsIHosIGNvbG9yXSBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd19vYmplY3QoY29vcmRzLCBjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGlvbic6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd19kaXJlY3Rpb24oY29vcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncGF0aCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd19wYXRoKGNvb3Jkcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTNEOyIsImNsYXNzIEludmlzaWJsZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2Upe1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW52aXNpYmxlRXJyb3I7IiwiY29uc3QgRW5naW5lMkQgPSByZXF1aXJlKCcuL2VuZ2luZS8yZCcpO1xuY29uc3QgRW5naW5lM0QgPSByZXF1aXJlKCcuL2VuZ2luZS8zZCcpO1xuY29uc3Qge2dldF9kaXN0YW5jZX0gPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuXG5sZXQgY29uZmlnID0gbnVsbDtcbmNvbnN0IGtleW1hcCA9IHtcbiAgICAzODogJ3VwJyxcbiAgICA0MDogJ2Rvd24nLFxuICAgIDM3OiAnbGVmdCcsXG4gICAgMzk6ICdyaWdodCcsXG4gICAgOTA6ICd6b29tX2luJywgLy8gelxuICAgIDg4OiAnem9vbV9vdXQnLCAvLyB4XG4gICAgODc6ICdyb3RhdGVfdXAnLCAvLyB3XG4gICAgODM6ICdyb3RhdGVfZG93bicsIC8vIHNcbiAgICA2NTogJ3JvdGF0ZV9sZWZ0JywgLy8gYVxuICAgIDY4OiAncm90YXRlX3JpZ2h0JyAvLyBkXG59O1xuXG5mdW5jdGlvbiBvbl9yZXNpemUoJGNhbnZhcykge1xuICAgIGNvbmZpZy5XID0gJGNhbnZhc1swXS53aWR0aCA9ICRjYW52YXMud2lkdGgoKTtcbiAgICBjb25maWcuSCA9ICRjYW52YXNbMF0uaGVpZ2h0ID0gJGNhbnZhcy5oZWlnaHQoKTtcblxufVxuXG5mdW5jdGlvbiBvbl9jbGljayhldmVudCwgZW5naW5lKSB7XG4gICAgY29uc3QgeCA9IGV2ZW50LnBhZ2VYO1xuICAgIGNvbnN0IHkgPSBldmVudC5wYWdlWTtcbiAgICBpZiAoIWVuZ2luZS5hbmltYXRpbmcpIHtcbiAgICAgICAgZm9yIChjb25zdCBvYmogb2YgZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIGNvbnN0IFtjeCwgY3ksIHJdID0gZW5naW5lLm9iamVjdF9jb29yZHMob2JqKTtcbiAgICAgICAgICAgIGlmIChnZXRfZGlzdGFuY2UoY3gsIGN5LCB4LCB5KSA8IHIpIHtcbiAgICAgICAgICAgICAgICBvYmouc2hvd19jb250cm9sYm94KHgsIHkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbmdpbmUuY3JlYXRlX29iamVjdCh4LCB5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uX2tleV9kb3duKGV2ZW50LCBlbmdpbmUpIHtcbiAgICBjb25zdCB7a2V5Q29kZX0gPSBldmVudDtcbiAgICBpZiAoa2V5Q29kZSA9PSAzMikgeyAvLyBzcGFjZSBiYXJcbiAgICAgICAgZW5naW5lLmRlc3Ryb3lfY29udHJvbGJveGVzKCk7XG4gICAgICAgIGVuZ2luZS5hbmltYXRpbmcgPSAhZW5naW5lLmFuaW1hdGluZztcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBgJHtjb25maWcuVElUTEV9ICgke2VuZ2luZS5hbmltYXRpbmcgPyBcIlNpbXVsYXRpbmdcIiA6IFwiUGF1c2VkXCJ9KWA7XG4gICAgfSBlbHNlIGlmIChrZXlDb2RlIGluIGtleW1hcCAmJiBrZXltYXBba2V5Q29kZV0gaW4gZW5naW5lLmNhbWVyYSkge1xuICAgICAgICBlbmdpbmUuY2FtZXJhW2tleW1hcFtrZXlDb2RlXV0oa2V5Q29kZSk7XG4gICAgfVxufVxuXG5jbGFzcyBTaW11bGF0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHByZXNldCkge1xuICAgICAgICBjb25maWcgPSBwcmVzZXQoe30pO1xuICAgICAgICBjb25zdCAkY2FudmFzID0gJCgnY2FudmFzJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9ICRjYW52YXNbMF0uZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgb25fcmVzaXplKCRjYW52YXMpO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyAoY29uZmlnLkRJTUVOU0lPTiA9PSAyID8gRW5naW5lMkQgOiBFbmdpbmUzRCkoY29uZmlnLCBjdHgpO1xuICAgICAgICAkY2FudmFzLnJlc2l6ZShlID0+IHtcbiAgICAgICAgICAgIG9uX3Jlc2l6ZSgkY2FudmFzKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRjYW52YXMuY2xpY2soZSA9PiB7XG4gICAgICAgICAgICBvbl9jbGljayhlLCB0aGlzLmVuZ2luZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCdib2R5Jykua2V5ZG93bihlID0+IHtcbiAgICAgICAgICAgIG9uX2tleV9kb3duKGUsIHRoaXMuZW5naW5lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUuYW5pbWF0ZSgpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW11bGF0b3I7IiwiZnVuY3Rpb24gaXRlcihhLCBmdW5jKSB7XG4gICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgY29uc3QgbSA9IG5ldyBBcnJheShhX3IpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYV9yOyBpKyspIHtcbiAgICAgICAgbVtpXSA9IGZ1bmMoaSk7XG4gICAgfVxuICAgIHJldHVybiBtO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB6ZXJvczogTiA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXkoTikuZmlsbCgwKTtcbiAgICB9LFxuXG4gICAgbWFnOiBhID0+IHtcbiAgICAgICAgY29uc3QgYV9yID0gYS5sZW5ndGg7XG4gICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfcjsgaSsrKSB7XG4gICAgICAgICAgICBzdW0gKz0gYVtpXSAqIGFbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChzdW0pO1xuICAgIH0sXG5cbiAgICBhZGQ6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gKyBiW2ldO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc3ViOiAoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gaXRlcihhLCBpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhW2ldIC0gYltpXTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG11bDogKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZXIoYSwgaSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYVtpXSAqIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkaXY6IChhLCBiKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVyKGEsIGkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFbaV0gLyBiO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZG90OiAoYSwgYikgPT4ge1xuICAgICAgICBjb25zdCBhX3IgPSBhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYV9jID0gYVswXS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJfYyA9IGJbMF0ubGVuZ3RoO1xuICAgICAgICBjb25zdCBtID0gbmV3IEFycmF5KGFfcik7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgYV9yOyByKyspIHtcbiAgICAgICAgICAgIG1bcl0gPSBuZXcgQXJyYXkoYl9jKTtcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgYl9jOyBjKyspIHtcbiAgICAgICAgICAgICAgICBtW3JdW2NdID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFfYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG1bcl1bY10gKz0gYVtyXVtpXSAqIGJbaV1bY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbn07IiwiY29uc3QgQ29udHJvbEJveCA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbF9ib3gnKTtcbmNvbnN0IENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sL2NvbnRyb2xsZXInKTtcbmNvbnN0IHt2ZWN0b3JfbWFnbml0dWRlLCByYWQyZGVnLCBkZWcycmFkLCBwb2xhcjJjYXJ0ZXNpYW4sIGNhcnRlc2lhbjJhdXRvLCBzcXVhcmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdiwgZG90fSA9IHJlcXVpcmUoJy4uL21hdHJpeCcpO1xuY29uc3Qge21heCwgcG93fSA9IE1hdGg7XG5cblxuY2xhc3MgQ2lyY2xlIHtcbiAgICAvKipcbiAgICAgKiBQb2xhciBjb29yZGluYXRlIHN5c3RlbVxuICAgICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BvbGFyX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIG0sIHBvcywgdiwgY29sb3IsIHRhZywgZW5naW5lKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICAgICAgdGhpcy5wcmV2X3BvcyA9IHBvcy5zbGljZSgpO1xuICAgICAgICB0aGlzLnYgPSB2O1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgIHRoaXMudGFnID0gdGFnO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xib3ggPSBudWxsO1xuICAgIH1cblxuICAgIGdldF9yKCkge1xuICAgICAgICByZXR1cm4gQ2lyY2xlLmdldF9yX2Zyb21fbSh0aGlzLm0pXG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX3ZlbG9jaXR5KCkge1xuICAgICAgICBsZXQgRiA9IHplcm9zKHRoaXMuY29uZmlnLkRJTUVOU0lPTik7XG4gICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgIGlmIChvYmogPT0gdGhpcykgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCB2ZWN0b3IgPSBzdWIodGhpcy5wb3MsIG9iai5wb3MpO1xuICAgICAgICAgICAgY29uc3QgbWFnbml0dWRlID0gbWFnKHZlY3Rvcik7XG4gICAgICAgICAgICBjb25zdCB1bml0X3ZlY3RvciA9IGRpdih2ZWN0b3IsIG1hZ25pdHVkZSk7XG4gICAgICAgICAgICBGID0gYWRkKEYsIG11bCh1bml0X3ZlY3Rvciwgb2JqLm0gLyBzcXVhcmUobWFnbml0dWRlKSkpXG4gICAgICAgIH1cbiAgICAgICAgRiA9IG11bChGLCAtdGhpcy5jb25maWcuRyAqIHRoaXMubSk7XG4gICAgICAgIGNvbnN0IGEgPSBkaXYoRiwgdGhpcy5tKTtcbiAgICAgICAgdGhpcy52ID0gYWRkKHRoaXMudiwgYSk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlX3Bvc2l0aW9uKCkge1xuICAgICAgICB0aGlzLnBvcyA9IGFkZCh0aGlzLnBvcywgdGhpcy52KTtcbiAgICB9XG5cbiAgICBjb250cm9sX20oZSkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tX2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgfVxuXG4gICAgY29udHJvbF9wb3MoZSkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5wb3NfeF9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5wb3NfeV9jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnBvcyA9IFt4LCB5XTtcbiAgICB9XG5cbiAgICBjb250cm9sX3YoZSkge1xuICAgICAgICBjb25zdCByaG8gPSB0aGlzLnZfcmhvX2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52X3BoaV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgdGhpcy52ID0gcG9sYXIyY2FydGVzaWFuKHJobywgcGhpKTtcbiAgICB9XG5cbiAgICBzaG93X2NvbnRyb2xib3goeCwgeSkge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sYm94ICYmIHRoaXMuY29udHJvbGJveC5pc19vcGVuZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgJGNvbnRyb2xCb3ggPSB0aGlzLmNvbnRyb2xib3guJGNvbnRyb2xCb3g7XG4gICAgICAgICAgICAkY29udHJvbEJveC5jc3MoJ2xlZnQnLCB4ICsgJ3B4Jyk7XG4gICAgICAgICAgICAkY29udHJvbEJveC5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcbiAgICAgICAgICAgICRjb250cm9sQm94Lm5leHRVbnRpbCgnLmNvbnRyb2wtYm94LnRlbXBsYXRlJykuaW5zZXJ0QmVmb3JlKCRjb250cm9sQm94KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpbiA9IDEuNTtcblxuICAgICAgICAgICAgdmFyIHBvc19yYW5nZSA9IG1heChtYXgodGhpcy5jb25maWcuVywgdGhpcy5jb25maWcuSCkgLyAyLCBtYXguYXBwbHkobnVsbCwgdGhpcy5wb3MubWFwKE1hdGguYWJzKSkgKiBtYXJnaW4pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdGhpcy5lbmdpbmUub2Jqcykge1xuICAgICAgICAgICAgICAgIHBvc19yYW5nZSA9IG1heChwb3NfcmFuZ2UsIG1heC5hcHBseShudWxsLCBvYmoucG9zLm1hcChNYXRoLmFicykpICogbWFyZ2luKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcblxuICAgICAgICAgICAgY29uc3QgdiA9IGNhcnRlc2lhbjJhdXRvKHRoaXMudik7XG4gICAgICAgICAgICB2YXIgdl9yYW5nZSA9IG1heCh0aGlzLmNvbmZpZy5WRUxPQ0lUWV9NQVgsIG1hZyh0aGlzLnYpICogbWFyZ2luKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHRoaXMuZW5naW5lLm9ianMpIHtcbiAgICAgICAgICAgICAgICB2X3JhbmdlID0gbWF4KHZfcmFuZ2UsIG1hZyhvYmoudikgKiBtYXJnaW4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xib3ggPSBuZXcgQ29udHJvbEJveCh0aGlzLnRhZywgdGhpcy5nZXRfY29udHJvbGxlcnMoKSwgeCwgeSk7XG4gICAgICAgICAgICB0aGlzLmVuZ2luZS5jb250cm9sYm94ZXMucHVzaCh0aGlzLmNvbnRyb2xib3gpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKSB7XG4gICAgICAgIHRoaXMubV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJNYXNzIG1cIiwgdGhpcy5jb25maWcuTUFTU19NSU4sIHRoaXMuY29uZmlnLk1BU1NfTUFYLCBtLCB0aGlzLmNvbnRyb2xfbSk7XG4gICAgICAgIHRoaXMucG9zX3hfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24geFwiLCAtcG9zX3JhbmdlLCBwb3NfcmFuZ2UsIHRoaXMucG9zWzBdLCB0aGlzLmNvbnRyb2xfcG9zKTtcbiAgICAgICAgdGhpcy5wb3NfeV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJQb3NpdGlvbiB5XCIsIC1wb3NfcmFuZ2UsIHBvc19yYW5nZSwgdGhpcy5wb3NbMV0sIHRoaXMuY29udHJvbF9wb3MpO1xuICAgICAgICB0aGlzLnZfcmhvX2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM+BXCIsIDAsIHZfcmFuZ2UsIHZbMF0sIHRoaXMuY29udHJvbF92KTtcbiAgICAgICAgdGhpcy52X3BoaV9jb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIodGhpcywgXCJWZWxvY2l0eSDPhlwiLCAtMTgwLCAxODAsIHJhZDJkZWcodlsxXSksIHRoaXMuY29udHJvbF92KTtcbiAgICB9XG5cbiAgICBnZXRfY29udHJvbGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3hfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMucG9zX3lfY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9yaG9fY29udHJvbGxlcixcbiAgICAgICAgICAgIHRoaXMudl9waGlfY29udHJvbGxlclxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfcl9mcm9tX20obSkge1xuICAgICAgICByZXR1cm4gcG93KG0sIDEgLyAyKVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRfbV9mcm9tX3Iocikge1xuICAgICAgICByZXR1cm4gc3F1YXJlKHIpXG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7J3RhZyc6IHRoaXMudGFnLCAndic6IHRoaXMudiwgJ3Bvcyc6IHRoaXMucG9zfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTsiLCJjb25zdCBDaXJjbGUgPSByZXF1aXJlKCcuL2NpcmNsZScpO1xuY29uc3QgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2wvY29udHJvbGxlcicpO1xuY29uc3Qge3JhZDJkZWcsIGRlZzJyYWQsIHNwaGVyaWNhbDJjYXJ0ZXNpYW59ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge2N1YmV9ID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuY29uc3Qge3Bvd30gPSBNYXRoO1xuXG5cbmNsYXNzIFNwaGVyZSBleHRlbmRzIENpcmNsZSB7XG4gICAgLyoqXG4gICAgICogU3BoZXJpY2FsIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3BoZXJpY2FsX2Nvb3JkaW5hdGVfc3lzdGVtXG4gICAgICovXG5cbiAgICBnZXRfcigpIHtcbiAgICAgICAgcmV0dXJuIFNwaGVyZS5nZXRfcl9mcm9tX20odGhpcy5tKTtcbiAgICB9XG5cbiAgICBjb250cm9sX3BvcyhlKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLnBvc194X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLnBvc195X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHogPSB0aGlzLnBvc196X2NvbnRyb2xsZXIuZ2V0KCk7XG4gICAgICAgIHRoaXMucG9zID0gW3gsIHksIHpdO1xuICAgIH1cblxuICAgIGNvbnRyb2xfdihlKSB7XG4gICAgICAgIGNvbnN0IHBoaSA9IGRlZzJyYWQodGhpcy52X3BoaV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgdGhldGEgPSBkZWcycmFkKHRoaXMudl90aGV0YV9jb250cm9sbGVyLmdldCgpKTtcbiAgICAgICAgY29uc3QgcmhvID0gdGhpcy52X3Job19jb250cm9sbGVyLmdldCgpO1xuICAgICAgICB0aGlzLnYgPSBzcGhlcmljYWwyY2FydGVzaWFuKHJobywgcGhpLCB0aGV0YSk7XG4gICAgfVxuXG4gICAgc2V0dXBfY29udHJvbGxlcnMocG9zX3JhbmdlLCBtLCB2LCB2X3JhbmdlKSB7XG4gICAgICAgIHN1cGVyLnNldHVwX2NvbnRyb2xsZXJzKHBvc19yYW5nZSwgbSwgdiwgdl9yYW5nZSk7XG4gICAgICAgIHRoaXMucG9zX3pfY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMsIFwiUG9zaXRpb24gelwiLCAtcG9zX3JhbmdlLCBwb3NfcmFuZ2UsIHRoaXMucG9zWzJdLCB0aGlzLmNvbnRyb2xfcG9zKTtcbiAgICAgICAgdGhpcy52X3RoZXRhX2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcih0aGlzLCBcIlZlbG9jaXR5IM64XCIsIC0xODAsIDE4MCwgcmFkMmRlZyh2WzJdKSwgdGhpcy5jb250cm9sX3YpO1xuICAgIH1cblxuICAgIGdldF9jb250cm9sbGVycygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRoaXMubV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NfeF9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3NfeV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy5wb3Nfel9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3Job19jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3BoaV9jb250cm9sbGVyLFxuICAgICAgICAgICAgdGhpcy52X3RoZXRhX2NvbnRyb2xsZXJcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0X3JfZnJvbV9tKG0pIHtcbiAgICAgICAgcmV0dXJuIHBvdyhtLCAxIC8gMyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldF9tX2Zyb21fcihyKSB7XG4gICAgICAgIHJldHVybiBjdWJlKHIpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTcGhlcmU7IiwiY29uc3Qge3plcm9zLCBtYWcsIGFkZCwgc3ViLCBtdWwsIGRpdiwgZG90fSA9IHJlcXVpcmUoJy4vbWF0cml4Jyk7XG5cbmNvbnN0IFV0aWwgPSB7XG4gICAgc3F1YXJlOiAoeCkgPT4ge1xuICAgICAgICByZXR1cm4geCAqIHg7XG4gICAgfSxcblxuICAgIGN1YmU6ICh4KSA9PiB7XG4gICAgICAgIHJldHVybiB4ICogeCAqIHg7XG4gICAgfSxcblxuICAgIHBvbGFyMmNhcnRlc2lhbjogKHJobywgcGhpKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyhwaGkpLFxuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4ocGhpKVxuICAgICAgICBdO1xuICAgIH0sXG5cbiAgICBjYXJ0ZXNpYW4ycG9sYXI6ICh4LCB5KSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYWcoW3gsIHldKSxcbiAgICAgICAgICAgIE1hdGguYXRhbjIoeSwgeClcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgc3BoZXJpY2FsMmNhcnRlc2lhbjogKHJobywgcGhpLCB0aGV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcmhvICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSxcbiAgICAgICAgICAgIHJobyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSksXG4gICAgICAgICAgICByaG8gKiBNYXRoLmNvcyh0aGV0YSlcbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgY2FydGVzaWFuMnNwaGVyaWNhbDogKHgsIHksIHopID0+IHtcbiAgICAgICAgY29uc3QgcmhvID0gbWFnKFt4LCB5LCB6XSk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICByaG8sXG4gICAgICAgICAgICBNYXRoLmF0YW4yKHksIHgpLFxuICAgICAgICAgICAgcmhvICE9IDAgPyBNYXRoLmFjb3MoeiAvIHJobykgOiAwXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIGNhcnRlc2lhbjJhdXRvOiAodmVjdG9yKSA9PiB7XG4gICAgICAgIHJldHVybiB2ZWN0b3IubGVuZ3RoID09IDJcbiAgICAgICAgICAgID8gVXRpbC5jYXJ0ZXNpYW4ycG9sYXIodmVjdG9yWzBdLCB2ZWN0b3JbMV0pXG4gICAgICAgICAgICA6IFV0aWwuY2FydGVzaWFuMnNwaGVyaWNhbCh2ZWN0b3JbMF0sIHZlY3RvclsxXSwgdmVjdG9yWzJdKTtcbiAgICB9LFxuXG4gICAgcmFkMmRlZzogKHJhZCkgPT4ge1xuICAgICAgICByZXR1cm4gcmFkIC8gTWF0aC5QSSAqIDE4MDtcbiAgICB9LFxuXG4gICAgZGVnMnJhZDogKGRlZykgPT4ge1xuICAgICAgICByZXR1cm4gZGVnIC8gMTgwICogTWF0aC5QSTtcbiAgICB9LFxuXG4gICAgZ2V0X2Rpc3RhbmNlOiAoeDAsIHkwLCB4MSwgeTEpID0+IHtcbiAgICAgICAgcmV0dXJuIG1hZyhbeDEgLSB4MCwgeTEgLSB5MF0pO1xuICAgIH0sXG5cbiAgICByb3RhdGU6ICh2ZWN0b3IsIG1hdHJpeCkgPT4ge1xuICAgICAgICByZXR1cm4gZG90KFt2ZWN0b3JdLCBtYXRyaXgpWzBdO1xuICAgIH0sXG5cbiAgICBub3c6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICB9LFxuXG4gICAgcmFuZG9tOiAobWluLCBtYXggPSBudWxsKSA9PiB7XG4gICAgICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4ID0gbWluO1xuICAgICAgICAgICAgbWluID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xuICAgIH0sXG5cbiAgICByYW5kX2NvbG9yOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiAnIycgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNjc3NzIxNSkudG9TdHJpbmcoMTYpO1xuICAgIH0sXG5cbiAgICBnZXRfcm90YXRpb25fbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAtc2luXSxcbiAgICAgICAgICAgIFtzaW4sIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX3hfbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbMSwgMCwgMF0sXG4gICAgICAgICAgICBbMCwgY29zLCAtc2luXSxcbiAgICAgICAgICAgIFswLCBzaW4sIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX3lfbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAwLCAtc2luXSxcbiAgICAgICAgICAgIFswLCAxLCAwXSxcbiAgICAgICAgICAgIFtzaW4sIDAsIGNvc11cbiAgICAgICAgXTtcbiAgICB9LFxuXG4gICAgZ2V0X3JvdGF0aW9uX3pfbWF0cml4OiAoeCwgZGlyID0gMSkgPT4ge1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbih4ICogZGlyKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoeCAqIGRpcik7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbY29zLCAtc2luLCAwXSxcbiAgICAgICAgICAgIFtzaW4sIGNvcywgMF0sXG4gICAgICAgICAgICBbMCwgMCwgMV1cbiAgICAgICAgXTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWw7Il19

//# sourceMappingURL=gravity_simulator.js.map
