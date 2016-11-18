const Engine2D = require('./2d');
const Camera3D = require('../camera/3d');
const Sphere = require('../object/sphere');
const {random, getYRotationMatrix, getZRotationMatrix, randColor, spherical2cartesian, skipInvisibleError} = require('../util');
const {mag, sub, dot} = require('../matrix');
const {min} = Math;


class Engine3D extends Engine2D {
    constructor(config, ctx) {
        super(config, ctx);
        this.camera = new Camera3D(config, this);
    }

    directionCoords(obj) {
        const c = this.camera.rotatedCoords(obj.pos);
        const adjustedFactor = (this.camera.z - c[2] - 1) / obj.v[2];
        let factor = this.config.DIRECTION_LENGTH;
        if (adjustedFactor > 0) factor = min(factor, adjustedFactor);
        return super.directionCoords(obj, factor);
    }

    userCreateObject(x, y) {
        const pos = this.camera.actualPoint(x, y);
        let maxR = Sphere.getRadiusFromMass(this.config.MASS_MAX);
        for (const obj of this.objs) {
            maxR = min(maxR, (mag(sub(obj.pos, pos)) - obj.getRadius()) / 1.5);
        }
        const m = Sphere.getMassFromRadius(random(Sphere.getRadiusFromMass(this.config.MASS_MIN), maxR));
        const v = spherical2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180), random(-180, 180));
        const color = randColor();
        const tag = `sphere${++this.lastObjNo}`;
        const obj = new Sphere(this.config, m, pos, v, color, tag, this);
        obj.showControlBox(x, y);
        this.objs.push(obj);
    }

    createObject(tag, pos, m, v, color) {
        const obj = new Sphere(this.config, m, pos, v, color, tag, this);
        this.objs.push(obj);
    }

    getRotationMatrix(angles, dir = 1) {
        return dot(getZRotationMatrix(angles[0], dir), getYRotationMatrix(angles[1], dir), dir);
    }

    getPivotAxis() {
        return 2;
    }

    redrawAll() {
        this.ctx.clearRect(0, 0, this.config.W, this.config.H);
        const orders = [];
        for (const obj of this.objs) {
            skipInvisibleError(() => {
                const coords = this.objectCoords(obj);
                const z = coords.pop();
                orders.push(['object', coords, z, obj.color]);
            });
        }
        for (const obj of this.objs) {
            skipInvisibleError(() => {
                const coords = this.directionCoords(obj);
                const z = coords.pop();
                orders.push(['direction', coords, z]);
            });
        }
        for (const path of this.paths) {
            skipInvisibleError(() => {
                const coords = this.pathCoords(path);
                const z = coords.pop();
                orders.push(['path', coords, z]);
            });
        }
        orders.sort(function (a, b) {
            return a[2] - b[2];
        });
        for (const [type, coords, z, color] of orders) {
            switch (type) {
                case 'object':
                    this.drawObject(coords, color);
                    break;
                case 'direction':
                    this.drawDirection(coords);
                    break;
                case 'path':
                    this.drawPath(coords);
                    break;
            }
        }
    }
}

module.exports = Engine3D;