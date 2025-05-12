import * as THREE from 'three';
import { CITY_SIZE, BLOCK_SIZE, ROAD_WIDTH } from './CityConstants';

// Road layout helpers
const getRoadPoints = (roadCoordinates?: any[], spacing?: number): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  const halfCity = CITY_SIZE / 2;
  const roadStep = BLOCK_SIZE + ROAD_WIDTH;
  
  // If custom road coordinates are provided, use them
  if (roadCoordinates && Array.isArray(roadCoordinates)) {
    // Process custom road coordinates with specified spacing
    const step = spacing || 2;
    
    roadCoordinates.forEach(road => {
      if (road.startX !== undefined && road.startZ !== undefined && 
          road.endX !== undefined && road.endZ !== undefined) {
        // Calculate points along this road segment
        const start = new THREE.Vector3(road.startX, 0.5, road.startZ);
        const end = new THREE.Vector3(road.endX, 0.5, road.endZ);
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const length = start.distanceTo(end);
        
        // Create points at regular intervals
        for (let d = 0; d <= length; d += step) {
          const point = new THREE.Vector3()
            .copy(start)
            .add(direction.clone().multiplyScalar(d));
          points.push(point);
        }
      }
    });
    
    // If we generated points from custom coordinates, return them
    if (points.length > 0) {
      return points;
    }
  }
  
  // Default behavior - generate grid-based road points
  // Generate horizontal road points
  for (let x = -halfCity; x <= halfCity; x += roadStep) {
    for (let z = -halfCity + ROAD_WIDTH/2; z <= halfCity - ROAD_WIDTH/2; z += spacing || 2) {
      // Skip points inside blocks
      if (isInsideBlock(x, z)) continue;
      points.push(new THREE.Vector3(x, 0.5, z));
    }
  }
  
  // Generate vertical road points
  for (let z = -halfCity; z <= halfCity; z += roadStep) {
    for (let x = -halfCity + ROAD_WIDTH/2; x <= halfCity - ROAD_WIDTH/2; x += spacing || 2) {
      // Skip points inside blocks
      if (isInsideBlock(x, z)) continue;
      points.push(new THREE.Vector3(x, 0.5, z));
    }
  }
  
  return points;
};

// Get parking spots (near buildings)
const getParkingSpots = (buildings?: any[], spotsPerBuilding?: number): THREE.Vector3[] => {
  const spots: THREE.Vector3[] = [];
  const halfCity = CITY_SIZE / 2;
  const blockStep = BLOCK_SIZE + ROAD_WIDTH;
  
  // If buildings are provided, create parking spots near them
  if (buildings && Array.isArray(buildings) && buildings.length > 0) {
    // Number of spots to create per building
    const spotsPerBldg = spotsPerBuilding || 3;
    
    buildings.forEach(building => {
      if (building.position && Array.isArray(building.position) && building.position.length >= 3) {
        const [bx, , bz] = building.position;
        const width = building.width || 10;
        const depth = building.depth || 10;
        
        // Create spots around the building
        for (let i = 0; i < spotsPerBldg; i++) {
          // Choose a side of the building
          const side = i % 4; // 0: north, 1: east, 2: south, 3: west
          
          // Spread spots along that side
          const offset = (Math.random() - 0.5) * 0.6; // Randomize position along side
          
          if (side === 0) { // North
            spots.push(new THREE.Vector3(
              bx + offset * width, 
              0.5, 
              bz - depth/2 - 5 - Math.random() * 3
            ));
          } else if (side === 1) { // East
            spots.push(new THREE.Vector3(
              bx + width/2 + 5 + Math.random() * 3, 
              0.5, 
              bz + offset * depth
            ));
          } else if (side === 2) { // South
            spots.push(new THREE.Vector3(
              bx + offset * width, 
              0.5, 
              bz + depth/2 + 5 + Math.random() * 3
            ));
          } else { // West
            spots.push(new THREE.Vector3(
              bx - width/2 - 5 - Math.random() * 3, 
              0.5, 
              bz + offset * depth
            ));
          }
        }
      }
    });
    
    // If we created spots from buildings, return them
    if (spots.length > 0) {
      return spots;
    }
  }
  
  // Default behavior - create parking spots along the sides of blocks
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