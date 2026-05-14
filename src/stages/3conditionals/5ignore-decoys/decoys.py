import robot
import robot_sense

for _ in range(4):
    if robot_sense.check_up("goal"):
        robot.move_up()
    elif robot_sense.check_down("goal"):
        robot.move_down()
    else:
        robot.move_right()
