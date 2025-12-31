export default function LoadingScreen({message = "Načítání interakcí..."}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-warm">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="glass-card p-8 animate-scale-in">
          <div className="animate-spin-smooth rounded-full border-3 border-orange-200 border-t-orange-500 h-12 w-12 mx-auto mb-6" />
          <p className="text-gray-700 font-medium animate-gentle-pulse">{message}</p>
        </div>
      </div>
    </main>
  )
}
