const Circle = require('./circle');
const Controller = require('../control/controller');
const {rad2deg, deg2rad, spherical2cartesian} = require('../util');


class Sphere extends Circle {
    /**
     * Spherical coordinate system
     * https://en.wikipedia.org/wiki/Spherical_coordinate_system
     */

    getGeometry(){
        return new THREE.SphereGeometry(this.r, 32, 32);
    }

    draw() {
        this.object.position.z = this.pos[2];
        super.draw();
    }

    controlPos(e) {
        const x = this.posXController.get();
        const y = this.posYController.get();
        const z = this.posZController.get();
        this.pos = [x, y, z];
    }

    controlV(e) {
        const phi = deg2rad(this.vPhiController.get());
        const theta = deg2rad(this.vThetaController.get());
        const rho = this.vRhoController.get();
        this.v = spherical2cartesian(rho, phi, theta);
    }

    setup_controllers(pos_range, m, r, v, v_range) {
        super.setup_controllers(pos_range, m, r, v, v_range);
        this.posZController = new Controller(this, "Position z", -pos_range, pos_range, this.pos[2], this.controlPos);
        this.vThetaController = new Controller(this, "Velocity θ", -180, 180, rad2deg(v[2]), this.controlV);
    }

    getControllers() {
        return [
            this.mController,
            this.rController,
            this.posXController,
            this.posYController,
            this.posZController,
            this.vRhoController,
            this.vPhiController,
            this.vThetaController
        ];
    }
}

module.exports = Sphere;