export enum AbnormalType {
  WheelsAreStuck = 'Wheels are stuck',
  BatteryOutOfCharge = 'Battery out of charge',
  PauseEvent = 'Pause event',
  ResumeEvent = 'Resume event',
  LocalPlannerFailure = 'Local planner failure',
  CPUPerformanceIssue = 'CPU performance issue',
  LidarError = 'Lidar error',
  InvalidPlanMovebase = 'Invalid plan (move_base)',
  RecoveryFailure = 'Recovery failure',
  RobotOscillation = 'Robot oscillation',
  ObstacleDetection = 'Obstacle detection',
  DepthCameraHardwareIssue = 'Depth camera hardware issue',
  DepthCameraReset = 'Depth camera reset',
  PowerEvent = 'Power event',
  TebPlannerError = 'TEB planner error',
  USBDisconnection = 'USB disconnection'
}

export const abnormalPatterns = {
  [AbnormalType.WheelsAreStuck]: 'Wheels might be stuck',
  [AbnormalType.BatteryOutOfCharge]: 'External battery out of charge',
  [AbnormalType.PauseEvent]: 'Received request to pause session',
  [AbnormalType.ResumeEvent]: 'Resuming from state',
  [AbnormalType.LocalPlannerFailure]: 'TebLocalPlannerROS: trajectory is not feasible',
  [AbnormalType.CPUPerformanceIssue]: 'Control loop missed its desired rate of',
  [AbnormalType.LidarError]:
    'Error, rplidar internal error detected. Scan core will be reset & the node will be respawned',
  [AbnormalType.InvalidPlanMovebase]: 'Failed to convert plan',
  [AbnormalType.RecoveryFailure]:
    'Aborting because a valid plan could not be found. Even after executing all recovery behaviors',
  [AbnormalType.RobotOscillation]:
    'Aborting because the robot appears to be oscillating over and over. Even after executing all recovery behaviors',
  [AbnormalType.ObstacleDetection]: 'The goal is too close to obstacle',
  [AbnormalType.DepthCameraHardwareIssue]: 'Hardware Notification:',
  [AbnormalType.DepthCameraReset]: 'Performing Hardware Reset',
  [AbnormalType.PowerEvent]: 'PowerService: power log event',
  [AbnormalType.TebPlannerError]: 'TEB planner is spinned!',
  [AbnormalType.USBDisconnection]: 'USB disconnect, device number'
}
