from __future__ import division

import math

import numpy as np


def polar2cartesian(phi, rho):
    return [rho * math.cos(phi),
            rho * math.sin(phi)]


def cartesian2polar(x, y):
    return [math.atan2(y, x),
            math.sqrt(x ** 2 + y ** 2)]


def spherical2cartesian(phi, theta, rho):
    return [rho * math.sin(theta) * math.cos(phi),
            rho * math.sin(theta) * math.sin(phi),
            rho * math.cos(theta)]


def cartesian2spherical(x, y, z):
    rho = math.sqrt(x ** 2 + y ** 2 + z ** 2)
    return [math.atan2(y, x),
            math.acos(z / rho),
            rho]


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
    return (vector * matrix).tolist()[0]
