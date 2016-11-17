const Circle = require('../object/circle');
const Camera2D = require('../camera/2d');
const InvisibleError = require('../error/invisible');
const {vector_magnitude, rotate, now, random, polar2cartesian, rand_color, get_rotation_matrix, cartesian2auto} = require('../util');
const {min} = Math;


class Path {
    constructor(obj) {
        this.prev_pos = obj.prev_pos.slice();
        this.pos = obj.pos.slice();
    }
}

class Engine2D {
    constructor(config, ctx) {
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

    destroy_controlboxes() {
        for (const controlbox of this.controlboxes) {
            controlbox.destroy();
        }
        this.controlboxes = []
    }

    animate() {
        this.print_fps();
        if (this.animating) {
            this.calculate_all();
        }
        this.redraw_all();
        setTimeout(() => {
            this.animate();
        }, 10);
    }

    object_coords(obj) {
        const r = this.camera.adjust_radius(obj.pos, obj.get_r());
        const [x, y] = this.camera.adjust_coord(obj.pos);
        return [x, y, r];
    }

    direction_coords(obj) {
        const [cx, cy] = this.camera.adjust_coord(obj.pos);
        const [dx, dy] = this.camera.adjust_coord(obj.pos + obj.v * 50, true);
        return [cx, cy, dx, dy];
    }

    path_coords(obj) {
        const [fx, fy] = this.camera.adjust_coord(obj.prev_pos);
        const [tx, ty] = this.camera.adjust_coord(obj.pos);
        return [fx, fy, tx, ty];
    }

    draw_object(obj) {
        try {
            const c = this.object_coords(obj);
            this.ctx.beginPath();
            this.ctx.arc(c[0], c[1], c[2], 0, 2 * Math.PI, false);
            this.ctx.fillStyle = obj.color;
            this.ctx.fill();
        } catch (e) {
            if (!(e instanceof InvisibleError)) {
                throw e;
            }
        }
    }

    draw_direction(obj) {
        try {
            const c = this.object_coords(obj);
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

    draw_paths() {
        for (const path of this.paths) {
            try {
                const c = this.path_coords(path);
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
    }

    create_path(obj) {
        if (vector_magnitude(obj.pos.subtract(obj.prev_pos)) > 5) {
            this.paths.push(new Path(obj));
            obj.prev_pos = obj.pos.slice();
            if (this.paths.length > this.config.MAX_PATHS) {
                this.paths = this.paths.slice(1);
            }
        }
    }

    create_object(x, y, m = null, v = null, color = null, controlbox = true) {
        const pos = this.camera.actual_point(x, y);
        if (!m) {
            let max_r = Circle.get_r_from_m(this.config.MASS_MAX);
            for (const obj of this.objs) {
                max_r = min(max_r, (vector_magnitude(obj.pos.subtract(pos)) - obj.get_r()) / 1.5)
            }
            m = Circle.get_m_from_r(random(Circle.get_r_from_m(this.config.MASS_MIN), max_r));
        }
        if (!v) {
            v = nj.array(polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180)))
        }
        if (!color) {
            color = rand_color();
        }
        const tag = `circle${this.objs.length}`;
        const dir_tag = tag + "_dir";
        const obj = new Circle(this.config, m, pos, v, color, tag, dir_tag, this, controlbox);
        this.objs.push(obj);
    }

    get_rotation_matrix(angles, dir = 1) {
        return get_rotation_matrix(angles[0], dir);
    }

    elastic_collision() {
        const dimension = this.config.DIMENSION;
        for (let i = 0; i < this.objs.length; i++) {
            const o1 = this.objs[i];
            for (let j = i + 1; j < this.objs.length; j++) {
                const o2 = this.objs[j];
                const collision = o2.pos.subtract(o1.pos);
                const angles = cartesian2auto(collision);
                const d = angles.shift();

                if (d < o1.get_r() + o2.get_r()) {
                    const R = this.get_rotation_matrix(angles);
                    const R_ = this.get_rotation_matrix(angles, -1);

                    const v_temp = [rotate(o1.v, R), rotate(o2.v, R)];
                    const v_final = [v_temp[0].clone(), v_temp[1].clone()];
                    v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m);
                    v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m);
                    o1.v = rotate(v_final[0], R_);
                    o2.v = rotate(v_final[1], R_);

                    const pos_temp = [[0] * dimension, rotate(collision, R)];
                    pos_temp[0][0] += v_final[0][0];
                    pos_temp[1][0] += v_final[1][0];
                    o1.pos = o1.pos.add(rotate(pos_temp[0], R_));
                    o2.pos = o1.pos.add(rotate(pos_temp[1], R_));
                }
            }
        }
    }

    calculate_all() {
        for (const obj of this.objs) {
            obj.calculate_velocity();
        }

        this.elastic_collision();

        for (const obj of this.objs) {
            obj.calculate_position();
            this.create_path(obj);
        }
    }

    redraw_all() {
        this.ctx.clearRect(0, 0, this.config.W, this.config.H);
        for (const obj of this.objs) {
            this.draw_object(obj);
            this.draw_direction(obj);
        }
        this.draw_paths();
    }

    print_fps() {
        this.fps_count += 1;
        const current_time = now();
        const fps_time_diff = current_time - this.fps_last_time
        if (fps_time_diff > 1) {
            console.log(`${(this.fps_count / fps_time_diff) | 0} fps`);
            this.fps_last_time = current_time;
            this.fps_count = 0;
        }
    }
}

module.exports = Engine2D;