import js  # type: ignore
_level_data: dict = _level_data  # type: ignore  # noqa: F821

_grid = _level_data.get('grid', [])
_rows = len(_grid)
_cols = len(_grid[0]) if _rows else 0

_start = (0, 0)
_goal = None
for _r in range(_rows):
    for _c in range(_cols):
        _ch = _grid[_r][_c]
        if _ch == 'S':
            _start = (_r, _c)
        elif _ch == 'G':
            _goal = (_r, _c)

_pos = _start


def _blocked(r, c):
    if not (0 <= r < _rows and 0 <= c < _cols):
        return True
    return _grid[r][c] == '#'


def _move(dr, dc):
    global _pos
    r, c = _pos
    nr, nc = r + dr, c + dc
    if _blocked(nr, nc):
        js._record_event("robot_bump", [dr, dc])
        return False
    _pos = (nr, nc)
    js._record_event("robot_move", [nr, nc])
    return True


def move_up():
    """Move one cell up. Returns True on success, False if blocked."""
    return _move(-1, 0)


def move_down():
    """Move one cell down. Returns True on success, False if blocked."""
    return _move(1, 0)


def move_left():
    """Move one cell left. Returns True on success, False if blocked."""
    return _move(0, -1)


def move_right():
    """Move one cell right. Returns True on success, False if blocked."""
    return _move(0, 1)


def at_goal():
    """True if the robot is currently on the goal cell."""
    return _goal is not None and _pos == _goal


def position():
    """Current (row, col) of the robot."""
    return _pos
