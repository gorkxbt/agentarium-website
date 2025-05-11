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
    
    // Clean up any existing ThreeJS renderers
    if (typeof window !== 'undefined' && window.THREE_INSTANCES) {
      window.THREE_INSTANCES.forEach((renderer: any) => {
        try {
          if (renderer && renderer.dispose) {
            renderer.dispose();
          }
        } catch (e) {
          console.warn("Error disposing renderer:", e);
        }
      });
    }
    
    // Find all canvas elements
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      // Try to get all possible contexts and reset them
      ['webgl', 'experimental-webgl', 'webgl2'].forEach(contextType => {
        try {
          const gl = canvas.getContext(contextType) as WebGLRenderingContext | null;
          
          if (gl) {
            // Clear the context
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            // Try to use the context loss extension
            const loseContextExt = gl.getExtension('WEBGL_lose_context');
            if (loseContextExt) {
              loseContextExt.loseContext();
              
              // Optional: try to restore after a delay
              setTimeout(() => {
                try {
                  loseContextExt.restoreContext();
                } catch (e) {
                  console.warn("Could not restore context:", e);
                }
              }, 300);
            }
          }
        } catch (e) {
          console.warn(`Failed to reset ${contextType} context:`, e);
        }
      });
      
      // Replace the canvas with a fresh copy if needed
      try {
        const newCanvas = canvas.cloneNode(false) as HTMLCanvasElement;
        if (canvas.parentNode) {
          canvas.parentNode.replaceChild(newCanvas, canvas);
        }
      } catch (e) {
        console.warn("Failed to replace canvas:", e);
      }
    });
    
    // Force garbage collection if available (only in some browsers)
    if (typeof window !== 'undefined' && window.gc) {
      try {
        window.gc();
      } catch (e) {}
    }
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