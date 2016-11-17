const Engine2D = require('./engine/2d');
const Engine3D = require('./engine/3d');
const {} = require('./util');


let config = {};
const keymap = {
    '\uf700': 'up',
    '\uf701': 'down',
    '\uf702': 'left',
    '\uf703': 'right',
    'z': 'zoom_in',
    'x': 'zoom_out',
    'w': 'rotate_up',
    's': 'rotate_down',
    'a': 'rotate_left',
    'd': 'rotate_right'
};

class Simulator {
    constructor(preset) {
        preset(config);
        const $canvas = $('canvas');
        const ctx = $canvas.getContext('2d');
        this.engine = (config.DIMENSION == 2 ? Engine2D : Engine3D)(config, ctx);
        $canvas.keypress(this.on_key_press());
        $canvas.click(this.on_click());
    }

    animate() {
        this.engine.animate();
    }

    on_click(event) {
        const {x, y} = event;
        const engine = this.engine;
        if (!engine.animating) {
            for (const obj of engine.objs) {
                c = engine.object_coords(obj);
                cx = (c[0] + c[2]) / 2;
                cy = (c[1] + c[3]) / 2;
                r = (c[2] - c[0]) / 2;
                if (get_distance(cx, cy, x, y) < r) {
                    obj.show_controlbox();
                    return;
                }
            }
            engine.create_object(event.x, event.y);
        }
    }

    on_key_press(event) {
        const {char} = event;
        const engine = this.engine;
        if (char == ' ') {
            engine.destroy_controlboxes();
            engine.animating = !engine.animating;
            document.title = `${config.TITLE} (${engine.animating ? "Simulating" : "Paused"})`;
        } else if (char in keymap && keymap[char] in engine.camera) {
            engine.camera[keymap[char]](char);
        }
    }
}

module.exports = Simulator;