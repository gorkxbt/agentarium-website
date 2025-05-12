import * as THREE from 'three';
import { CITY_SIZE, BLOCK_SIZE, ROAD_WIDTH, VEHICLE_SPEED } from './CityConstants';

// Road layout helpers - Generate valid road points
const getRoadPoints = () => {
  const points = [];
  const halfCity = CITY_SIZE / 2;
  const roadStep = BLOCK_SIZE + ROAD_WIDTH;
  
  // Generate horizontal road points with proper lanes
  for (let x = -halfCity; x <= halfCity; x += roadStep) {
    // First lane (closer to block on the north)
    for (let z = -halfCity + ROAD_WIDTH/4; z <= halfCity - ROAD_WIDTH/2; z += roadStep) {
      points.push(new THREE.Vector3(x, 0.5, z));
    }
    
    // Second lane (center of road)
    for (let z = -halfCity + ROAD_WIDTH/2; z <= halfCity - ROAD_WIDTH/4; z += roadStep) {
      points.push(new THREE.Vector3(x, 0.5, z));
    }
  }
  
  // Generate vertical road points with proper lanes
  for (let z = -halfCity; z <= halfCity; z += roadStep) {
    // First lane (closer to block on the west)
    for (let x = -halfCity + ROAD_WIDTH/4; x <= halfCity - ROAD_WIDTH/2; x += roadStep) {
      points.push(new THREE.Vector3(x, 0.5, z));
    }
    
    // Second lane (center of road)
    for (let x = -halfCity + ROAD_WIDTH/2; x <= halfCity - ROAD_WIDTH/4; x += roadStep) {
      points.push(new THREE.Vector3(x, 0.5, z));
    }
  }
  
  // Generate continuous road paths (more points to create smoother paths)
  // Horizontal roads
  for (let x = -halfCity + roadStep/2; x <= halfCity - roadStep/2; x += 5) {
    for (let i = 0; i < 2; i++) {
      // Two lanes per road
      const laneOffset = i === 0 ? ROAD_WIDTH/4 : ROAD_WIDTH/2;
      for (let z = -halfCity; z <= halfCity; z += roadStep) {
        if (!isInsideBlock(x, z + laneOffset)) {
          points.push(new THREE.Vector3(x, 0.5, z + laneOffset));
        }
      }
    }
  }
  
  // Vertical roads
  for (let z = -halfCity + roadStep/2; z <= halfCity - roadStep/2; z += 5) {
    for (let i = 0; i < 2; i++) {
      // Two lanes per road
      const laneOffset = i === 0 ? ROAD_WIDTH/4 : ROAD_WIDTH/2;
      for (let x = -halfCity; x <= halfCity; x += roadStep) {
        if (!isInsideBlock(x + laneOffset, z)) {
          points.push(new THREE.Vector3(x + laneOffset, 0.5, z));
        }
      }
    }
  }
  
  // Add intersection points
  for (let x = -halfCity; x <= halfCity; x += roadStep) {
    for (let z = -halfCity; z <= halfCity; z += roadStep) {
      // Add intersection center
      points.push(new THREE.Vector3(x, 0.5, z));
      
      // Add points around intersection for smoother turns
      for (let i = 1; i <= 3; i++) {
        const offset = i * (ROAD_WIDTH / 8);
        
        // North-East corner
        points.push(new THREE.Vector3(x + offset, 0.5, z + offset));
        
        // North-West corner
        points.push(new THREE.Vector3(x - offset, 0.5, z + offset));
        
        // South-East corner
        points.push(new THREE.Vector3(x + offset, 0.5, z - offset));
        
        // South-West corner
        points.push(new THREE.Vector3(x - offset, 0.5, z - offset));
      }
    }
  }
  
  return points;
};

