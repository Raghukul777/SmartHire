import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

/**
 * CursorContext — Global cursor tracking system
 *
 * Provides normalized cursor position (0-1), raw client coords,
 * velocity vectors, and a soft glowing trail that follows movement.
 */
const CursorContext = createContext({
    x: 0.5,
    y: 0.5,
    clientX: 0,
    clientY: 0,
    velocityX: 0,
    velocityY: 0,
});

export function useCursor() {
    return useContext(CursorContext);
}

export function CursorProvider({ children }) {
    const [cursor, setCursor] = useState({
        x: 0.5,
        y: 0.5,
        clientX: 0,
        clientY: 0,
        velocityX: 0,
        velocityY: 0,
    });

    const targetRef = useRef({ x: 0.5, y: 0.5, clientX: 0, clientY: 0 });
    const currentRef = useRef({ x: 0.5, y: 0.5, clientX: 0, clientY: 0 });
    const rafId = useRef(null);

    const lerp = (a, b, t) => a + (b - a) * t;

    useEffect(() => {
        const handleMouseMove = (e) => {
            targetRef.current = {
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
                clientX: e.clientX,
                clientY: e.clientY,
            };
        };

        const animate = () => {
            const prev = { ...currentRef.current };

            currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.08);
            currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.08);
            currentRef.current.clientX = lerp(currentRef.current.clientX, targetRef.current.clientX, 0.08);
            currentRef.current.clientY = lerp(currentRef.current.clientY, targetRef.current.clientY, 0.08);

            setCursor({
                x: currentRef.current.x,
                y: currentRef.current.y,
                clientX: currentRef.current.clientX,
                clientY: currentRef.current.clientY,
                velocityX: currentRef.current.x - prev.x,
                velocityY: currentRef.current.y - prev.y,
            });

            rafId.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        rafId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <CursorContext.Provider value={cursor}>
            {children}
        </CursorContext.Provider>
    );
}

/**
 * CursorGlowTrail — A soft radial glow that follows the cursor
 * with delayed lerp interpolation and natural fade.
 */
export function CursorGlowTrail() {
    const glowRef = useRef(null);
    const trailRef = useRef(null);
    const mouse = useRef({ x: -200, y: -200 });
    const smoothPos = useRef({ x: -200, y: -200 });
    const trailPos = useRef({ x: -200, y: -200 });
    const rafId = useRef(null);

    const lerp = (a, b, t) => a + (b - a) * t;

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        const animate = () => {
            // Primary glow — faster follow
            smoothPos.current.x = lerp(smoothPos.current.x, mouse.current.x, 0.12);
            smoothPos.current.y = lerp(smoothPos.current.y, mouse.current.y, 0.12);

            // Trail glow — slower, lagging behind
            trailPos.current.x = lerp(trailPos.current.x, mouse.current.x, 0.04);
            trailPos.current.y = lerp(trailPos.current.y, mouse.current.y, 0.04);

            if (glowRef.current) {
                glowRef.current.style.transform = `translate(${smoothPos.current.x}px, ${smoothPos.current.y}px) translate(-50%, -50%)`;
            }
            if (trailRef.current) {
                trailRef.current.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px) translate(-50%, -50%)`;
            }

            rafId.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        rafId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <>
            {/* Trailing glow — larger, softer, more delayed */}
            <div
                ref={trailRef}
                className="cursor-trail"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: document.documentElement.getAttribute('data-theme') === 'light'
                        ? 'radial-gradient(circle, rgba(79, 70, 229, 0.04) 0%, rgba(124, 58, 237, 0.02) 35%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.03) 35%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                    willChange: 'transform',
                    filter: 'blur(2px)',
                }}
                aria-hidden="true"
            />
            {/* Primary glow — tight, brighter core */}
            <div
                ref={glowRef}
                className="cursor-glow"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    background: document.documentElement.getAttribute('data-theme') === 'light'
                        ? 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, rgba(79, 70, 229, 0.03) 40%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(129, 140, 248, 0.12) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                    willChange: 'transform',
                }}
                aria-hidden="true"
            />
        </>
    );
}

/**
 * MagneticButton — Button that subtly pulls toward cursor on hover
 */
export function MagneticButton({ children, strength = 0.3, className = '', style = {}, ...props }) {
    const btnRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (e.clientX - centerX) * strength;
        const dy = (e.clientY - centerY) * strength;
        setOffset({ x: dx, y: dy });
    }, [strength]);

    const handleMouseLeave = useCallback(() => {
        setOffset({ x: 0, y: 0 });
        setIsHovered(false);
    }, []);

    return (
        <div
            role="button"
            tabIndex={0}
            ref={btnRef}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                ...style,
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${isHovered ? 1.03 : 1})`,
                transition: isHovered
                    ? 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
            }}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * TiltCard — Card that gently tilts and shifts depth based on cursor proximity
 */
export function TiltCard({ children, className = '', style = {}, intensity = 8, ...props }) {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (y - 0.5) * -intensity;
        const rotateY = (x - 0.5) * intensity;
        setTilt({ rotateX, rotateY, scale: 1.02 });
    }, [intensity]);

    const handleMouseLeave = useCallback(() => {
        setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
    }, []);

    return (
        <div
            ref={cardRef}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                ...style,
                transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
                transition: tilt.scale > 1
                    ? 'transform 0.12s ease-out'
                    : 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * ParallaxLayer — Shifts children based on global cursor position.
 * Used to add micro-parallax to hero text, blobs, etc.
 */
export function ParallaxLayer({ children, factor = 20, style = {}, className = '' }) {
    const cursor = useCursor();
    const shiftX = (cursor.x - 0.5) * factor;
    const shiftY = (cursor.y - 0.5) * factor;

    return (
        <div
            className={className}
            style={{
                ...style,
                transform: `translate(${shiftX}px, ${shiftY}px)`,
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform',
            }}
        >
            {children}
        </div>
    );
}
