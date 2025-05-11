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
              <div className="flex-1 overflow-y-auto">
                <GameSimulation onAgentSelect={handleAgentSelect} />
              </div>
            )}
            
            {/* Agents */}
            {activeTab === 'agents' && (
              <GlassCard className="w-full h-full overflow-auto p-6">
                <AgentProfiles initialAgent={selectedGameAgent || undefined} showStaking={true} />
              </GlassCard>
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
                
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-agent-black/40 rounded-xl border border-white/5">
                  <div className="w-24 h-24 mb-6 rounded-full bg-agent-dark-gray/50 flex items-center justify-center">
                    <svg className="w-12 h-12 text-agent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Marketplace Coming Soon</h3>
                  <p className="text-white/70 text-center max-w-md mb-6">
                    The Agentarium Marketplace is currently under development and will be launched in Q2 2025. 
                    Here you'll be able to trade resources, customize agents, and analyze performance metrics.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href="https://t.me/agentarium" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-agent-dark-gray hover:bg-agent-gray text-white rounded-md transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                      Join our Telegram
                    </a>
                    <a 
                      href="https://twitter.com/agentarium" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-agent-dark-gray hover:bg-agent-gray text-white rounded-md transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                      Follow on Twitter
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DappPage;