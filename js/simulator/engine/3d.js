const Engine2D = require('./2d');
const Sphere = require('../object/sphere');
const {random, getYRotationMatrix, getZRotationMatrix, randColor, spherical2cartesian, skipInvisibleError} = require('../util');
const {mag, sub, dot} = require('../matrix');
const {min} = Math;


class Engine3D extends Engine2D {
    constructor(config, renderer) {
        super(config, renderer);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }

    userCreateObject(x, y) {
        const vector = new THREE.Vector3();
        vector.set((x / this.config.W) * 2 - 1, -(y / this.config.H) * 2 + 1, 0.5);
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / dir.z;
        const position = this.camera.position.clone().add(dir.multiplyScalar(distance));
        const pos = [position.x, position.y, position.z];

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
                const coords = this.camera.objectCoords(obj);
                const z = coords.pop();
                orders.push(['object', coords, z, obj.color]);
            });
        }
        for (const obj of this.objs) {
            skipInvisibleError(() => {
                const coords = this.camera.directionCoords(obj);
                const z = coords.pop();
                orders.push(['direction', coords, z]);
            });
        }
        for (const path of this.paths) {
            skipInvisibleError(() => {
                const coords = this.camera.pathCoords(path);
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