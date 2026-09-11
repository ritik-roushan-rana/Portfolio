"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Cpu,
  Database,
  Download,
  Eye,
  FileSearch,
  Factory,
  Fingerprint,
  Github,
  Linkedin,
  LineChart,
  Siren,
  Mail,
  Shield,
  Ticket,
  Zap,
} from "lucide-react";

import Painting from "./site/Painting";
import TopBar from "./site/TopBar";
import Compass from "./site/Compass";
import MaskText from "./site/MaskText";
import Statement from "./site/Statement";
import ProjectDeck from "./site/ProjectDeck";
import CareerTabs from "./site/CareerTabs";
import StackKeyboard from "./site/StackKeyboard";
import Reveal from "./site/Reveal";
import { scrollToSection } from "@/lib/smooth-scroll";

const SECTIONS = [
  { id: "home", label: "Index" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "path", label: "Path" },
  { id: "toolkit", label: "Toolkit" },
  { id: "contact", label: "Contact" },
];

/** The four the deck deals through. */
const PROJECTS = [
  {
    title: "Optifolio",
    meta: "Fintech · Reinforcement learning · Solo build",
    summary:
      "A Deep Q-Learning portfolio rebalancer that learns its policy from historical market data, wrapped in a Flutter app for goal setting, backtesting and rebalancing suggestions.",
    stats: [
      { label: "Domain", value: "Fintech" },
      { label: "Core", value: "Deep Q-Learning" },
      { label: "Surface", value: "Flutter iOS" },
    ],
    tech: ["PyTorch", "Flutter", "Express.js", "MongoDB", "Plotly"],
    icon: Zap,
    // Swipeable screens, ordered as a walkthrough: portfolio, what is in it,
    // then the reinforcement-learning rebalancer that is the point of the
    // project — early enough that a reader who swipes twice still reaches it.
    // Any that fail to load are dropped individually; see DeckArt.
    shots: [
      { src: "/projects/optifolio/overview.png", label: "Overview" },
      { src: "/projects/optifolio/holdings.png", label: "Holdings" },
      { src: "/projects/optifolio/rebalance.png", label: "RL rebalance" },
      { src: "/projects/optifolio/stock.png", label: "Stock detail" },
      { src: "/projects/optifolio/analytics.png", label: "Analytics" },
      { src: "/projects/optifolio/news.png", label: "News & alerts" },
      { src: "/projects/optifolio/assistant.png", label: "AI assistant" },
    ],
    wash: "linear-gradient(135deg, #ffc46b, #eb4400)",
    github: "https://github.com/ritik-roushan-rana/OptiFolio",
    demo: "https://drive.google.com/file/d/1_B-TvkwtawxcEpd7G_eS0meuNbnXG_NH/view?usp=drivesdk",
  },
  {
    title: "MarketMind",
    meta: "Fintech · Explainable ML · Solo build",
    summary:
      "Next-day directional prediction for 15 large-cap equities. XGBoost over price and sentiment features, FinBERT scoring the day's headlines, and per-feature TreeSHAP attributions behind every call — with a plain-English rationale written only from those attributions, so it cannot invent a story the model did not tell.",
    stats: [
      { label: "Domain", value: "Fintech" },
      { label: "Core", value: "XGBoost + FinBERT" },
      { label: "Surface", value: "FastAPI + React" },
    ],
    tech: ["XGBoost", "FinBERT", "SHAP", "FastAPI", "React", "Gemini"],
    icon: LineChart,
    // A desktop dashboard, so it gets a browser window rather than a phone.
    frame: "browser",
    shots: [
      { src: "/projects/marketmind/dashboard.png", label: "Dashboard" },
    ],
    wash: "linear-gradient(135deg, #ffd27a, #c2452a)",
    github: "https://github.com/ritik-roushan-rana/MarketMind",
    demo: "https://market2-ivory.vercel.app/",
  },
  {
    title: "VTour",
    meta: "Campus · Mobile product · UI/UX + build",
    summary:
      "A virtual campus tour for new students — maps, departments and facilities in one Flutter app, designed around a single uninterrupted navigation flow.",
    stats: [
      { label: "Domain", value: "EdTech" },
      { label: "Core", value: "Guided tours" },
      { label: "Surface", value: "Flutter iOS" },
    ],
    tech: ["Flutter", "Supabase", "UI/UX", "iOS"],
    icon: Eye,
    // The product itself, in the order you move through it. Onboarding and the
    // sign-in form are deliberately absent: they show the app's plumbing rather
    // than what it does.
    shots: [
      { src: "/projects/vtour/home.png", label: "Campus guide" },
      { src: "/projects/vtour/tour.png", label: "Guided tour" },
      { src: "/projects/vtour/map.png", label: "Campus map" },
      { src: "/projects/vtour/location.png", label: "Location" },
    ],
    wash: "linear-gradient(135deg, #ff9d5c, #93334f)",
    github: "https://github.com/ritik-roushan-rana/VTOUR",
    demo: "https://drive.google.com/file/d/1QyKJeWc1yVEDrFa4WhFBdcjEeyPYIWkX/view?usp=drivesdk",
  },
  {
    title: "SCBF",
    meta: "Security · Temporal graph networks · Patent pending",
    summary:
      "Supply Chain Behavioral Fingerprinting: eBPF captures what a package actually does while it installs — syscalls, file writes, network connections, credential reads — a Temporal Graph Network encodes that into a behavioural fingerprint, and it is scored against a learned envelope of what legitimate packages of that type do. Matches the OSCAR benchmark's F1 at roughly 30x lower per-package latency.",
    // Published numbers from the repo's own evaluation on the OSCAR benchmark
    // (Zenodo 13746167), test split at the tuned 0.35 threshold.
    stats: [
      { label: "Test F1", value: "92.3%" },
      { label: "ROC-AUC", value: "0.979" },
      { label: "Per package", value: "~3s" },
    ],
    tech: ["PyTorch", "TGN", "eBPF", "Graph ML", "Python"],
    icon: Fingerprint,
    wash: "linear-gradient(135deg, #eb4400, #5b2550)",
    github: "https://github.com/ritik-roushan-rana/SCBF",
    // No public deployment: it needs a Linux host with eBPF running as root.
    demo: null,
  },
];

