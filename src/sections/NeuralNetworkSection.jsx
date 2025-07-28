import { useTheme } from "../context/ThemeContext";
import NeuralNetwork from "../components/NeuralNetwork";

const NeuralNetworkSection = () => {
  const { handleEasterEgg } = useTheme();

  return (
    <section id="neural-network" className="section">
      <h2 className="section-heading" onClick={handleEasterEgg} title="Interactive Neural Network... 🧠">
        Neural Network Visualization
      </h2>
      <p className="section-subtitle">
        An interactive neural network representing my skills and expertise. 
        Move your mouse over the network to see the connections come alive!
      </p>
      
      <div className="neural-network-wrapper">
        <NeuralNetwork />
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '2rem', 
        padding: '1.5rem', 
        borderRadius: '1rem',
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        maxWidth: '600px',
        margin: '2rem auto 0 auto'
      }} onClick={handleEasterEgg}>
        <p style={{ fontSize: '1rem', fontStyle: 'italic', opacity: '0.8', margin: '0' }}>
          "The network learns, adapts, and grows - just like me."
        </p>
      </div>
    </section>
  );
};

export default NeuralNetworkSection;
