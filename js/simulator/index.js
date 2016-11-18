const Engine2D = require('./engine/2d');
const Engine3D = require('./engine/3d');
const {getDistance, skipInvisibleError} = require('./util');


let config = null;
const keymap = {
    38: 'up',
    40: 'down',
    37: 'left',
    39: 'right',
    90: 'zoomIn', // z
    88: 'zoomOut', // x
    87: 'rotateUp', // w
    83: 'rotateDown', // s
    65: 'rotateLeft', // a
    68: 'rotateRight' // d
};

function onResize(engine, $canvas) {
    config.W = $canvas[0].width = $canvas.width();
    config.H = $canvas[0].height = $canvas.height();
    if (engine) engine.camera.resize();
}

function onClick(event, engine) {
    const x = event.pageX;
    const y = event.pageY;
    if (!engine.animating) {
        for (const obj of engine.objs) {
            if (skipInvisibleError(() => {
                    const [cx, cy, r] = engine.objectCoords(obj);
                    if (getDistance(cx, cy, x, y) < r) {
                        obj.showControlBox(x, y);
                        return true;
                    }
                })) return;
        }
        engine.userCreateObject(x, y);
    }
}

function onKeyDown(event, engine) {
    const {keyCode} = event;
    if (keyCode == 32) { // space bar
        engine.destroyControlBoxes();
        console.log('a');
        engine.toggleAnimating();
    } else if (keyCode in keymap && keymap[keyCode] in engine.camera) {
        engine.camera[keymap[keyCode]](keyCode);
    }
}

class Simulator {
    constructor() {
        this.$canvas = $('canvas');
        this.ctx = this.$canvas[0].getContext('2d');
        $(window).resize(e => {
            onResize(this.engine, this.$canvas);
        });
        this.$canvas.click(e => {
            onClick(e, this.engine);
        });
        $('body').keydown(e => {
            onKeyDown(e, this.engine);
        });
    }

    init(preset) {
        if (this.engine) this.engine.destroy();
        config = preset({});
        document.title = config.TITLE = preset.prototype.title;
        onResize(this.engine, this.$canvas);
        this.engine = new (config.DIMENSION == 2 ? Engine2D : Engine3D)(config, this.ctx);
        if ('init' in config) config.init(this.engine);
        this.engine.animate();
    }
}

module.exports = Simulator;