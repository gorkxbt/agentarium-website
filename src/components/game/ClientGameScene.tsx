'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Sky, 
  Environment, 
  useGLTF, 
  Text,
  Trail,
  Float
} from '@react-three/drei';
import * as THREE from 'three';

// Define types for components
interface AgentProps {
  position: [number, number, number];
  color: string;
  speed: number;
  onAgentClick: (agent: any) => void;
}

interface BuildingProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color: string;
  onBuildingClick: (building: any) => void;
}

interface ClientGameSceneProps {
  onAgentClick?: (agent: any) => void;
}

// Agent component with animation
const Agent: React.FC<AgentProps> = ({ position, color, speed, onAgentClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRef = useRef(new THREE.Vector3(
    position[0] + (Math.random() * 20 - 10),
    position[1],
    position[2] + (Math.random() * 20 - 10)
  ));
  
  // Create a new target when agent reaches current target
  const updateTarget = () => {
    targetRef.current.set(
      Math.random() * 40 - 20,
      position[1],
      Math.random() * 40 - 20
    );
  };
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Move towards target
    const direction = new THREE.Vector3().subVectors(targetRef.current, meshRef.current.position);
    
    // If close to target, get a new target
    if (direction.length() < 0.5) {
      updateTarget();
      return;
    }
    
    // Normalize and scale by speed
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
  });
  
  return (
    <group>
      <Trail
        width={0.5}
        color={color}
        length={5}
        decay={1}
        attenuation={(width) => width}
      >
        <mesh 
          ref={meshRef} 
          position={position} 
          castShadow
          onClick={() => onAgentClick({ 
            id: Math.floor(Math.random() * 1000), 
            type: 'Agent', 
            color: color,
            icon: '🤖',
            state: 'active',
            resources: Math.floor(Math.random() * 50)
          })}
        >
          <capsuleGeometry args={[0.3, 0.5, 2, 8]} />
          <meshStandardMaterial color={color} />
          <mesh position={[0, 0.5, 0.2]} rotation={[0, 0, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
        </mesh>
      </Trail>
    </group>
  );
};

// Building component
const Building: React.FC<BuildingProps> = ({ position, height, width, depth, color, onBuildingClick }) => {
  return (
    <group position={position}>
      <mesh 
        position={[0, height/2, 0]} 
        castShadow 
        receiveShadow
        onClick={() => onBuildingClick({ 
          id: Math.floor(Math.random() * 1000), 
          type: 'Building', 
          color: color,
          icon: '🏢',
          state: 'operational',
          resources: Math.floor(Math.random() * 100)
        })}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.7}
          metalness={0.2}
        />
        
        {/* Windows */}
        {Array.from({ length: Math.floor(height) }).map((_, i) => (
          <React.Fragment key={`windows-row-${i}`}>
            {Array.from({ length: 3 }).map((_, j) => (
              <mesh 
                key={`window-${i}-${j}`} 
                position={[
                  width/2 * 0.8, 
                  -height/2 + (i + 0.5), 
                  depth/4 - j * depth/2
                ]}
              >
                <planeGeometry args={[0.3, 0.3]} />
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
    </group>
  );
};

// Road component
const Road: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#1a1a1a" />
      
      {/* Road markings */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.5, 40]} />
        <meshStandardMaterial color="#FFFF00" />
      </mesh>
      <mesh position={[0, 0, 0.01]} rotation={[0, 0, Math.PI/2]}>
        <planeGeometry args={[0.5, 40]} />
        <meshStandardMaterial color="#FFFF00" />
      </mesh>
    </mesh>
  );
};

// City component with animated elements
const City: React.FC<{ onAgentClick: (agent: any) => void }> = ({ onAgentClick }) => {
  // Generate buildings
  const buildings = Array.from({ length: 30 }).map((_, i) => {
    const gridSize = 5;
    const gridX = Math.floor(i / gridSize) - Math.floor(gridSize / 2);
    const gridZ = (i % gridSize) - Math.floor(gridSize / 2);
    
    // Add some randomness to grid positions
    const x = gridX * 8 + (Math.random() * 2 - 1);
    const z = gridZ * 8 + (Math.random() * 2 - 1);
    
    const height = 3 + Math.random() * 10;
    const width = 2 + Math.random() * 3;
    const depth = 2 + Math.random() * 3;
    
    // Generate a building color (mostly grays with occasional color)
    const color = Math.random() > 0.8 
      ? `hsl(${Math.random() * 360}, 50%, 50%)` 
      : `hsl(220, ${Math.random() * 10 + 5}%, ${Math.random() * 30 + 40}%)`;
    
    return {
      position: [x, 0, z] as [number, number, number],
      height,
      width,
      depth,
      color
    };
  });
  
  // Generate agents
  const agents = Array.from({ length: 20 }).map((_, i) => {
    const x = Math.random() * 40 - 20;
    const z = Math.random() * 40 - 20;
    const colors = ['#2196F3', '#FF5722', '#4CAF50', '#9C27B0', '#FFEB3B'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const speed = 1 + Math.random() * 2;
    
    return {
      position: [x, 0.5, z] as [number, number, number],
      color,
      speed
    };
  });
  
  return (
    <group>
      {/* Ground */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a4858" />
      </mesh>
      
      {/* Road system */}
      <Road />
      
      {/* Buildings */}
      {buildings.map((building, i) => (
        <Building 
          key={`building-${i}`} 
          {...building}
          onBuildingClick={onAgentClick}
        />
      ))}
      
      {/* Agents */}
      {agents.map((agent, i) => (
        <Agent 
          key={`agent-${i}`} 
          {...agent}
          onAgentClick={onAgentClick}
        />
      ))}
      
      {/* Floating city name */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text
          position={[0, 15, 0]}
          fontSize={5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          AGENTARIUM
        </Text>
      </Float>
    </group>
  );
};

// Main component
const ClientGameScene: React.FC<ClientGameSceneProps> = ({ onAgentClick = () => {} }) => {
  return (
    <Canvas 
      shadows 
      className="w-full h-full"
      camera={{ position: [30, 30, 30], fov: 50 }}
    >
      <fog attach="fog" args={['#1a2e3b', 30, 100]} />
      <color attach="background" args={['#1a2e3b']} />
      
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[10, 20, 15]}
        intensity={1.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Sky distance={450000} sunPosition={[1, 0.5, 0]} />
      
      <City onAgentClick={onAgentClick} />
      
      <Environment preset="night" />
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={10}
        maxDistance={50}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default ClientGameScene; 