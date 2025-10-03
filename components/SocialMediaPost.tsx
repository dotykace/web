import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, Bookmark } from "lucide-react"
import {LocalSvgRenderer} from "@/components/LocalSvgRenderer";

interface SocialMediaPostProps {
  username?: string
  avatar: string
  content: string,
  choices?: {text: string, callback: () => {}} []
}

export default function SocialMediaPost({
                                          username= "Mobil",
                                          avatar,
                                          content,
  choices,
                                        }: SocialMediaPostProps) {

  const timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <Card
      className={`m-5 h-full rounded-xl transition-all duration-300 ring-2 ring-blue-500 shadow-xl bg-white`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <LocalSvgRenderer filename={avatar} className="w-10 h-10" />
          <div className="flex-1 justify-between">
            <h3 className="font-semibold text-sm">{username}</h3>
            <p className="text-xs text-gray-500">{timestamp}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-6">
          <p className="text-sm leading-relaxed text-gray-800">{content}</p>
          {choices && choices.length > 0 && (
            <div className="mt-4 flex flex-col space-y-2 rounded-xl">
              {choices.map((choice, index) => (
                <Button
                  key={index}
                  className="flex-1 rounded-full bg-gray-800"
                  onClick={choice.callback}
                >
                  {choice.text}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
