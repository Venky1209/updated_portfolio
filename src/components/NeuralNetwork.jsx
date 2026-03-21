import React, { useEffect, useRef, useState } from "react";
import { useTheme } from '../context/ThemeContext';

const NeuralNetwork = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const smoothMousePos = useRef({ x: 0, y: 0 }); // Smoothed mouse position
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const skillImages = useRef({});
  const isMouseActive = useRef(false);
  const animationState = useRef('idle'); // 'idle', 'attacking', 'pulsing', 'exploding', 'resetting'
  const attackStartTime = useRef(0);
  const explosionStartTime = useRef(0);
  const shockWaves = useRef([]);
  const hasTriggeredAnimation = useRef(false);
  
  const skills = [
    { name: 'React.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', color: '#61DAFB' },
    { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', color: '#3776AB' },
    { name: 'TensorFlow', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg', color: '#FF6F00' },
    { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', color: '#339933' },
    { name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg', color: '#FF9900' },
    { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg', color: '#F7DF1E' },
    { name: 'Machine Learning', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg', color: '#EE4C2C' },
    { name: 'Flask', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original-wordmark.svg', color: '#FFFFFF' },
    { name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg', color: '#47A248' },
    { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain.svg', color: '#2496ED' },
    { name: 'Figma', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg', color: '#F24E1E' },
    { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-plain.svg', color: '#F05032' }
  ];

  // Load skill logos with better error handling
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = skills.length;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        console.log('All images loaded:', Object.keys(skillImages.current).length);
        setImagesLoaded(true);
      }
    };
    
    skills.forEach((skill) => {
      const img = new Image();
      // Don't use crossOrigin for jsdelivr CDN
      img.src = skill.logo;
      img.onload = () => {
        console.log(`Loaded: ${skill.name}`);
        skillImages.current[skill.name] = img;
        checkAllLoaded();
      };
      img.onerror = (e) => {
        console.error(`Failed to load logo for ${skill.name}:`, e);
        checkAllLoaded();
      };
    });
    
    // Timeout fallback
    setTimeout(() => {
      if (!imagesLoaded) {
        console.warn('Image loading timeout, showing with available images');
        setImagesLoaded(true);
      }
    }, 5000);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesLoaded) return;
    
    const ctx = canvas.getContext("2d");
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const nodes = [];
    const connections = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create center profile node
    nodes.push({
      x: centerX,
      y: centerY,
      radius: 40,
      label: 'VENKY',
      type: 'profile',
      connections: [],
      pulsePhase: 0
    });
    
    // Create skill nodes in multiple layers with better spacing - increased for larger container
    const layers = [140, 220, 300]; // Increased spacing to prevent overlap
    let skillIndex = 0;
    
    layers.forEach((radius, layerIndex) => {
      const nodesInLayer = layerIndex === 0 ? 3 : layerIndex === 1 ? 5 : 4; // Better distribution
      for (let i = 0; i < nodesInLayer && skillIndex < skills.length; i++) {
        // Add offset to prevent Machine Learning overlap with TensorFlow
        let angleOffset = layerIndex * 0.5;
        if (skillIndex === 6) angleOffset += 0.4; // Extra offset for Machine Learning
        
        const angle = (Math.PI * 2 * i) / nodesInLayer + angleOffset;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        nodes.push({
          x,
          y,
          radius: 22, // Larger nodes for logos
          label: skills[skillIndex].name,
          logo: skills[skillIndex].logo,
          color: skills[skillIndex].color,
          type: 'skill',
          originalX: x,
          originalY: y,
          pulsePhase: Math.random() * Math.PI * 0.1
        });
        
        // Connect to center node
        connections.push({
          from: 0,
          to: nodes.length - 1,
          strength: Math.random() * 1.8 + 2,
          pulseSpeed: Math.random() * 0.5 + 0.3 // Slower pulse
        });
        
        skillIndex++;
      }
    });
    
    // Add some inter-skill connections
    for (let i = 1; i < nodes.length; i++) {
      if (Math.random() < 0.3) {
        const target = Math.floor(Math.random() * (nodes.length - 1)) + 1;
        if (target !== i) {
          connections.push({
            from: i,
            to: target,
            strength: Math.random() * 1.8 + 2,
            pulseSpeed: Math.random() * 0.3 + 0.2 // Slower pulse
          });
        }
      }
    }
    
    let animationFrame;
    let time = 0;
    
    const handleMouseEnter = () => {
      if (!hasTriggeredAnimation.current) {
        hasTriggeredAnimation.current = true;
        animationState.current = 'attacking';
        attackStartTime.current = Date.now();
      }
    };
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      isMouseActive.current = true;
    };
    
    const handleMouseLeave = () => {
      isMouseActive.current = false;
    };
    
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Smooth mouse position for slower path changes
      smoothMousePos.current.x += (mousePos.x - smoothMousePos.current.x) * 0.05; // Slow interpolation
      smoothMousePos.current.y += (mousePos.y - smoothMousePos.current.y) * 0.05;
      
      // Colors based on theme
      const primaryColor = theme === 'tyler' ? '#ff6b9d' : '#dc2626';
      const secondaryColor = theme === 'tyler' ? '#ff4757' : '#991b1b';
      const textColor = theme === 'tyler' ? '#f0f6fc' : '#1f2937';
      
      // State machine for animation phases
      const centerNode = nodes[0];
      
      // Check if all nodes have reached center (for pulsing phase)
      if (animationState.current === 'attacking') {
        let allReached = true;
        nodes.forEach((node, index) => {
          if (index > 0) {
            const dx = centerNode.x - node.x;
            const dy = centerNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > centerNode.radius + node.radius + 5) {
              allReached = false;
            }
          }
        });
        
        if (allReached && Date.now() - attackStartTime.current > 500) {
          animationState.current = 'pulsing';
          attackStartTime.current = Date.now();
        }
      }
      
      // After pulsing for 1.5 seconds, trigger explosion
      if (animationState.current === 'pulsing' && Date.now() - attackStartTime.current > 1500) {
        animationState.current = 'exploding';
        explosionStartTime.current = Date.now();
        
        // Create shock waves for each connection
        shockWaves.current = [];
        nodes.forEach((node, index) => {
          if (index > 0) {
            shockWaves.current.push({
              fromX: centerNode.x,
              fromY: centerNode.y,
              toX: node.x,
              toY: node.y,
              progress: 0,
              speed: 0.05 + Math.random() * 0.03
            });
          }
        });
        
        // Set explosion target for each node (corners and edges)
        nodes.forEach((node, index) => {
          if (index > 0) {
            const angle = Math.atan2(node.originalY - centerY, node.originalX - centerX);
            const distance = Math.max(canvas.width, canvas.height) * 0.6;
            node.explosionTargetX = centerNode.x + Math.cos(angle) * distance;
            node.explosionTargetY = centerNode.y + Math.sin(angle) * distance;
          }
        });
      }
      
      // After explosion completes, reset
      if (animationState.current === 'exploding' && Date.now() - explosionStartTime.current > 2000) {
        animationState.current = 'resetting';
        explosionStartTime.current = Date.now();
      }
      
      if (animationState.current === 'resetting' && Date.now() - explosionStartTime.current > 1000) {
        animationState.current = 'idle';
        hasTriggeredAnimation.current = false; // Allow retrigger on next hover
      }
      
      // Node movement based on state
      nodes.forEach((node, index) => {
        if (index > 0) {
          if (animationState.current === 'attacking') {
            // ATTACKING: Converge towards center
            const dx = centerNode.x - node.x;
            const dy = centerNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > centerNode.radius + node.radius + 5) {
              const attackForce = 0.03;
              node.x += dx * attackForce;
              node.y += dy * attackForce;
            }
          } else if (animationState.current === 'pulsing') {
            // PULSING: Stay near center with slight orbit
            const orbitAngle = time * 2 + index * 0.5;
            const orbitRadius = centerNode.radius + node.radius + 8;
            const targetX = centerNode.x + Math.cos(orbitAngle) * orbitRadius;
            const targetY = centerNode.y + Math.sin(orbitAngle) * orbitRadius;
            
            node.x += (targetX - node.x) * 0.1;
            node.y += (targetY - node.y) * 0.1;
          } else if (animationState.current === 'exploding') {
            // EXPLODING: Blast outwards to corners
            const explosionProgress = (Date.now() - explosionStartTime.current) / 1000;
            const easeOut = 1 - Math.pow(1 - Math.min(explosionProgress, 1), 3);
            
            node.x += (node.explosionTargetX - node.x) * 0.08 * (1 + easeOut);
            node.y += (node.explosionTargetY - node.y) * 0.08 * (1 + easeOut);
            
            // Add some spin
            node.explosionSpin = (node.explosionSpin || 0) + 0.1;
          } else if (animationState.current === 'resetting') {
            // RESETTING: Return to original positions smoothly
            node.x += (node.originalX - node.x) * 0.08;
            node.y += (node.originalY - node.y) * 0.08;
            node.explosionSpin = 0;
          } else {
            // IDLE: Just stay in original position
            node.x += (node.originalX - node.x) * 0.02;
            node.y += (node.originalY - node.y) * 0.02;
          }
        }
      });
      
      // Draw connections with pulsing energy
      connections.forEach(conn => {
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];
        
        // Main connection line
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        
        // Brighter during pulsing state
        const connectionOpacity = animationState.current === 'pulsing' ? 1 : conn.strength * 0.6;
        ctx.strokeStyle = `rgba(${theme === 'tyler' ? '255, 107, 157' : '220, 38, 38'}, ${connectionOpacity})`;
        ctx.lineWidth = animationState.current === 'pulsing' ? 3 : 2;
        ctx.stroke();
        
        // Pulsing energy dot (only in idle mode)
        if (animationState.current === 'idle') {
          const pulsePosition = (Math.sin(time * conn.pulseSpeed) + 1) / 2;
          const energyX = fromNode.x + (toNode.x - fromNode.x) * pulsePosition;
          const energyY = fromNode.y + (toNode.y - fromNode.y) * pulsePosition;
          
          ctx.beginPath();
          ctx.arc(energyX, energyY, 3, 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      
      // Draw electric shock waves during explosion
      if (animationState.current === 'exploding') {
        shockWaves.current.forEach(wave => {
          wave.progress += wave.speed;
          
          if (wave.progress <= 1) {
            // Electric bolt effect with multiple segments
            const segments = 20;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${theme === 'tyler' ? '100, 200, 255' : '255, 200, 100'}, ${1 - wave.progress})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = theme === 'tyler' ? '#64c8ff' : '#ffb347';
            ctx.shadowBlur = 15;
            
            for (let i = 0; i <= segments; i++) {
              const t = (i / segments) * wave.progress;
              const x = wave.fromX + (wave.toX - wave.fromX) * t;
              const y = wave.fromY + (wave.toY - wave.fromY) * t;
              
              // Add jagged lightning effect
              const offsetX = (Math.random() - 0.5) * 15 * (1 - t);
              const offsetY = (Math.random() - 0.5) * 15 * (1 - t);
              
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x + offsetX, y + offsetY);
              }
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            // Add spark particles at the wave front
            const sparkX = wave.fromX + (wave.toX - wave.fromX) * wave.progress;
            const sparkY = wave.fromY + (wave.toY - wave.fromY) * wave.progress;
            
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              const sparkOffset = 10;
              const sx = sparkX + (Math.random() - 0.5) * sparkOffset;
              const sy = sparkY + (Math.random() - 0.5) * sparkOffset;
              ctx.arc(sx, sy, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${1 - wave.progress})`;
              ctx.fill();
            }
          }
        });
      }
      
      // Draw nodes
      nodes.forEach((node, index) => {
        // Pulsing effect
        const pulseSize = Math.sin(time + node.pulsePhase) * 3 + node.radius;
        
        // Node glow (outer aura)
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize + 8, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize + 8);
        glowGradient.addColorStop(0, `rgba(${theme === 'tyler' ? '255, 107, 157' : '220, 38, 38'}, 0.4)`);
        glowGradient.addColorStop(0.5, `rgba(${theme === 'tyler' ? '255, 107, 157' : '220, 38, 38'}, 0.2)`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // Main node - Minimal transparent glass effect
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        
        if (index === 0) {
          // Center node - solid color for VENKY
          const centerGradient = ctx.createRadialGradient(
            node.x - pulseSize * 0.3, 
            node.y - pulseSize * 0.3, 
            0,
            node.x, 
            node.y, 
            pulseSize
          );
          centerGradient.addColorStop(0, `rgba(${theme === 'tyler' ? '255, 107, 157' : '220, 38, 38'}, 0.9)`);
          centerGradient.addColorStop(1, `rgba(${theme === 'tyler' ? '200, 50, 100' : '150, 20, 20'}, 0.8)`);
          ctx.fillStyle = centerGradient;
          ctx.fill();
        } else {
          // Skill nodes - minimal frosted glass (almost transparent)
          const glassGradient = ctx.createRadialGradient(
            node.x - pulseSize * 0.3, 
            node.y - pulseSize * 0.3, 
            0,
            node.x, 
            node.y, 
            pulseSize
          );
          glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
          glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
          glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
          ctx.fillStyle = glassGradient;
          ctx.fill();
        }
        
        // Subtle border for definition
        ctx.strokeStyle = theme === 'tyler' 
          ? 'rgba(255, 107, 157, 0.4)' 
          : 'rgba(220, 38, 38, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Labels and Logos
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (index === 0) {
          // Center node - show name "VENKY"
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px "Bebas Neue", cursive';
          ctx.fillText(node.label, node.x, node.y);
        } else {
          // Skill nodes - show logo image inside node
          const img = skillImages.current[node.label];
          if (img && img.complete) {
            const logoSize = node.radius * 1.3;
            ctx.save();
            ctx.globalAlpha = 1;
            
            // Apply rotation during explosion
            if (node.explosionSpin) {
              ctx.translate(node.x, node.y);
              ctx.rotate(node.explosionSpin);
              ctx.translate(-node.x, -node.y);
            }
            
            try {
              ctx.drawImage(img, node.x - logoSize / 2, node.y - logoSize / 2, logoSize, logoSize);
            } catch (e) {
              // Fallback if image can't be drawn
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 14px "Inter", sans-serif';
              ctx.fillText(node.label.charAt(0), node.x, node.y);
            }
            ctx.restore();
          } else {
            // Show first letter while loading
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px "Inter", sans-serif';
            ctx.fillText(node.label.charAt(0), node.x, node.y);
          }
          
          // Only show labels in idle state (hide during animations)
          if (animationState.current === 'idle') {
            // Position skill labels dynamically based on current node position
            const angle = Math.atan2(node.y - centerY, node.x - centerX);
            const labelDistance = node.radius + 35; // Dynamic distance from node edge
            
            // Calculate label position relative to current node position
            const labelX = node.x + Math.cos(angle) * labelDistance;
            const labelY = node.y + Math.sin(angle) * labelDistance;
            
            // Modern font styling
            ctx.font = '600 11px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            
            // Measure text width for background
            const textMetrics = ctx.measureText(node.label);
            const textWidth = textMetrics.width;
            const textHeight = 16;
            const padding = 6;
            
            // Modern rounded background with shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 2;
            
            // Draw rounded rectangle background
            const bgX = labelX - textWidth / 2 - padding;
            const bgY = labelY - textHeight / 2 - 1;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = textHeight;
            const radius = 6;
            
            ctx.fillStyle = theme === 'tyler' 
              ? 'rgba(25, 30, 50, 0.92)' 
              : 'rgba(255, 255, 255, 0.96)';
            
            ctx.beginPath();
            ctx.moveTo(bgX + radius, bgY);
            ctx.lineTo(bgX + bgWidth - radius, bgY);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius);
            ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight);
            ctx.lineTo(bgX + radius, bgY + bgHeight);
            ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius);
            ctx.lineTo(bgX, bgY + radius);
            ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
            ctx.closePath();
            ctx.fill();
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            // Add subtle border
            ctx.strokeStyle = theme === 'tyler' 
              ? 'rgba(255, 107, 157, 0.3)' 
              : 'rgba(220, 38, 38, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw text with better contrast
            ctx.fillStyle = theme === 'tyler' ? '#f0f6fc' : '#1a1a1a';
            ctx.fillText(node.label, labelX, labelY + 1);
          }
        }
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [theme, mousePos, imagesLoaded]);

  return (
    <div className="neural-network-container" style={{ 
      width: '100%', 
      height: '700px', 
      position: 'relative',
      maxWidth: '1200px',
      margin: '0 auto',
      overflow: 'hidden' // Prevent logos from going outside
    }}>
      {!imagesLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: theme === 'tyler' ? '#ff6b9d' : '#dc2626',
          fontSize: '18px',
          fontFamily: 'Inter'
        }}>
          Loading Neural Network...
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="neural-network-canvas"
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'transparent',
          cursor: 'pointer',
          opacity: imagesLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }} 
      />
    </div>
  );
};

export default NeuralNetwork;
