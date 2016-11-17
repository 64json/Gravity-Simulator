const {ControlBox, Controller} = require('../control');
const {vector_magnitude, rad2deg, deg2rad, polar2cartesian, cartesian2auto} = require('../util');
const {max} = Math;


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

module.exports = Circle;