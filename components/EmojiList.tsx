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
      <div className="flex justify-around gap-1">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            className="text-2xl hover:scale-125 active:scale-90 transition-all duration-200 
                       p-2 rounded-full hover:bg-white/50 active:bg-white/50
                       focus:outline-none focus:ring-2 focus:ring-white/30"
            onClick={() => onEmojiClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
