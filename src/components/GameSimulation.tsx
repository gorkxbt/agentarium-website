'use client';

// GameSimulation.tsx - Enhanced 3D simulation component
import { useState, useEffect, Component, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import React from 'react';
import { isWebGLAvailable, fixBlackScreen, resetWebGLContext } from '@/utils/webgl-helper';

// Add interface for window.resetWebGL
declare global {
  interface Window {
    resetWebGL?: () => void;
  }
}

// Import the client component with no SSR and proper basic renderer
const ClientGameScene = dynamic(() => import('./game/ClientGameScene'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-agent-dark-gray flex items-center justify-center">
      <div className="text-white text-center p-8 bg-black/40 rounded-lg backdrop-blur-sm border border-white/10 max-w-md">
        <h3 className="text-2xl font-bold mb-4">Loading Agentarium City...</h3>
        <p className="mb-4">The 3D simulation is initializing...</p>
        <div className="mt-6 w-20 h-20 border-t-4 border-agent-green rounded-full animate-spin mx-auto"></div>
        <p className="text-xs mt-8 text-agent-green/80">This may take a moment on first load.</p>
        <div className="mt-6 flex justify-center space-x-4">
          <button 
            onClick={() => {
              localStorage.setItem('agentarium_reduced_quality', 'true');
              window.location.reload();
            }}
            className="px-4 py-2 bg-purple-600/90 text-white rounded-md hover:bg-purple-600"
          >
            Low Quality Mode
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-agent-green/20 text-agent-green border border-agent-green/30 rounded-md hover:bg-agent-green/30 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  )
});

