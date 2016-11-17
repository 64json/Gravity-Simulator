const InvisibleError = require('../error/invisible');
const {deg2rad, rotate, now, get_rotation_matrix} = require('../util');

class Camera2D {
    constructor(config, engine) {
        this.config = config;
        this.x = 0;
        this.y = 0;
        this.z = 100;
        this.phi = 0;
        this.engine = engine;
        this.last_time = 0;
        this.last_key = null;
        this.combo = 0;
        this.center = np.array([config.W / 2, config.H / 2]);
    }

    get_coord_step(key) {
        const current_time = now();
        if (key == this.last_key && current_time - this.last_time < 1) {
            this.combo += 1;
        } else {
            this.combo = 0;
        }
        this.last_time = current_time;
        this.last_key = key;
        return this.config.CAMERA_COORD_STEP * this.config.CAMERA_ACCELERATION ** this.combo;
    }

    up(key) {
        this.y -= this.get_coord_step(key);
        this.refresh();
    }

    down(key) {
        this.y += this.get_coord_step(key);
        this.refresh();
    }

    left(key) {
        this.x -= this.get_coord_step(key);
        this.refresh();
    }

    right(key) {
        this.x += this.get_coord_step(key);
        this.refresh();
    }

    zoom_in(key) {
        this.z -= this.get_coord_step(key);
        this.refresh();
    }

    zoom_out(key) {
        this.z += this.get_coord_step(key);
        this.refresh();
    }

    rotate_left(key) {
        this.phi -= this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    rotate_right(key) {
        this.phi += this.config.CAMERA_ANGLE_STEP;
        this.refresh();
    }

    refresh() {
        this.engine.camera_changed = true;
    }

    get_zoom(z = 0, allow_invisible = false) {
        var distance = this.z - z;
        if (distance <= 0) {
            if (!allow_invisible) throw InvisibleError;
            distance = Infinity;
        }
        return 100 / distance;
    }

    adjust_coord(c, allow_invisible = false) {
        const R = get_rotation_matrix(deg2rad(this.phi));
        const zoom = this.get_zoom();
        return this.center + (rotate(c, R) - [this.x, this.y]) * zoom;
    }

    adjust_radius(c, r) {
        const zoom = this.get_zoom();
        return r * zoom;
    }

    actual_point(x, y) {
        const R_ = get_rotation_matrix(deg2rad(this.phi), -1);
        const zoom = this.get_zoom();
        return rotate(([x, y] - this.center) / zoom + [this.x, this.y], R_);
    }
}

module.exports = Camera2D;