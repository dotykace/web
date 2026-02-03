import Image from 'next/image'
import {X, ChevronLeft, ChevronRight, Hand} from "lucide-react";
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import {GalleryModal} from "@/components/chapter4/GalleryModal";
import SwipeComponent from "@/components/chapter4/SwipeComponent";
import {setToStorage} from "@/scripts/local-storage";
import {useSharedAudio} from "@/context/AudioContext";
import AudioControl from "@/components/AudioControl";

export default function Gallery({images, helpText, onFinish, audio}) {
  const { playOnce, toggleOnce, isPlaying, stop } = useSharedAudio();
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
        if (prev === null) return null;
        let newIndex = (prev + side) % strings.length;
        if (newIndex < 0) {
          newIndex = strings.length - 1;
        }
        return newIndex
    });
  }

  const showPrev = (e: React.MouseEvent) => {
    if (e) e.stopPropagation();
    goTo(-1);
  };

  const showNext = (e: React.MouseEvent) => {
    if (e) e.stopPropagation();
    goTo(1);
  };

  const saveSelection = (download) => {
    console.log("Selected index:", selectedIndex);
    console.log("Selected image:", strings[selectedIndex]);
    const selectedImage = strings[selectedIndex];
    if (download) {
      handleDownload(selectedImage);
      console.log("Image saved!")
    }
    setToStorage("gallerySelection", selectedImage);
    if (onFinish) {
      onFinish(selectedImage);
    }
    setShowModal(false);
  }

  const handleDownload = (imagePath) => {

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = imagePath;

    // The name the file will have when downloaded
    link.download = "Dotykace-Result.jpg";

    // Append link, trigger click, and remove link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const RadioButton = (i) => (
    <button
      type="button"
      onClick={() => handleSelect(i)}
      className="w-6 h-6 rounded-full bg-black/40 border-2 border-white flex items-center justify-center cursor-pointer transition-all duration-200"
    >
      {selectedIndex === i && (
        <span className="bg-blue-700 p-2 rounded-full"/>
      )}
    </button>
  )

  useEffect(() => {
    playOnce(audio)
  }, []);

  return (
    <div className="w-full h-screen p-6 flex bg-slate-950">
      <AudioControl
        onClick={() => toggleOnce(audio)}
        audioEnabled={isPlaying[audio?.filename] || false}
        disabled={!audio}
      />
      {/* Grid gallery */}
      <div className="grid grid-cols-2 grid-rows-3 gap-2 my-12">
        {strings.map((slot, i) => (
          <div key={i} className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
            <Image
              src={slot}
              alt={`Grid image ${i + 1}`}
              width={1200}
              height={800}
              className="w-full h-full object-cover"
              onClick={() => handleImageClick(i)}
            />
            <div className="absolute top-2 right-2">
              {RadioButton(i)}
            </div>

          </div>
        ))}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center p-4 pb-6">
            <span className="font-semibold text-white text-sm sm:text-base">
              {helpText}
            </span>
          </div>
          <Button
            onClick={()=> {
              stop(audio.filename)
              setShowModal(true)
            }}
            disabled={selectedIndex === null}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-2 px-4 rounded-xl shadow-lg">
            {confirmText}
          </Button>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreenIndex !== null && (
        <SwipeComponent
          onSwipeLeft={showNext}
          onSwipeRight={showPrev}
          className="fixed inset-0 z-50"
        >
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
          <div className="w-full flex flex-col gap-4 justify-center items-center">
            {RadioButton(fullscreenIndex)}
            <Image
              src={strings[fullscreenIndex]}
              alt="Fullscreen image"
              width={1600}
              height={1000}
              className="max-w-[90%] max-h-[90%] object-contain rounded-xl"
            />

          </div>


          {/* Next button */}
          <button
            onClick={showNext}
            className="absolute right-6 text-white hover:text-gray-300"
          >
            <ChevronRight className="w-10 h-10 text-black bg-white rounded-full" />
          </button>
        </div>
        </SwipeComponent>

      )}
      <GalleryModal isOpen={showModal} onClose={saveSelection} />
    </div>
  );
}
