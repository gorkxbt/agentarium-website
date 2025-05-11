import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text, Billboard, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Tree model
export function Tree({ position, scale = 1, variation = 0 }: { position: [number, number, number], scale?: number, variation?: number }) {
  const treeRef = useRef<THREE.Group>(null);
  
  // Tree trunk
  const trunkHeight = 0.8 + variation * 0.3;
  const trunkRadius = 0.15 + variation * 0.05;
  
  // Tree crown
  const crownRadius = 0.6 + variation * 0.2;
  const crownHeight = 1.2 + variation * 0.4;
  
  // Slight movement with breeze
  useFrame((state) => {
    if (treeRef.current) {
      const t = state.clock.getElapsedTime();
      treeRef.current.rotation.x = Math.sin(t * 0.1 + position[0]) * 0.02;
      treeRef.current.rotation.z = Math.sin(t * 0.15 + position[2]) * 0.02;
    }
  });
  
  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* Tree trunk */}
      <mesh castShadow position={[0, trunkHeight / 2, 0]}>
        <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, trunkHeight, 8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>
      
      {/* Tree crown */}
      <mesh castShadow position={[0, trunkHeight + crownHeight / 2 - 0.1, 0]}>
        <coneGeometry args={[crownRadius, crownHeight, 8]} />
        <meshStandardMaterial color={variation > 0.5 ? "#2E7D32" : "#388E3C"} roughness={0.8} />
      </mesh>
    </group>
  );
}

// Park bench
export function ParkBench({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Bench seat */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.6]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.8} />
      </mesh>
      
      {/* Bench backrest */}
      <mesh castShadow position={[0, 0.8, -0.25]}>
        <boxGeometry args={[1.5, 0.7, 0.08]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.8} />
      </mesh>
      
      {/* Bench legs */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.2, 0]}>
          <boxGeometry args={[0.08, 0.4, 0.6]} />
          <meshStandardMaterial color="#5D4037" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Lamp post
export function LampPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 3, 8]} />
        <meshStandardMaterial color="#37474F" roughness={0.6} metalness={0.5} />
      </mesh>
      
      {/* Lamp head */}
      <mesh castShadow position={[0, 3, 0]}>
        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#546E7A" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Light bulb */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#FFF9C4" 
          emissive="#FFF59D"
          emissiveIntensity={1} 
          toneMapped={false}
        />
      </mesh>
      
      {/* Light source */}
      <pointLight
        position={[0, 3, 0]}
        intensity={1}
        distance={8}
        color="#FFF9C4"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
    </group>
  );
}

