import robot
import robot_sense

# Move right until a wall blocks the way.
while not robot_sense.check_right():
    robot.move_right()

# Now use the same idea to move down.
while not robot_sense.check_down():
    robot.move_down()
