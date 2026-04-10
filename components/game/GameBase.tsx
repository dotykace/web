"use client"

import {Button} from "@/components/ui/button";
import React from "react";
import {ArrowLeftIcon} from "lucide-react";
export default function GameBase({chapterNumber, onExit}: {chapterNumber: number, oneExit: () => void}) {

  const facts = [
    "Při průměrném scrollu urazí prst po obrazovce asi (...) cm. K odemčení tohoto faktu tedy musel tvůj prst urazit asi (...) centimetrů. Znamená to, že aby tvůj prst uběhl 1 km, musíš udělat (...) scrollů.",
    "Pojem \"doomscrolling\" zvolil Oxfordský slovník jedním ze slov roku 2020. Ukazuje to, že v době koronavirové pandemie se po světě rozšířila taky doomscrollovací pandemie. Ta, na rozdíl od pandemie koronaviru, trvá dodnes.",
    "Aby vás udrželi co nejdéle u obrazovek, používají vývojáři sociálních sítí stejné principy jako casina. To, jak jsou za sebe řazené reely (nekonečné pásmo videí ubíhající nahoru nebo nebo dolů), připomíná výherní automat. Taky pohyb prstu, kterým scrolluješ, připomíná zatáhnutí za páku automatu, které roztočí zářivé blikající obrázky.",
    "O vlivu mobilů na vaše zdraví, společenský život a duševní pohodu jde plošně tvrdit málo. Výzkumy ukazují, že se např. nedá obecně říct, že 4h screen time denně má na různé lidi tentýž účinek. Zásadní je, jak, kdy a k čemu mobil používáte. Jedno zjištění je ale zřejmé: v den, kdy na sociálních sítích strávíš víc času, než je pro tebe obvyklé, bývá tvoje nálada horší než obyčejně.",
    "12% čechů a češek ve věku 9-15 let denně hraje hry. Méně než jednou za měsíc hraje hry 21%. Vůbec hry nehraje 8%. ",
    "1 čech nebo češka provolá z mobilu v průměru 7 minut denně.",
    "V roce 2025 používalo v Česku chytré telefony 82% majitelů mobilu. Dalších 16% používalo tlačítkový telefon. ",
  ]

  const [currentFactIndex, setCurrentFactIndex] = React.useState(0)

  const nextFact = () => {
    setCurrentFactIndex((prevIndex) => (prevIndex + 1) % facts.length)
  }
  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-5 mt-7 mx-7 text-xl">
        <Button onClick={onExit} className="bg-white
                             text-purple-900 font-bold tracking-wide py-2 rounded-full shadow-lg">
          <ArrowLeftIcon className="h-5 w-5 text-purple-900" />
          Zpět do menu
        </Button>
        <>
          7 fun faktů o 🧍a 📱
        </>

      </div>
      <div className="p-12 mb-12  items-center justify-between flex flex-grow flex-col">
        <b>Fakt {currentFactIndex + 1} z {facts.length}:</b>
        <p className="mt-2 mb-6">
          {facts[currentFactIndex]}
        </p>

        <Button onClick={nextFact} className="w-full bg-white
                             text-purple-900 font-bold tracking-wide py-2 rounded-full shadow-lg">
          Další
        </Button>
      </div>
    </div>
  )
}