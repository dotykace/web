import DotykaceLogo from "@/components/DotykaceLogo"
import { Card, CardContent } from "@/components/ui/card"
import {PartyPopper, Smartphone} from "lucide-react";

export default function DefaultWaitingScreen({
  header,
  subheader,
  icon,
}: {
  header: string
  subheader: string
  icon: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 bg-gradient-warm p-4 flex items-center justify-center overflow-hidden">
      <div className="fixed w-16 h-16 bg-white/30 rounded-full pointer-events-none decorative-float-1 blur-sm" />
      <div className="fixed w-12 h-12 bg-amber-200/40 rounded-full pointer-events-none decorative-float-2 blur-sm" />
      <div
        className="fixed w-10 h-10 bg-red-300/30 rounded-full pointer-events-none decorative-float-3 blur-sm"
        style={{ animationDelay: "3s" }}
      />

      <div className="w-full max-w-md space-y-6 flex flex-col items-center animate-fade-in">
        <DotykaceLogo width={240} />

        <Card className="glass-card border-0 w-full animate-scale-in">
          <CardContent className="text-center py-10 px-8">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              {icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {header}
            </h2>
            <p className="text-gray-500 leading-relaxed">
              {subheader}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
