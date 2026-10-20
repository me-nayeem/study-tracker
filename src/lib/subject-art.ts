import {
  Atom,
  BookA,
  Cpu,
  Dna,
  FlaskConical,
  Globe,
  Languages,
  Sigma,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type SubjectArt = {
  /** Transparent cut-out illustration in /public/subjects, or null for the fallback emblem. */
  image: string | null;
  /** Gem colour used for the card glow and emblem; the frame itself is always gold. */
  accent: string;
  icon: LucideIcon;
};

// Matched against the subject name (English or Bangla), first match wins.
const SUBJECT_ART: { match: RegExp; art: SubjectArt }[] = [
  {
    match: /math|গণিত/i,
    art: { image: "/subjects/higher-math.webp", accent: "#9d7cff", icon: Sigma },
  },
  {
    match: /physics|পদার্থ/i,
    art: { image: "/subjects/physics.webp", accent: "#5b8def", icon: Atom },
  },
  {
    match: /chem|রসায়ন/i,
    art: { image: "/subjects/chemistry.webp", accent: "#e0605b", icon: FlaskConical },
  },
  {
    match: /bio|জীব/i,
    art: { image: "/subjects/biology.webp", accent: "#34c08a", icon: Dna },
  },
  {
    match: /bangla|bengali|বাংলা/i,
    art: { image: "/subjects/bangla.webp", accent: "#ff7a3d", icon: Languages },
  },
  {
    match: /english|ইংরেজি/i,
    art: { image: "/subjects/english.webp", accent: "#4fb3d9", icon: BookA },
  },
  {
    // no illustration yet — the card shows the icon large instead
    match: /\bict\b|information|তথ্য/i,
    art: { image: null, accent: "#3cc4d6", icon: Cpu },
  },
  {
    match: /general knowledge|\bgk\b|সাধারণ জ্ঞান/i,
    art: { image: "/subjects/general-knowledge.webp", accent: "#e3a857", icon: Globe },
  },
];

const FALLBACK_ART: SubjectArt = { image: null, accent: "#e3a857", icon: Sparkles };

export function getSubjectArt(subjectName: string): SubjectArt {
  return SUBJECT_ART.find((entry) => entry.match.test(subjectName))?.art ?? FALLBACK_ART;
}
