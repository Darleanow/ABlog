"use client";

import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Newspaper, PenTool, Palette } from "lucide-react";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

const features = [
  {
    icon: <PenTool className="w-6 h-6" />,
    title: "Easy Writing",
    description: "Write beautiful articles with our intuitive markdown editor",
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: "Beautiful Design",
    description: "Pre-built components and styles for stunning layouts",
  },
  {
    icon: <Newspaper className="w-6 h-6" />,
    title: "SEO Optimized",
    description: "Built-in SEO best practices for better visibility",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div className="absolute inset-0 -z-10" style={{ y: backgroundY }}>
        <motion.div
          className="absolute inset-0"
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      <motion.div
        animate="visible"
        className="flex flex-col items-center justify-center gap-12 py-20 md:py-32 px-4"
        initial="hidden"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.div
          className="inline-block max-w-3xl text-center justify-center relative"
          variants={itemVariants}
        >
          <motion.div
            animate="animate"
            className="absolute -top-12 -left-12"
            variants={floatingVariants}
          >
            <Sparkles className="w-8 h-8 text-orange-400" />
          </motion.div>

          <h1 className="relative">
            <span className={title({ size: "lg" })}>Make beautiful </span>
            <motion.span
              className={title({
                color: "yellow",
                size: "lg",
                className:
                  "bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent inline-block",
              })}
              transition={{ type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
            >
              articles{" "}
            </motion.span>
            <span className={title({ size: "lg" })}>
              regardless of your design experience.
            </span>
          </h1>

          <motion.p
            className={subtitle({ class: "mt-6 text-xl text-default-600" })}
            variants={itemVariants}
          >
            Modern, easy to write blog posts for your followers.
            <br />
            Focus on your content, we&apos;ll handle the design.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div className="flex gap-4" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className={`${buttonStyles({ radius: "full", size: "lg"})} text-white bg-gradient-to-r from-orange-500 to-rose-500 px-8`}
              size="lg"
              variant="shadow"
            >
              Get Started
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              isExternal
              className={buttonStyles({
                variant: "bordered",
                radius: "full",
                size: "lg",
                className: "border-orange-500 dark:border-orange-400",
              })}
              href={siteConfig.links.github}
            >
              <GithubIcon size={20} />
              GitHub
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-6 mt-8"
          variants={containerVariants}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateZ: 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
                <motion.div
                  className="flex flex-col items-center text-center gap-4"
                  initial={{ opacity: 0 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1 }}
                >
                  <motion.div
                    className="p-3 rounded-full bg-gradient-to-r from-orange-100 to-rose-100 dark:from-orange-900/50 dark:to-rose-900/50"
                    transition={{ duration: 0.5 }}
                    whileHover={{ rotate: 360 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-default-600">{feature.description}</p>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
