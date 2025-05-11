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
    { label: 'Home', href: '/' }
  ];

  // Social media links
  const socialLinks = [
    { 
      label: 'Telegram', 
      href: 'https://t.me/agentarium',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      )
    },
    { 
      label: 'GitHub', 
      href: 'https://github.com/gorkxbt/agentarium-website',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      label: 'Twitter', 
      href: 'https://twitter.com/agentarium',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )
    }
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
        
        {/* Desktop Navigation with Social Media Buttons */}
        <nav className="hidden md:flex items-center space-x-4">
          {/* Home link */}
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

          {/* Social media links - Prominently featured */}
          <div className="flex items-center space-x-2 ml-2">
            {socialLinks.map((social) => (
              <a 
                href={social.href} 
                key={social.label} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-agent-dark-gray hover:bg-agent-gray text-white/80 hover:text-white transition-all duration-300 flex items-center justify-center"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </nav>
        
        {/* CTAs */}
        <div className="hidden md:flex items-center space-x-3">
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

              {/* Social media links for mobile */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
                {socialLinks.map((social) => (
                  <a 
                    href={social.href} 
                    key={social.label} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-agent-light-gray/30 text-white hover:bg-agent-light-gray/50 transition-colors flex flex-col items-center justify-center"
                    aria-label={social.label}
                  >
                    {social.icon}
                    <span className="text-xs mt-1">{social.label}</span>
                  </a>
                ))}
              </div>
              
              {/* Mobile CTA */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link href="/dapp">
                  <div className="bg-agent-green text-black py-3 rounded-md text-center font-medium">
                    Enter App
                  </div>
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