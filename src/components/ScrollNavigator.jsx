import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const ScrollNavigator = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollBottom = documentHeight - scrollTop - windowHeight;

      // Calculate scroll progress (0 to 1)
      const progress = scrollTop / (documentHeight - windowHeight);
      setScrollProgress(Math.min(Math.max(progress, 0), 1));

      // Show scroll to top when scrolled down more than 300px
      setShowScrollTop(scrollTop > 300);
      
      // Show scroll down when not near bottom
      setShowScrollDown(scrollBottom > 100);
      
      // Check if near bottom
      setIsNearBottom(scrollBottom < 200);

      // Update progress circle directly
      const progressCircle = document.querySelector('.progress-circle');
      if (progressCircle) {
        const circumference = 157;
        const offset = circumference - (circumference * progress);
        progressCircle.style.strokeDashoffset = offset;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const scrollToNext = () => {
    const currentScroll = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const nextSection = currentScroll + windowHeight;
    
    window.scrollTo({
      top: nextSection,
      behavior: 'smooth'
    });
  };

  return (
    <div className="scroll-navigator">
      {/* Scroll to Top Button */}
      <button
        className={`scroll-btn scroll-up ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <div className="btn-content">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 19V5M5 12L12 5L19 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="energy-ring"></div>
          <div className="energy-particles">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </button>

      {/* Scroll Down/Next Button */}
      <button
        className={`scroll-btn scroll-down ${showScrollDown ? 'visible' : ''}`}
        onClick={isNearBottom ? scrollToBottom : scrollToNext}
        aria-label={isNearBottom ? "Scroll to bottom" : "Scroll to next section"}
      >
        <div className="btn-content">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12L12 19L19 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="energy-ring"></div>
          <div className="energy-particles">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </button>

      {/* Progress Indicator */}
      <div className="scroll-progress">
        <div className="progress-ring">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke="rgba(255, 107, 157, 0.2)"
              strokeWidth="2"
            />
            <circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke="var(--tyler-pink)"
              strokeWidth="2"
              strokeLinecap="round"
              className="progress-circle"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ScrollNavigator;
