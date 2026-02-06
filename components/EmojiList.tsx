export default function EmojiList({ emojis, onEmojiClick, className }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className={(className ?? "") + " flex justify-around"}>
        {emojis.map((emoji, index) => (
          <button
            key={index}
            className={
              "text-3xl hover:scale-110 transition-transform duration-200 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            }
            onClick={() => onEmojiClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
