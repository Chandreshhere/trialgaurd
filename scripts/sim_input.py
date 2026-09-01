#!/usr/bin/env python3
"""Drive the booted iOS Simulator by synthesising real mouse events.

Coordinates are given in DEVICE POINTS, so they match the design spec and the
screenshots rather than whatever size the Simulator window happens to be.

    python3 scripts/sim_input.py tap 201 843
    python3 scripts/sim_input.py swipe 201 600 201 200
    python3 scripts/sim_input.py calibrate
"""
import subprocess
import sys
import time

import Quartz

# iPhone 16 Pro logical screen, in points.
DEV_W, DEV_H = 402, 874

# The Simulator draws the device scaled inside its window, with a bezel around
# it. These are the screen area's insets and size as fractions of the window
# frame, measured once; they hold as the window is moved or resized.
INSET_X, INSET_Y = 0.06057, 0.07844
FRAC_W, FRAC_H = 0.88015, 0.88922


def window_frame():
    out = subprocess.check_output([
        "osascript", "-e",
        'tell application "System Events" to tell process "Simulator" '
        'to get {position, size} of window 1',
    ], text=True)
    x, y, w, h = (int(v) for v in out.replace(" ", "").strip().split(","))
    return x, y, w, h


def to_screen(xp, yp):
    wx, wy, ww, wh = window_frame()
    return (
        wx + ww * (INSET_X + (xp / DEV_W) * FRAC_W),
        wy + wh * (INSET_Y + (yp / DEV_H) * FRAC_H),
    )


def _post(kind, x, y):
    ev = Quartz.CGEventCreateMouseEvent(None, kind, (x, y), Quartz.kCGMouseButtonLeft)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)


def activate():
    """Bring the Simulator's device window under the cursor before clicking.

    A synthesised click goes to whichever window is topmost at that point, so if
    anything else on the desktop overlaps the Simulator the click silently lands
    there instead — the failure looks exactly like a dead button. Activating the
    app is not always enough (macOS can refuse activation requested from a
    background process), so the window is also raised directly.
    """
    subprocess.run(["osascript", "-e", 'tell application "Simulator" to activate'], check=False)
    subprocess.run([
        "osascript", "-e",
        'tell application "System Events" to tell process "Simulator" '
        'to perform action "AXRaise" of window 1',
    ], check=False)
    time.sleep(0.45)


def frontmost():
    out = subprocess.run([
        "osascript", "-e",
        'tell application "System Events" to get name of first application process '
        'whose frontmost is true',
    ], capture_output=True, text=True)
    return out.stdout.strip()


def tap(xp, yp, hold=0.05):
    activate()
    x, y = to_screen(xp, yp)
    _post(Quartz.kCGEventMouseMoved, x, y)
    time.sleep(0.05)
    _post(Quartz.kCGEventLeftMouseDown, x, y)
    time.sleep(hold)
    _post(Quartz.kCGEventLeftMouseUp, x, y)
    print(f"tap device({xp},{yp}) -> screen({x:.0f},{y:.0f})")


def swipe(x1, y1, x2, y2, duration=0.35, steps=24):
    activate()
    sx1, sy1 = to_screen(x1, y1)
    sx2, sy2 = to_screen(x2, y2)
    _post(Quartz.kCGEventMouseMoved, sx1, sy1)
    _post(Quartz.kCGEventLeftMouseDown, sx1, sy1)
    for i in range(1, steps + 1):
        t = i / steps
        _post(Quartz.kCGEventLeftMouseDragged, sx1 + (sx2 - sx1) * t, sy1 + (sy2 - sy1) * t)
        time.sleep(duration / steps)
    _post(Quartz.kCGEventLeftMouseUp, sx2, sy2)
    print(f"swipe device({x1},{y1})->({x2},{y2})")


# macOS virtual key codes. The Simulator ignores the unicode string attached to
# a synthetic key event and acts on the key code alone, so every character has to
# be addressed by code — setting the string and leaving the code at 0 types "a"
# for everything, which looks like the app mangling input rather than the harness.
KEY_CODES = {
    "a": 0, "s": 1, "d": 2, "f": 3, "h": 4, "g": 5, "z": 6, "x": 7, "c": 8,
    "v": 9, "b": 11, "q": 12, "w": 13, "e": 14, "r": 15, "y": 16, "t": 17,
    "1": 18, "2": 19, "3": 20, "4": 21, "6": 22, "5": 23, "=": 24, "9": 25,
    "7": 26, "-": 27, "8": 28, "0": 29, "]": 30, "o": 31, "u": 32, "[": 33,
    "i": 34, "p": 35, "l": 37, "j": 38, "'": 39, "k": 40, ";": 41, "\\": 42,
    ",": 43, "/": 44, "n": 45, "m": 46, ".": 47, "`": 50,
    " ": 49, "\n": 36, "\t": 48,
}

# Characters reached with shift on a US layout.
SHIFTED = {":": ";", "?": "/", "_": "-", "+": "=", "|": "\\", "<": ",", ">": "."}


def type_text(text):
    """Send a string to the focused field as real key events."""
    activate()
    for ch in text:
        shift = False
        lookup = ch
        if ch in SHIFTED:
            shift, lookup = True, SHIFTED[ch]
        elif ch.isupper():
            shift, lookup = True, ch.lower()

        code = KEY_CODES.get(lookup)
        if code is None:
            print(f"  skipped unsupported character: {ch!r}")
            continue

        flags = Quartz.kCGEventFlagMaskShift if shift else 0
        for down in (True, False):
            ev = Quartz.CGEventCreateKeyboardEvent(None, code, down)
            Quartz.CGEventSetFlags(ev, flags)
            Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)
            time.sleep(0.02)
    print(f"typed {text!r}")


def press_key(code, count=1):
    """Send a raw key code, e.g. 51 for delete."""
    activate()
    for _ in range(count):
        for down in (True, False):
            ev = Quartz.CGEventCreateKeyboardEvent(None, code, down)
            Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)
            time.sleep(0.02)
    print(f"pressed key {code} x{count}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "calibrate"
    if cmd == "tap":
        tap(float(sys.argv[2]), float(sys.argv[3]),
            hold=float(sys.argv[4]) if len(sys.argv) > 4 else 0.05)
    elif cmd == "swipe":
        swipe(*(float(v) for v in sys.argv[2:6]))
    elif cmd == "type":
        type_text(sys.argv[2])
    elif cmd == "key":
        press_key(int(sys.argv[2]), int(sys.argv[3]) if len(sys.argv) > 3 else 1)
    elif cmd == "calibrate":
        activate()
        print("frontmost app:", frontmost())
        print("window frame:", window_frame())
        for p in [(0, 0), (DEV_W / 2, DEV_H / 2), (DEV_W, DEV_H)]:
            print(f"  device{p} -> screen{tuple(round(v) for v in to_screen(*p))}")
    else:
        sys.exit(f"unknown command: {cmd}")
