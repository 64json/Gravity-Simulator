const Engine2D = require('./2d');


class Sphere(Circle):
    """Spherical coordinate system
    https://en.wikipedia.org/wiki/Spherical_coordinate_system
    """

    def __init__(self, config, m, pos, v, color, tag, dir_tag, engine, controlbox):
        self.pos_z_controller = None
        self.v_theta_controller = None
        super(Sphere, self).__init__(config, m, pos, v, color, tag, dir_tag, engine, controlbox)

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
    def __init__(self, config, engine):
        super(Camera3D, self).__init__(config, engine)
        self.theta = 0

    def rotate_up(self, key):
        self.theta -= self.config.CAMERA_ANGLE_STEP
        self.refresh()

    def rotate_down(self, key):
        self.theta += self.config.CAMERA_ANGLE_STEP
        self.refresh()

    def adjust_coord(self, c, allow_invisible=False):
        Rx = get_rotation_x_matrix(deg2rad(self.theta))
        Ry = get_rotation_y_matrix(deg2rad(self.phi))
        c = rotate(rotate(c, Rx), Ry)
        zoom = self.get_zoom(c[2], allow_invisible)
        return self.center + (c[:2] - [self.x, self.y]) * zoom

    def adjust_radius(self, c, r):
        Rx = get_rotation_x_matrix(deg2rad(self.theta))
        Ry = get_rotation_y_matrix(deg2rad(self.phi))
        c = rotate(rotate(c, Rx), Ry)
        zoom = self.get_zoom(c[2])
        return r * zoom

    def actual_point(self, x, y):
        Rx_ = get_rotation_x_matrix(deg2rad(self.theta), -1)
        Ry_ = get_rotation_y_matrix(deg2rad(self.phi), -1)
        c = (([x, y] - self.center) + [self.x, self.y]).tolist() + [0]
        return rotate(rotate(c, Ry_), Rx_)


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
    def __init__(self, config, canvas, on_key_press):
        super(Engine3D, self).__init__(config, canvas, on_key_press)
        self.camera = Camera3D(config, self)

    def create_object(self, x, y, m=None, v=None, color=None, controlbox=True):
        pos = np.array(self.camera.actual_point(x, y))
        if not m:
            max_r = Sphere.get_r_from_m(self.config.MASS_MAX)
            for obj in self.objs:
                max_r = min(max_r, (vector_magnitude(obj.pos - pos) - obj.get_r()) / 1.5)
            m = Sphere.get_m_from_r(random.randrange(Sphere.get_r_from_m(self.config.MASS_MIN), int(max_r)))
        if not v:
            v = np.array(
                spherical2cartesian(random.randrange(self.config.VELOCITY_MAX / 2), random.randrange(-180, 180),
                                    random.randrange(-180, 180)))
        if not color:
            rand256 = lambda: random.randint(0, 255)
            color = '#%02X%02X%02X' % (rand256(), rand256(), rand256())
        tag = "sphere%d" % len(self.objs)
        dir_tag = tag + "_dir"
        obj = Sphere(self.config, m, pos, v, color, tag, dir_tag, self, controlbox)
        self.objs.append(obj)
        self.draw_object(obj)
        self.draw_direction(obj)

    def get_rotation_matrix(self, angles, dir=1):
        return get_rotation_z_matrix(angles[0]) * get_rotation_x_matrix(angles[1]) if dir == 1 else \
            get_rotation_x_matrix(angles[1], -1) * get_rotation_z_matrix(angles[0], -1)
