import {useChatContext} from "@/context/ChatContext";
import Scales from "@/components/chapter4/Scales";
import Gallery from "@/components/chapter4/Gallery";
import {useState} from "react";
import BasicAudioVisial from "@/components/BasicAudioVisial";
import AudioWrapper from "@/components/audio/AudioWrapper";

const soundMap = {
  "scaleA": { url: "/audio/SCROLLOVANIE.mp3" },
  "scaleB": { url: "/audio/JINGEL - pozitiv.mp3" },
  "scaleC": { url: "/audio/CHAOS.mp3" },
  "scaleD": { url: "/audio/JINGEL.mp3" },
  "scaleE": { url: "/audio/ODOMKNUTIE CHATU.mp3" },
}
export default function ScalesAndGallery() {
  const [loaded, setLoaded] = useState(false);
  return (
    <AudioWrapper soundMap={soundMap} setLoaded={setLoaded}>
      {loaded && <ScalesAndGalleryContent />}
      {!loaded && (
        <BasicAudioVisial coloring="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          Loading audio...
        </BasicAudioVisial>
      )}
    </AudioWrapper>
  )
}

function ScalesAndGalleryContent(){
  const { currentInteraction, goToNextInteraction} = useChatContext()
  const [data, setData] = useState(null);
  const collectData = (data) => {
    console.log("Collected data:", data);
    setData(data);
    goToNextInteraction();
  }

  const pickGalleryImages = () => {
    if (!currentInteraction) return [];
    if (!data) return [];
    return Object.entries(data).map(
      ([key, value]) => `/images/scales/${key}/${value.combo}.png`
    );
  }

  if (!currentInteraction) return null;
  if (data){
    if (currentInteraction.id==="gallery"){
      const images = pickGalleryImages();
      return <Gallery
        images={images}
        helpText={currentInteraction.text()}
        onFinish={() => goToNextInteraction()}
      />
    }
  }
  if (currentInteraction.id === "scales") return <Scales currentInteraction={currentInteraction} onComplete={collectData} />;
  else return <div>NOT FOUND</div>;
}
// todo remove when not needed
function ResultTable({ data, children }) {
  return (
    <div className="p-4 py-20 h-screen items-center justify-between flex flex-col ">
      <h1 className="text-3xl font-bold mb-4">Result Data</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div
            key={key}
            className="p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">{key}</span>
              <span
                className={`px-2 py-1 rounded text-white text-sm ${
                  value.class === "high" ? "bg-green-500" : value.class === "medium" ? "bg-orange-500" : "bg-red-500"
                }`}
              >
                {value.class}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Percentage: </span>
              <span className="font-medium">{value.percentage}%</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Secondary: </span>
              <span className="font-medium">{value.secondary}</span>
            </div>
            <div>
              <span className="text-gray-600">Combo: </span>
              <span className="font-medium">{value.combo}</span>
            </div>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
