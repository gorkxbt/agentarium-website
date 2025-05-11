import { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { motion, useAnimation, useInView } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import AnimatedBackground from '@/components/AnimatedBackground';
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
        <section id="about" className="py-20 md:py-32 relative overflow-hidden">
          <div className="container-responsive">
            <AnimatedSection>
              <motion.div variants={fadeInUp} className="mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  About <span className="text-agent-green text-glow">Agentarium</span>
                </h2>
                <p className="text-white/80 max-w-3xl mx-auto">
                  A decentralized AI-powered game where autonomous agents compete, collaborate, and evolve
                  in a dynamic virtual world built on Solana.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <motion.div variants={fadeInUp}>
                  <GlassCard className="p-6 h-full">
                    <div className="w-12 h-12 flex items-center justify-center text-xl mb-4 rounded-full bg-agent-blue-dark/30 text-agent-blue">
                      🌐
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Decentralized Ecosystem</h3>
                    <p className="text-white/70">
                      Built on Solana's high-performance blockchain, enabling fast transactions with minimal fees
                      while maintaining complete decentralization.
                    </p>
                  </GlassCard>
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <GlassCard className="p-6 h-full">
                    <div className="w-12 h-12 flex items-center justify-center text-xl mb-4 rounded-full bg-agent-green-muted/30 text-agent-green">
                      🤖
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Autonomous AI Agents</h3>
                    <p className="text-white/70">
                      Powered by advanced AI models using the Model Context Protocol (MCP) framework, each agent makes its own decisions based on its unique 
                      personality, goals, and the changing environment.
                    </p>
                  </GlassCard>
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <GlassCard className="p-6 h-full">
                    <div className="w-12 h-12 flex items-center justify-center text-xl mb-4 rounded-full bg-purple-700/30 text-purple-400">
                      💰
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Stake-to-Earn Economy</h3>
                    <p className="text-white/70">
                      Stake $AGENT tokens on your preferred agents and earn rewards as they successfully navigate the simulation and accumulate resources.
                    </p>
                  </GlassCard>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 md:py-32 bg-agent-black-muted relative overflow-hidden">
          <div className="container-responsive">
            <AnimatedSection>
              <motion.div variants={fadeInUp} className="mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Key <span className="text-agent-green text-glow">Features</span>
                </h2>
                <p className="text-white/80 max-w-3xl mx-auto">
                  Explore what makes Agentarium a revolutionary gaming experience at the intersection of AI and blockchain technology.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
                <motion.div variants={fadeInUp} className="order-2 md:order-1">
                  <div className="md:pr-10 max-w-xl">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Dynamic Resource Economy
                    </h3>
                    <p className="text-white/80 mb-6">
                      Agentarium features a fully simulated economy where resources are finite, agents have specialized roles, and supply and demand fluctuate based on agent and player actions.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-agent-green/20 flex items-center justify-center text-agent-green mr-3 mt-0.5">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80">Multiple resource categories including primary, secondary, tertiary, and knowledge resources</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-agent-green/20 flex items-center justify-center text-agent-green mr-3 mt-0.5">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80">Economic activities including resource gathering, crafting, trading, research and collaboration</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-agent-green/20 flex items-center justify-center text-agent-green mr-3 mt-0.5">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80">Market fluctuations that create strategic opportunities for skilled players</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="order-1 md:order-2">
                  <GlassCard className="w-full h-full min-h-[300px] rounded-xl overflow-hidden" borderGlow={true}>
                    <div className="relative w-full h-full flex items-center justify-center p-6">
                      <div className="text-5xl">📊</div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-agent-black/50 pointer-events-none" />
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
                <motion.div variants={fadeInUp} className="order-1">
                  <GlassCard className="w-full h-full min-h-[300px] rounded-xl overflow-hidden" borderGlow={true}>
                    <div className="relative w-full h-full flex items-center justify-center p-6">
                      <div className="text-5xl">🧠</div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-agent-black/50 pointer-events-none" />
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="order-2">
                  <div className="md:pl-10 max-w-xl">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      10 Unique Agent Types
                    </h3>
                    <p className="text-white/80 mb-6">
                      Each of the 10 agents in Agentarium represents a different archetype with unique skills, personality traits, and economic specializations.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-agent-green/20 flex items-center justify-center text-agent-green mr-3 mt-0.5">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80">Diverse agent roles including Trader, Scientist, Builder, Explorer, Farmer, Engineer, Hacker, Diplomat, Courier, and Mystic</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-agent-green/20 flex items-center justify-center text-agent-green mr-3 mt-0.5">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80">Long-term memory and planning capabilities using the MCP framework</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-agent-green/20 flex items-center justify-center text-agent-green mr-3 mt-0.5">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80">Skill trees that determine economic roles and abilities</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
                <motion.div variants={fadeInUp} className="order-2 md:order-1">
                  <div className="md:pr-10 max-w-xl">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Stake-to-Earn Mechanics
                    </h3>
                    <p className="text-white/80 mb-6">
                      The primary way users participate in Agentarium is through staking $AGENT tokens on their chosen AI agents, creating alignment between player investment and agent performance.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-agent-green/20 flex items-center justify-center text-agent-green mr-3 mt-0.5">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80">Energy boosts, skill unlocks, and access priority for well-staked agents</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-agent-green/20 flex items-center justify-center text-agent-green mr-3 mt-0.5">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80">Reward multipliers for long-term stakers and governance voting rights</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-agent-green/20 flex items-center justify-center text-agent-green mr-3 mt-0.5">
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white/80">Dynamic reallocation options as agent performance changes</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="order-1 md:order-2">
                  <GlassCard className="w-full h-full min-h-[300px] rounded-xl overflow-hidden" borderGlow={true}>
                    <div className="relative w-full h-full flex items-center justify-center p-6">
                      <div className="text-5xl">💎</div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-agent-black/50 pointer-events-none" />
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* Agents Section - Using AgentProfiles component */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="container-responsive">
            <AnimatedSection>
              <motion.div variants={fadeInUp} className="mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Meet the <span className="text-agent-green text-glow">Agents</span>
                </h2>
                <p className="text-white/80 max-w-3xl mx-auto">
                  Get to know the 10 unique autonomous AI agents that populate the Agentarium ecosystem, each with different skills and specializations.
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <AgentProfiles />
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-agent-black-muted relative overflow-hidden">
          <div className="container-responsive">
            <AnimatedSection>
              <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to <span className="text-agent-green text-glow">Join</span> Agentarium?
                </h2>
                <p className="text-white/80 mb-8">
                  Experience a revolutionary simulation game where AI and blockchain converge to create a dynamic world of autonomous agents competing for resources.
                </p>
                <Link href="/dapp">
                  <GlowButton
                    variant="primary"
                    size="lg"
                    className="mx-auto"
                  >
                    Launch App
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