from __future__ import division
from engine2d import *

"""Spherical coordinate system
https://en.wikipedia.org/wiki/Spherical_coordinate_system
"""


class Sphere(Circle):
    pass


class Camera3D(Camera2D):
    pass


class Engine3D(Engine2D):
    def __init__(self, canvas, size, on_key_press):
        super(Engine3D, self).__init__(canvas, size, on_key_press)
        self.camera = Camera3D(self, size)

    def object_coords(self, obj):
        r = self.camera.adjust_magnitude(obj.get_r())
        [x, y] = self.camera.adjust_coord(obj.pos)
        return x - r, y - r, x + r, y + r

    def direction_coords(self, obj):
        [cx, cy] = self.camera.adjust_coord(obj.pos)
        [dx, dy] = self.camera.adjust_coord(obj.pos + obj.v * 50)
        return cx, cy, dx, dy

    def path_coords(self, obj):
        [fx, fy] = self.camera.adjust_coord(obj.prev_pos)
        [tx, ty] = self.camera.adjust_coord(obj.pos)
        return fx, fy, tx, ty

    def create_object(self, x, y, m=None, v=None, color=None, controlbox=True):
        pos = np.array(self.camera.actual_point(x, y))
        if not m:
            max_r = Sphere.get_r_from_m(MASS_MAX)
            for obj in self.objs:
                max_r = min(max_r, (vector_magnitude(obj.pos - pos) - obj.get_r()) / 1.5)
            m = Sphere.get_m_from_r(random.randrange(Sphere.get_r_from_m(MASS_MIN), int(max_r)))
        if not v:
            v = np.array(spherical2cartesian(random.randrange(-180, 180), random.randrange(-180, 180),
                                             random.randrange(VELOCITY_MAX / 2)))
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
                d = vector_magnitude(collision)

                if d < o1.get_r() + o2.get_r():
                    theta = math.atan2(collision[1], collision[0])
                    sin = math.sin(theta)
                    cos = math.cos(theta)
                    R = np.matrix([[cos, -sin], [sin, cos]])
                    R_ = np.matrix([[cos, sin], [-sin, cos]])

                    v_temp = [[0, 0], [0, 0]]
                    v_temp[0] = rotate(o1.v, R)
                    v_temp[1] = rotate(o2.v, R)
                    v_final = [[0, 0], [0, 0]]
                    v_final[0][0] = ((o1.m - o2.m) * v_temp[0][0] + 2 * o2.m * v_temp[1][0]) / (o1.m + o2.m)
                    v_final[0][1] = v_temp[0][1]
                    v_final[1][0] = ((o2.m - o1.m) * v_temp[1][0] + 2 * o1.m * v_temp[0][0]) / (o1.m + o2.m)
                    v_final[1][1] = v_temp[1][1]
                    o1.v = np.array(rotate(v_final[0], R_))
                    o2.v = np.array(rotate(v_final[1], R_))

                    pos_temp = [[0, 0], [0, 0]]
                    pos_temp[1] = rotate(collision, R)
                    pos_temp[0][0] += v_final[0][0]
                    pos_temp[1][0] += v_final[1][0]
                    pos_final = [[0, 0], [0, 0]]
                    pos_final[0] = rotate(pos_temp[0], R_)
                    pos_final[1] = rotate(pos_temp[1], R_)
                    o1.pos = o1.pos + pos_final[0]
                    o2.pos = o1.pos + pos_final[1]

    def calculate_all(self):
        for obj in self.objs:
            obj.calculate_velocity()

        self.elastic_collision()

        for obj in self.objs:
            obj.calculate_position()

    def redraw_all(self):
        for obj in self.objs:
            obj.redraw()
