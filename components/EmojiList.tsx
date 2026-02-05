export default function EmojiList({
  emojis,
  onEmojiClick,
  className,
}: {
  emojis: string[];
  onEmojiClick: (emoji: string) => void;
  className?: string;
}) {
  return (
    <div className="">
      <div className={(className ?? "") + " flex justify-around gap-2"}>
        {emojis.map((emoji, index) => (
          <button
            key={index}
            className="text-xl hover:scale-125 active:scale-95 transition-all duration-200 
                       p-3 rounded-2xl hover:bg-white/20 active:bg-white/30"
            onClick={() => onEmojiClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
