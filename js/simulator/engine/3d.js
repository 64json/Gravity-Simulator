const Engine2D = require('./2d');
const Camera3D = require('../camera/3d');
const Sphere = require('../object/sphere');
const InvisibleError = require('../error/invisible');
const {vector_magnitude, random, get_rotation_x_matrix, get_rotation_z_matrix, rand_color, spherical2cartesian} = require('../util');
const {zeros, mag, add, sub, mul, div, dot} = require('../matrix');
const {min, max} = Math;


class Engine3D extends Engine2D {
    constructor(config, ctx) {
        super(config, ctx);
        this.camera = new Camera3D(config, this);
    }

    direction_coords(obj) {
        let c = this.camera.rotated_coords(obj.pos);
        let factor = min(50, (this.camera.z - c[2] - 1) / obj.v[2]);
        return super.direction_coords(obj, factor);
    }

    create_object(x, y, m = null, v = null, color = null, controlbox = true) {
        const pos = this.camera.actual_point(x, y);
        if (!m) {
            let max_r = Sphere.get_r_from_m(this.config.MASS_MAX);
            for (const obj of this.objs) {
                max_r = min(max_r, (mag(sub(obj.pos, pos)) - obj.get_r()) / 1.5);
            }
            m = Sphere.get_m_from_r(random(Sphere.get_r_from_m(this.config.MASS_MIN), max_r));
        }
        if (!v) {
            v = spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180));
        }
        if (!color) {
            color = rand_color();
        }
        const tag = `sphere${this.objs.length}`;
        const obj = new Sphere(this.config, m, pos, v, color, tag, this, controlbox);
        if (controlbox) obj.show_controlbox(x, y);
        this.objs.push(obj);
    }

    get_rotation_matrix(angles, dir = 1) {
        return dir == 1
            ? dot(get_rotation_z_matrix(angles[0]), get_rotation_x_matrix(angles[1]))
            : dot(get_rotation_x_matrix(angles[1], -1), get_rotation_z_matrix(angles[0], -1));
    }

    redraw_all() {
        this.ctx.clearRect(0, 0, this.config.W, this.config.H);
        const orders = [];
        for (const obj of this.objs) {
            try {
                const coords = this.object_coords(obj);
                const z = coords.pop();
                orders.push(['object', coords, z, obj.color]);
            } catch (e) {
                if (!(e instanceof InvisibleError)) {
                    console.error(e);
                    throw new Error();
                }
            }
        }
        for (const obj of this.objs) {
            try {
                const coords = this.direction_coords(obj);
                const z = coords.pop();
                orders.push(['direction', coords, z]);
            } catch (e) {
                if (!(e instanceof InvisibleError)) {
                    console.error(e);
                    throw new Error();
                }
            }
        }
        for (const path of this.paths) {
            try {
                const coords = this.path_coords(path);
                const z = coords.pop();
                orders.push(['path', coords, z]);
            } catch (e) {
                if (!(e instanceof InvisibleError)) {
                    console.error(e);
                    throw new Error();
                }
            }
        }
        orders.sort(function (a, b) {
            return a[2] - b[2];
        });
        for (const [type, coords, z, color] of orders) {
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
    }
}

module.exports = Engine3D;