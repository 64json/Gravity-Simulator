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
        RADIUS_MIN: 1,
        RADIUS_MAX: 2e2,
        VELOCITY_MAX: 10,
        DIRECTION_LENGTH: 50,
        CAMERA_DISTANCE: 100,
        INPUT_TYPE: 'range',
        CAMERA_POSITION: [0, 0, 500]
    });
}
EMPTY_2D.prototype.title = '2D Gravity Simulator';


function EMPTY_3D(c) {
    return extend(true, EMPTY_2D(c), {
        DIMENSION: 3,
        G: 0.001,
        MASS_MIN: 1,
        MASS_MAX: 8e6,
        RADIUS_MIN: 1,
        RADIUS_MAX: 2e2,
        VELOCITY_MAX: 10
    });
}
EMPTY_3D.prototype.title = '3D Gravity Simulator';

function MANUAL_2D(c) {
    return extend(true, EMPTY_2D(c), {
        INPUT_TYPE: 'number'
    });
}
MANUAL_2D.prototype.title = '2D Manual';

function MANUAL_3D(c) {
    return extend(true, EMPTY_3D(c), {
        INPUT_TYPE: 'number'
    });
}
MANUAL_3D.prototype.title = '3D Manual';

function ORBITING(c) {
    return extend(true, EMPTY_3D(c), {
        init: (engine) => {
            engine.createObject('Ball A', [0, 0, 0], 1000000, 100, [0, 0, 0], 'blue');
            engine.createObject('Ball B', [180, 0, 0], 1, 20, [0, 2.4, 0], 'red');
            engine.createObject('Ball C', [240, 0, 0], 1, 20, [0, 2.1, 0], 'yellow');
            engine.createObject('Ball D', [300, 0, 0], 1, 20, [0, 1.9, 0], 'green');
            engine.toggleAnimating();
        }
    });
}
ORBITING.prototype.title = 'Orbiting';

function COLLISION(c) {
    return extend(true, EMPTY_3D(c), {
        init: (engine) => {
            engine.createObject('Ball A', [-100, 0, 0], 100000, 50, [.5, .5, 0], 'blue');
            engine.createObject('Ball B', [100, 0, 0], 100000, 50, [-.5, -.5, 0], 'red');
            engine.createObject('Ball C', [0, 100, 0], 100000, 50, [0, 0, 0], 'green');
            engine.toggleAnimating();
        }
    });
}
COLLISION.prototype.title = 'Elastic Collision';

function SOLAR_SYSTEM(c) {
    const k_v = 5e-2;
    const k_r = (r) => {
        return Math.pow(Math.log(r), 3) * 1e-2;
    };
    return extend(true, MANUAL_3D(c), {
        G: 398682.84288e-6 * Math.pow(k_v, 2),
        CAMERA_POSITION: [0, 0, 5e2],
        /**
         * Length: km
         * Mass: earth mass
         *
         * https://en.wikipedia.org/wiki/List_of_Solar_System_objects_by_size
         * http://nssdc.gsfc.nasa.gov/planetary/factsheet/
         */

        init: (engine) => {
            engine.createObject('Sun', [0, 0, 0], 333000, k_r(696342), [0, 0, 0], 'map/solar_system/sun.jpg');
            engine.createObject('Mercury', [57.9, 0, 0], 0.0553, k_r(2439.7), [0, 47.4 * k_v, 0], 'map/solar_system/mercury.png');
            engine.createObject('Venus', [108.2, 0, 0], 0.815, k_r(6051.8), [0, 35.0 * k_v, 0], 'map/solar_system/venus.jpg');
            engine.createObject('Earth', [149.6, 0, 0], 1, k_r(6371.0), [0, 29.8 * k_v, 0], 'map/solar_system/earth.jpg');
            engine.createObject('Mars', [227.9, 0, 0], 0.107, k_r(3389.5), [0, 24.1 * k_v, 0], 'map/solar_system/mars.jpg');
            engine.createObject('Jupiter', [778.6, 0, 0], 317.83, k_r(69911), [0, 13.1 * k_v, 0], 'map/solar_system/jupiter.jpg');
            engine.createObject('Saturn', [1433.5, 0, 0], 95.162, k_r(58232), [0, 9.7 * k_v, 0], 'map/solar_system/saturn.jpg');
            engine.createObject('Uranus', [2872.5, 0, 0], 14.536, k_r(25362), [0, 6.8 * k_v, 0], 'map/solar_system/uranus.jpg');
            engine.createObject('Neptune', [4495.1, 0, 0], 17.147, k_r(24622), [0, 5.4 * k_v, 0], 'map/solar_system/neptune.jpg');
            engine.toggleAnimating();
        }
    });
}
SOLAR_SYSTEM.prototype.title = 'Solar System';

module.exports = [EMPTY_2D, EMPTY_3D, MANUAL_2D, MANUAL_3D, ORBITING, COLLISION, SOLAR_SYSTEM];