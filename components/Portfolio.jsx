"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Terminal,
  Cpu,
  Eye,
  Bug,
  Github,
  Linkedin,
  Mail,
  Download,
  Zap,
  Server,
  Database,
  MapPin,
  Phone,
} from "lucide-react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import TypingEffect from "./TypingEffect";
import MagneticButton from "./interactive/MagneticButton";
import Reveal from "./interactive/Reveal";
import useScrolled from "./interactive/useScrolled";
import HeroPortrait from "./HeroPortrait";
import Marquee from "./interactive/Marquee";
import ProjectCard from "./interactive/ProjectCard";
import SectionDots from "./interactive/SectionDots";


export default function Portfolio() {
  const [expandedTech, setExpandedTech] = useState({});
  const [expandedDesc, setExpandedDesc] = useState({});
  const isScrolled = useScrolled(40);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleTechExpansion = (projectIndex) => {
    setExpandedTech(prev => ({
      ...prev,
      [projectIndex]: !prev[projectIndex]
    }));
  };

  const toggleDescExpansion = (projectIndex) => {
    setExpandedDesc(prev => ({
      ...prev,
      [projectIndex]: !prev[projectIndex]
    }));
  };

  const handleNavClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const skillGroups = [
    {
      category: "Programming Languages",
      icon: Terminal,
      skills: [
        "Python",
        "Java",
        "C",
        "C++",
        "JavaScript",
        "TypeScript",
        "HTML",
        "CSS",
        "SQL",
        "Dart"
      ],
      color: "from-blue-600 to-blue-400",
    },
    {
      category: "Frameworks & Libraries",
      icon: Server,
      skills: [
        "React.js",
        "Next.js",
        "Express.js",
        "PyTorch",
        "Stable-Baselines3",
        "OpenCV",
        "Flutter"
      ],
      color: "from-purple-600 to-purple-400",
    },
    {
      category: "DevOps & Toolkits",
      icon: Zap,
      skills: [
        "Git",
        "Postman",
        "Wireshark",
        "ELK Stack",
        "MongoDB",
        "Matplotlib",
        "Plotly"
      ],
      color: "from-green-600 to-green-400",
    },
    {
      category: "Platforms & OS",
      icon: Shield,
      skills: [
        "Ubuntu",
        "Kali Linux",
        "VirtualBox",
        "Clerk Auth"
      ],
      color: "from-red-600 to-red-400",
    },
  ];

  const projects = [
    {
      title: "Optifolio – AI Portfolio Rebalancing App",
      description:
        "Reinforcement Learning-driven portfolio rebalancer using Deep Q-Learning to optimize rebalancing policies from historical market data. Maximizes risk-adjusted returns while respecting user risk profiles and transaction costs. Features Flutter iOS app for goal setting, backtesting on ETFs/stocks, and actionable rebalancing suggestions with performance visualization.",
      tech: ["Python", "PyTorch", "Stable-Baselines3", "Flutter", "Express.js", "MongoDB", "Yahoo Finance API", "Quandl", "Matplotlib", "Plotly"],
      // Falls back to the placeholder artwork if the file is missing.
      preview: "/projects/optifolio.png",
      // 418x878 phone capture. At the standard 9/4 banner this centres the
      // "$1,187,543 / +1.4% this year" block at 28%-72% of the banner height,
      // clear of both the top edge and the bottom fade.
      previewPosition: "center 19%",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      github: "https://github.com/ritik-roushan-rana/OptiFolio",
      demo: "https://drive.google.com/file/d/1_B-TvkwtawxcEpd7G_eS0meuNbnXG_NH/view?usp=drivesdk",
    },
    {
      title: "VTour – Virtual Campus Tour App",
      description:
        "Built a mobile app to guide students through virtual campus tours using Flutter. Designed intuitive UI/UX for a smooth and interactive navigation experience. Provided students with easy access to campus maps, departments, and facility information.",
      tech: ["Flutter", "Supabase", "UI/UX", "IOS Development"],
      // Add preview: "/projects/vtour.png" once the screenshot exists.
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
      github: "https://github.com/ritik-roushan-rana/VTOUR",
      demo: "https://drive.google.com/file/d/1QyKJeWc1yVEDrFa4WhFBdcjEeyPYIWkX/view?usp=drivesdk",
    },
    {
      title: "SSH Honeypot with ELK Stack",
      description:
        "Deployed Cowrie honeypot on Ubuntu to simulate an SSH server for logging unauthorised access attempts. Integrated with ELK Stack to visualise attacker logs and analyse malicious activity patterns. Developed understanding of network security, log analysis, and real-time threat monitoring.",
      tech: ["Cybersecurity", "Cowrie", "Ubuntu", "ELK", "Virtual Machines"],
      icon: Bug,
      color: "from-red-500 to-pink-500",
      // No public repo exists for this one on either account, so the VIEW CODE
      // button is omitted rather than linking to a 404. Add the URL back here
      // once the repository is published.
      github: null,
      demo: "https://youtu.be/6NElUW4gqSc",
    },
    {
      title: "🎯 Organizo – Task Management Web App",
      description:
        "A modern Kanban-style task management platform designed for individuals and teams to organize, track, and manage tasks efficiently. Features secure authentication, board & task management, drag-and-drop functionality, full CRUD operations, team collaboration support, and fully responsive UI.",
      tech: ["React", "Express.js", "MongoDB", "Clerk Auth"],
      icon: Terminal,
      color: "from-purple-500 to-violet-500",
      github: "https://github.com/ritik-roushan-rana/web-project",
      demo: "https://organizo-task-manager.netlify.app",
    },
  ];

  const experiences = [
    {
      type: "Education",
      title:
        "B.Tech in Computer Science and Engineering with Specialization in Information Security",
      organization: "Vellore Institute of Technology (VIT), Vellore",
      period: "Expected Graduation: 2027",
      description:
        "Currently pursuing Bachelor of Technology in Computer Science and Engineering with focus on cybersecurity, software development, and mobile application development.",
      icon: Database,
      color: "border-blue-500",
    },
    {
      type: "Internship",
      title: "Artificial Intelligence Intern",
      organization: "Martvalley Online Pvt. Ltd",
      period: "May 2025 – July 2025",
      description:
        "Contributed real-time AI modules across 5+ development projects, cutting end-to-end processing latency by 30% and improving system throughput by 25%. Optimised ML training workflows and integrated models into production environments. Collaborated with cross-functional teams on pipelines processing 5,000+ images per week, raising model accuracy by 5%.",
      icon: Cpu,
      color: "border-purple-500",
    },
    {
      type: "Internship",
      title: "Cyber Security Analyst Intern",
      organization: "IBM (IBM Career Education Program) – Remote",
      period: "May 2025 – June 2025",
      description:
        "Analysed simulated cyber threats and applied defensive strategies to secure system environments. Utilised industry-standard tools to monitor, detect, and report vulnerabilities in network infrastructures. Collaborated in virtual labs powered by IBM Developer Skills Network to solve real-world cybersecurity challenges. Gained hands-on experience with malware analysis, threat intelligence, and penetration testing basics.",
      icon: Shield,
      color: "border-green-500",
    },
    {
      type: "Education",
      title: "Senior Secondary (PCM + Computer Science)",
      organization: "Kendriya Vidyalaya",
      period: "Graduated: 2023",
      description:
        "Completed senior secondary education with Physics, Chemistry, Mathematics, and Computer Science. Built strong foundation in programming and analytical thinking.",
      icon: Server,
      color: "border-cyan-500",
    },
  ];

  // Split by type rather than maintaining two parallel arrays, so the columns
  // stay in sync with the source data. Array order is preserved, which keeps
  // the newest qualification at the top of each timeline.
  const education = experiences.filter((item) => item.type === "Education");
  const work = experiences.filter((item) => item.type !== "Education");

  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-cyan-900/20" />
          <div className="matrix-field" />
        </div>
        {/* Pointer-following spotlight: a soft ambient wash plus brighter
            binary digits within its radius (see globals.css) */}
        <div className="pointer-spotlight" />
        <div className="matrix-spotlight" />
      </div>

      {/* Section dot navigation */}
      <SectionDots
        sections={[
          { id: "home", label: "Home" },
          { id: "skills", label: "Skills" },
          { id: "projects", label: "Projects" },
          { id: "experience", label: "Experience" },
          { id: "contact", label: "Contact" },
        ]}
      />

      {/* Navigation */}
      <nav
        className={`site-nav fixed left-1/2 z-50 transform -translate-x-1/2 transition-all duration-500 ${
          isScrolled ? "site-nav--condensed top-3 scale-95" : "top-6 scale-100"
        } ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
      >
        <div
          className={`site-nav__shell bg-gray-900/80 backdrop-blur-md border border-cyan-500/30 rounded-full ${
            isScrolled ? "px-4 py-2 sm:px-6" : "px-4 py-2 sm:px-8 sm:py-3"
          }`}
        >
          {/* Labels are hidden below sm: five labelled items measure roughly
              590px, which does not fit a 375px viewport. Icons only there. */}
          <div className="flex space-x-5 sm:space-x-8">
            {[
              { icon: Shield, label: "Home", target: "home" },
              { icon: Zap, label: "Skills", target: "skills" },
              { icon: Terminal, label: "Experience", target: "experience" },
              { icon: Bug, label: "Projects", target: "projects" },
              { icon: Mail, label: "Contact", target: "contact" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.target)}
                aria-label={item.label}
                className="flex items-center sm:space-x-2 text-cyan-400 hover:text-cyan-300 hover:scale-110 transition-all duration-200 font-mono text-sm cursor-pointer"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-20"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Introduction */}
            <div
              className={`space-y-8 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <div className="space-y-2">
                <p className="text-cyan-400 font-mono text-base sm:text-lg flex items-center animate-fade-in">
                  <Terminal className="mr-2 h-5 w-5" />
                  Welcome to my digital portfolio
                </p>

                <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white mb-4 hover:animate-pulse">
                  Hello
                </h1>

                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold">
                  I&apos;m{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 animate-gradient font-black uppercase tracking-wider">
                    RITIK ROUSHAN RANA
                  </span>
                </h2>
              </div>

              <div className="space-y-4">
                {/* Wraps rather than overflowing: the two pills exceed a
                    narrow viewport side by side. */}
                <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg">
                  <Badge
                    variant="outline"
                    className="border-green-500 text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                  >
                    IBM Cyber Security Analyst
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-cyan-500 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                  >
                    VIT CSE Student
                  </Badge>
                </div>

                <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed font-mono">
                  <TypingEffect
                    text="I’m a Computer Science student at VIT Vellore specializing in mobile and frontend development, creating responsive, user-focused apps with Flutter and modern frameworks, driven by a passion for cybersecurity and AI to build secure and innovative digital experiences."
                    speed={30}
                  />
                </p>
                <div className="flex flex-col space-y-2 text-gray-400 font-mono text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span>New Delhi, 110055</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-green-400" />
                    <span>+91 8660405653</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <MagneticButton
                  size="lg"
                  onClick={() => handleNavClick("projects")}
                  className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-black font-semibold border-0"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Projects
                </MagneticButton>
                <MagneticButton
                  variant="outline"
                  size="lg"
                  onClick={() => handleNavClick("contact")}
                  className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Contact Me
                </MagneticButton>
              </div>

              <div className="flex space-x-6">
                {[
                  {
                    icon: Github,
                    href: "https://github.com/ritik-roushan-rana?tab=repositories",
                    label: "GitHub",
                    glow: "social-link--github",
                  },
                  {
                    icon: Linkedin,
                    href: "https://www.linkedin.com/in/ritik-roushan-rana-b6a89528a/",
                    label: "LinkedIn",
                    glow: "social-link--linkedin",
                  },
                  {
                    icon: Mail,
                    href: "mailto:ritikrana8596@gmail.com",
                    label: "Email",
                    glow: "social-link--mail",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target={
                      social.href.startsWith("mailto:") ? "_self" : "_blank"
                    }
                    rel={
                      social.href.startsWith("mailto:")
                        ? ""
                        : "noopener noreferrer"
                    }
                    className={`social-link ${social.glow} text-gray-400 hover:scale-125 hover:rotate-12`}
                  >
                    <social.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>

            {/* Hero identity card */}
            <div
              className={`relative flex justify-center transition-all duration-1000 delay-300 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="w-full">
                <HeroPortrait />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools marquee */}
      <div className="relative border-y border-gray-800/70 bg-black/40 py-4">
        <Marquee
          items={[
            "Python",
            "Flutter",
            "Next.js",
            "React",
            "PyTorch",
            "Wireshark",
            "ELK Stack",
            "MongoDB",
            "Kali Linux",
            "Git",
          ]}
          speed={40}
        />
      </div>

      {/* Skills Section */}
      <section id="skills" className="py-14 sm:py-20 relative">
        <Reveal stagger className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-mono">
              <span className="text-cyan-400">&gt;</span> Skills
            </h2>
            <p className="text-base sm:text-xl text-gray-400 font-mono">
              Technologies and tools I work with
            </p>
          </div>

          <Reveal stagger className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {skillGroups.map((skillGroup, index) => (
              <div
                key={index}
                className="relative group hover:-translate-y-2 hover:scale-105 transition-all duration-300"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 sm:p-8 h-full hover:border-cyan-500/50 transition-all duration-300 flex flex-col md:flex-row md:space-x-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${skillGroup.color} rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <skillGroup.icon className="h-8 w-20 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 font-mono">
                      {skillGroup.category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.skills.map((skill, skillIndex) => (
                        <Badge
                          key={skillIndex}
                          variant="outline"
                          className="border-gray-600 text-gray-300 bg-gray-800/50 hover:border-cyan-500 hover:text-cyan-400 transition-colors font-mono text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Reveal>
        </Reveal>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-14 sm:py-20 relative">
        <Reveal stagger className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-mono">
              <span className="text-green-400">&gt;</span> Projects
            </h2>
            <p className="text-base sm:text-xl text-gray-400 font-mono">
              Featured development and technical projects
            </p>
          </div>

          <Reveal
            stagger
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={index}
                project={project}
                index={index}
                descExpanded={Boolean(expandedDesc[index])}
                techExpanded={Boolean(expandedTech[index])}
                onToggleDesc={toggleDescExpansion}
                onToggleTech={toggleTechExpansion}
              />
            ))}
          </Reveal>
        </Reveal>
      </section>
      {/* Experience Section */}
      <section id="experience" className="py-14 sm:py-20 relative">
        <Reveal stagger className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-mono">
              <span className="text-red-400">&gt;</span> Experience & Education
            </h2>
            <p className="text-base sm:text-xl text-gray-400 font-mono">
              My professional and academic background
            </p>
          </div>

          {/* Two columns above 768px, Education stacked above Experience below */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-8 lg:gap-12">
            {[
              { emoji: "🎓", label: "Education", items: education },
              { emoji: "💼", label: "Experience", items: work },
            ].map((column) => (
              <div key={column.label}>
                <h3 className="text-lg sm:text-xl font-bold text-white font-mono mb-6">
                  <span className="text-cyan-400">&gt;</span>{" "}
                  <span aria-hidden="true">{column.emoji}</span> {column.label}
                </h3>

                <Reveal as="ol" stagger className="timeline">
                  {column.items.map((item, index) => (
                    <li key={index} className="timeline__item">
                      <div
                        className={`bg-gray-900/50 backdrop-blur-sm rounded-lg p-5 border-l-4 ${item.color} hover:bg-gray-800/50 transition-all duration-300`}
                      >
                        <div className="flex items-start space-x-3 mb-2">
                          <item.icon className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                          <h4 className="text-base sm:text-lg font-semibold text-white font-mono leading-snug">
                            {item.title}
                          </h4>
                        </div>

                        <p className="text-cyan-400 font-medium mb-2 font-mono text-sm">
                          {item.organization}
                        </p>

                        <Badge
                          variant="outline"
                          className="border-gray-600 text-gray-300 bg-gray-800/50 font-mono text-xs w-fit mb-3"
                        >
                          {item.period}
                        </Badge>

                        <p className="text-gray-400 font-mono text-xs sm:text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </Reveal>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-14 sm:py-20 relative">
        <Reveal stagger className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 lg:p-12 border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-mono">
              <span className="text-cyan-400">&gt;</span> Let&apos;s Connect &amp;
              Collaborate
            </h2>
            <p className="text-base sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto font-mono">
              Ready to discuss projects, opportunities, or just connect?
              Let&apos;s build something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-black font-semibold font-mono hover:scale-105 transition-transform"
                onClick={() =>
                  window.open("mailto:ritikrana8596@gmail.com", "_self")
                }
              >
                <Mail className="mr-2 h-4 w-4" />
                ritikrana8596@gmail.com
              </Button>
              <a
                href="https://drive.google.com/file/d/1vhBi2CfbaQDo-NzdqEiLRe8hky1TdnFA/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono bg-transparent hover:scale-105 transition-transform text-sm rounded-lg"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 font-mono">
            &copy; 2024 Ritik Roushan Rana. Building the future, one line of
            code at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
