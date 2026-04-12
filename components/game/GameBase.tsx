import {Button} from "@/components/ui/button";
import React from "react";
import {ArrowLeftIcon} from "lucide-react";
import {chapterConfigs} from "@/app/chapter/[id]/ChapterClient";
import ChapterHeader from "@/components/ChapterHeader";
import GameContent from "@/components/game/GameContent";
import DotySpeechBubble from "@/components/game/DotySpeechBubble";

const FACTS = {
  // todo if starting amount change update info in the first fact
  2: [
    "Při průměrném scrollu urazí prst po obrazovce asi 5 cm. K odemčení tohoto faktu tedy musel tvůj prst urazit asi 50 centimetrů. Znamená to, že aby tvůj prst uběhl 1 km, musíš udělat 20 tisic scrollů.",
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

const OPACITY_START = 90
const OPACITY_STEP = 7
export default function GameBase({chapterNumber, onExit}: {chapterNumber: number, onExit: () => void}) {

  const [play, setPlay] = React.useState(true)
  const [opacityLevel, setOpacityLevel] = React.useState(OPACITY_START)
  const {coloring} = chapterConfigs[chapterNumber]

  const facts = FACTS[chapterNumber] || ["No facts available for this chapter."]
  const [currentFactIndex, setCurrentFactIndex] = React.useState(0)

  const opacityMin = OPACITY_START - OPACITY_STEP*(facts.length-1)
  const nextFact = () => {
    setPlay(true)
    if (opacityLevel <= opacityMin || opacityLevel <= 0){
      setOpacityLevel(OPACITY_START)
    }
    else{
      setOpacityLevel(prevState => prevState - OPACITY_STEP)
    }
    setCurrentFactIndex((prevIndex) => (prevIndex + 1) % facts.length)
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col ${coloring}`}>
      <div
        className={`absolute inset-0 bg-black pointer-events-none`}
        style={{
          opacity: opacityLevel/100
        }}
      />
      <div className="relative z-10 flex flex-col h-full">
        <ChapterHeader chapterNumber={0} chapterText={"7 fun faktů o 🧍a 📱"} showHelp={false} >
          <Button onClick={onExit} className="bg-white text-sky-900 font-bold tracking-wide py-2 rounded-full shadow-lg">
            <ArrowLeftIcon className="h-5 w-5 text-sky-900" />
            Menu
          </Button>
        </ChapterHeader>
        {play ? (
          <GameContent
            chapterNumber={chapterNumber}
            onReachGoal={()=>setPlay(false)}
            customGoal={currentFactIndex === 0 && chapterNumber === 2 ? 10 : undefined}
          />
        ) : (
          <div className="p-12 mb-12  items-center justify-between flex flex-grow flex-col">
            <b>Fakt {currentFactIndex + 1} z {facts.length}:</b>
            <DotySpeechBubble text={facts[currentFactIndex]}/>
            <Button onClick={nextFact} className="w-full bg-white text-sky-900 font-bold tracking-wide py-2 rounded-full shadow-lg">
              Další
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}