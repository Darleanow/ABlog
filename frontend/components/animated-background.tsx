"use client";

import React from "react";
import { motion } from "framer-motion";

const AnimatedBackground = () => {
  return (
    <div
      className="
        fixed inset-0 -z-10 overflow-hidden
        bg-gradient-to-b from-white to-gray-100
        dark:from-gray-900 dark:via-gray-950 dark:to-black
      "
    >
      {/* Subtle rotating gradient layers */}
      {Array.from({ length: 2 }).map((_, index) => (
        <motion.div
          key={index}
          animate={{ rotate: index % 2 === 0 ? [0, 360] : [360, 0] }}
          className="
            absolute inset-0
            [background:radial-gradient(circle,rgba(255,119,48,0.15)_0%,transparent_70%)]
            dark:[background:radial-gradient(circle,rgba(255,119,48,0.1)_0%,transparent_70%)]
            blur-[100px]
          "
          transition={{
            duration: 60 + index * 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Floating orbs */}
      <div className="absolute inset-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: ["0%", "10%", "0%"],
              x: ["0%", "5%", "-5%", "0%"],
            }}
            className="
              absolute
              rounded-full
              bg-gradient-to-r from-orange-300 to-pink-300
              dark:from-orange-500 dark:to-pink-500
              opacity-20
              blur-[60px]
            "
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              left: `${10 + i * 20}%`,
              top: `${10 + (i % 2) * 20}%`,
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      {/* Soft moving gradient overlay */}
      <motion.div
        animate={{ x: ["-10%", "10%", "-10%"] }}
        className="
          absolute inset-0
          [background:linear-gradient(90deg,rgba(255,87,34,0.2)_0%,transparent_100%)]
          dark:[background:linear-gradient(90deg,rgba(255,87,34,0.1)_0%,transparent_100%)]
          blur-[80px]
        "
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="
          absolute inset-0 opacity-10
          bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20100%20100%22%3E%3Cfilter%20id=%22noise%22%20x=%220%22%20y=%220%22%20width=%22100%25%22%20height=%22100%25%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.8%22%20numOctaves=%224%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22%20fill=%22white%22%20opacity=%220.04%22/%3E%3C/svg%3E')]
        "
      />
    </div>
  );
};

export default AnimatedBackground;
