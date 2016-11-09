from __future__ import division
import Tkinter

from engine2d import Engine2D
from engine3d import Engine3D
from util import *
from config import *

mapping = {
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


def on_click(event):
    x = event.x
    y = event.y
    if not engine.animating:
        for obj in engine.objs:
            c = engine.circle_coords(obj)
            cx = (c[0] + c[2]) / 2
            cy = (c[1] + c[3]) / 2
            r = (c[2] - c[0]) / 2
            if get_distance(cx, cy, x, y) < r:
                obj.show_controlbox()
                return
        engine.create_object(event.x, event.y)


def on_key_press(event):
    char = event.char
    if char == ' ':
        engine.animating = not engine.animating
        tk.title("%s (%s)" % (TITLE, "Simulating" if engine.animating else "Paused"))
        engine.animate()
    elif char in mapping:
        getattr(engine.camera, mapping[char])(char)


tk = Tkinter.Tk()
tk.title(TITLE)
canvas = Tkinter.Canvas(tk, bg="white", width=SIZE, height=SIZE)
engine = (Engine2D if DIMENSION == 2 else Engine3D)(canvas, SIZE, on_key_press)
tk.bind("<Key>", on_key_press)
canvas.bind("<Button-1>", on_click)
canvas.pack()
Tkinter.mainloop()
