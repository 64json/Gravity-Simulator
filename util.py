from __future__ import division

import math

import numpy as np


def polar2cartesian(rho, phi):
    return [rho * math.cos(phi),
            rho * math.sin(phi)]


def cartesian2polar(x, y):
    return [math.sqrt(x ** 2 + y ** 2),
            math.atan2(y, x)]


def spherical2cartesian(rho, phi, theta):
    return [rho * math.sin(theta) * math.cos(phi),
            rho * math.sin(theta) * math.sin(phi),
            rho * math.cos(theta)]


def cartesian2spherical(x, y, z):
    rho = math.sqrt(x ** 2 + y ** 2 + z ** 2)
    return [rho,
            math.atan2(y, x),
            math.acos(z / rho) if rho != 0 else 0]


def cartesian2auto(vector):
    if len(vector) == 2:
        return cartesian2polar(vector[0], vector[1])
    return cartesian2spherical(vector[0], vector[1], vector[2])


def rad2deg(rad):
    return rad / math.pi * 180


def deg2rad(deg):
    return deg / 180 * math.pi


def get_distance(x0, y0, x1, y1):
    return math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2)


def vector_magnitude(vector):
    return np.linalg.norm(vector)


def c2d():
    return np.array([0, 0])


def rotate(vector, matrix):
    return (vector * matrix).getA()[0]
