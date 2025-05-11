'use client';

/**
 * WebGL Helper Utilities
 * 
 * This file contains helper functions to detect WebGL availability and troubleshoot issues.
 */

/**
 * Utility functions for WebGL detection and performance optimization
 */

/**
 * Check if WebGL is available in the browser
 */
export const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const context = (
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
    
    return !!context;
  } catch (e) {
    console.error("Error checking WebGL support:", e);
    return false;
  }
};

/**
 * Detect if we're on a low-end device
 */
export const isLowEndDevice = (): boolean => {
  // Check if it's a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Check if it's a Safari browser (often has WebGL issues)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Check if it's a small screen
  const isSmallScreen = window.innerWidth < 768;
  
  // Consider low-end if mobile, Safari, or small screen
  return isMobile || (isSafari && isMobile) || isSmallScreen;
};

/**
 * Try to fix common WebGL black screen issues
 */
export const fixBlackScreen = (): void => {
  try {
    // Force hardware acceleration
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { powerPreference: 'high-performance' });
    
    if (gl) {
      // Force GPU to initialize
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    
    // Add a style to force GPU rendering
    const style = document.createElement('style');
    style.textContent = `
      canvas { 
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `;
    document.head.appendChild(style);
  } catch (e) {
    console.warn("Failed to apply black screen fix:", e);
  }
};

/**
 * Get the user's preference for rendering quality
 */
export const getPreferredQuality = (): 'high' | 'medium' | 'low' => {
  // Check for stored preference
  const storedPref = localStorage.getItem('agentarium_quality');
  if (storedPref && ['high', 'medium', 'low'].includes(storedPref)) {
    return storedPref as 'high' | 'medium' | 'low';
  }
  
  // Default to low for low-end devices
  if (isLowEndDevice()) {
    return 'low';
  }
  
  return 'high';
};

/**
 * Set the user's preference for rendering quality
 */
export const setPreferredQuality = (quality: 'high' | 'medium' | 'low'): void => {
  localStorage.setItem('agentarium_quality', quality);
};

/**
 * Reset WebGL context if it exists
 */
export const resetWebGLContext = (): void => {
  try {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      // Try to get the WebGL context and reset it, with proper type assertion
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
                 canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      
      if (gl) {
        // Force context loss
        const loseContextExt = gl.getExtension('WEBGL_lose_context');
        if (loseContextExt) {
          loseContextExt.loseContext();
        }
      }
    });
  } catch (e) {
    console.warn("Failed to reset WebGL context:", e);
  }
};

/**
 * Create a simple fallback scene for when WebGL fails
 */
export const createFallbackScene = (container: HTMLElement): void => {
  // Clean up any existing content
  container.innerHTML = '';
  
  // Create a styled container
  const fallbackContainer = document.createElement('div');
  fallbackContainer.className = 'w-full h-full bg-black flex items-center justify-center';
  fallbackContainer.innerHTML = `
    <div class="text-center p-6">
      <h3 class="text-2xl font-bold text-white mb-4">Agentarium City</h3>
      <p class="text-lg text-white/80 mb-6">3D simulation unavailable on your device</p>
      <div class="flex flex-wrap justify-center gap-4">
        <button id="refresh-btn" class="px-4 py-2 bg-green-700 text-white rounded">
          Refresh Page
        </button>
        <button id="simple-btn" class="px-4 py-2 bg-blue-700 text-white rounded">
          Try Simple Mode
        </button>
      </div>
    </div>
  `;
  
  container.appendChild(fallbackContainer);
  
  // Add event listeners to buttons
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
  
  document.getElementById('simple-btn')?.addEventListener('click', () => {
    localStorage.setItem('agentarium_reduced_quality', 'true');
    window.location.reload();
  });
};

/**
 * Gets WebGL information for debugging purposes
 * @returns {Object} WebGL information
 */
export function getWebGLInfo(): { 
  available: boolean; 
  renderer?: string; 
  vendor?: string; 
  version?: string;
  extensions?: string[];
  maxTextureSize?: number;
} {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      return { available: false };
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    let renderer = 'unknown';
    let vendor = 'unknown';
    
    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    }
    
    const version = gl.getParameter(gl.VERSION);
    const extensions = gl.getSupportedExtensions() || [];
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    
    return {
      available: true,
      renderer,
      vendor,
      version,
      extensions,
      maxTextureSize
    };
  } catch (e) {
    console.error('Error getting WebGL info:', e);
    return { available: false };
  }
} 