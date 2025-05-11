import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import GameSimulation from '@/components/GameSimulation';
import AgentProfiles from '@/components/AgentProfiles';
import GlassCard from '@/components/GlassCard';

// Mock agent data - would come from the blockchain in a real app
const agentData = [
  {
    id: 1,
    name: "Alex",
    role: "Trader",
    avatar: "👨‍💼",
    level: 5,
    energy: 87,
    skills: {
      trading: 78,
      negotiation: 65,
      resourceGathering: 42
    },
    earnings: 1245,
    staked: 3500,
    apy: 12.5,
    description: "Specializes in trading resources at optimal prices. Has developed a network of contacts in the virtual marketplace."
  },
  {
    id: 2,
    name: "Nova",
    role: "Scientist",
    avatar: "👩‍🔬",
    level: 7,
    energy: 92,
    skills: {
      research: 82,
      innovation: 74,
      problemSolving: 68
    },
    earnings: 1870,
    staked: 5200,
    apy: 14.2,
    description: "Focuses on research and development of new technologies. Can unlock unique resource processing methods."
  },
  {
    id: 3,
    name: "Orion",
    role: "Builder",
    avatar: "👷",
    level: 6,
    energy: 95,
    skills: {
      construction: 80,
      planning: 72,
      resourceManagement: 65
    },
    earnings: 1560,
    staked: 4100,
    apy: 13.8,
    description: "Expert in construction and infrastructure development. Creates more efficient resource gathering stations."
  },
  {
    id: 4,
    name: "Luna",
    role: "Explorer",
    avatar: "🧭",
    level: 4,
    energy: 84,
    skills: {
      discovery: 70,
      adaptability: 75,
      survival: 68
    },
    earnings: 1320,
    staked: 2900,
    apy: 11.5,
    description: "Specializes in discovering new resource nodes and territories. High chance of finding rare resources."
  },
  {
    id: 5,
    name: "Max",
    role: "Farmer",
    avatar: "👨‍🌾",
    level: 5,
    energy: 89,
    skills: {
      cultivation: 76,
      patience: 80,
      resourceEfficiency: 65
    },
    earnings: 1480,
    staked: 3800,
    apy: 12.8,
    description: "Expert in cultivating and harvesting renewable resources. Creates sustainable resource production."
  },
  {
    id: 6,
    name: "Zara",
    role: "Engineer",
    avatar: "👩‍🔧",
    level: 6,
    energy: 91,
    skills: {
      mechanics: 78,
      innovation: 73,
      efficiency: 70
    },
    earnings: 1690,
    staked: 4300,
    apy: 13.5,
    description: "Focuses on creating and improving tools and machines. Increases resource processing efficiency."
  },
  {
    id: 7,
    name: "Neo",
    role: "Hacker",
    avatar: "👨‍💻",
    level: 7,
    energy: 86,
    skills: {
      coding: 85,
      security: 78,
      dataAnalysis: 72
    },
    earnings: 1920,
    staked: 4800,
    apy: 15.0,
    description: "Specializes in technology and data systems. Can find opportunities in the digital realm."
  },
  {
    id: 8,
    name: "Astra",
    role: "Diplomat",
    avatar: "🧝‍♀️",
    level: 5,
    energy: 88,
    skills: {
      negotiation: 79,
      charisma: 74,
      leadership: 68
    },
    earnings: 1530,
    staked: 3700,
    apy: 12.3,
    description: "Expert in forging alliances with other agents. Can secure favorable trading deals and collaborations."
  },
  {
    id: 9,
    name: "Bolt",
    role: "Courier",
    avatar: "🏃",
    level: 4,
    energy: 94,
    skills: {
      speed: 82,
      navigation: 76,
      resourceHandling: 65
    },
    earnings: 1380,
    staked: 3100,
    apy: 11.8,
    description: "Specializes in rapid resource transportation. Increases the speed of resource transfers between locations."
  },
  {
    id: 10,
    name: "Echo",
    role: "Mystic",
    avatar: "🧙",
    level: 8,
    energy: 90,
    skills: {
      foresight: 88,
      intuition: 80,
      adaptation: 75
    },
    earnings: 2100,
    staked: 5500,
    apy: 16.2,
    description: "Has unusual abilities to predict market changes and resource fluctuations. Thrives during special events."
  }
];

