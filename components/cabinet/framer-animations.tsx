'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

/**
 * iOS-Compliant Animation Presets for MyCabinet
 * All animations follow iOS design principles
 */

// Animation Variants
export const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const slideUpVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { opacity: 0, y: 16, transition: { duration: 0.2 } }
};

export const slideDownVariant = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } }
};

export const scaleVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

// Tap Animations for iOS-like press feedback
export const tapVariant = {
  whileTap: { scale: 0.98 },
  whileHover: { y: -2 }
};

// List Item Animations
export const listItemVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }),
  exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
};

// Card Animations
export const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { opacity: 0, y: 16, transition: { duration: 0.2 } },
  whileHover: { y: -4, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }
};

// Modal/Overlay Animations
export const modalVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { opacity: 0, y: 32, transition: { duration: 0.2 } }
};

// Page Transition Animations
export const pageTransitionVariant = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// Animated Components

interface AnimatedContainerProps {
  children: React.ReactNode;
  variant?: typeof fadeInVariant;
  delay?: number;
}

export const AnimatedContainer = ({
  children,
  variant = fadeInVariant,
  delay = 0
}: AnimatedContainerProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={variant}
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

interface AnimatedListProps {
  items: React.ReactNode[];
  containerVariant?: typeof staggerContainerVariant;
  itemVariant?: typeof listItemVariant;
}

export const AnimatedList = ({
  items,
  containerVariant = staggerContainerVariant,
  itemVariant = listItemVariant
}: AnimatedListProps) => (
  <motion.div
    variants={containerVariant}
    initial="hidden"
    animate="visible"
    exit="hidden"
  >
    <AnimatePresence mode="popLayout">
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={itemVariant}
          custom={i}
          layout
        >
          {item}
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AnimatedCard = ({
  children,
  className = '',
  onClick
}: AnimatedCardProps) => (
  <motion.div
    variants={cardVariant}
    initial="hidden"
    animate="visible"
    exit="exit"
    whileHover="whileHover"
    className={className}
    onClick={onClick}
    role="button"
  >
    {children}
  </motion.div>
);

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const AnimatedButton = ({
  children,
  onClick,
  className = '',
  disabled = false
}: AnimatedButtonProps) => (
  <motion.button
    {...tapVariant}
    onClick={onClick}
    className={className}
    disabled={disabled}
  >
    {children}
  </motion.button>
);

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

export const PageTransitionWrapper = ({
  children
}: PageTransitionWrapperProps) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageTransitionVariant}
  >
    {children}
  </motion.div>
);

// Hook for easy animation access
export const useFramerAnimations = () => ({
  fadeIn: fadeInVariant,
  slideUp: slideUpVariant,
  slideDown: slideDownVariant,
  scale: scaleVariant,
  staggerContainer: staggerContainerVariant,
  tap: tapVariant,
  listItem: listItemVariant,
  card: cardVariant,
  modal: modalVariant,
  pageTransition: pageTransitionVariant
});
