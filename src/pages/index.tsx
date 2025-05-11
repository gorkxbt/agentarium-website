import { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { motion, useAnimation, useInView } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

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

// Matrix rain animation
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }
    
    const characters = "01";
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00FF41';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 33);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-30"
    />
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
          <MatrixRain />
          
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
                  <Link 
                    href="/dapp" 
                    className="btn-primary"
                  >
                    Play Now
                  </Link>
                  <Link 
                    href="/docs" 
                    className="btn-secondary"
                  >
                    View Whitepaper
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
                <div className="relative w-full h-full">
                  {/* This would be replaced with an actual 3D model or image of an agent */}
                  <div className="glass-card w-full h-full rounded-3xl overflow-hidden flex items-center justify-center">
                    <div className="text-agent-green text-9xl animate-float">
                      🤖
                    </div>
                  </div>
                </div>
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
                <Link 
                  href="/docs#mcp-agents" 
                  className="inline-flex items-center text-agent-green hover:text-agent-green-light transition-colors duration-300"
                >
                  <span>Learn more about MCP agents</span>
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
                </Link>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="order-1 md:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-agent-green/20 to-agent-blue/20 rounded-lg blur-lg" />
                  <div className="card relative p-6 md:p-8">
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-agent-black/40 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-full bg-agent-green/20 flex items-center justify-center text-sm">
                              {['👨‍💼', '👩‍🔬', '🛠️', '🔍'][i]}
                            </div>
                            <div className="ml-2 text-white font-medium text-sm">
                              {['Entrepreneur', 'Scientist', 'Craftsman', 'Explorer'][i]}
                            </div>
                          </div>
                          <div className="h-1 bg-agent-green/30 rounded-full overflow-hidden">
                            <div className="h-full bg-agent-green" style={{ width: `${Math.floor(Math.random() * 50) + 50}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* Resource Economy Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-agent-black/80 to-agent-black/90">
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
                <Link 
                  href="/docs#resource-economy" 
                  className="inline-flex items-center text-agent-green hover:text-agent-green-light transition-colors duration-300"
                >
                  <span>Learn more about the economy</span>
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
                </Link>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="order-1 md:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-agent-blue/20 to-agent-green/20 rounded-lg blur-lg" />
                  <div className="card relative p-6 md:p-8">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: 'Energy', icon: '⚡', percent: 85 },
                        { name: 'Components', icon: '🔧', percent: 65 },
                        { name: 'Systems', icon: '🔮', percent: 40 },
                        { name: 'Knowledge', icon: '📚', percent: 55 }
                      ].map((resource, i) => (
                        <div key={i} className="bg-agent-black/40 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-full bg-agent-green/20 flex items-center justify-center text-sm">
                              {resource.icon}
                            </div>
                            <div className="ml-2 text-white font-medium text-sm">
                              {resource.name}
                            </div>
                          </div>
                          <div className="h-1 bg-agent-green/30 rounded-full overflow-hidden">
                            <div className="h-full bg-agent-green" style={{ width: `${resource.percent}%` }} />
                          </div>
                          <div className="mt-2 text-xs text-agent-green/70">
                            {resource.percent}% utilization
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-agent-black/90 to-agent-black">
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
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="card p-6 flex flex-col items-start"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </motion.div>
              ))}
            </AnimatedSection>
            
            <AnimatedSection className="mt-16 text-center">
              <motion.div variants={fadeInUp}>
                <Link 
                  href="/dapp" 
                  className="btn-primary"
                >
                  Enter Agentarium
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
                <Link 
                  href="/dapp" 
                  className="btn-primary"
                >
                  Launch App
                </Link>
                <Link 
                  href="/#about" 
                  className="btn-secondary"
                >
                  Learn More
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
      </Layout>
    </>
  );
} 