import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match window
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Matrix-like particle parameters
    const particleCount = Math.floor(canvas.width / 15);
    const particles: Particle[] = [];
    
    // Create particles
    interface Particle {
      x: number;
      y: number;
      speed: number;
      size: number;
      color: string;
      character: string;
      alpha: number;
    }
    
    // Random matrix-like character
    const getMatrixCharacter = () => {
      const characters = '01010101ABCXYZ'.split('');
      return characters[Math.floor(Math.random() * characters.length)];
    };
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const isGreenParticle = Math.random() < 0.7; // 70% green particles
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        size: isGreenParticle ? 10 + Math.random() * 5 : 6 + Math.random() * 4,
        color: isGreenParticle 
          ? `rgba(29, 185, 84, ${0.3 + Math.random() * 0.7})` 
          : `rgba(13, 157, 255, ${0.2 + Math.random() * 0.4})`,
        character: getMatrixCharacter(),
        alpha: 0.1 + Math.random() * 0.4
      });
    }
    
    // Network connections
    const maxDistance = 150;
    const drawNetworkConnections = () => {
      ctx.beginPath();
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const particle1 = particles[i];
          const particle2 = particles[j];
          
          const dx = particle1.x - particle2.x;
          const dy = particle1.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Calculate opacity based on distance
            const opacity = 1 - (distance / maxDistance);
            
            // Draw connection with gradient
            const gradient = ctx.createLinearGradient(
              particle1.x, particle1.y, 
              particle2.x, particle2.y
            );
            
            gradient.addColorStop(0, `rgba(29, 185, 84, ${opacity * 0.15})`);
            gradient.addColorStop(1, `rgba(13, 157, 255, ${opacity * 0.15})`);
            
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(particle1.x, particle1.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Draw matrix effect
    const drawParticles = () => {
      for (const particle of particles) {
        ctx.font = `${particle.size}px monospace`;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        
        // Draw matrix-like character
        ctx.fillText(
          particle.character,
          particle.x,
          particle.y
        );
        
        // Reset global alpha
        ctx.globalAlpha = 1;
      }
    };
    
    // Move particles
    const updateParticles = () => {
      for (const particle of particles) {
        // Move downward
        particle.y += particle.speed;
        
        // Reset when particle goes off screen
        if (particle.y > canvas.height) {
          particle.y = -20;
          particle.x = Math.random() * canvas.width;
          particle.character = getMatrixCharacter();
        }
      }
    };
    
    // Draw grid lines
    const drawGrid = () => {
      const gridSize = 50;
      
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(40, 40, 40, 0.3)';
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      
      ctx.stroke();
    };
    
    // Draw glowing orbs
    const drawGlowingOrbs = () => {
      // Draw central orb
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Create radial gradient for the glow
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, canvas.height / 1.5
      );
      
      gradient.addColorStop(0, 'rgba(29, 185, 84, 0.15)');
      gradient.addColorStop(0.5, 'rgba(13, 157, 255, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    // Animation frame
    let animationFrameId: number;
    
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background elements
      drawGlowingOrbs();
      drawGrid();
      
      // Draw network and particles
      drawNetworkConnections();
      drawParticles();
      
      // Update particle positions
      updateParticles();
      
      // Continue animation loop
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ 
        background: 'linear-gradient(to bottom, #121212, #1E1E1E)',
        opacity: 0.8 
      }}
    />
  );
};

export default AnimatedBackground; 