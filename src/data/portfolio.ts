// ============================================================
// PORTFOLIO DATA — Venkatkaushal A.
// ============================================================

export const PERSONAL = {
  name: 'Venkatkaushal',
  lastName: 'A',
  fullName: 'Venkatkaushal A',
  roles: ['AI Engineer', 'Full-Stack Developer', 'Audio ML Builder'],
  tagline: 'I build things that think.',
  bio: `I'm a final-year Computer Science student at Sri Sairam Engineering College, pursuing a parallel BS in Data Science from IIT Madras. Most recently I built agent features and an evaluation harness at Jetty AI. I lead teams, build AI-driven products, and care about code that solves real problems, from real-time audio mastering to cardiac health prediction.`,
  location: 'Chennai, India · Open to relocation',
  email: 'venkat.kaushal12@gmail.com',
  phone: '+91 9873704932',
  linkedin: 'https://linkedin.com/in/venky1209',
  github: 'https://github.com/Venky1209',
  portfolio: 'https://portfolio-vk12.netlify.app',
};

export const EDUCATION = [
  {
    school: 'Sri Sairam Engineering College',
    degree: 'Bachelor of Engineering in Computer Science',
    detail: 'CGPA 8.66',
    location: 'Chennai, TN',
    period: 'Sep 2023 — May 2027 (Expected)',
  },
  {
    school: 'Indian Institute of Technology Madras',
    degree: 'BS in Data Science and Applications',
    detail: 'Diploma Level',
    location: 'Chennai, TN',
    period: 'Jun 2024 — Present',
  },
];

export const EXPERIENCE = [
  {
    role: 'AI Engineer (Early Team Member, Founding Engineer Track)',
    company: 'Jetty AI',
    location: 'Remote (Menlo Park, CA)',
    period: 'May 2026 — Oct 2026',
    description:
      'Built features across OpenJetty and Row-Bot in TypeScript and Python: targeted email campaigns with audience segmentation, undo through change records, and approval-aware assistant plugins. Built an evaluation harness that replays scripted scenarios against the agent on an isolated seeded account, and used it to reproduce and validate fixes in multi-agent execution, RAG memory, and approval flows.',
    tags: ['AI Agents', 'TypeScript', 'Python', 'Evaluation'],
  },
  {
    role: 'Software Engineer and Project Lead (Freelance)',
    company: 'Maestrominds',
    location: 'Chennai, TN',
    period: 'Aug 2024 — May 2026',
    description:
      'Led a team of three developers to deliver four full-stack client applications, owning backend development, REST API integration, and deployment, and improving delivery timelines by 30%.',
    tags: ['Leadership', 'Full-Stack', 'React', 'Node.js'],
  },
  {
    role: 'Machine Learning Intern',
    company: 'Sri Sairam Techno Incubator Foundation',
    location: 'Chennai, TN',
    period: 'Aug 2025',
    description:
      'Developed a DenseNet-121 based classification pipeline achieving 89% accuracy, with explainability using Grad-CAM and SHAP and automated data preprocessing using PyTorch and OpenCV.',
    tags: ['ML', 'PyTorch', 'DenseNet', 'Grad-CAM'],
  },
  {
    role: 'Software Development Intern',
    company: 'Zoho Corporation',
    location: 'Tenkasi, TN',
    period: 'Jun 2025 — Jul 2025',
    description:
      'Built two Zoho CRM extensions integrating multiple REST APIs to automate workflows, resulting in a 40% productivity improvement and exposure to scalable system integration.',
    tags: ['Zoho', 'REST APIs', 'CRM', 'Automation'],
  },
  {
    role: 'Cloud Development Intern',
    company: 'CloudElu Labs, MCC Innovation Center',
    location: 'Chennai, TN',
    period: 'Jan 2025 — Mar 2025',
    description:
      'Developed a cloud-based cost analytics plugin using AWS Cost Explorer APIs to automate budget reporting, reducing manual effort by 40%.',
    tags: ['AWS', 'Cloud', 'Cost Analytics', 'APIs'],
  },
];

