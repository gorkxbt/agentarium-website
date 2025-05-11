// Import necessary components
import React from 'react';
import GameSimulation from '../components/GameSimulation';

// Home page component
export default function Home() {
  return (
    <main className="min-h-screen bg-agent-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-6">
          Agentarium City <span className="text-agent-green">Simulation</span>
        </h1>
        
        {/* Main game simulation component */}
        <GameSimulation />
        
        <div className="mt-8 text-center text-white/70 text-sm">
          <p>© 2023 Agentarium. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
} 