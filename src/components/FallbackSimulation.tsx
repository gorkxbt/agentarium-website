import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define types for our mock agents
interface Agent {
  id: number;
  name: string;
  role: string;
  icon: string;
  color: string;
  state: 'idle' | 'working' | 'walking';
  location: string;
  earnings: number;
}

// Define props
interface FallbackSimulationProps {
  onAgentSelect?: (agentType: string) => void;
}

// Static agent data
const AGENTS: Agent[] = [
  { id: 1, name: "Alex", role: "Trader", icon: "👨‍💼", color: "#2196F3", state: "working", location: "Bank", earnings: 1245 },
  { id: 2, name: "Nova", role: "Scientist", icon: "👩‍🔬", color: "#9C27B0", state: "working", location: "Tech Hub", earnings: 1870 },
  { id: 3, name: "Orion", role: "Builder", icon: "👷", color: "#FF9800", state: "walking", location: "Downtown", earnings: 1560 },
  { id: 4, name: "Luna", role: "Explorer", icon: "🧭", color: "#4CAF50", state: "idle", location: "Supermarket", earnings: 1320 },
  { id: 5, name: "Max", role: "Farmer", icon: "👨‍🌾", color: "#8BC34A", state: "working", location: "House 3", earnings: 1480 },
  { id: 6, name: "Zara", role: "Engineer", icon: "👩‍🔧", color: "#FF5722", state: "walking", location: "On the Road", earnings: 1690 },
  { id: 7, name: "Neo", role: "Hacker", icon: "👨‍💻", color: "#607D8B", state: "working", location: "Finance Center", earnings: 1920 },
  { id: 8, name: "Astra", role: "Diplomat", icon: "🧝‍♀️", color: "#E91E63", state: "idle", location: "Hotel", earnings: 1530 },
  { id: 9, name: "Bolt", role: "Courier", icon: "🏃", color: "#00BCD4", state: "walking", location: "Gas Station", earnings: 1380 },
  { id: 10, name: "Echo", role: "Mystic", icon: "🧙", color: "#9575CD", state: "working", location: "Lucky Star Casino", earnings: 2100 }
];

// Location data for our grid
const LOCATIONS = [
  { name: "Bank", emoji: "🏦", color: "#1db954" },
  { name: "Tech Hub", emoji: "💻", color: "#1db954" },
  { name: "Shopping Mall", emoji: "🛍️", color: "#1db954" },
  { name: "Hotel", emoji: "🏨", color: "#1db954" },
  { name: "Police Station", emoji: "🚓", color: "#1db954" },
  { name: "City Hospital", emoji: "🏥", color: "#1db954" },
  { name: "Gas Station", emoji: "⛽", color: "#1db954" },
  { name: "Factory", emoji: "🏭", color: "#1db954" },
  { name: "Nightclub", emoji: "🪩", color: "#1db954" },
  { name: "Casino", emoji: "🎰", color: "#1db954" },
  { name: "Restaurant", emoji: "🍽️", color: "#1db954" },
  { name: "Park", emoji: "🌳", color: "#1db954" }
];

/**
 * A 2D fallback for the 3D city simulation that works without WebGL
 */
