"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/lib/hero-slides";

const INTERVAL_MS = 5000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="bg-background relative h-[calc(100svh-4rem)] w-full overflow-hidden md:h-[calc(100svh-5rem)]">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={i !== index}
          className={`hero-slide absolute inset-0 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={slide.src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* Constant dark overlay — keeps text readable regardless of which slide is showing */}
      <div className="bg-background/55 absolute inset-0" />

      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center md:items-start md:justify-end md:px-16 md:pb-24 md:text-left">
        <h1 className="font-display text-foreground max-w-2xl text-4xl leading-[1.1] md:text-6xl">
          Every chapter,
          <br />
          one weak spot at a time.
        </h1>
        <p className="text-text-secondary mt-4 max-w-lg text-base md:text-lg">
          Work through your HSC syllabus chapter by chapter, take real exams that show exactly where
          you are weak, and study with a plan instead of guesswork.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
          <a
            href="/login"
            className="bg-accent-primary text-foreground rounded-lg px-6 py-3 text-sm font-medium transition-transform active:scale-[0.98] md:text-base"
          >
            Get started free
          </a>
          <a
            href="#how-it-works"
            className="border-bg-elevated text-foreground hover:bg-bg-elevated rounded-lg border px-6 py-3 text-sm font-medium transition-colors md:text-base"
          >
            See how it works
          </a>
        </div>
      </div>

      <div className="absolute right-4 bottom-4 z-20 flex gap-1.5 sm:right-6 sm:bottom-6 md:right-16">
        {" "}
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? "bg-accent-primary w-6" : "bg-foreground/30 w-1.5"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
