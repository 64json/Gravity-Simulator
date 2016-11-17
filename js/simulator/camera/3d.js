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