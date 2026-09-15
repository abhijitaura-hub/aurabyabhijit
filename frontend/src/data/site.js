export const SITE = {
  name: "AURA",
  fullName: "AURA by Abhijit",
  founder: "Abhijit Debnath",
  domain: process.env.REACT_APP_SITE_URL || "https://aurabyabhijit.com",
  tagline: "Technology Leadership for an Intelligent Future.",
  description:
    "Exploring how AI, technology and digital transformation can create practical, secure and measurable business impact.",
};

export const SOCIALS = {
  linkedin: "https://www.linkedin.com/in/ad-abhi/",
  youtube: "https://www.youtube.com/@aurabyabhijit",
  facebook: "https://www.facebook.com/profile.php?id=61593916474901",
};

export const STATS = [
  { value: "20+", label: "Years in IT", testId: "stat-years-it" },
  { value: "10+", label: "Years in Technology Leadership", testId: "stat-years-leadership" },
  { value: "77+", label: "Locations Enabled", note: "Experience supporting technology across distributed business operations.", testId: "stat-locations" },
  { value: "Enterprise", label: "Cloud · Infrastructure · Security", testId: "stat-enterprise" },
];

export const DIMENSIONS = [
  {
    num: "01",
    title: "AI & Intelligence",
    slug: "ai-intelligence",
    desc: "Where generative AI and intelligent agents create genuine leverage — and where they don't.",
    topics: ["Generative AI", "AI Agents", "AI Strategy", "Intelligent Automation", "Local AI"],
  },
  {
    num: "02",
    title: "Digital Transformation",
    slug: "digital-transformation",
    desc: "Transformation is a business decision executed through technology — never the reverse.",
    topics: ["Digital Strategy", "Process Transformation", "Technology Adoption", "Business Analysis"],
  },
  {
    num: "03",
    title: "Cybersecurity",
    slug: "cybersecurity",
    desc: "Security that enables the business instead of taxing it — built on culture, not just controls.",
    topics: ["Security Strategy", "Zero Trust", "Security Operations", "Risk & Governance"],
  },
  {
    num: "04",
    title: "Cloud & Infrastructure",
    slug: "cloud-infrastructure",
    desc: "Architecture-first thinking across Azure, hybrid estates and the platforms enterprises run on.",
    topics: ["Azure", "Cloud Architecture", "Hybrid Infrastructure", "Enterprise Platforms"],
  },
  {
    num: "05",
    title: "Automation",
    slug: "automation",
    desc: "Simplify first, then automate. The order determines whether you get leverage or chaos.",
    topics: ["AI Workflows", "IT Automation", "Business Automation", "Intelligent Operations"],
  },
  {
    num: "06",
    title: "Technology Leadership",
    slug: "technology-leadership",
    desc: "The judgment layer: strategy, governance and the CIO perspective that connects it all.",
    topics: ["IT Strategy", "Technology Governance", "CIO Thinking", "Technology Advisory"],
  },
];

export const PHILOSOPHY_PAIRS = [
  { left: "AI without strategy", right: "Complexity" },
  { left: "Cloud without architecture", right: "Cost" },
  { left: "Security without culture", right: "Friction" },
  { left: "Automation without process", right: "Chaos" },
];

