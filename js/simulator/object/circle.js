const ControlBox = require('../control/control_box');
const Controller = require('../control/controller');
const {vector_magnitude, rad2deg, deg2rad, polar2cartesian, cartesian2auto, square} = require('../util');
const {max, pow} = Math;


class Circle {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    constructor(config, m, pos, v, color, tag, dir_tag, engine, controlbox) {
        this.config = config;
        this.m = m;
        this.pos = pos;
        this.prev_pos = pos.slice();
        this.v = v;
        this.color = color;
        this.tag = tag;
        this.dir_tag = dir_tag;
        this.engine = engine;

        this.controlbox = null;
        if (controlbox) {
            this.show_controlbox()
        }
    }

    get_r() {
        return Circle.get_r_from_m(this.m)
    }

    calculate_velocity() {
        let F = nj.zeros(this.config.DIMENSION);
        for (const obj of this.engine.objs) {
            if (obj == this) continue;
            const vector = this.pos.subtract(obj.pos);
            const magnitude = vector_magnitude(vector);
            const unit_vector = vector.divide(magnitude);
            F = F.add(unit_vector.multiply(obj.m / square(magnitude)))
        }
        F = F.multiply(-this.config.G * this.m);
        const a = F.divide(this.m);
        this.v = this.v.add(a);
    }

    calculate_position() {
        this.pos = this.pos.add(this.v);
    }

    control_m(e) {
        const m = this.m_controller.get();
        this.m = m;
    }

    control_pos(e) {
        const x = this.pos_x_controller.get();
        const y = this.pos_y_controller.get();
        this.pos = nj.array([x, y]);
    }

    control_v(e) {
        const phi = deg2rad(this.v_phi_controller.get());
        const rho = this.v_rho_controller.get();
        this.v = nj.array(polar2cartesian(rho, phi));
    }

    show_controlbox() {
        try {
            this.controlbox.tk.lift();
        } catch (e) {
            const margin = 1.5;

            var pos_range = max(max(this.config.W, this.config.H) / 2, max.apply(null, this.pos.tolist().map(Math.abs)) * margin);
            for (const obj of this.engine.objs) {
                pos_range = max(pos_range, max.apply(null, obj.pos.tolist().map(Math.abs)) * margin);
            }

            const m = this.m;

            const v = cartesian2auto(this.v);
            var v_range = max(this.config.VELOCITY_MAX, vector_magnitude(this.v) * margin);
            for (const obj of this.engine.objs) {
                v_range = max(v_range, vector_magnitude(obj.v) * margin);
            }

            this.setup_controllers(pos_range, m, v, v_range);
            this.controlbox = new ControlBox(this.tag, this.get_controllers());
            this.engine.controlboxes.push(this.controlbox);
        }
    }

    setup_controllers(pos_range, m, v, v_range) {
        this.m_controller = new Controller("Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.control_m);
        this.pos_x_controller = new Controller("Position x", -pos_range, pos_range, this.pos[0], this.control_pos);
        this.pos_y_controller = new Controller("Position y", -pos_range, pos_range, this.pos[1], this.control_pos);
        this.v_rho_controller = new Controller("Velocity ρ", 0, v_range, v[0], this.control_v);
        this.v_phi_controller = new Controller("Velocity φ", -180, 180, rad2deg(v[1]), this.control_v);
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

    static get_r_from_m(m) {
        return pow(m, 1 / 2)
    }

    static get_m_from_r(r) {
        return square(r)
    }

    toString() {
        return JSON.stringify({'tag': this.tag, 'v': this.v, 'pos': this.pos});
    }
}

module.exports = Circle;