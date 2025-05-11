import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Text, Environment, Billboard, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

// Agent types with their respective roles and colors
const AGENT_TYPES = [
  { 
    type: 'Entrepreneur', 
    color: '#FF9800', 
    icon: '👨‍💼',
    traits: ['Ambitious', 'Risk-taker', 'Strategic'],
    description: 'Focused on identifying market opportunities and maximizing profit',
    competencies: ['Business Planning', 'Resource Allocation', 'Market Analysis']
  },
  { 
    type: 'Scientist', 
    color: '#2196F3', 
    icon: '👩‍🔬',
    traits: ['Analytical', 'Curious', 'Detail-oriented'],
    description: 'Researches new technologies that unlock efficiency improvements',
    competencies: ['Research', 'Data Analysis', 'Innovation']
  },
  { 
    type: 'Craftsman', 
    color: '#F44336', 
    icon: '🛠️',
    traits: ['Precise', 'Patient', 'Resourceful'],
    description: 'Specialized in creating high-value items from raw materials',
    competencies: ['Manufacturing', 'Quality Control', 'Resource Optimization']
  },
  { 
    type: 'Trader', 
    color: '#4CAF50', 
    icon: '💱',
    traits: ['Persuasive', 'Quick-thinking', 'Adaptive'],
    description: 'Profits from market inefficiencies and arbitrage opportunities',
    competencies: ['Negotiation', 'Market Timing', 'Value Assessment']
  },
  { 
    type: 'Explorer', 
    color: '#9C27B0', 
    icon: '🔍',
    traits: ['Adventurous', 'Independent', 'Observant'],
    description: 'Discovers new resources and opportunities in unexplored areas',
    competencies: ['Resource Discovery', 'Path Finding', 'Risk Assessment']
  },
  { 
    type: 'Networker', 
    color: '#3F51B5', 
    icon: '🌐',
    traits: ['Charismatic', 'Empathetic', 'Sociable'],
    description: 'Excels at forming alliances and coordinating group activities',
    competencies: ['Relationship Building', 'Communication', 'Conflict Resolution']
  },
  { 
    type: 'Innovator', 
    color: '#00BCD4', 
    icon: '💡',
    traits: ['Creative', 'Visionary', 'Problem-solver'],
    description: 'Creates novel solutions to problems in unexpected ways',
    competencies: ['Idea Generation', 'Adaptation', 'Technology Integration']
  },
  { 
    type: 'Guardian', 
    color: '#795548', 
    icon: '🛡️',
    traits: ['Reliable', 'Vigilant', 'Principled'],
    description: 'Protects shared resources and maintains system balance',
    competencies: ['Security Management', 'Resource Preservation', 'System Monitoring']
  },
  { 
    type: 'Resource Gatherer', 
    color: '#607D8B', 
    icon: '⚒️',
    traits: ['Determined', 'Methodical', 'Efficient'],
    description: 'Specializes in collecting raw materials efficiently',
    competencies: ['Resource Extraction', 'Terrain Navigation', 'Tool Optimization']
  },
  { 
    type: 'Diplomat', 
    color: '#9E9E9E', 
    icon: '🤝',
    traits: ['Composed', 'Diplomatic', 'Strategic'],
    description: 'Resolves conflicts and negotiates beneficial agreements',
    competencies: ['Mediation', 'Strategic Planning', 'Alliance Building']
  }
];

// Building types with their respective functions
const BUILDING_TYPES = [
  { type: 'Resource Hub', color: '#78909C' },
  { type: 'Marketplace', color: '#8D6E63' },
  { type: 'Research Lab', color: '#5C6BC0' },
  { type: 'Workshop', color: '#EF5350' },
  { type: 'Training Center', color: '#66BB6A' },
];

// Define interfaces for our simulation objects
interface Point {
  x: number;
  y: number;
  z?: number;
}

interface Building {
  id: number;
  position: Point;
  size: { width: number; height: number; depth?: number };
  type: string;
  color: string;
}

interface Resource {
  id: number;
  position: Point;
  type: string;
  value: number;
  color: string;
}

