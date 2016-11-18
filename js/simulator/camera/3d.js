const Camera2D = require('./2d');
const {deg2rad, rotate, get_rotation_x_matrix, get_rotation_y_matrix} = require('../util');
const {zeros, mag, add, sub, mul, div, dot} = require('../matrix');


class Camera3D extends Camera2D {
    constructor(config, engine) {
        super(config, engine);
        this.theta = 0;
    }

    rotate_up(key) {
        this.theta -= this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    rotate_down(key) {
        this.theta += this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    rotated_coords(coords) {
        const Rx = get_rotation_x_matrix(deg2rad(this.theta));
        const Ry = get_rotation_y_matrix(deg2rad(this.phi));
        return rotate(rotate(coords, Rx), Ry);
    }

    adjust_coords(coords, allow_invisible = false) {
        const c = this.rotated_coords(coords);
        const zoom = this.get_zoom(c.pop(), allow_invisible);
        return add(this.center, mul(sub(c, [this.x, this.y]), zoom));
    }

    adjust_radius(coords, radius) {
        const c = this.rotated_coords(coords);
        const zoom = this.get_zoom(c.pop());
        return radius * zoom;
    }

    actual_point(x, y) {
        const Rx_ = get_rotation_x_matrix(deg2rad(this.theta), -1);
        const Ry_ = get_rotation_y_matrix(deg2rad(this.phi), -1);
        const c = add(sub([x, y], this.center), [this.x, this.y]).concat(0);
        return rotate(rotate(c, Ry_), Rx_);
    }
}

module.exports = Camera3D;