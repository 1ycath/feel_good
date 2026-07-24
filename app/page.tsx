"use client";

import { useEffect, useRef } from "react";

type Frame = {
  src: string;
  fit?: "cover" | "contain";
  tone?: "black" | "paper";
  shape?: "wide" | "portrait" | "square";
  position?: string;
};

const opening: Frame[] = [
  { src: "silhouette", fit: "cover", shape: "wide" },
  { src: "overhead", fit: "contain", shape: "portrait", tone: "paper" },
  { src: "neon", fit: "cover", shape: "wide" },
];

const observation: Frame[] = [
  { src: "bench", fit: "contain", tone: "paper" },
  { src: "branches", fit: "cover", position: "center 35%" },
  { src: "flowers", fit: "contain", tone: "paper" },
  { src: "tiles", fit: "contain", tone: "paper" },
  { src: "stairs", fit: "contain", shape: "portrait" },
];

const experiment: Frame[] = [
  { src: "texture", fit: "cover" },
  { src: "eaves", fit: "contain", tone: "paper" },
  { src: "dogRun", fit: "cover" },
  { src: "dogGlow", fit: "cover" },
  { src: "scooter", fit: "cover" },
  { src: "bus", fit: "cover" },
];

const animals = {
  first: { src: "crow", fit: "contain", shape: "square" },
  second: { src: "cheetah", fit: "contain", shape: "square" },
  third: { src: "dinosaur", fit: "contain", shape: "square" },
  final: { src: "wolf", fit: "contain", shape: "square" },
} satisfies Record<string, Frame>;

const expression: Frame[] = [
  { src: "bridge", fit: "cover" },
  { src: "flyover", fit: "cover" },
  { src: "depot", fit: "cover" },
  { src: "tunnel", fit: "contain", shape: "portrait", tone: "paper" },
];

const finale: Frame[] = [
  { src: "curve", fit: "cover" },
  { src: "lightTrail", fit: "cover" },
  { src: "rider", fit: "cover" },
];

function Photo({ frame, index }: { frame: Frame; index: number }) {
  return (
    <figure
      className={[
        "photo",
        `photo--${frame.fit ?? "cover"}`,
        `photo--${frame.tone ?? "black"}`,
        frame.shape ? `photo--${frame.shape}` : "",
      ].join(" ")}
      data-reveal
      style={{ "--delay": `${(index % 3) * 45}ms` } as React.CSSProperties}
    >
      <div className="photo__depth" data-parallax>
        <img
          src={`/photos/${frame.src}.webp`}
          alt=""
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
          style={{ objectPosition: frame.position }}
        />
      </div>
    </figure>
  );
}

function Sequence({ frames }: { frames: Frame[] }) {
  return (
    <>
      {frames.map((frame, index) => (
        <Photo key={frame.src} frame={frame} index={index} />
      ))}
    </>
  );
}

function Aside({
  children,
  final = false,
}: {
  children: React.ReactNode;
  final?: boolean;
}) {
  return (
    <section className={`aside${final ? " aside--final" : ""}`}>
      <p data-reveal>{children}</p>
    </section>
  );
}

function BackToTop() {
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      className="back-to-top"
      type="button"
      aria-label="回到顶部"
      onClick={scrollToTop}
    >
      <span aria-hidden="true" />
    </button>
  );
}

function AnimalInterlude({ frame }: { frame: Frame }) {
  return (
    <section className="animal-interlude">
      <Photo frame={frame} index={0} />
    </section>
  );
}

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const revealed = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    revealed.forEach((element) => observer.observe(element));

    const parallaxItems =
      root.querySelectorAll<HTMLElement>("[data-parallax]");
    let ticking = false;

    const updateParallax = () => {
      const viewport = window.innerHeight;
      parallaxItems.forEach((element) => {
        const rect = element.parentElement?.getBoundingClientRect();
        if (!rect || rect.bottom < 0 || rect.top > viewport) return;
        const progress = (viewport - rect.top) / (viewport + rect.height);
        const offset = (progress - 0.5) * 38;
        element.style.setProperty("--shift", `${offset}px`);
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <main ref={mainRef}>
      <Sequence frames={opening} />
      <Aside>肯定是不看书的</Aside>
      <AnimalInterlude frame={animals.first} />
      <Sequence frames={observation} />
      <Aside>只是自我感觉良好</Aside>
      <AnimalInterlude frame={animals.second} />
      <Sequence frames={experiment} />
      <Sequence frames={expression} />
      <Aside>不是商业摄影</Aside>
      <AnimalInterlude frame={animals.third} />
      <Sequence frames={finale} />
      <AnimalInterlude frame={animals.final} />
      <section className="aside aside--final">
        <p data-reveal>那你就不适合啊</p>
        <BackToTop />
      </section>
    </main>
  );
}
