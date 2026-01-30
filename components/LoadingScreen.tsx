export default function LoadingScreen({
  message = "Načítavam...",
  colorClass = "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600",
  spinnerAccent = "border-t-white"
}: {
  message?: string;
  colorClass?: string;
  spinnerAccent?: string;
}) {
  return (
    <main className={`flex h-screen overflow-hidden flex-col items-center justify-center p-4 ${colorClass}`}>
      <div className="flex flex-col items-center gap-4">
        <div className={`w-12 h-12 border-4 border-white/30 ${spinnerAccent} rounded-full animate-spin`} />
        <span className="text-white/80 font-medium">{message}</span>
      </div>
    </main>
  );
}
