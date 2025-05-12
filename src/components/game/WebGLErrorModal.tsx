'use client';

import React, { useState, useEffect } from 'react';
import { setPreferredQuality } from '@/utils/webgl-helper';

interface WebGLErrorModalProps {
  onRetry: () => void;
  onClose: () => void;
}

const WebGLErrorModal: React.FC<WebGLErrorModalProps> = ({ onRetry, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<'minimal' | 'ultraMinimal'>('minimal');

  const handleRetry = () => {
    // Set the selected quality level
    setPreferredQuality(selectedQuality);
    
    // Store the reduced quality setting if ultra minimal
    if (selectedQuality === 'ultraMinimal') {
      localStorage.setItem('agentarium_reduced_quality', 'true');
    }
    
    // Close the modal
    setIsOpen(false);
    
    // Trigger retry callback
    onRetry();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-blue-500 rounded-lg shadow-xl max-w-md w-full p-6 text-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-2">3D Rendering Error</h2>
          <p className="text-gray-300 mb-4">
            We encountered an issue loading the 3D simulation. This could be due to WebGL support, 
            browser settings, or graphics drivers.
          </p>
        </div>

        <div className="mb-6">
          <p className="font-medium text-blue-300 mb-2">Try these solutions:</p>
          <ul className="list-disc pl-5 text-gray-300 space-y-2">
            <li>Select a lower quality mode below</li>
            <li>Update your graphics drivers</li>
            <li>Try a different browser (Chrome recommended)</li>
            <li>Disable hardware acceleration in browser settings</li>
          </ul>
        </div>

        <div className="mb-6">
          <p className="font-medium text-blue-300 mb-2">Select quality mode:</p>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="quality"
                checked={selectedQuality === 'minimal'}
                onChange={() => setSelectedQuality('minimal')}
                className="form-radio text-blue-500"
              />
              <span>Low Quality Mode - Basic 3D with minimal effects</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="quality"
                checked={selectedQuality === 'ultraMinimal'}
                onChange={() => setSelectedQuality('ultraMinimal')}
                className="form-radio text-blue-500"
              />
              <span>Compatibility Mode - Ultra simplified graphics</span>
            </label>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebGLErrorModal; 