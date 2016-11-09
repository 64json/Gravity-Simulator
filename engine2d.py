# -*- coding: utf-8 -*-

from __future__ import division

import Tkinter
import random

import time

from control import ControlBox, Controller
from util import *
from config import *


class Circle:
    """Polar coordinate system
    https://en.wikipedia.org/wiki/Polar_coordinate_system
    """

    def __init__(self, m, pos, v, color, tag, dir_tag, engine, controlbox):
        self.m = m
        self.pos = pos
        self.prev_pos = np.copy(pos)
        self.v = v
        self.color = color
        self.tag = tag
        self.dir_tag = dir_tag
        self.engine = engine

        self.m_controller = None
        self.pos_x_controller = None
        self.pos_y_controller = None
        self.v_phi_controller = None
        self.v_rho_controller = None
        self.controlbox = None
        if controlbox:
            self.show_controlbox()

    def get_r(self):
        return Circle.get_r_from_m(self.m)

    def calculate_velocity(self):
        F = 0
        for obj in self.engine.objs:
            if obj == self:
                continue
            vector = self.pos - obj.pos
            magnitude = vector_magnitude(vector)
            unit_vector = vector / magnitude
            F += obj.m / magnitude ** 2 * unit_vector
        F *= -G * self.m
        a = F / self.m
        self.v += a

    def calculate_position(self):
        self.pos += self.v

    def control_m(self, e):
        m = self.m_controller.get()
        self.m = m
        self.redraw()

    def control_pos(self, e):
        x = self.pos_x_controller.get()
        y = self.pos_y_controller.get()
        self.pos = np.array([x, y])
        self.redraw()

    def control_v(self, e):
        phi = deg2rad(self.v_phi_controller.get())
        rho = self.v_rho_controller.get()
        self.v = np.array(polar2cartesian(phi, rho))
        self.redraw()

    def show_controlbox(self):
        try:
            self.controlbox.tk.lift()
        except:
            margin = 1.5

            pos_range = max(self.engine.camera.size / 2, abs(self.pos[0]) * margin, abs(self.pos[1]) * margin)
            for obj in self.engine.objs:
                pos_range = max(pos_range, abs(obj.pos[0]) * margin, abs(obj.pos[1]) * margin)

            m = self.m

            v = cartesian2polar(self.v[0], self.v[1])
            v_range = max(VELOCITY_MAX, vector_magnitude(self.v) * margin)
            for obj in self.engine.objs:
                v_range = max(v_range, vector_magnitude(obj.v) * margin)

            self.m_controller = Controller("Mass m", MASS_MIN, MASS_MAX, m, self.control_m)
            self.pos_x_controller = Controller("Position x", -pos_range, pos_range, self.pos[0], self.control_pos)
            self.pos_y_controller = Controller("Position y", -pos_range, pos_range, self.pos[1], self.control_pos)
            self.v_phi_controller = Controller("Velocity φ", -180, 180, rad2deg(v[0]), self.control_v)
            self.v_rho_controller = Controller("Velocity ρ", 0, v_range, v[1], self.control_v)
            self.controlbox = ControlBox(self.tag, [
                self.m_controller,
                self.pos_x_controller,
                self.pos_y_controller,
                self.v_phi_controller,
                self.v_rho_controller,
            ], self.engine.on_key_press)
            self.engine.controlboxes.append(self.controlbox.tk)

    def redraw(self):
        self.engine.move_circle(self)
        self.engine.move_direction(self)
        self.engine.create_path(self)

    def get_neighbors(self, neighbors):
        neighbors.append(self)
        for obj in self.engine.objs:
            if obj in neighbors:
                continue
            d = vector_magnitude((self.pos + self.v) - (obj.pos + obj.v))
            if d < self.get_r() + obj.get_r():
                obj.get_neighbors(neighbors)

    @staticmethod
    def get_r_from_m(m):
        return math.sqrt(m)

    @staticmethod
    def get_m_from_r(r):
        return r ** 2

    def __repr__(self):
        return str({'tag': self.tag, 'v': self.v, 'pos': self.pos})


class Path:
    def __init__(self, tag, obj):
        self.tag = tag,
        self.prev_pos = np.copy(obj.prev_pos)
        self.pos = np.copy(obj.pos)


