import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, Bookmark } from "lucide-react"

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
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={username} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
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

        {/* Action buttons */}
        {/*<div className="flex items-center justify-between pt-2 border-t">*/}
        {/*  <div className="flex items-center space-x-4">*/}
        {/*    <Button size="sm" variant="outline" className="p-2 h-auto rounded-[5px]">*/}
        {/*      <Heart className="w-5 h-5" />*/}
        {/*    </Button>*/}
        {/*    <Button size="sm" variant="outline" className="p-2 h-auto rounded-[5px]">*/}
        {/*      <MessageCircle className="w-5 h-5" />*/}
        {/*    </Button>*/}
        {/*    <Button size="sm" variant="outline" className="p-2 h-auto rounded-[5px]">*/}
        {/*      <Share className="w-5 h-5" />*/}
        {/*    </Button>*/}
        {/*  </div>*/}
        {/*  <Button size="sm" variant="outline" className="p-2 h-auto rounded-[5px]">*/}
        {/*    <Bookmark className="w-5 h-5" />*/}
        {/*  </Button>*/}
        {/*</div>*/}
      </CardContent>
    </Card>
  )
}
