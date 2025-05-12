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
import { isWebGLAvailable, resetWebGLContext } from '@/utils/webgl-helper';
import { CITY_SIZE, BLOCK_SIZE, ROAD_WIDTH, AGENT_COUNT, NPC_COUNT, VEHICLE_COUNT } from './CityConstants';
import { getRoadPoints, getParkingSpots, isOnRoad, findNearestRoadPoint, isInsideBlock } from './VehicleLogic';

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
  }
};

// Helper to get quality settings with fallback to high
const getQualitySettings = (qualityLevel?: 'high' | 'medium' | 'low' | 'minimal') => {
  return QUALITY_PRESETS[qualityLevel || 'high'];
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
  qualityLevel?: 'high' | 'medium' | 'low' | 'minimal';
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