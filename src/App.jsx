import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollNavigator from "./components/ScrollNavigator";
import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import NeuralNetworkSection from "./sections/NeuralNetworkSection";
import Experience from "./sections/Experience";
import Contact from "./sections/Contact";

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Header />
        <main>
          <Hero />
          <Projects />
          <Skills />
          <NeuralNetworkSection />
          <Experience />
          <Contact />
        </main>
        <Footer />
        <ScrollNavigator />
      </div>
    </ThemeProvider>
  );
}

export default App;
