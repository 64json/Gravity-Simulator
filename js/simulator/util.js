const Util = {
    square: (x) => {
        return x * x;
    },

    cube: (x) => {
        return x * x * x;
    },

    polar2cartesian: (rho, phi) => {
        return [
            rho * Math.cos(phi),
            rho * Math.sin(phi)
        ];
    },

    cartesian2polar: (x, y) => {
        return [
            Math.sqrt(Util.square(x) + Util.square(y)),
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
        const rho = Math.sqrt(Util.square(x) + Util.square(y) + Util.square(z));
        return [
            rho,
            Math.atan2(x, y),
            rho != 0 ? Math.acos(z / rho) : 0
        ];
    },

    cartesian2auto: (vector) => {
        return vector.size == 2
            ? Util.cartesian2polar(vector.get(0), vector.get(1))
            : Util.cartesian2spherical(vector.get(0), vector.get(1), vector.get(2));
    },

    rad2deg: (rad) => {
        return rad / Math.PI * 180;
    },

    deg2rad: (deg) => {
        return deg / 180 * Math.PI;
    },

    get_distance: (x0, y0, x1, y1) => {
        return Math.sqrt(Util.square(x1 - x0) + Util.square(y1 - y0));
    },

    vector_magnitude: (vector) => {
        return vector.pow(2).tolist().reduce((a, b) => a + b, 0);
    },

    c2d: () => {
        return nj.array([0, 0]);
    },

    rotate: (vector, matrix) => {
        return vector.dot(matrix);
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
        return nj.array([
            [cos, -sin],
            [sin, cos]
        ]);
    },

    get_rotation_x_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return nj.array([
            [1, 0, 0],
            [0, cos, -sin],
            [0, sin, cos]
        ]);
    },

    get_rotation_y_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return nj.array([
            [cos, 0, -sin],
            [0, 1, 0],
            [sin, 0, cos]
        ]);
    },

    get_rotation_z_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return nj.array([
            [cos, -sin, 0],
            [sin, cos, 0],
            [0, 0, 1]
        ]);
    }
};

module.exports = Util;