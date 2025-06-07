import Card from "@/components/Card";

export default function LoadingScreen({message = "Načítání interakcí..."}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <div className="p-6 text-center">
            <div className="animate-pulse">{message}</div>
          </div>
        </Card>
      </div>
    </main>
  )
}