const FallbackSimulation: React.FC<FallbackSimulationProps> = ({ onAgentSelect }) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentStates, setAgentStates] = useState<Agent[]>(AGENTS);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  
  // Simulate day/night cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(current => {
        if (current === 'day') return 'sunset';
        if (current === 'sunset') return 'night';
        return 'day';
      });
    }, 30000); // 30 seconds per time period
    
    return () => clearInterval(interval);
  }, []);
  
  // Simulate agent movement and state changes
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentStates(prevAgents => 
        prevAgents.map(agent => {
          // Randomly change state
          const rand = Math.random();
          let newState = agent.state;
          let newLocation = agent.location;
          
          if (rand < 0.3) {
            newState = 'idle';
          } else if (rand < 0.6) {
            newState = 'walking';
            // Maybe change location when walking
            if (Math.random() < 0.5) {
              const newLocIndex = Math.floor(Math.random() * LOCATIONS.length);
              newLocation = LOCATIONS[newLocIndex].name;
            }
          } else {
            newState = 'working';
          }
          
          return {
            ...agent,
            state: newState as 'idle' | 'walking' | 'working',
            location: newLocation,
            // Increase earnings if working
            earnings: agent.earnings + (newState === 'working' ? Math.floor(Math.random() * 20) : 0)
          };
        })
      );
    }, 5000); // 5 seconds intervals
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle agent click
  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    if (onAgentSelect) {
      onAgentSelect(agent.role);
    }
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('$', '');
  };
  
  // Helper to get background color for time of day
  const getBackgroundColor = () => {
    switch (timeOfDay) {
      case 'day': return 'bg-gradient-to-b from-blue-400 to-blue-600';
      case 'sunset': return 'bg-gradient-to-b from-orange-400 to-purple-600';
      case 'night': return 'bg-gradient-to-b from-blue-900 to-black';
      default: return 'bg-gradient-to-b from-blue-400 to-blue-600';
    }
  };
  
  return (
    <div className={`w-full h-full ${getBackgroundColor()} rounded-xl overflow-hidden p-4`}>
      {/* Time indicator */}
      <div className="bg-black/30 text-white text-sm px-3 py-1 rounded-full inline-flex items-center mb-4">
        <span className="mr-2">
          {timeOfDay === 'day' ? '☀️' : timeOfDay === 'sunset' ? '🌅' : '🌙'}
        </span>
        <span className="capitalize">{timeOfDay}</span>
      </div>
      
      {/* City grid */}
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 mb-4">
        <h3 className="text-white font-bold mb-3">Agentarium City</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {LOCATIONS.map((location, index) => (
            <div 
              key={location.name} 
              className="bg-black/30 rounded-lg p-3 text-center hover:bg-black/40 transition-colors"
            >
              <div className="text-2xl mb-1">{location.emoji}</div>
              <div className="text-white text-xs">{location.name}</div>
              
              {/* Show agents at this location */}
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {agentStates.filter(a => a.location === location.name).map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentClick(agent)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: `${agent.color}30` }}
                  >
                    {agent.icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Active agents */}
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-white font-bold mb-3">Active Agents</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {agentStates.map(agent => (
            <button
              key={agent.id}
              onClick={() => handleAgentClick(agent)}
              className={`p-3 rounded-lg flex flex-col items-center transition-all ${
                selectedAgent?.id === agent.id ? 'bg-black/50 ring-1 ring-white/20' : 'bg-black/30 hover:bg-black/40'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2"
                style={{ backgroundColor: `${agent.color}20` }}
              >
                {agent.icon}
              </div>
              <div className="text-white text-xs font-medium">{agent.name}</div>
              <div className="text-white/60 text-xs">{agent.role}</div>
              <div className="mt-1 flex items-center">
                <span 
                  className={`inline-block h-2 w-2 rounded-full mr-1 ${
                    agent.state === 'working' ? 'bg-green-500' : 
                    agent.state === 'idle' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                ></span>
                <span className="text-white/70 text-[10px] capitalize">{agent.state}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Selected agent details */}
      {selectedAgent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-white/10"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: `${selectedAgent.color}20`, color: selectedAgent.color }}
              >
                <span className="text-xl">{selectedAgent.icon}</span>
              </div>
              <div>
                <h3 className="text-white font-bold">{selectedAgent.name}</h3>
                <div className="text-white/70 text-xs">{selectedAgent.role}</div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedAgent(null)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-white/50 text-xs mb-1">Status</div>
              <div className="flex items-center">
                <span 
                  className={`inline-block h-2 w-2 rounded-full mr-2 ${
                    selectedAgent.state === 'working' ? 'bg-green-500' : 
                    selectedAgent.state === 'idle' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                ></span>
                <p className="text-white text-sm capitalize">{selectedAgent.state}</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-white/50 text-xs mb-1">Location</div>
              <p className="text-white text-sm">{selectedAgent.location}</p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="text-white/50 text-xs">Earnings</div>
              <div className="text-green-400 font-mono font-bold">
                {formatCurrency(selectedAgent.earnings)} $AGENT
              </div>
            </div>
          </div>
          
          <div className="text-center text-white/50 text-xs">
            <span className="text-agent-green">Note:</span> This is a simplified 2D fallback of the simulation.
          </div>
        </motion.div>
      )}
      
      <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm text-white/50 text-xs px-3 py-1 rounded-full">
        2D Fallback Mode
      </div>
    </div>
  );
};

export default FallbackSimulation; 