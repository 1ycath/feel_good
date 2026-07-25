"use client";

import { useEffect, useId, useRef, useState } from "react";

// Increment this value whenever a file in public/photos is replaced.
const PHOTO_ASSET_VERSION = "1";
const SCROLL_NUDGE_DELAY_MS = 7000;
const SCROLL_NUDGE_DURATION_MS = 1400;
const SCROLL_NUDGE_MAX_DISTANCE_PX = 120;
const SCROLL_NUDGE_VIEWPORT_DISTANCE = 0.14;

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
          src={`/photos/${frame.src}.webp?v=${PHOTO_ASSET_VERSION}`}
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
      <span aria-hidden="true">↑</span>
    </button>
  );
}

function ProjectInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div className={`project-info${isOpen ? " is-open" : ""}`}>
      {isOpen && (
        <div
          className="project-info__panel"
          id={panelId}
          role="region"
          aria-label="作品信息"
        >
          <time dateTime="2026-07-25/2026-07-26">
            2026.7.25-2026.7.26
          </time>
          <p>
            在被告知“你就是不适合”之后四小时内，完成全部拍摄与制作
          </p>
        </div>
      )}
      <button
        className="project-info__button"
        type="button"
        aria-label={isOpen ? "关闭作品信息" : "查看作品信息"}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">i</span>
      </button>
    </div>
  );
}

function AnimalInterlude({ frame }: { frame: Frame }) {
  return (
    <section className="animal-interlude">
      <Photo frame={frame} index={0} />
    </section>
  );
}

function ScrollNudge() {
  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 720px)");
    if (!mobileQuery.matches || window.scrollY > 4) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    let hasStarted = false;
    let scrollFrame: number | undefined;

    const clearScheduledWork = () => {
      window.clearTimeout(nudgeTimer);
      if (scrollFrame !== undefined) {
        window.cancelAnimationFrame(scrollFrame);
      }
    };

    const removeListeners = () => {
      window.removeEventListener("scroll", cancelBeforeStart);
      window.removeEventListener("touchstart", cancelBeforeStart);
      window.removeEventListener("pointerdown", cancelBeforeStart);
      window.removeEventListener("wheel", cancelBeforeStart);
      window.removeEventListener("keydown", cancelBeforeStart);
      mobileQuery.removeEventListener("change", handleViewportChange);
    };

    const cancelBeforeStart = () => {
      if (hasStarted) return;
      hasStarted = true;
      clearScheduledWork();
      removeListeners();
    };

    const handleViewportChange = () => {
      if (!mobileQuery.matches) cancelBeforeStart();
    };

    window.addEventListener("scroll", cancelBeforeStart, { passive: true });
    window.addEventListener("touchstart", cancelBeforeStart, { passive: true });
    window.addEventListener("pointerdown", cancelBeforeStart, {
      passive: true,
    });
    window.addEventListener("wheel", cancelBeforeStart, { passive: true });
    window.addEventListener("keydown", cancelBeforeStart);
    mobileQuery.addEventListener("change", handleViewportChange);

    const nudgeTimer = window.setTimeout(() => {
      hasStarted = true;
      removeListeners();

      const startY = window.scrollY;
      const distance = Math.min(
        SCROLL_NUDGE_MAX_DISTANCE_PX,
        window.innerHeight * SCROLL_NUDGE_VIEWPORT_DISTANCE,
      );
      const startTime = window.performance.now();

      const animateScroll = (now: number) => {
        const progress = Math.min(
          (now - startTime) / SCROLL_NUDGE_DURATION_MS,
          1,
        );
        const easedProgress = (1 - Math.cos(Math.PI * progress)) / 2;
        const scrollingElement = document.scrollingElement;

        if (scrollingElement) {
          scrollingElement.scrollTop = startY + distance * easedProgress;
        } else {
          window.scrollTo(0, startY + distance * easedProgress);
        }

        if (progress < 1) {
          scrollFrame = window.requestAnimationFrame(animateScroll);
        }
      };

      scrollFrame = window.requestAnimationFrame(animateScroll);
    }, SCROLL_NUDGE_DELAY_MS);

    return () => {
      clearScheduledWork();
      removeListeners();
    };
  }, []);

  return null;
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
      <ScrollNudge />
      <Sequence frames={opening} />
      <Aside>你肯定是不看摄影书籍的</Aside>
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
        <ProjectInfo />
      </section>
    </main>
  );
}
