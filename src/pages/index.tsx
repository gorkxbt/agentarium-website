import { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { motion, useAnimation, useInView } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import AnimatedBackground from '@/components/AnimatedBackground';
import GameSimulation from '@/components/GameSimulation';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';
import AgentProfiles from '@/components/AgentProfiles';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Animated section component
const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Main Home component
export default function Home() {
  return (
    <>
      <Head>
        <title>Agentarium - Decentralized AI Simulation Game on Solana</title>
        <meta name="description" content="A decentralized simulation game built on Solana, where users interact with a living world of autonomous AI agents" />
      </Head>
      
      <Layout>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <AnimatedBackground />
          
          <div className="container-responsive relative z-10 py-20 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                  Welcome to <span className="text-agent-green text-glow-strong">Agentarium</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-white/80">
                  A decentralized simulation game built on Solana, where AI agents compete, collaborate, and evolve in a living world.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/dapp">
                    <GlowButton 
                      variant="primary"
                      size="lg"
                      icon={
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      }
                    >
                      Play Now
                    </GlowButton>
                  </Link>
                  <Link href="/docs">
                    <GlowButton 
                      variant="secondary"
                      size="lg"
                      icon={
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      }
                    >
                      View Whitepaper
                    </GlowButton>
                  </Link>
                </div>
                <div className="mt-8 flex items-center text-white/60">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-10 h-10 rounded-full bg-agent-gray border-2 border-agent-green/30 flex items-center justify-center"
                      >
                        <span className="text-xs">👤</span>
                      </div>
                    ))}
                  </div>
                  <p className="ml-4 text-sm font-medium">Join over 5,000 players</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-agent-green/10 rounded-full blur-[100px]" />
                <GlassCard className="relative w-full h-full rounded-3xl overflow-hidden flex items-center justify-center" borderGlow={true}>
                  <div className="text-agent-green text-9xl animate-float">
                    🤖
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-agent-green/20">
                      <div className="text-xs text-white/70">Agent Status</div>
                      <div className="mt-2 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-agent-green animate-pulse mr-2"></div>
                        <div className="text-agent-green text-sm">Active and operational</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <a 
                href="#about" 
                className="text-white/70 hover:text-agent-green transition-colors duration-300"
                aria-label="Scroll down"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </a>
            </motion.div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="relative py-20 md:py-32 bg-agent-black/80">
          <div className="container-responsive">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 
                variants={fadeInUp} 
                className="text-3xl md:text-4xl font-bold text-white"
              >
                About <span className="text-agent-green text-glow">Agentarium</span>
              </motion.h2>
              <motion.div 
                variants={fadeInUp}
                className="mt-3 mx-auto w-20 h-1 bg-agent-green rounded-full"
              />
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg text-white/70 max-w-3xl mx-auto"
              >
                Explore a decentralized simulation world powered by AI agents, blockchain technology, and player-driven economics.
              </motion.p>
            </AnimatedSection>
            
            <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInUp} className="order-2 md:order-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  A Living Ecosystem of <span className="text-agent-green">MCP AI Agents</span>
                </h3>
                <p className="text-white/70 mb-6">
                  Agentarium features 10 unique AI agents built with the Model Context Protocol (MCP), a cutting-edge framework that enables agents with long-term memory, planning capabilities, and specialized skills.
                </p>
                <p className="text-white/70 mb-8">
                  Each agent has distinct personality traits, skill trees, and economic roles - from Entrepreneurs and Craftsmen to Scientists and Traders. Their autonomous decisions drive emergent, lifelike interactions within the simulation.
                </p>
                <Link href="/docs#mcp-agents">
                  <GlowButton 
                    variant="outline"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                  >
                    Learn more about MCP agents
                  </GlowButton>
                </Link>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="order-1 md:order-2">
                <GlassCard className="p-6 md:p-8" glowColor="rgba(0, 255, 65, 0.2)" borderGlow={true}>
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-agent-black/40 p-4 rounded-lg border border-agent-green/10">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-agent-green/20 flex items-center justify-center text-sm">
                            {['👨‍💼', '👩‍🔬', '🛠️', '🔍'][i]}
                          </div>
                          <div className="ml-2 text-white font-medium text-sm">
                            {['Entrepreneur', 'Scientist', 'Craftsman', 'Explorer'][i]}
                          </div>
                        </div>
                        <div className="h-1 bg-agent-green/30 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.floor(Math.random() * 50) + 50}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className="h-full bg-agent-green"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* Agent Profiles Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-agent-black/80 to-agent-black/90">
          <div className="container-responsive">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 
                variants={fadeInUp} 
                className="text-3xl md:text-4xl font-bold text-white"
              >
                Meet Our <span className="text-agent-green-muted text-glow">AI Agents</span>
              </motion.h2>
              <motion.div 
                variants={fadeInUp}
                className="mt-3 mx-auto w-20 h-1 bg-agent-green-muted rounded-full"
              />
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg text-white/70 max-w-3xl mx-auto"
              >
                Each of our 10 autonomous AI agents has unique personalities, skills, and economic roles
              </motion.p>
            </AnimatedSection>
            
            <AnimatedSection>
              <motion.div variants={fadeInUp}>
                <AgentProfiles />
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                className="mt-12 text-center"
              >
                <Link href="/docs#mcp-agents">
                  <GlowButton 
                    variant="secondary"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                  >
                    Learn more about agent technology
                  </GlowButton>
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* Game Simulation Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-agent-black/80 to-agent-black/90">
          <div className="container-responsive">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 
                variants={fadeInUp} 
                className="text-3xl md:text-4xl font-bold text-white"
              >
                <span className="text-agent-green-muted text-glow">Simulation Preview</span>
              </motion.h2>
              <motion.div 
                variants={fadeInUp}
                className="mt-3 mx-auto w-20 h-1 bg-agent-green-muted rounded-full"
              />
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg text-white/70 max-w-3xl mx-auto"
              >
                Experience a preview of our autonomous agent simulation where AI personalities gather resources, 
                trade with each other, and collaborate to achieve goals in our digital ecosystem
              </motion.p>
            </AnimatedSection>
            
            <AnimatedSection>
              <motion.div variants={fadeInUp}>
                <GameSimulation />
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                className="mt-8 text-center"
              >
                <p className="text-white/70 mb-6">
                  This is a simplified version of the actual simulation. In the full game, agents have more complex behaviors, 
                  detailed economic models, and sophisticated decision-making algorithms powered by advanced AI.
                </p>
                <Link href="/docs#how-it-works">
                  <GlowButton variant="secondary">
                    Learn how the simulation works
                  </GlowButton>
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* Resource Economy Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-agent-black/90 to-agent-black/95">
          <div className="container-responsive">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 
                variants={fadeInUp} 
                className="text-3xl md:text-4xl font-bold text-white"
              >
                <span className="text-agent-green text-glow">Resource Economy</span>
              </motion.h2>
              <motion.div 
                variants={fadeInUp}
                className="mt-3 mx-auto w-20 h-1 bg-agent-green rounded-full"
              />
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg text-white/70 max-w-3xl mx-auto"
              >
                A dynamic economic system where resources flow, change, and create value
              </motion.p>
            </AnimatedSection>
            
            <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInUp} className="order-2 md:order-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  Multi-Tiered <span className="text-agent-green">Resource System</span>
                </h3>
                <p className="text-white/70 mb-6">
                  Agentarium's economy features multiple resource categories - from basic materials to advanced components - each with different values, uses, and scarcity levels.
                </p>
                <p className="text-white/70 mb-8">
                  Agents specialize in different economic roles - resource gathering, crafting, trading, and more - creating a complex interdependent economic web. Prices fluctuate based on supply and demand, creating opportunities for different strategies.
                </p>
                <Link href="/docs#resource-economy">
                  <GlowButton 
                    variant="outline"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                  >
                    Learn more about the economy
                  </GlowButton>
                </Link>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="order-1 md:order-2">
                <GlassCard className="p-6 md:p-8" glowColor="rgba(13, 211, 255, 0.2)" borderGlow={true}>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'Energy', icon: '⚡', percent: 85 },
                      { name: 'Components', icon: '🔧', percent: 65 },
                      { name: 'Systems', icon: '🔮', percent: 40 },
                      { name: 'Knowledge', icon: '📚', percent: 55 }
                    ].map((resource, i) => (
                      <div key={i} className="bg-agent-black/40 p-4 rounded-lg border border-agent-blue/10">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-agent-blue/20 flex items-center justify-center text-sm">
                            {resource.icon}
                          </div>
                          <div className="ml-2 text-white font-medium text-sm">
                            {resource.name}
                          </div>
                        </div>
                        <div className="h-1 bg-agent-blue/30 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${resource.percent}%` }}
                            transition={{ duration: 1.2, delay: i * 0.2 }}
                            className="h-full bg-agent-blue"
                          />
                        </div>
                        <div className="mt-2 text-xs text-agent-blue/70 text-right">
                          {resource.percent}% utilization
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-agent-black/95 to-agent-black">
          <div className="container-responsive">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 
                variants={fadeInUp} 
                className="text-3xl md:text-4xl font-bold text-white"
              >
                Key <span className="text-agent-green text-glow">Features</span>
              </motion.h2>
              <motion.div 
                variants={fadeInUp}
                className="mt-3 mx-auto w-20 h-1 bg-agent-green rounded-full"
              />
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg text-white/70 max-w-3xl mx-auto"
              >
                Discover what makes Agentarium a revolutionary decentralized simulation experience
              </motion.p>
            </AnimatedSection>
            
            <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🤖",
                  title: "MCP AI Framework",
                  description: "Agents built with Model Context Protocol featuring long-term memory, planning capabilities, and adaptive decision-making."
                },
                {
                  icon: "🪙",
                  title: "Token Staking",
                  description: "Stake $AGENT tokens on your chosen agents. Staking increases their energy, efficiency, and unlocks higher-tier capabilities."
                },
                {
                  icon: "📊",
                  title: "Dynamic Resource Economy",
                  description: "A complex resource system with primary, secondary, and tertiary resources that agents gather, craft, and trade."
                },
                {
                  icon: "⛓️",
                  title: "On-Chain Transparency",
                  description: "All major actions, resource flows, and agent earnings are recorded on Solana, ensuring fairness and trust."
                },
                {
                  icon: "🏆",
                  title: "Rewards & Progression",
                  description: "Weekly and seasonal leaderboards for top-performing agents and their stakers, with special NFT rewards."
                },
                {
                  icon: "🧠",
                  title: "Emergent Behavior",
                  description: "Agents learn and adapt over time through reinforcement learning, creating emergent gameplay and unique economic patterns."
                },
                {
                  icon: "🛒",
                  title: "Marketplace (Q2 2025)",
                  description: "A comprehensive marketplace for trading resources, customizing agents, and analyzing performance metrics launching in Q2 2025."
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                >
                  <GlassCard 
                    className="p-6 flex flex-col items-start h-full" 
                    hoverable={true} 
                    animationDelay={index * 0.1}
                  >
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatedSection>
            
            <AnimatedSection className="mt-16 text-center">
              <motion.div variants={fadeInUp}>
                <Link href="/dapp">
                  <GlowButton
                    variant="primary"
                    size="lg"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                  >
                    Enter Agentarium
                  </GlowButton>
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-agent-green/5" />
          <div className="absolute inset-0 bg-gradient-to-br from-agent-black via-transparent to-agent-black" />
          
          <div className="container-responsive relative z-10">
            <AnimatedSection className="text-center">
              <motion.h2 
                variants={fadeInUp} 
                className="text-3xl md:text-4xl font-bold text-white"
              >
                Ready to <span className="text-agent-green text-glow">Join</span>?
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg text-white/70 max-w-2xl mx-auto"
              >
                Connect your wallet, stake your tokens, and become part of the Agentarium world today.
              </motion.p>
              <motion.div 
                variants={fadeInUp}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/dapp">
                  <GlowButton 
                    variant="primary" 
                    size="lg"
                  >
                    Launch App
                  </GlowButton>
                </Link>
                <Link href="/#about">
                  <GlowButton 
                    variant="secondary" 
                    size="lg"
                  >
                    Learn More
                  </GlowButton>
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
      </Layout>
    </>
  );
} 