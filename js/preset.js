const {extend} = $;


function EMPTY_2D(c) {
    return extend(true, c, {
        'TITLE': 'Gravity Simulator',
        'BACKGROUND': "white",
        'DIMENSION': 2,
        'MAX_PATHS': 1000,
        'CAMERA_COORD_STEP': 5,
        'CAMERA_ANGLE_STEP': 1,
        'CAMERA_ACCELERATION': 1.1,
        'G': 0.1,
        'MASS_MIN': 1,
        'MASS_MAX': 4e4,
        'VELOCITY_MAX': 10
    });
}


function EMPTY_3D(c) {
    return extend(true, EMPTY_2D(c), {
        'DIMENSION': 3,
        'G': 0.001,
        'MASS_MIN': 1,
        'MASS_MAX': 8e6,
        'VELOCITY_MAX': 10
    });
}

module.exports = EMPTY_3D;
