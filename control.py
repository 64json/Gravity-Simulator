import Tkinter


class Controller:
    def __init__(self, name, min, max, value, func):
        self.name = name
        self.min = min
        self.max = max
        self.value = value
        self.func = func

    def get(self):
        return self.scale.get()


class ControlBox:
    def show_values(self):
        print (self.w1.get(), self.w2.get())

    def __init__(self, title, controllers, on_key_press):
        self.tk = Tkinter.Tk()
        self.tk.title(title)
        self.tk.bind("<Key>", on_key_press)
        for c in controllers:
            Tkinter.Label(self.tk, text=c.name).pack()
            c.scale = Tkinter.Scale(self.tk, from_=c.min, to=c.max, resolution=.1, orient=Tkinter.HORIZONTAL,
                                    command=c.func, length=500)
            c.scale.set(c.value)
            c.scale.pack()
