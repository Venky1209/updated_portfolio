import { useState, useEffect } from "react";
import ThemeToggleButton from "./ThemeToggleButton";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { handleEasterEgg } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;
      
      // Always show navbar at very top (first 100px)
      if (currentScrollY < 100) {
        setIsVisible(true);
      } 
      // Hide when scrolling down more than 10px and past 150px from top
      else if (scrollDifference > 10 && currentScrollY > 150) {
        setIsVisible(false);
      } 
      // Show when scrolling up more than 10px
      else if (scrollDifference < -10) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events
    let timeoutId = null;
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(controlNavbar, 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  return (
    <header className={`header anime-nav ${isVisible ? 'nav-visible' : 'nav-hidden'}`}>
      <div className="header-content">
        <h1 
          className="logo anime-logo" 
          onClick={handleEasterEgg}
          title="His name was Robert Paulson... 🥊"
        >
          <span className="logo-text">Venkatkaushal A</span>
          <div className="logo-glow"></div>
        </h1>
        
        <nav className="nav anime-nav-menu">
          <a href="#projects" className="nav-link">
            <span className="nav-text">Projects</span>
            <div className="nav-particle"></div>
          </a>
          <a href="#skills" className="nav-link">
            <span className="nav-text">Skills</span>
            <div className="nav-particle"></div>
          </a>
          <a href="#experience" className="nav-link">
            <span className="nav-text">Experience</span>
            <div className="nav-particle"></div>
          </a>
          <a href="#contact" className="nav-link">
            <span className="nav-text">Contact</span>
            <div className="nav-particle"></div>
          </a>
          <div className="theme-toggle-wrapper">
            <ThemeToggleButton />
          </div>
        </nav>
      </div>
      
      {/* Anime-style background elements */}
      <div className="nav-bg-effect"></div>
      <div className="nav-border-glow"></div>
    </header>
  );
};

export default Header;
