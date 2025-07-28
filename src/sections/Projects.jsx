import { useTheme } from "../context/ThemeContext";

const Projects = () => {
  const { handleEasterEgg } = useTheme();

  const projects = [
    {
      title: "HeartWise",
      description: "Machine learning project that predicts heart disease risk using ML with 81% accuracy in detecting arrhythmia, and provides personalized diet, exercise, and mental health recommendations via Gemini API.",
      technologies: ["Python", "Flask", "TensorFlow", "Keras", "Gemini API", "Tailwind CSS", "JavaScript"],
      githubUrl: "https://github.com/Venky1209",
      liveUrl: "https://bit.ly/4dLACJ3"
    },
    {
      title: "AI Phishing Detection Tool",
      description: "ML application that detects phishing threats in URLs and emails using a trained ML model and Google Safe Browsing API, providing 88% accuracy and real-time analysis through a responsive React-Flask UI.",
      technologies: ["Python", "Flask", "Machine Learning", "React", "Google Safe Browsing API"],
      githubUrl: "https://github.com/Venky1209",
      liveUrl: "https://bit.ly/3PJcCEQ"
    },
    {
      title: "Freelance Graphic Design Work",
      description: "Designed posters, ads, and brochures for events and startups, enhancing audience reach and engagement through visually compelling layouts.",
      technologies: ["Adobe Photoshop", "Illustrator", "Canva"],
      githubUrl: null,
      liveUrl: "https://drive.google.com/drive/u/1/folders/1teTfqBUjsIvwxYQOAOiBffA-IDwaM0fA"
    }
  ];

  return (
    <section id="projects" className="section">
      <h2 className="section-heading" onClick={handleEasterEgg} title="You DO talk about your work... 🥊">
        Rule #1: You DO talk about your work.
      </h2>
      <p className="section-subtitle">
        Here are some projects that showcase my passion for AI, web development, and creative solutions.
      </p>
      
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div key={index} className="project-card" onClick={handleEasterEgg}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            
            <div className="tech-tags">
              {project.technologies.map((tech, techIndex) => (
                <span key={techIndex} className="tech-tag" onClick={handleEasterEgg}>
                  {tech}
                </span>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
