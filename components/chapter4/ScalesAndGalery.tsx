import {useChatContext} from "@/context/ChatContext";
import Scales from "@/components/chapter4/Scales";
import Gallery from "@/components/chapter4/Gallery";
import {useState} from "react";

export default function ScalesAndGalery() {
  const { currentInteraction, goToNextInteraction} = useChatContext()
  const [data, setData] = useState(null);
  const collectData = (data) => {
    console.log("Collected data:", data);
    setData(data);
    goToNextInteraction();
  }

  if (!currentInteraction) return null;
  if (data) return <ResultTable data={data} />;
  if (currentInteraction.id === "scales") return <Scales currentInteraction={currentInteraction} onComplete={collectData} />;
  else return <Gallery />;
}

function ResultTable({ data }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Result Data</h1>
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
    </div>
  );
}