class Camera2D:
    def __init__(self, engine, size):
        self.x = 0
        self.y = 0
        self.z = 0
        self.rho = 90
        self.engine = engine
        self.last_time = 0
        self.last_key = None
        self.combo = 0
        self.size = size
        self.cx = size / 2
        self.cy = size / 2

    def get_coord_step(self, key, zoomed=True):
        current_time = time.time()
        if key == self.last_key and current_time - self.last_time < 1:
            self.combo += 1
        else:
            self.combo = 0
        self.last_time = current_time
        self.last_key = key
        zoom = self.get_zoom() if zoomed else 1
        return CAMERA_COORD_STEP * CAMERA_ACCELERATION ** self.combo / zoom

    def up(self, key):
        step = self.get_coord_step(key)
        self.x += step * math.cos(deg2rad(self.rho))
        self.y -= step * math.sin(deg2rad(self.rho))
        self.refresh()

    def down(self, key):
        step = self.get_coord_step(key)
        self.x -= step * math.cos(deg2rad(self.rho))
        self.y += step * math.sin(deg2rad(self.rho))
        self.refresh()

    def left(self, key):
        step = self.get_coord_step(key)
        self.x -= step * (1 - math.cos(deg2rad(self.rho)))
        self.y += step * (1 - math.sin(deg2rad(self.rho)))
        self.refresh()

    def right(self, key):
        step = self.get_coord_step(key)
        self.x += step * (1 - math.cos(deg2rad(self.rho)))
        self.y -= step * (1 - math.sin(deg2rad(self.rho)))
        self.refresh()

    def zoom_in(self, key):
        step = self.get_coord_step(key, False)
        self.z -= step
        self.refresh()

    def zoom_out(self, key):
        step = self.get_coord_step(key, False)
        self.z += step
        self.refresh()

    def refresh(self):
        self.engine.redraw_all()
        self.engine.move_paths()

    def get_zoom(self):
        return 0.99 ** self.z

    def adjust(self, c):
        zoom = self.get_zoom()
        return self.cx + (c[0] - self.x) * zoom, self.cy + (c[1] - self.y) * zoom

    def actual_point(self, x, y):
        zoom = self.get_zoom()
        return (x - self.cx) / zoom + self.x, (y - self.cy) / zoom + self.y


class Engine2D:
    def __init__(self, canvas, size, on_key_press):
        self.canvas = canvas
        self.objs = []
        self.animating = False
        self.controlboxes = []
        self.paths = []
        self.camera = Camera2D(self, size)
        self.on_key_press = on_key_press

    def animate(self):
        for controlbox in self.controlboxes:
            try:
                controlbox.destroy()
            except Tkinter.TclError:
                pass
        self.controlboxes = []
        self.calculate_all()
        self.redraw_all()
        if self.animating:
            self.canvas.after(1, self.animate)

    def adjust(self, coords):
        return self.camera.adjust(coords[:2]) + self.camera.adjust(coords[2:])

    def circle_coords(self, obj):
        r = obj.get_r()
        x = obj.pos[0]
        y = obj.pos[1]
        return self.adjust((x - r, y - r, x + r, y + r))

    def direction_coords(self, obj):
        c = obj.pos
        d = obj.pos + obj.v * 50
        return self.adjust((c[0], c[1], d[0], d[1]))

    def path_coords(self, obj):
        f = obj.prev_pos
        t = obj.pos
        return self.adjust((f[0], f[1], t[0], t[1]))

    def create_circle(self, obj):
        c = self.circle_coords(obj)
        return self.canvas.create_oval(c[0], c[1], c[2], c[3], fill=obj.color, tag=obj.tag, width=0)

    def create_direction(self, obj):
        c = self.direction_coords(obj)
        return self.canvas.create_line(c[0], c[1], c[2], c[3], fill="black", tag=obj.dir_tag)

    def create_path(self, obj):
        if vector_magnitude(obj.pos - obj.prev_pos) > 3:
            c = self.path_coords(obj)
            self.paths.append(Path(self.canvas.create_line(c[0], c[1], c[2], c[3], fill="grey"), obj))
            obj.prev_pos = np.copy(obj.pos)
            if len(self.paths) > MAX_PATHS:
                self.canvas.delete(self.paths[0].tag)
                self.paths = self.paths[1:]

    def move_circle(self, obj):
        c = self.circle_coords(obj)
        self.canvas.coords(obj.tag, c[0], c[1], c[2], c[3])

    def move_direction(self, obj):
        c = self.direction_coords(obj)
        self.canvas.coords(obj.dir_tag, c[0], c[1], c[2], c[3])

    def move_paths(self):
        for path in self.paths:
            c = self.path_coords(path)
            self.canvas.coords(path.tag, c[0], c[1], c[2], c[3])

    def create_object(self, x, y, m=None, v=None, color=None, controlbox=True):
        pos = np.array(self.camera.actual_point(x, y))
        if not m:
            max_r = Circle.get_r_from_m(MASS_MAX)
            for obj in self.objs:
                max_r = min(max_r, (vector_magnitude(obj.pos - pos) - obj.get_r()) / 1.5)
            m = Circle.get_m_from_r(random.randrange(Circle.get_r_from_m(MASS_MIN), int(max_r)))
        if not v:
            v = np.array(polar2cartesian(random.randrange(-180, 180), random.randrange(VELOCITY_MAX / 2)))
        if not color:
            rand256 = lambda: random.randint(0, 255)
            color = '#%02X%02X%02X' % (rand256(), rand256(), rand256())
        tag = "circle%d" % len(self.objs)
        dir_tag = tag + "_dir"
        obj = Circle(m, pos, v, color, tag, dir_tag, self, controlbox)
        self.objs.append(obj)
        self.create_circle(obj)
        self.create_direction(obj)

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
