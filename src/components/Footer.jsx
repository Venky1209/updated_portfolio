const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: '#1a1a1a',
      color: '#EAEAEA',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          © {currentYear} Venkatkaushal A. All rights reserved.
        </p>
        
        <p style={{ 
          fontSize: '0.8rem', 
          fontStyle: 'italic', 
          opacity: '0.7',
          color: '#d4acb4'
        }}>
          "You met me at a very strange time in my life." - But isn't that when the best stories begin?
        </p>
      </div>
    </footer>
  );
};

export default Footer;
