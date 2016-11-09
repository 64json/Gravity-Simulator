def EMPTY_2D(simulator, size, on_key_press, **kwargs):
    simulator.engine = kwargs['Engine2D'](simulator.canvas, size, on_key_press)


def EMPTY_3D(simulator, size, on_key_press, **kwargs):
    simulator.engine = kwargs['Engine3D'](simulator.canvas, size, on_key_press)
