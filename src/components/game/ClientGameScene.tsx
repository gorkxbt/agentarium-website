'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Environment } from '@react-three/drei';

// Simple placeholder component for the game scene
const ClientGameScene: React.FC<{ isRunning?: boolean; onAgentClick?: (agent: any) => void }> = ({ 
  isRunning = true,
  onAgentClick
}) => {
  return (
    <Canvas shadows className="w-full h-full">
      <Suspense fallback={null}>
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
        
        {/* Placeholder for the city */}
        <group>
          <mesh 
            position={[0, 0, 0]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            receiveShadow
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#1a2e3b" />
          </mesh>
          
          {/* Placeholder buildings */}
          {Array.from({ length: 20 }).map((_, i) => {
            const x = Math.random() * 40 - 20;
            const z = Math.random() * 40 - 20;
            const height = 1 + Math.random() * 5;
            
            return (
              <mesh 
                key={i} 
                position={[x, height/2, z]} 
                castShadow
                onClick={() => onAgentClick && onAgentClick({ 
                  id: i, 
                  type: 'Building', 
                  color: '#4CAF50',
                  icon: '🏢',
                  state: 'static',
                  resources: Math.floor(Math.random() * 100)
                })}
              >
                <boxGeometry args={[2, height, 2]} />
                <meshStandardMaterial color={`hsl(${Math.random() * 360}, 50%, 50%)`} />
              </mesh>
            );
          })}
          
          {/* Placeholder agents */}
          {Array.from({ length: 10 }).map((_, i) => {
            const x = Math.random() * 40 - 20;
            const z = Math.random() * 40 - 20;
            
            return (
              <mesh 
                key={`agent-${i}`} 
                position={[x, 1, z]} 
                castShadow
                onClick={() => onAgentClick && onAgentClick({ 
                  id: 1000 + i, 
                  type: 'Agent', 
                  color: '#2196F3',
                  icon: '🤖',
                  state: 'wandering',
                  resources: Math.floor(Math.random() * 50)
                })}
              >
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#2196F3" />
              </mesh>
            );
          })}
        </group>
        
        <Environment preset="city" />
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

export default ClientGameScene; 