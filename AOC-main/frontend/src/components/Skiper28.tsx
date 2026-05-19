"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  AnimatePresence,
  Variants,
} from "framer-motion";
import ReactLenis from "lenis/react";
import React, { useRef, useEffect, useState } from "react";

const Skiper28 = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Enhanced scroll transforms with better easing
  const yMotionValue = useTransform(scrollYProgress, [0, 0.35, 1], [600, 0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.75, 1], [0, 1, 1, 0]);
  const rotateXValue = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [35, 25, 5, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.85, 0.95, 1.05, 1.1]);
  const blurValue = useTransform(scrollYProgress, [0, 0.2, 0.35, 1], [10, 5, 0, 0]);
  
  const transform = useMotionTemplate`rotateX(${rotateXValue}deg) translateY(${yMotionValue}px) translateZ(20px) scale(${scale}) blur(${blurValue}px)`;

  useEffect(() => {
    setIsInView(true);
  }, []);

  // Split text into words for staggered animation
  const textContent = "Attack on Code is a high-octane coding platform where developers build teams, ship projects, and conquer hackathons. Join the elite, bug-hunting developer unit and eradicate the chaos of legacy code.";
  const words = textContent.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 0.6,
      },
    },
  };

  return (
    <ReactLenis root>
      <div
        ref={targetRef}
        className="relative z-0 h-[200vh] w-screen bg-cover bg-center bg-no-repeat bg-fixed text-white"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
        }}
      >
        {/* Enhanced dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black/50 z-10" />

        {/* Animated "scroll down" indicator with enhanced animation */}
        <motion.div 
          className="absolute left-1/2 top-[10%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-white z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.span 
            className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-60 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-white after:to-[#ff5800] after:content-['']"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            scroll down to see
          </motion.span>
        </motion.div>

        {/* Main hero section with improved animations */}
        <div
          className="sticky top-0 mx-auto flex h-screen items-center justify-center bg-transparent py-20 z-20"
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px",
          }}
        >
          <motion.div
            style={{
              transformStyle: "preserve-3d",
              transform,
              opacity,
            }}
            className="w-full max-w-4xl text-center font-black tracking-tighter text-[#ff5800] px-6 drop-shadow-2xl"
          >
            {/* Responsive text size and staggered word animation */}
            <motion.div
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {words.map((word, index) => (
                <motion.span key={index} variants={wordVariants} className="inline-block mr-2">
                  {word}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced bottom gradient with smooth transition */}
        <div className="absolute bottom-0 left-0 h-[80vh] w-full bg-gradient-to-b from-transparent via-black/10 to-[#f9fafb] pointer-events-none" />
      </div>
    </ReactLenis>
  );
};

export { Skiper28 };
