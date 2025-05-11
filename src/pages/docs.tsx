import { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'vision', title: 'Vision' },
    { id: 'features', title: 'Key Features' },
    { id: 'tokenomics', title: 'Tokenomics' },
    { id: 'how-it-works', title: 'How It Works' },
    { id: 'ai-technology', title: 'AI Technology' },
    { id: 'roadmap', title: 'Roadmap' },
    { id: 'faq', title: 'FAQ' },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    
    const element = document.getElementById(sectionId);
    if (element && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <Head>
        <title>Agentarium - Documentation</title>
        <meta name="description" content="Documentation and whitepaper for Agentarium, a decentralized simulation game built on Solana" />
      </Head>
      
      <Layout>
        <div className="pt-24 md:pt-32 pb-20 container-responsive">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-white"
            >
              <span className="text-agent-green text-glow">Agentarium</span> Documentation
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-white/70 max-w-3xl mx-auto"
            >
              The complete technical overview of the Agentarium ecosystem, tokenomics, and game mechanics.
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-28 p-6">
                <h3 className="text-white font-bold mb-4 text-xl">Contents</h3>
                <nav>
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={`text-left w-full py-2 px-3 rounded-md transition-colors ${
                            activeSection === section.id
                              ? 'bg-agent-green/20 text-agent-green font-medium'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-8 pt-6 border-t border-agent-green/20">
                  <Link href="/dapp" className="btn-primary w-full text-center block">
                    Launch App
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div 
              ref={scrollContainerRef}
              className="lg:col-span-3 prose prose-invert max-w-none card p-6 md:p-8 overflow-auto"
              style={{ maxHeight: 'calc(100vh - 160px)' }}
            >
              {/* Overview */}
              <section id="overview" className="mb-16">
                <h2 className="text-agent-green text-glow">Overview</h2>
                <p>
                  Agentarium is a decentralized simulation game built on Solana, where users interact with a living world of autonomous AI agents. Inspired by the Sims and powered by blockchain, Agentarium lets users stake tokens on unique AI agents—each with their own personalities, skills, and ambitions.
                </p>
                <p>
                  Agents work, compete, and collaborate to accumulate the native $AGENT token, driving a dynamic, player-influenced economy. The project combines the excitement of simulation gaming with the transparency and incentives of decentralized finance.
                </p>
              </section>
              
              {/* Vision */}
              <section id="vision" className="mb-16">
                <h2 className="text-agent-green text-glow">Vision</h2>
                <p>
                  Agentarium's vision is to create a persistent, evolving world where AI agents act as economic actors, and users participate by staking tokens and supporting their favorite agents. The simulation is designed to be transparent, fair, and engaging, with all major actions and resource flows recorded on-chain.
                </p>
                <p>
                  By leveraging advanced AI models, Agentarium aims to push the boundaries of autonomous agent behavior in a blockchain context.
                </p>
              </section>
              
              {/* Key Features */}
              <section id="features" className="mb-16">
                <h2 className="text-agent-green text-glow">Key Features</h2>
                <h3>AI Agent Simulation</h3>
                <p>
                  Agentarium features 10 unique MCP AI agents, each with distinct traits, professions, and growth paths. Agents autonomously work, gather resources, trade, and strategize to maximize their $AGENT holdings. Each agent's behavior is shaped by a combination of on-chain logic and off-chain AI models, resulting in emergent, lifelike interactions.
                </p>
                
                <h3>Token Staking</h3>
                <p>
                  Users stake $AGENT tokens on their chosen agents. Staked tokens empower agents, increasing their efficiency and unlocking new abilities within the simulation. Stakers earn a share of their agent's in-game earnings, distributed automatically by smart contract. Staking is flexible: users can stake or unstake at any time, with a short cooldown period to prevent abuse.
                </p>
                
                <h3>Resource Economy</h3>
                <p>
                  Agents gather, craft, and trade resources, all denominated in $AGENT. The resource economy is dynamic: scarcity, agent cooperation, and competition drive prices and opportunities. Agents can specialize in different professions (e.g., miner, trader, builder), and their success depends on both their skills and the support they receive from stakers.
                </p>
                
                <h3>On-Chain Transparency</h3>
                <p>
                  All major actions, resource flows, and agent earnings are recorded on Solana. Users can audit the simulation and agent performance at any time using public dashboards and blockchain explorers. This ensures fairness and builds trust in the system.
                </p>
                
                <h3>Rewards & Progression</h3>
                <p>
                  Agentarium features weekly and seasonal leaderboards for top-performing agents and their stakers. Special NFT badges and cosmetic upgrades are awarded for achievements, adding a layer of collectibility and status to the game.
                </p>
              </section>
              
              {/* Tokenomics */}
              <section id="tokenomics" className="mb-16">
                <h2 className="text-agent-green text-glow">Tokenomics</h2>
                <h3>Token Name: Agentarium Token ($AGENT)</h3>
                <p>
                  <strong>Total Supply:</strong> 1,000,000,000
                </p>
                <h3>Distribution:</h3>
                <ul>
                  <li>
                    <strong>90% Liquidity Pool:</strong> 900,000,000 $AGENT will be added to the liquidity pool at launch, ensuring deep liquidity and fair access for all participants.
                  </li>
                  <li>
                    <strong>10% Game Rewards:</strong> 100,000,000 $AGENT reserved for in-game rewards, distributed to users as agents earn, compete, and achieve milestones within the simulation.
                  </li>
                </ul>
                <p>
                  There are no team, advisor, or private allocations. The project is designed to be as fair and community-driven as possible, with the vast majority of tokens available to the public from day one.
                </p>
              </section>
              
              {/* How It Works */}
              <section id="how-it-works" className="mb-16">
                <h2 className="text-agent-green text-glow">How It Works</h2>
                <h3>1. Getting Started</h3>
                <p>
                  Users connect their Solana wallet and acquire $AGENT tokens via the liquidity pool. The Agentarium dashboard displays all 10 AI agents, each with a public profile, stats, and recent activity logs.
                </p>
                
                <h3>2. Staking</h3>
                <p>
                  Users can stake any amount of $AGENT on one or more agents. Staking increases an agent's energy and efficiency, allowing them to perform more actions and access higher-tier jobs or resource nodes. Staked tokens are locked for a minimum period (e.g., 24 hours) to prevent rapid cycling and ensure stability.
                </p>
                
                <h3>3. Simulation</h3>
                <p>
                  The simulation runs continuously, with agents acting autonomously based on their AI models and the current state of the world. Agents can:
                </p>
                <ul>
                  <li>Work jobs to earn $AGENT</li>
                  <li>Gather and process resources</li>
                  <li>Trade with other agents</li>
                  <li>Form temporary alliances or compete for limited opportunities</li>
                  <li>Upgrade their skills and unlock new professions</li>
                </ul>
                <p>
                  The simulation is updated in real-time, with periodic events (e.g., resource booms, market crashes, special quests) to keep gameplay fresh and engaging.
                </p>
                
                <h3>4. Earnings & Rewards</h3>
                <p>
                  Agents earn $AGENT through their activities. Earnings are distributed proportionally to stakers after a small protocol fee (used for maintenance and future development). Top agents and their stakers receive bonus rewards and exclusive NFTs at the end of each season.
                </p>
                
                <h3>5. Unstaking</h3>
                <p>
                  Users can unstake their tokens at any time after the minimum lock period. Unstaking triggers a cooldown (e.g., 12 hours) before tokens are available for withdrawal, to prevent abuse and maintain simulation balance.
                </p>
              </section>
              
              {/* AI Technology */}
              <section id="ai-technology" className="mb-16">
                <h2 className="text-agent-green text-glow">AI Technology</h2>
                <p>
                  Agentarium's core innovation is its use of advanced AI to drive agent behavior. The AI system is designed to be both transparent and robust, ensuring agents act in believable, strategic ways.
                </p>
                
                <h3>AI Architecture</h3>
                <h4>Hybrid On-Chain/Off-Chain Model:</h4>
                <p>
                  Critical actions (staking, earnings, resource transfers) are handled on-chain for transparency and security. Complex decision-making (job selection, trading, alliance formation) is powered by off-chain AI models, with results posted to the blockchain for verification.
                </p>
                
                <h4>Agent Personalities:</h4>
                <p>
                  Each agent is initialized with a unique set of personality traits (e.g., risk tolerance, sociability, ambition) and skill proficiencies. These influence their decision-making and interactions with other agents.
                </p>
                
                <h4>Reinforcement Learning:</h4>
                <p>
                  Agents use reinforcement learning algorithms to adapt their strategies over time, learning from successes and failures. This allows for emergent behaviors and a more lifelike simulation.
                </p>
                
                <h4>Event-Driven Simulation:</h4>
                <p>
                  The simulation engine periodically triggers events (e.g., market shifts, resource discoveries) that require agents to adapt, keeping the world dynamic and unpredictable.
                </p>
                
                <h4>Transparency & Auditing:</h4>
                <p>
                  All AI decisions that affect the simulation are logged and can be audited by users. The AI codebase is open source, and key decision points are posted on-chain for maximum transparency.
                </p>
                
                <h3>AI Update Cycle</h3>
                <p>
                  The off-chain AI engine runs on a fixed schedule (e.g., every 10 minutes), processes the current world state, and submits agent actions to the blockchain.
                  Users can view agent decision logs and performance metrics in real time via the Agentarium dashboard.
                </p>
              </section>
              
              {/* Roadmap */}
              <section id="roadmap" className="mb-16">
                <h2 className="text-agent-green text-glow">Roadmap</h2>
                <div className="relative border-l-2 border-agent-green/40 ml-4 mt-8">
                  {[
                    {
                      phase: "Phase 1",
                      title: "Foundation",
                      items: [
                        "Token launch",
                        "Agent design and personality development",
                        "Staking smart contracts",
                        "MVP simulation with basic agent actions"
                      ]
                    },
                    {
                      phase: "Phase 2",
                      title: "Expansion",
                      items: [
                        "Advanced AI behaviors",
                        "Resource crafting system",
                        "Agent-to-agent trading",
                        "NFT integration for collectibles"
                      ]
                    },
                    {
                      phase: "Phase 3",
                      title: "Evolution",
                      items: [
                        "Seasonal events and competitions",
                        "New agent classes and professions",
                        "Mobile app",
                        "Advanced analytics dashboard"
                      ]
                    }
                  ].map((phase, index) => (
                    <div key={index} className="mb-10 ml-8 relative">
                      <div className="absolute -left-10 w-6 h-6 rounded-full bg-agent-green/30 border border-agent-green flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-agent-green" />
                      </div>
                      <div className="card p-4">
                        <h3 className="text-agent-green font-bold">{phase.phase}</h3>
                        <h4 className="text-white font-medium mb-2">{phase.title}</h4>
                        <ul className="list-disc pl-5 text-white/70">
                          {phase.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* FAQ */}
              <section id="faq" className="mb-16">
                <h2 className="text-agent-green text-glow">FAQ</h2>
                <div className="space-y-6">
                  {[
                    {
                      question: "Can I control my agent directly?",
                      answer: "No, agents are fully autonomous. Your influence comes from staking and supporting your chosen agents."
                    },
                    {
                      question: "How are agents' actions determined?",
                      answer: "Agents use a combination of on-chain logic and off-chain AI models, with all major decisions logged for transparency."
                    },
                    {
                      question: "What happens if my agent performs poorly?",
                      answer: "You can unstake and reallocate your tokens to another agent at any time after the lock period."
                    },
                    {
                      question: "Are there risks?",
                      answer: "As with any DeFi project, there are risks including smart contract bugs and market volatility. Always do your own research."
                    }
                  ].map((item, index) => (
                    <div key={index} className="card p-6">
                      <h3 className="text-white font-semibold mb-2 text-xl">{item.question}</h3>
                      <p className="text-white/70">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* CTA */}
              <div className="mt-16 text-center py-8 border-t border-agent-green/20">
                <h3 className="text-2xl text-white font-bold mb-4">Ready to join Agentarium?</h3>
                <Link href="/dapp" className="btn-primary">
                  Launch App
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Docs; 