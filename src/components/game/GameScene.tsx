'use client';

import { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Text, Environment, Billboard, Float, Html, Sky, Cloud, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface GameSceneProps {
  agents: any[];
  buildings: any[];
  resources: any[];
  interactions: any[];
  selectedAgentId: number | null;
  onAgentClick: (id: number) => void;
}

const GameScene = (props: GameSceneProps) => {
  return (
    <Canvas shadows className="w-full h-full">
      <Suspense fallback={null}>
        <SimulationScene {...props} />
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
  );
};

// The main simulation scene
function SimulationScene({ agents, buildings, resources, interactions, selectedAgentId, onAgentClick }: GameSceneProps) {
  const { camera } = useThree();
  
  // Set camera position for a wider view
  useFrame(() => {
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
  });

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
      
      {/* Add your 3D objects here */}
      
      <Environment preset="city" />
    </>
  );
}

export default GameScene; 