export const FIELD_NOTES = [
  {
    tag: "Cloud",
    title: "Enterprise Cloud Transformation",
    problem: "Legacy infrastructure quietly became the ceiling on every new initiative.",
    thinking: "Migration is not transformation. Moving the mess to the cloud just relocates it — and bills hourly for the privilege.",
    approach: "Architecture first. Workload by workload, with governance and cost discipline established before scale.",
    outcome: "A durable lesson in sequencing: the organisations that win at cloud are deliberate before they are fast.",
  },
  {
    tag: "Infrastructure",
    title: "Infrastructure at Scale",
    problem: "Technology operations spread across 65+ distributed business locations, each with local realities.",
    thinking: "Standardisation and local flexibility are not enemies — but the boundary between them must be designed, not discovered.",
    approach: "Central platforms with clear guardrails; local autonomy where the business genuinely differs.",
    outcome: "Distributed operations taught me that reliability is a design property, not an operations heroics metric.",
  },
  {
    tag: "Security",
    title: "Cybersecurity & Governance",
    problem: "Security posture that existed in documents more than in daily behaviour.",
    thinking: "You cannot audit your way to security. Controls that fight the workflow will lose to the workflow.",
    approach: "Identity as the perimeter, governance embedded in process, risk discussed in business language.",
    outcome: "Security works when it becomes culture. Everything else is expensive friction.",
  },
  {
    tag: "Applications",
    title: "Enterprise Applications",
    problem: "Application landscapes that grew by acquisition and urgency rather than design.",
    thinking: "Every application is a promise someone must keep — in licences, integrations, upgrades and skills.",
    approach: "Rationalise relentlessly. Fewer platforms, deeper capability, clear ownership for each.",
    outcome: "The best application strategy I know is subtraction with a business case.",
  },
  {
    tag: "AI & Automation",
    title: "AI & Automation in Practice",
    problem: "Pressure to 'do something with AI' before anyone defined what was worth doing.",
    thinking: "The model is the easy part. The process, the data and the ownership are the strategy.",
    approach: "Start with boring, high-frequency workflows. Baseline first, automate second, scale what proves out.",
    outcome: "Quiet automations that survive are worth more than loud pilots that don't.",
  },
];

export const DECISION_STEPS = [
  { num: "01", title: "Understand", question: "What problem are we actually solving?" },
  { num: "02", title: "Simplify", question: "Can technology make the process simpler?" },
  { num: "03", title: "Secure", question: "Can it be trusted and governed?" },
  { num: "04", title: "Automate", question: "What should humans stop doing manually?" },
  { num: "05", title: "Scale", question: "Can the solution grow with the organization?" },
  { num: "06", title: "Measure", question: "What business outcome did we create?" },
];

export const TIMELINE = [
  { era: "Early Technology Journey", note: "Hands-on foundations — systems, networks, and the discipline of making things work." },
  { era: "Enterprise IT", note: "Operating technology inside real businesses, where uptime and budgets are not abstractions." },
  { era: "Technology Leadership", note: "Moving from solving problems to deciding which problems matter." },
  { era: "Cloud & Digital Transformation", note: "Leading the shift from owned infrastructure to architecture-driven cloud estates." },
  { era: "Cybersecurity & Governance", note: "Embedding security and risk thinking into how the organisation actually operates." },
  { era: "AI & Automation", note: "Applying intelligent automation where it creates measurable, practical value." },
  { era: "AURA", note: "The platform for everything learned — and everything still being explored." },
];

export const ADVISORY_AREAS = [
  { title: "AI Strategy", desc: "Identify where AI can create meaningful value — and be honest about where it can't." },
  { title: "AI Automation", desc: "Discover workflows where intelligent automation can remove repetitive, low-judgment work." },
  { title: "Digital Transformation", desc: "Develop practical transformation roadmaps grounded in how your business actually runs." },
  { title: "Cybersecurity Strategy", desc: "Align security, technology and business risk into one coherent posture." },
  { title: "Technology Advisory", desc: "Support complex technology decisions with independent, experienced perspective." },
  { title: "Executive Technology Advisory", desc: "Bring seasoned technology judgment into leadership conversations where it matters most." },
];

export const SPEAKING_TOPICS = [
  "AI & Business",
  "AI Agents",
  "Cybersecurity",
  "Digital Transformation",
  "Technology Leadership",
  "Future of Work",
  "Automation",
  "CIO Thinking",
];

export const PRINCIPLES = [
  "Stay curious.",
  "Question assumptions.",
  "Simplify complexity.",
  "Build securely.",
  "Automate intelligently.",
  "Measure what matters.",
];

export const CONTACT_TOPICS = [
  "AI Strategy",
  "AI Automation",
  "Digital Transformation",
  "Cybersecurity Strategy",
  "Technology Advisory",
  "Executive Advisory",
  "Speaking Invitation",
  "Something Else",
];
