import { Project } from "@/types";

export const GALLERY_PROJECTS: Project[] = [
  {
    id: 1,
    img: "/images/random/home-decor-1.jpg",
    category: "Project #2",
    title: "Modern",
    description:
      "As Uber works through a huge amount of internal management turmoil.",
    participants: [
      { id: 1, name: "Elena Morison", img: "/images/random/team-1.jpg" },
      { id: 2, name: "Ryan Milly", img: "/images/random/team-2.jpg" },
      { id: 3, name: "Nick Daniel", img: "/images/random/team-3.jpg" },
      { id: 4, name: "Peterson", img: "/images/random/team-4.jpg" },
    ],
  },
  {
    id: 2,
    img: "/images/random/home-decor-2.jpg",
    category: "Project #1",
    title: "Scandinavian",
    description:
      "Music is something that every person has his or her own specific opinion about.",
    participants: [
      { id: 1, name: "Nick Daniel", img: "/images/random/team-3.jpg" },
      { id: 2, name: "Peterson", img: "/images/random/team-4.jpg" },
      { id: 3, name: "Elena Morison", img: "/images/random/team-1.jpg" },
      { id: 4, name: "Ryan Milly", img: "/images/random/team-2.jpg" },
    ],
  },
  {
    id: 3,
    img: "/images/random/home-decor-3.jpg",
    category: "Project #3",
    title: "Minimalist",
    description:
      "Different people have different taste, and various types of music.",
    participants: [
      { id: 1, name: "Peterson", img: "/images/random/team-4.jpg" },
      { id: 2, name: "Nick Daniel", img: "/images/random/team-3.jpg" },
      { id: 3, name: "Ryan Milly", img: "/images/random/team-2.jpg" },
      { id: 4, name: "Elena Morison", img: "/images/random/team-1.jpg" },
    ],
  },
];
