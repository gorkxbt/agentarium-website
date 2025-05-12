import * as THREE from 'three';
import { CITY_SIZE, BLOCK_SIZE, ROAD_WIDTH } from './CityConstants';

// Road layout helpers
const getRoadPoints = () => {
  const points = [];
  const halfCity = CITY_SIZE / 2;
  const roadStep = BLOCK_SIZE + ROAD_WIDTH;
  
  // Generate horizontal road points
  for (let x = -halfCity; x <= halfCity; x += roadStep) {
    for (let z = -halfCity + ROAD_WIDTH/2; z <= halfCity - ROAD_WIDTH/2; z += 2) {
      // Skip points inside blocks
      if (isInsideBlock(x, z)) continue;
      points.push(new THREE.Vector3(x, 0.5, z));
    }
  }
  
  // Generate vertical road points
  for (let z = -halfCity; z <= halfCity; z += roadStep) {
    for (let x = -halfCity + ROAD_WIDTH/2; x <= halfCity - ROAD_WIDTH/2; x += 2) {
      // Skip points inside blocks
      if (isInsideBlock(x, z)) continue;
      points.push(new THREE.Vector3(x, 0.5, z));
    }
  }
  
  return points;
};

// Get parking spots (near buildings)
const getParkingSpots = () => {
  const spots = [];
  const halfCity = CITY_SIZE / 2;
  const blockStep = BLOCK_SIZE + ROAD_WIDTH;
  
  // Create parking spots along the sides of blocks
  for (let x = -halfCity + ROAD_WIDTH; x < halfCity; x += blockStep) {
    for (let z = -halfCity + ROAD_WIDTH; z < halfCity; z += blockStep) {
      // North side parking spots
      for (let i = 0; i < BLOCK_SIZE; i += 10) {
        spots.push(new THREE.Vector3(x + i, 0.5, z - ROAD_WIDTH/2 + 2));
      }
      
      // South side parking spots
      for (let i = 0; i < BLOCK_SIZE; i += 10) {
        spots.push(new THREE.Vector3(x + i, 0.5, z + BLOCK_SIZE + ROAD_WIDTH/2 - 2));
      }
      
      // West side parking spots
      for (let i = 0; i < BLOCK_SIZE; i += 10) {
        spots.push(new THREE.Vector3(x - ROAD_WIDTH/2 + 2, 0.5, z + i));
      }
      
      // East side parking spots
      for (let i = 0; i < BLOCK_SIZE; i += 10) {
        spots.push(new THREE.Vector3(x + BLOCK_SIZE + ROAD_WIDTH/2 - 2, 0.5, z + i));
      }
    }
  }
  
  return spots;
};

// Check if position is inside a city block
const isInsideBlock = (x: number, z: number) => {
  const halfCity = CITY_SIZE / 2;
  const roadStep = BLOCK_SIZE + ROAD_WIDTH;
  
  // Coordinate relative to city origin
  const relX = x + halfCity;
  const relZ = z + halfCity;
  
  // Modulo to find position within grid cell
  const modX = relX % roadStep;
  const modZ = relZ % roadStep;
  
  // Check if point is inside a block (not on road)
  return modX >= ROAD_WIDTH && modX < ROAD_WIDTH + BLOCK_SIZE &&
         modZ >= ROAD_WIDTH && modZ < ROAD_WIDTH + BLOCK_SIZE;
};

// Check if position is on a road
const isOnRoad = (position: THREE.Vector3) => {
  return !isInsideBlock(position.x, position.z);
};

// Find nearest road point for a vehicle that went off-road
const findNearestRoadPoint = (position: THREE.Vector3) => {
  const roadPoints = getRoadPoints();
  let nearestPoint = roadPoints[0];
  let minDistance = position.distanceTo(roadPoints[0]);
  
  for (const point of roadPoints) {
    const distance = position.distanceTo(point);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }
  
  return nearestPoint;
};

export { 
  getRoadPoints, 
  getParkingSpots, 
  isInsideBlock, 
  isOnRoad,
  findNearestRoadPoint
}; 