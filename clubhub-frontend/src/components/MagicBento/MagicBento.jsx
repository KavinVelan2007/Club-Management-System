import { useRef, useEffect, useCallback, useState } from "react";
import { gsap } from "gsap";
import {
    Users,
    CalendarDays,
    CheckSquare,
    Megaphone,
    Activity,
    ArrowUpRight,
} from "lucide-react";

import "./MagicBento.css";

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "132, 0, 255";
const MOBILE_BREAKPOINT = 768;

const cardData = [
    {
        color: "#120F17",
        title: "My Clubs",
        description: "Active clubs you're part of",
        label: "Membership",
        value: "03",
        icon: Users,
        meta: "Music · Film · Coding",
        type: "stat",
    },
    {
        color: "#120F17",
        title: "Upcoming Events",
        description: "Events happening soon",
        label: "Next up",
        value: "02",
        icon: CalendarDays,
        meta: "Next event in 2 days",
        type: "event",
    },
    {
        color: "#120F17",
        title: "Task Progress",
        description: "Your current task completion",
        label: "This week",
        value: "68%",
        icon: CheckSquare,
        meta: "12 of 18 tasks completed",
        type: "progress",
    },
    {
        color: "#120F17",
        title: "Announcements",
        description: "Latest updates from your clubs",
        label: "Updates",
        value: "03",
        icon: Megaphone,
        meta: "2 new announcements",
        type: "announcements",
    },
    {
        color: "#120F17",
        title: "Recent Activity",
        description: "Your latest club activity",
        label: "Activity",
        icon: Activity,
        type: "activity",
    },
    {
        color: "#120F17",
        title: "Club Pulse",
        description: "What's happening around you",
        label: "Overview",
        value: "08",
        icon: ArrowUpRight,
        meta: "Active tasks this week",
        type: "pulse",
    },
];

