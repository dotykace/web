import {AnimatePresence, motion} from "framer-motion";
import React from "react";

export default function ScreenTransition({firstScreen, secondScreen, showSecond}) {

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence>
        {!showSecond ? (
          <motion.div
            key="first"
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            {firstScreen}
          </motion.div>
        ) : (
          <motion.div
            key="second"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute inset-0 bg-green-500 flex items-center justify-center text-white text-3xl"
          >
            Screen 2
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}