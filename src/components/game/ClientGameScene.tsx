'use client';

import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Sky, 
  Environment, 
  Text,
  Float,
  Html,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { isWebGLAvailable, resetWebGLContext, createFallbackScene } from '@/utils/webgl-helper';
import { CITY_SIZE, BLOCK_SIZE, ROAD_WIDTH, AGENT_COUNT, NPC_COUNT, VEHICLE_COUNT } from './CityConstants';

// Define simple quality preset
const QUALITY_PRESET = {
  shadows: true,
  shadowMapSize: 1024,
  environment: true,
  pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1,
  maxAgents: Math.floor(AGENT_COUNT * 0.8),
  maxNPCs: Math.floor(NPC_COUNT * 0.6),
  maxVehicles: Math.floor(VEHICLE_COUNT * 0.7),
  showClouds: false,
  showSky: true,
  antialias: true,
  maxLights: 10,
  drawDistance: CITY_SIZE * 1.2,
};

// Add interface extension for Window type
declare global {
  interface Window {
    resetWebGL?: () => void;
  }
}

// Force initialization of WebGL context
if (typeof window !== 'undefined') {
  try {
    // Force hardware acceleration
    const style = document.createElement('style');
    style.textContent = `
      canvas { 
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `;
    document.head.appendChild(style);
    
    // Provide a reset function
    window.resetWebGL = () => {
      console.log("Manual WebGL reset triggered");
      resetWebGLContext();
      setTimeout(() => window.location.reload(), 500);
    };
  } catch (e) {
    console.warn('Failed pre-initialization of WebGL context', e);
  }
}

// Interface definitions
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
  onTimeChange?: (timeOfDay: string) => void;
  forceLoaded?: boolean;
}

// Main ClientGameScene component
const ClientGameScene: React.FC<ClientGameSceneProps> = ({ 
  onAgentClick, 
  onTimeChange,
  forceLoaded = false
}) => {
  // Track loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // Get a ref to the container to create fallback if needed
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle WebGL errors
  const handleWebGLError = useCallback(() => {
    setHasError(true);
    
    // If no WebGL is available, show fallback scene
    if (!isWebGLAvailable() && containerRef.current) {
      createFallbackScene(containerRef.current);
    }
  }, []);
  
  // Handle loading complete
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* Show loading screen while loading */}
      {isLoading && !hasError && !forceLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading City Simulation...</p>
          </div>
        </div>
      )}
      
      {/* Main scene with error boundary */}
      {!hasError && (
        <ErrorBoundary 
          fallback={
            <div className="w-full h-full bg-black flex items-center justify-center">
              <div className="text-center p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Rendering Error</h3>
                <p className="text-lg text-white/80 mb-6">Failed to load 3D scene</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-700 text-white rounded"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          }
          onError={handleWebGLError}
        >
          {/* Canvas with quality settings */}
          <Canvas
            shadows={QUALITY_PRESET.shadows}
            dpr={QUALITY_PRESET.pixelRatio}
            gl={{
              antialias: QUALITY_PRESET.antialias,
              alpha: false,
              stencil: false,
              depth: true,
              powerPreference: 'default',
            }}
            camera={{ position: [20, 20, 20], fov: 60 }}
            onCreated={({ gl }) => {
              // Set shadow map size based on quality
              if (QUALITY_PRESET.shadows) {
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
              }

              // Signal loading complete
              handleLoadingComplete();
            }}
          >
            <SceneContent 
              settings={QUALITY_PRESET}
              onAgentClick={onAgentClick}
              onTimeChange={onTimeChange}
            />
          </Canvas>
        </ErrorBoundary>
      )}
    </div>
  );
};

// Actual scene content component (used inside Canvas)
const SceneContent: React.FC<{
  settings: any,
  onAgentClick?: (agent: any) => void,
  onTimeChange?: (timeOfDay: string) => void
}> = ({ settings, onAgentClick, onTimeChange }) => {
  // Set up the scene 
  useEffect(() => {
    // This is run once when the component mounts
    console.log("Scene mounted");
    
    // Clean up when unmounting
    return () => {
      console.log("Scene unmounted");
    };
  }, []);
  
  return (
    <Suspense fallback={null}>
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={5}
        maxDistance={settings.drawDistance}
      />
      
      {/* Environment lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow={settings.shadows}
        position={[10, 20, 15]}
        intensity={0.8}
        shadow-mapSize-width={settings.shadowMapSize}
        shadow-mapSize-height={settings.shadowMapSize}
      />
      
      {/* Sky */}
      {settings.showSky && <Sky distance={450000} sunPosition={[1, 0.5, 0]} />}
      
      {/* Simple ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[CITY_SIZE * 2, CITY_SIZE * 2]} />
        <meshStandardMaterial color="#225533" />
      </mesh>
      
      {/* Very simple cube for testing */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[10, 10, 10]} />
        <meshStandardMaterial color="#4477aa" />
        <Html position={[0, 8, 0]}>
          <div className="bg-black bg-opacity-70 text-white p-2 rounded text-center">
            Test Object
          </div>
        </Html>
      </mesh>
      
      {/* Only add environment if enabled in settings */}
      {settings.environment && <Environment preset="city" />}
    </Suspense>
  );
};

export default ClientGameScene;