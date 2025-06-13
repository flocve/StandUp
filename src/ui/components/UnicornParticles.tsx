import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import './UnicornParticles.css';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
  type: 'star' | 'sparkle' | 'unicorn' | 'rainbow';
  trail: Array<{x: number, y: number, opacity: number}>;
}

export const UnicornParticles: React.FC = () => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (theme !== 'unicorn') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajuster la taille du canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Couleurs pastelles licorne
    const pastelColors = [
      { h: 340, s: 50, l: 85 }, // Rose pastel
      { h: 270, s: 45, l: 80 }, // Lavande pastel
      { h: 50, s: 60, l: 85 },  // Jaune pastel
      { h: 160, s: 40, l: 80 }, // Vert menthe pastel
      { h: 200, s: 50, l: 85 }, // Bleu pastel
      { h: 300, s: 45, l: 80 }, // Violet pastel
    ];

    // Créer les particules
    const createParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 50; i++) {
        const types = ['star', 'sparkle', 'unicorn', 'rainbow'];
        const type = types[Math.floor(Math.random() * types.length)] as any;
        
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: type === 'unicorn' ? Math.random() * 2 + 3 : Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * (type === 'rainbow' ? 1 : 0.3),
          speedY: (Math.random() - 0.5) * (type === 'rainbow' ? 1 : 0.3),
          opacity: Math.random() * 0.4 + 0.3,
          hue: Math.random() * 360,
          type,
          trail: []
        });
      }
    };

    createParticles();

    // Fonction pour dessiner une étoile
    const drawStar = (x: number, y: number, size: number, opacity: number, color: string) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        const outerX = x + Math.cos(angle) * outerRadius;
        const outerY = y + Math.sin(angle) * outerRadius;
        
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        
        const innerAngle = angle + Math.PI / 5;
        const innerX = x + Math.cos(innerAngle) * innerRadius;
        const innerY = y + Math.sin(innerAngle) * innerRadius;
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Animation des particules
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        // Mise à jour de la position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.hue += 0.5;

        // Rebond sur les bords avec effet magique
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
          particle.hue += 30; // Changement de couleur au rebond
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
          particle.hue += 30;
        }

        // Ajouter à la traînée
        if (particle.type === 'rainbow' || particle.type === 'unicorn') {
          particle.trail.push({
            x: particle.x,
            y: particle.y,
            opacity: particle.opacity
          });
          
          if (particle.trail.length > 8) {
            particle.trail.shift();
          }
        }

        // Oscillation de l'opacité plus douce
        const time = Date.now() * 0.001;
        particle.opacity = Math.sin(time + particle.x * 0.01) * 0.2 + 0.5;

        // Choisir une couleur pastel
        const colorIndex = Math.floor(particle.hue / 60) % pastelColors.length;
        const pastelColor = pastelColors[colorIndex];
        const color = `hsl(${pastelColor.h}, ${pastelColor.s}%, ${pastelColor.l}%)`;

        // Dessiner la traînée
        if (particle.trail.length > 1) {
          ctx.save();
          particle.trail.forEach((point, index) => {
            const trailOpacity = (index / particle.trail.length) * particle.opacity * 0.5;
            ctx.globalAlpha = trailOpacity;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, particle.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }

        // Dessiner la particule selon son type
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        switch (particle.type) {
          case 'star':
            drawStar(particle.x, particle.y, particle.size, particle.opacity, color);
            break;
            
          case 'sparkle':
            ctx.fillStyle = color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Ajouter des petites lignes scintillantes
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x - particle.size * 2, particle.y);
            ctx.lineTo(particle.x + particle.size * 2, particle.y);
            ctx.moveTo(particle.x, particle.y - particle.size * 2);
            ctx.lineTo(particle.x, particle.y + particle.size * 2);
            ctx.stroke();
            break;
            
          case 'unicorn':
            // Effet licorne spécial avec gradient
            const gradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size * 2
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, `hsl(${particle.hue + 60}, 70%, 80%)`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 20;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'rainbow':
            // Effet arc-en-ciel
            for (let i = 0; i < 6; i++) {
              const rainbowColor = `hsl(${particle.hue + i * 60}, 60%, 80%)`;
              ctx.fillStyle = rainbowColor;
              ctx.shadowBlur = 10;
              ctx.shadowColor = rainbowColor;
              ctx.beginPath();
              ctx.arc(
                particle.x + Math.cos(i) * 2, 
                particle.y + Math.sin(i) * 2, 
                particle.size * 0.7, 
                0, 
                Math.PI * 2
              );
              ctx.fill();
            }
            break;
        }
        
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme]);

  if (theme !== 'unicorn') return null;

  return (
    <canvas 
      ref={canvasRef}
      className="unicorn-particles"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}; 