const DappPage = () => {
  const wallet = useWallet();
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('0');
  const [userBalance, setUserBalance] = useState<number>(10000); // Mock balance
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'dashboard' | 'marketplace' | 'game'>('game');
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const [selectedGameAgent, setSelectedGameAgent] = useState<null | string>(null);

  // Mock wallet connection status
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(prev => ({...prev, show: false}));
    }, 5000);
  };
  
  const handleStake = () => {
    if (parseFloat(stakeAmount) <= 0 || !selectedAgent) {
      showNotification('Please enter a valid amount to stake', 'error');
      return;
    }
    
    if (parseFloat(stakeAmount) > userBalance) {
      showNotification('Insufficient balance', 'error');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      setUserBalance(prev => prev - parseFloat(stakeAmount));
      showNotification(`Successfully staked ${stakeAmount} $AGENT on ${agentData.find(a => a.id === selectedAgent)?.name}`, 'success');
      setStakeAmount('0');
      setIsLoading(false);
    }, 2000);
  };
  
  const handleUnstake = (agentId: number) => {
    setIsLoading(true);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      const agent = agentData.find(a => a.id === agentId);
      if (agent) {
        setUserBalance(prev => prev + agent.staked);
        showNotification(`Successfully unstaked ${agent.staked} $AGENT from ${agent.name}`, 'success');
      }
      setIsLoading(false);
    }, 2000);
  };
  
  const handleAgentSelect = (agentType: string) => {
    setSelectedGameAgent(agentType);
  };
  
  return (
    <Layout>
      <Head>
        <title>Agentarium - AI Agent Simulation</title>
        <meta name="description" content="Explore the Agentarium simulation with AI agents interacting in a virtual economy" />
      </Head>
      
      {/* Full-screen game layout */}
      <div className="h-screen w-full pt-16 md:pt-20 bg-agent-black overflow-hidden">
        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md shadow-lg ${
                notification.type === 'success' ? 'bg-agent-green text-black' : 'bg-red-600 text-white'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main content */}
        <div className="h-full flex flex-col">
          {/* Tabs */}
          <div className="flex items-center px-4 py-2 bg-agent-black border-b border-white/10">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('game')}
                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                  activeTab === 'game'
                    ? 'bg-agent-green-muted/20 text-agent-green border-b-2 border-agent-green'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Simulation
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                  activeTab === 'agents'
                    ? 'bg-agent-green-muted/20 text-agent-green border-b-2 border-agent-green'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Agents
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-agent-green-muted/20 text-agent-green border-b-2 border-agent-green'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                  activeTab === 'marketplace'
                    ? 'bg-agent-green-muted/20 text-agent-green border-b-2 border-agent-green'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Marketplace
              </button>
            </div>
            
            <div className="ml-auto flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <div className="text-white/60 text-xs">Balance</div>
                <div className="text-white font-mono font-bold">{userBalance.toLocaleString()} $AGENT</div>
              </div>
              <div className="wallet-adapter-dropdown">
                <WalletMultiButton className="!bg-agent-green hover:!bg-agent-green-muted !transition-colors" />
              </div>
            </div>
          </div>
          
          {/* Tab Content - Full height */}
          <div className="flex-1 overflow-y-auto">
            {/* Game Simulation - Full height */}
            {activeTab === 'game' && (
              <div className="h-full">
                <GameSimulation onAgentSelect={handleAgentSelect} />
              </div>
            )}
            
            {/* Agents */}
            {activeTab === 'agents' && (
              <div className="container-responsive py-6">
                <h2 className="text-2xl font-bold text-white mb-6">Agent Profiles</h2>
                <AgentProfiles initialAgent={selectedGameAgent || undefined} />
              </div>
            )}
            
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="container-responsive py-6">
                <h2 className="text-2xl font-bold text-white mb-6">Your Dashboard</h2>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <GlassCard className="p-4">
                    <h3 className="text-white/70 text-sm mb-1">Total Staked</h3>
                    <p className="text-2xl font-bold text-white">32,500 $AGENT</p>
                    <div className="mt-2 text-agent-green text-sm">+12.4% from last week</div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <h3 className="text-white/70 text-sm mb-1">Total Rewards</h3>
                    <p className="text-2xl font-bold text-white">4,125 $AGENT</p>
                    <div className="mt-2 text-agent-green text-sm">+5.2% from last week</div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <h3 className="text-white/70 text-sm mb-1">Active Agents</h3>
                    <p className="text-2xl font-bold text-white">7 / 10</p>
                    <div className="mt-2 text-white/70 text-sm">70% participation rate</div>
                  </GlassCard>
                </div>
                
                {/* Staked Agents */}
                <h3 className="text-xl font-bold text-white mb-4">Your Staked Agents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentData.slice(0, 7).map(agent => (
                    <GlassCard key={agent.id} className="p-4">
                      <div className="flex items-start">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center mr-3 text-xl"
                          style={{ backgroundColor: 'rgba(29, 185, 84, 0.2)' }}
                        >
                          {agent.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold">{agent.name}</h4>
                          <p className="text-white/70 text-sm">{agent.role}</p>
                          
                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-white/50">Staked</div>
                              <div className="text-white font-mono">{agent.staked} $AGENT</div>
                            </div>
                            <div>
                              <div className="text-white/50">APY</div>
                              <div className="text-agent-green font-mono">{agent.apy}%</div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <button 
                              onClick={() => handleUnstake(agent.id)}
                              disabled={isLoading}
                              className="px-3 py-1 bg-agent-dark-gray hover:bg-agent-gray text-white text-sm rounded-md transition-colors"
                            >
                              Unstake
                            </button>
                            <div className="text-white/50 text-xs">Level {agent.level}</div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
            
            {/* Marketplace */}
            {activeTab === 'marketplace' && (
              <div className="container-responsive py-6">
                <h2 className="text-2xl font-bold text-white mb-6">Agent Marketplace</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {agentData.map(agent => (
                    <GlassCard 
                      key={agent.id} 
                      className="p-4"
                      glowColor={selectedAgent === agent.id ? 'rgba(29, 185, 84, 0.2)' : undefined}
                      borderGlow={selectedAgent === agent.id}
                    >
                      <div 
                        className={`cursor-pointer transition-all duration-300 ${
                          selectedAgent === agent.id ? 'scale-105' : 'hover:scale-105'
                        }`}
                        onClick={() => setSelectedAgent(agent.id)}
                      >
                        <div className="flex items-center mb-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-xl"
                            style={{ backgroundColor: 'rgba(29, 185, 84, 0.2)' }}
                          >
                            {agent.avatar}
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{agent.name}</h4>
                            <p className="text-white/70 text-xs">{agent.role}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/70">Level</span>
                            <span className="text-white">{agent.level}</span>
                          </div>
                          <div className="h-1.5 bg-agent-gray/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-agent-green rounded-full"
                              style={{ width: `${agent.level * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div className="bg-agent-dark-gray/50 p-2 rounded">
                            <div className="text-white/50">Energy</div>
                            <div className="text-white font-medium">{agent.energy}%</div>
                          </div>
                          <div className="bg-agent-dark-gray/50 p-2 rounded">
                            <div className="text-white/50">APY</div>
                            <div className="text-agent-green font-medium">{agent.apy}%</div>
                          </div>
                        </div>
                        
                        <p className="text-white/60 text-xs line-clamp-2 h-10">{agent.description}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
                
                {/* Staking Interface */}
                {selectedAgent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8"
                  >
                    <GlassCard className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4">
                        Stake {agentData.find(a => a.id === selectedAgent)?.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="mb-4">
                            <label className="block text-white/70 text-sm mb-2">Amount to Stake</label>
                            <div className="flex items-center bg-agent-gray/20 rounded-lg overflow-hidden border border-white/5 focus-within:border-agent-green/50 transition-colors">
                              <input
                                type="number"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                placeholder="0"
                                className="bg-transparent text-white px-4 py-3 flex-1 focus:outline-none"
                              />
                              <div className="px-4 text-white/50">$AGENT</div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs">
                              <button 
                                className="text-agent-green hover:text-agent-green-muted transition-colors"
                                onClick={() => setStakeAmount((userBalance / 4).toString())}
                              >
                                25%
                              </button>
                              <button 
                                className="text-agent-green hover:text-agent-green-muted transition-colors"
                                onClick={() => setStakeAmount((userBalance / 2).toString())}
                              >
                                50%
                              </button>
                              <button 
                                className="text-agent-green hover:text-agent-green-muted transition-colors"
                                onClick={() => setStakeAmount((userBalance * 0.75).toString())}
                              >
                                75%
                              </button>
                              <button 
                                className="text-agent-green hover:text-agent-green-muted transition-colors"
                                onClick={() => setStakeAmount(userBalance.toString())}
                              >
                                MAX
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleStake}
                            disabled={isLoading || !selectedAgent || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > userBalance}
                            className={`w-full py-3 rounded-md font-medium transition-all ${
                              isLoading || !selectedAgent || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > userBalance
                                ? 'bg-agent-gray/30 text-white/30 cursor-not-allowed'
                                : 'bg-agent-green text-black hover:bg-agent-green-muted'
                            }`}
                          >
                            {isLoading ? 'Processing...' : 'Stake Agent'}
                          </button>
                          
                          <p className="mt-3 text-white/50 text-xs">
                            Staking this agent will lock your tokens for a minimum of 7 days.
                            You will earn rewards based on the agent's performance in the simulation.
                          </p>
                        </div>
                        
                        <div className="bg-agent-black/40 p-4 rounded-lg">
                          <h4 className="text-white font-bold mb-3">Staking Details</h4>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-white/70">Agent Type</span>
                              <span className="text-white">{agentData.find(a => a.id === selectedAgent)?.role}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">APY</span>
                              <span className="text-agent-green">{agentData.find(a => a.id === selectedAgent)?.apy}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Lock Period</span>
                              <span className="text-white">7 days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Early Unstake Fee</span>
                              <span className="text-white">10%</span>
                            </div>
                            
                            <div className="pt-3 border-t border-white/10">
                              <div className="flex justify-between font-bold">
                                <span className="text-white">Estimated Rewards (30d)</span>
                                <span className="text-agent-green">
                                  {parseFloat(stakeAmount) > 0 
                                    ? ((parseFloat(stakeAmount) * (agentData.find(a => a.id === selectedAgent)?.apy || 0) / 100) / 12).toFixed(2)
                                    : '0'} $AGENT
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DappPage;