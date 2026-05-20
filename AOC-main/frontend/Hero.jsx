import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import "./Hero.css";
import erenSrc from "./eren.png";

function splitToChars(line) {
  return Array.from(line).map((ch) => (ch === " " ? "\u00A0" : ch));
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // mapping for cinematic parallax
  const textX = useTransform(scrollYProgress, [0, 0.32, 0.7, 1], [-80, -28, -6, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.32, 0.7, 1], [80, 24, 6, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.32, 0.7], [0, 0.7, 1]);
  const tX = useSpring(textX, { stiffness: 160, damping: 30 });
  const tY = useSpring(textY, { stiffness: 160, damping: 30 });
  const tO = useSpring(textOpacity, { stiffness: 140, damping: 26 });

  const erenY = useTransform(scrollYProgress, [0, 0.5, 0.86, 1], [300, 88, 8, 0]);
  const erenOpacity = useTransform(scrollYProgress, [0, 0.5, 0.86], [0, 0.9, 1]);
  const erenScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 0.992, 1]);
  const eY = useSpring(erenY, { stiffness: 170, damping: 34 });
  const eS = useSpring(erenScale, { stiffness: 150, damping: 28 });

  const [textVisible, setTextVisible] = useState(false);
  const [erenVisible, setErenVisible] = useState(false);

  useEffect(() => {
    const unsub = scrollYProgress.onChange((v) => {
      if (v > 0.30) setTextVisible(true); // earlier for cinematic overlap
      if (v > 0.56) setErenVisible(true); // Eren follows closely after
    });
    return unsub;
  }, [scrollYProgress]);

  // slower, more cinematic stagger
  const lineContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0 } },
  };

  const letter = {
    hidden: { y: 20, x: -8, opacity: 0, rotate: -1.8 },
    visible: (i = 0) => ({
      y: 0,
      x: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 140,
        damping: 20,
        mass: 0.5,
      },
    }),
  };

  const lines = [
    "“If you want to change something,",
    "you have to be willing to throw everything away.",
    "If you think reality is just living comfortably",
    "and following your instructions, you're wrong!”",
  ];

  return (
    <section className="hero" ref={ref}>
      <div className="hero-inner">
        <motion.div
          className="hero-copy"
          style={{ x: tX, y: tY, opacity: tO, willChange: "transform, opacity" }}
        >
          <div className="quote" aria-hidden={false}>
            {lines.map((ln, li) => (
              <motion.div
                className="line-container"
                key={li}
                variants={lineContainer}
                initial="hidden"
                animate={textVisible ? "visible" : "hidden"}
                style={{ display: "block", overflow: "hidden" }}
              >
                {splitToChars(ln).map((ch, ci) => (
                  <motion.span
                    className="char"
                    key={ci}
                    custom={ci}
                    variants={letter}
                    aria-hidden="true"
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.div>
            ))}

            <motion.div
              className="line-container credit-line"
              variants={lineContainer}
              initial="hidden"
              animate={textVisible ? "visible" : "hidden"}
            >
              {splitToChars("— Eren Yeager").map((ch, i) => (
                <motion.span className="char credit-char" key={i} variants={letter} style={{ display: "inline-block", whiteSpace: "pre" }}>
                  {ch}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className={`hero-eren ${erenVisible ? "active" : ""}`}
          style={{ y: eY, opacity: erenOpacity, scale: eS, willChange: "transform, opacity" }}
        >
          <div className="eren-shadow" />
          <div className={`eren-rim ${erenVisible ? "on" : "off"}`}></div>
          <img src={erenSrc} alt="Eren" draggable="false" className={`eren-img ${erenVisible ? "revealed" : "not-revealed"}`} />
        </motion.div>
      </div>
    </section>
  );
}
