import robot
import robot_sense

for _ in range(3):
    while not robot_sense.check_right():
        robot.move_right()

    # Add another loop here to move down until blocked.
