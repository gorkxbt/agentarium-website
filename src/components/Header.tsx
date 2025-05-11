import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import GlowButton from './GlowButton';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Navigation links
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Agents', href: '/#agents' },
    { label: 'Gameplay', href: '/#gameplay' },
    { label: 'Tokenomics', href: '/#tokenomics' },
    { label: 'Documentation', href: '/docs' }
  ];
  
  // Check if a link is active
  const isLinkActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href) || router.asPath === href;
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
  
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-agent-black/80 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-responsive flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-agent-green-muted/20 flex items-center justify-center border border-agent-green-muted/30">
              <span className="text-agent-green text-xl">🤖</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-xl">Agent<span className="text-agent-green text-glow">arium</span></span>
            </div>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              <div
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isLinkActive(link.href)
                    ? 'text-agent-green bg-agent-green-muted/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {isLinkActive(link.href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="h-0.5 bg-agent-green mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            </Link>
          ))}
        </nav>
        
        {/* CTAs */}
        <div className="hidden md:flex items-center space-x-3">
          <Link href="/docs">
            <GlowButton variant="outline" size="sm">
              Documentation
            </GlowButton>
          </Link>
          <Link href="/dapp">
            <GlowButton
              variant="primary"
              size="sm"
              icon={
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
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
              Enter App
            </GlowButton>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white p-2 rounded-md focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-agent-black/90 backdrop-blur-lg border-t border-white/5 overflow-hidden"
          >
            <div className="container-responsive py-4 space-y-2">
              {navLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  <div
                    className={`px-4 py-3 rounded-md text-sm font-medium block transition-all duration-300 ${
                      isLinkActive(link.href)
                        ? 'text-agent-green bg-agent-green-muted/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </div>
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                <Link href="/docs">
                  <GlowButton variant="outline" size="sm" fullWidth>
                    Documentation
                  </GlowButton>
                </Link>
                <Link href="/dapp">
                  <GlowButton variant="primary" size="sm" fullWidth>
                    Enter App
                  </GlowButton>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header; 