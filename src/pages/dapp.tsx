import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Head from 'next/head';
import { motion } from 'framer-motion';
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
      setNotification({
        show: false,
        message: '',
        type: 'success'
      });
    }, 3000);
  };

  const handleStake = () => {
    if (!wallet.connected) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }
    
    if (selectedAgent === null) {
      showNotification('Please select an agent first', 'error');
      return;
    }
    
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }
    
    if (amount > userBalance) {
      showNotification('Insufficient balance', 'error');
      return;
    }
    
    // Here you would call the actual staking contract
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUserBalance(prev => prev - amount);
      setStakeAmount('0');
      setIsLoading(false);
      showNotification(`Successfully staked ${amount} $AGENT on ${agentData[selectedAgent-1].name}`, 'success');
    }, 1500);
  };

  return (
    <>
      <Head>
        <title>Agentarium - Platform</title>
        <meta name="description" content="Interact with the Agentarium simulation, stake on agents, and earn rewards" />
      </Head>
      
      <Layout>
        <div className="container-responsive pt-24 pb-20">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Agentarium Platform</h1>
            <p className="text-white/70 mt-2">Interact with the simulation, manage your agents, and earn rewards</p>
          </div>
          
          {/* Wallet Connection Bar */}
          <div className="bg-agent-black/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="text-sm text-white/70 mb-1">Your Balance</div>
              <div className="text-xl font-bold text-white">{userBalance.toLocaleString()} AGT</div>
            </div>
            
            <div className="wallet-adapter-dropdown">
              <WalletMultiButton className="btn-primary" />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-8 border-b border-white/10 flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('game')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'game' 
                  ? 'text-agent-green border-b-2 border-agent-green' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Game Simulation
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'agents' 
                  ? 'text-agent-green border-b-2 border-agent-green' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              My Agents
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'dashboard' 
                  ? 'text-agent-green border-b-2 border-agent-green' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'marketplace' 
                  ? 'text-agent-green border-b-2 border-agent-green' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Marketplace
            </button>
          </div>
          
          {/* Game Simulation Tab */}
          {activeTab === 'game' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">AI Agent Simulation</h2>
                <p className="text-white/70">
                  Explore the Agentarium world where AI agents interact, trade, and evolve in a simulated environment.
                  Click on an agent to learn more about their abilities and behaviors.
                </p>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <GlassCard className="p-4 h-[600px] relative overflow-hidden">
                    <GameSimulation onAgentSelect={setSelectedGameAgent} />
                  </GlassCard>
                </div>
                
                <div className="xl:col-span-1">
                  <GlassCard className="p-6">
                    {selectedGameAgent ? (
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4">
                          Agent Profile: <span className="text-agent-green">{selectedGameAgent}</span>
                        </h3>
                        
                        <div className="mb-6">
                          {/* Agent profile details here */}
                          <p className="text-white/70 mb-4">
                            View detailed information about this agent type and how they function in the Agentarium ecosystem.
                          </p>
                          
                          <button 
                            onClick={() => setSelectedGameAgent(null)}
                            className="text-agent-green text-sm hover:underline"
                          >
                            ← Back to all agents
                          </button>
                        </div>
                        
                        {/* Specific agent details */}
                        <AgentProfiles initialAgent={selectedGameAgent} />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4">Simulation Controls</h3>
                        <p className="text-white/70 mb-4">
                          Click on any agent in the simulation to view their detailed profile and abilities.
                        </p>
                        <div className="text-white/70 space-y-4">
                          <div>
                            <h4 className="font-medium text-white">How to interact</h4>
                            <p className="mt-1 text-sm">Click on agents to select them and view their details.</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">Agent Types</h4>
                            <p className="mt-1 text-sm">The simulation features 10 different agent types, each with unique behaviors and specializations.</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">Buildings</h4>
                            <p className="mt-1 text-sm">Various buildings serve different functions in the ecosystem, from resource processing to trading hubs.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </div>
              </div>
            </div>
          )}
          
          {/* My Agents Tab */}
          {activeTab === 'agents' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agentData.map((agent) => (
                  <motion.div
                    key={agent.id}
                    whileHover={{ scale: 1.02 }}
                    className={`card p-6 cursor-pointer transition-colors ${
                      selectedAgent === agent.id ? 'border-agent-green bg-agent-green/10' : ''
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="text-4xl mr-3">{agent.avatar}</div>
                        <div>
                          <h3 className="text-white font-bold text-xl">{agent.name}</h3>
                          <div className="text-agent-green text-sm">{agent.role}</div>
                        </div>
                      </div>
                      <div className="bg-agent-green/20 text-agent-green px-2 py-1 rounded-md text-xs">
                        Lvl {agent.level}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-white/70 text-sm">{agent.description}</p>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                          <span>Energy</span>
                          <span>{agent.energy}%</span>
                        </div>
                        <div className="h-1.5 bg-agent-black/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-agent-green" 
                            style={{ width: `${agent.energy}%` }} 
                          />
                        </div>
                      </div>
                      
                      {/* Core skill */}
                      <div>
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                          <span>Primary Skill</span>
                          <span>
                            {Object.entries(agent.skills)[0][1]}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-agent-black/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-agent-blue" 
                            style={{ width: `${Object.entries(agent.skills)[0][1]}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-agent-green/10 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-white/60">Current Staked</div>
                        <div className="text-white font-medium">{agent.staked} $AGENT</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Earnings</div>
                        <div className="text-agent-green font-medium">+{agent.earnings} $AGENT</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Staking UI */}
              {selectedAgent !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 card p-6"
                >
                  <h2 className="text-white font-bold text-xl mb-4">
                    Stake on {agentData[selectedAgent-1].name}
                  </h2>
                  <div className="flex flex-col md:flex-row gap-4 md:items-end">
                    <div className="flex-grow">
                      <label className="block text-white/70 text-sm mb-2">
                        Amount to Stake
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          placeholder="0.00"
                          className="bg-agent-black/60 text-white border border-agent-green/30 rounded-md w-full py-2 px-3 focus:outline-none focus:border-agent-green/70"
                        />
                        <button
                          onClick={() => setStakeAmount(userBalance.toString())}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-agent-green/70 text-xs hover:text-agent-green"
                        >
                          MAX
                        </button>
                      </div>
                      <div className="text-white/50 text-xs mt-1">
                        Balance: {userBalance.toFixed(2)} $AGENT
                      </div>
                    </div>
                    <button
                      onClick={handleStake}
                      disabled={isLoading}
                      className="btn-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : 'Stake Tokens'}
                    </button>
                  </div>
                  
                  <div className="mt-6 bg-agent-black/40 rounded-md p-4">
                    <h3 className="text-white font-medium mb-2">Staking Benefits</h3>
                    <ul className="text-white/70 text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-agent-green mr-2">•</span>
                        <span>Increases agent's energy and efficiency by ~2% per 1000 $AGENT</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-agent-green mr-2">•</span>
                        <span>Earn a proportional share of the agent's rewards</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-agent-green mr-2">•</span>
                        <span>Unlock special abilities when staking threshold is reached</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </>
          )}
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="card p-6">
              <h2 className="text-white font-bold text-xl mb-6">Your Dashboard</h2>
              {wallet.connected ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-agent-black/40 p-4 rounded-lg">
                      <div className="text-white/60 text-sm">Total Staked</div>
                      <div className="text-white text-xl font-bold">3,500 $AGENT</div>
                    </div>
                    <div className="bg-agent-black/40 p-4 rounded-lg">
                      <div className="text-white/60 text-sm">Total Earnings</div>
                      <div className="text-agent-green text-xl font-bold">+758 $AGENT</div>
                    </div>
                    <div className="bg-agent-black/40 p-4 rounded-lg">
                      <div className="text-white/60 text-sm">Active Agents</div>
                      <div className="text-white text-xl font-bold">2</div>
                    </div>
                  </div>
                  <p className="text-white/70 text-center">
                    Full dashboard with analytics and detailed agent monitoring coming soon!
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/70 mb-4">
                    Please connect your wallet to view your dashboard
                  </div>
                  <WalletMultiButton className="!bg-agent-green !text-agent-black hover:!bg-agent-green-light" />
                </div>
              )}
            </div>
          )}
          
          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="card p-6">
              <h2 className="text-white font-bold text-xl mb-6">Resource Marketplace</h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🚧</div>
                <h3 className="text-white text-xl font-medium mb-2">Coming Soon</h3>
                <p className="text-white/70 max-w-md mx-auto">
                  The resource marketplace will allow you to buy, sell, and trade in-game resources. Check back later!
                </p>
              </div>
            </div>
          )}
          
          {/* Notification */}
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center ${
                notification.type === 'success' ? 'bg-agent-green-muted text-white' : 'bg-red-600 text-white'
              }`}
            >
              <span>{notification.message}</span>
            </motion.div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default DappPage;