/**
 * Shown only in the "See all" panel. The deck reserves a full viewport of
 * scroll per card, so it stays a curated four; this is the rest of the shelf.
 */
const MORE_PROJECTS = [
  {
    title: "TixLock",
    meta: "Ticketing · Full stack · Solo build",
    summary:
      "A ticket booking platform where the hard part is concurrency: seats lock in real time while a customer checks out, holds expire on their own, and a waitlist reassigns a seat the moment one is released. QR-code tickets, email notifications, and separate roles for customers, organisers and admins.",
    stats: [
      { label: "Domain", value: "Ticketing" },
      { label: "Core", value: "Real-time seat locks" },
      { label: "Surface", value: "React + Postgres" },
    ],
    tech: ["React", "Node.js", "Express", "PostgreSQL"],
    icon: Ticket,
    // Desktop captures, so they get the browser frame rather than a phone.
    frame: "browser",
    // Seat map first: it is the screen that shows what the project is actually
    // about — the locking, holds and waitlist states are all legible in it.
    shots: [
      { src: "/projects/tix/seatmap.png", label: "Seat map" },
      { src: "/projects/tix/events.png", label: "Events" },
    ],
    wash: "linear-gradient(135deg, #ffc46b, #a8402f)",
    github: "https://github.com/ritik-roushan-rana/tixlock",
    demo: "https://tixlock-seven.vercel.app",
  },
  {
    title: "Grade Change Intelligence",
    meta: "Industrial ML · Quality control · Solo build",
    summary:
      "An assistant for a paper mill's quality control system. It watches a grade change in progress, flags rising risk of breaching the 2.5% basis-weight deviation limit before it happens, and recommends corrective setpoints drawn from a library of similar historical recoveries — with the reasoning behind each suggestion. Every model stays in Python behind a REST API; the browser only draws what it returns.",
    stats: [
      { label: "Recoveries", value: "344 patterns" },
      { label: "Core", value: "RF + GBM + KNN" },
      { label: "Cold start", value: "0.3s" },
    ],
    tech: ["Python", "scikit-learn", "FastAPI", "React", "TypeScript"],
    icon: Factory,
    wash: "linear-gradient(135deg, #ffb765, #7a3350)",
    github: "https://github.com/ritik-roushan-rana/grade-change-intelligence",
    // The repo lists a Render URL, but it did not answer inside three minutes —
    // free-tier instances spin down and this one looks suspended. Left unlinked
    // rather than shipping a dead "View project" button.
    demo: null,
  },
  {
    title: "Fact Knowledge Layer",
    meta: "Document AI · Deterministic core · Solo build",
    summary:
      "Pulls checkable claims out of PDFs, proves each one against the exact region of the exact page it came from, and decides whether claims in different documents corroborate, contradict, or only look like they conflict because they measure different things. No LLM reads a PDF or decides a relationship — the core is rules, and a strict mode refuses even the optional adjudication of ambiguous pairs.",
    // Live figures from the app's own Documents view, over a five-document
    // run. "None" is the project's whole thesis, so it keeps a cell.
    stats: [
      { label: "Grounded facts", value: "4,249" },
      { label: "Relationships", value: "14,165" },
      { label: "API keys", value: "None" },
    ],
    tech: ["Python", "PDF parsing", "Rule engine", "JavaScript"],
    icon: FileSearch,
    frame: "browser",
    // Anchored left: the app's sidebar runs down the left edge, and a centred
    // crop in a 16:10 tile cut half of it off.
    focus: "left center",
    shots: [{ src: "/projects/fact/documents.png", label: "Documents" }],
    wash: "linear-gradient(135deg, #f0a862, #8c3350)",
    github: "https://github.com/ritik-roushan-rana/fact-knowledge-layer",
    // Runs locally against your own PDFs; there is no hosted instance.
    demo: null,
  },
  {
    title: "Emergency Vehicle AI",
    meta: "Computer vision · Traffic control · Research",
    summary:
      "YOLOv8 and OpenCV pick ambulances, fire trucks and police vehicles out of a live traffic feed, then drive the signals: green is held or flipped from vehicle density and emergency presence across a two-lane, multi-junction Indian road, with a Google Maps route preview to the nearest destination.",
    stats: [
      { label: "Domain", value: "Traffic" },
      { label: "Core", value: "YOLOv8 + OpenCV" },
      { label: "Surface", value: "Python sim" },
    ],
    tech: ["YOLOv8", "OpenCV", "Python", "Google Maps API"],
    icon: Siren,
    frame: "browser",
    shots: [
      { src: "/projects/emergency/detection.png", label: "Live detection" },
    ],
    wash: "linear-gradient(135deg, #ff8a4d, #6d2a4a)",
    github: "https://github.com/ritik-roushan-rana/Emergency_vehicle",
    // Runs against a local video feed and a YOLO checkpoint; nothing to deploy.
    demo: null,
  },
];

