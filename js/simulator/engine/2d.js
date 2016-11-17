const {ControlBox, Controller} = require('../control');
const {vector_magnitude, rad2deg, deg2rad, rotate, now, random, polar2cartesian, rand_color} = require('../util');

const {max} = Math;


class InvisibleError extends Error {
}


class Circle {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    constructor(config, m, pos, v, color, tag, dir_tag, engine, controlbox) {
        this.config = config;
        this.m = m;
        this.pos = pos;
        this.prev_pos = np.copy(pos);
        this.v = v;
        this.color = color;
        this.tag = tag;
        this.dir_tag = dir_tag;
        this.engine = engine;

        this.m_controller = null;
        this.pos_x_controller = null;
        this.pos_y_controller = null;
        this.v_phi_controller = null;
        this.v_rho_controller = null;
        this.controlbox = null;
        if (controlbox) {
            this.show_controlbox()
        }
    }

    get_r() {
        return Circle.get_r_from_m(this.m)
    }

    calculate_velocity() {
        let F = 0;
        for (const obj of this.engine.objs) {
            if (obj == this) continue;
            const vector = this.pos - obj.pos;
            const magnitude = vector_magnitude(vector);
            const unit_vector = vector / magnitude;
            F += obj.m / magnitude ** 2 * unit_vector
        }
        F *= -this.config.G * this.m;
        const a = F / this.m;
        this.v += a
    }

    calculate_position() {
        this.pos += this.v
    }

    control_m(e) {
        const m = this.m_controller.get();
        this.m = m;
        this.redraw();
    }

    control_pos(e) {
        const x = this.pos_x_controller.get();
        const y = this.pos_y_controller.get();
        this.pos = np.array([x, y]);
        this.redraw();
    }

    control_v(e) {
        const phi = deg2rad(this.v_phi_controller.get());
        const rho = this.v_rho_controller.get();
        this.v = np.array(polar2cartesian(rho, phi));
        this.redraw();
    }

    show_controlbox() {
        try {
            this.controlbox.tk.lift();
        } catch (e) {
            const margin = 1.5;

            var pos_range = max(max(this.config.W, this.config.H) / 2, max.apply(null, this.pos.map(Math.abs)) * margin);
            for (const obj of this.engine.objs) {
                pos_range = max(pos_range, max.apply(null, obj.pos.map(Math.abs)) * margin);
            }

            const m = this.m;

            const v = cartesian2auto(this.v);
            var v_range = max(this.config.VELOCITY_MAX, vector_magnitude(this.v) * margin);
            for (const obj of this.engine.objs) {
                v_range = max(v_range, vector_magnitude(obj.v) * margin);
            }

            this.setup_controllers(pos_range, m, v, v_range);
            this.controlbox = ControlBox(this.tag, this.get_controllers(), this.engine.on_key_press);
            this.engine.controlboxes.append(this.controlbox.tk)
        }
    }

    setup_controllers(pos_range, m, v, v_range) {
        this.m_controller = Controller("Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.control_m);
        this.pos_x_controller = Controller("Position x", -pos_range, pos_range, this.pos[0], this.control_pos);
        this.pos_y_controller = Controller("Position y", -pos_range, pos_range, this.pos[1], this.control_pos);
        this.v_rho_controller = Controller("Velocity ρ", 0, v_range, v[0], this.control_v);
        this.v_phi_controller = Controller("Velocity φ", -180, 180, rad2deg(v[1]), this.control_v);
    }

    get_controllers() {
        return [
            this.m_controller,
            this.pos_x_controller,
            this.pos_y_controller,
            this.v_rho_controller,
            this.v_phi_controller
        ];
    }

    redraw() {
        this.engine.move_object(this);
        this.engine.move_direction(this);
        this.engine.draw_path(this);
    }

    static get_r_from_m(m) {
        return m ** (1 / 2)
    }

    static get_m_from_r(r) {
        return r ** 2
    }

    toString() {
        return JSON.stringify({'tag': this.tag, 'v': this.v, 'pos': this.pos});
    }
}

class Path {
    constructor(tag, obj) {
        this.tag = tag;
        this.prev_pos = np.copy(obj.prev_pos);
        this.pos = np.copy(obj.pos);
    }
}


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

function get_rotation_matrix(x, dir = 1) {
    const sin = math.sin(x * dir);
    const cos = math.cos(x * dir);
    return np.matrix([
        [cos, -sin],
        [sin, cos]
    ]);
}


class Engine2D {
    constructor(config, canvas, on_key_press) {
        this.config = config;
        this.canvas = canvas;
        this.objs = [];
        this.animating = false;
        this.controlboxes = [];
        this.paths = [];
        this.camera = Camera2D(config, this);
        this.on_key_press = on_key_press;
        this.camera_changed = false;
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
        if (this.camera_changed) {
            this.camera_changed = false;
            this.move_paths();
        }
        if (this.animating) {
            this.calculate_all();
        }
        this.redraw_all();
        this.canvas.after(10, this.animate);
    }

