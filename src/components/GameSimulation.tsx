// GameSimulation.tsx - Enhanced 3D simulation component
import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Import the client component with no SSR
const ClientGameScene = dynamic(() => import('./game/ClientGameScene'), { ssr: false });

// Agent details panel component
function AgentDetailsPanel({ agent, onClose }: { agent: any | null, onClose: () => void }) {
  if (!agent) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-agent-black/90 backdrop-blur-lg rounded-lg border border-white/10 shadow-xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: `${agent.color}30`, color: agent.color }}
            >
              <span className="text-xl">{agent.icon}</span>
            </div>
            <div>
              <h3 className="text-white font-bold">Agent #{agent.id}</h3>
              <p className="text-white/70 text-sm">{agent.type}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-wider mb-1">Status</h4>
            <p className="text-white text-sm capitalize">{agent.state}</p>
          </div>
          
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-wider mb-1">Resources</h4>
            <div className="flex items-center">
              <div className="h-2 bg-agent-light-gray rounded-full w-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${Math.min(100, agent.resources / 10)}%`,
                    backgroundColor: agent.color 
                  }}
                ></div>
              </div>
              <span className="text-white ml-2 text-sm">{agent.resources}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Main component
const GameSimulation = ({ onAgentSelect }: { onAgentSelect?: (agentType: string) => void }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };
  
  const handleAgentClick = (agent: any) => {
    setSelectedAgent(agent);
    if (onAgentSelect && agent) {
      onAgentSelect(agent.type);
    }
  };
  
  const closeAgentDetails = () => {
    setSelectedAgent(null);
  };
  
  return (
    <div className="w-full h-[calc(100vh-6rem)] relative bg-agent-black">
      {/* Game controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={toggleSimulation}
          className={`px-3 py-1 rounded-md text-xs font-medium ${
            isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-agent-green hover:bg-agent-green-muted'
          } text-white transition-colors`}
        >
          {isRunning ? 'Pause' : 'Start'} Simulation
        </button>
        <button
          onClick={() => {
            // Reset simulation
          }}
          className="px-3 py-1 rounded-md text-xs font-medium bg-agent-blue hover:bg-agent-blue-dark text-white transition-colors"
        >
          Reset
        </button>
      </div>
      
      {/* Social links */}
      <div className="absolute top-4 left-4 z-10 flex space-x-4">
        <a 
          href="https://t.me/agentarium" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-agent-dark-gray hover:bg-agent-gray transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </a>
        <a 
          href="https://github.com/gorkxbt/agentarium-website" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-agent-dark-gray hover:bg-agent-gray transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
        <a 
          href="https://twitter.com/agentarium" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-agent-dark-gray hover:bg-agent-gray transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        </a>
      </div>
      
      {/* 3D Canvas */}
      <div className="w-full h-full">
        <ClientGameScene 
          isRunning={isRunning}
          onAgentClick={handleAgentClick}
        />
      </div>
      
      {/* Selected Agent Details Panel */}
      {selectedAgent && (
        <AgentDetailsPanel agent={selectedAgent} onClose={closeAgentDetails} />
      )}
    </div>
  );
};

export default GameSimulation;