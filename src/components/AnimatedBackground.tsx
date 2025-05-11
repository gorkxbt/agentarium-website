import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  glowIntensity: number;
  color: string;
}

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Setup
    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 70;
    
    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Recreate particles when resizing
      initParticles();
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Initialize particles
    function initParticles() {
      particles = [];
      
      if (!canvas) return;
      
      const greenShades = [
        'rgba(0, 255, 65, 0.6)',
        'rgba(0, 235, 65, 0.5)',
        'rgba(0, 215, 65, 0.4)',
        'rgba(0, 195, 65, 0.3)',
        'rgba(0, 175, 65, 0.2)',
      ];
      
      const blueAccents = [
        'rgba(13, 211, 255, 0.5)',
        'rgba(13, 211, 255, 0.3)',
      ];
      
      const colors = [...greenShades, ...blueAccents];
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 5 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          glowIntensity: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    
    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;
      
      // Clear canvas with slight opacity to create trail effect
      ctx.fillStyle = 'rgba(18, 18, 18, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      particles.forEach((particle, index) => {
        // Create glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * particle.glowIntensity
        );
        
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.size * particle.glowIntensity, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw particle core
        ctx.beginPath();
        ctx.fillStyle = particle.color.replace('rgba', 'rgb').replace(/,[^,]*\)/, ')');
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Update position with subtle sine wave movement
        particle.x += particle.speedX + Math.sin(Date.now() * 0.001 + index) * 0.2;
        particle.y += particle.speedY + Math.cos(Date.now() * 0.002 + index) * 0.1;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      
      // Connect nearby particles with lines
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ background: '#121212' }}
    />
  );
};

export default AnimatedBackground; 