export default function LoadingScreen({ message = "Načítavam..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-8 w-8 mx-auto mb-4" />
        <p>{message}</p>
      </div>
    </div>
  )
}
