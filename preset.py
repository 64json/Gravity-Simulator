def EMPTY_2D(c):
    c.update({
        'TITLE': 'Gravity Simulator',
        'W': 1000,
        'H': 750,
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
    })
    return c


def EMPTY_3D(c):
    EMPTY_2D(c).update({
        'DIMENSION': 3,
        'G': 0.001,
        'MASS_MIN': 1,
        'MASS_MAX': 8e6,
        'VELOCITY_MAX': 10
    })
    return c


DEFAULT = EMPTY_3D
