const Engine2D = require('./engine/2d');
const Engine3D = require('./engine/3d');
const {get_distance} = require('./util');


let config = null;
const keymap = {
    38: 'up',
    40: 'down',
    37: 'left',
    39: 'right',
    90: 'zoom_in', // z
    88: 'zoom_out', // x
    87: 'rotate_up', // w
    83: 'rotate_down', // s
    65: 'rotate_left', // a
    68: 'rotate_right' // d
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
            const c = engine.object_coords(obj);
            const cx = (c[0] + c[2]) / 2;
            const cy = (c[1] + c[3]) / 2;
            const r = (c[2] - c[0]) / 2;
            if (get_distance(cx, cy, x, y) < r) {
                obj.show_controlbox();
                return;
            }
        }
        engine.create_object(x, y);
    }
}

function on_key_down(event, engine) {
    const {keyCode} = event;
    if (keyCode == 32) { // space bar
        engine.destroy_controlboxes();
        engine.animating = !engine.animating;
        document.title = `${config.TITLE} (${engine.animating ? "Simulating" : "Paused"})`;
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