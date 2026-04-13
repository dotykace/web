import React, {useEffect} from "react";
import {useSwipeNavigation} from "@/hooks/use-scroll";
import ScrollLine from "@/components/ScrollLine";
import GlowingDot from "@/components/GlowingDot";

const MEAN = 20
const VARIANCE = 50

function randomNormal(mean = 0, variance = 1) {
  const stdDev = Math.sqrt(variance);

  // Generate two independent uniform(0,1) values
  let u1 = Math.random();
  let u2 = Math.random();

  // Avoid log(0)
  u1 = u1 === 0 ? Number.MIN_VALUE : u1;

  // Box-Muller transform
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  // Scale and shift
  return Math.max(0, Math.round( z0 * stdDev + mean));

}

const GameContent = ({chapterNumber, onReachGoal, customGoal}: {chapterNumber: number, onReachGoal: (goalValue?:number)=>void, customGoal?: number }) => {

  const [goal, setGoal] = React.useState<number>(customGoal ?? randomNormal(MEAN, VARIANCE))

  const decreaseGoal = () => {
    setGoal(prevGoal => Math.max(0, prevGoal - 1))
  }

  useEffect(() => {
    if (goal <= 0) {
      onReachGoal()
    }
  }, [goal, onReachGoal]);

  switch (chapterNumber) {
    case 2:
      useSwipeNavigation(decreaseGoal, 0)
      return (
        <>
          <div className="absolute top-12">
            {/*todo fix scroll line rendering*/}
            {/*todo back button not clickable under scroll line*/}
            <ScrollLine />
          </div>
          <div className="mt-6 items-center justify-center flex text-center text-lg font-extrabold">
            Cíl: {goal} scrollů
          </div>
        </>
      )
    case 3:
      return (
        <div className="flex h-full items-center justify-center flex-col">
          <div className="mb-6 items-center justify-center flex text-center text-lg font-extrabold">
            Cíl: {goal} ťuknutí
          </div>
          <GlowingDot onClick={decreaseGoal} size={40} color="white" />
        </div>
      )
    default:
      return (
        <>
          Invalid chapter number
        </>
      )
  }
}

export default GameContent