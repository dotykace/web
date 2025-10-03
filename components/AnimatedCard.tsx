import {AnimatePresence, motion} from "framer-motion";
import SocialMediaPost from "@/components/SocialMediaPost";

export default function AnimatedCard({currentCard, visible, dotyFace}) {
  return (
    <div className="items-center flex justify-center">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
          key={currentCard?.id}
          initial={{
            y: 100,
            opacity: 0,
            rotateX:  15,
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
          }}
          exit={{
            y:  -100 ,
            opacity: 0,
            rotateX: -15,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            duration: 0.8,
          }}
          className="w-[400px] h-full relative z-50"
          style={{ perspective: "1000px" }}
        >
          <SocialMediaPost username={currentCard?.username} avatar={dotyFace} content={currentCard?.content} timestamp={currentCard?.title} choices={currentCard?.choices}/>
        </motion.div>)}

      </AnimatePresence>
    </div>
  )
}