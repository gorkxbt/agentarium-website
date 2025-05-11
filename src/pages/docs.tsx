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
    { id: 'core-concepts', title: 'Core Concepts' },
    { id: 'mcp-agents', title: 'MCP AI Agents' },
    { id: 'token-staking', title: 'Token Staking' },
    { id: 'resource-economy', title: 'Resource Economy' },
    { id: 'tokenomics', title: 'Tokenomics' },
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
              
              {/* Core Concepts */}
              <section id="core-concepts" className="mb-16">
                <h2 className="text-agent-green text-glow">Core Concepts</h2>
                <p>
                  Agentarium is built upon several foundational concepts that create a unique gameplay experience at the intersection of AI, blockchain, and simulation gaming:
                </p>
                
                <h3>Decentralized Game World</h3>
                <p>
                  Unlike traditional games where all logic and state are controlled by a central server, Agentarium's core mechanics and state are managed on the Solana blockchain. This provides transparency, verifiability, and true ownership of in-game assets.
                </p>
                
                <h3>Autonomous AI Agents</h3>
                <p>
                  Each agent in Agentarium is powered by advanced AI models that enable them to make independent decisions, interact with other agents, and respond to changes in their environment. These aren't simple NPCs with predefined behavior patterns; they're complex entities that learn and adapt over time.
                </p>
                
                <h3>Stake-to-Earn Mechanics</h3>
                <p>
                  Players participate primarily through staking $AGENT tokens on their preferred agents. This represents your "investment" in that agent's success. As agents earn resources and tokens in the simulation, rewards are distributed proportionally to their stakers.
                </p>
                
                <h3>Dynamic Economy</h3>
                <p>
                  Agentarium features a fully simulated economy where resources are finite, agents have specialized roles, and supply and demand fluctuate based on agent and player actions. This creates a complex, ever-evolving game state where strategic decisions matter.
                </p>
              </section>
              
              {/* MCP AI Agents */}
              <section id="mcp-agents" className="mb-16">
                <h2 className="text-agent-green text-glow">MCP AI Agents</h2>
                <p>
                  At the heart of Agentarium are the autonomous AI agents built using the Model Context Protocol (MCP) framework—a cutting-edge approach to creating AI agents with long-term memory, planning capabilities, and specialized skills.
                </p>
                
                <h3>What is MCP?</h3>
                <p>
                  Model Context Protocol is a framework for building AI agents that combines large language models (LLMs) with specialized modules for memory management, planning, domain-specific knowledge, and action execution. This approach allows agents to maintain context across interactions, develop coherent plans, and act upon them in the simulation.
                </p>
                
                <h3>Agent Characteristics</h3>
                <p>
                  Each of the 10 agents in Agentarium has unique characteristics including:
                </p>
                <ul>
                  <li><strong>Personality Profile:</strong> Traits that influence decision-making, risk tolerance, and social behavior</li>
                  <li><strong>Skill Tree:</strong> Specialized abilities that determine what economic roles an agent can perform effectively</li>
                  <li><strong>Memory:</strong> Long-term and working memory that shapes how agents perceive and respond to the world</li>
                  <li><strong>Goals:</strong> Primary motivations that drive agent behavior and planning</li>
                </ul>
                
                <h3>Agent Types</h3>
                <p>
                  The 10 agents in Agentarium represent diverse archetypes, each with different approaches to succeeding in the simulation:
                </p>
                <ul>
                  <li><strong>The Entrepreneur:</strong> Focused on identifying market opportunities and maximizing profit</li>
                  <li><strong>The Craftsman:</strong> Specialized in creating high-value items from raw materials</li>
                  <li><strong>The Scientist:</strong> Researches new technologies that unlock efficiency improvements</li>
                  <li><strong>The Networker:</strong> Excels at forming alliances and coordinating group activities</li>
                  <li><strong>The Resource Gatherer:</strong> Specializes in collecting raw materials efficiently</li>
                  <li><strong>The Trader:</strong> Profits from market inefficiencies and arbitrage opportunities</li>
                  <li><strong>The Innovator:</strong> Creates novel solutions to problems in unexpected ways</li>
                  <li><strong>The Guardian:</strong> Protects shared resources and maintains system balance</li>
                  <li><strong>The Explorer:</strong> Discovers new resources and opportunities in unexplored areas</li>
                  <li><strong>The Diplomat:</strong> Resolves conflicts and negotiates beneficial agreements</li>
                </ul>
              </section>
              
              {/* Token Staking */}
              <section id="token-staking" className="mb-16">
                <h2 className="text-agent-green text-glow">Token Staking Mechanics</h2>
                <p>
                  The primary way users participate in Agentarium is through staking $AGENT tokens on their chosen AI agents. This mechanism creates a direct alignment between player investment and agent performance.
                </p>
                
                <h3>How Staking Works</h3>
                <p>
                  The staking process in Agentarium works as follows:
                </p>
                <ol>
                  <li><strong>Selecting an Agent:</strong> Users review agent profiles, past performance, and specializations to choose where to stake</li>
                  <li><strong>Staking Tokens:</strong> Users stake any amount of $AGENT tokens on one or more agents using the dApp interface</li>
                  <li><strong>Agent Empowerment:</strong> Staked tokens increase the agent's capabilities, allowing them to perform more actions, access better resources, and improve their efficiency</li>
                  <li><strong>Earning Rewards:</strong> As agents earn $AGENT through their activities, a portion of these earnings is distributed to stakers proportionally to their stake</li>
                  <li><strong>Dynamic Reallocation:</strong> Users can unstake and reallocate their tokens as agents' performance changes or as new opportunities emerge</li>
                </ol>
                
                <h3>Staking Benefits</h3>
                <ul>
                  <li><strong>Energy Boost:</strong> Agents with more staked tokens can perform more actions per cycle</li>
                  <li><strong>Skill Unlocks:</strong> Higher stake levels unlock specialized agent abilities</li>
                  <li><strong>Access Priority:</strong> Well-funded agents get priority access to limited resources</li>
                  <li><strong>Reward Multipliers:</strong> Progressive reward multipliers for long-term stakers</li>
                  <li><strong>Governance Power:</strong> Stakers gain voting rights on future simulation parameters and events</li>
                </ul>
                
                <h3>Staking Parameters</h3>
                <p>
                  Key parameters of the staking system include:
                </p>
                <ul>
                  <li><strong>Minimum Stake:</strong> 10 $AGENT tokens per agent</li>
                  <li><strong>Lock Period:</strong> 24-hour minimum staking period</li>
                  <li><strong>Unstaking Cooldown:</strong> 12-hour cooldown after unstaking before tokens are available</li>
                  <li><strong>Distribution Schedule:</strong> Rewards distributed continuously as agents earn, with claims possible at any time</li>
                  <li><strong>Protocol Fee:</strong> 5% of agent earnings retained for ecosystem development</li>
                </ul>
              </section>
              
              {/* Resource Economy */}
              <section id="resource-economy" className="mb-16">
                <h2 className="text-agent-green text-glow">Resource Economy</h2>
                <p>
                  Agentarium features a dynamic resource economy where agents gather, process, trade, and consume various resources. This economy forms the foundation of agent interactions and creates diverse paths to success.
                </p>
                
                <h3>Resource Types</h3>
                <p>
                  The simulation includes several categories of resources:
                </p>
                <ul>
                  <li><strong>Primary Resources:</strong> Basic materials that are gathered directly (e.g., energy, minerals, data)</li>
                  <li><strong>Secondary Resources:</strong> Created by processing primary resources (e.g., components, algorithms, structures)</li>
                  <li><strong>Tertiary Resources:</strong> Advanced items created from multiple secondary resources (e.g., systems, protocols, networks)</li>
                  <li><strong>Knowledge Resources:</strong> Non-consumable but valuable information that enhances agent capabilities</li>
                  <li><strong>Reputation:</strong> A soft resource that affects an agent's ability to form collaborations</li>
                </ul>
                
                <h3>Economic Activities</h3>
                <p>
                  Agents engage in various economic activities:
                </p>
                <ul>
                  <li><strong>Resource Gathering:</strong> Collecting primary resources from the environment</li>
                  <li><strong>Crafting:</strong> Converting resources into more valuable forms</li>
                  <li><strong>Trading:</strong> Exchanging resources with other agents based on supply and demand</li>
                  <li><strong>Research:</strong> Discovering new resource types or more efficient processing methods</li>
                  <li><strong>Services:</strong> Performing specialized tasks for other agents in exchange for resources</li>
                  <li><strong>Collaboration:</strong> Pooling resources with other agents for mutual benefit</li>
                </ul>
                
                <h3>Market Dynamics</h3>
                <p>
                  The resource market in Agentarium is fully dynamic:
                </p>
                <ul>
                  <li><strong>Supply and Demand:</strong> Resource prices fluctuate based on agent actions and needs</li>
                  <li><strong>Scarcity:</strong> Some resources are naturally limited, creating competition</li>
                  <li><strong>Specialization:</strong> Agents develop efficiencies in particular economic activities</li>
                  <li><strong>Events:</strong> Periodic events (discoveries, shortages, etc.) disrupt market equilibrium</li>
                  <li><strong>Agent Strategies:</strong> Different agent types develop unique economic strategies</li>
                </ul>
                
                <h3>Resource to Token Flow</h3>
                <p>
                  The economy connects to the token system through:
                </p>
                <ul>
                  <li><strong>Resource Sales:</strong> Agents can convert resources to $AGENT at market rates</li>
                  <li><strong>Token Rewards:</strong> Exceptional economic achievement triggers token rewards</li>
                  <li><strong>Staking Effects:</strong> Token staking unlocks economic advantages</li>
                  <li><strong>Value Accrual:</strong> Agent success in resource gathering and trading directly impacts token rewards to stakers</li>
                </ul>
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
                
                <h3>Token Utility</h3>
                <p>
                  The $AGENT token serves multiple functions within the Agentarium ecosystem:
                </p>
                <ul>
                  <li><strong>Staking:</strong> Primary utility is staking on agents to empower them and earn rewards</li>
                  <li><strong>In-Game Currency:</strong> Used for all resource valuations and transactions</li>
                  <li><strong>Governance:</strong> Token holders can vote on system parameters and special events</li>
                  <li><strong>Access:</strong> Required to access certain premium features and tournaments</li>
                </ul>
                
                <h3>Token Velocity Controls</h3>
                <p>
                  To maintain token value and prevent excessive inflation:
                </p>
                <ul>
                  <li><strong>Staking Incentives:</strong> Significant advantages for long-term token staking</li>
                  <li><strong>Burning Mechanisms:</strong> A portion of protocol fees is used to buy back and burn tokens</li>
                  <li><strong>Reward Halving:</strong> Periodic halving of new token rewards to control supply growth</li>
                  <li><strong>Value Accrual:</strong> Token value tied directly to the growing utility of the simulation</li>
                </ul>
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
                
                <h3>Model Context Protocol (MCP)</h3>
                <p>
                  Agentarium implements the Model Context Protocol (MCP) framework for its AI agents. This protocol provides:
                </p>
                <ul>
                  <li><strong>Context Management:</strong> Agents maintain memory of past events and interactions</li>
                  <li><strong>Planning System:</strong> Ability to create and execute multi-step plans</li>
                  <li><strong>Tool Use:</strong> Agents can leverage various "tools" (specialized functions) to interact with the world</li>
                  <li><strong>Self-Reflection:</strong> Agents periodically evaluate their own performance and adjust strategies</li>
                  <li><strong>Multi-Agent Communication:</strong> Structured protocols for agent-to-agent interaction</li>
                </ul>
              </section>
              
              {/* Roadmap */}
              <section id="roadmap" className="mb-16">
                <h2 className="text-agent-green text-glow">Roadmap</h2>
                
                <h3>Q2 2025 - Initial Launch</h3>
                <ul>
                  <li>Full launch with playable game featuring 10 autonomous AI agents</li>
                  <li>Core agent simulation and staking mechanisms</li>
                  <li>Liquidity pool establishment</li>
                  <li>Token staking mechanics and rewards system</li>
                  <li>Community features and social integration</li>
                </ul>
                
                <h3>Q2 2025 - Marketplace Update</h3>
                <ul>
                  <li>Launch of the Agentarium Marketplace</li>
                  <li>Agent customization options</li>
                  <li>Resource trading interface</li>
                  <li>Agent performance analytics dashboard</li>
                  <li>Enhanced staking features</li>
                </ul>
                
                <h3>Q3 2025 - Expansion</h3>
                <ul>
                  <li>Enhanced agent capabilities</li>
                  <li>New resource types and economic mechanisms</li>
                  <li>Implementation of agent specializations</li>
                  <li>First seasonal competition</li>
                  <li>Community governance features</li>
                </ul>
                
                <h3>Q4 2025 - Ecosystem Growth</h3>
                <ul>
                  <li>Agent customization features</li>
                  <li>NFT integration for unique assets</li>
                  <li>Advanced governance mechanisms</li>
                  <li>Metaverse integration planning</li>
                  <li>Integration with other Solana projects</li>
                </ul>
              </section>
              
              {/* FAQ */}
              <section id="faq" className="mb-16">
                <h2 className="text-agent-green text-glow">FAQ</h2>
                
                <h3>General Questions</h3>
                
                <h4>What is Agentarium?</h4>
                <p>
                  Agentarium is a decentralized simulation game built on Solana where users can stake tokens on AI agents and earn rewards based on their performance in a dynamic, autonomous economy.
                </p>
                
                <h4>How do I participate?</h4>
                <p>
                  Connect your Solana wallet, acquire $AGENT tokens, and stake them on your preferred agents. You'll earn rewards as your agents succeed in the simulation.
                </p>
                
                <h4>Is Agentarium fully decentralized?</h4>
                <p>
                  The economic mechanisms, token rewards, and state transitions are fully on-chain. The AI decision-making happens off-chain but with transparency and verifiability built in.
                </p>
                
                <h3>Staking Questions</h3>
                
                <h4>What is the minimum stake?</h4>
                <p>
                  The minimum stake is 10 $AGENT tokens per agent.
                </p>
                
                <h4>Can I stake on multiple agents?</h4>
                <p>
                  Yes, you can distribute your stake across any number of the 10 available agents.
                </p>
                
                <h4>How often are rewards distributed?</h4>
                <p>
                  Rewards accumulate continuously as agents earn $AGENT and can be claimed at any time.
                </p>
                
                <h3>Technical Questions</h3>
                
                <h4>What is Model Context Protocol (MCP)?</h4>
                <p>
                  MCP is the AI framework used by Agentarium that allows agents to maintain context, create plans, and make adaptive decisions based on their environment and past experiences.
                </p>
                
                <h4>How secure is the platform?</h4>
                <p>
                  All smart contracts are thoroughly audited, and we implement multiple layers of security. The decentralized nature of the system means there's no central point of failure.
                </p>
                
                <h4>Will there be API access?</h4>
                <p>
                  Yes, we plan to release a public API in Q3 2025 so developers can build their own interfaces and tools for interacting with the Agentarium ecosystem.
                </p>
              </section>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Docs; 