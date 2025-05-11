import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

// Agent types with detailed information
const AGENT_TYPES = [
  { 
    type: 'Entrepreneur', 
    color: '#FF9800', 
    icon: '👨‍💼',
    traits: ['Ambitious', 'Risk-taker', 'Strategic'],
    description: 'Focused on identifying market opportunities and maximizing profit',
    competencies: ['Business Planning', 'Resource Allocation', 'Market Analysis'],
    role: 'Creates new business ventures and identifies profitable opportunities in the resource market.',
    strengths: 'Excellent at generating value from limited resources and spotting market trends.',
    synergies: ['Trader', 'Networker', 'Innovator']
  },
  { 
    type: 'Scientist', 
    color: '#2196F3', 
    icon: '👩‍🔬',
    traits: ['Analytical', 'Curious', 'Detail-oriented'],
    description: 'Researches new technologies that unlock efficiency improvements',
    competencies: ['Research', 'Data Analysis', 'Innovation'],
    role: 'Develops technologies that improve efficiency and creates new resource types.',
    strengths: 'Systematic approach to problem-solving and ability to develop breakthrough technologies.',
    synergies: ['Innovator', 'Craftsman', 'Explorer']
  },
  { 
    type: 'Craftsman', 
    color: '#F44336', 
    icon: '🛠️',
    traits: ['Precise', 'Patient', 'Resourceful'],
    description: 'Specialized in creating high-value items from raw materials',
    competencies: ['Manufacturing', 'Quality Control', 'Resource Optimization'],
    role: 'Transforms raw resources into valuable components and complex systems.',
    strengths: 'Highly efficient at resource conversion with minimal waste.',
    synergies: ['Resource Gatherer', 'Scientist', 'Entrepreneur']
  },
  { 
    type: 'Trader', 
    color: '#4CAF50', 
    icon: '💱',
    traits: ['Persuasive', 'Quick-thinking', 'Adaptive'],
    description: 'Profits from market inefficiencies and arbitrage opportunities',
    competencies: ['Negotiation', 'Market Timing', 'Value Assessment'],
    role: 'Facilitates resource exchanges and maintains market liquidity.',
    strengths: 'Exceptional at optimizing deal terms and sensing market imbalances.',
    synergies: ['Entrepreneur', 'Networker', 'Diplomat']
  },
  { 
    type: 'Explorer', 
    color: '#9C27B0', 
    icon: '🔍',
    traits: ['Adventurous', 'Independent', 'Observant'],
    description: 'Discovers new resources and opportunities in unexplored areas',
    competencies: ['Resource Discovery', 'Path Finding', 'Risk Assessment'],
    role: 'Discovers new resource deposits and identifies undeveloped opportunities.',
    strengths: 'Thrives in uncertain environments and has high risk tolerance.',
    synergies: ['Resource Gatherer', 'Scientist', 'Guardian']
  },
  { 
    type: 'Networker', 
    color: '#3F51B5', 
    icon: '🌐',
    traits: ['Charismatic', 'Empathetic', 'Sociable'],
    description: 'Excels at forming alliances and coordinating group activities',
    competencies: ['Relationship Building', 'Communication', 'Conflict Resolution'],
    role: 'Creates collaborative networks and coordinates multi-agent projects.',
    strengths: 'Forms powerful alliances that create mutual benefits.',
    synergies: ['Diplomat', 'Entrepreneur', 'Trader']
  },
  { 
    type: 'Innovator', 
    color: '#00BCD4', 
    icon: '💡',
    traits: ['Creative', 'Visionary', 'Problem-solver'],
    description: 'Creates novel solutions to problems in unexpected ways',
    competencies: ['Idea Generation', 'Adaptation', 'Technology Integration'],
    role: 'Develops creative solutions to constraints and resource limitations.',
    strengths: 'Unconventional thinking that creates breakthrough approaches.',
    synergies: ['Scientist', 'Entrepreneur', 'Craftsman']
  },
  { 
    type: 'Guardian', 
    color: '#795548', 
    icon: '🛡️',
    traits: ['Reliable', 'Vigilant', 'Principled'],
    description: 'Protects shared resources and maintains system balance',
    competencies: ['Security Management', 'Resource Preservation', 'System Monitoring'],
    role: 'Protects common resources and helps maintain economic stability.',
    strengths: 'Ensures long-term sustainability of resources and systems.',
    synergies: ['Resource Gatherer', 'Diplomat', 'Explorer']
  },
  { 
    type: 'Resource Gatherer', 
    color: '#607D8B', 
    icon: '⚒️',
    traits: ['Determined', 'Methodical', 'Efficient'],
    description: 'Specializes in collecting raw materials efficiently',
    competencies: ['Resource Extraction', 'Terrain Navigation', 'Tool Optimization'],
    role: 'Efficiently extracts primary resources that fuel the economy.',
    strengths: 'Highly optimized gathering techniques with excellent stamina.',
    synergies: ['Craftsman', 'Explorer', 'Guardian']
  },
  { 
    type: 'Diplomat', 
    color: '#9E9E9E', 
    icon: '🤝',
    traits: ['Composed', 'Diplomatic', 'Strategic'],
    description: 'Resolves conflicts and negotiates beneficial agreements',
    competencies: ['Mediation', 'Strategic Planning', 'Alliance Building'],
    role: 'Mediates conflicts and creates mutually beneficial agreements.',
    strengths: 'Ability to align divergent interests and create stable relationships.',
    synergies: ['Networker', 'Guardian', 'Trader']
  }
];

