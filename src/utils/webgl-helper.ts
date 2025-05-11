'use client';

/**
 * WebGL Helper Utilities
 * 
 * This file contains helper functions to detect WebGL availability and troubleshoot issues.
 */

/**
 * Checks if WebGL is available in the current browser
 * @returns {boolean} Whether WebGL is available
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

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

/**
 * Forces a WebGL context reset which may help with black screen issues
 */
export function resetWebGLContext(): void {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (gl) {
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
        console.log('WebGL context reset requested');
      }
    }
  } catch (e) {
    console.error('Error resetting WebGL context:', e);
  }
}

/**
 * Fixes common WebGL black screen issues
 * @returns {boolean} Whether the fix was attempted
 */
export function fixBlackScreen(): boolean {
  try {
    // Force a repaint of the document
    document.body.style.display = 'none';
    setTimeout(() => {
      document.body.style.display = '';
      
      // Try to reset hardware acceleration
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      if (gl && typeof gl.getExtension === 'function') {
        resetWebGLContext();
      }
    }, 50);
    
    return true;
  } catch (e) {
    console.error('Error attempting to fix black screen:', e);
    return false;
  }
} 