import { useTheme } from "../context/ThemeContext";

const Experience = () => {
  const { handleEasterEgg } = useTheme();

  const experiences = [
    {
      company: "Sairam Techno Incubator",
      position: "AI/ML Intern",
      duration: "Dec 2024 – Jan 2025",
      location: "Chennai, Tamil Nadu",
      description: "Specialized in AI/ML development with focus on Retrieval-Augmented Generation (RAG) and LangChain. Built AI-powered applications and worked on innovative machine learning solutions.",
      achievements: [
        "Developed RAG-based AI applications using LangChain framework",
        "Implemented machine learning models for real-world applications",
        "Worked with cutting-edge AI technologies and frameworks",
        "Contributed to innovative AI/ML projects at the incubator"
      ],
      technologies: ["Python", "LangChain", "RAG", "Machine Learning", "AI/ML", "NLP"],
      logo: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
      type: "work"
    },
    {
      company: "Zoho Corp",
      position: "Zoho CRM Marketplace Extension Developer",
      duration: "Jun 2025 – Jul 2025",
      location: "Tenkasi, Tamil Nadu",
      description: "Contributing to CRM extension development using Zoho Sigma, integrating APIs like Meta, GitHub, and Zoho Assist to automate business workflows.",
      achievements: [
        "Developed CRM extensions using Zoho Sigma and integrated multiple APIs",
        "Automated business workflows with Meta, GitHub, and Zoho Assist APIs",
        "Worked with JavaScript, HTML/CSS, and Zoho CRM technologies",
        "Enhanced CRM functionality for marketplace distribution"
      ],
      technologies: ["Zoho Sigma", "ZET CLI", "Deluge", "REST APIs", "JavaScript", "HTML/CSS", "Zoho CRM", "Meta Marketing API", "GitHub API", "Zoho Assist API", "React", "Node.js"],
      logo: "https://cdn.iconscout.com/icon/free/png-256/free-zoho-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-company-brand-vol-2-pack-logos-icons-2944892.png",
      type: "work"
    },
    {
      company: "MaestroMinds",
      position: "Team Leader Web Development",
      duration: "August 2024 – Present",
      location: "Chennai, Tamilnadu",
      description: "Leading the web development team to deliver client projects, managing timelines, and ensuring quality while gaining experience with modern web technologies.",
      achievements: [
        "Led web development team for multiple client projects",
        "Managed project timelines and deliverables effectively",
        "Ensured high-quality code standards and practices",
        "Mentored team members on modern web technologies"
      ],
      technologies: ["Web Development", "Team Leadership", "Project Management", "Modern Web Technologies"],
      logo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      type: "work"
    },
    {
      company: "CloudElu",
      position: "Front End Developer Intern and Cloud Engineer",
      duration: "Jan 2025 – March 2025",
      location: "Chennai, Tamilnadu",
      description: "Assisted in building a Jira plugin using React and Forge UIKIT to track cloud resource usage via APIs, developed integrations and automation scripts.",
      achievements: [
        "Built Jira plugin using React and Forge UIKIT for cloud resource tracking",
        "Developed API integrations for cloud resource monitoring",
        "Created automation scripts for improved workflow efficiency",
        "Worked with AWS, Jira, React, JavaScript, and Forge UIKIT"
      ],
      technologies: ["AWS", "Jira", "React", "JavaScript", "Forge UIKIT", "Docker"],
      logo: "https://cdn-icons-png.flaticon.com/512/1865/1865269.png",
      type: "work"
    },
    {
      company: "Zero Schools Tech",
      position: "Web Development Intern",
      duration: "Jan 2024 – Feb 2024",
      location: "Chennai, Tamilnadu",
      description: "Implemented HTML, CSS, and JavaScript for responsive web pages and developed a personal portfolio website.",
      achievements: [
        "Developed responsive web pages using HTML, CSS, and JavaScript",
        "Created personal portfolio website showcasing technical skills",
        "Gained hands-on experience with front-end development",
        "Learned responsive design principles and best practices"
      ],
      technologies: ["HTML", "CSS", "JavaScript", "Responsive Design", "Web Development"],
      logo: "https://cdn-icons-png.flaticon.com/512/1087/1087927.png",
      type: "work"
    }
  ];

  const education = [
    {
      institution: "Sri Sairam Engineering College",
      degree: "Bachelor of Engineering in Computer Science",
      duration: "Sep. 2023 – Present",
      location: "Chennai, Tamilnadu",
      details: "Coursework: Computer Architecture, DS, DMA, DBMS, Cloud Computing, Operating System, Machine Learning",
      logo: "https://cdn-icons-png.flaticon.com/512/3002/3002543.png",
      type: "education"
    },
    {
      institution: "Indian Institute of Technology Madras (IITM)",
      degree: "B.S. Degree in Data Science and Applications",
      duration: "June 2024 – Present",
      location: "Chennai, Tamilnadu",
      details: "Diploma in Data Science, Programming | Coursework: JAVA, SQL, Python, Data Science, Problem Solving",
      logo: "https://cdn-icons-png.flaticon.com/512/2942/2942156.png",
      type: "education"
    }
  ];

  const allItems = [...experiences, ...education].sort((a, b) => {
    const getYear = (duration) => {
      const match = duration.match(/(\d{4})/);
      return match ? parseInt(match[1]) : 0;
    };
    return getYear(b.duration) - getYear(a.duration);
  });

  return (
    <section id="experience" className="section">
      <h2 className="section-heading" onClick={handleEasterEgg} title="Professional Journey">
        Professional Experience
      </h2>
      <p className="section-subtitle">
        My work experience and professional achievements in technology.
      </p>
      
      <div className="timeline-container compact">
        <div className="timeline-line"></div>
        
        {experiences.map((item, index) => (
          <div 
            key={index} 
            className={`timeline-item ${item.type} ${index % 2 === 0 ? 'left' : 'right'}`}
            onClick={handleEasterEgg}
          >
            <div className="timeline-marker">
              <div className="timeline-icon">
                <img src={item.logo} alt={item.company} />
              </div>
            </div>
            
            <div className="timeline-content">
              <div className="timeline-card">
                <div className="timeline-header">
                  <div className="timeline-title">
                    <h3>{item.position}</h3>
                    <h4>{item.company}</h4>
                  </div>
                  <div className="timeline-date">
                    <span className="duration">{item.duration}</span>
                  </div>
                </div>
                
                <p className="timeline-description">{item.description}</p>
                
                <div className="tech-tags">
                  {item.technologies.slice(0, 4).map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag" onClick={handleEasterEgg}>
                      {tech}
                    </span>
                  ))}
                  {item.technologies.length > 4 && (
                    <span className="tech-tag more">+{item.technologies.length - 4} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-heading" onClick={handleEasterEgg} title="Educational Background">
        Education
      </h2>
      <p className="section-subtitle">
        My academic journey and educational achievements.
      </p>
      
      <div className="timeline-container compact">
        <div className="timeline-line"></div>
        
        {education.map((item, index) => (
          <div 
            key={index} 
            className={`timeline-item ${item.type} ${index % 2 === 0 ? 'left' : 'right'}`}
            onClick={handleEasterEgg}
          >
            <div className="timeline-marker">
              <div className="timeline-icon">
                <img src={item.logo} alt={item.institution} />
              </div>
            </div>
            
            <div className="timeline-content">
              <div className="timeline-card">
                <div className="timeline-header">
                  <div className="timeline-title">
                    <h3>{item.degree}</h3>
                    <h4>{item.institution}</h4>
                  </div>
                  <div className="timeline-date">
                    <span className="duration">{item.duration}</span>
                  </div>
                </div>
                
                <p className="timeline-description">{item.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="section-footer" onClick={handleEasterEgg}>
        <p>
          "You're looking at him. You're looking at who he could become."
        </p>
      </div>
    </section>
  );
};

export default Experience;