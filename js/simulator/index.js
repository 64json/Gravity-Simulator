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

function on_resize($canvas) {
    config.W = $canvas[0].width = $canvas.width();
    config.H = $canvas[0].height = $canvas.height();
}

function on_click(event, engine) {
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

function on_key_down(event, engine) {
    const {keyCode} = event;
    if (keyCode == 32) { // space bar
        engine.destroyControlBoxes();
        engine.toggleAnimating();
    } else if (keyCode in keymap && keymap[keyCode] in engine.camera) {
        engine.camera[keymap[keyCode]](keyCode);
    }
}

class Simulator {
    constructor(preset) {
        config = preset({});
        const $canvas = $('canvas');
        const ctx = $canvas[0].getContext('2d');
        on_resize($canvas);
        this.engine = new (config.DIMENSION == 2 ? Engine2D : Engine3D)(config, ctx);
        if ('init' in config) config.init(this.engine);
        $canvas.resize(e => {
            on_resize($canvas);
        });
        $canvas.click(e => {
            on_click(e, this.engine);
        });
        $('body').keydown(e => {
            on_key_down(e, this.engine);
        });
    }

    animate() {
        this.engine.animate();
    }
}

module.exports = Simulator;