// Guide component
function SimulationGuide({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-30 bg-agent-black/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="relative bg-agent-dark-gray/60 rounded-lg border border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Agentarium City Guide</h2>
          
          <div className="space-y-4 text-white/80">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Welcome to Agentarium City</h3>
              <p>
                This is a virtual city where AI agents autonomously live, work, and earn $AGENT tokens.
                These tokens are then distributed to users who have staked their own $AGENT in the agents.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">City Layout</h3>
              <p className="mb-2">
                The city is organized in a grid with various key locations:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="text-agent-green font-medium">$AGENT Bank</span> - Where agents store and manage their earnings</li>
                <li><span className="text-blue-400 font-medium">Police Station</span> - Maintains order in the city</li>
                <li><span className="text-green-400 font-medium">Supermarket</span> - Where resources are traded</li>
                <li><span className="text-amber-400 font-medium">Grand Hotel</span> - A place for agents to rest and socialize</li>
                <li><span className="text-red-400 font-medium">Gas Station</span> - For resource replenishment</li>
                <li><span className="text-gray-400 font-medium">Tech Hub & Finance Center</span> - Office buildings for specialized work</li>
                <li><span className="text-amber-700 font-medium">Residential Area</span> - Houses where some agents live</li>
                <li><span className="text-purple-400 font-medium">City Park</span> - Recreation area with seating and fountains</li>
                <li><span className="text-pink-500 font-medium">Shopping Mall</span> - Large retail center</li>
                <li><span className="text-cyan-500 font-medium">Transport Hub</span> - Central taxi and bus station</li>
                <li><span className="text-fuchsia-500 font-medium">Pulse Nightclub</span> - Entertainment venue for agents to socialize</li>
                <li><span className="text-orange-500 font-medium">Fine Dining Restaurant</span> - High-end eatery for agents</li>
                <li><span className="text-blue-500 font-medium">City Hospital</span> - Healthcare facility for agents</li>
                <li><span className="text-gray-500 font-medium">Factory</span> - Industrial manufacturing center</li>
                <li><span className="text-purple-700 font-medium">Lucky Star Casino</span> - Gaming and entertainment complex</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Agent Behavior</h3>
              <p className="mb-2">
                Agents autonomously navigate the city and transition between three states:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="text-green-500 font-medium">Walking</span> - Moving between locations</li>
                <li><span className="text-yellow-500 font-medium">Idle</span> - Temporarily resting or waiting</li>
                <li><span className="text-amber-400 font-medium">Working</span> - Actively earning $AGENT tokens</li>
              </ul>
              <p className="mt-2">
                Agents use roads for navigation and cannot walk through buildings. Their behavior is determined
                by their role, current state, and location in the city.
              </p>
              <p className="mt-2">
                Each agent role earns more $AGENT tokens at specific locations. For example, Traders 
                earn higher rewards at the Bank and Shopping Mall, while Mystics are most profitable at 
                the Casino and Nightclub. Engineers excel at the Factory and Tech Hub.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Earning $AGENT</h3>
              <p className="mb-2">
                The simulation features a sophisticated economic system where:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="text-white font-medium">Location bonuses</span> - Some buildings provide bonus earnings like the Casino and Nightclub</li>
                <li><span className="text-white font-medium">Role specialization</span> - Each agent role has locations where they earn 1.8-2.6x rewards</li>
                <li><span className="text-white font-medium">Working state</span> - Agents in "working" state earn significantly more than idle agents</li>
                <li><span className="text-white font-medium">Level progression</span> - Higher level agents can access better-paying opportunities</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">City Environment</h3>
              <p className="mb-2">
                The city is populated with:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="text-yellow-400 font-medium">Taxis</span> - Moving around the city roads</li>
                <li><span className="text-blue-500 font-medium">Cars</span> - Regular traffic on main streets</li>
                <li><span className="text-gray-400 font-medium">NPCs</span> - Non-player characters that add life to the city</li>
                <li><span className="text-green-400 font-medium">Trees & Plants</span> - Natural elements throughout the city</li>
                <li><span className="text-cyan-400 font-medium">Water Features</span> - Fountains and decorative elements</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Agent Roles</h3>
              <p className="mb-2">
                There are 10 unique agent roles in the simulation:
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                <div><span className="text-blue-400">👨‍💼 Trader</span> - Trading resources</div>
                <div><span className="text-purple-400">👩‍🔬 Scientist</span> - Research and development</div>
                <div><span className="text-orange-400">👷 Builder</span> - Construction specialist</div>
                <div><span className="text-green-400">🧭 Explorer</span> - Discovers resources</div>
                <div><span className="text-lime-400">👨‍🌾 Farmer</span> - Renewable resources</div>
                <div><span className="text-red-400">👩‍🔧 Engineer</span> - Improves efficiency</div>
                <div><span className="text-gray-400">👨‍💻 Hacker</span> - Digital opportunities</div>
                <div><span className="text-pink-400">🧝‍♀️ Diplomat</span> - Forms alliances</div>
                <div><span className="text-cyan-400">🏃 Courier</span> - Fast transport</div>
                <div><span className="text-indigo-400">🧙 Mystic</span> - Predicts trends</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Interaction</h3>
              <p>
                You can click on any agent to view detailed information about them, including their
                current status, earnings, and resources. The simulation runs continuously and is synchronized
                for all users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Agent details panel component
function AgentDetailsPanel({ agent, onClose }: { agent: any | null, onClose: () => void }) {
  if (!agent) return null;

  // Format currency with dollar sign
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('$', '');
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-agent-black/90 backdrop-blur-lg rounded-lg border border-white/10 shadow-xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
            >
              <span className="text-2xl">{agent.icon}</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{agent.name}</h3>
              <div className="flex items-center">
                <p className="text-white/70 text-sm">{agent.role}</p>
                <span className="text-agent-green ml-2 text-xs bg-agent-green/20 px-2 py-0.5 rounded-full">Lvl {agent.level}</span>
              </div>
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
        
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-agent-dark-gray/40 rounded-lg p-3">
              <h4 className="text-white/80 text-xs uppercase tracking-wider mb-1">Status</h4>
              <div className="flex items-center">
                <span 
                  className={`inline-block h-2 w-2 rounded-full mr-2 ${
                    agent.state === 'working' ? 'bg-agent-green' : 
                    agent.state === 'idle' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                ></span>
                <p className="text-white text-sm capitalize">{agent.state}</p>
              </div>
            </div>
            
            <div className="bg-agent-dark-gray/40 rounded-lg p-3">
              <h4 className="text-white/80 text-xs uppercase tracking-wider mb-1">Location</h4>
              <p className="text-white text-sm">{agent.location}</p>
            </div>
          </div>
          
          <div className="bg-agent-dark-gray/20 rounded-lg p-3">
            <h4 className="text-white/80 text-xs uppercase tracking-wider mb-2">Current Resources</h4>
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
          
          <div className="bg-agent-dark-gray/20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white/80 text-xs uppercase tracking-wider">Total Earnings</h4>
              <span className="text-agent-green font-mono font-bold">
                {formatCurrency(agent.earnings)} $AGENT
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs text-white/50">
              <span>Daily Rate</span>
              <span className="font-mono">+{formatCurrency(agent.earnings * 0.01)} $AGENT</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-wider mb-2">Agent Information</h4>
            <p className="text-white/70 text-sm">
              {agent.role === 'Trader' && "Specializes in trading resources at optimal prices. Has developed a network of contacts in the virtual marketplace."}
              {agent.role === 'Scientist' && "Focuses on research and development of new technologies. Can unlock unique resource processing methods."}
              {agent.role === 'Builder' && "Expert in construction and infrastructure development. Creates more efficient resource gathering stations."}
              {agent.role === 'Explorer' && "Specializes in discovering new resource nodes and territories. High chance of finding rare resources."}
              {agent.role === 'Farmer' && "Expert in cultivating and harvesting renewable resources. Creates sustainable resource production."}
              {agent.role === 'Engineer' && "Focuses on creating and improving tools and machines. Increases resource processing efficiency."}
              {agent.role === 'Hacker' && "Specializes in technology and data systems. Can find opportunities in the digital realm."}
              {agent.role === 'Diplomat' && "Expert in forging alliances with other agents. Can secure favorable trading deals and collaborations."}
              {agent.role === 'Courier' && "Specializes in rapid resource transportation. Increases the speed of resource transfers between locations."}
              {agent.role === 'Mystic' && "Has unusual abilities to predict market changes and resource fluctuations. Thrives during special events."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Error boundary to catch rendering errors
class ErrorBoundary extends Component<{children: React.ReactNode, fallback: React.ReactNode}> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error in 3D scene:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}

// Simple loading screen component
const LoadingScreen = () => {
  const [loadingTime, setLoadingTime] = useState(0);
  
  // Increment loading time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Force continue after a timeout
  useEffect(() => {
    if (loadingTime > 8 && typeof window !== 'undefined' && window.resetWebGL) {
      console.log("Loading screen timeout reached - attempting reset");
      window.resetWebGL();
    }
  }, [loadingTime]);
  
  // Show additional options if loading takes too long
  const showAdditionalOptions = loadingTime > 6;
  
  return (
    <div className="w-full h-full bg-agent-dark-gray flex items-center justify-center">
      <div className="text-white text-center p-8 bg-black/40 rounded-lg backdrop-blur-sm border border-white/10 max-w-md">
        <h3 className="text-2xl font-bold mb-4">Loading Agentarium City...</h3>
        <p className="mb-4">The 3D simulation is initializing...</p>
        <div className="mt-6 w-20 h-20 border-t-4 border-agent-green rounded-full animate-spin mx-auto"></div>
        
        {showAdditionalOptions ? (
          <>
            <div className="mt-6 w-full bg-gray-700/30 h-2 rounded-full">
              <div className="bg-agent-green h-full rounded-full" style={{ width: `${Math.min(100, loadingTime * 6)}%` }}></div>
            </div>
            <p className="text-xs mt-4 text-yellow-400/80">
              Loading is taking longer than usual. You can try these options:
            </p>
            <div className="mt-4 flex flex-col md:flex-row justify-center gap-3">
              <button 
                onClick={() => {
                  localStorage.setItem('agentarium_reduced_quality', 'true');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-purple-600/90 text-white rounded-md hover:bg-purple-600"
              >
                Low Quality Mode
              </button>
              <button 
                onClick={() => {
                  // Call resetWebGL function if available on window
                  if (typeof window !== 'undefined' && window.resetWebGL) {
                    window.resetWebGL();
                  } else {
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-agent-green/20 text-agent-green border border-agent-green/30 rounded-md hover:bg-agent-green/30 transition-colors"
              >
                Reset & Continue
              </button>
            </div>
          </>
        ) : (
          <p className="text-xs mt-8 text-agent-green/80">First load may take a moment...</p>
        )}
      </div>
    </div>
  );
};

// Main component
const GameSimulation = ({ onAgentSelect }: { onAgentSelect?: (agentType: string) => void }) => {
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [useReducedQuality, setUseReducedQuality] = useState(false);
  const [loadingRetries, setLoadingRetries] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  
  // Apply WebGL optimizations on mount
  useEffect(() => {
    // Check if reduced quality was selected previously
    const storedQualityPref = localStorage.getItem('agentarium_reduced_quality');
    if (storedQualityPref === 'true') {
      setUseReducedQuality(true);
    }
    
    // Ensure WebGL is properly initialized
    fixBlackScreen();
    
    // Force a hardware acceleration trigger
    if (sceneRef.current) {
      sceneRef.current.style.transform = 'translateZ(0)';
      
      // Ensure the container is sized properly
      sceneRef.current.style.width = '100%';
      sceneRef.current.style.height = '100%';
      sceneRef.current.style.minHeight = '600px';
    }
    
    // Add global error handler for WebGL issues
    const handleWebGLError = (event: ErrorEvent) => {
      if (event.message && (
        event.message.includes('WebGL') || 
        event.message.includes('GL_') || 
        event.message.includes('GPU process') ||
        event.message.includes('threejs') ||
        event.message.includes('context')
      )) {
        console.error("WebGL error detected:", event.message);
        
        // If we're already using reduced quality but still having issues, 
        // retry with a forced delay to give GPU time to initialize
        if (useReducedQuality) {
          setLoadingRetries(prev => prev + 1);
          resetWebGLContext();
        } else {
          // Try reduced quality if normal mode fails
          setUseReducedQuality(true);
          localStorage.setItem('agentarium_reduced_quality', 'true');
          resetWebGLContext();
        }
      }
    };
    
    window.addEventListener('error', handleWebGLError);
    
    // Set a backup timer to retry if loading seems stuck
    const loadingTimer = setTimeout(() => {
      setLoadingRetries(prev => prev + 1);
    }, 10000);
    
    return () => {
      window.removeEventListener('error', handleWebGLError);
      clearTimeout(loadingTimer);
    };
  }, [useReducedQuality]);
  
  // Reset WebGL if retries are needed
  useEffect(() => {
    if (loadingRetries > 0 && loadingRetries < 3) {
      resetWebGLContext();
      console.log(`Retry attempt ${loadingRetries} to initialize WebGL`);
    }
  }, [loadingRetries]);
  
  // Handle agent selection
  const handleAgentClick = (agent: any) => {
    setSelectedAgent(agent);
    
    if (onAgentSelect) {
      onAgentSelect(agent.role);
    }
  };
  
  // Close agent details panel
  const closeAgentDetails = () => {
    setSelectedAgent(null);
  };
  
  // Handle time changes
  const handleTimeChange = (time: string) => {
    setTimeOfDay(time);
    onAgentSelect && onAgentSelect(time);
  };
  
  // Handle page refresh
  const handlePageRefresh = () => {
    localStorage.removeItem('agentarium_reduced_quality');
    window.location.reload();
  };
  
  // Switch to reduced quality mode
  const handleReducedQuality = () => {
    localStorage.setItem('agentarium_reduced_quality', 'true');
    setUseReducedQuality(true);
    resetWebGLContext();
    window.location.reload();
  };

  return (
    <div 
      className="w-full relative overflow-hidden mx-auto my-8 bg-agent-black/95 rounded-xl shadow-xl border border-white/5" 
      style={{ 
        minHeight: '910px', 
        height: 'calc(100vh - 100px)',
        minWidth: '800px',
        maxWidth: '95%',
        maxHeight: '95vh',
        aspectRatio: '16 / 9' // More standard widescreen ratio
      }} 
      ref={sceneRef}
    >
      {/* Intro overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-20 bg-agent-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Welcome to Agentarium City
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-white/80 max-w-lg"
            >
              Explore the city where 10 AI agents live, work, and earn $AGENT autonomously.
              <span className="block mt-2 text-agent-green">Click on any agent to learn more about them.</span>
            </motion.p>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              onClick={() => setShowIntro(false)}
              className="mt-6 px-4 py-2 bg-agent-green/20 text-agent-green border border-agent-green/30 rounded-md hover:bg-agent-green/30 transition-colors"
            >
              Enter City Simulation
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Guide overlay */}
      <AnimatePresence>
        {showGuide && <SimulationGuide onClose={() => setShowGuide(false)} />}
      </AnimatePresence>
      
      {/* Game overlay UI elements */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
        <div className="px-3 py-1.5 bg-agent-black/60 backdrop-blur-sm rounded-lg border border-white/10 flex items-center">
          <span className="text-agent-green text-xs font-bold">AGENTARIUM CITY</span>
        </div>
        
        <button
          onClick={() => setShowGuide(true)}
          className="px-3 py-1.5 bg-agent-black/60 backdrop-blur-sm rounded-lg border border-white/10 flex items-center hover:bg-agent-dark-gray/60 transition-colors"
        >
          <span className="text-white/80 text-xs">Guide</span>
        </button>
      </div>
      
      {/* Social links */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <a 
          href="https://t.me/agentarium" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-8 h-8 rounded-full bg-agent-dark-gray/60 backdrop-blur-sm hover:bg-agent-gray transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </a>
        <a 
          href="https://github.com/gorkxbt/agentarium-website" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-8 h-8 rounded-full bg-agent-dark-gray/60 backdrop-blur-sm hover:bg-agent-gray transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
        <a 
          href="https://twitter.com/agentarium" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-8 h-8 rounded-full bg-agent-dark-gray/60 backdrop-blur-sm hover:bg-agent-gray transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        </a>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-16 left-4 z-10">
        <div className="px-3 py-2 bg-agent-black/60 backdrop-blur-sm rounded-lg border border-white/10">
          <h4 className="text-white/90 text-xs font-medium mb-1.5">Agent States</h4>
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              <p className="text-white/80 text-xs">Walking</p>
            </div>
            <div className="flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
              <p className="text-white/80 text-xs">Idle</p>
            </div>
            <div className="flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 mr-2"></span>
              <p className="text-white/80 text-xs">Working (Earning $AGENT)</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help text */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="px-3 py-2 bg-agent-black/60 backdrop-blur-sm rounded-lg border border-white/10">
          <p className="text-white/80 text-xs">Click on any agent to view details</p>
        </div>
      </div>
      
      {/* Time of day indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="px-3 py-2 bg-agent-black/60 backdrop-blur-sm rounded-lg border border-white/10 flex items-center space-x-2">
          {timeOfDay === 'day' && (
            <>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80 text-xs">Daytime</span>
            </>
          )}
          {timeOfDay === 'sunset' && (
            <>
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80 text-xs">Sunset</span>
            </>
          )}
          {timeOfDay === 'night' && (
            <>
              <svg className="w-4 h-4 text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <span className="text-white/80 text-xs">Night</span>
            </>
          )}
        </div>
      </div>
      
      {/* Controls for WebGL optimization */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
        
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex space-x-2"
            >
              <button
                onClick={() => setShowGuide(true)}
                className="px-3 py-2 bg-black/50 backdrop-blur-sm rounded-md text-white text-sm hover:bg-black/60 transition-colors"
              >
                Guide
              </button>
              
              <button
                onClick={handleReducedQuality}
                className="px-3 py-2 bg-purple-600/60 backdrop-blur-sm rounded-md text-white text-sm hover:bg-purple-600/70 transition-colors"
              >
                {useReducedQuality ? "Already Using Low Quality" : "Reduce Quality"}
              </button>
              
              <button
                onClick={handlePageRefresh}
                className="px-3 py-2 bg-blue-600/60 backdrop-blur-sm rounded-md text-white text-sm hover:bg-blue-600/70 transition-colors"
              >
                Refresh
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 3D Canvas */}
      <div 
        className="w-full h-full" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          borderRadius: '0.75rem',
          overflow: 'hidden'
        }}
      >
        <ErrorBoundary fallback={
          <div className="w-full h-full bg-agent-dark-gray flex items-center justify-center">
            <div className="text-white text-center p-8 max-w-md bg-black/40 rounded-lg backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-bold mb-4">3D Rendering Error</h3>
              <p className="mb-5">We encountered an issue loading the 3D simulation. This could be due to WebGL support, browser settings, or graphics drivers.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={handlePageRefresh}
                  className="px-4 py-2 bg-agent-green/90 text-black rounded-md hover:bg-agent-green transition-colors"
                >
                  Refresh Page
                </button>
                
                <button 
                  onClick={handleReducedQuality}
                  className="px-4 py-2 bg-purple-600/90 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  Reduce Graphics Quality
                </button>
              </div>
              <p className="text-white/60 text-sm mt-6">
                Tip: Try enabling hardware acceleration in your browser settings
              </p>
            </div>
          </div>
        }>
          <React.Suspense fallback={<LoadingScreen />}>
            <ClientGameScene 
              onAgentClick={handleAgentClick} 
              onTimeChange={handleTimeChange}
            />
          </React.Suspense>
        </ErrorBoundary>
      </div>
      
      {/* Selected Agent Details Panel */}
      <AnimatePresence>
        {selectedAgent && (
          <AgentDetailsPanel agent={selectedAgent} onClose={closeAgentDetails} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameSimulation;