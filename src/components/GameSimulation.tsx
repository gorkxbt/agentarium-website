import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Agent types with their respective roles and colors
const AGENT_TYPES = [
  { 
    type: 'Entrepreneur', 
    color: '#FF9800', 
    icon: '👨‍💼',
    traits: ['Ambitious', 'Risk-taker', 'Strategic'],
    description: 'Focused on identifying market opportunities and maximizing profit',
    competencies: ['Business Planning', 'Resource Allocation', 'Market Analysis']
  },
  { 
    type: 'Scientist', 
    color: '#2196F3', 
    icon: '👩‍🔬',
    traits: ['Analytical', 'Curious', 'Detail-oriented'],
    description: 'Researches new technologies that unlock efficiency improvements',
    competencies: ['Research', 'Data Analysis', 'Innovation']
  },
  { 
    type: 'Craftsman', 
    color: '#F44336', 
    icon: '🛠️',
    traits: ['Precise', 'Patient', 'Resourceful'],
    description: 'Specialized in creating high-value items from raw materials',
    competencies: ['Manufacturing', 'Quality Control', 'Resource Optimization']
  },
  { 
    type: 'Trader', 
    color: '#4CAF50', 
    icon: '💱',
    traits: ['Persuasive', 'Quick-thinking', 'Adaptive'],
    description: 'Profits from market inefficiencies and arbitrage opportunities',
    competencies: ['Negotiation', 'Market Timing', 'Value Assessment']
  },
  { 
    type: 'Explorer', 
    color: '#9C27B0', 
    icon: '🔍',
    traits: ['Adventurous', 'Independent', 'Observant'],
    description: 'Discovers new resources and opportunities in unexplored areas',
    competencies: ['Resource Discovery', 'Path Finding', 'Risk Assessment']
  },
  { 
    type: 'Networker', 
    color: '#3F51B5', 
    icon: '🌐',
    traits: ['Charismatic', 'Empathetic', 'Sociable'],
    description: 'Excels at forming alliances and coordinating group activities',
    competencies: ['Relationship Building', 'Communication', 'Conflict Resolution']
  },
  { 
    type: 'Innovator', 
    color: '#00BCD4', 
    icon: '💡',
    traits: ['Creative', 'Visionary', 'Problem-solver'],
    description: 'Creates novel solutions to problems in unexpected ways',
    competencies: ['Idea Generation', 'Adaptation', 'Technology Integration']
  },
  { 
    type: 'Guardian', 
    color: '#795548', 
    icon: '🛡️',
    traits: ['Reliable', 'Vigilant', 'Principled'],
    description: 'Protects shared resources and maintains system balance',
    competencies: ['Security Management', 'Resource Preservation', 'System Monitoring']
  },
  { 
    type: 'Resource Gatherer', 
    color: '#607D8B', 
    icon: '⚒️',
    traits: ['Determined', 'Methodical', 'Efficient'],
    description: 'Specializes in collecting raw materials efficiently',
    competencies: ['Resource Extraction', 'Terrain Navigation', 'Tool Optimization']
  },
  { 
    type: 'Diplomat', 
    color: '#9E9E9E', 
    icon: '🤝',
    traits: ['Composed', 'Diplomatic', 'Strategic'],
    description: 'Resolves conflicts and negotiates beneficial agreements',
    competencies: ['Mediation', 'Strategic Planning', 'Alliance Building']
  }
];

// Building types with their respective functions
const BUILDING_TYPES = [
  { type: 'Resource Hub', color: '#78909C' },
  { type: 'Marketplace', color: '#8D6E63' },
  { type: 'Research Lab', color: '#5C6BC0' },
  { type: 'Workshop', color: '#EF5350' },
  { type: 'Training Center', color: '#66BB6A' },
];

// Define interfaces for our simulation objects
interface Point {
  x: number;
  y: number;
}

interface Building {
  id: number;
  position: Point;
  size: { width: number; height: number };
  type: string;
  color: string;
}

interface Resource {
  id: number;
  position: Point;
  type: string;
  value: number;
  color: string;
}

