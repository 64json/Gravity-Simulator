const ControlBox = require('../control/control_box');
const Controller = require('../control/controller');
const {rad2deg, deg2rad, polar2cartesian, cartesian2auto, square} = require('../util');
const {zeros, mag, add, sub, mul, div} = require('../matrix');
const {max, pow} = Math;


class Circle {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    constructor(config, m, pos, v, color, tag, engine) {
        this.config = config;
        this.m = m;
        this.pos = pos;
        this.prevPos = pos.slice();
        this.v = v;
        this.color = color;
        this.tag = tag;
        this.engine = engine;

        this.controlBox = null;
    }

    getRadius() {
        return Circle.getRadiusFromMass(this.m)
    }

    calculateVelocity() {
        let F = zeros(this.config.DIMENSION);
        for (const obj of this.engine.objs) {
            if (obj == this) continue;
            const vector = sub(this.pos, obj.pos);
            const magnitude = mag(vector);
            const unitVector = div(vector, magnitude);
            F = add(F, mul(unitVector, obj.m / square(magnitude)))
        }
        F = mul(F, -this.config.G * this.m);
        const a = div(F, this.m);
        this.v = add(this.v, a);
    }

    calculatePosition() {
        this.pos = add(this.pos, this.v);
    }

    controlM(e) {
        const m = this.mController.get();
        this.m = m;
    }

    controlPos(e) {
        const x = this.posXController.get();
        const y = this.posYController.get();
        this.pos = [x, y];
    }

    controlV(e) {
        const rho = this.vRhoController.get();
        const phi = deg2rad(this.vPhiController.get());
        this.v = polar2cartesian(rho, phi);
    }

    showControlBox(x, y) {
        if (this.controlBox && this.controlBox.isOpen()) {
            const $controlBox = this.controlBox.$controlBox;
            $controlBox.css('left', x + 'px');
            $controlBox.css('top', y + 'px');
            $controlBox.nextUntil('.control-box.template').insertBefore($controlBox);
        } else {
            const margin = 1.5;

            var posRange = max(max(this.config.W, this.config.H) / 2, max.apply(null, this.pos.map(Math.abs)) * margin);
            for (const obj of this.engine.objs) {
                posRange = max(posRange, max.apply(null, obj.pos.map(Math.abs)) * margin);
            }

            const m = this.m;

            const v = cartesian2auto(this.v);
            var vRange = max(this.config.VELOCITY_MAX, mag(this.v) * margin);
            for (const obj of this.engine.objs) {
                vRange = max(vRange, mag(obj.v) * margin);
            }

            this.setup_controllers(posRange, m, v, vRange);
            this.controlBox = new ControlBox(this, this.tag, this.getControllers(), x, y);
            this.engine.controlBoxes.push(this.controlBox);
        }
    }

    setup_controllers(posRange, m, v, vRange) {
        this.mController = new Controller(this, "Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.controlM);
        this.posXController = new Controller(this, "Position x", -posRange, posRange, this.pos[0], this.controlPos);
        this.posYController = new Controller(this, "Position y", -posRange, posRange, this.pos[1], this.controlPos);
        this.vRhoController = new Controller(this, "Velocity ρ", 0, vRange, v[0], this.controlV);
        this.vPhiController = new Controller(this, "Velocity φ", -180, 180, rad2deg(v[1]), this.controlV);
    }

    getControllers() {
        return [
            this.mController,
            this.posXController,
            this.posYController,
            this.vRhoController,
            this.vPhiController
        ];
    }

    destroy() {
        const i = this.engine.objs.indexOf(this);
        this.engine.objs.splice(i, 1);
        if (this.controlBox && this.controlBox.isOpen()) {
            this.controlBox.close();
        }
    }

    static getRadiusFromMass(m) {
        return pow(m, 1 / 2)
    }

    static getMassFromRadius(r) {
        return square(r)
    }

    toString() {
        return JSON.stringify({'tag': this.tag, 'v': this.v, 'pos': this.pos});
    }
}

module.exports = Circle;