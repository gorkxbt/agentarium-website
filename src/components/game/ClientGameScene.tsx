'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Sky, 
  Environment, 
  Text,
  Trail,
  Float,
  Cloud
} from '@react-three/drei';
import * as THREE from 'three';

// Define types for components
interface AgentProps {
  position: [number, number, number];
  color: string;
  speed: number;
  agentData: AgentData;
  onAgentClick: (agent: AgentData) => void;
}

interface BuildingProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color: string;
  type: string;
  name: string;
}

interface VehicleProps {
  position: [number, number, number];
  color: string;
  type: 'car' | 'taxi' | 'bus';
  speed: number;
}

interface NPCProps {
  position: [number, number, number];
  color: string;
  speed: number;
}

interface AgentData {
  id: number;
  name: string;
  role: string;
  icon: string;
  color: string;
  state: string;
  location: string;
  resources: number;
  earnings: number;
  level: number;
}

interface ClientGameSceneProps {
  onAgentClick?: (agent: any) => void;
  onTimeChange?: (timeOfDay: string) => void;
}

// City configuration
const CITY_SIZE = 300; // Larger city (was 240)
const ROAD_WIDTH = 12;
const BLOCK_SIZE = 50; // Larger blocks (was 40)
const SIDEWALK_WIDTH = 3;
const BUILDING_TYPES = {
  BANK: 'bank',
  POLICE: 'police',
  MARKET: 'market',
  HOTEL: 'hotel',
  GAS: 'gas',
  OFFICE: 'office',
  HOUSE: 'house',
  NIGHTCLUB: 'nightclub',
  SHOPPING_MALL: 'mall',
  FACTORY: 'factory',
  TECH_HUB: 'tech_hub',
  RESTAURANT: 'restaurant',
  HOSPITAL: 'hospital',
  CASINO: 'casino'
};

// Agent component with animation
const Agent: React.FC<AgentProps> = ({ position, color, speed, agentData, onAgentClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const targetRef = useRef(new THREE.Vector3(
    Array.isArray(position) && position.length >= 3 ? position[0] + (Math.random() * 40 - 20) : 0,
    Array.isArray(position) && position.length >= 3 ? position[1] : 0,
    Array.isArray(position) && position.length >= 3 ? position[2] + (Math.random() * 40 - 20) : 0
  ));
  
  // List of possible destinations
  const destinations = useMemo(() => {
    const points = [
      // Bank
      new THREE.Vector3(-BLOCK_SIZE, 0, -BLOCK_SIZE),
      // Police
      new THREE.Vector3(BLOCK_SIZE, 0, -BLOCK_SIZE),
      // Market
      new THREE.Vector3(-BLOCK_SIZE, 0, BLOCK_SIZE),
      // Hotel
      new THREE.Vector3(BLOCK_SIZE, 0, BLOCK_SIZE),
      // Gas station
      new THREE.Vector3(0, 0, -2 * BLOCK_SIZE),
      // Office buildings
      new THREE.Vector3(-2 * BLOCK_SIZE, 0, 0),
      new THREE.Vector3(2 * BLOCK_SIZE, 0, 0),
      // Houses
      new THREE.Vector3(0, 0, 2 * BLOCK_SIZE),
      // New destinations - Nightclub
      new THREE.Vector3(-2 * BLOCK_SIZE, 0, -2 * BLOCK_SIZE),
      // Shopping Mall
      new THREE.Vector3(2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE),
      // Restaurant
      new THREE.Vector3(-BLOCK_SIZE/2, 0, -2 * BLOCK_SIZE),
      // Hospital
      new THREE.Vector3(2 * BLOCK_SIZE, 0, -2 * BLOCK_SIZE),
      // Factory
      new THREE.Vector3(-2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE),
      // Casino
      new THREE.Vector3(BLOCK_SIZE/2, 0, -2 * BLOCK_SIZE),
      // Road points (safer navigation)
      new THREE.Vector3(-BLOCK_SIZE, 0, 0),
      new THREE.Vector3(0, 0, -BLOCK_SIZE),
      new THREE.Vector3(0, 0, BLOCK_SIZE),
      new THREE.Vector3(BLOCK_SIZE, 0, 0),
      // Road intersections
      new THREE.Vector3(-BLOCK_SIZE, 0, -BLOCK_SIZE - ROAD_WIDTH/2), // Near bank
      new THREE.Vector3(BLOCK_SIZE, 0, -BLOCK_SIZE - ROAD_WIDTH/2),  // Near police
      new THREE.Vector3(-BLOCK_SIZE, 0, BLOCK_SIZE + ROAD_WIDTH/2),  // Near market
      new THREE.Vector3(BLOCK_SIZE, 0, BLOCK_SIZE + ROAD_WIDTH/2),    // Near hotel
      new THREE.Vector3(-2 * BLOCK_SIZE, 0, -2 * BLOCK_SIZE - ROAD_WIDTH/2), // Near nightclub
      new THREE.Vector3(2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE + ROAD_WIDTH/2)   // Near mall
    ];
    return points;
  }, []);
  
  // Building boundaries to avoid collisions
  const buildingBoundaries = useMemo(() => [
    // Bank area
    {
      center: new THREE.Vector2(-BLOCK_SIZE, -BLOCK_SIZE),
      size: new THREE.Vector2(20, 20)
    },
    // Police area
    {
      center: new THREE.Vector2(BLOCK_SIZE, -BLOCK_SIZE),
      size: new THREE.Vector2(15, 15)
    },
    // Market area
    {
      center: new THREE.Vector2(-BLOCK_SIZE, BLOCK_SIZE),
      size: new THREE.Vector2(20, 20)
    },
    // Hotel area
    {
      center: new THREE.Vector2(BLOCK_SIZE, BLOCK_SIZE),
      size: new THREE.Vector2(15, 15)
    },
    // Gas station area
    {
      center: new THREE.Vector2(0, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(10, 8)
    },
    // Office buildings
    {
      center: new THREE.Vector2(-2 * BLOCK_SIZE, 0),
      size: new THREE.Vector2(12, 12)
    },
    {
      center: new THREE.Vector2(2 * BLOCK_SIZE, 0),
      size: new THREE.Vector2(15, 15)
    },
    // Houses (simplified as one area)
    {
      center: new THREE.Vector2(0, 2 * BLOCK_SIZE),
      size: new THREE.Vector2(30, 15)
    },
    // New buildings to avoid
    // Nightclub
    {
      center: new THREE.Vector2(-2 * BLOCK_SIZE, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(18, 18)
    },
    // Shopping Mall
    {
      center: new THREE.Vector2(2 * BLOCK_SIZE, 2 * BLOCK_SIZE),
      size: new THREE.Vector2(35, 25)
    },
    // Restaurant
    {
      center: new THREE.Vector2(-BLOCK_SIZE/2, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(12, 12)
    },
    // Hospital
    {
      center: new THREE.Vector2(2 * BLOCK_SIZE, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(25, 20)
    },
    // Factory
    {
      center: new THREE.Vector2(-2 * BLOCK_SIZE, 2 * BLOCK_SIZE),
      size: new THREE.Vector2(30, 20)
    },
    // Casino
    {
      center: new THREE.Vector2(BLOCK_SIZE/2, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(15, 15)
    }
  ], []);
  
  // Check if a position is inside a building
  const isInsideBuilding = (x: number, z: number): boolean => {
    return buildingBoundaries.some(boundary => {
      return (
        x > boundary.center.x - boundary.size.x/2 &&
        x < boundary.center.x + boundary.size.x/2 &&
        z > boundary.center.y - boundary.size.y/2 &&
        z < boundary.center.y + boundary.size.y/2
      );
    });
  };
  
  // Find a valid position on the road
  const findValidPosition = (): THREE.Vector3 => {
    // Start with a random destination
    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
    
    // Try to find a position near the destination that's on a road
    for (let i = 0; i < 10; i++) { // Try up to 10 times
      const offsetX = Math.random() * 10 - 5;
      const offsetZ = Math.random() * 10 - 5;
      const x = randomDestination.x + offsetX;
      const z = randomDestination.z + offsetZ;
      
      // Check if on a road (near a multiple of BLOCK_SIZE)
      const isOnRoadX = Math.abs(x % BLOCK_SIZE) < ROAD_WIDTH/2;
      const isOnRoadZ = Math.abs(z % BLOCK_SIZE) < ROAD_WIDTH/2;
      
      if ((isOnRoadX || isOnRoadZ) && !isInsideBuilding(x, z)) {
        return new THREE.Vector3(x, position[1], z);
      }
    }
    
    // If we couldn't find a valid position, return a position on a main road
    const roadIndex = Math.floor(Math.random() * 4);
    switch (roadIndex) {
      case 0: return new THREE.Vector3(0, position[1], Math.random() * CITY_SIZE - CITY_SIZE/2);
      case 1: return new THREE.Vector3(Math.random() * CITY_SIZE - CITY_SIZE/2, position[1], 0);
      case 2: return new THREE.Vector3(BLOCK_SIZE, position[1], Math.random() * CITY_SIZE - CITY_SIZE/2);
      case 3: return new THREE.Vector3(Math.random() * CITY_SIZE - CITY_SIZE/2, position[1], BLOCK_SIZE);
      default: return new THREE.Vector3(0, position[1], 0);
    }
  };
  
  // Create a new target when agent reaches current target
  const updateTarget = () => {
    const newTarget = findValidPosition();
    targetRef.current.copy(newTarget);
  };
  
  // Agent state
  const [currentState, setCurrentState] = React.useState('walking');
  const [stateTimer, setStateTimer] = React.useState(0);
  const [showTrail, setShowTrail] = React.useState(true); // Use state for trail visibility
  
  // Update agent state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Random state change
      const rand = Math.random();
      if (rand < 0.2) {
        setCurrentState('idle');
        setShowTrail(false);
        setStateTimer(Math.random() * 5 + 2); // Idle for 2-7 seconds
      } else if (rand < 0.5) {
        setCurrentState('working');
        setShowTrail(false);
        setStateTimer(Math.random() * 10 + 5); // Work for 5-15 seconds
      } else {
        setCurrentState('walking');
        setShowTrail(true);
        updateTarget(); // Get a new destination
      }
    }, stateTimer * 1000);
    
    return () => clearInterval(interval);
  }, [stateTimer]);
  
  useFrame((state, delta) => {
    try {
      if (!meshRef.current) return;
      
      // Only move if in walking state
      if (currentState === 'walking') {
        // Move towards target
        const direction = new THREE.Vector3().subVectors(targetRef.current, meshRef.current.position);
        
        // If close to target, update state
        if (direction.length() < 0.5) {
          setCurrentState('idle');
          setShowTrail(false);
          setStateTimer(Math.random() * 3 + 1); // Idle for 1-4 seconds
          return;
        }
        
        // Calculate next position
        const nextPosition = new THREE.Vector3().copy(meshRef.current.position);
        direction.normalize().multiplyScalar(delta * speed);
        nextPosition.add(direction);
        
        // Check if next position is valid (not inside a building)
        if (!isInsideBuilding(nextPosition.x, nextPosition.z)) {
          meshRef.current.position.copy(nextPosition);
        } else {
          // If we'd hit a building, try to move along the building
          // by preserving one coordinate and only moving along the other
          const tryX = new THREE.Vector3().copy(meshRef.current.position);
          tryX.x += direction.x;
          
          const tryZ = new THREE.Vector3().copy(meshRef.current.position);
          tryZ.z += direction.z;
          
          if (!isInsideBuilding(tryX.x, meshRef.current.position.z)) {
            meshRef.current.position.x = tryX.x;
          } else if (!isInsideBuilding(meshRef.current.position.x, tryZ.z)) {
            meshRef.current.position.z = tryZ.z;
          } else {
            // If both directions would hit a building, get a new target
            updateTarget();
          }
        }
        
        // Rotate to face direction of movement
        if (direction.length() > 0.01) {
          const lookAtPos = new THREE.Vector3().addVectors(
            meshRef.current.position,
            new THREE.Vector3(direction.x, 0, direction.z).normalize()
          );
          meshRef.current.lookAt(lookAtPos);
        }
      }
      
      // Bobbing animation based on state
      if (currentState === 'walking') {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.1;
      } else if (currentState === 'working') {
        meshRef.current.rotation.y += delta * 2; // Spin when working
      }
    } catch (error) {
      console.error("Error in Agent animation frame:", error);
    }
  });
  
  // Get location name based on position
  const getLocationName = (): "Bank" | "Police Station" | "Supermarket" | "Hotel" | "Gas Station" | 
                          "Pulse Nightclub" | "Shopping Mall" | "Fine Dining Restaurant" | 
                          "City Hospital" | "Factory" | "Lucky Star Casino" | "Tech Hub" | 
                          "Finance Center" | "On the Road" | "Downtown" | "Unknown" => {
    const pos = meshRef.current?.position;
    if (!pos) return "Unknown";
    
    // Check proximity to key locations
    const distToBank = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(-BLOCK_SIZE, 0, -BLOCK_SIZE));
    if (distToBank < 15) return "Bank";
    
    const distToPolice = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(BLOCK_SIZE, 0, -BLOCK_SIZE));
    if (distToPolice < 15) return "Police Station";
    
    const distToMarket = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(-BLOCK_SIZE, 0, BLOCK_SIZE));
    if (distToMarket < 15) return "Supermarket";
    
    const distToHotel = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(BLOCK_SIZE, 0, BLOCK_SIZE));
    if (distToHotel < 15) return "Hotel";
    
    const distToGas = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(0, 0, -2 * BLOCK_SIZE));
    if (distToGas < 15) return "Gas Station";
    
    // Check tech hub and finance center
    const distToTechHub = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(-2 * BLOCK_SIZE, 0, 0));
    if (distToTechHub < 15) return "Tech Hub";
    
    const distToFinance = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(2 * BLOCK_SIZE, 0, 0));
    if (distToFinance < 15) return "Finance Center";
    
    // New locations
    const distToNightclub = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(-2 * BLOCK_SIZE, 0, -2 * BLOCK_SIZE));
    if (distToNightclub < 15) return "Pulse Nightclub";
    
    const distToMall = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE));
    if (distToMall < 15) return "Shopping Mall";
    
    const distToRestaurant = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(-BLOCK_SIZE/2, 0, -2 * BLOCK_SIZE));
    if (distToRestaurant < 15) return "Fine Dining Restaurant";
    
    const distToHospital = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(2 * BLOCK_SIZE, 0, -2 * BLOCK_SIZE));
    if (distToHospital < 15) return "City Hospital";
    
    const distToFactory = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(-2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE));
    if (distToFactory < 15) return "Factory";
    
    const distToCasino = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(BLOCK_SIZE/2, 0, -2 * BLOCK_SIZE));
    if (distToCasino < 15) return "Lucky Star Casino";
    
    // Check if on road
    if (
      Math.abs(pos.x) % BLOCK_SIZE < ROAD_WIDTH/2 || 
      Math.abs(pos.z) % BLOCK_SIZE < ROAD_WIDTH/2
    ) {
      return "On the Road";
    }
    
    return "Downtown";
  };
  
  // Calculate agent data to pass when clicked
  const handleClick = () => {
    const location = getLocationName();
    
    // Determine earnings multiplier based on location and agent role
    let earningMultiplier = 1.0;
    
    // Each agent earns more in their specialized locations
    if (agentData.role === 'Trader' && (location === 'Bank' || location === 'Shopping Mall')) {
      earningMultiplier = 2.5;
    } else if (agentData.role === 'Scientist' && (location === 'Tech Hub' || location === 'City Hospital')) {
      earningMultiplier = 2.5;
    } else if (agentData.role === 'Builder' && (location === 'Factory')) {
      earningMultiplier = 2.2;
    } else if (agentData.role === 'Explorer' && (location === 'On the Road')) {
      earningMultiplier = 1.8;
    } else if (agentData.role === 'Farmer' && (location === 'Fine Dining Restaurant')) {
      earningMultiplier = 2.0;
    } else if (agentData.role === 'Engineer' && (location === 'Factory' || location === 'Tech Hub')) {
      earningMultiplier = 2.3;
    } else if (agentData.role === 'Hacker' && (location === 'Tech Hub' || location === 'Bank')) {
      earningMultiplier = 2.4;
    } else if (agentData.role === 'Diplomat' && (location === 'Hotel' || location === 'Police Station')) {
      earningMultiplier = 2.1;
    } else if (agentData.role === 'Courier' && (location === 'On the Road' || location === 'Shopping Mall')) {
      earningMultiplier = 1.9;
    } else if (agentData.role === 'Mystic' && (location === 'Lucky Star Casino' || location === 'Pulse Nightclub')) {
      earningMultiplier = 2.6;
    }
    
    const baseEarnings = currentState === 'working' ? 2 : 0.2;
    const locationBonus = location === 'Bank' ? 0.5 : 
                         location === 'Lucky Star Casino' ? 0.8 : 
                         location === 'Factory' ? 0.4 : 
                         location === 'Pulse Nightclub' ? 0.6 : 0;
    
    const updatedAgentData = {
      ...agentData,
      state: currentState,
      location: location,
      // Simulate earning resources based on state, location and role
      resources: agentData.resources + (currentState === 'working' ? 5 : 1),
      earnings: agentData.earnings + (baseEarnings + locationBonus) * earningMultiplier
    };
    
    onAgentClick(updatedAgentData);
  };
  
  return (
    <group ref={meshRef} position={position} onClick={handleClick}>
      {showTrail && (
        <Trail
          width={0.5}
          color={color}
          length={5}
          decay={1}
          attenuation={(width) => width}
        >
          <group>
            <mesh castShadow>
              <capsuleGeometry args={[0.5, 1, 8, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        </Trail>
      )}
      
      {/* Agent body - always visible */}
      <group>
        {/* Agent body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.5, 1, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {/* Agent head */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {/* Status indicator */}
        <mesh 
          position={[0, 2, 0]} 
          rotation={[0, 0, 0]}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial 
            color={
              currentState === 'working' ? '#FFD700' : 
              currentState === 'idle' ? '#CCCCCC' : '#00FF00'
            } 
            emissive={
              currentState === 'working' ? '#FFD700' : 
              currentState === 'idle' ? '#CCCCCC' : '#00FF00'
            }
            emissiveIntensity={0.5} 
          />
        </mesh>
        
        {/* Name tag with background */}
        <group position={[0, 2.5, 0]}>
          {/* Background */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[2, 0.7]} />
            <meshBasicMaterial color="#000000" opacity={0.7} transparent />
          </mesh>
          
          {/* Text */}
          <Text
            fontSize={0.5}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            {agentData.name}
          </Text>
        </group>
      </group>
    </group>
  );
};

// Ground plane component
const Ground: React.FC = () => {
  // Use colors instead of textures for compatibility
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[CITY_SIZE * 2, CITY_SIZE * 2]} />
      <meshStandardMaterial 
        color="#4B9560" 
        roughness={0.8}
      />
    </mesh>
  );
};

