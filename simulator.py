from __future__ import division
import Tkinter

from config import *
from engine2d import Engine2D
from engine3d import Engine3D
from util import *

simulator = None
keymap = {
    u'\uf700': 'up',
    u'\uf701': 'down',
    u'\uf702': 'left',
    u'\uf703': 'right',
    'z': 'zoom_in',
    'x': 'zoom_out',
    'w': 'rotate_up',
    's': 'rotate_down',
    'a': 'rotate_left',
    'd': 'rotate_right'
}


class Simulator:
    def __init__(self, preset):
        self.tk = Tkinter.Tk()
        self.tk.title(TITLE)
        self.canvas = Tkinter.Canvas(self.tk, bg=BACKGROUND, width=SIZE, height=SIZE)
        preset(self, SIZE, on_key_press, Engine2D=Engine2D, Engine3D=Engine3D)
        self.tk.bind("<Key>", on_key_press)
        self.canvas.bind("<Button-1>", on_click)
        self.canvas.pack()


def on_click(event):
    engine = simulator.engine
    x = event.x
    y = event.y
    if not engine.animating:
        for obj in engine.objs:
            c = engine.object_coords(obj)
            cx = (c[0] + c[2]) / 2
            cy = (c[1] + c[3]) / 2
            r = (c[2] - c[0]) / 2
            if get_distance(cx, cy, x, y) < r:
                obj.show_controlbox()
                return
        engine.create_object(event.x, event.y)


def on_key_press(event):
    engine = simulator.engine
    char = event.char
    if char == ' ':
        engine.animating = not engine.animating
        simulator.tk.title("%s (%s)" % (TITLE, "Simulating" if engine.animating else "Paused"))
        engine.animate()
    elif char in keymap and hasattr(engine.camera, keymap[char]):
        getattr(engine.camera, keymap[char])(char)


def main():
    global simulator
    simulator = Simulator(PRESET)
    Tkinter.mainloop()


if __name__ == "__main__":
    main()
