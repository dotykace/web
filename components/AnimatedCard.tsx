import {AnimatePresence, motion} from "framer-motion";
import SocialMediaPost from "@/components/SocialMediaPost";

export default function AnimatedCard({currentCard, visible}){
  return (
    <div className="items-center justify-center w-[400px]">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
          key={currentCard.id}
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
          className="w-full h-full"
          style={{ perspective: "1000px" }}
        >
          <SocialMediaPost username={currentCard?.name} avatar={""} content={currentCard.content} timestamp={currentCard.title} choices={currentCard.choices}/>
        </motion.div>)}

      </AnimatePresence>
    </div>
  )
}