export const PROJECTS = [
  {
    title: 'HackRadar',
    year: '2025',
    role: 'Full-Stack Developer',
    subtitle: 'Hackathon Intelligence Platform',
    description:
      'Full-stack platform for discovering hackathons with real-time filters, static-first architecture across 60+ events, and sub-2s load times.',
    liveUrl: 'https://hack-radar-omega.vercel.app/',
    repoUrl: 'https://github.com/Venky1209/HackRadar',
    techStack: ['Next.js 14', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    coverImage: '/projects/hackradar.jpg',
  },
  {
    title: '108-Overload',
    year: '2025',
    role: 'RL Systems + Full-Stack Developer',
    subtitle: 'Emergency Dispatch Simulation System',
    description:
      'RL-style ambulance dispatch simulator with dynamic real-world constraints, multi-difficulty scenarios (EASY/MEDIUM/HARD), and live metric visualization.',
    liveUrl: 'https://huggingface.co/spaces/Venky12099/dispatch-showcase',
    repoUrl: 'https://github.com/Venky1209/dispatch-triage',
    techStack: ['Reinforcement Learning', 'Gradio', 'Python', 'Simulation'],
    coverImage: '/projects/108-overload.jpg',
  },
  {
    title: 'HeartWise',
    year: '2024',
    role: 'ML Engineer',
    subtitle: 'AI-Powered Cardiac Health Predictor',
    description:
      'Built a data-driven machine learning system for cardiac risk prediction with 91% accuracy, involving dataset preprocessing, model evaluation, and Gemini API integration.',
    liveUrl: 'https://heartwiseland.vercel.app/',
    repoUrl: 'https://github.com/Venky1209/Heartwise',
    techStack: ['ML', 'TensorFlow', 'Gemini API', 'Healthcare'],
    coverImage: '/projects/heartwise.jpg',
  },
  {
    title: 'PRIZM',
    year: '2025',
    role: 'Full-Stack Developer',
    subtitle: 'Intelligent Audio Analysis & Mastering Assistant',
    description:
      'Built a real-time signal analysis system covering loudness, spectral balance, and dynamics, with intelligent recommendations delivered through an NLP-based control interface.',
    liveUrl: 'https://prizmweb.vercel.app',
    repoUrl: null,
    techStack: ['Python', 'NLP', 'Signal Processing', 'AI'],
    coverImage: '/projects/prizm.jpg',
  },
  {
    title: 'UI & UX Portfolio',
    year: '2024',
    role: 'Designer',
    subtitle: 'Client-Facing Communication Design',
    description:
      'Designed client-facing communication material including a SEBI financial literacy brochure, a student loan campaign poster, and a conference poster, focusing on visual hierarchy and clarity.',
    liveUrl: 'https://bit.ly/4cLx6hg',
    repoUrl: null,
    techStack: ['Figma', 'UI/UX', 'Branding', 'Design'],
    coverImage: '/projects/uiux.jpg',
  },
];

export const SKILLS: Record<string, { name: string; icon: string }[]> = {
  'Languages & Markup': [
    { name: 'Python', icon: 'python' },
    { name: 'Java', icon: 'java' },
    { name: 'JavaScript', icon: 'javascript' },
    { name: 'C', icon: 'c' },
    { name: 'SQL', icon: 'mysql' },
    { name: 'HTML', icon: 'html5' },
    { name: 'CSS', icon: 'css3' },
  ],
  'Frameworks & Data': [
    { name: 'React.js', icon: 'react' },
    { name: 'Next.js', icon: 'nextjs' },
    { name: 'Node.js', icon: 'nodejs' },
    { name: 'TypeScript', icon: 'typescript' },
    { name: 'Tailwind', icon: 'tailwindcss' },
    { name: 'Flask', icon: 'flask' },
    { name: 'TensorFlow', icon: 'tensorflow' },
    { name: 'Scikit-learn', icon: 'scikitlearn' },
    { name: 'Keras', icon: 'keras' },
    { name: 'MongoDB', icon: 'mongodb' },
    { name: 'MySQL', icon: 'mysql' },
  ],
  'Cloud, DevOps & Tools': [
    { name: 'AWS', icon: 'amazonwebservices' },
    { name: 'GCP', icon: 'googlecloud' },
    { name: 'Azure', icon: 'azure' },
    { name: 'Docker', icon: 'docker' },
    { name: 'Vercel', icon: 'vercel' },
    { name: 'GitHub', icon: 'github' },
    { name: 'Jira', icon: 'jira' },
    { name: 'Figma', icon: 'figma' },
    { name: 'VS Code', icon: 'vscode' },
  ],
};

/* Skill detail metadata for hover cards (Addition 7) */
export const SKILL_DETAILS: Record<string, { years: string; projects: number; proficiency: number }> = {
  Python: { years: '3+', projects: 5, proficiency: 5 },
  Java: { years: '2+', projects: 3, proficiency: 4 },
  JavaScript: { years: '3+', projects: 6, proficiency: 5 },
  C: { years: '2+', projects: 2, proficiency: 3 },
  SQL: { years: '2+', projects: 4, proficiency: 4 },
  HTML: { years: '3+', projects: 8, proficiency: 5 },
  CSS: { years: '3+', projects: 8, proficiency: 5 },
  'React.js': { years: '2+', projects: 5, proficiency: 5 },
  'Next.js': { years: '1+', projects: 3, proficiency: 4 },
  'Node.js': { years: '2+', projects: 4, proficiency: 4 },
  TypeScript: { years: '1+', projects: 3, proficiency: 4 },
  Tailwind: { years: '1+', projects: 3, proficiency: 4 },
  Flask: { years: '1+', projects: 2, proficiency: 3 },
  TensorFlow: { years: '1+', projects: 3, proficiency: 4 },
  'Scikit-learn': { years: '1+', projects: 3, proficiency: 4 },
  Keras: { years: '1+', projects: 2, proficiency: 3 },
  MongoDB: { years: '1+', projects: 3, proficiency: 3 },
  MySQL: { years: '2+', projects: 4, proficiency: 4 },
  AWS: { years: '1+', projects: 2, proficiency: 3 },
  GCP: { years: '1+', projects: 1, proficiency: 2 },
  Azure: { years: '1+', projects: 1, proficiency: 2 },
  Docker: { years: '1+', projects: 2, proficiency: 3 },
  Vercel: { years: '1+', projects: 3, proficiency: 4 },
  GitHub: { years: '3+', projects: 8, proficiency: 5 },
  Jira: { years: '1+', projects: 3, proficiency: 3 },
  Figma: { years: '2+', projects: 4, proficiency: 4 },
  'VS Code': { years: '3+', projects: 8, proficiency: 5 },
};

export const ACHIEVEMENTS = [
  {
    title: 'Claude Fable 5 Build Day — Finalist',
    description: 'Finalist at the Claude Fable 5 Build Day, San Francisco.',
  },
  {
    title: 'AES Saul Walker Student Design Competition 2026',
    description: 'Finalist (Europe) for PRIZM, an AI audio mastering assistant.',
  },
  {
    title: 'Patent Application Published',
    description: 'System and Method for AI-Driven Natural Language Controlled Real-Time Audio Mastering.',
  },
  {
    title: 'Smart India Hackathon 2025',
    description: 'Nodal Shortlist — National level hackathon by Govt. of India.',
  },
  {
    title: 'IEEE SPS ISPA 2025',
    description: 'Winners (Madras Section) for an AI and signal processing solution.',
  },
  {
    title: 'Project DeepBlue — Semi-Finalist',
    description: 'Semi-Finalist in Project DeepBlue (Season 11).',
  },
  {
    title: '2nd Runner-Up, Innovathon 4.0',
    description: '2nd Runner-Up at Innovathon 4.0 for HeartWise — AI-Powered Cardiac Health Predictor.',
  },
  {
    title: 'Paper Presentation — 1st Place',
    description: 'First Place in Paper Presentation at Saveetha Engineering College.',
  },
  {
    title: 'ML + Audio Workshop',
    description: 'Conducted ML + Audio Workshop for 150+ students in collaboration with IEEE SSIT Society.',
  },
  {
    title: 'Hack For Impact — Top 20',
    description: 'Top 20 Finalists at IIIT Delhi.',
  },
];

export const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Capabilities', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

export const SECTION_IDS = ['hero', 'about', 'experience', 'projects', 'skills', 'contact'] as const;
