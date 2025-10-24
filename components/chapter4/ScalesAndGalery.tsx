import {useChatContext} from "@/context/ChatContext";
import Scales from "@/components/chapter4/Scales";
import Gallery from "@/components/chapter4/Gallery";
import {useState} from "react";
import {Button} from "@/components/ui/button";

export default function ScalesAndGalery() {
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
    // todo connect scales data to gallery images
    return  [
      "/images/phone-character-phone.png",
      "/trnava.jpg",
      "/images/phone-character-question.png",
      "/trnava.jpg",
      "/images/phone-character-thinking.png",
      "/trnava.jpg",
    ]
  }

  if (!currentInteraction) return null;
  if (data){
    console.log("Displaying collected data:", data);
    if (currentInteraction.id==="gallery"){
      const images = pickGalleryImages();
      return <Gallery
        images={images}
        helpText={currentInteraction.text()}
        onFinish={() => goToNextInteraction()}
      />
    }
    else return (
      <ResultTable data={data}>
        <Button
          className="rounded-xl text-xl"
          onClick={() => goToNextInteraction()}
        >
          Pokračovat
        </Button>
      </ResultTable>
    )
  }
  if (currentInteraction.id === "scales") return <Scales currentInteraction={currentInteraction} onComplete={collectData} />;
  else return <div>NOT FOUND</div>;
}

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
