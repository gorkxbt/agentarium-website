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
const CITY_SIZE = 180;
const ROAD_WIDTH = 12;
const BLOCK_SIZE = 35;
const SIDEWALK_WIDTH = 3;

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
      // Road points (safer navigation)
      new THREE.Vector3(-BLOCK_SIZE, 0, 0),
      new THREE.Vector3(0, 0, -BLOCK_SIZE),
      new THREE.Vector3(0, 0, BLOCK_SIZE),
      new THREE.Vector3(BLOCK_SIZE, 0, 0),
      // Road intersections
      new THREE.Vector3(-BLOCK_SIZE, 0, -BLOCK_SIZE - ROAD_WIDTH/2), // Near bank
      new THREE.Vector3(BLOCK_SIZE, 0, -BLOCK_SIZE - ROAD_WIDTH/2),  // Near police
      new THREE.Vector3(-BLOCK_SIZE, 0, BLOCK_SIZE + ROAD_WIDTH/2),  // Near market
      new THREE.Vector3(BLOCK_SIZE, 0, BLOCK_SIZE + ROAD_WIDTH/2)    // Near hotel
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
  const getLocationName = () => {
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
    const updatedAgentData = {
      ...agentData,
      state: currentState,
      location: getLocationName(),
      // Simulate earning resources based on state and location
      resources: agentData.resources + (currentState === 'working' ? 5 : 1),
      earnings: agentData.earnings + (currentState === 'working' ? 2 : 0.2)
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
    for (let i = -2; i <= 2; i++) {
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
  
  // Update target when vehicle reaches current target
  const updateTarget = () => {
    const possibleTargets = roadPoints.filter(point => {
      // Only consider road points (not inside blocks)
      const isOnRoadX = Math.abs(point.x % BLOCK_SIZE) < ROAD_WIDTH/2;
      const isOnRoadZ = Math.abs(point.z % BLOCK_SIZE) < ROAD_WIDTH/2;
      return isOnRoadX || isOnRoadZ;
    });
    
    // Choose a random valid road point
    const newTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    targetRef.current.copy(newTarget);
  };
  
  // Initial target update
  useEffect(() => {
    updateTarget();
  }, []);
  
  useFrame((state, delta) => {
    try {
      if (!meshRef.current) return;
      
      // Move towards target
      const direction = new THREE.Vector3().subVectors(targetRef.current, meshRef.current.position);
      
      // If close to target, update target
      if (direction.length() < 1) {
        updateTarget();
        return;
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
  const [state, setState] = useState('idle');
  const [stateTimer, setStateTimer] = useState(Math.random() * 3);
  
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
    
    // Get valid sidewalk points (not inside buildings)
    const validPoints = sidewalkPoints.filter(point => 
      !isInsideBuilding(point.x, point.z)
    );
    
    // Pick a random valid point
    const newTarget = validPoints[Math.floor(Math.random() * validPoints.length)];
    targetRef.current.copy(newTarget);
  };
  
  // Update NPC state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Random state change
      const rand = Math.random();
      if (rand < 0.3) {
        setState('idle');
        setStateTimer(Math.random() * 3 + 2); // Idle for 2-5 seconds
      } else {
        setState('walking');
        setStateTimer(Math.random() * 10 + 5); // Walk for 5-15 seconds
        updateTarget(); // Get a new destination
      }
    }, stateTimer * 1000);
    
    return () => clearInterval(interval);
  }, [stateTimer]);
  
  useFrame((frameState, delta) => {
    try {
      if (!meshRef.current) return;
      
      // Only move if in walking state
      if (state !== 'walking') return;
      
      // Move towards target
      const direction = new THREE.Vector3().subVectors(targetRef.current, meshRef.current.position);
      
      // If close to target, become idle
      if (direction.length() < 0.5) {
        setState('idle');
        setStateTimer(Math.random() * 3 + 2); // Idle for 2-5 seconds
        return;
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
      
      // Bobbing animation when walking
      meshRef.current.position.y = position[1] + Math.sin(frameState.clock.elapsedTime * 5) * 0.05;
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
  
  // City map labels
  const mapLabels = [
    { position: [-BLOCK_SIZE, 0, -BLOCK_SIZE], name: "Bank" },
    { position: [BLOCK_SIZE, 0, -BLOCK_SIZE], name: "Police" },
    { position: [-BLOCK_SIZE, 0, BLOCK_SIZE], name: "Market" },
    { position: [BLOCK_SIZE, 0, BLOCK_SIZE], name: "Hotel" },
    { position: [0, 0, -2 * BLOCK_SIZE], name: "Gas" },
    { position: [-2 * BLOCK_SIZE, 0, 0], name: "Tech Hub" },
    { position: [2 * BLOCK_SIZE, 0, 0], name: "Finance" },
    { position: [0, 0, 2 * BLOCK_SIZE], name: "Houses" }
  ];
  
  // Define vehicles data
  const vehiclesData = useMemo(() => {
    const vehicles = [];
    
    // Taxis
    for (let i = 0; i < 5; i++) {
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
    const carColors = ['#3366CC', '#DC3545', '#28A745', '#6F42C1', '#FD7E14', '#20C997', '#E83E8C'];
    for (let i = 0; i < 8; i++) {
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
    for (let i = 0; i < 2; i++) {
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
    const npcColors = ['#F5DEB3', '#D2B48C', '#BC8F8F', '#A0522D', '#8B4513', '#FFDEAD', '#FFE4C4'];
    
    for (let i = 0; i < 15; i++) {
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

// Main component
const ClientGameScene: React.FC<ClientGameSceneProps> = ({ onAgentClick = () => {}, onTimeChange = () => {} }) => {
  // Control day/night cycle
  const [timeOfDay, setTimeOfDay] = useState('day');
  const timeRef = useRef({ time: 0, cycleLength: 300 }); // 5-minute cycle
  
  // Update time of day
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
    <Canvas 
      shadows
      className="w-full h-full"
      camera={{ position: [100, 100, 100], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]} // Dynamic pixel ratio for better performance
    >
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
    </Canvas>
  );
};

export default ClientGameScene;