import Image from 'next/image'
import {X, ChevronLeft, ChevronRight, Hand} from "lucide-react";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {GalleryModal} from "@/components/chapter4/GalleryModal";

export default function Gallery() {
  const images = [
    "/images/phone-character-phone.png",
    "/trnava.jpg",
    "/images/phone-character-question.png",
    "/trnava.jpg",
    "/images/phone-character-thinking.png",
    "/trnava.jpg",
  ];

  const emptyText = "Který z obrázků s tebou rezonuje nejvíc? Označ jeden.";
  const confirmText = "Potvrdit";
  const strings = images.slice(0, 5);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const handleSelect = (index: number) => {
    // toggle off if the same one is clicked again
    setSelectedIndex(prev => (prev === index ? null : index));
  };

  const [showModal, setShowModal] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  const handleImageClick = (index: number) => {
    setFullscreenIndex(index);
  };

  const closeFullscreen = () => {
    setFullscreenIndex(null);
  };

  const goTo = (side) => {
    setFullscreenIndex((prev) =>{
        let newIndex = (prev + side) % strings.length;
        return prev !== null ? newIndex : prev
      }
    );
  }

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    goTo(-1);
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    goTo(1);
  };

  const saveSelection = () => {
    console.log("Selected index:", selectedIndex);
    console.log("Selected image:", strings[selectedIndex]);
    setShowModal(true);
  }

  return (
    <div className="w-full max-w-4xl h-screen p-6 relative">
      {/* Grid gallery */}
      <div className="grid grid-cols-2 grid-rows-3 gap-2">
        {strings.map((slot, i) => (
          <div key={i} className="relative w-full h-60 rounded-xl overflow-hidden  flex items-center justify-center">
            <Image
              src={slot}
              alt={`Grid image ${i + 1}`}
              width={1200}
              height={800}
              className="w-full h-full object-cover"
              onClick={() => handleImageClick(i)}
              //priority={false}
            />
            <button
              type="button"
              onClick={() => handleSelect(i)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 border-2 border-white flex items-center justify-center cursor-pointer transition-all duration-200"
            >
              {selectedIndex === i && (
                <span className="text-white text-sm font-bold">✓</span>
              )}
            </button>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center p-2 pb-6">
                  <span className="font-semibold text-gray-800">
                    {emptyText}
                  </span>
            <Hand className="w-6 h-6 text-gray-700 ml-2 flex-shrink-0" />
          </div>
          <Button
            onClick={saveSelection}
            disabled={selectedIndex === null}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-2 px-4 rounded-xl shadow-lg">
            {confirmText}
          </Button>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        >
          {/* Close button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-6 right-6 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Prev button */}
          <button
            onClick={showPrev}
            className="absolute left-6 text-white hover:text-gray-300"
          >
            <ChevronLeft className="w-10 h-10 text-black bg-white rounded-full" />
          </button>

          {/* Image */}
          <>
          <Image
            src={strings[fullscreenIndex]}
            alt="Fullscreen image"
            width={1600}
            height={1000}
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
          />
            <button
              type="button"
              onClick={() => handleSelect(fullscreenIndex)}
              className="absolute top-20 right-40 w-6 h-6 rounded-full bg-black/40 border-2 border-white flex items-center justify-center cursor-pointer transition-all duration-200"
            >
              {selectedIndex === fullscreenIndex && (
                <span className="text-white text-sm font-bold">✓</span>
              )}
            </button>
          </>


          {/* Next button */}
          <button
            onClick={showNext}
            className="absolute right-6 text-white hover:text-gray-300"
          >
            <ChevronRight className="w-10 h-10 text-black bg-white rounded-full" />
          </button>
        </div>
      )}
      <GalleryModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
