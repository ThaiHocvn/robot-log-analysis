export const ABNORMAL_MESSAGES = {
  WHEELS_ARE_STUCK: 'Wheels might be stuck',
  BATTERY_OUT_OF_CHARGE: 'External battery out of charge',
  PAUSE_EVENT: 'Received request to pause session',
  RESUME_EVENT: 'Resuming from state',
  LOCAL_PLANNER_FAILURE: 'TebLocalPlannerROS: trajectory is not feasible',
  CPU_PERFORMANCE_ISSUE: 'Control loop missed its desired rate of',
  LIDAR_ERROR: 'Error, rplidar internal error detected. Scan core will be reset & the node will be respawned',
  INVALID_PLAN_MOVE_BASE: 'Failed to convert plan',
  RECOVERY_FAILURE: 'Aborting because a valid plan could not be found. Even after executing all recovery behaviors',
  ROBOT_OSCILLATION:
    'Aborting because the robot appears to be oscillating over and over. Even after executing all recovery behaviors',
  OBSTACLE_DETECTION: 'The goal is too close to obstacle',
  DEPTH_CAMERA_HARDWARE_ISSUE: 'Hardware Notification:',
  DEPTH_CAMERA_RESET: 'Performing Hardware Reset',
  POWER_EVENT: 'PowerService: power log event',
  TEB_PLANNER_ERROR: 'TEB planner is spinned!',
  USB_DISCONNECTION: 'USB disconnect, device number'
} as const

export const COMMON_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  INVALID_ID: 'Invalid id',
  LOG_NOT_FOUND: 'Log not found'
}
