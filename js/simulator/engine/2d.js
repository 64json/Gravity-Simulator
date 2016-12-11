const Circle = require('../object/circle');
const {now, random, polar2cartesian, randColor} = require('../util');
const {mag, sub} = require('../matrix');
const $fps = $('#fps');
const {min, PI, atan2} = Math;

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
        this.scene.background = new THREE.Color(config.BACKGROUND);
        this.camera = new THREE.PerspectiveCamera(45, config.W / config.H, 1e-3, 1e5);
        this.camera.position.x = config.CAMERA_POSITION[0];
        this.camera.position.y = config.CAMERA_POSITION[1];
        this.camera.position.z = config.CAMERA_POSITION[2];
        this.camera.lookAt(this.scene.position);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.2;
        this.controls.enableRotate = false;

        const $gravity_input = $('#gravity_input');
        const $gravity_value = $('#gravity_value');
        $gravity_input.attr('type', config.INPUT_TYPE);
        $gravity_input.attr('min', config.G_MIN);
        $gravity_input.attr('max', config.G_MAX);
        $gravity_input.val(config.G);
        $gravity_input.attr('step', 0.0001);
        $gravity_value.text(config.G);
        $('#gravity_change').click(() => {
            const gravity = parseFloat($gravity_input.val());
            config.G = gravity;
        });
        $gravity_input.on('input', e => {
            const gravity = parseFloat($gravity_input.val());
            $gravity_value.text(gravity);
        });
    }

    toggleAnimating() {
        this.animating = !this.animating;
        document.title = `${this.config.TITLE} (${this.animating ? "Simulating" : "Paused"})`;
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

    createObject(tag, pos, m, r, v, texture) {
        const obj = new Circle(this.config, m, r, pos, v, texture, tag, this);
        this.objs.push(obj);
    }

    calculateAll() {
        for (const obj of this.objs) {
            obj.calculateVelocity();
        }
        for (let i = 0; i < this.objs.length; i++) {
            const o1 = this.objs[i];
            for (let j = i + 1; j < this.objs.length; j++) {
                const o2 = this.objs[j];
                o1.calculateCollision(o2);
            }
        }
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
            $fps.text(`${(this.fpsCount / timeDiff) | 0} fps`);
            this.fpsLastTime = currentTime;
            this.fpsCount = 0;
        }
    }

    resize() {
        this.camera.aspect = this.config.W / this.config.H;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.config.W, this.config.H);
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
        this.controls.dispose();
    }
}

module.exports = Engine2D;