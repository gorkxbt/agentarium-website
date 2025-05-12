'use client';

import React, { useRef, useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { 
  OrbitControls, 
  Sky, 
  Environment, 
  Text,
  Trail,
  Float,
  Cloud,
  Html,
  PerspectiveCamera,
  useAnimations,
  useGLTF
} from '@react-three/drei';
import * as THREE from 'three';
import { isWebGLAvailable, resetWebGLContext } from '@/utils/webgl-helper';
import { CITY_SIZE, BLOCK_SIZE, ROAD_WIDTH } from './CityConstants';
import { getRoadPoints, getParkingSpots, isOnRoad, findNearestRoadPoint, isInsideBlock } from './VehicleLogic';

// Add interface extension for Window type
declare global {
  interface Window {
    resetWebGL?: () => void;
    THREE_INSTANCES?: any[];
  }
}

// Force a better initialization of WebGL context
if (typeof window !== 'undefined') {
  try {
    // Clear any previous WebGL contexts that might be stuck
    const existingCanvases = document.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => {
      const context = canvas.getContext('webgl') as WebGLRenderingContext | null || 
                      canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (context) {
        const loseExt = context.getExtension('WEBGL_lose_context');
        if (loseExt) loseExt.loseContext();
      }
    });

    // Create a canvas element to pre-initialize WebGL context
    const preInitCanvas = document.createElement('canvas');
    // Set canvas size to ensure proper context creation
    preInitCanvas.width = 512;
    preInitCanvas.height = 384;
    
    // Try multiple context options
    let preInitContext = preInitCanvas.getContext('webgl', { 
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      alpha: false,
      antialias: false,
      depth: true
    }) as WebGLRenderingContext | null;
    
    // If that failed, try another approach
    if (!preInitContext) {
      preInitContext = preInitCanvas.getContext('webgl', { 
        powerPreference: 'low-power',
        depth: true
      }) as WebGLRenderingContext | null;
    }
    
    // Force the context to initialize
    if (preInitContext) {
      preInitContext.clearColor(0, 0, 0, 1);
      preInitContext.clear(preInitContext.COLOR_BUFFER_BIT);
      
      // Attempt to initialize a minimal scene
      preInitContext.viewport(0, 0, preInitCanvas.width, preInitCanvas.height);
      
      // Additional initialization to avoid WebGL context loss
      const ext = preInitContext.getExtension('WEBGL_lose_context');
      if (ext) {
        setTimeout(() => {
          ext.restoreContext();
        }, 100);
      }
    }
    
    // Add a globally accessible debugging function
    window.resetWebGL = () => {
      console.log("Manual WebGL reset triggered");
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
        if (gl) {
          const ext = gl.getExtension('WEBGL_lose_context');
          if (ext) {
            ext.loseContext();
            setTimeout(() => ext.restoreContext(), 200);
          }
        }
      });
      
      // Don't force reload to prevent game disappearing
      // setTimeout(() => window.location.reload(), 500);
    };
  } catch (e) {
    console.warn('Failed pre-initialization of WebGL context', e);
  }
}

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

// Create a ref for storing map data to be accessible by various components
const mapDataRef = React.createRef<{
  buildings: BuildingProps[];
  npcs: NPCProps[];
  vehicles: VehicleProps[];
  agents: AgentProps[];
  mapLabels: {name: string; position: [number, number, number]}[];
}>();

// Error boundary to catch rendering errors
class ErrorBoundary extends React.Component<{
  children: React.ReactNode, 
  fallback: React.ReactNode,
  onError?: () => void
}> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error in 3D scene:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}

interface ClientGameSceneProps {
  onAgentClick?: (agent: any) => void;
  forceLoaded?: boolean;
}

// City configuration
const SIDEWALK_WIDTH = 4; // Wider sidewalks
const BUILDING_TYPES = {
  BANK: 'bank',
  POLICE: 'police',
  MARKET: 'supermarket',
  HOTEL: 'hotel',
  GAS: 'gas_station',
  OFFICE: 'office',
  TECH_HUB: 'tech_hub',
  FINANCE: 'finance_center',
  HOUSE: 'house',
  APARTMENT: 'apartment',
  NIGHTCLUB: 'nightclub',
  SHOPPING_MALL: 'mall',
  RESTAURANT: 'restaurant',
  HOSPITAL: 'hospital',
  FACTORY: 'factory',
  CASINO: 'casino',
  PARK: 'park',
  SCHOOL: 'school',
  LIBRARY: 'library',
  COFFEE_SHOP: 'coffee_shop',
  GYM: 'gym',
  TRANSPORT_HUB: 'transport_hub',
  RETAIL: 'retail',
  SUPERMARKET: 'supermarket',
  GAS_STATION: 'gas_station',
  MALL: 'mall',
  ENTERTAINMENT: 'entertainment',
  WAREHOUSE: 'warehouse',
  INDUSTRIAL: 'industrial',
};

// Building colors with improved aesthetics
const BUILDING_COLORS = {
  [BUILDING_TYPES.BANK]: '#11bb88',
  [BUILDING_TYPES.POLICE]: '#4488ee',
  [BUILDING_TYPES.MARKET]: '#44aa66',
  [BUILDING_TYPES.HOTEL]: '#ddaa33',
  [BUILDING_TYPES.GAS]: '#dd5555',
  [BUILDING_TYPES.OFFICE]: '#778899',
  [BUILDING_TYPES.TECH_HUB]: '#9988aa',
  [BUILDING_TYPES.FINANCE]: '#667788',
  [BUILDING_TYPES.HOUSE]: '#aa7744',
  [BUILDING_TYPES.APARTMENT]: '#cc9966',
  [BUILDING_TYPES.NIGHTCLUB]: '#cc55ee',
  [BUILDING_TYPES.SHOPPING_MALL]: '#ee77aa',
  [BUILDING_TYPES.RESTAURANT]: '#ee8844',
  [BUILDING_TYPES.HOSPITAL]: '#5599dd',
  [BUILDING_TYPES.FACTORY]: '#999999',
  [BUILDING_TYPES.CASINO]: '#9944bb',
  [BUILDING_TYPES.PARK]: '#66cc77',
  [BUILDING_TYPES.SCHOOL]: '#ffaa55',
  [BUILDING_TYPES.LIBRARY]: '#cc7755',
  [BUILDING_TYPES.COFFEE_SHOP]: '#bb9977',
  [BUILDING_TYPES.GYM]: '#dd7766',
  [BUILDING_TYPES.TRANSPORT_HUB]: '#66aadd',
  [BUILDING_TYPES.RETAIL]: '#ffcc00',
  [BUILDING_TYPES.SUPERMARKET]: '#ff6600',
  [BUILDING_TYPES.GAS_STATION]: '#cc0000',
  [BUILDING_TYPES.MALL]: '#ff9900',
  [BUILDING_TYPES.ENTERTAINMENT]: '#00ff00',
  [BUILDING_TYPES.WAREHOUSE]: '#808080',
  [BUILDING_TYPES.INDUSTRIAL]: '#444444',
};

