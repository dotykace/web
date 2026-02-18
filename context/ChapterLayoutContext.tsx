"use client"

import { createContext, useContext } from "react"

interface ChapterLayoutContextValue {
  setHeaderVisible: (visible: boolean) => void
}

const ChapterLayoutContext = createContext<ChapterLayoutContextValue>({
  setHeaderVisible: () => {},
})

export const ChapterLayoutProvider = ChapterLayoutContext.Provider

export const useChapterLayout = () => useContext(ChapterLayoutContext)
