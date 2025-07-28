import { useTheme } from "../context/ThemeContext";

const Skills = () => {
  const { handleEasterEgg } = useTheme();

  const skillCategories = [
    {
      category: "Programming Languages",
      skills: ["React.js", "TailwindCSS", "Python", "Java", "C", "HTML/CSS", "JavaScript", "SQL", "MongoDB", "Node.js", "Flask"]
    },
    {
      category: "Machine Learning & AI",
      skills: ["TensorFlow", "Text Classification", "Scikit-learn", "PyCaret", "Data Science", "Problem Solving"]
    },
    {
      category: "Developer Tools",
      skills: ["Figma", "Adobe Photoshop", "Blender", "GitHub", "AWS", "Azure", "Google Cloud Platform", "VS Code", "Google Colab"]
    },
    {
      category: "Certifications",
      skills: ["Data Cleaning and ETL", "Informatica Data Engineer Certification"]
    },
    {
      category: "Other Skills",
      skills: ["Graphic Designing", "Poster Designing", "UI/UX Design", "Web Development", "API Integration"]
    }
  ];

  return (
    <section id="skills" className="section">
      <h2 className="section-heading" onClick={handleEasterEgg} title="You have to know the tools... 🥊">
        Rule #2: You have to know the tools.
      </h2>
      <p className="section-subtitle">
        A comprehensive toolkit spanning full-stack development, AI/ML, and creative design.
      </p>
      
      <div className="projects-grid">
        {skillCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="project-card" onClick={handleEasterEgg}>
            <h3 style={{ color: '#dc2626' }}>{category.category}</h3>
            
            <div className="tech-tags">
              {category.skills.map((skill, skillIndex) => (
                <span
                  key={skillIndex}
                  className="tech-tag"
                  onClick={handleEasterEgg}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', opacity: '0.7' }} onClick={handleEasterEgg}>
          "The things you own end up owning you. But the skills you learn? They set you free."
        </p>
      </div>
    </section>
  );
};

export default Skills;
