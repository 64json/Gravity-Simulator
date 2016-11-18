const InvisibleError = require('../error/invisible');
const {deg2rad, rotate, now, getRotationMatrix} = require('../util');
const {zeros, mag, add, sub, mul, div, dot} = require('../matrix');
const {pow} = Math;

class Camera2D {
    constructor(config, engine) {
        this.config = config;
        this.x = 0;
        this.y = 0;
        this.z = config.CAMERA_DISTANCE;
        this.phi = 0;
        this.engine = engine;
        this.lastTime = 0;
        this.lastKey = null;
        this.combo = 0;
        this.center = [config.W / 2, config.H / 2];
    }

    getCoordStep(key) {
        const currentTime = now();
        if (key == this.lastKey && currentTime - this.lastTime < 1) {
            this.combo += 1;
        } else {
            this.combo = 0;
        }
        this.lastTime = currentTime;
        this.lastKey = key;
        return this.config.CAMERA_COORD_STEP * pow(this.config.CAMERA_ACCELERATION, this.combo);
    }

    up(key) {
        this.y -= this.getCoordStep(key);
        this.refresh();
    }

    down(key) {
        this.y += this.getCoordStep(key);
        this.refresh();
    }

    left(key) {
        this.x -= this.getCoordStep(key);
        this.refresh();
    }

    right(key) {
        this.x += this.getCoordStep(key);
        this.refresh();
    }

    zoomIn(key) {
        this.z -= this.getCoordStep(key);
        this.refresh();
    }

    zoomOut(key) {
        this.z += this.getCoordStep(key);
        this.refresh();
    }

    rotateLeft(key) {
        this.phi -= this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    rotateRight(key) {
        this.phi += this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    refresh() {
    }

    getZoom(z = 0) {
        var distance = this.z - z;
        if (distance <= 0) {
            throw new InvisibleError();
        }
        return this.config.CAMERA_DISTANCE / distance;
    }

    adjustCoords(c) {
        const R = getRotationMatrix(deg2rad(this.phi));
        c = rotate(c, R);
        const zoom = this.getZoom();
        const coords = add(this.center, mul(sub(c, [this.x, this.y]), zoom));
        return {coords};
    }

    adjustRadius(coords, radius) {
        const zoom = this.getZoom();
        return radius * zoom;
    }

    actualPoint(x, y) {
        const R_ = getRotationMatrix(deg2rad(this.phi), -1);
        const zoom = this.getZoom();
        return rotate(add(div(sub([x, y], this.center), zoom), [this.x, this.y]), R_);
    }
}

module.exports = Camera2D;