// Building names mapping
const BUILDING_NAMES = {
  [BUILDING_TYPES.BANK]: '$AGENT Bank',
  [BUILDING_TYPES.POLICE]: 'Police Station',
  [BUILDING_TYPES.MARKET]: 'Supermarket',
  [BUILDING_TYPES.HOTEL]: 'Grand Hotel',
  [BUILDING_TYPES.GAS]: 'Gas Station',
  [BUILDING_TYPES.OFFICE]: 'Office Building',
  [BUILDING_TYPES.TECH_HUB]: 'Tech Hub',
  [BUILDING_TYPES.FINANCE]: 'Finance Center',
  [BUILDING_TYPES.HOUSE]: 'Residential Home',
  [BUILDING_TYPES.APARTMENT]: 'Apartment Complex',
  [BUILDING_TYPES.NIGHTCLUB]: 'Pulse Nightclub',
  [BUILDING_TYPES.SHOPPING_MALL]: 'Shopping Mall',
  [BUILDING_TYPES.RESTAURANT]: 'Fine Dining Restaurant',
  [BUILDING_TYPES.HOSPITAL]: 'City Hospital',
  [BUILDING_TYPES.FACTORY]: 'Factory',
  [BUILDING_TYPES.CASINO]: 'Lucky Star Casino',
  [BUILDING_TYPES.PARK]: 'City Park',
  [BUILDING_TYPES.SCHOOL]: 'Education Center',
  [BUILDING_TYPES.LIBRARY]: 'Public Library',
  [BUILDING_TYPES.COFFEE_SHOP]: 'Coffee Shop',
  [BUILDING_TYPES.GYM]: 'Fitness Center',
  [BUILDING_TYPES.TRANSPORT_HUB]: 'Transport Hub',
  [BUILDING_TYPES.RETAIL]: 'Retail Store',
  [BUILDING_TYPES.SUPERMARKET]: 'Supermarket',
  [BUILDING_TYPES.GAS_STATION]: 'Gas Station',
  [BUILDING_TYPES.MALL]: 'Shopping Mall',
  [BUILDING_TYPES.ENTERTAINMENT]: 'Entertainment Venue',
  [BUILDING_TYPES.WAREHOUSE]: 'Warehouse',
  [BUILDING_TYPES.INDUSTRIAL]: 'Industrial Building',
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
    // Get reference to city's building list through mapDataRef
    const buildingsList = mapDataRef.current?.buildings || [];
    
    // Add a small buffer around buildings to prevent getting too close
    const buffer = 3;
    
    return buildingsList.some((building: BuildingProps) => {
      const [bx, , bz] = building.position;
      
      // Calculate half dimensions with buffer
      const halfWidth = building.width / 2 + buffer;
      const halfDepth = building.depth / 2 + buffer;
      
      // Check if point is inside building (accounting for rotation)
      // For simplicity, we'll use a distance-based check that approximates the rotated building
      const distance = Math.sqrt(Math.pow(x - bx, 2) + Math.pow(z - bz, 2));
      const maxRadius = Math.sqrt(halfWidth * halfWidth + halfDepth * halfDepth);
      
      return distance < maxRadius;
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
        
        // Calculate next position with reduced speed to make movements more visible
        const nextPosition = new THREE.Vector3().copy(meshRef.current.position);
        direction.normalize().multiplyScalar(delta * speed * 0.5); // Reduced speed multiplier
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
    // Create updated agent data with current state and earnings
    const updatedAgentData = {
      ...agentData,
      state: state.state,
      location: state.location,
      resources: state.resources,
      earnings: state.earnings
    };
    
    // Pass the updated data to the click handler
    onAgentClick(updatedAgentData);
  };
  
  // State for agent earnings and behavior
  const [state, setState] = useState({
    state: agentData.state,
    location: agentData.location,
    resources: agentData.resources,
    earnings: agentData.earnings,
    lastEarningTime: Date.now()
  });
  
  // Role-specific earning multipliers at different locations
  const roleMultipliers = useMemo(() => ({
    Trader: {
      "Bank": 2.5,
      "Shopping Mall": 2.2, 
      "Downtown": 1.8
    },
    Scientist: {
      "Tech Hub": 2.6,
      "City Hospital": 2.3,
      "Factory": 1.9
    },
    Builder: {
      "Factory": 2.5,
      "House 1": 2.2,
      "House 2": 2.2,
      "House 3": 2.2,
      "House 4": 2.2,
      "House 5": 2.2,
      "House 6": 2.2
    },
    Explorer: {
      "Downtown": 2.4,
      "Gas Station": 1.8,
      "On the Road": 2.1
    },
    Farmer: {
      "House 1": 2.3,
      "House 2": 2.3,
      "House 3": 2.3,
      "House 4": 2.3,
      "House 5": 2.3,
      "House 6": 2.3,
      "Supermarket": 2.0
    }, 
    Engineer: {
      "Factory": 2.6,
      "Tech Hub": 2.4,
      "City Hospital": 1.9
    },
    Hacker: {
      "Tech Hub": 2.5,
      "Finance Center": 2.3,
      "Bank": 2.0
    },
    Diplomat: {
      "Hotel": 2.2,
      "Finance Center": 2.0,
      "Police Station": 1.8
    },
    Courier: {
      "On the Road": 2.4,
      "Gas Station": 2.1,
      "Downtown": 1.9
    },
    Mystic: {
      "Lucky Star Casino": 2.6,
      "Pulse Nightclub": 2.3,
      "Fine Dining Restaurant": 2.0
    }
  }), []);
  
  // Add earning calculation logic
  useEffect(() => {
    const earningInterval = setInterval(() => {
      if (state.state === 'working') {
        const now = Date.now();
        const timeDiff = (now - state.lastEarningTime) / 1000; // in seconds
        
        // Base earning rate
        let baseEarning = agentData.level * 0.5 * timeDiff;
        
        // Apply location multipliers based on agent role
        const roleMultiplierMap = roleMultipliers[agentData.role as keyof typeof roleMultipliers];
        const locationMultiplier = roleMultiplierMap && roleMultiplierMap[state.location as keyof typeof roleMultiplierMap];
        
        if (locationMultiplier) {
          baseEarning *= locationMultiplier;
        }
        
        // Building-specific bonuses
        if (state.location === "Lucky Star Casino" || state.location === "Pulse Nightclub") {
          baseEarning *= 1.2; // 20% bonus at entertainment venues
        }
        
        // Update earnings and distribute to stakers (simulated)
        setState(prev => ({
          ...prev,
          earnings: prev.earnings + baseEarning,
          resources: Math.min(100, prev.resources + baseEarning * 0.1),
          lastEarningTime: now
        }));
      }
    }, 3000);
    
    return () => clearInterval(earningInterval);
  }, [state.state, state.location, agentData.level, agentData.role, roleMultipliers]);
  
  // Update updateState function to make agents more focused on earning $AGENT
  const updateState = () => {
    // Agents have a higher chance to work at profitable locations
    const currentPosition = meshRef.current?.position || new THREE.Vector3();
    const locationName = getLocationName();
    
    // Check if we're at a high-value location for our role
    const roleMultiplierMap = roleMultipliers[agentData.role as keyof typeof roleMultipliers];
    const locationMultiplier = roleMultiplierMap && roleMultiplierMap[locationName as keyof typeof roleMultiplierMap];
    
    if (locationMultiplier && locationMultiplier > 1.5) {
      // Higher chance to work at valuable locations
      const workProbability = 0.7 + (locationMultiplier - 1.5) * 0.2;
      if (Math.random() < workProbability) {
        setState(prev => ({
          ...prev,
          state: 'working',
          location: locationName
        }));
        
        // Update agent data for displaying to users
        agentData.state = 'working';
        agentData.location = locationName;
        
        return;
      }
    }
    
    // Regular state switching logic
    const rand = Math.random();
    if (rand < 0.2) {
      setState(prev => ({
        ...prev,
        state: 'idle',
        location: locationName
      }));
      
      // Update agent data
      agentData.state = 'idle';
      agentData.location = locationName;
      
    } else if (rand < 0.6) {
      setState(prev => ({
        ...prev,
        state: 'walking',
        location: locationName
      }));
      
      // Update agent data
      agentData.state = 'walking';
      agentData.location = locationName;
      
      updateTarget();
    } else {
      setState(prev => ({
        ...prev,
        state: 'working',
        location: locationName
      }));
      
      // Update agent data
      agentData.state = 'working';
      agentData.location = locationName;
    }
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
  // Create a basic texture for the ground
  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Base color
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add some texture/noise
    for (let i = 0; i < 5000; i++) {
      const size = Math.random() * 2 + 1;
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      
      ctx.fillStyle = `rgba(50, 50, 50, ${Math.random() * 0.3})`;
      ctx.fillRect(x, y, size, size);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    return texture;
  }, []);
  
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[CITY_SIZE * 1.5, CITY_SIZE * 1.5]} />
      <meshStandardMaterial 
        map={groundTexture || undefined}
        roughness={0.8}
        color="#666666"
      />
    </mesh>
  );
};

