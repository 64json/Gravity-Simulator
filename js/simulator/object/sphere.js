const Circle = require('./circle');
const {Controller} = require('../control');
const {rad2deg, deg2rad, spherical2cartesian} = require('../util');


class Sphere extends Circle {
    /**
     * Spherical coordinate system
     * https://en.wikipedia.org/wiki/Spherical_coordinate_system
     */

    constructor(config, m, pos, v, color, tag, dir_tag, engine, controlbox) {
        this.pos_z_controller = null;
        this.v_theta_controller = null;
        super(config, m, pos, v, color, tag, dir_tag, engine, controlbox);
    }

    get_r() {
        return Sphere.get_r_from_m(this.m);
    }

    control_pos(e) {
        const x = this.pos_x_controller.get();
        const y = this.pos_y_controller.get();
        const z = this.pos_z_controller.get();
        this.pos = np.array([x, y, z]);
        this.redraw();
    }

    control_v(e) {
        const phi = deg2rad(this.v_phi_controller.get());
        const theta = deg2rad(this.v_theta_controller.get());
        const rho = this.v_rho_controller.get();
        this.v = np.array(spherical2cartesian(rho, phi, theta));
        this.redraw();
    }

    setup_controllers(pos_range, m, v, v_range) {
        super.setup_controllers(pos_range, m, v, v_range);
        this.pos_z_controller = Controller("Position z", -pos_range, pos_range, this.pos[2], this.control_pos);
        this.v_theta_controller = Controller("Velocity θ", -180, 180, rad2deg(v[2]), this.control_v);
    }

    get_controllers() {
        return [
            this.m_controller,
            this.pos_x_controller,
            this.pos_y_controller,
            this.pos_z_controller,
            this.v_rho_controller,
            this.v_phi_controller,
            this.v_theta_controller
        ];
    }

    static get_r_from_m(m) {
        return m ** (1 / 3);
    }

    static get_m_from_r(r) {
        return r ** 3;
    }
}