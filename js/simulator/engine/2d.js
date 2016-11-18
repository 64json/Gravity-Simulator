const Circle = require('../object/circle');
const Camera2D = require('../camera/2d');
const {rotate, now, random, polar2cartesian, randColor, getRotationMatrix, cartesian2auto, skipInvisibleError} = require('../util');
const {zeros, mag, add, sub, mul} = require('../matrix');
const {min, max} = Math;


class Path {
    constructor(obj) {
        this.prevPos = obj.prevPos.slice();
        this.pos = obj.pos.slice();
    }
}

class Engine2D {
    constructor(config, ctx) {
        this.config = config;
        this.ctx = ctx;
        this.objs = [];
        this.animating = false;
        this.controlBoxes = [];
        this.paths = [];
        this.camera = new Camera2D(config, this);
        this.fpsLastTime = now();
        this.fpsCount = 0;
    }

    toggleAnimating() {
        this.animating = !this.animating;
        document.title = `${this.config.TITLE} (${this.animating ? "Simulating" : "Paused"})`;
    }

    destroyControlBoxes() {
        for (const controlBox of this.controlBoxes) {
            controlBox.close();
        }
        this.controlBoxes = []
    }

    animate() {
        this.printFps();
        if (this.animating) {
            this.calculateAll();
        }
        this.redrawAll();
        setTimeout(() => {
            this.animate();
        }, 10);
    }

    objectCoords(obj) {
        const r = this.camera.adjustRadius(obj.pos, obj.getRadius());
        const {coords, z} = this.camera.adjustCoords(obj.pos);
        return coords.concat(r).concat(z);
    }

    directionCoords(obj, factor = this.config.DIRECTION_LENGTH) {
        const {coords: c1} = this.camera.adjustCoords(obj.pos);
        const {coords: c2, z} = this.camera.adjustCoords(add(obj.pos, mul(obj.v, factor)));
        return c1.concat(c2).concat(z);
    }

    pathCoords(obj) {
        const {coords: c1, z1} = this.camera.adjustCoords(obj.prevPos);
        const {coords: c2, z2} = this.camera.adjustCoords(obj.pos);
        return c1.concat(c2, max(z1, z2));
    }

    drawObject(c, color = null) {
        skipInvisibleError(() => {
            color = color || c.color;
            if (c instanceof Circle) {
                c = this.objectCoords(c);
            }
            this.ctx.beginPath();
            this.ctx.arc(c[0], c[1], c[2], 0, 2 * Math.PI, false);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        });
    }

    drawDirection(c) {
        skipInvisibleError(() => {
            if (c instanceof Circle) {
                c = this.directionCoords(c);
            }
            this.ctx.beginPath();
            this.ctx.moveTo(c[0], c[1]);
            this.ctx.lineTo(c[2], c[3]);
            this.ctx.strokeStyle = '#000000';
            this.ctx.stroke();
        });
    }

    drawPath(c) {
        skipInvisibleError(() => {
            if (c instanceof Path) {
                c = this.pathCoords(c);
            }
            this.ctx.beginPath();
            this.ctx.moveTo(c[0], c[1]);
            this.ctx.lineTo(c[2], c[3]);
            this.ctx.strokeStyle = '#dddddd';
            this.ctx.stroke();
        });
    }

    createPath(obj) {
        if (mag(sub(obj.pos, obj.prevPos)) > 5) {
            this.paths.push(new Path(obj));
            obj.prevPos = obj.pos.slice();
            if (this.paths.length > this.config.MAX_PATHS) {
                this.paths = this.paths.slice(1);
            }
        }
    }

    userCreateObject(x, y) {
        const pos = this.camera.actualPoint(x, y);
        let maxR = Circle.getRadiusFromMass(this.config.MASS_MAX);
        for (const obj of this.objs) {
            maxR = min(maxR, (mag(sub(obj.pos, pos)) - obj.getRadius()) / 1.5)
        }
        const m = Circle.getMassFromRadius(random(Circle.getRadiusFromMass(this.config.MASS_MIN), maxR));
        const v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
        const color = randColor();
        const tag = `circle${this.objs.length}`;
        const obj = new Circle(this.config, m, pos, v, color, tag, this);
        obj.showControlBox(x, y);
        this.objs.push(obj);
    }

    createObject(tag, pos, m, v, color) {
        const obj = new Circle(this.config, m, pos, v, color, tag, this);
        this.objs.push(obj);
    }

    getRotationMatrix(angles, dir = 1) {
        return getRotationMatrix(angles[0], dir);
    }

    getPivotAxis() {
        return 0;
    }

    collideElastically() {
        const dimension = this.config.DIMENSION;
        for (let i = 0; i < this.objs.length; i++) {
            const o1 = this.objs[i];
            for (let j = i + 1; j < this.objs.length; j++) {
                const o2 = this.objs[j];
                const collision = sub(o2.pos, o1.pos);
                const angles = cartesian2auto(collision);
                const d = angles.shift();

                if (d < o1.getRadius() + o2.getRadius()) {
                    const R = this.getRotationMatrix(angles);
                    const R_ = this.getRotationMatrix(angles, -1);
                    const i = this.getPivotAxis();

                    const vTemp = [rotate(o1.v, R), rotate(o2.v, R)];
                    const vFinal = [vTemp[0].slice(), vTemp[1].slice()];
                    vFinal[0][i] = ((o1.m - o2.m) * vTemp[0][i] + 2 * o2.m * vTemp[1][i]) / (o1.m + o2.m);
                    vFinal[1][i] = ((o2.m - o1.m) * vTemp[1][i] + 2 * o1.m * vTemp[0][i]) / (o1.m + o2.m);
                    o1.v = rotate(vFinal[0], R_);
                    o2.v = rotate(vFinal[1], R_);

                    const posTemp = [zeros(dimension), rotate(collision, R)];
                    posTemp[0][i] += vFinal[0][i];
                    posTemp[1][i] += vFinal[1][i];
                    o1.pos = add(o1.pos, rotate(posTemp[0], R_));
                    o2.pos = add(o1.pos, rotate(posTemp[1], R_));
                }
            }
        }
    }

    calculateAll() {
        for (const obj of this.objs) {
            obj.calculateVelocity();
        }
        this.collideElastically();
        for (const obj of this.objs) {
            obj.calculatePosition();
            this.createPath(obj);
        }
    }

    redrawAll() {
        this.ctx.clearRect(0, 0, this.config.W, this.config.H);
        for (const obj of this.objs) {
            this.drawObject(obj);
            this.drawDirection(obj);
        }
        for (const path of this.paths) {
            this.drawPath(path);
        }
    }

    printFps() {
        this.fpsCount += 1;
        const currentTime = now();
        const timeDiff = currentTime - this.fpsLastTime;
        if (timeDiff > 1) {
            console.log(`${(this.fpsCount / timeDiff) | 0} fps`);
            this.fpsLastTime = currentTime;
            this.fpsCount = 0;
        }
    }
}

module.exports = Engine2D;