// Road component
const Road: React.FC = () => {
  // Create road texture with lane markings
  const roadTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Dark asphalt color
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add texture/noise
    for (let i = 0; i < 4000; i++) {
      const size = Math.random() * 2 + 0.5;
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      
      const grayVal = Math.floor(30 + Math.random() * 20);
      ctx.fillStyle = `rgba(${grayVal}, ${grayVal}, ${grayVal}, ${Math.random() * 0.4})`;
      ctx.fillRect(x, y, size, size);
    }
    
    // Add center yellow lines
    ctx.fillStyle = '#FFCC00';
    ctx.fillRect(250, 0, 12, 512);
    
    // Add white lane markers
    ctx.fillStyle = '#FFFFFF';
    for (let y = 0; y < 512; y += 40) {
      ctx.fillRect(200, y, 6, 20);
      ctx.fillRect(306, y, 6, 20);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 1);
    return texture;
  }, []);
  
  return (
    <group>
      {/* Main horizontal road */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CITY_SIZE, ROAD_WIDTH]} />
          <meshStandardMaterial 
          map={roadTexture || undefined}
            roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Main vertical road */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[CITY_SIZE, ROAD_WIDTH]} />
        <meshStandardMaterial
          map={roadTexture || undefined}
          roughness={0.9}
          metalness={0.1}
        />
            </mesh>
      
      {/* Additional horizontal roads */}
      {[-CITY_SIZE / 3, CITY_SIZE / 3].map((offset, i) => (
        <mesh key={`h-road-${i}`} receiveShadow position={[0, 0.01, offset]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CITY_SIZE, ROAD_WIDTH]} />
          <meshStandardMaterial
            map={roadTexture || undefined}
            roughness={0.9}
            metalness={0.1}
          />
            </mesh>
      ))}
      
      {/* Additional vertical roads */}
      {[-CITY_SIZE / 3, CITY_SIZE / 3].map((offset, i) => (
        <mesh key={`v-road-${i}`} receiveShadow position={[offset, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[CITY_SIZE, ROAD_WIDTH]} />
          <meshStandardMaterial
            map={roadTexture || undefined}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {/* Sidewalks */}
      {[0, -CITY_SIZE / 3, CITY_SIZE / 3].flatMap((zOffset, i) => [
        <mesh key={`hsw-top-${i}`} receiveShadow position={[0, 0, zOffset + ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CITY_SIZE, SIDEWALK_WIDTH]} />
          <meshStandardMaterial color="#888888" roughness={0.8} />
        </mesh>,
        <mesh key={`hsw-bottom-${i}`} receiveShadow position={[0, 0, zOffset - ROAD_WIDTH / 2 - SIDEWALK_WIDTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CITY_SIZE, SIDEWALK_WIDTH]} />
          <meshStandardMaterial color="#888888" roughness={0.8} />
        </mesh>
      ])}
      
      {[0, -CITY_SIZE / 3, CITY_SIZE / 3].flatMap((xOffset, i) => [
        <mesh key={`vsw-right-${i}`} receiveShadow position={[xOffset + ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[SIDEWALK_WIDTH, CITY_SIZE]} />
          <meshStandardMaterial color="#888888" roughness={0.8} />
        </mesh>,
        <mesh key={`vsw-left-${i}`} receiveShadow position={[xOffset - ROAD_WIDTH / 2 - SIDEWALK_WIDTH / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[SIDEWALK_WIDTH, CITY_SIZE]} />
          <meshStandardMaterial color="#888888" roughness={0.8} />
        </mesh>
      ])}
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
  const [hovered, setHovered] = useState(false);
  const buildingRef = useRef<THREE.Group>(null);

  // Hover effect
  const onPointerOver = () => setHovered(true);
  const onPointerOut = () => setHovered(false);
  
  // Create window pattern texture
  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Base color
    ctx.fillStyle = '#111122';
    ctx.fillRect(0, 0, 256, 256);
    
    // Window pattern
    const rows = 8;
    const cols = 6;
    const cellW = 256 / cols;
    const cellH = 256 / rows;
    
    ctx.fillStyle = '#FFEECC';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.3) {
          ctx.globalAlpha = Math.random() * 0.6 + 0.4;
          ctx.fillRect(
            c * cellW + 5, 
            r * cellH + 5, 
            cellW - 10, 
            cellH - 10
          );
        }
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
  
  // Animate building on hover
  useFrame(() => {
    if (buildingRef.current && hovered) {
      buildingRef.current.scale.y = THREE.MathUtils.lerp(
        buildingRef.current.scale.y,
        1.03,
        0.1
      );
    } else if (buildingRef.current) {
      buildingRef.current.scale.y = THREE.MathUtils.lerp(
        buildingRef.current.scale.y,
        1,
        0.1
      );
    }
  });
  
  const renderBuildingContent = () => {
    // Different building styles based on type
    switch (type) {
      case BUILDING_TYPES.BANK:
        return (
          <group position={[0, height / 2, 0]}>
            {/* Base building */}
            <mesh receiveShadow castShadow>
              <boxGeometry args={[width, height, depth]} />
                        <meshStandardMaterial 
                color={BUILDING_COLORS[BUILDING_TYPES.BANK]} 
                roughness={0.5} 
                metalness={0.3}
                        />
                      </mesh>
                      
            {/* Windows */}
            <mesh position={[0, 0, depth / 2 + 0.05]}>
              <planeGeometry args={[width - 1, height - 1]} />
              <meshBasicMaterial 
                transparent 
                opacity={0.8} 
                map={windowTexture || undefined} 
                        />
                      </mesh>
            
            {/* Bank entrance pillars */}
            {[-width/4, width/4].map((x, i) => (
              <mesh key={`pillar-${i}`} position={[x, -height/2 + 4, depth/2 + 1]}>
                <cylinderGeometry args={[1, 1, 8, 8]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
            ))}
            
            {/* Bank sign */}
            <mesh position={[0, 0, depth / 2 + 0.6]}>
              <boxGeometry args={[width * 0.6, 3, 0.3]} />
              <meshStandardMaterial color="#11bb88" emissive="#00ff88" emissiveIntensity={0.3} />
                </mesh>
          </group>
        );
      
      case BUILDING_TYPES.CASINO:
        return (
          <group position={[0, height / 2, 0]}>
            {/* Base building */}
            <mesh receiveShadow castShadow>
              <boxGeometry args={[width, height, depth]} />
                        <meshStandardMaterial 
                color={BUILDING_COLORS[BUILDING_TYPES.CASINO]} 
                roughness={0.7} 
                metalness={0.3}
                        />
                      </mesh>
                      
            {/* Windows & Lights */}
            <mesh position={[0, 0, depth / 2 + 0.05]}>
              <planeGeometry args={[width - 1, height - 1]} />
              <meshBasicMaterial color="#880088" />
                      </mesh>
            
            {/* Casino sign */}
            <mesh position={[0, height / 2 + 2, 0]}>
              <boxGeometry args={[width * 0.7, 4, 2]} />
              <meshStandardMaterial color="#770088" emissive="#ff00ff" emissiveIntensity={0.5} />
            </mesh>
            
            {/* Small decorative dome */}
            <mesh position={[0, height / 2 + 5, 0]}>
              <sphereGeometry args={[3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#ffcc00" metalness={0.8} roughness={0.2} />
              </mesh>
          </group>
        );
        
      case BUILDING_TYPES.HOTEL:
        return (
          <group position={[0, height / 2, 0]}>
            {/* Main building */}
            <mesh receiveShadow castShadow>
              <boxGeometry args={[width, height, depth]} />
                      <meshStandardMaterial 
                color={BUILDING_COLORS[BUILDING_TYPES.HOTEL]} 
                roughness={0.6}
                metalness={0.2}
                      />
                    </mesh>
            
            {/* Windows */}
            <mesh position={[0, 0, depth / 2 + 0.05]}>
              <planeGeometry args={[width - 1, height - 1]} />
              <meshBasicMaterial 
                  transparent
                opacity={0.8} 
                map={windowTexture || undefined}
                />
              </mesh>
              
            {/* Hotel entrance canopy */}
            <mesh position={[0, -height / 2 + 3, depth / 2 + 3]} rotation={[Math.PI / 6, 0, 0]}>
              <boxGeometry args={[width / 3, 1, 6]} />
              <meshStandardMaterial color="#ffdd88" />
              </mesh>
            
            {/* Rooftop area */}
            <mesh position={[0, height / 2 + 1, 0]}>
              <boxGeometry args={[width - 4, 2, depth - 4]} />
              <meshStandardMaterial color="#885533" />
            </mesh>
          </group>
        );
      
      case BUILDING_TYPES.TECH_HUB:
        return (
          <group position={[0, height / 2, 0]}>
            {/* Base building */}
            <mesh receiveShadow castShadow>
              <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial 
                color={BUILDING_COLORS[BUILDING_TYPES.TECH_HUB]} 
                roughness={0.3}
                metalness={0.7}
                />
              </mesh>
              
            {/* Glass windows */}
            <mesh position={[0, 0, depth / 2 + 0.05]}>
              <planeGeometry args={[width - 0.5, height - 0.5]} />
                <meshStandardMaterial 
                color="#88ccff" 
                transparent 
                opacity={0.5} 
                roughness={0}
                metalness={1}
                />
              </mesh>
              
            {/* Rooftop antenna */}
            <mesh position={[0, height / 2 + 3, 0]}>
              <cylinderGeometry args={[0.2, 0.5, 6, 8]} />
              <meshStandardMaterial color="#333333" />
                    </mesh>
                  </group>
        );
        
      case BUILDING_TYPES.NIGHTCLUB:
        return (
          <group position={[0, height / 2, 0]}>
            {/* Main building */}
            <mesh receiveShadow castShadow>
              <boxGeometry args={[width, height, depth]} />
                      <meshStandardMaterial 
                color={BUILDING_COLORS[BUILDING_TYPES.NIGHTCLUB]} 
                roughness={0.5}
                metalness={0.5}
                      />
                    </mesh>
            
            {/* Neon sign */}
            <mesh position={[0, 0, depth / 2 + 0.2]}>
              <planeGeometry args={[width - 2, height - 2]} />
              <meshBasicMaterial color="#cc44ff" />
                </mesh>
                
            {/* Club entrance overhang */}
            <mesh position={[0, -height / 2 + 3, depth / 2 + 2]}>
              <boxGeometry args={[width / 2, 1, 4]} />
              <meshStandardMaterial color="#222222" emissive="#ff00ff" emissiveIntensity={0.3} />
                </mesh>
              </group>
        );
        
      default:
        return (
          <group position={[0, height / 2, 0]}>
            {/* Standard building */}
            <mesh receiveShadow castShadow>
              <boxGeometry args={[width, height, depth]} />
                      <meshStandardMaterial 
                color={color} 
                roughness={0.7}
                metalness={0.1}
              />
              </mesh>
              
            {/* Windows */}
            <mesh position={[0, 0, depth / 2 + 0.05]}>
              <planeGeometry args={[width - 1, height - 1]} />
              <meshBasicMaterial 
                transparent 
                opacity={0.8} 
                map={windowTexture || undefined}
                      />
                    </mesh>
            
            {/* Roof */}
            <mesh position={[0, height / 2 + 0.25, 0]}>
              <boxGeometry args={[width, 0.5, depth]} />
              <meshStandardMaterial color="#333333" />
              </mesh>
          </group>
        );
    }
  };
  
  return (
    <group 
      position={position} 
      rotation={[rotation[0], rotation[1], rotation[2]]} 
      ref={buildingRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {renderBuildingContent()}
      
      {/* Building label for hover state */}
      {hovered && (
        <Html position={[0, height + 3, 0]} center>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
            {name || BUILDING_NAMES[type] || 'Building'}
          </div>
        </Html>
      )}
    </group>
  );
};

// Vehicle component
const Vehicle: React.FC<VehicleProps> = ({ position, color = "#ff0000", type = 'car', speed = 5 }) => {
  const meshRef = useRef<THREE.Group>(null);
  const targetRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const [isParked, setIsParked] = useState(false);
  const [parkingTimer, setParkingTimer] = useState(Math.random() < 0.3 ? 10 + Math.random() * 20 : 0);
  const [currentLane, setCurrentLane] = useState(Math.random() > 0.5 ? 1 : -1);
  
  // Keep references to road and parking points
  const roadPointsRef = useRef<THREE.Vector3[]>([]);
  const parkingSpotsRef = useRef<THREE.Vector3[]>([]);
  
  // Initialize vehicle target and points
  useEffect(() => {
    try {
      // Generate road and parking spots
      const roadPoints = getRoadPoints();
      const parkingSpots = getParkingSpots();
      
      roadPointsRef.current = roadPoints;
      parkingSpotsRef.current = parkingSpots;
      
      // Set initial target based on vehicle state
      if (parkingTimer > 0) {
        // Find a parking spot to target
        const randomParkingIndex = Math.floor(Math.random() * parkingSpots.length);
        targetRef.current.copy(parkingSpots[randomParkingIndex]);
      } else {
        // Find a road point to target
        const randomRoadIndex = Math.floor(Math.random() * roadPoints.length);
        targetRef.current.copy(roadPoints[randomRoadIndex]);
      }
    } catch (error) {
      console.error("Error initializing vehicle:", error);
    }
  }, []);
  
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
            // Choose a road point when leaving parking
            const roadPoint = roadPoints[Math.floor(Math.random() * roadPoints.length)];
            targetRef.current.copy(roadPoint);
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
      
      // Move towards target when not parked - reduce speed to make movement more visible
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
      
      // Calculate next position with slower speed for better visibility
      direction.normalize().multiplyScalar(delta * speed * 0.8); // Better speed for smoother animation
      
      // Create a potential next position
      const nextPosition = new THREE.Vector3().copy(meshRef.current.position).add(direction);
      
      // Only move if the next position is on a road
      if (isOnRoad(nextPosition)) {
        meshRef.current.position.copy(nextPosition);
      } else {
        // If we'd go off-road, find a new target on the road
        const nearestRoadPoint = findNearestRoadPoint(meshRef.current.position);
        targetRef.current.copy(nearestRoadPoint);
      }
      
      // Rotate to face direction of movement with smoother rotation
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
  const [npcState, setState] = useState<'idle' | 'walking' | 'sitting' | 'talking' | 'shopping'>(
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
    // Get reference to city's building list through mapDataRef
    const buildingsList = mapDataRef.current?.buildings || [];
    
    // Add a small buffer around buildings to prevent getting too close
    const buffer = 3;
    
    return buildingsList.some((building: BuildingProps) => {
      const [bx, , bz] = building.position;
      
      // Calculate half dimensions with buffer
      const halfWidth = building.width / 2 + buffer;
      const halfDepth = building.depth / 2 + buffer;
      
      // Check if point is inside building (accounting for rotation)
      // For simplicity, we'll use a distance-based check that approximates the rotated building
      const distance = Math.sqrt(Math.pow(x - bx, 2) + Math.pow(z - bz, 2));
      const maxRadius = Math.sqrt(halfWidth * halfWidth + halfDepth * halfDepth);
      
      return distance < maxRadius;
    });
  };
  
  // Update target when NPC reaches current target or changes state
  const updateTarget = () => {
    // Only get new target if walking
    if (npcState !== 'walking') return;
    
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
  
  // Update NPC position and animation 
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Update idle timer if we're idle
    if (npcState === 'idle') {
      setStateTimer(prev => {
        const newTimer = prev - delta;
        if (newTimer <= 0) {
          setState('walking');
          updateTarget();
          return 0;
        }
        return newTimer;
      });
      
      // Rotate randomly while idle for more realistic behavior
      if (Math.random() < 0.02) {
        const randomRotation = new THREE.Euler(
          0,
          meshRef.current.rotation.y + (Math.random() * 0.1 - 0.05),
          0
        );
        meshRef.current.setRotationFromEuler(randomRotation);
      }
      
      return;
    }
    
    // Move towards target position
    const currentPos = meshRef.current.position;
    const direction = new THREE.Vector3().subVectors(targetRef.current, currentPos);
    
    // If we reached the target, become idle
    if (direction.length() < 0.5) {
      setState('idle');
      setStateTimer(Math.random() * 10 + 5); // Idle between 5-15 seconds
      updateState();
      return;
    }
    
    // Calculate next position
    direction.normalize().multiplyScalar(delta * speed);
    
    // Create a potential next position
    const nextPosition = new THREE.Vector3().copy(currentPos).add(direction);
    
    // Check if next position would be inside a building
    if (!isInsideBuilding(nextPosition.x, nextPosition.z)) {
      // If not in a building, check if we'd be on a sidewalk
      const normalizedX = Math.abs((nextPosition.x + CITY_SIZE / 2) % (BLOCK_SIZE + ROAD_WIDTH));
      const normalizedZ = Math.abs((nextPosition.z + CITY_SIZE / 2) % (BLOCK_SIZE + ROAD_WIDTH));
      
      const onSidewalkX = normalizedX > ROAD_WIDTH && normalizedX < ROAD_WIDTH + 8;
      const onSidewalkZ = normalizedZ > ROAD_WIDTH && normalizedZ < ROAD_WIDTH + 8;
      
      // Try to stay on sidewalks or near buildings
      if (onSidewalkX || onSidewalkZ || Math.random() < 0.3) {
        meshRef.current.position.add(direction);
      } else {
        // If not on sidewalk, try to find a better target
        updateTarget();
      }
    } else {
      // If we'd go inside a building, find a new target
      updateTarget();
    }
    
    // Face the direction of movement
    if (direction.length() > 0.01) {
      const lookAtPos = new THREE.Vector3().addVectors(
        currentPos,
        new THREE.Vector3(direction.x, 0, direction.z).normalize()
      );
      meshRef.current.lookAt(lookAtPos);
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
      {npcState === 'talking' && (
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      )}
      
      {npcState === 'shopping' && (
        <mesh position={[0.3, 0.4, 0.1]} castShadow rotation={[0, 0, Math.PI/4]}>
          <boxGeometry args={[0.2, 0.3, 0.1]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
      )}
    </group>
  );
};

// City component with buildings, agents, vehicles and NPCs
const City: React.FC<{ onAgentClick: (agent: any) => void, useSimpleRenderer?: boolean }> = ({ onAgentClick, useSimpleRenderer = false }) => {
  // City map data
  const [mapData, setMapData] = useState<{
    buildings: BuildingProps[];
    npcs: NPCProps[];
    vehicles: VehicleProps[];
    agents: AgentProps[];
    mapLabels: {name: string; position: [number, number, number]}[];
  } | null>(null);
  
  // Generate city map on component mount
  useEffect(() => {
    // Start with an empty map
    const buildings: BuildingProps[] = [];
    const vehicles: VehicleProps[] = [];
    const npcs: NPCProps[] = [];
    const agents: AgentProps[] = [];
    const mapLabels: {name: string; position: [number, number, number]}[] = [];
    
    // Helper function to check if a position is on a road
    const isOnRoad = (x: number, z: number, width: number, depth: number): boolean => {
      // Add a buffer around roads to avoid buildings partially on roads
      const buffer = 8; // Increased buffer
      const halfWidth = width / 2 + buffer;
      const halfDepth = depth / 2 + buffer;
      
      // Check if any of the corners or center are on a road
      const positions = [
        {x: x, z: z}, // center
        {x: x - halfWidth, z: z - halfDepth}, // bottom left
        {x: x + halfWidth, z: z - halfDepth}, // bottom right
        {x: x - halfWidth, z: z + halfDepth}, // top left
        {x: x + halfWidth, z: z + halfDepth}, // top right
        // Add additional check points along the perimeter for larger buildings
        {x: x - halfWidth, z: z}, // left center
        {x: x + halfWidth, z: z}, // right center
        {x: x, z: z - halfDepth}, // bottom center
        {x: x, z: z + halfDepth}  // top center
      ];
      
      return positions.some(pos => {
        // Check if position is on a road (either x or z is a multiple of BLOCK_SIZE + ROAD_WIDTH)
        const normalizedX = Math.abs((pos.x + CITY_SIZE / 2) % (BLOCK_SIZE + ROAD_WIDTH));
        const normalizedZ = Math.abs((pos.z + CITY_SIZE / 2) % (BLOCK_SIZE + ROAD_WIDTH));
        
        const onRoadX = normalizedX < ROAD_WIDTH + buffer || normalizedX > (BLOCK_SIZE + ROAD_WIDTH) - (ROAD_WIDTH + buffer);
        const onRoadZ = normalizedZ < ROAD_WIDTH + buffer || normalizedZ > (BLOCK_SIZE + ROAD_WIDTH) - (ROAD_WIDTH + buffer);
        
        return onRoadX || onRoadZ;
      });
    };
    
    // Helper function to check if a building position conflicts with existing buildings
    const buildingConflicts = (newX: number, newZ: number, width: number, depth: number): boolean => {
      // Add spacing between buildings
      const buffer = 12; // Increase buffer to prevent buildings from being too close
      
      return buildings.some(building => {
        const [bx, , bz] = building.position;
        const distance = Math.sqrt(Math.pow(newX - bx, 2) + Math.pow(newZ - bz, 2));
        const minDistance = (width/2 + building.width/2 + buffer);
        
        return distance < minDistance;
      });
    };
    
    // Helper to find a valid building position within a district
    const findValidBuildingPosition = (
      districtX: number, 
      districtZ: number, 
      width: number, 
      depth: number,
      radius = BLOCK_SIZE * 0.7, // Default search radius within district
      maxAttempts = 20 // Increase max attempts to find valid positions
    ): [number, number] | null => {
      // Start with more attempts for important buildings
      for (let i = 0; i < maxAttempts; i++) {
        // Generate position within radius of district center
        // Use a more structured approach with grid-like placement
        const angle = (i / maxAttempts) * Math.PI * 2; // Distribute around center
        const distance = radius * (0.3 + 0.7 * Math.random()); // Vary distance from center
        
        const offsetX = Math.cos(angle) * distance;
        const offsetZ = Math.sin(angle) * distance;
        
        const x = districtX + offsetX;
        const z = districtZ + offsetZ;
        
        // Add more strict validation to ensure buildings don't overlap with roads
        const roadBuffer = 8; // Increase buffer from roads
        const buildingBuffer = 10; // Increase spacing between buildings
        
        // Check if position is valid (not on road and no conflicts)
        if (!isOnRoad(x, z, width + roadBuffer, depth + roadBuffer) && !buildingConflicts(x, z, width, depth)) {
          return [x, z];
        }
      }
      
      // If we couldn't find a position with the structured approach, try random as fallback
      for (let i = 0; i < 10; i++) {
        const offsetX = (Math.random() * 2 - 1) * radius;
        const offsetZ = (Math.random() * 2 - 1) * radius;
        
        const x = districtX + offsetX;
        const z = districtZ + offsetZ;
        
        if (!isOnRoad(x, z, width + 5, depth + 5) && !buildingConflicts(x, z, width, depth)) {
          return [x, z];
        }
      }
      
      // Couldn't find a valid position after max attempts
      return null;
    };
    
    // Grid size (blocks across)
    const gridSize = 5;
    
    // Calculate district positions (central coordinates of each district)
    const districts = {
      downtown: { x: 0, z: 0 },
      financial: { x: -BLOCK_SIZE * 2, z: -BLOCK_SIZE * 2 },
      residential: { x: BLOCK_SIZE * 2, z: BLOCK_SIZE * 2 },
      entertainment: { x: BLOCK_SIZE * 2, z: -BLOCK_SIZE * 2 },
      industrial: { x: -BLOCK_SIZE * 2, z: BLOCK_SIZE * 2 },
    };
    
    // Add buildings in a grid pattern, with certain landmark buildings
    // Increase the variety of buildings, colors and arrangements
    
    // 1. DOWNTOWN AREA (City Center)
    // Bank at the center
    const bankPos = findValidBuildingPosition(districts.downtown.x, districts.downtown.z, 20, 20, BLOCK_SIZE * 0.3, 30);
    if (bankPos) {
      buildings.push({
        position: [bankPos[0], 0, bankPos[1]],
        rotation: [0, 0, 0],
        height: 30,
        width: 20,
        depth: 20,
        color: BUILDING_COLORS[BUILDING_TYPES.BANK],
        type: BUILDING_TYPES.BANK,
        name: BUILDING_NAMES[BUILDING_TYPES.BANK]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.BANK],
        position: [bankPos[0], 0, bankPos[1]]
      });
    }
    
    // Surrounding downtown buildings - add more smaller buildings
    // Tech Hub
    const techHubPos = findValidBuildingPosition(
      districts.downtown.x + 25, 
      districts.downtown.z - 25, 
      18, 
      18
    );
    if (techHubPos) {
      buildings.push({
        position: [techHubPos[0], 0, techHubPos[1]],
        rotation: [0, Math.PI / 6, 0],
        height: 35,
        width: 18,
        depth: 18,
        color: BUILDING_COLORS[BUILDING_TYPES.TECH_HUB],
        type: BUILDING_TYPES.TECH_HUB,
        name: BUILDING_NAMES[BUILDING_TYPES.TECH_HUB]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.TECH_HUB],
        position: [techHubPos[0], 0, techHubPos[1]]
      });
    }
    
    // Finance Center
    const financePos = findValidBuildingPosition(
      districts.downtown.x - 25, 
      districts.downtown.z + 25, 
      22, 
      16
    );
    if (financePos) {
      buildings.push({
        position: [financePos[0], 0, financePos[1]],
        rotation: [0, -Math.PI / 8, 0],
        height: 28,
        width: 22,
        depth: 16,
        color: BUILDING_COLORS[BUILDING_TYPES.FINANCE],
        type: BUILDING_TYPES.FINANCE,
        name: BUILDING_NAMES[BUILDING_TYPES.FINANCE]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.FINANCE],
        position: [financePos[0], 0, financePos[1]]
      });
    }
    
    // Hotel
    const hotelPos = findValidBuildingPosition(
      districts.downtown.x - 20, 
      districts.downtown.z - 20, 
      20, 
      15
    );
    if (hotelPos) {
      buildings.push({
        position: [hotelPos[0], 0, hotelPos[1]],
        rotation: [0, Math.PI / 12, 0],
        height: 25,
        width: 20,
        depth: 15,
        color: BUILDING_COLORS[BUILDING_TYPES.HOTEL],
        type: BUILDING_TYPES.HOTEL,
        name: BUILDING_NAMES[BUILDING_TYPES.HOTEL]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.HOTEL],
        position: [hotelPos[0], 0, hotelPos[1]]
      });
    }
    
    // Add 5-7 additional downtown buildings
    const downtownBuildingTypes = [
      BUILDING_TYPES.OFFICE,
      BUILDING_TYPES.RETAIL,
      BUILDING_TYPES.APARTMENT
    ];
    
    for (let i = 0; i < 7; i++) {
      // Spread throughout downtown with some randomization
      const angle = (i / 7) * Math.PI * 2;
      const distance = 30 + Math.random() * 15;
      
      const x = districts.downtown.x + Math.cos(angle) * distance;
      const z = districts.downtown.z + Math.sin(angle) * distance;
      
      const buildingType = downtownBuildingTypes[i % downtownBuildingTypes.length];
      const width = 12 + Math.random() * 8;
      const depth = 12 + Math.random() * 8;
      
      const pos = findValidBuildingPosition(x, z, width, depth, 15);
      
      if (pos) {
        buildings.push({
          position: [pos[0], 0, pos[1]],
          rotation: [0, Math.random() * Math.PI / 2 - Math.PI / 4, 0],
          height: 15 + Math.random() * 20,
          width: width,
          depth: depth,
          color: BUILDING_COLORS[buildingType],
          type: buildingType,
          name: BUILDING_NAMES[buildingType] + " " + (i+1)
        });
      }
    }
    
    // 2. FINANCIAL DISTRICT
    // Office buildings and financial centers
    for (let i = 0; i < 5; i++) { // Increased from 3 to 5
      const officePos = findValidBuildingPosition(
        districts.financial.x + (Math.random() * 30 - 15), 
        districts.financial.z + (Math.random() * 30 - 15), 
        15 + Math.random() * 5, 
        15 + Math.random() * 5,
        BLOCK_SIZE * 0.8
      );
      
      if (officePos) {
        buildings.push({
          position: [officePos[0], 0, officePos[1]],
          rotation: [0, Math.random() * Math.PI / 4 - Math.PI / 8, 0],
          height: 20 + Math.random() * 15,
          width: 15 + Math.random() * 5,
          depth: 15 + Math.random() * 5,
          color: BUILDING_COLORS[BUILDING_TYPES.OFFICE],
          type: BUILDING_TYPES.OFFICE,
          name: BUILDING_NAMES[BUILDING_TYPES.OFFICE] + " " + (i+1)
        });
      }
    }
    
    // Police station
    const policePos = findValidBuildingPosition(districts.financial.x - 20, districts.financial.z - 20, 25, 15);
    if (policePos) {
      buildings.push({
        position: [policePos[0], 0, policePos[1]],
        rotation: [0, Math.PI / 12, 0],
        height: 15,
        width: 25,
        depth: 15,
        color: BUILDING_COLORS[BUILDING_TYPES.POLICE],
        type: BUILDING_TYPES.POLICE,
        name: BUILDING_NAMES[BUILDING_TYPES.POLICE]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.POLICE],
        position: [policePos[0], 0, policePos[1]]
      });
    }
    
    // 3. RESIDENTIAL DISTRICT
    // Houses and apartments
    for (let i = 0; i < 8; i++) { // Increased from 5 to 8
      const isApartment = i < 3;
      const type = isApartment ? BUILDING_TYPES.APARTMENT : BUILDING_TYPES.HOUSE;
      const width = isApartment ? 18 : 12;
      const depth = isApartment ? 18 : 12;
      
      // Spread buildings throughout the district
      const angle = (i / 8) * Math.PI * 2;
      const distance = 25 + Math.random() * 20;
      
      const residentialPos = findValidBuildingPosition(
        districts.residential.x + Math.cos(angle) * distance, 
        districts.residential.z + Math.sin(angle) * distance, 
        width, 
        depth,
        15
      );
      
      if (residentialPos) {
        buildings.push({
          position: [residentialPos[0], 0, residentialPos[1]],
          rotation: [0, Math.random() * Math.PI / 2 - Math.PI / 4, 0],
          height: isApartment ? 20 + Math.random() * 10 : 8 + Math.random() * 5,
          width,
          depth,
          color: BUILDING_COLORS[type],
          type,
          name: BUILDING_NAMES[type] + " " + (i+1)
        });
      }
    }
    
    // Supermarket
    const supermarketPos = findValidBuildingPosition(districts.residential.x - 30, districts.residential.z, 30, 20);
    if (supermarketPos) {
      buildings.push({
        position: [supermarketPos[0], 0, supermarketPos[1]],
        rotation: [0, Math.PI / 20, 0],
        height: 12,
        width: 30,
        depth: 20,
        color: BUILDING_COLORS[BUILDING_TYPES.SUPERMARKET],
        type: BUILDING_TYPES.SUPERMARKET,
        name: BUILDING_NAMES[BUILDING_TYPES.SUPERMARKET]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.SUPERMARKET],
        position: [supermarketPos[0], 0, supermarketPos[1]]
      });
    }
    
    // Gas Station
    const gasStationPos = findValidBuildingPosition(districts.residential.x + 35, districts.residential.z - 15, 20, 15);
    if (gasStationPos) {
      buildings.push({
        position: [gasStationPos[0], 0, gasStationPos[1]],
        rotation: [0, -Math.PI / 15, 0],
        height: 8,
        width: 20,
        depth: 15,
        color: BUILDING_COLORS[BUILDING_TYPES.GAS_STATION],
        type: BUILDING_TYPES.GAS_STATION,
        name: BUILDING_NAMES[BUILDING_TYPES.GAS_STATION]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.GAS_STATION],
        position: [gasStationPos[0], 0, gasStationPos[1]]
      });
    }
    
    // 4. ENTERTAINMENT DISTRICT
    // Shopping Mall
    const mallPos = findValidBuildingPosition(districts.entertainment.x, districts.entertainment.z, 35, 25);
    if (mallPos) {
      buildings.push({
        position: [mallPos[0], 0, mallPos[1]],
        rotation: [0, Math.PI / 10, 0],
        height: 18,
        width: 35,
        depth: 25,
        color: BUILDING_COLORS[BUILDING_TYPES.MALL],
        type: BUILDING_TYPES.MALL,
        name: BUILDING_NAMES[BUILDING_TYPES.MALL]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.MALL],
        position: [mallPos[0], 0, mallPos[1]]
      });
    }
    
    // Restaurant
    const restaurantPos = findValidBuildingPosition(districts.entertainment.x - 25, districts.entertainment.z + 20, 20, 15);
    if (restaurantPos) {
      buildings.push({
        position: [restaurantPos[0], 0, restaurantPos[1]],
        rotation: [0, -Math.PI / 8, 0],
        height: 12,
        width: 20,
        depth: 15,
        color: BUILDING_COLORS[BUILDING_TYPES.RESTAURANT],
        type: BUILDING_TYPES.RESTAURANT,
        name: BUILDING_NAMES[BUILDING_TYPES.RESTAURANT]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.RESTAURANT],
        position: [restaurantPos[0], 0, restaurantPos[1]]
      });
    }
    
    // Casino
    const casinoPos = findValidBuildingPosition(districts.entertainment.x + 25, districts.entertainment.z - 30, 25, 20);
    if (casinoPos) {
      buildings.push({
        position: [casinoPos[0], 0, casinoPos[1]],
        rotation: [0, Math.PI / 16, 0],
        height: 22,
        width: 25,
        depth: 20,
        color: BUILDING_COLORS[BUILDING_TYPES.CASINO],
        type: BUILDING_TYPES.CASINO,
        name: BUILDING_NAMES[BUILDING_TYPES.CASINO]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.CASINO],
        position: [casinoPos[0], 0, casinoPos[1]]
      });
    }
    
    // Nightclub
    const nightclubPos = findValidBuildingPosition(districts.entertainment.x + 15, districts.entertainment.z + 25, 25, 15);
    if (nightclubPos) {
      buildings.push({
        position: [nightclubPos[0], 0, nightclubPos[1]],
        rotation: [0, -Math.PI / 12, 0],
        height: 18,
        width: 25,
        depth: 15,
        color: BUILDING_COLORS[BUILDING_TYPES.NIGHTCLUB],
        type: BUILDING_TYPES.NIGHTCLUB,
        name: BUILDING_NAMES[BUILDING_TYPES.NIGHTCLUB]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.NIGHTCLUB],
        position: [nightclubPos[0], 0, nightclubPos[1]]
      });
    }
    
    // Add some retail and entertainment venues
    for (let i = 0; i < 4; i++) {
      const type = Math.random() > 0.5 ? BUILDING_TYPES.RETAIL : BUILDING_TYPES.ENTERTAINMENT;
      
      const angle = (i / 4) * Math.PI * 2;
      const distance = 20 + Math.random() * 15;
      
      const pos = findValidBuildingPosition(
        districts.entertainment.x + Math.cos(angle) * distance,
        districts.entertainment.z + Math.sin(angle) * distance,
        15 + Math.random() * 5,
        15 + Math.random() * 5
      );
      
      if (pos) {
        buildings.push({
          position: [pos[0], 0, pos[1]],
          rotation: [0, Math.random() * Math.PI / 2 - Math.PI / 4, 0],
          height: 12 + Math.random() * 8,
          width: 15 + Math.random() * 5,
          depth: 15 + Math.random() * 5,
          color: BUILDING_COLORS[type],
          type,
          name: BUILDING_NAMES[type] + " " + (i+1)
        });
      }
    }
    
    // 5. INDUSTRIAL DISTRICT
    // Factory
    const factoryPos = findValidBuildingPosition(districts.industrial.x, districts.industrial.z, 30, 20);
    if (factoryPos) {
      buildings.push({
        position: [factoryPos[0], 0, factoryPos[1]],
        rotation: [0, -Math.PI / 20, 0],
        height: 15,
        width: 30,
        depth: 20,
        color: BUILDING_COLORS[BUILDING_TYPES.FACTORY],
        type: BUILDING_TYPES.FACTORY,
        name: BUILDING_NAMES[BUILDING_TYPES.FACTORY]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.FACTORY],
        position: [factoryPos[0], 0, factoryPos[1]]
      });
    }
    
    // City Hospital
    const hospitalPos = findValidBuildingPosition(districts.industrial.x + 30, districts.industrial.z + 30, 25, 20);
    if (hospitalPos) {
      buildings.push({
        position: [hospitalPos[0], 0, hospitalPos[1]],
        rotation: [0, Math.PI / 14, 0],
        height: 20,
        width: 25,
        depth: 20,
        color: BUILDING_COLORS[BUILDING_TYPES.HOSPITAL],
        type: BUILDING_TYPES.HOSPITAL,
        name: BUILDING_NAMES[BUILDING_TYPES.HOSPITAL]
      });
      
      mapLabels.push({
        name: BUILDING_NAMES[BUILDING_TYPES.HOSPITAL],
        position: [hospitalPos[0], 0, hospitalPos[1]]
      });
    }
    
    // Warehouses and industrial buildings
    for (let i = 0; i < 5; i++) {
      const isWarehouse = i < 3;
      const type = isWarehouse ? BUILDING_TYPES.WAREHOUSE : BUILDING_TYPES.INDUSTRIAL;
      
      const angle = (i / 5) * Math.PI * 2;
      const distance = 20 + Math.random() * 20;
      
      const pos = findValidBuildingPosition(
        districts.industrial.x + Math.cos(angle) * distance,
        districts.industrial.z + Math.sin(angle) * distance,
        20 + Math.random() * 10,
        15 + Math.random() * 10
      );
      
      if (pos) {
        buildings.push({
          position: [pos[0], 0, pos[1]],
          rotation: [0, Math.random() * Math.PI / 4 - Math.PI / 8, 0],
          height: 10 + Math.random() * 10,
          width: 20 + Math.random() * 10,
          depth: 15 + Math.random() * 10,
          color: BUILDING_COLORS[type],
          type,
          name: BUILDING_NAMES[type] + " " + (i+1)
        });
      }
    }
    
    // Add vehicles on roads
    // Define main road coordinates
    const roadCoordinates = [
      { startX: -CITY_SIZE / 2, startZ: 0, endX: CITY_SIZE / 2, endZ: 0 }, // East-West main road
      { startX: 0, startZ: -CITY_SIZE / 2, endX: 0, endZ: CITY_SIZE / 2 }, // North-South main road
      // Grid roads - horizontal
      { startX: -CITY_SIZE / 2, startZ: -BLOCK_SIZE * 2 - ROAD_WIDTH / 2, endX: CITY_SIZE / 2, endZ: -BLOCK_SIZE * 2 - ROAD_WIDTH / 2 },
      { startX: -CITY_SIZE / 2, startZ: -BLOCK_SIZE - ROAD_WIDTH / 2, endX: CITY_SIZE / 2, endZ: -BLOCK_SIZE - ROAD_WIDTH / 2 },
      { startX: -CITY_SIZE / 2, startZ: BLOCK_SIZE + ROAD_WIDTH / 2, endX: CITY_SIZE / 2, endZ: BLOCK_SIZE + ROAD_WIDTH / 2 },
      { startX: -CITY_SIZE / 2, startZ: BLOCK_SIZE * 2 + ROAD_WIDTH / 2, endX: CITY_SIZE / 2, endZ: BLOCK_SIZE * 2 + ROAD_WIDTH / 2 },
      // Grid roads - vertical
      { startX: -BLOCK_SIZE * 2 - ROAD_WIDTH / 2, startZ: -CITY_SIZE / 2, endX: -BLOCK_SIZE * 2 - ROAD_WIDTH / 2, endZ: CITY_SIZE / 2 },
      { startX: -BLOCK_SIZE - ROAD_WIDTH / 2, startZ: -CITY_SIZE / 2, endX: -BLOCK_SIZE - ROAD_WIDTH / 2, endZ: CITY_SIZE / 2 },
      { startX: BLOCK_SIZE + ROAD_WIDTH / 2, startZ: -CITY_SIZE / 2, endX: BLOCK_SIZE + ROAD_WIDTH / 2, endZ: CITY_SIZE / 2 },
      { startX: BLOCK_SIZE * 2 + ROAD_WIDTH / 2, startZ: -CITY_SIZE / 2, endX: BLOCK_SIZE * 2 + ROAD_WIDTH / 2, endZ: CITY_SIZE / 2 }
    ];
    
    // Get all road points for vehicle paths
    const allRoadPoints = getRoadPoints(roadCoordinates, 15); // Points every 15 units
    const parkingSpots = getParkingSpots(buildings, 5); // 5 parking spots per building
    
    // Add vehicles on roads - increase the number for more traffic
    for (let i = 0; i < 30; i++) {
      const roadPoint = allRoadPoints[Math.floor(Math.random() * allRoadPoints.length)];
      
      // Different vehicle types with appropriate distribution
      const vehicleType = i < 5 ? 'taxi' : (i < 25 ? 'car' : 'bus');
      
      // Colors based on vehicle type
      let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      if (vehicleType === 'taxi') {
        color = '#FFD700'; // Yellow for taxis
      } else if (vehicleType === 'bus') {
        // Bus colors - city buses are often blue, green, or red
        const busColors = ['#3B5998', '#2E8B57', '#B22222'];
        color = busColors[Math.floor(Math.random() * busColors.length)];
      } else {
        // Common car colors
        const carColors = [
          '#FF0000', // red
          '#0000FF', // blue
          '#FFFFFF', // white
          '#000000', // black
          '#808080', // gray
          '#C0C0C0', // silver
          '#00008B', // dark blue
          '#800000', // maroon
          '#008000'  // green
        ];
        color = carColors[Math.floor(Math.random() * carColors.length)];
      }
      
      const vehicleSpeed = vehicleType === 'bus' ? 2 : (vehicleType === 'taxi' ? 6 : 4);
      
      vehicles.push({
        position: [roadPoint.x, 0, roadPoint.z],
        color,
        type: vehicleType as 'car' | 'taxi' | 'bus',
        speed: vehicleSpeed
      });
    }
    
    // Add NPCs near buildings and on sidewalks
    for (let i = 0; i < 50; i++) {
      let x, z;
      
      // 60% chance to spawn near a building, 40% chance to spawn on sidewalk
      if (Math.random() < 0.6 && buildings.length > 0) {
        // Pick a random building
        const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
        const [bx, , bz] = randomBuilding.position;
        
        // Position NPC near the building but not inside it
        const distance = randomBuilding.width / 2 + 5 + Math.random() * 8;
        const angle = Math.random() * Math.PI * 2;
        
        x = bx + Math.cos(angle) * distance;
        z = bz + Math.sin(angle) * distance;
      } else {
        // Position on sidewalk
        // Get a grid cell
        const cellX = Math.floor(Math.random() * gridSize) - Math.floor(gridSize / 2);
        const cellZ = Math.floor(Math.random() * gridSize) - Math.floor(gridSize / 2);
        
        // Sidewalk is just outside the road
        const sideOfRoad = Math.floor(Math.random() * 4); // 0: north, 1: east, 2: south, 3: west
        
        const offset = ROAD_WIDTH + 3 + Math.random() * 5; // Offset from road
        
        // Base position at center of grid cell
        const baseX = cellX * (BLOCK_SIZE + ROAD_WIDTH);
        const baseZ = cellZ * (BLOCK_SIZE + ROAD_WIDTH);
        
        // Adjust based on which side of the road
        if (sideOfRoad === 0) { // North
          x = baseX + (Math.random() * BLOCK_SIZE - BLOCK_SIZE / 2);
          z = baseZ + BLOCK_SIZE / 2 + offset;
        } else if (sideOfRoad === 1) { // East
          x = baseX + BLOCK_SIZE / 2 + offset;
          z = baseZ + (Math.random() * BLOCK_SIZE - BLOCK_SIZE / 2);
        } else if (sideOfRoad === 2) { // South
          x = baseX + (Math.random() * BLOCK_SIZE - BLOCK_SIZE / 2);
          z = baseZ - BLOCK_SIZE / 2 - offset;
        } else { // West
          x = baseX - BLOCK_SIZE / 2 - offset;
          z = baseZ + (Math.random() * BLOCK_SIZE - BLOCK_SIZE / 2);
        }
      }
      
      // Ensure NPC is within city bounds
      x = Math.max(-CITY_SIZE / 2 + 10, Math.min(CITY_SIZE / 2 - 10, x));
      z = Math.max(-CITY_SIZE / 2 + 10, Math.min(CITY_SIZE / 2 - 10, z));
      
      const npcColors = [
        '#A52A2A', // brown
        '#D2B48C', // tan
        '#808080', // gray
        '#000000', // black
        '#FFEBCD', // blanched almond
        '#DEB887', // burlywood
        '#A0522D', // sienna
        '#CD853F'  // peru
      ];
      
      npcs.push({
        position: [x, 0, z],
        color: npcColors[Math.floor(Math.random() * npcColors.length)],
        speed: 0.01 + Math.random() * 0.03 // Slower than vehicles
      });
    }
    
    // Generate agents with different roles
    const agentRoles = [
      { role: 'Trader', icon: '👨‍💼', color: '#4488FF' },
      { role: 'Scientist', icon: '👩‍🔬', color: '#9944FF' },
      { role: 'Builder', icon: '👷', color: '#FF8844' },
      { role: 'Explorer', icon: '🧭', color: '#44AA66' },
      { role: 'Farmer', icon: '👨‍🌾', color: '#88AA44' },
      { role: 'Engineer', icon: '👩‍🔧', color: '#FF4444' },
      { role: 'Hacker', icon: '👨‍💻', color: '#888888' },
      { role: 'Diplomat', icon: '🧝‍♀️', color: '#FF66AA' },
      { role: 'Courier', icon: '🏃', color: '#44AAFF' },
      { role: 'Mystic', icon: '🧙', color: '#AA66FF' }
    ];
    
    // Place agents near appropriate buildings based on their role
    agentRoles.forEach((agentRole, index) => {
      // Find appropriate building based on agent role
      let targetBuilding;
      
      switch (agentRole.role) {
        case 'Trader':
          // Traders near banks or shopping malls
          targetBuilding = buildings.find(b => 
            b.type === BUILDING_TYPES.BANK || 
            b.type === BUILDING_TYPES.SHOPPING_MALL
          );
          break;
        case 'Scientist':
          // Scientists near tech hub or hospital
          targetBuilding = buildings.find(b => 
            b.type === BUILDING_TYPES.TECH_HUB || 
            b.type === BUILDING_TYPES.HOSPITAL
          );
          break;
        case 'Builder':
          // Builders near factory or construction sites
          targetBuilding = buildings.find(b => 
            b.type === BUILDING_TYPES.FACTORY
          );
          break;
        default:
          // Random placement
          targetBuilding = buildings[Math.floor(Math.random() * buildings.length)];
      }
      
      // If no specific building found, place randomly
      if (!targetBuilding) {
        targetBuilding = buildings[Math.floor(Math.random() * buildings.length)];
      }
      
      // Place near the building
      const distance = Math.random() * 10 + 5;
      const angle = Math.random() * Math.PI * 2;
      const x = targetBuilding.position[0] + Math.cos(angle) * distance;
      const z = targetBuilding.position[2] + Math.sin(angle) * distance;
      
      // Generate agent data
      const agentData = {
        id: index,
        name: `Agent ${String.fromCharCode(65 + index)}`, // A, B, C, etc.
        role: agentRole.role,
        icon: agentRole.icon,
        color: agentRole.color,
        state: ['walking', 'idle', 'working'][Math.floor(Math.random() * 3)],
        location: targetBuilding.name,
        resources: Math.floor(Math.random() * 100),
        earnings: Math.floor(Math.random() * 10000),
        level: Math.floor(Math.random() * 5) + 1
      };
      
      agents.push({
        position: [x, 0, z],
        color: agentRole.color,
        speed: 0.04 + Math.random() * 0.02,
        agentData,
        onAgentClick
      });
    });
    
    // Set the generated map data
    const newMapData = {
      buildings,
      npcs,
      vehicles,
      agents,
      mapLabels
    };
    
    setMapData(newMapData);
    mapDataRef.current = newMapData;
  }, [onAgentClick]);
  
  // Update mapDataRef whenever mapData changes
  useEffect(() => {
    if (mapData) {
      mapDataRef.current = mapData;
    }
  }, [mapData]);
  
  if (!mapData) return null;
  
  return (
    <group>
      {/* Ground */}
      <Ground />
      
      {/* Roads */}
      <Road />
      
      {/* Buildings */}
      {mapData.buildings.map((props, i) => (
        <Building key={`building-${i}`} {...props} />
      ))}
      
      {/* Vehicles */}
      {mapData.vehicles.map((props, i) => (
        <Vehicle key={`vehicle-${i}`} {...props} />
      ))}
      
      {/* NPCs */}
      {mapData.npcs.map((props, i) => (
        <NPC key={`npc-${i}`} {...props} />
      ))}
      
      {/* Agents */}
      {mapData.agents.map((props, i) => (
        <Agent key={`agent-${i}`} {...props} />
      ))}
      
      {/* City map labels - floating above buildings */}
      {mapData.mapLabels.map((label, i) => (
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

// Scene content component with environment and city
const SceneContent: React.FC<{ 
  onAgentClick: (agent: any) => void, 
  useSimpleRenderer?: boolean,
  forceLoaded?: boolean
}> = 
    ({ onAgentClick, useSimpleRenderer = false, forceLoaded = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  // Fix timeOfDay to 'day'
  const timeOfDay = 'day';
  
  // Rendering state
  const [isRendering, setIsRendering] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);
  
  // Force render after timeout
  useEffect(() => {
    if (forceLoaded && !hasRendered) {
      setIsRendering(true);
      setHasRendered(true);
    }
  }, [forceLoaded, hasRendered]);
  
  // Begin rendering after a short delay to let WebGL initialize properly
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRendering(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get appropriate lighting settings based on time of day
  const getLightingSettings = () => {
    // Since timeOfDay is fixed to 'day', just return day settings
    return {
      ambientIntensity: 0.8,
      directionalIntensity: 1.2,
      directionalPosition: [40, 60, 20] as [number, number, number], // Fix type error
      skyTurbidity: 10,
      skyRayleigh: 2,
      skyInclination: 0.48,
      skyAzimuth: 0.25,
      sunPosition: [1, 0.5, 0] as [number, number, number] // Add missing property
    };
  };
  
  // Extract lighting settings based on time of day
  const lightSettings = getLightingSettings();
  
  return (
    <>
      {isRendering || forceLoaded ? (
        <>
          <ambientLight intensity={lightSettings.ambientIntensity} />
          <directionalLight 
            position={lightSettings.directionalPosition} 
            intensity={lightSettings.directionalIntensity} 
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={500}
            shadow-camera-left={-150}
            shadow-camera-right={150}
            shadow-camera-top={150}
            shadow-camera-bottom={-150}
          />
          
          {/* Sky with dynamic settings */}
          <Sky
            distance={450000}
            sunPosition={lightSettings.sunPosition}
            turbidity={lightSettings.skyTurbidity}
            rayleigh={lightSettings.skyRayleigh}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            inclination={lightSettings.skyInclination}
            azimuth={lightSettings.skyAzimuth}
          />
          
          {/* Always show clouds since it's daytime */}
          <Cloud position={[-100, 50, -100]} speed={0.2} opacity={0.3} />
          <Cloud position={[100, 60, 100]} speed={0.1} opacity={0.2} />
          <Cloud position={[0, 70, -150]} speed={0.3} opacity={0.4} />
          
          {/* Environment map for reflections */}
          <Environment preset="city" />
          
          {/* City model with all buildings, vehicles, NPCs, and agents */}
          <React.Suspense fallback={
            <group>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[20, 0.1, 20]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
              <Text
                position={[0, 5, 0]}
                fontSize={2}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
              >
                Loading City...
              </Text>
              <mesh position={[0, 10, 0]} rotation={[0, performance.now() * 0.001, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#00aaff" />
              </mesh>
            </group>
          }>
            <City 
              onAgentClick={onAgentClick} 
              useSimpleRenderer={useSimpleRenderer} 
            />
          </React.Suspense>
        </>
      ) : (
        // Simple placeholder sphere while loading
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 0.1, 10]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      )}
    </>
  );
};

// Simple fallback scene for when main scene errors out
const FallbackScene = () => {
  return (
    <>
      <ambientLight intensity={1} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <Text
        position={[0, 2, 0]}
        fontSize={1}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        Could not load 3D scene
      </Text>
    </>
  );
};

// Main game scene component
const MainGameScene: React.FC<ClientGameSceneProps> = ({ 
  onAgentClick = () => {}, 
  forceLoaded = false
}) => {
  const [useSimpleRenderer, setUseSimpleRenderer] = useState(false);
  const [error, setError] = useState(false);
  
  // Check if we should use simple renderer
  useEffect(() => {
    const storedQuality = localStorage.getItem('agentarium_reduced_quality');
    if (storedQuality === 'true') {
      setUseSimpleRenderer(true);
    }
  }, []);
  
  // Handle errors in the 3D scene
  const handleError = () => {
    console.error("Error in 3D scene");
    setError(true);
  };
  
  // Force a minimum of basic 3D elements to be displayed even if other parts fail
  const renderBasicElements = () => {
    return (
      <>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[100, 0.1, 100]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
      </>
    );
  };
  
  return (
    <ErrorBoundary fallback={<FallbackScene />} onError={handleError}>
      <Canvas
        shadows
        camera={{ position: [80, 80, 80], fov: 45, near: 0.1, far: 1000 }}
        gl={{ 
          antialias: !useSimpleRenderer,
          alpha: false,
          depth: true,
          stencil: false,
          powerPreference: useSimpleRenderer ? 'low-power' : 'high-performance',
          preserveDrawingBuffer: true, // Add this to prevent disappearing
          failIfMajorPerformanceCaveat: false, // Add this to prevent rendering issues
        }}
        dpr={useSimpleRenderer ? 1 : (window.devicePixelRatio < 2 ? window.devicePixelRatio : 2)}
        frameloop="always" // Ensure animation loop runs continuously
      >
        {renderBasicElements()}
        
        <SceneContent 
          onAgentClick={onAgentClick} 
          useSimpleRenderer={useSimpleRenderer}
          forceLoaded={forceLoaded}
        />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 6}
          minDistance={30}
          maxDistance={180}
          target={[0, 5, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      </Canvas>
    </ErrorBoundary>
  );
};

// Export the main scene component
const ClientGameScene: React.FC<ClientGameSceneProps> = ({ onAgentClick, forceLoaded }) => {
  return <MainGameScene onAgentClick={onAgentClick} forceLoaded={forceLoaded} />;
};

export default ClientGameScene;