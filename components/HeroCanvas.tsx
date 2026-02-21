
import React, { useRef, useEffect } from 'react';
import { AnimationType } from '../types';

interface HeroCanvasProps {
  type: AnimationType;
  color1: string;
  color2: string;
}

const HeroCanvas: React.FC<HeroCanvasProps> = ({ type, color1, color2 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    
    // Resize handler with DPI support
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // High DPI Support
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Scale context to match DPI
        ctx.scale(dpr, dpr);

        // Set visual size
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Helper to get RGB from hex
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 255, g: 255, b: 255 };
    };

    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2 || color1);

    // Get logical size (width/height independent of DPI)
    const getWidth = () => canvas.width / (window.devicePixelRatio || 1);
    const getHeight = () => canvas.height / (window.devicePixelRatio || 1);

    // --- Animation Logic ---

    const renderFrame = () => {
        // 1. PARTICLES & LINKS
        if (type === 'anim-canvas-particles' || type === 'anim-canvas-links') {
            if (particles.length === 0) {
                const particleCount = 70;
                for (let i = 0; i < particleCount; i++) {
                    particles.push({
                    x: Math.random() * getWidth(),
                    y: Math.random() * getHeight(),
                    vx: (Math.random() - 0.5) * 1.0,
                    vy: (Math.random() - 0.5) * 1.0,
                    size: Math.random() * 2 + 1,
                    color: Math.random() > 0.5 ? `rgba(${c1.r},${c1.g},${c1.b},` : `rgba(${c2.r},${c2.g},${c2.b},`
                    });
                }
            }

            const w = getWidth();
            const h = getHeight();
            ctx.clearRect(0, 0, w, h);
            
            particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '0.8)';
            ctx.fill();

            if (type === 'anim-canvas-links') {
                for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b},${(1 - distance / 120) * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
                }
            }
            });
        } 
        // 2. HACKER MATRIX
        else if (type === 'anim-canvas-matrix') {
            const fontSize = 16;
            const w = getWidth();
            const h = getHeight();
            if (particles.length === 0 || particles.length !== Math.floor(w / fontSize)) {
                particles = [];
                const columns = Math.floor(w / fontSize);
                for(let x = 0; x < columns; x++) particles[x] = Math.random() * h;
            }

            const chars = "01アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; 
            ctx.fillRect(0, 0, w, h);

            ctx.font = 'bold ' + fontSize + 'px monospace';

            for(let i = 0; i < particles.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                
                if (Math.random() > 0.98) ctx.fillStyle = color2 || '#FFF';
                else ctx.fillStyle = color1 || '#00FF00';

                ctx.fillText(text, i * fontSize, particles[i] * fontSize);

                if(particles[i] * fontSize > h && Math.random() > 0.975)
                    particles[i] = 0;
                
                particles[i]++;
            }
        }
        // 3. DNA HELIX
        else if (type === 'anim-canvas-dna') {
            const w = getWidth();
            const h = getHeight();
            ctx.clearRect(0, 0, w, h);
            
            if (particles.length === 0) particles.push(0);
            particles[0] += 0.02;
            const t = particles[0];
            
            const amplitude = 50;
            const centerY = h / 2;
            const dotCount = 40;
            const spacing = w / dotCount;

            for (let i = 0; i < dotCount; i++) {
            const x = i * spacing;
            const y1 = centerY + Math.sin(i * 0.5 + t) * amplitude;
            const y2 = centerY + Math.sin(i * 0.5 + t + Math.PI) * amplitude;

            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b}, 0.2)`;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x, y1, 3, 0, Math.PI * 2);
            ctx.fillStyle = color1;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y2, 3, 0, Math.PI * 2);
            ctx.fillStyle = color2 || color1;
            ctx.fill();
            }
        }
        // 4. NETWORK (Circuit)
        else if (type === 'anim-canvas-network') {
            if (particles.length === 0) {
                 const cols = 10;
                 const rows = 10;
                 const w = getWidth();
                 const h = getHeight();
                 const xGap = w / cols;
                 const yGap = h / rows;

                 for(let r=0; r<=rows; r++) {
                    for(let c=0; c<=cols; c++) {
                        if(Math.random() > 0.6) {
                            particles.push({
                            x: c * xGap,
                            y: r * yGap,
                            active: Math.random() > 0.8,
                            timer: Math.random() * 100
                            });
                        }
                    }
                 }
            }

            const w = getWidth();
            const h = getHeight();
            ctx.clearRect(0, 0, w, h);
            
            ctx.lineWidth = 1;
            
            particles.forEach(node => {
            node.timer++;
            const pulse = Math.sin(node.timer * 0.05);
            const alpha = (pulse + 1) / 2;

            ctx.fillStyle = `rgba(${c1.r},${c1.g},${c1.b}, ${alpha})`;
            ctx.fillRect(node.x - 2, node.y - 2, 4, 4);

            particles.forEach(n2 => {
                const d = Math.hypot(node.x - n2.x, node.y - n2.y);
                if(d < 150 && d > 0 && Math.random() > 0.999) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b}, 0.3)`;
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();
                }
            });
            });

            const scanY = (Date.now() / 10) % h;
            ctx.beginPath();
            ctx.moveTo(0, scanY);
            ctx.lineTo(w, scanY);
            ctx.strokeStyle = `rgba(${c2.r},${c2.g},${c2.b}, 0.5)`;
            ctx.stroke();
        }
        // 5. RAMADAN SPECIAL
        else if (type === 'anim-canvas-ramadan') {
          if (particles.length === 0) {
            const count = 30;
            const w = getWidth();
            const h = getHeight();
            for(let i=0; i<count; i++) {
              particles.push({
                x: Math.random() * w,
                y: h + Math.random() * 200, // start below screen
                speed: 0.2 + Math.random() * 0.5,
                sway: Math.random() * 2,
                type: Math.random() > 0.7 ? 'moon' : 'star',
                size: 10 + Math.random() * 20
              });
            }
          }

          const w = getWidth();
          const h = getHeight();
          ctx.clearRect(0, 0, w, h);

          ctx.font = '20px serif';
          
          particles.forEach(p => {
            p.y -= p.speed;
            p.x += Math.sin(p.y * 0.01) * 0.5;

            // Reset if goes off top
            if (p.y < -50) {
              p.y = h + 50;
              p.x = Math.random() * w;
            }

            ctx.fillStyle = '#FFD700'; // Gold
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            
            if (p.type === 'moon') {
               ctx.font = `${p.size}px serif`;
               ctx.fillText('🌙', p.x, p.y);
            } else {
               ctx.font = `${p.size / 1.5}px serif`;
               ctx.fillText('✨', p.x, p.y);
            }
          });
          // Reset Shadow
          ctx.shadowBlur = 0;
        }
        // 6. BIJOY SPECIAL
        else if (type === 'anim-canvas-bijoy') {
           if (particles.length === 0) {
              const count = 60;
              const w = getWidth();
              const h = getHeight();
              for(let i=0; i<count; i++) {
                particles.push({
                   x: Math.random() * w,
                   y: Math.random() * h,
                   vx: (Math.random() - 0.5) * 2,
                   vy: (Math.random() - 0.5) * 2,
                   color: Math.random() > 0.3 ? '#006a4e' : '#f42a41', // Mostly Green, some Red
                   radius: Math.random() * 4 + 1
                });
              }
           }
           
           const w = getWidth();
           const h = getHeight();
           ctx.clearRect(0, 0, w, h);

           particles.forEach(p => {
              p.x += p.vx;
              p.y += p.vy;
              
              if (p.x < 0 || p.x > w) p.vx *= -1;
              if (p.y < 0 || p.y > h) p.vy *= -1;

              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.fill();
           });

           // Draw a subtle large Red circle in center (Like the flag sun)
           const centerX = w / 2;
           const centerY = h / 2;
           const pulse = 10 + Math.sin(Date.now() / 1000) * 5;
           
           ctx.beginPath();
           ctx.arc(centerX, centerY, 100 + pulse, 0, Math.PI * 2);
           ctx.fillStyle = 'rgba(244, 42, 65, 0.05)'; // Very faint red
           ctx.fill();
        }
        else {
             const w = getWidth();
             const h = getHeight();
             ctx.clearRect(0, 0, w, h);
        }

        animationFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, color1, color2]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
};

export default HeroCanvas;
