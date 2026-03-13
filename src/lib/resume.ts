import type { Profile } from "./profile";

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_REGEX = /(\+?\d[\d\s().-]{7,}\d)/;

const COMMON_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Tailwind",
  "CSS",
  "HTML",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "AWS",
  "Python",
  "Java",
  "C#",
  "GraphQL",
  "Redis",
  "Supabase",
];

function extractSectionLines(text: string, heading: RegExp) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const startIndex = lines.findIndex((line) => heading.test(line));
  if (startIndex === -1) return [];

  const section: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^[A-Z][A-Z\s]{2,}$/.test(line) || /:$/i.test(line)) {
      break;
    }
    section.push(line);
    if (section.length >= 12) break;
  }

  return section;
}

function parseSkills(text: string) {
  const skillsSection = extractSectionLines(text, /skills?/i);
  if (skillsSection.length) {
    return skillsSection
      .join(" ")
      .split(/,|\|/)
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  const found = COMMON_SKILLS.filter((skill) =>
    new RegExp(`\\b${skill}\\b`, "i").test(text)
  );
  return found;
}

function parseExperience(text: string) {
  const experienceLines = extractSectionLines(text, /(experience|work)/i);
  if (!experienceLines.length) return [];

  return experienceLines.slice(0, 4).map((line) => {
    const [titlePart, companyPart] = line.split(" at ");
    return {
      title: titlePart?.trim() ?? "",
      company: companyPart?.trim() ?? "",
      start: "",
      end: "",
      bullets: [],
    };
  });
}

export function mergeProfileFromResume(text: string, profile: Profile) {
  const email = profile.email || (text.match(EMAIL_REGEX)?.[0] ?? "");
  const phone = profile.phone || (text.match(PHONE_REGEX)?.[0] ?? "");
  const skills = profile.skills.length ? profile.skills : parseSkills(text);
  const experience = profile.experience.length
    ? profile.experience
    : parseExperience(text);

  return {
    ...profile,
    email,
    phone,
    skills,
    experience,
  } satisfies Profile;
}
