import React, { useEffect, useRef, useState } from "react";
import { useTheme } from '../context/ThemeContext';

const NeuralNetwork = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const skills = [
    'React.js', 'Python', 'TensorFlow', 'Node.js', 'AWS', 'JavaScript',
    'Machine Learning', 'Flask', 'MongoDB', 'Docker', 'Figma', 'Git'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
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
      radius: 25,
      label: 'VENKATKAUSHAL A',
      type: 'profile',
      connections: [],
      pulsePhase: 0
    });
    
    // Create skill nodes in multiple layers with better spacing
    const layers = [80, 140, 200]; // Reduced spacing
    let skillIndex = 0;
    
    layers.forEach((radius, layerIndex) => {
      const nodesInLayer = layerIndex === 0 ? 3 : layerIndex === 1 ? 5 : 4; // Better distribution
      for (let i = 0; i < nodesInLayer && skillIndex < skills.length; i++) {
        const angle = (Math.PI * 2 * i) / nodesInLayer + layerIndex * 0.3; // Better angle offset
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        nodes.push({
          x,
          y,
          radius: 12, // Smaller nodes
          label: skills[skillIndex],
          type: 'skill',
          originalX: x,
          originalY: y,
          pulsePhase: Math.random() * Math.PI * 2
        });
        
        // Connect to center node
        connections.push({
          from: 0,
          to: nodes.length - 1,
          strength: Math.random() * 1.8 + 2,
          pulseSpeed: Math.random() * 2 + 1
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
            pulseSpeed: Math.random() * 2 + 1
          });
        }
      }
    }
    
    let animationFrame;
    let time = 0;
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    
    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Colors based on theme
      const primaryColor = theme === 'tyler' ? '#ff6b9d' : '#dc2626';
      const secondaryColor = theme === 'tyler' ? '#ff4757' : '#991b1b';
      const textColor = theme === 'tyler' ? '#f0f6fc' : '#1f2937';
      
      // Mouse attraction effect
      nodes.forEach((node, index) => {
        if (index > 0) { // Don't move the center node
          const dx = mousePos.x - node.x;
          const dy = mousePos.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100 * 0.5;
            node.x += dx * force * 0.03;
            node.y += dy * force * 0.03;
          } else {
            // Return to original position
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
        ctx.strokeStyle = `rgba(${theme === 'tyler' ? '255, 107, 157' : '220, 38, 38'}, ${conn.strength * 0.6})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Pulsing energy dot
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
      });
      
      // Draw nodes
      nodes.forEach((node, index) => {
        // Pulsing effect
        const pulseSize = Math.sin(time + node.pulsePhase) * 3 + node.radius;
        
        // Node glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize + 5, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize + 5);
        gradient.addColorStop(0, `rgba(${theme === 'tyler' ? '255, 107, 157' : '220, 38, 38'}, 0.3)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Main node
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? primaryColor : secondaryColor;
        ctx.fill();
        
        // Node border
        ctx.strokeStyle = theme === 'tyler' ? '#f0f6fc' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = textColor;
        ctx.font = index === 0 ? 'bold 12px "Bebas Neue", cursive' : '10px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (index === 0) {
          ctx.fillText(node.label, node.x, node.y);
        } else {
          // Position skill labels outside the nodes
          const labelX = node.x + (node.x > centerX ? 25 : -25);
          const labelY = node.y;
          ctx.fillText(node.label, labelX, labelY);
        }
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [theme, mousePos]);

  return (
    <div className="neural-network-container" style={{ width: '100%', height: '400px', position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        className="neural-network-canvas"
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'transparent',
          cursor: 'pointer'
        }} 
      />
    </div>
  );
};

export default NeuralNetwork;
