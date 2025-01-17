"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { Button } from "@nextui-org/button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const teamMembers = [
  {
    name: "Enzo",
    role: "Project Manager & Front-End Developer",
    description: "Led the project and handled front-end development with Jory",
  },
  {
    name: "Jory",
    role: "Front-End Developer",
    description:
      "Focused on user interface and experience. Helped a lot to design a better UI/UX experience for our users",
  },
  {
    name: "Damien",
    role: "Back-End Architect",
    description:
      "Designed and structured the backend architecture, made the database",
  },
  {
    name: "Léo",
    role: "Back-End Developer",
    description:
      "Implemented server-side functionality, created routes with Damien",
  },
];

export default function AboutPage() {
  return (
    <motion.div
      animate="visible"
      className="container mx-auto px-4 py-12"
      initial="hidden"
      variants={fadeIn}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
          About ABlog
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Discover the story behind our academic project in clean code
          development.
        </p>
      </div>

      {/* Project Overview */}
      <motion.section className="mb-16">
        <h2 className="text-3xl font-bold mb-4">Project Overview</h2>
        <p className="text-gray-700 dark:text-gray-400 text-lg">
          ABlog was developed as part of our CleanCode academic module, serving
          as a practical application of software engineering principles and best
          practices. While primarily focused on technology, this blog represents
          our journey in implementing clean code practices and modern
          development techniques in a real-world project.
        </p>
      </motion.section>

      {/* Meet the Team */}
      <motion.section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Meet the Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="p-6 border rounded-lg shadow-md"
              variants={fadeIn}
            >
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                {member.name}
              </h3>
              <p className="text-gray-500 font-medium">{member.role}</p>
              <p className="text-gray-700 dark:text-gray-400 mt-2">
                {member.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* GitHub Link */}
      <motion.div className="flex justify-center mt-8" variants={fadeIn}>
        <Button
          as="a"
          href="https://github.com/Darleanow/ABlog"
          size="lg"
          startContent={<Github size={20} />}
          target="_blank"
        >
          View on GitHub
        </Button>
      </motion.div>
    </motion.div>
  );
}
