"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const animatedVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const skipVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
};

export function PageTransitionWrapper({ children }) {
  const pathname = usePathname();
  const skipAnimation =
    pathname === "/" || pathname.startsWith("/dashboard");
  const variants = skipAnimation ? skipVariants : animatedVariants;
  const transition = skipAnimation
    ? { duration: 0 }
    : { duration: 0.25, ease: "easeOut" };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        style={{ minHeight: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
