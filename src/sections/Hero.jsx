import { useTheme } from "../context/ThemeContext";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin } from "react-icons/fa";

const Hero = () => {
  const { handleEasterEgg } = useTheme();

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const downloadResume = () => {
    // Create a link to download the resume
    const link = document.createElement('a');
    link.href = '/Venkatkaushal_A_Resume.pdf';
    link.download = 'Venkatkaushal_A_Resume.pdf';
    link.click();
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-image">
          <img 
            src="/profile.jpg" 
            alt="Venkatkaushal A" 
            className="profile-image"
            onClick={handleEasterEgg}
            title="Click me multiple times... 👀"
          />
        </div>
        <div className="hero-text" style={{ fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
          <h1 onClick={handleEasterEgg}>Full Stack Developer & AI Enthusiast</h1>
          <p>
            Computer Science Engineering student passionate about machine learning, web development, and creating innovative solutions with modern technologies.
          </p>

          <div className="buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={scrollToProjects}>
              View My Work
            </button>
            <button className="btn btn-secondary" onClick={downloadResume}>
              Download Resume
            </button>
          </div>
          
          <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: '0.8' }}>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FaEnvelope size={14} />
                yunoa992@gmail.com
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FaPhone size={14} />
                +91 9873704932
              </span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FaMapMarkerAlt size={14} />
                Chennai, Tamil Nadu
              </span>
              <a 
                href="https://linkedin.com/in/venky1209" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0077b5';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'inherit';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <FaLinkedin size={14} />
                linkedin.com/in/venky1209
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