interface AgentProfilesProps {
  initialAgent?: string;
}

const AgentProfiles = ({ initialAgent }: AgentProfilesProps) => {
  const [selectedAgent, setSelectedAgent] = useState(AGENT_TYPES[0]);
  
  useEffect(() => {
    if (initialAgent) {
      const agent = AGENT_TYPES.find(a => a.type === initialAgent);
      if (agent) {
        setSelectedAgent(agent);
      }
    }
  }, [initialAgent]);
  
  return (
    <div className="w-full">
      {!initialAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Meet the <span className="text-agent-green-muted">AI Agents</span>
          </h2>
          <p className="text-white/70 max-w-3xl">
            Each of the 10 agents in Agentarium has a unique personality and specialized skills.
            They autonomously make decisions, interact with other agents, and adapt their strategies
            over time based on the evolving simulation environment.
          </p>
        </motion.div>
      )}
      
      {/* Agent Selection */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-2">
        {AGENT_TYPES.map((agent, index) => (
          <motion.button
            key={agent.type}
            onClick={() => setSelectedAgent(agent)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`p-2 rounded-lg flex flex-col items-center transition-all duration-300 ${
              selectedAgent.type === agent.type 
                ? 'bg-agent-black border border-white/20 shadow-lg' 
                : 'hover:bg-agent-black/50'
            }`}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2 text-xl"
              style={{ 
                backgroundColor: `${agent.color}20`,
                color: agent.color,
                border: selectedAgent.type === agent.type ? `2px solid ${agent.color}` : '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {agent.icon}
            </div>
            <span className={`text-xs font-medium ${selectedAgent.type === agent.type ? 'text-white' : 'text-white/70'}`}>
              {agent.type}
            </span>
          </motion.button>
        ))}
      </div>
      
      {/* Selected Agent Details */}
      <GlassCard 
        className="p-6 md:p-8" 
        glowColor={`${selectedAgent.color}40`}
        borderGlow={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Agent Header */}
          <div className="md:col-span-3 flex items-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mr-4"
              style={{ 
                backgroundColor: `${selectedAgent.color}20`,
                color: selectedAgent.color,
                border: `2px solid ${selectedAgent.color}`
              }}
            >
              {selectedAgent.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">The {selectedAgent.type}</h3>
              <p className="text-white/70">{selectedAgent.description}</p>
            </div>
          </div>
          
          {/* Traits */}
          <div className="bg-agent-black/40 p-4 rounded-lg border border-white/10">
            <h4 className="text-white font-bold mb-2 text-sm uppercase tracking-wider">Personality Traits</h4>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedAgent.traits.map(trait => (
                <span 
                  key={trait} 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${selectedAgent.color}20`, color: selectedAgent.color }}
                >
                  {trait}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <h4 className="text-white font-bold mb-2 text-sm uppercase tracking-wider">Primary Role</h4>
              <p className="text-white/70 text-sm">{selectedAgent.role}</p>
            </div>
          </div>
          
          {/* Competencies */}
          <div className="bg-agent-black/40 p-4 rounded-lg border border-white/10">
            <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Core Competencies</h4>
            <div className="space-y-3">
              {selectedAgent.competencies.map(competency => (
                <div key={competency} className="group">
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: selectedAgent.color }}
                    ></div>
                    <div className="text-sm text-white/90">{competency}</div>
                  </div>
                  <div 
                    className="h-1 bg-agent-gray/30 rounded-full mt-1 overflow-hidden"
                  >
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: selectedAgent.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h4 className="text-white font-bold mb-2 text-sm uppercase tracking-wider">Strengths</h4>
              <p className="text-white/70 text-sm">{selectedAgent.strengths}</p>
            </div>
          </div>
          
          {/* Synergies */}
          <div className="bg-agent-black/40 p-4 rounded-lg border border-white/10">
            <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Synergistic Relationships</h4>
            <p className="text-white/70 text-sm mb-3">
              The {selectedAgent.type} works most effectively with:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {selectedAgent.synergies.map(synergy => {
                const synergyAgent = AGENT_TYPES.find(a => a.type === synergy);
                return (
                  <div 
                    key={synergy} 
                    className="flex items-center p-2 rounded-lg"
                    style={{ backgroundColor: `${synergyAgent?.color}10` }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm"
                      style={{ 
                        backgroundColor: `${synergyAgent?.color}20`,
                        color: synergyAgent?.color 
                      }}
                    >
                      {synergyAgent?.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: synergyAgent?.color }}>
                        {synergy}
                      </div>
                      <div className="text-xs text-white/60">
                        {AGENT_TYPES.find(a => a.type === synergy)?.traits[0]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AgentProfiles; 