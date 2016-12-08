const Engine2D = require('./2d');
const Sphere = require('../object/sphere');
const {random, getYRotationMatrix, getZRotationMatrix, randColor, spherical2cartesian, skipInvisibleError} = require('../util');
const {mag, sub, dot} = require('../matrix');
const {min, abs} = Math;


class Engine3D extends Engine2D {
    constructor(config, renderer) {
        super(config, renderer);
        this.controls.enableRotate = true;
    }

    userCreateObject(x, y) {
        const vector = new THREE.Vector3();
        vector.set((x / this.config.W) * 2 - 1, -(y / this.config.H) * 2 + 1, 0.5);
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        const distance = this.config.RADIUS_MAX * 3 - this.camera.position.z / dir.z;
        const p = this.camera.position.clone().add(dir.multiplyScalar(distance));
        const pos = [p.x, p.y, p.z];

        let maxR = this.config.RADIUS_MAX;
        for (const obj of this.objs) {
            maxR = min(maxR, (mag(sub(obj.pos, pos)) - obj.r) / 1.5)
        }
        const m = random(this.config.MASS_MIN, this.config.MASS_MAX);
        const r = random(this.config.RADIUS_MIN, maxR);
        const v = spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180));
        const color = randColor();
        const tag = `sphere${++this.lastObjNo}`;
        const obj = new Sphere(this.config, m, r, pos, v, color, tag, this);
        obj.showControlBox(x, y);
        this.objs.push(obj);
    }

    createObject(tag, pos, m, r, v, color) {
        const obj = new Sphere(this.config, m, r, pos, v, color, tag, this);
        this.objs.push(obj);
    }

    getRotationMatrix(angles, dir = 1) {
        return dot(getZRotationMatrix(angles[0], dir), getYRotationMatrix(angles[1], dir), dir);
    }

    getPivotAxis() {
        return 2;
    }

    onMouseMove(e) {
    }

    onMouseDown(e) {
    }

    onMouseUp(e) {
    }

    updatePosition() {
        super.updatePosition();
    }
}

module.exports = Engine3D;