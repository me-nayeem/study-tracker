export type Developer = {
  name: string;
  role: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  email?: string;
  phone?: string;
};

export const DEVELOPERS: Developer[] = [
  {
    name: "MD. Nayeem Islam",
    role: "Full-stack development & design — admin, student, and home experiences",
    portfolioUrl: "https://nayeem-islam-portfolio.vercel.app/",
    linkedinUrl: "https://www.linkedin.com/in/nayeem-ahmed100/",
    githubUrl: "https://github.com/me-nayeem",
    email: "menayeemahmed100@gmail.com",
    phone: "01879333905",
  },
  {
    name: "MD Sahariaj Hosen",
    role: "Business model",
    linkedinUrl: "https://www.linkedin.com/in/sahariaj/",
    githubUrl: "https://github.com/sahariajf",
    email: "Mdsahariajhosen@gmail.com",
    phone: "01774366047",
  },
];
