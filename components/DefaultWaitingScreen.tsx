import DotykaceLogo from "@/components/DotykaceLogo"
import { Card, CardContent } from "@/components/ui/card"

export default function DefaultWaitingScreen({ header, subheader, icon }) {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <DotykaceLogo />

        {/* Waiting Screen */}
        <Card className="glass-card border-0">
          <CardContent className="text-center py-12 px-8">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{header}</h3>
            <p className="text-gray-500 leading-relaxed">{subheader}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
