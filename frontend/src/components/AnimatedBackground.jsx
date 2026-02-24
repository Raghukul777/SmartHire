import React, { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * AnimatedBackground — Living, motion-driven environment layer
 *
 * Two distinct visual systems layered together:
 * 1. CANVAS: Soft mesh/radial gradients that drift continuously and
 *    warp subtly in response to cursor position (depth + parallax).
 * 2. HTML MARQUEE TYPOGRAPHY: Always-moving horizontal text bands
 *    with large, ultra-light words that flow left-to-right and
 *    right-to-left at different speeds — seamlessly looped, no
 *    visible start or end.
 *
 * Theme-aware: adapts canvas colors & text opacity for light/dark mode.
 */

// ── Flowing text layer data ──────────────────────────────
const TEXT_BANDS_DARK = [
    { words: 'SMART HIRE  ·  AI MATCHING  ·  NEXT STEP  ·  CAREERS  ·  OPPORTUNITY  ·  TALENT  ·  ', speed: 180, direction: 'left', top: '8%', opacity: 0.028, size: 'clamp(3rem, 7vw, 6rem)' },
    { words: 'DISCOVER  ·  CONNECT  ·  INNOVATE  ·  DREAM JOB  ·  RECRUIT  ·  GROWTH  ·  ', speed: 140, direction: 'right', top: '28%', opacity: 0.022, size: 'clamp(2.5rem, 5vw, 4.5rem)' },
    { words: 'SMART HIRE  ·  NEXT STEP  ·  AI MATCHING  ·  FUTURE  ·  PIPELINE  ·  CAREERS  ·  ', speed: 200, direction: 'left', top: '52%', opacity: 0.025, size: 'clamp(3.5rem, 8vw, 7rem)' },
    { words: 'TALENT  ·  OPPORTUNITY  ·  SCREENING  ·  INTERVIEW  ·  HIRE  ·  MATCH  ·  ', speed: 120, direction: 'right', top: '75%', opacity: 0.018, size: 'clamp(2rem, 4.5vw, 4rem)' },
];

const TEXT_BANDS_LIGHT = [
    { words: 'SMART HIRE  ·  AI MATCHING  ·  NEXT STEP  ·  CAREERS  ·  OPPORTUNITY  ·  TALENT  ·  ', speed: 180, direction: 'left', top: '8%', size: 'clamp(3rem, 7vw, 6rem)', color: 'rgba(0, 0, 0, 0.04)' },
    { words: 'DISCOVER  ·  CONNECT  ·  INNOVATE  ·  DREAM JOB  ·  RECRUIT  ·  GROWTH  ·  ', speed: 140, direction: 'right', top: '28%', size: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'rgba(0, 0, 0, 0.03)' },
    { words: 'SMART HIRE  ·  NEXT STEP  ·  AI MATCHING  ·  FUTURE  ·  PIPELINE  ·  CAREERS  ·  ', speed: 200, direction: 'left', top: '52%', size: 'clamp(3.5rem, 8vw, 7rem)', color: 'rgba(0, 0, 0, 0.045)' },
    { words: 'TALENT  ·  OPPORTUNITY  ·  SCREENING  ·  INTERVIEW  ·  HIRE  ·  MATCH  ·  ', speed: 120, direction: 'right', top: '75%', size: 'clamp(2rem, 4.5vw, 4rem)', color: 'rgba(0, 0, 0, 0.025)' },
];

// ── Marquee Band Component ───────────────────────────────
function MarqueeBand({ words, speed, direction, top, opacity, size, color }) {
    // Repeat words enough to overfill 200% of viewport width
    const repeated = (words + ' ').repeat(12);
    const animName = direction === 'left' ? 'marqueeLeft' : 'marqueeRight';
    const dur = `${speed}s`;

    // If color is provided (light mode), use it; otherwise fall back to opacity-based white
    const textColor = color || `rgba(255, 255, 255, ${opacity})`;

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'absolute',
                top,
                left: 0,
                width: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        >
            <div
                style={{
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    animation: `${animName} ${dur} linear infinite`,
                    willChange: 'transform',
                    fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize: size,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: textColor,
                    userSelect: 'none',
                    lineHeight: 1,
                }}
            >
                <span>{repeated}</span>
                <span>{repeated}</span>
            </div>
        </div>
    );
}

