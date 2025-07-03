import { motion, AnimatePresence } from "framer-motion";

export default function GlowingDot({ onClick, position = { top: 0, left: 0 }, size = 30, color = "white", visible = true }) {

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          onClick={onClick}
          key="dot"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, animationDuration: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: "50%",
            zIndex: 49,
          }}
        >
          {/* Pulsating Glow */}
          <motion.div
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.6,0.6,0.6],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
            exit={{
              scale: 9,
              transition: {
                duration: 1,
                ease: "easeInOut",
                repeat: 0,
              }
            }}
            style={{
              position: "absolute",
              top: -size * 0.5,
              left: -size * 0.5,
              width: size * 2,
              height: size * 2,
              borderRadius: "50%",
              backgroundColor: color,
              filter: "blur(10px)",
              zIndex: -1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