// Path section
export function PathSection({ position, rotation = 0, length = 2 }: { position: [number, number, number], rotation?: number, length?: number }) {
  return (
    <mesh 
      receiveShadow 
      position={position} 
      rotation={[0, rotation, 0]}
    >
      <planeGeometry args={[length, 0.8]} />
      <meshStandardMaterial 
        color="#D7CCC8" 
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

// Fountain
export function Fountain({ position }: { position: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);
  const displacementMap = useTexture("https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/noise.jpg");
  
  useFrame((state) => {
    if (waterRef.current && waterRef.current.material instanceof THREE.MeshStandardMaterial) {
      const t = state.clock.getElapsedTime();
      // Animate water surface
      waterRef.current.material.displacementScale = Math.sin(t * 2) * 0.05 + 0.05;
    }
  });
  
  return (
    <group position={position}>
      {/* Base */}
      <mesh receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[2, 2.2, 0.4, 32]} />
        <meshStandardMaterial color="#90A4AE" roughness={0.8} />
      </mesh>
      
      {/* Water basin */}
      <mesh receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.6, 32]} />
        <meshStandardMaterial color="#78909C" roughness={0.7} />
      </mesh>
      
      {/* Water surface */}
      <mesh ref={waterRef} receiveShadow position={[0, 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshStandardMaterial 
          color="#81D4FA" 
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.3}
          displacementScale={0.05}
          displacementBias={0}
          displacementMap={displacementMap}
        />
      </mesh>
      
      {/* Center column */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
        <meshStandardMaterial color="#90A4AE" roughness={0.8} />
      </mesh>
      
      {/* Top basin */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.8, 0.7, 0.3, 16]} />
        <meshStandardMaterial color="#78909C" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Building with more detail
export function DetailedBuilding({ 
  position, 
  size, 
  color, 
  type,
  floors = 2,
  windows = 4,
  hasAwning = false
}: { 
  position: [number, number, number], 
  size: { width: number, height: number, depth: number },
  color: string,
  type: string,
  floors?: number,
  windows?: number,
  hasAwning?: boolean
}) {
  const buildingRef = useRef<THREE.Group>(null);
  
  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };
  
  const rgbColor = hexToRgb(color);
  const darkerColor = new THREE.Color(
    Math.max(0, rgbColor.r - 0.2),
    Math.max(0, rgbColor.g - 0.2),
    Math.max(0, rgbColor.b - 0.2)
  );
  
  return (
    <group ref={buildingRef} position={position}>
      {/* Main building structure */}
      <mesh castShadow receiveShadow position={[0, size.height / 2, 0]}>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      
      {/* Roof */}
      <mesh castShadow position={[0, size.height + 0.2, 0]}>
        <boxGeometry args={[size.width + 0.2, 0.1, size.depth + 0.2]} />
        <meshStandardMaterial color={darkerColor} roughness={0.7} />
      </mesh>
      
      {/* Windows */}
      {Array.from({ length: floors }).map((_, floorIndex) => (
        Array.from({ length: windows }).map((_, windowIndex) => {
          const windowWidth = size.width * 0.15;
          const windowHeight = size.height * 0.2;
          const spacingX = size.width / (windows + 1);
          const spacingY = size.height / (floors + 1);
          
          return (
            <mesh 
              key={`window-${floorIndex}-${windowIndex}`} 
              position={[
                -size.width / 2 + spacingX * (windowIndex + 1),
                spacingY * (floorIndex + 1),
                size.depth / 2 + 0.01
              ]}
            >
              <planeGeometry args={[windowWidth, windowHeight]} />
              <meshStandardMaterial 
                color="#E3F2FD" 
                emissive="#BBDEFB"
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        })
      ))}
      
      {/* Door */}
      <mesh position={[0, 0.9, size.depth / 2 + 0.01]}>
        <planeGeometry args={[size.width * 0.25, size.height * 0.35]} />
        <meshStandardMaterial color="#4E342E" roughness={0.8} />
      </mesh>
      
      {/* Awning (if enabled) */}
      {hasAwning && (
        <mesh position={[0, size.height * 0.4, size.depth / 2 + 0.3]} rotation={[Math.PI / 6, 0, 0]}>
          <boxGeometry args={[size.width * 0.4, 0.05, 0.4]} />
          <meshStandardMaterial 
            color="#D32F2F" 
            roughness={0.8}
          />
        </mesh>
      )}
      
      {/* Building name */}
      <Billboard position={[0, size.height + 0.8, 0]}>
        <Text
          fontSize={0.4}
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

// NPC character
export function NPC({ 
  position, 
  color = "#FFCC80", 
  type = "Citizen",
  isWalking = false
}: { 
  position: [number, number, number], 
  color?: string,
  type?: string,
  isWalking?: boolean
}) {
  const npcRef = useRef<THREE.Group>(null);
  
  // Animate walking if enabled
  useFrame((state) => {
    if (npcRef.current && isWalking) {
      const t = state.clock.getElapsedTime();
      
      // Arm swing
      if (npcRef.current.children[1]) {
        npcRef.current.children[1].rotation.x = Math.sin(t * 3) * 0.4;
      }
      if (npcRef.current.children[2]) {
        npcRef.current.children[2].rotation.x = -Math.sin(t * 3) * 0.4;
      }
      
      // Leg movement
      if (npcRef.current.children[3]) {
        npcRef.current.children[3].rotation.x = Math.sin(t * 3) * 0.6;
      }
      if (npcRef.current.children[4]) {
        npcRef.current.children[4].rotation.x = -Math.sin(t * 3) * 0.6;
      }
    }
  });
  
  return (
    <group ref={npcRef} position={position}>
      {/* Head */}
      <mesh castShadow position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      
      {/* Arms */}
      <mesh castShadow position={[0.3, 1.1, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      
      <mesh castShadow position={[-0.3, 1.1, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      
      {/* Legs */}
      <mesh castShadow position={[0.15, 0.5, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color="#3F51B5" roughness={0.8} />
      </mesh>
      
      <mesh castShadow position={[-0.15, 0.5, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color="#3F51B5" roughness={0.8} />
      </mesh>
      
      {/* Body */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.2, 0.6, 4, 16]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.8} />
      </mesh>
      
      {/* Label */}
      <Billboard position={[0, 2, 0]}>
        <Text
          fontSize={0.2}
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

// Park area
export function ParkArea({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color="#4CAF50" roughness={1} />
      </mesh>
      
      {/* Trees */}
      <Tree position={[3, 0, 2]} scale={1.2} variation={0.2} />
      <Tree position={[-3, 0, -2]} scale={1.5} variation={0} />
      <Tree position={[-2, 0, 3]} scale={1} variation={0.5} />
      <Tree position={[2, 0, -3]} scale={1.3} variation={0.8} />
      <Tree position={[4, 0, -1]} scale={0.8} variation={0.3} />
      
      {/* Benches */}
      <ParkBench position={[0, 0, 2]} rotation={Math.PI} />
      <ParkBench position={[2, 0, 0]} rotation={Math.PI / 2} />
      <ParkBench position={[-2, 0, 0]} rotation={-Math.PI / 2} />
      
      {/* Fountain */}
      <Fountain position={[0, 0, 0]} />
      
      {/* Lamp posts */}
      <LampPost position={[-4, 0, 4]} />
      <LampPost position={[4, 0, 4]} />
      <LampPost position={[-4, 0, -4]} />
      <LampPost position={[4, 0, -4]} />
      
      {/* NPCs */}
      <NPC position={[1, 0, 1]} color="#FFCCBC" type="Visitor" isWalking={true} />
      <NPC position={[-1, 0, -1]} color="#FFECB3" type="Tourist" />
    </group>
  );
}

// City block
export function CityBlock({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#455A64" roughness={1} />
      </mesh>
      
      {/* Buildings */}
      <DetailedBuilding 
        position={[-6, 0, -6]} 
        size={{ width: 4, height: 6, depth: 4 }}
        color="#5D4037"
        type="Resource Hub"
        floors={3}
        windows={3}
      />
      
      <DetailedBuilding 
        position={[6, 0, -6]} 
        size={{ width: 5, height: 4, depth: 3 }}
        color="#1565C0"
        type="Research Lab"
        floors={2}
        windows={4}
        hasAwning={true}
      />
      
      <DetailedBuilding 
        position={[-6, 0, 6]} 
        size={{ width: 4, height: 5, depth: 4 }}
        color="#2E7D32"
        type="Training Center"
        floors={2}
        windows={3}
      />
      
      <DetailedBuilding 
        position={[6, 0, 6]} 
        size={{ width: 6, height: 3, depth: 4 }}
        color="#C62828"
        type="Workshop"
        floors={1}
        windows={5}
        hasAwning={true}
      />
      
      {/* Park in the center */}
      <ParkArea position={[0, 0, 0]} />
      
      {/* Roads */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3]}>
        <planeGeometry args={[20, 2]} />
        <meshStandardMaterial color="#263238" roughness={1} />
      </mesh>
      
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 3]}>
        <planeGeometry args={[20, 2]} />
        <meshStandardMaterial color="#263238" roughness={1} />
      </mesh>
      
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.02, 0]}>
        <planeGeometry args={[2, 20]} />
        <meshStandardMaterial color="#263238" roughness={1} />
      </mesh>
      
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[3, 0.02, 0]}>
        <planeGeometry args={[2, 20]} />
        <meshStandardMaterial color="#263238" roughness={1} />
      </mesh>
      
      {/* NPCs on the streets */}
      <NPC position={[-3, 0, -5]} color="#FFCCBC" type="Citizen" isWalking={true} />
      <NPC position={[3, 0, 5]} color="#FFECB3" type="Trader" isWalking={true} />
      <NPC position={[5, 0, -3]} color="#D7CCC8" type="Explorer" />
    </group>
  );
} 