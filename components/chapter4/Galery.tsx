import Image from 'next/image'
import {Hand} from "lucide-react";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";

export default function Galery() {
  const images = [
    '/trnava.jpg',
    '/trnava.jpg',
    '/trnava.jpg',
    '/trnava.jpg',
    '/trnava.jpg',
  ]
  const emptySlotIndex = 5 // 0..5 — which grid cell will be the text+icon slot
  const emptyText = 'Hello there'
  // Ensure we always have exactly 5 images provided
  const strings = images.slice(0, 5)

  // Build 6 grid slots: either an image or the empty slot
  const slots = Array.from({ length: 6 }).map((_, i) => {
    if (i === emptySlotIndex) return { type: 'empty' }
    // take next image from imgs (in order)
    const img = strings.shift()
    return { type: 'image', src: img }
  })

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const handleSelect = (index: number) => {
    // toggle off if the same one is clicked again
    setSelectedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="w-full max-w-4xl h-screen p-6">
      <div className="grid grid-cols-2 grid-rows-3 gap-2">
        {slots.map((slot, i) => (
          <div key={i} className="relative w-full h-60 rounded-xl overflow-hidden  flex items-center justify-center">
            {slot.type === 'image' ? (
              <>
                <Image
                  src={slot.src}
                  alt={`Grid image ${i + 1}`}
                  width={1200}
                  height={800}
                  className="w-full h-full object-cover"
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
              </>

            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center p-4">
                  <span className="text-lg font-semibold text-gray-800">{emptyText}</span>
                  <Hand className="w-6 h-6 text-gray-700 ml-2" />
                </div>
                <Button
                  disabled={selectedIndex === null}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
