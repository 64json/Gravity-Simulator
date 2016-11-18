const Camera2D = require('./2d');
const {deg2rad, rotate, getXRotationMatrix, getYRotationMatrix} = require('../util');
const {zeros, mag, add, sub, mul, div, dot} = require('../matrix');


class Camera3D extends Camera2D {
    constructor(config, engine) {
        super(config, engine);
        this.theta = 0;
    }

    rotateUp(key) {
        this.theta -= this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    rotateDown(key) {
        this.theta += this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    rotatedCoords(c) {
        const Rx = getXRotationMatrix(deg2rad(this.theta));
        const Ry = getYRotationMatrix(deg2rad(this.phi));
        return rotate(rotate(c, Rx), Ry);
    }

    adjustCoords(c) {
        c = this.rotatedCoords(c);
        const z = c.pop();
        const zoom = this.getZoom(z);
        const coords = add(this.center, mul(sub(c, [this.x, this.y]), zoom));
        return {coords, z};
    }

    adjustRadius(c, radius) {
        c = this.rotatedCoords(c);
        const z = c.pop();
        const zoom = this.getZoom(z);
        return radius * zoom;
    }

    actualPoint(x, y) {
        const Rx_ = getXRotationMatrix(deg2rad(this.theta), -1);
        const Ry_ = getYRotationMatrix(deg2rad(this.phi), -1);
        const c = add(sub([x, y], this.center), [this.x, this.y]).concat(this.z - this.config.CAMERA_DISTANCE);
        return rotate(rotate(c, Ry_), Rx_);
    }
}

module.exports = Camera3D;