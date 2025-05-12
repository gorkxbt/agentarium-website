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
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { isWebGLAvailable, resetWebGLContext, createFallbackScene, getPreferredQuality } from '@/utils/webgl-helper';
import { CITY_SIZE, BLOCK_SIZE, ROAD_WIDTH, AGENT_COUNT, NPC_COUNT, VEHICLE_COUNT } from './CityConstants';
import { getRoadPoints, getParkingSpots, isOnRoad, findNearestRoadPoint, isInsideBlock } from './VehicleLogic';
import WebGLErrorModal from './WebGLErrorModal';

// Define quality presets for different performance levels
const QUALITY_PRESETS = {
  high: {
    shadows: true,
    shadowMapSize: 2048,
    environment: true,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    maxAgents: AGENT_COUNT,
    maxNPCs: NPC_COUNT,
    maxVehicles: VEHICLE_COUNT,
    showClouds: true,
    showSky: true,
    anisotropy: 16,
    antialias: true,
    maxLights: 20,
    particleCount: 200,
    reflections: true,
    drawDistance: CITY_SIZE * 1.5,
  },
  medium: {
    shadows: true,
    shadowMapSize: 1024,
    environment: true,
    pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1,
    maxAgents: Math.floor(AGENT_COUNT * 0.8),
    maxNPCs: Math.floor(NPC_COUNT * 0.6),
    maxVehicles: Math.floor(VEHICLE_COUNT * 0.7),
    showClouds: true,
    showSky: true,
    anisotropy: 8,
    antialias: true,
    maxLights: 12,
    particleCount: 100,
    reflections: false,
    drawDistance: CITY_SIZE * 1.2,
  },
  low: {
    shadows: false,
    shadowMapSize: 512,
    environment: false,
    pixelRatio: 1,
    maxAgents: Math.floor(AGENT_COUNT * 0.5),
    maxNPCs: Math.floor(NPC_COUNT * 0.3),
    maxVehicles: Math.floor(VEHICLE_COUNT * 0.4),
    showClouds: false,
    showSky: true,
    anisotropy: 4,
    antialias: false,
    maxLights: 6,
    particleCount: 30,
    reflections: false,
    drawDistance: CITY_SIZE * 1,
  },
  minimal: {
    shadows: false,
    shadowMapSize: 256,
    environment: false,
    pixelRatio: 0.7,
    maxAgents: Math.floor(AGENT_COUNT * 0.3),
    maxNPCs: Math.floor(NPC_COUNT * 0.1),
    maxVehicles: Math.floor(VEHICLE_COUNT * 0.2),
    showClouds: false,
    showSky: false,
    anisotropy: 1,
    antialias: false,
    maxLights: 3,
    particleCount: 0,
    reflections: false,
    drawDistance: CITY_SIZE * 0.8,
  },
  ultraMinimal: {
    shadows: false,
    shadowMapSize: 128,
    environment: false,
    pixelRatio: 0.5,
    maxAgents: Math.floor(AGENT_COUNT * 0.2),
    maxNPCs: 0,
    maxVehicles: 0,
    showClouds: false,
    showSky: false,
    anisotropy: 1,
    antialias: false,
    maxLights: 2,
    particleCount: 0,
    reflections: false,
    drawDistance: CITY_SIZE * 0.5,
  }
};