interface Agent {
  id: number;
  position: Point;
  targetPosition: Point;
  type: string;
  color: string;
  icon: string;
  speed: number;
  state: 'wandering' | 'gathering' | 'entering' | 'inside' | 'exiting' | 'trading';
  stateTimer: number;
  targetId?: number;
  trajectory: Point[];
  resources: number;
}

interface Interaction {
  position: Point;
  type: string;
  timer: number;
  agents: number[];
}

const GameSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSimulationActive, setIsSimulationActive] = useState(true);
  const simulationRef = useRef<{
    agents: Agent[];
    buildings: Building[];
    resources: Resource[];
    interactions: Interaction[];
    width: number;
    height: number;
  }>({
    agents: [],
    buildings: [],
    resources: [],
    interactions: [],
    width: 800,
    height: 500
  });
  
  // Animation controls
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Toggle simulation
  const toggleSimulation = () => {
    setIsAnimating(!isAnimating);
  };
  
  // Helper to set a wandering target
  const setWanderingTarget = (agent: Agent) => {
    const margin = 30;
    const simulation = simulationRef.current;
    agent.targetPosition = {
      x: margin + Math.random() * (simulation.width - 2 * margin),
      y: margin + Math.random() * (simulation.height - 2 * margin)
    };
    agent.state = 'wandering';
    agent.stateTimer = 0;
  };
  
  // Helper to generate a trajectory for an agent
  const generateTrajectory = (agent: Agent) => {
    agent.trajectory = [];
    
    const startPoint = { ...agent.position };
    const endPoint = { ...agent.targetPosition };
    
    // Create a control point for the curve
    const controlPoint = {
      x: (startPoint.x + endPoint.x) / 2 + (Math.random() - 0.5) * 100,
      y: (startPoint.y + endPoint.y) / 2 + (Math.random() - 0.5) * 100
    };
    
    // Generate points along a quadratic curve
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = {
        x: Math.pow(1 - t, 2) * startPoint.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * endPoint.x,
        y: Math.pow(1 - t, 2) * startPoint.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * endPoint.y
      };
      agent.trajectory.push(point);
    }
  };
  
  // Helper to set a new target for an agent
  const setNewAgentTarget = (agent: Agent) => {
    const simulation = simulationRef.current;
    // Clear previous target
    agent.targetId = undefined;
    
    // Decide action based on agent type and current state
    const randomAction = Math.random();
    
    if (randomAction < 0.3) {
      // Target a resource
      if (simulation.resources.length > 0) {
        const resourceIndex = Math.floor(Math.random() * simulation.resources.length);
        const resource = simulation.resources[resourceIndex];
        
        agent.targetPosition = { ...resource.position };
        agent.targetId = resource.id;
        agent.state = 'gathering';
        agent.stateTimer = 20 + Math.floor(Math.random() * 60);
      } else {
        // Wander if no resources
        setWanderingTarget(agent);
      }
    } else if (randomAction < 0.7) {
      // Target a building
      if (simulation.buildings.length > 0) {
        const buildingIndex = Math.floor(Math.random() * simulation.buildings.length);
        const building = simulation.buildings[buildingIndex];
        
        // Position at the entrance of the building
        agent.targetPosition = {
          x: building.position.x + building.size.width / 2,
          y: building.position.y + building.size.height
        };
        agent.targetId = building.id;
        agent.state = 'entering';
        agent.stateTimer = 30 + Math.floor(Math.random() * 120);
      } else {
        // Wander if no buildings
        setWanderingTarget(agent);
      }
    } else {
      // Wander
      setWanderingTarget(agent);
    }
    
    // Generate a smooth trajectory
    generateTrajectory(agent);
  };
  
  // Initialize the simulation
  useEffect(() => {
    const simulation = simulationRef.current;
    const canvas = canvasRef.current;
    
    if (!canvas) return;
    
    // Setup canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const { width } = container.getBoundingClientRect();
      simulation.width = width;
      simulation.height = Math.min(500, width * 0.6);
      
      canvas.width = simulation.width;
      canvas.height = simulation.height;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Generate buildings
    const createBuildings = () => {
      simulation.buildings = [];
      const buildingCount = 5;
      const margin = 50;
      
      // Evenly distribute buildings
      for (let i = 0; i < buildingCount; i++) {
        const buildingType = BUILDING_TYPES[i % BUILDING_TYPES.length];
        const width = 60 + Math.random() * 40;
        const height = 60 + Math.random() * 40;
        
        const x = margin + (simulation.width - 2 * margin) * (i / (buildingCount - 1));
        const y = margin + Math.random() * (simulation.height - height - 2 * margin);
        
        simulation.buildings.push({
          id: i,
          position: { x, y },
          size: { width, height },
          type: buildingType.type,
          color: buildingType.color
        });
      }
    };
    
    // Generate resources
    const createResources = () => {
      simulation.resources = [];
      const resourceCount = 8;
      
      for (let i = 0; i < resourceCount; i++) {
        let validPosition = false;
        let position = { x: 0, y: 0 };
        
        // Find a position that doesn't overlap with buildings
        while (!validPosition) {
          position = {
            x: 20 + Math.random() * (simulation.width - 40),
            y: 20 + Math.random() * (simulation.height - 40)
          };
          
          validPosition = true;
          
          // Check for overlap with buildings
          for (const building of simulation.buildings) {
            if (
              position.x > building.position.x - 30 &&
              position.x < building.position.x + building.size.width + 30 &&
              position.y > building.position.y - 30 &&
              position.y < building.position.y + building.size.height + 30
            ) {
              validPosition = false;
              break;
            }
          }
        }
        
        const color = ['#FFD700', '#C0C0C0', '#CD7F32', '#50C878'][Math.floor(Math.random() * 4)];
        
        simulation.resources.push({
          id: i,
          position,
          type: ['Energy', 'Minerals', 'Data', 'Components'][Math.floor(Math.random() * 4)],
          value: 10 + Math.floor(Math.random() * 90),
          color
        });
      }
    };
    
    // Generate agents
    const createAgents = () => {
      simulation.agents = [];
      const agentCount = 10;
      
      for (let i = 0; i < agentCount; i++) {
        const agentType = AGENT_TYPES[i % AGENT_TYPES.length];
        
        const position = {
          x: 50 + Math.random() * (simulation.width - 100),
          y: 50 + Math.random() * (simulation.height - 100)
        };
        
        const agent: Agent = {
          id: i,
          position,
          targetPosition: { ...position },
          type: agentType.type,
          color: agentType.color,
          icon: agentType.icon,
          speed: 0.5 + Math.random() * 1.5,
          state: 'wandering',
          stateTimer: 0,
          trajectory: [],
          resources: Math.floor(Math.random() * 100)
        };
        
        // Set initial trajectory
        setNewAgentTarget(agent);
        
        simulation.agents.push(agent);
      }
    };
    
    // Create initial simulation state
    createBuildings();
    createResources();
    createAgents();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
  // Run the simulation loop
  useEffect(() => {
    if (!isAnimating) return;
    
    const simulation = simulationRef.current;
    const canvas = canvasRef.current;
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let lastTimestamp = 0;
    let animationFrameId: number;
    
    // Update simulation state
    const updateSimulation = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Update agents
      for (const agent of simulation.agents) {
        // Update state timer
        if (agent.stateTimer > 0) {
          agent.stateTimer -= deltaTime / 16.7; // Roughly normalize to 60fps
          
          if (agent.stateTimer <= 0) {
            // State transition
            if (agent.state === 'gathering') {
              // Finish gathering, return to wandering
              agent.resources += 10 + Math.floor(Math.random() * 20);
              setNewAgentTarget(agent);
            } else if (agent.state === 'entering') {
              // Enter the building
              agent.state = 'inside';
              agent.stateTimer = 100 + Math.floor(Math.random() * 200);
            } else if (agent.state === 'inside') {
              // Exit the building
              agent.state = 'exiting';
              
              // Find the building
              const building = simulation.buildings.find(b => b.id === agent.targetId);
              if (building) {
                agent.position = {
                  x: building.position.x + building.size.width / 2,
                  y: building.position.y + building.size.height
                };
                
                // Go somewhere new
                setNewAgentTarget(agent);
              } else {
                setWanderingTarget(agent);
              }
            } else if (agent.state === 'trading') {
              // Finish trading, go somewhere new
              setNewAgentTarget(agent);
            } else {
              // Default: set a new target
              setNewAgentTarget(agent);
            }
          }
        }
        
        // Move the agent along its trajectory if not inside a building
        if (agent.state !== 'inside' && agent.trajectory.length > 0) {
          // Calculate distance to the next trajectory point
          const nextPoint = agent.trajectory[0];
          const dx = nextPoint.x - agent.position.x;
          const dy = nextPoint.y - agent.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Move towards the next point
          const stepSize = Math.min(agent.speed * deltaTime / 16.7, distance);
          if (stepSize > 0) {
            agent.position.x += (dx / distance) * stepSize;
            agent.position.y += (dy / distance) * stepSize;
          }
          
          // If we've reached this point, remove it and go to the next one
          if (stepSize >= distance) {
            agent.trajectory.shift();
            
            // If we've reached the end of the trajectory
            if (agent.trajectory.length === 0) {
              // We've reached the target
              if (agent.state === 'gathering') {
                // Create a gathering interaction
                const resource = simulation.resources.find(r => r.id === agent.targetId);
                if (resource) {
                  simulation.interactions.push({
                    position: { ...resource.position },
                    type: 'gathering',
                    timer: 60 + Math.floor(Math.random() * 60),
                    agents: [agent.id]
                  });
                }
              } else if (agent.state === 'entering') {
                // Agent disappears inside the building
                const building = simulation.buildings.find(b => b.id === agent.targetId);
                if (building) {
                  agent.position = {
                    x: building.position.x + building.size.width / 2,
                    y: building.position.y + building.size.height / 2
                  };
                }
              }
            }
          }
        }
      }
      
      // Update interactions
      simulation.interactions = simulation.interactions.filter(interaction => {
        interaction.timer -= deltaTime / 16.7;
        return interaction.timer > 0;
      });
      
      // Create new interactions
      const agentPairs = new Set<string>();
      for (let i = 0; i < simulation.agents.length; i++) {
        for (let j = i + 1; j < simulation.agents.length; j++) {
          const agent1 = simulation.agents[i];
          const agent2 = simulation.agents[j];
          
          // Skip if either agent is inside a building
          if (agent1.state === 'inside' || agent2.state === 'inside') continue;
          
          // Check proximity
          const dx = agent1.position.x - agent2.position.x;
          const dy = agent1.position.y - agent2.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 30 && Math.random() < 0.01) {
            const pairKey = `${agent1.id}-${agent2.id}`;
            if (!agentPairs.has(pairKey)) {
              agentPairs.add(pairKey);
              
              // They're close enough - create a trading interaction
              if (agent1.state === 'wandering' && agent2.state === 'wandering') {
                agent1.state = 'trading';
                agent2.state = 'trading';
                agent1.stateTimer = 50 + Math.floor(Math.random() * 50);
                agent2.stateTimer = agent1.stateTimer;
                
                // Create an interaction
                simulation.interactions.push({
                  position: {
                    x: (agent1.position.x + agent2.position.x) / 2,
                    y: (agent1.position.y + agent2.position.y) / 2
                  },
                  type: 'trading',
                  timer: agent1.stateTimer,
                  agents: [agent1.id, agent2.id]
                });
              }
            }
          }
        }
      }
      
      // Render the simulation
      renderSimulation();
      
      // Continue the animation loop
      animationFrameId = requestAnimationFrame(updateSimulation);
    };
    
    // Render the simulation state
    const renderSimulation = () => {
      if (!canvas || !ctx) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, simulation.width, simulation.height);
      
      // Draw grid background
      ctx.strokeStyle = 'rgba(45, 45, 45, 0.2)';
      ctx.lineWidth = 1;
      
      const gridSize = 40;
      for (let x = 0; x < simulation.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, simulation.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < simulation.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(simulation.width, y);
        ctx.stroke();
      }
      
      // Draw buildings
      for (const building of simulation.buildings) {
        ctx.fillStyle = building.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Main building
        ctx.beginPath();
        ctx.rect(
          building.position.x,
          building.position.y,
          building.size.width,
          building.size.height
        );
        ctx.fill();
        ctx.stroke();
        
        // Windows
        ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';
        const windowSize = 8;
        const windowMargin = 14;
        const windowsPerRow = Math.floor((building.size.width - 2 * windowMargin) / (windowSize + 6));
        const windowsPerCol = Math.floor((building.size.height - 2 * windowMargin) / (windowSize + 6));
        
        for (let row = 0; row < windowsPerCol; row++) {
          for (let col = 0; col < windowsPerRow; col++) {
            ctx.beginPath();
            ctx.rect(
              building.position.x + windowMargin + col * (windowSize + 6),
              building.position.y + windowMargin + row * (windowSize + 6),
              windowSize,
              windowSize
            );
            ctx.fill();
          }
        }
        
        // Building label
        ctx.font = '10px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(
          building.type,
          building.position.x + building.size.width / 2,
          building.position.y + building.size.height + 15
        );
      }
      
      // Draw resources
      for (const resource of simulation.resources) {
        // Draw glow
        const gradient = ctx.createRadialGradient(
          resource.position.x, resource.position.y, 0,
          resource.position.x, resource.position.y, 30
        );
        
        gradient.addColorStop(0, resource.color + '80');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(resource.position.x, resource.position.y, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw resource
        ctx.beginPath();
        ctx.fillStyle = resource.color;
        ctx.arc(resource.position.x, resource.position.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Resource value
        ctx.font = '10px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${resource.type}: ${resource.value}`,
          resource.position.x,
          resource.position.y - 15
        );
      }
      
      // Draw interactions
      for (const interaction of simulation.interactions) {
        if (interaction.type === 'trading') {
          // Trading animation
          const alpha = Math.min(1, interaction.timer / 30);
          
          ctx.beginPath();
          ctx.fillStyle = `rgba(0, 255, 65, ${alpha * 0.3})`;
          ctx.arc(interaction.position.x, interaction.position.y, 25, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw money symbol floating up
          ctx.font = '14px Arial';
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.textAlign = 'center';
          ctx.fillText(
            '💱',
            interaction.position.x,
            interaction.position.y - (50 - interaction.timer / 2)
          );
        } else if (interaction.type === 'gathering') {
          // Gathering animation
          const alpha = Math.min(1, interaction.timer / 30);
          
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.3})`;
          ctx.arc(interaction.position.x, interaction.position.y, 20, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw resource symbol floating up
          ctx.font = '14px Arial';
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.textAlign = 'center';
          ctx.fillText(
            '⚡',
            interaction.position.x,
            interaction.position.y - (50 - interaction.timer / 2)
          );
        }
      }
      
      // Draw agents (if not inside a building)
      for (const agent of simulation.agents) {
        if (agent.state !== 'inside') {
          // Draw agent glow/aura
          const gradient = ctx.createRadialGradient(
            agent.position.x, agent.position.y, 0,
            agent.position.x, agent.position.y, 20
          );
          
          gradient.addColorStop(0, agent.color + '50');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(agent.position.x, agent.position.y, 20, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw agent icon
          ctx.font = '16px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            agent.icon,
            agent.position.x,
            agent.position.y
          );
          
          // Show resources
          ctx.font = '10px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(
            `${agent.resources}`,
            agent.position.x,
            agent.position.y + 20
          );
        }
      }
    };
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(updateSimulation);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAnimating]);
  
  return (
    <div className="w-full relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full glass-card overflow-hidden rounded-xl border border-agent-green/30"
      >
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ background: 'rgba(18, 18, 18, 0.7)' }}
        />
        
        <motion.div
          className="absolute bottom-4 right-4 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={toggleSimulation}
            className="bg-agent-green/20 hover:bg-agent-green/30 border border-agent-green/50 text-agent-green rounded-full p-2 transition-colors"
            title={isAnimating ? "Pause Simulation" : "Resume Simulation"}
          >
            {isAnimating ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </motion.div>
      </motion.div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {AGENT_TYPES.slice(0, 4).map((agent, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="flex items-center bg-agent-black/50 p-2 rounded border border-agent-green/20"
          >
            <div className="w-6 h-6 flex items-center justify-center mr-2">
              {agent.icon}
            </div>
            <span>{agent.type}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GameSimulation; 