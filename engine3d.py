# -*- coding: utf-8 -*-

from __future__ import division

from engine2d import *


class Sphere(Circle):
    """Spherical coordinate system
    https://en.wikipedia.org/wiki/Spherical_coordinate_system
    """

    def __init__(self, m, pos, v, color, tag, dir_tag, engine, controlbox):
        self.pos_z_controller = None
        self.v_theta_controller = None
        super(Sphere, self).__init__(m, pos, v, color, tag, dir_tag, engine, controlbox)

    def get_r(self):
        return Sphere.get_r_from_m(self.m)

    def control_pos(self, e):
        x = self.pos_x_controller.get()
        y = self.pos_y_controller.get()
        z = self.pos_z_controller.get()
        self.pos = np.array([x, y, z])
        self.redraw()

    def control_v(self, e):
        phi = deg2rad(self.v_phi_controller.get())
        theta = deg2rad(self.v_theta_controller.get())
        rho = self.v_rho_controller.get()
        self.v = np.array(spherical2cartesian(rho, phi, theta))
        self.redraw()

    def setup_controllers(self, pos_range, m, v, v_range):
        super(Sphere, self).setup_controllers(pos_range, m, v, v_range)
        self.pos_z_controller = Controller("Position z", -pos_range, pos_range, self.pos[2], self.control_pos)
        self.v_theta_controller = Controller("Velocity θ", -180, 180, rad2deg(v[2]), self.control_v)

    def get_controllers(self):
        return [self.m_controller,
                self.pos_x_controller,
                self.pos_y_controller,
                self.pos_z_controller,
                self.v_rho_controller,
                self.v_phi_controller,
                self.v_theta_controller]

    @staticmethod
    def get_r_from_m(m):
        return m ** (1 / 3)

    @staticmethod
    def get_m_from_r(r):
        return r ** 3


class Camera3D(Camera2D):
    def __init__(self, engine, size):
        super(Camera3D, self).__init__(engine, size)
        self.theta = 0

        self.x = self.y = 0
        self.z = 5

    def get_coord_step(self, key, zoomed=True):
        return super(Camera3D, self).get_coord_step(key, False)

    def zoom_in(self, key):
        self.z -= self.get_coord_step(key) / 5
        self.refresh()

    def zoom_out(self, key):
        self.z += self.get_coord_step(key) / 5
        self.refresh()

    def rotate_up(self, key):
        self.theta -= CAMERA_ANGLE_STEP
        self.refresh()

    def rotate_down(self, key):
        self.theta += CAMERA_ANGLE_STEP
        self.refresh()

    def get_zoom(self, rotated_z):
        return 0.99 ** (self.z - rotated_z)

    def get_rotation_x_matrix(self, dir=1):
        theta = deg2rad(self.theta)
        sin = math.sin(theta)
        cos = math.cos(theta)
        return np.matrix([[1, 0, 0], [0, cos, dir * -sin], [0, dir * sin, cos]])

    def get_rotation_y_matrix(self, dir=1):
        phi = deg2rad(self.phi)
        sin = math.sin(phi)
        cos = math.cos(phi)
        return np.matrix([[cos, 0, dir * -sin], [0, 1, 0], [dir * sin, 0, cos]])

    def adjust_coord(self, c):
        Rx = self.get_rotation_x_matrix()
        Ry = self.get_rotation_y_matrix()
        c = (c * Rx * Ry).tolist()[0]
        zoom = self.get_zoom(c[2])
        x = self.cx + ((c[0] - self.x) * zoom)
        y = self.cy + ((c[1] - self.y) * zoom)
        return x, y

    def adjust_magnitude(self, c, s):
        zoom = self.get_zoom(c[2])
        return s * zoom

    def actual_point(self, x, y):
        Rx_ = self.get_rotation_x_matrix(-1)
        Ry_ = self.get_rotation_y_matrix(-1)
        c = (([x, y] - np.array([self.cx, self.cy])) + [self.x, self.y]).tolist() + [self.z]
        return (c * Rx_ * Ry_).tolist()[0]


class Engine3D(Engine2D):
    def __init__(self, canvas, size, on_key_press):
        super(Engine3D, self).__init__(canvas, size, on_key_press)
        self.camera = Camera3D(self, size)

    def create_object(self, x, y, m=None, v=None, color=None, controlbox=True):
        pos = np.array(self.camera.actual_point(x, y))
        if not m:
            max_r = Sphere.get_r_from_m(MASS_MAX)
            for obj in self.objs:
                max_r = min(max_r, (vector_magnitude(obj.pos - pos) - obj.get_r()) / 1.5)
            m = Sphere.get_m_from_r(random.randrange(Sphere.get_r_from_m(MASS_MIN), int(max_r)))
        if not v:
            v = np.array(spherical2cartesian(random.randrange(VELOCITY_MAX / 2), random.randrange(-180, 180),
                                             random.randrange(-180, 180)))
        if not color:
            rand256 = lambda: random.randint(0, 255)
            color = '#%02X%02X%02X' % (rand256(), rand256(), rand256())
        tag = "sphere%d" % len(self.objs)
        dir_tag = tag + "_dir"
        obj = Sphere(m, pos, v, color, tag, dir_tag, self, controlbox)
        self.objs.append(obj)
        self.draw_object(obj)
        self.draw_direction(obj)

    def elastic_collision(self):
        pass

    def calculate_all(self):
        for obj in self.objs:
            obj.calculate_velocity()

        self.elastic_collision()

        for obj in self.objs:
            obj.calculate_position()

    def redraw_all(self):
        for obj in self.objs:
            obj.redraw()
