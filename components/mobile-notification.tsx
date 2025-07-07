"use client"

import type React from "react"

import {useState, useEffect, JSX} from "react"
import { motion, AnimatePresence } from "framer-motion"
import {Bell, X} from "lucide-react"
import {Button} from "@/components/ui/button";

interface NotificationProps {
  title: string
  message: string
  icon?: React.ReactNode
  duration?: number
  onClose: () => void
  isOpen: boolean
  content?: ()=>JSX.Element | undefined
}

export default function MobileNotification({
                                             title = "New Notification",
                                             message = "You have a new message",
                                             icon = <Bell className="h-6 w-6 text-primary" />,
                                             duration = 5000,
                                             onClose,
                                             isOpen,
  content = undefined,
                                           }: NotificationProps) {

  const [showQuickReply, setShowQuickReply] = useState(false)

  useEffect(() => {
    let timer: number

    if (isOpen && duration > 0) {
      timer = setTimeout(() => {
        onClose()
      }, duration)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  const timestapm = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 40,
              mass: 1,
            }}
            className="bg-white dark:bg-gray-800 w-full max-w-sm mt-4 rounded-xl shadow-lg pointer-events-auto border border-gray-200 dark:border-gray-700 overflow-hidden"
          ><div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">{icon}</div>
              <div className="flex-1 pt-0.5">
                <div className="flex-row flex justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{timestapm}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
                {content && (
                  <Button
                    size="sm"
                    className="h-8 px-3 my-2 rounded-[2vw] text-xs bg-blue-900 text-white"
                    onClick={() => setShowQuickReply(!showQuickReply)}
                  >
                    Quick Reply
                  </Button>
                )}

              </div>
              {onClose && (
                <Button variant="ghost" size="sm" className="ml-1 h-5 w-5 p-0 dark:text-white" onClick={onClose}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {content && showQuickReply && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                {
                  content()
                }
              </div>
            )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
