import {useChatContext} from "@/context/ChatContext";
import Scales from "@/components/chapter4/Scales";
import Galery from "@/components/chapter4/Galery";

export default function ScalesAndGalery() {
  const { currentInteraction, goToNextInteraction} = useChatContext()
  const collectData = (data) => {
    console.log("Collected data:", data);
    goToNextInteraction();
  }

  if (!currentInteraction) return null;
  if (currentInteraction.id === "scales") return <Scales currentInteraction={currentInteraction} onComplete={collectData} />;
  else return <Galery />;
}