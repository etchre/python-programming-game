import robot
import robot_sense

# If the right side is blocked, step down first.
if robot_sense.check_right():
    robot.move_down()

robot.move_right()
