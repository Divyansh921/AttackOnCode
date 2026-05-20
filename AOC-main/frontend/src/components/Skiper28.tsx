"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Skiper28 = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const erenRef = useRef<HTMLImageElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const remainingLinesRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    // Clean up any existing ScrollTriggers to avoid memory leaks
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const ctx = gsap.context(() => {
      // ==========================================
      // 1. CINEMATIC INTRO ANIMATION (ON PAGE LOAD)
      // ==========================================
      const introTl = gsap.timeline({
        defaults: { ease: "power3.out" }
      });

      // Background Ken Burns camera-zoom-back intro
      introTl.fromTo(
        bgRef.current,
        { scale: 1.15, opacity: 0 },
        { scale: 1.0, opacity: 1, duration: 2.8 },
        0
      );

      // Dark overlay opacity fade-in
      introTl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 0.45, duration: 2.2 },
        0.2
      );

      // Eren Yeager cinematic slide-up reveal
      introTl.fromTo(
        erenRef.current,
        { y: 180, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 2.0, ease: "power4.out" },
        0.4
      );

      // "Humanity's Last Hope" subtitle slide-down
      const subtitle = quoteRef.current?.querySelector(".quote-subtitle");
      if (subtitle) {
        introTl.fromTo(
          subtitle,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0 },
          0.8
        );
      }

      // Staggered reveal of the quote lines with elegant 3D tilt
      const quoteLines = remainingLinesRef.current?.querySelectorAll(".quote-line:not(.credit-line)") || [];
      if (quoteLines.length > 0) {
        introTl.fromTo(
          quoteLines,
          { y: 45, opacity: 0, rotateX: -10 },
          { y: 0, opacity: 1, rotateX: 0, duration: 1.4, stagger: 0.15, ease: "power3.out" },
          1.0
        );
      }

      // Elegant fade-in of Eren's credit line
      const creditLine = remainingLinesRef.current?.querySelector(".credit-line");
      if (creditLine) {
        introTl.fromTo(
          creditLine,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2 },
          1.8
        );
      }

      // Subtle atmospheric idle floating for Eren (starts after intro completes)
      gsap.fromTo(
        erenRef.current,
        { y: 0 },
        {
          y: -12,
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 2.4,
        }
      );

      // ==========================================
      // 2. SMOOTH CINEMATIC SCROLL PARALLAX (ON SCROLL)
      // ==========================================
      gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5, // smooth, natural scroll lag
        }
      })
      .to(quoteRef.current, { y: -120, opacity: 0 }, 0)
      .to(erenRef.current, { y: 140, opacity: 0.05, scale: 0.96 }, 0)
      .to(bgRef.current, { y: 90, scale: 1.06 }, 0)
      .to(overlayRef.current, { opacity: 0.8 }, 0); // smooth transition into subsequent white section
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={heroRef} className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Background with Colossal Titan */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full opacity-0"
        style={{
          backgroundImage: "url('/aot-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* Dark overlay for text contrast */}
      <div ref={overlayRef} className="absolute inset-0 bg-black opacity-0" />

      {/* Cinematic vignette gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />

      {/* Content Container */}
      <div className="relative h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex gap-12 items-center justify-between h-full">
          
          {/* LEFT: Cinematic Quote Typography */}
          <div
            ref={quoteRef}
            className="flex-1 z-10 font-cinzel select-none max-w-3xl"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Tagline / Subtitle */}
            <span className="quote-subtitle text-red-500/80 text-[11px] md:text-xs font-black uppercase tracking-[5px] mb-5 block leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] opacity-0">
              Humanity&apos;s Last Hope
            </span>

            {/* Quote Body */}
            <div
              ref={remainingLinesRef}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[44px] font-semibold leading-[1.35] tracking-normal text-white text-shadow-lg"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="quote-line opacity-0">
                &ldquo;If you want to <span className="text-red-600 font-extrabold drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]">change something</span>,
              </div>
              <div className="quote-line opacity-0">
                you have to be willing to
              </div>
              <div className="quote-line opacity-0">
                <span className="text-red-600 font-extrabold drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]">throw everything away</span>.
              </div>
              <div className="quote-line opacity-0">
                If you think reality is just living
              </div>
              <div className="quote-line opacity-0">
                comfortably and following instructions,
              </div>
              <div className="quote-line opacity-0">
                you&apos;re <span className="text-red-600 font-extrabold italic drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]">wrong</span>!&rdquo;
              </div>

              {/* Character Credit */}
              <div className="quote-line credit-line mt-8 text-xs md:text-sm font-bold text-gray-400 tracking-[4px] uppercase flex items-center gap-3 opacity-0">
                <span className="w-8 h-[1px] bg-red-600/60 block"></span>
                Eren Yeager
              </div>
            </div>
          </div>

          {/* RIGHT: Eren Yeager Illustration */}
          <div
            className="absolute bottom-0 right-0 w-1/2 h-full flex items-end justify-end pointer-events-none"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Atmosphere Shadow/Glow behind character */}
            <div
              className="absolute bottom-0 right-0 w-96 h-96 bg-black/45 rounded-full blur-3xl -z-10"
              style={{ filter: "blur(50px)" }}
            />

            {/* Dynamic Cinematic Rim Light */}
            <div
              className="absolute bottom-0 right-0 w-full h-full pointer-events-none mix-blend-screen"
              style={{
                background:
                  "radial-gradient(ellipse 550px 450px at 60% 20%, rgba(255,180,120,0.06), transparent 45%)",
              }}
            />

            {/* Character Image */}
            <img
              ref={erenRef}
              src="/eren-transparent.png"
              alt="Eren Yeager"
              className="h-full w-auto object-contain object-bottom object-right drop-shadow-2xl opacity-0"
              style={{
                filter:
                  "drop-shadow(0 35px 50px rgba(0,0,0,0.85)) drop-shadow(0 0 25px rgba(0,0,0,0.45))",
                willChange: "transform, opacity",
              }}
              draggable={false}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .quote-line {
          margin-bottom: 0.4rem;
          backface-visibility: hidden;
        }

        .text-shadow-lg {
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        }

        @media (max-width: 768px) {
          .quote-line {
            font-size: 1.625rem;
            line-height: 1.35;
          }
        }
      `}</style>
    </div>
  );
};

export { Skiper28 };