interface Agent {
  id: number;
  position: Point;
  targetPosition: Point;
  type: string;
  color: string;
  icon: string;
  speed: number;
  state: 'wandering' | 'gathering' | 'entering' | 'inside' | 'exiting' | 'trading';
  stateTimer: number;
  targetId?: number;
  trajectory: Point[];
  resources: number;
}

interface Interaction {
  position: Point;
  type: string;
  timer: number;
  agents: number[];
}

interface GameSimulationProps {
  onAgentSelect?: (agentType: string) => void;
}

// Helper functions
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

// The 3D ground component
function Ground() {
  const gridSize = 40;
  const gridDivisions = 20;

  return (
    <group position={[0, -0.01, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial color="#121212" />
      </mesh>
      <gridHelper args={[gridSize, gridDivisions, "#1DB954", "#282828"]} />
    </group>
  );
}

// Building component
function BuildingModel({ position, size, color, type }: Building) {
  const rgbColor = hexToRgb(color);
  
  return (
    <group position={[position.x, size.height / 2, position.y]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, size.width]} />
        <meshStandardMaterial color={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)} />
      </mesh>
      <Billboard position={[0, size.height / 2 + 1, 0]}>
        <Text
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {type}
        </Text>
      </Billboard>
      {/* Windows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[
          size.width / 2 * (i % 2 === 0 ? 1 : -1) * 0.8,
          -size.height / 4 + (i < 2 ? 1 : -1),
          size.width / 2 * 1.001
        ]}>
          <planeGeometry args={[0.8, 0.4]} />
          <meshStandardMaterial color="#1DB954" emissive="#1DB954" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Resource component
function ResourceModel({ position, color, type, value }: Resource) {
  const rgbColor = hexToRgb(color);
  
  return (
    <group position={[position.x, 0.5, position.y]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh castShadow>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial 
            color={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)} 
            emissive={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <Billboard position={[0, 1.2, 0]}>
          <Text fontSize={0.3} color="white" anchorX="center" anchorY="middle">
            {`${type}: ${value}`}
          </Text>
        </Billboard>
      </Float>
    </group>
  );
}

// Agent component
function AgentModel({ position, color, icon, resources, selected }: Agent & { selected: boolean }) {
  const rgbColor = hexToRgb(color);
  
  return (
    <group position={[position.x, 0.5, position.y]}>
      <Billboard>
        <mesh>
          <circleGeometry args={[0.6, 32]} />
          <meshStandardMaterial 
            color={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)} 
            emissive={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
        <Text
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {icon}
        </Text>
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {resources}
        </Text>
        
        {selected && (
          <mesh position={[0, 0, -0.1]}>
            <ringGeometry args={[0.7, 0.8, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )}
      </Billboard>
    </group>
  );
}

// Interaction component
function InteractionEffect({ position, type, timer }: Interaction) {
  const scale = Math.min(1, timer / 30);
  
  return (
    <group position={[position.x, 1, position.y]}>
      <Billboard>
        <mesh>
          <circleGeometry args={[1 * scale, 32]} />
          <meshBasicMaterial 
            color={type === 'trading' ? "#1DB954" : "#FFD700"} 
            transparent 
            opacity={0.3 * scale} 
          />
        </mesh>
        <Text
          position={[0, 0, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {type === 'trading' ? '💱' : '⚡'}
        </Text>
      </Billboard>
    </group>
  );
}

// The main simulation scene
function SimulationScene({ agents, buildings, resources, interactions, selectedAgentId, onAgentClick }: {
  agents: Agent[];
  buildings: Building[];
  resources: Resource[];
  interactions: Interaction[];
  selectedAgentId: number | null;
  onAgentClick: (id: number) => void;
}) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(10, 15, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <Environment preset="city" />
      <Ground />
      
      {buildings.map(building => (
        <BuildingModel key={`building-${building.id}`} {...building} />
      ))}
      
      {resources.map(resource => (
        <ResourceModel key={`resource-${resource.id}`} {...resource} />
      ))}
      
      {agents.map(agent => (
        agent.state !== 'inside' && (
          <mesh
            key={`agent-${agent.id}`}
            position={[agent.position.x, 0, agent.position.y]}
            onClick={(e) => {
              e.stopPropagation();
              onAgentClick(agent.id);
            }}
          >
            <AgentModel 
              {...agent} 
              selected={agent.id === selectedAgentId} 
            />
          </mesh>
        )
      ))}
      
      {interactions.map((interaction, index) => (
        <InteractionEffect key={`interaction-${index}`} {...interaction} />
      ))}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={30}
      />
    </>
  );
}

// Main component
const GameSimulation = ({ onAgentSelect }: GameSimulationProps) => {
  const [isSimulationActive, setIsSimulationActive] = useState(true);
  const simulationRef = useRef<{
    agents: Agent[];
    buildings: Building[];
    resources: Resource[];
    interactions: Interaction[];
    width: number;
    height: number;
    selectedAgentId: number | null;
  }>({
    agents: [],
    buildings: [],
    resources: [],
    interactions: [],
    width: 40,
    height: 40,
    selectedAgentId: null
  });
  
  // Animation controls
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Toggle simulation
  const toggleSimulation = () => {
    setIsAnimating(!isAnimating);
  };
  
  // Helper to set a wandering target
  const setWanderingTarget = (agent: Agent) => {
    const margin = 5;
    const simulation = simulationRef.current;
    agent.targetPosition = {
      x: margin + Math.random() * (simulation.width - 2 * margin),
      y: margin + Math.random() * (simulation.height - 2 * margin)
    };
    agent.state = 'wandering';
    agent.stateTimer = 0;
  };
  
  // Helper to generate a trajectory for an agent
  const generateTrajectory = (agent: Agent) => {
    agent.trajectory = [];
    
    const startPoint = { ...agent.position };
    const endPoint = { ...agent.targetPosition };
    
    // Create a control point for the curve
    const controlPoint = {
      x: (startPoint.x + endPoint.x) / 2 + (Math.random() - 0.5) * 10,
      y: (startPoint.y + endPoint.y) / 2 + (Math.random() - 0.5) * 10
    };
    
    // Generate points along a quadratic curve
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      
      // Quadratic Bezier curve formula
      const x = Math.pow(1 - t, 2) * startPoint.x + 
                2 * (1 - t) * t * controlPoint.x + 
                Math.pow(t, 2) * endPoint.x;
      
      const y = Math.pow(1 - t, 2) * startPoint.y + 
                2 * (1 - t) * t * controlPoint.y + 
                Math.pow(t, 2) * endPoint.y;
      
      agent.trajectory.push({ x, y });
    }
  };
  
  // Set a new target for an agent
  const setNewAgentTarget = (agent: Agent) => {
    const simulation = simulationRef.current;
    
    // Sometimes go to a resource
    if (Math.random() < 0.4 && simulation.resources.length > 0) {
      const randomResourceIndex = Math.floor(Math.random() * simulation.resources.length);
      const targetResource = simulation.resources[randomResourceIndex];
      
      agent.targetPosition = { ...targetResource.position };
      agent.state = 'gathering';
      agent.stateTimer = 0;
      agent.targetId = targetResource.id;
      generateTrajectory(agent);
    } 
    // Sometimes go to a building
    else if (Math.random() < 0.5 && simulation.buildings.length > 0) {
      const randomBuildingIndex = Math.floor(Math.random() * simulation.buildings.length);
      const targetBuilding = simulation.buildings[randomBuildingIndex];
      
      // Set position to the front of the building
      agent.targetPosition = {
        x: targetBuilding.position.x,
        y: targetBuilding.position.y + targetBuilding.size.width / 2
      };
      agent.state = 'entering';
      agent.stateTimer = 0;
      agent.targetId = targetBuilding.id;
      generateTrajectory(agent);
    } 
    // Otherwise just wander
    else {
      setWanderingTarget(agent);
      generateTrajectory(agent);
    }
  };
  
  // Initialize the simulation
  useEffect(() => {
    if (!isSimulationActive) return;
    
    const simulation = simulationRef.current;
    const gridSize = 40;
    
    simulation.width = gridSize;
    simulation.height = gridSize;
    
    // Helper to generate random positions on the terrain
    const getRandomPosition = (marginX = 5, marginY = 5) => ({
      x: -gridSize / 2 + marginX + Math.random() * (gridSize - 2 * marginX),
      y: -gridSize / 2 + marginY + Math.random() * (gridSize - 2 * marginY)
    });
    
    // Create buildings
    const createBuildings = () => {
      const buildings: Building[] = [];
      const buildingCount = 5;
      
      for (let i = 0; i < buildingCount; i++) {
        const buildingType = BUILDING_TYPES[i % BUILDING_TYPES.length];
        const buildingSize = 2 + Math.random() * 3;
        
        buildings.push({
          id: i,
          position: getRandomPosition(10, 10),
          size: { 
            width: buildingSize, 
            height: 2 + Math.random() * 3,
            depth: buildingSize
          },
          type: buildingType.type,
          color: buildingType.color
        });
      }
      
      return buildings;
    };
    
    // Create resources
    const createResources = () => {
      const resources: Resource[] = [];
      const resourceCount = 15;
      const resourceTypes = ['Energy', 'Tokens', 'Materials', 'Data', 'Artifacts'];
      const resourceColors = ['#FFC107', '#9C27B0', '#E91E63', '#03A9F4', '#4CAF50'];
      
      for (let i = 0; i < resourceCount; i++) {
        const typeIndex = Math.floor(Math.random() * resourceTypes.length);
        
        resources.push({
          id: i,
          position: getRandomPosition(),
          type: resourceTypes[typeIndex],
          value: 10 + Math.floor(Math.random() * 90),
          color: resourceColors[typeIndex]
        });
      }
      
      return resources;
    };
    
    // Create agents
    const createAgents = () => {
      const agents: Agent[] = [];
      const agentCount = 20;
      
      for (let i = 0; i < agentCount; i++) {
        const agentType = AGENT_TYPES[i % AGENT_TYPES.length];
        const position = getRandomPosition();
        
        const agent: Agent = {
          id: i,
          position: position,
          targetPosition: position, // Start at the same spot
          type: agentType.type,
          color: agentType.color,
          icon: agentType.icon,
          speed: 0.05 + Math.random() * 0.05,
          state: 'wandering',
          stateTimer: 0,
          trajectory: [],
          resources: Math.floor(Math.random() * 50)
        };
        
        // Set initial target
        setNewAgentTarget(agent);
        
        agents.push(agent);
      }
      
      return agents;
    };
    
    // Initialize the simulation
    simulation.buildings = createBuildings();
    simulation.resources = createResources();
    simulation.agents = createAgents();
    simulation.interactions = [];
    
    const updateInterval = setInterval(() => {
      if (!isAnimating) return;
      
      // Update agents
      for (const agent of simulation.agents) {
        // Update state timer
        if (agent.stateTimer > 0) {
          agent.stateTimer -= 1;
          
          if (agent.stateTimer <= 0) {
            // State transition
            if (agent.state === 'gathering') {
              // Finish gathering, return to wandering
              agent.resources += 10 + Math.floor(Math.random() * 20);
              setNewAgentTarget(agent);
            } else if (agent.state === 'entering') {
              // Enter the building
              agent.state = 'inside';
              agent.stateTimer = 100 + Math.floor(Math.random() * 200);
            } else if (agent.state === 'inside') {
              // Exit the building
              agent.state = 'exiting';
              
              // Find the building
              const building = simulation.buildings.find(b => b.id === agent.targetId);
              if (building) {
                agent.position = {
                  x: building.position.x,
                  y: building.position.y + building.size.width / 2
                };
                
                // Go somewhere new
                setNewAgentTarget(agent);
              } else {
                setWanderingTarget(agent);
              }
            } else if (agent.state === 'trading') {
              // Finish trading, go somewhere new
              setNewAgentTarget(agent);
            } else {
              // Default: set a new target
              setNewAgentTarget(agent);
            }
          }
        }
        
        // Move the agent along its trajectory if not inside a building
        if (agent.state !== 'inside' && agent.trajectory.length > 0) {
          // Calculate distance to the next trajectory point
          const nextPoint = agent.trajectory[0];
          const dx = nextPoint.x - agent.position.x;
          const dy = nextPoint.y - agent.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Move towards the next point
          const stepSize = Math.min(agent.speed, distance);
          if (stepSize > 0) {
            agent.position.x += (dx / distance) * stepSize;
            agent.position.y += (dy / distance) * stepSize;
          }
          
          // If we've reached this point, remove it and go to the next one
          if (stepSize >= distance) {
            agent.trajectory.shift();
            
            // If we've reached the end of the trajectory
            if (agent.trajectory.length === 0) {
              // We've reached the target
              if (agent.state === 'gathering') {
                // Create a gathering interaction
                const resource = simulation.resources.find(r => r.id === agent.targetId);
                if (resource) {
                  simulation.interactions.push({
                    position: { ...resource.position },
                    type: 'gathering',
                    timer: 60 + Math.floor(Math.random() * 60),
                    agents: [agent.id]
                  });
                }
              } else if (agent.state === 'entering') {
                // Agent disappears inside the building
                const building = simulation.buildings.find(b => b.id === agent.targetId);
                if (building) {
                  agent.position = {
                    x: building.position.x,
                    y: building.position.y + building.size.width / 2
                  };
                }
              }
            }
          }
        }
      }
      
      // Update interactions
      simulation.interactions = simulation.interactions.filter(interaction => {
        interaction.timer -= 1;
        return interaction.timer > 0;
      });
      
      // Create new interactions
      const agentPairs = new Set<string>();
      for (let i = 0; i < simulation.agents.length; i++) {
        for (let j = i + 1; j < simulation.agents.length; j++) {
          const agent1 = simulation.agents[i];
          const agent2 = simulation.agents[j];
          
          // Skip if either agent is inside a building
          if (agent1.state === 'inside' || agent2.state === 'inside') continue;
          
          // Check proximity
          const dx = agent1.position.x - agent2.position.x;
          const dy = agent1.position.y - agent2.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 3 && Math.random() < 0.01) {
            const pairKey = `${agent1.id}-${agent2.id}`;
            if (!agentPairs.has(pairKey)) {
              agentPairs.add(pairKey);
              
              // They're close enough - create a trading interaction
              if (agent1.state === 'wandering' && agent2.state === 'wandering') {
                agent1.state = 'trading';
                agent2.state = 'trading';
                agent1.stateTimer = 50 + Math.floor(Math.random() * 50);
                agent2.stateTimer = agent1.stateTimer;
                
                // Create an interaction
                simulation.interactions.push({
                  position: {
                    x: (agent1.position.x + agent2.position.x) / 2,
                    y: (agent1.position.y + agent2.position.y) / 2
                  },
                  type: 'trading',
                  timer: agent1.stateTimer,
                  agents: [agent1.id, agent2.id]
                });
              }
            }
          }
        }
      }
    }, 50);
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [isSimulationActive, isAnimating]);
  
  // Handle agent clicks
  const handleAgentClick = (agentId: number) => {
    const sim = simulationRef.current;
    sim.selectedAgentId = agentId;
    
    if (onAgentSelect) {
      const agent = sim.agents.find(a => a.id === agentId);
      if (agent) {
        onAgentSelect(agent.type);
      }
    }
  };
  
  return (
    <>
      <div className="w-full h-full rounded-lg overflow-hidden">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-agent-black">Loading simulation...</div>}>
          <Canvas shadows style={{ background: '#121212' }}>
            <SimulationScene 
              agents={simulationRef.current.agents}
              buildings={simulationRef.current.buildings}
              resources={simulationRef.current.resources}
              interactions={simulationRef.current.interactions}
              selectedAgentId={simulationRef.current.selectedAgentId}
              onAgentClick={handleAgentClick}
            />
          </Canvas>
        </Suspense>
      </div>
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={toggleSimulation}
          className="bg-agent-black/70 backdrop-blur-sm text-white p-2 rounded-md hover:bg-agent-black transition-colors"
        >
          {isAnimating ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
      </div>
    </>
  );
};

export default GameSimulation;