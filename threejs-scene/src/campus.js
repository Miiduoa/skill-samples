import { createGate } from './landmarks/gate.js'
import { createPond } from './landmarks/pond.js'
import { createBusAndStop, createScooters, createStore } from './landmarks/street.js'
import {
  createCampusBuildings,
  createGround,
  createHedge,
  createHills,
  createLamps,
} from './landmarks/terrain.js'
import { createBanyan, createFallenLeaves, createPalms } from './landmarks/trees.js'

export function createCampus(scene) {
  const colliders = []
  scene.add(createGround())
  scene.add(createGate(colliders))
  const palms = createPalms()
  scene.add(palms.group)
  colliders.push(...palms.colliders)
  scene.add(createBanyan(colliders))
  scene.add(createFallenLeaves())
  const pond = createPond(colliders)
  scene.add(pond.group)
  scene.add(createStore(colliders))
  scene.add(createBusAndStop(colliders))
  scene.add(createScooters())
  scene.add(createCampusBuildings(colliders))
  scene.add(createHills())
  scene.add(createLamps())
  scene.add(createHedge())
  return { colliders, pond }
}
