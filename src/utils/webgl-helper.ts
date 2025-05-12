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
  
  // Check for battery API if available
  let isBatteryLow = false;
  if (navigator.userAgent.toLowerCase().indexOf("mobile") !== -1 && 'getBattery' in navigator) {
    const batteryManager = (navigator as any).getBattery();
    if (batteryManager && batteryManager.level < 0.2) {
      isBatteryLow = true;
    }
  }
  
  // Check for memory constraints
  let isMemoryLimited = false;
  if ('deviceMemory' in navigator) {
    isMemoryLimited = (navigator as any).deviceMemory < 4;
  }
  
  // Consider low-end if mobile, Safari, or small screen
  return isMobile || (isSafari && isMobile) || isSmallScreen || isBatteryLow || isMemoryLimited;
};

/**
 * Auto-detect the best quality level for the device
 */
export const detectBestQualityLevel = (): 'high' | 'medium' | 'low' | 'minimal' | 'ultraMinimal' => {
  // Check if WebGL is available at all
  if (!isWebGLAvailable()) {
    return 'ultraMinimal';
  }
  
  try {
    // Get WebGL info
    const webGLInfo = getWebGLInfo();
    
    // If WebGL is not available, force ultra minimal
    if (!webGLInfo.available) {
      return 'ultraMinimal';
    }
    
    // Check for mobile or embedded GPUs
    const isMobileGPU = webGLInfo.renderer?.toLowerCase().includes('mobile') || 
                        webGLInfo.renderer?.toLowerCase().includes('intel') ||
                        webGLInfo.renderer?.toLowerCase().includes('mesa') ||
                        webGLInfo.renderer?.toLowerCase().includes('swiftshader');
    
    // Check max texture size (good indicator of GPU capability)
    // Use a safe default of 0 if the property doesn't exist
    const maxTexSize = typeof webGLInfo.maxTextureSize === 'number' ? webGLInfo.maxTextureSize : 0;
    const hasWeakGPU = maxTexSize < 8192;
    
    // Check hardware limitations
    if (isLowEndDevice()) {
      if (hasWeakGPU || isMobileGPU) {
        return 'ultraMinimal';
      }
      return 'minimal';
    }
    
    // Check renderer string for powerful GPUs
    const hasPowerfulGPU = webGLInfo.renderer?.toLowerCase().includes('nvidia') || 
                          webGLInfo.renderer?.toLowerCase().includes('amd') ||
                          webGLInfo.renderer?.toLowerCase().includes('radeon');
    
    if (hasPowerfulGPU && !hasWeakGPU) {
      return 'high';
    }
    
    // Default to medium for most devices
    return 'medium';
  } catch (e) {
    console.warn('Error detecting quality level:', e);
    return 'minimal'; // Safe fallback
  }
};

/**
 * Try to fix common WebGL black screen issues
 */
export const fixBlackScreen = (): void => {
  try {
    // Force hardware acceleration
    const canvas = document.createElement('canvas');
    
    // Try with default WebGL using type assertion
    let gl = null;
    try {
      gl = canvas.getContext('webgl', { powerPreference: 'high-performance' }) as WebGLRenderingContext | null;
    } catch (e) {}
    
    // If failed, try with WebGL2
    if (!gl) {
      try {
        gl = canvas.getContext('webgl2', { powerPreference: 'high-performance' }) as WebGL2RenderingContext | null;
      } catch (e) {}
    }
    
    // If still failed, try with experimental WebGL
    if (!gl) {
      try {
        gl = canvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: false }) as WebGLRenderingContext | null;
      } catch (e) {}
    }
    
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
export const getPreferredQuality = (): 'high' | 'medium' => {
  return 'medium';
};

/**
 * Set the user's preference for rendering quality
 */
export const setPreferredQuality = (quality: string): void => {
  // This function is simplified
};

// Extend the Window interface with properties we might access
declare global {
  interface Window {
    resetWebGL?: () => void;
    gc?: () => void;
    THREE_INSTANCES?: any[];
  }
}

/**
 * Reset WebGL context if it exists
 */
export const resetWebGLContext = (): void => {
  try {
    console.log("Attempting to reset WebGL context");
    
    // Find all canvas elements
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      try {
        // Get the WebGL context
        const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
        
        if (gl) {
          // Clear the context
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          
          // Try to use the context loss extension
          const loseContextExt = gl.getExtension('WEBGL_lose_context');
          if (loseContextExt) {
            loseContextExt.loseContext();
            setTimeout(() => {
              try {
                loseContextExt.restoreContext();
              } catch (e) {}
            }, 300);
          }
        }
      } catch (e) {}
    });
    
    // Force a repaint
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'));
      }
    }, 100);
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
      <h3 class="text-2xl font-bold text-white mb-4">3D Rendering Error</h3>
      <p class="text-lg text-white/80 mb-6">We encountered an issue loading the 3D simulation.</p>
      <div class="flex flex-wrap justify-center gap-4">
        <button id="refresh-btn" class="px-4 py-2 bg-green-700 text-white rounded">
          Refresh Page
        </button>
      </div>
    </div>
  `;
  
  container.appendChild(fallbackContainer);
  
  // Add event listeners to buttons
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
};

/**
 * Initialize WebGL with optimizations for slow hardware
 * This function should be called early in the application lifecycle
 */
export const initializeWebGL = (): void => {
  if (typeof window === 'undefined') return;
  
  // Add GPU acceleration hints
  const style = document.createElement('style');
  style.textContent = `
    canvas { 
      transform: translateZ(0);
      backface-visibility: hidden;
      perspective: 1000px;
    }
  `;
  document.head.appendChild(style);
  
  // Force WebGL context creation
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const gl = canvas.getContext('webgl', { 
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'default',
    alpha: false,
    stencil: false,
    antialias: false,
    depth: true
  });
  
  if (gl) {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
};

// Call initialization immediately
if (typeof window !== 'undefined') {
  setTimeout(initializeWebGL, 0);
}

/**
 * Gets WebGL information for debugging purposes
 * @returns {Object} WebGL information
 */
export function getWebGLInfo(): { 
  available: boolean; 
  renderer?: string; 
  vendor?: string;
  maxTextureSize?: number;
} {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      return { available: false };
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    let renderer = 'unknown';
    let vendor = 'unknown';
    let maxTextureSize = 0;
    
    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    }
    
    // Get max texture size safely
    try {
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    } catch (e) {
      console.warn("Failed to get MAX_TEXTURE_SIZE:", e);
      maxTextureSize = 0;
    }
    
    return {
      available: true,
      renderer,
      vendor,
      maxTextureSize
    };
  } catch (e) {
    console.error("Error getting WebGL info:", e);
    return { available: false };
  }
} 