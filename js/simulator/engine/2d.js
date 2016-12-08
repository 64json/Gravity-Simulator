const Circle = require('../object/circle');
const {rotate, now, random, polar2cartesian, randColor, getRotationMatrix, cartesian2auto} = require('../util');
const {zeros, mag, add, sub} = require('../matrix');
const {min, PI, atan2, pow} = Math;

class Engine2D {
    constructor(config, renderer) {
        this.config = config;
        this.objs = [];
        this.animating = false;
        this.controlBoxes = [];
        this.fpsLastTime = now();
        this.fpsCount = 0;
        this.lastObjNo = 0;
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, config.W / config.H, 0.1, 1e5);
        this.camera.position.z = 500;
        this.camera.lookAt(this.scene.position);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
        dirLight.position.set(-1, 1, 1);
        dirLight.position.multiplyScalar(50);
        this.scene.add(dirLight);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.15;
        this.controls.enableRotate = false;
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

    destroy() {
        this.renderer = null;
        this.destroyControlBoxes();
    }

    animate() {
        if (!this.renderer) return;
        this.printFps();
        if (this.animating) {
            this.calculateAll();
        }
        this.redrawAll();
        requestAnimationFrame(this.animate.bind(this));
    }

    userCreateObject(x, y) {
        const vector = new THREE.Vector3();
        vector.set((x / this.config.W) * 2 - 1, -(y / this.config.H) * 2 + 1, 0.5);
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / dir.z;
        const position = this.camera.position.clone().add(dir.multiplyScalar(distance));
        const pos = [position.x, position.y];

        let maxR = this.config.RADIUS_MAX;
        for (const obj of this.objs) {
            maxR = min(maxR, (mag(sub(obj.pos, pos)) - obj.r) / 1.5)
        }
        const m = random(this.config.MASS_MIN, this.config.MASS_MAX);
        const r = random(this.config.RADIUS_MIN, maxR);
        const v = polar2cartesian(random(this.config.VELOCITY_MAX / 2), random(-180, 180));
        const color = randColor();
        const tag = `circle${++this.lastObjNo}`;
        const obj = new Circle(this.config, m, r, pos, v, color, tag, this);
        obj.showControlBox(x, y);
        this.objs.push(obj);
    }

    createObject(tag, pos, m, r, v, color) {
        const obj = new Circle(this.config, m, r, pos, v, color, tag, this);
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

                if (d < o1.r + o2.r) {
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
        }
    }

    redrawAll() {
        for (const obj of this.objs) {
            obj.draw();
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
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

    resize() {
        this.camera.aspect = this.config.W / this.config.H;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.config.W, this.config.H);
    }

    onMouseMove(e) {
        if (!this.mouseDown) {
            return;
        }

        let delta = atan2(e.pageY - this.config.H / 2, e.pageX - this.config.W / 2) - atan2(this.mouseY - this.config.H / 2, this.mouseX - this.config.W / 2);
        if (delta < -PI) delta += 2 * PI;
        if (delta > +PI) delta -= 2 * PI;
        this.mouseX = e.pageX;
        this.mouseY = e.pageY;
        this.camera.rotation.z += delta;
        this.camera.updateProjectionMatrix();
    }

    getCoordStep(key) {
        const currentTime = now();
        if (key == this.lastKey && currentTime - this.lastTime < 1) {
            this.combo += 1;
        } else {
            this.combo = 0;
        }
        this.lastTime = currentTime;
        this.lastKey = key;
        return this.config.CAMERA_COORD_STEP * pow(this.config.CAMERA_ACCELERATION, this.combo);
    }
}

module.exports = Engine2D;