import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import Head from 'next/head';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

export default function App({ Component, pageProps, router }: AppProps) {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );

  // Add scanline effect
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Check for WebGL initialization
  useEffect(() => {
    // Skip redirect for the WebGL init page itself
    if (router.pathname === '/webgl-init.html' || !mounted) {
      return;
    }
    
    // Check if we need to redirect to WebGL init page
    if (typeof window !== 'undefined') {
      const isWebGLInitialized = localStorage.getItem('webgl_initialized');
      const useWebGLInit = document.cookie.includes('use_webgl_init=true') ||
                           !!document.querySelector('meta[name="use-webgl-init"]');
      
      if (!isWebGLInitialized && useWebGLInit) {
        // Redirect to WebGL init page
        window.location.href = '/webgl-init.html';
      }
    }
  }, [router.pathname, mounted]);

  return (
    <>
      <Head>
        <title>Agentarium - Decentralized AI Simulation Game on Solana</title>
        <meta name="description" content="Agentarium is a decentralized simulation game built on Solana, where users interact with a living world of autonomous AI agents" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Add meta tag if .use_webgl_init file exists */}
        {typeof window !== 'undefined' && 
         (document.cookie.includes('use_webgl_init=true') || 
          document.cookie.includes('webgl_error=true')) && 
         <meta name="use-webgl-init" content="true" />
        }
      </Head>
      
      {/* Matrix-style scanline effect */}
      <div className="scanline"></div>
      
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <AnimatePresence mode="wait">
              <Component key={router.route} {...pageProps} />
            </AnimatePresence>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
} 