// Road component
const Road: React.FC = () => {
  const positions = useMemo(() => {
    const roadPositions = [];
    // Create a grid of roads
    for (let i = -3; i <= 3; i++) {
      // Horizontal roads
      roadPositions.push({
        position: [0, 0, i * BLOCK_SIZE] as [number, number, number],
        scale: [CITY_SIZE, 1, ROAD_WIDTH] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      });
      
      // Vertical roads
      roadPositions.push({
        position: [i * BLOCK_SIZE, 0, 0] as [number, number, number],
        scale: [ROAD_WIDTH, 1, CITY_SIZE] as [number, number, number], 
        rotation: [0, 0, 0] as [number, number, number]
      });
    }
    return roadPositions;
  }, []);
  
  return (
    <group>
      {positions.map((road, i) => (
        <mesh 
          key={`road-${i}`} 
          position={road.position}
          rotation={road.rotation}
          receiveShadow
        >
          <boxGeometry args={[road.scale[0], 0.1, road.scale[2]]} />
          <meshStandardMaterial 
            color="#333333" 
            roughness={0.9}
          />
          
          {/* Road markings */}
          {road.scale[0] > road.scale[2] && (
            <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
              <planeGeometry args={[road.scale[0], 0.5]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
            </mesh>
          )}
          
          {road.scale[2] > road.scale[0] && (
            <mesh position={[0, 0.05, 0]} rotation={[0, Math.PI/2, 0]}>
              <planeGeometry args={[road.scale[2], 0.5]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
            </mesh>
          )}
        </mesh>
      ))}
    </group>
  );
};

// Building base component
const Building: React.FC<BuildingProps> = ({ 
  position, 
  rotation = [0, 0, 0], 
  height, 
  width, 
  depth, 
  color, 
  type,
  name
}) => {
  const ref = useRef<THREE.Group>(null);
  
  // Different building types
  const renderBuildingContent = () => {
    switch (type) {
      case 'bank':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#8a9ea0" roughness={0.7} metalness={0.4} />
              
              {/* Pillars */}
              {Array.from({ length: 4 }).map((_, i) => {
                const xPos = width/2 - 2;
                const zPos = depth/2 - 2;
                const x = i % 2 === 0 ? -xPos : xPos;
                const z = i < 2 ? -zPos : zPos;
                return (
                  <mesh key={`pillar-${i}`} position={[x, -height/2 + 5, z]} castShadow>
                    <cylinderGeometry args={[1, 1, 10, 8]} />
                    <meshStandardMaterial color="#FFFFFF" />
                  </mesh>
                );
              })}
              
              {/* Steps */}
              <mesh position={[0, -height/2 + 0.5, depth/2 + 3]} receiveShadow>
                <boxGeometry args={[width - 4, 1, 6]} />
                <meshStandardMaterial color="#CCCCCC" />
              </mesh>
              
              {/* Bank Sign */}
              <Float speed={0.2} rotationIntensity={0} floatIntensity={0.3}>
                <Text
                  position={[0, height/2 + 2, 0]}
                  fontSize={3}
                  color="#FFD700"
                  anchorX="center"
                  anchorY="middle"
                >
                  $AGENT BANK
                </Text>
              </Float>
            </mesh>
          </>
        );
      
      case 'police':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#3c5e8a" roughness={0.5} />
              
              {/* Windows */}
              {Array.from({ length: Math.floor(height/3) }).map((_, i) => (
                <React.Fragment key={`police-windows-row-${i}`}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <mesh 
                      key={`police-window-${i}-${j}`} 
                      position={[
                        width/2 * 0.8, 
                        -height/2 + (i * 3 + 1.5), 
                        depth/4 - j * depth/2
                      ]}
                    >
                      <planeGeometry args={[2, 1.5]} />
                      <meshStandardMaterial 
                        color="#a0c8e0" 
                        emissive="#a0c8e0"
                        emissiveIntensity={0.3}
                      />
                    </mesh>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Police Sign */}
              <mesh position={[0, height/2 + 1.5, depth/2 + 0.1]} castShadow>
                <boxGeometry args={[width - 4, 3, 0.5]} />
                <meshStandardMaterial color="#1a3c6d" />
                <Text
                  position={[0, 0, 0.3]}
                  fontSize={1.5}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  POLICE
                </Text>
              </mesh>
            </mesh>
          </>
        );
      
      case 'market':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#74cc8a" roughness={0.6} />
              
              {/* Entrance */}
              <mesh position={[0, -height/2 + 2, depth/2 + 0.1]} castShadow>
                <boxGeometry args={[width/2, 4, 0.5]} />
                <meshStandardMaterial color="#55a868" />
              </mesh>
              
              {/* Market Sign */}
              <mesh position={[0, height/2 - 1, depth/2 + 0.1]} castShadow>
                <boxGeometry args={[width - 2, 2, 0.5]} />
                <meshStandardMaterial color="#4a8c5a" />
                <Text
                  position={[0, 0, 0.3]}
                  fontSize={1.2}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  SUPERMARKET
                </Text>
              </mesh>
            </mesh>
          </>
        );
      
      case 'hotel':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#cd9a5b" roughness={0.7} />
              
              {/* Windows grid */}
              {Array.from({ length: Math.floor(height/3) }).map((_, i) => (
                <React.Fragment key={`hotel-windows-row-${i}`}>
                  {Array.from({ length: Math.floor(width/3) }).map((_, j) => (
                    <React.Fragment key={`hotel-windows-col-${j}`}>
                      {/* Front windows */}
                      <mesh 
                        position={[
                          -width/2 + 3 + j * 3, 
                          -height/2 + (i * 3 + 1.5), 
                          depth/2 - 0.1
                        ]}
                      >
                        <planeGeometry args={[2, 1.5]} />
                        <meshStandardMaterial 
                          color="#f8e8d0" 
                          emissive="#f8e8d0"
                          emissiveIntensity={Math.random() > 0.6 ? 0.5 : 0}
                        />
                      </mesh>
                      
                      {/* Back windows */}
                      <mesh 
                        position={[
                          -width/2 + 3 + j * 3, 
                          -height/2 + (i * 3 + 1.5), 
                          -depth/2 + 0.1
                        ]}
                        rotation={[0, Math.PI, 0]}
                      >
                        <planeGeometry args={[2, 1.5]} />
                        <meshStandardMaterial 
                          color="#f8e8d0" 
                          emissive="#f8e8d0"
                          emissiveIntensity={Math.random() > 0.6 ? 0.5 : 0}
                        />
                      </mesh>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Hotel Sign */}
              <mesh position={[0, height/2 + 2, 0]} castShadow>
                <boxGeometry args={[width - 2, 4, 2]} />
                <meshStandardMaterial color="#a67c45" />
                <Text
                  position={[0, 0, depth/2 + 0.1]}
                  fontSize={2}
                  color="#FFD700"
                  anchorX="center"
                  anchorY="middle"
                >
                  HOTEL
                </Text>
                <Text
                  position={[0, 0, -depth/2 - 0.1]}
                  fontSize={2}
                  color="#FFD700"
                  anchorX="center"
                  anchorY="middle"
                  rotation={[0, Math.PI, 0]}
                >
                  HOTEL
                </Text>
              </mesh>
            </mesh>
          </>
        );
      
      case 'gas':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#d8362a" roughness={0.7} />
              
              {/* Gas station roof */}
              <mesh position={[0, height, -depth/2 - 5]} castShadow>
                <boxGeometry args={[width + 5, 1, 10]} />
                <meshStandardMaterial color="#b32a22" />
              </mesh>
              
              {/* Gas pumps */}
              {Array.from({ length: 3 }).map((_, i) => (
                <group key={`pump-${i}`} position={[
                  (i-1) * 5,
                  -height/2 + 1.5,
                  -depth/2 - 5
                ]}>
                  <mesh castShadow>
                    <boxGeometry args={[2, 3, 1]} />
                    <meshStandardMaterial color="#333333" />
                  </mesh>
                  <mesh position={[0, 1, 0.6]} castShadow>
                    <boxGeometry args={[1.5, 0.8, 0.2]} />
                    <meshStandardMaterial color="#CCCCCC" />
                  </mesh>
                </group>
              ))}
              
              {/* Gas Station Sign */}
              <Float speed={0.3} rotationIntensity={0} floatIntensity={0.5}>
                <mesh position={[0, height + 6, 0]} castShadow>
                  <boxGeometry args={[8, 4, 1]} />
                  <meshStandardMaterial color="#ffffff" />
                  <Text
                    position={[0, 0, 0.6]}
                    fontSize={1.5}
                    color="#d8362a"
                    anchorX="center"
                    anchorY="middle"
                  >
                    GAS
                  </Text>
                </mesh>
              </Float>
            </mesh>
          </>
        );
      
      case 'office':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
              
              {/* Windows grid */}
              {Array.from({ length: Math.floor(height/2.5) }).map((_, i) => (
                <React.Fragment key={`office-windows-row-${i}`}>
                  {Array.from({ length: Math.floor(width/2.5) }).map((_, j) => (
                    <React.Fragment key={`office-windows-col-${j}`}>
                      {/* Front windows */}
                      <mesh 
                        position={[
                          -width/2 + 1.25 + j * 2.5, 
                          -height/2 + (i * 2.5 + 1.25), 
                          depth/2 - 0.1
                        ]}
                      >
                        <planeGeometry args={[2, 2]} />
                        <meshStandardMaterial 
                          color="#a5c7e0" 
                          emissive="#a5c7e0"
                          emissiveIntensity={Math.random() > 0.4 ? 0.3 : 0}
                        />
                      </mesh>
                      
                      {/* Side windows */}
                      <mesh 
                        position={[
                          width/2 - 0.1,
                          -height/2 + (i * 2.5 + 1.25),
                          -depth/2 + 1.25 + j * 2.5
                        ]}
                        rotation={[0, Math.PI/2, 0]}
                      >
                        <planeGeometry args={[2, 2]} />
                        <meshStandardMaterial 
                          color="#a5c7e0" 
                          emissive="#a5c7e0"
                          emissiveIntensity={Math.random() > 0.4 ? 0.3 : 0}
                        />
                      </mesh>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Building name */}
              <Text
                position={[0, height/2 + 1, depth/2 + 0.1]}
                fontSize={1.2}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
              >
                {name}
              </Text>
            </mesh>
          </>
        );
        
      case 'house':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={color} roughness={0.8} />
              
              {/* Roof */}
              <mesh position={[0, height/2 + 2, 0]} castShadow receiveShadow>
                <coneGeometry args={[Math.max(width, depth)/1.5, 4, 4]} />
                <meshStandardMaterial color="#703030" roughness={0.8} />
              </mesh>
              
              {/* Door */}
              <mesh position={[0, -height/2 + 1, depth/2 + 0.1]} castShadow>
                <boxGeometry args={[1.5, 2, 0.1]} />
                <meshStandardMaterial color="#5c3c20" />
              </mesh>
              
              {/* Windows */}
              <mesh position={[-2, 0, depth/2 + 0.1]} castShadow>
                <boxGeometry args={[1.5, 1.5, 0.1]} />
                <meshStandardMaterial 
                  color="#a5c7e0" 
                  emissive="#a5c7e0"
                  emissiveIntensity={Math.random() > 0.5 ? 0.5 : 0}
                />
              </mesh>
              <mesh position={[2, 0, depth/2 + 0.1]} castShadow>
                <boxGeometry args={[1.5, 1.5, 0.1]} />
                <meshStandardMaterial 
                  color="#a5c7e0" 
                  emissive="#a5c7e0"
                  emissiveIntensity={Math.random() > 0.5 ? 0.5 : 0}
                />
              </mesh>
            </mesh>
          </>
        );
      
      case 'nightclub':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#1a0033" roughness={0.4} metalness={0.6} />
              
              {/* Windows with neon effect */}
              {Array.from({ length: Math.floor(height/3) }).map((_, i) => (
                <React.Fragment key={`nightclub-windows-row-${i}`}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <mesh 
                      key={`nightclub-window-${i}-${j}`} 
                      position={[
                        width/2 * 0.8 - j * width/4, 
                        -height/2 + (i * 3 + 1.5), 
                        depth/2 - 0.1
                      ]}
                    >
                      <planeGeometry args={[1.5, 0.8]} />
                      <meshStandardMaterial 
                        color="#ff00ff" 
                        emissive="#ff00ff"
                        emissiveIntensity={0.8}
                      />
                    </mesh>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Entrance with neon sign */}
              <mesh position={[0, -height/2 + 2, depth/2 + 0.2]} castShadow>
                <boxGeometry args={[width/3, 4, 0.5]} />
                <meshStandardMaterial color="#000000" />
                
                <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
                  <Text
                    position={[0, 2, 0.3]}
                    fontSize={1.5}
                    color="#ff00ff"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/neon.ttf"
                  >
                    PULSE
                  </Text>
                </Float>
              </mesh>
              
              {/* Spotlights */}
              <mesh position={[-width/4, height/2 + 1, depth/2 - 1]} rotation={[Math.PI/4, 0, 0]}>
                <coneGeometry args={[1, 2, 16]} />
                <meshStandardMaterial 
                  color="#ff00ff" 
                  emissive="#ff00ff"
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.3}
                />
              </mesh>
              
              <mesh position={[width/4, height/2 + 1, depth/2 - 1]} rotation={[Math.PI/4, 0, 0]}>
                <coneGeometry args={[1, 2, 16]} />
                <meshStandardMaterial 
                  color="#00ffff" 
                  emissive="#00ffff"
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.3}
                />
              </mesh>
            </mesh>
          </>
        );
      
      case 'mall':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#e0e0e0" roughness={0.6} metalness={0.3} />
              
              {/* Glass front */}
              <mesh position={[0, 0, depth/2 + 0.1]} castShadow>
                <boxGeometry args={[width * 0.8, height * 0.7, 0.2]} />
                <meshStandardMaterial 
                  color="#88ccee" 
                  transparent
                  opacity={0.4}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              
              {/* Mall entrance */}
              <mesh position={[0, -height/2 + 3, depth/2 + 0.3]} castShadow>
                <boxGeometry args={[width/3, 6, 0.5]} />
                <meshStandardMaterial color="#444444" />
              </mesh>
              
              {/* Mall sign */}
              <mesh position={[0, height/2 - height/8, depth/2 + 0.3]} castShadow>
                <boxGeometry args={[width * 0.7, height/6, 0.5]} />
                <meshStandardMaterial color="#3366cc" />
                <Text
                  position={[0, 0, 0.3]}
                  fontSize={2}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  SHOPPING MALL
                </Text>
              </mesh>
              
              {/* Multiple floors with windows */}
              {Array.from({ length: Math.floor(height/8) }).map((_, i) => (
                <mesh 
                  key={`mall-floor-${i}`} 
                  position={[0, -height/2 + (i+1) * 8, 0]}
                  castShadow
                >
                  <boxGeometry args={[width, 0.5, depth]} />
                  <meshStandardMaterial color="#cccccc" />
                </mesh>
              ))}
            </mesh>
          </>
        );
      
      case 'restaurant':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#d9a066" roughness={0.7} />
              
              {/* Restaurant front with windows */}
              <mesh position={[0, 0, depth/2 + 0.1]} castShadow>
                <boxGeometry args={[width * 0.8, height * 0.6, 0.1]} />
                <meshStandardMaterial 
                  color="#fff8e0" 
                  emissive="#fff8e0"
                  emissiveIntensity={0.3}
                />
              </mesh>
              
              {/* Restaurant sign */}
              <mesh position={[0, height/2 + 1, depth/2 + 0.2]} castShadow>
                <boxGeometry args={[width * 0.7, 2, 0.3]} />
                <meshStandardMaterial color="#8b4513" />
                <Text
                  position={[0, 0, 0.2]}
                  fontSize={1.2}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  FINE DINING
                </Text>
              </mesh>
              
              {/* Outdoor seating area */}
              <group position={[0, -height/2 + 0.5, depth/2 + 4]}>
                {/* Tables */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <group key={`table-${i}`} position={[(i-1) * 4, 0, 0]}>
                    <mesh castShadow>
                      <cylinderGeometry args={[1, 1, 0.2, 16]} />
                      <meshStandardMaterial color="#8b4513" />
                    </mesh>
                    <mesh position={[0, 0.6, 0]} castShadow>
                      <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                      <meshStandardMaterial color="#5c3c20" />
                    </mesh>
                  </group>
                ))}
              </group>
            </mesh>
          </>
        );
        
      case 'hospital':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#ffffff" roughness={0.6} />
              
              {/* Hospital windows grid */}
              {Array.from({ length: Math.floor(height/3) }).map((_, i) => (
                <React.Fragment key={`hospital-windows-row-${i}`}>
                  {Array.from({ length: Math.floor(width/3) }).map((_, j) => (
                    <mesh 
                      key={`hospital-window-${i}-${j}`} 
                      position={[
                        -width/2 + 1.5 + j * 3, 
                        -height/2 + (i * 3 + 1.5), 
                        depth/2 - 0.1
                      ]}
                    >
                      <planeGeometry args={[2, 1.5]} />
                      <meshStandardMaterial 
                        color="#e0f0ff" 
                        emissive="#e0f0ff"
                        emissiveIntensity={Math.random() > 0.3 ? 0.3 : 0}
                      />
                    </mesh>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Hospital sign with cross */}
              <group position={[0, height/2 + 2, depth/2 + 0.2]}>
                <mesh castShadow>
                  <boxGeometry args={[width * 0.6, 4, 0.5]} />
                  <meshStandardMaterial color="#0066cc" />
                </mesh>
                
                {/* Red cross */}
                <mesh position={[-width/6, 0, 0.3]} castShadow>
                  <boxGeometry args={[1, 3, 0.1]} />
                  <meshStandardMaterial 
                    color="#ff0000" 
                    emissive="#ff0000"
                    emissiveIntensity={0.5}
                  />
                </mesh>
                <mesh position={[-width/6, 0, 0.3]} castShadow>
                  <boxGeometry args={[3, 1, 0.1]} />
                  <meshStandardMaterial 
                    color="#ff0000" 
                    emissive="#ff0000"
                    emissiveIntensity={0.5}
                  />
                </mesh>
                
                <Text
                  position={[width/8, 0, 0.3]}
                  fontSize={1.2}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  HOSPITAL
                </Text>
              </group>
              
              {/* Emergency entrance */}
              <mesh position={[0, -height/2 + 2, depth/2 + 0.2]} castShadow>
                <boxGeometry args={[width/3, 4, 0.5]} />
                <meshStandardMaterial color="#0066cc" />
                <Text
                  position={[0, 0, 0.3]}
                  fontSize={0.8}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  EMERGENCY
                </Text>
              </mesh>
            </mesh>
          </>
        );
      
      case 'factory':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.3} />
              
              {/* Factory roof */}
              <mesh position={[0, height/2 + 2, 0]} castShadow>
                <cylinderGeometry args={[width/2, width/2, 4, 6]} />
                <meshStandardMaterial color="#777777" roughness={0.7} />
              </mesh>
              
              {/* Chimney */}
              <mesh position={[width/3, height + 5, depth/3]} castShadow>
                <cylinderGeometry args={[1.5, 2, 10, 8]} />
                <meshStandardMaterial color="#555555" roughness={0.9} />
                
                {/* Smoke particles */}
                <group position={[0, 5, 0]}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <mesh 
                      key={`smoke-${i}`} 
                      position={[
                        Math.sin(i * 0.5) * 0.5,
                        i * 0.8,
                        Math.cos(i * 0.5) * 0.5
                      ]}
                    >
                      <sphereGeometry args={[0.8 + i * 0.2, 8, 8]} />
                      <meshStandardMaterial 
                        color="#cccccc" 
                        transparent
                        opacity={0.6 - i * 0.1}
                      />
                    </mesh>
                  ))}
                </group>
              </mesh>
              
              {/* Factory windows */}
              {Array.from({ length: 2 }).map((_, i) => (
                <React.Fragment key={`factory-windows-row-${i}`}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <mesh 
                      key={`factory-window-${i}-${j}`} 
                      position={[
                        -width/2 + 2 + j * width/4, 
                        -height/2 + (i * 4 + 2), 
                        depth/2 - 0.1
                      ]}
                    >
                      <planeGeometry args={[3, 2]} />
                      <meshStandardMaterial 
                        color="#aaccff" 
                        emissive="#aaccff"
                        emissiveIntensity={0.2}
                      />
                    </mesh>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Factory sign */}
              <mesh position={[0, 0, depth/2 + 0.2]} castShadow>
                <boxGeometry args={[width * 0.6, 3, 0.3]} />
                <meshStandardMaterial color="#555555" />
                <Text
                  position={[0, 0, 0.2]}
                  fontSize={1.2}
                  color="#FFFFFF"
                  anchorX="center"
                  anchorY="middle"
                >
                  FACTORY
                </Text>
              </mesh>
            </mesh>
          </>
        );
        
      case 'casino':
        return (
          <>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#330033" roughness={0.5} metalness={0.4} />
              
              {/* Casino front with gold trim */}
              <mesh position={[0, 0, depth/2 + 0.1]} castShadow>
                <boxGeometry args={[width - 2, height - 2, 0.2]} />
                <meshStandardMaterial 
                  color="#220022" 
                  roughness={0.4}
                  metalness={0.6}
                />
              </mesh>
              
              {/* Casino entrance with lights */}
              <mesh position={[0, -height/2 + 3, depth/2 + 0.3]} castShadow>
                <boxGeometry args={[width/3, 6, 0.5]} />
                <meshStandardMaterial 
                  color="#000000" 
                  roughness={0.2}
                  metalness={0.8}
                />
              </mesh>
              
              {/* Casino sign with neon */}
              <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
                <mesh position={[0, height/2 + 3, 0]} castShadow>
                  <boxGeometry args={[width - 4, 6, 2]} />
                  <meshStandardMaterial 
                    color="#220022" 
                    roughness={0.3}
                    metalness={0.7}
                  />
                  <Text
                    position={[0, 0, depth/2 + 0.1]}
                    fontSize={2.5}
                    color="#FFD700"
                    anchorX="center"
                    anchorY="middle"
                  >
                    LUCKY STAR
                  </Text>
                  <Text
                    position={[0, 0, -depth/2 - 0.1]}
                    fontSize={2.5}
                    color="#FFD700"
                    anchorX="center"
                    anchorY="middle"
                    rotation={[0, Math.PI, 0]}
                  >
                    LUCKY STAR
                  </Text>
                </mesh>
              </Float>
              
              {/* Decorative lights around the building */}
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i / 20) * Math.PI * 2;
                const x = Math.cos(angle) * (width/2 - 0.5);
                const z = Math.sin(angle) * (depth/2 - 0.5);
                return (
                  <mesh 
                    key={`casino-light-${i}`} 
                    position={[x, height/2 - 1, z]}
                    castShadow
                  >
                    <sphereGeometry args={[0.3, 8, 8]} />
                    <meshStandardMaterial 
                      color="#FFD700" 
                      emissive="#FFD700"
                      emissiveIntensity={0.8}
                    />
                  </mesh>
                );
              })}
            </mesh>
          </>
        );
      
      default:
        return (
          <mesh position={[0, height/2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={color} roughness={0.7} />
            
            {/* Windows */}
            {Array.from({ length: Math.floor(height/3) }).map((_, i) => (
              <React.Fragment key={`windows-row-${i}`}>
                {Array.from({ length: 3 }).map((_, j) => (
                  <mesh 
                    key={`window-${i}-${j}`} 
                    position={[
                      width/2 - 0.1, 
                      -height/2 + (i * 3 + 1.5), 
                      depth/4 - j * depth/2
                    ]}
                    rotation={[0, Math.PI/2, 0]}
                  >
                    <planeGeometry args={[2, 1.5]} />
                    <meshStandardMaterial 
                      color="#80FFFF" 
                      emissive="#80FFFF"
                      emissiveIntensity={Math.random() > 0.3 ? 0.5 : 0}
                    />
                  </mesh>
                ))}
              </React.Fragment>
            ))}
          </mesh>
        );
    }
  };
  
  return (
    <group position={position} rotation={rotation as any} ref={ref}>
      {renderBuildingContent()}
    </group>
  );
};

// Vehicle component
const Vehicle: React.FC<VehicleProps> = ({ position, color, type, speed }) => {
  const meshRef = useRef<THREE.Group>(null);
  const targetRef = useRef(new THREE.Vector3(
    Array.isArray(position) && position.length >= 3 ? position[0] + (Math.random() * 100 - 50) : 0,
    Array.isArray(position) && position.length >= 3 ? position[1] : 0,
    Array.isArray(position) && position.length >= 3 ? position[2] + (Math.random() * 100 - 50) : 0
  ));
  const [isParked, setIsParked] = useState(Math.random() > 0.7); // 30% chance to start parked
  const [parkingTimer, setParkingTimer] = useState(0);
  const [currentLane, setCurrentLane] = useState(Math.random() > 0.5 ? 1 : -1); // Left or right lane
  
  // List of possible destinations (road points)
  const roadPoints = useMemo(() => {
    const points = [];
    // Create road points grid
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        // Horizontal roads
        points.push(new THREE.Vector3(i * BLOCK_SIZE, 0, j * BLOCK_SIZE));
        // Additional points for smoother navigation
        if (j < 3) {
          points.push(new THREE.Vector3(i * BLOCK_SIZE, 0, j * BLOCK_SIZE + BLOCK_SIZE/2));
        }
        if (i < 3) {
          points.push(new THREE.Vector3(i * BLOCK_SIZE + BLOCK_SIZE/2, 0, j * BLOCK_SIZE));
        }
      }
    }
    return points;
  }, []);
  
  // Parking spots
  const parkingSpots = useMemo(() => {
    const spots = [];
    
    // Generate parking spots near buildings
    // Bank parking
    for (let i = 0; i < 3; i++) {
      spots.push(new THREE.Vector3(-BLOCK_SIZE - 6 - i * 4, 0, -BLOCK_SIZE + 15));
    }
    
    // Police parking
    for (let i = 0; i < 3; i++) {
      spots.push(new THREE.Vector3(BLOCK_SIZE + 6 + i * 4, 0, -BLOCK_SIZE + 15));
    }
    
    // Market parking
    for (let i = 0; i < 4; i++) {
      spots.push(new THREE.Vector3(-BLOCK_SIZE - 6 - i * 4, 0, BLOCK_SIZE - 15));
    }
    
    // Hotel parking
    for (let i = 0; i < 3; i++) {
      spots.push(new THREE.Vector3(BLOCK_SIZE + 6 + i * 4, 0, BLOCK_SIZE - 15));
    }
    
    // Nightclub parking
    for (let i = 0; i < 5; i++) {
      spots.push(new THREE.Vector3(-2 * BLOCK_SIZE + 15, 0, -2 * BLOCK_SIZE - 6 - i * 4));
    }
    
    // Shopping mall parking lot (larger)
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        spots.push(new THREE.Vector3(2 * BLOCK_SIZE - 15 - j * 5, 0, 2 * BLOCK_SIZE + 8 + i * 5));
      }
    }
    
    return spots;
  }, []);
  
  // Function to check if a position is on a road
  const isOnRoad = (position: THREE.Vector3): boolean => {
    // Check if on horizontal road
    const onHorizontalRoad = Math.abs(position.z % BLOCK_SIZE) < ROAD_WIDTH/2;
    // Check if on vertical road
    const onVerticalRoad = Math.abs(position.x % BLOCK_SIZE) < ROAD_WIDTH/2;
    
    return onHorizontalRoad || onVerticalRoad;
  };
  
  // Find nearest road point for when off-road
  const findNearestRoadPoint = (position: THREE.Vector3): THREE.Vector3 => {
    let nearest = roadPoints[0];
    let minDistance = position.distanceTo(roadPoints[0]);
    
    roadPoints.forEach(point => {
      const distance = position.distanceTo(point);
      if (distance < minDistance) {
        nearest = point;
        minDistance = distance;
      }
    });
    
    return nearest;
  };
  
  // Update target when vehicle reaches current target or needs to park/unpark
  const updateTarget = () => {
    // Determine if vehicle should park or continue driving
    if (!isParked && Math.random() < 0.05) { // 5% chance to decide to park when driving
      // Choose a random parking spot
      const parkingSpot = parkingSpots[Math.floor(Math.random() * parkingSpots.length)];
      targetRef.current.copy(parkingSpot);
      setParkingTimer(Math.random() * 60 + 30); // Park for 30-90 seconds
      return;
    }
    
    if (isParked) {
      // Vehicle is already parked, don't change target
      return;
    }
    
    // Choose a road point for continued driving
    const validRoadPoints = roadPoints.filter(point => isOnRoad(point));
    
    // Select points that would maintain the current direction if possible
    const currentPos = meshRef.current?.position || new THREE.Vector3();
    const direction = new THREE.Vector3().subVectors(targetRef.current, currentPos).normalize();
    
    // Find points that continue in a similar direction
    const sameDirectionPoints = validRoadPoints.filter(point => {
      const newDirection = new THREE.Vector3().subVectors(point, currentPos).normalize();
      return newDirection.dot(direction) > 0.7; // Points in similar direction
    });
    
    let nextTarget;
    
    if (sameDirectionPoints.length > 0 && Math.random() > 0.2) { // 80% chance to continue same direction
      nextTarget = sameDirectionPoints[Math.floor(Math.random() * sameDirectionPoints.length)];
    } else {
      // Sometimes change direction at intersections
      nextTarget = validRoadPoints[Math.floor(Math.random() * validRoadPoints.length)];
    }
    
    // Adjust for driving on the correct side of the road (right side)
    if (Math.abs(nextTarget.x % BLOCK_SIZE) < 0.1) { // On vertical road
      nextTarget.x += ROAD_WIDTH * 0.3 * currentLane;
    } else if (Math.abs(nextTarget.z % BLOCK_SIZE) < 0.1) { // On horizontal road
      nextTarget.z += ROAD_WIDTH * 0.3 * currentLane;
    }
    
    targetRef.current.copy(nextTarget);
  };
  
  // Initial target update
  useEffect(() => {
    if (!isParked) {
      updateTarget();
    } else {
      // If starting parked, pick a parking spot
      const parkingSpot = parkingSpots[Math.floor(Math.random() * parkingSpots.length)];
      meshRef.current?.position.copy(parkingSpot);
      targetRef.current.copy(parkingSpot);
      setParkingTimer(Math.random() * 30 + 15); // Parked for 15-45 seconds initially
    }
  }, []);
  
  useFrame((state, delta) => {
    try {
      if (!meshRef.current) return;
      
      // Handle parking timer countdown
      if (isParked) {
        setParkingTimer(prev => {
          const newTimer = prev - delta;
          if (newTimer <= 0) {
            setIsParked(false);
            updateTarget();
            return 0;
          }
          return newTimer;
        });
        return;
      }
      
      // Check if reached parking spot
      const distanceToTarget = meshRef.current.position.distanceTo(targetRef.current);
      if (!isParked && distanceToTarget < 1 && parkingTimer > 0) {
        setIsParked(true);
        return;
      }
      
      // Move towards target when not parked
      const direction = new THREE.Vector3().subVectors(targetRef.current, meshRef.current.position);
      
      // If close to target, update target unless parking
      if (direction.length() < 1 && parkingTimer <= 0) {
        // Chance to change lanes at intersections
        if (Math.random() < 0.1) {
          setCurrentLane(prev => prev * -1);
        }
        updateTarget();
        return;
      }
      
      // Check if we're off-road and need to get back
      if (!isOnRoad(meshRef.current.position) && parkingTimer <= 0) {
        const nearestRoadPoint = findNearestRoadPoint(meshRef.current.position);
        targetRef.current.copy(nearestRoadPoint);
      }
      
      // Calculate next position
      direction.normalize().multiplyScalar(delta * speed);
      meshRef.current.position.add(direction);
      
      // Rotate to face direction of movement
      if (direction.length() > 0.01) {
        const lookAtPos = new THREE.Vector3().addVectors(
          meshRef.current.position,
          new THREE.Vector3(direction.x, 0, direction.z).normalize()
        );
        meshRef.current.lookAt(lookAtPos);
      }
    } catch (error) {
      console.error("Error in Vehicle animation frame:", error);
    }
  });
  
  return (
    <group ref={meshRef} position={position}>
      {type === 'taxi' && (
        <>
          {/* Taxi body */}
          <mesh castShadow position={[0, 0.6, 0]}>
            <boxGeometry args={[2.2, 0.8, 4]} />
            <meshStandardMaterial color="#FFD700" metalness={0.2} roughness={0.3} />
          </mesh>
          
          {/* Taxi roof */}
          <mesh castShadow position={[0, 1.2, 0]}>
            <boxGeometry args={[2, 0.6, 3]} />
            <meshStandardMaterial color="#444444" metalness={0.3} roughness={0.4} />
          </mesh>
          
          {/* Taxi sign */}
          <mesh castShadow position={[0, 1.6, 0]}>
            <boxGeometry args={[0.8, 0.3, 0.8]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFF00" emissiveIntensity={0.5} />
          </mesh>
          
          {/* Wheels */}
          <group position={[-1.1, 0.3, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          <group position={[1.1, 0.3, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          <group position={[-1.1, 0.3, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          <group position={[1.1, 0.3, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
        </>
      )}
      
      {type === 'car' && (
        <>
          {/* Car body */}
          <mesh castShadow position={[0, 0.6, 0]}>
            <boxGeometry args={[2, 0.8, 4.2]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
          </mesh>
          
          {/* Car roof */}
          <mesh castShadow position={[0, 1.2, -0.3]}>
            <boxGeometry args={[1.8, 0.6, 2.8]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.3} />
          </mesh>
          
          {/* Windows */}
          <mesh castShadow position={[0, 1.2, 0.8]}>
            <boxGeometry args={[1.85, 0.5, 0.1]} />
            <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.2} />
          </mesh>
          
          {/* Wheels */}
          <group position={[-1, 0.3, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          <group position={[1, 0.3, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          <group position={[-1, 0.3, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          <group position={[1, 0.3, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
        </>
      )}
      
      {type === 'bus' && (
        <>
          {/* Bus body */}
          <mesh castShadow position={[0, 1, 0]}>
            <boxGeometry args={[2.5, 2, 7]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.4} />
          </mesh>
          
          {/* Windows */}
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={`bus-window-left-${i}`}>
              <mesh castShadow position={[-1.26, 1.2, -2 + i * 1.5]}>
                <boxGeometry args={[0.1, 0.8, 1]} />
                <meshStandardMaterial color="#AADDFF" metalness={0.5} roughness={0.2} />
              </mesh>
              <mesh castShadow position={[1.26, 1.2, -2 + i * 1.5]}>
                <boxGeometry args={[0.1, 0.8, 1]} />
                <meshStandardMaterial color="#AADDFF" metalness={0.5} roughness={0.2} />
              </mesh>
            </React.Fragment>
          ))}
          
          {/* Windshield */}
          <mesh castShadow position={[0, 1.2, 3.46]}>
            <boxGeometry args={[2.4, 0.8, 0.1]} />
            <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.2} />
          </mesh>
          
          {/* Wheels */}
          <group position={[-1.3, 0.5, 2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          <group position={[1.3, 0.5, 2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          <group position={[-1.3, 0.5, -2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
          <group position={[1.3, 0.5, -2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
              <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
};

// NPC component
const NPC: React.FC<NPCProps> = ({ position, color, speed }) => {
  const meshRef = useRef<THREE.Group>(null);
  // Ensure position is a valid array with 3 elements before creating Vector3
  const targetRef = useRef(new THREE.Vector3(
    Array.isArray(position) && position.length >= 3 ? position[0] : 0,
    Array.isArray(position) && position.length >= 3 ? position[1] : 0,
    Array.isArray(position) && position.length >= 3 ? position[2] : 0
  ));
  const [state, setState] = useState<'idle' | 'walking' | 'sitting' | 'talking' | 'shopping'>(
    Math.random() > 0.7 ? 'idle' : 'walking'
  );
  const [stateTimer, setStateTimer] = useState(Math.random() * 3);
  const [activityLocation, setActivityLocation] = useState<THREE.Vector3 | null>(null);
  const [groupMember, setGroupMember] = useState(Math.random() > 0.7); // 30% chance to be in a group
  const [groupLeader, setGroupLeader] = useState(Math.random() > 0.5); // 50% chance to be the leader in a group
  
  // List of possible sidewalk destinations
  const sidewalkPoints = useMemo(() => {
    const points = [];
    
    // Create a grid of sidewalk points along roads
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        // Points alongside horizontal roads
        points.push(new THREE.Vector3(i * BLOCK_SIZE, 0, j * BLOCK_SIZE + ROAD_WIDTH/2 + 1));
        points.push(new THREE.Vector3(i * BLOCK_SIZE, 0, j * BLOCK_SIZE - ROAD_WIDTH/2 - 1));
        
        // Points alongside vertical roads
        points.push(new THREE.Vector3(i * BLOCK_SIZE + ROAD_WIDTH/2 + 1, 0, j * BLOCK_SIZE));
        points.push(new THREE.Vector3(i * BLOCK_SIZE - ROAD_WIDTH/2 - 1, 0, j * BLOCK_SIZE));
      }
    }
    
    return points;
  }, []);
  
  // Points of interest where NPCs might gather
  const gatheringPoints = useMemo(() => {
    const points = [
      // Bank entrance
      { position: new THREE.Vector3(-BLOCK_SIZE, 0, -BLOCK_SIZE + 10), type: 'bank' },
      // Shopping mall entrance
      { position: new THREE.Vector3(2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE - 10), type: 'shopping' },
      // Restaurant outdoor seating
      { position: new THREE.Vector3(-BLOCK_SIZE/2, 0, -2 * BLOCK_SIZE + 8), type: 'dining' },
      // Nightclub entrance
      { position: new THREE.Vector3(-2 * BLOCK_SIZE + 10, 0, -2 * BLOCK_SIZE), type: 'nightclub' },
      // Park bench 1
      { position: new THREE.Vector3(10, 0, 10), type: 'sitting' },
      // Park bench 2
      { position: new THREE.Vector3(-10, 0, 10), type: 'sitting' },
      // Bus stop 1
      { position: new THREE.Vector3(BLOCK_SIZE - 15, 0, 0), type: 'waiting' },
      // Bus stop 2
      { position: new THREE.Vector3(0, 0, BLOCK_SIZE - 15), type: 'waiting' },
      // Street vendor 1
      { position: new THREE.Vector3(BLOCK_SIZE/2, 0, BLOCK_SIZE/2), type: 'shopping' },
      // Street vendor 2
      { position: new THREE.Vector3(-BLOCK_SIZE/2, 0, -BLOCK_SIZE/2), type: 'shopping' },
    ];
    return points;
  }, []);
  
  // Building boundaries to avoid collisions
  const buildingBoundaries = useMemo(() => [
    // Bank area
    {
      center: new THREE.Vector2(-BLOCK_SIZE, -BLOCK_SIZE),
      size: new THREE.Vector2(20, 20)
    },
    // Police area
    {
      center: new THREE.Vector2(BLOCK_SIZE, -BLOCK_SIZE),
      size: new THREE.Vector2(15, 15)
    },
    // Market area
    {
      center: new THREE.Vector2(-BLOCK_SIZE, BLOCK_SIZE),
      size: new THREE.Vector2(20, 20)
    },
    // Hotel area
    {
      center: new THREE.Vector2(BLOCK_SIZE, BLOCK_SIZE),
      size: new THREE.Vector2(15, 15)
    },
    // Gas station area
    {
      center: new THREE.Vector2(0, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(10, 8)
    },
    // Office buildings
    {
      center: new THREE.Vector2(-2 * BLOCK_SIZE, 0),
      size: new THREE.Vector2(12, 12)
    },
    {
      center: new THREE.Vector2(2 * BLOCK_SIZE, 0),
      size: new THREE.Vector2(15, 15)
    },
    // Houses (simplified as one area)
    {
      center: new THREE.Vector2(0, 2 * BLOCK_SIZE),
      size: new THREE.Vector2(30, 15)
    },
    // New buildings to avoid
    // Nightclub
    {
      center: new THREE.Vector2(-2 * BLOCK_SIZE, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(18, 18)
    },
    // Shopping Mall
    {
      center: new THREE.Vector2(2 * BLOCK_SIZE, 2 * BLOCK_SIZE),
      size: new THREE.Vector2(35, 25)
    },
    // Restaurant
    {
      center: new THREE.Vector2(-BLOCK_SIZE/2, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(12, 12)
    },
    // Hospital
    {
      center: new THREE.Vector2(2 * BLOCK_SIZE, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(25, 20)
    },
    // Factory
    {
      center: new THREE.Vector2(-2 * BLOCK_SIZE, 2 * BLOCK_SIZE),
      size: new THREE.Vector2(30, 20)
    },
    // Casino
    {
      center: new THREE.Vector2(BLOCK_SIZE/2, -2 * BLOCK_SIZE),
      size: new THREE.Vector2(15, 15)
    }
  ], []);
  
  // Check if a position is inside a building
  const isInsideBuilding = (x: number, z: number): boolean => {
    return buildingBoundaries.some(boundary => {
      return (
        x > boundary.center.x - boundary.size.x/2 &&
        x < boundary.center.x + boundary.size.x/2 &&
        z > boundary.center.y - boundary.size.y/2 &&
        z < boundary.center.y + boundary.size.y/2
      );
    });
  };
  
  // Update target when NPC reaches current target or changes state
  const updateTarget = () => {
    // Only get new target if walking
    if (state !== 'walking') return;
    
    // Decide if heading to a gathering point or random sidewalk
    const goToGatheringPoint = Math.random() > 0.6; // 40% chance to head to a gathering point
    
    if (goToGatheringPoint) {
      // Pick a random gathering point
      const gatheringPoint = gatheringPoints[Math.floor(Math.random() * gatheringPoints.length)];
      targetRef.current.copy(gatheringPoint.position);
      setActivityLocation(gatheringPoint.position.clone());
      
      // Set appropriate state based on gathering point type
      const nextStateTimer = Math.random() * 10 + 5; // 5-15 seconds
      setStateTimer(nextStateTimer);
      
      // Set next state based on destination type, but will only apply once they arrive
      if (gatheringPoint.type === 'sitting') {
        // Will sit once they arrive
      } else if (gatheringPoint.type === 'shopping') {
        // Will shop once they arrive
      } else if (gatheringPoint.type === 'dining') {
        // Will sit/talk once they arrive
      } else if (gatheringPoint.type === 'waiting') {
        // Will idle once they arrive
      } else if (gatheringPoint.type === 'nightclub') {
        // Will talk/dance once they arrive
      }
    } else {
      // Get valid sidewalk points (not inside buildings)
      const validPoints = sidewalkPoints.filter(point => 
        !isInsideBuilding(point.x, point.z)
      );
      
      // Pick a random valid point
      const newTarget = validPoints[Math.floor(Math.random() * validPoints.length)];
      targetRef.current.copy(newTarget);
      setActivityLocation(null);
    }
  };
  
  // Update NPC state based on current location and time spent
  const updateState = () => {
    // If at a gathering point, set state based on location type
    if (activityLocation && meshRef.current) {
      const distanceToActivity = meshRef.current.position.distanceTo(activityLocation);
      
      if (distanceToActivity < 1.5) {
        // We've reached the activity location
        const gatheringPoint = gatheringPoints.find(point => 
          point.position.distanceTo(activityLocation) < 0.5
        );
        
        if (gatheringPoint) {
          if (gatheringPoint.type === 'sitting') {
            setState('sitting');
            setStateTimer(Math.random() * 20 + 10); // Sit for 10-30 seconds
          } else if (gatheringPoint.type === 'shopping') {
            setState('shopping');
            setStateTimer(Math.random() * 15 + 5); // Shop for 5-20 seconds
          } else if (gatheringPoint.type === 'dining' || gatheringPoint.type === 'nightclub') {
            // Either sit or talk at these locations
            setState(Math.random() > 0.5 ? 'sitting' : 'talking');
            setStateTimer(Math.random() * 25 + 15); // Stay for 15-40 seconds
          } else {
            // Default to idle
            setState('idle');
            setStateTimer(Math.random() * 8 + 2); // Idle for 2-10 seconds
          }
          return;
        }
      }
    }
    
    // Not at an activity location, choose a new random state
    const rand = Math.random();
    if (rand < 0.7) { // 70% chance to walk
      setState('walking');
      setStateTimer(Math.random() * 10 + 5); // Walk for 5-15 seconds
      updateTarget(); // Get a new destination
    } else if (rand < 0.9) { // 20% chance to idle
      setState('idle');
      setStateTimer(Math.random() * 3 + 2); // Idle for 2-5 seconds
    } else { // 10% chance to talk (simulate phone call or talking to someone)
      setState('talking');
      setStateTimer(Math.random() * 5 + 3); // Talk for 3-8 seconds
    }
  };
  
  // Update NPC state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updateState();
    }, stateTimer * 1000);
    
    return () => clearInterval(interval);
  }, [stateTimer]);
  
  useFrame((frameState, delta) => {
    try {
      if (!meshRef.current) return;
      
      // Only move if in walking state
      if (state !== 'walking') {
        // Animations for other states
        if (state === 'talking') {
          // Subtle swaying for talking
          meshRef.current.rotation.y += Math.sin(frameState.clock.getElapsedTime() * 2) * 0.02;
        } else if (state === 'sitting') {
          // Adjust height for sitting
          meshRef.current.position.y = position[1] - 0.3;
        } else if (state === 'shopping') {
          // Look around animation for shopping
          meshRef.current.rotation.y = Math.sin(frameState.clock.getElapsedTime()) * 0.5;
        }
        return;
      }
      
      // Reset height if was sitting
      meshRef.current.position.y = position[1] + Math.sin(frameState.clock.getElapsedTime() * 5) * 0.05;
      
      // Move towards target
      const direction = new THREE.Vector3().subVectors(targetRef.current, meshRef.current.position);
      
      // If close to target, become idle
      if (direction.length() < 0.5) {
        if (activityLocation) {
          // We've reached an activity destination
          const distanceToActivity = meshRef.current.position.distanceTo(activityLocation);
          if (distanceToActivity < 1.5) {
            // Update state based on the activity
            updateState();
            return;
          }
        } else {
          // Just reached a regular sidewalk point
          setState('idle');
          setStateTimer(Math.random() * 3 + 2); // Idle for 2-5 seconds
          return;
        }
      }
      
      // Calculate next position
      direction.normalize().multiplyScalar(delta * speed);
      
      // Calculate next position
      const nextPosition = new THREE.Vector3().copy(meshRef.current.position).add(direction);
      
      // Only move if not going into a building
      if (!isInsideBuilding(nextPosition.x, nextPosition.z)) {
        meshRef.current.position.copy(nextPosition);
      } else {
        // Get a new target if we would hit a building
        updateTarget();
        return;
      }
      
      // Rotate to face direction of movement
      if (direction.length() > 0.01) {
        const lookAtPos = new THREE.Vector3().addVectors(
          meshRef.current.position,
          new THREE.Vector3(direction.x, 0, direction.z).normalize()
        );
        meshRef.current.lookAt(lookAtPos);
      }
    } catch (error) {
      console.error("Error in NPC animation frame:", error);
    }
  });
  
  return (
    <group ref={meshRef} position={position}>
      {/* NPC body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.2, 0.8, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* NPC head */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* State indicators */}
      {state === 'talking' && (
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      )}
      
      {state === 'shopping' && (
        <mesh position={[0.3, 0.4, 0.1]} castShadow rotation={[0, 0, Math.PI/4]}>
          <boxGeometry args={[0.2, 0.3, 0.1]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
      )}
    </group>
  );
};

// City component with buildings, agents, vehicles and NPCs
const City: React.FC<{ onAgentClick: (agent: any) => void }> = ({ onAgentClick }) => {
  // Define buildings
  const buildings = useMemo(() => [
    // Bank
    {
      position: [-BLOCK_SIZE, 0, -BLOCK_SIZE] as [number, number, number],
      height: 20,
      width: 25,
      depth: 25,
      color: '#8a9ea0',
      type: 'bank',
      name: '$AGENT Bank'
    },
    // Police Station
    {
      position: [BLOCK_SIZE, 0, -BLOCK_SIZE] as [number, number, number],
      height: 15,
      width: 20,
      depth: 20,
      color: '#3c5e8a',
      type: 'police',
      name: 'Police Station'
    },
    // Supermarket
    {
      position: [-BLOCK_SIZE, 0, BLOCK_SIZE] as [number, number, number],
      height: 12,
      width: 25,
      depth: 25,
      color: '#74cc8a',
      type: 'market',
      name: 'Supermarket'
    },
    // Hotel
    {
      position: [BLOCK_SIZE, 0, BLOCK_SIZE] as [number, number, number],
      height: 30,
      width: 20,
      depth: 20,
      color: '#cd9a5b',
      type: 'hotel',
      name: 'Grand Hotel'
    },
    // Gas Station
    {
      position: [0, 0, -2 * BLOCK_SIZE] as [number, number, number],
      height: 6,
      width: 15,
      depth: 10,
      color: '#d8362a',
      type: 'gas',
      name: 'Gas Station'
    },
    // Office Buildings
    {
      position: [-2 * BLOCK_SIZE, 0, 0] as [number, number, number],
      height: 40,
      width: 15,
      depth: 15,
      color: '#607d8b',
      type: 'office',
      name: 'Tech Hub'
    },
    {
      position: [2 * BLOCK_SIZE, 0, 0] as [number, number, number],
      height: 35,
      width: 18,
      depth: 18,
      color: '#455a64',
      type: 'office',
      name: 'Finance Center'
    },
    // Nightclub - new building
    {
      position: [-2 * BLOCK_SIZE, 0, -2 * BLOCK_SIZE] as [number, number, number],
      height: 15,
      width: 18,
      depth: 18,
      color: '#1a0033',
      type: 'nightclub',
      name: 'Pulse Nightclub'
    },
    // Shopping Mall - new building
    {
      position: [2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE] as [number, number, number],
      height: 25,
      width: 35,
      depth: 25,
      color: '#e0e0e0',
      type: 'mall',
      name: 'Shopping Mall'
    },
    // Restaurant - new building
    {
      position: [-BLOCK_SIZE/2, 0, -2 * BLOCK_SIZE] as [number, number, number],
      height: 8,
      width: 12,
      depth: 12,
      color: '#d9a066',
      type: 'restaurant',
      name: 'Fine Dining'
    },
    // Hospital - new building
    {
      position: [2 * BLOCK_SIZE, 0, -2 * BLOCK_SIZE] as [number, number, number],
      height: 20,
      width: 25,
      depth: 20,
      color: '#ffffff',
      type: 'hospital',
      name: 'City Hospital'
    },
    // Factory - new building
    {
      position: [-2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE] as [number, number, number],
      height: 15,
      width: 30,
      depth: 20,
      color: '#888888',
      type: 'factory',
      name: 'Factory'
    },
    // Casino - new building
    {
      position: [BLOCK_SIZE/2, 0, -2 * BLOCK_SIZE] as [number, number, number],
      height: 18,
      width: 15,
      depth: 15,
      color: '#330033',
      type: 'casino',
      name: 'Lucky Star Casino'
    },
    // Houses - residential area
    ...[...Array(6)].map((_, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const colors = ['#e8c090', '#d9b38c', '#c19a78', '#b08968', '#a67c58', '#8c6239'];
      
      return {
        position: [
          -10 + col * 10, 
          0, 
          2 * BLOCK_SIZE + (row * 12 - 6)
        ] as [number, number, number],
        height: 6 + Math.random() * 2,
        width: 8,
        depth: 8,
        color: colors[i],
        type: 'house',
        name: `House ${i+1}`
      };
    })
  ], []);
  
  // City map labels - updated with new buildings
  const mapLabels = [
    { position: [-BLOCK_SIZE, 0, -BLOCK_SIZE], name: "Bank" },
    { position: [BLOCK_SIZE, 0, -BLOCK_SIZE], name: "Police" },
    { position: [-BLOCK_SIZE, 0, BLOCK_SIZE], name: "Market" },
    { position: [BLOCK_SIZE, 0, BLOCK_SIZE], name: "Hotel" },
    { position: [0, 0, -2 * BLOCK_SIZE], name: "Gas" },
    { position: [-2 * BLOCK_SIZE, 0, 0], name: "Tech Hub" },
    { position: [2 * BLOCK_SIZE, 0, 0], name: "Finance" },
    { position: [0, 0, 2 * BLOCK_SIZE], name: "Houses" },
    { position: [-2 * BLOCK_SIZE, 0, -2 * BLOCK_SIZE], name: "Nightclub" },
    { position: [2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE], name: "Mall" },
    { position: [-BLOCK_SIZE/2, 0, -2 * BLOCK_SIZE], name: "Restaurant" },
    { position: [2 * BLOCK_SIZE, 0, -2 * BLOCK_SIZE], name: "Hospital" },
    { position: [-2 * BLOCK_SIZE, 0, 2 * BLOCK_SIZE], name: "Factory" },
    { position: [BLOCK_SIZE/2, 0, -2 * BLOCK_SIZE], name: "Casino" }
  ];
  
  // Define agent data
  const agentData = useMemo(() => [
    {
      id: 1,
      name: "Alex",
      role: "Trader",
      icon: "👨‍💼",
      color: "#2196F3",
      state: "walking",
      location: "Bank",
      resources: 87,
      earnings: 1245,
      level: 5
    },
    {
      id: 2,
      name: "Nova",
      role: "Scientist",
      icon: "👩‍🔬",
      color: "#9C27B0",
      state: "working",
      location: "Tech Hub",
      resources: 92,
      earnings: 1870,
      level: 7
    },
    {
      id: 3,
      name: "Orion",
      role: "Builder",
      icon: "👷",
      color: "#FF9800",
      state: "walking",
      location: "Downtown",
      resources: 95,
      earnings: 1560,
      level: 6
    },
    {
      id: 4,
      name: "Luna",
      role: "Explorer",
      icon: "🧭",
      color: "#4CAF50",
      state: "idle",
      location: "Supermarket",
      resources: 84,
      earnings: 1320,
      level: 4
    },
    {
      id: 5,
      name: "Max",
      role: "Farmer",
      icon: "👨‍🌾",
      color: "#8BC34A",
      state: "working",
      location: "House 3",
      resources: 89,
      earnings: 1480,
      level: 5
    },
    {
      id: 6,
      name: "Zara",
      role: "Engineer",
      icon: "👩‍🔧",
      color: "#FF5722",
      state: "walking",
      location: "On the Road",
      resources: 91,
      earnings: 1690,
      level: 6
    },
    {
      id: 7,
      name: "Neo",
      role: "Hacker",
      icon: "👨‍💻",
      color: "#607D8B",
      state: "working",
      location: "Finance Center",
      resources: 86,
      earnings: 1920,
      level: 7
    },
    {
      id: 8,
      name: "Astra",
      role: "Diplomat",
      icon: "🧝‍♀️",
      color: "#E91E63",
      state: "idle",
      location: "Hotel",
      resources: 88,
      earnings: 1530,
      level: 5
    },
    {
      id: 9,
      name: "Bolt",
      role: "Courier",
      icon: "🏃",
      color: "#00BCD4",
      state: "walking",
      location: "Gas Station",
      resources: 94,
      earnings: 1380,
      level: 4
    },
    {
      id: 10,
      name: "Echo",
      role: "Mystic",
      icon: "🧙",
      color: "#9575CD",
      state: "working",
      location: "Police Station",
      resources: 90,
      earnings: 2100,
      level: 8
    },
    // Add 5 more agents for a larger city
    {
      id: 11,
      name: "Cyrus",
      role: "Trader",
      icon: "👨‍💼",
      color: "#42A5F5",
      state: "walking",
      location: "Shopping Mall",
      resources: 82,
      earnings: 980,
      level: 3
    },
    {
      id: 12,
      name: "Iris",
      role: "Engineer",
      icon: "👩‍🔧",
      color: "#FF7043",
      state: "idle",
      location: "Factory",
      resources: 95,
      earnings: 1750,
      level: 6
    },
    {
      id: 13,
      name: "Felix",
      role: "Hacker",
      icon: "👨‍💻",
      color: "#78909C",
      state: "walking",
      location: "Tech Hub",
      resources: 88,
      earnings: 1480,
      level: 5
    },
    {
      id: 14,
      name: "Desiree",
      role: "Mystic",
      icon: "🧙",
      color: "#B39DDB",
      state: "working",
      location: "Lucky Star Casino",
      resources: 93,
      earnings: 2250,
      level: 8
    },
    {
      id: 15,
      name: "Jasper",
      role: "Explorer",
      icon: "🧭",
      color: "#66BB6A",
      state: "idle",
      location: "Hospital",
      resources: 79,
      earnings: 1120,
      level: 4
    }
  ], []);
  
  // Generate random starting positions for agents
  const agentStartPositions = useMemo(() => {
    return agentData.map(() => {
      // Start agents on roads
      const roadChoice = Math.floor(Math.random() * 4);
      let x, z;
      
      switch(roadChoice) {
        case 0: // Horizontal road
          x = Math.random() * CITY_SIZE - CITY_SIZE/2;
          z = Math.floor(Math.random() * 5 - 2) * BLOCK_SIZE;
          break;
        case 1: // Vertical road
          x = Math.floor(Math.random() * 5 - 2) * BLOCK_SIZE;
          z = Math.random() * CITY_SIZE - CITY_SIZE/2;
          break;
        default:
          // Intersection
          x = Math.floor(Math.random() * 5 - 2) * BLOCK_SIZE;
          z = Math.floor(Math.random() * 5 - 2) * BLOCK_SIZE;
      }
      
      return [x, 1, z] as [number, number, number];
    });
  }, []);
  
  // Define vehicles data
  const vehiclesData = useMemo(() => {
    const vehicles = [];
    
    // Taxis
    for (let i = 0; i < 8; i++) {  // Increased from 5 to 8
      vehicles.push({
        type: 'taxi' as const,
        color: '#FFD700',
        position: [
          Math.random() * CITY_SIZE - CITY_SIZE/2,
          0.1,
          Math.random() * CITY_SIZE - CITY_SIZE/2
        ] as [number, number, number],
        speed: 5 + Math.random() * 2
      });
    }
    
    // Cars with different colors
    const carColors = ['#3366CC', '#DC3545', '#28A745', '#6F42C1', '#FD7E14', '#20C997', '#E83E8C', '#17A2B8', '#6610F2'];
    for (let i = 0; i < 12; i++) {  // Increased from 8 to 12
      vehicles.push({
        type: 'car' as const,
        color: carColors[i % carColors.length],
        position: [
          Math.random() * CITY_SIZE - CITY_SIZE/2,
          0.1,
          Math.random() * CITY_SIZE - CITY_SIZE/2
        ] as [number, number, number],
        speed: 4 + Math.random() * 3
      });
    }
    
    // Buses
    for (let i = 0; i < 4; i++) {  // Increased from 2 to 4
      vehicles.push({
        type: 'bus' as const,
        color: '#3498DB',
        position: [
          Math.random() * CITY_SIZE - CITY_SIZE/2,
          0.1,
          Math.random() * CITY_SIZE - CITY_SIZE/2
        ] as [number, number, number],
        speed: 3 + Math.random()
      });
    }
    
    return vehicles;
  }, []);
  
  // Define NPCs data
  const npcsData = useMemo(() => {
    const npcs = [];
    const npcColors = ['#F5DEB3', '#D2B48C', '#BC8F8F', '#A0522D', '#8B4513', '#FFDEAD', '#FFE4C4', '#CD853F', '#DEB887'];
    
    for (let i = 0; i < 40; i++) {  // Increased from 25 to 40
      npcs.push({
        color: npcColors[Math.floor(Math.random() * npcColors.length)],
        position: [
          Math.random() * CITY_SIZE - CITY_SIZE/2,
          0.6,
          Math.random() * CITY_SIZE - CITY_SIZE/2
        ] as [number, number, number],
        speed: 0.8 + Math.random() * 1.2
      });
    }
    
    return npcs;
  }, []);
  
  return (
    <group>
      {/* Ground */}
      <Ground />
      
      {/* Roads */}
      <Road />
      
      {/* Buildings */}
      {buildings.map((building, i) => (
        <Building 
          key={`building-${i}`} 
          {...building}
        />
      ))}
      
      {/* Vehicles */}
      {vehiclesData.map((vehicle, i) => (
        <Vehicle 
          key={`vehicle-${i}`} 
          position={vehicle.position}
          color={vehicle.color}
          type={vehicle.type}
          speed={vehicle.speed}
        />
      ))}
      
      {/* NPCs */}
      {npcsData.map((npc, i) => (
        <NPC 
          key={`npc-${i}`} 
          position={npc.position}
          color={npc.color}
          speed={npc.speed}
        />
      ))}
      
      {/* Agents */}
      {agentData.map((agent, i) => (
        <Agent 
          key={`agent-${i}`} 
          position={agentStartPositions[i]}
          color={agent.color}
          speed={1 + Math.random() * 2}
          agentData={agent}
          onAgentClick={onAgentClick}
        />
      ))}
      
      {/* City name */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5}>
        <Text
          position={[0, 60, 0]}
          fontSize={15}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.8}
        >
          AGENTARIUM CITY
        </Text>
      </Float>
      
      {/* City map labels - floating above buildings */}
      {mapLabels.map((label, i) => (
        <Float 
          key={`label-${i}`}
          speed={0.5} 
          rotationIntensity={0.2} 
          floatIntensity={0.3}
          position={[label.position[0], label.position[1] + 25, label.position[2]]}
        >
          <group>
            {/* Label background */}
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[label.name.length * 0.8 + 1, 1.5]} />
              <meshBasicMaterial color="#000000" opacity={0.5} transparent />
            </mesh>
            
            {/* Label text */}
            <Text
              position={[0, 0, 0.1]}
              fontSize={1}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
            >
              {label.name}
            </Text>
          </group>
        </Float>
      ))}
    </group>
  );
};

// Main component - split into scene content and wrapper
const SceneContent: React.FC<{ onAgentClick: (agent: any) => void, timeOfDay: string, setTimeOfDay: (time: string) => void, onTimeChange: (time: string) => void }> = 
    ({ onAgentClick, timeOfDay, setTimeOfDay, onTimeChange }) => {
  // For time cycle tracking
  const timeRef = useRef({ time: 0, cycleLength: 300 }); // 5-minute cycle
  
  // Update time of day - this is safe inside Canvas
  useFrame((state) => {
    try {
      timeRef.current.time += state.clock.elapsedTime * 0.001;
      const normalizedTime = (timeRef.current.time % timeRef.current.cycleLength) / timeRef.current.cycleLength;
      
      // Change time of day based on cycle
      let newTimeOfDay = timeOfDay;
      if (normalizedTime < 0.45 && timeOfDay !== 'day') {
        newTimeOfDay = 'day';
        setTimeOfDay(newTimeOfDay);
      } else if (normalizedTime >= 0.45 && normalizedTime < 0.55 && timeOfDay !== 'sunset') {
        newTimeOfDay = 'sunset';
        setTimeOfDay(newTimeOfDay);
      } else if (normalizedTime >= 0.55 && timeOfDay !== 'night') {
        newTimeOfDay = 'night';
        setTimeOfDay(newTimeOfDay);
      }
      
      // Notify parent component when time changes
      if (newTimeOfDay !== timeOfDay) {
        onTimeChange(newTimeOfDay);
      }
    } catch (error) {
      console.error("Error in time update frame:", error);
    }
  });
  
  // Sky and lighting settings based on time of day
  const getLightingSettings = () => {
    switch (timeOfDay) {
      case 'day':
        return {
          skyColor: '#87ceeb',
          sunPosition: [1, 0.5, 0] as [number, number, number],
          ambientIntensity: 0.7,
          directionalIntensity: 1.2,
          directionalPosition: [100, 100, 50] as [number, number, number],
          directionalColor: '#FFFFFF',
          fogColor: '#1a2e3b',
          hemisphereArgs: ['#87ceeb', '#3f3f3f', 0.8] as [string, string, number]
        };
      case 'sunset':
        return {
          skyColor: '#FF7F50',
          sunPosition: [0.3, 0.1, 0] as [number, number, number],
          ambientIntensity: 0.5,
          directionalIntensity: 0.8,
          directionalPosition: [50, 20, 100] as [number, number, number],
          directionalColor: '#FF7F50',
          fogColor: '#4B0082',
          hemisphereArgs: ['#FF7F50', '#4B0082', 0.6] as [string, string, number]
        };
      case 'night':
        return {
          skyColor: '#000033',
          sunPosition: [-0.5, -0.2, 0] as [number, number, number],
          ambientIntensity: 0.2,
          directionalIntensity: 0.3,
          directionalPosition: [-50, 20, -100] as [number, number, number],
          directionalColor: '#3333FF',
          fogColor: '#000033',
          hemisphereArgs: ['#000033', '#000011', 0.3] as [string, string, number]
        };
      default:
        return {
          skyColor: '#87ceeb',
          sunPosition: [1, 0.5, 0] as [number, number, number],
          ambientIntensity: 0.7,
          directionalIntensity: 1.2,
          directionalPosition: [100, 100, 50] as [number, number, number],
          directionalColor: '#FFFFFF',
          fogColor: '#1a2e3b',
          hemisphereArgs: ['#87ceeb', '#3f3f3f', 0.8] as [string, string, number]
        };
    }
  };
  
  const settings = getLightingSettings();
  
  return (
    <>
      <fog attach="fog" args={[settings.fogColor, 120, 350]} />
      <color attach="background" args={[settings.skyColor]} />
      
      <ambientLight intensity={settings.ambientIntensity} />
      <directionalLight
        castShadow
        position={settings.directionalPosition}
        intensity={settings.directionalIntensity}
        color={settings.directionalColor}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      <hemisphereLight args={settings.hemisphereArgs} />
      <Sky distance={450000} sunPosition={settings.sunPosition} />
      
      {/* Add stars at night */}
      {timeOfDay === 'night' && (
        <group>
          {Array.from({ length: 200 }).map((_, i) => {
            const x = Math.random() * 400 - 200;
            const y = Math.random() * 200 + 50;
            const z = Math.random() * 400 - 200;
            const size = Math.random() * 0.5 + 0.1;
            
            return (
              <mesh key={`star-${i}`} position={[x, y, z]}>
                <sphereGeometry args={[size, 8, 8]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            );
          })}
        </group>
      )}
      
      {/* Clouds */}
      <group position={[0, 60, 0]}>
        <Cloud position={[-40, 20, -20]} speed={0.2} opacity={0.7} />
        <Cloud position={[40, 10, 30]} speed={0.1} opacity={0.6} />
        <Cloud position={[-60, 0, 40]} speed={0.3} opacity={0.5} />
        <Cloud position={[20, 20, -50]} speed={0.15} opacity={0.6} />
        <Cloud position={[-10, 10, 60]} speed={0.25} opacity={0.7} />
      </group>
      
      <City onAgentClick={onAgentClick} />
      
      <Environment preset={timeOfDay === 'night' ? 'night' : 'city'} />
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 8}
        minDistance={40}
        maxDistance={160}
        target={[0, 0, 0]}
        autoRotate={false}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
};

// Fallback component if Three.js fails
const FallbackScene = () => {
  return (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
      <div className="text-center p-6 max-w-md bg-black/50 rounded-lg backdrop-blur-sm border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-3">Agentarium City</h3>
        <p className="text-white/80 mb-4">
          The 3D simulation requires a modern browser with WebGL support.
        </p>
        <div className="flex justify-center space-x-4 mt-6">
          <div className="bg-blue-500/20 px-3 py-2 rounded-md">
            <span className="text-blue-300 text-xs">AI Agents</span>
          </div>
          <div className="bg-green-500/20 px-3 py-2 rounded-md">
            <span className="text-green-300 text-xs">Virtual Economy</span>
          </div>
          <div className="bg-amber-500/20 px-3 py-2 rounded-md">
            <span className="text-amber-300 text-xs">Earn $AGENT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main wrapper component with error handling
const MainGameScene: React.FC<ClientGameSceneProps> = ({ onAgentClick = () => {}, onTimeChange = () => {} }) => {
  // Control day/night cycle - state moved to parent to avoid hooks outside Canvas
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [hasError, setHasError] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  
  // Handle WebGL and Three.js initialization errors
  useEffect(() => {
    const handleError = () => {
      console.error("WebGL/Three.js initialization error detected");
      setHasError(true);
    };
    
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        handleError();
      }
    } catch (e) {
      handleError();
    }
    
    // Listen for error events that might indicate Three.js failures
    window.addEventListener('error', (e) => {
      if (e.message && (
        e.message.includes('WebGL') || 
        e.message.includes('three') || 
        e.message.includes('R3F') ||
        e.message.includes('Canvas')
      )) {
        handleError();
      }
    });
  }, []);
  
  if (hasError) {
    return <FallbackScene />;
  }
  
  // Wrap the Canvas in a try-catch during rendering
  try {
    return (
      <Canvas 
        shadows
        className="w-full h-full"
        camera={{ position: [80, 80, 80], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={[1, 1.5]} // Reduced max DPR for better performance
        onCreated={state => {
          console.log("Canvas initialized");
          setCanvasLoaded(true);
        }}
      >
        {canvasLoaded && (
          <SceneContent 
            onAgentClick={onAgentClick} 
            timeOfDay={timeOfDay} 
            setTimeOfDay={setTimeOfDay} 
            onTimeChange={onTimeChange}
          />
        )}
      </Canvas>
    );
  } catch (error) {
    console.error("Error rendering Three.js Canvas:", error);
    return <FallbackScene />;
  }
};

export default MainGameScene;