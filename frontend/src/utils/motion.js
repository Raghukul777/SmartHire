/**
 * SmartHire Motion System
 * Centralized animation configurations for fluid, cinematic UI
 */

// ============================================
// EASING CURVES
// ============================================
export const premiumEase = [0.16, 1, 0.3, 1];
export const softEase = [0.25, 0.1, 0.25, 1];
export const fluidEase = [0.4, 0, 0.2, 1];
export const springEase = [0.34, 1.56, 0.64, 1];

// ============================================
// SPRING TRANSITIONS
// ============================================
export const softSpring = {
    type: 'spring',
    stiffness: 60,
    damping: 25,
    mass: 1,
};

export const gentleSpring = {
    type: 'spring',
    stiffness: 40,
    damping: 20,
    mass: 1.5,
};

export const quickSpring = {
    type: 'spring',
    stiffness: 200,
    damping: 28,
    mass: 0.8,
};

export const bouncySpring = {
    type: 'spring',
    stiffness: 300,
    damping: 15,
    mass: 0.5,
};

// ============================================
// CONTAINER & ITEM STAGGER
// ============================================
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1,
            ease: premiumEase,
        },
    },
};

export const itemVariants = {
    hidden: {
        opacity: 0,
        y: 25,
        filter: 'blur(4px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.7,
            ease: premiumEase,
        },
    },
};

// ============================================
// FADE VARIANTS
// ============================================
export const fadeIn = {
    hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: premiumEase },
    },
};

export const fadeInFromLeft = {
    hidden: { opacity: 0, x: -40, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: premiumEase },
    },
};

export const fadeInFromRight = {
    hidden: { opacity: 0, x: 40, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: premiumEase },
    },
};

// ============================================
// SCALE / SPRING-IN
// ============================================
export const scaleIn = {
    hidden: {
        opacity: 0,
        scale: 0.92,
        filter: 'blur(8px)',
    },
    visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.7,
            ease: premiumEase,
        },
    },
};

// ============================================
// CARD HOVER INTERACTIVE
// ============================================
export const cardHover = {
    rest: {
        scale: 1,
        y: 0,
        boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.25)',
    },
    hover: {
        scale: 1.02,
        y: -6,
        boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.35), 0 0 40px -8px rgba(99, 102, 241, 0.15)',
        transition: softSpring,
    },
    tap: {
        scale: 0.98,
        transition: { duration: 0.1 },
    },
};

// ============================================
// PAGE TRANSITION
// ============================================
export const pageTransition = {
    initial: {
        opacity: 0,
        y: 16,
        filter: 'blur(4px)',
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.6,
            ease: premiumEase,
        },
    },
    exit: {
        opacity: 0,
        y: -12,
        filter: 'blur(4px)',
        transition: {
            duration: 0.3,
            ease: softEase,
        },
    },
};

// ============================================
// TOAST / DROPDOWN NOTIFICATIONS
// ============================================
export const toastVariants = {
    hidden: {
        opacity: 0,
        y: -12,
        scale: 0.95,
        filter: 'blur(4px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.4,
            ease: premiumEase,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        scale: 0.97,
        filter: 'blur(4px)',
        transition: {
            duration: 0.2,
            ease: softEase,
        },
    },
};

// ============================================
// SLIDE VARIANTS (direction-aware)
// ============================================
export const slideInFromRight = {
    hidden: { opacity: 0, x: 60, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: premiumEase },
    },
    exit: {
        opacity: 0,
        x: -30,
        filter: 'blur(4px)',
        transition: { duration: 0.3, ease: softEase },
    },
};

export const slideInFromLeft = {
    hidden: { opacity: 0, x: -60, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: premiumEase },
    },
    exit: {
        opacity: 0,
        x: 30,
        filter: 'blur(4px)',
        transition: { duration: 0.3, ease: softEase },
    },
};

// ============================================
// BLOB / PARTICLE MOTION
// ============================================
export const blobFloat = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
        scale: [1, 1.08, 1],
        opacity: [0.5, 0.7, 0.5],
        transition: {
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// ============================================
// STAGGER FACTORY
// ============================================
export function staggerContainer(staggerDelay = 0.1, delayStart = 0) {
    return {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: delayStart,
            },
        },
    };
}

export function staggerItem(direction = 'up', distance = 25) {
    const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
    const sign = direction === 'up' || direction === 'left' ? 1 : -1;

    return {
        hidden: {
            opacity: 0,
            [axis]: distance * sign,
            filter: 'blur(4px)',
        },
        visible: {
            opacity: 1,
            [axis]: 0,
            filter: 'blur(0px)',
            transition: {
                duration: 0.7,
                ease: premiumEase,
            },
        },
    };
}