    object_coords(obj) {
        const r = this.camera.adjust_radius(obj.pos, obj.get_r());
        [x, y] = this.camera.adjust_coord(obj.pos);
        return [x - r, y - r, x + r, y + r];
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
        let c;
        try {
            c = this.object_coords(obj);
        } catch (e) {
            if (e instanceof InvisibleError) {
                c = [0, 0, 0, 0];
            } else {
                throw e;
            }
        }
        return this.canvas.create_oval(c[0], c[1], c[2], c[3], fill = obj.color, tag = obj.tag, width = 0);
    }

    draw_direction(obj) {
        let c;
        try {
            c = this.object_coords(obj);
        } catch (e) {
            if (e instanceof InvisibleError) {
                c = [0, 0, 0, 0];
            } else {
                throw e;
            }
        }
        return this.canvas.create_line(c[0], c[1], c[2], c[3], fill = "black", tag = obj.dir_tag);
    }

    draw_path(obj) {
        if (vector_magnitude(obj.pos - obj.prev_pos) > 5) {
            let c;
            try {
                c = this.object_coords(obj);
            } catch (e) {
                if (e instanceof InvisibleError) {
                    c = [0, 0, 0, 0];
                } else {
                    throw e;
                }
            }
            this.paths.append(Path(this.canvas.create_line(c[0], c[1], c[2], c[3], fill = "grey"), obj));
            obj.prev_pos = np.copy(obj.pos);
            if (this.paths.length > this.config.MAX_PATHS) {
                this.canvas.delete(this.paths[0].tag);
                this.paths = this.paths.slice(1);
            }
        }
    }

    move_object(obj) {
        try {
            const c = this.object_coords(obj);
            this.canvas.coords(obj.tag, c[0], c[1], c[2], c[3]);
            this.canvas.itemconfigure(obj.tag, state = 'normal');
        } catch (e) {
            if (e instanceof InvisibleError) {
                this.canvas.itemconfigure(obj.tag, state = 'hidden');
            } else {
                throw e;
            }
        }
    }

    move_direction(obj) {
        try {
            const c = this.direction_coords(obj);
            this.canvas.coords(obj.dir_tag, c[0], c[1], c[2], c[3]);
            this.canvas.itemconfigure(obj.dir_tag, state = 'normal');
        } catch (e) {
            if (e instanceof InvisibleError) {
                this.canvas.itemconfigure(obj.dir_tag, state = 'hidden');
            } else {
                throw e;
            }
        }
    }

    move_paths() {
        for (const path of this.paths) {
            try {
                const c = this.path_coords(path);
                this.canvas.coords(path.tag, c[0], c[1], c[2], c[3]);
                this.canvas.itemconfigure(path.tag, state = 'normal');
            } catch (e) {
                if (e instanceof InvisibleError) {
                    this.canvas.itemconfigure(path.tag, state = 'hidden');
                } else {
                    throw e;
                }
            }
        }
    }

    create_object(x, y, m = null, v = null, color = null, controlbox = true) {
        const pos = np.array(this.camera.actual_point(x, y));
        if (!m) {
            let max_r = Circle.get_r_from_m(this.config.MASS_MAX);
            for (const obj of this.objs) {
                max_r = min(max_r, (vector_magnitude(obj.pos - pos) - obj.get_r()) / 1.5)
            }
            m = Circle.get_m_from_r(random(Circle.get_r_from_m(this.config.MASS_MIN), max_r));
        }
        if (!v) {
            v = np.array(polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180)))
        }
        if (!color) {
            color = rand_color();
        }
        const tag = `circle${this.objs.length}`;
        const dir_tag = tag + "_dir";
        const obj = Circle(this.config, m, pos, v, color, tag, dir_tag, this, controlbox);
        this.objs.append(obj);
        this.draw_object(obj);
        this.draw_direction(obj);
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
                const collision = o2.pos - o1.pos;
                const angles = cartesian2auto(collision);
                const d = angles.shift();

                if (d < o1.get_r() + o2.get_r()) {
                    const R = this.get_rotation_matrix(angles);
                    const R_ = this.get_rotation_matrix(angles, -1);

                    const v_temp = [rotate(o1.v, R), rotate(o2.v, R)];
                    const v_final = np.copy(v_temp);
                    v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m);
                    v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m);
                    o1.v = rotate(v_final[0], R_);
                    o2.v = rotate(v_final[1], R_);

                    const pos_temp = [[0] * dimension, rotate(collision, R)];
                    pos_temp[0][0] += v_final[0][0];
                    pos_temp[1][0] += v_final[1][0];
                    o1.pos = o1.pos + rotate(pos_temp[0], R_);
                    o2.pos = o1.pos + rotate(pos_temp[1], R_);
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
        }
    }

    redraw_all() {
        for (const obj of this.objs) {
            obj.redraw();
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