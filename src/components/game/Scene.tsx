// Scene.tsx - Exports all Three.js components for client-side rendering
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  useTexture, 
  Text, 
  Environment, 
  Billboard, 
  Float, 
  Html, 
  Sky, 
  Cloud, 
  Stars, 
  useGLTF 
} from '@react-three/drei';
import * as THREE from 'three';

// Re-export everything
export {
  Canvas,
  useFrame,
  useThree,
  OrbitControls,
  useTexture,
  Text,
  Environment,
  Billboard,
  Float,
  Html,
  Sky,
  Cloud,
  Stars,
  useGLTF,
  THREE
};

// Default export for dynamic import
export default {
  Canvas,
  useFrame,
  useThree,
  OrbitControls,
  useTexture,
  Text,
  Environment,
  Billboard,
  Float,
  Html,
  Sky,
  Cloud,
  Stars,
  useGLTF,
  THREE
}; 