/**
 * Newest first. Each role's `points` are its own facts split into outcomes,
 * each opening with a bold lead-in so the pane skims as a list before it
 * reads as prose. Nothing here is new — it is the same content the paragraph
 * version carried, re-cut. `location` is only set where it is actually known.
 */
const CAREER = [
  {
    kind: "Internship",
    org: "Martvalley",
    organization: "Martvalley Online Pvt. Ltd",
    logo: "/logos/martvalley.png",
    title: "Artificial Intelligence Intern",
    years: "2025",
    period: "May 2025 — Jul 2025",
    icon: Cpu,
    points: [
      {
        lead: "Shipped real-time AI modules",
        text: "across 5+ development projects, cutting end-to-end processing latency by 30% and lifting system throughput by 25%.",
      },
      {
        lead: "Took models to production:",
        text: "optimised the ML training workflows and integrated the resulting models into live systems.",
      },
      {
        lead: "Worked the image pipeline:",
        text: "collaborated on pipelines handling 5,000+ images a week, raising model accuracy by 5%.",
      },
    ],
  },
  {
    kind: "Internship",
    org: "IBM",
    organization: "IBM Career Education Program",
    logo: "/logos/ibm.svg",
    title: "Cyber Security Analyst Intern",
    years: "2025",
    period: "May 2025 — Jun 2025",
    location: "Remote",
    icon: Shield,
    points: [
      {
        lead: "Analysed simulated threats",
        text: "and applied defensive strategies to harden system environments.",
      },
      {
        lead: "Monitored and reported vulnerabilities",
        text: "across networks using industry-standard tooling.",
      },
      {
        lead: "Built hands-on fundamentals",
        text: "in malware analysis, threat intelligence and penetration testing.",
      },
    ],
  },
  {
    kind: "Education",
    org: "VIT Vellore",
    organization: "Vellore Institute of Technology",
    logo: "/logos/vit.png",
    title: "B.Tech CSE, Information Security",
    years: "2023 — 27",
    period: "2023 — 2027",
    location: "Vellore",
    icon: Database,
    points: [
      {
        lead: "Specialising in information security",
        text: "within Computer Science and Engineering.",
      },
      {
        lead: "Building alongside the degree:",
        text: "self-directed work in software and mobile application development.",
      },
    ],
  },
];

