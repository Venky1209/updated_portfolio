import { FaEnvelope, FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const Contact = () => {
  const { handleEasterEgg } = useTheme();

  const contactLinks = [
    {
      icon: FaEnvelope,
      label: "Email",
      value: "yunoa992@gmail.com",
      href: "mailto:yunoa992@gmail.com"
    },
    {
      icon: FaLinkedin,
      label: "LinkedIn",
      value: "linkedin.com/in/venky1209",
      href: "https://linkedin.com/in/venky1209"
    },
    {
      icon: FaGithub,
      label: "GitHub",
      value: "github.com/Venky1209",
      href: "https://github.com/Venky1209"
    },
    {
      icon: FaTwitter,
      label: "Phone",
      value: "+91 9873704932",
      href: "tel:+919873704932"
    }
  ];

  return (
    <section id="contact" className="section">
      <h2 className="section-heading" onClick={handleEasterEgg} title="Let's connect... 🥊">Let's connect.</h2>
      <p className="section-subtitle">
        Ready to collaborate on something amazing? Let's build the future together.
      </p>
      
      <div className="projects-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {contactLinks.map((contact, index) => {
          const IconComponent = contact.icon;
          return (
            <a
              key={index}
              href={contact.href}
              target={contact.href.startsWith('mailto:') || contact.href.startsWith('tel:') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className="project-card"
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
              onClick={handleEasterEgg}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#dc2626', 
                borderRadius: '50%',
                color: 'white'
              }}>
                <IconComponent size={20} />
              </div>
              
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{contact.label}</h3>
                <p style={{ margin: '0', opacity: '0.7', fontSize: '0.9rem' }}>{contact.value}</p>
              </div>
            </a>
          );
        })}
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '3rem', 
        padding: '2rem', 
        borderRadius: '1rem',
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.2)'
      }} onClick={handleEasterEgg}>
        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', opacity: '0.8', marginBottom: '1rem' }}>
          "His name was Robert Paulson. But you? You can call me Venkatkaushal."
        </p>
        <p style={{ opacity: '0.7' }}>
          Open to opportunities, collaborations, and interesting conversations.
        </p>
      </div>
    </section>
  );
};

export default Contact;
