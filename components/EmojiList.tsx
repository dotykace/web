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
        " bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20"
      }
    >
      <div className="flex justify-around gap-1">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            className="text-2xl hover:scale-125 active:scale-90 transition-all duration-200 
                       p-2 rounded-xl hover:bg-white/20 active:bg-white/30
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