// Helper to get quality settings with fallback to high
const getQualitySettings = (qualityLevel?: 'high' | 'medium' | 'low' | 'minimal' | 'ultraMinimal') => {
  // Check for local storage setting for reduced quality
  if (typeof window !== 'undefined') {
    const reducedQuality = localStorage.getItem('agentarium_reduced_quality');
    if (reducedQuality === 'true') {
      return QUALITY_PRESETS['ultraMinimal'];
    }
  }
  
  return QUALITY_PRESETS[qualityLevel || 'medium'];
};

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
    // Add a GPU acceleration hint
    const accelerationStyle = document.createElement('style');
    accelerationStyle.textContent = `
      canvas { 
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `;
    document.head.appendChild(accelerationStyle);
    
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
    preInitCanvas.width = 256;  // Reduced from 512
    preInitCanvas.height = 192; // Reduced from 384
    
    // Try multiple context options
    let preInitContext = preInitCanvas.getContext('webgl', { 
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      alpha: false,
      antialias: false,
      depth: true,
      stencil: false, // Disable stencil buffer for performance
      preserveDrawingBuffer: false
    }) as WebGLRenderingContext | null;
    
    // If that failed, try another approach
    if (!preInitContext) {
      preInitContext = preInitCanvas.getContext('webgl', { 
        powerPreference: 'low-power',
        depth: true,
        antialias: false
      }) as WebGLRenderingContext | null;
    }
    
    // If still failing, try with WebGL2
    if (!preInitContext) {
      preInitContext = preInitCanvas.getContext('webgl2', {
        powerPreference: 'low-power',
        depth: true,
        antialias: false
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
      
      // Set to ultraMinimal mode
      localStorage.setItem('agentarium_reduced_quality', 'true');
      
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
      
      // Force reload after 300ms
      setTimeout(() => window.location.reload(), 300);
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
  qualityLevel?: 'high' | 'medium' | 'low' | 'minimal' | 'ultraMinimal';
}

// Additional constants
const SIDEWALK_WIDTH = 4; // Wider sidewalks

// Building types
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
} as const;

// Building colors with improved aesthetics
const BUILDING_COLORS: Record<string, string> = {
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
};

// Main ClientGameScene component
const ClientGameScene: React.FC<ClientGameSceneProps> = ({ 
  onAgentClick, 
  onTimeChange,
  forceLoaded = false,
  qualityLevel
}) => {
  // Track loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showWebGLErrorModal, setShowWebGLErrorModal] = useState(false);
  // Get a ref to the container to create fallback if needed
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle WebGL errors
  const handleWebGLError = useCallback(() => {
    setHasError(true);
    setShowWebGLErrorModal(true);
    
    // If no WebGL is available, show fallback scene
    if (!isWebGLAvailable() && containerRef.current) {
      createFallbackScene(containerRef.current);
    }
  }, []);
  
  // Reset WebGL context and retry loading
  const handleRetry = useCallback(() => {
    resetWebGLContext();
    // Use a short delay to allow context to reset
    setTimeout(() => {
      setHasError(false);
      setIsLoading(true);
      setShowWebGLErrorModal(false);
    }, 100);
  }, []);
  
  // Handle loading progress
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  // Use the quality settings from the user preference or props
  const actualQualityLevel = qualityLevel || getPreferredQuality();
  const settings = getQualitySettings(actualQualityLevel);

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
      
      {/* WebGL Error Modal */}
      {showWebGLErrorModal && (
        <WebGLErrorModal 
          onRetry={handleRetry}
          onClose={() => {
            setShowWebGLErrorModal(false);
            if (containerRef.current) {
              createFallbackScene(containerRef.current);
            }
          }}
        />
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
                  onClick={() => setShowWebGLErrorModal(true)}
                  className="px-4 py-2 bg-blue-700 text-white rounded"
                >
                  Try Low Quality Mode
                </button>
              </div>
            </div>
          }
          onError={handleWebGLError}
        >
          {/* Canvas with quality settings */}
          <Canvas
            shadows={settings.shadows}
            dpr={settings.pixelRatio}
            gl={{
              antialias: settings.antialias,
              alpha: false,
              stencil: false,
              depth: true,
              powerPreference: 'default',
            }}
            camera={{ position: [20, 20, 20], fov: 60 }}
            onCreated={({ gl }) => {
              // Register the renderer instance for cleanup later
              if (typeof window !== 'undefined') {
                window.THREE_INSTANCES = window.THREE_INSTANCES || [];
                window.THREE_INSTANCES.push(gl);
              }
              
              // Set shadow map size based on quality
              if (settings.shadows) {
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
              }

              // Signal loading complete
              handleLoadingComplete();
            }}
          >
            <SceneContent 
              settings={settings}
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
  // ... existing code for scene content ...
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
      
      {/* Sky and environment */}
      {settings.showSky && <Sky distance={450000} sunPosition={[1, 0.5, 0]} />}
      {settings.showClouds && (
        <>
          <Cloud position={[-40, 20, -10]} speed={0.2} opacity={0.8} />
          <Cloud position={[40, 25, 20]} speed={0.1} opacity={0.6} />
        </>
      )}
      
      {/* Only add environment if enabled in settings */}
      {settings.environment && <Environment preset="city" />}
      
      {/* City content would go here */}
    </Suspense>
  );
};

export default ClientGameScene;