/** World units are metres. Origin sits at the paifang centre. +Z is campus north. */

export const GATE = { x: 0, z: 0 }
export const PATH_WIDTH = 6.4
export const STREET_Z = -12.5

export const POND = { x: 13.2, z: 11.4, rx: 6.4, rz: 5.2 }
export const BANYAN = { x: -13.6, z: 13.8 }
export const STORE = { x: -15.8, z: -16.4, w: 8.4, d: 6.6, h: 4.2 }
export const BUS_STOP = { x: 12.6, z: -15.2 }
export const BUS = { x: 16.8, z: -18.4, rot: Math.PI / 2 }

export const PALM_ZS = [7.5, 15.5, 23.5, 31.5, 39.5]
export const PALM_X = 7.2

export const PLAYER_START = { x: 0.2, z: 9.4, yaw: Math.PI }
export const PLAYER_RADIUS = 0.42
export const PLAYER_SPEED = 4.6

export const WALK_WAYPOINTS = [
  [0.15, 9.6],
  [0.1, 4.2],
  [0.05, -1.2],
  [0.35, -7.2],
  [5.8, -11.2],
  [10.8, -13.2],
]

export const AERIAL = {
  target: [0, 1.4, 6],
  radius: 38,
  height: 21,
  speed: 0.22,
}

export const COLORS = {
  grassA: 0x4a5a36,
  grassB: 0x3d4c30,
  brick: 0xa45a40,
  brickDark: 0x7a4030,
  asphalt: 0x454442,
  pillar: 0xc24432,
  roof: 0x3a6248,
  plaque: 0x1c1a16,
  gold: 0xe2c16a,
  water: 0x5b7468,
  storeWall: 0xf0e6d4,
  duskFog: 0xd7b494,
}
