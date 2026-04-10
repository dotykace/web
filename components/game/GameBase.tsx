"use client"

import {Button} from "@/components/ui/button";
import React, {useEffect} from "react";
import {ArrowLeftIcon} from "lucide-react";
import {useSwipeNavigation} from "@/hooks/use-scroll";
import ScrollLine from "@/components/ScrollLine";
import GlowingDot from "@/components/GlowingDot";

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

const FACTS = {
  // todo how to calculate centimeters??
  // todo maybe ask them length of the screen????
  2: [
    "Při průměrném scrollu urazí prst po obrazovce asi 6 cm. K odemčení tohoto faktu tedy musel tvůj prst urazit asi (...) centimetrů. Znamená to, že aby tvůj prst uběhl 1 km, musíš udělat 16 tisic scrollů.",
    "Pojem \"doomscrolling\" zvolil Oxfordský slovník jedním ze slov roku 2020. Ukazuje to, že v době koronavirové pandemie se po světě rozšířila taky doomscrollovací pandemie. Ta, na rozdíl od pandemie koronaviru, trvá dodnes.",
    "Aby vás udrželi co nejdéle u obrazovek, používají vývojáři sociálních sítí stejné principy jako casina. To, jak jsou za sebe řazené reely (nekonečné pásmo videí ubíhající nahoru nebo nebo dolů), připomíná výherní automat. Taky pohyb prstu, kterým scrolluješ, připomíná zatáhnutí za páku automatu, které roztočí zářivé blikající obrázky.",
    "O vlivu mobilů na vaše zdraví, společenský život a duševní pohodu jde plošně tvrdit málo. Výzkumy ukazují, že se např. nedá obecně říct, že 4h screen time denně má na různé lidi tentýž účinek. Zásadní je, jak, kdy a k čemu mobil používáte. Jedno zjištění je ale zřejmé: v den, kdy na sociálních sítích strávíš víc času, než je pro tebe obvyklé, bývá tvoje nálada horší než obyčejně.",
    "12% čechů a češek ve věku 9-15 let denně hraje hry. Méně než jednou za měsíc hraje hry 21%. Vůbec hry nehraje 8%. ",
    "1 čech nebo češka provolá z mobilu v průměru 7 minut denně.",
    "V roce 2025 používalo v Česku chytré telefony 82% majitelů mobilu. Dalších 16% používalo tlačítkový telefon. ",
  ],
  3: [
    "Pokud máš na stole před sebou položený mobil (i vypnutý), tvoje schopnost soustředit se na složité úkoly klesá. Mozek totiž musí neustále vynakládat energii na to, aby telefon ignoroval.",
    "V mobilních telefonech někdy bývá víc bakterií než na záchodovém prkénku. Proč? Zatímco většina lidí čistí toaletu pravidelně, až 35% uživatelů nikdy nedezinfikovalo svůj mobil. Jeden výzkum ukázal, že každý šestý mobil obsahuje dokonce fekální bakterie. Asi proto, že si ho majitelé berou s sebou na záchod.",
    "Podle průzkumu Českého statistického úřadu z roku 2025 tráví většina lidí ve věku 9-15 let na internetu 3-5 hodin denně. 20% z nich pak víc než 5h denně.",
    "Lidská hlava váží přibližně 5 kg. Při sklánění hlavy k mobilu pod úhlem 60° se vlivem gravitace tlak hlavy na krční svaly zvýší na víc než 25 kg. Potíže s krční páteří a rameny, které z toho mohou plynout, se někdy označují jako ‘Syndrom SMSkového krku’.",
    "V České republice dostává 69% dětí svůj první mobil mezi 1. a 5. třídou základní školy. 23% dětí telefon dostane ještě před nástupem do školy.",
    "Informace, o kterých věříš, že budou dostupné online, máš tendenci zapomínat. Tvůj mozek si místo samotné informace pamatuje spíše ‘cestu’ (složku nebo web), jak informaci najít.",
    "V České republice používá mobilní telefon 99 % osob starších 16 let. Toto číslo zůstává v posledních letech neměnné."
  ]
}
export default function GameBase({chapterNumber, onExit}: {chapterNumber: number, onExit: () => void}) {

  const [play, setPlay] = React.useState(true)

  const facts = FACTS[chapterNumber] || ["No facts available for this chapter."]
  const [currentFactIndex, setCurrentFactIndex] = React.useState(0)

  const nextFact = () => {
    setPlay(true)
    setCurrentFactIndex((prevIndex) => (prevIndex + 1) % facts.length)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-5 mt-7 mx-7 text-xl">
        <Button onClick={onExit} className="bg-white text-purple-900 font-bold tracking-wide py-2 rounded-full shadow-lg">
          <ArrowLeftIcon className="h-5 w-5 text-purple-900" />
          Zpět do menu
        </Button>
        <>
          7 fun faktů o 🧍a 📱
        </>
      </div>
      {play ? (<GameContent chapterNumber={chapterNumber} onReachGoal={()=>setPlay(false)}/>) : (
        <div className="p-12 mb-12  items-center justify-between flex flex-grow flex-col">
          <b>Fakt {currentFactIndex + 1} z {facts.length}:</b>
          <p className="mt-2 mb-6">
            {facts[currentFactIndex]}
          </p>

          <Button onClick={nextFact} className="w-full bg-white text-purple-900 font-bold tracking-wide py-2 rounded-full shadow-lg">
            Další
          </Button>
        </div>
      )}
    </div>
  )
}

const PARAMS = {
  2: {
    mean: 2* window.innerHeight, // average scroll distance per scroll
    variance: 0.5* window.innerHeight * window.innerHeight, // adjust variance as needed
  },
  3: {
    mean: 20, // average clicks needed
    variance: 50, // adjust variance as needed
  }
}

const GameContent = ({chapterNumber, onReachGoal}: {chapterNumber: number, onReachGoal: ()=>void}) => {
  const {mean, variance} = PARAMS[chapterNumber] || {mean: 0, variance: 1}
  const [goal, setGoal] = React.useState<number>(randomNormal(mean, variance))

  const onScroll = (direction: "up" | "down", amount?: number) => {
    console.log(`Scrolled ${direction} with amount ${amount}`)
    setGoal((prevGoal) => Math.max(0, prevGoal - (amount || 1))) // decrease goal by scroll amount
  }

  const onClick = () => {
    setGoal(prevGoal => Math.max(0, prevGoal - 1))
  }

  useEffect(() => {
      if (goal <= 0) {
        onReachGoal()
      }
  }, [goal, onReachGoal]);

  switch (chapterNumber) {
    case 2:
      useSwipeNavigation(onScroll, 0)
      return (
        <>
          <div className="absolute top-12">
            {/*todo fix scroll line rendering*/}
            {/*todo back button not clickable under scroll line*/}
            <ScrollLine />
          </div>
          <div className="mt-6 items-center justify-center flex text-center text-lg font-extrabold">
            Cil: {goal} pixelu
          </div>
        </>
      )
    case 3:
      return (
        <div className="flex h-full items-center justify-center flex-col">
          <div className="mb-6 items-center justify-center flex text-center text-lg font-extrabold">
            Cil: {goal} kliknuti
          </div>
          <GlowingDot onClick={onClick} size={40} color="white" />
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