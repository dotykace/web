"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X } from "lucide-react"

interface NotificationProps {
  title: string
  message: string
  icon?: React.ReactNode
  duration?: number
  onClose?: () => void
  onNotificationClick?: () => void
  isOpen?: boolean
}

export default function MobileNotification({
                                             title = "New Notification",
                                             message = "You have a new message",
                                             icon = <Bell className="h-6 w-6 text-primary" />,
                                             duration = 5000,
                                             onClose,
                                             onNotificationClick,
                                             isOpen: controlledIsOpen,
                                           }: NotificationProps) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen !== undefined ? controlledIsOpen : true)

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen)
    }
  }, [controlledIsOpen])

  useEffect(() => {
    let timer: number

    if (isOpen && duration > 0) {
      timer = setTimeout(() => {
        setIsOpen(false)
        if (onClose) onClose()
      }, duration)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsOpen(false)
    if (onClose) onClose()
  }

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick()
      handleClose()
    }
  }

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
          >
            <div className="p-4 flex items-start" onClick={handleNotificationClick} role="button" tabIndex={0}>
              <div className="flex-shrink-0 mr-3">{icon}</div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Just now</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close notification</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
