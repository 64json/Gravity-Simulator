const ControlBox = require('../control/control_box');
const Controller = require('../control/controller');
const {rad2deg, deg2rad, polar2cartesian, cartesian2auto, square, rotate, getRotationMatrix} = require('../util');
const {zeros, mag, add, sub, mul, div, to3} = require('../matrix');
const {max} = Math;
const textureLoader = new THREE.TextureLoader();


class Circle {
    /**
     * Polar coordinate system
     * https://en.wikipedia.org/wiki/Polar_coordinate_system
     */

    constructor(config, m, r, pos, v, texture, tag, engine) {
        this.config = config;
        this.m = m;
        this.r = r;
        this.pos = pos;
        this.prevPos = pos.slice();
        this.v = v;
        this.texture = texture;
        this.tag = tag;
        this.engine = engine;
        this.object = this.createThreeObject();
        this.controlBox = null;
        this.path = null;
        this.pathVertices = [];
        this.pathMaterial = new THREE.LineBasicMaterial({
            color: 0x888888
        });
        this.direction = null;
        this.directionMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff
        });
    }

    getThreeGeometry() {
        return new THREE.CircleGeometry(this.r, 32);
    }

    createThreeObject() {
        if (this.object) this.engine.scene.remove(this.object);
        const geometry = this.getThreeGeometry();
        const materialOption = {};
        if (typeof this.texture === 'string' && this.texture.indexOf('map/') == 0) materialOption.map = textureLoader.load(this.texture);
        else materialOption.color = this.texture;
        const material = new THREE.MeshStandardMaterial(materialOption);
        const object = new THREE.Mesh(geometry, material);
        object.matrixAutoUpdate = false;
        this.engine.scene.add(object);
        return object;
    }

    calculateVelocity() {
        let F = zeros(this.config.DIMENSION);
        for (const obj of this.engine.objs) {
            if (obj == this) continue;
            const vector = sub(this.pos, obj.pos);
            const magnitude = mag(vector);
            const unitVector = div(vector, magnitude);
            F = add(F, mul(unitVector, obj.m / square(magnitude)));
        }
        F = mul(F, -this.config.G * this.m);
        const a = div(F, this.m);
        this.v = add(this.v, a);
    }

    calculatePosition() {
        this.pos = add(this.pos, this.v);
        if (mag(sub(this.pos, this.prevPos)) > 1) {
            this.prevPos = this.pos.slice();
            this.pathVertices.push(to3(this.pos));
            if (this.pathVertices.length > this.config.MAX_PATHS) this.pathVertices.shift();
        }
    }

    getRotationMatrix(angles, dir = 1) {
        return getRotationMatrix(angles[0], dir);
    }

    getPivotAxis() {
        return 0;
    }

    calculateCollision(o){
        const dimension = this.config.DIMENSION;
        const collision = sub(o.pos, this.pos);
        const angles = cartesian2auto(collision);
        const d = angles.shift();

        if (d < this.r + o.r) {
            const R = this.getRotationMatrix(angles);
            const R_ = this.getRotationMatrix(angles, -1);
            const i = this.getPivotAxis();

            const vTemp = [rotate(this.v, R), rotate(o.v, R)];
            const vFinal = [vTemp[0].slice(), vTemp[1].slice()];
            vFinal[0][i] = ((this.m - o.m) * vTemp[0][i] + 2 * o.m * vTemp[1][i]) / (this.m + o.m);
            vFinal[1][i] = ((o.m - this.m) * vTemp[1][i] + 2 * this.m * vTemp[0][i]) / (this.m + o.m);
            this.v = rotate(vFinal[0], R_);
            o.v = rotate(vFinal[1], R_);

            const posTemp = [zeros(dimension), rotate(collision, R)];
            posTemp[0][i] += vFinal[0][i];
            posTemp[1][i] += vFinal[1][i];
            this.pos = add(this.pos, rotate(posTemp[0], R_));
            o.pos = add(this.pos, rotate(posTemp[1], R_));
        }
    }

    draw() {
        this.object.position.x = this.pos[0];
        this.object.position.y = this.pos[1];
        this.object.updateMatrix();

        if (this.path) this.engine.scene.remove(this.path);
        const pathGeometry = new THREE.Geometry();
        pathGeometry.vertices = this.pathVertices;
        this.path = new THREE.Line(pathGeometry, this.pathMaterial);
        this.engine.scene.add(this.path);

        if (this.direction) this.engine.scene.remove(this.direction);
        const directionGeometry = new THREE.Geometry();
        if (mag(this.v) == 0) {
            this.direction = null;
        } else {
            const sPos = add(this.pos, mul(this.v, this.r / mag(this.v)));
            const ePos = add(sPos, mul(this.v, this.config.DIRECTION_LENGTH));
            directionGeometry.vertices = [to3(sPos), to3(ePos)];
            this.direction = new THREE.Line(directionGeometry, this.directionMaterial);
            this.engine.scene.add(this.direction);
        }
    }

    controlM(e) {
        const m = this.mController.get();
        this.m = m;
        this.object = this.createThreeObject();
    }

    controlR(e) {
        const r = this.rController.get();
        this.r = r;
        this.object = this.createThreeObject();
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


            const v = cartesian2auto(this.v);
            var vRange = max(this.config.VELOCITY_MAX, mag(this.v) * margin);
            for (const obj of this.engine.objs) {
                vRange = max(vRange, mag(obj.v) * margin);
            }

            this.setup_controllers(posRange, this.m, this.r, v, vRange);
            this.controlBox = new ControlBox(this, this.tag, this.getControllers(), x, y);
            this.engine.controlBoxes.push(this.controlBox);
        }
    }

    setup_controllers(posRange, m, r, v, vRange) {
        this.mController = new Controller(this, "Mass m", this.config.MASS_MIN, this.config.MASS_MAX, m, this.controlM);
        this.rController = new Controller(this, "Radius r", this.config.RADIUS_MIN, this.config.RADIUS_MAX, r, this.controlR);
        this.posXController = new Controller(this, "Position x", -posRange, posRange, this.pos[0], this.controlPos);
        this.posYController = new Controller(this, "Position y", -posRange, posRange, this.pos[1], this.controlPos);
        this.vRhoController = new Controller(this, "Velocity ρ", 0, vRange, v[0], this.controlV);
        this.vPhiController = new Controller(this, "Velocity φ", -180, 180, rad2deg(v[1]), this.controlV);
    }

    getControllers() {
        return [
            this.mController,
            this.rController,
            this.posXController,
            this.posYController,
            this.vRhoController,
            this.vPhiController
        ];
    }

    destroy() {
        if (this.object) this.engine.scene.remove(this.object);
        if (this.path) this.engine.scene.remove(this.path);
        const i = this.engine.objs.indexOf(this);
        this.engine.objs.splice(i, 1);
        if (this.controlBox && this.controlBox.isOpen()) {
            this.controlBox.close();
        }
    }

    toString() {
        return JSON.stringify({'tag': this.tag, 'v': this.v, 'pos': this.pos});
    }
}

module.exports = Circle;