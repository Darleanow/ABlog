"use client";

import React from "react";
import { motion } from "framer-motion";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      {/* Subtle rotating gradient layers */}
      {Array.from({ length: 2 }).map((_, index) => (
        <motion.div
          key={index}
          animate={{ rotate: index % 2 === 0 ? [0, 360] : [360, 0] }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle, rgba(255, 119, 48, 0.1) 0%, transparent 70%)`,
            filter: "blur(100px)",
          }}
          transition={{
            duration: 60 + index * 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Floating orbs for visual interest */}
      <div className="absolute inset-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            animate={{
              y: ["0%", "10%", "0%"],
              x: ["0%", "5%", "-5%", "0%"],
            }}
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-orange-500 to-pink-500 opacity-20"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              left: `${10 + i * 20}%`,
              top: `${10 + (i % 2) * 20}%`,
              filter: "blur(60px)",
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
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255, 87, 34, 0.1) 0%, transparent 100%)",
          filter: "blur(80px)",
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cfilter id='noise' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' fill='white' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
