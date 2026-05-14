import robot

_level_data: dict = _level_data  # type: ignore  # noqa: F821

_grid = _level_data.get('grid', [])
_rows = len(_grid)
_cols = len(_grid[0]) if _rows else 0


def _cell_at(r, c):
    if not (0 <= r < _rows and 0 <= c < _cols):
        return None  # out-of-bounds
    return _grid[r][c]


def _check(dr, dc, what='wall'):
    r, c = robot.position()
    cell = _cell_at(r + dr, c + dc)
    if what == 'wall':
        # off-grid counts as a wall
        return cell is None or cell == '#'
    if what == 'goal':
        return cell == 'G'
    raise ValueError(f"check expects 'wall' or 'goal', got {what!r}")


def check_up(what='wall'):
    """True if the cell above the robot contains `what` ('wall' or 'goal')."""
    return _check(-1, 0, what)


def check_down(what='wall'):
    """True if the cell below the robot contains `what` ('wall' or 'goal')."""
    return _check(1, 0, what)


def check_left(what='wall'):
    """True if the cell left of the robot contains `what` ('wall' or 'goal')."""
    return _check(0, -1, what)


def check_right(what='wall'):
    """True if the cell right of the robot contains `what` ('wall' or 'goal')."""
    return _check(0, 1, what)
