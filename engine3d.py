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
        self.z = 100

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

    def get_zoom(self, z, allow_invisible=False):
        distance = self.z - z
        if allow_invisible:
            if distance == 0:
                distance = 1e-10
            elif distance < 0:
                distance *= -1
        elif distance <= 0:
            raise InvisibleError
        return 100 / distance

    def adjust_coord(self, c, allow_invisible=False):
        Rx = get_rotation_x_matrix(deg2rad(self.theta))
        Ry = get_rotation_y_matrix(deg2rad(self.phi))
        c = rotate(rotate(c, Rx), Ry)
        zoom = self.get_zoom(c[2], allow_invisible)
        return self.center + (c[:2] - [self.x, self.y]) * zoom

    def adjust_magnitude(self, c, s):
        Rx = get_rotation_x_matrix(deg2rad(self.theta))
        Ry = get_rotation_y_matrix(deg2rad(self.phi))
        c = rotate(rotate(c, Rx), Ry)
        zoom = self.get_zoom(c[2])
        return s * zoom

    def actual_point(self, x, y):
        Rx_ = get_rotation_x_matrix(deg2rad(self.theta), -1)
        Ry_ = get_rotation_y_matrix(deg2rad(self.phi), -1)
        c = (([x, y] - self.center) + [self.x, self.y]).tolist() + [0]
        return (c * Rx_ * Ry_).tolist()[0]


def get_rotation_x_matrix(x, dir=1):
    sin = math.sin(x * dir)
    cos = math.cos(x * dir)
    return np.matrix([
        [1, 0, 0],
        [0, cos, -sin],
        [0, sin, cos]
    ])


def get_rotation_y_matrix(x, dir=1):
    sin = math.sin(x * dir)
    cos = math.cos(x * dir)
    return np.matrix([
        [cos, 0, -sin],
        [0, 1, 0],
        [sin, 0, cos]
    ])


def get_rotation_z_matrix(x, dir=1):
    sin = math.sin(x * dir)
    cos = math.cos(x * dir)
    return np.matrix([
        [cos, -sin, 0],
        [sin, cos, 0],
        [0, 0, 1]
    ])


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
        for i in range(0, len(self.objs)):
            o1 = self.objs[i]
            for j in range(i + 1, len(self.objs)):
                o2 = self.objs[j]
                collision = o2.pos - o1.pos
                d, phi, theta = cartesian2spherical(collision[0], collision[1], collision[2])

                if d < o1.get_r() + o2.get_r():
                    R = get_rotation_z_matrix(phi) * get_rotation_x_matrix(theta)
                    R_ = get_rotation_x_matrix(theta, -1) * get_rotation_z_matrix(phi, -1)

                    v_temp = [[0, 0, 0], [0, 0, 0]]
                    v_temp[0] = rotate(o1.v, R)
                    v_temp[1] = rotate(o2.v, R)
                    v_final = [[0, 0, 0], [0, 0, 0]]
                    v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m)
                    v_final[0][1] = v_temp[0][1]
                    v_final[0][2] = v_temp[0][2]
                    v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m)
                    v_final[1][1] = v_temp[1][1]
                    v_final[1][2] = v_temp[1][2]
                    o1.v = rotate(v_final[0], R_)
                    o2.v = rotate(v_final[1], R_)

                    pos_temp = [[0, 0, 0], [0, 0, 0]]
                    pos_temp[1] = rotate(collision, R)
                    pos_temp[0][0] += v_final[0][0]
                    pos_temp[1][0] += v_final[1][0]
                    pos_final = [[0, 0, 0], [0, 0, 0]]
                    pos_final[0] = rotate(pos_temp[0], R_)
                    pos_final[1] = rotate(pos_temp[1], R_)
                    o1.pos = o1.pos + pos_final[0]
                    o2.pos = o1.pos + pos_final[1]