const TOOLKIT = [
  {
    name: "Languages",
    items: [
      "Python",
      "Java",
      "C++",
      "TypeScript",
      "Dart",
      "SQL",
    ],
  },
  {
    name: "Frameworks",
    items: [
      "React",
      "Next.js",
      "Flutter",
      "PyTorch",
      "XGBoost",
      "FastAPI",
      "Stable-Baselines3",
      "OpenCV",
    ],
  },
  {
    name: "Tooling",
    items: [
      "Git",
      "Postman",
      "Wireshark",
      "ELK Stack",
      "Docker",
      "Matplotlib",
      "Plotly",
    ],
  },
  {
    name: "Platforms",
    items: ["Ubuntu", "Kali Linux", "VirtualBox", "Supabase", "Railway", "Vercel"],
  },
];

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/ritik-roushan-rana?tab=repositories",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ritik-roushan-rana-b6a89528a/",
    icon: Linkedin,
  },
  { label: "Email", href: "mailto:ritikrana8596@gmail.com", icon: Mail },
];

const RESUME_URL =
  "https://drive.google.com/file/d/1624hR6m0SE-CpaeSzeEqpf6SO_tRj1FD/view?usp=sharing";

export default function Portfolio() {
  return (
    <>
      <TopBar mark="Ritik Roushan Rana" location="New Delhi" />
      <Compass sections={SECTIONS} />

      <main>
        {/* ---------------------------------------------------------------
            HERO — a painting, edge to edge, with the nav over it and one
            caption row pinned to the foot: who this is on the left, a way
            down on the right. Nothing sits in the middle of the picture.
            --------------------------------------------------------------- */}
        <section id="home" className="hero">
          <Painting />

          <div className="hero__foot shell">
            <div className="hero__plate">
              <MaskText
                as="h1"
                className="display hero__name"
                delay={1400}
                lines={[<>Ritik Roushan Rana</>]}
              />

              <MaskText
                as="p"
                className="hero__role"
                delay={1650}
                step={0}
                lines={[
                  <>
                    Machine Learning Engineer — focused on deep RL, computer
                    vision and systems that hold up under pressure.
                  </>,
                ]}
              />
            </div>

            <Reveal delay={1850} className="hero__dive">
              <button
                type="button"
                className="dive"
                onClick={() => scrollToSection("about")}
              >
                Dive deeper
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            ABOUT — a single statement that lights up word by word, paired
            with the portrait. The statement is the section; there is no
            second paragraph competing with it.
            --------------------------------------------------------------- */}
        <section id="about" className="section section--full">
          <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
            <div>
              <p className="eyebrow mb-10">01 — About</p>

              <Statement text="I like solving problems with data, and building the models that do it." />

              <Reveal stagger className="mt-10 max-w-xl space-y-5">
                <p className="text-[0.98rem] leading-relaxed text-[rgba(242,230,189,0.62)]">
                  Final-year CSE (InfoSec) student at VIT Vellore, focused on
                  machine learning, data science and AI, with cybersecurity
                  on the side. Solid
                  grounding in programming and DSA; I&apos;d rather reach for
                  a data-driven answer than a guess.
                </p>
                <p className="text-[0.98rem] leading-relaxed text-[rgba(242,230,189,0.62)]">
                  Right now I&apos;m building real experience in predictive
                  modelling and data analysis, and going deeper into neural
                  networks and reinforcement learning. I also build mobile
                  apps in Flutter.
                </p>
                <p className="text-[0.98rem] leading-relaxed text-[rgba(242,230,189,0.62)]">
                  Curious and quick to adapt. Looking to build things that
                  matter and grow in ML, data science and AI.
                </p>
                <a
                  className="link-u inline-block font-mono text-xs uppercase tracking-[0.16em]"
                  href="mailto:ritikrana8596@gmail.com"
                >
                  ritikrana8596@gmail.com
                </a>
              </Reveal>
            </div>

            <Reveal className="lg:pt-24">
              <figure className="portrait">
                <Image
                  src="/profile-photo.jpeg"
                  alt="Ritik Roushan Rana"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 30rem"
                  className="portrait__img"
                />
                <span className="portrait__levels" aria-hidden="true" />
                <figcaption className="portrait__caption">
                  New Delhi · 2026
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>


        {/* ---------------------------------------------------------------
            WORK — a dealt deck on a pinned stage. The header sits in the
            shell; the deck itself is full-bleed and owns its own gutter.
            See components/site/ProjectDeck.jsx.
            --------------------------------------------------------------- */}
        <section id="work" className="section">
          <div className="shell mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-6">02 — Selected work</p>
              <MaskText
                as="h2"
                className="display display--lg"
                lines={[<>Things I&apos;ve</>, <>built</>]}
              />
            </div>
            <p className="max-w-xs font-mono text-xs uppercase leading-relaxed tracking-[0.14em] text-[var(--muted)]">
              Four projects, from reinforcement learning to supply-chain defence
            </p>
          </div>

          <ProjectDeck
            projects={PROJECTS}
            all={[...PROJECTS, ...MORE_PROJECTS]}
          />
        </section>

        {/* ---------------------------------------------------------------
            PATH — experience and education as a master–detail: every role
            listed, the selected one opened. See components/site/CareerTabs.jsx.
            --------------------------------------------------------------- */}
        <section id="path" className="section shell">
          <div className="mb-12">
            <p className="eyebrow mb-6">03 — Path</p>
            <MaskText
              as="h2"
              className="display display--lg"
              lines={[<>Where I&apos;ve</>, <>been</>]}
            />
          </div>

          <CareerTabs items={CAREER} />
        </section>

        {/* ---------------------------------------------------------------
            TOOLKIT — a mechanical keyboard, one row per group, that you can
            click or literally type on. See components/site/StackKeyboard.jsx.
            --------------------------------------------------------------- */}
        <section id="toolkit" className="section shell">
          <div className="mb-12">
            <p className="eyebrow mb-6">04 — Toolkit</p>
            <MaskText
              as="h2"
              className="display display--lg"
              lines={[<>What I work</>, <>with</>]}
            />
          </div>

          <Reveal>
            <StackKeyboard groups={TOOLKIT} />
          </Reveal>
        </section>

        {/* ---------------------------------------------------------------
            CONTACT — the email itself as the headline, at display size.
            --------------------------------------------------------------- */}
        <section id="contact" className="section shell">
          <p className="eyebrow mb-8">05 — Contact</p>

          <MaskText
            as="p"
            className="display display--md max-w-3xl"
            lines={[
              <>
                Got something worth{" "}
                <span className="serif-accent">building</span>?
              </>,
            ]}
          />

          <Reveal className="mt-10">
            <a
              className="contact__huge"
              href="mailto:ritikrana8596@gmail.com"
              data-cursor="Mail"
            >
              Say hello
            </a>
          </Reveal>

          <Reveal stagger className="mt-14 flex flex-wrap gap-3">
            <a className="btn btn--solid" href="mailto:ritikrana8596@gmail.com">
              <Mail className="h-4 w-4" />
              ritikrana8596@gmail.com
            </a>
            <a
              className="btn"
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download résumé
            </a>
          </Reveal>
        </section>
      </main>

      <footer className="footer shell">
        <div className="footer__row">
          <span>© {new Date().getFullYear()} Ritik Roushan Rana</span>
          <div className="footer__socials">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                className="link-u"
                href={social.href}
                target={
                  social.href.startsWith("mailto:") ? undefined : "_blank"
                }
                rel={
                  social.href.startsWith("mailto:")
                    ? undefined
                    : "noopener noreferrer"
                }
              >
                {social.label}
              </a>
            ))}
          </div>
          <span>New Delhi, India</span>
        </div>
      </footer>
    </>
  );
}
