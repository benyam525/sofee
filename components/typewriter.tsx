"use client"

import { useState, useEffect, useCallback } from "react"

interface TypewriterProps {
  text: string
  className?: string
  style?: React.CSSProperties
  typingSpeed?: number
  hesitationWords?: string[]
}

export function Typewriter({
  text,
  className,
  style,
  typingSpeed = 50,
  hesitationWords = ["an", "ink", "blot"],
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 530)
    return () => clearInterval(cursorInterval)
  }, [])

  const typeText = useCallback(async () => {
    const words = text.split(" ")
    let currentText = ""

    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex]
      const isHesitationWord = hesitationWords.some(
        (hw) => word.toLowerCase().startsWith(hw.toLowerCase())
      )

      // Check if this word should have a "wrong attempt" effect
      // Only do this occasionally and for hesitation words
      const shouldMistake = isHesitationWord && Math.random() > 0.6

      if (shouldMistake && word.length > 2) {
        // Type a partial "wrong" word first
        const wrongChars = Math.min(2, Math.floor(word.length / 2))
        const wrongAttempt = word.slice(0, wrongChars)

        // Type the wrong attempt
        for (const char of wrongAttempt) {
          currentText += char
          setDisplayedText(currentText)
          await new Promise((r) => setTimeout(r, typingSpeed))
        }

        // Pause as if thinking
        await new Promise((r) => setTimeout(r, 400))

        // Backspace
        for (let i = 0; i < wrongChars; i++) {
          currentText = currentText.slice(0, -1)
          setDisplayedText(currentText)
          await new Promise((r) => setTimeout(r, 80))
        }

        // Brief pause before retyping
        await new Promise((r) => setTimeout(r, 300))
      }

      // Type the word normally
      for (const char of word) {
        currentText += char
        setDisplayedText(currentText)
        await new Promise((r) => setTimeout(r, typingSpeed + Math.random() * 30))
      }

      // Add space after word (except last word)
      if (wordIndex < words.length - 1) {
        currentText += " "
        setDisplayedText(currentText)
        await new Promise((r) => setTimeout(r, typingSpeed))
      }

      // Hesitation pause on certain words
      if (isHesitationWord) {
        await new Promise((r) => setTimeout(r, 200))
      }
    }

    setIsTyping(false)
  }, [text, typingSpeed, hesitationWords])

  useEffect(() => {
    // Small delay before starting to type
    const startDelay = setTimeout(() => {
      typeText()
    }, 800)

    return () => clearTimeout(startDelay)
  }, [typeText])

  return (
    <span className={className} style={style}>
      {displayedText}
      <span
        className="inline-block w-[3px] ml-[2px] align-middle"
        style={{
          height: "1em",
          backgroundColor: isTyping || cursorVisible ? "#0B2037" : "transparent",
          transition: "background-color 0.1s",
        }}
      />
    </span>
  )
}
