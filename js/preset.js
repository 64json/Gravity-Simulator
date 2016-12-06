const {extend} = $;


function EMPTY_2D(c) {
    return extend(true, c, {
        BACKGROUND: 'white',
        DIMENSION: 2,
        MAX_PATHS: 1000,
        CAMERA_COORD_STEP: 5,
        CAMERA_ANGLE_STEP: 1,
        CAMERA_ACCELERATION: 1.1,
        G: 0.1,
        MASS_MIN: 1,
        MASS_MAX: 4e4,
        VELOCITY_MAX: 10,
        DIRECTION_LENGTH: 50,
        CAMERA_X: 0,
        CAMERA_Y: 0,
        CAMERA_Z: 200,
        FOCAL_LENGTH: 100,
        INPUT_TYPE: 'range'
    });
}
EMPTY_2D.prototype.title = '2D Gravity Simulator';


function EMPTY_3D(c) {
    return extend(true, EMPTY_2D(c), {
        DIMENSION: 3,
        G: 0.001,
        MASS_MIN: 1,
        MASS_MAX: 8e6,
        VELOCITY_MAX: 10
    });
}
EMPTY_3D.prototype.title = '3D Gravity Simulator';

function WOO_2D(c) {
    return extend(true, EMPTY_2D(c), {
        INPUT_TYPE: 'number'
    });
}
WOO_2D.prototype.title = '2D WOO';

function WOO_3D(c) {
    return extend(true, EMPTY_3D(c), {
        INPUT_TYPE: 'number'
    });
}
WOO_3D.prototype.title = '3D WOO';

function DEBUG(c) {
    return extend(true, EMPTY_3D(c), {
        init: (engine) => {
            engine.createObject('ball1', [-150, 0, 0], 1000000, [0, 0, 0], 'green');
            engine.createObject('ball2', [50, 0, 0], 10000, [0, 0, 0], 'blue');
            engine.toggleAnimating();
        }
    });
}
DEBUG.prototype.title = 'DEBUG';

module.exports = [EMPTY_2D, EMPTY_3D, WOO_2D, WOO_3D, DEBUG];