// ── Canvas gradient layer ────────────────────────────────
function GradientCanvas({ isDark }) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const targetRef = useRef({ x: 0.5, y: 0.5 });
    const timeRef = useRef(0);
    const rafRef = useRef(null);
    const themeRef = useRef(isDark);

    // Keep the theme ref in sync
    useEffect(() => {
        themeRef.current = isDark;
    }, [isDark]);

    const lerp = (a, b, t) => a + (b - a) * t;

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const dark = themeRef.current;

        // Smooth cursor interpolation — glacial smoothness
        mouseRef.current.x = lerp(mouseRef.current.x, targetRef.current.x, 0.015);
        mouseRef.current.y = lerp(mouseRef.current.y, targetRef.current.y, 0.015);
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;

        timeRef.current += 0.002;
        const t = timeRef.current;

        // Base fill — theme-dependent
        ctx.fillStyle = dark ? '#0f1219' : '#f5f5f0';
        ctx.fillRect(0, 0, w, h);

        if (dark) {
            // ── DARK MODE GRADIENTS ──

            // MESH LAYER 1: Deep indigo
            const cx1 = (Math.sin(t * 0.35) * 0.3 + 0.25 + (mx - 0.5) * 0.25) * w;
            const cy1 = (Math.cos(t * 0.28) * 0.25 + 0.2 + (my - 0.5) * 0.2) * h;
            const g1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, w * 0.7);
            g1.addColorStop(0, 'rgba(79, 70, 229, 0.16)');
            g1.addColorStop(0.35, 'rgba(79, 70, 229, 0.07)');
            g1.addColorStop(1, 'transparent');
            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, w, h);

            // MESH LAYER 2: Violet
            const cx2 = (Math.sin(t * 0.3 + 2.5) * -0.3 + 0.75 + (mx - 0.5) * 0.18) * w;
            const cy2 = (Math.cos(t * 0.22 + 1.5) * 0.3 + 0.55 + (my - 0.5) * 0.15) * h;
            const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, w * 0.6);
            g2.addColorStop(0, 'rgba(139, 92, 246, 0.13)');
            g2.addColorStop(0.45, 'rgba(139, 92, 246, 0.04)');
            g2.addColorStop(1, 'transparent');
            ctx.fillStyle = g2;
            ctx.fillRect(0, 0, w, h);

            // MESH LAYER 3: Ice blue
            const cx3 = (Math.sin(t * 0.18 + 4) * 0.35 + 0.5 + (mx - 0.5) * 0.12) * w;
            const cy3 = (Math.cos(t * 0.14 + 3) * 0.35 + 0.8 + (my - 0.5) * 0.1) * h;
            const g3 = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, w * 0.55);
            g3.addColorStop(0, 'rgba(56, 189, 248, 0.09)');
            g3.addColorStop(0.5, 'rgba(56, 189, 248, 0.03)');
            g3.addColorStop(1, 'transparent');
            ctx.fillStyle = g3;
            ctx.fillRect(0, 0, w, h);

            // MESH LAYER 4: Warm violet accent
            const cx4 = (Math.sin(t * 0.45 + 1) * 0.2 + 0.15 + (mx - 0.5) * 0.1) * w;
            const cy4 = (Math.cos(t * 0.35 + 2) * 0.15 + 0.1) * h;
            const g4 = ctx.createRadialGradient(cx4, cy4, 0, cx4, cy4, w * 0.45);
            g4.addColorStop(0, 'rgba(168, 85, 247, 0.1)');
            g4.addColorStop(0.55, 'rgba(168, 85, 247, 0.02)');
            g4.addColorStop(1, 'transparent');
            ctx.fillStyle = g4;
            ctx.fillRect(0, 0, w, h);

            // CURSOR PROXIMITY GLOW
            const cgx = mx * w;
            const cgy = my * h;
            const cg = ctx.createRadialGradient(cgx, cgy, 0, cgx, cgy, w * 0.3);
            cg.addColorStop(0, 'rgba(99, 102, 241, 0.07)');
            cg.addColorStop(0.25, 'rgba(139, 92, 246, 0.035)');
            cg.addColorStop(1, 'transparent');
            ctx.fillStyle = cg;
            ctx.fillRect(0, 0, w, h);

            // Subtle grain overlay
            const ng = ctx.createLinearGradient(0, 0, w, h);
            ng.addColorStop(0, 'rgba(255, 255, 255, 0.007)');
            ng.addColorStop(0.5, 'rgba(255, 255, 255, 0.002)');
            ng.addColorStop(1, 'rgba(255, 255, 255, 0.007)');
            ctx.fillStyle = ng;
            ctx.fillRect(0, 0, w, h);
        } else {
            // ── LIGHT MODE GRADIENTS — subtle warm greys ──

            // MESH LAYER 1: Warm grey
            const cx1 = (Math.sin(t * 0.35) * 0.3 + 0.25 + (mx - 0.5) * 0.25) * w;
            const cy1 = (Math.cos(t * 0.28) * 0.25 + 0.2 + (my - 0.5) * 0.2) * h;
            const g1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, w * 0.7);
            g1.addColorStop(0, 'rgba(79, 70, 229, 0.045)');
            g1.addColorStop(0.35, 'rgba(79, 70, 229, 0.02)');
            g1.addColorStop(1, 'transparent');
            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, w, h);

            // MESH LAYER 2: Muted violet
            const cx2 = (Math.sin(t * 0.3 + 2.5) * -0.3 + 0.75 + (mx - 0.5) * 0.18) * w;
            const cy2 = (Math.cos(t * 0.22 + 1.5) * 0.3 + 0.55 + (my - 0.5) * 0.15) * h;
            const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, w * 0.6);
            g2.addColorStop(0, 'rgba(139, 92, 246, 0.035)');
            g2.addColorStop(0.45, 'rgba(139, 92, 246, 0.012)');
            g2.addColorStop(1, 'transparent');
            ctx.fillStyle = g2;
            ctx.fillRect(0, 0, w, h);

            // MESH LAYER 3: Soft blue
            const cx3 = (Math.sin(t * 0.18 + 4) * 0.35 + 0.5 + (mx - 0.5) * 0.12) * w;
            const cy3 = (Math.cos(t * 0.14 + 3) * 0.35 + 0.8 + (my - 0.5) * 0.1) * h;
            const g3 = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, w * 0.55);
            g3.addColorStop(0, 'rgba(2, 132, 199, 0.03)');
            g3.addColorStop(0.5, 'rgba(2, 132, 199, 0.01)');
            g3.addColorStop(1, 'transparent');
            ctx.fillStyle = g3;
            ctx.fillRect(0, 0, w, h);

            // MESH LAYER 4: Warm accent
            const cx4 = (Math.sin(t * 0.45 + 1) * 0.2 + 0.15 + (mx - 0.5) * 0.1) * w;
            const cy4 = (Math.cos(t * 0.35 + 2) * 0.15 + 0.1) * h;
            const g4 = ctx.createRadialGradient(cx4, cy4, 0, cx4, cy4, w * 0.45);
            g4.addColorStop(0, 'rgba(168, 85, 247, 0.025)');
            g4.addColorStop(0.55, 'rgba(168, 85, 247, 0.006)');
            g4.addColorStop(1, 'transparent');
            ctx.fillStyle = g4;
            ctx.fillRect(0, 0, w, h);

            // CURSOR PROXIMITY GLOW — subtle
            const cgx = mx * w;
            const cgy = my * h;
            const cg = ctx.createRadialGradient(cgx, cgy, 0, cgx, cgy, w * 0.3);
            cg.addColorStop(0, 'rgba(79, 70, 229, 0.03)');
            cg.addColorStop(0.25, 'rgba(139, 92, 246, 0.015)');
            cg.addColorStop(1, 'transparent');
            ctx.fillStyle = cg;
            ctx.fillRect(0, 0, w, h);

            // Subtle warm grain
            const ng = ctx.createLinearGradient(0, 0, w, h);
            ng.addColorStop(0, 'rgba(0, 0, 0, 0.004)');
            ng.addColorStop(0.5, 'rgba(0, 0, 0, 0.001)');
            ng.addColorStop(1, 'rgba(0, 0, 0, 0.004)');
            ctx.fillStyle = ng;
            ctx.fillRect(0, 0, w, h);
        }

        rafRef.current = requestAnimationFrame(draw);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            targetRef.current = {
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            };
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        rafRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [draw]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
            }}
            aria-hidden="true"
        />
    );
}

// ── Main export ──────────────────────────────────────────
export default function AnimatedBackground() {
    const { isDark } = useTheme();
    const bands = isDark ? TEXT_BANDS_DARK : TEXT_BANDS_LIGHT;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -2,
                pointerEvents: 'none',
                overflow: 'hidden',
            }}
            aria-hidden="true"
        >
            {/* Layer 1: Canvas mesh gradients */}
            <GradientCanvas isDark={isDark} />

            {/* Layer 2: Flowing typography marquees */}
            {bands.map((band, i) => (
                <MarqueeBand key={`${isDark ? 'd' : 'l'}-${i}`} {...band} />
            ))}
        </div>
    );
}
