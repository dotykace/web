export default function EmojiList({
  emojis,
  onEmojiClick,
  className,
}: {
  emojis: string[]
  onEmojiClick: (emoji: string) => void
  className?: string
}) {
  return (
    <div
      className={
        (className ?? "") +
        " bg-white/80 backdrop-blur-md rounded-full shadow-lg border-white/20"
      }
    >
      <div className="flex justify-around">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            className="text-xl sm:text-2xl hover:scale-125 active:scale-90 transition-all duration-200 
                       p-1.5 sm:p-2 rounded-full hover:bg-white/50 active:bg-white/50
                       focus:outline-none focus:ring-2 focus:ring-white/30 min-w-0 flex-shrink"
            onClick={() => onEmojiClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
