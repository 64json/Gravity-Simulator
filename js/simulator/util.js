module.exports = {
    polar2cartesian: (rho, phi) => {
        return [
            rho * Math.cos(phi),
            rho * Math.sin(phi)
        ];
    },

    cartesian2polar: (x, y) => {
        return [
            Math.sqrt(x ** 2 + y ** 2),
            Math.atan2(x, y)
        ];
    },

    spherical2cartesian: (rho, phi, theta) => {
        return [
            rho * Math.sin(theta) * Math.cos(phi),
            rho * Math.sin(theta) * Math.sin(phi),
            rho * Math.cos(theta)
        ];
    },

    cartesian2spherical: (x, y, z) => {
        rho = Math.sqrt(x ** 2 + y ** 2 + z ** 2)
        return [
            rho,
            Math.atan2(x, y),
            rho != 0 ? Math.acos(z / rho) : 0
        ];
    },

    cartesian2auto: (vector) => {
        return vector.length == 2
            ? cartesian2polar(vector[0], vector[1])
            : cartesian2spherical(vector[0], vector[1], vector[2]);
    },

    rad2deg: (rad) => {
        return rad / Math.pi * 180;
    },

    deg2rad: (deg) => {
        return deg / 180 * Math.pi;
    },

    get_distance: (x0, y0, x1, y1) => {
        return Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
    },

    vector_magnitude: (vector) => {
        return nj.linalg.norm(vector);
    },

    c2d: () => {
        return nj.array([0, 0]);
    },

    rotate: (vector, matrix) => {
        return (vector * matrix).getA()[0];
    },

    now: () => {
        return new Date().getTime() / 1000;
    },

    random: (min, max = null) => {
        if (max == null) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    },

    rand_color: () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },

    get_rotation_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return nj.matrix([
            [cos, -sin],
            [sin, cos]
        ]);
    },

    get_rotation_x_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return nj.matrix([
            [1, 0, 0],
            [0, cos, -sin],
            [0, sin, cos]
        ]);
    },

    get_rotation_y_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return nj.matrix([
            [cos, 0, -sin],
            [0, 1, 0],
            [sin, 0, cos]
        ]);
    },

    get_rotation_z_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return nj.matrix([
            [cos, -sin, 0],
            [sin, cos, 0],
            [0, 0, 1]
        ]);
    }
};