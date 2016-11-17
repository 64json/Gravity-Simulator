const Engine2D = require('./2d');
const Camera3D = require('../camera/3d');
const Sphere = require('../object/sphere');
const {vector_magnitude, random, get_rotation_x_matrix, get_rotation_z_matrix, rand_color, spherical2cartesian} = require('../util');
const {min} = Math;


class Engine3D extends Engine2D {
    constructor(config, canvas, on_key_press) {
        super(config, canvas, on_key_press);
        this.camera = Camera3D(config, this);
    }


    create_object(x, y, m = None, v = None, color = None, controlbox = True) {
        const pos = np.array(this.camera.actual_point(x, y));
        if (!m) {
            let max_r = Sphere.get_r_from_m(this.config.MASS_MAX);
            for (const obj of this.objs) {
                max_r = min(max_r, (vector_magnitude(obj.pos - pos) - obj.get_r()) / 1.5);
            }
            m = Sphere.get_m_from_r(random(Sphere.get_r_from_m(this.config.MASS_MIN), max_r));
        }
        if (!v) {
            v = np.array(spherical2cartesian(
                random(this.config.VELOCITY_MAX / 2),
                random(-180, 180),
                random(-180, 180)));
        }
        if (!color) {
            color = rand_color();
        }
        const tag = `sphere${this.objs.length}`;
        const dir_tag = tag + "_dir";
        const obj = Sphere(this.config, m, pos, v, color, tag, dir_tag, this, controlbox);
        this.objs.append(obj);
        this.draw_object(obj);
        this.draw_direction(obj);
    }

    get_rotation_matrix(angles, dir = 1) {
        return dir == 1
            ? get_rotation_z_matrix(angles[0]) * get_rotation_x_matrix(angles[1])
            : get_rotation_x_matrix(angles[1], -1) * get_rotation_z_matrix(angles[0], -1);
    }
}

module.exports = Engine3D;