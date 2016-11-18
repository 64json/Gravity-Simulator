const Circle = require('../object/circle');
const Camera2D = require('../camera/2d');
const {rotate, now, random, polar2cartesian, rand_color, get_rotation_matrix, cartesian2auto, skip_invisible_error} = require('../util');
const {zeros, mag, add, sub, mul} = require('../matrix');
const {min, max} = Math;


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

    toggleAnimating() {
        this.animating = !this.animating;
        document.title = `${this.config.TITLE} (${this.animating ? "Simulating" : "Paused"})`;
    }

    destroy_controlboxes() {
        for (const controlbox of this.controlboxes) {
            controlbox.close();
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
        const {coords, z} = this.camera.adjust_coords(obj.pos);
        return coords.concat(r).concat(z);
    }

    direction_coords(obj, factor = this.config.DIRECTION_LENGTH) {
        const {coords: c1} = this.camera.adjust_coords(obj.pos);
        const {coords: c2, z} = this.camera.adjust_coords(add(obj.pos, mul(obj.v, factor)));
        return c1.concat(c2).concat(z);
    }

    path_coords(obj) {
        const {coords: c1, z1} = this.camera.adjust_coords(obj.prev_pos);
        const {coords: c2, z2} = this.camera.adjust_coords(obj.pos);
        return c1.concat(c2, max(z1, z2));
    }

    draw_object(c, color = null) {
        skip_invisible_error(() => {
            color = color || c.color;
            if (c instanceof Circle) {
                c = this.object_coords(c);
            }
            this.ctx.beginPath();
            this.ctx.arc(c[0], c[1], c[2], 0, 2 * Math.PI, false);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        });
    }

    draw_direction(c) {
        skip_invisible_error(() => {
            if (c instanceof Circle) {
                c = this.direction_coords(c);
            }
            this.ctx.beginPath();
            this.ctx.moveTo(c[0], c[1]);
            this.ctx.lineTo(c[2], c[3]);
            this.ctx.strokeStyle = '#000000';
            this.ctx.stroke();
        });
    }

    draw_path(c) {
        skip_invisible_error(() => {
            if (c instanceof Path) {
                c = this.path_coords(c);
            }
            this.ctx.beginPath();
            this.ctx.moveTo(c[0], c[1]);
            this.ctx.lineTo(c[2], c[3]);
            this.ctx.strokeStyle = '#dddddd';
            this.ctx.stroke();
        });
    }

    create_path(obj) {
        if (mag(sub(obj.pos, obj.prev_pos)) > 5) {
            this.paths.push(new Path(obj));
            obj.prev_pos = obj.pos.slice();
            if (this.paths.length > this.config.MAX_PATHS) {
                this.paths = this.paths.slice(1);
            }
        }
    }

    user_create_object(x, y) {
        const pos = this.camera.actual_point(x, y);
        let max_r = Circle.get_r_from_m(this.config.MASS_MAX);
        for (const obj of this.objs) {
            max_r = min(max_r, (mag(sub(obj.pos, pos)) - obj.get_r()) / 1.5)
        }
        const m = Circle.get_m_from_r(random(Circle.get_r_from_m(this.config.MASS_MIN), max_r));
        const v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
        const color = rand_color();
        const tag = `circle${this.objs.length}`;
        const obj = new Circle(this.config, m, pos, v, color, tag, this);
        obj.show_controlbox(x, y);
        this.objs.push(obj);
    }

    create_object(tag, pos, m, v, color) {
        const obj = new Circle(this.config, m, pos, v, color, tag, this);
        this.objs.push(obj);
    }

    get_rotation_matrix(angles, dir = 1) {
        return get_rotation_matrix(angles[0], dir);
    }

    get_pivot_axis() {
        return 0;
    }

    elastic_collision() {
        const dimension = this.config.DIMENSION;
        for (let i = 0; i < this.objs.length; i++) {
            const o1 = this.objs[i];
            for (let j = i + 1; j < this.objs.length; j++) {
                const o2 = this.objs[j];
                const collision = sub(o2.pos, o1.pos);
                const angles = cartesian2auto(collision);
                const d = angles.shift();

                if (d < o1.get_r() + o2.get_r()) {
                    const R = this.get_rotation_matrix(angles);
                    const R_ = this.get_rotation_matrix(angles, -1);
                    const i = this.get_pivot_axis();

                    const v_temp = [rotate(o1.v, R), rotate(o2.v, R)];
                    const v_final = [v_temp[0].slice(), v_temp[1].slice()];
                    v_final[0][i] = ((o1.m - o2.m) * v_temp[0][i] + 2 * o2.m * v_temp[1][i]) / (o1.m + o2.m);
                    v_final[1][i] = ((o2.m - o1.m) * v_temp[1][i] + 2 * o1.m * v_temp[0][i]) / (o1.m + o2.m);
                    o1.v = rotate(v_final[0], R_);
                    o2.v = rotate(v_final[1], R_);

                    const pos_temp = [zeros(dimension), rotate(collision, R)];
                    pos_temp[0][i] += v_final[0][i];
                    pos_temp[1][i] += v_final[1][i];
                    o1.pos = add(o1.pos, rotate(pos_temp[0], R_));
                    o2.pos = add(o1.pos, rotate(pos_temp[1], R_));
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
        for (const path of this.paths) {
            this.draw_path(path);
        }
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