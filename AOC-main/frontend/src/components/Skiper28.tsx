"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Skiper28 = () => {
  const heroRef = useRef(null);
  const erenRef = useRef(null);
  const quoteRef = useRef(null);
  const firstWordsRef = useRef(null);
  const remainingLinesRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;

    // Kill any existing animations
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 3, // slower scrub for cinematic feel
          markers: false,
          pin: true,
          pinSpacing: false,
        },
      });

      // Eren animation: rises from below, scales up
      timeline.fromTo(
        erenRef.current,
        { y: 400, opacity: 0, scale: 0.85 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
        0
      );

      // First two words: appear with Eren
      timeline.fromTo(
        firstWordsRef.current,
        { y: 40, opacity: 0, x: -60 },
        { y: 0, opacity: 1, x: 0, duration: 1, ease: "power2.out" },
        0
      );

      // Remaining quote lines: staggered reveal
      const remainingLines = remainingLinesRef.current?.querySelectorAll(".quote-line") || [];
      timeline.fromTo(
        remainingLines,
        { y: 30, opacity: 0, x: -40 },
        { y: 0, opacity: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" },
        0.3 // slight delay after first two words
      );

      // Idle floating while pinned (very subtle)
      gsap.to(erenRef.current, {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        paused: false,
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={heroRef} className="relative w-full min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/aot-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
      </div>

      {/* Content container */}
      <div className="relative h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex gap-12 items-center justify-between h-full">
          {/* LEFT: Quote text */}
          <div
            ref={quoteRef}
            className="flex-1 z-10"
            style={{ willChange: "transform, opacity" }}
          >
            {/* First two words - pin with Eren */}
            <div
              ref={firstWordsRef}
              className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tighter text-white mb-2"
              style={{ willChange: "transform, opacity" }}
            >
              If you
            </div>

            {/* Remaining quote lines - staggered reveal */}
            <div
              ref={remainingLinesRef}
              className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tighter text-white/90"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="quote-line">want to change something,</div>
              <div className="quote-line">you have to be willing to</div>
              <div className="quote-line">throw everything away.</div>
              <div className="quote-line">If you think reality is just</div>
              <div className="quote-line">living comfortably and</div>
              <div className="quote-line">following your instructions,</div>
              <div className="quote-line">you&apos;re wrong!</div>

              {/* Credit */}
              <div className="quote-line mt-4 text-lg md:text-xl font-bold text-gray-300">
                — Eren Yeager
              </div>
            </div>
          </div>

          {/* RIGHT: Eren image - enlarged and aligned to bottom-right */}
          <div
            className="absolute bottom-0 right-0 w-1/2 h-full flex items-end justify-end"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Shadow/glow behind Eren */}
            <div
              className="absolute bottom-0 right-0 w-96 h-96 bg-black/40 rounded-full blur-3xl -z-10"
              style={{ filter: "blur(40px)" }}
            />

            {/* Rim light */}
            <div
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none mix-blend-screen"
              style={{
                background:
                  "radial-gradient(ellipse 500px 400px at 60% 20%, rgba(255,180,120,0.08), transparent 40%)",
              }}
            />

            {/* Eren image - much larger, touching bottom-right */}
            <img
              ref={erenRef}
              src="/eren-transparent.png"
              alt="Eren Yeager"
              className="h-full w-auto object-contain object-bottom object-right drop-shadow-2xl"
              style={{
                filter:
                  "drop-shadow(0 40px 60px rgba(0,0,0,0.8)) drop-shadow(0 0 30px rgba(0,0,0,0.4))",
                willChange: "transform, opacity",
              }}
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <style jsx>{`
        @keyframes idle-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        .quote-line {
          display: block;
          margin-bottom: 0.4rem;
        }

        @media (max-width: 768px) {
          .quote-line {
            font-size: 1.875rem; /* text-3xl */
          }
        }
      `}</style>
    </div>
  );
};

export { Skiper28 };
