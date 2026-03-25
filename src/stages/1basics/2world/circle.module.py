import js  # type: ignore — provided by Pyodide runtime
_level_data: dict = _level_data  # type: ignore  # noqa: F821 — injected by worker

_colors = list(_level_data.get('colors', {}).keys())

def set_color(color):
    """Set the circle's fill color."""
    if color not in _colors:
        raise ValueError(f"Unknown color '{color}'. Choose from: {', '.join(_colors)}")
    js._record_event("set_color", [color])
