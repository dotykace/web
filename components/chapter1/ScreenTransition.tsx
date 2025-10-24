import {AnimatePresence, motion} from "framer-motion";
import React from "react";

export default function ScreenTransition({firstScreen, secondScreen, showSecond}) {

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence mode="sync">
        {!showSecond ? (
          <motion.div
            key="first"
            className="absolute inset-0"
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
            className="absolute inset-0"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            {secondScreen}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}