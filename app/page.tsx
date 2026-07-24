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

const animals: Frame[] = [
  { src: "cheetah", fit: "contain", shape: "square" },
  { src: "dinosaur", fit: "contain", shape: "square" },
  { src: "crow", fit: "contain", shape: "square" },
  { src: "wolf", fit: "contain", shape: "square" },
];

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
      <Sequence frames={observation} />
      <Aside>只是自我感觉良好</Aside>
      <Sequence frames={experiment} />
      <section className="animal-passage">
        <Sequence frames={animals} />
      </section>
      <Sequence frames={expression} />
      <Aside>不是商业摄影</Aside>
      <Sequence frames={finale} />
      <Aside final>那你就不适合啊</Aside>
    </main>
  );
}
