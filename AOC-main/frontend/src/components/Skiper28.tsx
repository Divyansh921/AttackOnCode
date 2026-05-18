"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import ReactLenis from "lenis/react";
import React, { useRef } from "react";

const Skiper28 = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const yMotionValue = useTransform(scrollYProgress, [0, 0.7], [487, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 0.75], [1, 1, 0]);
  const transform = useMotionTemplate`rotateX(30deg) translateY(${yMotionValue}px) translateZ(10px)`;

  return (
    <ReactLenis root>
      <div
        ref={targetRef}
        className="relative z-0 h-[200vh] w-screen bg-cover bg-center bg-no-repeat bg-fixed text-white"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
        }}
      >
        {/* Dark overlay to make orange text pop */}
        <div className="absolute inset-0 bg-black/60" style={{ zIndex: -1 }} />

        <div className="absolute left-1/2 top-[10%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-white">
          <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-white after:to-[#ff5800] after:content-['']">
            scroll down to see
          </span>
        </div>
        <div
          className="sticky top-0 mx-auto flex h-screen items-center justify-center bg-transparent py-20"
          style={{
            transformStyle: "preserve-3d",
            perspective: "200px",
          }}
        >
          <motion.div
            style={{
              transformStyle: "preserve-3d",
              transform,
              opacity,
            }}
            className="font-geist w-full max-w-4xl text-center text-5xl font-black tracking-tighter text-[#ff5800] px-6"
          >
            Attack on Code is a high-octane coding platform where developers build teams, ship projects, and conquer hackathons. Join the elite, bug-hunting developer unit and eradicate the chaos of legacy code.
          </motion.div>
        </div>

        {/* Static bottom gradient to transition to the light page body below */}
        <div className="absolute bottom-0 left-0 h-[60vh] w-full bg-gradient-to-b from-transparent to-[#f9fafb]" />
      </div>
    </ReactLenis>
  );
};

export { Skiper28 };