// Get parking spots (near buildings but not inside them)
const getParkingSpots = () => {
  const spots = [];
  const halfCity = CITY_SIZE / 2;
  const blockStep = BLOCK_SIZE + ROAD_WIDTH;
  
  // Create parking spots along the sides of blocks with proper spacing
  for (let x = -halfCity + ROAD_WIDTH; x < halfCity; x += blockStep) {
    for (let z = -halfCity + ROAD_WIDTH; z < halfCity; z += blockStep) {
      // North side parking spots
      for (let i = 0; i < BLOCK_SIZE; i += 10) {
        const spot = new THREE.Vector3(x + i, 0.5, z - ROAD_WIDTH/2 + 2);
        spots.push(spot);
      }
      
      // South side parking spots
      for (let i = 0; i < BLOCK_SIZE; i += 10) {
        const spot = new THREE.Vector3(x + i, 0.5, z + BLOCK_SIZE + ROAD_WIDTH/2 - 2);
        spots.push(spot);
      }
      
      // West side parking spots
      for (let i = 0; i < BLOCK_SIZE; i += 10) {
        const spot = new THREE.Vector3(x - ROAD_WIDTH/2 + 2, 0.5, z + i);
        spots.push(spot);
      }
      
      // East side parking spots
      for (let i = 0; i < BLOCK_SIZE; i += 10) {
        const spot = new THREE.Vector3(x + BLOCK_SIZE + ROAD_WIDTH/2 - 2, 0.5, z + i);
        spots.push(spot);
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
  const halfCity = CITY_SIZE / 2;
  const roadStep = BLOCK_SIZE + ROAD_WIDTH;
  
  // Coordinate relative to city origin
  const relX = position.x + halfCity;
  const relZ = position.z + halfCity;
  
  // If outside city bounds, not on a road
  if (relX < 0 || relX > CITY_SIZE || relZ < 0 || relZ > CITY_SIZE) {
    return false;
  }
  
  // Modulo to find position within grid cell
  const modX = relX % roadStep;
  const modZ = relZ % roadStep;
  
  // Check horizontal roads
  const onHorizontalRoad = modZ < ROAD_WIDTH;
  
  // Check vertical roads
  const onVerticalRoad = modX < ROAD_WIDTH;
  
  return onHorizontalRoad || onVerticalRoad;
};

// Finds the nearest valid road point to keep vehicles on roads
const findNearestRoadPoint = (position: THREE.Vector3): THREE.Vector3 => {
  if (isOnRoad(position)) {
    return position.clone();
  }
  
  const halfCity = CITY_SIZE / 2;
  const roadStep = BLOCK_SIZE + ROAD_WIDTH;
  
  // Find nearest horizontal and vertical roads
  const relX = position.x + halfCity;
  const relZ = position.z + halfCity;
  
  // Calculate nearest horizontal road
  const blockZ = Math.floor(relZ / roadStep);
  const nextBlockZ = blockZ + 1;
  
  const nearestHRoad1 = blockZ * roadStep + ROAD_WIDTH / 2 - halfCity;
  const nearestHRoad2 = nextBlockZ * roadStep + ROAD_WIDTH / 2 - halfCity;
  
  const distToHRoad1 = Math.abs(position.z - nearestHRoad1);
  const distToHRoad2 = Math.abs(position.z - nearestHRoad2);
  
  const nearestHRoad = distToHRoad1 < distToHRoad2 ? nearestHRoad1 : nearestHRoad2;
  
  // Calculate nearest vertical road
  const blockX = Math.floor(relX / roadStep);
  const nextBlockX = blockX + 1;
  
  const nearestVRoad1 = blockX * roadStep + ROAD_WIDTH / 2 - halfCity;
  const nearestVRoad2 = nextBlockX * roadStep + ROAD_WIDTH / 2 - halfCity;
  
  const distToVRoad1 = Math.abs(position.x - nearestVRoad1);
  const distToVRoad2 = Math.abs(position.x - nearestVRoad2);
  
  const nearestVRoad = distToVRoad1 < distToVRoad2 ? nearestVRoad1 : nearestVRoad2;
  
  // Choose nearest road (horizontal or vertical)
  const distToHRoad = Math.min(distToHRoad1, distToHRoad2);
  const distToVRoad = Math.min(distToVRoad1, distToVRoad2);
  
  if (distToHRoad < distToVRoad) {
    return new THREE.Vector3(position.x, position.y, nearestHRoad);
  } else {
    return new THREE.Vector3(nearestVRoad, position.y, position.z);
  }
};

// Check if position is a valid parking spot
const isValidParkingSpot = (position: THREE.Vector3): boolean => {
  const parkingSpots = getParkingSpots();
  const tolerance = 2.5; // Distance tolerance for parking spot matching
  
  return parkingSpots.some(spot => 
    Math.abs(position.x - spot.x) < tolerance && 
    Math.abs(position.z - spot.z) < tolerance
  );
};

// Find nearest parking spot to a position
const findNearestParkingSpot = (position: THREE.Vector3): THREE.Vector3 => {
  const parkingSpots = getParkingSpots();
  let nearestSpot = parkingSpots[0];
  let minDistance = position.distanceTo(parkingSpots[0]);
  
  for (const spot of parkingSpots) {
    const distance = position.distanceTo(spot);
    if (distance < minDistance) {
      minDistance = distance;
      nearestSpot = spot;
    }
  }
  
  return nearestSpot.clone();
};

// Check for collisions with buildings
const detectBuildingCollision = (
  position: THREE.Vector3, 
  buildings: { position: [number, number, number], width: number, depth: number }[]
): boolean => {
  return buildings.some(building => {
    const bx = building.position[0];
    const bz = building.position[2];
    
    // Add a small buffer around buildings to prevent clipping
    const bufferZone = 1.5;
    const halfWidth = building.width / 2 + bufferZone;
    const halfDepth = building.depth / 2 + bufferZone;
    
    return (
      position.x >= bx - halfWidth &&
      position.x <= bx + halfWidth &&
      position.z >= bz - halfDepth &&
      position.z <= bz + halfDepth
    );
  });
};

// Get a new direction that avoids collision with buildings
const getAvoidanceDirection = (
  currentPos: THREE.Vector3,
  currentDir: THREE.Vector3,
  buildings: { position: [number, number, number], width: number, depth: number }[]
): THREE.Vector3 => {
  // Try a few directions and pick the first that works
  const angleOffsets = [Math.PI/4, -Math.PI/4, Math.PI/2, -Math.PI/2, 3*Math.PI/4, -3*Math.PI/4, Math.PI];
  
  for (const angleOffset of angleOffsets) {
    // Calculate new direction with the offset
    const newAngle = Math.atan2(currentDir.z, currentDir.x) + angleOffset;
    const newDir = new THREE.Vector3(Math.cos(newAngle), 0, Math.sin(newAngle)).normalize();
    
    // Test if moving in this direction would avoid collisions
    const testPos = currentPos.clone().add(newDir.clone().multiplyScalar(2));
    
    if (!detectBuildingCollision(testPos, buildings) && isOnRoad(testPos)) {
      return newDir;
    }
  }
  
  // If all directions lead to collision, try to go back the way we came
  return currentDir.clone().negate();
};

export { 
  getRoadPoints, 
  getParkingSpots, 
  isInsideBlock, 
  isOnRoad,
  findNearestRoadPoint,
  isValidParkingSpot,
  findNearestParkingSpot,
  detectBuildingCollision,
  getAvoidanceDirection
}; 