const createParticleElement = (
    x,
    y,
    color = DEFAULT_GLOW_COLOR
) => {
    const el = document.createElement("div");

    el.className = "particle";

    el.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(${color}, 1);
        box-shadow: 0 0 6px rgba(${color}, 0.6);
        pointer-events: none;
        z-index: 100;
        left: ${x}px;
        top: ${y}px;
    `;

    return el;
};

const calculateSpotlightValues = (radius) => ({
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
    card,
    mouseX,
    mouseY,
    glow,
    radius
) => {
    const rect = card.getBoundingClientRect();

    const relativeX =
        ((mouseX - rect.left) / rect.width) * 100;

    const relativeY =
        ((mouseY - rect.top) / rect.height) * 100;

    card.style.setProperty("--glow-x", `${relativeX}%`);
    card.style.setProperty("--glow-y", `${relativeY}%`);
    card.style.setProperty("--glow-intensity", glow.toString());
    card.style.setProperty("--glow-radius", `${radius}px`);
};


/* =========================
   PARTICLE CARD
========================= */

const ParticleCard = ({
    children,
    className = "",
    disableAnimations = false,
    style,
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
    enableTilt = true,
    clickEffect = false,
    enableMagnetism = false,
}) => {
    const cardRef = useRef(null);
    const particlesRef = useRef([]);
    const timeoutsRef = useRef([]);
    const isHoveredRef = useRef(false);
    const memoizedParticles = useRef([]);
    const particlesInitialized = useRef(false);
    const magnetismAnimationRef = useRef(null);

    const initializeParticles = useCallback(() => {
        if (
            particlesInitialized.current ||
            !cardRef.current
        ) {
            return;
        }

        const { width, height } =
            cardRef.current.getBoundingClientRect();

        memoizedParticles.current = Array.from(
            { length: particleCount },
            () =>
                createParticleElement(
                    Math.random() * width,
                    Math.random() * height,
                    glowColor
                )
        );

        particlesInitialized.current = true;
    }, [particleCount, glowColor]);

    const clearAllParticles = useCallback(() => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];

        magnetismAnimationRef.current?.kill();

        particlesRef.current.forEach((particle) => {
            gsap.to(particle, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: "back.in(1.7)",
                onComplete: () => {
                    particle.parentNode?.removeChild(particle);
                },
            });
        });

        particlesRef.current = [];
    }, []);

    const animateParticles = useCallback(() => {
        if (
            !cardRef.current ||
            !isHoveredRef.current
        ) {
            return;
        }

        if (!particlesInitialized.current) {
            initializeParticles();
        }

        memoizedParticles.current.forEach(
            (particle, index) => {
                const timeoutId = setTimeout(() => {
                    if (
                        !isHoveredRef.current ||
                        !cardRef.current
                    ) {
                        return;
                    }

                    const clone = particle.cloneNode(true);

                    cardRef.current.appendChild(clone);
                    particlesRef.current.push(clone);

                    gsap.fromTo(
                        clone,
                        {
                            scale: 0,
                            opacity: 0,
                        },
                        {
                            scale: 1,
                            opacity: 1,
                            duration: 0.3,
                            ease: "back.out(1.7)",
                        }
                    );

                    gsap.to(clone, {
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100,
                        rotation: Math.random() * 360,
                        duration: 2 + Math.random() * 2,
                        ease: "none",
                        repeat: -1,
                        yoyo: true,
                    });

                    gsap.to(clone, {
                        opacity: 0.3,
                        duration: 1.5,
                        ease: "power2.inOut",
                        repeat: -1,
                        yoyo: true,
                    });
                }, index * 100);

                timeoutsRef.current.push(timeoutId);
            }
        );
    }, [initializeParticles]);

    useEffect(() => {
        if (
            disableAnimations ||
            !cardRef.current
        ) {
            return;
        }

        const element = cardRef.current;

        const handleMouseEnter = () => {
            isHoveredRef.current = true;

            animateParticles();

            if (enableTilt) {
                gsap.to(element, {
                    rotateX: 5,
                    rotateY: 5,
                    duration: 0.3,
                    ease: "power2.out",
                    transformPerspective: 1000,
                });
            }
        };

        const handleMouseLeave = () => {
            isHoveredRef.current = false;

            clearAllParticles();

            if (enableTilt) {
                gsap.to(element, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.3,
                    ease: "power2.out",
                });
            }

            if (enableMagnetism) {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out",
                });
            }
        };

        const handleMouseMove = (e) => {
            if (!enableTilt && !enableMagnetism) {
                return;
            }

            const rect =
                element.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            if (enableTilt) {
                const rotateX =
                    ((y - centerY) / centerY) * -10;

                const rotateY =
                    ((x - centerX) / centerX) * 10;

                gsap.to(element, {
                    rotateX,
                    rotateY,
                    duration: 0.1,
                    ease: "power2.out",
                    transformPerspective: 1000,
                });
            }

            if (enableMagnetism) {
                const magnetX =
                    (x - centerX) * 0.05;

                const magnetY =
                    (y - centerY) * 0.05;

                magnetismAnimationRef.current =
                    gsap.to(element, {
                        x: magnetX,
                        y: magnetY,
                        duration: 0.3,
                        ease: "power2.out",
                    });
            }
        };

        const handleClick = (e) => {
            if (!clickEffect) {
                return;
            }

            const rect =
                element.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const maxDistance = Math.max(
                Math.hypot(x, y),
                Math.hypot(
                    x - rect.width,
                    y
                ),
                Math.hypot(
                    x,
                    y - rect.height
                ),
                Math.hypot(
                    x - rect.width,
                    y - rect.height
                )
            );

            const ripple =
                document.createElement("div");

            ripple.style.cssText = `
                position: absolute;
                width: ${maxDistance * 2}px;
                height: ${maxDistance * 2}px;
                border-radius: 50%;
                background: radial-gradient(
                    circle,
                    rgba(${glowColor}, 0.4) 0%,
                    rgba(${glowColor}, 0.2) 30%,
                    transparent 70%
                );
                left: ${x - maxDistance}px;
                top: ${y - maxDistance}px;
                pointer-events: none;
                z-index: 1000;
            `;

            element.appendChild(ripple);

            gsap.fromTo(
                ripple,
                {
                    scale: 0,
                    opacity: 1,
                },
                {
                    scale: 1,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    onComplete: () =>
                        ripple.remove(),
                }
            );
        };

        element.addEventListener(
            "mouseenter",
            handleMouseEnter
        );

        element.addEventListener(
            "mouseleave",
            handleMouseLeave
        );

        element.addEventListener(
            "mousemove",
            handleMouseMove
        );

        element.addEventListener(
            "click",
            handleClick
        );

        return () => {
            isHoveredRef.current = false;

            element.removeEventListener(
                "mouseenter",
                handleMouseEnter
            );

            element.removeEventListener(
                "mouseleave",
                handleMouseLeave
            );

            element.removeEventListener(
                "mousemove",
                handleMouseMove
            );

            element.removeEventListener(
                "click",
                handleClick
            );

            clearAllParticles();
        };
    }, [
        animateParticles,
        clearAllParticles,
        disableAnimations,
        enableTilt,
        enableMagnetism,
        clickEffect,
        glowColor,
    ]);

    return (
        <div
            ref={cardRef}
            className={`${className} particle-container`}
            style={{
                ...style,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {children}
        </div>
    );
};


/* =========================
   GLOBAL SPOTLIGHT
========================= */

const GlobalSpotlight = ({
    gridRef,
    disableAnimations = false,
    enabled = true,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR,
}) => {
    const spotlightRef = useRef(null);

    useEffect(() => {
        if (
            disableAnimations ||
            !gridRef?.current ||
            !enabled
        ) {
            return;
        }

        const spotlight =
            document.createElement("div");

        spotlight.className =
            "global-spotlight";

        spotlight.style.cssText = `
            position: fixed;
            width: 800px;
            height: 800px;
            border-radius: 50%;
            pointer-events: none;
            background: radial-gradient(
                circle,
                rgba(${glowColor}, 0.15) 0%,
                rgba(${glowColor}, 0.08) 15%,
                rgba(${glowColor}, 0.04) 25%,
                rgba(${glowColor}, 0.02) 40%,
                rgba(${glowColor}, 0.01) 65%,
                transparent 70%
            );
            z-index: 200;
            opacity: 0;
            transform: translate(-50%, -50%);
            mix-blend-mode: screen;
        `;

        document.body.appendChild(spotlight);

        spotlightRef.current = spotlight;

        const handleMouseMove = (e) => {
            if (
                !spotlightRef.current ||
                !gridRef.current
            ) {
                return;
            }

            const section =
                gridRef.current.closest(
                    ".bento-section"
                );

            const rect =
                section?.getBoundingClientRect();

            const mouseInside =
                rect &&
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            const cards =
                gridRef.current.querySelectorAll(
                    ".magic-bento-card"
                );

            if (!mouseInside) {
                gsap.to(
                    spotlightRef.current,
                    {
                        opacity: 0,
                        duration: 0.3,
                    }
                );

                cards.forEach((card) => {
                    card.style.setProperty(
                        "--glow-intensity",
                        "0"
                    );
                });

                return;
            }

            const {
                proximity,
                fadeDistance,
            } = calculateSpotlightValues(
                spotlightRadius
            );

            let minDistance = Infinity;

            cards.forEach((card) => {
                const cardRect =
                    card.getBoundingClientRect();

                const centerX =
                    cardRect.left +
                    cardRect.width / 2;

                const centerY =
                    cardRect.top +
                    cardRect.height / 2;

                const distance =
                    Math.hypot(
                        e.clientX - centerX,
                        e.clientY - centerY
                    ) -
                    Math.max(
                        cardRect.width,
                        cardRect.height
                    ) /
                        2;

                const effectiveDistance =
                    Math.max(0, distance);

                minDistance = Math.min(
                    minDistance,
                    effectiveDistance
                );

                let glowIntensity = 0;

                if (
                    effectiveDistance <=
                    proximity
                ) {
                    glowIntensity = 1;
                } else if (
                    effectiveDistance <=
                    fadeDistance
                ) {
                    glowIntensity =
                        (fadeDistance -
                            effectiveDistance) /
                        (fadeDistance -
                            proximity);
                }

                updateCardGlowProperties(
                    card,
                    e.clientX,
                    e.clientY,
                    glowIntensity,
                    spotlightRadius
                );
            });

            gsap.to(
                spotlightRef.current,
                {
                    left: e.clientX,
                    top: e.clientY,
                    duration: 0.1,
                }
            );

            const targetOpacity =
                minDistance <= proximity
                    ? 0.8
                    : minDistance <= fadeDistance
                    ? ((fadeDistance -
                          minDistance) /
                          (fadeDistance -
                              proximity)) *
                      0.8
                    : 0;

            gsap.to(
                spotlightRef.current,
                {
                    opacity: targetOpacity,
                    duration:
                        targetOpacity > 0
                            ? 0.2
                            : 0.5,
                }
            );
        };

        const handleMouseLeave = () => {
            gridRef.current
                ?.querySelectorAll(
                    ".magic-bento-card"
                )
                .forEach((card) => {
                    card.style.setProperty(
                        "--glow-intensity",
                        "0"
                    );
                });

            if (spotlightRef.current) {
                gsap.to(
                    spotlightRef.current,
                    {
                        opacity: 0,
                        duration: 0.3,
                    }
                );
            }
        };

        document.addEventListener(
            "mousemove",
            handleMouseMove
        );

        document.addEventListener(
            "mouseleave",
            handleMouseLeave
        );

        return () => {
            document.removeEventListener(
                "mousemove",
                handleMouseMove
            );

            document.removeEventListener(
                "mouseleave",
                handleMouseLeave
            );

            spotlightRef.current?.parentNode?.removeChild(
                spotlightRef.current
            );
        };
    }, [
        gridRef,
        disableAnimations,
        enabled,
        spotlightRadius,
        glowColor,
    ]);

    return null;
};


/* =========================
   GRID
========================= */

const BentoCardGrid = ({
    children,
    gridRef,
}) => (
    <div
        className="card-grid bento-section"
        ref={gridRef}
    >
        {children}
    </div>
);


/* =========================
   MOBILE
========================= */

const useMobileDetection = () => {
    const [isMobile, setIsMobile] =
        useState(false);

    useEffect(() => {
        const checkMobile = () =>
            setIsMobile(
                window.innerWidth <=
                    MOBILE_BREAKPOINT
            );

        checkMobile();

        window.addEventListener(
            "resize",
            checkMobile
        );

        return () =>
            window.removeEventListener(
                "resize",
                checkMobile
            );
    }, []);

    return isMobile;
};


/* =========================
   MAGIC BENTO
========================= */

const MagicBento = ({
    textAutoHide = false,
    enableStars = true,
    enableSpotlight = true,
    enableBorderGlow = true,
    disableAnimations = false,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    particleCount = DEFAULT_PARTICLE_COUNT,
    enableTilt = false,
    glowColor = DEFAULT_GLOW_COLOR,
    clickEffect = true,
    enableMagnetism = true,
}) => {
    const gridRef = useRef(null);

    const isMobile =
        useMobileDetection();

    const shouldDisableAnimations =
        disableAnimations || isMobile;

    return (
        <>
            {enableSpotlight && (
                <GlobalSpotlight
                    gridRef={gridRef}
                    disableAnimations={
                        shouldDisableAnimations
                    }
                    enabled={
                        enableSpotlight
                    }
                    spotlightRadius={
                        spotlightRadius
                    }
                    glowColor={
                        glowColor
                    }
                />
            )}

            <BentoCardGrid
                gridRef={gridRef}
            >
                {cardData.map(
                    (card, index) => {
                        const Icon =
                            card.icon;

                        const baseClassName = `
                            magic-bento-card
                            ${
                                textAutoHide
                                    ? "magic-bento-card--text-autohide"
                                    : ""
                            }
                            ${
                                enableBorderGlow
                                    ? "magic-bento-card--border-glow"
                                    : ""
                            }
                            magic-bento-${card.type}
                        `;

                        const content = (
                            <>
                                <div className="magic-bento-card__header">

                                    <div className="magic-bento-card__label">
                                        {card.label}
                                    </div>

                                    <div className="magic-bento-icon">
                                        <Icon
                                            size={18}
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                </div>

                                <div className="magic-bento-card__content">

                                    <div className="magic-bento-main">

                                        {card.value && (
                                            <div className="magic-bento-value">
                                                {card.value}
                                            </div>
                                        )}

                                        <h2 className="magic-bento-card__title">
                                            {card.title}
                                        </h2>

                                        <p className="magic-bento-card__description">
                                            {card.description}
                                        </p>

                                    </div>

                                    {card.type ===
                                        "progress" && (
                                        <div className="task-progress">

                                            <div className="task-progress-track">
                                                <div
                                                    className="task-progress-fill"
                                                    style={{
                                                        width: "68%",
                                                    }}
                                                />
                                            </div>

                                            <span>
                                                12 / 18 completed
                                            </span>

                                        </div>
                                    )}

                                    {card.type ===
                                        "event" && (
                                        <div className="event-preview">
                                            <strong>
                                                Short Film Screening
                                            </strong>

                                            <span>
                                                Sep 08 · 5:30 PM
                                            </span>
                                        </div>
                                    )}

                                    {card.type ===
                                        "announcements" && (
                                        <div className="announcement-list">

                                            <div>
                                                <span className="announcement-dot" />
                                                Recruitment drive
                                            </div>

                                            <div>
                                                <span className="announcement-dot" />
                                                Music Club meeting
                                            </div>

                                            <div>
                                                <span className="announcement-dot" />
                                                Film submission deadline
                                            </div>

                                        </div>
                                    )}

                                    {card.type ===
                                        "activity" && (
                                        <div className="activity-list">

                                            <div>
                                                <span>✓</span>
                                                Registered for Music Fest
                                            </div>

                                            <div>
                                                <span>✓</span>
                                                Joined Short Film Club
                                            </div>

                                            <div>
                                                <span>✓</span>
                                                Completed editing task
                                            </div>

                                        </div>
                                    )}

                                    {card.type ===
                                        "pulse" && (
                                        <div className="pulse-meta">
                                            <span>
                                                {card.meta}
                                            </span>

                                            <span className="pulse-arrow">
                                                →
                                            </span>
                                        </div>
                                    )}

                                    {card.meta &&
                                        card.type ===
                                            "stat" && (
                                            <div className="card-meta">
                                                {card.meta}
                                            </div>
                                        )}

                                </div>
                            </>
                        );

                        if (enableStars) {
                            return (
                                <ParticleCard
                                    key={index}
                                    className={
                                        baseClassName
                                    }
                                    style={{
                                        backgroundColor:
                                            card.color,
                                        "--glow-color":
                                            glowColor,
                                    }}
                                    disableAnimations={
                                        shouldDisableAnimations
                                    }
                                    particleCount={
                                        particleCount
                                    }
                                    glowColor={
                                        glowColor
                                    }
                                    enableTilt={
                                        enableTilt
                                    }
                                    clickEffect={
                                        clickEffect
                                    }
                                    enableMagnetism={
                                        enableMagnetism
                                    }
                                >
                                    {content}
                                </ParticleCard>
                            );
                        }

                        return (
                            <div
                                key={index}
                                className={
                                    baseClassName
                                }
                                style={{
                                    backgroundColor:
                                        card.color,
                                }}
                            >
                                {content}
                            </div>
                        );
                    }
                )}
            </BentoCardGrid>
        </>
    );
};

export default MagicBento;