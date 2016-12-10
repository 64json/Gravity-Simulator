const Engine2D = require('./engine/2d');
const Engine3D = require('./engine/3d');


let config = null;
const $rendererWrapper = $('.renderer-wrapper');

function onResize(e, engine) {
    config.W = $rendererWrapper.width();
    config.H = $rendererWrapper.height();
    if (engine) engine.resize();
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onClick(e, engine) {
    const x = e.pageX;
    const y = e.pageY;
    if (!engine.animating) {
        mouse.x = (x / config.W) * 2 - 1;
        mouse.y = -(y / config.H) * 2 + 1;
        raycaster.setFromCamera(mouse, engine.camera);
        for (const obj of engine.objs) {
            var intersects = raycaster.intersectObject(obj.object);
            if (intersects.length > 0) {
                obj.showControlBox(x, y);
                return true;
            }
        }
        engine.userCreateObject(x, y);
    }
}

function onKeyDown(e, engine) {
    const {keyCode} = e;
    if (keyCode == 32) { // space bar
        engine.destroyControlBoxes();
        engine.toggleAnimating();
    }
}

class Simulator {
    constructor() {
        this.renderer = new THREE.WebGLRenderer();
        $rendererWrapper.append(this.renderer.domElement);
        $(window).resize(e => {
            onResize(e, this.engine);
        });
        $(this.renderer.domElement).dblclick(e => {
            onClick(e, this.engine);
        });
        $('body').keydown(e => {
            e.preventDefault();
            onKeyDown(e, this.engine);
        });
    }

    init(preset) {
        if (this.engine) this.engine.destroy();
        config = preset({});
        document.title = config.TITLE = preset.prototype.title;
        this.engine = new (config.DIMENSION == 2 ? Engine2D : Engine3D)(config, this.renderer);
        onResize(null, this.engine);
        if ('init' in config) config.init(this.engine);
        this.engine.animate();
    }
}

module.exports = Simulator;