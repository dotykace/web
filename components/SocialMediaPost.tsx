import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, Bookmark } from "lucide-react"

interface SocialMediaPostProps {
  username: string
  avatar: string
  content: string
}

export default function SocialMediaPost({
                                          username,
                                          avatar,
                                          content,
                                        }: SocialMediaPostProps) {

  return (
    <Card
      className={`m-5 h-full rounded-xl transition-all duration-300 ring-2 ring-blue-500 shadow-xl bg-white`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={username} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{username}</h3>
            <p className="text-xs text-gray-500">Just now</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-6">
          <p className="text-sm leading-relaxed text-gray-800">{content}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button size="sm" className="p-2 h-auto">
              <Heart className="w-5 h-5" />
            </Button>
            <Button size="sm" className="p-2 h-auto">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button size="sm" className="p-2 h-auto">
              <Share className="w-5 h-5" />
            </Button>
          </div>
          <Button size="sm" className="p-2 h-auto">
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
