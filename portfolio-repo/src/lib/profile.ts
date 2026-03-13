import { promises as fs } from "fs";
import path from "path";

export type ExperienceItem = {
  company: string;
  title: string;
  start: string;
  end: string;
  bullets: string[];
};

export type ProjectItem = {
  name: string;
  link: string;
  description: string;
  stack: string[];
};

export type EducationItem = {
  school: string;
  degree: string;
  year: string;
};

export type Profile = {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  resumeText: string;
};

const dataPath = path.join(process.cwd(), "data", "profile.json");

const defaultProfile: Profile = {
  name: "Your Name",
  role: "Full-Stack Developer",
  location: "Your City, Country",
  email: "you@example.com",
  phone: "+1 555 123 4567",
  website: "https://your-website.com",
  summary:
    "Short intro about your work, what you love building, and the impact you aim for.",
  skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"],
  experience: [
    {
      company: "Company A",
      title: "Software Engineer",
      start: "2023",
      end: "Present",
      bullets: [
        "Built a scalable dashboard used by 10k+ users",
        "Led performance improvements that reduced load time by 45%",
      ],
    },
  ],
  projects: [
    {
      name: "Project One",
      link: "https://github.com/yourname/project-one",
      description:
        "A brief description of what the project does and why it matters.",
      stack: ["Next.js", "Tailwind", "Supabase"],
    },
  ],
  education: [
    {
      school: "University Name",
      degree: "B.S. in Computer Science",
      year: "2022",
    },
  ],
  resumeText: "",
};

export function normalizeProfile(input: Partial<Profile>): Profile {
  return {
    ...defaultProfile,
    ...input,
    skills: Array.isArray(input.skills) ? input.skills : defaultProfile.skills,
    experience: Array.isArray(input.experience)
      ? input.experience
      : defaultProfile.experience,
    projects: Array.isArray(input.projects)
      ? input.projects
      : defaultProfile.projects,
    education: Array.isArray(input.education)
      ? input.education
      : defaultProfile.education,
    resumeText: typeof input.resumeText === "string" ? input.resumeText : "",
  };
}

export async function readProfile(): Promise<Profile> {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return normalizeProfile(parsed);
  } catch {
    return defaultProfile;
  }
}

export async function writeProfile(profile: Profile): Promise<void> {
  const normalized = normalizeProfile(profile);
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(normalized, null, 2), "utf-8");
}
