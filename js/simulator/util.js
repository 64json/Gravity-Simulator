const {zeros, mag, add, sub, mul, div, dot} = require('./matrix');

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
            mag([x, y]),
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
        const rho = mag([x, y, z]);
        return [
            rho,
            Math.atan2(x, y),
            rho != 0 ? Math.acos(z / rho) : 0
        ];
    },

    cartesian2auto: (vector) => {
        return vector.length == 2
            ? Util.cartesian2polar(vector[0], vector[1])
            : Util.cartesian2spherical(vector[0], vector[1], vector[2]);
    },

    rad2deg: (rad) => {
        return rad / Math.PI * 180;
    },

    deg2rad: (deg) => {
        return deg / 180 * Math.PI;
    },

    get_distance: (x0, y0, x1, y1) => {
        return mag([x1 - x0, y1 - y0]);
    },

    rotate: (vector, matrix) => {
        return dot([vector], matrix)[0];
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
        return [
            [cos, -sin],
            [sin, cos]
        ];
    },

    get_rotation_x_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return [
            [1, 0, 0],
            [0, cos, -sin],
            [0, sin, cos]
        ];
    },

    get_rotation_y_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return [
            [cos, 0, -sin],
            [0, 1, 0],
            [sin, 0, cos]
        ];
    },

    get_rotation_z_matrix: (x, dir = 1) => {
        const sin = Math.sin(x * dir);
        const cos = Math.cos(x * dir);
        return [
            [cos, -sin, 0],
            [sin, cos, 0],
            [0, 0, 1]
        ];
    }
};

module.exports = Util;