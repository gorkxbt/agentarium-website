// GameSimulation.tsx - Enhanced 3D simulation component
// Reference to successful deployment commit: ac57583
// Last updated to improve Sims-like experience and interactivity
import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Text, Environment, Billboard, Float, Html, Sky, Cloud, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Agent types with their respective roles and colors
const AGENT_TYPES = [
  { 
    type: 'Entrepreneur', 
    color: '#FF9800', 
    icon: '👨‍💼',
    traits: ['Ambitious', 'Risk-taker', 'Strategic'],
    description: 'Focused on identifying market opportunities and maximizing profit',
    competencies: ['Business Planning', 'Resource Allocation', 'Market Analysis'],
    needs: ['Money', 'Status', 'Connections']
  },
  { 
    type: 'Scientist', 
    color: '#2196F3', 
    icon: '👩‍🔬',
    traits: ['Analytical', 'Curious', 'Detail-oriented'],
    description: 'Researches new technologies that unlock efficiency improvements',
    competencies: ['Research', 'Data Analysis', 'Innovation'],
    needs: ['Knowledge', 'Resources', 'Collaboration']
  },
  { 
    type: 'Craftsman', 
    color: '#F44336', 
    icon: '🛠️',
    traits: ['Precise', 'Patient', 'Resourceful'],
    description: 'Specialized in creating high-value items from raw materials',
    competencies: ['Manufacturing', 'Quality Control', 'Resource Optimization'],
    needs: ['Materials', 'Tools', 'Skills']
  },
  { 
    type: 'Trader', 
    color: '#4CAF50', 
    icon: '💱',
    traits: ['Persuasive', 'Quick-thinking', 'Adaptive'],
    description: 'Profits from market inefficiencies and arbitrage opportunities',
    competencies: ['Negotiation', 'Market Timing', 'Value Assessment'],
    needs: ['Information', 'Connections', 'Capital']
  },
  { 
    type: 'Explorer', 
    color: '#9C27B0', 
    icon: '🔍',
    traits: ['Adventurous', 'Independent', 'Observant'],
    description: 'Discovers new resources and opportunities in unexplored areas',
    competencies: ['Resource Discovery', 'Path Finding', 'Risk Assessment'],
    needs: ['Freedom', 'New Territories', 'Equipment']
  },
  { 
    type: 'Networker', 
    color: '#3F51B5', 
    icon: '🌐',
    traits: ['Charismatic', 'Empathetic', 'Sociable'],
    description: 'Excels at forming alliances and coordinating group activities',
    competencies: ['Relationship Building', 'Communication', 'Conflict Resolution'],
    needs: ['Social Interaction', 'Recognition', 'Trust']
  },
  { 
    type: 'Innovator', 
    color: '#00BCD4', 
    icon: '💡',
    traits: ['Creative', 'Visionary', 'Problem-solver'],
    description: 'Creates novel solutions to problems in unexpected ways',
    competencies: ['Idea Generation', 'Adaptation', 'Technology Integration'],
    needs: ['Inspiration', 'Resources', 'Freedom']
  },
  { 
    type: 'Guardian', 
    color: '#795548', 
    icon: '🛡️',
    traits: ['Reliable', 'Vigilant', 'Principled'],
    description: 'Protects shared resources and maintains system balance',
    competencies: ['Security Management', 'Resource Preservation', 'System Monitoring'],
    needs: ['Order', 'Purpose', 'Respect']
  },
  { 
    type: 'Resource Gatherer', 
    color: '#607D8B', 
    icon: '⚒️',
    traits: ['Determined', 'Methodical', 'Efficient'],
    description: 'Specializes in collecting raw materials efficiently',
    competencies: ['Resource Extraction', 'Terrain Navigation', 'Tool Optimization'],
    needs: ['Energy', 'Tools', 'Territory']
  },
  { 
    type: 'Diplomat', 
    color: '#9E9E9E', 
    icon: '🤝',
    traits: ['Composed', 'Diplomatic', 'Strategic'],
    description: 'Resolves conflicts and negotiates beneficial agreements',
    competencies: ['Mediation', 'Strategic Planning', 'Alliance Building'],
    needs: ['Harmony', 'Information', 'Influence']
  }
];

