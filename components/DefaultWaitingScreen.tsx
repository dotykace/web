import DotykaceLogo from "@/components/DotykaceLogo"
import { Card, CardContent } from "@/components/ui/card"

export default function DefaultWaitingScreen({ header, subheader, icon }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <DotykaceLogo />

        {header && (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-xl">
            <CardContent className="text-center py-12">
              {icon}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {header}
              </h3>
              <p className="text-gray-600 mb-4">{subheader}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
