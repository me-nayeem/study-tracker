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
  icon: LucideIcon;
};

// Matched against the subject name (English or Bangla), first match wins.
const SUBJECT_ART: { match: RegExp; art: SubjectArt }[] = [
  {
    match: /math|গণিত/i,
    art: { image: "/subjects/higher-math.webp", icon: Sigma },
  },
  {
    match: /physics|পদার্থ/i,
    art: { image: "/subjects/physics.webp", icon: Atom },
  },
  {
    match: /chem|রসায়ন/i,
    art: { image: "/subjects/chemistry.webp", icon: FlaskConical },
  },
  {
    match: /bio|জীব/i,
    art: { image: "/subjects/biology.webp", icon: Dna },
  },
  {
    match: /bangla|bengali|বাংলা/i,
    art: { image: "/subjects/bangla.webp", icon: Languages },
  },
  {
    match: /english|ইংরেজি/i,
    art: { image: "/subjects/english.webp", icon: BookA },
  },
  {
    // no illustration yet — the card shows the icon large instead
    match: /\bict\b|information|তথ্য/i,
    art: { image: null, icon: Cpu },
  },
  {
    match: /general knowledge|\bgk\b|সাধারণ জ্ঞান/i,
    art: { image: "/subjects/general-knowledge.webp", icon: Globe },
  },
];

const FALLBACK_ART: SubjectArt = { image: null, icon: Sparkles };

export function getSubjectArt(subjectName: string): SubjectArt {
  return SUBJECT_ART.find((entry) => entry.match.test(subjectName))?.art ?? FALLBACK_ART;
}