// Enhanced building types with more realistic options
const BUILDING_TYPES = [
  { type: 'City Hall', color: '#78909C', purpose: 'Administrative center and community hub', model: 'city_hall' },
  { type: 'Marketplace', color: '#8D6E63', purpose: 'Trading and economic activities', model: 'marketplace' },
  { type: 'Research Lab', color: '#5C6BC0', purpose: 'Scientific research and innovation', model: 'lab' },
  { type: 'Workshop', color: '#EF5350', purpose: 'Manufacturing and crafting', model: 'workshop' },
  { type: 'Training Center', color: '#66BB6A', purpose: 'Skill development and education', model: 'training' },
  { type: 'Park', color: '#4CAF50', purpose: 'Recreation and community gathering', model: 'park' },
  { type: 'Police Station', color: '#3F51B5', purpose: 'Security and law enforcement', model: 'police' },
  { type: 'Gas Station', color: '#FF9800', purpose: 'Energy supply and vehicle refueling', model: 'gas' },
  { type: 'Supermarket', color: '#9C27B0', purpose: 'Food and supplies distribution', model: 'supermarket' },
  { type: 'Hospital', color: '#F44336', purpose: 'Healthcare and medical services', model: 'hospital' },
  { type: 'Residential Building', color: '#2196F3', purpose: 'Housing for agents', model: 'residential' },
  { type: 'Bank', color: '#FFC107', purpose: 'Financial services and storage', model: 'bank' },
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
  const gridSize = 80; // Larger grid for more space
  const gridDivisions = 40;
  
  // Create a more detailed ground texture
  const groundTexture = useTexture({
    map: 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/prototype/dark.png'
  });
  
  if (groundTexture.map) {
    groundTexture.map.repeat.set(20, 20);
    groundTexture.map.wrapS = groundTexture.map.wrapT = THREE.RepeatWrapping;
  }

  return (
    <group position={[0, -0.01, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial 
          {...groundTexture} 
          color="#121212" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      <gridHelper args={[gridSize, gridDivisions, "#1DB954", "#282828"]} />
    </group>
  );
}

// Simple tree model for parks
function TreeModel({ position }: { position: { x: number; y: number } }) {
  return (
    <group position={[position.x, 0, position.y]}>
      {/* Trunk */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1.5, 8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>
      {/* Foliage */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <coneGeometry args={[1.2, 2.5, 8]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Enhanced building component with more detailed models
function BuildingModel({ position, size, color, type }: Building) {
  const rgbColor = hexToRgb(color);
  const buildingType = BUILDING_TYPES.find(b => b.type === type) || BUILDING_TYPES[0];
  const height = size.height * (type === 'Residential Building' ? 2.5 : 
                               type === 'City Hall' ? 2 : 
                               type === 'Hospital' ? 1.8 : 1);
  
  // Determine if this is a park to use special rendering
  if (type === 'Park') {
    return (
      <group position={[position.x, 0, position.y]}>
        {/* Park ground */}
        <mesh receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[size.width, 0.1, size.width]} />
          <meshStandardMaterial color="#388E3C" />
        </mesh>
        
        {/* Park path */}
        <mesh receiveShadow position={[0, 0.06, 0]}>
          <boxGeometry args={[size.width * 0.6, 0.05, size.width * 0.2]} />
          <meshStandardMaterial color="#A1887F" />
        </mesh>
        
        {/* Trees */}
        <TreeModel position={{ x: size.width * 0.3, y: size.width * 0.3 }} />
        <TreeModel position={{ x: -size.width * 0.3, y: -size.width * 0.3 }} />
        <TreeModel position={{ x: size.width * 0.3, y: -size.width * 0.3 }} />
        <TreeModel position={{ x: -size.width * 0.3, y: size.width * 0.3 }} />
        
        {/* Park bench */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.4]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        <mesh position={[0, 0.15, 0.2]}>
          <boxGeometry args={[1.2, 0.3, 0.05]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        
        {/* Building name */}
        <Billboard position={[0, 2, 0]}>
          <Text
            fontSize={0.6}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {type}
          </Text>
        </Billboard>
      </group>
    );
  }
  
  // Special gas station model
  if (type === 'Gas Station') {
    return (
      <group position={[position.x, 0, position.y]}>
        {/* Main building */}
        <mesh castShadow receiveShadow position={[0, size.height/2, 0]}>
          <boxGeometry args={[size.width * 0.7, size.height, size.width * 0.7]} />
          <meshStandardMaterial color={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)} />
        </mesh>
        
        {/* Gas pump canopy */}
        <mesh castShadow position={[size.width * 0.5, size.height * 0.8, 0]}>
          <boxGeometry args={[size.width * 0.8, size.height * 0.1, size.width * 0.8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Canopy supports */}
        <mesh castShadow position={[size.width * 0.5, size.height * 0.4, size.width * 0.4]}>
          <cylinderGeometry args={[0.1, 0.1, size.height * 0.8, 8]} />
          <meshStandardMaterial color="#BDBDBD" />
        </mesh>
        <mesh castShadow position={[size.width * 0.5, size.height * 0.4, -size.width * 0.4]}>
          <cylinderGeometry args={[0.1, 0.1, size.height * 0.8, 8]} />
          <meshStandardMaterial color="#BDBDBD" />
        </mesh>
        
        {/* Gas pumps */}
        <mesh castShadow position={[size.width * 0.5, size.height * 0.3, 0]}>
          <boxGeometry args={[0.5, size.height * 0.6, 0.3]} />
          <meshStandardMaterial color="#F44336" />
        </mesh>
        
        {/* Building name */}
        <Billboard position={[0, size.height + 0.5, 0]}>
          <Text
            fontSize={0.6}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {type}
          </Text>
        </Billboard>
      </group>
    );
  }
  
  // Default building model with enhancements based on type
  return (
    <group position={[position.x, size.height / 2, position.y]}>
      {/* Main building structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size.width, height, size.width]} />
        <meshStandardMaterial 
          color={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      
      {/* Roof - different shapes based on building type */}
      {type === 'City Hall' ? (
        <mesh castShadow position={[0, height / 2 + 0.1, 0]}>
          <cylinderGeometry args={[size.width * 0.3, size.width * 0.3, size.height * 0.5, 16]} />
          <meshStandardMaterial color={new THREE.Color(rgbColor.r * 0.7, rgbColor.g * 0.7, rgbColor.b * 0.7)} />
        </mesh>
      ) : type === 'Police Station' ? (
        <group position={[0, height / 2 + 0.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[size.width * 0.5, size.height * 0.3, size.width * 0.5]} />
            <meshStandardMaterial color={new THREE.Color(rgbColor.r * 0.7, rgbColor.g * 0.7, rgbColor.b * 0.7)} />
          </mesh>
          {/* Police antenna/light */}
          <mesh castShadow position={[0, size.height * 0.3, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
            <meshStandardMaterial color="#BDBDBD" />
          </mesh>
          <mesh castShadow position={[0, size.height * 0.5, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#F44336" emissive="#F44336" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ) : (
        <mesh castShadow position={[0, height / 2 + 0.1, 0]}>
          <coneGeometry args={[size.width * 0.8, size.height * 0.4, 4]} />
          <meshStandardMaterial color={new THREE.Color(rgbColor.r * 0.7, rgbColor.g * 0.7, rgbColor.b * 0.7)} />
        </mesh>
      )}
      
      {/* Building name */}
      <Billboard position={[0, height + 1, 0]}>
        <Text
          fontSize={0.6}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {type}
        </Text>
      </Billboard>
      
      {/* Windows and details */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[
          size.width / 2 * (i % 2 === 0 ? 1 : -1) * 0.8,
          -height / 4 + (Math.floor(i/2) - 0.5) * height/2,
          size.width / 2 * 1.001
        ]}>
          <planeGeometry args={[size.width * 0.25, height * 0.2]} />
          <meshStandardMaterial 
            color="#88CCFF" 
            emissive="#88CCFF"
            emissiveIntensity={0.2}
            transparent={true}
            opacity={0.8}
          />
        </mesh>
      ))}
      
      {/* Door */}
      <mesh position={[0, -height/2 + 0.5, size.width/2 * 1.001]}>
        <planeGeometry args={[size.width * 0.3, 1]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>
  );
}

// Resource model with improved visuals
function ResourceModel({ position, color, type, value }: Resource) {
  const rgbColor = hexToRgb(color);
  
  return (
    <group position={[position.x, 0.5, position.y]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh castShadow>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial 
            color={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)} 
            emissive={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)}
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <Billboard position={[0, 1, 0]}>
          <Text
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {type} ({value})
          </Text>
        </Billboard>
      </Float>
    </group>
  );
}

// Agent model with Sims-like appearance and details
function AgentModel({ position, color, icon, resources, selected, id, type, onClick }: Agent & { selected: boolean; onClick?: (id: number) => void }) {
  const rgbColor = hexToRgb(color);
  const agentType = AGENT_TYPES.find(a => a.type === type) || AGENT_TYPES[0];
  
  // Create a pulsing effect for selected agents
  const [scale, setScale] = useState(1);
  useFrame(() => {
    if (selected) {
      setScale(1 + Math.sin(Date.now() * 0.005) * 0.1);
    } else {
      setScale(1);
    }
  });

  return (
    <group 
      position={[position.x, 0.5, position.y]} 
      scale={[scale, scale, scale]}
      onClick={onClick ? (event) => {
        event.stopPropagation();
        onClick(id);
      } : undefined}
    >
      {/* Agent body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 0.5, 8, 16]} />
        <meshStandardMaterial 
          color={new THREE.Color(rgbColor.r, rgbColor.g, rgbColor.b)} 
          roughness={0.7}
        />
      </mesh>
      
      {/* Agent head */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial 
          color={new THREE.Color(rgbColor.r * 0.8, rgbColor.g * 0.8, rgbColor.b * 0.8)} 
          roughness={0.7}
        />
      </mesh>
      
      {/* Selection indicator */}
      {selected && (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.65, 32]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      )}
      
      {/* Agent icon and type */}
      <Billboard position={[0, 1.2, 0]}>
        <Text
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {icon} {agentType.type}
        </Text>
      </Billboard>
      
      {/* Resources indicator */}
      {resources > 0 && (
        <Billboard position={[0.5, 0.5, 0]}>
          <Text
            fontSize={0.3}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            💰{resources}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

// Interaction effect with improved visuals
function InteractionEffect({ position, type, timer }: Interaction) {
  const scale = Math.min(1, timer / 30) * 0.8 + 0.2;
  
  return (
    <group position={[position.x, 1, position.y]}>
      <Billboard>
        <mesh>
          <planeGeometry args={[1 * scale, 1 * scale]} />
          <meshBasicMaterial 
            transparent 
            opacity={Math.min(1, timer / 10)} 
            color={type === 'trade' ? '#FFD700' : type === 'gather' ? '#4CAF50' : '#2196F3'}
          />
        </mesh>
        <Text
          fontSize={0.5 * scale}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {type === 'trade' ? '💱' : type === 'gather' ? '⚒️' : '🔄'}
        </Text>
      </Billboard>
    </group>
  );
}

// Enhanced environment with day/night cycle
function SimulationEnvironment() {
  const [timeOfDay, setTimeOfDay] = useState(0.5); // 0 = night, 1 = day
  
  useFrame(() => {
    // Slowly cycle between day and night
    setTimeOfDay(prev => (prev + 0.0001) % 1);
  });
  
  return (
    <>
      {timeOfDay > 0.3 && timeOfDay < 0.7 ? (
        <Sky 
          distance={450000} 
          sunPosition={[Math.sin((timeOfDay - 0.3) * Math.PI) * 10, Math.sin((timeOfDay - 0.3) * Math.PI) * 5, 0]} 
          rayleigh={0.5} 
        />
      ) : (
        <Stars radius={100} depth={50} count={1000} factor={4} />
      )}
      <ambientLight intensity={timeOfDay > 0.3 && timeOfDay < 0.7 ? 0.8 : 0.2} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={timeOfDay > 0.3 && timeOfDay < 0.7 ? 1 : 0.2} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      <fog attach="fog" args={["#151515", 10, 50]} />
    </>
  );
}

// Agent details panel component
function AgentDetailsPanel({ agent, onClose }: { agent: Agent | null, onClose: () => void }) {
  if (!agent) return null;
  
  const agentTypeInfo = AGENT_TYPES.find(a => a.type === agent.type) || AGENT_TYPES[0];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-agent-black/90 backdrop-blur-lg rounded-lg border border-white/10 shadow-xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: `${agent.color}30`, color: agent.color }}
            >
              <span className="text-xl">{agent.icon}</span>
            </div>
            <div>
              <h3 className="text-white font-bold">Agent #{agent.id}</h3>
              <p className="text-white/70 text-sm">{agent.type}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-wider mb-1">Status</h4>
            <p className="text-white text-sm capitalize">{agent.state}</p>
          </div>
          
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-wider mb-1">Resources</h4>
            <div className="flex items-center">
              <div className="h-2 bg-agent-light-gray rounded-full w-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${Math.min(100, agent.resources / 10)}%`,
                    backgroundColor: agent.color 
                  }}
                ></div>
              </div>
              <span className="text-white ml-2 text-sm">{agent.resources}</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-wider mb-1">Traits</h4>
            <div className="flex flex-wrap gap-1">
              {agentTypeInfo.traits.map(trait => (
                <span 
                  key={trait} 
                  className="px-2 py-0.5 bg-agent-light-gray/30 rounded-full text-white/90 text-xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-wider mb-1">Description</h4>
            <p className="text-white/90 text-sm">{agentTypeInfo.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
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
  
  // Set camera position for a wider view
  useEffect(() => {
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[10, 20, 15]}
        intensity={1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Sky distance={450000} sunPosition={[1, 0.5, 0]} />
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      
      <Ground />
      
      {/* Buildings */}
      {buildings.map((building) => (
        <BuildingModel key={building.id} {...building} />
      ))}
      
      {/* Resources */}
      {resources.map((resource) => (
        <ResourceModel key={resource.id} {...resource} />
      ))}
      
      {/* Agents */}
      {agents.map((agent) => (
        <AgentModel 
          key={agent.id} 
          {...agent} 
          selected={agent.id === selectedAgentId}
          onClick={(id) => onAgentClick(id)}
        />
      ))}
      
      {/* Interactions */}
      {interactions.map((interaction, index) => (
        <InteractionEffect key={index} {...interaction} />
      ))}
      
      <Environment preset="city" />
    </>
  );
}

// Main component
const GameSimulation = ({ onAgentSelect }: GameSimulationProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [showAgentDetails, setShowAgentDetails] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };
  
  // Helper to set a wandering target
  const setWanderingTarget = (agent: Agent) => {
    const margin = 5;
    const simulation = { agents, buildings, resources, interactions, width: 40, height: 40 };
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
    const simulation = { agents, buildings, resources, interactions, width: 40, height: 40 };
    
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
  
  // Helper functions to generate simulation elements
  const getRandomPosition = (marginX = 5, marginY = 5) => ({
    x: -20 + marginX + Math.random() * (40 - 2 * marginX),
    y: -20 + marginY + Math.random() * (40 - 2 * marginY)
  });
  
    const createBuildings = () => {
    const buildings: Building[] = [];
    const buildingCount = 12; // Increased building count
    const buildingTypes = BUILDING_TYPES;
    
    // Create a city layout with buildings
    for (let i = 0; i < buildingCount; i++) {
      const buildingType = buildingTypes[i % buildingTypes.length];
      const size = { 
        width: 3 + Math.random() * 2, 
        height: 2 + Math.random() * 3,
        depth: 3 + Math.random() * 2
      };
      
      // Position buildings in a more organized layout
      let x, y;
      
      // Create a grid layout for the buildings
      const row = Math.floor(i / 4);
      const col = i % 4;
      
      // Add some randomness to the grid positions
      x = (col * 15) - 22 + (Math.random() * 4 - 2);
      y = (row * 15) - 22 + (Math.random() * 4 - 2);
      
      buildings.push({
        id: i,
        position: { x, y },
        size,
        type: buildingType.type,
        color: buildingType.color
      });
    }
    
    return buildings;
    };
    
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

  useEffect(() => {
    // Initialize the simulation
    const initSimulation = () => {
      setBuildings(createBuildings());
      setResources(createResources());
      setAgents(createAgents());
    };

    initSimulation();
  }, []);
  
  // Handle agent clicks
  const handleAgentClick = (agentId: number) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgentId(agentId);
      setSelectedAgent(agent);
      setShowAgentDetails(true);
      if (onAgentSelect) {
        onAgentSelect(agent.type);
      }
    }
  };
  
  const closeAgentDetails = () => {
    setShowAgentDetails(false);
    setSelectedAgentId(null);
  };
  
  return (
    <div className="w-full h-[calc(100vh-6rem)] relative bg-agent-black">
      {/* Game controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={toggleSimulation}
          className={`px-3 py-1 rounded-md text-xs font-medium ${
            isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-agent-green hover:bg-agent-green-muted'
          } text-white transition-colors`}
        >
          {isRunning ? 'Pause' : 'Start'} Simulation
        </button>
        <button
          onClick={() => {
            setBuildings(createBuildings());
            setResources(createResources());
            setAgents(createAgents());
          }}
          className="px-3 py-1 rounded-md text-xs font-medium bg-agent-blue hover:bg-agent-blue-dark text-white transition-colors"
        >
          Reset
        </button>
      </div>
      
      {/* Social links */}
      <div className="absolute top-4 left-4 z-10 flex space-x-4">
        <a 
          href="https://t.me/agentarium" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-agent-dark-gray hover:bg-agent-gray transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </a>
        <a 
          href="https://github.com/gorkxbt/agentarium-website" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-agent-dark-gray hover:bg-agent-gray transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
        <a 
          href="https://twitter.com/agentarium" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-agent-dark-gray hover:bg-agent-gray transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        </a>
      </div>
      
      {/* 3D Canvas */}
      <Canvas shadows className="w-full h-full">
        <Suspense fallback={null}>
          <SimulationScene
            agents={agents}
            buildings={buildings}
            resources={resources}
            interactions={interactions}
            selectedAgentId={selectedAgentId}
            onAgentClick={handleAgentClick}
          />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
      
      {/* Selected Agent Details Panel */}
      {selectedAgent && (
        <AgentDetailsPanel agent={selectedAgent} onClose={closeAgentDetails} />
      )}
    </div>
  );
};

export default GameSimulation;